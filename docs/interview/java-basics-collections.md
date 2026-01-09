---
order: 3
---

# Java基础 - 集合框架

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
