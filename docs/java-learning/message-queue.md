---
order: 9
---

# 六、消息队列

消息队列（Message Queue）是分布式系统中重要的中间件，用于解耦、异步、削峰。

## 6.19 Kafka 架构原理

### 核心概念

```
┌──────────────┐     生产      ┌──────────────┐
│  Producer    │ ────────────► │   Broker     │
│  生产者       │               │    brokers    │
└──────────────┘               └──────┬───────┘
                                      │
                                      │ Topic: order-events
                                      │ Partition: 3
                                      │
┌──────────────┐     消费      ───────┘
│  Consumer    │ ◄────────────
│  消费者       │  Consumer Group
└──────────────┘
```

### Kafka 核心组件

| 组件 | 说明 |
|------|------|
| **Broker** | Kafka 服务器节点 |
| **Topic** | 消息主题，消息的逻辑分类 |
| **Partition** | 分区，Topic 的物理分片 |
| **Replica** | 副本，用于高可用 |
| **Producer** | 消息生产者 |
| **Consumer** | 消息消费者 |
| **Consumer Group** | 消费者组，组内消费者负载均衡 |
| **ZooKeeper** | 元数据管理、控制器选举 |

### Topic 和 Partition

```
Topic: order-events
├── Partition 0 (Leader: Broker1, Replicas: [1,2,3])
│   ├── Offset: 0, 1, 2, 3...
│   └── Segment: 00000000.log, 00000100.log...
├── Partition 1 (Leader: Broker2, Replicas: [2,3,1])
└── Partition 2 (Leader: Broker3, Replicas: [3,1,2])
```

**Partition 特点：**
- 每个 Partition 是有序的（按 Offset）
- 一个 Partition 只能被一个消费者组内的一个消费者消费
- Partition 数量决定了消费者的最大并行度

### Producer 发送机制

```java
@Configuration
public class KafkaProducerConfig {

    @Bean
    public ProducerFactory<String, String> producerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "192.168.1.100:9092");
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        // acks 配置：0=不确认，1=Leader 确认，all=所有副本确认
        config.put(ProducerConfig.ACKS_CONFIG, "all");
        // 重试次数
        config.put(ProducerConfig.RETRIES_CONFIG, 3);
        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, String> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}

@Service
public class OrderProducer {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    /**
     * 发送订单创建事件
     */
    public void sendOrderCreated(Order order) {
        // 指定 Topic 和 Key（Key 用于分区）
        kafkaTemplate.send("order-events", order.getId().toString(), toJson(order));

        // 异步回调
        kafkaTemplate.send("order-events", order.getId().toString(), toJson(order))
            .whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("发送成功: offset={}, partition={}",
                        result.getRecordMetadata().offset(),
                        result.getRecordMetadata().partition());
                } else {
                    log.error("发送失败", ex);
                }
            });
    }

    private String toJson(Object obj) {
        try {
            return new ObjectMapper().writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```

### Consumer 消费机制

```java
@Configuration
public class KafkaConsumerConfig {

    @Bean
    public ConsumerFactory<String, String> consumerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "192.168.1.100:9092");
        config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        config.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        // 消费者组
        config.put(ConsumerConfig.GROUP_ID_CONFIG, "order-consumer-group");
        // 自动提交 offset
        config.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        // 每次拉取的最大消息数
        config.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 500);
        return new DefaultKafkaConsumerFactory<>(config);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, String> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, String> factory =
            new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        // 并发消费者数量（对应 Partition 数）
        factory.setConcurrency(3);
        return factory;
    }
}

@Service
public class OrderConsumer {

    /**
     * 监听订单创建事件
     */
    @KafkaListener(
        topics = "order-events",
        groupId = "order-consumer-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void listenOrderCreated(ConsumerRecord<String, String> record, Acknowledgment ack) {
        try {
            log.info("收到消息：key={}, value={}, partition={}, offset={}",
                record.key(), record.value(), record.partition(), record.offset());

            // 处理业务逻辑
            Order order = parseOrder(record.value());
            processOrder(order);

            // 手动提交 offset
            ack.acknowledge();
        } catch (Exception e) {
            log.error("处理消息失败", e);
            // 可以选择重试或发送到死信队列
            throw e;
        }
    }
}
```

---

## 6.20 RabbitMQ 工作模式

### 核心架构

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│ Producer │ ──► │   Exchange   │ ──► │  Queue   │
└──────────┘     │   交换机      │     │   队列    │
                 └──────────────┘     └────┬─────┘
                                          │
                                          ▼
                                     ┌──────────┐
                                     │ Consumer │
                                     └──────────┘
```

### 交换机类型

| 类型 | 路由规则 | 场景 |
|------|----------|------|
| **Direct** | 精确匹配 RoutingKey | 点对点 |
| **Fanout** | 广播到所有绑定队列 | 广播通知 |
| **Topic** | 通配符匹配 (#, *) | 分类订阅 |
| **Headers** | 匹配消息头 | 特殊场景 |

### Spring Boot 配置示例

```java
@Configuration
public class RabbitMQConfig {

    // 订单交换机
    @Bean
    public DirectExchange orderExchange() {
        return new DirectExchange("order.exchange");
    }

    // 订单创建队列
    @Bean
    public Queue orderCreatedQueue() {
        return QueueBuilder.durable("order.created.queue").build();
    }

    // 订单支付队列
    @Bean
    public Queue orderPaidQueue() {
        return QueueBuilder.durable("order.paid.queue").build();
    }

    // 绑定队列到交换机
    @Bean
    public Binding orderCreatedBinding(Queue orderCreatedQueue, DirectExchange orderExchange) {
        return BindingBuilder.bind(orderCreatedQueue)
            .to(orderExchange)
            .with("order.created");
    }

    @Bean
    public Binding orderPaidBinding(Queue orderPaidQueue, DirectExchange orderExchange) {
        return BindingBuilder.bind(orderPaidQueue)
            .to(orderExchange)
            .with("order.paid");
    }
}
```

### 生产者发送

```java
@Service
public class OrderMessageService {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    /**
     * 发送订单创建消息
     */
    public void sendOrderCreated(Order order) {
        rabbitTemplate.convertAndSend(
            "order.exchange",
            "order.created",
            order,
            message -> {
                message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                return message;
            }
        );
    }

    /**
     * 发送订单创建消息（带回调）
     */
    public void sendOrderCreatedWithConfirm(Order order) {
        CorrelationData correlationData = new CorrelationData(UUID.randomUUID().toString());

        rabbitTemplate.convertAndSend(
            "order.exchange",
            "order.created",
            order,
            correlationData
        );

        // 监听确认结果
        correlationData.getFuture().whenComplete((result, ex) -> {
            if (ex == null && result.isAck()) {
                log.info("消息确认成功：{}", correlationData.getId());
            } else {
                log.error("消息确认失败", ex);
            }
        });
    }
}
```

### 消费者监听

```java
@Service
public class OrderMessageListener {

    /**
     * 监听订单创建消息
     */
    @RabbitListener(queues = "order.created.queue")
    @RabbitHandler
    public void handleOrderCreated(Order order, Channel channel, Message message) throws Exception {
        try {
            log.info("收到订单创建消息：{}", order.getId());
            processOrder(order);
            // 手动 ACK
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        } catch (Exception e) {
            log.error("处理订单失败", e);
            // 拒绝消息，不重新入队（发送到死信队列）
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, false);
        }
    }

    private void processOrder(Order order) {
        // 业务处理
    }
}
```

---

## 6.21 消息可靠性保证

### 可靠性保证的四个层面

```
1. 生产者 → Broker：消息不丢失
   ├── 确认机制（Publisher Confirm）
   ├── 失败重试
   └── 本地消息表

2. Broker 存储：消息不丢失
   ├── 持久化（Exchange、Queue、Message）
   └── 多副本同步

3. Broker → 消费者：消息不丢失
   ├── 手动 ACK
   └── 消费失败重试

4. 消息不重复
   ├── 幂等性设计
   └── 唯一键去重
```

### Kafka 可靠性配置

**生产者配置：**
```yaml
spring:
  kafka:
    producer:
      acks: all                    # 所有副本确认
      retries: 3                   # 失败重试次数
      batch-size: 16384            # 批量大小
      buffer-memory: 33554432      # 缓冲区大小
      properties:
        enable.idempotence: true   # 开启幂等性
        min.insync.replicas: 2     # 最小同步副本数
```

**消费者配置：**
```yaml
spring:
  kafka:
    consumer:
      enable-auto-commit: false    # 关闭自动提交
      auto-offset-reset: earliest  # 从头消费
      isolation-level: read_committed  # 只读已提交消息
```

### RabbitMQ 可靠性配置

**持久化配置：**
```java
@Bean
public Queue durableQueue() {
    return QueueBuilder.durable("queue.name")  // 持久化队列
        .build();
}

@Bean
public DirectExchange durableExchange() {
    return (DirectExchange) ExchangeBuilder
        .directExchange("exchange.name")
        .durable(true)  // 持久化交换机
        .build();
}
```

**手动 ACK + 重试：**
```java
@RabbitListener(queues = "order.created.queue")
@RabbitHandler
public void handleMessage(Message message, Channel channel) throws Exception {
    long deliveryTag = message.getMessageProperties().getDeliveryTag();
    try {
        // 处理消息
        processMessage(message);
        // 手动确认
        channel.basicAck(deliveryTag, false);
    } catch (Exception e) {
        log.error("消息处理失败", e);
        // 重试次数达到上限，发送到死信队列
        if (isMaxRetry(message)) {
            channel.basicNack(deliveryTag, false, false);
        } else {
            // 重新入队重试
            channel.basicNack(deliveryTag, false, true);
        }
    }
}
```

### 死信队列（DLQ）

```java
@Configuration
public class DeadLetterQueueConfig {

    // 死信队列
    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable("dlq.order").build();
    }

    // 死信交换机
    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange("dlx.order");
    }

    @Bean
    public Binding deadLetterBinding() {
        return BindingBuilder.bind(deadLetterQueue())
            .to(deadLetterExchange)
            .with("dead.letter");
    }

    // 主队列（配置死信）
    @Bean
    public Queue mainQueue() {
        return QueueBuilder.durable("order.created.queue")
            .withArgument("x-dead-letter-exchange", "dlx.order")
            .withArgument("x-dead-letter-routing-key", "dead.letter")
            .withArgument("x-message-ttl", 60000)  // 60 秒过期
            .build();
    }
}
```

---

## 6.22 消息顺序性保证

### 顺序性场景

| 场景 | 顺序要求 |
|------|----------|
| 订单创建 → 支付 → 发货 | 必须有序 |
| Binlog 同步 | 必须有序 |
| 日志收集 | 可无序 |

### Kafka 保证顺序性

**原理：**
- 同一个 Key 的消息总是发送到同一个 Partition
- 同一个 Partition 的消息是有序的
- 单个消费者单线程消费保证顺序

```java
@Service
public class OrderedMessageSender {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    /**
     * 发送有序消息
     * Key 相同保证进入同一 Partition
     */
    public void sendOrderedMessages(String orderId, List<OrderEvent> events) {
        for (OrderEvent event : events) {
            kafkaTemplate.send(
                "order-events",
                orderId,  // 相同的 Key
                toJson(event)
            );
        }
    }
}

@Service
public class OrderedMessageConsumer {

    /**
     * 单线程顺序消费
     */
    @KafkaListener(topics = "order-events", groupId = "order-group")
    public void listen(ConsumerRecord<String, String> record) {
        // 单线程处理，自然有序
        processMessage(record.value());
    }
}
```

### RabbitMQ 保证顺序性

```java
/**
 * 保证同一订单的消息顺序
 * 方式：同一订单发送到同一队列，单消费者处理
 */
@Service
public class OrderedRabbitMQSender {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendOrderedMessages(String orderId, List<OrderEvent> events) {
        for (OrderEvent event : events) {
            // 使用相同的 RoutingKey
            rabbitTemplate.convertAndSend(
                "order.exchange",
                "order." + orderId,  // 相同订单相同路由键
                event
            );
        }
    }
}
```

### 顺序消费的注意事项

1. **Partition/队列数量 ≤ 消费者数量**
   - 避免同一 Partition 被多个消费者并发消费

2. **避免重试乱序**
   - 失败消息不立即重试，发送到延迟队列

3. **业务层保证**
   - 消息带版本号/时间戳
   - 消费时判断顺序

---

## 6.23 消息堆积处理

### 堆积原因

| 原因 | 解决方案 |
|------|----------|
| 消费能力不足 | 增加消费者数量 |
| 消费逻辑慢 | 优化消费逻辑，批量处理 |
| 异常导致停滞 | 完善异常处理，死信队列 |

### 紧急处理方案

```
1. 临时扩容
   - 增加新的 Topic/Queue，Partition/队列数 × N
   - 部署 N 倍消费者临时处理

2. 丢弃非重要消息
   - 日志类等非核心消息可直接丢弃

3. 降级非核心业务
   - 暂停非核心业务的消费者，优先处理核心业务
```

---

## 6.24 Kafka vs RabbitMQ 对比

| 对比项 | Kafka | RabbitMQ |
|--------|-------|----------|
| **定位** | 日志流处理 | 企业消息总线 |
| **吞吐量** | 百万级 TPS | 万级 TPS |
| **延迟** | 毫秒级 | 微秒级 |
| **可靠性** | 高（多副本） | 高（ACK 机制） |
| **消息顺序** | Partition 有序 | 队列有序 |
| **消息追溯** | 支持（持久化） | 不支持 |
| **适用场景** | 日志收集、大数据 | 业务消息、RPC |

---

## 6.25 实践建议

### 选型建议

| 场景 | 推荐方案 |
|------|----------|
| 日志收集、流处理 | Kafka |
| 订单、支付等业务消息 | RabbitMQ |
| 大数据实时计算 | Kafka |
| 异步任务、延时消息 | RabbitMQ |

### 最佳实践

1. **消息格式设计**
   - 使用统一的 JSON/Protobuf 格式
   - 包含版本号、时间戳、消息 ID

2. **幂等性设计**
   - 消费者必须支持幂等
   - 使用唯一键去重

3. **监控告警**
   - 监控消息堆积量
   - 监控消费延迟
   - 监控死信队列

4. **Trace 追踪**
   - 消息携带 TraceId
   - 全链路追踪

---

**上一章**：[分布式锁 ←](/java-learning/distributed-lock)
**下一章**：[系统设计原则 →](/java-learning/system-design-principles)
