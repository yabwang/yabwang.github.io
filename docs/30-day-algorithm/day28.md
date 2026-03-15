---
order: 28
---

# Day 28 - 二分查找

> 📅 日期：2026 年 3 月 14 日
> 🎯 主题：二分查找 - 旋转数组与峰值元素

## 今日题目

### 题目 1：搜索旋转排序数组 (Search in Rotated Sorted Array)

**难度**：⭐⭐⭐ 中等偏难

**链接**：[LeetCode 33. 搜索旋转排序数组](https://leetcode.cn/problems/search-in-rotated-sorted-array/)

#### 题目描述

整数数组 `nums` 按升序排列，数组中的值互不相同。

在传递给函数之前，`nums` 在预先未知的某个下标 `k`（`0 <= k < nums.length`）上进行了旋转，使数组变为 `[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]`（下标从 0 开始计数）。例如，`[0,1,2,4,5,6,7]` 在下标 3 处经过旋转后可能变成 `[4,5,6,7,0,1,2]`。

给你旋转后的数组 `nums` 和一个整数 `target`，如果 `nums` 中存在这个目标值 `target`，则返回它的下标，否则返回 `-1`。

你必须设计一个时间复杂度为 `O(log n)` 的算法解决此问题。

**示例：**
```
输入：nums = [4,5,6,7,0,1,2], target = 0
输出：4

输入：nums = [4,5,6,7,0,1,2], target = 3
输出：-1

输入：nums = [1], target = 0
输出：-1
```

**提示**：
- `1 <= nums.length <= 5000`
- `-10^4 <= nums[i] <= 10^4`
- `nums` 中的每个值都独一无二
- `nums` 肯定会在某个点上旋转
- `-10^4 <= target <= 10^4`

#### 解题思路

**方法：二分查找变形**

核心思想：
1. 旋转后的数组虽然不是完全有序，但从中间分开，至少有一侧是有序的
2. 每次二分后，判断哪一侧是有序的
3. 如果目标值在有序侧的范围内，则在该侧查找；否则在另一侧查找

**关键点**：
- 如何判断哪侧有序：比较 `nums[left]` 和 `nums[mid]`
  - 如果 `nums[left] <= nums[mid]`，左侧有序
  - 否则右侧有序
- 如何在有序侧判断目标值是否存在：检查 `target` 是否在该侧的范围内

**算法步骤**：
1. 初始化 `left = 0`, `right = n - 1`
2. 当 `left <= right` 时循环：
   - 计算中点 `mid = left + (right - left) / 2`
   - 如果 `nums[mid] == target`，返回 `mid`
   - 如果左侧有序 (`nums[left] <= nums[mid]`)：
     - 如果 `nums[left] <= target < nums[mid]`，则 `right = mid - 1`
     - 否则 `left = mid + 1`
   - 如果右侧有序：
     - 如果 `nums[mid] < target <= nums[right]`，则 `left = mid + 1`
     - 否则 `right = mid - 1`
3. 未找到返回 `-1`

#### 代码实现

```java
class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;

            if (nums[mid] == target) {
                return mid;
            }

            // 判断左侧是否有序
            if (nums[left] <= nums[mid]) {
                // 左侧有序
                if (nums[left] <= target && target < nums[mid]) {
                    // target 在左侧范围内
                    right = mid - 1;
                } else {
                    // target 在右侧
                    left = mid + 1;
                }
            } else {
                // 右侧有序
                if (nums[mid] < target && target <= nums[right]) {
                    // target 在右侧范围内
                    left = mid + 1;
                } else {
                    // target 在左侧
                    right = mid - 1;
                }
            }
        }

        return -1;
    }
}
```

**递归解法：**
```java
class Solution {
    public int search(int[] nums, int target) {
        return searchHelper(nums, target, 0, nums.length - 1);
    }

    private int searchHelper(int[] nums, int target, int left, int right) {
        if (left > right) {
            return -1;
        }

        int mid = left + (right - left) / 2;

        if (nums[mid] == target) {
            return mid;
        }

        // 左侧有序
        if (nums[left] <= nums[mid]) {
            if (nums[left] <= target && target < nums[mid]) {
                return searchHelper(nums, target, left, mid - 1);
            } else {
                return searchHelper(nums, target, mid + 1, right);
            }
        } else {
            // 右侧有序
            if (nums[mid] < target && target <= nums[right]) {
                return searchHelper(nums, target, mid + 1, right);
            } else {
                return searchHelper(nums, target, left, mid - 1);
            }
        }
    }
}
```

#### 复杂度分析

- 时间复杂度：O(log n) - 每次二分将问题规模减半
- 空间复杂度：O(1) - 迭代版本；O(log n) - 递归版本（递归栈）

---

### 题目 2：寻找峰值 (Find Peak Element)

**难度**：⭐⭐ 中等

**链接**：[LeetCode 162. 寻找峰值](https://leetcode.cn/problems/find-peak-element/)

#### 题目描述

峰值元素是指其值严格大于左右相邻值的元素。

给你一个整数数组 `nums`，找到峰值元素并返回其索引。数组可能包含多个峰值，在这种情况下，返回任何一个峰值所在位置即可。

你可以假设 `nums[-1] = nums[n] = -∞`。

你必须实现时间复杂度为 `O(log n)` 的算法来解决此问题。

**示例：**
```
输入：nums = [1,2,3,1]
输出：2
解释：3 是峰值元素，你的函数应该返回其索引 2。

输入：nums = [1,2,1,3,5,6,4]
输出：1 或 5
解释：你的函数可以返回索引 1，此时峰值元素为 2；
     或者返回索引 5，此时峰值元素为 6。
```

**提示**：
- `1 <= nums.length <= 1000`
- `-2^31 <= nums[i] <= 2^31 - 1`
- 对于所有有效的 `i` 都有 `nums[i] != nums[i + 1]`

#### 解题思路

**方法：二分查找**

核心思想：
1. 题目保证 `nums[-1] = nums[n] = -∞`，所以峰值一定存在
2. 使用二分查找，每次向更高的方向移动
3. 如果 `nums[mid] < nums[mid + 1]`，说明右侧有峰值（因为最右端是 -∞）
4. 如果 `nums[mid] > nums[mid + 1]`，说明左侧有峰值（包括 mid 本身）

**为什么可以向更高的方向移动？**
- 假设我们从 mid 向右侧移动（因为 `nums[mid] < nums[mid + 1]`）
- 如果右侧一直上升，那么最后一个元素就是峰值（因为它右侧是 -∞）
- 如果右侧中途开始下降，那么下降前的那个点就是峰值
- 所以右侧一定存在峰值

**算法步骤**：
1. 初始化 `left = 0`, `right = n - 1`
2. 当 `left < right` 时循环（注意不是 `<=`）：
   - 计算中点 `mid = left + (right - left) / 2`
   - 如果 `nums[mid] < nums[mid + 1]`，则 `left = mid + 1`
   - 否则 `right = mid`
3. 返回 `left`（此时 `left == right`）

#### 代码实现

```java
class Solution {
    public int findPeakElement(int[] nums) {
        int left = 0, right = nums.length - 1;

        while (left < right) {
            int mid = left + (right - left) / 2;

            if (nums[mid] < nums[mid + 1]) {
                // 右侧有峰值
                left = mid + 1;
            } else {
                // 左侧有峰值（包括 mid）
                right = mid;
            }
        }

        return left;
    }
}
```

**递归解法：**
```java
class Solution {
    public int findPeakElement(int[] nums) {
        return searchPeak(nums, 0, nums.length - 1);
    }

    private int searchPeak(int[] nums, int left, int right) {
        if (left == right) {
            return left;
        }

        int mid = left + (right - left) / 2;

        if (nums[mid] < nums[mid + 1]) {
            // 右侧有峰值
            return searchPeak(nums, mid + 1, right);
        } else {
            // 左侧有峰值
            return searchPeak(nums, left, mid);
        }
    }
}
```

**对比：线性扫描解法（仅供理解，不满足 O(log n) 要求）**
```java
class Solution {
    public int findPeakElement(int[] nums) {
        if (nums.length == 1) return 0;

        // 检查第一个元素
        if (nums[0] > nums[1]) return 0;

        // 检查中间元素
        for (int i = 1; i < nums.length - 1; i++) {
            if (nums[i] > nums[i - 1] && nums[i] > nums[i + 1]) {
                return i;
            }
        }

        // 检查最后一个元素
        return nums.length - 1;
    }
}
```

#### 复杂度分析

- 时间复杂度：O(log n) - 二分查找
- 空间复杂度：O(1) - 迭代版本；O(log n) - 递归版本

---

## 今日总结

### 学到了什么？

1. **旋转排序数组的二分查找**：
   - 旋转后至少有一侧是有序的
   - 先判断哪侧有序，再判断目标值是否在该侧范围内
   - 核心判断：`nums[left] <= nums[mid]` 判断左侧是否有序

2. **寻找峰值的二分查找**：
   - 向更高的方向移动，一定能找到峰值
   - 利用边界条件 `nums[-1] = nums[n] = -∞`
   - 循环条件用 `<` 而不是 `<=`

3. **二分查找的变形技巧**：
   - 不一定要完全有序，只要能判断目标在哪一侧即可
   - 关键是找到"单调性"或"方向性"

### 二分查找变形对比

| 题目类型 | 判断条件 | 移动策略 | 关键点 |
|----------|----------|----------|--------|
| 标准二分 | `nums[mid] == target` | 小于往右，大于往左 | 数组必须有序 |
| 旋转数组 | `nums[left] <= nums[mid]` | 判断哪侧有序，再决定方向 | 至少一侧有序 |
| 寻找峰值 | `nums[mid] < nums[mid+1]` | 往更高的方向移动 | 峰值必然存在 |

### 二分查找模板

**标准二分查找：**
```java
int binarySearch(int[] nums, int target) {
    int left = 0, right = nums.length - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;
}
```

**旋转数组二分查找：**
```java
int searchInRotated(int[] nums, int target) {
    int left = 0, right = nums.length - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] == target) return mid;

        // 左侧有序
        if (nums[left] <= nums[mid]) {
            if (nums[left] <= target && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            // 右侧有序
            if (nums[mid] < target && target <= nums[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }

    return -1;
}
```

**寻找峰值：**
```java
int findPeakElement(int[] nums) {
    int left = 0, right = nums.length - 1;

    while (left < right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] < nums[mid + 1]) {
            left = mid + 1;  // 右侧有峰值
        } else {
            right = mid;     // 左侧有峰值
        }
    }

    return left;
}
```

### 易错点提醒

1. **循环条件**：
   - `left <= right`：搜索具体值，需要检查每个位置
   - `left < right`：寻找满足条件的边界，最后 `left == right`

2. **中点计算**：
   - 使用 `left + (right - left) / 2` 防止溢出
   - 某些情况下可能需要上取整：`(left + right + 1) / 2`

3. **边界判断**：
   - 旋转数组中 `nums[left] <= nums[mid]` 要包含等号
   - 寻找峰值时不需要检查 `mid` 是否等于 `target`

### 相似题目推荐

- [寻找旋转排序数组中的最小值](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/) - 找旋转点
- [在排序数组中查找元素的第一个和最后一个位置](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/) - 二分边界
- [搜索二维矩阵](https://leetcode.cn/problems/search-a-2d-matrix/) - 二维二分
- [寻找峰值 II](https://leetcode.cn/problems/find-a-peak-element-ii/) - 二维峰值
- [山脉数组的峰顶索引](https://leetcode.cn/problems/peak-index-in-a-mountain-array/) - 峰值变形

### 明日计划

- Day 29 贪心算法
- 练习：区间问题、分配问题
