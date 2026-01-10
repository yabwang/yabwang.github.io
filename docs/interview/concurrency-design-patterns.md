# 并发设计模式

## 目录
- [1. 生产者消费者模式](#1-生产者消费者模式)
- [2. 线程池模式](#2-线程池模式)
- [3. 线程本地存储（ThreadLocal）](#3-线程本地存储threadlocal)

---

## 1. 生产者消费者模式

**实现方式**：
1. 使用wait/notify
2. 使用BlockingQueue（推荐）
3. 使用Lock + Condition

### 1.1 BlockingQueue实现（推荐）

```java
public class ProducerConsumer {
    private final BlockingQueue<Integer> queue = new LinkedBlockingQueue<>(10);
    
    public void produce() throws InterruptedException {
        int value = 1;
        while (true) {
            queue.put(value);  // 阻塞式放入
            System.out.println("生产: " + value);
            value++;
            Thread.sleep(100);
        }
    }
    
    public void consume() throws InterruptedException {
        while (true) {
            Integer value = queue.take();  // 阻塞式取出
            System.out.println("消费: " + value);
            Thread.sleep(200);
        }
    }
}
```

**面试重点**：
- 为什么使用BlockingQueue？
  - 线程安全
  - 自动阻塞和唤醒
  - 代码简洁

### 1.2 Lock + Condition实现

```java
public class ProducerConsumerWithLock {
    private final Lock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();
    private final Queue<Integer> queue = new LinkedList<>();
    private final int MAX_SIZE = 10;
    
    public void produce() throws InterruptedException {
        lock.lock();
        try {
            while (queue.size() == MAX_SIZE) {
                notFull.await();  // 等待队列不满
            }
            queue.offer(1);
            notEmpty.signal();  // 唤醒消费者
        } finally {
            lock.unlock();
        }
    }
    
    public void consume() throws InterruptedException {
        lock.lock();
        try {
            while (queue.isEmpty()) {
                notEmpty.await();  // 等待队列不空
            }
            queue.poll();
            notFull.signal();  // 唤醒生产者
        } finally {
            lock.unlock();
        }
    }
}
```

### 1.3 wait/notify实现

```java
public class ProducerConsumerWithWaitNotify {
    private final Queue<Integer> queue = new LinkedList<>();
    private final int MAX_SIZE = 10;
    private final Object lock = new Object();
    
    public void produce() throws InterruptedException {
        synchronized (lock) {
            while (queue.size() == MAX_SIZE) {
                lock.wait();  // 队列满，等待
            }
            queue.offer(1);
            lock.notifyAll();  // 唤醒消费者
        }
    }
    
    public void consume() throws InterruptedException {
        synchronized (lock) {
            while (queue.isEmpty()) {
                lock.wait();  // 队列空，等待
            }
            queue.poll();
            lock.notifyAll();  // 唤醒生产者
        }
    }
}
```

**三种实现方式对比**：
| 实现方式 | 优点 | 缺点 |
|---------|------|------|
| BlockingQueue | 代码简洁，线程安全 | 需要额外依赖 |
| Lock + Condition | 灵活，支持多个条件 | 代码较复杂 |
| wait/notify | 原生支持 | 容易出错，需要手动管理 |

---

## 2. 线程池模式

**线程池的优势**：
- 降低资源消耗（线程创建和销毁开销大）
- 提高响应速度（任务到达即可执行）
- 提高线程的可管理性

**线程池的使用**：
```java
// 创建线程池
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    5, 10, 60L, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(100),
    new ThreadPoolExecutor.CallerRunsPolicy()
);

// 提交任务
Future<String> future = executor.submit(() -> {
    return "任务结果";
});

// 获取结果
String result = future.get();

// 关闭线程池
executor.shutdown();
```

**线程池的使用场景**：
- 高并发任务处理
- 异步任务执行
- 定时任务调度
- 资源池管理

**线程池的最佳实践**：
1. 根据任务类型设置合适的线程数
2. 使用有界队列避免OOM
3. 自定义拒绝策略
4. 正确关闭线程池（shutdown()或shutdownNow()）
5. 监控线程池状态

---

## 3. 线程本地存储（ThreadLocal）

**概念**：
- 为每个线程提供独立的变量副本
- 线程间数据隔离

**使用示例**：
```java
public class ThreadLocalExample {
    private static ThreadLocal<String> threadLocal = new ThreadLocal<>();
    
    public void setValue(String value) {
        threadLocal.set(value);
    }
    
    public String getValue() {
        return threadLocal.get();
    }
    
    public void remove() {
        threadLocal.remove();  // 防止内存泄漏
    }
}
```

**实现原理**：
- 每个Thread维护一个ThreadLocalMap
- ThreadLocal作为key，存储的值作为value
- 使用弱引用避免内存泄漏

**ThreadLocalMap结构**：
```java
static class ThreadLocalMap {
    static class Entry extends WeakReference<ThreadLocal<?>> {
        Object value;
        Entry(ThreadLocal<?> k, Object v) {
            super(k);
            value = v;
        }
    }
}
```

**面试重点**：
- ThreadLocal的内存泄漏问题
  - 原因：ThreadLocalMap的key是弱引用，value是强引用
  - 如果ThreadLocal被回收，key变为null，但value仍然存在
  - 解决：使用完调用`remove()`方法
- ThreadLocal的使用场景
  - 用户信息存储（Spring的RequestContextHolder）
  - 数据库连接管理
  - 日期格式化（SimpleDateFormat线程不安全）
  - 事务管理

**内存泄漏示例**：
```java
public class ThreadLocalMemoryLeak {
    private static ThreadLocal<BigObject> threadLocal = new ThreadLocal<>();
    
    public void method() {
        threadLocal.set(new BigObject());
        // 忘记调用remove()，导致内存泄漏
        // ThreadLocal被回收后，value仍然存在，无法被GC
    }
}
```

**正确使用方式**：
```java
public void method() {
    try {
        threadLocal.set(new BigObject());
        // 使用threadLocal
    } finally {
        threadLocal.remove();  // 必须清理
    }
}
```

**InheritableThreadLocal**：
- 子线程可以继承父线程的ThreadLocal值
- 使用场景：需要在子线程中使用父线程的上下文信息

```java
public class InheritableThreadLocalExample {
    private static InheritableThreadLocal<String> threadLocal = 
        new InheritableThreadLocal<>();
    
    public static void main(String[] args) {
        threadLocal.set("父线程的值");
        
        new Thread(() -> {
            System.out.println("子线程获取: " + threadLocal.get());  // 可以获取父线程的值
        }).start();
    }
}
```

**ThreadLocal在Spring中的应用**：
```java
// Spring的RequestContextHolder使用ThreadLocal存储请求上下文
public abstract class RequestContextHolder {
    private static final ThreadLocal<RequestAttributes> requestAttributesHolder = 
        new NamedThreadLocal<>("Request attributes");
    
    public static RequestAttributes getRequestAttributes() {
        return requestAttributesHolder.get();
    }
    
    public static void setRequestAttributes(RequestAttributes attributes) {
        requestAttributesHolder.set(attributes);
    }
    
    public static void resetRequestAttributes() {
        requestAttributesHolder.remove();
    }
}
```

---

## 面试常见问题

1. **ThreadLocal的内存泄漏问题**
   - 使用完必须调用remove()
   - ThreadLocalMap的key是弱引用，value是强引用

2. **如何实现线程安全的单例？**
   - 双重检查锁定
   - 静态内部类
   - 枚举

3. **生产者消费者模式的实现方式**
   - BlockingQueue（推荐）
   - Lock + Condition
   - wait/notify

4. **线程池的使用场景**
   - 高并发任务处理
   - 异步任务执行
   - 定时任务调度

---

## 学习建议

1. **理解原理**：深入理解ThreadLocal的实现原理和内存泄漏问题
2. **动手实践**：实现生产者消费者模式，理解不同实现方式的优缺点
3. **阅读源码**：阅读ThreadLocal和线程池的源码
4. **最佳实践**：掌握ThreadLocal的正确使用方式，避免内存泄漏

---

*最后更新时间：2024年*
