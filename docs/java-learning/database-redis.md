---
order: 14
---

# Redis 核心原理

> 深入理解 Redis 数据结构、持久化、缓存策略与集群架构

## 一、数据结构

### 1.1 五种基础数据类型

#### String（字符串）

```bash
# 设置值
SET key value
SET key value EX 3600  # 同时设置过期时间
SETNX key value        # 不存在才设置

# 获取值
GET key

# 计数
INCR counter
INCRBY counter 10
DECR counter

# 追加
APPEND key value

# 批量操作
MSET key1 value1 key2 value2
MGET key1 key2
```

**应用场景**：
- 缓存对象
- 计数器
- 分布式锁
- 分布式 ID（INCR）

#### Hash（哈希）

```bash
# 设置字段
HSET user:1 name "张三" age 25

# 获取字段
HGET user:1 name
HGETALL user:1

# 判断字段是否存在
HEXISTS user:1 name

# 字段增减
HINCRBY user:1 age 1

# 删除字段
HDEL user:1 age
```

**应用场景**：
- 对象存储（比 String 节省内存）
- 购物车

#### List（列表）

```bash
# 左推入
LPUSH list a b c  # 结果: [c, b, a]

# 右推入
RPUSH list d e    # 结果: [c, b, a, d, e]

# 弹出
LPOP list         # 返回 c
RPOP list         # 返回 e

# 阻塞弹出
BLPOP list 5      # 等待最多 5 秒

# 范围查询
LRANGE list 0 -1  # 获取所有元素

# 获取长度
LLEN list
```

**应用场景**：
- 消息队列（LPUSH + BRPOP）
- 最新列表
- 时间线

#### Set（集合）

```bash
# 添加元素
SADD set a b c

# 获取所有元素
SMEMBERS set

# 判断是否存在
SISMEMBER set a

# 删除元素
SREM set a

# 集合运算
SUNION set1 set2    # 并集
SINTER set1 set2    # 交集
SDIFF set1 set2     # 差集

# 随机元素
SRANDMEMBER set 2   # 随机取 2 个
SPOP set            # 随机弹出一个
```

**应用场景**：
- 标签系统
- 共同关注
- 抽奖系统

#### ZSet（有序集合）

```bash
# 添加元素
ZADD rank 100 user1 200 user2 150 user3

# 获取排名（从小到大）
ZRANK rank user1    # 0

# 获取排名（从大到小）
ZREVRANK rank user2  # 0

# 范围查询
ZRANGE rank 0 2 WITHSCORES
ZREVRANGE rank 0 2 WITHSCORES

# 分数范围
ZRANGEBYSCORE rank 100 200

# 增加分数
ZINCRBY rank 50 user1

# 删除元素
ZREM rank user1
```

**应用场景**：
- 排行榜
- 延迟队列（score = 执行时间戳）
- 带权重的消息队列

### 1.2 底层数据结构

```
RedisObject
├── type (类型)
├── encoding (编码)
├── ptr (数据指针)
└── ...

编码类型与适用场景：
┌──────────────┬─────────────────────────────────────────┐
│ 编码类型      │ 适用数据类型                             │
├──────────────┼─────────────────────────────────────────┤
│ int          │ String (整数)                           │
│ embstr       │ String (短字符串 ≤44字节)               │
│ raw          │ String (长字符串)                       │
│ ht           │ Hash, Set                              │
│ ziplist      │ Hash, List, ZSet (小数据量)            │
│ quicklist    │ List (ziplist 链表)                    │
│ skiplist     │ ZSet                                   │
│ intset       │ Set (整数集合)                         │
└──────────────┴─────────────────────────────────────────┘
```

#### 跳表（Skip List）

ZSet 使用跳表实现有序存储：

```
Level 3:    1 ──────────────────────▶ 9 ────────────▶ NULL
            │                         │
Level 2:    1 ───────▶ 4 ────────────▶ 9 ────▶ 12 ──▶ NULL
            │         │               │       │
Level 1:    1 ──▶ 3 ──▶ 4 ──▶ 6 ─────▶ 9 ────▶ 12 ──▶ NULL
            │    │    │    │         │       │
Level 0:    1 ──▶ 3 ──▶ 4 ──▶ 6 ─────▶ 9 ────▶ 12 ──▶ NULL

查找 6: 从 Level 3 开始，逐层下降，O(logN)
```

**跳表特点**：
- 查找、插入、删除 O(logN)
- 实现简单，比红黑树更适合并发
- 支持范围查询

---

## 二、持久化机制

### 2.1 RDB（快照）

将某一时刻的内存数据保存到磁盘的快照文件。

```bash
# redis.conf 配置
save 900 1      # 900秒内至少1次修改触发
save 300 10     # 300秒内至少10次修改触发
save 60 10000   # 60秒内至少10000次修改触发

dbfilename dump.rdb
dir ./
```

**RDB 优缺点**：

| 优点 | 缺点 |
|------|------|
| 文件紧凑，适合备份 | 可能丢失最后一次快照后的数据 |
| 恢复速度快 | Fork 大数据集时可能阻塞 |
| 对性能影响小 | 不适合实时持久化 |

### 2.2 AOF（Append Only File）

记录所有写操作命令，追加到文件末尾。

```bash
# redis.conf 配置
appendonly yes
appendfilename "appendonly.aof"

# 同步策略
appendfsync always     # 每次写操作都同步（最安全，最慢）
appendfsync everysec   # 每秒同步一次（推荐）
appendfsync no         # 由操作系统决定（最快，可能丢数据）
```

**AOF 重写**：

```bash
# 触发重写条件
auto-aof-rewrite-percentage 100  # 文件大小比上次重写后增长100%
auto-aof-rewrite-min-size 64mb   # 文件至少64MB

# 手动触发
BGREWRITEAOF
```

**AOF 优缺点**：

| 优点 | 缺点 |
|------|------|
| 数据更安全，最多丢1秒数据 | 文件体积大 |
| 可读性好，方便分析 | 恢复速度比 RDB 慢 |
| 支持重写压缩 | 写入性能略低于 RDB |

### 2.3 RDB + AOF 混合持久化

```bash
# redis.conf 配置
aof-use-rdb-preamble yes
```

**工作流程**：
1. AOF 重写时，先写入 RDB 格式的数据
2. 重写期间的增量命令以 AOF 格式追加
3. 恢复时先加载 RDB 部分，再重放 AOF 部分

---

## 三、缓存问题与解决方案

### 3.1 缓存穿透

**问题**：查询不存在的数据，缓存无法命中，请求直达数据库。

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│ 请求    │───▶│ Redis   │───▶│ MySQL   │
│ key=null│     │ 返回null│     │ 也无数据 │
└─────────┘     └─────────┘     └─────────┘
     ▲
     │ 大量请求穿透到数据库
     └────────────────────────────┘
```

**解决方案**：

```java
// 1. 缓存空对象
public String get(String key) {
    String value = redis.get(key);
    if (value != null) {
        return "null".equals(value) ? null : value;
    }

    value = db.query(key);
    if (value == null) {
        redis.setex(key, 60, "null");  // 缓存空值，短过期
    } else {
        redis.setex(key, 3600, value);
    }
    return value;
}

// 2. 布隆过滤器
public String getWithBloomFilter(String key) {
    if (!bloomFilter.mightContain(key)) {
        return null;  // 一定不存在
    }

    String value = redis.get(key);
    if (value == null) {
        value = db.query(key);
        if (value != null) {
            redis.setex(key, 3600, value);
        }
    }
    return value;
}
```

### 3.2 缓存击穿

**问题**：热点 Key 过期，大量请求瞬间直达数据库。

**解决方案**：

```java
// 1. 互斥锁
public String getWithLock(String key) {
    String value = redis.get(key);
    if (value != null) {
        return value;
    }

    String lockKey = "lock:" + key;
    try {
        // 尝试获取分布式锁
        if (redis.setnx(lockKey, "1", 10, TimeUnit.SECONDS)) {
            // 双重检查
            value = redis.get(key);
            if (value != null) {
                return value;
            }

            // 查询数据库
            value = db.query(key);
            redis.setex(key, 3600, value);
        } else {
            // 等待后重试
            Thread.sleep(50);
            return getWithLock(key);
        }
    } finally {
        redis.del(lockKey);
    }
    return value;
}

// 2. 逻辑过期（不设置 TTL，过期时间存值里）
public String getWithLogicalExpire(String key) {
    String json = redis.get(key);
    if (json == null) {
        // 不存在则直接返回，让异步线程去加载
        return null;
    }

    RedisData data = JSON.parseObject(json, RedisData.class);
    if (data.getExpireTime().isAfter(LocalDateTime.now())) {
        return data.getValue();  // 未过期
    }

    // 已过期，异步刷新
    String lockKey = "lock:" + key;
    if (redis.setnx(lockKey, "1", 1, TimeUnit.SECONDS)) {
        executorService.submit(() -> {
            String newValue = db.query(key);
            RedisData newData = new RedisData(newValue, LocalDateTime.now().plusHours(1));
            redis.set(key, JSON.toJSONString(newData));
            redis.del(lockKey);
        });
    }

    return data.getValue();  // 返回旧数据
}

// 3. 热点数据永不过期
// 设置很长的过期时间，后台定时刷新
```

### 3.3 缓存雪崩

**问题**：大量 Key 同时过期，或 Redis 宕机。

**解决方案**：

```java
// 1. 过期时间加随机值
int expire = 3600 + new Random().nextInt(300);  // 1小时 + 随机0-5分钟

// 2. 多级缓存
// L1: 本地缓存 (Caffeine)
// L2: Redis
// L3: MySQL

@Service
public class MultiCacheService {

    @Autowired
    private LoadingCache<String, String> localCache;  // Caffeine

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    public String get(String key) {
        // L1 本地缓存
        String value = localCache.get(key);
        if (value != null) {
            return value;
        }

        // L2 Redis
        value = redisTemplate.opsForValue().get(key);
        if (value != null) {
            localCache.put(key, value);
            return value;
        }

        // L3 MySQL
        value = db.query(key);
        if (value != null) {
            redisTemplate.opsForValue().set(key, value, 1, TimeUnit.HOURS);
            localCache.put(key, value);
        }
        return value;
    }
}

// 3. Redis 高可用
// - 主从复制 + 哨兵
// - Redis Cluster
// - 限流降级
```

### 3.4 缓存一致性

```
更新策略：
1. 先更新数据库，再删除缓存（推荐）
2. 先删除缓存，再更新数据库（可能产生脏数据）
3. 先更新数据库，再更新缓存（并发问题）
```

```java
// 方案1: 先更新数据库，再删除缓存
@Transactional
public void update(String key, String value) {
    // 1. 更新数据库
    db.update(key, value);

    // 2. 删除缓存
    redis.del(key);
}

// 问题：如果删除失败，缓存是旧数据
// 解决：消息队列重试

// 方案2: 延迟双删
public void update(String key, String value) {
    // 1. 删除缓存
    redis.del(key);

    // 2. 更新数据库
    db.update(key, value);

    // 3. 延迟后再删除缓存
    executor.schedule(() -> redis.del(key), 500, TimeUnit.MILLISECONDS);
}

// 方案3: 订阅 Binlog（推荐）
// 使用 Canal 订阅 MySQL Binlog，异步删除缓存
```

---

## 四、分布式锁

### 4.1 Redis 分布式锁实现

```java
@Service
public class RedisDistributedLock {

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String LOCK_PREFIX = "lock:";
    private static final String UNLOCK_SCRIPT =
        "if redis.call('get', KEYS[1]) == ARGV[1] then " +
        "   return redis.call('del', KEYS[1]) " +
        "else " +
        "   return 0 " +
        "end";

    /**
     * 加锁
     * @param key 锁的 key
     * @param value 唯一标识（防止误删其他线程的锁）
     * @param expireTime 过期时间
     * @param timeUnit 时间单位
     * @return 是否加锁成功
     */
    public boolean tryLock(String key, String value, long expireTime, TimeUnit timeUnit) {
        String lockKey = LOCK_PREFIX + key;
        Boolean result = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, value, expireTime, timeUnit);
        return Boolean.TRUE.equals(result);
    }

    /**
     * 解锁 - Lua 脚本保证原子性
     */
    public boolean unlock(String key, String value) {
        String lockKey = LOCK_PREFIX + key;
        DefaultRedisScript<Long> script = new DefaultRedisScript<>(UNLOCK_SCRIPT, Long.class);
        Long result = redisTemplate.execute(script, Collections.singletonList(lockKey), value);
        return Long.valueOf(1).equals(result);
    }

    /**
     * 带重试的加锁
     */
    public boolean tryLockWithRetry(String key, String value, long expireTime,
                                     TimeUnit timeUnit, int retryTimes, long sleepMillis) {
        for (int i = 0; i < retryTimes; i++) {
            if (tryLock(key, value, expireTime, timeUnit)) {
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

### 4.2 Redisson 框架

```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
</dependency>
```

```java
@Service
public class RedissonLockService {

    @Autowired
    private RedissonClient redissonClient;

    public void doWork() {
        RLock lock = redissonClient.getLock("myLock");
        try {
            // 尝试加锁，等待 10 秒，锁自动过期时间 30 秒
            if (lock.tryLock(10, 30, TimeUnit.SECONDS)) {
                try {
                    // 执行业务逻辑
                    doSomething();
                } finally {
                    lock.unlock();
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    /**
     * 公平锁
     */
    public void fairLock() {
        RLock fairLock = redissonClient.getFairLock("fairLock");
        // ...
    }

    /**
     * 读写锁
     */
    public void readWriteLock() {
        RReadWriteLock rwLock = redissonClient.getReadWriteLock("rwLock");
        RLock readLock = rwLock.readLock();
        RLock writeLock = rwLock.writeLock();
        // ...
    }

    /**
     * 联锁（多个锁同时获取）
     */
    public void multiLock() {
        RLock lock1 = redissonClient.getLock("lock1");
        RLock lock2 = redissonClient.getLock("lock2");
        RLock multiLock = redissonClient.getMultiLock(lock1, lock2);
        // ...
    }
}
```

**Redisson 特性**：
- **看门狗机制**：自动续期，防止业务未完成锁过期
- **可重入锁**：同一线程可多次获取
- **公平锁**：按请求顺序获取
- **读写锁**：支持读写分离

---

## 五、集群模式

### 5.1 主从复制

```
┌─────────────────────────────────────────┐
│              Master (读写)               │
│          接收写请求，同步到 Slave         │
└──────────────────┬──────────────────────┘
                   │
         ┌─────────┼─────────┐
         ▼         ▼         ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ Slave 1 │ │ Slave 2 │ │ Slave 3 │
   │ (只读)  │ │ (只读)  │ │ (只读)  │
   └─────────┘ └─────────┘ └─────────┘
```

```bash
# slave 配置连接 master
replicaof <master-ip> <master-port>

# 或使用命令
REPLICAOF 192.168.1.100 6379
```

### 5.2 哨兵模式

自动故障转移：

```
┌─────────────────────────────────────────────────────────┐
│                    Sentinel 集群                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │Sentinel 1│  │Sentinel 2│  │Sentinel 3│              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │             │             │                     │
│       └─────────────┼─────────────┘                     │
│                     │ 监控 & 故障转移                    │
└─────────────────────┼───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  Redis 主从                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │  Master  │───▶│  Slave 1 │    │  Slave 2 │          │
│  └──────────┘    └──────────┘    └──────────┘          │
└─────────────────────────────────────────────────────────┘
```

```bash
# sentinel.conf
port 26379
sentinel monitor mymaster 192.168.1.100 6379 2
sentinel down-after-milliseconds mymaster 30000
sentinel parallel-syncs mymaster 1
sentinel failover-timeout mymaster 180000
```

**故障转移流程**：
1. Sentinel 检测到 Master 下线（主观下线）
2. 多个 Sentinel 确认（客观下线）
3. 选举 Leader Sentinel 执行故障转移
4. 从 Slave 中选举新 Master
5. 其他 Slave 复制新 Master
6. 通知客户端新 Master 地址

### 5.3 Redis Cluster

分布式集群，数据分片存储：

```
┌───────────────────────────────────────────────────────────────┐
│                      Redis Cluster                             │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    16384 个槽位                           │  │
│  │  [0-5460]    [5461-10922]    [10923-16383]              │  │
│  └───────┬──────────────┬────────────────┬──────────────────┘  │
│          │              │                │                     │
│    ┌─────▼─────┐  ┌─────▼─────┐    ┌─────▼─────┐              │
│    │  Master 1 │  │  Master 2 │    │  Master 3 │              │
│    │  槽 0-5460│  │槽 5461-   │    │槽 10923-  │              │
│    └─────┬─────┘  │  10922    │    │  16383    │              │
│          │        └─────┬─────┘    └─────┬─────┘              │
│    ┌─────▼─────┐  ┌─────▼─────┐    ┌─────▼─────┐              │
│    │  Slave 1  │  │  Slave 2  │    │  Slave 3  │              │
│    └───────────┘  └───────────┘    └───────────┘              │
└───────────────────────────────────────────────────────────────┘
```

```bash
# 集群配置
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000

# 创建集群
redis-cli --cluster create \
  192.168.1.101:6379 192.168.1.102:6379 192.168.1.103:6379 \
  192.168.1.104:6379 192.168.1.105:6379 192.168.1.106:6379 \
  --cluster-replicas 1
```

**数据分片原理**：

```java
// CRC16 算法计算 key 所属槽位
int slot = CRC16(key) % 16384;

// 使用 {} 控制相关 key 分配到同一槽位
// {user}:1 和 {user}:2 会被分配到同一槽位
```

---

## 六、性能优化

### 6.1 内存优化

```bash
# 1. 选择合适的数据结构
# 小对象使用 ziplist/intset 编码
hash-max-ziplist-entries 512
hash-max-ziplist-value 64

# 2. 设置过期时间
SET key value EX 3600

# 3. 内存淘汰策略
maxmemory 4gb
maxmemory-policy allkeys-lru  # LRU 淘汰所有键
# 其他策略：
# - volatile-lru: 只淘汰设置了过期时间的键
# - allkeys-lfu: LFU 淘汰
# - volatile-ttl: 淘汰即将过期的键
# - noeviction: 不淘汰，内存满时拒绝写入

# 4. 使用连接池
# Lettuce/Jedis 连接池配置
```

### 6.2 命令优化

```java
// 1. 批量操作替代多次单操作
// ❌ 多次网络往返
for (String key : keys) {
    redis.get(key);
}

// ✅ 批量获取
List<String> values = redis.mget(keys.toArray(new String[0]));

// 2. 使用 Pipeline
List<Object> results = redisTemplate.executePipelined(
    (RedisCallback<Object>) connection -> {
        for (String key : keys) {
            connection.get(key.getBytes());
        }
        return null;
    }
);

// 3. 使用 Lua 脚本保证原子性
String script = "local val = redis.call('get', KEYS[1]) " +
                "if val then " +
                "   redis.call('set', KEYS[1], val + ARGV[1]) " +
                "   return val + ARGV[1] " +
                "end " +
                "return nil";
redisTemplate.execute(new DefaultRedisScript<>(script, Long.class),
                      Collections.singletonList("counter"), "1");

// 4. 避免大 Key
// ❌ 单个 Key 的 Value 过大
HSET bigKey field1 value1 ... field10000 value10000

// ✅ 拆分
HSET smallKey1 field1 value1 ... field100 value100
HSET smallKey2 field101 value101 ... field200 value200
```

### 6.3 慢查询优化

```bash
# 开启慢查询日志
slowlog-log-slower-than 10000  # 超过 10ms 记录
slowlog-max-len 128            # 最多保留 128 条

# 查看慢查询
SLOWLOG GET 10

# 常见慢操作
KEYS *        # 生产环境禁止使用，改用 SCAN
HGETALL       # 大 Hash 会慢
SORT          # 复杂度高
```

---

## 七、面试常见问题

### Q1: Redis 为什么快？

1. **内存存储**：数据在内存中，读写速度快
2. **单线程模型**：避免上下文切换和锁竞争
3. **IO 多路复用**：epoll 实现高并发连接处理
4. **高效数据结构**：跳表、压缩列表等

### Q2: Redis 是单线程的吗？

- **核心处理**：命令执行是单线程
- **Redis 4.0+**：异步删除（UNLINK、FLUSHDB ASYNC）
- **Redis 6.0+**：多线程处理网络 IO

### Q3: 如何保证 Redis 高可用？

1. **主从复制**：数据冗余
2. **哨兵模式**：自动故障转移
3. **Redis Cluster**：分片 + 高可用

### Q4: 缓存和数据库一致性怎么保证？

1. **先更新数据库，再删除缓存**
2. **延迟双删**
3. **订阅 Binlog 异步删缓存**
4. **强一致性场景用分布式事务或直接查库**

### Q5: Redis 如何实现消息队列？

```bash
# 1. List 实现简单队列
LPUSH queue message
BRPOP queue 0  # 阻塞消费

# 2. Pub/Sub 发布订阅
SUBSCRIBE channel
PUBLISH channel message

# 3. Stream 消息队列（Redis 5.0+）
XADD mystream * field value
XREAD COUNT 2 STREAMS mystream $
```

---

*最后更新时间：2024年*