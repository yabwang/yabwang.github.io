# Java基础学习文档

## 目录
- [1. 语言特性](#1-语言特性)
- [2. 集合框架](#2-集合框架)
- [3. IO/NIO](#3-ionio)

---

## 1. 语言特性

### 1.1 面向对象编程（OOP）

#### 1.1.1 封装（Encapsulation）
**概念**：将数据和方法包装在类中，隐藏内部实现细节，只暴露必要的接口。

**实现方式**：
- 使用访问修饰符：`private`、`protected`、`public`
- 提供getter/setter方法

**面试重点**：
- 为什么要封装？提高代码安全性和可维护性
- 封装的好处：数据隐藏、代码复用、易于维护

```java
public class Person {
    private String name;  // 私有属性
    private int age;
    
    // 公共方法访问私有属性
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
}
```

#### 1.1.2 继承（Inheritance）
**概念**：子类继承父类的属性和方法，实现代码复用。

**特点**：
- Java只支持单继承（一个类只能继承一个父类）
- 使用`extends`关键字
- 子类可以重写父类方法（`@Override`）
- 子类可以访问父类的`protected`和`public`成员

**面试重点**：
- 继承的优缺点
- 方法重写（Override）vs 方法重载（Overload）
- `super`关键字的作用
- 构造函数的调用顺序

```java
// 父类
public class Animal {
    protected String name;
    
    public Animal(String name) {
        this.name = name;
    }
    
    public void eat() {
        System.out.println(name + " is eating");
    }
}

// 子类
public class Dog extends Animal {
    public Dog(String name) {
        super(name);  // 调用父类构造函数
    }
    
    @Override
    public void eat() {
        super.eat();  // 调用父类方法
        System.out.println("Dog is eating dog food");
    }
}
```

#### 1.1.3 多态（Polymorphism）
**概念**：同一个接口，不同的实现方式。

**实现方式**：
- 方法重写（运行时多态）
- 方法重载（编译时多态）
- 接口实现

**面试重点**：
- 多态的实现原理（虚方法表）
- 向上转型和向下转型
- `instanceof`关键字的使用

```java
// 父类引用指向子类对象
Animal animal = new Dog("旺财");
animal.eat();  // 运行时调用Dog的eat方法

// 向下转型
if (animal instanceof Dog) {
    Dog dog = (Dog) animal;
}
```

#### 1.1.4 抽象（Abstraction）
**概念**：提取共同特征，隐藏具体实现。

**实现方式**：
- 抽象类（`abstract class`）
- 接口（`interface`）

**抽象类 vs 接口**：
| 特性 | 抽象类 | 接口 |
|------|--------|------|
| 关键字 | abstract class | interface |
| 成员变量 | 可以有普通变量 | 只能是常量（public static final） |
| 方法 | 可以有普通方法 | Java 8+可以有默认方法 |
| 继承 | 单继承 | 多实现 |
| 构造函数 | 可以有 | 不能有 |

**面试重点**：
- 什么时候用抽象类？什么时候用接口？
- Java 8接口新特性（default方法、static方法）
- 接口的默认方法解决什么问题？

```java
// 抽象类
public abstract class Shape {
    protected String color;
    
    public abstract double area();  // 抽象方法
    
    public void setColor(String color) {  // 普通方法
        this.color = color;
    }
}

// 接口
public interface Flyable {
    void fly();  // 抽象方法
    
    // Java 8 默认方法
    default void land() {
        System.out.println("Landing...");
    }
    
    // Java 8 静态方法
    static void info() {
        System.out.println("This is a flyable interface");
    }
}
```

### 1.2 Java 8+ 新特性

#### 1.2.1 Lambda表达式
**语法**：`(parameters) -> expression` 或 `(parameters) -> { statements }`

**使用场景**：
- 函数式接口
- 集合操作
- 事件处理

**面试重点**：
- Lambda表达式的原理（函数式接口）
- 方法引用（Method Reference）
- 变量捕获规则

```java
// 传统方式
Runnable r1 = new Runnable() {
    @Override
    public void run() {
        System.out.println("Hello");
    }
};

// Lambda表达式
Runnable r2 = () -> System.out.println("Hello");

// 方法引用
List<String> list = Arrays.asList("a", "b", "c");
list.forEach(System.out::println);  // 方法引用
```

#### 1.2.2 Stream API
**概念**：对集合进行函数式编程操作。

**常用操作**：
- 中间操作：`filter`、`map`、`sorted`、`distinct`
- 终端操作：`forEach`、`collect`、`reduce`、`count`

**面试重点**：
- Stream的延迟执行特性
- Stream vs 传统循环的性能
- 并行流（parallelStream）的使用场景

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// 过滤偶数，乘以2，求和
int sum = numbers.stream()
    .filter(n -> n % 2 == 0)
    .map(n -> n * 2)
    .reduce(0, Integer::sum);

// 收集结果
List<Integer> result = numbers.stream()
    .filter(n -> n > 5)
    .collect(Collectors.toList());
```

#### 1.2.3 Optional
**概念**：用于避免`NullPointerException`的容器类。

**常用方法**：
- `of()`、`ofNullable()`、`empty()`
- `isPresent()`、`ifPresent()`
- `orElse()`、`orElseGet()`、`orElseThrow()`
- `map()`、`flatMap()`

**面试重点**：
- Optional的使用场景
- `orElse()` vs `orElseGet()`的区别（性能）

```java
Optional<String> optional = Optional.ofNullable(getString());

// 传统方式
if (optional.isPresent()) {
    System.out.println(optional.get());
}

// 函数式方式
optional.ifPresent(System.out::println);

// 默认值
String value = optional.orElse("default");
String value2 = optional.orElseGet(() -> "default");
```

#### 1.2.4 函数式接口
**概念**：只有一个抽象方法的接口。

**Java内置函数式接口**：
- `Function<T, R>`：接受一个参数，返回一个结果
- `Predicate<T>`：接受一个参数，返回boolean
- `Consumer<T>`：接受一个参数，无返回值
- `Supplier<T>`：无参数，返回一个结果

**面试重点**：
- `@FunctionalInterface`注解的作用
- 自定义函数式接口

```java
@FunctionalInterface
public interface MyFunction {
    int apply(int x, int y);
}

// 使用
MyFunction add = (x, y) -> x + y;
MyFunction multiply = (x, y) -> x * y;
```

### 1.3 泛型机制

**概念**：参数化类型，在编译时确定类型。

**使用场景**：
- 集合类
- 泛型类、泛型接口、泛型方法

**面试重点**：
- 泛型擦除（Type Erasure）
- 通配符：`?`、`? extends T`、`? super T`
- PECS原则（Producer Extends, Consumer Super）
- 泛型的限制（不能创建泛型数组等）

```java
// 泛型类
public class Box<T> {
    private T item;
    
    public void setItem(T item) {
        this.item = item;
    }
    
    public T getItem() {
        return item;
    }
}

// 泛型方法
public static <T> T getFirst(List<T> list) {
    return list.get(0);
}

// 通配符
List<? extends Number> numbers;  // 上界通配符
List<? super Integer> integers;  // 下界通配符
```

**泛型擦除示例**：
```java
// 编译后，泛型信息被擦除
List<String> list1 = new ArrayList<>();
List<Integer> list2 = new ArrayList<>();
// list1.getClass() == list2.getClass()  // true
```

### 1.4 反射机制

**概念**：在运行时获取类的信息并操作类。

**核心类**：
- `Class`：类的信息
- `Field`：字段信息
- `Method`：方法信息
- `Constructor`：构造器信息

**面试重点**：
- 反射的优缺点
- 反射的使用场景（框架、动态代理）
- 反射的性能问题
- 如何获取Class对象

```java
// 获取Class对象的三种方式
Class<?> clazz1 = String.class;
Class<?> clazz2 = "hello".getClass();
Class<?> clazz3 = Class.forName("java.lang.String");

// 使用反射创建对象
Class<?> clazz = Class.forName("com.example.Person");
Constructor<?> constructor = clazz.getConstructor(String.class, int.class);
Object obj = constructor.newInstance("张三", 25);

// 使用反射调用方法
Method method = clazz.getMethod("getName");
String name = (String) method.invoke(obj);
```

### 1.5 注解（Annotation）

**概念**：元数据，为代码提供信息。

**内置注解**：
- `@Override`：重写方法
- `@Deprecated`：标记过时
- `@SuppressWarnings`：抑制警告
- `@FunctionalInterface`：函数式接口

**元注解**：
- `@Target`：注解作用目标
- `@Retention`：注解保留策略
- `@Documented`：包含在JavaDoc中
- `@Inherited`：可继承

**面试重点**：
- 注解的保留策略（SOURCE、CLASS、RUNTIME）
- 如何自定义注解
- 注解的解析（反射）

```java
// 自定义注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface MyAnnotation {
    String value() default "";
    int count() default 0;
}

// 使用注解
public class MyClass {
    @MyAnnotation(value = "test", count = 10)
    public void myMethod() {
        // ...
    }
}

// 解析注解
Method method = MyClass.class.getMethod("myMethod");
MyAnnotation annotation = method.getAnnotation(MyAnnotation.class);
String value = annotation.value();
```

### 1.6 异常处理机制

**异常体系**：
```
Throwable
├── Error（错误，不可恢复）
└── Exception（异常）
    ├── RuntimeException（运行时异常）
    └── 其他Exception（检查异常）
```

**异常处理**：
- `try-catch-finally`
- `try-with-resources`（Java 7+）
- `throws`声明异常
- `throw`抛出异常

**面试重点**：
- Error vs Exception
- 运行时异常 vs 检查异常
- finally的执行时机
- try-with-resources的原理
- 异常链（Exception Chaining）

```java
// try-catch-finally
try {
    // 可能抛出异常的代码
    int result = 10 / 0;
} catch (ArithmeticException e) {
    // 处理异常
    System.out.println("除零错误: " + e.getMessage());
} finally {
    // 总是执行
    System.out.println("清理资源");
}

// try-with-resources（自动关闭资源）
try (FileInputStream fis = new FileInputStream("file.txt");
     BufferedInputStream bis = new BufferedInputStream(fis)) {
    // 使用资源
} catch (IOException e) {
    // 处理异常
} // 资源自动关闭

// 自定义异常
public class MyException extends Exception {
    public MyException(String message) {
        super(message);
    }
}
```

**常见异常**：
- `NullPointerException`：空指针异常
- `ArrayIndexOutOfBoundsException`：数组越界
- `ClassCastException`：类型转换异常
- `IllegalArgumentException`：非法参数异常
- `IOException`：IO异常

---

## 2. 集合框架

### 2.1 集合框架概述

**集合框架层次结构**：
```
Collection
├── List（有序、可重复）
│   ├── ArrayList
│   ├── LinkedList
│   └── Vector
├── Set（无序、不可重复）
│   ├── HashSet
│   ├── LinkedHashSet
│   └── TreeSet
└── Queue（队列）
    ├── PriorityQueue
    └── Deque

Map（键值对）
├── HashMap
├── LinkedHashMap
├── TreeMap
└── Hashtable
```

### 2.2 List接口

#### 2.2.1 ArrayList
**特点**：
- 基于动态数组实现
- 随机访问快（O(1)）
- 插入删除慢（O(n)）
- 线程不安全

**底层实现**：
- 默认容量：10
- 扩容机制：`newCapacity = oldCapacity + (oldCapacity >> 1)`（1.5倍）
- 扩容时机：当size >= capacity时

**面试重点**：
- ArrayList的扩容机制
- ArrayList vs Vector（线程安全）
- ArrayList vs LinkedList（性能对比）

```java
// ArrayList源码关键点
public class ArrayList<E> {
    private static final int DEFAULT_CAPACITY = 10;
    private Object[] elementData;
    private int size;
    
    // 扩容方法
    private void grow(int minCapacity) {
        int oldCapacity = elementData.length;
        int newCapacity = oldCapacity + (oldCapacity >> 1);  // 1.5倍
        if (newCapacity < minCapacity) {
            newCapacity = minCapacity;
        }
        elementData = Arrays.copyOf(elementData, newCapacity);
    }
}
```

#### 2.2.2 LinkedList
**特点**：
- 基于双向链表实现
- 插入删除快（O(1)）
- 随机访问慢（O(n)）
- 线程不安全

**面试重点**：
- LinkedList的底层结构（双向链表）
- ArrayList vs LinkedList的选择

```java
// LinkedList节点结构
private static class Node<E> {
    E item;
    Node<E> next;
    Node<E> prev;
    
    Node(Node<E> prev, E element, Node<E> next) {
        this.item = element;
        this.next = next;
        this.prev = prev;
    }
}
```

#### 2.2.3 Vector
**特点**：
- 线程安全（synchronized）
- 性能较差（不推荐使用）
- 扩容机制：默认2倍

### 2.3 Set接口

#### 2.3.1 HashSet
**特点**：
- 基于HashMap实现
- 无序、不可重复
- 允许null值
- 线程不安全

**实现原理**：
- 使用HashMap存储，value为固定值PRESENT
- 通过hashCode()和equals()判断重复

**面试重点**：
- HashSet如何保证元素唯一性
- hashCode()和equals()的关系
- 为什么重写equals()必须重写hashCode()

```java
// HashSet底层实现
public class HashSet<E> {
    private transient HashMap<E,Object> map;
    private static final Object PRESENT = new Object();
    
    public boolean add(E e) {
        return map.put(e, PRESENT) == null;
    }
}
```

#### 2.3.2 LinkedHashSet
**特点**：
- 继承HashSet
- 维护插入顺序
- 基于LinkedHashMap实现

#### 2.3.3 TreeSet
**特点**：
- 基于TreeMap实现
- 有序（自然排序或自定义排序）
- 不允许null值

### 2.4 Map接口

#### 2.4.1 HashMap
**特点**：
- 基于数组+链表+红黑树（JDK 8+）
- 键值对存储
- 允许null键和null值
- 线程不安全
- 无序

**底层结构**：
- JDK 7：数组+链表
- JDK 8+：数组+链表+红黑树（链表长度>=8时转红黑树）

**关键参数**：
- 默认初始容量：16
- 默认负载因子：0.75
- 扩容阈值：capacity * loadFactor
- 树化阈值：8
- 退树化阈值：6

**面试重点**：
- HashMap的put过程
- HashMap的扩容机制
- 为什么容量是2的幂次方？
- 为什么负载因子是0.75？
- 为什么链表长度>=8转红黑树？
- HashMap的线程安全问题
- JDK 7和JDK 8的区别

```java
// HashMap的put过程
public V put(K key, V value) {
    // 1. 计算hash值
    int hash = hash(key);
    // 2. 计算数组索引
    int index = (n - 1) & hash;
    // 3. 如果桶为空，直接插入
    // 4. 如果桶不为空，遍历链表/红黑树
    // 5. 如果key存在，更新value
    // 6. 如果key不存在，插入新节点
    // 7. 判断是否需要扩容
}
```

**hash()方法的作用**：
```java
// 扰动函数，减少hash冲突
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

#### 2.4.2 LinkedHashMap
**特点**：
- 继承HashMap
- 维护插入顺序或访问顺序
- 可用于实现LRU缓存

**面试重点**：
- LinkedHashMap如何维护顺序
- 如何实现LRU缓存

```java
// LRU缓存实现
public class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;
    
    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);  // accessOrder=true
        this.capacity = capacity;
    }
    
    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }
}
```

#### 2.4.3 TreeMap
**特点**：
- 基于红黑树实现
- 有序（自然排序或自定义排序）
- 不允许null键

#### 2.4.4 ConcurrentHashMap
**特点**：
- 线程安全
- JDK 7：分段锁（Segment）
- JDK 8+：CAS + synchronized

**面试重点**：
- ConcurrentHashMap的线程安全实现
- JDK 7 vs JDK 8的实现差异
- ConcurrentHashMap vs Hashtable
- ConcurrentHashMap vs Collections.synchronizedMap()

```java
// JDK 8 ConcurrentHashMap的put过程
public V put(K key, V value) {
    // 1. 计算hash值
    // 2. 如果table为空，初始化
    // 3. 如果桶为空，CAS插入
    // 4. 如果桶不为空，synchronized锁住头节点
    // 5. 遍历链表/红黑树
    // 6. 插入或更新
}
```

### 2.5 线程安全的集合类

**线程安全的集合**：
- `Vector`：不推荐使用
- `Hashtable`：不推荐使用
- `Collections.synchronizedXXX()`：性能较差
- `ConcurrentHashMap`：推荐
- `CopyOnWriteArrayList`：读多写少场景
- `CopyOnWriteArraySet`：读多写少场景
- `BlockingQueue`：阻塞队列

**面试重点**：
- 各种线程安全集合的实现原理
- 使用场景选择

---

## 3. IO/NIO

### 3.1 传统IO（BIO）

#### 3.1.1 字节流
**InputStream/OutputStream**：
- `FileInputStream/FileOutputStream`：文件流
- `BufferedInputStream/BufferedOutputStream`：缓冲流
- `DataInputStream/DataOutputStream`：数据流
- `ObjectInputStream/ObjectOutputStream`：对象流

#### 3.1.2 字符流
**Reader/Writer**：
- `FileReader/FileWriter`：文件流
- `BufferedReader/BufferedWriter`：缓冲流
- `InputStreamReader/OutputStreamWriter`：转换流

**面试重点**：
- 字节流 vs 字符流
- 什么时候用字节流？什么时候用字符流？
- 缓冲流的作用

```java
// 字节流读取文件
try (FileInputStream fis = new FileInputStream("file.txt");
     BufferedInputStream bis = new BufferedInputStream(fis)) {
    byte[] buffer = new byte[1024];
    int len;
    while ((len = bis.read(buffer)) != -1) {
        // 处理数据
    }
}

// 字符流读取文件
try (FileReader fr = new FileReader("file.txt");
     BufferedReader br = new BufferedReader(fr)) {
    String line;
    while ((line = br.readLine()) != null) {
        // 处理数据
    }
}
```

### 3.2 NIO（New IO）

**核心组件**：
- `Channel`：通道
- `Buffer`：缓冲区
- `Selector`：选择器

**特点**：
- 非阻塞IO
- 面向缓冲区
- 支持选择器（多路复用）

**面试重点**：
- NIO vs BIO的区别
- NIO的三大核心组件
- 零拷贝（Zero Copy）

```java
// NIO读取文件
try (FileChannel channel = FileChannel.open(Paths.get("file.txt"), 
                                            StandardOpenOption.READ)) {
    ByteBuffer buffer = ByteBuffer.allocate(1024);
    while (channel.read(buffer) != -1) {
        buffer.flip();  // 切换为读模式
        // 处理数据
        buffer.clear();  // 清空缓冲区
    }
}
```

**Buffer的四个属性**：
- `capacity`：容量
- `limit`：限制
- `position`：位置
- `mark`：标记

### 3.3 AIO（Asynchronous IO）

**特点**：
- 异步非阻塞IO
- 基于事件和回调机制

**面试重点**：
- AIO vs NIO的区别
- 使用场景

```java
// AIO读取文件
AsynchronousFileChannel channel = AsynchronousFileChannel.open(
    Paths.get("file.txt"), StandardOpenOption.READ);

ByteBuffer buffer = ByteBuffer.allocate(1024);
channel.read(buffer, 0, buffer, new CompletionHandler<Integer, ByteBuffer>() {
    @Override
    public void completed(Integer result, ByteBuffer attachment) {
        // 读取完成
    }
    
    @Override
    public void failed(Throwable exc, ByteBuffer attachment) {
        // 读取失败
    }
});
```

### 3.4 文件操作

**常用操作**：
- 文件读写
- 文件复制
- 目录遍历
- 文件监控

**面试重点**：
- Files类的使用
- Path和Paths的使用
- 文件操作的最佳实践

```java
// 使用Files类操作文件
// 读取文件
List<String> lines = Files.readAllLines(Paths.get("file.txt"));

// 写入文件
Files.write(Paths.get("file.txt"), "content".getBytes());

// 复制文件
Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING);

// 删除文件
Files.delete(Paths.get("file.txt"));
```

---

## 面试常见问题总结

### Java基础
1. **String、StringBuilder、StringBuffer的区别**
   - String：不可变，线程安全
   - StringBuilder：可变，线程不安全，性能好
   - StringBuffer：可变，线程安全，性能较差

2. **== 和 equals() 的区别**
   - ==：比较引用地址
   - equals()：比较对象内容（可重写）

3. **final关键字的作用**
   - final类：不能被继承
   - final方法：不能被重写
   - final变量：常量，只能赋值一次

4. **static关键字的作用**
   - 静态变量：类级别，所有实例共享
   - 静态方法：类级别，不能访问非静态成员
   - 静态代码块：类加载时执行

5. **Java的四种引用类型**
   - 强引用：普通引用，不会被GC
   - 软引用：内存不足时回收
   - 弱引用：GC时回收
   - 虚引用：用于跟踪对象回收

### 集合框架
1. **HashMap的线程安全问题**
   - 多线程环境下可能死循环（JDK 7）
   - 使用ConcurrentHashMap

2. **ArrayList和LinkedList的选择**
   - 随机访问多：ArrayList
   - 插入删除多：LinkedList

3. **如何保证集合的线程安全**
   - 使用Collections.synchronizedXXX()
   - 使用ConcurrentHashMap等并发集合
   - 使用CopyOnWriteArrayList（读多写少）

### IO/NIO
1. **BIO、NIO、AIO的区别**
   - BIO：同步阻塞
   - NIO：同步非阻塞
   - AIO：异步非阻塞

2. **NIO的优势**
   - 非阻塞IO
   - 多路复用
   - 零拷贝

---

## 学习建议

1. **理解原理**：不仅要会用，还要理解底层实现
2. **动手实践**：通过代码验证理论知识
3. **阅读源码**：深入理解集合框架的实现
4. **总结归纳**：整理常见面试问题和答案
5. **持续学习**：关注Java新特性

---

*最后更新时间：2024年*

