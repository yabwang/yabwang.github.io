---
order: 14
---

# LangChain 开发实战指南

> 📅 主题：核心组件、开发流程与生产实践

## 一、LangChain 是什么

**LangChain** 是一个用于开发 LLM 应用程序的框架，它提供了一套标准化的组件和抽象，帮助开发者快速构建：

- **聊天应用**：多轮对话、上下文管理
- **RAG 系统**：检索增强生成、知识问答
- **Agent 应用**：工具调用、任务自动化
- **工作流编排**：多步骤任务、状态管理

**核心价值**：

| 价值点 | 说明 |
|--------|------|
| **标准化抽象** | 统一的组件接口，模型无关 |
| **生态丰富** | 支持 OpenAI、Anthropic、本地模型等 |
| **可组合** | 灵活组合组件构建复杂应用 |
| **可观测** | 内置追踪、调试、评估能力 |

---

## 二、LangChain 核心架构

### 2.1 架构概览

```
┌─────────────────────────────────────────────────────┐
│                    Application                       │
├─────────────────────────────────────────────────────┤
│  Chains  │  Agents  │  RAG  │  Memory  │  Tools    │
├─────────────────────────────────────────────────────┤
│              LangChain Core (LCEL)                   │
├─────────────────────────────────────────────────────┤
│  Model IO  │  Retrieval  │  Tools  │  Memory       │
├─────────────────────────────────────────────────────┤
│               LangChain Integrations                 │
│   OpenAI  │  Anthropic  │  HuggingFace  │  Others   │
└─────────────────────────────────────────────────────┘
```

### 2.2 核心组件

| 组件 | 作用 | 关键类/模块 |
|------|------|-------------|
| **Models** | LLM 和聊天模型 | `ChatOpenAI`, `ChatAnthropic` |
| **Prompts** | 提示词模板 | `PromptTemplate`, `ChatPromptTemplate` |
| **Output Parsers** | 输出解析 | `StrOutputParser`, `JsonOutputParser` |
| **Retrievers** | 文档检索 | `VectorStoreRetriever` |
| **Tools** | 外部工具 | `Tool`, `StructuredTool` |
| **Agents** | 智能决策 | `create_react_agent` |
| **Memory** | 上下文管理 | `RunnableWithMessageHistory` |
| **Chains** | 流程编排 | LCEL (`Runnable` 接口) |

---

## 三、LCEL：LangChain Expression Language

LCEL 是 LangChain 的核心，提供声明式的组件组合语法。

### 3.1 Runnable 接口

所有组件都实现了 `Runnable` 接口，统一了调用方式：

```python
from langchain_core.runnables import Runnable

# 所有组件都支持这些方法
 runnable.invoke(input)        # 同步调用
 runnable.stream(input)        # 流式输出
 runnable.batch([inputs])      # 批量调用
 runnable.ainvoke(input)       # 异步调用
 runnable.astream(input)       # 异步流式
```

### 3.2 链式组合

**基本组合操作符**：

| 操作符 | 作用 | 示例 |
|--------|------|------|
| `|` | 管道，顺序执行 | `prompt | llm | parser` |
| `+` | 合并输出 | `RunnableLambda(lambda x: x + "!")` |
| `{}` | 并行分支 | `{"a": chain1, "b": chain2}` |

**示例：简单的对话链**

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# 定义组件
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个有用的助手，用简洁的语言回答问题。"),
    ("human", "{question}")
])

llm = ChatOpenAI(model="gpt-4o-mini")
parser = StrOutputParser()

# 组合成链
chain = prompt | llm | parser

# 调用
response = chain.invoke({"question": "什么是 RAG？"})
print(response)
```

### 3.3 并行分支

```python
from langchain_core.runnables import RunnableParallel

# 并行执行多个任务
parallel_chain = RunnableParallel(
    summary=prompt | llm | parser,
    keywords=RunnableLambda(lambda x: extract_keywords(x)),
)

result = parallel_chain.invoke({"question": "介绍一下 Python"})
print(result["summary"])
print(result["keywords"])
```

### 3.4 条件分支

```python
from langchain_core.runnables import RunnableBranch

# 根据输入选择不同分支
branch = RunnableBranch(
    # 条件1：技术问题
    (lambda x: "技术" in x["topic"], tech_chain),
    # 条件2：生活问题
    (lambda x: "生活" in x["topic"], life_chain),
    # 默认分支
    default_chain,
)

result = branch.invoke({"topic": "技术", "question": "如何学习 Python？"})
```

### 3.5 流式输出

```python
# 流式输出，实时展示生成内容
for chunk in chain.stream({"question": "写一首关于春天的诗"}):
    print(chunk, end="", flush=True)
```

---

## 四、核心组件详解

### 4.1 Models（模型）

**聊天模型（推荐）**：

```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic

# OpenAI
llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.7,
    max_tokens=1000,
)

# Anthropic Claude
llm = ChatAnthropic(
    model="claude-3-5-sonnet-20241022",
    temperature=0.7,
)

# 本地模型（通过 Ollama）
from langchain_ollama import ChatOllama
llm = ChatOllama(model="llama3.2")
```

**模型调用**：

```python
from langchain_core.messages import HumanMessage, SystemMessage

# 基础调用
response = llm.invoke([
    SystemMessage(content="你是一个代码助手"),
    HumanMessage(content="写一个 Python 函数计算斐波那契数")
])

# 带图片的多模态调用
from langchain_core.messages import HumanMessage
response = llm.invoke([
    HumanMessage(
        content=[
            {"type": "text", "text": "描述这张图片"},
            {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}
        ]
    )
])
```

### 4.2 Prompts（提示词模板）

**ChatPromptTemplate**：

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# 基础模板
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个{role}，帮助用户解决{domain}问题。"),
    ("human", "{question}"),
])

# 带历史消息的模板（用于多轮对话）
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个有用的助手。"),
    MessagesPlaceholder(variable_name="history"),  # 历史消息
    ("human", "{question}"),
])
```

**Few-shot 示例**：

```python
from langchain_core.prompts import FewShotChatMessagePromptTemplate

# 定义示例
examples = [
    {"input": "开心", "output": "😊 开心是一种积极向上的情绪"},
    {"input": "难过", "output": "😢 难过时可以找朋友倾诉"},
]

example_prompt = ChatPromptTemplate.from_messages([
    ("human", "{input}"),
    ("ai", "{output}"),
])

few_shot_prompt = FewShotChatMessagePromptTemplate(
    example_prompt=example_prompt,
    examples=examples,
)

# 组合到主模板
final_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个情绪分析助手。"),
    few_shot_prompt,
    ("human", "{input}"),
])
```

### 4.3 Output Parsers（输出解析器）

**字符串解析器**：

```python
from langchain_core.output_parsers import StrOutputParser

parser = StrOutputParser()
# 直接返回字符串
```

**JSON 解析器**：

```python
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

# 定义输出结构
class Person(BaseModel):
    name: str = Field(description="人名")
    age: int = Field(description="年龄")
    hobbies: list[str] = Field(description="爱好列表")

parser = JsonOutputParser(pydantic_object=Person)

# 带解析指令的提示词
prompt = ChatPromptTemplate.from_messages([
    ("system", "提取人物信息。\n{format_instructions}"),
    ("human", "{text}"),
])

# 自动注入格式指令
prompt = prompt.partial(format_instructions=parser.get_format_instructions())

chain = prompt | llm | parser
result = chain.invoke({"text": "张三今年25岁，喜欢读书和跑步"})
# 输出：{"name": "张三", "age": 25, "hobbies": ["读书", "跑步"]}
```

**Pydantic 解析器（结构化输出）**：

```python
from langchain_core.output_parsers import PydanticOutputParser

parser = PydanticOutputParser(pydantic_object=Person)
# 返回 Pydantic 对象，而非字典
```

### 4.4 Retrievers（检索器）

**向量检索器**：

```python
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document

# 创建向量库
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(
    documents=[
        Document(page_content="Python 是一种编程语言", metadata={"source": "doc1"}),
        Document(page_content="RAG 是检索增强生成", metadata={"source": "doc2"}),
    ],
    embedding=embeddings,
)

# 创建检索器
retriever = vectorstore.as_retriever(
    search_type="similarity",  # 或 "mmr"（多样性检索）
    search_kwargs={"k": 3},    # 返回 top 3
)

# 检索
docs = retriever.invoke("什么是 Python？")
```

**自定义检索器**：

```python
from langchain_core.retrievers import BaseRetriever
from langchain_core.documents import Document

class CustomRetriever(BaseRetriever):
    def _get_relevant_documents(self, query: str) -> list[Document]:
        # 自定义检索逻辑
        # 可以调用 API、搜索引擎、数据库等
        return [
            Document(page_content=f"关于 {query} 的内容", metadata={"source": "custom"})
        ]
```

### 4.5 Memory（记忆/历史管理）

**RunnableWithMessageHistory（推荐）**：

```python
from langchain_core.runnables import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_community.chat_message_histories.in_memory import InMemoryChatMessageHistory

# 存储历史的字典
store = {}

def get_session_history(session_id: str) -> ChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

# 带历史管理的链
chain_with_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="question",
    history_messages_key="history",
)

# 多轮对话
response1 = chain_with_history.invoke(
    {"question": "我叫张三"},
    config={"configurable": {"session_id": "user-1"}}
)

response2 = chain_with_history.invoke(
    {"question": "我叫什么？"},
    config={"configurable": {"session_id": "user-1"}}
)
# 会记住之前说过的名字
```

---

## 五、RAG 开发实战

### 5.1 基础 RAG 链

```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# 1. 准备数据
documents = [
    Document(page_content="LangChain 是 LLM 应用开发框架"),
    Document(page_content="RAG 结合检索和生成提升回答质量"),
    Document(page_content="Vector Database 存储文档的向量表示"),
]

# 2. 创建向量库和检索器
vectorstore = Chroma.from_documents(documents, OpenAIEmbeddings())
retriever = vectorstore.as_retriever(k=2)

# 3. 定义 RAG 提示词
rag_prompt = ChatPromptTemplate.from_messages([
    ("system", "使用以下上下文回答问题。如果上下文没有相关信息，请说不知道。\n\n上下文：{context}"),
    ("human", "{question}"),
])

# 4. 构建 RAG 链
llm = ChatOpenAI(model="gpt-4o-mini")

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | rag_prompt
    | llm
    | StrOutputParser()
)

# 5. 查询
response = rag_chain.invoke("什么是 LangChain？")
print(response)
```

### 5.2 进阶 RAG：添加检索评分

```python
from langchain_core.runnables import RunnableParallel

# 并行获取检索结果和原始问题
rag_chain_with_scores = RunnableParallel(
    answer=(
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | rag_prompt
        | llm
        | StrOutputParser()
    ),
    docs=retriever,
)

result = rag_chain_with_scores.invoke("什么是 RAG？")
print(result["answer"])
print(f"引用文档数：{len(result['docs'])}")
```

---

## 六、Agent 开发实战

### 6.1 ReAct Agent

```python
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain.agents import create_react_agent, AgentExecutor
from langchain import hub

# 定义工具
@tool
def search(query: str) -> str:
    """搜索网络获取信息"""
    return f"搜索结果：{query}"

@tool
def calculate(expression: str) -> str:
    """计算数学表达式"""
    return str(eval(expression))

# 创建 Agent
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
tools = [search, calculate]
prompt = hub.pull("hwchase17/react")

agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# 执行任务
result = agent_executor.invoke({
    "input": "搜索 LangChain 的最新版本号，然后计算 10 * 5"
})
```

### 6.2 LangGraph Agent（推荐）

LangGraph 提供更灵活的 Agent 编排：

```python
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, ToolMessage
from typing import TypedDict, Annotated, Sequence
import operator

# 定义状态
class State(TypedDict):
    messages: Annotated[Sequence, operator.add]

# 定义工具
@tool
def get_weather(city: str) -> str:
    """获取城市天气"""
    return f"{city}：晴天，20°C"

tools = [get_weather]
tool_map = {t.name: t for t in tools}

# 创建 LLM
llm = ChatOpenAI(model="gpt-4o-mini")
llm_with_tools = llm.bind_tools(tools)

# 定义节点
def agent(state: State) -> State:
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}

def tools_node(state: State) -> State:
    last = state["messages"][-1]
    results = []
    for call in last.tool_calls:
        tool = tool_map[call["name"]]
        result = tool.invoke(call["args"])
        results.append(ToolMessage(content=result, tool_call_id=call["id"]))
    return {"messages": results}

def should_continue(state: State) -> str:
    if state["messages"][-1].tool_calls:
        return "tools"
    return END

# 构建图
graph = StateGraph(State)
graph.add_node("agent", agent)
graph.add_node("tools", tools_node)
graph.set_entry_point("agent")
graph.add_conditional_edges("agent", should_continue)
graph.add_edge("tools", "agent")

# 运行
app = graph.compile()
result = app.invoke({"messages": [HumanMessage(content="北京天气怎么样？")]})
print(result["messages"][-1].content)
```

---

## 七、生产实践要点

### 7.1 错误处理

```python
from langchain_core.runnables import RunnableConfig

# 配置重试和超时
config = RunnableConfig(
    max_concurrency=5,
    timeouts={"llm": 30},  # 30秒超时
)

# 使用 try-catch
try:
    result = chain.invoke(input, config=config)
except Exception as e:
    # 降级处理
    result = fallback_chain.invoke(input)
```

### 7.2 流式输出（提升用户体验）

```python
async def stream_response(question: str):
    async for chunk in chain.astream({"question": question}):
        yield chunk

# 配合 FastAPI 返回 SSE
from fastapi.responses import StreamingResponse

@app.post("/chat")
async def chat(request: ChatRequest):
    return StreamingResponse(
        stream_response(request.question),
        media_type="text/event-stream"
    )
```

### 7.3 可观测性（LangSmith）

```python
import os

# 配置 LangSmith 追踪
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "your-api-key"
os.environ["LANGCHAIN_PROJECT"] = "my-project"

# 所有调用会自动记录到 LangSmith
```

### 7.4 部署建议

| 场景 | 部署方式 |
|------|----------|
| 开发调试 | 本地 Python 直接运行 |
| API 服务 | FastAPI + Uvicorn |
| 生产部署 | Docker + Kubernetes |
| 大规模 | 分布式队列（Celery/RabbitMQ） |

---

## 八、LangChain vs 其他框架

| 维度 | LangChain | LlamaIndex | Haystack |
|------|-----------|------------|----------|
| **定位** | 通用 LLM 应用框架 | RAG 专项 | 搜索 + NLP |
| **优势** | 组件丰富、生态庞大 | RAG 优化好 | 生产级搜索 |
| **适用场景** | Agent、对话、工作流 | 知识问答 | 企业搜索 |
| **学习曲线** | 中等 | 较低 | 中等 |

---

## 九、总结

1. **LangChain 核心**：LCEL 提供声明式组件组合，`Runnable` 接口统一调用方式
2. **主要组件**：Models、Prompts、Output Parsers、Retrievers、Tools、Agents、Memory
3. **RAG 开发**：检索器 + 提示词 + LLM 组合链，可添加评分、引用等增强
4. **Agent 开发**：ReAct 经典模式，LangGraph 提供更灵活的编排
5. **生产要点**：错误处理、流式输出、可观测性、合理部署

---

## 参考资料

- [LangChain 官方文档](https://python.langchain.com/docs/)
- [LangGraph 文档](https://langchain-ai.github.io/langgraph/)
- [LangSmith 可观测平台](https://smith.langchain.com/)
- [LangChain GitHub](https://github.com/langchain-ai/langchain)