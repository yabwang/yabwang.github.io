---
order: 12
---

# 九、项目经验总结

面试中，项目经验是考察候选人技术深度和解决问题能力的重要环节。本章介绍如何梳理和呈现项目经验。

---

## 9.1 项目描述框架

### STAR 法则

用 STAR 法则结构化描述项目经验：

| 要素 | 说明 | 示例 |
|------|------|------|
| **S**ituation | 项目背景 | "公司原有订单系统日均处理 10 万单，大促期间经常超时" |
| **T**ask | 你的任务 | "我负责订单系统的性能优化，目标是将响应时间降低 50%" |
| **A**ction | 你的行动 | "引入 Redis 缓存、MQ 异步下单、数据库分库分表" |
| **R**esult | 结果/收益 | "系统 QPS 提升 5 倍，响应时间从 500ms 降至 100ms" |

---

## 9.2 项目案例：电商平台订单系统

### 9.2.1 项目背景

```
项目名称：电商平台订单系统重构
项目时间：2024.03 - 2024.08
项目规模：日订单 100 万 +，峰值 QPS 5000+
团队规模：后端 6 人，前端 4 人，测试 3 人
我的角色：后端核心开发，负责订单创建和支付模块
```

**业务背景：**
- 公司原有订单系统服役 5 年，技术栈老旧（Spring MVC + Oracle）
- 代码耦合严重，新增功能开发周期长
- 大促期间系统频繁告警，响应时间超过 2 秒
- 数据库单表数据量突破 5 亿，查询性能急剧下降

**重构目标：**
1. 响应时间：P99 < 200ms
2. 可用性：99.99%
3. 支持日订单 500 万 +
4. 支持弹性扩容

### 9.2.2 系统架构

**旧架构问题：**

```
┌─────────────────────────────────────────┐
│            Nginx 负载均衡                │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         单体应用 (Spring MVC)            │
│  ┌─────────────────────────────────┐    │
│  │  订单 + 支付 + 库存 + 用户...    │    │
│  │  所有模块耦合在一个 WAR 包中     │    │
│  └─────────────────────────────────┘    │
└────────────────┬────────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │   Oracle RAC   │
        │   单表 5 亿 +    │
        └────────────────┘

问题：
- 单点故障风险
- 扩容困难
- 数据库瓶颈
- 发布周期长（一周一次）
```

**新架构设计：**

```
┌─────────────────────────────────────────────────────────┐
│                    流量入口                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │    CDN      │  │   WAF       │  │   DNS       │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    网关层                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │          Spring Cloud Gateway (集群)             │   │
│  │  - 统一鉴权  - 限流熔断  - 请求路由  - 日志       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  订单服务    │  │  支付服务    │  │  库存服务    │
│  (3 实例)    │  │  (3 实例)    │  │  (3 实例)    │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    中间件层                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │    Redis    │  │    MQ       │  │    ES       │     │
│  │   集群      │  │  RocketMQ   │  │  订单搜索   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    数据存储层                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │    MySQL    │  │   MongoDB   │  │   TiDB      │     │
│  │  分库分表   │  │  订单详情   │  │  历史订单   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### 9.2.3 技术难点与解决方案

#### 难点一：数据库性能优化

**问题：**
- 订单表单表数据量 5 亿+，查询响应时间 > 3 秒
- 索引失效，大量全表扫描
- 主从延迟严重（30+ 秒）

**解决方案：**

1. **分库分表**

```java
// 使用 ShardingSphere 进行分库分表
// 分片策略：按用户 ID 取模分 16 库，按订单日期分 12 表

@Configuration
public class ShardingConfig {

    @Bean
    public DataSource shardingDataSource() {
        Map<String, DataSource> dataSourceMap = new HashMap<>();

        // 创建 16 个数据源
        for (int i = 0; i < 16; i++) {
            dataSourceMap.put("ds" + i, createDataSource(i));
        }

        ShardingRuleConfiguration shardingRuleConfig = new ShardingRuleConfiguration();

        // 订单表分片配置
        shardingRuleConfig.getTables().add(getOrderTableRule());

        // 绑定表（避免笛卡尔积）
        shardingRuleConfig.getBindingTableGroups().add("t_order,t_order_item");

        return new ShardingDataSourceFactory(
            dataSourceMap,
            shardingRuleConfig,
            getShardingProperties()
        ).getDataSource();
    }

    private TableRuleConfiguration getOrderTableRule() {
        TableRuleConfiguration tableRule = new TableRuleConfiguration(
            "t_order",
            "ds${0..15}.t_order_${202401..202412}"
        );

        // 分库策略：user_id % 16
        tableRule.setDatabaseShardingStrategyConfig(
            new StandardShardingStrategyConfiguration(
                "user_id",
                new ModShardingAlgorithm(16)
            )
        );

        // 分表策略：按订单月份
        tableRule.setTableShardingStrategyConfig(
            new StandardShardingStrategyConfiguration(
                "create_time",
                new DateShardingAlgorithm()
            )
        );

        return tableRule;
    }
}
```

2. **历史数据归档**

```java
@Service
public class OrderArchiveService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private MongoTemplate mongoTemplate;

    /**
     * 定时任务：每月 1 号归档 3 个月前的订单
     */
    @Scheduled(cron = "0 0 2 1 * ?")
    @Transactional
    public void archiveOldOrders() {
        LocalDate archiveDate = LocalDate.now().minusMonths(3);
        String archiveMonth = archiveDate.format(DateTimeFormatter.ofPattern("yyyyMM"));

        // 1. 查询待归档订单
        String selectSql = """
            SELECT * FROM t_order_%s
            WHERE create_time < ?
            """.formatted(archiveMonth);

        List<Order> orders = jdbcTemplate.query(
            selectSql,
            new BeanPropertyRowMapper<>(Order.class),
            Timestamp.valueOf(archiveDate.atStartOfDay())
        );

        // 2. 写入 MongoDB（历史订单库）
        for (Order order : orders) {
            mongoTemplate.save(order, "historical_orders");
        }

        // 3. 删除 MySQL 中的历史数据
        String deleteSql = """
            DELETE FROM t_order_%s
            WHERE create_time < ?
            """.formatted(archiveMonth);

        jdbcTemplate.update(deleteSql, Timestamp.valueOf(archiveDate.atStartOfDay()));

        log.info("归档完成，共处理 {} 条订单", orders.size());
    }
}
```

**效果：**
- 单表数据量降至 2000 万以内
- 查询响应时间 P99 < 100ms
- 主从延迟 < 5 秒

#### 难点二：高并发下单

**问题：**
- 大促期间瞬时流量达日常 10 倍
- 数据库连接池耗尽
- 超卖风险

**解决方案：**

1. **Redis 预扣库存**

```java
@Service
public class OrderCreateService {

    @Autowired
    private RedisTemplate<String, Integer> redisTemplate;

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    private static final String SCRIPT = """
        local stockKey = KEYS[1]
        local usedKey = KEYS[2]
        local orderId = ARGV[1]
        local userId = ARGV[2]
        local skuId = ARGV[3]
        local count = tonumber(ARGV[4])

        -- 检查库存
        local stock = tonumber(redis.call('GET', stockKey))
        local used = tonumber(redis.call('GET', usedKey) or 0)

        if stock == nil or stock - used < count then
            return -1  -- 库存不足
        end

        -- 检查用户限购
        local userLimitKey = "order:limit:" .. userId .. ":" .. skuId
        if redis.call('EXISTS', userLimitKey) == 1 then
            return -2  -- 重复购买
        end

        -- 预扣库存
        redis.call('INCRBY', usedKey, count)
        redis.call('SET', userLimitKey, 1, 'EX', 300)

        return 1  -- 成功
        """;

    /**
     * 创建订单（高并发版本）
     */
    public OrderCreateResult createOrder(OrderCreateRequest request) {
        String stockKey = "stock:" + request.getSkuId();
        String usedKey = "stock:used:" + request.getSkuId();

        // 1. Lua 脚本预扣库存
        Long result = redisTemplate.execute(
            RedisScript.of(SCRIPT, Long.class),
            Arrays.asList(stockKey, usedKey),
            generateOrderId(),
            request.getUserId().toString(),
            request.getSkuId().toString(),
            String.valueOf(request.getCount())
        );

        if (result == -1) {
            return OrderCreateResult.stockNotEnough();
        }
        if (result == -2) {
            return OrderCreateResult.repeatPurchase();
        }

        // 2. 发送 MQ 异步创建订单
        OrderCreateMessage message = new OrderCreateMessage();
        message.setOrderId(generateOrderId());
        message.setUserId(request.getUserId());
        message.setSkuId(request.getSkuId());
        message.setCount(request.getCount());

        rocketMQTemplate.send("order_create_topic", message);

        return OrderCreateResult.success(message.getOrderId());
    }
}
```

2. **MQ 削峰填谷**

```java
@Component
public class OrderCreateConsumer {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private InventoryService inventoryService;

    /**
     * 监听订单创建消息
     */
    @RocketMQMessageListener(
        topic = "order_create_topic",
        consumerGroup = "order_create_group"
    )
    public class OrderCreateListener implements RocketMQListener<OrderCreateMessage> {

        @Override
        public void onMessage(OrderCreateMessage message) {
            try {
                // 1. 创建订单
                Order order = new Order();
                order.setOrderId(message.getOrderId());
                order.setUserId(message.getUserId());
                // ... 设置其他字段
                orderMapper.insert(order);

                // 2. 扣减库存（最终一致性）
                inventoryService.deductStock(message.getSkuId(), message.getCount());

                // 3. 发送订单创建成功事件
                // ...

            } catch (Exception e) {
                log.error("创建订单失败", e);
                // 重试 3 次后进入死信队列
                throw e;
            }
        }
    }
}
```

**效果：**
- 下单接口响应时间从 500ms 降至 50ms
- 系统可支撑 10 万 + QPS
- 零超卖事故

#### 难点三：分布式事务

**问题：**
- 订单、库存、支付跨多个服务
- 需要保证数据一致性
- 传统 2PC 性能太差

**解决方案：Seata AT 模式 + 本地消息表**

```java
// 1. 订单服务 - 全局事务发起方
@Service
public class OrderService {

    @Autowired
    private InventoryClient inventoryClient;

    @Autowired
    private AccountClient accountClient;

    /**
     * 创建订单（分布式事务）
     */
    @GlobalTransactional(timeoutMills = 300000, name = "create-order-tx")
    public Order createOrder(OrderCreateDTO dto) {
        // 1. 创建订单（本地事务）
        Order order = orderMapper.insert(dto.toOrder());

        try {
            // 2. 扣减库存（远程调用）
            inventoryClient.deductStock(dto.getSkuId(), dto.getCount());

            // 3. 扣减余额（远程调用）
            accountClient.deduct(dto.getUserId(), dto.getAmount());

        } catch (Exception e) {
            // 触发全局回滚
            throw new BusinessException("订单创建失败", e);
        }

        return order;
    }
}

// 2. 库存服务 - 分支事务参与方
@Service
public class InventoryService {

    /**
     * 扣减库存（Seata AT 模式自动记录前后镜像）
     */
    public void deductStock(Long skuId, Integer count) {
        inventoryMapper.deductStock(skuId, count);
    }
}
```

**本地消息表（兜底方案）：**

```java
// 本地消息表
@Entity
@Table(name = "local_message")
public class LocalMessage {

    @Id
    private String messageId;

    private String topic;
    private String content;
    private Integer retryCount = 0;
    private String status; // SENDING, SENT, SUCCESS
    private LocalDateTime createTime;
    private LocalDateTime nextRetryTime;
}

// 消息发送服务
@Service
public class LocalMessageService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    /**
     * 事务性发送消息
     */
    @Transactional
    public void sendMessageInTx(String messageId, String topic, String content) {
        // 1. 保存消息到本地表
        saveLocalMessage(messageId, topic, content);

        // 2. 发送消息
        rocketMQTemplate.send(topic, content);

        // 3. 更新消息状态
        updateMessageStatus(messageId, "SENT");
    }

    /**
     * 定时任务：重试发送失败的消息
     */
    @Scheduled(fixedRate = 5000)
    public void retryFailedMessages() {
        List<LocalMessage> messages = getRetryMessages();
        for (LocalMessage msg : messages) {
            try {
                rocketMQTemplate.send(msg.getTopic(), msg.getContent());
                updateMessageStatus(msg.getMessageId(), "SUCCESS");
            } catch (Exception e) {
                incrementRetryCount(msg.getMessageId());
            }
        }
    }
}
```

### 9.2.4 项目亮点

| 亮点 | 描述 | 量化收益 |
|------|------|----------|
| **性能优化** | 分库分表 + 缓存 + 异步 | QPS 提升 5 倍，RT 降低 80% |
| **高可用** | 熔断降级 + 多活部署 | 可用性从 99.9% 提升至 99.99% |
| **可扩展** | 微服务拆分 | 新功能开发周期从 2 周降至 3 天 |
| **成本优化** | 历史数据归档 + 冷热分离 | 存储成本降低 40% |

### 9.2.5 技术选型理由

| 技术 | 选型理由 |
|------|----------|
| **Spring Cloud Alibaba** | 生态完善，团队熟悉，文档丰富 |
| **RocketMQ** | 阿里背书，事务消息支持好 |
| **ShardingSphere** | 功能强大，支持在线扩容 |
| **Redis 集群** | 高性能，支持持久化 |
| **MongoDB** | 适合存储非结构化订单详情 |
| **TiDB** | HTAP 能力，适合历史订单查询 |

---

## 9.3 项目经验总结模板

### 面试介绍模板（3 分钟版）

```
我最近负责的项目是 [项目名称]，这是一个 [业务类型] 系统。

【背景】
当时面临的问题是 [具体问题]，比如 [量化数据]。

【我的工作】
我主要负责 [模块/职责]，核心工作包括：
1. [技术亮点 1] - 通过 [方案] 解决了 [问题]
2. [技术亮点 2] - 通过 [方案] 解决了 [问题]
3. [技术亮点 3] - 通过 [方案] 解决了 [问题]

【结果】
最终系统 [量化收益]，比如 QPS 提升了 X 倍，响应时间降低了 Y%。

【收获】
这个项目让我深刻理解了 [技术感悟]，也积累了 [经验总结]。
```

### 深挖准备清单

面试官可能会问的问题，提前准备：

1. **架构设计**
   - 为什么选择这个技术栈？
   - 有没有考虑过其他方案？
   - 系统如何扩容？

2. **性能优化**
   - 瓶颈在哪里？如何发现的？
   - 优化前后的对比数据？
   - 还有没有进一步优化空间？

3. **问题排查**
   - 遇到过什么线上问题？
   - 如何定位和解决的？
   - 有什么预防措施？

4. **团队协作**
   - 如何保证代码质量？
   - 如何做技术分享？
   - 如何推动技术方案落地？

---

## 9.4 其他项目案例

### 9.4.1 支付系统

**核心挑战：**
- 资金安全要求极高
- 需要对接多个支付渠道
- 对账复杂

**关键技术点：**
- 幂等性设计（分布式锁 + 唯一索引）
- 状态机管理订单状态
- 定时对账 + 差错处理

### 9.4.2 用户中心系统

**核心挑战：**
- 用户量大（千万级）
- 安全性要求高
- 需要支持单点登录

**关键技术点：**
- JWT + OAuth2 认证
- 用户数据分库分表
- 敏感信息加密存储

### 9.4.3 数据分析平台

**核心挑战：**
- 数据量大（TB 级）
- 实时性要求高
- 查询复杂多变

**关键技术点：**
- Lambda 架构（批流一体）
- ClickHouse 实时分析
- 预计算 + 物化视图

---

## 9.5 实践建议

### 项目梳理要点

1. **数据量化**
   - QPS、RT、数据量、用户量
   - 优化前后的对比

2. **技术深度**
   - 知其然，知其所以然
   - 能讲清楚技术选型的权衡

3. **问题意识**
   - 主动发现问题
   - 有解决问题的方法论

4. **复盘总结**
   - 有什么遗憾？
   - 如果重做会怎么改进？

### 避免的坑

| 问题 | 建议 |
|------|------|
| 只说业务，不谈技术 | 重点讲技术挑战和解决方案 |
| 数据模糊 | 准备具体的量化数据 |
| 过度包装 | 实事求是，不要夸大 |
| 缺乏思考 | 准备"为什么"的答案 |

---

**上一章**：[常见场景设计 ←](/java-learning/system-design-scenarios)
**下一章**：[面试准备 →](/java-learning/interview-preparation)
