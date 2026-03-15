---
order: 13
---

# MySQL 核心原理

> 深入理解 MySQL 索引、事务、锁机制与性能优化

## 一、索引原理

### 1.1 B+树结构

MySQL InnoDB 使用 **B+树** 作为索引结构，具有以下特点：

```
                                    ┌─────────────────┐
                                    │   Root Node     │
                                    │  [20, 40, 60]   │
                                    └────────┬────────┘
                        ┌──────────────────┼──────────────────┐
                        ▼                  ▼                  ▼
                ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
                │ [10, 15, 18]  │  │ [25, 30, 35]  │  │ [45, 50, 55]  │
                └───────┬───────┘  └───────┬───────┘  └───────┬───────┘
                        │                  │                  │
                        ▼                  ▼                  ▼
                ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
                │ Leaf Node     │  │ Leaf Node     │  │ Leaf Node     │
                │ (数据指针)     │  │ (数据指针)     │  │ (数据指针)     │
                └───────┬───────┘  └───────┬───────┘  └───────┬───────┘
                        └──────────────────┴──────────────────┘
                                    (链表连接)
```

#### B+树 vs B树

| 特性 | B树 | B+树 |
|------|-----|------|
| 数据存储 | 所有节点都存数据 | 只有叶子节点存数据 |
| 叶子节点 | 独立存在 | 用链表连接，便于范围查询 |
| 查询效率 | 不稳定（1~h） | 稳定（都是h） |
| 范围查询 | 需要中序遍历 | 直接遍历链表 |
| 单节点存储 | 较少（存数据） | 较多（只存键） |

### 1.2 索引类型

#### 聚簇索引

**聚簇索引**：数据按主键顺序存储，叶子节点就是数据页。

```sql
-- InnoDB 表数据按主键组织存储
CREATE TABLE users (
    id INT PRIMARY KEY,      -- 聚簇索引
    name VARCHAR(50),
    age INT
);
```

#### 非聚簇索引（二级索引）

**二级索引**：叶子节点存储的是主键值，需要回表查询。

```
┌─────────────────────────────────────────────────────────────┐
│  二级索引 (name)                    聚簇索引 (id)           │
│  ┌─────────────────┐              ┌─────────────────┐      │
│  │ name  │ 主键id   │              │ id  │ 完整数据   │      │
│  ├─────────────────┤              ├─────────────────┤      │
│  │ '张三' │  1     │──回表查询──▶ │  1  │ 张三,25... │      │
│  │ '李四' │  3     │──回表查询──▶ │  3  │ 李四,30... │      │
│  └─────────────────┘              └─────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

```sql
-- 创建二级索引
CREATE INDEX idx_name ON users(name);

-- 查询过程：先查二级索引，再回表
SELECT * FROM users WHERE name = '张三';
```

#### 联合索引

**联合索引**：多个列组成的索引，遵循 **最左前缀原则**。

```sql
-- 联合索引
CREATE INDEX idx_name_age ON users(name, age);

-- 可以命中索引
WHERE name = '张三'
WHERE name = '张三' AND age = 25
WHERE name = '张三' ORDER BY age

-- 无法命中索引
WHERE age = 25                    -- 缺少最左列
WHERE name = '张三' OR age = 25   -- OR 破坏索引
```

### 1.3 索引优化原则

```sql
-- 1. 选择区分度高的列
SELECT COUNT(DISTINCT column) / COUNT(*) FROM table;
-- 区分度越接近 1 越好

-- 2. 覆盖索引避免回表
CREATE INDEX idx_covering ON orders(user_id, status, create_time);
SELECT user_id, status FROM orders WHERE user_id = 100 AND status = 1;
-- 不需要回表

-- 3. 前缀索引（长字符串）
CREATE INDEX idx_email ON users(email(10));

-- 4. 避免索引失效
-- ❌ 索引列参与计算
WHERE YEAR(create_time) = 2024
-- ✅ 范围查询
WHERE create_time >= '2024-01-01' AND create_time < '2025-01-01'

-- ❌ 使用函数
WHERE UPPER(name) = 'ZHANG'
-- ✅ 直接比较
WHERE name = 'Zhang'

-- ❌ 隐式类型转换
WHERE phone = 13800138000      -- phone 是 VARCHAR
-- ✅ 字符串比较
WHERE phone = '13800138000'

-- ❌ LIKE 左模糊
WHERE name LIKE '%张%'
-- ✅ 右模糊
WHERE name LIKE '张%'

-- ❌ 使用 NOT、!=、<>、IS NOT NULL
WHERE status != 1
-- ✅ 改写为 IN
WHERE status IN (0, 2, 3)
```

---

## 二、事务与隔离级别

### 2.1 ACID 特性

| 特性 | 说明 |
|------|------|
| **A**tomicity（原子性） | 事务是不可分割的工作单位，要么全部完成，要么全部不完成 |
| **C**onsistency（一致性） | 事务必须使数据库从一个一致性状态变换到另一个一致性状态 |
| **I**solation（隔离性） | 多个事务并发执行时，一个事务的执行不应影响其他事务的执行 |
| **D**urability（持久性） | 一个事务一旦提交，它对数据库中数据的改变就是永久性的 |

### 2.2 隔离级别

```
隔离级别              脏读    不可重复读    幻读    并发性能
─────────────────────────────────────────────────────────
READ UNCOMMITTED      ✓         ✓          ✓       最高
READ COMMITTED        ✗         ✓          ✓       较高
REPEATABLE READ       ✗         ✗          ✓*      较低  (MySQL 默认)
SERIALIZABLE          ✗         ✗          ✗       最低

* MySQL InnoDB 通过 MVCC + Next-Key Lock 解决了幻读
```

#### 脏读、不可重复读、幻读

```sql
-- 脏读：读到其他事务未提交的数据
-- 事务 A                          事务 B
UPDATE users SET age=30 WHERE id=1;
                                   SELECT age FROM users WHERE id=1;  -- 读到 30
ROLLBACK;
                                   -- 读到的 30 是脏数据

-- 不可重复读：同一事务内两次读取结果不同（修改导致）
-- 事务 A                          事务 B
SELECT age FROM users WHERE id=1;  -- age=25
                                   UPDATE users SET age=30 WHERE id=1;
                                   COMMIT;
SELECT age FROM users WHERE id=1;  -- age=30，两次读取不一致

-- 幻读：同一事务内两次读取记录数不同（插入/删除导致）
-- 事务 A                          事务 B
SELECT * FROM users WHERE age<30;  -- 2条记录
                                   INSERT INTO users VALUES(3,'王五',25);
                                   COMMIT;
SELECT * FROM users WHERE age<30;  -- 3条记录，多了"幻影"
```

### 2.3 事务隔离实现

```sql
-- 查看当前隔离级别
SELECT @@transaction_isolation;

-- 设置隔离级别
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 事务控制
START TRANSACTION;
-- 或 BEGIN;

COMMIT;    -- 提交
ROLLBACK;  -- 回滚

-- 保存点
SAVEPOINT savepoint_name;
ROLLBACK TO savepoint_name;
```

---

## 三、MVCC 机制

### 3.1 核心概念

**MVCC（Multi-Version Concurrency Control，多版本并发控制）** 是 InnoDB 实现高并发的关键机制。

#### 版本链

每条数据都有两个隐藏列：
- `DB_TRX_ID`：最后插入或更新该行的事务 ID
- `DB_ROLL_PTR`：回滚指针，指向 undo log 中的旧版本

```
当前数据                          Undo Log
┌─────────────────────┐
│ id=1, name='张三'    │
│ DB_TRX_ID=100       │
│ DB_ROLL_PTR ────────┼───▶ ┌─────────────────────┐
└─────────────────────┘     │ id=1, name='李四'    │
                            │ DB_TRX_ID=99        │
                            │ DB_ROLL_PTR ────────┼───▶ ┌─────────────────────┐
                            └─────────────────────┘     │ id=1, name='王五'    │
                                                        │ DB_TRX_ID=98        │
                                                        └─────────────────────┘
```

#### Read View

Read View 决定事务能看到哪个版本的数据：

```java
// Read View 核心字段
class ReadView {
    long m_ids;           // 创建 Read View 时活跃的事务 ID 列表
    long m_min_trx_id;    // 活跃事务中最小的事务 ID
    long m_max_trx_id;    // 预分配给下一个事务的 ID
    long m_creator_trx_id;// 创建该 Read View 的事务 ID
}

// 可见性判断
boolean isVisible(trx_id) {
    if (trx_id == m_creator_trx_id) {
        return true;  // 自己修改的，可见
    }
    if (trx_id < m_min_trx_id) {
        return true;  // 事务已提交，可见
    }
    if (trx_id >= m_max_trx_id) {
        return false; // 事务在 Read View 之后开启，不可见
    }
    if (m_ids.contains(trx_id)) {
        return false; // 事务未提交，不可见
    }
    return true;      // 事务已提交，可见
}
```

### 3.2 RC vs RR 的 MVCC 差异

| 隔离级别 | Read View 生成时机 |
|----------|-------------------|
| READ COMMITTED | 每次查询都生成新的 Read View |
| REPEATABLE READ | 只在事务第一次查询时生成 Read View |

```sql
-- RC 隔离级别下
-- 事务 A (trx_id=100)           事务 B (trx_id=101)
SELECT * FROM t WHERE id=1;     -- 生成 Read View，age=25
                                UPDATE t SET age=30 WHERE id=1;
                                COMMIT;
SELECT * FROM t WHERE id=1;     -- 重新生成 Read View，age=30

-- RR 隔离级别下
-- 事务 A (trx_id=100)           事务 B (trx_id=101)
SELECT * FROM t WHERE id=1;     -- 生成 Read View，age=25
                                UPDATE t SET age=30 WHERE id=1;
                                COMMIT;
SELECT * FROM t WHERE id=1;     -- 复用 Read View，age=25（一致）
```

---

## 四、锁机制

### 4.1 锁类型

```
MySQL 锁
├── 全局锁
│   └── FTWRL（Flush tables with read lock）
├── 表级锁
│   ├── 表锁（LOCK TABLES）
│   ├── 元数据锁（MDL）
│   ├── 意向锁（IS/IX）
│   └── AUTO-INC 锁
└── 行级锁（InnoDB）
    ├── Record Lock（记录锁）
    ├── Gap Lock（间隙锁）
    └── Next-Key Lock（临键锁 = Record + Gap）
```

### 4.2 行锁详解

#### Record Lock

锁定单条索引记录。

```sql
-- 记录锁，锁住 id=1 的记录
SELECT * FROM users WHERE id = 1 FOR UPDATE;
```

#### Gap Lock

锁定索引记录之间的间隙，防止幻读。

```sql
-- 假设 users 表有 id: 1, 5, 10
-- 间隙锁锁定 (1, 5) 和 (5, 10)
SELECT * FROM users WHERE id > 1 AND id < 10 FOR UPDATE;

-- 其他事务无法插入 id=2,3,4,6,7,8,9
INSERT INTO users VALUES(3, 'test');  -- 阻塞
```

#### Next-Key Lock

Record Lock + Gap Lock，锁定记录及前面的间隙。

```sql
-- Next-Key Lock，锁定 (-∞, 1], (1, 5], (5, 10]
SELECT * FROM users WHERE id <= 5 FOR UPDATE;
```

### 4.3 锁兼容性矩阵

```
              │  IS   │  IX   │  S    │  X    │
────────────────────────────────────────────────
IS            │  ✓    │  ✓    │  ✓    │  ✗    │
IX            │  ✓    │  ✓    │  ✗    │  ✗    │
S (共享锁)     │  ✓    │  ✗    │  ✓    │  ✗    │
X (排他锁)     │  ✗    │  ✗    │  ✗    │  ✗    │
```

### 4.4 加锁语句

```sql
-- 共享锁（S锁）
SELECT * FROM users WHERE id = 1 LOCK IN SHARE MODE;
SELECT * FROM users WHERE id = 1 FOR SHARE;  -- MySQL 8.0+

-- 排他锁（X锁）
SELECT * FROM users WHERE id = 1 FOR UPDATE;

-- 当前读 vs 快照读
-- 快照读：普通 SELECT，读取 MVCC 版本
SELECT * FROM users WHERE id = 1;

-- 当前读：加锁读取最新版本
SELECT * FROM users WHERE id = 1 FOR UPDATE;
UPDATE users SET name = 'test' WHERE id = 1;
DELETE FROM users WHERE id = 1;
```

### 4.5 死锁与解决

```sql
-- 死锁场景
-- 事务 A                        事务 B
UPDATE t SET x=1 WHERE id=1;
                                UPDATE t SET x=2 WHERE id=2;
UPDATE t SET x=3 WHERE id=2;    -- 等待 B 释放 id=2 的锁
                                UPDATE t SET x=4 WHERE id=1;  -- 等待 A 释放 id=1 的锁
                                -- 死锁！

-- 查看死锁信息
SHOW ENGINE INNODB STATUS;

-- 查看当前锁
SELECT * FROM information_schema.INNODB_LOCKS;
SELECT * FROM performance_schema.data_locks;  -- MySQL 8.0+

-- 预防死锁
-- 1. 按固定顺序访问表和行
-- 2. 大事务拆小事务
-- 3. 降低隔离级别
-- 4. 合理设计索引
```

---

## 五、SQL 优化

### 5.1 EXPLAIN 分析

```sql
EXPLAIN SELECT * FROM users WHERE name = '张三';

-- 重要字段
id             -- 执行顺序（越大越先执行）
select_type    -- 查询类型（SIMPLE, PRIMARY, SUBQUERY, DERIVED）
type           -- 访问类型（性能从好到差）
table          -- 表名
possible_keys  -- 可能使用的索引
key            -- 实际使用的索引
key_len        -- 使用的索引长度
rows           -- 预估扫描行数
Extra          -- 额外信息
```

#### type 访问类型（性能排序）

```
system > const > eq_ref > ref > range > index > ALL

system   -- 单行数据（系统表）
const    -- 主键/唯一索引等值查询，最多一条
eq_ref   -- 连接查询，使用主键或非空唯一索引
ref      -- 非唯一索引等值查询
range    -- 索引范围扫描（>, <, BETWEEN, IN）
index    -- 全索引扫描
ALL      -- 全表扫描（需要优化）
```

#### Extra 重要信息

```sql
Using index           -- 覆盖索引，不需要回表
Using where           -- 使用 WHERE 过滤
Using temporary       -- 使用临时表（需要优化）
Using filesort        -- 文件排序（需要优化）
Using index condition -- ICP 索引条件下推
```

### 5.2 索引优化案例

```sql
-- 案例1：避免全表扫描
-- ❌
EXPLAIN SELECT * FROM orders WHERE YEAR(create_time) = 2024;
-- type: ALL, key: NULL

-- ✅
CREATE INDEX idx_create_time ON orders(create_time);
EXPLAIN SELECT * FROM orders WHERE create_time >= '2024-01-01' AND create_time < '2025-01-01';
-- type: range, key: idx_create_time

-- 案例2：覆盖索引优化
-- ❌ 需要回表
EXPLAIN SELECT * FROM orders WHERE user_id = 100 AND status = 1;
-- Extra: NULL

-- ✅ 覆盖索引
CREATE INDEX idx_user_status ON orders(user_id, status, id);
EXPLAIN SELECT id, user_id, status FROM orders WHERE user_id = 100 AND status = 1;
-- Extra: Using index

-- 案例3：最左前缀
CREATE INDEX idx_a_b_c ON t(a, b, c);

-- ✅ 可以使用索引
WHERE a = 1
WHERE a = 1 AND b = 2
WHERE a = 1 AND b = 2 AND c = 3
WHERE a = 1 AND c = 3  -- 部分使用（只用 a）

-- ❌ 无法使用索引
WHERE b = 2
WHERE c = 3
WHERE b = 2 AND c = 3
```

### 5.3 慢查询优化

```sql
-- 开启慢查询日志
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;  -- 超过1秒记录
SET GLOBAL log_queries_not_using_indexes = ON;

-- 查看慢查询配置
SHOW VARIABLES LIKE '%slow_query%';

-- 使用 mysqldumpslow 分析
mysqldumpslow -s t -t 10 /var/log/mysql/slow.log
-- -s t: 按查询时间排序
-- -t 10: 显示前10条
```

### 5.4 分页优化

```sql
-- ❌ 传统分页（越往后越慢）
SELECT * FROM orders ORDER BY id LIMIT 1000000, 10;

-- ✅ 延迟关联
SELECT o.* FROM orders o
INNER JOIN (SELECT id FROM orders ORDER BY id LIMIT 1000000, 10) t
ON o.id = t.id;

-- ✅ 记录上次最大ID
SELECT * FROM orders WHERE id > 1000000 ORDER BY id LIMIT 10;
```

---

## 六、分库分表

### 6.1 分库 vs 分表

| 方式 | 解决问题 | 复杂度 |
|------|----------|--------|
| 垂直分库 | 业务耦合、连接数限制 | 低 |
| 垂直分表 | 单表字段过多 | 低 |
| 水平分库 | 单库 QPS 过高 | 高 |
| 水平分表 | 单表数据量过大 | 高 |

### 6.2 分片策略

#### 哈希分片

```java
// 根据 user_id 取模
int shardIndex = userId % shardCount;
// 数据分布均匀，但扩容困难
```

#### 范围分片

```java
// 根据时间或 ID 范围
// 2024-01: shard_0
// 2024-02: shard_1
// 范围查询友好，但可能数据倾斜
```

#### 一致性哈希

```java
// 使用一致性哈希环
// 扩容时只需迁移部分数据
int shardIndex = consistentHash(userId, shardCount);
```

### 6.3 主键设计

```sql
-- ❌ 自增 ID（分库后冲突）
id INT AUTO_INCREMENT

-- ✅ 雪花算法（Snowflake）
id BIGINT  -- 时间戳 + 机器ID + 序列号

-- ✅ UUID（无序，索引效率低）
id VARCHAR(36)

-- ✅ 号段模式（Leaf）
-- 从中心服务获取 ID 号段，本地分配
```

### 6.4 跨库问题

```sql
-- 跨库 JOIN：应用层组装
-- 先查分片1，再查分片2，内存合并

-- 跨库事务：分布式事务
-- Seata、XA、TCC、本地消息表

-- 跨库排序/分页：冗余 + 统一表
-- 维护一张全量索引表
```

---

## 七、主从复制与读写分离

### 7.1 主从复制原理

```
┌─────────────────────────────────────────────────────────────────┐
│                        Master                                    │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Binlog     │◀───│ 事务提交     │◀───│ 执行 SQL    │         │
│  │  (Binary Log)│    │             │    │             │         │
│  └──────┬──────┘    └─────────────┘    └─────────────┘         │
└─────────┼───────────────────────────────────────────────────────┘
          │ Binlog Dump Thread
          ▼
┌─────────┴───────────────────────────────────────────────────────┐
│                        Slave                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ Relay Log   │◀───│ I/O Thread  │◀───│ 接收 Binlog │         │
│  └──────┬──────┘    └─────────────┘    └─────────────┘         │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐    ┌─────────────┐                             │
│  │  执行 SQL   │◀───│ SQL Thread  │                             │
│  │             │    │             │                             │
│  └─────────────┘    └─────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 复制模式

```sql
-- 异步复制（默认）
-- Master 不等待 Slave 确认，性能高但可能丢数据

-- 半同步复制
-- Master 等待至少一个 Slave 确认
SET GLOBAL rpl_semi_sync_master_enabled = 1;

-- 全同步复制
-- Master 等待所有 Slave 确认，一致性最高但性能最低
```

### 7.3 主从延迟问题

```sql
-- 查看主从延迟
SHOW SLAVE STATUS;
-- Seconds_Behind_Master: 0  (延迟秒数)

-- 解决方案
-- 1. 关键业务读主库
-- 2. 强制走主库
SELECT /*+ MASTER */ * FROM users WHERE id = 1;

-- 3. 业务容忍短期不一致
-- 4. 并行复制
SET GLOBAL slave_parallel_workers = 4;
```

### 7.4 读写分离架构

```java
// 使用 ShardingSphere 等中间件实现
@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource masterDataSource() {
        // 主库配置
    }

    @Bean
    public DataSource slaveDataSource() {
        // 从库配置
    }

    @Bean
    public DataSource routingDataSource(
            @Qualifier("masterDataSource") DataSource master,
            @Qualifier("slaveDataSource") DataSource slave) {
        Map<Object, Object> targetDataSources = new HashMap<>();
        targetDataSources.put("master", master);
        targetDataSources.put("slave", slave);
        return new AbstractRoutingDataSource() {
            @Override
            protected Object determineCurrentLookupKey() {
                return TransactionSynchronizationManager.isCurrentTransactionReadOnly()
                    ? "slave" : "master";
            }
        };
    }
}
```

---

## 八、面试常见问题

### Q1: 为什么 MySQL 使用 B+树而不是 B树？

1. **B+树非叶节点不存数据**，单页能存更多键，树更矮，IO 次数更少
2. **B+树叶子节点用链表连接**，范围查询效率高
3. **B+树查询性能稳定**，都要走到叶子节点

### Q2: 聚簇索引和非聚簇索引的区别？

- **聚簇索引**：叶子节点存数据，一个表只能有一个（主键）
- **非聚簇索引**：叶子节点存主键值，需要回表查询

### Q3: MySQL 如何解决幻读？

- **MVCC**：快照读通过 Read View 解决
- **Next-Key Lock**：当前读通过间隙锁解决

### Q4: 什么时候应该建索引？

- 主键自动建索引
- WHERE、JOIN、ORDER BY、GROUP BY 频繁使用的列
- 区分度高的列（> 0.1）
- 组合索引遵循最左前缀

### Q5: 索引失效的场景？

- 索引列参与计算或函数
- 隐式类型转换
- LIKE 左模糊 `%xx`
- NOT、!=、<>、IS NOT NULL
- OR 连接非索引列
- 违反最左前缀原则

---

*最后更新时间：2024年*