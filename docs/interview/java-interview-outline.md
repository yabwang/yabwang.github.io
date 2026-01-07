---
order: 0
---

# Java程序员面试学习大纲

## 一、Java基础

### 1.1 语言特性
- 面向对象编程（封装、继承、多态、抽象）
- Java 8+ 新特性（Lambda、Stream、Optional、函数式接口）
- 泛型机制
- 反射机制
- 注解（Annotation）
- 异常处理机制

### 1.2 集合框架
- List、Set、Map 的实现原理
- ArrayList vs LinkedList
- HashMap、ConcurrentHashMap 源码分析
- TreeMap、LinkedHashMap
- 线程安全的集合类

### 1.3 IO/NIO
- 字节流、字符流
- NIO、AIO
- 文件操作

## 二、并发编程

### 2.1 线程基础
- 线程的创建方式
- 线程生命周期
- 线程同步机制（synchronized、volatile）
- wait/notify/notifyAll

### 2.2 JUC包
- Lock接口（ReentrantLock、ReadWriteLock）
- 并发集合（ConcurrentHashMap、CopyOnWriteArrayList）
- 线程池（ThreadPoolExecutor、Executors）
- 原子类（AtomicInteger、AtomicReference等）
- CountDownLatch、CyclicBarrier、Semaphore
- CompletableFuture

### 2.3 并发设计模式
- 生产者消费者模式
- 线程池模式
- 线程本地存储（ThreadLocal）

## 三、JVM

### 3.1 内存模型
- 堆、栈、方法区、程序计数器
- 堆内存分区（新生代、老年代）
- 对象创建过程
- 垃圾回收算法（标记清除、标记复制、标记整理）
- 垃圾回收器（Serial、Parallel、CMS、G1、ZGC）

### 3.2 性能调优
- JVM参数调优
- 内存泄漏排查
- GC日志分析
- 性能监控工具（jstat、jmap、jstack、VisualVM、Arthas）

### 3.3 类加载机制
- 类加载过程（加载、链接、初始化）
- 双亲委派模型
- 自定义类加载器

## 四、框架技术

### 4.1 Spring框架
- IOC容器原理
- AOP实现原理
- Spring Bean生命周期
- Spring事务管理
- Spring MVC原理
- Spring Boot自动配置原理
- Spring Cloud微服务组件

### 4.2 MyBatis
- MyBatis工作原理
- 动态SQL
- 缓存机制（一级缓存、二级缓存）
- 插件机制

### 4.3 其他框架
- Redis客户端（Jedis、Lettuce）
- 消息队列（RabbitMQ、Kafka）
- 定时任务（Quartz、XXL-Job）

## 五、数据库

### 5.1 MySQL
- 索引原理（B+树）
- 事务隔离级别
- MVCC机制
- 锁机制（表锁、行锁、间隙锁）
- SQL优化
- 分库分表
- 主从复制、读写分离

### 5.2 Redis
- 数据结构（String、Hash、List、Set、ZSet）
- 持久化机制（RDB、AOF）
- 缓存穿透、缓存击穿、缓存雪崩
- 分布式锁实现
- 集群模式（主从、哨兵、Cluster）

## 六、分布式系统

### 6.1 分布式理论
- CAP定理
- BASE理论
- 一致性协议（2PC、3PC、Paxos、Raft）

### 6.2 分布式组件
- 服务注册与发现（Nacos、Eureka、Consul）
- 配置中心
- 网关（Spring Cloud Gateway、Zuul）
- 服务调用（Feign、Ribbon）
- 熔断降级（Hystrix、Sentinel）
- 分布式事务（Seata、TCC、Saga）

### 6.3 分布式锁
- 基于Redis实现
- 基于Zookeeper实现
- 基于数据库实现

### 6.4 消息队列
- Kafka架构原理
- RabbitMQ工作模式
- 消息可靠性保证
- 消息顺序性保证

## 七、系统设计

### 7.1 设计原则
- SOLID原则
- 设计模式（单例、工厂、观察者、策略、责任链等）
- 高并发系统设计
- 高可用系统设计

### 7.2 常见场景设计
- 秒杀系统
- 分布式ID生成
- 限流算法（令牌桶、漏桶、滑动窗口）
- 负载均衡算法
- 短链接系统
- 搜索引擎设计

## 八、项目经验总结

### 9.1 项目背景
- 租车门店基础信息维护系统
- 供应商后台系统
- 系统架构设计
- 技术选型理由

### 9.2 技术难点
- 高并发场景处理
- 数据一致性保证
- 性能优化经验
- 问题排查与解决

### 9.3 项目亮点
- 系统优化成果
- 技术方案创新
- 业务价值体现

## 九、其他技能

### 9.1 开发工具
- Git版本控制
- Maven/Gradle构建工具
- IDEA使用技巧
- Linux常用命令

### 9.2 网络基础
- HTTP/HTTPS协议
- TCP/IP协议
- OSI七层模型
- 三次握手、四次挥手

### 9.3 安全
- SQL注入防护
- XSS攻击防护
- CSRF攻击防护
- 接口鉴权（JWT、OAuth2）

## 十、面试准备

### 10.1 简历准备
- 项目经验描述
- 技术栈梳理
- 成果量化

### 10.2 面试技巧
- 自我介绍准备
- 常见问题准备
- 技术问题回答思路
- 项目介绍话术

### 10.3 模拟面试
- 系统设计题练习
- 技术深度问题准备

---

## 学习建议

1. **优先级排序**：根据目标岗位要求，优先学习核心技能
2. **理论与实践结合**：不仅要理解原理，还要动手实践
3. **项目经验梳理**：深入思考项目中遇到的问题和解决方案
4. **技术深度**：选择1-2个方向深入研究，形成技术亮点

## 学习时间规划

- **第1-2周**：Java基础、集合框架、并发编程基础
- **第3-4周**：JVM、Spring框架深入
- **第5-6周**：数据库、Redis、分布式基础
- **第7-8周**：系统设计、项目经验总结
- **第9-10周**：模拟面试、查漏补缺

---

*最后更新时间：2024年*

