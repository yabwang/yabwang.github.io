---
order: 2
---

# Java基础 - 语言特性

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
