---
order: 7
---

# Day 7 - 字符串基础

> 📅 日期：2026年1月14日  
> 🎯 主题：字符串基础 + 双指针操作

## 今日题目

### 题目1：反转字符串 (Reverse String)

**难度**：⭐ 简单

**链接**：[LeetCode 344. 反转字符串](https://leetcode.cn/problems/reverse-string/)

#### 题目描述

编写一个函数，其作用是将输入的字符串反转过来。输入字符串以字符数组 `s` 的形式给出。

不要给另外的数组分配额外的空间，你必须**原地修改输入数组**、使用 O(1) 的额外空间解决这一问题。

**示例：**
```
输入：s = ["h","e","l","l","o"]
输出：["o","l","l","e","h"]

输入：s = ["H","a","n","n","a","h"]
输出：["h","a","n","n","a","H"]
```

**提示**：
- `1 <= s.length <= 10^5`
- `s[i]` 都是 ASCII 码表中的可打印字符

#### 解题思路

**方法一：双指针（首尾交换）** ✅ 推荐

核心思想：
1. 使用两个指针：`left`（指向开头）和 `right`（指向末尾）
2. 交换 `left` 和 `right` 指向的字符
3. `left` 向右移动，`right` 向左移动
4. 重复直到 `left >= right`

**关键点**：
- 原地修改，不需要额外空间
- 时间复杂度：O(n)，需要遍历一半的数组
- 空间复杂度：O(1)，只使用常数额外空间

**方法二：递归**

核心思想：
1. 递归交换首尾字符
2. 递归处理中间部分
3. 时间复杂度：O(n)，空间复杂度：O(n)（递归调用栈）

#### 代码实现

**方法一：双指针（首尾交换）**
```java
class Solution {
    public void reverseString(char[] s) {
        int left = 0;
        int right = s.length - 1;
        
        // 双指针从两端向中间移动，交换字符
        while (left < right) {
            // 交换字符
            char temp = s[left];
            s[left] = s[right];
            s[right] = temp;
            
            // 移动指针
            left++;
            right--;
        }
    }
}
```

**方法二：递归**
```java
class Solution {
    public void reverseString(char[] s) {
        reverseHelper(s, 0, s.length - 1);
    }
    
    private void reverseHelper(char[] s, int left, int right) {
        // 递归终止条件
        if (left >= right) {
            return;
        }
        
        // 交换首尾字符
        char temp = s[left];
        s[left] = s[right];
        s[right] = temp;
        
        // 递归处理中间部分
        reverseHelper(s, left + 1, right - 1);
    }
}
```

#### 复杂度分析

- 时间复杂度：O(n)，其中 n 是字符串的长度，需要遍历一半的数组
- 空间复杂度：
  - 双指针方法：O(1)，只使用常数额外空间 ✅
  - 递归方法：O(n)，递归调用栈的深度为 n/2

---

### 题目2：反转字符串中的单词 (Reverse Words in a String)

**难度**：⭐⭐ 中等

**链接**：[LeetCode 151. 反转字符串中的单词](https://leetcode.cn/problems/reverse-words-in-a-string/)

#### 题目描述

给你一个字符串 `s`，请你反转字符串中**单词**的顺序。

**单词**是由非空格字符组成的字符串。`s` 中使用至少一个空格将字符串中的**单词**分隔开。

返回**单词顺序颠倒且单词之间用单个空格连接**的结果字符串。

**注意**：输入字符串 `s` 中可能会存在前导空格、尾随空格或者单词间的多个空格。返回的结果字符串中，单词间应当仅用单个空格分隔，且不包含任何额外的空格。

**示例：**
```
输入：s = "the sky is blue"
输出："blue is sky the"

输入：s = "  hello world  "
输出："world hello"
解释：反转后的字符串中不能存在前导空格和尾随空格。

输入：s = "a good   example"
输出："example good a"
解释：如果两个单词间有多余的空格，反转后的字符串需要将单词间的空格减少到仅有一个。
```

**提示**：
- `1 <= s.length <= 10^4`
- `s` 包含英文大小写字母、数字和空格 `' '`
- `s` 中至少存在一个单词

#### 解题思路

**方法一：双指针 + 字符串拼接** ✅ 推荐

核心思想：
1. 去除首尾空格，并处理中间多个空格
2. 从后往前遍历字符串，找到每个单词的边界
3. 提取每个单词并拼接
4. 返回反转后的字符串

**关键步骤**：
- 使用双指针 `i` 和 `j` 定位单词边界
- `i` 指向单词的末尾，`j` 指向单词的开头
- 从后往前遍历，提取单词

**方法二：分割 + 反转**

核心思想：
1. 使用 `split` 分割字符串
2. 过滤空字符串
3. 反转数组
4. 用空格连接

**方法三：栈**

核心思想：
1. 遍历字符串，提取单词
2. 将单词压入栈
3. 依次出栈并拼接

#### 代码实现

**方法一：双指针 + 字符串拼接**
```java
class Solution {
    public String reverseWords(String s) {
        // 去除首尾空格
        s = s.trim();
        
        // 处理中间多个空格，只保留一个空格
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) != ' ') {
                sb.append(s.charAt(i));
            } else if (sb.length() > 0 && sb.charAt(sb.length() - 1) != ' ') {
                sb.append(' ');
            }
        }
        s = sb.toString();
        
        // 从后往前提取单词
        StringBuilder result = new StringBuilder();
        int i = s.length() - 1;
        
        while (i >= 0) {
            // 跳过空格
            while (i >= 0 && s.charAt(i) == ' ') {
                i--;
            }
            
            // 找到单词的末尾
            int end = i;
            
            // 找到单词的开头
            while (i >= 0 && s.charAt(i) != ' ') {
                i--;
            }
            
            // 提取单词
            if (end >= 0) {
                String word = s.substring(i + 1, end + 1);
                if (result.length() > 0) {
                    result.append(' ');
                }
                result.append(word);
            }
        }
        
        return result.toString();
    }
}
```

**方法二：分割 + 反转**
```java
import java.util.*;

class Solution {
    public String reverseWords(String s) {
        // 分割字符串，去除空字符串
        String[] words = s.trim().split("\\s+");
        
        // 反转数组
        Collections.reverse(Arrays.asList(words));
        
        // 用空格连接
        return String.join(" ", words);
    }
}
```

**方法三：栈**
```java
import java.util.*;

class Solution {
    public String reverseWords(String s) {
        Stack<String> stack = new Stack<>();
        StringBuilder word = new StringBuilder();
        
        // 遍历字符串，提取单词
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c != ' ') {
                word.append(c);
            } else {
                if (word.length() > 0) {
                    stack.push(word.toString());
                    word.setLength(0);
                }
            }
        }
        
        // 处理最后一个单词
        if (word.length() > 0) {
            stack.push(word.toString());
        }
        
        // 从栈中取出单词并拼接
        StringBuilder result = new StringBuilder();
        while (!stack.isEmpty()) {
            if (result.length() > 0) {
                result.append(' ');
            }
            result.append(stack.pop());
        }
        
        return result.toString();
    }
}
```

#### 复杂度分析

- 时间复杂度：
  - 双指针方法：O(n)，需要遍历字符串两次
  - 分割方法：O(n)，分割和反转的时间复杂度
  - 栈方法：O(n)，需要遍历字符串一次
- 空间复杂度：
  - 双指针方法：O(n)，需要额外的 StringBuilder 空间
  - 分割方法：O(n)，需要存储分割后的数组
  - 栈方法：O(n)，需要栈存储所有单词

---

## 今日总结

### 学到了什么？

1. **双指针反转技巧**：使用首尾指针交换字符，实现原地反转
2. **字符串处理技巧**：去除空格、处理多个空格、提取单词
3. **从后往前遍历**：反转单词顺序时，从后往前提取更直观
4. **字符串拼接优化**：使用 StringBuilder 提高性能

### 关键技巧

| 技巧 | 适用场景 | 时间复杂度 | 空间复杂度 |
|-----|---------|-----------|-----------|
| 双指针交换 | 反转字符串、数组 | O(n) | O(1) |
| 从后往前遍历 | 反转单词顺序 | O(n) | O(n) |
| 分割 + 反转 | 单词反转问题 | O(n) | O(n) |
| StringBuilder | 字符串拼接 | O(n) | O(n) |

### 字符串操作要点

1. **双指针技巧**：
   - 首尾指针：用于反转、回文判断
   - 快慢指针：用于删除、去重
   - 同向指针：用于滑动窗口

2. **字符串处理**：
   - 去除首尾空格：`trim()`
   - 分割字符串：`split("\\s+")`（处理多个空格）
   - 提取子串：`substring(start, end)`

3. **性能优化**：
   - 使用 `StringBuilder` 而非字符串拼接（`+`）
   - 避免在循环中创建大量临时字符串
   - 考虑原地修改（如果允许）

4. **常见错误**：
   - 忘记处理边界情况（空字符串、只有空格）
   - 字符串索引越界
   - 忘记处理多个连续空格
   - 使用 `==` 比较字符串（应使用 `equals()`）

### 相似题目推荐

- [反转字符串 II](https://leetcode.cn/problems/reverse-string-ii/) - 每2k个字符反转前k个
- [反转字符串中的单词 III](https://leetcode.cn/problems/reverse-words-in-a-string-iii/) - 反转每个单词
- [验证回文串](https://leetcode.cn/problems/valid-palindrome/) - 双指针判断回文
- [字符串中的第一个唯一字符](https://leetcode.cn/problems/first-unique-character-in-a-string/) - 字符统计

### 明日计划

- Day 8 字符串进阶
- 练习：无重复字符的最长子串、字符串中的第一个唯一字符
