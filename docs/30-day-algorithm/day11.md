---
order: 11
---

# Day 11 - 滑动窗口基础

> 📅 日期：2026年1月18日  
> 🎯 主题：滑动窗口基础 + 满足条件的最小子串/子数组

## 今日题目

### 题目1：长度最小的子数组 (Minimum Size Subarray Sum)

**难度**：⭐⭐ 中等

**链接**：[LeetCode 209. 长度最小的子数组](https://leetcode.cn/problems/minimum-size-subarray-sum/)

#### 题目描述

给定一个含有 `n` 个正整数的数组和一个正整数 `target`。

找出该数组中满足其和 **≥ target** 的长度最小的 **连续子数组** `[numsl, numsl+1, ..., numsr-1, numsr]`，并返回其长度。如果不存在符合条件的子数组，返回 `0`。

**示例：**
```
输入：target = 7, nums = [2,3,1,2,4,3]
输出：2
解释：子数组 [4,3] 是该条件下的长度最小的子数组。

输入：target = 4, nums = [1,4,4]
输出：1

输入：target = 11, nums = [1,1,1,1,1,1,1,1]
输出：0
```

**提示**：
- `1 <= target <= 10^9`
- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^4`

#### 解题思路

**方法一：滑动窗口** ✅ 推荐

核心思想：
1. 用 `left`、`right` 表示窗口 `[left, right]`，维护窗口内元素和 `sum`
2. `right` 右移，把 `nums[right]` 加入 `sum`
3. 当 `sum >= target` 时，用 `right - left + 1` 更新最小长度，然后 `left` 右移并减去 `nums[left]`，直到 `sum < target`
4. 重复直到 `right` 扫完数组

**关键点**：
- 所有数为正数，窗口扩大和增大、缩小和减小，满足单调性
- 时间复杂度 O(n)，空间复杂度 O(1)

#### 代码实现

```java
class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        if (nums == null || nums.length == 0) {
            return 0;
        }

        int left = 0;
        int sum = 0;
        int minLen = Integer.MAX_VALUE;

        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];

            while (sum >= target) {
                minLen = Math.min(minLen, right - left + 1);
                sum -= nums[left];
                left++;
            }
        }

        return minLen == Integer.MAX_VALUE ? 0 : minLen;
    }
}
```

#### 复杂度分析

- 时间复杂度：O(n)，每个元素最多进出一次窗口
- 空间复杂度：O(1)

---

### 题目2：最小覆盖子串 (Minimum Window Substring)

**难度**：⭐⭐⭐ 困难

**链接**：[LeetCode 76. 最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/)

#### 题目描述

给你一个字符串 `s`、一个字符串 `t`。返回 `s` 中涵盖 `t` 所有字符的最小子串。如果 `s` 中不存在涵盖 `t` 所有字符的子串，则返回空字符串 `""`。

**注意**：如果 `s` 中存在这样的子串，我们保证它是唯一的答案。

**示例：**
```
输入：s = "ADOBECODEBANC", t = "ABC"
输出："BANC"
解释：最小覆盖子串 "BANC" 包含来自字符串 t 的 'A'、'B' 和 'C'。

输入：s = "a", t = "a"
输出："a"

输入：s = "a", t = "aa"
输出：""
解释：t 中两个字符 'a' 均应包含在 s 的子串中，因此没有符合条件的子字符串。
```

**提示**：
- `1 <= s.length, t.length <= 10^5`
- `s` 和 `t` 由英文字母组成

#### 解题思路

**方法一：滑动窗口 + 哈希表** ✅ 推荐

核心思想：
1. 用哈希表 `need` 统计 `t` 中每个字符需要的次数，用 `window` 统计当前窗口中各字符出现次数
2. 用 `valid` 表示当前窗口内已满足「需要」的字符种类数（某字符在 window 中的次数 ≥ need 中的次数则算满足一种）
3. `right` 右移，将 `s[right]` 加入窗口，若该字符在 need 中且 window 中该字符次数达到 need，则 `valid++`
4. 当 `valid == need.size()` 时，窗口已覆盖 t 所有字符，尝试收缩：记录当前子串若更短则更新结果，`left` 右移并更新 window 和 valid
5. 重复直到 right 扫完

**关键点**：
- 用 `valid` 与 `need` 的大小比较判断是否覆盖 t，避免逐个比较
- 收缩时只有「移出后该字符次数小于 need」才 `valid--`

#### 代码实现

```java
import java.util.*;

class Solution {
    public String minWindow(String s, String t) {
        if (s == null || t == null || s.length() < t.length()) {
            return "";
        }

        Map<Character, Integer> need = new HashMap<>();
        Map<Character, Integer> window = new HashMap<>();

        for (int i = 0; i < t.length(); i++) {
            char c = t.charAt(i);
            need.put(c, need.getOrDefault(c, 0) + 1);
        }

        int left = 0;
        int valid = 0;
        int start = 0;
        int minLen = Integer.MAX_VALUE;

        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (need.containsKey(c)) {
                window.put(c, window.getOrDefault(c, 0) + 1);
                if (window.get(c).equals(need.get(c))) {
                    valid++;
                }
            }

            while (valid == need.size()) {
                if (right - left + 1 < minLen) {
                    minLen = right - left + 1;
                    start = left;
                }
                char leftChar = s.charAt(left);
                if (need.containsKey(leftChar)) {
                    if (window.get(leftChar).equals(need.get(leftChar))) {
                        valid--;
                    }
                    window.put(leftChar, window.get(leftChar) - 1);
                }
                left++;
            }
        }

        return minLen == Integer.MAX_VALUE ? "" : s.substring(start, start + minLen);
    }
}
```

#### 复杂度分析

- 时间复杂度：O(|s| + |t|)
- 空间复杂度：O(|s| + |t|)，哈希表存储字符

---

## 今日总结

### 学到了什么？

1. **满足条件的最短子数组**：右扩、一旦满足条件就左缩并更新答案，利用正数和的单调性
2. **覆盖子串**：用 need/window + valid 判断是否覆盖 t，收缩时先更新 valid 再移出字符
3. **Integer 比较**：`window.get(c).equals(need.get(c))` 避免缓存导致的 `==` 错误

### 关键技巧

| 技巧           | 适用场景               | 时间复杂度 | 空间复杂度 |
|----------------|------------------------|------------|------------|
| 滑动窗口求最短 | 和≥target、覆盖子串等 | O(n)       | O(1) 或 O(k) |
| need + valid   | 多字符覆盖/匹配        | O(n)       | O(k)       |

### 滑动窗口要点

1. **固定右端点扩展**：先 right 右移，再在满足条件时收缩 left
2. **收缩条件**：和≥target、valid==need.size() 等，收缩到不满足为止
3. **常见错误**：最小覆盖子串里用 `==` 比较 Integer；收缩时先减 valid 再减 window 导致逻辑反了

### 相似题目推荐

- [无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/) - 最长无重复窗口
- [乘积小于 K 的子数组](https://leetcode.cn/problems/subarray-product-less-than-k/) - 乘积窗口
- [字符串的排列](https://leetcode.cn/problems/permutation-in-string/) - 固定长度窗口 + 覆盖

### 明日计划

- Day 12 滑动窗口进阶
- 练习：字符串排列、子串与子数组类题目
