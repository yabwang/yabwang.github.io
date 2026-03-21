---
order: 13
---

# 十、面试准备指南

本章介绍 Java 后端开发的面试准备策略和常见问题。

---

## 10.1 面试流程概览

### 典型面试流程

```
简历筛选 → 技术一面 → 技术二面 → 技术三面 → HR 面 → Offer
   │          │           │           │         │
   │          │           │           │         └─ 谈薪、文化匹配
   │          │           │           └─ 架构设计、项目深挖
   │          │           └─ 技术广度、系统设计
   │          └─ 基础技术、编码能力
   └─ 学历、经历、项目匹配度
```

### 各轮次考察重点

| 轮次 | 时长 | 考察重点 |
|------|------|----------|
| **一面** | 45-60min | Java 基础、并发、JVM、数据库、算法 |
| **二面** | 45-60min | 框架原理、系统设计、项目深挖 |
| **三面** | 45-60min | 架构设计、技术选型、软技能 |
| **HR 面** | 30-45min | 文化匹配、职业规划、薪资期望 |

---

## 10.2 Java 核心考点

### 10.2.1 Java 基础（高频面试题）

**1. HashMap 源码分析**

```java
// 常考问题：
// 1. HashMap 的数据结构？
// 2. 扩容机制是怎样的？
// 3. 为什么线程不安全？
// 4. JDK 1.7 和 1.8 的区别？

// 核心源码分析
public class HashMap<K,V> extends AbstractMap<K,V> implements Map<K,V>, Cloneable, Serializable {

    // 默认容量 16，必须是 2 的幂
    static final int DEFAULT_INITIAL_CAPACITY = 1 << 4;

    // 最大容量
    static final int MAXIMUM_CAPACITY = 1 << 30;

    // 默认负载因子 0.75
    static final float DEFAULT_LOAD_FACTOR = 0.75f;

    // 树化阈值：链表长度 >= 8 转为红黑树
    static final int TREEIFY_THRESHOLD = 8;

    // 链表化阈值：节点数 <= 6 转为链表
    static final int UNTREEIFY_THRESHOLD = 6;

    // put 方法核心逻辑
    public V put(K key, V value) {
        return putVal(hash(key), key, value, false, true);
    }

    final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
        Node<K,V>[] tab; Node<K,V> p; int n, i;

        // 1. 表格未初始化或长度为 0，进行扩容
        if ((tab = table) == null || (n = tab.length) == 0)
            n = (tab = resize()).length;

        // 2. 计算索引位置，该位置为空，直接插入
        if ((p = tab[i = (n - 1) & hash]) == null)
            tab[i] = newNode(hash, key, value, null);
        else {
            Node<K,V> e; K k;

            // 3. 头节点 key 相同，覆盖
            if (p.hash == hash &&
                ((k = p.key) == key || (key != null && key.equals(k))))
                e = p;
            // 4. 红黑树节点，调用树插入方法
            else if (p instanceof TreeNode)
                e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
            else {
                // 5. 链表插入
                for (int binCount = 0; ; ++binCount) {
                    if ((e = p.next) == null) {
                        p.next = newNode(hash, key, value, null);
                        // 链表长度达到阈值，树化
                        if (binCount >= TREEIFY_THRESHOLD - 1)
                            treeifyBin(tab, hash);
                        break;
                    }
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    p = e;
                }
            }

            // key 已存在，覆盖旧值
            if (e != null) {
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }

        ++modCount;
        // 6. 超过阈值，扩容
        if (++size > threshold)
            resize();
        afterNodeInsertion(evict);
        return null;
    }
}
```

**2. ConcurrentHashMap 原理**

```java
// 常考问题：
// 1. 如何保证线程安全？
// 2. JDK 1.7 和 1.8 的区别？
// 3. size() 方法如何实现？

// JDK 1.8 核心实现
public class ConcurrentHashMap<K,V> extends AbstractMap<K,V>
    implements ConcurrentMap<K,V>, Map<K,V>, Serializable {

    // 使用 CAS + synchronized 保证并发安全
    final V putVal(K key, V value, boolean onlyIfAbsent) {
        if (key == null || value == null) throw new NullPointerException();

        int hash = spread(key.hashCode());
        int binCount = 0;

        for (Node<K,V>[] tab = table;;) {
            Node<K,V> f; int n, i, fh;

            // 表格未初始化，进行初始化
            if (tab == null || (n = tab.length) == 0)
                tab = initTable();

            // 计算索引位置，该位置为空，CAS 插入
            else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
                if (casTabAt(tab, i, null,
                             new Node<K,V>(hash, key, value, null)))
                    break;
            }

            // 正在扩容，协助扩容
            else if ((fh = f.hash) == MOVED)
                tab = helpTransfer(tab, f);

            else {
                V oldVal = null;

                // 锁住链表/红黑树的头节点
                synchronized (f) {
                    if (tabAt(tab, i) == f) {
                        if (fh >= 0) {
                            binCount = 1;
                            for (Node<K,V> e = f;; ++binCount) {
                                K ek;
                                if (e.hash == hash &&
                                    ((ek = e.key) == key ||
                                     (ek != null && key.equals(ek)))) {
                                    oldVal = e.val;
                                    if (!onlyIfAbsent)
                                        e.val = value;
                                    break;
                                }
                                Node<K,V> pred = e;
                                if ((e = e.next) == null) {
                                    pred.next = new Node<K,V>(hash, key, value, null);
                                    break;
                                }
                            }
                        }
                        // 树节点处理
                        else if (f instanceof TreeBin) {
                            Node<K,V> p;
                            binCount = 2;
                            if ((p = ((TreeBin<K,V>)f).putTreeVal(hash, key, value)) != null) {
                                oldVal = p.val;
                                if (!onlyIfAbsent)
                                    p.val = value;
                            }
                        }
                    }
                }

                if (binCount != 0) {
                    if (binCount >= TREEIFY_THRESHOLD)
                        treeifyBin(tab, i);
                    if (oldVal != null)
                        return oldVal;
                    break;
                }
            }
        }
        addCount(1L, binCount);
        return null;
    }
}
```

**3. volatile 关键字**

```java
// 常考问题：
// 1. volatile 的作用？
// 2. 如何保证可见性？
// 3. 能保证原子性吗？
// 4. 什么是内存屏障？

// volatile 的两大特性：
// 1. 可见性：一个线程修改变量，其他线程立即可见
// 2. 禁止指令重排序：通过内存屏障实现

public class Singleton {
    // volatile 防止指令重排序
    // 1. 分配内存空间
    // 2. 初始化对象
    // 3. 将 instance 指向内存地址
    // 没有 volatile，2 和 3 可能重排序，导致其他线程拿到未初始化的对象
    private static volatile Singleton instance;

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
}

// volatile 不能保证原子性的例子
public class VolatileTest {
    private volatile int count = 0;

    public void increment() {
        count++;  // 不是原子操作，包含：读 - 改 - 写
    }
    // 需要使用 AtomicInteger 或 synchronized
}
```

### 10.2.2 并发编程

**线程池参数配置**

```java
// 常考问题：
// 1. 线程池的 7 个参数？
// 2. 线程池的工作流程？
// 3. 如何合理配置参数？
// 4. 拒绝策略有哪些？

// ThreadPoolExecutor 构造方法
public ThreadPoolExecutor(
    int corePoolSize,              // 核心线程数
    int maximumPoolSize,           // 最大线程数
    long keepAliveTime,            // 非核心线程空闲存活时间
    TimeUnit unit,                 // 时间单位
    BlockingQueue<Runnable> workQueue,  // 任务队列
    ThreadFactory threadFactory,   // 线程工厂
    RejectedExecutionHandler handler    // 拒绝策略
)

// 推荐配置方式
@Configuration
public class ThreadPoolConfig {

    // CPU 密集型任务：核心线程数 = CPU 核数 + 1
    @Bean("cpuThreadPool")
    public ExecutorService cpuThreadPool() {
        int cores = Runtime.getRuntime().availableProcessors();
        return new ThreadPoolExecutor(
            cores + 1,                    // 核心线程数
            cores + 1,                    // 最大线程数
            60L, TimeUnit.SECONDS,        // 空闲存活时间
            new LinkedBlockingQueue<>(1024),  // 有界队列
            new ThreadFactoryBuilder().setNameFormat("cpu-pool-%d").build(),
            new ThreadPoolExecutor.AbortPolicy()  // 拒绝策略：抛出异常
        );
    }

    // IO 密集型任务：核心线程数 = CPU 核数 * 2
    @Bean("ioThreadPool")
    public ExecutorService ioThreadPool() {
        int cores = Runtime.getRuntime().availableProcessors();
        return new ThreadPoolExecutor(
            cores * 2,                  // 核心线程数
            cores * 2,                  // 最大线程数
            60L, TimeUnit.SECONDS,
            new LinkedBlockingQueue<>(2048),
            new ThreadFactoryBuilder().setNameFormat("io-pool-%d").build(),
            new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略：调用者线程执行
        );
    }

    // 拒绝策略：
    // AbortPolicy：抛出 RejectedExecutionException（默认）
    // CallerRunsPolicy：由调用者线程执行
    // DiscardPolicy：直接丢弃
    // DiscardOldestPolicy：丢弃队列中最老的任务
}
```

**AQS 原理**

```java
// 常考问题：
// 1. AQS 的核心思想？
// 2. ReentrantLock 如何实现？
// 3. 公平锁和非公平锁的区别？

// AQS 核心：一个 volatile int state + FIFO 队列
public abstract class AbstractQueuedSynchronizer
    extends AbstractOwnableSynchronizer
    implements java.io.Serializable {

    // 同步状态（volatile 保证可见性）
    // state = 0 表示无锁
    // state > 0 表示有锁（可重入时累加）
    private volatile int state;

    // FIFO 等待队列
    private transient volatile Node head;
    private transient volatile Node tail;

    // 获取锁（以 ReentrantLock 非公平锁为例）
    final void lock() {
        // CAS 尝试获取锁
        if (compareAndSetState(0, 1))
            setExclusiveOwnerThread(Thread.currentThread());
        else
            acquire(1);  // 失败则进入等待队列
    }

    protected final boolean acquire(int arg) {
        if (!tryAcquire(arg) &&
            acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
            selfInterrupt();
        return true;
    }

    // 尝试获取锁（非公平）
    final boolean nonfairTryAcquire(int acquires) {
        final Thread current = Thread.currentThread();
        int c = getState();

        if (c == 0) {
            // CAS 获取锁，不检查队列（非公平的关键）
            if (compareAndSetState(0, acquires)) {
                setExclusiveOwnerThread(current);
                return true;
            }
        }
        // 可重入
        else if (current == getExclusiveOwnerThread()) {
            int nextc = c + acquires;
            if (nextc < 0) // overflow
                throw new Error("Maximum lock count exceeded");
            setState(nextc);
            return true;
        }
        return false;
    }
}
```

### 10.2.3 JVM

**JVM 内存模型**

```
┌─────────────────────────────────────────────────────────┐
│                      JVM 内存结构                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐         ┌─────────────────┐       │
│  │    新生代       │         │     老年代       │       │
│  │  ┌───────────┐  │         │  ┌───────────┐  │       │
│  │  │   Eden    │  │         │  │           │  │       │
│  │  ├───────────┤  │         │  │           │  │       │
│  │  │ Survivor0 │  │         │  │           │  │       │
│  │  ├───────────┤  │         │  │           │  │       │
│  │  │ Survivor1 │  │         │  │           │  │       │
│  │  └───────────┘  │         │  └───────────┘  │       │
│  │    (8:1:1)      │         │                 │       │
│  └─────────────────┘         └─────────────────┘       │
│         │                       │                       │
│         └───────────┬───────────┘                       │
│                     │                                   │
│                     ▼                                   │
│              ┌─────────────┐                           │
│              │     堆      │                            │
│              │   (Heap)    │                            │
│              └─────────────┘                           │
│                                                         │
│  ┌─────────────────┐         ┌─────────────────┐       │
│  │   虚拟机栈      │         │     方法区       │       │
│  │  (栈帧/局部变量) │         │  (元空间/常量池) │       │
│  └─────────────────┘         └─────────────────┘       │
│                                                         │
│  ┌─────────────────┐                                    │
│  │   程序计数器     │                                    │
│  │   (线程私有)     │                                    │
│  └─────────────────┘                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**GC 算法与垃圾收集器**

```java
// 常考问题：
// 1. 如何判断对象可以回收？
// 2. GC 算法有哪些？
// 3. 各种收集器的特点？
// 4. 如何调优 GC？

// JVM 参数配置示例
// 新生代 + 老年代组合
-Xms4g -Xmx4g                     // 堆初始/最大大小
-Xmn2g                            // 新生代大小
-XX:SurvivorRatio=8               // Eden:Survivor = 8:1:1

// G1 收集器
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200          // 最大 GC 停顿时间目标
-XX:InitiatingHeapOccupancyPercent=45  // 触发并发 GC 的堆占用阈值

// GC 日志
-Xloggc:/var/log/gc.log
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
-XX:+UseGCLogFileRotation
-XX:NumberOfGCLogFiles=5
-XX:GCLogFileSize=50M
```

**OOM 排查实战**

```bash
# 1. 导出堆 dump
jmap -dump:format=b,file=heap.hprof <pid>

# 2. 使用 MAT 分析
# 下载 Eclipse MAT，打开 heap.hprof 文件
# 查看 Histogram（直方图）和 Dominator Tree（支配树）

# 3. 常见 OOM 原因
# - 内存泄漏：静态集合持有对象引用
# - 大对象：一次性加载大量数据
# - 元空间不足：加载过多类

# 4. 线程 dump 分析
jstack <pid> > thread.dump

# 查看线程状态：
# RUNNABLE - 运行中
# BLOCKED - 等待锁
# WAITING - 等待通知
# TIMED_WAITING - 超时等待
# TERMINATED - 已终止
```

---

## 10.3 数据库考点

### MySQL 索引原理

```
B+ 树结构：
                   ┌─────────┐
                   │  10,20  │  非叶子节点（只存索引）
                   └────┬────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
    ┌─────────┐   ┌─────────┐   ┌─────────┐
    │ 5,10    │   │ 15,20   │   │ 25,30   │  叶子节点（存数据）
    ├─────────┤   ├─────────┤   ├─────────┤
    │ data    │   │ data    │   │ data    │
    └─────────┘   └─────────┘   └─────────┘
        │             │             │
        └─────────────┴─────────────┘
              叶子节点间有指针相连（范围查询优化）

特点：
- 非叶子节点只存索引，不存数据
- 所有数据都存储在叶子节点
- 叶子节点间有指针相连，便于范围查询
- 树高度一般为 3-4 层（1000 万数据约 3 层）
```

### 事务隔离级别

```java
// 常考问题：
// 1. 事务的四大特性（ACID）？
// 2. 四种隔离级别及问题？
// 3. MVCC 如何实现？
// 4. 什么是间隙锁？

// MySQL 隔离级别
// 1. READ UNCOMMITTED    - 读未提交（脏读、不可重复读、幻读）
// 2. READ COMMITTED      - 读提交（不可重复读、幻读）
// 3. REPEATABLE READ     - 可重复读（幻读）【MySQL 默认】
// 4. SERIALIZABLE        - 串行化（无问题，性能差）

// MVCC 实现原理（可重复读）
// 每行记录有隐藏列：
// - DB_TRX_ID: 最近修改事务 ID
// - DB_ROLL_PTR: 回滚指针

// Read View（读视图）：
// - m_ids: 活跃事务 ID 列表
// - min_trx_id: 最小活跃事务 ID
// - max_trx_id: 最大事务 ID + 1

// 可见性判断：
// trx_id < min_trx_id      → 可见（历史版本）
// trx_id >= max_trx_id     → 不可见（未来版本）
// min_trx_id <= trx_id < max_trx_id
//   - trx_id in m_ids      → 不可见（活跃事务）
//   - trx_id not in m_ids  → 可见（已提交）
```

---

## 10.4 Redis 考点

### 数据结构与应用场景

| 数据结构 | 底层实现 | 应用场景 |
|----------|----------|----------|
| String | 动态字符串 SDS | 缓存、计数器、分布式锁 |
| List | 双向链表 | 消息队列、最新列表 |
| Hash | 哈希表 | 对象存储、购物车 |
| Set | 哈希表 | 去重、共同好友 |
| ZSet | 跳表 + 字典 | 排行榜、延时队列 |

### 持久化机制

```yaml
# RDB（快照）
# 优点：文件小、恢复快
# 缺点：可能丢失数据
save 900 1        # 900 秒内 1 次修改
save 300 10       # 300 秒内 10 次修改
save 60 10000     # 60 秒内 10000 次修改

# AOF（追加日志）
# 优点：数据更安全
# 缺点：文件大、恢复慢
appendonly yes
appendfsync everysec  # 每秒同步（推荐）
                        # always: 每次写入都同步
                        # no: 操作系统决定
```

### 缓存三剑客

| 问题 | 描述 | 解决方案 |
|------|------|----------|
| **缓存穿透** | 查询不存在的数据 | 布隆过滤器、缓存空对象 |
| **缓存击穿** | 热点 key 过期 | 互斥锁、逻辑过期 |
| **缓存雪崩** | 大量 key 同时过期 | 随机过期时间、高可用集群 |

---

## 10.5 框架考点

### Spring Bean 生命周期

```
1. 实例化 Bean（Instantiation）
   ↓
2. 属性赋值（Populate Bean）
   ↓
3. Aware 接口回调
   ├── BeanNameAware
   ├── BeanFactoryAware
   └── ApplicationContextAware
   ↓
4. BeanPostProcessor.postProcessBeforeInitialization
   ↓
5. InitializingBean.afterPropertiesSet / @PostConstruct
   ↓
6. BeanPostProcessor.postProcessAfterInitialization
   ↓
7. Bean 就绪，可以使用
   ↓
8. 容器关闭时
   └── DisposableBean.destroy / @PreDestroy
```

### Spring AOP 原理

```java
// 常考问题：
// 1. AOP 的实现原理？
// 2. JDK 动态代理 vs CGLIB？
// 3. 循环依赖如何解决？

// JDK 动态代理（基于接口）
public class JdkProxy implements InvocationHandler {

    private final Object target;

    public Object bind(Object target) {
        this.target = target;
        return Proxy.newProxyInstance(
            target.getClass().getClassLoader(),
            target.getClass().getInterfaces(),
            this
        );
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args)
            throws Throwable {
        // 前置通知
        System.out.println("Before: " + method.getName());

        // 执行目标方法
        Object result = method.invoke(target, args);

        // 后置通知
        System.out.println("After: " + method.getName());

        return result;
    }
}

// CGLIB 代理（基于继承）
public class CglibProxy implements MethodInterceptor {

    public Object createProxy(Object target) {
        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(target.getClass());
        enhancer.setCallback(this);
        return enhancer.create();
    }

    @Override
    public Object intercept(Object obj, Method method, Object[] args,
                            MethodProxy proxy) throws Throwable {
        System.out.println("Before: " + method.getName());
        Object result = proxy.invokeSuper(obj, args);
        System.out.println("After: " + method.getName());
        return result;
    }
}
```

### Spring Boot 自动配置原理

```java
// @SpringBootApplication 核心注解
@SpringBootApplication
= @SpringBootConfiguration
+ @EnableAutoConfiguration  // 关键注解
+ @ComponentScan

// @EnableAutoConfiguration 原理
@AutoConfigurationPackage
@Import(AutoConfigurationImportSelector.class)

// AutoConfigurationImportSelector 读取
// META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
// 文件中的所有自动配置类

// 示例：RedisAutoConfiguration
@Configuration
@ConditionalOnClass(RedisTemplate.class)
@EnableConfigurationProperties(RedisProperties.class)
public class RedisAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public RedisTemplate<String, Object> redisTemplate(
            RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        return template;
    }
}
```

---

## 10.6 系统设计考点

### 设计题解题思路

```
1. 需求分析（5 分钟）
   - 用户规模（DAU、MAU）
   - 核心功能
   - QPS、数据量估算

2. 总体架构（10 分钟）
   - 画架构图
   - 分层设计

3. 核心设计（20 分钟）
   - 数据模型
   - 关键流程
   - 技术选型

4. 扩展优化（10 分钟）
   - 性能优化
   - 高可用
   - 可扩展性

5. 总结回顾（5 分钟）
   - 方案权衡
   - 潜在问题
```

### 常用估算公式

```
QPS 估算：
- 日活 1000 万，日均请求 10 次/人
- 总请求 = 1000 万 × 10 = 1 亿/天
- 峰值 QPS = 1 亿 / 86400 × 10（峰值系数）≈ 11500

存储估算：
- 每条数据 1KB，日增 1000 万条
- 日增存储 = 1000 万 × 1KB = 10GB
- 年增存储 = 10GB × 365 = 3.65TB

带宽估算：
- 峰值 QPS 1 万，响应大小 10KB
- 峰值带宽 = 10000 × 10KB = 100MB/s = 800Mbps
```

---

## 10.7 面试准备清单

### 技术准备

- [ ] Java 基础（集合、并发、JVM）
- [ ] 数据库（MySQL、Redis）
- [ ] 框架（Spring、MyBatis、Spring Boot）
- [ ] 分布式（MQ、Dubbo、Zookeeper）
- [ ] 系统设计（高并发、高可用）
- [ ] 算法题（LeetCode Hot 100）

### 项目准备

- [ ] 项目背景介绍（1 分钟版）
- [ ] 技术难点与解决方案
- [ ] 量化成果（数据支撑）
- [ ] 可能的深挖问题

### 软技能准备

- [ ] 自我介绍（2-3 分钟）
- [ ] 为什么离职
- [ ] 职业规划
- [ ] 反问环节问题

---

## 10.8 面试心态

1. **保持自信** - 能拿到面试机会就说明你匹配
2. **诚实为主** - 不会的问题直接说，不要硬撑
3. **思路清晰** - 即使不会，也要展示思考过程
4. **及时复盘** - 每次面试后总结不足

---

**上一章**：[项目经验总结 ←](/java-learning/project-experience)

*Java 后端面试学习大纲 完*
