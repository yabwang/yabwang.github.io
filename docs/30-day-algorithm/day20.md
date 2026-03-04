---
order: 20
---

# Day 20 - 回溯

> 📅 日期：2026年1月27日
> 🎯 主题：回溯进阶 - 子集与组合总和

## 今日题目

### 题目1：子集 (Subsets)

**难度**：⭐⭐ 中等

**链接**：[LeetCode 78. 子集](https://leetcode.cn/problems/subsets/)

#### 题目描述

给你一个整数数组 `nums`，数组中的元素 **互不相同**。返回该数组所有可能的子集（幂集）。

解集 **不能** 包含重复的子集。你可以按 **任意顺序** 返回解集。

**示例：**
```
输入：nums = [1,2,3]
输出：[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]

输入：nums = [0]
输出：[[],[0]]
```

**提示**：
- `1 <= nums.length <= 10`
- `-10 <= nums[i] <= 10`
- `nums` 中的所有元素 **互不相同**

#### 解题思路

**方法一：回溯**

核心思想：
1. 子集问题是「选或不选」的典型场景，每个元素都有两种状态：选或不选
2. 也可以理解为：枚举每个起始位置，从该位置开始选若干个元素
3. 由于子集长度可以从 0 到 n，所以每进入一层都要把当前 path 加入结果

**关键点**：
- 与组合不同，子集需要收集所有长度的路径，不只是长度为 k 的
- 从 start 往后枚举，保证子集不重复

#### 代码实现

```java
import java.util.*;

class Solution {
    private List<List<Integer>> result = new ArrayList<>();
    private List<Integer> path = new ArrayList<>();

    public List<List<Integer>> subsets(int[] nums) {
        backtrack(nums, 0);
        return result;
    }

    private void backtrack(int[] nums, int start) {
        // 每个节点都是一个合法子集，直接加入结果
        result.add(new ArrayList<>(path));

        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            backtrack(nums, i + 1);
            path.remove(path.size() - 1);
        }
    }
}
```

**方法二：位运算**

对于 n 个元素，每个元素选或不选，共有 2^n 种可能，可以用 n 位二进制表示。

```java
import java.util.*;

class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        int n = nums.length;
        int total = 1 << n; // 2^n

        for (int mask = 0; mask < total; mask++) {
            List<Integer> subset = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0) {
                    subset.add(nums[i]);
                }
            }
            result.add(subset);
        }
        return result;
    }
}
```

#### 复杂度分析

- 时间复杂度：O(n * 2^n)，共有 2^n 个子集，每个子集平均 O(n) 时间构建
- 空间复杂度：O(n)，递归栈或临时数组

---

### 题目2：组合总和 (Combination Sum)

**难度**：⭐⭐ 中等

**链接**：[LeetCode 39. 组合总和](https://leetcode.cn/problems/combination-sum/)

#### 题目描述

给你一个 **无重复元素** 的整数数组 `candidates` 和一个目标整数 `target`，找出 `candidates` 中可以使数字和为目标数 `target` 的所有 **不同组合**，并以列表形式返回。

`candidates` 中的 **同一个** 数字可以 **无限制重复被选取**。如果至少一个数字的被选数量不同，则两种组合是不同的。

**示例：**
```
输入：candidates = [2,3,6,7], target = 7
输出：[[7],[2,2,3]]

输入：candidates = [2,3,5], target = 8
输出：[[2,2,2,2],[2,3,3],[3,5]]

输入：candidates = [2], target = 1
输出：[]
```

**提示**：
- `1 <= candidates.length <= 30`
- `2 <= candidates[i] <= 40`
- `candidates` 的所有元素 **互不相同**
- `1 <= target <= 40`

#### 解题思路

**方法一：回溯**

核心思想：
1. 每次从 start 位置开始枚举，可以选择当前数或跳过
2. 选择当前数后，下一层仍然可以从当前位置开始（因为可以重复选）
3. 当 sum == target 时收集结果，sum > target 时剪枝

**关键点**：
- 可重复选：递归时传入 `i` 而不是 `i + 1`
- 剪枝优化：排序后，如果当前数加 sum 已超过 target，后面更大的数也不用试了
- 去重：按顺序枚举，不从 0 开始，避免 [2,3] 和 [3,2] 重复

#### 代码实现

```java
import java.util.*;

class Solution {
    private List<List<Integer>> result = new ArrayList<>();
    private List<Integer> path = new ArrayList<>();

    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        Arrays.sort(candidates); // 排序以便剪枝
        backtrack(candidates, target, 0, 0);
        return result;
    }

    private void backtrack(int[] candidates, int target, int sum, int start) {
        if (sum == target) {
            result.add(new ArrayList<>(path));
            return;
        }

        for (int i = start; i < candidates.length; i++) {
            int num = candidates[i];
            // 剪枝：如果加上当前数已经超过 target，后面更大的数也不用试
            if (sum + num > target) {
                break;
            }
            path.add(num);
            // 可重复选，所以传入 i 而不是 i + 1
            backtrack(candidates, target, sum + num, i);
            path.remove(path.size() - 1);
        }
    }
}
```

#### 复杂度分析

- 时间复杂度：O(S)，S 为所有可行解的长度之和
- 空间复杂度：O(target)，递归栈深度最多 target/min(candidates)

---

## 今日总结

### 学到了什么？

1. **子集问题**：每层都要收集结果，因为每个节点都是一个合法子集
2. **组合总和**：可重复选时递归传入当前索引，不可重复选时传入下一索引
3. **剪枝技巧**：排序 + 超过 target 就 break，大幅减少搜索空间

### 回溯对比

| 题目类型     | 递归索引      | 收集时机           | 特殊处理 |
|--------------|---------------|--------------------|---------|
| 组合 (n选k)  | `i + 1`      | path.size() == k   | 剪枝优化 |
| 子集         | `i + 1`      | 每层都收集         | 无 |
| 组合总和     | `i` (可重复) | sum == target      | 排序剪枝 |
| 全排列       | 从 0 枚举    | path.size() == n   | used 数组 |

### 回溯通用模板

```java
void backtrack(参数) {
    if (终止条件) {
        收集结果;
        return;
    }
    for (选择 : 本层可选列表) {
        做选择;
        backtrack(下一层);
        撤销选择;
    }
}
```

### 相似题目推荐

- [子集 II](https://leetcode.cn/problems/subsets-ii/) - 含重复元素，需去重
- [组合总和 II](https://leetcode.cn/problems/combination-sum-ii/) - 每个数只能用一次
- [分割回文串](https://leetcode.cn/problems/palindrome-partitioning/) - 字符串分割 + 回溯
- [复原 IP 地址](https://leetcode.cn/problems/restore-ip-addresses/) - 分割 + 合法性判断

### 明日计划

- Day 21 贪心算法
- 练习：分发饼干、跳跃游戏等