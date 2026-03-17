---
order: 8
---

# 六、分布式锁

分布式锁用于控制分布式系统下多个进程对共享资源的互斥访问。

## 6.13 分布式锁的核心要求

1. **互斥性**：同一时刻只能有一个客户端持有锁
2. **防死锁**：锁必须有自动失效机制
3. **可重入**：同一客户端可重复获取已持有的锁
4. **高可用**：支持集群部署，避免单点故障
5. **高性能**：加锁/解锁开销低

---

## 6.14 基于 Redis 实现分布式锁

### 基础实现

```java
@Component
public class RedisDistributedLock {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    private static final String UUID = UUID.randomUUID().toString();

    /**
     * 尝试获取锁
     * @param lockKey 锁的 key
     * @param expireTime 锁的过期时间（毫秒）
     * @return 是否获取成功
     */
    public boolean tryLock(String lockKey, long expireTime) {
        String clientId = UUID + ":" + Thread.currentThread().getId();

        // SETNX 命令：不存在则设置
        Boolean success = redisTemplate.opsForValue()
            .setIfAbsent(lockKey, clientId, expireTime, TimeUnit.MILLISECONDS);

        return Boolean.TRUE.equals(success);
    }

    /**
     * 释放锁
     * @param lockKey 锁的 key
     */
    public void unlock(String lockKey) {
        String script = """
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
            else
                return 0
            end
        """;

        String clientId = UUID + ":" + Thread.currentThread().getId();
        RedisScript<Long> redisScript = RedisScript.of(script, Long.class);

        redisTemplate.execute(redisScript, Collections.singletonList(lockKey), clientId);
    }

    /**
     * 带超时的尝试获取锁
     */
    public boolean tryLock(String lockKey, long waitTime, long expireTime)
            throws InterruptedException {

        long deadline = System.currentTimeMillis() + waitTime;
        String clientId = UUID + ":" + Thread.currentThread().getId();

        while (System.currentTimeMillis() < deadline) {
            if (tryLock(lockKey, expireTime)) {
                return true;
            }
            // 自旋等待
            Thread.sleep(50);
        }
        return false;
    }
}
```

### 使用示例

```java
@Service
public class OrderService {

    @Autowired
    private RedisDistributedLock distributedLock;

    public void createOrder(OrderRequest request) {
        String lockKey = "order:lock:" + request.getUserId();

        try {
            // 尝试获取锁，等待 5 秒，过期时间 30 秒
            if (distributedLock.tryLock(lockKey, 5000, 30000)) {
                // 执行业务逻辑
                doCreateOrder(request);
            } else {
                throw new BusinessException("获取锁失败，系统繁忙");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException("获取锁被中断");
        } finally {
            distributedLock.unlock(lockKey);
        }
    }
}
```

### RedLock 算法（Redisson 实现）

```java
@Configuration
public class RedissonConfig {

    @Bean
    public RedissonClient redissonClient() {
        // 集群配置
        Config config = new Config();
        config.useClusterServers()
            .setScanInterval(2000)
            .addNodeAddress(
                "redis://192.168.1.100:6379",
                "redis://192.168.1.101:6379",
                "redis://192.168.1.102:6379"
            );
        return Redisson.create(config);
    }
}

@Service
public class OrderService {

    @Autowired
    private RedissonClient redissonClient;

    public void createOrder(OrderRequest request) {
        RLock lock = redissonClient.getLock("order:lock:" + request.getUserId());

        try {
            // 尝试获取锁，等待 5 秒，自动过期时间 30 秒
            if (lock.tryLock(5, 30, TimeUnit.SECONDS)) {
                doCreateOrder(request);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
```

### Redis 锁的优缺点

| 优点 | 缺点 |
|------|------|
| 性能好，延迟低 | 主从切换可能丢失锁 |
| 实现简单 | 需要处理锁续期 |
| 支持 RedLock 高可用 | 时钟依赖问题 |

---

## 6.15 基于 ZooKeeper 实现分布式锁

### 实现原理

```
ZooKeeper 节点结构：
/locks
  ├── lock-0000000001
  ├── lock-0000000002  ← 当前持有锁（最小序号）
  ├── lock-0000000003
  └── lock-0000000004
```

### 代码实现

```java
@Component
public class ZooKeeperDistributedLock implements Watcher {

    private ZooKeeper zooKeeper;
    private String lockPath = "/locks";
    private String currentLockPath;
    private CountDownLatch latch = new CountDownLatch(1);
    private CountDownLatch waitLatch = new CountDownLatch(1);

    @PostConstruct
    public void init() throws Exception {
        zooKeeper = new ZooKeeper(
            "192.168.1.100:2181",
            5000,
            this
        );

        // 创建锁根节点
        if (zooKeeper.exists(lockPath, false) == null) {
            zooKeeper.create(lockPath, "".getBytes(),
                ZooDefs.Ids.OPEN_ACL_UNSAFE,
                CreateMode.PERSISTENT);
        }
    }

    /**
     * 获取锁
     */
    public void lock() throws Exception {
        // 创建临时顺序节点
        currentLockPath = zooKeeper.create(
            lockPath + "/lock-",
            "".getBytes(),
            ZooDefs.Ids.OPEN_ACL_UNSAFE,
            CreateMode.EPHEMERAL_SEQUENTIAL
        );

        // 获取所有子节点
        List<String> children = zooKeeper.getChildren(lockPath, false);
        Collections.sort(children);

        // 判断是否是最小节点
        String minNode = lockPath + "/" + children.get(0);
        if (currentLockPath.equals(minNode)) {
            // 当前节点是最小节点，获得锁
            return;
        }

        // 监听前一个节点
        String previousNode = getPreviousNode(currentLockPath, children);
        Stat stat = zooKeeper.exists(previousNode, true);
        if (stat == null) {
            // 前一个节点已删除，获得锁
            return;
        }

        // 等待前一个节点被删除
        waitLatch.await();
    }

    /**
     * 释放锁
     */
    public void unlock() throws Exception {
        if (currentLockPath != null) {
            zooKeeper.delete(currentLockPath, -1);
            currentLockPath = null;
        }
    }

    @Override
    public void process(WatchedEvent event) {
        if (event.getType() == Event.EventType.NodeDeleted) {
            waitLatch.countDown();
        }
    }

    private String getPreviousNode(String currentPath, List<String> children) {
        String currentNode = currentPath.substring(lockPath.length() + 1);
        for (int i = 0; i < children.size(); i++) {
            if (children.get(i).equals(currentNode)) {
                if (i > 0) {
                    return lockPath + "/" + children.get(i - 1);
                }
            }
        }
        return null;
    }
}
```

### 使用 Curator 简化实现

```java
@Configuration
public class CuratorConfig {

    @Bean
    public CuratorFramework curatorFramework() {
        CuratorFrameworkFactory.Builder builder = CuratorFrameworkFactory.builder()
            .connectString("192.168.1.100:2181")
            .retryPolicy(new ExponentialBackoffRetry(1000, 3))
            .sessionTimeoutMs(60000)
            .connectionTimeoutMs(15000);

        return builder.build();
    }

    @Bean
    public InterProcessMutex distributedLock(CuratorFramework curatorFramework) {
        return new InterProcessMutex(curatorFramework, "/locks/distributed-lock");
    }
}

@Service
public class OrderService {

    @Autowired
    private InterProcessMutex distributedLock;

    public void createOrder(OrderRequest request) {
        try {
            // 获取锁
            distributedLock.acquire();

            // 执行业务逻辑
            doCreateOrder(request);

        } finally {
            // 释放锁
            distributedLock.release();
        }
    }
}
```

### ZooKeeper 锁的优缺点

| 优点 | 缺点 |
|------|------|
| 强一致性 | 性能较 Redis 低 |
| 无需处理锁续期 | 连接数有限制 |
| 天然支持临时节点 | 实现复杂度较高 |

---

## 6.16 基于数据库实现分布式锁

### 唯一索引方案

```java
@Component
public class DatabaseDistributedLock {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 获取锁
     */
    public boolean tryLock(String lockKey, String ownerId) {
        try {
            String sql = "INSERT INTO distributed_lock (lock_key, owner_id, expire_time) " +
                        "VALUES (?, ?, ?)";
            Date expireTime = new Date(System.currentTimeMillis() + 30000);

            int rows = jdbcTemplate.update(sql, lockKey, ownerId, expireTime);
            return rows > 0;
        } catch (DuplicateKeyException e) {
            // 唯一索引冲突，锁已被占用
            return false;
        }
    }

    /**
     * 释放锁
     */
    public void unlock(String lockKey, String ownerId) {
        String sql = "DELETE FROM distributed_lock WHERE lock_key = ? AND owner_id = ?";
        jdbcTemplate.update(sql, lockKey, ownerId);
    }

    /**
     * 续期锁
     */
    public boolean renewLock(String lockKey, String ownerId) {
        String sql = "UPDATE distributed_lock SET expire_time = ? " +
                    "WHERE lock_key = ? AND owner_id = ?";
        Date newExpireTime = new Date(System.currentTimeMillis() + 30000);

        int rows = jdbcTemplate.update(sql, newExpireTime, lockKey, ownerId);
        return rows > 0;
    }
}
```

**数据库表结构：**
```sql
CREATE TABLE distributed_lock (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    lock_key VARCHAR(128) NOT NULL,
    owner_id VARCHAR(64) NOT NULL,
    expire_time DATETIME NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_lock_key (lock_key),
    KEY idx_expire_time (expire_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分布式锁表';
```

### 乐观锁方案

```java
@Component
public class OptimisticLock {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public boolean tryLock(String lockKey, String ownerId) {
        String sql = "UPDATE distributed_lock SET owner_id = ?, version = version + 1 " +
                    "WHERE lock_key = ? AND (owner_id IS NULL OR expire_time < NOW())";

        int rows = jdbcTemplate.update(sql, ownerId, lockKey);
        return rows > 0;
    }
}
```

### 数据库锁的优缺点

| 优点 | 缺点 |
|------|------|
| 实现简单 | 性能最差 |
| 依赖已有数据库 | 连接资源有限 |
| 易于理解和维护 | 单点故障风险 |

---

## 6.17 三种方案对比

| 对比项 | Redis | ZooKeeper | 数据库 |
|--------|-------|-----------|--------|
| **一致性** | 最终一致 | 强一致 | 强一致 |
| **性能** | 高 | 中 | 低 |
| **可用性** | 高 | 中 | 低 |
| **实现复杂度** | 低 | 中 | 低 |
| **锁续期** | 需要 | 不需要 | 需要 |
| **适用场景** | 高并发 | 强一致 | 低频场景 |

---

## 6.18 实践建议

### 选型建议

1. **高并发、低延迟场景** → Redis（Redisson）
2. **强一致性要求** → ZooKeeper（Curator）
3. **简单场景、已有数据库** → 数据库唯一索引

### 注意事项

1. **避免死锁**
   - 设置合理的超时时间
   - 实现锁的自动失效机制

2. **可重入性**
   - 记录持有锁的线程 ID 和重入次数
   - 同一线程可重复获取锁

3. **锁的粒度**
   - 锁粒度不宜过大（影响并发）
   - 锁粒度不宜过小（失去保护意义）

4. **异常处理**
   - finally 块中释放锁
   - 捕获中断异常

5. **监控告警**
   - 记录获取锁失败次数
   - 监控锁持有时间

---

**上一章**：[分布式组件 ←](/java-learning/distributed-components)
