# AI Agent 开发工程师模拟面试题

> 本套模拟面试题针对电商领域「AI Agent 开发工程师（商家&开放平台）」岗位设计，涵盖 Java 核心基础、分布式系统架构、AI Agent 技术体系、系统设计四大模块。

---

## 一、Java 核心基础

### 1. JVM 内存模型包含哪些区域？各区域的作用是什么？

**答案**：

JVM 内存模型主要包含以下区域：

| 区域 | 作用 | 线程共享 | 异常类型 |
|------|------|----------|----------|
| **堆 (Heap)** | 存储对象实例 | 是 | OutOfMemoryError |
| **方法区** | 存储类信息、常量、静态变量 | 是 | OutOfMemoryError |
| **虚拟机栈** | 方法调用链、局部变量表 | 否 | StackOverflowError |
| **本地方法栈** | Native 方法调用 | 否 | StackOverflowError |
| **程序计数器** | 当前执行的字节码行号 | 否 | 无 |

```java
// 示例：理解栈帧结构
public void method() {
    int a = 1;          // 局部变量表
    Object obj = new Object();  // obj 在栈，Object 实例在堆
}
```

---

### 2. CMS 和 G1 垃圾收集器有什么区别？如何选择？

**答案**：

| 特性 | CMS | G1 |
|------|-----|-----|
| **设计目标** | 最短停顿时间 | 可预测停顿时间 |
| **内存布局** | 传统分代 | Region 分区 |
| **回收方式** | 并发标记清除 | 复制算法 + 标记整理 |
| **碎片问题** | 有内存碎片 | 基本无碎片 |
| **适用场景** | 老年代回收 | 全堆回收 |

**选择建议**：
- 堆内存 < 4GB：使用 CMS 或 Parallel GC
- 堆内存 >= 4GB 且需要可控停顿：使用 G1
- 超大堆（> 32GB）：考虑 ZGC 或 Shenandoah

---

### 3. HashMap 在 JDK 1.7 和 1.8 中有什么区别？

**答案**：

| 特性 | JDK 1.7 | JDK 1.8 |
|------|---------|---------|
| **数据结构** | 数组 + 链表 | 数组 + 链表 + 红黑树 |
| **链表插入** | 头插法 | 尾插法 |
| **扩容时机** | 容量达到 threshold | 容量达到 threshold 且有冲突 |
| **并发问题** | 扩容时可能死循环 | 仍有数据丢失问题 |

```java
// JDK 1.8 HashMap 关键源码
final V putVal(int hash, K key, V value, boolean onlyIfAbsent) {
    // 链表转红黑树阈值
    if (binCount >= TREEIFY_THRESHOLD - 1)
        treeifyBin(tab, hash);
}

// 红黑树退化阈值
if (lc <= UNTREEIFY_THRESHOLD)
    tab[index] = loHead.untreeify(map);
```

**追问**：ConcurrentHashMap 如何保证线程安全？
- JDK 1.7：分段锁（Segment）
- JDK 1.8：CAS + synchronized 锁单个节点

---

### 4. 线程池的核心参数有哪些？如何合理配置？

**答案**：

```java
public ThreadPoolExecutor(
    int corePoolSize,      // 核心线程数
    int maximumPoolSize,   // 最大线程数
    long keepAliveTime,    // 空闲线程存活时间
    TimeUnit unit,
    BlockingQueue<Runnable> workQueue,  // 工作队列
    ThreadFactory threadFactory,         // 线程工厂
    RejectedExecutionHandler handler     // 拒绝策略
)
```

**配置原则**：

| 任务类型 | CPU密集型 | IO密集型 | 混合型 |
|----------|-----------|----------|--------|
| **corePoolSize** | CPU核心数 + 1 | CPU核心数 × 2 | 根据IO等待时间比例调整 |
| **队列** | 容量较小的有界队列 | 容量较大的有界队列 | 根据场景调整 |

**拒绝策略**：
1. `AbortPolicy`：抛异常（默认）
2. `CallerRunsPolicy`：调用者线程执行
3. `DiscardPolicy`：静默丢弃
4. `DiscardOldestPolicy`：丢弃最老任务

---

### 5. synchronized 和 ReentrantLock 有什么区别？

**答案**：

| 特性 | synchronized | ReentrantLock |
|------|--------------|---------------|
| **实现层面** | JVM 关键字 | JDK API |
| **锁获取** | 隐式，自动释放 | 显式，需手动释放 |
| **可中断** | 不可中断 | 支持中断 |
| **公平性** | 非公平 | 可选公平/非公平 |
| **条件变量** | 单一条件 | 多条件变量 |
| **性能** | 偏向锁优化后性能较好 | 高竞争时性能更优 |

```java
// ReentrantLock 使用示例
private final ReentrantLock lock = new ReentrantLock(true); // 公平锁
private final Condition condition = lock.newCondition();

public void awaitMethod() throws InterruptedException {
    lock.lock();
    try {
        while (!conditionMet) {
            condition.await();  // 等待条件
        }
        // 执行逻辑
    } finally {
        lock.unlock();
    }
}
```

---

### 6. volatile 关键字的作用是什么？能保证原子性吗？

**答案**：

**三大特性**：
1. **可见性**：一个线程修改后，其他线程立即可见
2. **有序性**：禁止指令重排序
3. **原子性**：❌ 不能保证

```java
// volatile 不保证原子性示例
private volatile int count = 0;

public void increment() {
    count++;  // 非原子操作：读取 -> 加1 -> 写回
}

// 正确做法
private final AtomicInteger count = new AtomicInteger(0);
public void increment() {
    count.incrementAndGet();  // 原子操作
}
```

**应用场景**：
- 状态标志位：`volatile boolean running = true;`
- 双重检查锁定（DCL）：
```java
private volatile static Singleton instance;

public static Singleton getInstance() {
    if (instance == null) {
        synchronized (Singleton.class) {
            if (instance == null) {
                instance = new Singleton();
            }
        }
    }
    return instance;
}
```

---

### 7. ThreadLocal 的原理是什么？内存泄漏问题如何解决？

**答案**：

**原理**：
- 每个线程维护一个 `ThreadLocalMap`
- Key 为 ThreadLocal 对象的弱引用
- Value 为强引用

**内存泄漏原因**：
1. ThreadLocal 被回收后，Key 变为 null
2. Value 仍被强引用，无法被回收
3. 线程长期不结束（线程池场景）

**解决方案**：
```java
// 正确使用方式
public class UserContext {
    private static final ThreadLocal<User> userHolder = new ThreadLocal<>();

    public static void setUser(User user) {
        userHolder.set(user);
    }

    public static void clear() {
        userHolder.remove();  // 必须手动清理
    }
}

// 最佳实践：配合 try-finally 使用
try {
    UserContext.setUser(user);
    // 业务逻辑
} finally {
    UserContext.clear();
}
```

---

### 8. Java NIO 的核心组件有哪些？与 BIO 有什么区别？

**答案**：

| 特性 | BIO | NIO |
|------|-----|-----|
| **模型** | 阻塞 IO | 非阻塞 IO |
| **连接处理** | 一线程一连接 | 一线程处理多连接 |
| **组件** | InputStream/OutputStream | Channel/Buffer/Selector |

```java
// NIO 核心组件示例
Selector selector = Selector.open();

ServerSocketChannel serverChannel = ServerSocketChannel.open();
serverChannel.bind(new InetSocketAddress(8080));
serverChannel.configureBlocking(false);
serverChannel.register(selector, SelectionKey.OP_ACCEPT);

while (true) {
    selector.select();  // 阻塞直到有事件就绪
    Set<SelectionKey> selectedKeys = selector.selectedKeys();

    for (SelectionKey key : selectedKeys) {
        if (key.isAcceptable()) {
            // 处理连接
        } else if (key.isReadable()) {
            // 处理读取
        }
    }
    selectedKeys.clear();
}
```

---

### 9. Spring Bean 的生命周期是怎样的？

**答案**：

```
实例化 → 属性填充 → 初始化前 → 初始化 → 初始化后 → 使用 → 销毁
    ↓           ↓           ↓          ↓          ↓
  构造器    @Autowired   BeanPost   @PostConstruct  DisposableBean
           @Value       Processor   InitializingBean
```

```java
@Component
public class MyBean implements InitializingBean, DisposableBean {

    @PostConstruct
    public void init() {
        System.out.println("@PostConstruct");
    }

    @Override
    public void afterPropertiesSet() {
        System.out.println("InitializingBean");
    }

    @PreDestroy
    public void cleanup() {
        System.out.println("@PreDestroy");
    }

    @Override
    public void destroy() {
        System.out.println("DisposableBean");
    }
}
```

---

### 10. Spring 如何解决循环依赖？

**答案**：

**三级缓存机制**：

```java
// DefaultSingletonBeanRegistry 核心属性
/** 一级缓存：完整的单例Bean */
private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);

/** 二级缓存：早期暴露的Bean（未完成属性填充） */
private final Map<String, Object> earlySingletonObjects = new ConcurrentHashMap<>(16);

/** 三级缓存：ObjectFactory，用于生成早期Bean的代理对象 */
private final Map<String, ObjectFactory<?>> singletonFactories = new HashMap<>(16);
```

**解决流程**：
1. 创建 Bean A，标记为正在创建
2. 发现依赖 B，去创建 B
3. B 发现依赖 A，从三级缓存获取 A 的早期引用
4. B 完成创建，A 获取到 B，完成创建

**局限性**：
- 只能解决 setter 注入的单例 Bean 循环依赖
- 构造器注入无法解决（无法创建早期引用）
- `@Async` 等需要代理的场景可能失败

---

## 二、分布式系统架构

### 11. 微服务架构中，服务注册与发现是如何工作的？

**答案**：

**核心组件**：
```
服务提供者 → 服务注册中心 ← 服务消费者
     ↑              ↓              ↑
     └──── 心跳续约 ──── 服务发现 ────┘
```

**主流实现对比**：

| 特性 | Nacos | Eureka | Consul | Zookeeper |
|------|-------|--------|--------|-----------|
| **CAP** | AP/CP 可选 | AP | CP | CP |
| **健康检查** | TCP/HTTP/MySQL | 心跳 | TCP/HTTP/Script | 会话超时 |
| **配置中心** | 支持 | 不支持 | 支持 | 支持 |
| **社区活跃度** | 活跃 | 停止维护 | 活跃 | 活跃 |

```java
// Spring Cloud Nacos 配置示例
@SpringBootApplication
@EnableDiscoveryClient
public class ProviderApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProviderApplication.class, args);
    }
}

// application.yml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: dev
        group: DEFAULT_GROUP
```

---

### 12. Redis 有哪些数据类型？分别适用于什么场景？

**答案**：

| 数据类型 | 底层实现 | 典型场景 |
|----------|----------|----------|
| **String** | SDS（简单动态字符串） | 缓存、计数器、分布式锁 |
| **Hash** | 哈希表 + 压缩列表 | 对象存储、购物车 |
| **List** | 双向链表 + 压缩列表 | 消息队列、时间线 |
| **Set** | 哈希表 + 整数集合 | 标签、社交关系 |
| **ZSet** | 跳表 + 哈希表 | 排行榜、延时队列 |
| **Stream** | Radix Tree | 消息队列（支持消费组） |

```java
// Redis 典型应用示例

// 1. 分布式锁
public boolean tryLock(String key, String value, long expireTime) {
    return redisTemplate.opsForValue()
        .setIfAbsent(key, value, expireTime, TimeUnit.MILLISECONDS);
}

// 2. 排行榜
public void updateRank(String gameId, String userId, double score) {
    redisTemplate.opsForZSet().add("game:" + gameId + ":rank", userId, score);
}

// 3. 延时队列
public void addDelayTask(String task, long delaySeconds) {
    long executeTime = System.currentTimeMillis() + delaySeconds * 1000;
    redisTemplate.opsForZSet().add("delay_queue", task, executeTime);
}
```

---

### 13. 缓存穿透、缓存击穿、缓存雪崩如何解决？

**答案**：

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| **缓存穿透** | 查询不存在的数据 | 布隆过滤器、空值缓存 |
| **缓存击穿** | 热点 Key 过期 | 互斥锁、逻辑过期 |
| **缓存雪崩** | 大量 Key 同时过期 | 随机过期时间、多级缓存 |

```java
// 1. 布隆过滤器防穿透
public Object getWithBloomFilter(String key) {
    if (!bloomFilter.mightContain(key)) {
        return null;  // 一定不存在
    }
    return getFromCache(key);
}

// 2. 互斥锁防击穿
public Object getWithMutex(String key) {
    Object value = redisTemplate.opsForValue().get(key);
    if (value == null) {
        String lockKey = "lock:" + key;
        try {
            if (tryLock(lockKey)) {
                value = loadFromDB(key);
                redisTemplate.opsForValue().set(key, value, 30, TimeUnit.MINUTES);
            } else {
                Thread.sleep(50);
                return getWithMutex(key);  // 重试
            }
        } finally {
            unlock(lockKey);
        }
    }
    return value;
}

// 3. 随机过期时间防雪崩
public void setWithRandomExpire(String key, Object value, long baseExpire) {
    long randomExpire = baseExpire + RandomUtils.nextLong(0, 300);
    redisTemplate.opsForValue().set(key, value, randomExpire, TimeUnit.SECONDS);
}
```

---

### 14. Kafka 如何保证消息不丢失？

**答案**：

**三个阶段保证**：

```
生产者 → Broker → 消费者
   ↓         ↓         ↓
 acks=all  副本同步  手动提交offset
```

**生产者端**：
```java
Properties props = new Properties();
props.put("acks", "all");  // 等待所有副本确认
props.put("retries", Integer.MAX_VALUE);
props.put("enable.idempotence", true);  // 幂等性
```

**Broker 端**：
```yaml
# server.properties
min.insync.replicas=2  # 最少同步副本数
unclean.leader.election.enable=false  # 禁止非同步副本成为leader
```

**消费者端**：
```java
props.put("enable.auto.commit", "false");  // 关闭自动提交

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    for (ConsumerRecord<String, String> record : records) {
        process(record);
        consumer.commitSync();  // 处理完成后手动提交
    }
}
```

---

### 15. 数据库分库分表有哪些策略？有什么问题？

**答案**：

**分片策略**：

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| **垂直分库** | 按业务拆分 | 业务耦合度低 |
| **垂直分表** | 按字段拆分（冷热分离） | 大字段、低频字段 |
| **水平分库** | 按分片键数据分布 | 单库性能瓶颈 |
| **水平分表** | 按分片键数据分布 | 单表数据量大 |

**分片键选择**：
```java
// 用户ID分片
long shardKey = userId % shardCount;

// 时间分片
String tableSuffix = DateUtil.format(date, "yyyyMM");

// 一致性哈希
int shardIndex = consistentHash(userId, virtualNodes);
```

**常见问题及解决方案**：

| 问题 | 解决方案 |
|------|----------|
| 跨库 JOIN | 数据冗余、应用层组装 |
| 跨库排序分页 | 每个分片取 Top N，内存合并 |
| 分布式事务 | Seata、TCC、本地消息表 |
| 全局唯一 ID | Snowflake、号段模式 |
| 数据倾斜 | 调整分片键、热点数据特殊处理 |

---

### 16. 分布式事务有哪些解决方案？

**答案**：

| 方案 | 一致性 | 性能 | 复杂度 | 适用场景 |
|------|--------|------|--------|----------|
| **2PC** | 强一致 | 低 | 低 | 传统单体应用 |
| **TCC** | 最终一致 | 高 | 高 | 高并发金融场景 |
| **Seata AT** | 最终一致 | 中 | 低 | 业务简单、不依赖补偿逻辑 |
| **本地消息表** | 最终一致 | 高 | 中 | 跨系统、可接受延迟 |
| **事务消息** | 最终一致 | 高 | 中 | 异步场景 |

```java
// TCC 实现示例
@LocalTCC
public interface StockService {

    @TwoPhaseBusinessAction(name = "deductStock", commitMethod = "commit", rollbackMethod = "rollback")
    boolean deductStock(@BusinessActionContextParameter(paramName = "productId") String productId,
                        @BusinessActionContextParameter(paramName = "count") int count);

    boolean commit(BusinessActionContext context);

    boolean rollback(BusinessActionContext context);
}
```

---

### 17. 如何设计一个高可用系统？

**答案**：

**架构层面**：
```
                    ┌─────────────┐
                    │   DNS/CDN   │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │   Nginx LB  │  ← 主备/多活
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────┴─────┐    ┌─────┴─────┐    ┌─────┴─────┐
    │ Gateway A │    │ Gateway B │    │ Gateway C │  ← 无状态
    └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
          │                │                │
    ┌─────┴─────┐    ┌─────┴─────┐    ┌─────┴─────┐
    │ Service A │    │ Service B │    │ Service C │  ← 集群部署
    └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
          │                │                │
    ┌─────┴─────┐    ┌─────┴─────┐    ┌─────┴─────┐
    │  Redis    │    │  MySQL    │    │  MQ       │  ← 主从/集群
    │  Cluster  │    │  M-S      │    │  Cluster  │
    └───────────┘    └───────────┘    └───────────┘
```

**关键设计**：

| 层级 | 手段 |
|------|------|
| 应用层 | 无状态设计、服务降级、熔断限流 |
| 数据层 | 主从复制、读写分离、分库分表 |
| 基础设施 | 多机房部署、容器化、自动扩缩容 |
| 监控告警 | 全链路监控、故障自愈 |

---

### 18. 如何保证接口幂等性？

**答案**：

**幂等性方案对比**：

| 方案 | 实现方式 | 优点 | 缺点 |
|------|----------|------|------|
| 数据库唯一索引 | INSERT 时唯一约束 | 简单可靠 | 只适用于插入场景 |
| 乐观锁 | UPDATE ... WHERE version = ? | 性能好 | 需要额外版本字段 |
| Token 机制 | 先获取 Token，请求携带 Token | 通用性强 | 多一次网络请求 |
| 分布式锁 | SETNX + 过期时间 | 性能好 | 需处理锁超时 |

```java
// Token 幂等性方案
@PostMapping("/order")
public Result createOrder(@RequestHeader("Idempotent-Token") String token,
                          @RequestBody OrderRequest request) {
    // 1. 校验并删除 Token
    boolean valid = redisTemplate.delete("idempotent:" + token);
    if (!valid) {
        throw new BusinessException("重复请求");
    }

    // 2. 执行业务
    return orderService.createOrder(request);
}

// 生成 Token
@GetMapping("/token")
public String getToken() {
    String token = UUID.randomUUID().toString();
    redisTemplate.opsForValue().set("idempotent:" + token, "1", 5, TimeUnit.MINUTES);
    return token;
}
```

---

## 三、AI Agent 技术体系

### 19. 什么是 Prompt Engineering？常用的技巧有哪些？

**答案**：

**Prompt Engineering** 是设计和优化提示词的技术，目的是让大语言模型生成更准确、更符合预期的输出。

**常用技巧**：

| 技巧 | 说明 | 示例 |
|------|------|------|
| **角色扮演** | 赋予模型特定身份 | "你是一位资深的Java架构师..." |
| **Few-shot** | 提供示例引导输出 | 输入输出示例对 |
| **CoT（思维链）** | 引导模型逐步推理 | "让我们一步步思考..." |
| **结构化输出** | 指定输出格式 | JSON、Markdown、表格 |
| **约束条件** | 限制输出范围 | "不超过100字"、"只输出代码" |

```markdown
<!-- Few-shot 示例 -->
你是一个代码审查助手，请按照以下格式分析代码：

示例：
输入：`int a = 1 / 0;`
输出：
- 问题：除零异常
- 严重程度：高
- 建议：添加除数校验

现在请分析以下代码：
输入：`String name = null; System.out.println(name.length());`
```

---

### 20. RAG（检索增强生成）的原理是什么？如何优化？

**答案**：

**原理图**：
```
用户查询 → Embedding → 向量检索 → 上下文组装 → LLM 生成
    ↓
文档库 → 切分 → Embedding → 向量存储
```

**核心组件**：

| 组件 | 说明 | 优化方向 |
|------|------|----------|
| 文档处理 | 切分、清洗、增强 | 语义切分、重叠窗口 |
| Embedding | 文本向量化 | 多语言模型、领域微调 |
| 向量数据库 | 存储和检索 | 索引优化、混合检索 |
| LLM | 生成回答 | 提示词工程、温度调优 |

**优化策略**：

```java
// 1. 混合检索（向量 + 关键词）
public List<Document> hybridSearch(String query) {
    List<Document> vectorResults = vectorStore.similaritySearch(query, 5);
    List<Document> keywordResults = elasticsearch.search(query, 5);

    // RRF (Reciprocal Rank Fusion) 融合
    return rrfMerge(vectorResults, keywordResults);
}

// 2. 重排序
public List<Document> rerank(String query, List<Document> docs) {
    // 使用 Cross-Encoder 重新排序
    return rerankModel.rerank(query, docs);
}

// 3. 查询改写
public String rewriteQuery(String originalQuery) {
    // 扩展同义词、纠正拼写、消除歧义
    return llm.generate("请改写以下查询以获得更好的检索结果：" + originalQuery);
}
```

---

### 21. 什么是 MCP（Model Context Protocol）？

**答案**：

**MCP** 是 Anthropic 提出的模型上下文协议，用于标准化 LLM 应用与外部数据源、工具的连接。

**架构**：
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

**应用场景**：
- 让 AI 读取本地文件系统
- 连接数据库执行查询
- 调用外部 API 工具
- 集成企业知识库

---

### 22. Agent 的核心组件有哪些？如何实现工具调用？

**答案**：

**Agent 架构**：

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

**工具调用实现**（Function Calling）：

```java
// 定义工具
@Tool(description = "获取指定城市的天气信息")
public WeatherInfo getWeather(
    @Param(description = "城市名称") String city,
    @Param(description = "温度单位", required = false) String unit
) {
    return weatherService.query(city, unit);
}

// LLM Function Calling 流程
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

---

### 23. 如何评估 Agent 系统的效果？

**答案**：

**评估维度**：

| 维度 | 指标 | 说明 |
|------|------|------|
| **准确性** | 任务完成率 | 正确完成任务的比例 |
| **效率** | 平均步数、平均耗时 | 完成任务所需的资源 |
| **成本** | Token 消耗、API 调用次数 | 运行成本 |
| **稳定性** | 错误率、重试率 | 异常处理能力 |
| **安全性** | 越狱率、有害输出率 | 安全合规指标 |

**评估方法**：

```java
// 1. 自动化评估（使用 LLM-as-Judge）
public EvaluationResult evaluate(String task, String output, String groundTruth) {
    String prompt = """
        请评估以下回答的质量：
        任务：%s
        回答：%s
        标准答案：%s

        从以下维度评分（1-5分）：
        1. 准确性
        2. 完整性
        3. 相关性
        """.formatted(task, output, groundTruth);

    return llm.evaluate(prompt);
}

// 2. 轨迹评估（评估 Agent 执行过程）
public void evaluateTrajectory(List<Step> trajectory, List<Step> idealPath) {
    // 步骤匹配率
    double matchRate = calculateMatchRate(trajectory, idealPath);

    // 效率评分
    int efficiency = idealPath.size() / trajectory.size();

    // 冗余步骤检测
    List<Step> redundantSteps = findRedundantSteps(trajectory);
}
```

---

### 24. AI 编程工具（如 Claude Code、Cursor）的核心原理是什么？

**答案**：

**核心架构**：

```
┌─────────────────────────────────────────────┐
│                 AI 编程助手                   │
├─────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Context │  │  Model   │  │  Actions  │  │
│  │  Engine  │  │  Router  │  │  Executor │  │
│  └──────────┘  └──────────┘  └───────────┘  │
├─────────────────────────────────────────────┤
│                  Tool Layer                 │
│  Read │ Write │ Edit │ Bash │ Search │ ...│
└─────────────────────────────────────────────┘
```

**关键技术**：

| 技术 | 说明 |
|------|------|
| **上下文管理** | 滑动窗口、摘要压缩、RAG 增强 |
| **工具调用** | Function Calling、工具编排 |
| **代码理解** | AST 解析、语义分析、依赖追踪 |
| **代码生成** | 补全、重构、测试生成 |
| **错误处理** | 自动修复、增量调试 |

**使用技巧**：
1. **明确上下文**：提供清晰的文件路径和需求描述
2. **分步指导**：复杂任务拆分为多个步骤
3. **利用工具**：善用代码库搜索、文件读取等功能
4. **迭代优化**：根据反馈不断调整和改进

---

## 四、系统设计

### 25. 如何设计一个高并发的秒杀系统？

**答案**：

**架构设计**：

```
用户 → CDN → 网关 → 秒杀服务 → MQ → 订单服务 → DB
         ↓        ↓        ↓
      静态化   限流     Redis预热
               ↓
            库存扣减
```

**关键设计点**：

| 层级 | 策略 | 实现方案 |
|------|------|----------|
| 前端 | 防刷 | 按钮置灰、验证码、答题 |
| 网关 | 限流 | 令牌桶、漏桶 |
| 服务 | 削峰 | 消息队列异步处理 |
| 缓存 | 预热 | 提前加载库存到 Redis |
| 数据库 | 分库分表 | 按用户 ID 分片 |

**核心代码**：

```java
// Redis 原子扣减库存
public boolean deductStock(String productId, int count) {
    String script = """
        if redis.call('get', KEYS[1]) >= tonumber(ARGV[1]) then
            return redis.call('decrby', KEYS[1], ARGV[1])
        else
            return -1
        end
        """;
    Long result = redisTemplate.execute(
        new DefaultRedisScript<>(script, Long.class),
        Collections.singletonList("stock:" + productId),
        String.valueOf(count)
    );
    return result != null && result >= 0;
}

// 异步下单
@Transactional
public void createOrder(OrderRequest request) {
    // 1. 校验库存（Redis）
    if (!deductStock(request.getProductId(), 1)) {
        throw new BusinessException("库存不足");
    }

    // 2. 发送消息到 MQ
    mqProducer.send("order.create", request);

    // 3. 返回排队中状态
    return Result.processing("orderId");
}
```

---

### 26. 如何设计商家开放平台的核心架构？

**答案**：

**系统架构**：

```
┌────────────────────────────────────────────────────────┐
│                    开放平台网关层                        │
│  统一鉴权 │ 限流熔断 │ 路由转发 │ 日志审计 │ 协议转换    │
└────────────────────────────────────────────────────────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
┌───┴────┐           ┌─────┴─────┐         ┌─────┴─────┐
│ 商家服务 │           │ 商品服务   │         │ 订单服务   │
└───┬────┘           └─────┬─────┘         └─────┬─────┘
    │                      │                      │
┌───┴────────────────────┴──────────────────────┴───┐
│                    中台服务层                       │
│  用户中心 │ 商品中心 │ 订单中心 │ 支付中心 │ 消息中心  │
└────────────────────────────────────────────────────┘
```

**核心模块设计**：

| 模块 | 功能 | 技术方案 |
|------|------|----------|
| API 网关 | 统一入口、鉴权、限流 | Spring Cloud Gateway |
| 开放 API | RESTful/OpenAPI 规范 | Swagger/YAML 定义 |
| 开发者中心 | 文档、SDK、沙箱 | 代码生成、Mock 服务 |
| 数据中心 | 商家数据开放 | 数据同步、API 封装 |

**关键设计考量**：

1. **API 版本管理**：URL Path 版本 vs Header 版本
2. **限流策略**：应用级、接口级、商家级三级限流
3. **监控告警**：调用链追踪、异常监控、SLA 统计
4. **安全机制**：签名校验、IP 白名单、数据脱敏

---

## 五、项目经验与开放题

### 27. 请介绍一个你做过的有挑战性的项目，遇到了什么问题？如何解决的？

**答题框架**：

```markdown
## 项目背景
- 业务场景：xxx
- 技术栈：xxx
- 团队规模：xxx

## 遇到的问题
- 问题描述：xxx
- 影响：xxx

## 解决方案
- 分析过程：xxx
- 方案选型：xxx
- 实施步骤：xxx

## 最终结果
- 性能提升：xxx
- 稳定性提升：xxx
- 业务价值：xxx

## 经验总结
- 技术收获：xxx
- 可改进点：xxx
```

---

### 28. 如何看待 AI Agent 在电商领域的应用前景？

**答题要点**：

1. **当前应用场景**：
   - 智能客服（自动回复、工单处理）
   - 商品推荐（个性化、场景化）
   - 商家助手（运营建议、数据分析）

2. **技术挑战**：
   - 复杂任务规划能力
   - 长对话上下文管理
   - 工具调用的准确性

3. **未来发展方向**：
   - 多模态 Agent（文本、图像、语音）
   - 自主决策 Agent
   - Agent 协作网络

---

### 29. 如果让你设计一个 AI Agent 辅助商家经营系统，你会怎么设计？

**答题框架**：

```markdown
## 需求分析
- 核心用户：商家
- 主要场景：商品管理、订单处理、数据分析、营销推广

## 系统架构
┌─────────────────────────────────────┐
│          Agent 对话界面              │
└─────────────────┬───────────────────┘
                  │
┌─────────────────┴───────────────────┐
│          Agent 编排层                │
│  意图识别 │ 任务规划 │ 工具调度      │
└─────────────────┬───────────────────┘
                  │
┌─────────────────┴───────────────────┐
│          工具层                      │
│  商品API │ 订单API │ 数据分析 │ 营销 │
└─────────────────────────────────────┘

## 关键能力
1. 多轮对话理解
2. 复杂任务拆解
3. 工具编排执行
4. 结果验证反馈

## 技术选型
- LLM：Claude/GPT-4
- Agent 框架：LangChain/AutoGen
- 向量数据库：Milvus/Pinecone
- 工具协议：MCP
```

---

### 30. 你有什么问题想问我们的？

**推荐问题**：

1. **业务相关**：
   - 目前 AI Agent 在商家侧的主要应用场景有哪些？
   - 开放平台的技术架构是如何演进的？

2. **团队相关**：
   - 团队的技术氛围如何？
   - 新人的成长路径是怎样的？

3. **技术相关**：
   - 团队在 AI Agent 方面有哪些技术积累？
   - 如何看待 Agent 与传统软件系统的融合？

---

## 附录：面试准备清单

### 必背知识点
- [ ] JVM 内存模型与 GC 算法
- [ ] HashMap 底层实现
- [ ] 线程池参数与配置原则
- [ ] synchronized vs ReentrantLock
- [ ] Spring Bean 生命周期
- [ ] Redis 数据类型与持久化
- [ ] MySQL 索引与事务隔离级别
- [ ] 分布式事务解决方案

### 项目经验准备
- [ ] 准备 2-3 个项目案例（STAR 法则）
- [ ] 准备技术难点和解决方案
- [ ] 准备性能优化案例

### AI Agent 相关
- [ ] 了解 RAG 原理与优化
- [ ] 了解 Function Calling 机制
- [ ] 尝试使用 Claude Code 或 Cursor
- [ ] 了解主流 Agent 框架

### 系统设计
- [ ] 高并发系统设计套路
- [ ] 微服务架构设计
- [ ] 缓存架构设计
- [ ] 消息队列架构设计

---

> **祝面试顺利！** 🎯