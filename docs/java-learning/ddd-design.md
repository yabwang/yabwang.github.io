---
order: 9
---

# 领域驱动设计（DDD）核心思想

领域驱动设计（Domain-Driven Design，简称 DDD）是由 Eric Evans 在 2003 年提出的一种软件设计方法论。它强调将业务领域作为软件设计的核心，通过建立统一的领域模型来解决复杂业务系统的开发问题。

## 一、为什么需要 DDD

### 1.1 传统开发模式的问题

在传统的 CRUD 开发模式中，代码结构通常是**面向数据库**的：

```java
// ❌ 贫血模型 - 只有 getter/setter
public class Order {
    private Long id;
    private Long userId;
    private BigDecimal amount;
    private String status;
    private LocalDateTime createTime;

    // 只有 getter 和 setter
}

// 业务逻辑散落在 Service 层
@Service
public class OrderService {

    public void cancelOrder(Long orderId) {
        Order order = orderMapper.selectById(orderId);
        if ("PAID".equals(order.getStatus())) {
            order.setStatus("CANCELLED");
            orderMapper.updateById(order);

            // 发送通知
            notifyService.send(order.getUserId(), "订单已取消");

            // 扣减库存
            inventoryService.decreaseStock(orderId);

            // 退款处理
            refundService.process(orderId);
        }
    }
}
```

**问题**：
- 业务逻辑分散，难以维护
- 领域对象只是数据容器（贫血模型）
- 代码无法反映业务语义
- 随着业务发展，Service 层变得臃肿不堪

### 1.2 DDD 带来的改变

DDD 提倡**充血模型**，将业务逻辑封装在领域对象中：

```java
// ✅ 充血模型 - 领域对象包含业务行为
public class Order {
    private OrderId id;
    private UserId userId;
    private Money amount;
    private OrderStatus status;
    private List<OrderItem> items;

    // 领域行为 - 业务逻辑内聚
    public void cancel() {
        if (this.status != OrderStatus.PAID) {
            throw new DomainException("只有已支付的订单才能取消");
        }
        this.status = OrderStatus.CANCELLED;
        // 注册领域事件
        DomainEventPublisher.publish(new OrderCancelledEvent(this.id));
    }

    public void refund() {
        validateRefundable();
        this.status = OrderStatus.REFUNDED;
    }

    private void validateRefundable() {
        if (this.status != OrderStatus.CANCELLED) {
            throw new DomainException("只有取消的订单才能退款");
        }
    }
}

// Service 层变得简洁
@Service
public class OrderService {

    public void cancelOrder(OrderId orderId) {
        Order order = orderRepository.findById(orderId);
        order.cancel();  // 领域对象自己处理业务
        orderRepository.save(order);
    }
}
```

---

## 二、DDD 核心概念

### 2.1 统一语言（Ubiquitous Language）

统一语言是 DDD 的基石，指开发团队和业务人员使用**相同的术语**来描述业务。

| 角色 | 传统开发 | DDD 开发 |
|------|----------|----------|
| 产品经理 | "用户下单" | "创建订单聚合根" |
| 开发人员 | "insert into orders" | "Order.create()" |
| 测试人员 | "检查订单表" | "验证 Order 聚合状态" |

**实践建议**：
- 代码中的类名、方法名直接使用业务术语
- 避免使用 `Data`、`Info`、`Manager` 等模糊命名
- 在文档、对话、代码中保持一致

### 2.2 限界上下文（Bounded Context）

限界上下文定义了领域模型的**适用范围**，同一个概念在不同上下文中可能有不同含义。

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  销售上下文     │    │  物流上下文     │    │  财务上下文     │
│  ─────────────  │    │  ─────────────  │    │  ─────────────  │
│  Order          │    │  Delivery       │    │  Settlement     │
│  - id           │    │  - id           │    │  - id           │
│  - items        │    │  - address      │    │  - amount       │
│  - totalAmount  │    │  - status       │    │  - tax          │
│  - customerId   │    │  - orderId      │    │  - orderId      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        ↓                      ↓                      ↓
    关注销售              关注配送                关注结算
```

**示例**：同一个 "商品" 在不同上下文中的不同模型

```java
// 销售上下文 - 关注商品信息
public class Product {
    private ProductId id;
    private String name;
    private Money price;
    private String description;
}

// 库存上下文 - 关注库存数量
public class Inventory {
    private ProductId productId;
    private Integer quantity;
    private Integer reservedQuantity;
    private WarehouseId warehouseId;
}

// 物流上下文 - 关注配送信息
public class ShippingProduct {
    private ProductId productId;
    private Double weight;
    private Dimension dimension;
    private String hsCode; // 海关编码
}
```

### 2.3 实体（Entity）vs 值对象（Value Object）

**实体**：有唯一标识，关注生命周期

```java
public class Order {
    private OrderId id;  // 唯一标识
    private UserId userId;
    private OrderStatus status;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Order order = (Order) o;
        return Objects.equals(id, order.id);  // 通过 ID 判断相等
    }
}
```

**值对象**：无唯一标识，通过属性判断相等，不可变

```java
@Value  // Lombok 注解，创建不可变类
public class Money {
    private BigDecimal amount;
    private Currency currency;

    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new DomainException("货币类型不同");
        }
        return new Money(this.amount.add(other.amount), this.currency);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Money money = (Money) o;
        return amount.equals(money.amount) && currency.equals(money.currency);
    }
}

// 使用示例
Money price = new Money(new BigDecimal("100.00"), Currency.CNY);
Money total = price.add(new Money(new BigDecimal("50.00"), Currency.CNY));
// total 是新对象，price 不可变
```

### 2.4 聚合（Aggregate）与聚合根（Aggregate Root）

**聚合**：一组相关对象的集合，作为一个整体进行数据修改

**聚合根**：聚合的入口，外部只能通过聚合根访问内部对象

```java
// 订单聚合根
public class Order {
    private OrderId id;
    private UserId userId;
    private OrderStatus status;

    // 子实体 - 通过聚合根访问
    private List<OrderItem> items;

    // 值对象
    private ShippingAddress shippingAddress;

    // 外部只能调用聚合根的方法
    public void addItem(ProductId productId, int quantity, Money price) {
        validateState();
        items.add(new OrderItem(productId, quantity, price));
        recalculateTotal();
    }

    public void removeItem(OrderItemId itemId) {
        validateState();
        items.removeIf(item -> item.getId().equals(itemId));
        recalculateTotal();
    }

    private void validateState() {
        if (this.status != OrderStatus.DRAFT) {
            throw new DomainException("只有草稿订单才能修改");
        }
    }

    private void recalculateTotal() {
        // 重新计算总价
    }
}

// 外部代码 - 通过聚合根操作
order.addItem(productId, 2, price);  // ✅ 正确
order.getItems().add(...);           // ❌ 应该避免
```

### 2.5 领域事件（Domain Event）

领域事件表示领域中发生的重要事情，用于解耦聚合之间、上下文之间的通信。

```java
// 定义领域事件
public class OrderPaidEvent implements DomainEvent {
    private final OrderId orderId;
    private final UserId userId;
    private final Money amount;
    private final LocalDateTime occurredOn;

    public OrderPaidEvent(OrderId orderId, UserId userId, Money amount) {
        this.orderId = orderId;
        this.userId = userId;
        this.amount = amount;
        this.occurredOn = LocalDateTime.now();
    }

    // getter 方法
}

// 在聚合中发布事件
public class Order {

    public void pay(PaymentId paymentId) {
        validatePayment();
        this.status = OrderStatus.PAID;
        this.paymentId = paymentId;

        // 发布领域事件
        DomainEventPublisher.publish(new OrderPaidEvent(
            this.id,
            this.userId,
            this.amount
        ));
    }
}

// 事件处理器 - 解耦其他业务逻辑
@Component
public class OrderPaidEventHandler {

    @EventListener(OrderPaidEvent.class)
    @Async
    public void handle(OrderPaidEvent event) {
        // 发送通知
        notificationService.sendPaidNotification(event.getUserId());

        // 扣减库存
        inventoryService.decreaseStock(event.getOrderId());

        // 生成发票
        invoiceService.generate(event.getOrderId());
    }
}
```

---

## 三、DDD 分层架构

### 3.1 经典四层架构

```
┌─────────────────────────────────────────────┐
│            用户接口层（Interfaces）           │
│    Controller / DTO / View / REST API       │
├─────────────────────────────────────────────┤
│            应用层（Application）              │
│   应用服务 / 事务控制 / 领域事件发布          │
├─────────────────────────────────────────────┤
│             领域层（Domain）                  │
│   实体 / 值对象 / 聚合根 / 领域服务 / 事件    │
├─────────────────────────────────────────────┤
│          基础设施层（Infrastructure）          │
│   数据库 / 消息队列 / 缓存 / 外部服务         │
└─────────────────────────────────────────────┘
```

**依赖关系**：上层可以依赖下层，但下层不能依赖上层

### 3.2 各层职责详解

**1. 用户接口层（Interfaces Layer）**

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderApplicationService orderService;

    // POST /api/orders
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestBody CreateOrderRequest request) {

        CreateOrderCommand command = new CreateOrderCommand(
            request.getUserId(),
            request.getItems(),
            request.getShippingAddress()
        );

        OrderId orderId = orderService.createOrder(command);

        return ResponseEntity
            .created(URI.create("/orders/" + orderId.getValue()))
            .body(new OrderResponse(orderId));
    }
}
```

**2. 应用层（Application Layer）**

```java
@Service
@Transactional
public class OrderApplicationService {

    private final OrderRepository orderRepository;
    private final PaymentGateway paymentGateway;
    private final DomainEventPublisher eventPublisher;

    // 创建订单
    public OrderId createOrder(CreateOrderCommand command) {
        // 1. 调用领域对象创建聚合
        Order order = Order.create(
            command.getUserId(),
            command.getItems(),
            command.getShippingAddress()
        );

        // 2. 保存聚合
        orderRepository.save(order);

        // 3. 发布领域事件（如果有）
        order.getEvents().forEach(eventPublisher::publish);

        return order.getId();
    }

    // 支付订单
    public void payOrder(PayOrderCommand command) {
        // 1. 获取聚合
        Order order = orderRepository.findById(command.getOrderId());

        // 2. 调用领域行为
        order.pay(command.getPaymentId());

        // 3. 调用外部服务（防腐层）
        PaymentResult result = paymentGateway.charge(
            command.getPaymentId(),
            order.getAmount()
        );

        // 4. 保存
        orderRepository.save(order);
    }
}
```

**3. 领域层（Domain Layer）**

```java
// 聚合根
public class Order {
    private OrderId id;
    private UserId userId;
    private OrderStatus status;
    private Money totalAmount;
    private List<OrderItem> items;
    private List<DomainEvent> events = new ArrayList<>();

    // 工厂方法 - 创建聚合
    public static Order create(UserId userId,
                               List<OrderItemCommand> items,
                               ShippingAddress address) {
        Order order = new Order();
        order.id = OrderId.generate();
        order.userId = userId;
        order.status = OrderStatus.DRAFT;
        order.items = items.stream()
            .map(OrderItem::fromCommand)
            .collect(Collectors.toList());
        order.recalculateTotal();
        return order;
    }

    // 领域行为
    public void pay(PaymentId paymentId) {
        if (this.status != OrderStatus.CONFIRMED) {
            throw new DomainException("订单未确认，无法支付");
        }
        this.status = OrderStatus.PAID;
        this.paymentId = paymentId;
        this.paidAt = LocalDateTime.now();

        events.add(new OrderPaidEvent(this.id, this.userId, this.totalAmount));
    }

    // 获取并清除领域事件
    public List<DomainEvent> getEvents() {
        List<DomainEvent> result = new ArrayList<>(events);
        events.clear();
        return result;
    }
}

// 领域服务 - 处理跨聚合的业务逻辑
@Service
public class OrderDomainService {

    public void validateOrder(Order order, Customer customer) {
        if (customer.isBlacklisted()) {
            throw new DomainException("黑名单用户无法下单");
        }
        if (order.getTotalAmount().compareTo(customer.getCreditLimit()) > 0) {
            throw new DomainException("订单金额超出信用额度");
        }
    }
}

// 仓储接口 - 定义在领域层
public interface OrderRepository {
    Order findById(OrderId id);
    void save(Order order);
    void delete(OrderId id);
    List<Order> findByUserId(UserId userId);
}
```

**4. 基础设施层（Infrastructure Layer）**

```java
// 仓储实现
@Repository
public class OrderRepositoryImpl implements OrderRepository {

    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;

    @Override
    public Order findById(OrderId id) {
        OrderDO orderDO = orderMapper.selectById(id.getValue());
        if (orderDO == null) {
            throw new NotFoundException("订单不存在");
        }

        List<OrderItemDO> itemDOs = orderItemMapper.selectByOrderId(id.getValue());

        // DO 转 Domain
        return OrderConverter.toDomain(orderDO, itemDOs);
    }

    @Override
    public void save(Order order) {
        // Domain 转 DO
        OrderDO orderDO = OrderConverter.toDO(order);
        if (orderDO.getId() == null) {
            orderMapper.insert(orderDO);
        } else {
            orderMapper.update(orderDO);
        }

        // 保存订单项
        order.getItems().forEach(item -> {
            OrderItemDO itemDO = OrderItemConverter.toDO(item);
            itemDO.setOrderId(orderDO.getId());
            orderItemMapper.insert(itemDO);
        });
    }
}

// 防腐层 - 外部服务适配器
@Component
public class PaymentGatewayAdapter implements PaymentGateway {

    private final ThirdPartyPaymentClient client;

    @Override
    public PaymentResult charge(PaymentId paymentId, Money amount) {
        // 调用第三方支付 API
        PaymentRequest request = new PaymentRequest();
        request.setTxnId(paymentId.getValue());
        request.setAmount(amount.getAmount());

        PaymentResponse response = client.charge(request);

        return PaymentResult.fromResponse(response);
    }
}
```

---

## 四、DDD 实战：电商订单系统

### 4.1 项目结构

```
com.example.order/
├── application/                    # 应用层
│   ├── service/
│   │   ├── OrderApplicationService.java
│   │   └── PaymentApplicationService.java
│   ├── command/
│   │   ├── CreateOrderCommand.java
│   │   └── PayOrderCommand.java
│   └── dto/
│       ├── OrderResponse.java
│       └── OrderDTO.java
├── domain/                         # 领域层
│   ├── model/
│   │   ├── Order.java             # 聚合根
│   │   ├── OrderItem.java         # 实体
│   │   ├── OrderId.java           # 值对象
│   │   ├── Money.java             # 值对象
│   │   └── OrderStatus.java       # 枚举
│   ├── service/
│   │   └── OrderDomainService.java
│   ├── event/
│   │   ├── OrderCreatedEvent.java
│   │   └── OrderPaidEvent.java
│   └── repository/
│       └── OrderRepository.java
├── infrastructure/                 # 基础设施层
│   ├── persistence/
│   │   ├── OrderMapper.java
│   │   ├── OrderDO.java
│   │   └── OrderRepositoryImpl.java
│   ├── gateway/
│   │   ├── PaymentGateway.java
│   │   └── PaymentGatewayAdapter.java
│   └── event/
│       └── DomainEventPublisherImpl.java
└── interfaces/                     # 用户接口层
    ├── rest/
    │   └── OrderController.java
    └── facade/
        └── OrderFacade.java
```

### 4.2 核心代码实现

**领域对象**

```java
// 值对象 - 订单 ID
@Value
public class OrderId {
    private String value;

    public static OrderId generate() {
        return new OrderId("ORD-" + UUID.randomUUID().toString().replace("-", ""));
    }

    public static OrderId from(String value) {
        if (!value.startsWith("ORD-")) {
            throw new IllegalArgumentException("无效的订单 ID 格式");
        }
        return new OrderId(value);
    }
}

// 值对象 - 金额
@Value
public class Money implements Comparable<Money> {
    private BigDecimal amount;
    private Currency currency;

    public static final Currency DEFAULT_CURRENCY = Currency.CNY;

    public Money(BigDecimal amount) {
        this(amount, DEFAULT_CURRENCY);
    }

    public Money(BigDecimal amount, Currency currency) {
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("金额不能为负数");
        }
        this.amount = amount.setScale(2, RoundingMode.HALF_UP);
        this.currency = currency;
    }

    public Money add(Money other) {
        validateSameCurrency(other);
        return new Money(this.amount.add(other.amount), this.currency);
    }

    public Money subtract(Money other) {
        validateSameCurrency(other);
        return new Money(this.amount.subtract(other.amount), this.currency);
    }

    public Money multiply(int factor) {
        return new Money(this.amount.multiply(new BigDecimal(factor)), this.currency);
    }

    private void validateSameCurrency(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new DomainException("货币类型不同");
        }
    }

    @Override
    public int compareTo(Money other) {
        return this.amount.compareTo(other.amount);
    }
}

// 聚合根 - 订单
public class Order {
    private OrderId id;
    private UserId userId;
    private OrderStatus status;
    private Money totalAmount;
    private List<OrderItem> items;
    private ShippingAddress shippingAddress;
    private PaymentId paymentId;
    private LocalDateTime paidAt;
    private List<DomainEvent> events;

    // 工厂方法
    public static Order create(UserId userId,
                               List<OrderItemCommand> itemCommands,
                               ShippingAddress address) {
        Order order = new Order();
        order.id = OrderId.generate();
        order.userId = userId;
        order.status = OrderStatus.DRAFT;
        order.items = itemCommands.stream()
            .map(cmd -> new OrderItem(
                ItemId.generate(),
                cmd.getProductId(),
                cmd.getQuantity(),
                cmd.getPrice()
            ))
            .collect(Collectors.toList());
        order.shippingAddress = address;
        order.recalculateTotal();
        order.events = new ArrayList<>();
        order.events.add(new OrderCreatedEvent(order.id, order.userId));
        return order;
    }

    // 领域行为：确认订单
    public void confirm() {
        if (this.status != OrderStatus.DRAFT) {
            throw new DomainException("只有草稿订单才能确认");
        }
        if (this.items.isEmpty()) {
            throw new DomainException("订单不能为空");
        }
        this.status = OrderStatus.CONFIRMED;
    }

    // 领域行为：支付订单
    public void pay(PaymentId paymentId) {
        if (this.status != OrderStatus.CONFIRMED) {
            throw new DomainException("只有确认的订单才能支付");
        }
        this.status = OrderStatus.PAID;
        this.paymentId = paymentId;
        this.paidAt = LocalDateTime.now();
        this.events.add(new OrderPaidEvent(this.id, this.userId, this.totalAmount));
    }

    // 领域行为：取消订单
    public void cancel(String reason) {
        if (this.status == OrderStatus.PAID) {
            throw new DomainException("已支付订单不能取消，请申请退款");
        }
        if (this.status != OrderStatus.DRAFT && this.status != OrderStatus.CONFIRMED) {
            throw new DomainException("当前状态不能取消订单");
        }
        this.status = OrderStatus.CANCELLED;
        this.events.add(new OrderCancelledEvent(this.id, reason));
    }

    private void recalculateTotal() {
        Money total = new Money(BigDecimal.ZERO);
        for (OrderItem item : items) {
            total = total.add(item.getSubtotal());
        }
        this.totalAmount = total;
    }

    // getter 方法
    public OrderId getId() { return id; }
    public List<OrderItem> getItems() { return Collections.unmodifiableList(items); }
    public Money getTotalAmount() { return totalAmount; }
    public OrderStatus getStatus() { return status; }
    public List<DomainEvent> getEvents() {
        List<DomainEvent> result = new ArrayList<>(events);
        events.clear();
        return result;
    }
}

// 实体 - 订单项
public class OrderItem {
    private ItemId id;
    private ProductId productId;
    private int quantity;
    private Money price;

    public Money getSubtotal() {
        return price.multiply(quantity);
    }

    // getter/setter
}
```

**应用服务**

```java
@Service
@Transactional
public class OrderApplicationService {

    private final OrderRepository orderRepository;
    private final OrderDomainService orderDomainService;
    private final CustomerRepository customerRepository;
    private final InventoryService inventoryService;
    private final DomainEventPublisher eventPublisher;

    public OrderId createOrder(CreateOrderCommand command) {
        // 获取用户
        Customer customer = customerRepository.findById(command.getUserId());

        // 创建订单聚合
        Order order = Order.create(
            command.getUserId(),
            command.getItems(),
            command.getShippingAddress()
        );

        // 领域服务验证
        orderDomainService.validateOrder(order, customer);

        // 预占库存
        inventoryService.reserveStock(order.getId(), order.getItems());

        // 保存订单
        orderRepository.save(order);

        // 发布事件
        order.getEvents().forEach(eventPublisher::publish);

        return order.getId();
    }

    public void confirmOrder(OrderId orderId) {
        Order order = orderRepository.findById(orderId);
        order.confirm();

        // 确认库存
        inventoryService.confirmStock(orderId);

        orderRepository.save(order);
        order.getEvents().forEach(eventPublisher::publish);
    }

    public void payOrder(PayOrderCommand command) {
        Order order = orderRepository.findById(command.getOrderId());

        // 调用领域行为
        order.pay(command.getPaymentId());

        orderRepository.save(order);
        order.getEvents().forEach(eventPublisher::publish);
    }
}
```

---

## 五、DDD 最佳实践

### 5.1 设计原则

| 原则 | 说明 |
|------|------|
| **领域优先** | 先设计领域模型，再考虑技术实现 |
| **充血模型** | 业务逻辑应该内聚在领域对象中 |
| **聚合一致性** | 聚合内数据必须保持一致性边界 |
| **事件驱动** | 使用领域事件解耦聚合和上下文 |
| **依赖倒置** | 领域层定义接口，基础设施层实现 |

### 5.2 常见误区

| 误区 | 正确做法 |
|------|----------|
| 把 DDD 当作银弹 | DDD 适合复杂业务，简单 CRUD 不需要 |
| 过度设计 | 从简单开始，逐步演进 |
| 贫血模型 +Service 大爆炸 | 业务逻辑回归领域对象 |
| 把所有东西都放聚合根 | 区分实体、值对象、领域服务 |
| 混淆应用服务和领域服务 | 应用服务编排流程，领域服务处理跨聚合逻辑 |

### 5.3 何时使用 DDD

**适合 DDD 的场景**：
- ✅ 业务逻辑复杂，规则多变
- ✅ 需要长期维护的大型系统
- ✅ 多团队协作的大型项目
- ✅ 微服务架构的系统划分

**不适合 DDD 的场景**：
- ❌ 简单的 CRUD 应用
- ❌ 一次性项目或原型
- ❌ 业务逻辑极其简单
- ❌ 时间紧迫的短平快项目

---

## 六、总结

### 核心要点回顾

1. **统一语言**：开发、产品、业务使用相同术语
2. **限界上下文**：明确领域模型的边界
3. **聚合根**：数据修改的一致性边界
4. **充血模型**：业务逻辑内聚在领域对象中
5. **领域事件**：解耦业务逻辑的利器

### 学习资源

- 📚 《领域驱动设计》- Eric Evans（蓝皮书）
- 📚 《实现领域驱动设计》- Vaughn Vernon（红皮书）
- 📚 《领域驱动设计精粹》- Vaughn Vernon（绿皮书）

---

**上一章**：[常见场景设计 ←](/java-learning/system-design-scenarios)

**下一章**：[项目经验总结 →](/java-learning/project-experience)
