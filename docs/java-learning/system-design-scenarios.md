---
order: 11
---

# 八、常见系统设计场景

本章介绍面试中高频出现的系统设计题目和解决方案。

---

## 8.1 秒杀系统设计

### 8.1.1 场景特点

| 特点 | 描述 |
|------|------|
| **高并发** | 瞬间流量可达日常 100-1000 倍 |
| **读多写少** | 大量用户查看，极少用户下单成功 |
| **库存有限** | 商品数量有限，超卖会导致资损 |
| **时序性** | 活动开始时间固定，流量集中 |

### 8.1.2 系统架构

```
                    ┌─────────────────────────────────────┐
                    │           CDN 静态资源               │
                    │   (页面、JS、CSS、图片)              │
                    └─────────────────────────────────────┘
                                        │
                                        ▼
                    ┌─────────────────────────────────────┐
                    │           Nginx 限流                 │
                    │   (令牌桶、IP 限流)                   │
                    └─────────────────────────────────────┘
                                        │
                                        ▼
                    ┌─────────────────────────────────────┐
                    │           网关层                     │
                    │   (鉴权、黑名单、请求合并)            │
                    └─────────────────────────────────────┘
                                        │
                                        ▼
        ┌───────────────────────────────────────────────────────┐
        │                    服务层                              │
        │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
        │  │  活动服务    │  │  订单服务    │  │  支付服务    │    │
        │  └─────────────┘  └─────────────┘  └─────────────┘    │
        └───────────────────────────────────────────────────────┘
                                        │
                                        ▼
        ┌───────────────────────────────────────────────────────┐
        │                    缓存层                              │
        │  ┌─────────────────────────────────────────────────┐  │
        │  │              Redis 集群                          │  │
        │  │   - 库存预热                                    │  │
        │  │   - 用户资格校验                                 │  │
        │  │   - 订单去重                                     │  │
        │  └─────────────────────────────────────────────────┘  │
        └───────────────────────────────────────────────────────┘
                                        │
                                        ▼
        ┌───────────────────────────────────────────────────────┐
        │                    持久层                              │
        │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
        │  │    MySQL    │  │    MQ       │  │    ES       │    │
        │  │  (最终扣库存)│  │ (异步下单)  │  │ (订单查询)  │    │
        │  └─────────────┘  └─────────────┘  └─────────────┘    │
        └───────────────────────────────────────────────────────┘
```

### 8.1.3 核心代码实现

#### 库存预热

```java
@Service
public class SeckillService {

    @Autowired
    private RedisTemplate<String, Integer> redisTemplate;

    @Autowired
    private SeckillMapper seckillMapper;

    /**
     * 活动开始前预热库存到 Redis
     */
    @Transactional
    public void warmUpSeckill(Long seckillId) {
        // 1. 查询秒杀商品库存
        SeckillProduct product = seckillMapper.selectById(seckillId);

        // 2. 预热库存到 Redis
        String stockKey = "seckill:stock:" + seckillId;
        redisTemplate.opsForValue().set(stockKey, product.getStock());

        // 3. 初始化库存占用标记
        String usedKey = "seckill:used:" + seckillId;
        redisTemplate.opsForValue().set(usedKey, 0);
    }
}
```

#### Redis 预扣库存

```java
@Service
public class SeckillService {

    @Autowired
    private RedisTemplate<String, Integer> redisTemplate;

    private static final String SCRIPT = """
        local stockKey = KEYS[1]
        local usedKey = KEYS[2]
        local userId = ARGV[1]
        local seckillId = ARGV[2]

        local stock = tonumber(redis.call('GET', stockKey))
        local used = tonumber(redis.call('GET', usedKey))

        -- 检查库存是否充足
        if stock == nil or used == nil then
            return -1  -- 活动未开始
        end

        if stock - used <= 0 then
            return 0   -- 库存已耗尽
        end

        -- 检查用户是否已购买
        local userKey = "seckill:user:" .. seckillId .. ":" .. userId
        if redis.call('EXISTS', userKey) == 1 then
            return -2  -- 重复购买
        end

        -- 预扣库存
        redis.call('INCR', usedKey)
        redis.call('SET', userKey, 1)
        redis.call('EXPIRE', userKey, 300)  -- 5 分钟过期

        return 1  -- 成功
        """;

    /**
     * 秒杀下单（Redis 预扣减）
     * @return 1=成功，0=库存不足，-1=活动未开始，-2=重复购买
     */
    public int seckill(Long seckillId, Long userId) {
        String stockKey = "seckill:stock:" + seckillId;
        String usedKey = "seckill:used:" + seckillId;

        RedisScript<Long> script = RedisScript.of(SCRIPT, Long.class);
        Long result = redisTemplate.execute(
            script,
            Arrays.asList(stockKey, usedKey),
            userId.toString(),
            seckillId.toString()
        );

        return result.intValue();
    }
}
```

#### MQ 异步下单

```java
@Component
public class SeckillMessageSender {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    /**
     * 发送秒杀成功消息，异步创建订单
     */
    public void sendSeckillSuccess(SeckillOrder order) {
        rabbitTemplate.convertAndSend(
            "seckill.exchange",
            "seckill.order.create",
            order,
            message -> {
                message.getMessageProperties().setDeliveryMode(
                    MessageDeliveryMode.PERSISTENT
                );
                return message;
            }
        );
    }
}

@Component
public class SeckillMessageConsumer {

    @Autowired
    private OrderService orderService;

    @RabbitListener(queues = "seckill.order.queue")
    public void handleSeckillOrder(SeckillOrder order) {
        try {
            // 创建正式订单
            orderService.createOrder(order);

            // 扣减数据库库存（最终一致性）
            orderService.deductStock(order.getSeckillId(), 1);

        } catch (Exception e) {
            // 记录异常，人工介入或重试
            log.error("创建秒杀订单失败", e);
        }
    }
}
```

#### 限流与防刷

```java
@Component
public class SeckillInterceptor implements HandlerInterceptor {

    @Autowired
    private RedisTemplate<String, Long> redisTemplate;

    private static final long LIMIT = 100;  // 每秒 100 请求
    private static final long WINDOW = 1000; // 1 秒窗口

    @Override
    public boolean preHandle(HttpServletRequest request,
                            HttpServletResponse response,
                            Object handler) throws Exception {

        String userId = request.getHeader("X-User-Id");
        String key = "seckill:limit:" + userId;

        long now = System.currentTimeMillis();
        long windowStart = now - WINDOW;

        // 滑动窗口计数
        RedisScript<Long> script = RedisScript.of("""
            local key = KEYS[1]
            local windowStart = tonumber(ARGV[1])
            local now = tonumber(ARGV[2])
            local limit = tonumber(ARGV[3])

            -- 移除窗口外的请求
            redis.call('ZREMRANGEBYSCORE', key, 0, windowStart)

            -- 添加当前请求
            redis.call('ZADD', key, now, now .. ':' .. math.random())

            -- 设置过期时间
            redis.call('EXPIRE', key, 2)

            -- 获取窗口内请求数
            local count = redis.call('ZCARD', key)

            return count
            """, Long.class);

        Long count = redisTemplate.execute(
            script,
            Collections.singletonList(key),
            String.valueOf(windowStart),
            String.valueOf(now),
            String.valueOf(LIMIT)
        );

        if (count != null && count > LIMIT) {
            response.setStatus(429);
            response.getWriter().write("请求太频繁，请稍后再试");
            return false;
        }

        return true;
    }
}
```

### 8.1.4 关键优化点

| 优化点 | 方案 |
|--------|------|
| **流量拦截** | CDN → Nginx → 网关 → 服务，层层过滤 |
| **库存扣减** | Redis 预扣减 + MQ 异步下单 |
| **防止超卖** | Lua 脚本保证原子性 |
| **防止重复** | 用户级去重（Redis SETNX） |
| **防刷限流** | IP 限流 + 用户限流 + 验证码 |
| **数据一致性** | 最终一致性 + 对账补偿 |

---

## 8.2 分布式 ID 生成器

### 8.2.1 需求分析

| 要求 | 说明 |
|------|------|
| **全局唯一** | 不同服务/节点生成的 ID 不重复 |
| **趋势递增** | 便于数据库索引，提高写入性能 |
| **高可用** | 7×24 小时服务，不可用会影响业务 |
| **高性能** | 单机 QPS > 10 万 |
| **安全** | ID 不包含敏感信息 |

### 8.2.2 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| UUID | 简单、本地生成 | 无序、过长 | 非主键场景 |
| 数据库号段 | 简单、递增 | 单点、性能低 | 低频场景 |
| Redis 自增 | 简单、性能好 | 需要额外依赖 | 一般场景 |
| Snowflake | 高性能、本地生成 | 时钟回拨问题 | 推荐方案 |
| Leaf | 号段模式、双缓冲 | 依赖数据库 | 高可用场景 |

### 8.2.3 Snowflake 算法实现

```java
/**
 * 改进版雪花算法
 *
 * ID 结构（64 位）：
 * 0 | 41 位时间戳 | 10 位工作机器 ID | 12 位序列号
 *   | (毫秒级)    | (5 位数据中心 +5 位机器) | (4096/毫秒)
 */
public class SnowflakeIdGenerator {

    // 起始时间戳（2024-01-01 00:00:00 UTC）
    private static final long START_TIMESTAMP = 1704067200000L;

    // 各部分位数
    private static final long SEQUENCE_BITS = 12L;
    private static final long MACHINE_BITS = 5L;
    private static final long DATA_CENTER_BITS = 5L;

    // 各部分最大值
    private static final long MAX_SEQUENCE = ~(-1L << SEQUENCE_BITS);
    private static final long MAX_MACHINE_NUM = ~(-1L << MACHINE_BITS);
    private static final long MAX_DATA_CENTER_NUM = ~(-1L << DATA_CENTER_BITS);

    // 各部分偏移量
    private static final long MACHINE_SHIFT = SEQUENCE_BITS;
    private static final long DATA_CENTER_SHIFT = SEQUENCE_BITS + MACHINE_BITS;
    private static final long TIMESTAMP_SHIFT = SEQUENCE_BITS + MACHINE_BITS + DATA_CENTER_BITS;

    private final long dataCenterId;
    private final long machineId;
    private long sequence = 0L;
    private long lastTimestamp = -1L;

    private final Object lock = new Object();

    public SnowflakeIdGenerator(long dataCenterId, long machineId) {
        if (dataCenterId > MAX_DATA_CENTER_NUM || dataCenterId < 0) {
            throw new IllegalArgumentException("DataCenterId 范围：0-" + MAX_DATA_CENTER_NUM);
        }
        if (machineId > MAX_MACHINE_NUM || machineId < 0) {
            throw new IllegalArgumentException("MachineId 范围：0-" + MAX_MACHINE_NUM);
        }
        this.dataCenterId = dataCenterId;
        this.machineId = machineId;
    }

    public synchronized long nextId() {
        long timestamp = System.currentTimeMillis();

        // 时钟回拨处理
        if (timestamp < lastTimestamp) {
            throw new RuntimeException("时钟回拨，拒绝生成 ID");
        }

        // 同一毫秒内序列号自增
        if (timestamp == lastTimestamp) {
            sequence = (sequence + 1) & MAX_SEQUENCE;
            if (sequence == 0) {
                // 序列号溢出，等待下一毫秒
                timestamp = waitNextMillis(lastTimestamp);
            }
        } else {
            // 新毫秒，序列号重置
            sequence = 0L;
        }

        lastTimestamp = timestamp;

        // 组合 ID
        return ((timestamp - START_TIMESTAMP) << TIMESTAMP_SHIFT)
                | (dataCenterId << DATA_CENTER_SHIFT)
                | (machineId << MACHINE_SHIFT)
                | sequence;
    }

    private long waitNextMillis(long lastTimestamp) {
        long timestamp = System.currentTimeMillis();
        while (timestamp <= lastTimestamp) {
            timestamp = System.currentTimeMillis();
        }
        return timestamp;
    }
}

// Spring 配置
@Configuration
public class IdGeneratorConfig {

    @Value("${id.datacenter-id:1}")
    private long dataCenterId;

    @Value("${id.machine-id:1}")
    private long machineId;

    @Bean
    public SnowflakeIdGenerator snowflakeIdGenerator() {
        return new SnowflakeIdGenerator(dataCenterId, machineId);
    }
}
```

### 8.2.4 美团 Leaf 实现（号段模式）

```java
@Service
public class LeafIdGenerator {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final Map<String, IdSegment> segments = new ConcurrentHashMap<>();
    private final ReentrantLock lock = new ReentrantLock();

    /**
     * 获取 ID
     */
    public long getNextId(String key) {
        IdSegment segment = segments.get(key);

        // 双缓冲机制：当前 segment 用完前，提前加载下一个
        if (segment == null || segment.isExhausted()) {
            segment = loadNextSegment(key);
            segments.put(key, segment);
        }

        return segment.getNextId();
    }

    private IdSegment loadNextSegment(String key) {
        lock.lock();
        try {
            // 查询数据库获取号段
            String sql = "SELECT current_id, max_id, step FROM id_segment WHERE key = ?";
            IdSegmentRow row = jdbcTemplate.queryForObject(
                sql,
                (rs, rowNum) -> new IdSegmentRow(
                    rs.getLong("current_id"),
                    rs.getLong("max_id"),
                    rs.getInt("step")
                ),
                key
            );

            if (row == null) {
                // 初始化号段
                initSegment(key);
                row = jdbcTemplate.queryForObject(sql, ...);
            }

            // 更新数据库
            long newMax = row.getCurrentId() + row.getStep();
            jdbcTemplate.update(
                "UPDATE id_segment SET current_id = ? WHERE key = ?",
                newMax, key
            );

            return new IdSegment(row.getCurrentId(), newMax);

        } finally {
            lock.unlock();
        }
    }

    @Data
    static class IdSegment {
        private final long start;
        private final long end;
        private long current;

        public IdSegment(long start, long end) {
            this.start = start;
            this.end = end;
            this.current = start;
        }

        public long getNextId() {
            if (current >= end) {
                throw new RuntimeException("Segment exhausted");
            }
            return current++;
        }

        public boolean isExhausted() {
            return (end - current) < (end - start) * 0.2; // 剩余 20% 时预加载
        }
    }
}
```

**数据库表结构：**
```sql
CREATE TABLE id_segment (
    `key` VARCHAR(64) PRIMARY KEY,
    current_id BIGINT NOT NULL DEFAULT 0,
    max_id BIGINT NOT NULL,
    step INT NOT NULL DEFAULT 1000,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始化
INSERT INTO id_segment (`key`, current_id, max_id, step)
VALUES ('order', 0, 1000, 1000);
```

---

## 8.3 短链接系统

### 8.3.1 系统架构

```
┌──────────┐     ┌─────────────┐     ┌─────────────┐
│  用户    │ ──► │   网关层    │ ──► │  服务层     │
└──────────┘     └─────────────┘     └─────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
             ┌───────────┐        ┌───────────┐        ┌───────────┐
             │   Redis   │        │   MySQL   │        │    MQ     │
             │  (缓存)    │        │  (存储)   │        │ (统计)    │
             └───────────┘        └───────────┘        └───────────┘
```

### 8.3.2 核心实现

```java
@Service
public class ShortUrlService {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private ShortUrlMapper shortUrlMapper;

    private static final String CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final int SHORT_URL_LENGTH = 6;
    private static final long BASE = CHARS.length();

    /**
     * 创建短链接
     */
    public String createShortUrl(String longUrl) {
        // 1. 检查是否已存在
        String md5 = md5(longUrl);
        String cacheKey = "url:long2short:" + md5;
        String shortCode = redisTemplate.opsForValue().get(cacheKey);

        if (shortCode != null) {
            return shortCode;
        }

        // 2. 生成短码（自增 ID 转 62 进制）
        shortCode = generateShortCode(longUrl);

        // 3. 存储映射
        saveUrlMapping(shortCode, longUrl);

        return shortCode;
    }

    /**
     * 生成短码
     */
    private String generateShortCode(String longUrl) {
        // 获取自增 ID
        long id = getNextId();
        return toBase62(id);
    }

    /**
     * 获取下一个自增 ID
     */
    private long getNextId() {
        String key = "url:id:generator";
        return redisTemplate.opsForValue().increment(key);
    }

    /**
     * 十进制转 62 进制
     */
    private String toBase62(long num) {
        StringBuilder sb = new StringBuilder();
        while (num > 0) {
            sb.append(CHARS.charAt((int)(num % BASE)));
            num /= BASE;
        }
        // 补齐长度
        while (sb.length() < SHORT_URL_LENGTH) {
            sb.insert(0, CHARS.charAt(0));
        }
        return sb.reverse().toString();
    }

    /**
     * 62 进制转十进制
     */
    private long fromBase62(String base62) {
        long result = 0;
        for (char c : base62.toCharArray()) {
            result = result * BASE + CHARS.indexOf(c);
        }
        return result;
    }

    /**
     * 保存 URL 映射
     */
    private void saveUrlMapping(String shortCode, String longUrl) {
        String md5 = md5(longUrl);

        // 1. Redis 缓存
        redisTemplate.opsForValue().set(
            "url:long2short:" + md5,
            shortCode,
            7, TimeUnit.DAYS
        );
        redisTemplate.opsForValue().set(
            "url:short2long:" + shortCode,
            longUrl,
            7, TimeUnit.DAYS
        );

        // 2. 数据库存储
        ShortUrlRecord record = new ShortUrlRecord();
        record.setShortCode(shortCode);
        record.setLongUrl(longUrl);
        record.setMd5(md5);
        record.setCreateTime(new Date());
        shortUrlMapper.insert(record);
    }

    /**
     * 重定向到原链接
     */
    public String getLongUrl(String shortCode) {
        // 1. 查询缓存
        String cacheKey = "url:short2long:" + shortCode;
        String longUrl = redisTemplate.opsForValue().get(cacheKey);

        if (longUrl != null) {
            // 异步记录访问统计
            recordAccess(shortCode);
            return longUrl;
        }

        // 2. 查询数据库
        ShortUrlRecord record = shortUrlMapper.selectByShortCode(shortCode);
        if (record != null) {
            longUrl = record.getLongUrl();
            // 回填缓存
            redisTemplate.opsForValue().set(cacheKey, longUrl, 7, TimeUnit.DAYS);
            recordAccess(shortCode);
            return longUrl;
        }

        return null;
    }

    /**
     * 记录访问统计（异步）
     */
    private void recordAccess(String shortCode) {
        // 发送到 MQ 异步处理
        // 或使用 Redis HyperLogLog 统计 UV
        String statKey = "url:stat:" + shortCode;
        redisTemplate.opsForHyperLogLog().add(statKey, getClientIp());
        redisTemplate.opsForValue().increment("url:pv:" + shortCode);
    }

    private String md5(String input) {
        // MD5 实现
        return DigestUtils.md5Hex(input);
    }

    private String getClientIp() {
        // 获取客户端 IP
        return "unknown";
    }
}
```

**数据库表结构：**
```sql
CREATE TABLE short_url_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    short_code VARCHAR(16) NOT NULL UNIQUE,
    long_url VARCHAR(2048) NOT NULL,
    md5 VARCHAR(32) NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    expire_time DATETIME,
    status TINYINT DEFAULT 1,
    INDEX idx_md5 (md5),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE url_access_stat (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    short_code VARCHAR(16) NOT NULL,
    access_date DATE NOT NULL,
    pv BIGINT DEFAULT 0,
    uv BIGINT DEFAULT 0,
    UNIQUE KEY idx_short_date (short_code, access_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 8.3.3 优化方案

| 优化点 | 方案 |
|--------|------|
| **发号器** | Redis 自增 + 本地缓冲 |
| **存储** | MySQL 分库分表（按 short_code 分片） |
| **缓存** | 多级缓存（本地 + Redis） |
| **过期** | 定期清理过期短链接 |
| **统计** | HyperLogLog 统计 UV，异步落库 |

---

## 8.4 限流算法实现

### 8.4.1 固定窗口计数器

```java
public class FixedWindowRateLimiter {

    private final int limit;
    private final long windowMs;
    private final AtomicInteger counter;
    private final AtomicLong windowStart;

    public FixedWindowRateLimiter(int limit, long windowMs) {
        this.limit = limit;
        this.windowMs = windowMs;
        this.counter = new AtomicInteger(0);
        this.windowStart = new AtomicLong(System.currentTimeMillis());
    }

    public synchronized boolean tryAcquire() {
        long now = System.currentTimeMillis();
        long currentWindow = now / windowMs;
        long windowStartTime = currentWindow * windowMs;

        // 新窗口，重置计数
        if (windowStart.get() < windowStartTime) {
            counter.set(0);
            windowStart.set(windowStartTime);
        }

        // 检查是否超限
        if (counter.incrementAndGet() <= limit) {
            return true;
        }

        counter.decrementAndGet();
        return false;
    }
}
```

### 8.4.2 滑动窗口算法

```java
public class SlidingWindowRateLimiter {

    private final int windowSizeMs;
    private final int maxRequests;
    private final int slots;
    private final long[] timestamps;
    private final int[] counts;
    private int currentIndex;

    public SlidingWindowRateLimiter(int windowSizeMs, int maxRequests, int slots) {
        this.windowSizeMs = windowSizeMs;
        this.maxRequests = maxRequests;
        this.slots = slots;
        this.timestamps = new long[slots];
        this.counts = new int[slots];
        this.currentIndex = 0;
    }

    public synchronized boolean tryAcquire() {
        long now = System.currentTimeMillis();
        long windowStart = now - windowSizeMs;

        // 更新过期槽位
        for (int i = 0; i < slots; i++) {
            if (timestamps[i] < windowStart) {
                timestamps[i] = now;
                counts[i] = 0;
            }
        }

        // 统计窗口内请求数
        int totalRequests = 0;
        for (int i = 0; i < slots; i++) {
            if (timestamps[i] >= windowStart) {
                totalRequests += counts[i];
            }
        }

        // 检查是否超限
        if (totalRequests < maxRequests) {
            timestamps[currentIndex] = now;
            counts[currentIndex]++;
            currentIndex = (currentIndex + 1) % slots;
            return true;
        }

        return false;
    }
}
```

### 8.4.3 漏桶算法

```java
public class LeakBucketRateLimiter {

    private final int capacity;
    private final int leakRate;
    private int water;
    private long lastLeakTime;

    private final Lock lock = new ReentrantLock();

    public LeakBucketRateLimiter(int capacity, int leakRate) {
        this.capacity = capacity;
        this.leakRate = leakRate;
        this.water = 0;
        this.lastLeakTime = System.currentTimeMillis();
    }

    public boolean tryAcquire() {
        lock.lock();
        try {
            long now = System.currentTimeMillis();
            long timePassed = now - lastLeakTime;

            // 漏水
            int leakedWater = (int) (timePassed * leakRate / 1000);
            water = Math.max(0, water - leakedWater);
            lastLeakTime = now;

            // 加水
            if (water < capacity) {
                water++;
                return true;
            }

            return false;
        } finally {
            lock.unlock();
        }
    }
}
```

---

## 8.5 实践建议

### 面试准备要点

1. **明确需求**
   - 先问清楚系统规模（DAU、QPS、数据量）
   - 确认核心功能和非功能需求

2. **自顶向下**
   - 先画架构图，再深入细节
   - 分层设计：接入层 → 服务层 → 数据层

3. **考虑扩展**
   - 水平扩展能力
   - 数据分片策略

4. **兜底方案**
   - 降级策略
   - 监控告警

### 常见考点

| 考点 | 相关问题 |
|------|----------|
| 高并发 | 秒杀、抢票、秒杀 |
| 数据存储 | 海量数据、分库分表 |
| 一致性 | 分布式事务、最终一致 |
| 可用性 | 熔断、降级、限流 |
| 扩展性 | 微服务拆分、数据分片 |

---

**上一章**：[系统设计原则 ←](/java-learning/system-design-principles)
**下一章**：[项目经验总结 →](/java-learning/project-experience)
