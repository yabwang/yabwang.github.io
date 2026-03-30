---
order: 13
---

# LangChain 调用外部工具实战

> 📅 主题：Tools、Function Calling、MCP 集成与 Agent 工作流

## 一、为什么 Agent 需要调用外部工具

LLM 本身只能「说话」，无法执行实际操作。要让 Agent 有实际能力，必须让它调用外部工具：

| Agent 能力 | 需要的工具 |
|------------|-----------|
| 查询天气 | 天气 API |
| 搜索文档 | 搜索引擎 / RAG |
| 执行代码 | Python 解释器 / Shell |
| 操作数据库 | SQL 执行器 |
| 读写文件 | 文件系统接口 |
| 发送消息 | Slack / Email API |

LangChain 提供了完整的「工具定义 → 工具调用 → 结果处理」链路。

---

## 二、LangChain 工具体系

### 2.1 核心概念

| 概念 | 说明 |
|------|------|
| **Tool** | 工具定义：名称、描述、输入 schema、执行函数 |
| **Tool Calling** | LLM 决定调用哪个工具、传什么参数 |
| **Tool Execution** | LangChain 执行工具并获取结果 |
| **Tool Message** | 工具执行结果反馈给 LLM |

### 2.2 工具定义方式

**方式一：@tool 装饰器（最简洁）**

```python
from langchain_core.tools import tool

@tool
def get_weather(city: str) -> str:
    """查询指定城市的天气信息

    Args:
        city: 城市名称，如 '北京'、'上海'

    Returns:
        天气描述字符串
    """
    # 实际场景中会调用天气 API
    # 这里简化返回模拟数据
    weather_data = {
        "北京": "晴天，温度 15°C",
        "上海": "多云，温度 18°C",
        "广州": "小雨，温度 22°C",
    }
    return weather_data.get(city, f"未找到 {city} 的天气信息")
```

**方式二：StructuredTool（更灵活）**

```python
from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

class CalculatorInput(BaseModel):
    a: float = Field(description="第一个数字")
    b: float = Field(description="第二个数字")
    operation: str = Field(description="运算类型：add/subtract/multiply/divide")

def calculator_func(a: float, b: float, operation: str) -> float:
    if operation == "add":
        return a + b
    elif operation == "subtract":
        return a - b
    elif operation == "multiply":
        return a * b
    elif operation == "divide":
        return a / b if b != 0 else float('inf')
    else:
        raise ValueError(f"未知运算类型: {operation}")

calculator_tool = StructuredTool(
    name="calculator",
    description="执行基本数学运算",
    func=calculator_func,
    args_schema=CalculatorInput,
)
```

**方式三：从函数创建**

```python
from langchain_core.tools import Tool

def search_docs(query: str) -> str:
    """搜索文档库"""
    # 调用 RAG 或搜索引擎
    return f"搜索结果：{query} 相关文档..."

search_tool = Tool(
    name="search_docs",
    description="搜索内部文档库，输入查询关键词",
    func=search_docs,
)
```

---

## 三、完整 Agent 示例

### 3.1 简单工具调用

```python
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage

# 定义工具
@tool
def get_current_time() -> str:
    """获取当前时间"""
    from datetime import datetime
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

@tool
def calculate(expression: str) -> float:
    """计算数学表达式，如 '2 + 3' 或 '10 * 5'"""
    return eval(expression)

# 创建 LLM 并绑定工具
llm = ChatOpenAI(model="gpt-4o-mini")
tools = [get_current_time, calculate]
llm_with_tools = llm.bind_tools(tools)

# 发送消息
response = llm_with_tools.invoke([
    HumanMessage(content="现在几点了？顺便帮我算一下 25 * 4")
])

print(response)
```

### 3.2 ReAct Agent（推理 + 行动）

ReAct 是经典的 Agent 模式：先推理要做什么，再行动执行工具，观察结果后继续推理。

```python
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain.agents import create_react_agent, AgentExecutor
from langchain import hub

# 定义多个工具
@tool
def search_web(query: str) -> str:
    """搜索网络获取信息"""
    # 实际场景调用搜索 API
    return f"搜索结果：关于 {query} 的信息..."

@tool
def get_weather(city: str) -> str:
    """查询城市天气"""
    return f"{city} 今天晴天，温度 20°C"

@tool
def save_note(content: str) -> str:
    """保存笔记到本地"""
    with open("notes.txt", "a") as f:
        f.write(content + "\n")
    return "笔记已保存"

# 创建 Agent
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
tools = [search_web, get_weather, save_note]

# 使用预定义的 ReAct prompt
prompt = hub.pull("hwchase17/react")
agent = create_react_agent(llm, tools, prompt)

# 创建执行器
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,  # 显示执行过程
    handle_parsing_errors=True,
)

# 执行任务
result = agent_executor.invoke({
    "input": "帮我查一下北京的天气，然后把结果保存为笔记"
})

print(result["output"])
```

执行过程输出：

```
> Entering new AgentExecutor chain...
Thought: 用户想查询北京天气并保存。我需要：
1. 先用 get_weather 查询天气
2. 再用 save_note 保存结果

Action: get_weather
Action Input: 北京
Observation: 北京 今天晴天，温度 20°C
Thought: 已获取天气信息，现在保存笔记

Action: save_note
Action Input: 北京天气：晴天，温度 20°C
Observation: 笔记已保存
Thought: 任务完成

Final Answer: 已查询到北京今天晴天，温度 20°C，并已保存为笔记。
```

### 3.3 LangGraph 编排（推荐）

LangGraph 是 LangChain 推出的新一代 Agent 编排框架，比传统 AgentExecutor 更灵活。

```python
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, ToolMessage
from typing import TypedDict, Annotated, Sequence
import operator

# 定义状态
class AgentState(TypedDict):
    messages: Annotated[Sequence[HumanMessage | ToolMessage], operator.add]

# 定义工具
@tool
def search_database(query: str) -> str:
    """查询数据库"""
    return f"数据库查询结果：{query} 相关记录..."

@tool
def send_email(to: str, content: str) -> str:
    """发送邮件"""
    return f"邮件已发送给 {to}"

tools = [search_database, send_email]
tool_map = {t.name: t for t in tools}

# 创建 LLM
llm = ChatOpenAI(model="gpt-4o-mini")
llm_with_tools = llm.bind_tools(tools)

# 定义节点函数
def agent_node(state: AgentState) -> AgentState:
    """Agent 推理节点"""
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}

def tool_node(state: AgentState) -> AgentState:
    """工具执行节点"""
    last_message = state["messages"][-1]
    tool_calls = last_message.tool_calls

    tool_messages = []
    for call in tool_calls:
        tool = tool_map[call["name"]]
        result = tool.invoke(call["args"])
        tool_messages.append(
            ToolMessage(content=str(result), tool_call_id=call["id"])
        )

    return {"messages": tool_messages}

def should_continue(state: AgentState) -> str:
    """判断是否继续调用工具"""
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return END

# 构建图
graph = StateGraph(AgentState)
graph.add_node("agent", agent_node)
graph.add_node("tools", tool_node)

graph.set_entry_point("agent")
graph.add_conditional_edges("agent", should_continue)
graph.add_edge("tools", "agent")

# 执行
app = graph.compile()
result = app.invoke({
    "messages": [HumanMessage(content="查询用户张三的信息，然后把结果发邮件给 admin@example.com")]
})

print(result["messages"][-1].content)
```

---

## 四、集成 MCP Server

LangChain 可以通过 `langchain-mcp-adapters` 连接外部 MCP Server，将 MCP 工具转为 LangChain Tool。

### 4.1 安装依赖

```bash
pip install langchain-mcp-adapters
```

### 4.2 连接 MCP Server

**stdio 方式（本地 MCP Server）：**

```python
from langchain_mcp_adapters import MCPToolkit
from langchain_openai import ChatOpenAI
from langchain.agents import create_react_agent, AgentExecutor
from langchain import hub

# 连接本地 MCP Server（以文件系统为例）
mcp_toolkit = MCPToolkit(
    command="npx",
    args=["-y", "@anthropic-ai/mcp-server-filesystem", "/tmp"]
)

# 启动 MCP 连接并获取工具
with mcp_toolkit as toolkit:
    tools = toolkit.get_tools()

    # 创建 Agent
    llm = ChatOpenAI(model="gpt-4o-mini")
    prompt = hub.pull("hwchase17/react")
    agent = create_react_agent(llm, tools, prompt)

    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

    result = agent_executor.invoke({
        "input": "帮我读取 /tmp/test.txt 文件的内容"
    })
    print(result["output"])
```

**SSE 方式（远程 MCP Server）：**

```python
from langchain_mcp_adapters import MCPToolkit

# 连接远程 MCP Server
mcp_toolkit = MCPToolkit(
    url="http://localhost:8080/sse",  # MCP Server 的 SSE 端点
)

with mcp_toolkit as toolkit:
    tools = toolkit.get_tools()
    print(f"可用工具: {[t.name for t in tools]}")
```

### 4.3 多 MCP Server 组合

```python
from langchain_mcp_adapters import MCPToolkit

# 同时连接多个 MCP Server
filesystem_toolkit = MCPToolkit(
    command="npx",
    args=["-y", "@anthropic-ai/mcp-server-filesystem", "/home/user/docs"]
)

github_toolkit = MCPToolkit(
    command="npx",
    args=["-y", "@anthropic-ai/mcp-server-github"]
)

# 合并所有工具
all_tools = []
with filesystem_toolkit as fs, github_toolkit as gh:
    all_tools.extend(fs.get_tools())
    all_tools.extend(gh.get_tools())

    # 创建 Agent 使用所有工具
    llm = ChatOpenAI(model="gpt-4o-mini")
    llm_with_tools = llm.bind_tools(all_tools)

    response = llm_with_tools.invoke([
        HumanMessage(content="读取 README.md，然后提交到 GitHub")
    ])
```

---

## 五、工具调用最佳实践

### 5.1 工具描述很重要

LLM 根据工具描述决定何时调用、传什么参数。描述要清晰、具体：

```python
@tool
def search_products(
    keyword: str,
    category: str = None,
    min_price: float = None,
    max_price: float = None,
) -> str:
    """搜索产品库

    Args:
        keyword: 搜索关键词（必填）
        category: 产品类别，可选值：electronics/clothing/books
        min_price: 最低价格筛选
        max_price: 最高价格筛选

    Returns:
        匹配的产品列表
    """
    # 实现搜索逻辑...
```

### 5.2 参数校验

```python
from pydantic import BaseModel, Field, validator

class SendEmailInput(BaseModel):
    to: str = Field(description="收件人邮箱地址")
    subject: str = Field(description="邮件主题")
    content: str = Field(description="邮件正文")

    @validator('to')
    def validate_email(cls, v):
        if '@' not in v:
            raise ValueError('邮箱格式不正确')
        return v

@tool(args_schema=SendEmailInput)
def send_email(to: str, subject: str, content: str) -> str:
    """发送邮件"""
    # 参数已通过 Pydantic 校验
    return f"邮件已发送给 {to}"
```

### 5.3 错误处理

```python
@tool
def query_database(sql: str) -> str:
    """执行 SQL 查询"""
    try:
        # 执行查询
        result = execute_sql(sql)
        return str(result)
    except Exception as e:
        # 返回友好错误信息，让 LLM 知道失败原因
        return f"查询失败: {str(e)}。请检查 SQL 语句是否正确。"
```

### 5.4 工具数量控制

- 单次请求建议 **≤10 个工具**，太多会降低 LLM 选择准确率
- 按场景分组，动态加载相关工具

```python
# 动态选择工具组
def get_tools_for_task(task_type: str) -> list:
    tool_groups = {
        "research": [search_web, search_docs],
        "coding": [read_file, write_file, execute_code],
        "communication": [send_email, send_slack],
    }
    return tool_groups.get(task_type, [])
```

---

## 六、常见问题

### Q1：LLM 不调用工具怎么办？

可能原因：
- 工具描述不够清晰，LLM 不知道何时用
- 提示词没有引导 LLM 使用工具
- 模型不支持 Function Calling

解决：
- 改进工具描述，加具体使用场景
- 在提示词中明确：「遇到 XX 任务时使用 XX 工具」
- 使用支持 Function Calling 的模型（GPT-4、Claude 3 等）

### Q2：工具调用参数错误？

可能原因：
- 参数 schema 定义不够清晰
- LLM 理解有偏差

解决：
- 用 Pydantic 详细定义每个参数的类型、默认值、描述
- 添加 `validator` 进行参数校验

### Q3：如何让 Agent 自主决定工具调用顺序？

LangGraph 的状态图模式最适合：
- 定义多个工具节点
- 用条件边（conditional_edges）决定流转方向
- LLM 根据中间结果决定下一步

---

## 七、总结

1. **LangChain 工具体系**：Tool → Tool Calling → Execution → Tool Message，形成闭环
2. **工具定义方式**：`@tool` 装饰器最简洁，StructuredTool 更灵活
3. **Agent 模式**：ReAct 经典但简单，LangGraph 更适合复杂编排
4. **MCP 集成**：通过 `langchain-mcp-adapters` 连接外部 MCP Server
5. **最佳实践**：描述清晰、参数校验、错误处理、工具数量控制

---

## 参考资料

- [LangChain Tools 官方文档](https://python.langchain.com/docs/concepts/tools/)
- [LangGraph 文档](https://langchain-ai.github.io/langgraph/)
- [langchain-mcp-adapters](https://github.com/langchain-ai/langchain-mcp-adapters)
- [MCP 官方文档](https://modelcontextprotocol.io/)
- [Function Calling 原理](https://platform.openai.com/docs/guides/function-calling)