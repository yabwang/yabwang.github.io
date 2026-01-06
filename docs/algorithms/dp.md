
# 动态规划

## Dynamic Programming

## LeetCode Hot 100 动态规划精选

### [70. 爬楼梯](https://leetcode.cn/problems/climbing-stairs/)

**解题思路**  
采用动态规划方法，定义dp数组存储到达每层台阶的方法数。状态转移方程：dp[i] = dp[i-1] + dp[i-2]，因为可以从前一级或前两级台阶上来。

```java
class Solution {
    public int climbStairs(int n) {
        if(n <= 2) return n;
        int[] dp = new int[n+1];
        dp[1] = 1;
        dp[2] = 2;
        for(int i=3; i<=n; i++){
            dp[i] = dp[i-1] + dp[i-2];
        }
        return dp[n];
    }
}
```

**复杂度分析**  
- 时间复杂度：O(n)  
- 空间复杂度：O(n)

### [322. 零钱兑换](https://leetcode.cn/problems/coin-change/)

**解题思路**  
完全背包问题变种，dp[i]表示组成金额i所需的最少硬币数。遍历每个硬币，更新状态：dp[i] = min(dp[i], dp[i-coin]+1)

```java
class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount+1];
        Arrays.fill(dp, amount+1);
        dp[0] = 0;
        
        for(int coin : coins) {
            for(int i=coin; i<=amount; i++) {
                dp[i] = Math.min(dp[i], dp[i-coin]+1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}
```

**复杂度分析**  
- 时间复杂度：O(n*amount)  
- 空间复杂度：O(amount)

### [121. 买卖股票的最佳时机](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/)

**解题思路**  
维护最低股价和最大利润，遍历价格数组，动态更新这两个值。只需一次扫描即可找到最佳买卖时机。

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        min_price = float('inf')
        max_profit = 0
        for price in prices:
            min_price = min(min_price, price)
            max_profit = max(max_profit, price - min_price)
        return max_profit
```

**复杂度分析**  
- 时间复杂度：O(n)  
- 空间复杂度：O(1)

### [1143. 最长公共子序列](https://leetcode.cn/problems/longest-common-subsequence/)
```java
class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        int[][] dp = new int[text1.length()+1][text2.length()+1];
        for(int i=1; i<=text1.length(); i++){
            for(int j=1; j<=text2.length(); j++){
                if(text1.charAt(i-1) == text2.charAt(j-1)) 
                    dp[i][j] = dp[i-1][j-1] + 1;
                else 
                    dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
            }
        }
        return dp[text1.length()][text2.length()];
    }
}
```

### [53. 最大子数组和](https://leetcode.cn/problems/maximum-subarray/)
```java
class Solution {
    public int maxSubArray(int[] nums) {
        int pre = 0, maxAns = nums[0];
        for (int x : nums) {
            pre = Math.max(pre + x, x);
            maxAns = Math.max(maxAns, pre);
        }
        return maxAns;
    }
}
```