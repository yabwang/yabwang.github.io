# Learn Claude Code - Agent 开发完整指南

> 本指南系统性地讲解如何从零构建一个完整的 AI Agent 系统，涵盖从基础循环到多 Agent 协作的12个核心机制。

## 概览：Agent 系统的12层架构

整个学习路径分为三个阶段：

| 阶段 | 章节 | 核心能力 |
|------|------|----------|
| **基础层** | s01-s06 | 单 Agent 的核心循环与上下文管理 |
| **协作层** | s07-s08 | 任务持久化与后台执行 |
| **团队层** | s09-s12 | 多 Agent 团队协作与隔离执行 |

---

## 第一阶段：基础层

### s01: The Agent Loop (Agent 循环)

> *"One loop & Bash is all you need"* -- 一个工具 + 一个循环 = 一个 Agent。

#### 核心问题

语言模型能推理代码，但碰不到真实世界——不能读文件、跑测试、看报错。没有循环，每次工具调用你都得手动把结果粘回去。你自己就是那个循环。

#### 解决方案

```
+--------+      +-------+      +---------+
|  User  | ---> |  LLM  | ---> |  Tool   |
| prompt |      |       |      | execute |
+--------+      +---+---+      +----+----+
                    ^                |
                    |   tool_result  |
                    +----------------+
                    (loop until stop_reason != "tool_use")
```

一个退出条件控制整个流程。循环持续运行，直到模型不再调用工具。

#### 工作原理

**1. 用户 prompt 作为第一条消息**

```python
# 首轮：把用户问题放进对话历史，后续会在同一列表上累加 assistant / tool 回合
messages.append({"role": "user", "content": query})
```

**2. 将消息和工具定义一起发给 LLM**

```python
# tools= 告知模型可调用的工具；返回的 content 里可能含文本块与 tool_use 块
response = client.messages.create(
    model=MODEL, system=SYSTEM, messages=messages,
    tools=TOOLS, max_tokens=8000,
)
```

**3. 追加助手响应。检查 `stop_reason`**

```python
# 必须把助手整段输出写回历史，下一轮模型才能基于自己的上文继续推理
messages.append({"role": "assistant", "content": response.content})
# 未请求工具 = 模型认为可以给出最终答案，循环结束
if response.stop_reason != "tool_use":
    return
```

**4. 执行每个工具调用，收集结果，作为 user 消息追加**

```python
# 每个 tool_use 必须有对应的 tool_result，且 tool_use_id 与请求一一对应
results = []
for block in response.content:
    if block.type == "tool_use":
        output = run_bash(block.input["command"])
        results.append({
            "type": "tool_result",
            "tool_use_id": block.id,
            "content": output,
        })
# 工具输出以 user 消息形式喂回；API 约定如此，便于下一轮模型继续对话
messages.append({"role": "user", "content": results})
```

**完整函数实现**

```python
def agent_loop(query):
    # 单条 user 起步；之后每轮追加 assistant，若有工具则再追加一条 user(tool_results)
    messages = [{"role": "user", "content": query}]
    while True:
        response = client.messages.create(
            model=MODEL, system=SYSTEM, messages=messages,
            tools=TOOLS, max_tokens=8000,
        )
        messages.append({"role": "assistant", "content": response.content})

        # 无工具调用则结束；否则执行工具并把结果作为下一条 user 消息
        if response.stop_reason != "tool_use":
            return

        results = []
        for block in response.content:
            if block.type == "tool_use":
                output = run_bash(block.input["command"])
                results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": output,
                })
        messages.append({"role": "user", "content": results})
```

不到 30 行，这就是整个 Agent。后面 11 个章节都在这个循环上叠加机制——循环本身始终不变。

---

### s02: Tool Use (工具使用)

> *"加一个工具, 只加一个 handler"* -- 循环不用动, 新工具注册进 dispatch map 就行。

#### 核心问题

只有 `bash` 时，所有操作都走 shell。`cat` 截断不可预测，`sed` 遇到特殊字符就崩，每次 bash 调用都是不受约束的安全面。专用工具 (`read_file`, `write_file`) 可以在工具层面做路径沙箱。

**关键洞察**: 加工具不需要改循环。

#### 解决方案

```
+--------+      +-------+      +------------------+
|  User  | ---> |  LLM  | ---> | Tool Dispatch    |
| prompt |      |       |      | {                |
+--------+      +---+---+      |   bash: run_bash |
                    ^           |   read: run_read |
                    |           |   write: run_wr  |
                    +-----------+   edit: run_edit |
                    tool_result | }                |
                                +------------------+

The dispatch map is a dict: {tool_name: handler_function}.
One lookup replaces any if/elif chain.
```

#### 工作原理

**1. 每个工具有一个处理函数。路径沙箱防止逃逸工作区**

```python
def safe_path(p: str) -> Path:
    # 相对工作区解析路径，禁止 ../ 等逃逸到工作区外
    path = (WORKDIR / p).resolve()
    if not path.is_relative_to(WORKDIR):
        raise ValueError(f"Path escapes workspace: {p}")
    return path

def run_read(path: str, limit: int = None) -> str:
    text = safe_path(path).read_text()
    lines = text.splitlines()
    # 可选：只返回前 limit 行，避免大文件撑爆上下文
    if limit and limit < len(lines):
        lines = lines[:limit]
    # 截断总字符数，与常见 agent 读文件上限一致
    return "\n".join(lines)[:50000]
```

**2. dispatch map 将工具名映射到处理函数**

```python
# 工具名 -> 处理函数；LLM 的 tool_use.name 在此查找，无需改循环里的 if/elif
TOOL_HANDLERS = {
    "bash":       lambda **kw: run_bash(kw["command"]),
    "read_file":  lambda **kw: run_read(kw["path"], kw.get("limit")),
    "write_file": lambda **kw: run_write(kw["path"], kw["content"]),
    "edit_file":  lambda **kw: run_edit(kw["path"], kw["old_text"],
                                        kw["new_text"]),
}
```

**3. 循环中按名称查找处理函数**

```python
for block in response.content:
    if block.type == "tool_use":
        # 按名称分发；未注册则返回可读错误，仍走同一套 tool_result 回传
        handler = TOOL_HANDLERS.get(block.name)
        output = handler(**block.input) if handler \
            else f"Unknown tool: {block.name}"
        # 与 s01 相同：把结果挂回 tool_use_id，供下一轮模型消费
        results.append({
            "type": "tool_result",
            "tool_use_id": block.id,
            "content": output,
        })
```

**核心原则**: 加工具 = 加 handler + 加 schema。循环永远不变。

---

### s03: TodoWrite (待办写入)

> *"没有计划的 agent 走哪算哪"* -- 先列步骤再动手，完成率翻倍。

#### 核心问题

多步任务中，模型会丢失进度——重复做过的事、跳步、跑偏。对话越长越严重：工具结果不断填满上下文，系统提示的影响力逐渐被稀释。一个 10 步重构可能做完 1-3 步就开始即兴发挥，因为 4-10 步已经被挤出注意力了。

#### 解决方案

```
+--------+      +-------+      +---------+
|  User  | ---> |  LLM  | ---> | Tools   |
| prompt |      |       |      | + todo  |
+--------+      +---+---+      +----+----+
                    ^                |
                    |   tool_result  |
                    +----------------+
                          |
              +-----------+-----------+
              | TodoManager state     |
              | [ ] task A            |
              | [>] task B  <- doing  |
              | [x] task C            |
              +-----------------------+
                          |
              if rounds_since_todo >= 3:
                inject <reminder> into tool_result
```

#### 工作原理

**1. TodoManager 存储带状态的项目。同一时间只允许一个 `in_progress`**

```python
class TodoManager:
    def update(self, items: list) -> str:
        # 规范化每条 todo，并统计 in_progress 数量（规则：同时只能有一个进行中）
        validated, in_progress_count = [], 0
        for item in items:
            status = item.get("status", "pending")
            if status == "in_progress":
                in_progress_count += 1
            validated.append({"id": item["id"], "text": item["text"],
                              "status": status})
        if in_progress_count > 1:
            raise ValueError("Only one task can be in_progress")
        self.items = validated
        # 返回渲染后的文本，作为 tool_result 回给模型，便于下一轮继续对齐计划
        return self.render()
```

**2. `todo` 工具和其他工具一样加入 dispatch map**

```python
# 与 s02 相同：按工具名分发；todo 的入参是模型生成的 items 列表
TOOL_HANDLERS = {
    # ...base tools...
    "todo": lambda **kw: TODO.update(kw["items"]),
}
```

**3. nag reminder: 模型连续 3 轨以上不调用 `todo` 时注入提醒**

```python
# rounds_since_todo：自上次调用 todo 工具以来的轮次，由循环维护
if rounds_since_todo >= 3 and messages:
    last = messages[-1]
    # 仅当最后一条是「带多段 content 的 user」（例如紧跟 tool_results）时插入提醒块
    if last["role"] == "user" and isinstance(last.get("content"), list):
        # 插在列表最前，让模型优先看到，又不破坏原有 tool_result 块顺序
        last["content"].insert(0, {
            "type": "text",
            "text": "<reminder>Update your todos.</reminder>",
        })
```

"同时只能有一个 in_progress" 强制顺序聚焦。nag reminder 制造问责压力——你不更新计划，系统就追着你问。

---

### s04: Subagents (子代理)

> *"大任务拆小, 每个小任务干净的上下文"* -- Subagent 用独立 messages[], 不污染主对话。

#### 核心问题

Agent 工作越久，messages 数组越胖。每次读文件、跑命令的输出都永久留在上下文里。"这个项目用什么测试框架?" 可能要读 5 个文件，但父 Agent 只需要一个词: "pytest。"

#### 解决方案

```
Parent agent                     Subagent
+------------------+             +------------------+
| messages=[...]   |             | messages=[]      | <-- fresh
|                  |  dispatch   |                  |
| tool: task       | ----------> | while tool_use:  |
|   prompt="..."   |             |   call tools     |
|                  |  summary    |   append results |
|   result = "..." | <---------- | return last text |
+------------------+             +------------------+

Parent context stays clean. Subagent context is discarded.
```

#### 工作原理

**1. 父 Agent 有一个 `task` 工具。Subagent 拥有除 `task` 外的所有基础工具**

```python
PARENT_TOOLS = CHILD_TOOLS + [
    {"name": "task",
     "description": "Spawn a subagent with fresh context.",
     "input_schema": {
         "type": "object",
         "properties": {"prompt": {"type": "string"}},
         "required": ["prompt"],
     }},
]
```

**2. Subagent 以 `messages=[]` 启动，运行自己的循环。只有最终文本返回给父 Agent**

```python
def run_subagent(prompt: str) -> str:
    sub_messages = [{"role": "user", "content": prompt}]
    for _ in range(30):  # safety limit
        response = client.messages.create(
            model=MODEL, system=SUBAGENT_SYSTEM,
            messages=sub_messages,
            tools=CHILD_TOOLS, max_tokens=8000,
        )
        sub_messages.append({"role": "assistant",
                             "content": response.content})
        if response.stop_reason != "tool_use":
            break
        results = []
        for block in response.content:
            if block.type == "tool_use":
                handler = TOOL_HANDLERS.get(block.name)
                output = handler(**block.input)
                results.append({"type": "tool_result",
                    "tool_use_id": block.id,
                    "content": str(output)[:50000]})
        sub_messages.append({"role": "user", "content": results})
    return "".join(
        b.text for b in response.content if hasattr(b, "text")
    ) or "(no summary)"
```

Subagent 可能跑了 30+ 次工具调用，但整个消息历史直接丢弃。父 Agent 收到的只是一段摘要文本，作为普通 `tool_result` 返回。

---

### s05: Skills (Skill 加载)

> *"用到什么知识, 临时加载什么知识"* -- 通过 tool_result 注入, 不塞 system prompt。

#### 核心问题

你希望 Agent 遵循特定领域的工作流: git 约定、测试模式、代码审查清单。全塞进系统提示太浪费——10 个 Skill，每个 2000 token，就是 20,000 token，大部分跟当前任务毫无关系。

#### 解决方案

```
System prompt (Layer 1 -- always present):
+--------------------------------------+
| You are a coding agent.              |
| Skills available:                    |
|   - git: Git workflow helpers        |  ~100 tokens/skill
|   - test: Testing best practices     |
+--------------------------------------+

When model calls load_skill("git"):
+--------------------------------------+
| tool_result (Layer 2 -- on demand):  |
| <skill name="git">                   |
|   Full git workflow instructions...  |  ~2000 tokens
|   Step 1: ...                        |
| </skill>                             |
+--------------------------------------+
```

**两层策略**: 第一层：系统提示中放 Skill 名称（低成本）。第二层：tool_result 中按需放完整内容。

#### 工作原理

**1. 每个 Skill 是一个目录，包含 `SKILL.md` 文件和 YAML frontmatter**

```
skills/
  pdf/
    SKILL.md       # ---\n name: pdf\n description: Process PDF files\n ---\n ...
  code-review/
    SKILL.md       # ---\n name: code-review\n description: Review code\n ---\n ...
```

**2. SkillLoader 递归扫描 `SKILL.md` 文件**

```python
class SkillLoader:
    def __init__(self, skills_dir: Path):
        self.skills = {}
        for f in sorted(skills_dir.rglob("SKILL.md")):
            text = f.read_text()
            meta, body = self._parse_frontmatter(text)
            name = meta.get("name", f.parent.name)
            self.skills[name] = {"meta": meta, "body": body}

    def get_descriptions(self) -> str:
        lines = []
        for name, skill in self.skills.items():
            desc = skill["meta"].get("description", "")
            lines.append(f"  - {name}: {desc}")
        return "\n".join(lines)

    def get_content(self, name: str) -> str:
        skill = self.skills.get(name)
        if not skill:
            return f"Error: Unknown skill '{name}'."
        return f"<skill name=\"{name}\">\n{skill['body']}\n</skill>"
```

**3. 第一层写入系统提示，第二层是 dispatch map 中的又一个工具**

```python
SYSTEM = f"""You are a coding agent at {WORKDIR}.
Skills available:
{SKILL_LOADER.get_descriptions()}"""

TOOL_HANDLERS = {
    # ...base tools...
    "load_skill": lambda **kw: SKILL_LOADER.get_content(kw["name"]),
}
```

模型知道有哪些 Skill（便宜），需要时再加载完整内容（贵）。

---

### s06: Context Compact (上下文压缩)

> *"上下文总会满, 要有办法腾地方"* -- 三层压缩策略，换来无限会话。

#### 核心问题

上下文窗口是有限的。读一个 1000 行的文件就吃掉 ~4000 token；读 30 个文件、跑 20 条命令，轻松突破 100k token。不压缩，Agent 根本没法在大项目里干活。

#### 解决方案：三层压缩

```
Every turn:
+------------------+
| Tool call result |
+------------------+
        |
        v
[Layer 1: micro_compact]        (silent, every turn)
  Replace tool_result > 3 turns old
  with "[Previous: used {tool_name}]"
        |
        v
[Check: tokens > 50000?]
   |               |
   no              yes
   |               |
   v               v
continue    [Layer 2: auto_compact]
              Save transcript to .transcripts/
              LLM summarizes conversation.
              Replace all messages with [summary].
                    |
                    v
            [Layer 3: compact tool]
              Model calls compact explicitly.
              Same summarization as auto_compact.
```

#### 工作原理

**1. 第一层 -- micro_compact：每次 LLM 调用前，将旧的 tool result 替换为占位符**

```python
def micro_compact(messages: list) -> list:
    tool_results = []
    for i, msg in enumerate(messages):
        if msg["role"] == "user" and isinstance(msg.get("content"), list):
            for j, part in enumerate(msg["content"]):
                if isinstance(part, dict) and part.get("type") == "tool_result":
                    tool_results.append((i, j, part))
    if len(tool_results) <= KEEP_RECENT:
        return messages
    for _, _, part in tool_results[:-KEEP_RECENT]:
        if len(part.get("content", "")) > 100:
            part["content"] = f"[Previous: used {tool_name}]"
    return messages
```

**2. 第二层 -- auto_compact：token 超过阈值时，保存完整对话到磁盘，让 LLM 做摘要**

```python
def auto_compact(messages: list) -> list:
    # Save transcript for recovery
    transcript_path = TRANSCRIPT_DIR / f"transcript_{int(time.time())}.jsonl"
    with open(transcript_path, "w") as f:
        for msg in messages:
            f.write(json.dumps(msg, default=str) + "\n")
    # LLM summarizes
    response = client.messages.create(
        model=MODEL,
        messages=[{"role": "user", "content":
            "Summarize this conversation for continuity..."
            + json.dumps(messages, default=str)[:80000]}],
        max_tokens=2000,
    )
    return [
        {"role": "user", "content": f"[Compressed]\n\n{response.content[0].text}"},
    ]
```

**3. 循环整合三层**

```python
def agent_loop(messages: list):
    while True:
        micro_compact(messages)                        # Layer 1
        if estimate_tokens(messages) > THRESHOLD:
            messages[:] = auto_compact(messages)       # Layer 2
        response = client.messages.create(...)
        # ... tool execution ...
        if manual_compact:
            messages[:] = auto_compact(messages)       # Layer 3
```

完整历史通过 transcript 保存在磁盘上。信息没有真正丢失，只是移出了活跃上下文。

---

## 第二阶段：协作层

### s07: Task System (任务系统)

> *"大目标要拆成小任务, 排好序, 记在磁盘上"* -- 文件持久化的任务图，为多 agent 协作打基础。

#### 核心问题

s03 的 TodoManager 只是内存中的扁平清单：没有顺序、没有依赖、状态只有做完没做完。真实目标是有结构的——任务 B 依赖任务 A，任务 C 和 D 可以并行，任务 E 要等 C 和 D 都完成。

没有显式的关系，Agent 分不清什么能做、什么被卡住、什么能同时跑。而且清单只活在内存里，上下文压缩（s06）一跑就没了。

#### 解决方案：持久化任务图（DAG）

```
.tasks/
  task_1.json  {"id":1, "status":"completed"}
  task_2.json  {"id":2, "blockedBy":[1], "status":"pending"}
  task_3.json  {"id":3, "blockedBy":[1], "status":"pending"}
  task_4.json  {"id":4, "blockedBy":[2,3], "status":"pending"}

任务图 (DAG):
                 +----------+
            +--> | task 2   | --+
            |    | pending  |   |
+----------+     +----------+    +--> +----------+
| task 1   |                          | task 4   |
| completed| --> +----------+    +--> | blocked  |
+----------+     | task 3   | --+     +----------+
                 | pending  |
                 +----------+

顺序:   task 1 必须先完成, 才能开始 2 和 3
并行:   task 2 和 3 可以同时执行
依赖:   task 4 要等 2 和 3 都完成
状态:   pending -> in_progress -> completed
```

这个任务图是 s07 之后所有机制的协调骨架：后台执行（s08）、多 agent 团队（s09+）、worktree 隔离（s12）都读写这同一个结构。

#### 工作原理

**1. TaskManager：每个任务一个 JSON 文件，CRUD + 依赖图**

```python
class TaskManager:
    def __init__(self, tasks_dir: Path):
        self.dir = tasks_dir
        self.dir.mkdir(exist_ok=True)
        self._next_id = self._max_id() + 1

    def create(self, subject, description=""):
        task = {"id": self._next_id, "subject": subject,
                "status": "pending", "blockedBy": [],
                "owner": ""}
        self._save(task)
        self._next_id += 1
        return json.dumps(task, indent=2)
```

**2. 依赖解除：完成任务时，自动将其 ID 从其他任务的 `blockedBy` 中移除**

```python
def _clear_dependency(self, completed_id):
    for f in self.dir.glob("task_*.json"):
        task = json.loads(f.read_text())
        if completed_id in task.get("blockedBy", []):
            task["blockedBy"].remove(completed_id)
            self._save(task)
```

**3. 四个任务工具加入 dispatch map**

```python
TOOL_HANDLERS = {
    # ...base tools...
    "task_create": lambda **kw: TASKS.create(kw["subject"]),
    "task_update": lambda **kw: TASKS.update(kw["task_id"], kw.get("status")),
    "task_list":   lambda **kw: TASKS.list_all(),
    "task_get":    lambda **kw: TASKS.get(kw["task_id"]),
}
```

---

### s08: Background Tasks (后台任务)

> *"慢操作丢后台, agent 继续想下一步"* -- 后台线程跑命令，完成后注入通知。

#### 核心问题

有些命令要跑好几分钟：`npm install`、`pytest`、`docker build`。阻塞式循环下模型只能干等。用户说 "装依赖，顺便建个配置文件"，Agent 却只能一个一个来。

#### 解决方案

```
Main thread                Background thread
+-----------------+        +-----------------+
| agent loop      |        | subprocess runs |
| ...             |        | ...             |
| [LLM call] <---+------- | enqueue(result) |
|  ^drain queue   |        +-----------------+
+-----------------+

Timeline:
Agent --[spawn A]--[spawn B]--[other work]----
             |          |
             v          v
          [A runs]   [B runs]      (parallel)
             |          |
             +-- results injected before next LLM call --+
```

#### 工作原理

**1. BackgroundManager 用线程安全的通知队列追踪任务**

```python
class BackgroundManager:
    def __init__(self):
        self.tasks = {}
        self._notification_queue = []
        self._lock = threading.Lock()
```

**2. `run()` 启动守护线程，立即返回**

```python
def run(self, command: str) -> str:
    task_id = str(uuid.uuid4())[:8]
    self.tasks[task_id] = {"status": "running", "command": command}
    thread = threading.Thread(
        target=self._execute, args=(task_id, command), daemon=True)
    thread.start()
    return f"Background task {task_id} started"
```

**3. 每次 LLM 调用前排空通知队列**

```python
def agent_loop(messages: list):
    while True:
        notifs = BG.drain_notifications()
        if notifs:
            notif_text = "\n".join(
                f"[bg:{n['task_id']}] {n['result']}" for n in notifs)
            messages.append({"role": "user",
                "content": f"<background-results>\n{notif_text}\n"
                           f"</background-results>"})
        response = client.messages.create(...)
```

循环保持单线程。只有子进程 I/O 被并行化。

---

## 第三阶段：团队层

### s09: Agent Teams (Agent 团队)

> *"任务太大一个人干不完, 要能分给队友"* -- 持久化队友 + JSONL 邮箱。

#### 核心问题

Subagent（s04）是一次性的：生成、干活、返回摘要、消亡。没有身份，没有跨调用的记忆。Background Tasks（s08）能跑 shell 命令，但做不了 LLM 引导的决策。

真正的团队协作需要三样东西：
1. 能跨多轮对话存活的持久 Agent
2. 身份和生命周期管理
3. Agent 之间的通信通道

#### 解决方案

```
Teammate lifecycle:
  spawn -> WORKING -> IDLE -> WORKING -> ... -> SHUTDOWN

Communication:
  .team/
    config.json           <- team roster + statuses
    inbox/
      alice.jsonl         <- append-only, drain-on-read
      bob.jsonl
      lead.jsonl

              +--------+    send("alice","bob","...")    +--------+
              | alice  | -----------------------------> |  bob   |
              | loop   |    bob.jsonl << {json_line}    |  loop  |
              +--------+                                +--------+
                   ^                                         |
                   |        BUS.read_inbox("alice")          |
                   +---- alice.jsonl -> read + drain ---------+
```

#### 工作原理

**1. TeammateManager 通过 config.json 维护团队名册**

```python
class TeammateManager:
    def __init__(self, team_dir: Path):
        self.dir = team_dir
        self.dir.mkdir(exist_ok=True)
        self.config_path = self.dir / "config.json"
        self.config = self._load_config()
        self.threads = {}
```

**2. `spawn()` 创建队友并在线程中启动 agent loop**

```python
def spawn(self, name: str, role: str, prompt: str) -> str:
    member = {"name": name, "role": role, "status": "working"}
    self.config["members"].append(member)
    self._save_config()
    thread = threading.Thread(
        target=self._teammate_loop,
        args=(name, role, prompt), daemon=True)
    thread.start()
    return f"Spawned teammate '{name}' (role: {role})"
```

**3. MessageBus：append-only 的 JSONL 收件箱**

```python
class MessageBus:
    def send(self, sender, to, content, msg_type="message", extra=None):
        msg = {"type": msg_type, "from": sender,
               "content": content, "timestamp": time.time()}
        if extra:
            msg.update(extra)
        with open(self.dir / f"{to}.jsonl", "a") as f:
            f.write(json.dumps(msg) + "\n")

    def read_inbox(self, name):
        path = self.dir / f"{name}.jsonl"
        if not path.exists(): return "[]"
        msgs = [json.loads(l) for l in path.read_text().strip().splitlines() if l]
        path.write_text("")  # drain
        return json.dumps(msgs, indent=2)
```

---

### s10: Team Protocols (团队协议)

> *"队友之间要有统一的沟通规矩"* -- 一个 request-response 模式驱动所有协商。

#### 核心问题

s09 中队友能干活能通信，但缺少结构化协调：

- **关机**: 直接杀线程会留下写了一半的文件和过期的 config.json。需要握手——领导请求，队友批准（收尾退出）或拒绝（继续干）。
- **计划审批**: 领导说 "重构认证模块"，队友立刻开干。高风险变更应该先过审。

两者结构一样：一方发带唯一 ID 的请求，另一方引用同一 ID 响应。

#### 解决方案

```
Shutdown Protocol            Plan Approval Protocol
==================           ======================

Lead             Teammate    Teammate           Lead
  |                 |           |                 |
  |--shutdown_req-->|           |--plan_req------>|
  | {req_id:"abc"}  |           | {req_id:"xyz"}  |
  |                 |           |                 |
  |<--shutdown_resp-|           |<--plan_resp-----|
  | {req_id:"abc",  |           | {req_id:"xyz",  |
  |  approve:true}  |           |  approve:true}  |

Shared FSM:
  [pending] --approve--> [approved]
  [pending] --reject---> [rejected]
```

#### 工作原理

**1. 领导生成 request_id，通过收件箱发起关机请求**

```python
shutdown_requests = {}

def handle_shutdown_request(teammate: str) -> str:
    req_id = str(uuid.uuid4())[:8]
    shutdown_requests[req_id] = {"target": teammate, "status": "pending"}
    BUS.send("lead", teammate, "Please shut down gracefully.",
             "shutdown_request", {"request_id": req_id})
    return f"Shutdown request {req_id} sent (status: pending)"
```

**2. 队友收到请求后，用 approve/reject 响应**

```python
if tool_name == "shutdown_response":
    req_id = args["request_id"]
    approve = args["approve"]
    shutdown_requests[req_id]["status"] = "approved" if approve else "rejected"
    BUS.send(sender, "lead", args.get("reason", ""),
             "shutdown_response",
             {"request_id": req_id, "approve": approve})
```

一个 FSM，两种用途。同样的 `pending -> approved | rejected` 状态机可以套用到任何请求-响应协议上。

---

### s11: Autonomous Agents (自治 Agent)

> *"队友自己看看板, 有活就认领"* -- 不需要领导逐个分配，自组织。

#### 核心问题

s09-s10 中，队友只在被明确指派时才动。领导得给每个队友写 prompt，任务看板上 10 个未认领的任务得手动分配。这扩展不了。

真正的自治：队友自己扫描任务看板，认领没人做的任务，做完再找下一个。

一个细节：Context Compact（s06）后 Agent 可能忘了自己是谁。身份重注入解决这个问题。

#### 解决方案

```
Teammate lifecycle with idle cycle:

+-------+
| spawn |
+---+---+
    |
    v
+-------+   tool_use     +-------+
| WORK  | <------------- |  LLM  |
+---+---+                +-------+
    |
    | stop_reason != tool_use (or idle tool called)
    v
+--------+
|  IDLE  |  poll every 5s for up to 60s
+---+----+
    |
    +---> check inbox --> message? ----------> WORK
    |
    +---> scan .tasks/ --> unclaimed? -------> claim -> WORK
    |
    +---> 60s timeout ----------------------> SHUTDOWN

Identity re-injection after compression:
  if len(messages) <= 3:
    messages.insert(0, identity_block)
```

#### 工作原理

**1. 队友循环分两个阶段：WORK 和 IDLE**

```python
def _loop(self, name, role, prompt):
    while True:
        # -- WORK PHASE --
        messages = [{"role": "user", "content": prompt}]
        for _ in range(50):
            response = client.messages.create(...)
            if response.stop_reason != "tool_use":
                break
            # execute tools...
            if idle_requested:
                break

        # -- IDLE PHASE --
        self._set_status(name, "idle")
        resume = self._idle_poll(name, messages)
        if not resume:
            self._set_status(name, "shutdown")
            return
        self._set_status(name, "working")
```

**2. 空闲阶段循环轮询收件箱和任务看板**

```python
def _idle_poll(self, name, messages):
    for _ in range(IDLE_TIMEOUT // POLL_INTERVAL):  # 60s / 5s = 12
        time.sleep(POLL_INTERVAL)
        inbox = BUS.read_inbox(name)
        if inbox:
            messages.append({"role": "user",
                "content": f"<inbox>{inbox}</inbox>"})
            return True
        unclaimed = scan_unclaimed_tasks()
        if unclaimed:
            claim_task(unclaimed[0]["id"], name)
            messages.append({"role": "user",
                "content": f"<auto-claimed>Task #{unclaimed[0]['id']}: "
                           f"{unclaimed[0]['subject']}</auto-claimed>"})
            return True
    return False  # timeout -> shutdown
```

**3. 任务看板扫描：找 pending 状态、无 owner、未被阻塞的任务**

```python
def scan_unclaimed_tasks() -> list:
    unclaimed = []
    for f in sorted(TASKS_DIR.glob("task_*.json")):
        task = json.loads(f.read_text())
        if (task.get("status") == "pending"
                and not task.get("owner")
                and not task.get("blockedBy")):
            unclaimed.append(task)
    return unclaimed
```

**4. 身份重注入：上下文过短时在开头插入身份块**

```python
if len(messages) <= 3:
    messages.insert(0, {"role": "user",
        "content": f"<identity>You are '{name}', role: {role}, "
                   f"team: {team_name}. Continue your work.</identity>"})
    messages.insert(1, {"role": "assistant",
        "content": f"I am {name}. Continuing."})
```

---

### s12: Worktree + Task Isolation (Worktree 任务隔离)

> *"各干各的目录, 互不干扰"* -- 任务管目标，worktree 管目录，按 ID 绑定。

#### 核心问题

到 s11，Agent 已经能自主认领和完成任务。但所有任务共享一个目录。两个 Agent 同时重构不同模块——A 改 `config.py`，B 也改 `config.py`，未提交的改动互相污染，谁也没法干净回滚。

任务板管 "做什么" 但不管 "在哪做"。解法：给每个任务一个独立的 git worktree 目录，用任务 ID 把两边关联起来。

#### 解决方案

```
Control plane (.tasks/)             Execution plane (.worktrees/)
+------------------+                +------------------------+
| task_1.json      |                | auth-refactor/         |
|   status: in_progress  <------>   branch: wt/auth-refactor
|   worktree: "auth-refactor"   |   task_id: 1             |
+------------------+                +------------------------+
| task_2.json      |                | ui-login/              |
|   status: pending    <------>     branch: wt/ui-login
|   worktree: "ui-login"       |   task_id: 2             |
+------------------+                +------------------------+
                                    |
                          index.json (worktree registry)
                          events.jsonl (lifecycle log)

State machines:
  Task:     pending -> in_progress -> completed
  Worktree: absent  -> active      -> removed | kept
```

#### 工作原理

**1. 创建任务**

```python
TASKS.create("Implement auth refactor")
# -> .tasks/task_1.json  status=pending  worktree=""
```

**2. 创建 worktree 并绑定任务**

```python
WORKTREES.create("auth-refactor", task_id=1)
# -> git worktree add -b wt/auth-refactor .worktrees/auth-refactor HEAD
# -> index.json gets new entry, task_1.json gets worktree="auth-refactor"
```

**绑定同时写入两侧状态**

```python
def bind_worktree(self, task_id, worktree):
    task = self._load(task_id)
    task["worktree"] = worktree
    if task["status"] == "pending":
        task["status"] = "in_progress"
    self._save(task)
```

**3. 在 worktree 中执行命令**

```python
subprocess.run(command, shell=True, cwd=worktree_path,
               capture_output=True, text=True, timeout=300)
```

**4. 收尾：两种选择**

- `worktree_keep(name)` -- 保留目录供后续使用
- `worktree_remove(name, complete_task=True)` -- 删除目录，完成绑定任务，发出事件

```python
def remove(self, name, force=False, complete_task=False):
    self._run_git(["worktree", "remove", wt["path"]])
    if complete_task and wt.get("task_id") is not None:
        self.tasks.update(wt["task_id"], status="completed")
        self.tasks.unbind_worktree(wt["task_id"])
        self.events.emit("task.completed", ...)
```

**5. 事件流**

```json
{
  "event": "worktree.remove.after",
  "task": {"id": 1, "status": "completed"},
  "worktree": {"name": "auth-refactor", "status": "removed"},
  "ts": 1730000000
}
```

崩溃后从 `.tasks/` + `.worktrees/index.json` 重建现场。会话记忆是易失的；磁盘状态是持久的。

---

## 总结：架构全景图

从 s01 到 s12，我们构建了一个完整的 Agent 系统：

| 章节 | 核心机制 | 关键代码模式 |
|------|----------|--------------|
| s01 | Agent 循环 | `while True` + `stop_reason` |
| s02 | 工具分发 | `TOOL_HANDLERS` dict |
| s03 | 规划跟踪 | `TodoManager` + nag |
| s04 | 上下文隔离 | `messages=[]` 子进程 |
| s05 | 按需知识 | 两层 Skill 加载 |
| s06 | 压缩策略 | micro + auto + manual |
| s07 | 持久化任务 | DAG 任务图 |
| s08 | 后台执行 | 守护线程 + 通知队列 |
| s09 | 团队通信 | JSONL 收件箱 |
| s10 | 协商协议 | request_id FSM |
| s11 | 自治认领 | IDLE 轮询 + 身份重注入 |
| s12 | 目录隔离 | task-worktree 绑定 |

**核心设计原则**：

1. **循环不变** — 从 s01 到 s12，核心循环始终是 `LLM → tool_use → execute → tool_result → LLM`
2. **分层叠加** — 每个章节只加一层机制，不改动已有代码
3. **持久化优先** — 任务、团队、worktree 全部用磁盘文件，压缩和重启后存活
4. **事件驱动** — 用 JSONL 和事件流追踪生命周期，可恢复

这套架构是 Claude Code CLI 的核心实现原理，也是构建复杂 Agent 系统的最佳实践。

---

## 实践建议

### 如何学习

```bash
cd learn-claude-code
python agents/s01_agent_loop.py   # 从最简单的循环开始
python agents/s02_tool_use.py     # 逐步叠加机制
# ... 直到 s12
```

### 推荐练习 Prompt

每个章节都提供了练习 prompt，建议按顺序尝试：

1. **s01**: `Create a file called hello.py that prints "Hello, World!"`
2. **s02**: `Read the file requirements.txt`
3. **s03**: `Refactor the file hello.py: add type hints, docstrings, and a main guard`
4. **s04**: `Use a subtask to find what testing framework this project uses`
5. **s05**: `Load the agent-builder skill and follow its instructions`
6. **s06**: `Read every Python file in the agents/ directory one by one`
7. **s07**: `Create 3 tasks: "Setup project", "Write code", "Write tests". Make them depend on each other.`
8. **s08**: `Run "sleep 5 && echo done" in the background, then create a file while it runs`
9. **s09**: `Spawn alice (coder) and bob (tester). Have alice send bob a message.`
10. **s10**: `Spawn alice as a coder. Then request her shutdown.`
11. **s11**: `Create 3 tasks on the board, then spawn alice and bob. Watch them auto-claim.`
12. **s12**: `Create tasks for backend auth and frontend login page, then list tasks.`