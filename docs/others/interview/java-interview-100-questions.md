# Java 高频面试题精选 100 题

> 本套题精选 Java 后端开发面试中最高频的 100 道题目，涵盖 Java 基础、集合、并发、JVM、MySQL、Redis、Spring、分布式等核心知识点，适合快速复习和查漏补缺。

## 目录

- [一、Java 基础（15 题）](#一 java 基础 15 题)
- [二、Java 集合（12 题）](#二 java 集合 12 题)
- [三、并发编程（15 题）](#三并发编程 15 题)
- [四、JVM（10 题）](#四 jvm10 题)
- [五、MySQL（15 题）](#五 mysql15 题)
- [六、Redis（12 题）](#六 redis12 题)
- [七、Spring（12 题）](#七 spring12 题)
- [八、分布式与微服务（9 题）](#八分布式与微服务 9 题)

---

## 一、Java 基础（15 题）

### 1. == 和 equals 的区别是什么？

**答案**：
- `==`：比较基本类型时比较值；比较引用类型时比较内存地址
- `equals`：默认比较地址，但可重写（如 String 重写后比较内容）

```java
// String 重写了 equals
String a = "abc";
String b = new String("abc");
System.out.println(a == b);        // false（地址不同）
System.out.println(a.equals(b));   // true（内容相同）
```

### 2. final、finally、finalize 的区别？

**答案**：
- `final`：修饰符，表示不可变（类不可继承、方法不可重写、变量不可修改）
- `finally`：异常处理关键字，确保代码块最终执行
- `finalize`：Object 类方法，GC 回收前回调（已废弃）

### 3. Java 中基本数据类型有哪些？

**答案**：8 种

| 类型 | 字节 | 默认值 | 范围 |
|------|------|--------|------|
| byte | 1 | 0 | -128~127 |
| short | 2 | 0 | -32768~32767 |
| int | 4 | 0 | ±21 亿 |
| long | 8 | 0L | ±922 京 |
| float | 4 | 0.0f | 单精度 |
| double | 8 | 0.0d | 双精度 |
| char | 2 | '\u0000' | Unicode 字符 |
| boolean | - | false | true/false |

### 4. String、StringBuilder、StringBuffer 的区别？

**答案**：

| 特性 | String | StringBuilder | StringBuffer |
|------|--------|---------------|--------------|
| 可变性 | 不可变 | 可变 | 可变 |
| 线程安全 | 是 | 否 | 是（synchronized） |
| 性能 | - | 最快 | 中等 |
| 适用场景 | 少量操作 | 单线程大量操作 | 多线程大量操作 |

### 5. 什么是自动装箱和拆箱？

**答案**：
- **装箱**：基本类型 → 包装类（如 `int → Integer`）
- **拆箱**：包装类 → 基本类型（如 `Integer → int`）

```java
// 自动装箱
Integer i = 10;  // 实际执行 Integer.valueOf(10)

// 自动拆箱
int j = i;       // 实际执行 i.intValue()
```

### 6. 重载和重写的区别？

**答案**：

| 对比 | 重载（Overload） | 重写（Override） |
|------|-----------------|-----------------|
| 位置 | 同一类中 | 子类对父类 |
| 方法名 | 相同 | 相同 |
| 参数 | 不同 | 相同 |
| 返回类型 | 可不同 | 相同或是其子类型 |

### 7. 接口和抽象类的区别？

**答案**：

| 对比 | 接口（Interface） | 抽象类（Abstract Class） |
|------|------------------|-------------------------|
| 继承 | 多实现 | 单继承 |
| 构造器 | 无 | 有 |
| 成员变量 | 只能是 public static final | 任意类型 |
| 方法 | 默认 public abstract（Java8 后可有 default/static） | 可有具体实现 |
| 设计目的 | 定义行为规范 | 代码复用 |

### 8. 什么是反射？有什么优缺点？

**答案**：

**反射**：运行时获取类信息并操作类成员的能力。

```java
Class<?> clazz = Class.forName("com.example.User");
Object obj = clazz.newInstance();
Method method = clazz.getMethod("setName", String.class);
method.invoke(obj, "张三");
```

**优点**：灵活、动态；**缺点**：性能开销、安全问题

### 9. 什么是泛型？什么是类型擦除？

**答案**：
- **泛型**：参数化类型，编译期类型检查
- **类型擦除**：编译后泛型信息被擦除，替换为原始类型

```java
List<String> list = new ArrayList<>();
// 编译后变为 List list = new ArrayList();
```

### 10. Java 8 新特性有哪些？

**答案**：
- Lambda 表达式
- Stream API
- 函数式接口
- Optional 类
- 接口默认方法和静态方法
- 新日期时间 API（LocalDate、LocalDateTime）
- ConcurrentHashMap 性能优化

### 11. 什么是函数式接口？列举几个常用的

**答案**：只有一个抽象方法的接口

| 接口 | 方法 | 用途 |
|------|------|------|
| `Function<T,R>` | `R apply(T t)` | 转换函数 |
| `Consumer<T>` | `void accept(T t)` | 消费函数 |
| `Supplier<T>` | `T get()` | 供应函数 |
| `Predicate<T>` | `boolean test(T t)` | 断言函数 |

### 12. Stream API 的常用操作有哪些？

**答案**：

```java
List<String> result = list.stream()
    .filter(s -> s.length() > 3)      // 过滤
    .map(String::toUpperCase)         // 映射
    .sorted()                         // 排序
    .collect(Collectors.toList());    // 收集
```

常用操作：filter、map、flatMap、sorted、distinct、limit、skip、collect、reduce、forEach

### 13. Optional 类的作用是什么？

**答案**：避免空指针异常，函数式处理空值

```java
// 传统方式
if (user != null && user.getAddress() != null) {
    String city = user.getAddress().getCity();
}

// Optional 方式
String city = Optional.ofNullable(user)
    .map(User::getAddress)
    .map(Address::getCity)
    .orElse("未知");
```

### 14. 什么是 Lambda 表达式？

**答案**：匿名函数的简洁表示

```java
// 匿名内部类
new Thread(new Runnable() {
    public void run() { System.out.println("Hello"); }
}).start();

// Lambda 表达式
new Thread(() -> System.out.println("Hello")).start();
```

### 15. deepCopy 和 shallowCopy 的区别？

**答案**：
- **浅拷贝**：复制对象和引用，不复制引用对象本身
- **深拷贝**：完全复制对象及其引用的所有对象

```java
// 浅拷贝：实现 Cloneable
class User implements Cloneable {
    public User clone() throws CloneNotSupportedException {
        return (User) super.clone();
    }
}

// 深拷贝：序列化或手动复制引用对象
```

---

## 二、Java 集合（12 题）

### 16. Java 集合框架的体系结构？

**答案**：

```
Collection
├── List（有序、可重复）
│   ├── ArrayList
│   ├── LinkedList
│   └── Vector
├── Set（无序、不重复）
│   ├── HashSet
│   ├── LinkedHashSet
│   └── TreeSet
└── Queue（队列）
    ├── PriorityQueue
    └── ArrayDeque

Map（键值对）
├── HashMap
├── LinkedHashMap
├── TreeMap
└── HashTable
```

### 17. ArrayList 和 LinkedList 的区别？

**答案**：

| 对比 | ArrayList | LinkedList |
|------|-----------|------------|
| 底层 | 动态数组 | 双向链表 |
| 随机访问 | O(1) | O(n) |
| 插入删除 | O(n) | O(1)（已知位置） |
| 内存占用 | 小 | 大（需存储前后指针） |

### 18. ArrayList 的扩容机制？

**答案**：

- 初始容量：10
- 扩容：原容量的 1.5 倍
- 扩容操作：创建新数组 + 复制元素

```java
// 核心代码
int newCapacity = oldCapacity + (oldCapacity / 2);  // 1.5 倍
Arrays.copyOf(elementData, newCapacity);
```

### 19. HashMap 的底层实现原理？

**答案**：

**JDK 1.8**：数组 + 链表 + 红黑树

- 数组默认长度：16
- 加载因子：0.75
- 链表转树阈值：8
- 树退化为链表阈值：6
- 插入方式：尾插法（解决 1.7 死循环问题）

### 20. HashMap 和 HashTable 的区别？

**答案**：

| 对比 | HashMap | HashTable |
|------|---------|-----------|
| 线程安全 | 否 | 是（synchronized） |
| null 键值 | 允许 | 不允许 |
| 性能 | 高 | 低 |
| 推荐 | ✓ | 使用 ConcurrentHashMap |

### 21. HashMap 和 TreeMap 的区别？

**答案**：

| 对比 | HashMap | TreeMap |
|------|---------|---------|
| 有序性 | 无序 | 有序（红黑树） |
| 时间复杂度 | O(1) | O(log n) |
| 适用场景 | 一般场景 | 需要排序场景 |

### 22. LinkedHashMap 的特点和适用场景？

**答案**：

- **特点**：保持插入顺序或访问顺序
- **实现**：HashMap + 双向链表
- **场景**：LRU 缓存、按插入顺序遍历

### 23. HashSet 的底层实现？

**答案**：

- 底层是 HashMap
- 元素作为 Key，Value 是固定的 `PRESENT` 对象
- 保证元素不重复

### 24. Comparator 和 Comparable 的区别？

**答案**：

| 对比 | Comparable | Comparator |
|------|------------|------------|
| 位置 | 类内部实现 | 外部比较器 |
| 方法 | compareTo(T o) | compare(T o1, T o2) |
| 包 | java.lang | java.util |

### 25. Fail-Fast 和 Fail-Safe 的区别？

**答案**：

| 对比 | Fail-Fast | Fail-Safe |
|------|-----------|-----------|
| 机制 | 修改时抛 ConcurrentModificationException | 基于副本遍历 |
| 实现 | 记录修改次数 | 复制原集合 |
| 例子 | ArrayList、HashMap | CopyOnWriteArrayList、ConcurrentHashMap |

### 26. ArrayDeque 的特点？

**答案**：

- 双端队列（两端都可插入删除）
- 可作栈或队列使用
- 基于循环数组实现
- 不允许 null 元素

### 27. PriorityQueue 的实现原理？

**答案**：

- 基于二叉堆实现
- 默认小顶堆（最小元素在堆顶）
- 不支持 null
- 非线程安全（PriorityBlockingQueue 线程安全）

---

## 三、并发编程（15 题）

### 28. 创建线程的几种方式？

**答案**：

1. **继承 Thread 类**
2. **实现 Runnable 接口**
3. **实现 Callable 接口**（有返回值）
4. **线程池**（ExecutorService）

```java
// 实现 Callable
Callable<Integer> task = () -> { return 100; };
Future<Integer> future = Executors.newSingleThreadExecutor().submit(task);
Integer result = future.get();
```

### 29. 线程有哪些状态？

**答案**：6 种

- NEW：新建未启动
- RUNNABLE：可运行（包括就绪和运行中）
- BLOCKED：阻塞（等待锁）
- WAITING：无限等待（wait/join）
- TIMED_WAITING：超时等待（sleep/wait 带超时）
- TERMINATED：终止

### 30. sleep() 和 wait() 的区别？

**答案**：

| 对比 | sleep() | wait() |
|------|---------|--------|
| 所属类 | Thread | Object |
| 锁释放 | 不释放 | 释放 |
| 使用场景 | 任意位置 | synchronized 块内 |
| 唤醒方式 | 超时或 interrupt | notify/notifyAll/超时 |

### 31. 什么是线程安全？

**答案**：多线程访问同一对象时，无需额外同步也能保证结果正确。

**实现方式**：
- 互斥同步（synchronized、Lock）
- 非阻塞同步（CAS）
- 不可变对象（final、String）
- 线程本地存储（ThreadLocal）

### 32. synchronized 的底层原理？

**答案**：

- **对象锁**：通过对象头 Mark Word 存储锁信息
- **字节码**：monitorenter/monitorexit
- **锁升级**：无锁 → 偏向锁 → 轻量级锁 → 重量级锁

### 33. volatile 的作用和原理？

**答案**：

**作用**：
1. 保证可见性
2. 禁止指令重排序
3. 不保证原子性

**原理**：内存屏障（禁止特定类型重排序）+ 写操作刷新到主内存

### 34. 什么是 CAS？有什么缺点？

**答案**：

**CAS**：Compare-And-Swap，比较并交换（乐观锁实现）

**缺点**：
1. ABA 问题（AtomicStampedReference 解决）
2. 自旋消耗 CPU
3. 只能保证单个变量原子性

### 35. AQS 的原理是什么？

**答案**：

**AQS**（AbstractQueuedSynchronizer）：抽象队列同步器

- **state**：volatile int，表示同步状态
- **CLH 队列**：FIFO 等待队列
- **资源共享方式**：独占（Exclusive）和共享（Share）

### 36. ReentrantLock 和 synchronized 的区别？

**答案**：

| 对比 | ReentrantLock | synchronized |
|------|---------------|--------------|
| 层面 | API 层 | JVM 层 |
| 锁释放 | 手动 unlock/finally | 自动释放 |
| 可中断 | 支持 | 不支持 |
| 超时 | 支持 tryLock(timeout) | 不支持 |
| 公平锁 | 支持 | 不支持 |

### 37. 线程池的核心参数有哪些？

**答案**：7 个

```java
ThreadPoolExecutor(
    int corePoolSize,           // 核心线程数
    int maximumPoolSize,        // 最大线程数
    long keepAliveTime,         // 空闲存活时间
    TimeUnit unit,              // 时间单位
    BlockingQueue runnableWorkQueue,  // 工作队列
    ThreadFactory threadFactory,        // 线程工厂
    RejectedExecutionHandler handler    // 拒绝策略
)
```

### 38. 线程池的工作流程？

**答案**：

```
1. 提交任务 → 线程数 < corePoolSize → 创建新线程
2. 线程数 >= corePoolSize → 放入队列
3. 队列满 → 线程数 < maximumPoolSize → 创建新线程
4. 队列满且线程数 >= maximumPoolSize → 拒绝策略
```

### 39. 常见的阻塞队列有哪些？

**答案**：

| 队列 | 特点 |
|------|------|
| ArrayBlockingQueue | 数组结构、有界 |
| LinkedBlockingQueue | 链表结构、可选有界 |
| PriorityBlockingQueue | 带优先级、无界 |
| DelayQueue | 延迟队列、无界 |
| SynchronousQueue | 不存储元素、直接传递 |

### 40. ThreadLocal 的原理？

**答案**：

- **ThreadLocalMap**：每个 Thread 有独立的 Map
- **Key**：ThreadLocal 对象（弱引用）
- **Value**：线程本地值（强引用）
- **内存泄漏**：使用完需调用 remove()

### 41. CountDownLatch 和 CyclicBarrier 的区别？

**答案**：

| 对比 | CountDownLatch | CyclicBarrier |
|------|----------------|---------------|
| 用途 | 等待 N 个操作完成 | 等待 N 个线程到达屏障 |
| 可复用 | 否 | 是 |
| 核心方法 | countDown() / await() | await() |

### 42. 什么是乐观锁和悲观锁？

**答案**：

- **悲观锁**：假设最坏情况，总是加锁（synchronized、ReentrantLock）
- **乐观锁**：假设最好情况，不加锁，更新时比较（CAS）

---

## 四、JVM（10 题）

### 43. JVM 内存区域有哪些？

**答案**：

```
JVM 内存
├── 线程私有
│   ├── 程序计数器（PC Register）
│   ├── Java 虚拟机栈（Stack）
│   └── 本地方法栈
└── 线程共享
    ├── 堆（Heap）
    └── 方法区（Method Area/Metaspace）
```

### 44. 堆和栈的区别？

**答案**：

| 对比 | 堆（Heap） | 栈（Stack） |
|------|-----------|------------|
| 存储内容 | 对象实例 | 局部变量、方法调用 |
| GC | 是 | 否 |
| 大小 | 较大（-Xmx） | 较小（-Xss） |
| 线程共享 | 是 | 否 |

### 45. 什么是类加载机制？

**答案**：

```
加载 → 验证 → 准备 → 解析 → 初始化
```

- **加载**：读取字节码文件
- **验证**：安全性检查
- **准备**：分配内存、设置默认值
- **解析**：符号引用转直接引用
- **初始化**：执行静态代码块

### 46. 什么是双亲委派模型？

**答案**：

```
Bootstrap ClassLoader（启动类加载器）
        ↑
ExtClassLoader（扩展类加载器）
        ↑
AppClassLoader（应用类加载器）
        ↑
自定义 ClassLoader
```

**好处**：防止重复加载、保证核心类安全

### 47. 常见的垃圾回收算法有哪些？

**答案**：

1. **标记 - 清除**：标记可回收对象，清除（有碎片）
2. **标记 - 复制**：存活对象复制到另一边（无碎片，浪费空间）
3. **标记 - 整理**：存活对象向一端移动（无碎片，适合老年代）

### 48. CMS 和 G1 的区别？

**答案**：

| 对比 | CMS | G1 |
|------|-----|-----|
| 算法 | 标记 - 清除 | 标记 - 整理 + 复制 |
| 停顿 | 较短 | 可预测（<500ms） |
| 内存结构 | 分代连续 | Region 不连续 |
| 适用 | <4GB 堆 | >6GB 堆 |

### 49. 什么是 Full GC？什么情况下触发？

**答案**：

**Full GC**：全局垃圾回收（清理整个堆和方法区）

**触发场景**：
- 老年代空间不足
- 元空间不足
- System.gc() 显式调用
- CMS GC 失败

### 50. 如何判断对象是否可以回收？

**答案**：

1. **引用计数法**（有循环引用问题，Java 未用）
2. **可达性分析法**（GC Roots）：从 GC Roots 向下搜索，不可达对象可回收

**GC Roots 包括**：
- 栈中引用的对象
- 静态属性引用的对象
- 常量引用的对象
- JNI 引用的对象

### 51. 内存泄漏和内存溢出的区别？

**答案**：

- **内存泄漏**：对象已无用但未被 GC，堆积
- **内存溢出**：无足够内存分配新对象（OOM）

**常见泄漏原因**：
- 静态集合持有对象引用
- ThreadLocal 未清理
- 监听器未注销

### 52. JVM 常用调优参数有哪些？

**答案**：

```bash
# 堆大小
-Xms4g              # 初始堆大小
-Xmx4g              # 最大堆大小
-Xmn1g              # 新生代大小
-Xss256k            # 线程栈大小

# GC 相关
-XX:+UseG1GC        # 使用 G1 收集器
-XX:MaxGCPauseMillis=200  # 最大停顿时间
-XX:G1HeapRegionSize=16m

# OOM 排查
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/path/to/dump.hprof
```

---

## 五、MySQL（15 题）

### 53. MySQL 的存储引擎有哪些？区别是什么？

**答案**：

| 引擎 | 特点 | 适用场景 |
|------|------|----------|
| InnoDB | 事务、行锁、外键 | 默认引擎，支持事务场景 |
| MyISAM | 表锁、无事务、支持全文索引 | 读多写少、无需事务 |
| Memory | 内存存储、速度快 | 临时表 |

### 54. 什么是索引？有哪些类型？

**答案**：

**索引**：帮助高效查询的数据结构

**分类**：
- 数据结构：B+Tree、Hash、Fulltext
- 物理存储：聚簇索引、非聚簇索引
- 逻辑角度：主键索引、唯一索引、普通索引、联合索引

### 55. 为什么使用 B+ 树作为索引结构？

**答案**：

1. **减少 IO**：非叶子节点只存索引，单节点容纳更多 key
2. **范围查询高效**：叶子节点形成有序链表
3. **查询稳定**：所有查询都要走到叶子节点

### 56. 什么是聚簇索引和非聚簇索引？

**答案**：

- **聚簇索引**：数据与索引在一起（InnoDB 的主键索引）
- **非聚簇索引**：索引与数据分离，叶子节点存主键值（需回表）

### 57. 什么是最左前缀原则？

**答案**：

联合索引查询时，从最左列开始匹配。

```sql
-- 索引 (age, name, city)
SELECT * FROM users WHERE age = 25 AND name = '张三';  -- 可使用索引
SELECT * FROM users WHERE name = '张三';               -- 索引失效
```

### 58. 索引失效的场景有哪些？

**答案**：

1. 对索引列使用函数
2. LIKE '%xxx' 开头
3. 隐式类型转换
4. 违反最左前缀原则
5. 范围查询右侧列

### 59. 什么是事务？ACID 特性？

**答案**：

**事务**：数据库操作的最小执行单元

**ACID**：
- **A**tomicity（原子性）：要么全成功要么全失败
- **C**onsistency（一致性）：数据状态一致
- **I**solation（隔离性）：事务间互不干扰
- **D**urability（持久性）：提交后永久保存

### 60. 事务隔离级别有哪些？

**答案**：

| 级别 | 脏读 | 不可重复读 | 幻读 |
|------|------|------------|------|
| 读未提交 | ✓ | ✓ | ✓ |
| 读已提交 | × | ✓ | ✓ |
| 可重复读（MySQL 默认） | × | × | ✓ |
| 串行化 | × | × | × |

### 61. 什么是脏读、幻读、不可重复读？

**答案**：

- **脏读**：读到未提交的数据
- **不可重复读**：同一事务内多次读取结果不一致（UPDATE 导致）
- **幻读**：同一事务内多次查询，结果集数量不一致（INSERT 导致）

### 62. MySQL 的锁有哪些类型？

**答案**：

- **粒度角度**：表锁、行锁、页锁
- **类型角度**：共享锁（S 锁）、排他锁（X 锁）
- **InnoDB 特有**：记录锁、间隙锁、临键锁

### 63. 什么是 MVCC？原理是什么？

**答案**：

**MVCC**：多版本并发控制

**实现原理**：
- 隐藏列：DB_TRX_ID（事务 ID）、DB_ROLL_PTR（回滚指针）
- ReadView：事务启动时的视图
- UndoLog：历史版本数据

### 64. SQL 优化有哪些方法？

**答案**：

1. **索引优化**：创建合适索引
2. **SQL 改写**：避免 SELECT *、减少子查询
3. **表结构优化**：选择合适数据类型
4. **架构优化**：读写分离、分库分表

### 65. 什么是分库分表？

**答案**：

- **垂直分表**：大字段拆到独立表
- **水平分表**：按规则（hash/range）拆分数据
- **分库**：不同表/数据放到不同数据库

### 66. 主从复制的原理？

**答案**：

```
主库 binlog → 从库 IO 线程 → relaylog → 从库 SQL 线程回放
```

**模式**：异步复制、半同步复制、组复制（MGR）

### 67. 如何优化大表查询？

**答案**：

1. **覆盖索引**：避免回表
2. **延迟关联**：先查 ID 再关联
3. **游标分页**：WHERE id > last_id
4. **ES 方案**：复杂查询走 Elasticsearch

---

## 六、Redis（12 题）

### 68. Redis 有哪些数据类型？

**答案**：

| 类型 | 说明 | 典型场景 |
|------|------|----------|
| String | 字符串 | 缓存、计数器 |
| List | 列表 | 消息队列、最新动态 |
| Set | 集合 | 去重、共同好友 |
| ZSet | 有序集合 | 排行榜 |
| Hash | 哈希 | 对象存储 |

### 69. Redis 为什么这么快？

**答案**：

1. **内存操作**：所有数据在内存
2. **单线程**：避免锁竞争和上下文切换
3. **IO 多路复用**：epoll 机制
4. **高效数据结构**：SDS、跳表等

### 70. Redis 持久化机制有哪些？

**答案**：

- **RDB**：定期快照（文件紧凑、恢复快、可能丢数据）
- **AOF**：记录写命令（数据安全、文件大、恢复慢）
- **混合持久化**：RDB+AOF（Redis 4.0+）

### 71. 什么是缓存穿透、击穿、雪崩？

**答案**：

| 问题 | 描述 | 解决方案 |
|------|------|----------|
| 穿透 | 查询不存在数据 | 布隆过滤器、缓存空对象 |
| 击穿 | 热点 Key 过期 | 互斥锁、热点 Key 永不过期 |
| 雪崩 | 大量 Key 同时过期 | 随机 TTL、多级缓存 |

### 72. 缓存和数据库一致性如何保证？

**答案**：

1. **先删缓存，再更新库**（推荐）
2. **延迟双删**：删→更→延迟→再删
3. **Canal 监听 binlog**：异步更新缓存

### 73. Redis 内存淘汰策略有哪些？

**答案**：

| 策略 | 说明 |
|------|------|
| noeviction | 不淘汰，写操作返回错误 |
| allkeys-lru | 所有 Key 按 LRU 淘汰（推荐） |
| volatile-lru | 有过期时间的 Key 按 LRU 淘汰 |
| volatile-ttl | 按剩余 TTL 淘汰 |

### 74. Redis 集群方案有哪些？

**答案**：

- **Redis Cluster**：官方方案，16384 槽
- **Codis**：代理方案
- **Twemproxy**：Twitter 开源代理

### 75. 什么是 Redis 哨兵模式？

**答案**：

**Sentinel**：监控、故障转移、配置中心

- 监控主从节点
- 主节点故障时选举新主
- 通知客户端新主地址

### 76. Redis 如何实现分布式锁？

**答案**：

```java
// SETNX + 超时
SET lock_key unique_value NX PX 30000

// Lua 脚本释放锁（保证原子性）
if redis.call('get', KEYS[1]) == ARGV[1] then
    return redis.call('del', KEYS[1])
else
    return 0
end
```

### 77. 什么是 Redis 管道和事务？

**答案**：

- **管道**：批量发送命令，减少网络往返
- **事务**：MULTI/EXEC，不保证原子性（不支持回滚）

### 78. Redis 键的过期策略？

**答案**：

- **惰性删除**：访问时检查是否过期
- **定期删除**：定时扫描检查
- **配合使用**：平衡 CPU 和内存

### 79. 如何解决 Redis 热点 Key 问题？

**答案**：

1. **Key 打散**：加随机前缀
2. **多副本**：复制多份到不同槽
3. **本地缓存**：Caffeine+Redis 二级缓存

---

## 七、Spring（12 题）

### 80. Spring 的核心特性有哪些？

**答案**：

- IOC（控制反转）
- AOP（面向切面）
- 事务管理
- MVC 框架

### 81. 什么是 IOC？原理是什么？

**答案**：

**IOC**：控制反转，将对象创建交给 Spring 容器

**原理**：反射 + 工厂模式

```java
@Autowired  // 依赖注入
private UserService userService;
```

### 82. 什么是 AOP？应用场景？

**答案**：

**AOP**：面向切面编程，将横切关注点抽取

**应用**：
- 日志记录
- 事务管理
- 权限校验
- 性能监控

### 83. Spring Bean 的生命周期？

**答案**：

```
实例化 → 属性赋值 → Aware 回调 → 前置处理
→ 初始化（@PostConstruct、afterPropertiesSet）
→ 后置处理 → 使用 → 销毁（@PreDestroy、destroy）
```

### 84. Spring 支持几种 Bean 作用域？

**答案**：

- singleton：单例（默认）
- prototype：原型（每次新对象）
- request：请求作用域
- session：会话作用域

### 85. Spring 事务的传播机制？

**答案**：

| 传播机制 | 说明 |
|----------|------|
| REQUIRED（默认） | 支持当前事务，没有则新建 |
| REQUIRES_NEW | 新建事务，挂起当前事务 |
| NESTED | 嵌套事务 |
| SUPPORTS | 支持当前事务 |
| NOT_SUPPORTED | 非事务运行 |
| MANDATORY | 必须存在事务 |
| NEVER | 非事务运行 |

### 86. @Transactional 失效的场景？

**答案**：

1. 自调用问题（同类方法调用）
2. 非 public 方法
3. 异常被 catch 未抛出
4. 异常类型不匹配（默认只回滚 RuntimeException）
5. 数据库不支持事务

### 87. Spring Boot 自动装配原理？

**答案**：

1. `@EnableAutoConfiguration` 导入 `AutoConfigurationImportSelector`
2. 读取 `META-INF/spring.factories`
3. 根据 `@Conditional` 条件筛选配置类
4. 加载符合条件的 Bean

### 88. 常用的 Spring 注解有哪些？

**答案**：

| 类型 | 注解 |
|------|------|
| 声明 Bean | @Component、@Service、@Repository、@Controller |
| 注入 | @Autowired、@Qualifier、@Resource |
| 配置 | @Configuration、@Bean、@Value |
| AOP | @Aspect、@Before、@After、@Around |
| 事务 | @Transactional |

### 89. Spring MVC 的执行流程？

**答案**：

```
请求 → DispatcherServlet → HandlerMapping
→ Controller → ModelAndView → ViewResolver → 视图渲染
```

### 90. 什么是循环依赖？如何解决？

**答案**：

**循环依赖**：A 依赖 B，B 依赖 A

**解决**：
- 单例 + setter：三级缓存解决
- 构造器注入：无法解决，需重构

### 91. MyBatis 中#{}和${}的区别？

**答案**：

| 对比 | #{} | ${} |
|------|-----|-----|
| 处理 | 预编译（PreparedStatement） | 字符串替换 |
| 安全 | 防 SQL 注入 | 有注入风险 |
| 使用 | 参数传递 | 动态表名/列名 |

---

## 八、分布式与微服务（9 题）

### 92. 什么是 CAP 理论？

**答案**：

分布式系统最多同时满足 2 个：
- **C**onsistency（一致性）
- **A**vailability（可用性）
- **P**artition tolerance（分区容错性）

**实际选择**：CP（ZooKeeper）或 AP（Eureka）

### 93. 什么是 BASE 理论？

**答案**：

- **B**asically Available（基本可用）
- **S**oft state（软状态）
- **E**ventually consistent（最终一致）

### 94. 分布式 ID 生成方案有哪些？

**答案**：

| 方案 | 优点 | 缺点 |
|------|------|------|
| UUID | 简单 | 无序、太长 |
| 雪花算法 | 有序、高效 | 时钟回拨问题 |
| 号段模式 | 可控、性能好 | 需 DB 支持 |
| Redis 自增 | 简单 | 依赖 Redis |

### 95. 分布式锁的实现方案？

**答案**：

| 方案 | 优点 | 缺点 |
|------|------|------|
| Redis | 性能好 | 主从切换可能丢锁 |
| ZooKeeper | 可靠性高 | 性能较差 |
| 数据库 | 简单 | 性能差、不可重入 |

### 96. 什么是服务熔断和降级？

**答案**：

- **熔断**：故障达阈值，快速失败（Hystrix/Sentinel）
- **降级**：熔断后执行备用方案（返回默认值）

### 97. 消息队列的使用场景？

**答案**：

- **解耦**：生产者和消费者互不依赖
- **异步**：非核心流程异步处理
- **削峰**：缓冲突发流量

### 98. 如何保证消息不丢失？

**答案**：

1. **生产者**：确认机制（Confirm）
2. **MQ 存储**：持久化队列和消息
3. **消费者**：手动 ACK

### 99. 什么是接口幂等性？如何保证？

**答案**：

**幂等性**：同一操作多次执行，结果相同

**保证方案**：
- 数据库唯一键
- Token 机制
- 状态机
- 分布式锁

### 100. 秒杀系统的设计要点？

**答案**：

1. **静态化**：HTML 缓存到 CDN
2. **限流**：网关层限流、用户维度限流
3. **缓存**：库存预热到 Redis
4. **预扣减**：Redis Lua 脚本扣减
5. **异步**：MQ 异步下单
6. **防刷**：验证码、设备指纹

---

## 使用建议

### 快速复习法

1. **第一遍**：快速浏览所有题目，标记不熟悉的
2. **第二遍**：重点攻克标记题目，理解核心要点
3. **第三遍**：模拟面试，口头回答

### 深入学习法

1. 针对每个知识点，查阅官方文档或源码
2. 结合实际项目经验，准备案例
3. 整理成自己的面试笔记

### 记忆技巧

- **对比记忆**：如 ArrayList vs LinkedList
- **场景记忆**：结合使用场景理解
- **关键词记忆**：记住核心要点关键词

---

> **提示**：本套题适合快速复习和查漏补缺，建议配合详细讲解资料深入学习。面试时间有限，通常不会全部问到，但掌握这些知识点可以应对大部分 Java 后端面试。
