---
order: 1
---

# Day 1 - 数组

> 📅 日期：2026年1月8日  
> 🎯 主题：数组基础 + 双指针

## 今日题目

### 题目1：两数之和 (Two Sum)

**难度**：⭐ 简单

**链接**：[LeetCode 1. 两数之和](https://leetcode.cn/problems/two-sum/)

#### 题目描述

给定一个整数数组 `nums` 和一个整数目标值 `target`，请你在该数组中找出**和为目标值** `target` 的那**两个**整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。

**示例：**
```
输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1]
```

#### 解题思路

**方法一：暴力枚举** O(n²)
- 两层循环，枚举所有组合

**方法二：哈希表** O(n) ✅ 推荐
- 遍历数组，对于每个元素 x，查找 target - x 是否在哈希表中
- 如果存在，返回结果；否则将 x 加入哈希表
- 一次遍历即可完成

#### 代码实现

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();

        for (int i = 0; i < nums.length; i++) {
            if (map.containsKey(target - nums[i])) {
                return new int[]{map.get(target - nums[i]), i};
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}
```

#### 复杂度分析

- 时间复杂度：O(n)，只需遍历一次数组
- 空间复杂度：O(n)，哈希表最多存储 n 个元素

---

### 题目2：盛最多水的容器 (Container With Most Water)

**难度**：⭐⭐ 中等

**链接**：[LeetCode 11. 盛最多水的容器](https://leetcode.cn/problems/container-with-most-water/)

#### 题目描述

给定一个长度为 `n` 的整数数组 `height`。有 `n` 条垂线，第 `i` 条线的两个端点是 `(i, 0)` 和 `(i, height[i])`。

找出其中的两条线，使得它们与 x 轴共同构成的容器可以容纳最多的水。返回容器可以储存的最大水量。

**示例：**
```
输入：[1,8,6,2,5,4,8,3,7]
输出：49 
解释：选择第2条线(高度8)和第9条线(高度7)，宽度为7，面积 = 7 * 7 = 49
```

#### 解题思路

**双指针法** ✅

核心思想：
1. 初始化左右指针分别指向数组两端
2. 计算当前容量 = min(height[left], height[right]) × (right - left)
3. **移动较短的那一边**（因为移动较长的一边，宽度减小，高度不可能增加，面积一定减小）
4. 重复直到左右指针相遇

**为什么移动较短的一边？**
- 容器的高度由较短的一边决定
- 移动较长的一边：宽度↓，高度≤原来 → 面积一定↓
- 移动较短的一边：宽度↓，高度可能↑ → 面积可能↑

#### 代码实现

```java
class Solution {
    public int maxArea(int[] height) {
        int left = 0, right = height.length - 1;
        int maxArea = 0;
        
        while(left < right){
            int area = Math.min(height[left], height[right]) * (right - left);
            maxArea = Math.max(area, maxArea);
            
            if(height[left] < height[right]) {
                left++;
            } else{
                right--;
            }
        }
    
        return maxArea;
    }
}
```

#### 复杂度分析

- 时间复杂度：O(n)，双指针最多遍历整个数组一次
- 空间复杂度：O(1)，只使用常数额外空间

---

## 今日总结

### 学到了什么？

1. **哈希表优化查找**：将 O(n) 的查找优化为 O(1)
2. **双指针技巧**：从两端向中间收缩，适用于有序数组或需要比较两端的场景
3. **贪心思想**：每次移动较短的边，保证不会错过最优解

### 关键技巧

| 技巧 | 适用场景 | 时间复杂度 |
|-----|---------|-----------|
| 哈希表 | 快速查找、去重、计数 | O(1) 查找 |
| 双指针 | 有序数组、两端比较 | O(n) |

### 明日计划

- Day 2 继续数组专题
- 练习：三数之和、移动零

