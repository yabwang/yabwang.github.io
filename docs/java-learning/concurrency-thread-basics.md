# 线程基础

## 目录
- [1. 线程的创建方式](#1-线程的创建方式)
- [2. 线程生命周期](#2-线程生命周期)
- [3. 线程同步机制](#3-线程同步机制)
- [4. wait/notify/notifyAll](#4-waitnotifynotifyall)

---

## 1. 线程的创建方式

### 1.1 继承Thread类
```java
public class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("线程执行: " + Thread.currentThread().getName());
    }
}

// 使用
MyThread thread = new MyThread();
thread.start();
```

**面试重点**：
- 为什么调用`start()`而不是`run()`？
  - `start()`会启动新线程，调用`run()`方法
  - `run()`只是普通方法调用，不会创建新线程

### 1.2 实现Runnable接口（推荐）
```java
public class MyRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println("线程执行: " + Thread.currentThread().getName());
    }
}

// 使用
Thread thread = new Thread(new MyRunnable());
thread.start();

// Lambda表达式方式
Thread thread2 = new Thread(() -> {
    System.out.println("Lambda方式创建线程");
});
thread2.start();
```

**面试重点**：
- 为什么推荐实现Runnable接口？
  - Java单继承，实现接口更灵活
  - 资源共享：多个线程可以共享同一个Runnable实例

### 1.3 实现Callable接口
```java
public class MyCallable implements Callable<String> {
    @Override
    public String call() throws Exception {
        Thread.sleep(1000);
        return "执行结果";
    }
}

// 使用
FutureTask<String> futureTask = new FutureTask<>(new MyCallable());
Thread thread = new Thread(futureTask);
thread.start();

// 获取结果
String result = futureTask.get();  // 阻塞等待结果
```

**面试重点**：
- Callable vs Runnable的区别
  - Callable有返回值
  - Callable可以抛出异常
  - Callable需要配合FutureTask使用

### 1.4 线程池创建（推荐）
```java
ExecutorService executor = Executors.newFixedThreadPool(10);
executor.submit(() -> {
    System.out.println("线程池执行任务");
});
executor.shutdown();
```

**面试重点**：
- 为什么推荐使用线程池？
  - 降低资源消耗（线程创建和销毁开销大）
  - 提高响应速度（任务到达即可执行）
  - 提高线程的可管理性

---

## 2. 线程生命周期

**线程的6种状态**（Thread.State枚举）：
1. **NEW**：新建状态，线程被创建但未启动
2. **RUNNABLE**：可运行状态，包括运行中（Running）和就绪（Ready）
3. **BLOCKED**：阻塞状态，等待获取监视器锁
4. **WAITING**：等待状态，无限期等待其他线程的特定操作
5. **TIMED_WAITING**：超时等待状态，在指定时间内等待
6. **TERMINATED**：终止状态，线程执行完毕

**状态转换图**：
```
NEW --start()--> RUNNABLE --获取锁--> RUNNABLE
                |                      |
                |--wait()--> WAITING --notify()--> RUNNABLE
                |                      |
                |--sleep(time)--> TIMED_WAITING --时间到--> RUNNABLE
                |                      |
                |--获取锁失败--> BLOCKED --获取锁--> RUNNABLE
                |                      |
                --run()结束--> TERMINATED
```

**面试重点**：
- BLOCKED vs WAITING的区别
  - BLOCKED：等待获取synchronized锁
  - WAITING：等待其他线程的唤醒操作（wait、join等）
- 如何查看线程状态？
  - `thread.getState()`
  - `jstack`命令

```java
Thread thread = new Thread(() -> {
    try {
        Thread.sleep(1000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
});

System.out.println(thread.getState());  // NEW
thread.start();
System.out.println(thread.getState());  // RUNNABLE
Thread.sleep(100);
System.out.println(thread.getState());  // TIMED_WAITING
Thread.sleep(2000);
System.out.println(thread.getState());  // TERMINATED
```

---

## 3. 线程同步机制

### 3.1 synchronized关键字

**使用方式**：
1. 同步代码块
2. 同步方法
3. 同步静态方法

```java
// 1. 同步代码块
public void method() {
    synchronized (this) {
        // 同步代码
    }
}

// 2. 同步实例方法
public synchronized void method() {
    // 同步代码
}

// 3. 同步静态方法
public static synchronized void method() {
    // 同步代码
}
```

**锁的对象**：
- 实例方法：锁的是当前对象（this）
- 静态方法：锁的是类对象（Class对象）
- 代码块：锁的是指定的对象

**面试重点**：
- synchronized的实现原理
  - 基于JVM的monitor机制
  - 字节码层面：`monitorenter`和`monitorexit`指令
  - 对象头中的Mark Word存储锁信息
- synchronized的锁升级过程
  - 无锁 → 偏向锁 → 轻量级锁 → 重量级锁
- synchronized vs Lock的区别
  - synchronized是关键字，Lock是接口
  - synchronized自动释放锁，Lock需要手动释放
  - synchronized不可中断，Lock可中断
  - synchronized非公平锁，Lock可以公平/非公平
  - Lock可以尝试获取锁（tryLock）

**锁升级过程详解**：
```
1. 无锁状态：对象刚创建
2. 偏向锁：只有一个线程访问，在对象头记录线程ID
3. 轻量级锁：多个线程竞争，通过CAS获取锁
4. 重量级锁：竞争激烈，线程阻塞，进入等待队列
```

### 3.2 volatile关键字

**作用**：
1. **可见性**：保证变量对所有线程的可见性
2. **有序性**：禁止指令重排序

```java
public class VolatileExample {
    private volatile boolean flag = false;
    
    public void writer() {
        flag = true;  // 写操作
    }
    
    public void reader() {
        if (flag) {  // 读操作
            // 操作
        }
    }
}
```

**面试重点**：
- volatile的实现原理
  - 通过内存屏障（Memory Barrier）实现
  - 写操作：强制将工作内存的值刷新到主内存
  - 读操作：强制从主内存读取最新值
- volatile vs synchronized
  - volatile只能保证可见性和有序性，不能保证原子性
  - synchronized可以保证原子性、可见性、有序性
- volatile的使用场景
  - 状态标志位
  - 双重检查锁定（Double-Checked Locking）
  - 单例模式

**volatile不能保证原子性的例子**：
```java
public class VolatileTest {
    private volatile int count = 0;
    
    public void increment() {
        count++;  // 不是原子操作，包含：读取、加1、写入
    }
}
// 即使count是volatile，多线程下仍然会出现问题
```

**内存屏障**：
- LoadLoad：禁止读和读重排序
- StoreStore：禁止写和写重排序
- LoadStore：禁止读和写重排序
- StoreLoad：禁止写和读重排序

---

## 4. wait/notify/notifyAll

**Object类的方法**：
- `wait()`：使当前线程等待，释放锁
- `notify()`：唤醒一个等待的线程
- `notifyAll()`：唤醒所有等待的线程

**使用前提**：
- 必须在synchronized代码块中使用
- 必须持有对象的监视器锁

```java
public class WaitNotifyExample {
    private final Object lock = new Object();
    private boolean flag = false;
    
    public void waitMethod() throws InterruptedException {
        synchronized (lock) {
            while (!flag) {  // 使用while而不是if（防止虚假唤醒）
                lock.wait();  // 释放锁，进入等待状态
            }
            // 执行操作
        }
    }
    
    public void notifyMethod() {
        synchronized (lock) {
            flag = true;
            lock.notify();  // 或 notifyAll()
        }
    }
}
```

**面试重点**：
- wait()和sleep()的区别
  - wait()是Object的方法，sleep()是Thread的方法
  - wait()会释放锁，sleep()不会释放锁
  - wait()必须在synchronized中使用，sleep()不需要
  - wait()可以被notify()唤醒，sleep()只能等待时间到
- 为什么wait()要在while循环中调用？
  - 防止虚假唤醒（Spurious Wakeup）
  - 确保条件满足后再继续执行
- notify() vs notifyAll()
  - notify()：随机唤醒一个线程
  - notifyAll()：唤醒所有等待的线程
  - 一般使用notifyAll()更安全

**生产者消费者模式示例**：
```java
public class ProducerConsumer {
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

---

## 面试常见问题

1. **线程和进程的区别**
   - 进程：资源分配的基本单位
   - 线程：CPU调度的基本单位
   - 一个进程可以包含多个线程

2. **如何停止一个线程？**
   - 使用标志位（推荐）
   - 使用`interrupt()`方法
   - 不推荐使用`stop()`（已废弃）

3. **synchronized的锁升级过程**
   - 无锁 → 偏向锁 → 轻量级锁 → 重量级锁

4. **volatile的作用**
   - 保证可见性
   - 保证有序性
   - 不能保证原子性

---

*最后更新时间：2024年*
