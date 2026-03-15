---
order: 24
---

# Day 24 - 动态规划进阶

> 📅 日期：2026年3月10日
> 🎯 主题：动态规划进阶 - 打家劫舍与路径问题

## 今日题目

### 题目1：打家劫舍 (House Robber)

**难度**：⭐⭐ 中等

**链接**：[LeetCode 198. 打家劫舍](https://leetcode.cn/problems/house-robber/)

#### 题目描述

你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。

给定一个代表每个房屋存放金额的非负整数数组，计算你不触动警报装置的情况下，一夜之内能够偷窃到的最高金额。

**示例：**
```
输入：[1,2,3,1]
输出：4
解释：偷窃 1 号房屋 (金额 = 1)，然后偷窃 3 号房屋 (金额 = 3)。
     偷窃到的最高金额 = 1 + 3 = 4。

输入：[2,7,9,3,1]
输出：12
解释：偷窃 1 号房屋 (金额 = 2)，偷窃 3 号房屋 (金额 = 9)，接着偷窃 5 号房屋 (金额 = 1)。
     偷窃到的最高金额 = 2 + 9 + 1 = 12。
```

**提示**：
- `1 <= nums.length <= 100`
- `0 <= nums[i] <= 400`

#### 解题思路

**方法一：动态规划 - 选与不选的状态转移**

核心思想：
1. 对于第 `i` 个房屋，只有两种选择：偷或不偷
2. 设 `dp[i]` 表示考虑前 `i` 个房屋能偷到的最大金额
3. 状态转移方程：
   - `dp[i] = max(dp[i-1], dp[i-2] + nums[i])`
   - `dp[i-1]` 表示不偷第 `i` 个房屋
   - `dp[i-2] + nums[i]` 表示偷第 `i` 个房屋
4. 边界条件：`dp[0] = nums[0]`, `dp[1] = max(nums[0], nums[1])`

**空间优化**：只需要记录前两个状态，可用滚动数组优化

#### 代码实现

```java
class Solution {
    public int rob(int[] nums) {
        int n = nums.length;
        if (n == 1) return nums[0];
        if (n == 2) return Math.max(nums[0], nums[1]);
        
        int prev2 = nums[0];                    // dp[i-2]
        int prev1 = Math.max(nums[0], nums[1]); // dp[i-1]
        int curr = 0;                           // dp[i]
        
        for (int i = 2; i < n; i++) {
            curr = Math.max(prev1, prev2 + nums[i]);
            prev2 = prev1;
            prev1 = curr;
        }
        
        return curr;
    }
}
```

**简化版（更清晰的逻辑）：**
```java
class Solution {
    public int rob(int[] nums) {
        int rob = 0;    // 偷当前房屋的最大收益
        int notRob = 0; // 不偷当前房屋的最大收益
        
        for (int num : nums) {
            int newRob = notRob + num;  // 本次偷 = 上次不偷 + 本次金额
            int newNotRob = Math.max(rob, notRob); // 本次不偷 = max(上次偷, 上次不偷)
            
            rob = newRob;
            notRob = newNotRob;
        }
        
        return Math.max(rob, notRob);
    }
}
```

#### 复杂度分析

- 时间复杂度：O(n)
- 空间复杂度：O(1)

---

### 题目2：不同路径 (Unique Paths)

**难度**：⭐⭐ 中等

**链接**：[LeetCode 62. 不同路径](https://leetcode.cn/problems/unique-paths/)

#### 题目描述

一个机器人位于一个 `m x n` 网格的左上角（起始点在下图中标记为 "Start"）。

机器人每次只能向下或者向右移动一步。机器人试图达到网格的右下角（在下图中标记为 "Finish"）。

问总共有多少条不同的路径？

**示例：**
```
输入：m = 3, n = 7
输出：28

输入：m = 3, n = 2
输出：3
解释：
从左上角开始，总共有 3 条路径可以到达右下角。
1. 向右 -> 向下 -> 向下
2. 向下 -> 向右 -> 向下
3. 向下 -> 向下 -> 向右

输入：m = 7, n = 3
输出：28
```

**提示**：
- `1 <= m, n <= 100`

#### 解题思路

**方法一：二维动态规划**

核心思想：
1. 设 `dp[i][j]` 表示从 `(0,0)` 到 `(i,j)` 的不同路径数
2. 状态转移方程：`dp[i][j] = dp[i-1][j] + dp[i][j-1]`
3. 边界条件：第一行和第一列的所有格子路径数都为1

**方法二：组合数学（进阶）**
- 从左上角到右下角，总共需要走 `(m-1)+(n-1)` 步
- 其中 `(m-1)` 步向下，`(n-1)` 步向右
- 问题转化为：在 `(m+n-2)` 步中选择 `(m-1)` 步向下的方案数
- 即 C(m+n-2, m-1) = (m+n-2)! / ((m-1)! * (n-1)!)

#### 代码实现

```java
class Solution {
    public int uniquePaths(int m, int n) {
        int[][] dp = new int[m][n];
        
        // 初始化边界
        for (int i = 0; i < m; i++) dp[i][0] = 1;
        for (int j = 0; j < n; j++) dp[0][j] = 1;
        
        // 填充dp表
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                dp[i][j] = dp[i-1][j] + dp[i][j-1];
            }
        }
        
        return dp[m-1][n-1];
    }
}
```

**空间优化版（一维数组）：**
```java
class Solution {
    public int uniquePaths(int m, int n) {
        int[] dp = new int[n];
        Arrays.fill(dp, 1);  // 第一行初始化为1
        
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                dp[j] = dp[j] + dp[j-1];  // dp[j]是上方格子，dp[j-1]是左边格子
            }
        }
        
        return dp[n-1];
    }
}
```

#### 复杂度分析

- 时间复杂度：O(m*n) - 二维版；O(m*n) - 一维版
- 空间复杂度：O(m*n) - 二维版；O(n) - 一维版

---

## 今日总结

### 学到了什么？

1. **打家劫舍问题**：经典的"选与不选"类DP问题，状态转移方程 `dp[i] = max(dp[i-1], dp[i-2] + nums[i])`
2. **路径问题**：二维DP的经典应用，状态转移 `dp[i][j] = dp[i-1][j] + dp[i][j-1]`
3. **空间优化技巧**：滚动数组、一维替代二维等方法降低空间复杂度
4. **双状态DP**：用两个变量分别表示不同状态（如偷/不偷）

### DP进阶模式

| 模式 | 典型题目 | 特征 | 关键思路 |
|------|----------|------|----------|
| 间隔选择 | 打家劫舍 | 相邻元素不能同时选择 | `选i` vs `不选i` |
| 路径计数 | 不同路径 | 从起点到终点的方案数 | `左上角`到`右下角` |
| 区间合并 | 石子合并 | 将区间合并为一个值 | 枚举分割点 |
| 背包问题 | 01背包 | 有限容量下的价值最大化 | `放`vs`不放` |

### DP优化技巧

| 技巧 | 应用场景 | 效果 |
|------|----------|------|
| 滚动数组 | 线性DP | 空间复杂度从O(n)降到O(1) |
| 降维优化 | 二维DP | 空间复杂度从O(mn)降到O(min(m,n)) |
| 前缀和 | 区间查询 | 查询时间从O(n)降到O(1) |
| 单调队列 | 单调约束DP | 转移时间从O(n)降到O(1) |

### 相似题目推荐

- [打家劫舍 II](https://leetcode.cn/problems/house-robber-ii/) - 环形数组
- [打家劫舍 III](https://leetcode.cn/problems/house-robber-iii/) - 树形DP
- [最小路径和](https://leetcode.cn/problems/minimum-path-sum/) - 带权重的路径
- [不同路径 II](https://leetcode.cn/problems/unique-paths-ii/) - 带障碍物的路径
- [地下城游戏](https://leetcode.cn/problems/dungeon-game/) - 反向DP

### 明日计划

- Day 25 动态规划高阶
- 练习：背包问题、区间DP等