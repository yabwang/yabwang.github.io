---
order: 11
---

# MyBatis 框架核心原理

> 深入理解 MyBatis 工作原理、动态 SQL、缓存机制与插件原理

## 一、MyBatis 架构概述

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    MyBatis 架构层次                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              接口层 (API Interface)                  │   │
│  │         SqlSession、Mapper 接口                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              核心处理层 (Core Processing)             │   │
│  │    配置解析、SQL 解析、参数映射、结果映射            │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              基础支撑层 (Base Support)               │   │
│  │    数据源、事务管理、缓存、日志、反射                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 核心组件

| 组件 | 说明 |
|------|------|
| `SqlSessionFactoryBuilder` | 构建 SqlSessionFactory，用完即弃 |
| `SqlSessionFactory` | 创建 SqlSession，单例存在 |
| `SqlSession` | 执行 SQL，非线程安全 |
| `Executor` | SQL 执行器，负责缓存、事务 |
| `StatementHandler` | JDBC Statement 操作封装 |
| `ParameterHandler` | 参数处理 |
| `ResultSetHandler` | 结果集映射 |
| `MappedStatement` | SQL 语句封装对象 |

### 1.3 执行流程

```
┌─────────────────────────────────────────────────────────────┐
│                    MyBatis 执行流程                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 加载配置                                                │
│     └─> SqlSessionFactoryBuilder.build()                   │
│         └─> 解析 mybatis-config.xml 和 Mapper.xml           │
│                                                             │
│  2. 创建 SqlSession                                         │
│     └─> SqlSessionFactory.openSession()                    │
│         └─> 创建 Executor（默认 CachingExecutor）           │
│                                                             │
│  3. 获取 Mapper 代理                                        │
│     └─> SqlSession.getMapper(UserMapper.class)             │
│         └─> JDK 动态代理生成 MapperProxy                    │
│                                                             │
│  4. 执行 SQL                                                │
│     └─> MapperProxy.invoke()                               │
│         └─> MapperMethod.execute()                         │
│             └─> SqlSession.select/update/insert/delete     │
│                 └─> Executor.query/update()                │
│                     └─> StatementHandler.prepare()         │
│                         └─> ParameterHandler.setParameters()│
│                             └─> JDBC 执行                   │
│                                 └─> ResultSetHandler.handleResultSets()│
│                                                             │
│  5. 提交事务                                                │
│     └─> SqlSession.commit()                                │
│                                                             │
│  6. 关闭 Session                                            │
│     └─> SqlSession.close()                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、工作原理深入

### 2.1 Mapper 代理实现

```java
// Mapper 接口
public interface UserMapper {
    User selectById(Long id);
}

// 实际调用：JDK 动态代理
UserMapper userMapper = sqlSession.getMapper(UserMapper.class);

// 代理类伪代码
public class MapperProxy implements InvocationHandler {

    private final SqlSession sqlSession;
    private final Class<T> mapperInterface;

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // Object 类方法直接执行
        if (Object.class.equals(method.getDeclaringClass())) {
            return method.invoke(this, args);
        }

        // 执行 SQL
        final MapperMethod mapperMethod = new MapperMethod(mapperInterface, method, sqlSession.getConfiguration());
        return mapperMethod.execute(sqlSession, args);
    }
}
```

**关键点：**
- Mapper 接口没有实现类
- 通过 JDK 动态代理生成代理对象
- 方法调用转换为 SqlSession 的 CRUD 操作
- 方法签名与 XML/注解中的 SQL 绑定

### 2.2 SqlSession 执行过程

```java
// DefaultSqlSession.java
public <E> List<E> selectList(String statement, Object parameter, RowBounds rowBounds) {
    try {
        // 1. 获取 MappedStatement（SQL 配置信息）
        MappedStatement ms = configuration.getMappedStatement(statement);

        // 2. 委托给 Executor 执行
        return executor.query(ms, wrapCollection(parameter), rowBounds, Executor.NO_RESULT_HANDLER);
    } catch (Exception e) {
        throw ExceptionFactory.wrapException("Error querying database...", e);
    }
}

// BaseExecutor.java
public <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler) {
    // 1. 获取 BoundSql（动态 SQL 解析后的 SQL）
    BoundSql boundSql = ms.getBoundSql(parameter);

    // 2. 创建 CacheKey（用于缓存）
    CacheKey key = createCacheKey(ms, parameter, rowBounds, boundSql);

    // 3. 查询（先查缓存，再查数据库）
    return query(ms, parameter, rowBounds, resultHandler, key, boundSql);
}
```

### 2.3 Executor 执行器

```java
// Executor 类型
public enum ExecutorType {
    SIMPLE,       // 默认，每次执行创建新 Statement
    REUSE,        // 复用 Statement
    BATCH         // 批量执行
}

// 配置方式
<settings>
    <setting name="defaultExecutorType" value="REUSE"/>
</settings>

// 或代码指定
SqlSession session = sqlSessionFactory.openSession(ExecutorType.BATCH);
```

**执行器继承结构：**

```
Executor (接口)
    │
    ├── BaseExecutor (抽象基类)
    │       ├── SimpleExecutor
    │       ├── ReuseExecutor
    │       └── BatchExecutor
    │
    └── CachingExecutor (缓存装饰器)
```

### 2.4 StatementHandler

```java
// StatementHandler 继承结构
StatementHandler (接口)
    │
    ├── BaseStatementHandler (抽象基类)
    │       ├── PreparedStatementHandler (预编译)
    │       ├── CallableStatementHandler (存储过程)
    │       └── SimpleStatementHandler (普通 SQL)
    │
    └── RoutingStatementHandler (路由选择)

// 核心方法
public interface StatementHandler {
    Statement prepare(Connection connection, Integer transactionTimeout);  // 创建 Statement
    void parameterize(Statement statement);                                // 参数化
    void batch(Statement statement);                                        // 批量
    int update(Statement statement);                                        // 更新
    <E> List<E> query(Statement statement, ResultHandler resultHandler);   // 查询
}
```

---

## 三、动态 SQL

### 3.1 动态 SQL 标签

| 标签 | 说明 | 示例场景 |
|------|------|----------|
| `<if>` | 条件判断 | 可选查询条件 |
| `<choose>` | 多条件分支 | 查询条件互斥 |
| `<where>` | 智能 WHERE | 处理 AND/OR 前缀 |
| `<set>` | 智能 SET | 动态更新字段 |
| `<foreach>` | 循环遍历 | IN 查询、批量插入 |
| `<trim>` | 字符串修剪 | 自定义前后缀 |
| `<bind>` | 变量绑定 | 模糊查询 |
| `<sql>` | SQL 片段 | 复用 SQL |

### 3.2 常用标签示例

**1. if 标签**
```xml
<select id="selectByCondition" resultType="User">
    SELECT * FROM user
    <where>
        <if test="name != null and name != ''">
            AND name LIKE CONCAT('%', #{name}, '%')
        </if>
        <if test="status != null">
            AND status = #{status}
        </if>
        <if test="startTime != null">
            AND create_time >= #{startTime}
        </if>
    </where>
</select>
```

**2. choose-when-otherwise**
```xml
<select id="selectByPriority" resultType="User">
    SELECT * FROM user
    <where>
        <choose>
            <when test="id != null">
                AND id = #{id}
            </when>
            <when test="phone != null">
                AND phone = #{phone}
            </when>
            <otherwise>
                AND status = 1
            </otherwise>
        </choose>
    </where>
</select>
```

**3. foreach 标签**
```xml
<!-- IN 查询 -->
<select id="selectByIds" resultType="User">
    SELECT * FROM user
    WHERE id IN
    <foreach collection="ids" item="id" open="(" separator="," close=")">
        #{id}
    </foreach>
</select>

<!-- 批量插入 -->
<insert id="batchInsert">
    INSERT INTO user (name, age, status)
    VALUES
    <foreach collection="list" item="user" separator=",">
        (#{user.name}, #{user.age}, #{user.status})
    </foreach>
</insert>
```

**4. set 标签**
```xml
<update id="updateSelective">
    UPDATE user
    <set>
        <if test="name != null">
            name = #{name},
        </if>
        <if test="age != null">
            age = #{age},
        </if>
        <if test="status != null">
            status = #{status},
        </if>
        update_time = NOW()
    </set>
    WHERE id = #{id}
</update>
```

**5. trim 标签**
```xml
<!-- 替代 where -->
<select id="selectByTrim" resultType="User">
    SELECT * FROM user
    <trim prefix="WHERE" prefixOverrides="AND |OR ">
        <if test="name != null">
            AND name = #{name}
        </if>
        <if test="status != null">
            AND status = #{status}
        </if>
    </trim>
</select>

<!-- 替代 set -->
<update id="updateByTrim">
    UPDATE user
    <trim prefix="SET" suffixOverrides=",">
        <if test="name != null">
            name = #{name},
        </if>
        <if test="age != null">
            age = #{age},
        </if>
    </trim>
    WHERE id = #{id}
</update>
```

**6. bind 标签**
```xml
<select id="selectByName" resultType="User">
    <bind name="pattern" value="'%' + name + '%'" />
    SELECT * FROM user WHERE name LIKE #{pattern}
</select>
```

**7. sql 片段**
```xml
<!-- 定义可复用 SQL 片段 -->
<sql id="baseColumns">
    id, name, age, status, create_time, update_time
</sql>

<!-- 引用 SQL 片段 -->
<select id="selectById" resultType="User">
    SELECT <include refid="baseColumns"/>
    FROM user
    WHERE id = #{id}
</select>
```

### 3.3 OGNL 表达式

```xml
<!-- 字符串判断 -->
<if test="name != null and name != ''">

<!-- 集合判断 -->
<if test="list != null and list.size() > 0">
<if test="ids != null">

<!-- 对象属性判断 -->
<if test="user.age >= 18">
<if test="@com.example.Constants@STATUS_ACTIVE == status">

<!-- 方法调用 -->
<if test="name.startsWith('admin')">
<if test="list.contains(item)">

<!-- 三元表达式 -->
<if test="status == null ? 1 : status">
```

---

## 四、缓存机制

### 4.1 一级缓存

**特点：**
- 默认开启，无法关闭
- 作用域：SqlSession 级别
- 生命周期：SqlSession 关闭时清空

```
┌─────────────────────────────────────────────────────────────┐
│                     一级缓存原理                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SqlSession                                                 │
│       │                                                     │
│       └── Executor (BaseExecutor)                          │
│              │                                              │
│              └── localCache (PerpetualCache)               │
│                    │                                        │
│                    └── Map<CacheKey, Object>                │
│                                                             │
│  查询流程：                                                  │
│  1. 根据 SQL + 参数生成 CacheKey                            │
│  2. 查询 localCache                                         │
│  3. 命中 -> 返回结果                                        │
│  4. 未命中 -> 查询数据库，存入缓存                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**一级缓存失效场景：**

```java
// 1. 调用 sqlSession.clearCache()
sqlSession.clearCache();

// 2. 执行 insert/update/delete（会清空缓存）
userMapper.insert(user);

// 3. SqlSession 关闭
sqlSession.close();

// 4. 配置 flushCache="true"
<select id="selectById" flushCache="true">
    SELECT * FROM user WHERE id = #{id}
</select>

// 5. 不同 SqlSession
SqlSession session1 = sqlSessionFactory.openSession();
SqlSession session2 = sqlSessionFactory.openSession();
// session1 和 session2 缓存隔离
```

### 4.2 二级缓存

**特点：**
- 默认关闭，需手动开启
- 作用域：Mapper namespace 级别
- 生命周期：应用生命周期

**开启配置：**

```xml
<!-- 1. mybatis-config.xml 开启 -->
<settings>
    <setting name="cacheEnabled" value="true"/>
</settings>

<!-- 2. Mapper.xml 配置 -->
<mapper namespace="com.example.mapper.UserMapper">
    <cache
        eviction="LRU"
        flushInterval="60000"
        size="1024"
        readOnly="true"/>

    <!-- 或使用引用 -->
    <cache-ref namespace="com.example.mapper.OtherMapper"/>
</mapper>

<!-- 3. 或注解方式 -->
@CacheNamespace(implementation = LruCache.class, size = 1024)
public interface UserMapper {}
```

**缓存属性：**

| 属性 | 说明 | 可选值 |
|------|------|--------|
| eviction | 回收策略 | LRU、FIFO、SOFT、WEAK |
| flushInterval | 刷新间隔 | 毫秒，默认不刷新 |
| size | 缓存大小 | 默认 1024 |
| readOnly | 只读 | true/false |

**二级缓存结构：**

```
┌─────────────────────────────────────────────────────────────┐
│                     二级缓存原理                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Configuration                                              │
│       │                                                     │
│       └── MapperRegistry                                    │
│              │                                              │
│              └── Map<namespace, MapperProxyFactory>         │
│                     │                                       │
│                     └── Cache (namespace 级别)              │
│                                                             │
│  SqlSession                                                  │
│       │                                                     │
│       └── CachingExecutor                                   │
│              │                                              │
│              ├── tcm (TransactionalCacheManager)            │
│              │      └── 事务提交时同步到二级缓存             │
│              │                                              │
│              └── 查询时先查二级缓存，再查一级缓存             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**查询顺序：**
```
二级缓存 → 一级缓存 → 数据库
```

### 4.3 缓存回收策略

| 策略 | 说明 |
|------|------|
| **LRU** | 最近最少使用，移除最长时间不被使用的对象 |
| **FIFO** | 先进先出，按对象进入缓存顺序移除 |
| **SOFT** | 软引用，基于垃圾回收器状态和软引用规则移除 |
| **WEAK** | 弱引用，更积极地基于垃圾回收器状态移除 |

### 4.4 自定义缓存

```java
// 实现 Cache 接口
public class RedisCache implements Cache {

    private final String id;
    private final RedisTemplate<String, Object> redisTemplate;

    public RedisCache(String id) {
        this.id = id;
        this.redisTemplate = SpringContextHolder.getBean(RedisTemplate.class);
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public void putObject(Object key, Object value) {
        String cacheKey = getKey(key);
        redisTemplate.opsForValue().set(cacheKey, value, 1, TimeUnit.HOURS);
    }

    @Override
    public Object getObject(Object key) {
        String cacheKey = getKey(key);
        return redisTemplate.opsForValue().get(cacheKey);
    }

    @Override
    public Object removeObject(Object key) {
        String cacheKey = getKey(key);
        return redisTemplate.delete(cacheKey);
    }

    @Override
    public void clear() {
        Set<String> keys = redisTemplate.keys(id + ":*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    @Override
    public int getSize() {
        Long size = redisTemplate.execute((RedisCallback<Long>) connection -> {
            return connection.dbSize();
        });
        return size != null ? size.intValue() : 0;
    }

    private String getKey(Object key) {
        return id + ":" + key.hashCode();
    }
}

// 使用自定义缓存
<cache type="com.example.cache.RedisCache"/>
```

### 4.5 缓存使用注意事项

```java
// 1. 缓存的对象必须可序列化
public class User implements Serializable {
    private static final long serialVersionUID = 1L;
}

// 2. 增删改操作会清空缓存
<insert id="insert" flushCache="true">  <!-- 默认 true -->
<update id="update" flushCache="true">  <!-- 默认 true -->
<select id="select" flushCache="false"> <!-- 默认 false -->

// 3. useCache 控制是否使用缓存
<select id="select" useCache="true">   <!-- 默认 true -->

// 4. 多表关联查询需注意缓存一致性
// 方案1：使用 cache-ref 共享缓存
// 方案2：配置关联操作 flushCache
```

---

## 五、插件机制

### 5.1 插件原理

MyBatis 插件基于 **JDK 动态代理** 实现，通过拦截 Executor、StatementHandler、ParameterHandler、ResultSetHandler 四大对象的方法实现扩展。

```java
// 拦截点
@Intercepts({
    @Signature(type = Executor.class, method = "query", args = {
        MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class
    })
})
public class MyPlugin implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        // 前置处理
        System.out.println("SQL 执行前");

        // 执行原方法
        Object result = invocation.proceed();

        // 后置处理
        System.out.println("SQL 执行后");

        return result;
    }

    @Override
    public Object plugin(Object target) {
        // 创建代理对象
        return Plugin.wrap(target, this);
    }

    @Override
    public void setProperties(Properties properties) {
        // 设置属性
    }
}
```

### 5.2 可拦截的对象和方法

| 对象 | 方法 | 说明 |
|------|------|------|
| **Executor** | update, query, commit, rollback, getTransaction | SQL 执行、事务 |
| **StatementHandler** | prepare, parameterize, batch, update, query | Statement 操作 |
| **ParameterHandler** | getParameterObject, setParameters | 参数处理 |
| **ResultSetHandler** | handleResultSets, handleOutputParameters | 结果集处理 |

### 5.3 分页插件示例

```java
@Intercepts({
    @Signature(type = Executor.class, method = "query",
        args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class})
})
public class PageInterceptor implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        Object[] args = invocation.getArgs();
        MappedStatement ms = (MappedStatement) args[0];
        Object parameter = args[1];
        RowBounds rowBounds = (RowBounds) args[2];

        // 判断是否需要分页
        if (rowBounds != RowBounds.DEFAULT) {
            // 获取原始 SQL
            BoundSql boundSql = ms.getBoundSql(parameter);
            String originalSql = boundSql.getSql();

            // 改写为分页 SQL（MySQL）
            String pageSql = originalSql + " LIMIT " + rowBounds.getOffset() + ", " + rowBounds.getLimit();

            // 使用反射修改 SQL
            Field field = boundSql.getClass().getDeclaredField("sql");
            field.setAccessible(true);
            field.set(boundSql, pageSql);

            // 重置 RowBounds（避免 MyBatis 内存分页）
            args[2] = RowBounds.DEFAULT;
        }

        return invocation.proceed();
    }
}

// 配置插件
<plugins>
    <plugin interceptor="com.example.plugin.PageInterceptor"/>
</plugins>
```

### 5.4 SQL 执行时间监控插件

```java
@Intercepts({
    @Signature(type = Executor.class, method = "update",
        args = {MappedStatement.class, Object.class}),
    @Signature(type = Executor.class, method = "query",
        args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class})
})
public class SqlMonitorInterceptor implements Interceptor {

    // 慢 SQL 阈值（毫秒）
    private static final long SLOW_SQL_THRESHOLD = 1000;

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        MappedStatement ms = (MappedStatement) invocation.getArgs()[0];
        Object parameter = invocation.getArgs()[1];

        BoundSql boundSql = ms.getBoundSql(parameter);
        String sql = boundSql.getSql();

        long start = System.currentTimeMillis();
        try {
            return invocation.proceed();
        } finally {
            long cost = System.currentTimeMillis() - start;
            if (cost > SLOW_SQL_THRESHOLD) {
                System.out.println("[慢SQL] " + ms.getId() + " 耗时: " + cost + "ms");
                System.out.println("[SQL] " + sql);
            }
        }
    }
}
```

### 5.5 插件链执行顺序

```
┌─────────────────────────────────────────────────────────────┐
│                    插件代理链                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Plugin1.intercept()                                        │
│       │                                                     │
│       └── Plugin2.intercept()                               │
│              │                                              │
│              └── Plugin3.intercept()                       │
│                     │                                       │
│                     └── invocation.proceed()                │
│                            │                                │
│                            └── 真实方法执行                  │
│                                                             │
│  执行顺序：Plugin1 -> Plugin2 -> Plugin3 -> 真实方法        │
│  返回顺序：Plugin1 <- Plugin2 <- Plugin3 <- 结果           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 六、参数映射与结果映射

### 6.1 参数映射

```xml
<!-- 1. 简单参数 -->
<select id="selectById" resultType="User">
    SELECT * FROM user WHERE id = #{id}
</select>

<!-- 2. 对象参数 -->
<insert id="insert">
    INSERT INTO user (name, age, email)
    VALUES (#{name}, #{age}, #{email})
</insert>

<!-- 3. 多参数 -->
<select id="selectByNameAndAge" resultType="User">
    SELECT * FROM user
    WHERE name = #{param1} AND age = #{param2}
</select>

<!-- 或使用 @Param 注解 -->
List<User> selectByNameAndAge(@Param("name") String name, @Param("age") Integer age);
<!-- XML 中使用 #{name}, #{age} -->

<!-- 4. Map 参数 -->
<select id="selectByMap" resultType="User">
    SELECT * FROM user
    WHERE name = #{name} AND age = #{age}
</select>

<!-- 5. 嵌套属性 -->
<select id="selectByUser" resultType="User">
    SELECT * FROM user WHERE name = #{user.name}
</select>
```

### 6.2 结果映射 ResultMap

```xml
<!-- 基本映射 -->
<resultMap id="userResultMap" type="User">
    <id property="id" column="user_id"/>
    <result property="name" column="user_name"/>
    <result property="age" column="user_age"/>
    <result property="email" column="user_email"/>
</resultMap>

<select id="selectById" resultMap="userResultMap">
    SELECT user_id, user_name, user_age, user_email FROM user WHERE user_id = #{id}
</select>

<!-- 一对一关联 -->
<resultMap id="orderWithUser" type="Order">
    <id property="id" column="order_id"/>
    <result property="orderNo" column="order_no"/>
    <!-- 嵌套结果映射 -->
    <association property="user" javaType="User">
        <id property="id" column="user_id"/>
        <result property="name" column="user_name"/>
    </association>
    <!-- 或嵌套查询 -->
    <association property="user" javaType="User" column="user_id"
                 select="selectUserById"/>
</resultMap>

<!-- 一对多关联 -->
<resultMap id="userWithOrders" type="User">
    <id property="id" column="user_id"/>
    <result property="name" column="user_name"/>
    <collection property="orders" ofType="Order">
        <id property="id" column="order_id"/>
        <result property="orderNo" column="order_no"/>
    </collection>
    <!-- 或嵌套查询 -->
    <collection property="orders" ofType="Order" column="user_id"
                select="selectOrdersByUserId"/>
</resultMap>

<!-- 鉴别器 -->
<resultMap id="vehicleResult" type="Vehicle">
    <id property="id" column="id"/>
    <result property="type" column="type"/>
    <discriminator javaType="String" column="type">
        <case value="CAR" resultType="Car">
            <result property="doorCount" column="door_count"/>
        </case>
        <case value="TRUCK" resultType="Truck">
            <result property="loadCapacity" column="load_capacity"/>
        </case>
    </discriminator>
</resultMap>
```

### 6.3 TypeHandler 自定义类型处理器

```java
// 自定义枚举处理器
public class EnumTypeHandler<E extends Enum<E>> extends BaseTypeHandler<E> {

    private final Class<E> type;

    public EnumTypeHandler(Class<E> type) {
        this.type = type;
    }

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, E parameter, JdbcType jdbcType)
            throws SQLException {
        if (jdbcType == null) {
            ps.setString(i, parameter.name());
        } else {
            ps.setObject(i, parameter.name(), jdbcType.TYPE_CODE);
        }
    }

    @Override
    public E getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return value == null ? null : Enum.valueOf(type, value);
    }

    @Override
    public E getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return value == null ? null : Enum.valueOf(type, value);
    }

    @Override
    public E getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return value == null ? null : Enum.valueOf(type, value);
    }
}

// 注册 TypeHandler
<typeHandlers>
    <typeHandler javaType="com.example.enums.UserStatus"
                 handler="com.example.handler.EnumTypeHandler"/>
</typeHandlers>

// 或注解方式
@MappedTypes(UserStatus.class)
public class StatusTypeHandler extends BaseTypeHandler<UserStatus> {
    // ...
}
```

---

## 七、常见面试题

### 7.1 #{} 和 ${} 的区别？

| 特性 | #{} | ${} |
|------|-----|-----|
| 解析方式 | 预编译参数，占位符 ? | 字符串替换 |
| SQL 注入 | 安全 | 不安全 |
| 使用场景 | 参数传递 | 表名、列名、排序字段 |
| 性能 | 可复用执行计划 | 每次重新编译 |

```xml
<!-- 安全：预编译 -->
SELECT * FROM user WHERE name = #{name}
-- 解析为：SELECT * FROM user WHERE name = ?

<!-- 危险：字符串替换 -->
SELECT * FROM user WHERE name = '${name}'
-- 解析为：SELECT * FROM user WHERE name = 'zhangsan'
-- 可能被注入：name = "' OR '1'='1"

<!-- ${} 正确用法：动态表名、排序 -->
SELECT * FROM ${tableName} ORDER BY ${orderColumn}
```

### 7.2 MyBatis 和 Hibernate 的区别？

| 特性 | MyBatis | Hibernate |
|------|---------|-----------|
| SQL 控制 | 完全控制 | 自动生成 |
| 学习曲线 | 较低 | 较高 |
| 灵活性 | 高 | 中 |
| 数据库移植 | 需修改 SQL | 方言自动适配 |
| 缓存 | 一级+二级缓存 | 一级+二级+查询缓存 |
| 性能优化 | 直接优化 SQL | 需理解 ORM 机制 |
| 适用场景 | 复杂 SQL、高性能要求 | 快速开发、简单 CRUD |

### 7.3 如何实现批量插入？

```xml
<!-- 方式1：foreach（推荐） -->
<insert id="batchInsert">
    INSERT INTO user (name, age, status)
    VALUES
    <foreach collection="list" item="user" separator=",">
        (#{user.name}, #{user.age}, #{user.status})
    </foreach>
</insert>

<!-- 方式2：Batch Executor -->
SqlSession session = sqlSessionFactory.openSession(ExecutorType.BATCH);
UserMapper mapper = session.getMapper(UserMapper.class);
for (User user : userList) {
    mapper.insert(user);
}
session.commit();
session.close();
```

### 7.4 MyBatis 如何防止 SQL 注入？

1. **使用 #{} 预编译参数**
2. **输入验证**
3. **避免拼接 SQL**
4. **使用 TypeHandler**

```java
// 危险示例
@Select("SELECT * FROM user WHERE name = '${name}'")
User findByName(@Param("name") String name);

// 安全示例
@Select("SELECT * FROM user WHERE name = #{name}")
User findByName(@Param("name") String name);
```

### 7.5 延迟加载实现原理？

```xml
<!-- 开启延迟加载 -->
<settings>
    <setting name="lazyLoadingEnabled" value="true"/>
    <setting name="aggressiveLazyLoading" value="false"/>
</settings>

<!-- 配置延迟加载 -->
<resultMap id="userWithOrders" type="User">
    <id property="id" column="id"/>
    <result property="name" column="name"/>
    <collection property="orders" ofType="Order" column="id"
                select="selectOrdersByUserId" fetchType="lazy"/>
</resultMap>
```

**原理：**
- 使用 CGLIB 或 Javassist 创建代理对象
- 调用 getter 方法时触发 SQL 查询
- 结果缓存到代理对象中

---

## 八、最佳实践

### 8.1 命名规范

```java
// Mapper 接口命名
public interface UserMapper {
    User selectById(Long id);           // 单条查询
    List<User> selectList(UserQuery query);  // 列表查询
    int insert(User user);              // 插入
    int insertBatch(List<User> list);   // 批量插入
    int updateById(User user);          // 更新
    int deleteById(Long id);            // 删除
    int count(UserQuery query);         // 统计
}
```

### 8.2 性能优化

```java
// 1. 批量操作使用 BATCH Executor
SqlSession session = sqlSessionFactory.openSession(ExecutorType.BATCH);

// 2. 只查询需要的列
<select id="selectNames" resultType="String">
    SELECT name FROM user WHERE status = 1
</select>

// 3. 合理使用缓存
// - 高频查询、低更新频率的场景开启二级缓存
// - 多表关联查询注意缓存一致性

// 4. 分页查询避免全表扫描
// - 使用数据库分页而非内存分页
// - 大数据量考虑游标或分批查询

// 5. 使用索引提示
<select id="selectWithIndex" resultType="User">
    SELECT /*+ INDEX(user idx_name) */ * FROM user WHERE name = #{name}
</select>
```

### 8.3 安全实践

```xml
<!-- 1. 始终使用 #{} 而非 ${} -->
WHERE name = #{name}

<!-- 2. 动态排序需校验 -->
<select id="selectByOrder" resultType="User">
    SELECT * FROM user
    <if test="orderColumn == 'name' or orderColumn == 'age' or orderColumn == 'create_time'">
        ORDER BY ${orderColumn}
    </if>
</select>

<!-- 3. 敏感数据加密 -->
<resultMap id="userResultMap" type="User">
    <result property="password" column="password"
            typeHandler="com.example.handler.EncryptTypeHandler"/>
</resultMap>
```

---

## 九、总结

### 核心知识点

1. **架构**：接口层 → 核心处理层 → 基础支撑层
2. **执行流程**：配置解析 → SqlSession → Executor → StatementHandler → JDBC
3. **动态 SQL**：if、choose、foreach、where、set、trim、bind、sql
4. **缓存**：一级缓存（SqlSession 级别）、二级缓存（Mapper 级别）
5. **插件**：拦截四大对象，实现分页、监控等功能
6. **映射**：参数映射 #{}、结果映射 ResultMap、TypeHandler

### 最佳实践

- 优先使用 #{} 防止 SQL 注入
- 合理使用缓存，注意缓存一致性
- 批量操作使用 BATCH Executor
- 复杂查询优先考虑 ResultMap
- 插件开发注意性能影响

---

**下一篇预告**：MySQL 索引原理与优化实践