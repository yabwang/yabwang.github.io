# Java 后端面试模拟题

> 本模拟题集参考大厂 Java 后端开发面试风格，涵盖 Java 基础、并发编程、数据库、框架、分布式系统设计等内容，适合面试前复习使用。

## 目录

- [一面：Java 基础 + 数据库](#一面-java-基础--数据库)
- [二面：框架 + 分布式系统](#二面框架--分布式系统)
- [三面：系统设计 + 算法](#三面系统设计--算法)
- [参考答案与解析](#参考答案与解析)

---

## 一面：Java 基础 + 数据库

### 一、Java 基础

#### 1. HashMap 的底层实现原理是什么？JDK 1.7 和 1.8 有什么区别？

**考察点**：集合框架、数据结构

#### 2. 谈谈你对 Java 内存模型（JMM）的理解

**考察点**：JVM、并发编程基础

#### 3. `volatile` 关键字的作用是什么？它能保证原子性吗？

**考察点**：并发编程、内存语义

### 二、并发编程

#### 4. ThreadPoolExecutor 的核心参数有哪些？拒绝策略有哪几种？

**考察点**：线程池、并发工具

#### 5. 谈谈你对 AQS（AbstractQueuedSynchronizer）的理解

**考察点**：并发包核心原理

#### 6. `ConcurrentHashMap` 如何保证线程安全？1.7 和 1.8 有什么改进？

**考察点**：并发集合、锁优化

### 三、MySQL 数据库

#### 7. MySQL 的索引数据结构是什么？为什么选择 B+ 树？

**考察点**：数据库索引原理

#### 8. 什么是事务隔离级别？MySQL 默认隔离级别是什么？

**考察点**：事务、并发控制

#### 9. 慢 SQL 如何排查和优化？

**考察点**：实战经验、性能优化

### 四、Redis

#### 10. Redis 有哪些数据类型？分别适用于什么场景？

**考察点**：Redis 基础

#### 11. Redis 持久化机制有哪些？RDB 和 AOF 有什么区别？

**考察点**：数据持久化

---

## 二面：框架 + 分布式系统

### 一、Spring 框架

#### 12. Spring Bean 的生命周期是什么？

**考察点**：Spring 核心原理

#### 13. Spring 事务传播机制有哪些？`@Transactional` 失效的场景有哪些？

**考察点**：事务管理

#### 14. Spring Boot 自动装配原理是什么？

**考察点**：Spring Boot 核心

### 二、分布式系统

#### 15. 分布式锁的实现方案有哪些？各自的优缺点是什么？

**考察点**：分布式协调

#### 16. 如何保证消息队列的消息不丢失？

**考察点**：消息可靠性

#### 17. 什么是 CAP 理论？Base 理论是什么？

**考察点**：分布式理论基础

#### 18. 接口幂等性如何保证？有哪些实现方案？

**考察点**：接口设计、实战经验

### 三、消息队列

#### 19. 为什么使用消息队列？消息队列的优缺点是什么？

**考察点**：MQ 使用场景

#### 20. 消息积压了怎么处理？

**考察点**：问题排查、应急处理

---

## 三面：系统设计 + 算法

### 一、系统设计

#### 21. 设计一个秒杀系统，你会如何考虑？

**考察点**：高并发架构设计能力

#### 22. 如何设计一个短链接生成系统？

**考察点**：系统设计能力

### 二、算法题

#### 23. 合并 K 个升序链表

**题目描述**：给你一个链表数组，每个链表都已经按升序排列。请你将所有链表合并到一个升序链表中，返回合并后的链表。

**考察点**：链表操作、优先队列、分治思想

#### 24. 寻找两个正序数组的中位数

**题目描述**：给定两个大小分别为 m 和 n 的正序（从小到大）数组 nums1 和 nums2。请你找出并返回这两个正序数组的中位数。

**要求**：时间复杂度 O(log(m+n))

**考察点**：二分查找、数组操作

---

## 参考答案与解析

### 一、Java 基础

#### 1. HashMap 底层实现原理

**答案**：

HashMap 基于**数组 + 链表 + 红黑树**实现（JDK 1.8）。

**JDK 1.7 vs 1.8 区别**：

| 对比项 | JDK 1.7 | JDK 1.8 |
|--------|---------|---------|
| 数据结构 | 数组 + 链表 | 数组 + 链表 + 红黑树 |
| 插入方式 | 头插法 | 尾插法 |
| 扩容机制 | 先扩容再转移 | 先转移再扩容 |
| 链表转树阈值 | - | 链表长度 >= 8 且数组长度 >= 64 |

**核心要点**：
- 数组默认长度为 16，加载因子 0.75
- 当链表长度超过 8 时转为红黑树，小于 6 时退化为链表
- 头插法在扩容时可能导致死循环，1.8 改为尾插法解决

```java
// HashMap put 方法核心逻辑（简化版）
public V put(K key, V value) {
    int hash = hash(key);
    int index = (n - 1) & hash;

    // 桶为空，直接插入
    if (tab[index] == null) {
        tab[index] = newNode(hash, key, value, null);
        return null;
    }

    // 遍历链表或红黑树
    TreeNode<K,V> p = (TreeNode<K,V>)tab[index];
    if (p.hash == hash && ((k = p.key) == key || (key != null && key.equals(k)))) {
        V oldValue = p.val;
        p.val = value; // 覆盖旧值
        return oldValue;
    }
    // ... 链表插入逻辑
}
```

#### 2. Java 内存模型（JMM）

**答案**：

JMM（Java Memory Model）定义了 Java 虚拟机如何与计算机内存协同工作，主要解决**原子性、可见性、有序性**问题。

**核心概念**：
- **主内存**：所有变量存储在主内存中
- **工作内存**：每个线程有自己的工作内存，保存主内存变量的副本
- **内存间交互操作**：read/load/use/assign/store/write 等 8 种原子操作

**三大特性**：
1. **原子性**：一个操作不可中断，要么全部执行成功，要么全部失败
2. **可见性**：一个线程修改共享变量，其他线程能立即看到
3. **有序性**：程序执行顺序按照代码顺序执行

**happens-before 原则**（保证可见性）：
- 程序顺序规则
- 监视器锁规则（解锁 happens-before 加锁）
- volatile 变量规则
- 传递性规则

#### 3. volatile 关键字

**答案**：

`volatile` 有两个作用：
1. **保证可见性**：一个线程修改 volatile 变量，新值立即对其他线程可见
2. **禁止指令重排序**：通过内存屏障禁止特定类型的重排序

**不能保证原子性**：
```java
volatile int count = 0;
// 以下操作不是原子的
count++; // 实际是：读 - 改 - 写 三个操作
```

**底层原理**：
- 通过 Lock 前缀指令实现
- 写操作会刷新到主内存，并使其他 CPU 缓存失效
- 读操作会从主内存重新加载

**使用场景**：
- 状态标记（如 `volatile boolean flag`）
- 双重检查锁定（DCL）单例模式
- 作为轻量级同步机制

```java
// DCL 单例模式
public class Singleton {
    private static volatile Singleton instance;

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    // volatile 防止指令重排序导致 instance 不为 null 但未初始化
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

---

### 二、并发编程

#### 4. ThreadPoolExecutor 核心参数

**答案**：

**7 个核心参数**：
```java
public ThreadPoolExecutor(
    int corePoolSize,              // 核心线程数
    int maximumPoolSize,           // 最大线程数
    long keepAliveTime,            // 空闲线程存活时间
    TimeUnit unit,                 // 时间单位
    BlockingQueue<Runnable> workQueue,  // 工作队列
    ThreadFactory threadFactory,   // 线程工厂
    RejectedExecutionHandler handler    // 拒绝策略
)
```

**4 种拒绝策略**：

| 策略 | 说明 |
|------|------|
| `AbortPolicy` | 直接抛出 RejectedExecutionException（默认） |
| `CallerRunsPolicy` | 由调用线程处理任务 |
| `DiscardPolicy` | 直接丢弃任务，不抛异常 |
| `DiscardOldestPolicy` | 丢弃队列中最老的任务，然后重试 |

**线程池工作流程**：
1. 任务提交，若线程数 < corePoolSize，创建新线程执行
2. 若 >= corePoolSize，放入工作队列
3. 若队列满且线程数 < maximumPoolSize，创建新线程
4. 若队列满且线程数 >= maximumPoolSize，执行拒绝策略

#### 5. AQS 理解

**答案**：

AQS（AbstractQueuedSynchronizer）是一个**抽象队列同步器**，是 JUC 包的核心框架。

**核心设计**：
- **state 状态**：volatile int，表示同步状态
- **FIFO 队列**：CLH 变体，存储等待线程
- **资源共享方式**：Exclusive（独占，如 ReentrantLock）和 Share（共享，如 Semaphore）

**核心方法**：
```java
// 尝试获取资源（子类实现）
protected boolean tryAcquire(int arg)
protected boolean tryRelease(int arg)
protected int tryAcquireShared(int arg)
protected boolean tryReleaseShared(int arg)

// 模板方法（AQS 提供）
public final void acquire(int arg)
public final boolean release(int arg)
public final void acquireShared(int arg)
public final boolean releaseShared(int arg)
```

**实现原理**：
- 线程获取资源失败时，封装为 Node 加入等待队列尾部
- 前驱节点释放资源时，唤醒后继节点
- 自旋 + CAS 保证高效性

**基于 AQS 实现的组件**：
- ReentrantLock
- CountDownLatch
- Semaphore
- ReentrantReadWriteLock

#### 6. ConcurrentHashMap 线程安全

**答案**：

**JDK 1.7**：
- 使用**分段锁**（Segment）机制
- Segment 继承 ReentrantLock
- 每个 Segment 保护一个 HashEntry 数组
- 锁粒度：Segment 级别

**JDK 1.8**：
- 放弃 Segment，采用**数组 + 链表 + 红黑树**
- 锁粒度更细：**桶级别**
- 使用 **CAS + synchronized** 保证并发安全

**核心改进**（1.7 → 1.8）：

| 对比项 | 1.7 | 1.8 |
|--------|-----|-----|
| 锁粒度 | Segment | 桶（Node） |
| 锁实现 | ReentrantLock | synchronized + CAS |
| 数据结构 | 数组 + 链表 | 数组 + 链表 + 红黑树 |
| 并发度 | Segment 数 | 数组长度 |

```java
// put 方法核心逻辑（简化版）
public V put(K key, V value) {
    return putVal(key, value, false);
}

private final V putVal(K key, V value, boolean onlyIfAbsent) {
    // hash 计算
    int hash = spread(key.hashCode());
    int binCount = 0;

    for (Node<K,V>[] tab = table;;) {
        Node<K,V> f; int n, i, fh;

        // 桶为空，CAS 插入
        if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
            if (casTabAt(tab, i, null, new Node<>(hash, key, value)))
                break;
        }
        // 扩容协助
        else if ((fh = f.hash) == MOVED)
            tab = helpTransfer(tab, f);
        else {
            V oldVal = null;
            // 锁住桶头节点
            synchronized (f) {
                if (tabAt(tab, i) == f) {
                    if (fh >= 0) {
                        // 链表遍历
                        binCount = 1;
                        for (Node<K,V> e = f;; ++binCount) {
                            if (e.hash == hash && ((k = e.key) == key || key.equals(k))) {
                                oldVal = e.val;
                                if (!onlyIfAbsent) e.val = value;
                                break;
                            }
                            if ((e = e.next) == null) {
                                e.next = new Node<>(hash, key, value, null);
                                break;
                            }
                        }
                    }
                    // ... 红黑树处理
                }
            }
            if (binCount >= TREEIFY_THRESHOLD)
                treeifyBin(tab, i);
            if (oldVal != null) return oldVal;
            break;
        }
    }
    addCount(1L, binCount);
    return null;
}
```

---

### 三、MySQL 数据库

#### 7. MySQL 索引数据结构

**答案**：

MySQL 使用 **B+ 树**作为索引数据结构。

**为什么选择 B+ 树**：

| 对比 | B 树 | B+ 树 |
|------|-----|-------|
| 数据存储 | 所有节点都存储 | 只存储在叶子节点 |
| 叶子节点 | 无指针 | 有指针连接成链表 |
| 查询效率 | O(log n) | O(log n)，但更稳定 |

**B+ 树优势**：
1. **减少 IO 次数**：非叶子节点只存索引，单节点容纳更多 key，树更矮胖
2. **范围查询高效**：叶子节点形成有序链表
3. **查询效率稳定**：所有查询都要走到叶子节点

```
B+ 树结构示意图（简化）：
           [17]          <- 非叶子节点（只存索引）
         /      \
    [3,8]        [20,25]   <- 索引节点
    /  |  \      /   |   \
[1,2][3,5][8,10][15,18][20,22][25,30] <- 叶子节点（存数据，有链表指针）
```

**聚簇索引 vs 非聚簇索引**：
- **聚簇索引**：数据与索引在一起（InnoDB 的主键索引）
- **非聚簇索引**：索引与数据分离，叶子节点存主键值（需要回表）

#### 8. 事务隔离级别

**答案**：

**SQL 标准定义 4 个隔离级别**：

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|----------|------|------------|------|
| READ UNCOMMITTED | ✓ | ✓ | ✓ |
| READ COMMITTED | × | ✓ | ✓ |
| REPEATABLE READ | × | × | ✓ |
| SERIALIZABLE | × | × | × |

**MySQL 默认隔离级别**：`REPEATABLE READ`

**三种并发问题**：
1. **脏读**：读到未提交的数据
2. **不可重复读**：同一事务内多次读取结果不一致
3. **幻读**：同一事务内多次查询，结果集数量不一致

**MVCC 实现原理**：
- 每行记录有隐藏列：DB_TRX_ID（最近修改事务 ID）、DB_ROLL_PTR（回滚指针）
- Read View：事务启动时生成的视图，包含活跃事务列表
- Undo Log：记录历史版本，用于回滚和 MVCC

```sql
-- 查看和设置隔离级别
SELECT @@tx_isolation;
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

#### 9. 慢 SQL 排查和优化

**答案**：

**排查流程**：

1. **开启慢查询日志**
```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- 超过 1 秒视为慢查询
```

2. **分析慢查询**
```bash
mysqldumpslow -s t -t 10 /var/log/mysql/slow-query.log
pt-query-digest /var/log/mysql/slow-query.log
```

3. **EXPLAIN 分析执行计划**
```sql
EXPLAIN SELECT * FROM users WHERE age > 25;
```

**关键优化手段**：

| 优化方向 | 具体措施 |
|----------|----------|
| 索引优化 | 创建合适索引、避免索引失效 |
| SQL 改写 | 避免 SELECT *、减少 JOIN、优化子查询 |
| 表结构 | 选择合适数据类型、分区表 |
| 架构层面 | 读写分离、分库分表、缓存 |

**索引失效常见场景**：
```sql
-- ❌ 对索引列使用函数
SELECT * FROM users WHERE YEAR(create_time) = 2024;

-- ❌ LIKE 以%开头
SELECT * FROM users WHERE name LIKE '%张%';

-- ❌ 隐式类型转换
SELECT * FROM users WHERE phone = 13800138000; -- phone 是 VARCHAR

-- ❌ 违反最左前缀原则
SELECT * FROM users WHERE name = '张三'; -- 索引 (age, name) 失效
```

---

### 四、Redis

#### 10. Redis 数据类型及场景

**答案**：

| 数据类型 | 说明 | 典型场景 |
|----------|------|----------|
| String | 字符串 | 缓存、计数器、分布式锁 |
| List | 列表 | 消息队列、最新动态 |
| Hash | 哈希 | 对象存储、购物车 |
| Set | 集合 | 去重、好友关系 |
| ZSet | 有序集合 | 排行榜、延迟队列 |

**高级数据类型**：
- **HyperLogLog**：基数统计（UV 统计）
- **Bitmap**：位图（签到、状态标记）
- **Geospatial**：地理位置（附近的人）
- **Stream**：消息流（Redis 5.0+）

**使用示例**：
```bash
# 计数器
INCR article:123:views

# 分布式锁
SET lock:resource1 "uuid" NX PX 30000

# 排行榜
ZADD leaderboard 100 "user1"
ZREVRANGE leaderboard 0 9 WITHSCORES

# 购物车
HSET cart:user1 product1 2
HGETALL cart:user1

# 共同好友
SINTER friends:user1 friends:user2
```

#### 11. Redis 持久化机制

**答案**：

**RDB（Redis Database）**：
- 定期生成数据快照
- 触发条件：save/bgsave 配置
- 优点：文件紧凑、恢复快
- 缺点：可能丢失最后一次快照后的数据

**AOF（Append Only File）**：
- 记录每次写操作命令
- 重写机制压缩文件大小
- 优点：数据更安全
- 缺点：文件较大、恢复慢

**对比**：

| 对比项 | RDB | AOF |
|--------|-----|-----|
| 数据安全性 | 较低 | 较高 |
| 文件大小 | 小 | 大 |
| 恢复速度 | 快 | 慢 |
| 性能影响 | 集中 | 分散 |

**推荐方案**：混合持久化（Redis 4.0+）
- RDB 做镜像 + AOF 做增量
- 兼顾恢复速度和数据安全性

```conf
# Redis 配置示例
# RDB
save 900 1
save 300 10
save 60 10000

# AOF
appendonly yes
appendfsync everysec  # everysec/always/no
```

---

### 五、Spring 框架

#### 12. Spring Bean 生命周期

**答案**：

**完整生命周期流程**：

```
1. 实例化（Instantiation）
   ↓
2. 属性赋值（Populate）
   ↓
3. BeanNameAware.setBeanName()
   ↓
4. BeanFactoryAware.setBeanFactory()
   ↓
5. ApplicationContextAware.setApplicationContext()
   ↓
6. BeanPostProcessor.postProcessBeforeInitialization()
   ↓
7. @PostConstruct 标注的方法
   ↓
8. InitializingBean.afterPropertiesSet()
   ↓
9. 自定义 init-method
   ↓
10. BeanPostProcessor.postProcessAfterInitialization()
    ↓
11. Bean 就绪，可以使用
    ↓
12. 容器关闭
    ↓
13. @PreDestroy 标注的方法
    ↓
14. DisposableBean.destroy()
    ↓
15. 自定义 destroy-method
```

**简化记忆**：实例化 → 属性填充 → Aware 回调 → 前置处理 → 初始化 → 后置处理 → 使用 → 销毁

```java
@Component
public class MyBean implements InitializingBean, DisposableBean {

    @PostConstruct
    public void postConstruct() {
        System.out.println("@PostConstruct");
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("afterPropertiesSet");
    }

    @PreDestroy
    public void preDestroy() {
        System.out.println("@PreDestroy");
    }

    @Override
    public void destroy() throws Exception {
        System.out.println("destroy");
    }
}
```

#### 13. Spring 事务传播机制

**答案**：

**7 种传播机制**：

| 传播机制 | 说明 |
|----------|------|
| REQUIRED（默认） | 支持当前事务，没有则新建 |
| SUPPORTS | 支持当前事务，没有则以非事务运行 |
| MANDATORY | 必须存在事务，否则抛异常 |
| REQUIRES_NEW | 新建事务，挂起当前事务 |
| NOT_SUPPORTED | 非事务运行，挂起当前事务 |
| NEVER | 非事务运行，存在事务则抛异常 |
| NESTED | 嵌套事务，基于 SavePoint |

**@Transactional 失效场景**：

1. **自调用问题**（同类方法调用）
```java
// ❌ 失效：this.methodB() 不经过代理
public void methodA() {
    methodB();
}
@Transactional
public void methodB() {}
```

2. **非 public 方法**
```java
// ❌ 失效
@Transactional
protected void method() {}
```

3. **异常被吞**
```java
// ❌ 失效：异常被 catch 未抛出
try {
    // ...
} catch (Exception e) {
    log.error("error", e);
}
```

4. **异常类型不匹配**
```java
// ❌ 默认只回滚 RuntimeException 和 Error
@Transactional
public void method() throws Exception {
    throw new Exception(); // 不回滚
}
// ✅ 指定异常类型
@Transactional(rollbackFor = Exception.class)
```

#### 14. Spring Boot 自动装配原理

**答案**：

**核心注解**：`@SpringBootApplication`

```java
@SpringBootConfiguration
@EnableAutoConfiguration  // 关键
@ComponentScan
public @interface SpringBootApplication {}
```

**自动装配流程**：

1. `@EnableAutoConfiguration` 通过 `@Import` 导入 `AutoConfigurationImportSelector`
2. 读取 `META-INF/spring.factories`（或 3.x 的 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`）
3. 根据 `@Conditional` 条件筛选配置类
4. 加载符合条件的 Bean 定义

**条件注解**：
- `@ConditionalOnClass`：类路径存在某类
- `@ConditionalOnBean`：容器中存在某 Bean
- `@ConditionalOnProperty`：配置文件中存在某属性
- `@ConditionalOnMissingBean`：容器中不存在某 Bean

**自定义 Starter**：
```
my-spring-boot-starter/
├── my-spring-boot-starter-autoconfigure/
│   └── src/main/java/
│       └── META-INF/spring.factories
└── my-spring-boot-starter/
```

```properties
# spring.factories
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.MyAutoConfiguration
```

---

### 六、分布式系统

#### 15. 分布式锁实现方案

**答案**：

| 方案 | 实现方式 | 优点 | 缺点 |
|------|----------|------|------|
| 数据库 | 唯一索引/乐观锁 | 简单 | 性能差、不可重入 |
| Redis | SETNX/Redlock | 性能好 | 需处理超时、主从切换 |
| ZooKeeper | 临时顺序节点 | 可靠性高 | 性能较差、依赖 ZK |

**Redis 分布式锁实现**：
```java
// 加锁
String script = """
    if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
    else
        return 0
    end
""";

public boolean tryLock(String lockKey, String uuid, long expireTime) {
    return redisTemplate.execute(
        connection -> connection.set(
            lockKey.getBytes(),
            uuid.getBytes(),
            Expiration.from(expireTime, MILLISECONDS),
            SET_IF_ABSENT
        ),
        false
    );
}

// 释放锁（Lua 脚本保证原子性）
public boolean unlock(String lockKey, String uuid) {
    return redisTemplate.execute(
        new DefaultRedisScript<>(script, Boolean.class),
        Collections.singletonList(lockKey),
        uuid
    );
}
```

**Redlock 算法**（Redis 官方推荐）：
1. 获取当前时间
2. 依次向 N 个 Redis 节点申请锁
3. 获取锁的总时间 < 锁有效期 且 N/2+1 成功
4. 锁失效时间 = 原失效时间 - 获取锁耗时

#### 16. 消息不丢失保证

**答案**：

**消息丢失的 3 个环节**：

1. **生产者发送丢失**
   - 解决：确认机制（Confirm）、事务消息
   ```java
   // RabbitMQ
   channel.confirmSelect();
   channel.addConfirmListener((seq, multiple) -> {
       // 确认成功
   });
   ```

2. **MQ 存储丢失**
   - 解决：持久化队列、持久化消息
   ```java
   AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
       .deliveryMode(2) // 持久化
       .build();
   ```

3. **消费者消费丢失**
   - 解决：手动 ACK、幂等处理
   ```java
   // 手动 ACK
   channel.basicConsume(queue, false,
       (consumerTag, delivery) -> {
           try {
               // 处理消息
               channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
           } catch (Exception e) {
               channel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, true);
           }
       }, ...);
   ```

**Kafka 可靠性配置**：
```properties
# 生产者
acks=all
retries=3
max.in.flight.requests.per.connection=1

# Broker
unclean.leader.election.enable=false
min.insync.replicas=2

# 消费者
enable.auto.commit=false
```

#### 17. CAP 和 BASE 理论

**答案**：

**CAP 理论**：分布式系统最多同时满足 2 个
- **Consistency**：所有节点数据一致
- **Availability**：每次请求都能得到响应
- **Partition tolerance**：分区故障时仍能运行

**实际选择**：
- **CP**：ZooKeeper、HBase（保证一致性）
- **AP**：Eureka、Cassandra（保证可用性）
- **Base**：大多数互联网应用

**BASE 理论**（对 CAP 的补充）：
- **Basically Available**：基本可用
- **Soft state**：软状态（允许中间状态）
- **Eventually consistent**：最终一致性

**实现最终一致性的方案**：
- 消息队列
- TCC（Try-Confirm-Cancel）
- Saga 模式
- 本地消息表

#### 18. 接口幂等性保证

**答案**：

**幂等性**：同一操作多次执行，结果相同。

**常见实现方案**：

| 方案 | 说明 | 适用场景 |
|------|------|----------|
| 数据库唯一索引 | 插入重复数据抛异常 | 防重复提交 |
| 乐观锁 | version 字段 | 更新操作 |
| Token 机制 | 提交前获取 Token，提交后删除 | 表单提交 |
| 分布式锁 | 基于业务 key 加锁 | 支付、下单 |
| 状态机 | 状态流转检查 | 订单状态变更 |

**Token 机制实现**：
```java
// 1. 获取 Token
@GetMapping("/token")
public String getToken() {
    String token = UUID.randomUUID().toString();
    redisTemplate.opsForValue().set("token:" + token, "1", 5, MINUTES);
    return token;
}

// 2. 提交时验证 Token
@PostMapping("/submit")
public Result submit(@RequestParam String token, ...) {
    Boolean deleted = redisTemplate.delete("token:" + token);
    if (Boolean.FALSE.equals(deleted)) {
        throw new BusinessException("重复提交或 Token 已过期");
    }
    // 处理业务
    return Result.success();
}
```

**乐观锁实现**：
```java
// 更新订单状态
@Update("UPDATE orders SET status = #{newStatus}, version = version + 1 " +
        "WHERE id = #{id} AND status = #{oldStatus} AND version = #{version}")
int updateOrder(@Param("id") Long id,
                @Param("oldStatus") String oldStatus,
                @Param("newStatus") String newStatus,
                @Param("version") Integer version);
```

---

### 七、消息队列

#### 19. 为什么使用消息队列

**答案**：

**三大核心作用**：

1. **解耦**
   - 生产者和消费者互不依赖
   - 便于系统扩展和维护

2. **异步**
   - 非核心流程异步处理
   - 提升响应速度

3. **削峰**
   - 缓冲突发流量
   - 保护下游系统

**典型场景**：
- 用户注册后发送邮件/短信
- 订单创建后通知库存、物流
- 日志收集处理
- 定时任务调度

**缺点**：
- 系统复杂度增加
- 数据一致性问题
- 消息丢失/重复风险

#### 20. 消息积压处理

**答案**：

**积压原因分析**：
1. 消费者故障/处理能力不足
2. 消息生产速度远大于消费速度
3. 消费者处理逻辑变慢（如 DB 慢查询）

**紧急处理流程**：

1. **临时扩容消费者**
   ```bash
   # 增加消费者实例
   kubectl scale deployment consumer --replicas=10
   ```

2. **排查消费慢的原因**
   - 检查消费者日志
   - 检查数据库慢查询
   - 检查是否有死锁/阻塞

3. **临时方案：丢弃非核心消息**
   ```java
   // 批量消费，只处理部分消息
   if (messageQueue.size() > 10000) {
       // 丢弃部分非重要消息
   }
   ```

4. **修复后恢复**
   - 修复 Bug 后重启消费者
   - 逐步增加消费者数量

**预防措施**：
- 设置消息 TTL
- 监控队列积压告警
- 消费者限流保护

---

### 八、系统设计

#### 21. 秒杀系统设计

**答案**：

**核心挑战**：
- 瞬时高并发（QPS 可能达 10 万+）
- 库存不能超卖
- 防止黄牛刷单

**整体架构**：

```
用户请求
    ↓
CDN 静态资源缓存
    ↓
网关层（限流、鉴权）
    ↓
秒杀服务（Redis 预减库存）
    ↓
MQ 异步下单
    ↓
订单服务 + 数据库
```

**关键设计点**：

1. **页面静态化**
   - HTML 缓存到 CDN
   - JS 动态请求库存

2. **限流**
   - 网关层限流（令牌桶/漏桶）
   - 用户维度限流（同一用户 N 秒内只能请求一次）

3. **库存预热**
   ```java
   // 活动开始前，库存加载到 Redis
   redisTemplate.opsForValue().set("stock:" + itemId, stockNum);
   ```

4. **Redis 预减库存**
   ```java
   public boolean reduceStock(Long itemId) {
       Long stock = redisTemplate.opsForValue().decrement("stock:" + itemId);
       if (stock < 0) {
           redisTemplate.opsForValue().increment("stock:" + itemId);
           return false;
       }
       return true;
   }
   ```

5. **MQ 异步下单**
   - 秒杀成功后发送消息
   - 订单服务消费消息创建订单
   - 真正的数据库扣减

6. **防刷单**
   - 验证码
   - 隐藏秒杀地址
   - 同一设备/IP 限流

#### 22. 短链接系统设计

**答案**：

**需求分析**：
- 将长 URL 转换为短 URL
- 支持重定向到原 URL
- 高并发、低延迟

**核心流程**：

```
生成短链：长 URL → Hash/自增 ID → Base62 编码 → 短链接
访问短链：短链接 → 解析 ID → 查询原 URL → 302 重定向
```

**方案一：自增 ID**
```java
// 使用 Redis 自增
Long id = redisTemplate.opsForValue().increment("url:id:counter");
String shortCode = base62Encode(id);
```

**方案二：分布式 ID**
```java
// 雪花算法生成 ID
Long id = snowflake.nextId();
String shortCode = base62Encode(id);
```

**方案三：Hash + 号段**
```java
// MD5 取前 6 位
String hash = MD5(longUrl);
String shortCode = hash.substring(0, 6);
// 冲突则取 7-12 位，依次类推
```

**存储设计**：
```sql
CREATE TABLE short_url (
    id BIGINT PRIMARY KEY,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    long_url VARCHAR(2048) NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    expire_time DATETIME,
    visit_count INT DEFAULT 0,
    INDEX idx_short_code (short_code)
);
```

**缓存策略**：
- 热点短链缓存到 Redis
- TTL 设置为 7 天
- 缓存穿透：布隆过滤器

**Base62 编码**：
```java
private static final String BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

public String base62Encode(long num) {
    StringBuilder sb = new StringBuilder();
    while (num > 0) {
        sb.append(BASE62.charAt((int)(num % 62)));
        num /= 62;
    }
    return sb.reverse().toString();
}
```

---

### 九、算法题

#### 23. 合并 K 个升序链表

**题目**：
```
输入：lists = [[1,4,5],[1,3,4],[2,6]]
输出：[1,1,2,3,4,4,5,6]
解释：链表数组为 [1->4->5, 1->3->4, 2->6]
将它们合并为一个有序链表：1->1->2->3->4->4->5->6
```

**解法一：优先队列**

```java
public ListNode mergeKLists(ListNode[] lists) {
    if (lists == null || lists.length == 0) return null;

    // 小顶堆
    PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);

    // 将每个链表的头节点加入堆
    for (ListNode node : lists) {
        if (node != null) {
            pq.offer(node);
        }
    }

    ListNode dummy = new ListNode(0);
    ListNode curr = dummy;

    while (!pq.isEmpty()) {
        ListNode node = pq.poll();
        curr.next = node;
        curr = node;
        if (node.next != null) {
            pq.offer(node.next);
        }
    }

    return dummy.next;
}
```

**时间复杂度**：O(N log k)，N 为总节点数，k 为链表个数
**空间复杂度**：O(k)

**解法二：分治合并**

```java
public ListNode mergeKLists(ListNode[] lists) {
    if (lists == null || lists.length == 0) return null;
    return merge(lists, 0, lists.length - 1);
}

private ListNode merge(ListNode[] lists, int left, int right) {
    if (left == right) return lists[left];

    int mid = left + (right - left) / 2;
    ListNode l1 = merge(lists, left, mid);
    ListNode l2 = merge(lists, mid + 1, right);

    return mergeTwoLists(l1, l2);
}

private ListNode mergeTwoLists(ListNode l1, ListNode l2) {
    if (l1 == null) return l2;
    if (l2 == null) return l1;

    if (l1.val < l2.val) {
        l1.next = mergeTwoLists(l1.next, l2);
        return l1;
    } else {
        l2.next = mergeTwoLists(l1, l2.next);
        return l2;
    }
}
```

**时间复杂度**：O(N log k)
**空间复杂度**：O(log k) 递归栈

#### 24. 寻找两个正序数组的中位数

**题目**：
```
输入：nums1 = [1,3], nums2 = [2]
输出：2.00000
解释：合并数组 = [1,2,3]，中位数是 2

输入：nums1 = [1,2], nums2 = [3,4]
输出：2.50000
解释：合并数组 = [1,2,3,4]，中位数是 (2 + 3) / 2 = 2.5
```

**解法：二分查找**

核心思想：找两个数组的第 k/2 个元素比较，排除较小的那部分。

```java
public double findMedianSortedArrays(int[] nums1, int[] nums2) {
    int m = nums1.length;
    int n = nums2.length;
    int total = m + n;

    if (total % 2 == 1) {
        return getKthElement(nums1, nums2, total / 2 + 1);
    } else {
        return (getKthElement(nums1, nums2, total / 2) +
                getKthElement(nums1, nums2, total / 2 + 1)) / 2.0;
    }
}

private double getKthElement(int[] nums1, int[] nums2, int k) {
    int m = nums1.length;
    int n = nums2.length;
    int index1 = 0, index2 = 0;

    while (true) {
        // 边界情况
        if (index1 == m) return nums2[index2 + k - 1];
        if (index2 == n) return nums1[index1 + k - 1];
        if (k == 1) return Math.min(nums1[index1], nums2[index2]);

        // 正常情况
        int newIndex1 = Math.min(index1 + k / 2 - 1, m - 1);
        int newIndex2 = Math.min(index2 + k / 2 - 1, n - 1);
        int pivot1 = nums1[newIndex1];
        int pivot2 = nums2[newIndex2];

        if (pivot1 <= pivot2) {
            k -= (newIndex1 - index1 + 1);
            index1 = newIndex1 + 1;
        } else {
            k -= (newIndex2 - index2 + 1);
            index2 = newIndex2 + 1;
        }
    }
}
```

**时间复杂度**：O(log(m+n))
**空间复杂度**：O(1)

**图解思路**：
```
nums1 = [1, 3, 5], nums2 = [2, 4, 6, 8]
找第 4 小的元素（中位数之一）

第一轮：
nums1[1] = 3, nums2[1] = 4
3 < 4，排除 nums1 的前 2 个元素
k = 4 - 2 = 2

第二轮：
nums1[2] = 5, nums2[0] = 2
2 < 5，排除 nums2 的第 1 个元素
k = 2 - 1 = 1

第三轮：
k = 1，返回 min(5, 4) = 4
```

---

## 面试建议

### 技术面试要点

1. **基础扎实**：HashMap、线程池、MySQL 索引、Redis 数据结构等必考
2. **项目经验**：准备 1-2 个深入的项目，能说清楚技术选型和难点
3. **系统设计**：高并发场景（秒杀、短链、Feed 流）要有思路
4. **算法刷题**：LeetCode Hot 100 至少刷 2 遍

### 软技能

1. **沟通表达**：先说思路，再写代码
2. **问题拆解**：复杂问题分步骤解决
3. **边界条件**：考虑空值、极端情况
4. **主动性**：遇到问题主动思考，不要等提示

### 面试准备清单

- [ ] Java 基础：集合、并发、JVM
- [ ] 数据库：MySQL、Redis
- [ ] 框架：Spring、MyBatis
- [ ] 分布式：MQ、Dubbo、ZK
- [ ] 算法：数组、链表、树、动态规划
- [ ] 项目：技术亮点、难点攻克
- [ ] 系统设计：秒杀、短链、排行榜

---

> **说明**：本模拟题集仅供参考，实际面试题目可能因部门、面试官而异。建议结合自身项目和经验深入准备。
