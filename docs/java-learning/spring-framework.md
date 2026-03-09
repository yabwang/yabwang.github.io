---
order: 10
---

# Spring 框架核心原理

> 深入理解 Spring 框架的核心机制：IOC、AOP、Bean 生命周期与事务管理

## 一、IOC 容器原理

### 1.1 什么是 IOC

**IOC（Inversion of Control，控制反转）** 是一种设计思想，将对象的创建和管理权交给 Spring 容器，实现解耦。

```java
// 传统方式：对象自行创建依赖
public class UserService {
    private UserDao userDao = new UserDaoImpl(); // 紧耦合
}

// Spring IOC：依赖注入
public class UserService {
    @Autowired
    private UserDao userDao; // 松耦合，由 Spring 注入
}
```

### 1.2 IOC 容器核心组件

```
┌─────────────────────────────────────────┐
│            ApplicationContext           │
│  (BeanFactory 的子接口，提供更多功能)      │
├─────────────────────────────────────────┤
│              BeanFactory                │
│         (IoC 容器的核心接口)              │
├─────────────────────────────────────────┤
│  BeanDefinitionRegistry (注册 Bean 定义) │
│  BeanDefinitionReader (读取 Bean 定义)    │
└─────────────────────────────────────────┘
```

**核心接口：**

| 接口 | 作用 |
|------|------|
| `BeanFactory` | IOC 容器基础接口，延迟加载 |
| `ApplicationContext` | 扩展接口，支持国际化、事件发布等 |
| `BeanDefinition` | Bean 的定义信息（类名、作用域、属性等） |
| `BeanPostProcessor` | Bean 后置处理器，可自定义初始化逻辑 |

### 1.3 Bean 的注册方式

**1. XML 配置方式**
```xml
<bean id="userService" class="com.example.UserService">
    <property name="userDao" ref="userDao"/>
</bean>
```

**2. 注解方式**
```java
@Component  // 通用组件
@Service    // 服务层
@Repository // 数据访问层
@Controller // 控制层
```

**3. Java 配置方式**
```java
@Configuration
public class AppConfig {
    @Bean
    public UserService userService() {
        return new UserService();
    }
}
```

**4. 包扫描**
```java
@ComponentScan("com.example")
// 或
<context:component-scan base-package="com.example"/>
```

### 1.4 依赖注入方式

```java
// 1. 构造器注入（推荐）
@Service
public class UserService {
    private final UserDao userDao;

    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }
}

// 2. Setter 注入
@Service
public class UserService {
    private UserDao userDao;

    @Autowired
    public void setUserDao(UserDao userDao) {
        this.userDao = userDao;
    }
}

// 3. 字段注入（不推荐，不利于测试）
@Service
public class UserService {
    @Autowired
    private UserDao userDao;
}
```

**构造器注入优势：**
- 保证依赖不可变（final）
- 保证依赖不为空
- 便于单元测试
- 完全初始化状态

---

## 二、Bean 生命周期

### 2.1 生命周期流程

```
┌──────────────────────────────────────────────────────────────┐
│                    Bean 生命周期完整流程                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 实例化 (Instantiation)                                   │
│     └─> 构造器创建 Bean 实例                                  │
│                                                              │
│  2. 属性赋值 (Populate)                                       │
│     └─> 依赖注入                                              │
│                                                              │
│  3. 初始化前处理                                              │
│     └─> BeanPostProcessor.postProcessBeforeInitialization() │
│                                                              │
│  4. 初始化 (Initialization)                                   │
│     ├─> @PostConstruct                                       │
│     ├─> InitializingBean.afterPropertiesSet()               │
│     └─> init-method                                          │
│                                                              │
│  5. 初始化后处理                                              │
│     └─> BeanPostProcessor.postProcessAfterInitialization()  │
│                                                              │
│  6. 使用 (In Use)                                            │
│     └─> Bean 处于就绪状态，可被调用                            │
│                                                              │
│  7. 销毁 (Destruction)                                        │
│     ├─> @PreDestroy                                          │
│     ├─> DisposableBean.destroy()                            │
│     └─> destroy-method                                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 生命周期代码示例

```java
@Component
public class LifeCycleBean implements InitializingBean, DisposableBean {

    private String name;

    // 1. 构造器
    public LifeCycleBean() {
        System.out.println("1. 构造器执行");
    }

    // 2. 属性注入
    @Autowired
    public void setName(@Value("${app.name}") String name) {
        this.name = name;
        System.out.println("2. 属性注入: " + name);
    }

    // 3. 初始化前
    @PostConstruct
    public void postConstruct() {
        System.out.println("3. @PostConstruct 初始化前");
    }

    // 4. InitializingBean 接口方法
    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("4. afterPropertiesSet()");
    }

    // 5. 自定义初始化方法
    @InitMethod
    public void customInit() {
        System.out.println("5. 自定义初始化方法");
    }

    // 6. 销毁前
    @PreDestroy
    public void preDestroy() {
        System.out.println("6. @PreDestroy 销毁前");
    }

    // 7. DisposableBean 接口方法
    @Override
    public void destroy() throws Exception {
        System.out.println("7. destroy()");
    }
}
```

### 2.3 BeanPostProcessor 扩展点

```java
@Component
public class CustomBeanPostProcessor implements BeanPostProcessor {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) {
        // 初始化前处理，如解析注解
        if (bean instanceof LifeCycleBean) {
            System.out.println("BeanPostProcessor - 初始化前处理");
        }
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        // 初始化后处理，如 AOP 代理
        if (bean instanceof LifeCycleBean) {
            System.out.println("BeanPostProcessor - 初始化后处理");
        }
        return bean;
    }
}
```

**重要的 BeanPostProcessor：**

| 处理器 | 作用 |
|--------|------|
| `AutowiredAnnotationBeanPostProcessor` | 处理 @Autowired 注入 |
| `CommonAnnotationBeanPostProcessor` | 处理 @Resource、@PostConstruct 等 |
| `ApplicationContextAwareProcessor` | 注入 ApplicationContext |
| `AbstractAutoProxyCreator` | 创建 AOP 代理 |

---

## 三、AOP 实现原理

### 3.1 什么是 AOP

**AOP（Aspect-Oriented Programming，面向切面编程）** 将横切关注点（如日志、事务、权限）与业务逻辑分离。

```java
// 传统方式：日志与业务耦合
public void transfer() {
    System.out.println("开始事务");
    // 业务逻辑
    System.out.println("提交事务");
}

// AOP 方式：关注点分离
@Transactional
public void transfer() {
    // 纯业务逻辑
}
```

### 3.2 AOP 核心概念

| 概念 | 说明 | 示例 |
|------|------|------|
| **切面（Aspect）** | 横切关注点的模块化 | @Aspect 类 |
| **连接点（JoinPoint）** | 程序执行的特定点 | 方法调用、异常抛出 |
| **切点（Pointcut）** | 匹配连接点的表达式 | execution(* com.example.*.*(..)) |
| **通知（Advice）** | 切面在特定点执行的动作 | @Before、@After、@Around |
| **目标对象（Target）** | 被通知的对象 | 业务 Bean |
| **代理（Proxy）** | AOP 创建的代理对象 | JDK 动态代理 / CGLIB |

### 3.3 通知类型

```java
@Aspect
@Component
public class LoggingAspect {

    // 前置通知：方法执行前
    @Before("execution(* com.example.service.*.*(..))")
    public void before(JoinPoint joinPoint) {
        System.out.println("方法执行前: " + joinPoint.getSignature().getName());
    }

    // 后置通知：方法执行后（无论是否异常）
    @After("execution(* com.example.service.*.*(..))")
    public void after(JoinPoint joinPoint) {
        System.out.println("方法执行后");
    }

    // 返回通知：方法成功返回后
    @AfterReturning(pointcut = "execution(* com.example.service.*.*(..))", returning = "result")
    public void afterReturning(JoinPoint joinPoint, Object result) {
        System.out.println("方法返回值: " + result);
    }

    // 异常通知：方法抛出异常后
    @AfterThrowing(pointcut = "execution(* com.example.service.*.*(..))", throwing = "ex")
    public void afterThrowing(JoinPoint joinPoint, Exception ex) {
        System.out.println("方法抛出异常: " + ex.getMessage());
    }

    // 环绕通知：最强大的通知类型
    @Around("execution(* com.example.service.*.*(..))")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed(); // 执行目标方法
            return result;
        } finally {
            long end = System.currentTimeMillis();
            System.out.println("方法执行耗时: " + (end - start) + "ms");
        }
    }
}
```

### 3.4 切点表达式

```java
// 1. execution：匹配方法执行
execution(modifiers? return-type declaring-type? method-name(param-types) throws?)

// 示例
execution(public * com.example.service.*.*(..))    // service 包下所有公共方法
execution(* com.example..*.*(..))                   // com.example 及子包下所有方法
execution(* com.example.service.UserService.*(..))  // UserService 类的所有方法
execution(* com.example.service.*Service.*(..))     // 以 Service 结尾的类的所有方法
execution(* *(String, ..))                          // 第一个参数是 String 的方法

// 2. @annotation：匹配有特定注解的方法
@annotation(org.springframework.transaction.annotation.Transactional)

// 3. within：匹配特定类型
within(com.example.service.*)

// 4. @within：匹配有特定注解的类型
@within(org.springframework.stereotype.Service)

// 5. args：匹配参数类型
args(java.lang.String, ..)

// 6. 组合表达式
@Pointcut("execution(* com.example.service.*.*(..)) && args(id,..)")
public void serviceMethodWithId(Long id) {}
```

### 3.5 AOP 实现原理：动态代理

```
┌─────────────────────────────────────────────────────────────┐
│                     AOP 代理创建流程                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. AbstractAutoProxyCreator.postProcessAfterInitialization │
│     └─> Bean 初始化后，检查是否需要创建代理                    │
│                                                             │
│  2. 判断代理方式                                             │
│     ├─> 实现接口 -> JDK 动态代理                              │
│     └─> 未实现接口 -> CGLIB 代理                              │
│                                                             │
│  3. 创建代理对象                                             │
│     └─> 将通知织入代理对象                                    │
│                                                             │
│  4. 使用代理对象                                             │
│     └─> 方法调用时，先执行通知链                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**JDK 动态代理 vs CGLIB：**

| 特性 | JDK 动态代理 | CGLIB 代理 |
|------|-------------|------------|
| 原理 | 反射机制 | 字节码生成 |
| 要求 | 必须实现接口 | 可代理类 |
| 性能 | 调用稍慢 | 创建稍慢，调用快 |
| 限制 | 只能代理接口方法 | 不能代理 final 方法 |

**配置代理方式：**
```java
@Configuration
@EnableAspectJAutoProxy(proxyTargetClass = true) // 强制使用 CGLIB
public class AopConfig {}
```

---

## 四、Spring 事务管理

### 4.1 事务特性（ACID）

| 特性 | 说明 |
|------|------|
| **原子性（Atomicity）** | 事务是不可分割的操作单位 |
| **一致性（Consistency）** | 事务使数据库从一致状态转变为另一一致状态 |
| **隔离性（Isolation）** | 多个事务并发执行时互不干扰 |
| **持久性（Durability）** | 事务提交后，数据永久保存 |

### 4.2 事务隔离级别

```java
public enum Isolation {
    DEFAULT,                // 使用数据库默认隔离级别
    READ_UNCOMMITTED,       // 读未提交（脏读、不可重复读、幻读）
    READ_COMMITTED,         // 读已提交（不可重复读、幻读）
    REPEATABLE_READ,        // 可重复读（幻读）
    SERIALIZABLE            // 串行化
}
```

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|----------|------|------------|------|
| READ_UNCOMMITTED | ✗ | ✗ | ✗ |
| READ_COMMITTED | ✓ | ✗ | ✗ |
| REPEATABLE_READ | ✓ | ✓ | ✗ |
| SERIALIZABLE | ✓ | ✓ | ✓ |

### 4.3 事务传播行为

```java
public enum Propagation {
    REQUIRED,       // 有事务则加入，无则新建（默认）
    SUPPORTS,       // 有事务则加入，无则以非事务运行
    MANDATORY,      // 必须在事务中运行，否则抛异常
    REQUIRES_NEW,   // 新建事务，挂起当前事务
    NOT_SUPPORTED,  // 以非事务运行，挂起当前事务
    NEVER,          // 以非事务运行，有事务则抛异常
    NESTED          // 嵌套事务（保存点）
}
```

**传播行为示例：**

```java
@Service
public class OrderService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private InventoryService inventoryService;

    // REQUIRED: 默认行为，保证整个方法在同一事务中
    @Transactional
    public void createOrder(Order order) {
        orderMapper.insert(order);
        inventoryService.decreaseStock(order.getProductId(), order.getQuantity());
    }
}

@Service
public class InventoryService {

    // REQUIRES_NEW: 独立事务，失败不影响外部事务
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void decreaseStock(Long productId, int quantity) {
        // 即使外部事务回滚，这里的库存扣减也会独立提交
    }

    // NESTED: 嵌套事务，可独立回滚
    @Transactional(propagation = Propagation.NESTED)
    public void logOperation(Long orderId) {
        // 失败可独立回滚，不影响外部事务
    }
}
```

### 4.4 事务失效场景

```java
@Service
public class UserService {

    // 1. 方法非 public
    @Transactional
    private void method1() {} // 事务失效

    // 2. 同类方法调用（绕过代理）
    public void methodA() {
        this.methodB(); // 事务失效
    }
    @Transactional
    public void methodB() {}

    // 3. 异常被捕获
    @Transactional
    public void methodC() {
        try {
            // 业务代码
        } catch (Exception e) {
            // 异常被捕获，事务失效
        }
    }

    // 4. 异常类型不匹配
    @Transactional
    public void methodD() throws Exception {
        throw new Exception(); // 默认只回滚 RuntimeException
    }

    // 正确方式：指定回滚异常类型
    @Transactional(rollbackFor = Exception.class)
    public void methodE() throws Exception {
        throw new Exception(); // 正确回滚
    }
}
```

**事务失效解决方案：**

```java
// 1. 注入自身（解决同类调用）
@Service
public class UserService {

    @Autowired
    private UserService self; // 注入自身代理

    public void methodA() {
        self.methodB(); // 通过代理调用
    }

    @Transactional
    public void methodB() {}
}

// 2. AopContext 获取代理
public void methodA() {
    ((UserService) AopContext.currentProxy()).methodB();
}

// 3. 拆分到不同 Service
```

### 4.5 事务实现原理

```
┌─────────────────────────────────────────────────────────────┐
│                  Spring 事务实现原理                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. AOP 代理                                                │
│     └─> TransactionInterceptor 拦截 @Transactional 方法     │
│                                                             │
│  2. 事务开启                                                │
│     ├─> 获取 DataSource                                     │
│     ├─> 创建 Connection                                     │
│     ├─> 设置 autoCommit = false                            │
│     └─> 绑定 Connection 到 ThreadLocal                      │
│                                                             │
│  3. 执行目标方法                                            │
│     └─> 从 ThreadLocal 获取同一 Connection                   │
│                                                             │
│  4. 事务提交/回滚                                           │
│     ├─> 正常返回 -> commit                                  │
│     └─> 异常 -> rollback                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 五、Spring Boot 自动配置原理

### 5.1 @SpringBootApplication 注解

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// @SpringBootApplication 是组合注解
@SpringBootConfiguration  // 配置类
@EnableAutoConfiguration   // 启用自动配置
@ComponentScan             // 组件扫描
public @interface SpringBootApplication {}
```

### 5.2 @EnableAutoConfiguration 原理

```
┌─────────────────────────────────────────────────────────────┐
│                  自动配置加载流程                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. @EnableAutoConfiguration                                │
│     └─> @Import(AutoConfigurationImportSelector.class)      │
│                                                             │
│  2. AutoConfigurationImportSelector                         │
│     └─> 读取 META-INF/spring.factories                      │
│                                                             │
│  3. 加载自动配置类                                           │
│     └─> org.springframework.boot.autoconfigure.EnableAutoConfiguration │
│                                                             │
│  4. 条件过滤                                                │
│     ├─> @ConditionalOnClass                                │
│     ├─> @ConditionalOnBean                                  │
│     ├─> @ConditionalOnProperty                             │
│     └─> @ConditionalOnMissingBean                          │
│                                                             │
│  5. 注册生效的配置类                                         │
│     └─> 创建相应的 Bean                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 自动配置示例

```java
// DataSourceAutoConfiguration.java
@Configuration
@ConditionalOnClass(DataSource.class)
@EnableConfigurationProperties(DataSourceProperties.class)
public class DataSourceAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public DataSource dataSource(DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder().build();
    }
}

// application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/test
spring.datasource.username=root
spring.datasource.password=123456
```

### 5.4 条件注解

| 注解 | 作用 |
|------|------|
| `@ConditionalOnClass` | 类路径存在指定类时生效 |
| `@ConditionalOnMissingClass` | 类路径不存在指定类时生效 |
| `@ConditionalOnBean` | 容器中存在指定 Bean 时生效 |
| `@ConditionalOnMissingBean` | 容器中不存在指定 Bean 时生效 |
| `@ConditionalOnProperty` | 配置属性满足条件时生效 |
| `@ConditionalOnWebApplication` | Web 应用时生效 |
| `@ConditionalOnExpression` | SpEL 表达式为 true 时生效 |

---

## 六、循环依赖解决

### 6.1 什么是循环依赖

```java
@Service
public class ServiceA {
    @Autowired
    private ServiceB serviceB;
}

@Service
public class ServiceB {
    @Autowired
    private ServiceA serviceA;
}
```

### 6.2 三级缓存机制

```java
// DefaultSingletonBeanRegistry

/** 一级缓存：完整的 Bean */
private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);

/** 二级缓存：早期暴露的 Bean（已实例化，未初始化） */
private final Map<String, Object> earlySingletonObjects = new ConcurrentHashMap<>(16);

/** 三级缓存：Bean 工厂（用于生成早期 Bean） */
private final Map<String, ObjectFactory<?>> singletonFactories = new HashMap<>(16);
```

### 6.3 解决流程

```
┌─────────────────────────────────────────────────────────────┐
│                    循环依赖解决流程                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 创建 ServiceA                                           │
│     └─> 实例化 A，放入三级缓存                               │
│                                                             │
│  2. 注入 ServiceA 的依赖 ServiceB                           │
│     └─> 发现 B 不存在，开始创建 B                            │
│                                                             │
│  3. 创建 ServiceB                                            │
│     └─> 实例化 B                                            │
│                                                             │
│  4. 注入 ServiceB 的依赖 ServiceA                            │
│     └─> 从三级缓存获取 A 的工厂，生成早期引用                  │
│     └─> 将 A 升级到二级缓存                                  │
│                                                             │
│  5. B 初始化完成，放入一级缓存                                │
│                                                             │
│  6. A 注入 B 成功，初始化完成，放入一级缓存                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 无法解决的循环依赖

```java
// 1. 构造器注入（无法使用三级缓存）
@Service
public class ServiceA {
    public ServiceA(ServiceB serviceB) {} // 无法解决
}

// 2. 原型作用域（不使用缓存）
@Scope("prototype")
@Service
public class ServiceA {
    @Autowired
    private ServiceB serviceB; // 无法解决
}

// 解决方案：@Lazy
@Service
public class ServiceA {
    public ServiceA(@Lazy ServiceB serviceB) {
        this.serviceB = serviceB; // 延迟加载代理
    }
}
```

---

## 七、常见面试题

### 7.1 BeanFactory 和 ApplicationContext 的区别？

| 特性 | BeanFactory | ApplicationContext |
|------|-------------|---------------------|
| 初始化 | 延迟加载 | 容器启动时加载 |
| 功能 | 基础 IOC 功能 | 国际化、事件发布、资源加载 |
| 性能 | 占用内存少 | 启动稍慢 |
| 适用场景 | 资源受限环境 | 企业级应用 |

### 7.2 Spring Bean 的作用域？

| 作用域 | 说明 |
|--------|------|
| singleton | 单例（默认） |
| prototype | 每次获取创建新实例 |
| request | 每个 HTTP 请求一个实例 |
| session | 每个 HTTP Session 一个实例 |
| application | ServletContext 生命周期内单例 |

### 7.3 @Autowired 和 @Resource 的区别？

| 特性 | @Autowired | @Resource |
|------|------------|-----------|
| 来源 | Spring | JSR-250 |
| 注入方式 | 默认按类型 | 默认按名称 |
| 指定名称 | @Qualifier | name 属性 |
| 必需性 | required=false | 无 |

### 7.4 Spring 如何解决事务并发问题？

```java
// 乐观锁
@Version
private Integer version;

// 悲观锁
@Lock(LockModeType.PESSIMISTIC_WRITE)
private User user;

// 分布式锁
@Transactional
public void deductStock(Long productId) {
    String lockKey = "product:" + productId;
    try {
        if (redisLock.tryLock(lockKey, 30, TimeUnit.SECONDS)) {
            // 业务逻辑
        }
    } finally {
        redisLock.unlock(lockKey);
    }
}
```

---

## 八、总结

### 核心知识点

1. **IOC**：控制反转，依赖注入，解耦对象创建
2. **Bean 生命周期**：实例化 → 属性赋值 → 初始化 → 使用 → 销毁
3. **AOP**：面向切面编程，动态代理实现横切关注点分离
4. **事务管理**：声明式事务，隔离级别，传播行为，失效场景
5. **自动配置**：条件注解，spring.factories，按需加载
6. **循环依赖**：三级缓存，构造器注入无法解决

### 最佳实践

- 优先使用构造器注入
- 合理设置事务隔离级别和传播行为
- 避免循环依赖，使用 @Lazy 解耦
- 理解 AOP 原理，避免事务失效

---

**下一篇预告**：Spring Boot 自动配置深入与源码解析