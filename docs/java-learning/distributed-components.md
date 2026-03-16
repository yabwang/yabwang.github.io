---
order: 7
---

# 六、分布式系统组件

## 6.6 服务注册与发现

服务注册与发现是微服务架构的核心组件，用于服务的自动注册和动态发现。

### 核心概念

```
┌──────────────┐     注册      ┌──────────────┐
│  服务提供者   │ ────────────► │  注册中心     │
│  Service A   │               │   Registry   │
└──────────────┘               └──────┬───────┘
                                      │
┌──────────────┐     发现      ───────┘
│  服务消费者   │ ◄────────────
│  Service B   │
└──────────────┘
```

### 主流方案对比

| 组件 | 一致性 | 可用性 | 语言 | 特点 |
|------|--------|--------|------|------|
| **Nacos** | CP/AP 可切换 | 高 | Java | Alibaba 出品，功能全面 |
| **Eureka** | AP | 高 | Java | Spring Cloud 默认，已停更 |
| **Consul** | CP | 中 | Go | 支持多数据中心 |
| **ZooKeeper** | CP | 中 | Java | 强一致，性能一般 |
| **etcd** | CP | 中 | Go | K8s 默认，高性能 |

### Nacos 核心原理

**数据模型：**
```
Namespace（命名空间）
    └── Group（分组）
            └── Service（服务）
                    └── Cluster（集群）
                            └── Instance（实例）
```

**服务注册流程：**
```java
// Spring Cloud Alibaba 示例
@Service
public class OrderService {
    @NacosInjected
    private NamingService namingService;

    @PostConstruct
    public void register() throws NacosException {
        // 注册服务实例
        namingService.registerInstance("order-service", "192.168.1.100", 8080);
    }
}
```

**服务发现流程：**
```java
// 获取健康实例列表
List<Instance> instances = namingService.selectInstances(
    "order-service",
    true  // 只返回健康实例
);
```

---

## 6.7 配置中心

配置中心用于统一管理分布式系统的配置信息，支持动态刷新。

### 核心功能

1. **配置管理**：集中管理各环境配置
2. **动态刷新**：配置变更实时生效
3. **版本管理**：配置变更历史记录
4. **灰度发布**：按条件灰度配置

### Nacos Config 使用

**bootstrap.yml 配置：**
```yaml
spring:
  cloud:
    nacos:
      config:
        server-addr: 127.0.0.1:8848
        namespace: ${namespace:dev}
        group: DEFAULT_GROUP
        file-extension: yaml
        refresh-enabled: true
```

**动态刷新：**
```java
@RestController
@RefreshScope  // 启用配置动态刷新
public class ConfigController {

    @Value("${app.timeout:5000}")
    private int timeout;

    @GetMapping("/timeout")
    public int getTimeout() {
        return timeout;  // 配置变更自动更新
    }
}
```

**配置优先级：**
```
1. 本地优先级配置（application-{profile}.yaml）
2. Nacos 配置（DEFAULT_GROUP）
3. Nacos 共享配置
4. 默认配置
```

---

## 6.8 网关

API 网关是微服务架构的统一入口，负责请求路由、认证、限流等功能。

### Spring Cloud Gateway 核心概念

**架构模型：**
```
Client ──► Gateway ──► Predicate ──► Filter ──► Service
                          │
                          └──► Route
```

**核心组件：**

| 组件 | 作用 |
|------|------|
| Route（路由） | 网关的基本构建单元 |
| Predicate（断言） | 匹配请求条件 |
| Filter（过滤器） | 修改请求/响应 |

### 配置示例

**路由配置：**
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: order-service
          uri: lb://order-service  # 负载均衡
          predicates:
            - Path=/api/order/**    # 路径匹配
            - Method=GET,POST       # 方法匹配
          filters:
            - StripPrefix=1         # 路径截取
            - AddRequestHeader=X-Trace-Id, ${random.uuid}
            - name: RequestRateLimiter  # 限流
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
```

**自定义过滤器：**
```java
@Component
public class AuthFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // 1. 检查认证 token
        String token = request.getHeaders().getFirst("Authorization");
        if (StringUtils.isEmpty(token)) {
            return unauthorized(exchange);
        }

        // 2. 验证 token 有效性
        if (!tokenValidator.isValid(token)) {
            return unauthorized(exchange);
        }

        // 3. 传递用户信息到下游
        ServerHttpRequest mutated = request.mutate()
            .header("X-User-Id", token.getUserId())
            .build();

        return chain.filter(exchange.mutate().request(mutated).build());
    }

    @Override
    public int getOrder() {
        return -100;  // 高优先级
    }
}
```

---

## 6.9 服务调用

### Feign / OpenFeign

Feign 是一个声明式的 HTTP 客户端，简化服务间调用。

**基本使用：**
```java
@FeignClient(
    name = "user-service",
    fallbackFactory = UserFallbackFactory.class  // 熔断降级
)
public interface UserClient {

    @GetMapping("/api/user/{id}")
    Result<User> getUserById(@PathVariable("id") Long id);

    @PostMapping("/api/user")
    Result<User> createUser(@RequestBody UserCreateRequest request);
}
```

**配置优化：**
```yaml
feign:
  client:
    config:
      default:  # 全局配置
        connectTimeout: 5000
        readTimeout: 10000
        loggerLevel: FULL
      user-service:  # 特定服务配置
        connectTimeout: 3000
        readTimeout: 5000
```

**拦截器（传递上下文）：**
```java
@Component
public class FeignInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        // 传递链路追踪 ID
        String traceId = MDC.get("traceId");
        if (traceId != null) {
            template.header("X-Trace-Id", traceId);
        }

        // 传递认证 token
        ServletRequestAttributes attrs =
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            String token = attrs.getRequest().getHeader("Authorization");
            template.header("Authorization", token);
        }
    }
}
```

### Ribbon 负载均衡

**负载均衡策略：**
```yaml
user-service:
  ribbon:
    NFLoadBalancerRuleClassName: com.netflix.loadbalancer.BestAvailableRule
```

**内置策略：**

| 策略 | 说明 |
|------|------|
| RoundRobinRule | 轮询 |
| RandomRule | 随机 |
| BestAvailableRule | 最小连接数 |
| RetryRule | 重试机制 |
| WeightedResponseTimeRule | 响应时间加权 |

---

## 6.10 熔断降级

### Sentinel 核心概念

**资源定义：**
```java
public class OrderService {

    public Order createOrder(OrderRequest request) {
        Entry entry = null;
        try {
            // 定义资源
            entry = SphU.entry("createOrder", EntryType.OUT);

            // 业务逻辑
            return orderRepository.save(request.toEntity());

        } catch (Throwable t) {
            // 异常处理
            throw new BusinessException("创建订单失败", t);
        } finally {
            if (entry != null) {
                entry.exit();
            }
        }
    }
}
```

**注解方式：**
```java
@Service
public class OrderService {

    @SentinelResource(
        value = "createOrder",
        fallback = "createOrderFallback",      // 异常降级
        blockHandler = "createOrderBlockHandler" // 限流降级
    )
    public Order createOrder(OrderRequest request) {
        return orderRepository.save(request.toEntity());
    }

    // 降级方法（业务异常）
    private Order createOrderFallback(OrderRequest request, Throwable t) {
        log.error("创建订单异常", t);
        return Order.fallbackOrder(request);
    }

    // 限流处理方法（流量控制）
    private Order createOrderBlockHandler(OrderRequest request, BlockException e) {
        log.warn("创建订单限流", e);
        throw new RateLimitException("系统繁忙，请稍后重试");
    }
}
```

**流控规则配置：**
```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
    sentinel:
      transport:
        dashboard: localhost:8080
      datasource:
        flow:
          nacos:
            server-addr: ${spring.cloud.nacos.discovery.server-addr}
            dataId: ${spring.application.name}-sentinel
            groupId: DEFAULT_GROUP
            rule-type: flow
```

**流控规则示例（JSON）：**
```json
[
  {
    "resource": "createOrder",
    "limitApp": "default",
    "grade": 1,           // QPS 模式
    "count": 100,         // 阈值
    "strategy": 0,        // 直接流控
    "controlBehavior": 0, // 快速失败
    "warmUpPeriodSec": 10
  }
]
```

### 熔断器模式

```
                ┌─────────────┐
                │   CLOSED    │  正常状态
                │  (关闭状态)  │
                └──────┬──────┘
                       │ 失败率 > 阈值
                       │ 或 慢调用比例 > 阈值
                       ▼
                ┌─────────────┐
         休眠时间结束   │    OPEN     │  熔断状态
        ◄────────────┤  (打开状态)  │───► 拒绝所有请求
                     └──────┬──────┘
                            │ 进入半开状态
                            ▼
                     ┌─────────────┐
          成功 ──────►│   HALF_OPEN   │───► 失败 ──────┐
                     │  (半开状态)   │                │
                     └─────────────┘                │
                          │                         │
                          └─────────────────────────┘
```

---

## 6.11 分布式事务

### 常见问题

1. **数据一致性**：跨服务数据如何保持一致
2. **隔离性**：并发事务如何隔离
3. **性能**：分布式事务的开销

### 解决方案对比

| 方案 | 一致性 | 性能 | 复杂度 | 场景 |
|------|--------|------|--------|------|
| 2PC | 强一致 | 低 | 中 | 数据库间 |
| TCC | 最终一致 | 高 | 高 | 核心业务 |
| Saga | 最终一致 | 高 | 中 | 长流程 |
| 本地消息表 | 最终一致 | 中 | 低 | 异步场景 |
| 最大努力通知 | 最终一致 | 高 | 低 | 通知类 |

### Seata 实现分布式事务

**AT 模式（自动补偿）：**
```java
// 1. 全局事务发起方
@GlobalTransactional  // 开启全局事务
public void createOrder(OrderRequest request) {
    // 2. 创建订单
    orderService.create(request);

    // 3. 扣减库存
    inventoryService.deduct(request.getSkuId(), request.getCount());

    // 4. 扣减余额
    accountService.deduct(request.getUserId(), request.getAmount());
}

// 4. 分支事务参与方
public class InventoryService {

    public void deduct(Long skuId, Integer count) {
        // Seata 自动记录前后镜像
        inventoryMapper.deduct(skuId, count);
    }
}
```

**Seata 配置：**
```yaml
seata:
  enabled: true
  tx-service-group: my_test_tx_group
  service:
    vgroup-mapping:
      my_test_tx_group: default
    grouplist:
      default: 127.0.0.1:8091
  data-source-proxy-mode: AT
```

### TCC 模式实现

```java
public interface InventoryTccService {

    // Try 阶段：预留资源
    @TwoPhaseBusinessAction(name = "inventoryTry", commitMethod = "commit", rollbackMethod = "rollback")
    boolean tryMethod(OrderRequest request);

    // Confirm 阶段：确认提交
    boolean commit(BusinessActionContext context);

    // Cancel 阶段：回滚资源
    boolean rollback(BusinessActionContext context);
}

@Service
public class InventoryTccServiceImpl implements InventoryTccService {

    @Override
    public boolean tryMethod(OrderRequest request) {
        // 冻结库存
        inventoryMapper.freezeStock(request.getSkuId(), request.getCount());
        return true;
    }

    @Override
    public boolean commit(BusinessActionContext context) {
        // 扣减冻结库存
        Long orderId = (Long) context.getActionContext("orderId");
        inventoryMapper.deductFrozenStock(orderId);
        return true;
    }

    @Override
    public boolean rollback(BusinessActionContext context) {
        // 释放冻结库存
        Long orderId = (Long) context.getActionContext("orderId");
        inventoryMapper.releaseFrozenStock(orderId);
        return true;
    }
}
```

### Saga 模式

适用于长流程业务场景：

```java
@SagaStart
public void processLoanApplication(LoanApplication app) {
    // 步骤 1: 信用评估
    creditService.evaluate(app);

    // 步骤 2: 风险评估
    riskService.assess(app);

    // 步骤 3: 审批
    approvalService.approve(app);

    // 步骤 4: 放款
    paymentService.transfer(app);
}

// 每个步骤定义补偿方法
@Service
public class CreditService {

    public void evaluate(LoanApplication app) {
        // 信用评估逻辑
    }

    @Compensable  // 补偿方法
    public void compensateEvaluate(LoanApplication app) {
        // 撤销信用评估
    }
}
```

---

## 6.12 实践建议

### 技术选型

| 场景 | 推荐方案 |
|------|----------|
| 服务注册发现 | Nacos |
| 配置中心 | Nacos Config / Apollo |
| API 网关 | Spring Cloud Gateway |
| 服务调用 | OpenFeign + LoadBalancer |
| 熔断降级 | Sentinel |
| 分布式事务 | Seata |

### 最佳实践

1. **服务划分**
   - 单一职责原则
   - 高内聚低耦合
   - 按业务领域划分

2. **容错设计**
   - 设置合理的超时时间
   - 实现服务降级
   - 配置熔断策略

3. **监控告警**
   - 链路追踪（SkyWalking、Zipkin）
   - 指标监控（Prometheus + Grafana）
   - 日志聚合（ELK）

4. **性能优化**
   - 服务缓存
   - 批量调用
   - 异步处理

---

**上一章**：[分布式系统理论 ←](/java-learning/distributed-system-theory)
**下一章**：[分布式锁 →](/java-learning/distributed-lock)
