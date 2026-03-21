---
order: 10
---

# 七、系统设计原则

系统设计是高级工程师必备的能力。本章介绍系统设计的核心原则和常用设计模式。

## 7.1 SOLID 原则

SOLID 是面向对象设计的五大基本原则。

### 7.1.1 单一职责原则（SRP）

**定义**：一个类应该只有一个发生变化的原因。

```java
// ❌ 违反 SRP - 一个类承担多个职责
public class UserService {

    public User createUser(String username, String password) {
        // 业务逻辑
    }

    public void saveToDatabase(User user) {
        // 数据库操作
    }

    public void sendWelcomeEmail(User user) {
        // 邮件发送
    }

    public void validateUser(User user) {
        // 参数校验
    }
}

// ✅ 遵循 SRP - 职责分离
public class UserService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final UserValidator userValidator;

    public User createUser(String username, String password) {
        userValidator.validate(username, password);
        User user = new User(username, password);
        User saved = userRepository.save(user);
        emailService.sendWelcomeEmail(saved);
        return saved;
    }
}

// 数据访问层
public interface UserRepository {
    User save(User user);
    Optional<User> findById(Long id);
}

// 邮件服务
public interface EmailService {
    void sendWelcomeEmail(User user);
}

// 校验器
public class UserValidator {
    public void validate(String username, String password) {
        if (username == null || username.length() < 3) {
            throw new IllegalArgumentException("用户名至少 3 个字符");
        }
        if (password.length() < 8) {
            throw new IllegalArgumentException("密码至少 8 个字符");
        }
    }
}
```

### 7.1.2 开闭原则（OCP）

**定义**：软件实体应该对扩展开放，对修改关闭。

```java
// ❌ 违反 OCP - 添加新支付方式需要修改原有代码
public class PaymentService {

    public void pay(String type, double amount) {
        if ("alipay".equals(type)) {
            // 支付宝支付逻辑
        } else if ("wechat".equals(type)) {
            // 微信支付逻辑
        } else if ("card".equals(type)) {
            // 银行卡支付逻辑
        }
        // 新增支付方式需要修改这里
    }
}

// ✅ 遵循 OCP - 通过接口扩展
public interface PaymentStrategy {
    void pay(double amount);
}

public class AlipayStrategy implements PaymentStrategy {
    @Override
    public void pay(double amount) {
        // 支付宝支付逻辑
    }
}

public class WechatPayStrategy implements PaymentStrategy {
    @Override
    public void pay(double amount) {
        // 微信支付逻辑
    }
}

@Service
public class PaymentService {

    private final Map<String, PaymentStrategy> strategies;

    public PaymentService(List<PaymentStrategy> strategyList) {
        this.strategies = strategyList.stream()
            .collect(Collectors.toMap(
                s -> s.getClass().getSimpleName().replace("Strategy", "").toLowerCase(),
                s -> s
            ));
    }

    public void pay(String type, double amount) {
        PaymentStrategy strategy = strategies.get(type);
        if (strategy == null) {
            throw new IllegalArgumentException("不支持的支付方式：" + type);
        }
        strategy.pay(amount);
    }
}
```

### 7.1.3 里氏替换原则（LSP）

**定义**：子类应该能够替换掉它们的父类。

```java
// ❌ 违反 LSP - 子类破坏了父类的行为
public class Bird {
    public void fly() {
        System.out.println("Flying...");
    }
}

public class Ostrich extends Bird {
    @Override
    public void fly() {
        throw new UnsupportedOperationException("鸵鸟不会飞");
    }
}

// ✅ 遵循 LSP - 合理继承
public abstract class Bird {
    public abstract void move();
}

public class Sparrow extends Bird {
    @Override
    public void move() {
        System.out.println("麻雀在飞");
    }
}

public class Ostrich extends Bird {
    @Override
    public void move() {
        System.out.println("鸵鸟在跑");
    }
}
```

### 7.1.4 接口隔离原则（ISP）

**定义**：客户端不应该依赖它不需要的接口。

```java
// ❌ 违反 ISP - 臃肿的接口
public interface Worker {
    void work();
    void eat();
    void sleep();
}

public class Human implements Worker {
    public void work() { /* 工作 */ }
    public void eat() { /* 吃饭 */ }
    public void sleep() { /* 睡觉 */ }
}

public class Robot implements Worker {
    public void work() { /* 工作 */ }
    public void eat() {
        throw new UnsupportedOperationException("机器人不需要吃饭");
    }
    public void sleep() {
        throw new UnsupportedOperationException("机器人不需要睡觉");
    }
}

// ✅ 遵循 ISP - 接口拆分
public interface Workable {
    void work();
}

public interface Eatable {
    void eat();
}

public interface Sleepable {
    void sleep();
}

public class Human implements Workable, Eatable, Sleepable {
    public void work() { /* 工作 */ }
    public void eat() { /* 吃饭 */ }
    public void sleep() { /* 睡觉 */ }
}

public class Robot implements Workable {
    public void work() { /* 工作 */ }
}
```

### 7.1.5 依赖倒置原则（DIP）

**定义**：高层模块不应该依赖低层模块，两者都应该依赖其抽象。

```java
// ❌ 违反 DIP - 高层直接依赖低层
public class OrderService {

    private MySQLDatabase database;  // 直接依赖具体实现

    public OrderService() {
        this.database = new MySQLDatabase();
    }

    public void createOrder(Order order) {
        database.save(order);
    }
}

public class MySQLDatabase {
    public void save(Order order) {
        // MySQL 保存逻辑
    }
}

// ✅ 遵循 DIP - 依赖抽象
public interface OrderRepository {
    void save(Order order);
}

@Service
public class OrderService {

    private final OrderRepository repository;  // 依赖抽象

    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }

    public void createOrder(Order order) {
        repository.save(order);
    }
}

@Repository
public class MySQLOrderRepository implements OrderRepository {
    @Override
    public void save(Order order) {
        // MySQL 实现
    }
}

@Repository
public class MongoDBOrderRepository implements OrderRepository {
    @Override
    public void save(Order order) {
        // MongoDB 实现
    }
}
```

---

## 7.2 常用设计模式

### 7.2.1 创建型模式

#### 单例模式（Singleton）

```java
// 饿汉式（线程安全）
public class Singleton {
    private static final Singleton INSTANCE = new Singleton();

    private Singleton() {}

    public static Singleton getInstance() {
        return INSTANCE;
    }
}

// 懒汉式 - 双重检查锁（推荐）
public class LazySingleton {
    private static volatile LazySingleton instance;

    private LazySingleton() {}

    public static LazySingleton getInstance() {
        if (instance == null) {
            synchronized (LazySingleton.class) {
                if (instance == null) {
                    instance = new LazySingleton();
                }
            }
        }
        return instance;
    }
}

// 静态内部类（推荐）
public class StaticInnerSingleton {

    private StaticInnerSingleton() {}

    private static class Holder {
        private static final StaticInnerSingleton INSTANCE = new StaticInnerSingleton();
    }

    public static StaticInnerSingleton getInstance() {
        return Holder.INSTANCE;
    }
}

// 枚举实现（最有效）
public enum EnumSingleton {
    INSTANCE;

    public void doSomething() {
        // 业务方法
    }
}
```

#### 工厂模式（Factory）

```java
// 简单工厂
public class ShapeFactory {

    public static Shape createShape(String type) {
        return switch (type) {
            case "circle" -> new Circle();
            case "square" -> new Square();
            case "triangle" -> new Triangle();
            default -> throw new IllegalArgumentException("Unknown shape: " + type);
        };
    }
}

// 工厂方法
public interface ShapeFactory {
    Shape createShape();
}

public class CircleFactory implements ShapeFactory {
    @Override
    public Shape createShape() {
        return new Circle();
    }
}

// 抽象工厂
public interface GUIFactory {
    Button createButton();
    Checkbox createCheckbox();
}

public class WindowsFactory implements GUIFactory {
    @Override
    public Button createButton() {
        return new WindowsButton();
    }

    @Override
    public Checkbox createCheckbox() {
        return new WindowsCheckbox();
    }
}
```

#### 建造者模式（Builder）

```java
public class Computer {
    // 不可变字段
    private final String cpu;
    private final String ram;
    private final String storage;
    private final String gpu;

    // 私有构造，强制使用 Builder
    private Computer(Builder builder) {
        this.cpu = builder.cpu;
        this.ram = builder.ram;
        this.storage = builder.storage;
        this.gpu = builder.gpu;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String cpu;
        private String ram;
        private String storage;
        private String gpu;

        public Builder cpu(String cpu) {
            this.cpu = cpu;
            return this;
        }

        public Builder ram(String ram) {
            this.ram = ram;
            return this;
        }

        public Builder storage(String storage) {
            this.storage = storage;
            return this;
        }

        public Builder gpu(String gpu) {
            this.gpu = gpu;
            return this;
        }

        public Computer build() {
            return new Computer(this);
        }
    }

    // getters...
}

// 使用
Computer gamingPC = Computer.builder()
    .cpu("Intel i9")
    .ram("32GB")
    .storage("1TB SSD")
    .gpu("RTX 4090")
    .build();
```

### 7.2.2 结构型模式

#### 适配器模式（Adapter）

```java
// 现有类
public class PaymentGateway {
    public void processPayment(double amount) {
        System.out.println("Processing payment: " + amount);
    }
}

// 目标接口
public interface PaymentProcessor {
    void pay(double amount, String currency);
}

// 适配器
public class PaymentAdapter implements PaymentProcessor {

    private final PaymentGateway gateway;

    public PaymentAdapter(PaymentGateway gateway) {
        this.gateway = gateway;
    }

    @Override
    public void pay(double amount, String currency) {
        // 转换接口
        double convertedAmount = convertCurrency(amount, currency);
        gateway.processPayment(convertedAmount);
    }

    private double convertCurrency(double amount, String currency) {
        // 货币转换逻辑
        return amount;
    }
}
```

#### 装饰器模式（Decorator）

```java
public interface Coffee {
    String getDescription();
    double getCost();
}

public class SimpleCoffee implements Coffee {
    @Override
    public String getDescription() {
        return "Simple Coffee";
    }

    @Override
    public double getCost() {
        return 5.0;
    }
}

// 装饰器基类
public abstract class CoffeeDecorator implements Coffee {

    protected final Coffee decoratedCoffee;

    public CoffeeDecorator(Coffee coffee) {
        this.decoratedCoffee = coffee;
    }

    @Override
    public String getDescription() {
        return decoratedCoffee.getDescription();
    }

    @Override
    public double getCost() {
        return decoratedCoffee.getCost();
    }
}

public class MilkDecorator extends CoffeeDecorator {

    public MilkDecorator(Coffee coffee) {
        super(coffee);
    }

    @Override
    public String getDescription() {
        return super.getDescription() + " + Milk";
    }

    @Override
    public double getCost() {
        return super.getCost() + 2.0;
    }
}

public class SugarDecorator extends CoffeeDecorator {

    public SugarDecorator(Coffee coffee) {
        super(coffee);
    }

    @Override
    public String getDescription() {
        return super.getDescription() + " + Sugar";
    }

    @Override
    public double getCost() {
        return super.getCost() + 1.0;
    }
}

// 使用
Coffee coffee = new SugarDecorator(
    new MilkDecorator(
        new SimpleCoffee()
    )
);
System.out.println(coffee.getDescription()); // Simple Coffee + Milk + Sugar
System.out.println(coffee.getCost()); // 8.0
```

#### 代理模式（Proxy）

```java
public interface UserService {
    User getUser(Long id);
}

// 真实对象
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User getUser(Long id) {
        return userRepository.findById(id).orElse(null);
    }
}

// 代理 - 缓存代理
public class UserServiceCacheProxy implements UserService {

    private final UserService target;
    private final Map<Long, User> cache = new ConcurrentHashMap<>();

    public UserServiceCacheProxy(UserService target) {
        this.target = target;
    }

    @Override
    public User getUser(Long id) {
        // 缓存命中
        if (cache.containsKey(id)) {
            System.out.println("Cache hit for id: " + id);
            return cache.get(id);
        }

        // 缓存未命中，调用真实对象
        System.out.println("Cache miss, fetching from DB");
        User user = target.getUser(id);
        cache.put(id, user);
        return user;
    }
}
```

### 7.2.3 行为型模式

#### 观察者模式（Observer）

```java
// 被观察者
public class Stock {

    private final List<Observer> observers = new ArrayList<>();
    private double price;

    public void attach(Observer observer) {
        observers.add(observer);
    }

    public void detach(Observer observer) {
        observers.remove(observer);
    }

    public void setPrice(double price) {
        this.price = price;
        notifyObservers();
    }

    private void notifyObservers() {
        for (Observer observer : observers) {
            observer.update(price);
        }
    }
}

// 观察者接口
public interface Observer {
    void update(double price);
}

public class MobileApp implements Observer {
    @Override
    public void update(double price) {
        System.out.println("Mobile App: 股价更新为 " + price);
    }
}

public class WebApp implements Observer {
    @Override
    public void update(double price) {
        System.out.println("Web App: 股价更新为 " + price);
    }
}

// Spring 事件驱动（推荐）
@Component
public class OrderEventPublisher {

    @Autowired
    private ApplicationEventPublisher publisher;

    public void publishOrderCreated(Order order) {
        publisher.publishEvent(new OrderCreatedEvent(this, order));
    }
}

@Component
public class OrderEventListener {

    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        // 处理订单创建事件
        System.out.println("收到订单创建事件：" + event.getOrder().getId());
    }
}
```

#### 策略模式（Strategy）

```java
// 策略接口
public interface DiscountStrategy {
    double applyDiscount(double price);
}

// 具体策略
@Component
public class NoDiscountStrategy implements DiscountStrategy {
    @Override
    public double applyDiscount(double price) {
        return price;
    }
}

@Component
public class PercentageDiscountStrategy implements DiscountStrategy {
    @Override
    public double applyDiscount(double price) {
        return price * 0.9; // 9 折
    }
}

@Component
public class FixedDiscountStrategy implements DiscountStrategy {
    @Override
    public double applyDiscount(double price) {
        return price - 50; // 减 50 元
    }
}

// 上下文
@Service
public class DiscountService {

    private final Map<String, DiscountStrategy> strategies;

    public DiscountService(List<DiscountStrategy> strategyList) {
        this.strategies = new HashMap<>();
        for (DiscountStrategy strategy : strategyList) {
            String name = strategy.getClass().getSimpleName()
                .replace("DiscountStrategy", "").toLowerCase();
            strategies.put(name, strategy);
        }
    }

    public double calculatePrice(String strategyType, double price) {
        DiscountStrategy strategy = strategies.get(strategyType);
        if (strategy == null) {
            throw new IllegalArgumentException("未知的折扣类型：" + strategyType);
        }
        return strategy.applyDiscount(price);
    }
}
```

#### 模板方法模式（Template Method）

```java
// 抽象模板
public abstract class DataProcessor {

    // 模板方法（final 防止子类修改流程）
    public final void process(String data) {
        validate(data);
        Object parsed = parse(data);
        transform(parsed);
        save(parsed);
    }

    protected abstract void validate(String data);
    protected abstract Object parse(String data);
    protected abstract void transform(Object data);
    protected abstract void save(Object data);

    // 钩子方法
    protected boolean shouldLog() {
        return false;
    }
}

// 具体实现
public class CSVDataProcessor extends DataProcessor {

    @Override
    protected void validate(String data) {
        if (data == null || !data.contains(",")) {
            throw new IllegalArgumentException("Invalid CSV data");
        }
    }

    @Override
    protected Object parse(String data) {
        return data.split(",");
    }

    @Override
    protected void transform(Object data) {
        // 转换逻辑
    }

    @Override
    protected void save(Object data) {
        // 保存逻辑
    }

    @Override
    protected boolean shouldLog() {
        return true; // 启用日志
    }
}
```

---

## 7.3 高并发系统设计

### 7.3.1 缓存策略

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│     CDN     │────►│  Nginx 反向  │
│  静态资源   │     │    代理      │
└─────────────┘     └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌───────────┐ ┌───────────┐ ┌───────────┐
       │  Service  │ │  Service  │ │  Service  │
       └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                    ┌─────────────┐
                    │    Redis    │
                    │   缓存层    │
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │   MySQL     │
                    │   数据库    │
                    └─────────────┘
```

**多级缓存实现：**

```java
@Service
public class ProductCacheService {

    @Autowired
    private RedisTemplate<String, Product> redisTemplate;

    private final Cache<String, Product> localCache =
        Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .build();

    public Product getProduct(Long id) {
        String key = "product:" + id;

        // L1: 本地缓存
        Product product = localCache.getIfPresent(key);
        if (product != null) {
            return product;
        }

        // L2: Redis 缓存
        product = redisTemplate.opsForValue().get(key);
        if (product != null) {
            localCache.put(key, product);
            return product;
        }

        // L3: 数据库
        product = loadFromDatabase(id);
        if (product != null) {
            redisTemplate.opsForValue().set(key, product, 30, TimeUnit.MINUTES);
            localCache.put(key, product);
        }
        return product;
    }

    private Product loadFromDatabase(Long id) {
        // 数据库查询
        return null;
    }
}
```

### 7.3.2 限流策略

#### 令牌桶算法

```java
@Service
public class TokenBucketRateLimiter {

    private final long capacity;          // 桶容量
    private final long refillRate;        // 每秒补充令牌数
    private long tokens;                  // 当前令牌数
    private long lastRefillTime;

    private final Lock lock = new ReentrantLock();

    public TokenBucketRateLimiter(long capacity, long refillRate) {
        this.capacity = capacity;
        this.refillRate = refillRate;
        this.tokens = capacity;
        this.lastRefillTime = System.currentTimeMillis();
    }

    public boolean tryAcquire() {
        lock.lock();
        try {
            refill();
            if (tokens > 0) {
                tokens--;
                return true;
            }
            return false;
        } finally {
            lock.unlock();
        }
    }

    private void refill() {
        long now = System.currentTimeMillis();
        long timePassed = now - lastRefillTime;
        long newTokens = timePassed * refillRate / 1000;

        tokens = Math.min(capacity, tokens + newTokens);
        lastRefillTime = now;
    }
}

// Redis 分布式限流
@Service
public class RedisRateLimiter {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    private static final String SCRIPT = """
        local key = KEYS[1]
        local capacity = tonumber(ARGV[1])
        local refillRate = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])

        local lastRefill = tonumber(redis.call('hget', key, 'lastRefill') or now)
        local tokens = tonumber(redis.call('hget', key, 'tokens') or capacity)

        local timePassed = now - lastRefill
        local newTokens = math.floor(timePassed * refillRate / 1000)
        tokens = math.min(capacity, tokens + newTokens)

        if tokens > 0 then
            tokens = tokens - 1
            redis.call('hset', key, 'tokens', tokens)
            redis.call('hset', key, 'lastRefill', now)
            return 1
        end

        return 0
        """;

    public boolean tryAcquire(String key, long capacity, long refillRate) {
        RedisScript<Long> script = RedisScript.of(SCRIPT, Long.class);
        Long result = redisTemplate.execute(
            script,
            Collections.singletonList(key),
            String.valueOf(capacity),
            String.valueOf(refillRate),
            String.valueOf(System.currentTimeMillis())
        );
        return result != null && result == 1;
    }
}
```

#### 滑动窗口算法

```java
@Service
public class SlidingWindowRateLimiter {

    private final int windowSize;         // 窗口大小（毫秒）
    private final int maxRequests;        // 窗口内最大请求数
    private final Deque<Long> timestamps; // 时间戳队列

    public SlidingWindowRateLimiter(int windowSize, int maxRequests) {
        this.windowSize = windowSize;
        this.maxRequests = maxRequests;
        this.timestamps = new ArrayDeque<>();
    }

    public synchronized boolean tryAcquire() {
        long now = System.currentTimeMillis();
        long windowStart = now - windowSize;

        // 移除窗口外的请求
        while (!timestamps.isEmpty() && timestamps.peekFirst() < windowStart) {
            timestamps.pollFirst();
        }

        // 检查是否超过限制
        if (timestamps.size() < maxRequests) {
            timestamps.addLast(now);
            return true;
        }

        return false;
    }
}
```

---

## 7.4 高可用系统设计

### 7.4.1 冗余设计

```
┌─────────────────────────────────────────────────────┐
│                    负载均衡器                        │
│                  (Nginx / ELB)                       │
└─────────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
   ┌───────────┐  ┌───────────┐  ┌───────────┐
   │  App-1    │  │  App-2    │  │  App-3    │
   │  (Zone A) │  │  (Zone B) │  │  (Zone C) │
   └───────────┘  └───────────┘  └───────────┘
         │              │              │
         └──────────────┼──────────────┘
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
   ┌───────────┐                 ┌───────────┐
   │  Master   │◄────同步──────►│  Slave    │
   │  (Zone A) │                 │  (Zone B) │
   └───────────┘                 └───────────┘
```

### 7.4.2 熔断降级

```java
@Service
public class PaymentService {

    private final CircuitBreaker circuitBreaker;

    public PaymentService() {
        this.circuitBreaker = CircuitBreaker.builder()
            .failureThreshold(5)      // 失败阈值
            .failureRateThreshold(50) // 失败率阈值 50%
            .waitDurationInOpenState(Duration.ofSeconds(30)) // 熔断等待时间
            .slidingWindowSize(10)    // 滑动窗口大小
            .build();
    }

    public PaymentResult pay(PaymentRequest request) {
        Supplier<PaymentResult> supplier = () -> callPaymentGateway(request);

        return circuitBreaker.executeSupplier(supplier);
    }

    private PaymentResult callPaymentGateway(PaymentRequest request) {
        // 调用支付网关
        return null;
    }
}
```

### 7.4.3 降级策略

```java
@Service
public class ProductService {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private PriceService priceService;

    /**
     * 获取商品详情（带降级）
     */
    public ProductDetail getProductDetail(Long productId) {
        ProductDetail detail = new ProductDetail();
        detail.setId(productId);

        // 核心服务：库存
        try {
            detail.setInventory(inventoryService.getStock(productId));
        } catch (Exception e) {
            // 降级：返回默认值
            detail.setInventory(0);
            detail.setInventoryUnavailable(true);
        }

        // 非核心服务：价格
        try {
            detail.setPrice(priceService.getPrice(productId));
        } catch (Exception e) {
            // 降级：使用缓存价格
            detail.setPrice(getCachedPrice(productId));
        }

        return detail;
    }

    private Price getCachedPrice(Long productId) {
        // 从缓存获取
        return new Price(0, "CACHED");
    }
}
```

---

## 7.5 实践建议

### 设计原则总结

1. **优先使用组合而非继承**
2. **面向接口编程，而非实现**
3. **保持类的单一职责**
4. **使用依赖注入提高可测试性**

### 高并发设计要点

1. **缓存优先** - 尽可能使用缓存
2. **异步处理** - 使用消息队列解耦
3. **水平扩展** - 设计无状态服务
4. **限流降级** - 保护系统不被压垮

### 高可用设计要点

1. **消除单点** - 关键组件都要有备份
2. **快速失败** - 不要阻塞等待
3. **优雅降级** - 核心功能优先保障
4. **监控告警** - 及时发现问题

---

**上一章**：[消息队列 ←](/java-learning/message-queue)
**下一章**：[常见场景设计 →](/java-learning/system-design-scenarios)
