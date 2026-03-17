# Java 后端开发面试实战模拟题

> 本套模拟题侧重于实战场景和深度原理考察，包含 Redis 实战、MySQL 调优、消息队列、微服务架构等内容，适合中高级后端开发岗位面试准备。

## 目录

- [第一部分：Redis 实战](#第一部分 redis-实战)
- [第二部分：MySQL 深度调优](#第二部分 mysql-深度调优)
- [第三部分：消息队列进阶](#第三部分消息队列进阶)
- [第四部分：微服务架构](#第四部分微服务架构)
- [第五部分：系统设计与场景题](#第五部分系统设计与场景题)
- [第六部分：Java 进阶与 JVM](#第六部分 java-进阶与-jvm)
- [参考答案与解析](#参考答案与解析)

---

## 第一部分：Redis 实战

### 1. Redis 缓存穿透、击穿、雪崩的区别和解决方案

**考察点**：缓存问题处理、实战经验

### 2. 如何使用 Redis 实现一个支持延时的任务队列？

**考察点**：Redis 数据结构应用、实际场景设计

### 3. Redis Cluster 集群模式下，Key 的分布策略是什么？如何保证热点 Key 均匀分布？

**考察点**：分布式缓存、集群原理

### 4. Redis 内存淘汰策略有哪些？生产环境如何选择？

**考察点**：内存管理、生产经验

---

## 第二部分：MySQL 深度调优

### 5.  explain 结果中 `rows` 和 `filtered` 字段代表什么？如何根据执行计划优化 SQL？

**考察点**：SQL 执行计划分析

### 6. 什么是覆盖索引？什么情况下会失效？

**考察点**：索引优化

### 7. MySQL 的 gap lock 是什么？在什么场景下会产生？

**考察点**：锁机制、并发控制

### 8. 大表分页查询如何优化？（如 `LIMIT 1000000, 10`）

**考察点**：性能优化、实战经验

---

## 第三部分：消息队列进阶

### 9. Kafka 如何保证消息的顺序性？

**考察点**：消息顺序、Kafka 原理

### 10. RocketMQ 的事务消息是如何实现的？

**考察点**：分布式事务、消息中间件

### 11. 消息重复消费如何处理？请设计一个幂等性方案。

**考察点**：幂等性设计、实战经验

---

## 第四部分：微服务架构

### 12. Spring Cloud 中服务发现的工作原理是什么？

**考察点**：服务治理、Spring Cloud

### 13. 什么是服务降级和熔断？Hystrix/Sentinel 是如何实现的？

**考察点**：容错机制、高可用设计

### 14. 分布式链路追踪的原理是什么？如何实现？

**考察点**：可观测性、分布式追踪

### 15. 如何设计一个统一的配置中心？

**考察点**：配置管理、架构设计

---

## 第五部分：系统设计与场景题

### 16. 设计一个支持百万日活的新闻 Feed 流系统

**考察点**：Feed 流设计、读写分离、缓存策略

### 17. 如何设计一个支持高并发的优惠券系统？

**要求**：
- 支持百万级用户同时抢券
- 不能超发
- 防止刷券

**考察点**：高并发设计、库存扣减、防刷策略

### 18. 设计一个实时在线人数统计系统

**要求**：
- 支持百万级并发访问
- 秒级延迟
- 支持按维度统计（页面、地区等）

**考察点**：实时统计、数据结构设计

### 19. 如何设计一个异步任务调度系统？

**要求**：
- 支持定时任务
- 支持分布式部署
- 支持任务失败重试

**考察点**：任务调度、分布式协调

---

## 第六部分：Java 进阶与 JVM

### 20. G1 垃圾回收器与 CMS 的区别是什么？G1 如何避免 Full GC？

**考察点**：JVM 调优、GC 原理

### 21. 什么是类加载的双亲委派模型？如何打破？

**考察点**：类加载机制

### 22. JVM 内存溢出（OOM）如何排查？请描述排查步骤。

**考察点**：问题排查、实战经验

### 23. ThreadLocal 的原理是什么？内存泄漏如何产生的？

**考察点**：线程本地变量、内存管理

### 24. Java 中的锁升级过程是怎样的？（偏向锁 → 轻量级锁 → 重量级锁）

**考察点**：锁优化、JVM 底层

---

## 参考答案与解析

### 第一部分：Redis 实战

#### 1. 缓存穿透、击穿、雪崩

**答案**：

| 问题 | 描述 | 解决方案 |
|------|------|----------|
| **缓存穿透** | 查询不存在的数据，请求直达数据库 | 1. 布隆过滤器<br>2. 缓存空对象（设置短 TTL）<br>3. 接口限流 |
| **缓存击穿** | 热点 Key 过期，大量请求击穿到数据库 | 1. 热点 Key 永不过期<br>2. 互斥锁重建缓存<br>3. 逻辑过期（后台更新） |
| **缓存雪崩** | 大量 Key 同时过期或 Redis 宕机 | 1. 随机 TTL<br>2. 多级缓存<br>3. 限流降级 |

**代码示例 - 互斥锁重建缓存**：
```java
public String getWithMutex(String key) {
    String value = redisTemplate.opsForValue().get(key);
    if (value != null) return value;

    // 获取分布式锁
    String lockKey = "lock:" + key;
    boolean locked = redisTemplate.opsForValue()
        .setIfAbsent(lockKey, "1", 5, TimeUnit.SECONDS);

    if (locked) {
        try {
            // 双重检查
            value = redisTemplate.opsForValue().get(key);
            if (value != null) return value;

            // 从数据库查询
            value = queryFromDB(key);
            redisTemplate.opsForValue().set(key, value, 30, TimeUnit.MINUTES);
        } finally {
            redisTemplate.delete(lockKey);
        }
    } else {
        // 未获取到锁，等待重试
        Thread.sleep(50);
        return getWithMutex(key);
    }
    return value;
}
```

#### 2. Redis 延时任务队列

**答案**：

**方案一：ZSet 实现**
```java
// 添加延时任务
public void addDelayTask(String taskId, long delaySeconds) {
    long executeTime = System.currentTimeMillis() + delaySeconds * 1000;
    redisTemplate.opsForZSet().add("delay:queue", taskId, executeTime);
}

// 消费任务（轮询）
public String pollTask() {
    long now = System.currentTimeMillis();
    Set<String> readyTasks = redisTemplate.opsForZSet()
        .rangeByScore("delay:queue", 0, now, 0, 1);

    if (readyTasks != null && !readyTasks.isEmpty()) {
        String taskId = readyTasks.iterator().next();
        redisTemplate.opsForZSet().remove("delay:queue", taskId);
        return taskId;
    }
    return null;
}
```

**方案二：Redisson DelayedQueue**
```java
RBlockingQueue<String> queue = redisson.getBlockingQueue("delayed:queue");
RDelayedQueue<String> delayedQueue = redisson.getDelayedQueue(queue);
delayedQueue.offer("task1", 10, TimeUnit.SECONDS); // 10 秒后可消费
```

**方案三：Redis Keyspace Events**
```conf
# Redis 配置
notify-keyspace-events Ex
```
监听 key 过期事件，触发任务执行。

#### 3. Redis Cluster Key 分布

**答案**：

**分布策略 - 哈希槽（Hash Slot）**：
- Redis Cluster 有 16384 个槽
- Key 通过 CRC16 计算后对 16384 取模
- `SLOT = CRC16(key) % 16384`

**热点 Key 均匀分布方案**：

1. **Key 加随机前缀**
```java
// 热点 Key: user:1001
// 改为：user:1001:{random}
String hotKey = "user:" + userId + ":" + ThreadLocalRandom.current().nextInt(100);
```

2. **热点 Key 副本**
```java
// 将热点 Key 复制到多个槽
for (int i = 0; i < 10; i++) {
    redisTemplate.opsForValue().set("hotkey:" + i, value);
}
// 读取时随机选择
int random = ThreadLocalRandom.current().nextInt(10);
String value = redisTemplate.opsForValue().get("hotkey:" + random);
```

3. **本地缓存 + Redis**
```java
// 使用 Caffeine 做一级缓存
Cache<String, Object> localCache = Caffeine.newBuilder()
    .maximumSize(1000)
    .expireAfterWrite(5, TimeUnit.SECONDS)
    .build();
```

#### 4. Redis 内存淘汰策略

**答案**：

**6 种淘汰策略**：

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| `noeviction` | 不淘汰，写操作返回错误 | 数据都不能丢失 |
| `allkeys-lru` | 所有 Key 按 LRU 淘汰 | 通用缓存场景 |
| `volatile-lru` | 设置过期时间的 Key 按 LRU 淘汰 | 部分数据可淘汰 |
| `allkeys-random` | 随机淘汰 | 较少使用 |
| `volatile-random` | 随机淘汰有过期时间的 Key | 较少使用 |
| `volatile-ttl` | 按剩余 TTL 淘汰（TTL 短的优先） | 希望尽快过期 |

**生产环境推荐**：
```conf
# 推荐配置
maxmemory-policy allkeys-lru
maxmemory-samples 10  # LRU 采样数，越大越精确

# 配合使用
maxmemory 4gb  # 根据物理内存设置
```

**LFU 策略**（Redis 4.0+）：
- `allkeys-lfu`：按访问频率淘汰
- 适合热点数据长期保留的场景

---

### 第二部分：MySQL 深度调优

#### 5. EXPLAIN 执行计划分析

**答案**：

**关键字段说明**：

| 字段 | 含义 |
|------|------|
| `type` | 连接类型（ALL > index > range > ref > eq_ref > const） |
| `possible_keys` | 可能使用的索引 |
| `key` | 实际使用的索引 |
| `key_len` | 索引使用长度 |
| `rows` | 预计扫描行数 |
| `filtered` | 符合条件的记录百分比 |
| `Extra` | 额外信息 |

**优化示例**：
```sql
-- 原始 SQL
EXPLAIN SELECT * FROM orders
WHERE user_id = 100 AND status = 'PAID'
ORDER BY create_time DESC LIMIT 10;

-- 结果分析
-- type: ALL（全表扫描）
-- rows: 1000000
-- Extra: Using filesort

-- 优化：创建复合索引
CREATE INDEX idx_user_status_time ON orders(user_id, status, create_time);

-- 优化后
-- type: range
-- rows: 500
-- Extra: Using where
```

**`filtered` 字段解读**：
- 表示经过条件过滤后剩余记录的比例
- `filtered = 100` 表示所有行都符合条件
- `filtered = 10` 表示只有 10% 的行符合条件

#### 6. 覆盖索引

**答案**：

**定义**：查询的列都在索引中，无需回表。

```sql
-- 索引：idx_age_name (age, name)

-- ✅ 覆盖索引（无需回表）
SELECT age, name FROM users WHERE age > 25;

-- ❌ 需要回表
SELECT age, name, email FROM users WHERE age > 25;
```

**失效场景**：

1. **查询使用了 `SELECT *`**
```sql
SELECT * FROM users WHERE age > 25; -- 需要回表
```

2. **索引列使用了函数**
```sql
SELECT YEAR(create_time) FROM orders; -- 索引失效
```

3. **范围查询后的列**
```sql
-- 索引 (age, name, email)
SELECT age, name, email FROM users WHERE age > 25 AND name = '张三';
-- name 无法使用索引（范围查询后）
```

4. **`LIKE '%xxx'` 以通配符开头**
```sql
SELECT name FROM users WHERE name LIKE '%张%'; -- 索引失效
```

#### 7. Gap Lock（间隙锁）

**答案**：

**定义**：锁住索引记录之间的间隙，防止其他事务插入。

**产生场景**：
- **可重复读（RR）隔离级别**
- **范围查询**
- **唯一索引不存在的记录**

**示例**：
```sql
-- 表中有记录：5, 10, 15

-- 事务 A
BEGIN;
SELECT * FROM users WHERE id > 10 FOR UPDATE;
-- 会加锁：(10, +∞) 的间隙

-- 事务 B
INSERT INTO users VALUES (12, 'test'); -- 被阻塞！
```

**Next-Key Lock** = 记录锁 + Gap Lock

**影响**：
- 降低并发性能
- 可能导致死锁

**解决方案**：
- 使用读提交（RC）隔离级别
- 使用唯一索引等值查询
- 避免范围查询加锁

#### 8. 大表分页优化

**答案**：

**问题**：`LIMIT 1000000, 10` 需要扫描 1000010 行，丢弃前 1000000 行。

**优化方案**：

**方案一：子查询优化（延迟关联）**
```sql
-- 原始
SELECT * FROM users LIMIT 1000000, 10;

-- 优化：先查 ID，再关联
SELECT u.* FROM users u
INNER JOIN (
    SELECT id FROM users LIMIT 1000000, 10
) tmp ON u.id = tmp.id;
```

**方案二：游标分页（推荐）**
```sql
-- 记录上次查询的最大 ID
SELECT * FROM users WHERE id > 1000000 LIMIT 10;
```

**方案三：业务限制**
```java
// 限制最大页数
if (page > 1000) {
    throw new BusinessException("最多查看前 1000 页");
}
```

**方案四：ES 方案**
- 使用 Elasticsearch 的 `search_after` 深度分页

---

### 第三部分：消息队列进阶

#### 9. Kafka 消息顺序性

**答案**：

**Kafka 只保证 Partition 内有序**。

**保证顺序的方案**：

1. **单 Partition（不推荐）**
```java
// 生产者
ProducerRecord<String, Order> record = new ProducerRecord<>("order-topic", orderId, order);
// 同一个 orderId 总是发送到同一个 Partition
```

2. **Key 哈希（推荐）**
```java
// 相同业务 Key 发送到同一 Partition
ProducerRecord<String, Order> record =
    new ProducerRecord<>("order-topic", orderId, order);
// Kafka 默认按 Key 哈希分配 Partition
```

3. **自定义 Partitioner**
```java
public class OrderPartitioner implements Partitioner {
    @Override
    public int partition(String topic, Object key, byte[] keyBytes,
                        Object value, byte[] valueBytes, Cluster cluster) {
        // 根据业务逻辑分配 Partition
        Order order = (Order) value;
        return Math.abs(order.getUserId().hashCode()) % cluster.partitionCountForTopic(topic);
    }
}
```

**消费者端**：
- 单线程消费一个 Partition
- 或使用内存队列保证顺序处理

#### 10. RocketMQ 事务消息

**答案**：

**两阶段提交流程**：

```
1. 生产者发送 Half Message（半消息）
   ↓
2. MQ 服务器存储消息（对消费者不可见）
   ↓
3. 生产者执行本地事务
   ↓
4. 根据事务结果提交：
   - 成功 → COMMIT（消息可见）
   - 失败 → ROLLBACK（消息删除）
   - 超时 → MQ 回查事务状态
```

**代码示例**：
```java
TransactionListener listener = new TransactionListener() {
    @Override
    public LocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        try {
            // 执行本地事务
            orderService.createOrder(msg);
            return LocalTransactionState.COMMIT_MESSAGE;
        } catch (Exception e) {
            return LocalTransactionState.ROLLBACK_MESSAGE;
        }
    }

    @Override
    public LocalTransactionState checkLocalTransaction(MessageExt msg) {
        // MQ 回查事务状态
        boolean success = orderService.checkOrder(msg);
        return success ? LocalTransactionState.COMMIT_MESSAGE
                       : LocalTransactionState.ROLLBACK_MESSAGE;
    }
};

TransactionMQProducer producer = new TransactionMQProducer("tg");
producer.setTransactionListener(listener);
```

**适用场景**：
- 最终一致性事务
- 订单创建后通知库存
- 支付成功后通知积分

#### 11. 消息幂等性方案

**答案**：

**重复消费原因**：
- 网络重传
- ACK 丢失
- 消费者重试

**幂等性方案**：

**方案一：数据库唯一键**
```java
public void consume(Message message) {
    String messageId = message.getId();
    try {
        // 利用唯一索引
        orderMapper.insert(new Order(messageId, ...));
        ack(message);
    } catch (DuplicateKeyException e) {
        // 已处理过，直接 ACK
        ack(message);
    }
}
```

**方案二：Redis 去重表**
```java
public boolean tryProcess(String messageId) {
    String key = "msg:processed:" + messageId;
    Boolean added = redisTemplate.opsForValue()
        .setIfAbsent(key, "1", 24, TimeUnit.HOURS);
    return Boolean.TRUE.equals(added);
}

// 消费逻辑
if (tryProcess(messageId)) {
    process(message);
} else {
    // 已处理过
    ack(message);
}
```

**方案三：状态机**
```java
@Update("UPDATE orders SET status = 'PAID' " +
        "WHERE id = #{id} AND status = 'UNPAID'")
int payOrder(Long id);

// 如果影响行数为 0，说明已处理
```

**方案四：幂等表**
```sql
CREATE TABLE idempotent_log (
    id BIGINT PRIMARY KEY,
    biz_type VARCHAR(50),
    biz_id VARCHAR(100),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_biz (biz_type, biz_id)
);
```

---

### 第四部分：微服务架构

#### 12. 服务发现原理

**答案**：

**核心组件**：
- **服务注册中心**：Eureka/Nacos/Consul
- **服务提供者**：启动时注册
- **服务消费者**：拉取/订阅服务列表

**Eureka 工作原理**：
```
1. 服务启动 → 注册到 Eureka Server
2. 心跳续约（30 秒一次）
3. Eureka Server 之间复制注册信息
4. 客户端拉取注册表（30 秒刷新）
5. 服务下线 → 取消注册
6. 90 秒未心跳 → 剔除服务
```

**Nacos 改进**：
- 支持 AP/CP 切换
- 基于长轮询的推送机制
- 支持配置中心

#### 13. 服务降级与熔断

**答案**：

**概念区分**：
- **熔断**：故障达到阈值，快速失败
- **降级**：熔断后执行备用方案
- **限流**：超过 QPS 限制，拒绝请求

**Hystrix 实现原理**：
```java
@HystrixCommand(fallbackMethod = "fallback")
public Order getOrder(Long id) {
    return orderClient.getOrder(id);
}

public Order fallback(Long id) {
    return new Order(id, "降级数据");
}
```

**Sentinel 实现**：
```java
@SentinelResource(value = "getOrder",
                  fallback = "fallback",
                  blockHandler = "blockHandler")
public Order getOrder(Long id) {
    return orderClient.getOrder(id);
}

// 异常降级
public Order fallback(Long id, Throwable ex) {
    return null;
}

// 限流降级
public Order blockHandler(Long id, BlockException ex) {
    return new Order(id, "系统繁忙");
}
```

**滑动窗口算法**：
```
时间窗口：1 秒
窗口数：10 个（每 100ms 一个）
阈值：50% 失败率

当失败请求数 / 总请求数 > 50%，触发熔断
熔断持续时间：5 秒
5 秒后进入半开状态，允许部分请求通过
```

#### 14. 分布式链路追踪

**答案**：

**核心概念**：
- **TraceId**：整条链路的唯一标识
- **SpanId**：单个调用的标识
- **ParentSpanId**：父调用标识

**Sleuth + Zipkin 实现**：
```java
// 自动注入 TraceId
@Slf4j
@RestController
public class OrderController {
    @Autowired
    private Tracer tracer;

    @GetMapping("/order/{id}")
    public Order getOrder(@PathVariable Long id) {
        // 获取当前 TraceId
        String traceId = tracer.currentSpan().context().traceId();
        log.info("TraceId: {}", traceId);
        return orderService.getOrder(id);
    }
}
```

**SkyWalking 无侵入方案**：
```bash
# Java Agent 方式启动
java -javaagent:skywalking-agent.jar \
     -Dskywalking.agent.service_name=order-service \
     -Dskywalking.collector.backend_service=localhost:11800 \
     -jar app.jar
```

**Trace 传播**：
- HTTP：通过 Header 传递（X-B3-TraceId）
- RPC：通过上下文传递
- MQ：通过 Message Header 传递

#### 15. 配置中心设计

**答案**：

**核心需求**：
- 配置集中管理
- 动态刷新
- 版本控制
- 权限管理

**架构设计**：
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  配置管理台  │ ──► │ 配置中心 Server│ ◄── │  数据库/    │
│  (Web UI)   │     │              │     │  配置仓库    │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
       ┌─────────┐   ┌─────────┐   ┌─────────┐
       │服务 A    │   │服务 B    │   │服务 C    │
       │(客户端)  │   │(客户端)  │   │(客户端)  │
       └─────────┘   └─────────┘   └─────────┘
```

**长轮询机制**（Nacos）：
```java
// 客户端
@ConfigurationPropertiesRefreshScope
@ConfigurationProperties(prefix = "app")
public class AppConfig {
    private String name;
    // getter/setter
}

// 配置变更自动刷新
@RefreshScope
@RestController
public class ConfigController {
    @Value("${app.name}")
    private String appName;
}
```

**配置加密**：
```yaml
# 数据库密码加密
spring:
  datasource:
    password: '{cipher}A1B2C3D4...'
```

---

### 第五部分：系统设计与场景题

#### 16. Feed 流系统设计

**答案**：

**Feed 流模式**：

| 模式 | 描述 | 适用场景 |
|------|------|----------|
| **推模式** | 发件人推送给所有粉丝 | 粉丝少（<1000） |
| **拉模式** | 收件人从关注列表拉取 | 粉丝多（大 V） |
| **推拉结合** | 普通用户推，大 V 拉 | 微博、Twitter |

**推模式架构**：
```
用户发微博
    ↓
写入自己的发件箱
    ↓
推送给粉丝的收件箱（Redis List）
    ↓
粉丝读取自己的收件箱
```

**推拉结合**：
```java
public void publishPost(Long userId, Post post) {
    // 写入发件箱
    postRepository.save(post);

    // 获取粉丝列表
    List<Long> followers = fanService.getFans(userId);

    // 分组处理
    List<Long> normalFans = new ArrayList<>();
    List<Long> vipFans = new ArrayList<>();

    for (Long fanId : followers) {
        User fan = userService.getById(fanId);
        if (fan.getFollowerCount() > 10000) {
            vipFans.add(fanId); // 大 V 不推
        } else {
            normalFans.add(fanId);
        }
    }

    // 推给普通粉丝
    redisTemplate.opsForList().rightPushAll(
        "inbox:" + String.join(",", normalFans),
        post.getId()
    );
}

public List<Post> getFeed(Long userId) {
    // 拉取收件箱
    List<Long> postIds = redisTemplate.opsForList()
        .range("inbox:" + userId, 0, 50);

    // 补充关注的大 V 的动态
    List<Long> vipPosts = vipFeedService.pull(userId);
    postIds.addAll(vipPosts);

    return postRepository.getByIds(postIds);
}
```

#### 17. 优惠券高并发设计

**答案**：

**架构设计**：
```
用户请求
    ↓
网关层（限流、防刷）
    ↓
优惠券服务（Redis 预扣减）
    ↓
MQ 异步创建券
    ↓
数据库最终扣减
```

**核心实现**：

**1. Redis 预扣减**
```java
public boolean grabCoupon(Long couponId, Long userId) {
    String stockKey = "coupon:stock:" + couponId;

    // Lua 脚本保证原子性
    String script = """
        local stock = tonumber(redis.call('get', KEYS[1]))
        if stock <= 0 then
            return 0
        end

        local takenKey = KEYS[2]
        if redis.call('exists', takenKey) == 1 then
            return -1  -- 已领取
        end

        redis.call('decr', KEYS[1])
        redis.call('setex', takenKey, 86400, '1')
        return 1
    """;

    Long result = redisTemplate.execute(
        new DefaultRedisScript<>(script, Long.class),
        Arrays.asList(stockKey, "coupon:taken:" + couponId + ":" + userId)
    );

    if (result == 1) {
        // 发送 MQ 消息
        mqTemplate.send("coupon.grab", new CouponEvent(couponId, userId));
        return true;
    } else if (result == -1) {
        throw new BusinessException("每人限领一张");
    } else {
        throw new BusinessException("已抢光");
    }
}
```

**2. 防刷策略**
```java
// 1. 设备指纹限流
String deviceId = deviceService.getDeviceId(request);
if (rateLimiter.tryAcquire("device:" + deviceId, 10, 60)) {
    // 允许
} else {
    throw new BusinessException("操作太频繁");
}

// 2. 黑名单检查
if (blacklistService.isBlack(userId)) {
    throw new BusinessException("无资格领取");
}

// 3. 验证码
if (!captchaService.verify(captcha)) {
    throw new BusinessException("验证码错误");
}
```

**3. 库存回补**
```java
// 超时未支付，回补库存
@Scheduled(cron = "0 */5 * * * ?")
public void rollbackExpiredCoupon() {
    List<Long> expiredIds = couponRepository.findExpired(30, TimeUnit.MINUTES);
    for (Long couponId : expiredIds) {
        redisTemplate.opsForValue().increment("coupon:stock:" + couponId);
    }
}
```

#### 18. 在线人数统计系统

**答案**：

**方案一：Redis Bitmap**
```java
// 按分钟统计
public void recordVisit(String page, Long userId) {
    String key = "visit:" + page + ":" + System.currentTimeMillis() / 60000;
    redisTemplate.opsForValue().setBit(key, userId, true);
}

// 统计总数
public Long countVisit(String page) {
    String pattern = "visit:" + page + ":*";
    Set<String> keys = redisTemplate.keys(pattern);

    // BitOp OR 合并
    redisTemplate.execute((RedisCallback<Long>) conn -> {
        for (String key : keys) {
            conn.bitOp(BitOp.OR, "result".getBytes(), key.getBytes());
        }
        return conn.bitCount("result".getBytes());
    });
}
```

**方案二：Redis HyperLogLog**
```java
// 添加用户
public void addVisit(String page, Long userId) {
    String key = "visit:hll:" + page;
    redisTemplate.opsForHyperLogLog().add(key, userId.toString());
}

// 统计 UV
public Long countVisit(String page) {
    return redisTemplate.opsForHyperLogLog()
        .size("visit:hll:" + page);
}
```

**方案三：时间轮 + 本地缓存**
```java
// 本地缓存 + 异步上报
ConcurrentHashMap<String, AtomicInteger> counters = new ConcurrentHashMap<>();

public void recordVisit(String page) {
    counters.computeIfAbsent(page, k -> new AtomicInteger(0))
        .incrementAndGet();
}

// 每秒上报
@Scheduled(fixedRate = 1000)
public void report() {
    counters.forEach((page, count) -> {
        int num = count.getAndSet(0);
        if (num > 0) {
            redisTemplate.opsForValue()
                .increment("visit:total:" + page, num);
        }
    });
}
```

#### 19. 异步任务调度系统

**答案**：

**架构设计**：
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  任务管理台  │ ──► │ 调度中心     │ ──► │ 数据库      │
│  (Web UI)   │     │ (分布式)     │     │ (任务存储)  │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
       ┌─────────┐   ┌─────────┐   ┌─────────┐
       │执行器 A  │   │执行器 B  │   │执行器 C  │
       └─────────┘   └─────────┘   └─────────┘
```

**数据库设计**：
```sql
CREATE TABLE job_info (
    id BIGINT PRIMARY KEY,
    job_name VARCHAR(100),
    cron_expression VARCHAR(50),
    handler_class VARCHAR(200),
    status TINYINT DEFAULT 1,  -- 1:启用 0:禁用
    last_execute_time DATETIME,
    next_execute_time DATETIME,
    retry_times INT DEFAULT 3,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_log (
    id BIGINT PRIMARY KEY,
    job_id BIGINT,
    execute_time DATETIME,
    status TINYINT,  -- 1:成功 0:失败
    error_msg TEXT,
    retry_count INT DEFAULT 0
);
```

**核心实现**：
```java
@Component
public class JobScheduler {

    @Scheduled(cron = "0/5 * * * * ?")
    public void schedule() {
        // 获取待执行任务
        List<JobInfo> jobs = jobRepository.findReadyJobs();

        for (JobInfo job : jobs) {
            // 分布式锁
            String lockKey = "job:lock:" + job.getId();
            boolean locked = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, "1", 30, TimeUnit.SECONDS);

            if (Boolean.TRUE.equals(locked)) {
                try {
                    executeJob(job);
                } finally {
                    redisTemplate.delete(lockKey);
                }
            }
        }
    }

    private void executeJob(JobInfo job) {
        try {
            // 反射执行
            Object handler = applicationContext.getBean(job.getHandlerClass());
            handler.execute();

            // 记录成功日志
            jobLogRepository.success(job.getId());
        } catch (Exception e) {
            // 失败重试
            handleRetry(job, e);
        }
    }

    private void handleRetry(JobInfo job, Exception e) {
        int retryCount = jobLogRepository.getRetryCount(job.getId());
        if (retryCount < job.getRetryTimes()) {
            // 延迟重试
            mqTemplate.sendDelayed("job.retry", job, 5, TimeUnit.SECONDS);
        } else {
            // 超过最大重试次数，告警
            alertService.send(job, e);
        }
    }
}
```

---

### 第六部分：Java 进阶与 JVM

#### 20. G1 vs CMS 垃圾回收器

**答案**：

**对比表**：

| 特性 | CMS | G1 |
|------|-----|-----|
| 算法 | 标记 - 清除 | 标记 - 整理 + 复制 |
| 内存结构 | 分代（连续） | Region（不连续） |
| GC 停顿 | 较长 | 可控（< 500ms） |
| 适用堆大小 | <4GB | >6GB |
| Full GC | 会退化 | 基本避免 |

**G1 优势**：
1. **可预测停顿**：设置 `-XX:MaxGCPauseMillis=200`
2. **避免碎片**：整理算法
3. **高效 Region**：Humongous 区处理大对象

**G1 避免 Full GC**：
```bash
# 关键参数
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:G1HeapRegionSize=16m
-XX:InitiatingHeapOccupancyPercent=45  # 触发并发标记阈值
```

#### 21. 双亲委派模型

**答案**：

**委派流程**：
```
自定义 ClassLoader
      ↓
App ClassLoader
      ↓
Ext ClassLoader
      ↓
Bootstrap ClassLoader
```

**打破双亲委派**：
```java
public class MyClassLoader extends ClassLoader {
    @Override
    protected Class<?> loadClass(String name, boolean resolve)
            throws ClassNotFoundException {
        // 1. 先自己加载（不委派）
        synchronized (getClassLoadingLock(name)) {
            Class<?> c = findLoadedClass(name);
            if (c == null) {
                try {
                    c = findClass(name); // 自定义加载
                } catch (ClassNotFoundException e) {
                    c = super.loadClass(name, resolve); // 再委派
                }
            }
            if (resolve) {
                resolveClass(c);
            }
            return c;
        }
    }
}
```

**应用场景**：
- JDBC SPI 加载
- Tomcat 隔离不同 Web 应用的类
- 热部署框架

#### 22. OOM 排查步骤

**答案**：

**排查流程**：
```
1. 保留现场
   - 配置 -XX:+HeapDumpOnOutOfMemoryError
   - 自动 dump 到指定目录

2. 分析 Dump 文件
   - MAT（Memory Analyzer Tool）
   - JProfiler
   - VisualVM

3. 定位问题
   - 查看 Histogram（对象统计）
   - 查看 Dominator Tree（支配树）
   - 分析 GC Roots

4. 解决方案
   - 代码修复（内存泄漏）
   - 增加堆内存
   - 优化数据结构
```

**常见 OOM 类型**：
```bash
# Java 堆溢出
java.lang.OutOfMemoryError: Java heap space

# 元空间溢出
java.lang.OutOfMemoryError: Metaspace

# 无法创建线程
java.lang.OutOfMemoryError: unable to create new native thread

# 直接内存溢出
java.lang.OutOfMemoryError: Direct buffer memory
```

#### 23. ThreadLocal 原理与内存泄漏

**答案**：

**原理**：
```java
// 每个 Thread 有 ThreadLocalMap
class Thread {
    ThreadLocalMap threadLocals;
}

// ThreadLocalMap 存储键值对
class ThreadLocalMap {
    static class Entry extends WeakReference<ThreadLocal<?>> {
        Object value;  // 值强引用
    }

    Entry[] table;
}
```

**内存泄漏原因**：
```
ThreadLocal（弱引用） → null（GC 后）
           ↓
       Entry.value（强引用） → 对象（无法回收）
```

**正确使用**：
```java
// 使用 try-finally 清理
private static final ThreadLocal<User> userHolder = new ThreadLocal<>();

public void process() {
    try {
        userHolder.set(currentUser);
        // 业务逻辑
    } finally {
        userHolder.remove();  // 必须清理！
    }
}
```

#### 24. 锁升级过程

**答案**：

**升级流程**：
```
无锁 → 偏向锁 → 轻量级锁 → 重量级锁
```

**1. 偏向锁**：
- 目标：减少同一线程获取锁的开销
- 实现：对象头记录线程 ID
- 撤销：有其他线程竞争时升级为轻量级锁

**2. 轻量级锁**：
- 目标：无竞争时避免 OS 互斥量开销
- 实现：CAS + 自旋
- 升级：自旋超过阈值或有多个线程竞争

**3. 重量级锁**：
- 目标：多线程竞争场景
- 实现：依赖 OS Mutex
- 特点：线程阻塞，开销大

**对象头结构**（64 位 JVM）：
```
|--------------------------------------------------------------|
|                     Mark Word (64 bits)                       |
|--------------------------------------------------------------|
|  unused:25 | hash:31 | unused:1 | age:4 | lock_bits:2 | biased:1 |
|--------------------------------------------------------------|
```

---

## 面试技巧总结

### 回答框架（STAR 法则）

- **S**ituation：描述背景
- **T**ask：说明任务
- **A**ction：你的行动
- **R**esult：取得的结果

### 技术深度展示

1. **从 What 到 Why**：不仅说是什么，还要解释为什么
2. **从原理到实践**：理论结合实际项目经验
3. **从单一到系统**：从点到面，展现系统思维

### 常见问题应对

| 问题类型 | 应对策略 |
|----------|----------|
| 不会的问题 | 诚实承认 + 尝试推理 |
| 场景设计题 | 先问清楚需求 + 分步骤设计 |
| 算法题 | 先说思路 + 写代码 + 测试 |
| 项目深挖 | 提前准备 + 数据支撑 |

---

> **说明**：本套题侧重于实战场景和深度原理，建议结合自身项目经验深入理解，而非死记硬背。
