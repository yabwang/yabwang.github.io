---
order: 29
---

# Day 29 - 贪心算法

> 📅 日期：2026年3月15日
> 🎯 主题：贪心算法 - 区间调度与分配问题

## 今日题目

### 题目1：无重叠区间 (Non-overlapping Intervals)

**难度**：⭐⭐⭐ 中等偏难

**链接**：[LeetCode 435. 无重叠区间](https://leetcode.cn/problems/non-overlapping-intervals/)

#### 题目描述

给定一个区间的集合 `intervals`，其中 `intervals[i] = [start_i, end_i]`。返回需要移除区间的最小数量，使剩余区间互不重叠。

**示例：**
```
输入: intervals = [[1,2],[2,3],[3,4],[1,3]]
输出: 1
解释: 移除 [1,3] 后，剩下的区间没有重叠。

输入: intervals = [[1,2],[1,2],[1,2]]
输出: 2
解释: 你需要移除两个 [1,2] 来使剩下的区间没有重叠。

输入: intervals = [[1,2],[2,3]]
输出: 0
解释: 你不需要移除任何区间，因为它们已经是无重叠的了。
```

**提示：**
- `1 <= intervals.length <= 10^5`
- `intervals[i].length == 2`
- `-5 * 10^4 <= start_i < end_i <= 5 * 10^4`

#### 解题思路

**方法：贪心算法 - 按结束时间排序**

核心思想：
1. 这是一个经典的区间调度问题
2. 为了保留最多的区间，应该优先选择结束时间早的区间
3. 这样可以为后续的区间留出更多空间
4. 按结束时间排序，然后遍历，统计不重叠的区间数量

**贪心策略**：
- 局部最优：每次选择结束时间最早的区间
- 全局最优：最终保留最多的区间

**算法步骤**：
1. 按结束时间对区间进行排序
2. 初始化前一个区间的结束时间为负无穷
3. 遍历排序后的区间：
   - 如果当前区间的开始时间 >= 前一个区间的结束时间，则不重叠，保留该区间
   - 否则，该区间与前一个区间重叠，需要移除
4. 结果 = 总区间数 - 保留的区间数

#### 代码实现

```java
class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        if (intervals.length == 0) return 0;

        // 按结束时间排序
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));

        int count = 1;  // 保留的区间数，第一个区间总是保留
        int end = intervals[0][1];  // 当前保留区间的结束时间

        for (int i = 1; i < intervals.length; i++) {
            // 如果当前区间的开始时间 >= 前一个区间的结束时间，则不重叠
            if (intervals[i][0] >= end) {
                count++;
                end = intervals[i][1];
            }
            // 否则重叠，跳过当前区间（相当于移除）
        }

        // 需要移除的数量 = 总数 - 保留的数量
        return intervals.length - count;
    }
}
```

**另一种思路：直接统计需要移除的区间**
```java
class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        if (intervals.length == 0) return 0;

        // 按结束时间排序
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));

        int removeCount = 0;
        int prevEnd = intervals[0][1];

        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] < prevEnd) {
                // 重叠，需要移除一个区间
                // 贪心：保留结束时间早的区间
                removeCount++;
            } else {
                // 不重叠，更新结束时间
                prevEnd = intervals[i][1];
            }
        }

        return removeCount;
    }
}
```

#### 复杂度分析

- 时间复杂度：O(n log n) - 排序的时间复杂度
- 空间复杂度：O(1) - 只使用常数额外空间

---

### 题目2：分发饼干 (Assign Cookies)

**难度**：⭐⭐ 简单偏中等

**链接**：[LeetCode 455. 分发饼干](https://leetcode.cn/problems/assign-cookies/)

#### 题目描述

假设你是一位很棒的家长，想要给你的孩子们一些小饼干。但是，每个孩子最多只能给一块饼干。

对每个孩子 `i`，都有一个胃口值 `g[i]`，这是能让孩子们满足胃口的饼干的最小尺寸；并且每块饼干 `j`，都有一个尺寸 `s[j]`。如果 `s[j] >= g[i]`，我们可以将这个饼干 `j` 分配给孩子 `i`，这个孩子会得到满足。你的目标是尽可能满足越多数量的孩子，并输出这个最大数值。

**示例：**
```
输入: g = [1,2,3], s = [1,1]
输出: 1
解释: 
你有三个孩子和两块小饼干，3个孩子的胃口值分别是：1,2,3。
虽然你有两块小饼干，由于他们的尺寸都是1，你只能让胃口值是1的孩子满足。
所以你应该输出1。

输入: g = [1,2], s = [1,2,3]
输出: 2
解释: 
你有两个孩子和三块小饼干，2个孩子的胃口值分别是1,2。
你拥有的饼干数量和尺寸都足以让所有孩子满足。
所以你应该输出2。
```

**提示：**
- `1 <= g.length <= 3 * 10^4`
- `0 <= s.length <= 3 * 10^4`
- `1 <= g[i], s[j] <= 2^31 - 1`

#### 解题思路

**方法：贪心算法 - 双指针**

核心思想：
1. 为了满足最多的孩子，应该用较小的饼干去满足胃口较小的孩子
2. 这样可以保留较大的饼干给胃口较大的孩子
3. 先对孩子胃口和饼干尺寸排序，然后用双指针遍历

**贪心策略**：
- 局部最优：用能满足当前孩子的最小饼干
- 全局最优：满足最多的孩子

**算法步骤**：
1. 将孩子胃口数组 `g` 和饼干尺寸数组 `s` 排序
2. 使用双指针分别指向当前孩子和当前饼干
3. 如果当前饼干能满足当前孩子，则分配并移动两个指针
4. 否则，尝试下一个更大的饼干

#### 代码实现

```java
class Solution {
    public int findContentChildren(int[] g, int[] s) {
        // 排序孩子胃口和饼干尺寸
        Arrays.sort(g);
        Arrays.sort(s);

        int childIndex = 0;    // 当前孩子索引
        int cookieIndex = 0;   // 当前饼干索引
        int satisfied = 0;     // 满足的孩子数

        // 遍历饼干和孩子
        while (childIndex < g.length && cookieIndex < s.length) {
            // 如果当前饼干能满足当前孩子
            if (s[cookieIndex] >= g[childIndex]) {
                satisfied++;           // 满足的孩子数+1
                childIndex++;          // 移动到下一个孩子
            }
            // 无论是否满足，都要尝试下一块饼干
            cookieIndex++;
        }

        return satisfied;
    }
}
```

**另一种写法：**
```java
class Solution {
    public int findContentChildren(int[] g, int[] s) {
        Arrays.sort(g);
        Arrays.sort(s);

        int i = 0;  // 孩子指针
        for (int j = 0; j < s.length && i < g.length; j++) {
            // 如果当前饼干能满足当前孩子
            if (s[j] >= g[i]) {
                i++;  // 满足了一个孩子，移动孩子指针
            }
        }

        return i;  // 返回满足的孩子数
    }
}
```

#### 复杂度分析

- 时间复杂度：O(m log m + n log n) - m为孩子数，n为饼干数，主要是排序的时间
- 空间复杂度：O(1) - 只使用常数额外空间

---

## 今日总结

### 学到了什么？

1. **区间调度问题**：
   - 按结束时间排序是解决区间问题的关键策略
   - 优先选择结束时间早的区间，为后续区间留出更多空间
   - 无重叠区间问题：移除最少区间 = 保留最多区间

2. **分配问题**：
   - 贪心策略：用较小资源满足较小需求
   - 双指针技巧：分别指向两个有序数组
   - 分发饼干问题：小饼干满足小胃口，保留大饼干给大胃口

3. **贪心算法的核心**：
   - 局部最优解能导致全局最优解
   - 证明贪心策略的正确性是关键
   - 通常需要数学证明或反证法

### 贪心算法常见模式

| 模式 | 典型题目 | 贪心策略 | 关键点 |
|------|----------|----------|--------|
| 区间调度 | 无重叠区间 | 按结束时间排序，优先选择结束早的 | 结束时间决定后续选择 |
| 分配问题 | 分发饼干 | 小资源满足小需求 | 排序后双指针 |
| 区间合并 | 合并区间 | 按开始时间排序，逐个合并 | 比较当前区间与前一区间 |
| 活动选择 | 会议室预订 | 按结束时间排序，选择最早结束的 | 最优子结构证明 |

### 贪心算法 vs 动态规划

| 对比维度 | 贪心算法 | 动态规划 |
|----------|----------|----------|
| 基本思想 | 每步选择当前最优 | 考虑所有子问题最优解 |
| 时间复杂度 | 通常更低 | 通常更高 |
| 空间复杂度 | 通常更低 | 通常更高 |
| 适用问题 | 具有贪心选择性质 | 具有最优子结构 |
| 正确性证明 | 需要贪心选择性质 | 通常较直观 |

### 贪心算法证明技巧

1. **贪心选择性质**：证明局部最优选择是全局最优的一部分
2. **最优子结构**：问题的最优解包含子问题的最优解
3. **交换论证**：任意解可以通过交换变成贪心解而不变差
4. **反证法**：假设贪心解不是最优，推出矛盾

### 相似题目推荐

- [用最少数量的箭引爆气球](https://leetcode.cn/problems/minimum-number-of-arrows-to-burst-balloons/) - 区间交集
- [跳跃游戏](https://leetcode.cn/problems/jump-game/) - 贪心可达性
- [买卖股票的最佳时机 II](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/) - 贪心交易
- [分发糖果](https://leetcode.cn/problems/candy/) - 双向贪心
- [模拟行走机器人](https://leetcode.cn/problems/walking-robot-simulation/) - 方向贪心

### 明日计划

- Day 30 算法总结与面试准备
- 练习：综合算法题，复习前29天内容