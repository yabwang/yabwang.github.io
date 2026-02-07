---
order: 13
---

# Day 13 - 栈

> 📅 日期：2026年1月20日  
> 🎯 主题：栈基础 + 括号匹配与单调栈

## 今日题目

### 题目1：有效的括号 (Valid Parentheses)

**难度**：⭐ 简单

**链接**：[LeetCode 20. 有效的括号](https://leetcode.cn/problems/valid-parentheses/)

#### 题目描述

给定一个只包括 `'('`，`')'`，`'{'`，`'}'`，`'['`，`']'` 的字符串 `s`，判断字符串是否有效。

有效字符串需满足：
1. 左括号必须用相同类型的右括号闭合。
2. 左括号必须以正确的顺序闭合。
3. 每个右括号都有一个对应的相同类型的左括号。

**示例：**
```
输入：s = "()"
输出：true

输入：s = "()[]{}"
输出：true

输入：s = "(]"
输出：false

输入：s = "([)]"
输出：false

输入：s = "{[]}"
输出：true
```

**提示**：
- `1 <= s.length <= 10^4`
- `s` 仅由括号 `'()[]{}'` 组成

#### 解题思路

**方法一：栈** ✅ 推荐

核心思想：
1. 遇到左括号（`'('`, `'['`, `'{'`）时，将其压入栈
2. 遇到右括号时：
   - 如果栈为空，返回 `false`
   - 如果栈顶元素与当前右括号不匹配，返回 `false`
   - 如果匹配，弹出栈顶元素
3. 遍历结束后，如果栈为空，返回 `true`；否则返回 `false`

**关键点**：
- 利用栈的 LIFO（后进先出）特性，后遇到的左括号先匹配
- 可以用哈希表存储括号对应关系，简化代码
- 时间复杂度 O(n)，空间复杂度 O(n)

#### 代码实现

```java
import java.util.*;

class Solution {
    public boolean isValid(String s) {
        if (s == null || s.length() == 0) {
            return true;
        }
        
        // 奇数长度一定无效
        if (s.length() % 2 == 1) {
            return false;
        }

        Deque<Character> stack = new ArrayDeque<>();
        Map<Character, Character> map = new HashMap<>();
        map.put(')', '(');
        map.put(']', '[');
        map.put('}', '{');

        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            // 如果是右括号
            if (map.containsKey(c)) {
                // 栈为空或栈顶元素不匹配
                if (stack.isEmpty() || stack.peek() != map.get(c)) {
                    return false;
                }
                // 匹配成功，弹出栈顶
                stack.pop();
            } else {
                // 左括号，压入栈
                stack.push(c);
            }
        }

        // 栈为空说明所有括号都匹配
        return stack.isEmpty();
    }
}
```

**方法二：栈（简化版）**

不使用哈希表，直接判断：

```java
import java.util.*;

class Solution {
    public boolean isValid(String s) {
        if (s == null || s.length() == 0) {
            return true;
        }
        
        if (s.length() % 2 == 1) {
            return false;
        }

        Deque<Character> stack = new ArrayDeque<>();

        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '(' || c == '[' || c == '{') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) {
                    return false;
                }
                char top = stack.pop();
                if ((c == ')' && top != '(') ||
                    (c == ']' && top != '[') ||
                    (c == '}' && top != '{')) {
                    return false;
                }
            }
        }

        return stack.isEmpty();
    }
}
```

#### 复杂度分析

- 时间复杂度：O(n)，遍历字符串一次
- 空间复杂度：O(n)，栈最多存储 n/2 个左括号

---

### 题目2：每日温度 (Daily Temperatures)

**难度**：⭐⭐ 中等

**链接**：[LeetCode 739. 每日温度](https://leetcode.cn/problems/daily-temperatures/)

#### 题目描述

给定一个整数数组 `temperatures`，表示每天的温度，返回一个数组 `answer`，其中 `answer[i]` 是指对于第 `i` 天，下一个更高温度出现在几天后。如果气温在这之后都不会升高，请在该位置用 `0` 来代替。

**示例：**
```
输入: temperatures = [73,74,75,71,69,72,76,73]
输出: [1,1,4,2,1,1,0,0]

输入: temperatures = [30,40,50,60]
输出: [1,1,1,0]

输入: temperatures = [30,60,90]
输出: [1,1,0]
```

**提示**：
- `1 <= temperatures.length <= 10^5`
- `30 <= temperatures[i] <= 100`

#### 解题思路

**方法一：单调栈** ✅ 推荐

核心思想：
1. 使用栈存储温度数组的索引（而不是温度值）
2. 遍历温度数组：
   - 如果当前温度大于栈顶索引对应的温度，说明找到了栈顶元素的下一个更高温度
   - 计算天数差（当前索引 - 栈顶索引），更新结果数组
   - 弹出栈顶，继续比较直到栈为空或当前温度不大于栈顶温度
   - 将当前索引压入栈
3. 遍历结束后，栈中剩余元素的答案都是 0（默认值）

**关键点**：
- 单调栈：栈中元素对应的温度值保持单调递减（从栈底到栈顶）
- 栈中存储索引，方便计算天数差和更新结果
- 时间复杂度 O(n)，空间复杂度 O(n)

#### 代码实现

```java
import java.util.*;

class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        if (temperatures == null || temperatures.length == 0) {
            return new int[0];
        }

        int n = temperatures.length;
        int[] answer = new int[n];
        Deque<Integer> stack = new ArrayDeque<>();

        for (int i = 0; i < n; i++) {
            // 当前温度大于栈顶索引对应的温度
            while (!stack.isEmpty() && temperatures[i] > temperatures[stack.peek()]) {
                int index = stack.pop();
                // 计算天数差
                answer[index] = i - index;
            }
            // 将当前索引压入栈
            stack.push(i);
        }

        // 栈中剩余元素的答案都是 0（数组默认值）
        return answer;
    }
}
```

**方法二：暴力法（不推荐）**

对于每个位置，向后查找第一个大于当前温度的位置：

```java
class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] answer = new int[n];

        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (temperatures[j] > temperatures[i]) {
                    answer[i] = j - i;
                    break;
                }
            }
        }

        return answer;
    }
}
```

**复杂度分析**：
- 时间复杂度：O(n²)，最坏情况下每个元素都要遍历到末尾
- 空间复杂度：O(1)，不包括返回数组

#### 复杂度分析（单调栈）

- 时间复杂度：O(n)，每个元素最多入栈和出栈一次
- 空间复杂度：O(n)，栈最多存储 n 个索引

---

## 今日总结

### 学到了什么？

1. **栈的基本应用**：括号匹配利用栈的 LIFO 特性，后遇到的左括号先匹配
2. **单调栈**：栈中元素保持单调性（递增或递减），用于解决"下一个更大/更小元素"问题
3. **索引存储**：在单调栈中存储索引而非值，方便计算距离和更新结果数组
4. **边界处理**：栈为空时的处理，以及遍历结束后的剩余元素处理

### 关键技巧

| 技巧           | 适用场景               | 时间复杂度 | 空间复杂度 |
|----------------|------------------------|------------|------------|
| 栈匹配         | 括号匹配、表达式求值   | O(n)       | O(n)       |
| 单调栈         | 下一个更大/更小元素    | O(n)       | O(n)       |
| 索引存储       | 需要计算位置差的问题   | O(n)       | O(n)       |
| 哈希表映射     | 简化匹配逻辑           | O(n)       | O(k)       |

### 栈操作要点

1. **栈的基本操作**：
   - `push()`：压入元素
   - `pop()`：弹出栈顶元素
   - `peek()`：查看栈顶元素（不移除）
   - `isEmpty()`：判断栈是否为空

2. **单调栈模式**：
   - **单调递减栈**：用于找下一个更大元素（如每日温度）
   - **单调递增栈**：用于找下一个更小元素
   - 栈中存储索引，方便计算距离和更新结果

3. **常见错误**：
   - 括号匹配：忘记检查栈是否为空就 `pop()` 或 `peek()`
   - 单调栈：混淆单调递增和递减，导致逻辑错误
   - 索引计算：天数差计算错误（应该是 `i - index` 而不是 `index - i`）

### 相似题目推荐

- [最小栈](https://leetcode.cn/problems/min-stack/) - 设计支持获取最小元素的栈
- [下一个更大元素 I](https://leetcode.cn/problems/next-greater-element-i/) - 单调栈基础应用
- [柱状图中最大的矩形](https://leetcode.cn/problems/largest-rectangle-in-histogram/) - 单调栈进阶
- [接雨水](https://leetcode.cn/problems/trapping-rain-water/) - 单调栈或双指针
- [用栈实现队列](https://leetcode.cn/problems/implement-queue-using-stacks/) - 栈的基本操作

### 明日计划

- Day 14 队列
- 练习：队列的基本操作、用队列实现栈、滑动窗口最大值等题目
