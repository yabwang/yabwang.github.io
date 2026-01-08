# 100 道 LeetCode 算法题

## [128最长连续序列](https://leetcode.cn/problems/longest-consecutive-sequence/)


**题目描述:**

给定一个未排序的整数数组 `nums` ，找出数字连续的最长序列（不要求序列元素在原数组中连续）的长度。

**示例：**
```java
输入：nums = [100,4,200,1,3,2]
输出：4
解释：最长序列是 [1, 2, 3, 4]
```
解题思路：
- 去重set,定义maxlength = 0；cunrntValue = 
- 遍历数组，
  当前值curentValue=x，
  判断set中是否存在x+1，如果存在则length++，
  判断set中是否存在x+2，如果存在则length++，
  判断set中是否存在x+y，如果不存在，nextValue
- 当前值为x+y，匹配结束，长度为 maxlength=y+1，
  当前值curentValue=x+1，
  判断set中是否存在x+1 + 1，如果存在则length++ ......
  maxlength = max(length,maxlength)
- 上述过程中，时间复杂度最坏情况下还是会达到 O(n^2)（即外层需要枚举 O(n)个数，内层需要暴力匹配 O(n)次）
  已知x,x+1,x+2,⋯,x+y 的连续序列，而我们重新从x+1开始匹配，得到的结果肯定不会优于x为起点。
  因此，外层循环碰到上述情况需要跳过。
  即需要枚举的数x一定是不能在数组中存在前驱数x-1，若存在则跳过外层循环。

::: details （点击查看）
```java
class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> sets = new HashSet<>();
        for (int num : nums) {
            sets.add(num);
        }
        
        int maxLength = 0;
        for(int set : sets) {
            int curentLength = 1;
            int currentNumm = set;
            while(sets.contains(currentNumm + 1)) {
                curentLength++;
                currentNumm = currentNumm + 1;
            }
            maxLength = Math.max(maxLength, curentLength);
        }
        return maxLength;
    }
}
```
:::

::: warning 注意事项
- 避免重复计算：通过检查前驱元素确保每个序列只计算一次
- 边界情况处理：空数组返回0
:::

## [49. 字母异位词分组](https://leetcode.cn/problems/group-anagrams/)

**题目描述:**

- 给你一个字符串数组，请你将 字母异位词 组合在一起。可以按任意顺序返回结果列表。
字母异位词 是由重新排列源单词的所有字母得到的一个新单词.





