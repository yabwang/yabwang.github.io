---
order: 5
---

# Day 5 - 哈希表基础

> 📅 日期：2026年1月12日  
> 🎯 主题：哈希表基础 + 字符统计

## 今日题目

### 题目1：有效的字母异位词 (Valid Anagram)

**难度**：⭐ 简单

**链接**：[LeetCode 242. 有效的字母异位词](https://leetcode.cn/problems/valid-anagram/)

#### 题目描述

给定两个字符串 `s` 和 `t`，编写一个函数来判断 `t` 是否是 `s` 的字母异位词。

**注意**：若 `s` 和 `t` 中每个字符出现的次数都相同，则称 `s` 和 `t` 互为字母异位词。

**示例：**
```
输入: s = "anagram", t = "nagaram"
输出: true

输入: s = "rat", t = "car"
输出: false
```

**提示**：
- `1 <= s.length, t.length <= 5 * 10^4`
- `s` 和 `t` 仅包含小写字母

#### 解题思路

**方法一：哈希表统计字符频次** ✅ 推荐

核心思想：
1. 如果两个字符串长度不同，直接返回 `false`
2. 使用哈希表统计每个字符出现的次数
3. 遍历第一个字符串，统计每个字符出现的次数
4. 遍历第二个字符串，减少对应字符的计数
5. 如果所有字符的计数都为 0，说明是字母异位词

**关键点**：
- 使用数组作为哈希表（字符范围固定为小写字母 a-z）
- 数组索引：`char - 'a'`，值：字符出现次数
- 先加后减，最后检查是否全为 0

**方法二：排序比较**

核心思想：
1. 将两个字符串转换为字符数组
2. 对字符数组进行排序
3. 比较排序后的数组是否相等

#### 代码实现

**方法一：哈希表统计字符频次**
```java
class Solution {
    public boolean isAnagram(String s, String t) {
        // 长度不同，直接返回 false
        if (s.length() != t.length()) {
            return false;
        }
        
        // 使用数组作为哈希表，统计字符出现次数
        int[] count = new int[26];
        
        // 统计 s 中每个字符的出现次数
        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++;
        }
        
        // 遍历 t，减少对应字符的计数
        for (int i = 0; i < t.length(); i++) {
            count[t.charAt(i) - 'a']--;
            // 如果某个字符的计数小于 0，说明 t 中该字符出现次数多于 s
            if (count[t.charAt(i) - 'a'] < 0) {
                return false;
            }
        }
        
        return true;
    }
}
```

**方法二：排序比较**
```java
import java.util.Arrays;

class Solution {
    public boolean isAnagram(String s, String t) {
        // 长度不同，直接返回 false
        if (s.length() != t.length()) {
            return false;
        }
        
        // 转换为字符数组并排序
        char[] sArray = s.toCharArray();
        char[] tArray = t.toCharArray();
        Arrays.sort(sArray);
        Arrays.sort(tArray);
        
        // 比较排序后的数组
        return Arrays.equals(sArray, tArray);
    }
}
```

#### 复杂度分析

- 时间复杂度：
  - 哈希表方法：O(n)，其中 n 是字符串的长度，需要遍历两个字符串各一次
  - 排序方法：O(n log n)，排序的时间复杂度
- 空间复杂度：
  - 哈希表方法：O(1)，只使用固定大小的数组（26个元素）
  - 排序方法：O(n)，需要额外的字符数组空间

---

### 题目2：字母异位词分组 (Group Anagrams)

**难度**：⭐⭐ 中等

**链接**：[LeetCode 49. 字母异位词分组](https://leetcode.cn/problems/group-anagrams/)

#### 题目描述

给你一个字符串数组，请你将**字母异位词**组合在一起。可以按任意顺序返回结果列表。

字母异位词是由重新排列源单词的字母得到的一个新单词，所有源单词中的字母通常恰好只用一次。

**示例：**
```
输入: strs = ["eat", "tea", "tan", "ate", "nat", "bat"]
输出: [["bat"],["nat","tan"],["ate","eat","tea"]]

输入: str = [""]
输出: [[""]]

输入: strs = ["a"]
输出: [["a"]]
```

**提示**：
- `1 <= strs.length <= 10^4`
- `0 <= strs[i].length <= 100`
- `strs[i]` 仅包含小写字母

#### 解题思路

**方法一：排序 + 哈希表** ✅ 推荐

核心思想：
1. 对于每个字符串，将其排序后作为哈希表的键
2. 字母异位词排序后的结果相同，可以作为同一组
3. 使用哈希表存储分组结果，键为排序后的字符串，值为原始字符串列表
4. 遍历所有字符串，将每个字符串加入对应的分组

**关键点**：
- 使用排序后的字符串作为键，保证字母异位词有相同的键
- 使用 `Map<String, List<String>>` 存储分组结果
- 最后返回所有分组的列表

**方法二：字符计数 + 哈希表**

核心思想：
1. 对于每个字符串，统计每个字符出现的次数
2. 将字符计数转换为字符串作为键（如 "a2b1c3"）
3. 使用哈希表存储分组结果

#### 代码实现

**方法一：排序 + 哈希表**
```java
import java.util.*;

class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        // 使用哈希表存储分组结果
        Map<String, List<String>> map = new HashMap<>();
        
        for (String str : strs) {
            // 将字符串转换为字符数组并排序
            char[] chars = str.toCharArray();
            Arrays.sort(chars);
            // 使用排序后的字符串作为键
            String key = String.valueOf(chars);
            
            // 如果键不存在，创建新的列表
            if (!map.containsKey(key)) {
                map.put(key, new ArrayList<>());
            }
            // 将原始字符串加入对应的分组
            map.get(key).add(str);
        }
        
        // 返回所有分组的列表
        return new ArrayList<>(map.values());
    }
}
```

**方法二：字符计数 + 哈希表**
```java
import java.util.*;

class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();
        
        for (String str : strs) {
            // 统计每个字符出现的次数
            int[] count = new int[26];
            for (char c : str.toCharArray()) {
                count[c - 'a']++;
            }
            
            // 将字符计数转换为字符串作为键
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 26; i++) {
                if (count[i] > 0) {
                    sb.append((char)('a' + i));
                    sb.append(count[i]);
                }
            }
            String key = sb.toString();
            
            // 如果键不存在，创建新的列表
            if (!map.containsKey(key)) {
                map.put(key, new ArrayList<>());
            }
            // 将原始字符串加入对应的分组
            map.get(key).add(str);
        }
        
        return new ArrayList<>(map.values());
    }
}
```

#### 复杂度分析

- 时间复杂度：
  - 排序方法：O(nk log k)，其中 n 是字符串数组的长度，k 是字符串的平均长度
    - 需要遍历 n 个字符串
    - 每个字符串排序需要 O(k log k) 时间
  - 字符计数方法：O(nk)，其中 n 是字符串数组的长度，k 是字符串的平均长度
    - 需要遍历 n 个字符串
    - 每个字符串统计字符需要 O(k) 时间
- 空间复杂度：O(nk)，需要存储所有字符串

---

## 今日总结

### 学到了什么？

1. **哈希表的基本应用**：使用哈希表快速查找和统计
2. **字符统计技巧**：使用数组作为哈希表统计字符出现次数（适用于字符范围固定）
3. **排序作为键**：将排序后的字符串作为哈希表的键，用于分组
4. **字符计数键**：将字符计数转换为字符串作为键，适用于字符范围较大的情况

### 关键技巧

| 技巧 | 适用场景 | 时间复杂度 | 空间复杂度 |
|-----|---------|-----------|-----------|
| 数组哈希表 | 字符范围固定（如小写字母） | O(n) | O(1) |
| 排序作为键 | 字母异位词分组 | O(nk log k) | O(nk) |
| 字符计数键 | 字符范围较大或需要精确计数 | O(nk) | O(nk) |
| HashMap | 需要存储键值对关系 | O(1) 平均查找 | O(n) |

### 哈希表操作要点

1. **选择合适的哈希表实现**：
   - 字符范围固定（如 a-z）：使用数组 `int[26]`
   - 需要存储键值对：使用 `HashMap`
   - 需要有序：使用 `LinkedHashMap`
   - 需要排序：使用 `TreeMap`

2. **字符统计技巧**：
   - 字符转索引：`char - 'a'`（小写字母）
   - 字符转索引：`char - 'A'`（大写字母）
   - 字符转索引：`char - '0'`（数字）

3. **分组技巧**：
   - 使用排序后的字符串作为键
   - 使用字符计数作为键
   - 使用特征值作为键（如字符频次数组的字符串表示）

4. **常见错误**：
   - 忘记处理空字符串或空数组
   - 字符范围判断错误（大小写、数字等）
   - 哈希表键的选择不当
   - 忘记检查字符串长度是否相同

### 相似题目推荐

- [找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/) - 滑动窗口 + 哈希表
- [字符串中的第一个唯一字符](https://leetcode.cn/problems/first-unique-character-in-a-string/) - 字符统计
- [赎金信](https://leetcode.cn/problems/ransom-note/) - 字符统计应用
- [存在重复元素](https://leetcode.cn/problems/contains-duplicate/) - 哈希表去重

### 明日计划

- Day 6 哈希表进阶
- 练习：两数之和（复习）、最长连续序列
