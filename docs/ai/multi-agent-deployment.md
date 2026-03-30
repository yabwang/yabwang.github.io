---
order: 12
---

# 多 Agent 独立部署与协作调用

> 📅 主题：协议、架构与实战 — 从单 Agent 到多 Agent 协作系统

## 一、引言：为什么需要多 Agent 协作

### 1.1 单 Agent 的局限性

单个 Agent 在处理复杂任务时存在明显边界：

- **能力边界问题**：单个 Agent 难以精通所有领域，无论是代码生成、数据分析还是知识检索，总有擅长和不擅长的领域
- **资源竞争**：长任务会阻塞其他请求，上下文膨胀导致响应变慢甚至失败
- **故障隔离差**：单点失败影响全局，一个工具出错可能导致整个任务无法完成
- **扩展瓶颈**：难以水平扩展，单个实例成为性能天花板

### 1.2 多 Agent 协作的价值

多 Agent 系统通过「分工协作」解决上述问题：

| 维度 | 单 Agent | 多 Agent 协作 |
|------|----------|---------------|
| 专业分工 | 一个 Agent 暴露所有能力 | 每个 Agent 专注特定领域 |
| 并行执行 | 串行处理，效率受限 | 任务分解后并行处理 |
| 故障隔离 | 单点失败影响全局 | 单个 Agent 故障不影响整体 |
| 灵活扩展 | 线性扩展困难 | 按需增减 Agent 实例 |
| 维护成本 | 改动影响整体 | 单个 Agent 独立更新 |

### 1.3 本文结构预览

本文将从三个层面展开：

- **协议层**：主流 Agent 间通信协议对比（MCP、A2A、LangGraph、AutoGen 等）
- **架构层**：系统架构模式与通信机制（中心式、去中心化、消息队列等）
- **实战层**：完整代码示例与部署实践

---

## 二、协议层：Agent 间通信标准

### 2.1 协议演进与分类

为什么需要标准化协议？

在没有统一协议之前：
- 每个 Agent 自定义消息格式、调用方式
- Agent 间集成需要写大量适配代码
- 协作模式难以复用和迁移

协议的核心价值是「**一次定义，多处复用**」——Agent 只需遵循协议，就能与任何兼容系统对接。

协议按功能可分为三类：

| 类型 | 核心目标 | 代表协议 |
|------|----------|----------|
| 能力发现型 | 暴露工具/资源供调用 | MCP |
| 任务协作型 | Agent 间直接通信与任务委派 | A2A |
| 编排调度型 | 定义工作流与状态流转 | LangGraph、AutoGen |

### 2.2 MCP (Model Context Protocol) — Anthropic

MCP 是 Anthropic 推出的标准化协议，详见 [MCP 入门](/ai/mcp)。

**核心设计理念**：
- 工具与资源的标准化暴露（名称 + 描述 + 参数 schema）
- Client-Server 架构模式
- 支持 stdio（本地）和 SSE（远程）两种传输

**多 Agent 场景下的 MCP**：

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Agent A     │────→│ MCP Client  │────→│ MCP Server  │
│ (编排者)    │     │ (能力发现)  │     │ (工具暴露)  │
└─────────────┘     └─────────────┘     └─────────────┘
```

MCP 的定位更偏「能力暴露」，适合：
- Agent A 需要调用 Agent B 提供的某个工具
- 多个 Agent 共享同一组外部能力（数据库、文件系统等）

**局限**：MCP 不是 Agent 间直接协作协议，无法表达「任务委派」和「结果回传」的完整语义。

### 2.3 A2A (Agent-to-Agent) — Google

A2A 是 Google 于 2025 年推出的 Agent 间协作协议，专门解决「Agent 如何发现彼此并委派任务」的问题。

**核心概念**：

| 概念 | 说明 |
|------|------|
| **Agent Card** | Agent 能力声明卡片（JSON 格式），包含名称、能力、端点、认证方式等 |
| **Task** | 任务定义，包含输入、状态、输出，支持生命周期管理 |
| **Message** | Agent 间消息格式，标准化请求与响应结构 |

**通信流程**：

```
1. Agent A 发现 Agent B（读取 Agent Card）
2. Agent A 委派任务给 Agent B（发送 Task）
3. Agent B 执行任务，更新状态
4. Agent B 返回结果给 Agent A
```

**与 MCP 的对比**：

| 维度 | MCP | A2A |
|------|-----|-----|
| 设计目标 | 能力暴露 | Agent 间协作 |
| 通信模式 | Client-Server | Peer-to-Peer |
| 消息语义 | 工具调用/资源读取 | 任务委派/结果回传 |
| 适用场景 | 工具集成 | 多 Agent 系统 |

### 2.4 LangGraph / LangChain Agent 编排

LangGraph 是 LangChain 推出的状态图编排框架，核心思想是「用图定义 Agent 协作流程」。

**核心概念**：

- **StateGraph**：状态图定义，管理全局状态
- **Node**：节点可以是 Agent 或工具
- **Edge**：节点间流转条件，支持条件分支

**多 Agent 编排模式**：

```python
from langgraph.graph import StateGraph, END

# 定义状态
class AgentState(TypedDict):
    input: str
    intermediate: dict
    output: str

# 构建图
graph = StateGraph(AgentState)
graph.add_node("router", router_agent)
graph.add_node("researcher", research_agent)
graph.add_node("writer", writer_agent)
graph.add_node("reviewer", reviewer_agent)

# 定义流转条件
graph.add_edge("router", "researcher", condition="need_research")
graph.add_edge("router", "writer", condition="direct_write")
graph.add_edge("researcher", "writer")
graph.add_edge("writer", "reviewer")
graph.add_edge("reviewer", END, condition="approved")
graph.add_edge("reviewer", "writer", condition="needs_revision")
```

**LangGraph vs 独立部署**：
- **内存模式**：所有 Agent 同进程，适合开发调试和小规模场景
- **分布式模式**：通过检查点（Checkpoint）和消息队列实现跨进程协调，适合生产部署

### 2.5 AutoGen 多 Agent 协作

AutoGen 是 Microsoft 推出的多 Agent 协作框架，强调「对话式协作」。

**核心概念**：

- **ConversableAgent**：可对话的 Agent 基类
- **AssistantAgent**：AI 助手角色
- **UserProxyAgent**：用户代理角色（可执行代码、提供输入）
- **GroupChat**：多 Agent 群聊模式，由 Manager 协调发言顺序

**协作模式示例**：

```python
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager

# 创建 Agents
researcher = AssistantAgent("researcher", llm_config=llm_config)
writer = AssistantAgent("writer", llm_config=llm_config)
reviewer = AssistantAgent("reviewer", llm_config=llm_config)

# 创建群聊
groupchat = GroupChat(agents=[researcher, writer, reviewer], max_round=10)
manager = GroupChatManager(groupchat=groupchat, llm_config=llm_config)

# 发起协作
user_proxy.initiate_chat(manager, message="请帮我写一篇关于 AI Agent 的技术文章")
```

**AutoGen 的部署特点**：
- 默认内存模式，适合快速原型
- AutoGen Studio 提供可视化编排界面
- 可通过 Docker 容器化实现独立部署

### 2.6 其他协议与框架

#### Bee Agent (IBM)

IBM 的轻量级 Agent 框架：
- 工具链组合模式，强调企业级可扩展性
- 支持与现有 IBM 生态（Watsonx、LangChain）集成

#### Semantic Kernel (Microsoft)

微软的 AI 编排框架：
- Skills 与 Plugins 体系
- 与 Azure OpenAI、Copilot 生态深度集成

#### CrewAI

开源的角色扮演式 Agent 框架：
- 定义 Agent 角色、任务和团队
- 支持顺序执行与层级协作

**协议对比总表**：

| 协议/框架 | 提出方 | 核心场景 | 通信方式 | 适用规模 |
|-----------|--------|----------|----------|----------|
| MCP | Anthropic | 能力暴露 | Client-Server | 中小型 |
| A2A | Google | Agent 间协作 | Peer-to-Peer | 中大型 |
| LangGraph | LangChain | 编排调度 | 内存/分布式 | 各规模 |
| AutoGen | Microsoft | 对话协作 | 内存优先 | 中小型 |
| CrewAI | 开源 | 角色分工 | 内存 | 小型 |

---

## 三、架构层：多 Agent 系统设计

### 3.1 架构模式对比

#### 中心式编排

```
          ┌─────────────┐
          │ Orchestrator│
          │  (编排器)    │
          └──────┬──────┘
       ┌─────────┼─────────┐
       ▼         ▼         ▼
   ┌───────┐ ┌───────┐ ┌───────┐
   │Agent A│ │Agent B│ │Agent C│
   └───────┘ └───────┘ └───────┘
```

**特点**：所有 Agent 通过中央编排器协调，编排器负责任务分配、状态管理、结果汇总。

**优点**：
- 流程可控、易于调试
- 状态集中管理，便于追踪
- 添加新 Agent 只需注册到编排器

**缺点**：
- 编排器成为瓶颈
- 单点故障风险
- 编排器复杂度高

**适用场景**：流程清晰、Agent 数量可控（<10）、对可观测性要求高

#### 去中心化通信

```
   ┌───────┐ ←────→ ┌───────┐
   │Agent A│ ←────→ │Agent B│
   └───┬───┘ ←────→ └───┬───┘
       ↑   ↖        ↗   ↑
       │    ↖    ↗      │
       │     ↖↗        │
       ▼      ↗↘       ▼
   ┌───┴───┐ ↗  ↘ ┌───┴───┐
   │Agent C│←────→│Agent D│
   └───────┘      └───────┘
```

**特点**：Agent 间直接通信，无中央节点，基于 A2A 等协议实现。

**优点**：
- 去中心化、高可用
- 自然扩展，添加 Agent 无需修改编排器
- 单 Agent 故障只影响局部

**缺点**：
- 流程复杂、调试困难
- 状态分散，难以全局追踪
- 需要额外的服务发现机制

**适用场景**：大规模系统（>20 Agent）、动态拓扑、高可用需求

#### 混合架构

结合两种模式的优点：
- **分层编排**：顶层编排器协调跨域任务，域内采用去中心化通信
- **按域分组**：不同业务域独立编排，域间通过消息队列或 API 通信

### 3.2 通信机制详解

#### HTTP/REST API

**适用场景**：同步请求、简单查询、低频调用

**优点**：
- 简单、通用、易于调试
- 无需额外中间件
- 适合跨语言、跨平台集成

**缺点**：
- 不支持服务端推送
- 长连接成本高
- 高频调用性能受限

**实现要点**：
- 统一 API 规范（OpenAPI/Swagger）
- 认证与授权机制（API Key、JWT）
- 超时与重试策略

#### 消息队列模式

```
Producer → [Queue/Topic] → Consumer
   │                           │
   └── Agent A                 └── Agent B
```

**适用场景**：异步任务、解耦、削峰填谷

**技术选型**：

| 技术 | 特点 | 适用场景 |
|------|------|----------|
| Redis Streams | 轻量、快速部署 | 小规模、开发环境 |
| RabbitMQ | 可靠、功能丰富 | 中规模、企业应用 |
| Kafka | 高吞吐、持久化 | 大规模、数据密集 |
| NATS | 轻量、云原生 | 微服务、实时系统 |

**实现要点**：
- 消息格式标准化（JSON Schema）
- 消息确认与重试机制
- 死信队列处理失败消息

#### WebSocket 实时通信

**适用场景**：实时交互、状态推送、协作编辑

**优点**：
- 低延迟、双向通信
- 适合长连接场景

**缺点**：
- 连接管理复杂
- 水平扩展需要额外支持（如 Redis Pub/Sub）

**实现要点**：
- 连接池管理
- 心跳与重连机制
- 消息序列化

#### gRPC 高性能通信

**适用场景**：内部服务间高频调用、流式传输

**优点**：
- 高性能（二进制协议）
- 强类型、双向流
- 代码生成减少手写量

**缺点**：
- 调试不便（需工具）
- 浏览器支持有限

### 3.3 状态管理与持久化

#### 会话状态

单次任务执行的状态流转：
- 任务 ID + 步骤记录 + 中间结果
- 存储：内存（开发） / Redis（生产）

#### 长期记忆

Agent 间共享的知识库：
- 向量数据库：检索式记忆
- 关系数据库：结构化记忆
- 对象存储：文档记忆

#### 检查点与恢复

任务中断后的恢复机制：
- LangGraph 的 Checkpoint 持久化
- 每个步骤完成后保存状态
- 恢复时从最近检查点继续

### 3.4 服务发现与注册

#### 静态配置

- 配置文件定义 Agent 地址
- 适用：小规模、稳定环境

```yaml
agents:
  router-agent:
    endpoint: http://router:8000
  knowledge-agent:
    endpoint: http://knowledge:8000
```

#### 动态注册

- Consul / Etcd / Nacos / Kubernetes Service
- Agent 启动时注册，停止时注销
- 支持 Health Check 自动剔除故障实例

### 3.5 监控与可观测性

#### 分布式追踪

- OpenTelemetry 集成
- 跨 Agent 调用链追踪（Trace ID 贯穿全程）
- Jaeger / Zipkin 可视化

#### 指标监控

- Agent 响应时间、成功率、吞吐量
- 消息队列积压、处理延迟
- Prometheus + Grafana

#### 日志聚合

- ELK / Loki 日志收集
- 结构化日志与关联 ID（Trace ID）
- 便于问题定位与审计

---

## 四、实战层：完整代码示例

### 4.1 场景设计

**业务场景**：智能客服系统

**Agent 角色划分**：

| Agent | 能力 | 说明 |
|-------|------|------|
| Router Agent | 意图分析 | 分析用户输入，决定分发给哪个专业 Agent |
| Knowledge Agent | RAG 检索 | 从知识库检索相关文档，生成回答 |
| Ticket Agent | 工单管理 | 创建、查询、更新工单 |
| Summary Agent | 结果汇总 | 整合多个 Agent 的结果，生成最终回复 |

### 4.2 架构设计图

```
用户请求
    │
    ▼
┌─────────────┐     ┌──────────────────┐
│  API 网关   │────→│   Router Agent    │
└─────────────┘     │  (意图分析)       │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
       ┌───────────┐  ┌───────────┐  ┌───────────┐
       │Knowledge  │  │  Ticket   │  │  Summary  │
       │  Agent    │  │  Agent    │  │  Agent    │
       │  (RAG)    │  │  (CRUD)   │  │  (生成)   │
       └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
             │              │              │
             └──────────────┴──────────────┘
                            │
                            ▼
                      ┌──────────┐
                      │   Redis  │
                      │ (消息队列)│
                      └──────────┘
```

### 4.3 核心代码实现

#### 项目结构

```
multi-agent-system/
├── agents/
│   ├── base_agent.py        # Agent 基类
│   ├── router_agent.py      # 路由 Agent
│   ├── knowledge_agent.py   # 知识库 Agent
│   ├── ticket_agent.py      # 工单 Agent
│   └── summary_agent.py     # 总结 Agent
├── core/
│   ├── message.py           # 消息定义
│   ├── orchestrator.py      # 编排器
│   └── state_manager.py     # 状态管理
├── communication/
│   ├── http_client.py       # HTTP 通信
│   └── message_queue.py     # 消息队列
├── config/
│   └── settings.py          # 配置管理
├── api/
│   └── main.py              # API 入口
└── docker-compose.yml       # 部署配置
```

#### 消息协议定义

```python
# core/message.py
from pydantic import BaseModel
from enum import Enum
from typing import Any, Optional
from datetime import datetime
import uuid

class MessageType(Enum):
    TASK = "task"           # 任务请求
    RESULT = "result"       # 执行结果
    QUERY = "query"         # 查询请求
    RESPONSE = "response"   # 查询响应
    ERROR = "error"         # 错误信息
    HEARTBEAT = "heartbeat" # 心跳

class AgentMessage(BaseModel):
    """Agent 间通信消息标准格式"""
    message_id: str = str(uuid.uuid4())
    message_type: MessageType
    sender: str                  # 发送方 Agent ID
    receiver: str                # 接收方 Agent ID
    task_id: str                 # 关联任务 ID
    timestamp: datetime = datetime.now()
    payload: dict[str, Any]      # 消息内容
    metadata: Optional[dict] = None  # 元数据（追踪 ID 等）

    class Config:
        use_enum_values = True
```

#### Agent 基类

```python
# agents/base_agent.py
from abc import ABC, abstractmethod
from typing import Any, Callable
from core.message import AgentMessage, MessageType

class BaseAgent(ABC):
    """Agent 基类，定义通用接口"""

    def __init__(self, agent_id: str, capabilities: list[str]):
        self.agent_id = agent_id
        self.capabilities = capabilities
        self.message_handlers: dict[MessageType, Callable] = {}

    @abstractmethod
    async def process(self, message: AgentMessage) -> AgentMessage:
        """处理消息的核心方法"""
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """健康检查"""
        pass

    def can_handle(self, task_type: str) -> bool:
        """检查是否能处理某类任务"""
        return task_type in self.capabilities

    def register_handler(self, message_type: MessageType, handler: Callable):
        """注册消息处理器"""
        self.message_handlers[message_type] = handler
```

#### 路由 Agent 实现

```python
# agents/router_agent.py
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from agents.base_agent import BaseAgent
from core.message import AgentMessage, MessageType
from datetime import datetime

class RouterAgent(BaseAgent):
    """路由 Agent：分析意图，分配任务"""

    INTENT_PROMPT = """分析以下用户消息的意图，返回最匹配的类别：

用户消息：{user_message}

可选类别：
- knowledge: 查询知识库/文档
- ticket: 创建或查询工单
- general: 一般对话/其他

只返回类别名称，不要其他内容。"""

    def __init__(self, agent_id: str = "router-001"):
        super().__init__(agent_id, capabilities=["intent_analysis", "routing"])
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    async def process(self, message: AgentMessage) -> AgentMessage:
        if message.message_type != MessageType.TASK:
            return self._error_response(message, "只处理任务类型消息")

        user_input = message.payload.get("user_input", "")
        intent = await self._analyze_intent(user_input)

        return AgentMessage(
            message_id=f"resp-{message.message_id}",
            message_type=MessageType.RESULT,
            sender=self.agent_id,
            receiver=message.sender,
            task_id=message.task_id,
            timestamp=datetime.now(),
            payload={
                "intent": intent,
                "original_input": user_input,
                "target_agent": self._get_target_agent(intent)
            }
        )

    async def _analyze_intent(self, user_input: str) -> str:
        response = await self.llm.ainvoke([
            HumanMessage(content=self.INTENT_PROMPT.format(user_message=user_input))
        ])
        return response.content.strip()

    def _get_target_agent(self, intent: str) -> str:
        mapping = {
            "knowledge": "knowledge-agent",
            "ticket": "ticket-agent",
            "general": "summary-agent"
        }
        return mapping.get(intent, "summary-agent")

    async def health_check(self) -> bool:
        try:
            await self.llm.ainvoke([HumanMessage(content="ping")])
            return True
        except:
            return False

    def _error_response(self, message: AgentMessage, error_msg: str) -> AgentMessage:
        return AgentMessage(
            message_id=f"err-{message.message_id}",
            message_type=MessageType.ERROR,
            sender=self.agent_id,
            receiver=message.sender,
            task_id=message.task_id,
            timestamp=datetime.now(),
            payload={"error": error_msg}
        )
```

#### 知识库 Agent 实现

```python
# agents/knowledge_agent.py
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from agents.base_agent import BaseAgent
from core.message import AgentMessage, MessageType
from datetime import datetime

class KnowledgeAgent(BaseAgent):
    """知识库 Agent：RAG 检索"""

    def __init__(self, agent_id: str = "knowledge-001", persist_dir: str = "./chroma_db"):
        super().__init__(agent_id, capabilities=["knowledge_retrieval", "rag"])
        self.llm = ChatOpenAI(model="gpt-4o-mini")
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = Chroma(
            persist_directory=persist_dir,
            embedding_function=self.embeddings
        )

    async def process(self, message: AgentMessage) -> AgentMessage:
        query = message.payload.get("query", "")
        top_k = message.payload.get("top_k", 5)

        # 检索相关文档
        docs = await self.vectorstore.asimilarity_search(query, k=top_k)

        # 生成回答
        context = "\n\n".join([doc.page_content for doc in docs])
        answer = await self._generate_answer(query, context)

        return AgentMessage(
            message_id=f"resp-{message.message_id}",
            message_type=MessageType.RESULT,
            sender=self.agent_id,
            receiver=message.sender,
            task_id=message.task_id,
            timestamp=datetime.now(),
            payload={
                "answer": answer,
                "sources": [{"content": d.page_content[:200], "metadata": d.metadata} for d in docs]
            }
        )

    async def _generate_answer(self, query: str, context: str) -> str:
        prompt = f"""根据以下知识库内容回答用户问题。
如果知识库中没有相关信息，请明确说明。

知识库内容：
{context}

用户问题：{query}

请给出准确、简洁的回答："""

        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        return response.content

    async def health_check(self) -> bool:
        return True
```

#### 编排器实现

```python
# core/orchestrator.py
import asyncio
from typing import Dict
from agents.base_agent import BaseAgent
from core.message import AgentMessage, MessageType
from datetime import datetime
import uuid

class Orchestrator:
    """中心编排器：协调多 Agent 协作"""

    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self.task_states: Dict[str, dict] = {}

    def register_agent(self, agent: BaseAgent):
        """注册 Agent"""
        self.agents[agent.agent_id] = agent
        print(f"Registered agent: {agent.agent_id}")

    async def execute_task(self, user_input: str, task_id: str = None) -> dict:
        """执行完整任务流程"""
        if not task_id:
            task_id = str(uuid.uuid4())

        self.task_states[task_id] = {"status": "started", "steps": []}

        try:
            # Step 1: 意图分析
            router_msg = AgentMessage(
                message_id=f"msg-{task_id}-1",
                message_type=MessageType.TASK,
                sender="orchestrator",
                receiver="router-001",
                task_id=task_id,
                timestamp=datetime.now(),
                payload={"user_input": user_input}
            )
            router_result = await self.agents["router-001"].process(router_msg)
            target_agent = router_result.payload.get("target_agent", "summary-agent")
            self.task_states[task_id]["steps"].append({
                "step": "routing",
                "result": router_result.payload
            })

            # Step 2: 执行目标任务
            # 查找实际的 Agent ID（去掉 "-agent" 后缀）
            actual_agent_id = self._find_agent_by_name(target_agent)

            target_msg = AgentMessage(
                message_id=f"msg-{task_id}-2",
                message_type=MessageType.TASK,
                sender="orchestrator",
                receiver=actual_agent_id,
                task_id=task_id,
                timestamp=datetime.now(),
                payload={"query": user_input}
            )

            if actual_agent_id in self.agents:
                target_result = await self.agents[actual_agent_id].process(target_msg)
            else:
                target_result = AgentMessage(
                    message_id=f"err-{task_id}-2",
                    message_type=MessageType.ERROR,
                    sender="orchestrator",
                    receiver="orchestrator",
                    task_id=task_id,
                    timestamp=datetime.now(),
                    payload={"error": f"Agent {target_agent} not found"}
                )

            self.task_states[task_id]["steps"].append({
                "step": target_agent,
                "result": target_result.payload
            })

            # Step 3: 生成最终回复
            summary_msg = AgentMessage(
                message_id=f"msg-{task_id}-3",
                message_type=MessageType.TASK,
                sender="orchestrator",
                receiver="summary-001",
                task_id=task_id,
                timestamp=datetime.now(),
                payload={
                    "original_input": user_input,
                    "intermediate_results": target_result.payload
                }
            )

            if "summary-001" in self.agents:
                final_result = await self.agents["summary-001"].process(summary_msg)
            else:
                # 如果没有 Summary Agent，直接返回中间结果
                final_result = target_result

            self.task_states[task_id]["status"] = "completed"

            return {
                "task_id": task_id,
                "result": final_result.payload,
                "trace": self.task_states[task_id]["steps"]
            }

        except Exception as e:
            self.task_states[task_id]["status"] = "failed"
            self.task_states[task_id]["error"] = str(e)
            return {
                "task_id": task_id,
                "error": str(e),
                "trace": self.task_states[task_id]["steps"]
            }

    def _find_agent_by_name(self, name: str) -> str:
        """根据名称查找 Agent ID"""
        # 简化实现：名称与 ID 的映射
        mapping = {
            "knowledge-agent": "knowledge-001",
            "ticket-agent": "ticket-001",
            "summary-agent": "summary-001"
        }
        return mapping.get(name, name)

    async def health_check_all(self) -> Dict[str, bool]:
        """检查所有 Agent 健康状态"""
        results = {}
        for agent_id, agent in self.agents.items():
            results[agent_id] = await agent.health_check()
        return results
```

### 4.4 部署配置

#### Docker Compose 配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  chroma:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - chroma_data:/chroma/chroma

  orchestrator:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - REDIS_HOST=redis
      - CHROMA_HOST=chroma
    depends_on:
      - redis
      - chroma

volumes:
  redis_data:
  chroma_data:
```

#### Kubernetes 部署示例

```yaml
# k8s/agent-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orchestrator
spec:
  replicas: 2
  selector:
    matchLabels:
      app: orchestrator
  template:
    metadata:
      labels:
        app: orchestrator
    spec:
      containers:
      - name: orchestrator
        image: my-registry/orchestrator:latest
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: openai
        - name: REDIS_HOST
          value: "redis-service"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 30
---
apiVersion: v1
kind: Service
metadata:
  name: orchestrator
spec:
  selector:
    app: orchestrator
  ports:
  - port: 8080
    targetPort: 8080
```

---

## 五、最佳实践与注意事项

### 5.1 设计原则

#### 单一职责

每个 Agent 只负责一类任务：
- **好处**：便于测试、扩展、维护
- **误区**：大而全的 Agent 设计（难以调试、容易出错）

#### 接口标准化

统一消息格式和接口定义：
- 使用 JSON Schema 定义输入输出
- 统一错误码和错误消息格式
- 版本化管理接口变更

#### 幂等性设计

任务可重复执行，结果可预测：
- 使用唯一任务 ID
- 结果缓存避免重复计算
- 支持重试而不产生副作用

### 5.2 性能优化

#### 并行执行

识别可并行任务，使用异步编程：

```python
# 并行调用多个 Agent
results = await asyncio.gather(
    knowledge_agent.process(msg1),
    ticket_agent.process(msg2),
)
```

#### 缓存策略

- **结果缓存**：相同查询复用结果
- **中间状态缓存**：减少重复计算
- **LLM 响应缓存**：降低 API 调用成本

#### 批处理

- 批量请求合并
- 批量向量检索
- 批量 LLM 调用（部分 API 支持）

### 5.3 容错与恢复

#### 超时与重试

```python
# 指数退避重试
async def call_with_retry(agent, message, max_retries=3):
    for i in range(max_retries):
        try:
            result = await asyncio.wait_for(
                agent.process(message),
                timeout=30.0
            )
            return result
        except asyncio.TimeoutError:
            if i < max_retries - 1:
                await asyncio.sleep(2 ** i)  # 1s, 2s, 4s
            else:
                raise
```

#### 降级策略

- 关键路径：必须有备份方案
- 非关键 Agent 故障时：跳过或返回简化结果
- 整体降级：返回「系统繁忙，请稍后重试」

### 5.4 安全考量

#### 认证与授权

- Agent 身份验证（API Key、JWT）
- 任务权限控制（谁可以调用哪个 Agent）
- 敏感数据隔离

#### 数据安全

- 传输加密（HTTPS、TLS）
- 敏感信息脱敏
- 审计日志记录

#### 防护措施

- 输入验证（防止注入攻击）
- 输出过滤（防止泄露）
- 资源限制（防止滥用）

---

## 六、进阶话题

### 6.1 动态 Agent 发现与注册

- 服务网格（Istio、Linkerd）自动发现
- Agent 能力广播（定期发布 Agent Card）
- 自动负载均衡（基于 Agent 能力和负载）

### 6.2 跨域协作

- 不同组织/租户的 Agent 互联
- 联邦学习与知识共享
- 隐私计算（数据不出域）

### 6.3 Agent 自主决策

- 目标驱动的任务分解（Agent 自行规划）
- 自我反思与优化（复盘并改进）
- 学习与进化（从历史任务中学习）

### 6.4 与 LLM 服务集成

- 多模型切换（根据任务选择合适模型）
- 成本优化（使用更便宜的模型处理简单任务）
- 延迟控制（就近部署、预热缓存）

---

## 七、总结

### 协议选型建议

| 场景 | 推荐协议 |
|------|----------|
| 工具集成、能力暴露 | MCP |
| Agent 间直接协作 | A2A |
| 复杂工作流编排 | LangGraph |
| 对话式协作 | AutoGen |
| 角色分工场景 | CrewAI |

### 架构选型建议

| Agent 数量 | 推荐架构 |
|------------|----------|
| <5 | 内存模式 + LangGraph/AutoGen |
| 5-20 | 中心编排 + HTTP/消息队列 |
| >20 | 去中心化 + 服务网格 |

### 实践建议

1. **从小规模 MVP 开始**：先验证单 Agent 到双 Agent 协作，再扩展
2. **标准化消息协议**：统一格式减少对接成本
3. **建立监控体系**：分布式追踪、指标监控、日志聚合
4. **重视容错设计**：超时、重试、降级必不可少
5. **持续优化成本**：缓存、批处理、模型选择

---

## 参考资料

- [Model Context Protocol - Anthropic](https://modelcontextprotocol.io/)
- [A2A Protocol - Google](https://github.com/google/A2A)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [AutoGen - Microsoft](https://microsoft.github.io/autogen/)
- [CrewAI Documentation](https://docs.crewai.com/)
- [OpenTelemetry](https://opentelemetry.io/)