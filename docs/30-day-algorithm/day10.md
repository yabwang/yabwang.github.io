---
order: 10
---

# Day 10 - 双指针进阶

> 📅 日期：2026年1月17日  
> 🎯 主题：双指针进阶 + 接雨水与荷兰国旗

## 今日题目

### 题目1：接雨水 (Trapping Rain Water)

**难度**：⭐⭐⭐ 困难

**链接**：[LeetCode 42. 接雨水](https://leetcode.cn/problems/trapping-rain-water/)

#### 题目描述

给定 `n` 个非负整数表示每个宽度为 `1` 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。

**示例：**
```
输入：height = [0,1,0,2,1,0,1,3,2,1,2,1]
输出：6
解释：上面是由数组 [0,1,0,2,1,0,1,3,2,1,2,1] 表示的高度图，在这种情况下，可以接 6 个单位的雨水。

输入：height = [4,2,0,3,2,5]
输出：9
```

**提示**：
- `n == height.length`
- `1 <= n <= 2 * 10^4`
- `0 <= height[i] <= 10^5`

#### 解题思路

**方法一：双指针（首尾向中间）** ✅ 推荐

核心思想：
1. 每个位置能接的水 = 该位置左右两侧**最高高度**的**较小值**减去当前高度
2. 用 `left`、`right` 从两端向中间扫描，维护 `leftMax`、`rightMax`
3. 若 `height[left] < height[right]`，说明左侧瓶颈更小，用 `leftMax` 算 left 处水量，并右移 left、更新 leftMax
4. 否则用 `rightMax` 算 right 处水量，并左移 right、更新 rightMax
5. 每次在较矮的一侧结算水量，保证该位置的水量由「这一侧的最大值」决定且另一侧不会更低

**关键点**：
- 不必真的求每个位置左右两侧最大值，双指针在移动时动态维护即可
- 时间复杂度 O(n)，空间复杂度 O(1)

**方法二：动态规划**

预处理 `leftMax[i]`、`rightMax[i]`，再对每个位置 `i` 累加 `min(leftMax[i], rightMax[i]) - height[i]`。时间 O(n)，空间 O(n)。

**方法三：单调栈**

按列或按块用单调栈求「当前比栈顶低」的凹槽，逐块算面积。时间 O(n)，空间 O(n)。

#### 代码实现

**方法一：双指针**
```java
class Solution {
    public int trap(int[] height) {
        if (height == null || height.length <= 2) {
            return 0;
        }

        int left = 0;
        int right = height.length - 1;
        int leftMax = 0;
        int rightMax = 0;
        int water = 0;

        while (left < right) {
            // 较矮的一侧决定当前可接的水量
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) {
                    leftMax = height[left];
                } else {
                    water += leftMax - height[left];
                }
                left++;
            } else {
                if (height[right] >= rightMax) {
                    rightMax = height[right];
                } else {
                    water += rightMax - height[right];
                }
                right--;
            }
        }

        return water;
    }
}
```

#### 复杂度分析

- 时间复杂度：O(n)，一次遍历
- 空间复杂度：O(1)

---

### 题目2：颜色分类 (Sort Colors)

**难度**：⭐⭐ 中等

**链接**：[LeetCode 75. 颜色分类](https://leetcode.cn/problems/sort-colors/)

#### 题目描述

给定一个包含红色、白色和蓝色、共 `n` 个元素的数组 `nums`，**原地**对它们进行排序，使得相同颜色的元素相邻，并按照红色、白色、蓝色顺序排列。

我们使用整数 `0`、`1` 和 `2` 分别表示红色、白色和蓝色。

必须在不使用库的 sort 函数的情况下解决这个问题。

**示例：**
```
输入：nums = [2,0,2,1,1,0]
输出：[0,0,1,1,2,2]

输入：nums = [2,0,1]
输出：[0,1,2]
```

**提示**：
- `n == nums.length`
- `1 <= n <= 300`
- `nums[i]` 为 0、1 或 2

#### 解题思路

**方法一：双指针（三指针 / 荷兰国旗）** ✅ 推荐

核心思想：
1. 将数组划分为三段：`[0, p0)` 全为 0，`[p0, i)` 全为 1，`[p2, n)` 全为 2
2. 使用 `p0` 指向下一个 0 要放的位置，`p2` 指向下一个 2 要放的位置，`i` 为当前扫描指针
3. 当 `nums[i] == 0`：与 `p0` 交换，`p0++`，`i++`
4. 当 `nums[i] == 2`：与 `p2` 交换，`p2--`，**此时不增加 i**（换过来的可能是 0 或 1，需要再处理）
5. 当 `nums[i] == 1`：`i++`
6. 循环条件：`i <= p2`

**关键点**：
- 与 p2 交换后不能 i++，因为换过来的数还未分类
- 时间复杂度 O(n)，空间复杂度 O(1)

**方法二：两次遍历**

第一次把 0 换到前面，第二次把 1 换到 0 后面。时间 O(n)，空间 O(1)。

#### 代码实现

**方法一：三指针（荷兰国旗）**
```java
class Solution {
    public void sortColors(int[] nums) {
        if (nums == null || nums.length <= 1) {
            return;
        }

        int p0 = 0;           // 下一个 0 要放的位置
        int p2 = nums.length - 1;  // 下一个 2 要放的位置
        int i = 0;

        while (i <= p2) {
            if (nums[i] == 0) {
                swap(nums, i, p0);
                p0++;
                i++;
            } else if (nums[i] == 2) {
                swap(nums, i, p2);
                p2--;
                // 不 i++，换过来的数可能为 0 或 1，需要再判断
            } else {
                i++;
            }
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

- 时间复杂度：O(n)，每个元素最多被访问两次
- 空间复杂度：O(1)

---

## 今日总结

### 学到了什么？

1. **接雨水双指针**：首尾向中间，在「较矮的一侧」结算水量并维护该侧最大值
2. **荷兰国旗**：三区间划分，用 p0 / p2 / i 三个指针一次遍历完成 0-1-2 排序
3. **交换后不移动 i**：与 p2 交换后不 i++，保证换过来的元素被再次处理

### 关键技巧

| 技巧         | 适用场景           | 时间复杂度 | 空间复杂度 |
|--------------|--------------------|------------|------------|
| 首尾双指针   | 接雨水、盛水等     | O(n)       | O(1)       |
| 三指针划分   | 0/1/2 或三段分类   | O(n)       | O(1)       |
| 较矮侧结算   | 依赖左右最大/最小值 | O(n)       | O(1)       |

### 双指针进阶要点

1. **接雨水类**：
   - 每个位置水量由「左右最大高度的较小值」决定
   - 双指针在较矮的一侧结算，可避免预处理左右最大值数组

2. **多段划分（荷兰国旗）**：
   - 维护多个边界指针，一次遍历把元素归到对应区间
   - 与「右边界」交换时注意是否要再次检查当前位

3. **常见错误**：
   - 接雨水：忘记处理 length <= 2 或空数组
   - 颜色分类：nums[i]==2 时与 p2 交换后误将 i++，导致 2 未被换到末尾

### 相似题目推荐

- [盛最多水的容器](https://leetcode.cn/problems/container-with-most-water/) - 首尾双指针
- [接雨水 II](https://leetcode.cn/problems/trapping-rain-water-ii/) - 三维接雨水
- [移动零](https://leetcode.cn/problems/move-zeroes/) - 双指针划分 0 与非 0
- [删除有序数组中的重复项](https://leetcode.cn/problems/remove-duplicates-from-sorted-array/) - 同向双指针

### 明日计划

- Day 11 滑动窗口
- 练习：长度最小的子数组、最小覆盖子串等
