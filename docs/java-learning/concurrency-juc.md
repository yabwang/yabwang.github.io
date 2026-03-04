# JUC包

## 目录
- [1. Lock接口](#1-lock接口)
- [2. 并发集合](#2-并发集合)
- [3. 线程池](#3-线程池)
- [4. 原子类](#4-原子类)
- [5. 同步工具类](#5-同步工具类)
- [6. CompletableFuture](#6-completablefuture)

---

## 1. Lock接口

### 1.1 ReentrantLock（可重入锁）

**特点**：
- 可重入：同一线程可以多次获取锁
- 可中断：`lockInterruptibly()`
- 可超时：`tryLock(timeout)`
- 公平/非公平：构造方法指定

```java
public class ReentrantLockExample {
    private final ReentrantLock lock = new ReentrantLock();
    
    public void method() {
        lock.lock();  // 获取锁
        try {
            // 同步代码
        } finally {
            lock.unlock();  // 释放锁（必须在finally中）
        }
    }
    
    // 尝试获取锁
    public void tryLockMethod() {
        if (lock.tryLock()) {
            try {
                // 同步代码
            } finally {
                lock.unlock();
            }
        } else {
            // 获取锁失败
        }
    }
    
    // 可中断锁
    public void interruptibleMethod() throws InterruptedException {
        lock.lockInterruptibly();
        try {
            // 同步代码
        } finally {
            lock.unlock();
        }
    }
}
```

**面试重点**：
- ReentrantLock vs synchronized
  - ReentrantLock更灵活（可中断、可超时、可公平）
  - synchronized更简单，自动释放锁
  - 性能：JDK 6优化后，两者性能相近
- 公平锁 vs 非公平锁
  - 公平锁：按照等待时间分配锁
  - 非公平锁：允许插队，性能更好（默认）
- 可重入锁的实现原理
  - 通过AQS（AbstractQueuedSynchronizer）实现
  - 维护一个计数器，记录重入次数

### 1.2 ReadWriteLock（读写锁）

**特点**：
- 读锁：共享锁，多个线程可以同时持有
- 写锁：独占锁，只能有一个线程持有
- 读写互斥，写写互斥，读读不互斥

```java
public class ReadWriteLockExample {
    private final ReadWriteLock lock = new ReentrantReadWriteLock();
    private final Lock readLock = lock.readLock();
    private final Lock writeLock = lock.writeLock();
    private int value = 0;
    
    public int read() {
        readLock.lock();
        try {
            return value;
        } finally {
            readLock.unlock();
        }
    }
    
    public void write(int newValue) {
        writeLock.lock();
        try {
            value = newValue;
        } finally {
            writeLock.unlock();
        }
    }
}
```

**面试重点**：
- 读写锁的使用场景
  - 读多写少的场景
  - 缓存系统
- 读写锁的降级和升级
  - 锁降级：写锁降级为读锁（允许）
  - 锁升级：读锁升级为写锁（不允许，会死锁）

**锁降级示例**：
```java
public void lockDowngrade() {
    writeLock.lock();
    try {
        // 写操作
        value = 100;
        
        // 锁降级：先获取读锁
        readLock.lock();
    } finally {
        writeLock.unlock();  // 释放写锁
    }
    
    try {
        // 读操作
        return value;
    } finally {
        readLock.unlock();
    }
}
```

---

## 2. 并发集合

### 2.1 ConcurrentHashMap

**特点**：
- JDK 7：分段锁（Segment）
- JDK 8+：CAS + synchronized（锁粒度更细）

**JDK 8实现原理**：
- 数组 + 链表 + 红黑树
- 使用CAS操作保证线程安全
- 只对链表头节点加锁（synchronized）

**面试重点**：
- ConcurrentHashMap的put过程
  1. 计算hash值
  2. 如果table为空，初始化
  3. 如果桶为空，CAS插入
  4. 如果桶不为空，synchronized锁住头节点
  5. 遍历链表/红黑树
  6. 插入或更新
  7. 判断是否需要树化
- ConcurrentHashMap的size()方法
  - JDK 7：分段统计，可能不准确
  - JDK 8：使用`baseCount`和`CounterCell[]`数组统计
- ConcurrentHashMap vs Hashtable
  - ConcurrentHashMap：分段锁，性能更好
  - Hashtable：全表锁，性能差

### 2.2 CopyOnWriteArrayList

**特点**：
- 写时复制（Copy-On-Write）
- 读操作无锁，性能高
- 写操作加锁，复制新数组

**实现原理**：
```java
public boolean add(E e) {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        Object[] elements = getArray();
        int len = elements.length;
        Object[] newElements = Arrays.copyOf(elements, len + 1);  // 复制数组
        newElements[len] = e;
        setArray(newElements);  // 替换数组引用
        return true;
    } finally {
        lock.unlock();
    }
}
```

**面试重点**：
- CopyOnWriteArrayList的使用场景
  - 读多写少的场景
  - 不适合写操作频繁的场景（复制开销大）
- CopyOnWriteArrayList的缺点
  - 内存占用大（每次写都要复制）
  - 数据一致性：读操作可能读到旧数据

---

## 3. 线程池

### 3.1 ThreadPoolExecutor

**核心参数**：
```java
public ThreadPoolExecutor(
    int corePoolSize,              // 核心线程数
    int maximumPoolSize,           // 最大线程数
    long keepAliveTime,            // 空闲线程存活时间
    TimeUnit unit,                 // 时间单位
    BlockingQueue<Runnable> workQueue,  // 工作队列
    ThreadFactory threadFactory,   // 线程工厂
    RejectedExecutionHandler handler  // 拒绝策略
)
```

**线程池工作流程**：
```
1. 提交任务
2. 如果核心线程数未满，创建核心线程执行
3. 如果核心线程数已满，任务放入工作队列
4. 如果工作队列已满，创建非核心线程执行
5. 如果线程数达到最大值，执行拒绝策略
```

**面试重点**：
- 线程池参数如何设置？
  - CPU密集型：`corePoolSize = CPU核心数 + 1`
  - IO密集型：`corePoolSize = CPU核心数 * 2`
  - 队列大小：根据业务需求设置
- 线程池的拒绝策略
  - `AbortPolicy`：抛出异常（默认）
  - `CallerRunsPolicy`：调用者执行
  - `DiscardPolicy`：丢弃任务
  - `DiscardOldestPolicy`：丢弃最老的任务
- 线程池的状态
  - RUNNING：运行中
  - SHUTDOWN：关闭，不接受新任务，处理已提交任务
  - STOP：停止，不接受新任务，不处理已提交任务
  - TIDYING：整理中
  - TERMINATED：终止

**自定义线程池示例**：
```java
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    5,                              // 核心线程数
    10,                             // 最大线程数
    60L,                            // 空闲线程存活时间
    TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(100), // 工作队列
    new ThreadFactory() {
        private int count = 0;
        @Override
        public Thread newThread(Runnable r) {
            return new Thread(r, "my-thread-" + count++);
        }
    },
    new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
);
```

### 3.2 Executors工具类

**常用方法**：
```java
// 固定线程数
ExecutorService executor1 = Executors.newFixedThreadPool(10);

// 单线程
ExecutorService executor2 = Executors.newSingleThreadExecutor();

// 缓存线程池（线程数可动态调整）
ExecutorService executor3 = Executors.newCachedThreadPool();

// 定时任务
ScheduledExecutorService executor4 = Executors.newScheduledThreadPool(10);
```

**面试重点**：
- 为什么不推荐使用Executors？
  - `newFixedThreadPool`和`newSingleThreadExecutor`：使用无界队列，可能导致OOM
  - `newCachedThreadPool`：最大线程数为Integer.MAX_VALUE，可能创建大量线程
  - 推荐手动创建ThreadPoolExecutor，明确参数

---

## 4. 原子类

**原子类分类**：
- 基本类型：`AtomicInteger`、`AtomicLong`、`AtomicBoolean`
- 引用类型：`AtomicReference`、`AtomicStampedReference`、`AtomicMarkableReference`
- 数组类型：`AtomicIntegerArray`、`AtomicLongArray`、`AtomicReferenceArray`
- 字段更新器：`AtomicIntegerFieldUpdater`、`AtomicLongFieldUpdater`、`AtomicReferenceFieldUpdater`

**使用示例**：
```java
public class AtomicExample {
    private AtomicInteger count = new AtomicInteger(0);
    
    public void increment() {
        count.incrementAndGet();  // 原子操作
    }
    
    public int getCount() {
        return count.get();
    }
    
    // CAS操作
    public boolean compareAndSet(int expect, int update) {
        return count.compareAndSet(expect, update);
    }
}
```

**面试重点**：
- 原子类的实现原理
  - 基于CAS（Compare-And-Swap）操作
  - 使用Unsafe类直接操作内存
- CAS的ABA问题
  - 问题：值从A变成B再变回A，CAS认为没有变化
  - 解决：使用`AtomicStampedReference`（带版本号）
- CAS的缺点
  - 自旋时间长，CPU开销大
  - 只能保证一个变量的原子性
  - ABA问题

**AtomicStampedReference示例**：
```java
AtomicStampedReference<Integer> atomicRef = new AtomicStampedReference<>(100, 1);

int stamp = atomicRef.getStamp();
Integer value = atomicRef.getReference();

// 更新值和版本号
atomicRef.compareAndSet(value, 200, stamp, stamp + 1);
```

---

## 5. 同步工具类

### 5.1 CountDownLatch（倒计时门闩）

**特点**：
- 一个或多个线程等待其他线程完成
- 计数器只能使用一次

**使用场景**：
- 等待多个线程完成后再执行
- 主线程等待子线程完成

```java
public class CountDownLatchExample {
    public static void main(String[] args) throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(3);
        
        for (int i = 0; i < 3; i++) {
            new Thread(() -> {
                try {
                    // 执行任务
                    Thread.sleep(1000);
                    System.out.println("任务完成");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    latch.countDown();  // 计数减1
                }
            }).start();
        }
        
        latch.await();  // 等待计数为0
        System.out.println("所有任务完成");
    }
}
```

**面试重点**：
- CountDownLatch vs join()
  - CountDownLatch更灵活，可以控制等待的线程数
  - join()只能等待一个线程

### 5.2 CyclicBarrier（循环屏障）

**特点**：
- 多个线程相互等待，到达屏障点后继续执行
- 可以重复使用（cyclic）

**使用场景**：
- 多个线程分阶段执行任务
- 数据分片处理

```java
public class CyclicBarrierExample {
    public static void main(String[] args) {
        CyclicBarrier barrier = new CyclicBarrier(3, () -> {
            System.out.println("所有线程到达屏障点");
        });
        
        for (int i = 0; i < 3; i++) {
            new Thread(() -> {
                try {
                    // 执行第一阶段
                    System.out.println("第一阶段完成");
                    barrier.await();  // 等待其他线程
                    
                    // 执行第二阶段
                    System.out.println("第二阶段完成");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }).start();
        }
    }
}
```

**面试重点**：
- CyclicBarrier vs CountDownLatch
  - CyclicBarrier：多个线程相互等待
  - CountDownLatch：一个或多个线程等待其他线程
  - CyclicBarrier可以重复使用

### 5.3 Semaphore（信号量）

**特点**：
- 控制同时访问资源的线程数
- 可以用于限流

**使用场景**：
- 资源池管理
- 限流

```java
public class SemaphoreExample {
    public static void main(String[] args) {
        Semaphore semaphore = new Semaphore(3);  // 允许3个线程同时访问
        
        for (int i = 0; i < 10; i++) {
            new Thread(() -> {
                try {
                    semaphore.acquire();  // 获取许可
                    System.out.println("线程执行: " + Thread.currentThread().getName());
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    semaphore.release();  // 释放许可
                }
            }).start();
        }
    }
}
```

**面试重点**：
- Semaphore的实现原理
  - 基于AQS实现
  - 维护一个许可证计数器

---

## 6. CompletableFuture

**特点**：
- Java 8引入的异步编程工具
- 支持链式调用
- 支持组合多个异步任务

**使用示例**：
```java
// 创建异步任务
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    return "Hello";
});

// 链式调用
CompletableFuture<String> result = CompletableFuture
    .supplyAsync(() -> "Hello")
    .thenApply(s -> s + " World")
    .thenApply(String::toUpperCase);

// 组合多个任务
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> "Task1");
CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> "Task2");

CompletableFuture<String> combined = future1.thenCombine(future2, (s1, s2) -> s1 + s2);

// 等待所有任务完成
CompletableFuture.allOf(future1, future2).join();

// 等待任一任务完成
CompletableFuture.anyOf(future1, future2).join();
```

**面试重点**：
- CompletableFuture vs Future
  - CompletableFuture支持链式调用
  - CompletableFuture支持组合多个任务
  - CompletableFuture支持异常处理
- 常用方法
  - `supplyAsync`：有返回值的异步任务
  - `runAsync`：无返回值的异步任务
  - `thenApply`：转换结果
  - `thenAccept`：消费结果
  - `thenCompose`：组合另一个CompletableFuture
  - `thenCombine`：组合两个CompletableFuture

---

## 面试常见问题

1. **ReentrantLock和synchronized的区别**
   - ReentrantLock更灵活
   - synchronized更简单

2. **线程池参数如何设置？**
   - CPU密集型：核心线程数 = CPU核心数 + 1
   - IO密集型：核心线程数 = CPU核心数 * 2

3. **CAS的ABA问题**
   - 使用AtomicStampedReference解决

4. **CountDownLatch和CyclicBarrier的区别**
   - CountDownLatch：一个或多个线程等待其他线程
   - CyclicBarrier：多个线程相互等待

---

*最后更新时间：2024年*
