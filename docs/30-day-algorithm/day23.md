---
order: 23
---

# Day 23 - 动态规划基础

> 📅 日期：2026年3月9日
> 🎯 主题：动态规划入门 - 爬楼梯与斐波那契数列

## 今日题目

### 题目1：爬楼梯 (Climbing Stairs)

**难度**：⭐⭐ 简单

**链接**：[LeetCode 70. 爬楼梯](https://leetcode.cn/problems/climbing-stairs/)

#### 题目描述

假设你正在爬楼梯。需要 `n` 阶你才能到达楼顶。

每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？

**示例：**
```
输入：n = 2
输出：2
解释：有两种方法可以爬到楼顶。
     1. 1 阶 + 1 阶
     2. 2 阶

输入：n = 3
输出：3
解释：有三种方法可以爬到楼顶。
     1. 1 阶 + 1 阶 + 1 阶
     2. 1 阶 + 2 阶
     3. 2 阶 + 1 阶
```

**提示**：
- `1 <= n <= 45`

#### 解题思路

**方法一：动态规划 - 状态转移方程**

核心思想：
1. 要到达第 `n` 阶，只能从第 `n-1` 阶或第 `n-2` 阶上来
2. 设 `dp[i]` 表示到达第 `i` 阶的方法数
3. 状态转移方程：`dp[i] = dp[i-1] + dp[i-2]`
4. 边界条件：`dp[1] = 1`, `dp[2] = 2`

**为什么是斐波那契数列？**
- 因为递推关系相同：`f(n) = f(n-1) + f(n-2)`
- 初始值略有不同：`f(1)=1, f(2)=2`

#### 代码实现

```java
class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        
        int prev2 = 1;  // dp[i-2]
        int prev1 = 2;  // dp[i-1]
        int curr = 0;   // dp[i]
        
        for (int i = 3; i <= n; i++) {
            curr = prev1 + prev2;
            prev2 = prev1;
            prev1 = curr;
        }
        
        return curr;
    }
}
```

**空间优化版（滚动数组）：**
```java
class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        
        int a = 1, b = 2, c = 0;
        for (int i = 3; i <= n; i++) {
            c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
}
```

#### 复杂度分析

- 时间复杂度：O(n)
- 空间复杂度：O(1)

---

### 题目2：斐波那契数 (Fibonacci Number)

**难度**：⭐⭐ 简单

**链接**：[LeetCode 509. 斐波那契数](https://leetcode.cn/problems/fibonacci-number/)

#### 题目描述

斐波那契数（通常用 `F(n)` 表示）形成的序列称为斐波那契数列。该数列由 `0` 和 `1` 开始，后面的每一项数字都是前面两项数字的和。即：

- `F(0) = 0`
- `F(1) = 1`
- `F(n) = F(n - 1) + F(n - 2)`，其中 `n > 1`

给定 `n`，请计算 `F(n)`。

**示例：**
```
输入：n = 2
输出：1
解释：F(2) = F(1) + F(0) = 1 + 0 = 1

输入：n = 3
输出：2
解释：F(3) = F(2) + F(1) = 1 + 1 = 2

输入：n = 4
输出：3
解释：F(4) = F(3) + F(2) = 2 + 1 = 3
```

**提示**：
- `0 <= n <= 30`

#### 解题思路

**方法一：动态规划 - 自底向上**

核心思想：
1. 从 `F(0)` 和 `F(1)` 开始，逐步计算到 `F(n)`
2. 避免递归重复计算，使用迭代方式
3. 空间优化：只保存前两个状态值

**方法二：矩阵快速幂（进阶）**
- 由于 `F(n) = F(n-1) + F(n-2)` 是线性递推关系
- 可以用矩阵乘法表示：`[F(n), F(n-1)] = [F(n-1), F(n-2)] * [[1,1],[1,0]]`
- 通过快速幂可以在 O(logn) 时间内求解

#### 代码实现

```java
class Solution {
    public int fib(int n) {
        if (n <= 1) return n;
        
        int prev2 = 0;  // F(i-2)
        int prev1 = 1;  // F(i-1)
        int curr = 0;   // F(i)
        
        for (int i = 2; i <= n; i++) {
            curr = prev1 + prev2;
            prev2 = prev1;
            prev1 = curr;
        }
        
        return curr;
    }
}
```

**递归 + 记忆化版本：**
```java
class Solution {
    private Integer[] memo;
    
    public int fib(int n) {
        memo = new Integer[n + 1];
        return helper(n);
    }
    
    private int helper(int n) {
        if (n <= 1) return n;
        if (memo[n] != null) return memo[n];
        
        memo[n] = helper(n - 1) + helper(n - 2);
        return memo[n];
    }
}
```

#### 复杂度分析

- 时间复杂度：O(n)
- 空间复杂度：O(1) - 迭代版本；O(n) - 记忆化递归版本

---

## 今日总结

### 学到了什么？

1. **动态规划基础**：状态定义 + 状态转移方程 + 边界条件
2. **爬楼梯问题**：`dp[i] = dp[i-1] + dp[i-2]`，本质是斐波那契数列
3. **斐波那契数列**：掌握递推、记忆化、滚动数组优化
4. **空间优化技巧**：滚动数组减少空间复杂度

### 动态规划四要素

| 要素 | 说明 | 示例 |
|------|------|------|
| 状态定义 | `dp[i]` 的含义 | `dp[i]` 表示到达第 i 阶的方法数 |
| 状态转移 | 如何从前一状态得到当前状态 | `dp[i] = dp[i-1] + dp[i-2]` |
| 边界条件 | 初始值 | `dp[1] = 1, dp[2] = 2` |
| 目标状态 | 要求的结果 | `dp[n]` |

### DP经典模式

| 模式 | 典型题目 | 特征 |
|------|----------|------|
| 线性DP | 爬楼梯、打家劫舍 | 状态在线性结构上变化 |
| 区间DP | 合并石子 | 状态在区间上变化 |
| 树形DP | 树的最大独立集 | 状态在树结构上变化 |
| 背包DP | 01背包、完全背包 | 有限制的选择问题 |

### 相似题目推荐

- [使用最小花费爬楼梯](https://leetcode.cn/problems/min-cost-climbing-stairs/) - 加权DP
- [打家劫舍](https://leetcode.cn/problems/house-robber/) - 间隔选择
- [解码方法](https://leetcode.cn/problems/decode-ways/) - 字符串DP
- [不同的二叉搜索树](https://leetcode.cn/problems/unique-binary-search-trees/) - 数学DP

### 明日计划

- Day 24 动态规划进阶
- 练习：打家劫舍系列、路径问题等