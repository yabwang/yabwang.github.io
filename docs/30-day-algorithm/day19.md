---
order: 19
---

# Day 19 - 回溯

> 📅 日期：2026年1月26日  
> 🎯 主题：回溯基础 - 组合与全排列

## 今日题目

### 题目1：组合 (Combinations)

**难度**：⭐⭐ 中等

**链接**：[LeetCode 77. 组合](https://leetcode.cn/problems/combinations/)

#### 题目描述

给定两个整数 `n` 和 `k`，返回范围 `[1, n]` 中所有可能的 `k` 个数的组合。

你可以按 **任何顺序** 返回答案。

**示例：**
```
输入：n = 4, k = 2
输出：[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]

输入：n = 1, k = 1
输出：[[1]]
```

**提示**：
- `1 <= n <= 20`
- `1 <= k <= n`

#### 解题思路

**方法一：回溯（DFS）** ✅ 推荐

核心思想：
1. 从数字 1 开始，每次「选」或「不选」，或按顺序「选当前然后从后面再选」
2. 用 path 记录当前已选数字，当 path.size() == k 时加入结果
3. 枚举起点 start，从 start 到 n 选一个数加入 path，然后递归从 start+1 往后选（保证组合不重复、顺序唯一）
4. 回溯时移除 path 最后一个元素

**关键点**：
- 组合无顺序，所以递归时从「当前选的数的下一个」开始枚举，避免 [1,2] 和 [2,1] 重复
- 剪枝：若剩余可选数量不足 k - path.size()，可提前结束

#### 代码实现

```java
import java.util.*;

class Solution {
    private List<List<Integer>> result = new ArrayList<>();
    private List<Integer> path = new ArrayList<>();

    public List<List<Integer>> combine(int n, int k) {
        backtrack(n, k, 1);
        return result;
    }

    private void backtrack(int n, int k, int start) {
        if (path.size() == k) {
            result.add(new ArrayList<>(path));
            return;
        }
        // 剪枝：剩余元素不够凑齐 k 个
        for (int i = start; i <= n - (k - path.size()) + 1; i++) {
            path.add(i);
            backtrack(n, k, i + 1);
            path.remove(path.size() - 1);
        }
    }
}
```

#### 复杂度分析

- 时间复杂度：O(C(n,k))，即组合数
- 空间复杂度：O(k)，path 与递归栈

---

### 题目2：全排列 (Permutations)

**难度**：⭐⭐ 中等

**链接**：[LeetCode 46. 全排列](https://leetcode.cn/problems/permutations/)

#### 题目描述

给定一个不含重复数字的数组 `nums`，返回其 **所有可能的全排列**。你可以按 **任意顺序** 返回答案。

**示例：**
```
输入：nums = [1,2,3]
输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]

输入：nums = [0,1]
输出：[[0,1],[1,0]]

输入：nums = [1]
输出：[[1]]
```

**提示**：
- `1 <= nums.length <= 6`
- `-10 <= nums[i] <= 10`
- `nums` 中的所有整数 **互不相同**

#### 解题思路

**方法一：回溯 +  used 数组** ✅ 推荐

核心思想：
1. 用 path 记录当前排列，用 used[i] 表示 nums[i] 是否已在 path 中
2. 每一层枚举一个「未使用」的数加入 path，然后递归填下一个位置
3. 当 path.size() == nums.length 时得到一个排列，加入结果
4. 回溯时从 path 移除该数，并把 used[i] 置回 false

**关键点**：
- 排列有顺序，所以每层都要枚举所有未使用的数，而不是只从 start 往后
- 时间复杂度 O(n!)，空间 O(n)

#### 代码实现

```java
import java.util.*;

class Solution {
    private List<List<Integer>> result = new ArrayList<>();
    private List<Integer> path = new ArrayList<>();
    private boolean[] used;

    public List<List<Integer>> permute(int[] nums) {
        used = new boolean[nums.length];
        backtrack(nums);
        return result;
    }

    private void backtrack(int[] nums) {
        if (path.size() == nums.length) {
            result.add(new ArrayList<>(path));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) {
                continue;
            }
            path.add(nums[i]);
            used[i] = true;
            backtrack(nums);
            path.remove(path.size() - 1);
            used[i] = false;
        }
    }
}
```

**方法二：回溯 + 交换（原地）**

用下标 first 表示当前要填的位置，用 first 及之后的元素与 first 交换来枚举该位置填谁，递归 first+1，再交换回来。

```java
import java.util.*;

class Solution {
    private List<List<Integer>> result = new ArrayList<>();

    public List<List<Integer>> permute(int[] nums) {
        backtrack(nums, 0);
        return result;
    }

    private void backtrack(int[] nums, int first) {
        if (first == nums.length) {
            List<Integer> list = new ArrayList<>();
            for (int num : nums) {
                list.add(num);
            }
            result.add(list);
            return;
        }
        for (int i = first; i < nums.length; i++) {
            swap(nums, first, i);
            backtrack(nums, first + 1);
            swap(nums, first, i);
        }
    }

    private void swap(int[] nums, int i, int j) {
        int t = nums[i];
        nums[i] = nums[j];
        nums[j] = t;
    }
}
```

#### 复杂度分析

- 时间复杂度：O(n!)，排列数
- 空间复杂度：O(n)，path/used 或递归栈

---

## 今日总结

### 学到了什么？

1. **回溯模板**：path 记录当前选择 → 达到条件则收集 → 枚举选项 → 做选择、递归、撤销选择
2. **组合**：从 start 往后选，保证「顺序唯一」从而不重复；可剪枝（剩余不够不枚举）
3. **全排列**：每层枚举所有未使用的数，用 used 或交换实现
4. **结果收集**：`result.add(new ArrayList<>(path))`，避免把 path 引用加入导致后续被修改

### 关键技巧

| 技巧           | 适用场景           | 说明 |
|----------------|--------------------|------|
| start 枚举     | 组合、子集（不重复）| 只从当前往后选，避免 [1,2][2,1] 重复 |
| used 标记      | 全排列、含重复排列 | 每层枚举所有未使用元素 |
| 剪枝           | 组合、子集         | 剩余数量不足时提前 return 或缩小 i 上界 |
| 拷贝 path      | 所有回溯           | 加入结果时 new ArrayList<>(path) |

### 回溯要点

1. **组合 vs 排列**：组合从 start 递增枚举；排列每层枚举全部未使用。
2. **回溯三步**：做选择 → 递归 → 撤销选择。
3. **常见错误**：结果里直接 add(path) 导致后续 path 被改；排列时忘记 used 导致重复使用同一元素。

### 相似题目推荐

- [子集](https://leetcode.cn/problems/subsets/) - 无长度限制的「组合」
- [全排列 II](https://leetcode.cn/problems/permutations-ii/) - 含重复数字，需去重
- [组合总和](https://leetcode.cn/problems/combination-sum/) - 可重复选、目标和
- [括号生成](https://leetcode.cn/problems/generate-parentheses/) - 括号合法性 + 回溯

### 明日计划

- Day 20 回溯
- 练习：子集、组合总和、分割回文串等
