---
order: 25
---

# Day 25 - 动态规划高阶

> 📅 日期：2026年3月11日
> 🎯 主题：动态规划高阶 - 背包问题与回文子串

## 今日题目

### 题目1：01背包问题 (0-1 Knapsack Problem)

**难度**：⭐⭐⭐ 中等偏难

**链接**：[经典DP问题](https://www.***.com/problem/knapsack)

#### 题目描述

有 `N` 件物品和一个容量是 `V` 的背包。第 `i` 件物品的体积是 `vi`，价值是 `wi`。求将哪些物品装入背包，可使这些物品的总体积不超过背包容量，且总价值最大。

**示例：**
```
输入：N=4, V=5, 
     volumes=[1,2,3,4], values=[2,4,4,5]
输出：8
解释：选择第1件物品(体积1,价值2)和第4件物品(体积4,价值5)，总体积5，总价值7
     或者选择第2件物品(体积2,价值4)和第3件物品(体积3,价值4)，总体积5，总价值8
```

**提示**：
- `0 < N ≤ 1000`
- `0 < V ≤ 1000`
- `0 < vi, wi ≤ 1000`

#### 解题思路

**方法一：二维动态规划**

核心思想：
1. 设 `dp[i][j]` 表示考虑前 `i` 件物品，背包容量为 `j` 时的最大价值
2. 状态转移方程：
   - `dp[i][j] = max(dp[i-1][j], dp[i-1][j-volumes[i]] + values[i])` (当j≥volumes[i])
   - `dp[i][j] = dp[i-1][j]` (当j<volumes[i])
3. 边界条件：`dp[0][j] = 0`，`dp[i][0] = 0`

**方法二：一维动态规划（空间优化）**
- 从二维优化到一维：`dp[j] = max(dp[j], dp[j-volumes[i]] + values[i])`
- 注意：必须逆序遍历容量，防止重复选择同一物品

#### 代码实现

```java
// 二维DP解法
class Solution {
    public int knapsack(int N, int V, int[] volumes, int[] values) {
        int[][] dp = new int[N + 1][V + 1];
        
        for (int i = 1; i <= N; i++) {
            for (int j = 0; j <= V; j++) {
                // 不选择第i件物品
                dp[i][j] = dp[i-1][j];
                
                // 选择第i件物品（如果容量允许）
                if (j >= volumes[i-1]) {  // 注意数组下标
                    dp[i][j] = Math.max(dp[i][j], 
                                      dp[i-1][j - volumes[i-1]] + values[i-1]);
                }
            }
        }
        
        return dp[N][V];
    }
}
```

**空间优化版（一维数组）：**
```java
class Solution {
    public int knapsack(int N, int V, int[] volumes, int[] values) {
        int[] dp = new int[V + 1];
        
        for (int i = 0; i < N; i++) {
            // 必须逆序遍历，避免重复选择同一物品
            for (int j = V; j >= volumes[i]; j--) {
                dp[j] = Math.max(dp[j], dp[j - volumes[i]] + values[i]);
            }
        }
        
        return dp[V];
    }
}
```

#### 复杂度分析

- 时间复杂度：O(N*V)
- 空间复杂度：O(V) - 一维优化版；O(N*V) - 二维版

---

### 题目2：最长回文子串 (Longest Palindromic Substring)

**难度**：⭐⭐⭐ 中等偏难

**链接**：[LeetCode 5. 最长回文子串](https://leetcode.cn/problems/longest-palindromic-substring/)

#### 题目描述

给你一个字符串 `s`，找到 `s` 中最长的回文子串。

**示例：**
```
输入：s = "babad"
输出："bab"
解释："aba" 同样是符合题意的答案。

输入：s = "cbbd"
输出："bb"
```

**提示**：
- `1 <= s.length <= 1000`
- `s` 仅由数字和英文字母组成

#### 解题思路

**方法一：中心扩展法**

核心思想：
1. 枚举每个可能的回文中心（奇数长度回文串有n个中心，偶数长度回文串有n-1个中心）
2. 从中心向外扩展，直到不满足回文性质
3. 记录最长的回文子串

**方法二：动态规划**

核心思想：
1. 设 `dp[i][j]` 表示字符串从索引 `i` 到 `j` 是否为回文串
2. 状态转移方程：`dp[i][j] = (s[i] == s[j]) && dp[i+1][j-1]`
3. 边界条件：`dp[i][i] = true`，`dp[i][i+1] = (s[i] == s[i+1])`

#### 代码实现

```java
// 动态规划解法
class Solution {
    public String longestPalindrome(String s) {
        int n = s.length();
        if (n < 2) return s;
        
        boolean[][] dp = new boolean[n][n];
        String ans = "";
        
        // 单个字符都是回文
        for (int i = 0; i < n; i++) {
            dp[i][i] = true;
        }
        
        ans = s.substring(0, 1);  // 至少第一个字符是回文
        
        // 按长度递增枚举
        for (int len = 2; len <= n; len++) {
            for (int i = 0; i <= n - len; i++) {
                int j = i + len - 1;
                
                if (s.charAt(i) == s.charAt(j)) {
                    if (len == 2) {
                        dp[i][j] = true;
                    } else {
                        dp[i][j] = dp[i+1][j-1];
                    }
                    
                    if (dp[i][j] && len > ans.length()) {
                        ans = s.substring(i, j + 1);
                    }
                }
            }
        }
        
        return ans;
    }
}
```

**中心扩展法（效率更高）：**
```java
class Solution {
    public String longestPalindrome(String s) {
        if (s == null || s.length() < 1) return "";
        
        int start = 0, end = 0;
        
        for (int i = 0; i < s.length(); i++) {
            int len1 = expandAroundCenter(s, i, i);      // 奇数长度回文
            int len2 = expandAroundCenter(s, i, i + 1);  // 偶数长度回文
            int len = Math.max(len1, len2);
            
            if (len > end - start) {
                start = i - (len - 1) / 2;
                end = i + len / 2;
            }
        }
        
        return s.substring(start, end + 1);
    }
    
    private int expandAroundCenter(String s, int left, int right) {
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            left--;
            right++;
        }
        return right - left - 1;
    }
}
```

#### 复杂度分析

- 时间复杂度：O(n²) - 动态规划；O(n²) - 中心扩展法
- 空间复杂度：O(n²) - 动态规划；O(1) - 中心扩展法

---

## 今日总结

### 学到了什么？

1. **01背包问题**：经典的DP模型，状态转移 `dp[j] = max(dp[j], dp[j-weight[i]] + value[i])`
2. **最长回文子串**：区间DP或中心扩展法，状态转移 `dp[i][j] = (s[i]==s[j]) && dp[i+1][j-1]`
3. **空间优化技巧**：01背包的一维优化，需逆序遍历防止重复选择
4. **区间DP**：以区间端点为状态的动态规划

### DP高阶模式

| 模式 | 典型题目 | 特征 | 关键思路 |
|------|----------|------|----------|
| 背包DP | 01背包、完全背包 | 有限容量下的价值最大化 | 选/不选物品的状态转移 |
| 区间DP | 最长回文子串、石子合并 | 在区间上进行状态转移 | 枚举分割点，合并区间 |
| 树形DP | 树的最大独立集 | 在树结构上进行DP | 递归处理子树，合并结果 |
| 状态压缩DP | 旅行商问题 | 状态集合用位运算表示 | 用二进制位表示状态集合 |

### DP进阶优化技巧

| 技巧 | 应用场景 | 效果 |
|------|----------|------|
| 单调队列优化 | 单调约束DP | 转移时间从O(n)降到O(1) |
| 斜率优化 | 满足斜率单调性的DP | 转移时间从O(n)降到O(logn)或O(1) |
| 四边形不等式优化 | 满足四边形不等式的区间DP | 时间复杂度从O(n³)降到O(n²) |
| 矩阵快速幂优化 | 线性递推关系 | 时间复杂度从O(n)降到O(logn) |

### 相似题目推荐

- [零钱兑换](https://leetcode.cn/problems/coin-change/) - 完全背包变形
- [最长回文子序列](https://leetcode.cn/problems/longest-palindromic-subsequence/) - 区间DP
- [编辑距离](https://leetcode.cn/problems/edit-distance/) - 二维DP
- [正则表达式匹配](https://leetcode.cn/problems/regular-expression-matching/) - 复杂DP
- [通配符匹配](https://leetcode.cn/problems/wildcard-matching/) - 复杂DP

### 明日计划

- Day 26 图论基础
- 练习：深度优先搜索(DFS)、广度优先搜索(BFS)