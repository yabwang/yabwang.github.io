---
order: 12
---

# 其他框架技术

> Redis 客户端、消息队列与定时任务框架的原理与实践

## 一、Redis 客户端

### 1.1 Jedis

**Jedis** 是 Redis 的 Java 客户端之一，API 简单直观，但非线程安全。

#### 基本使用

```java
// 创建连接
Jedis jedis = new Jedis("localhost", 6379);
jedis.auth("password");

// 字符串操作
jedis.set("key", "value");
String value = jedis.get("key");

// 哈希操作
jedis.hset("user:1", "name", "张三");
jedis.hset("user:1", "age", "25");
Map<String, String> user = jedis.hgetAll("user:1");

// 列表操作
jedis.lpush("list", "a", "b", "c");
List<String> list = jedis.lrange("list", 0, -1);

// 集合操作
jedis.sadd("set", "a", "b", "c");
Set<String> members = jedis.smembers("set");

// 有序集合
jedis.zadd("zset", 1, "a");
jedis.zadd("zset", 2, "b");

// 关闭连接
jedis.close();
```

#### 连接池配置

```java
JedisPoolConfig config = new JedisPoolConfig();
config.setMaxTotal(100);        // 最大连接数
config.setMaxIdle(50);          // 最大空闲连接
config.setMinIdle(10);          // 最小空闲连接
config.setMaxWaitMillis(3000);  // 获取连接最大等待时间
config.setTestOnBorrow(true);    // 获取连接时测试

JedisPool pool = new JedisPool(config, "localhost", 6379);

try (Jedis jedis = pool.getResource()) {
    jedis.set("key", "value");
}
```

#### Jedis 的缺点

- **非线程安全**：每个线程需要独立的 Jedis 实例
- **阻塞式 I/O**：基于阻塞 I/O，高并发下性能受限
- **连接管理**：需要手动管理连接池

### 1.2 Lettuce

**Lettuce** 是 Spring Boot 2.x 默认的 Redis 客户端，基于 Netty 实现，支持异步和非阻塞 I/O。

#### 基本使用

```java
// 创建客户端
RedisClient client = RedisClient.create("redis://localhost:6379");
StatefulRedisConnection<String, String> connection = client.connect();

// 同步命令
RedisCommands<String, String> commands = connection.sync();
commands.set("key", "value");
String value = commands.get("key");

// 异步命令
RedisAsyncCommands<String, String> asyncCommands = connection.async();
RedisFuture<String> future = asyncCommands.get("key");
future.thenAccept(val -> System.out.println("Value: " + val));

// 响应式命令（需引入 reactor-core）
RedisReactiveCommands<String, String> reactiveCommands = connection.reactive();
reactiveCommands.get("key")
    .subscribe(val -> System.out.println("Value: " + val));

// 关闭连接
connection.close();
client.shutdown();
```

#### Spring Boot 集成

```yaml
# application.yml
spring:
  redis:
    host: localhost
    port: 6379
    password: password
    lettuce:
      pool:
        max-active: 100
        max-idle: 50
        min-idle: 10
```

```java
@Service
public class RedisService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    public void set(String key, String value) {
        stringRedisTemplate.opsForValue().set(key, value);
    }

    public String get(String key) {
        return stringRedisTemplate.opsForValue().get(key);
    }

    public void setWithExpire(String key, String value, long timeout, TimeUnit unit) {
        stringRedisTemplate.opsForValue().set(key, value, timeout, unit);
    }

    public Boolean setIfAbsent(String key, String value, long timeout, TimeUnit unit) {
        return stringRedisTemplate.opsForValue().setIfAbsent(key, value, timeout, unit);
    }
}
```

### 1.3 Jedis vs Lettuce 对比

| 特性 | Jedis | Lettuce |
|------|-------|---------|
| 连接方式 | 阻塞 I/O | 非阻塞 I/O (Netty) |
| 线程安全 | ❌ 非线程安全 | ✅ 线程安全 |
| 异步支持 | ❌ 不支持 | ✅ 支持 |
| 响应式 | ❌ 不支持 | ✅ 支持 (Reactor) |
| 连接管理 | 需要连接池 | 单连接多线程共享 |
| 性能 | 中等 | 高 |
| Spring Boot 默认 | 1.x | 2.x+ |

### 1.4 Redis 分布式锁实现

```java
@Service
public class DistributedLockService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    /**
     * 加锁 - 使用 SET NX EX 原子命令
     */
    public boolean tryLock(String key, String value, long expireTime, TimeUnit unit) {
        return Boolean.TRUE.equals(
            redisTemplate.opsForValue()
                .setIfAbsent(key, value, expireTime, unit)
        );
    }

    /**
     * 解锁 - Lua 脚本保证原子性
     */
    public boolean unlock(String key, String value) {
        String script =
            "if redis.call('get', KEYS[1]) == ARGV[1] then " +
            "   return redis.call('del', KEYS[1]) " +
            "else " +
            "   return 0 " +
            "end";

        RedisScript<Long> redisScript = RedisScript.of(script, Long.class);
        Long result = redisTemplate.execute(redisScript, Collections.singletonList(key), value);
        return Long.valueOf(1).equals(result);
    }

    /**
     * 带重试的加锁
     */
    public boolean tryLockWithRetry(String key, String value, long expireTime,
                                     TimeUnit unit, int retryTimes, long sleepMillis) {
        for (int i = 0; i < retryTimes; i++) {
            if (tryLock(key, value, expireTime, unit)) {
                return true;
            }
            try {
                Thread.sleep(sleepMillis);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return false;
            }
        }
        return false;
    }
}
```

---

## 二、消息队列

### 2.1 RabbitMQ

**RabbitMQ** 是基于 AMQP 协议的消息队列，支持多种消息模式。

#### 核心概念

```
┌─────────┐    ┌─────────────┐    ┌───────────┐    ┌─────────────┐    ┌─────────┐
│Producer │───▶│   Exchange  │───▶│  Queue    │───▶│  Consumer   │◀───│Producer │
└─────────┘    └─────────────┘    └───────────┘    └─────────────┘    └─────────┘
                    │
                    ├── direct   (直连，按路由键匹配)
                    ├── topic    (主题，支持通配符)
                    ├── fanout   (广播，发送到所有队列)
                    └── headers  (头部匹配)
```

#### Spring Boot 集成

```yaml
# application.yml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
    virtual-host: /
    listener:
      simple:
        acknowledge-mode: manual  # 手动确认
        prefetch: 1               # 每次只取一条消息
```

#### 生产者配置

```java
@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "order.exchange";
    public static final String QUEUE = "order.queue";
    public static final String ROUTING_KEY = "order.create";

    @Bean
    public DirectExchange orderExchange() {
        return new DirectExchange(EXCHANGE);
    }

    @Bean
    public Queue orderQueue() {
        return QueueBuilder.durable(QUEUE)
                .deadLetterExchange("dlx.exchange")  // 死信交换机
                .deadLetterRoutingKey("dlx.order")
                .ttl(30000)  // 消息过期时间
                .build();
    }

    @Bean
    public Binding orderBinding() {
        return BindingBuilder.bind(orderQueue())
                .to(orderExchange())
                .with(ROUTING_KEY);
    }
}
```

#### 生产者代码

```java
@Service
public class OrderProducer {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendOrder(Order order) {
        // 发送消息
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.EXCHANGE,
            RabbitMQConfig.ROUTING_KEY,
            order,
            message -> {
                message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
                return message;
            }
        );
    }

    /**
     * 延迟消息（需要安装 delayed-message 插件）
     */
    public void sendDelayedOrder(Order order, long delayMillis) {
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.EXCHANGE,
            RabbitMQConfig.ROUTING_KEY,
            order,
            message -> {
                message.getMessageProperties().setDelayLong(delayMillis);
                return message;
            }
        );
    }
}
```

#### 消费者代码

```java
@Component
@Slf4j
public class OrderConsumer {

    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    public void handleOrder(Message message, Channel channel) throws IOException {
        long deliveryTag = message.getMessageProperties().getDeliveryTag();
        try {
            Order order = JSON.parseObject(message.getBody(), Order.class);
            log.info("收到订单消息: {}", order);

            // 处理业务逻辑
            processOrder(order);

            // 手动确认
            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {
            log.error("处理消息失败", e);
            // 拒绝消息，重新入队
            channel.basicNack(deliveryTag, false, true);
        }
    }

    private void processOrder(Order order) {
        // 业务处理逻辑
    }
}
```

### 2.2 Kafka

**Kafka** 是分布式流处理平台，适合大数据场景，具有高吞吐量。

#### 核心概念

```
┌─────────────────────────────────────────────────────────────┐
│                        Kafka Cluster                        │
├─────────────────────────────────────────────────────────────┤
│  Topic: orders                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Partition 0  │ Partition 1  │ Partition 2  │ ...   │   │
│  │ [0,3,6...]   │ [1,4,7...]   │ [2,5,8...]   │       │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Broker 1 (Leader: P0, P2)  │  Broker 2 (Leader: P1)       │
└─────────────────────────────────────────────────────────────┘
```

| 概念 | 说明 |
|------|------|
| **Broker** | Kafka 服务器节点 |
| **Topic** | 消息主题，逻辑分类 |
| **Partition** | 分区，实现并行处理 |
| **Consumer Group** | 消费者组，组内消费者分担消费 |
| **Offset** | 消息偏移量，记录消费位置 |

#### Spring Boot 集成

```yaml
# application.yml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.apache.kafka.common.serialization.StringSerializer
      acks: all                    # 确认机制
      retries: 3                   # 重试次数
    consumer:
      group-id: order-group
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      auto-offset-reset: earliest  # 从最早开始消费
      enable-auto-commit: false    # 手动提交
```

#### 生产者代码

```java
@Service
@Slf4j
public class OrderKafkaProducer {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    private static final String TOPIC = "orders";

    /**
     * 同步发送
     */
    public void sendSync(Order order) throws Exception {
        SendResult<String, String> result = kafkaTemplate.send(
            TOPIC,
            order.getId(),
            JSON.toJSONString(order)
        ).get();  // 阻塞等待结果

        RecordMetadata metadata = result.getRecordMetadata();
        log.info("消息发送成功: partition={}, offset={}",
                 metadata.partition(), metadata.offset());
    }

    /**
     * 异步发送（推荐）
     */
    public void sendAsync(Order order) {
        CompletableFuture<SendResult<String, String>> future = kafkaTemplate.send(
            TOPIC,
            order.getId(),
            JSON.toJSONString(order)
        );

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                RecordMetadata metadata = result.getRecordMetadata();
                log.info("消息发送成功: partition={}, offset={}",
                         metadata.partition(), metadata.offset());
            } else {
                log.error("消息发送失败", ex);
            }
        });
    }

    /**
     * 发送到指定分区
     */
    public void sendToPartition(Order order, int partition) {
        kafkaTemplate.send(
            TOPIC,
            partition,
            order.getId(),
            JSON.toJSONString(order)
        );
    }
}
```

#### 消费者代码

```java
@Component
@Slf4j
public class OrderKafkaConsumer {

    @KafkaListener(topics = "orders", groupId = "order-group")
    public void consume(ConsumerRecord<String, String> record, Acknowledgment ack) {
        try {
            String key = record.key();
            String value = record.value();
            long offset = record.offset();
            int partition = record.partition();

            log.info("收到消息: partition={}, offset={}, key={}, value={}",
                     partition, offset, key, value);

            Order order = JSON.parseObject(value, Order.class);
            processOrder(order);

            // 手动提交 offset
            ack.acknowledge();
        } catch (Exception e) {
            log.error("处理消息失败", e);
            // 可以选择不确认，让消息重新消费
        }
    }

    private void processOrder(Order order) {
        // 业务处理逻辑
    }
}
```

### 2.3 RabbitMQ vs Kafka 对比

| 特性 | RabbitMQ | Kafka |
|------|----------|-------|
| 定位 | 消息队列 | 分布式流平台 |
| 吞吐量 | 万级/秒 | 十万级/秒 |
| 延迟 | 微秒级 | 毫秒级 |
| 消息持久化 | 支持 | 支持（默认持久化） |
| 消息顺序 | 单队列有序 | 分区内有序 |
| 消息回溯 | ❌ 不支持 | ✅ 支持 |
| 消费模式 | Push 模式 | Pull 模式 |
| 适用场景 | 业务系统 | 大数据、日志收集 |

---

## 三、定时任务

### 3.1 Quartz

**Quartz** 是功能强大的定时任务调度框架，支持集群、持久化。

#### 核心概念

```
┌─────────────────────────────────────────────────────────┐
│                    Scheduler (调度器)                    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────────────┐    │
│  │   Job (任务)     │◀───│ Trigger (触发器)        │    │
│  │  - 执行逻辑       │    │  - Cron 表达式          │    │
│  │  - JobDetail     │    │  - SimpleTrigger       │    │
│  └─────────────────┘    └─────────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│  JobStore (任务存储) - RAMJobStore / JDBCJobStore       │
└─────────────────────────────────────────────────────────┘
```

#### Spring Boot 集成

```java
@Configuration
public class QuartzConfig {

    @Bean
    public JobDetail orderCancelJob() {
        return JobBuilder.newJob(OrderCancelJob.class)
                .withIdentity("orderCancelJob", "orderGroup")
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger orderCancelTrigger() {
        CronScheduleBuilder scheduleBuilder =
            CronScheduleBuilder.cronSchedule("0 */5 * * * ?"); // 每5分钟执行

        return TriggerBuilder.newTrigger()
                .forJob(orderCancelJob())
                .withIdentity("orderCancelTrigger", "orderGroup")
                .withSchedule(scheduleBuilder)
                .build();
    }
}
```

#### Job 实现

```java
@Component
@Slf4j
public class OrderCancelJob extends QuartzJobBean {

    @Autowired
    private OrderService orderService;

    @Override
    protected void executeInternal(JobExecutionContext context) {
        log.info("开始执行订单取消任务: {}", LocalDateTime.now());

        try {
            // 取消超时未支付订单
            int count = orderService.cancelTimeoutOrders();
            log.info("取消超时订单数量: {}", count);
        } catch (Exception e) {
            log.error("订单取消任务执行失败", e);
        }
    }
}
```

#### 动态创建任务

```java
@Service
public class QuartzService {

    @Autowired
    private Scheduler scheduler;

    /**
     * 创建定时任务
     */
    public void addJob(String jobName, String groupName, Class<? extends Job> jobClass,
                       String cronExpression, Map<String, Object> params) throws SchedulerException {
        JobDetail jobDetail = JobBuilder.newJob(jobClass)
                .withIdentity(jobName, groupName)
                .build();

        // 传递参数
        if (params != null) {
            params.forEach((key, value) ->
                jobDetail.getJobDataMap().put(key, value));
        }

        CronTrigger trigger = TriggerBuilder.newTrigger()
                .withIdentity(jobName + "Trigger", groupName)
                .withSchedule(CronScheduleBuilder.cronSchedule(cronExpression))
                .build();

        scheduler.scheduleJob(jobDetail, trigger);
    }

    /**
     * 暂停任务
     */
    public void pauseJob(String jobName, String groupName) throws SchedulerException {
        scheduler.pauseJob(JobKey.jobKey(jobName, groupName));
    }

    /**
     * 恢复任务
     */
    public void resumeJob(String jobName, String groupName) throws SchedulerException {
        scheduler.resumeJob(JobKey.jobKey(jobName, groupName));
    }

    /**
     * 删除任务
     */
    public void deleteJob(String jobName, String groupName) throws SchedulerException {
        scheduler.deleteJob(JobKey.jobKey(jobName, groupName));
    }
}
```

### 3.2 XXL-Job

**XXL-Job** 是分布式任务调度平台，支持可视化管理、弹性扩容、故障转移。

#### 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                      XXL-Job Admin                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  任务管理    │  │  执行器管理  │  │  调度日志   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Executor (执行器集群)                     │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐               │
│  │ Executor │   │ Executor │   │ Executor │               │
│  │  Node 1  │   │  Node 2  │   │  Node 3  │               │
│  └──────────┘   └──────────┘   └──────────┘               │
└─────────────────────────────────────────────────────────────┘
```

#### 核心特性

| 特性 | 说明 |
|------|------|
| **可视化管理** | Web 界面管理任务 |
| **路由策略** | 轮询、随机、一致性哈希、故障转移等 |
| **任务超时** | 支持任务超时控制 |
| **任务重试** | 失败自动重试 |
| **任务依赖** | 子任务触发 |
| **分片广播** | 大任务分片并行处理 |

#### Spring Boot 集成

```yaml
# application.yml
xxl:
  job:
    admin:
      addresses: http://localhost:8080/xxl-job-admin
    executor:
      appname: xxl-job-executor
      address:
      ip:
      port: 9999
      logpath: /data/applogs/xxl-job/jobhandler
      logretentiondays: 30
    accessToken: default_token
```

```java
@Configuration
public class XxlJobConfig {

    @Value("${xxl.job.admin.addresses}")
    private String adminAddresses;

    @Value("${xxl.job.executor.appname}")
    private String appname;

    @Value("${xxl.job.executor.port}")
    private int port;

    @Bean
    public XxlJobSpringExecutor xxlJobExecutor() {
        XxlJobSpringExecutor executor = new XxlJobSpringExecutor();
        executor.setAdminAddresses(adminAddresses);
        executor.setAppname(appname);
        executor.setPort(port);
        return executor;
    }
}
```

#### Job 开发

```java
@Component
@Slf4j
public class SampleXxlJob {

    /**
     * 简单任务
     */
    @XxlJob("demoJob")
    public void demoJob() {
        log.info("XXL-Job 执行: {}", LocalDateTime.now());
    }

    /**
     * 带参数的任务
     */
    @XxlJob("paramJob")
    public void paramJob() {
        String param = XxlJobHelper.getJobParam();
        log.info("任务参数: {}", param);
    }

    /**
     * 分片广播任务
     */
    @XxlJob("shardingJob")
    public void shardingJob() {
        // 分片参数
        int shardIndex = XxlJobHelper.getShardIndex();  // 当前分片序号
        int shardTotal = XxlJobHelper.getShardTotal();  // 总分片数

        log.info("分片参数: index={}, total={}", shardIndex, shardTotal);

        // 按分片处理数据
        // 例如：处理 ID % shardTotal == shardIndex 的数据
        processShardingData(shardIndex, shardTotal);
    }

    /**
     * 子任务触发
     */
    @XxlJob("parentJob")
    public void parentJob() {
        log.info("父任务执行完成，触发子任务");
        XxlJobHelper.handleSuccess("触发子任务");
    }

    private void processShardingData(int shardIndex, int shardTotal) {
        // 分片处理逻辑
    }
}
```

### 3.3 Quartz vs XXL-Job 对比

| 特性 | Quartz | XXL-Job |
|------|--------|---------|
| 架构模式 | 嵌入式 | 分布式平台 |
| 管理界面 | ❌ 无 | ✅ Web 管理界面 |
| 集群支持 | 需要数据库支持 | ✅ 原生支持 |
| 任务监控 | 需要自建 | ✅ 内置监控 |
| 动态调度 | 编码实现 | ✅ 界面操作 |
| 分片任务 | ❌ 不支持 | ✅ 支持 |
| 失败重试 | 手动实现 | ✅ 内置支持 |
| 学习成本 | 低 | 中等 |

---

## 四、最佳实践

### 4.1 Redis 使用建议

```java
// 1. Key 命名规范
// 格式：业务:模块:ID
String key = "order:payment:" + orderId;

// 2. 避免 Big Key
// ❌ 单个 Key 的 Value 超过 10KB
// ✅ 拆分存储

// 3. 批量操作使用 Pipeline
public List<Object> batchGet(List<String> keys) {
    return stringRedisTemplate.executePipelined(
        (RedisCallback<Object>) connection -> {
            keys.forEach(key -> connection.get(key.getBytes()));
            return null;
        }
    );
}

// 4. 缓存穿透防护
public String getWithBloomFilter(String key) {
    // 先查布隆过滤器
    if (!bloomFilter.mightContain(key)) {
        return null;  // 一定不存在
    }
    return stringRedisTemplate.opsForValue().get(key);
}

// 5. 缓存击穿防护
public String getWithLock(String key) {
    String value = stringRedisTemplate.opsForValue().get(key);
    if (value != null) {
        return value;
    }

    // 使用分布式锁防止缓存重建冲突
    String lockKey = "lock:" + key;
    try {
        if (tryLock(lockKey, "1", 10, TimeUnit.SECONDS)) {
            // 双重检查
            value = stringRedisTemplate.opsForValue().get(key);
            if (value != null) {
                return value;
            }
            // 查数据库并回写缓存
            value = queryFromDB(key);
            stringRedisTemplate.opsForValue().set(key, value, 1, TimeUnit.HOURS);
        }
    } finally {
        unlock(lockKey, "1");
    }
    return value;
}
```

### 4.2 消息队列使用建议

```java
// 1. 消息幂等性处理
@RabbitListener(queues = "order.queue")
public void handleOrder(Message message, Channel channel) throws IOException {
    String messageId = message.getMessageProperties().getMessageId();

    // 使用 Redis 检查是否已处理
    if (redisTemplate.opsForValue().setIfAbsent("msg:" + messageId, "1", 1, TimeUnit.DAYS)) {
        try {
            processOrder(message.getBody());
        } finally {
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        }
    } else {
        // 消息已处理，直接确认
        channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
    }
}

// 2. 死信队列处理
@Bean
public Queue orderQueue() {
    return QueueBuilder.durable("order.queue")
            .deadLetterExchange("dlx.exchange")
            .deadLetterRoutingKey("dlx.order")
            .ttl(30000)  // 30秒过期
            .build();
}

// 3. 消息顺序性保证
// 使用相同的路由键确保发送到同一队列
public void sendOrderedMessage(Long orderId, List<OrderEvent> events) {
    for (OrderEvent event : events) {
        rabbitTemplate.convertAndSend(
            "order.exchange",
            "order." + orderId,  // 相同订单使用相同的路由键
            event
        );
    }
}
```

### 4.3 定时任务最佳实践

```java
// 1. 任务幂等性设计
@XxlJob("cancelTimeoutOrder")
public void cancelTimeoutOrder() {
    String lockKey = "job:cancelTimeoutOrder:" + LocalDate.now();

    // 分布式锁确保同一时刻只有一个实例执行
    if (tryLock(lockKey, "1", 5, TimeUnit.MINUTES)) {
        try {
            // 只处理未取消的超时订单
            List<Order> timeoutOrders = orderMapper.selectTimeoutOrders();
            for (Order order : timeoutOrders) {
                cancelOrder(order.getId());
            }
        } finally {
            unlock(lockKey, "1");
        }
    }
}

// 2. 任务超时控制
@XxlJob("longRunningJob")
public void longRunningJob() {
    ExecutorService executor = Executors.newSingleThreadExecutor();
    Future<?> future = executor.submit(() -> {
        // 执行耗时任务
        doLongRunningWork();
    });

    try {
        // 设置超时时间
        future.get(5, TimeUnit.MINUTES);
    } catch (TimeoutException e) {
        future.cancel(true);
        XxlJobHelper.handleFail("任务执行超时");
    } finally {
        executor.shutdown();
    }
}

// 3. 任务异常处理
@XxlJob("exceptionHandlerJob")
public void exceptionHandlerJob() {
    try {
        doWork();
        XxlJobHelper.handleSuccess("任务执行成功");
    } catch (BusinessException e) {
        log.error("业务异常", e);
        XxlJobHelper.handleFail("业务异常: " + e.getMessage());
    } catch (Exception e) {
        log.error("系统异常", e);
        XxlJobHelper.handleFail("系统异常: " + e.getMessage());
    }
}
```

---

## 五、面试常见问题

### Q1: Redis 客户端如何选择？

- **Jedis**：简单场景，低并发，需要阻塞式操作
- **Lettuce**：高并发场景，需要异步/响应式支持，Spring Boot 2.x+ 推荐

### Q2: RabbitMQ 如何保证消息不丢失？

1. **生产者确认**：开启 publisher confirms
2. **消息持久化**：消息和队列都持久化
3. **消费者手动确认**：处理完成后手动 ACK

### Q3: Kafka 如何保证消息顺序？

- 同一 Partition 内消息有序
- 使用相同 Key 发送到同一 Partition

### Q4: XXL-Job 分片任务原理？

执行器注册时分配分片序号，任务执行时根据 `shardIndex` 和 `shardTotal` 处理对应数据，实现大任务并行处理。

---

*最后更新时间：2024年*