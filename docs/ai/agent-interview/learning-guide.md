---
order: 2
---

# Agent 开发学习指南

> 本指南针对已有 LLM 基础、偏好 Java 技术栈的开发者，系统性地覆盖 Agent 开发核心知识点，助力面试准备与实战项目开发。

---

## 学习路线概览

```
第1周：Agent 核心概念与 Prompt Engineering 深入
第2周：RAG（检索增强生成）原理与实践
第3周：Function Calling 与工具调用机制
第4周：Agent 框架与 MCP 协议
第5周：Agent 评估与优化
第6周：实战项目开发
```

---

## 第1周：Agent 核心概念与 Prompt Engineering 深入

### 学习目标
- 理解 Agent 的定义、架构与核心组件
- 掌握高级 Prompt Engineering 技术技巧
- 了解主流 Agent 类型与应用场景

### Agent 架构理解

```
┌──────────────────────────────────────┐
│              Agent Core               │
├──────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌───────┐  │
│  │ Memory  │  │ Planner │  │ Tools │  │
│  └─────────┘  └─────────┘  └───────┘  │
├──────────────────────────────────────┤
│           Execution Loop             │
│  感知 → 规划 → 行动 → 观察 → 反思   │
└──────────────────────────────────────┘
```

**核心组件**：

| 组件 | 功能 | 实现方式 |
|------|------|----------|
| Memory | 状态保存、历史记录 | 短期记忆（对话上下文）、长期记忆（向量存储） |
| Planner | 任务分解、路径规划 | CoT、ReAct、Plan-and-Execute |
| Tools | 外部能力扩展 | API调用、文件操作、数据库查询 |

### Prompt Engineering 高级技巧

| 技巧 | 说明 | 示例 |
|------|------|------|
| **System Prompt 设计** | 定义 Agent 角色和行为边界 | "你是一个Java代码审查助手..." |
| **CoT（思维链）** | 引导模型逐步推理 | "让我们一步步分析这个问题..." |
| **ReAct** | 推理+行动循环 | Thought → Action → Observation |
| **Few-shot** | 提供示例引导输出 | 输入输出示例对 |
| **结构化输出** | 强制 JSON/XML 格式 | 使用 JSON Schema 约束 |

### Agent 类型对比

| 类型 | 特点 | 代表框架 |
|------|------|----------|
| **对话型 Agent** | 多轮对话、上下文管理 | ChatGPT、Claude |
| **任务型 Agent** | 目标驱动、工具调用 | AutoGPT、BabyAGI |
| **协作型 Agent** | 多Agent分工协作 | AutoGen、LangGraph |
| **自主型 Agent** | 自我反思、持续优化 | MetaGPT |

### 实践任务
- 使用 Claude API 实现一个简单的对话 Agent
- 设计并测试不同 System Prompt 的效果
- 实现 ReAct 模式的推理循环

### 相关资源
- [Prompt 工程](/ai/prompt-engineering)
- [思维链推理 (Chain-of-Thought)](/ai/chain-of-thought-reasoning)
- [上下文工程](/ai/context-engineering)

---

## 第2周：RAG（检索增强生成）原理与实践

### 学习目标
- 理解 RAG 的核心原理与流程
- 掌握文档处理、向量检索、上下文组装技术
- 了解 RAG 优化策略（混合检索、重排序、查询改写）

### RAG 核心流程

```
用户查询 → Embedding → 向量检索 → 上下文组装 → LLM 生成
    ↓
文档库 → 切分 → Embedding → 向量存储
```

### 核心组件详解

| 组件 | 说明 | 技术选型 |
|------|------|----------|
| **文档切分** | 将长文档切分为小块 | 固定长度、语义切分、递归切分 |
| **Embedding 模型** | 文本向量化 | OpenAI Embedding、本地模型（BGE、M3E） |
| **向量数据库** | 存储和检索向量 | Milvus、Pinecone、Pgvector、Redis |
| **LLM 生成** | 基于上下文回答 | Claude、GPT-4、开源模型 |

### RAG 优化策略

```java
// 混合检索（向量 + 关键词）
public List<Document> hybridSearch(String query) {
    List<Document> vectorResults = vectorStore.similaritySearch(query, 5);
    List<Document> keywordResults = elasticsearch.search(query, 5);
    // RRF 融合排序
    return rrfMerge(vectorResults, keywordResults);
}

// 查询改写
public String rewriteQuery(String originalQuery) {
    // 扩展同义词、纠正拼写、消除歧义
    return llm.generate("请改写查询：" + originalQuery);
}
```

### 实践任务
- 使用 LangChain Java 实现基础 RAG 系统
- 对比不同切分策略的效果
- 实现混合检索（向量 + BM25）

### 相关资源
- [RAG（检索增强生成）](/ai/rag)
- [向量嵌入 (Vector Embedding)](/ai/vector-embedding)
- [文本相似度计算](/ai/similarity-metrics)

---

## 第3周：Function Calling 与工具调用机制

### 学习目标
- 理解 Function Calling 的核心原理
- 掌握工具定义与执行流程
- 实现多工具编排的 Agent

### Function Calling 流程

```
用户请求 → LLM决策 → 工具调用 → 结果返回 → LLM生成
    ↓           ↓           ↓
  理解意图   选择工具     执行工具
```

### 工具定义规范

```java
// 工具定义示例
@Tool(description = "获取指定城市的天气信息")
public WeatherInfo getWeather(
    @Param(description = "城市名称") String city,
    @Param(description = "温度单位", required = false) String unit
) {
    return weatherService.query(city, unit);
}
```

工具 Schema 定义（JSON 格式）：

```json
{
    "name": "get_weather",
    "description": "获取指定城市的天气信息",
    "parameters": {
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "城市名称"},
            "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
        },
        "required": ["city"]
    }
}
```

### Agent 执行循环

```java
public String agentLoop(String userQuery) {
    List<Message> messages = new ArrayList<>();
    messages.add(new UserMessage(userQuery));

    while (true) {
        // 1. LLM 决策
        ChatResponse response = llm.chat(messages, tools);

        // 2. 检查是否需要调用工具
        if (response.hasToolCalls()) {
            for (ToolCall call : response.getToolCalls()) {
                // 3. 执行工具
                String result = executeTool(call.getName(), call.getArguments());
                // 4. 将结果加入上下文
                messages.add(new ToolResultMessage(call.getId(), result));
            }
            continue;
        }

        // 5. 返回最终答案
        return response.getContent();
    }
}
```

### 实践任务
- 使用 Claude API 实现 Function Calling
- 定义 3-5 个实用工具（天气、搜索、数据库查询）
- 实现工具链式调用场景

### 相关资源
- [工具使用 (Tool Use)](/ai/tool-use)
- [Agent Skills](/ai/agent-skills)

---

## 第4周：Agent 框架与 MCP 协议

### 学习目标
- 了解主流 Agent 框架及其特点
- 理解 MCP（Model Context Protocol）协议
- 掌握 Agent 记忆管理技术

### 主流 Agent 框架对比

| 框架 | 语言 | 特点 | 适用场景 |
|------|------|------|----------|
| **LangChain** | Python/JS | 模块化、生态丰富 | 快速构建原型 |
| **LangChain Java** | Java | Java 技术栈适配 | 企业级应用 |
| **AutoGen** | Python | 多Agent协作 | 复杂任务分解 |
| **LangGraph** | Python | 状态图编排 | 流程控制场景 |
| **Semantic Kernel** | C#/Python | 微软生态集成 | 企业级应用 |
| **Spring AI** | Java | Spring 生态集成 | Java 企业开发 |

### MCP 协议理解

```
┌─────────────────────────────────────────┐
│              MCP Host (Claude Desktop)   │
└─────────────────────┬───────────────────┘
                      │
              ┌───────┴───────┐
              │  MCP Client   │
              └───────┬───────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───┴───┐        ┌────┴────┐       ┌────┴────┐
│ MCP   │        │ MCP     │       │ MCP     │
│ Server│        │ Server  │       │ Server  │
│ (FS)  │        │ (DB)    │       │ (API)   │
└───────┘        └─────────┘       └─────────┘
```

**核心概念**：

| 概念 | 说明 |
|------|------|
| **Resources** | 只读数据源（文件、数据库记录） |
| **Tools** | 可执行操作（API 调用、文件操作） |
| **Prompts** | 预定义的提示模板 |
| **Sampling** | LLM 采样请求 |

### Memory 管理策略

| 类型 | 说明 | 实现方式 |
|------|------|----------|
| **短期记忆** | 当前对话上下文 | 消息列表、滑动窗口 |
| **长期记忆** | 跨会话持久化 | 向量数据库、关系数据库 |
| **工作记忆** | 当前任务状态 | 状态机、执行栈 |

### 实践任务
- 学习 Spring AI 基础用法
- 实现一个带记忆管理的 Agent
- 了解 MCP Server 开发

### 相关资源
- [MCP（Model Context Protocol）](/ai/mcp)
- [Agent 开发](/ai/agent-development)

---

## 第5周：Agent 评估与优化

### 学习目标
- 理解 Agent 评估维度与方法
- 掌握常见优化策略
- 了解生产级 Agent 的挑战

### 评估维度

| 维度 | 指标 | 说明 |
|------|------|------|
| **准确性** | 任务完成率 | 正确完成任务的比例 |
| **效率** | 平均步数、平均耗时 | 完成任务所需的资源 |
| **成本** | Token 消耗、API 调用次数 | 运行成本 |
| **稳定性** | 错误率、重试率 | 异常处理能力 |
| **安全性** | 越狱率、有害输出率 | 安全合规指标 |

### 评估方法

```java
// LLM-as-Judge 评估
public EvaluationResult evaluate(String task, String output, String groundTruth) {
    String prompt = """
        请评估以下回答的质量：
        任务：%s
        回答：%s
        标准答案：%s

        从以下维度评分（1-5分）：
        1. 准确性  2. 完整性  3. 相关性
        """.formatted(task, output, groundTruth);

    return llm.evaluate(prompt);
}
```

### 优化策略

| 问题 | 解决方案 |
|------|----------|
| Token 消耗过高 | 上下文压缩、摘要技术 |
| 工具选择错误 | 工具描述优化、Few-shot 示例 |
| 任务执行失败 | 分步验证、错误重试机制 |
| 响应延迟过长 | 并行工具调用、流式输出 |
| 上下文丢失 | 记忆持久化、关键信息提取 |

### 实践任务
- 实现自动化评估脚本
- 对比不同 Agent 策略的效果
- 优化一个 Agent 的 Token 消耗

---

## 第6周：实战项目开发

### 学习目标
- 完成一个完整的 Agent 项目
- 深入理解 Agent 开发全流程
- 为面试准备项目经验素材

### 项目选择建议

#### 项目1：智能代码审查 Agent（推荐）
- **功能**：分析 Java 代码，识别问题并提供修复建议
- **技术栈**：Spring AI + Claude API + Git 工具
- **核心能力**：代码静态分析、问题识别与分类、修复建议生成

#### 项目2：电商商家助手 Agent
- **功能**：帮助商家进行商品管理、数据分析
- **技术栈**：LangChain Java + RAG + 多工具调用
- **核心能力**：商品信息查询、销售数据分析、营销建议生成

#### 项目3：知识库问答 Agent
- **功能**：基于企业文档库回答问题
- **技术栈**：RAG + 向量数据库 + Function Calling
- **核心能力**：文档索引与检索、混合检索优化、答案生成与引用

### 项目开发流程

```
1. 需求分析 → 定义 Agent 能力边界
2. 工具设计 → 确定需要的工具/API
3. Prompt 设计 → 编写 System Prompt
4. 架构实现 → 搭建 Agent 核心逻辑
5. 测试评估 → 功能测试与效果评估
6. 优化迭代 → 根据反馈改进
```

---

## 面试准备要点

### 必答知识点
1. Agent 架构组成（Memory、Planner、Tools）
2. RAG 原理与优化策略
3. Function Calling 执行流程
4. MCP 协议核心概念
5. Agent 评估维度与方法
6. Prompt Engineering 高级技巧

### 项目经验准备（STAR 法则）
- **Situation**：项目背景和挑战
- **Task**：你的任务和目标
- **Action**：具体的技术方案和实施
- **Result**：最终效果和数据指标

### 推荐面试题库
- [AI Agent 开发工程师模拟面试题](/others/interview/ai-agent-interview-questions)（30题完整版）

---

## 学习资源汇总

### 官方文档
- Anthropic Claude API 文档
- OpenAI API 文档
- Spring AI 官方文档
- LangChain 文档

### 实践工具
- Claude Code（命令行 AI 编程助手）
- Cursor（AI 代码编辑器）
- LangSmith（Agent 评估平台）

### 相关文章
- [Claude Code 使用技巧](/ai/claude-code-tips)
- [Ollama 本地模型部署](/ai/ollama)

---

> 💡 **建议**：每周完成实践任务并记录学习笔记，第6周完成一个完整项目，使用面试题库进行自测。