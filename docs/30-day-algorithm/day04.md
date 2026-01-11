---
order: 4
---

# Day 4 - 链表进阶

> 📅 日期：2026年1月11日  
> 🎯 主题：链表进阶 + 快慢指针

## 今日题目

### 题目1：环形链表 (Linked List Cycle)

**难度**：⭐ 简单

**链接**：[LeetCode 141. 环形链表](https://leetcode.cn/problems/linked-list-cycle/)

#### 题目描述

给你一个链表的头节点 `head`，判断链表中是否有环。

如果链表中有某个节点，可以通过连续跟踪 `next` 指针再次到达，则链表中存在环。为了表示给定链表中的环，评测系统内部使用整数 `pos` 来表示链表尾连接到链表中的位置（索引从 0 开始）。**注意：`pos` 不作为参数进行传递**，仅仅是为了标识链表的实际情况。

如果链表中存在环，则返回 `true`。否则，返回 `false`。

**示例：**
```
输入：head = [3,2,0,-4], pos = 1
输出：true
解释：链表中有一个环，其尾部连接到第二个节点。

输入：head = [1,2], pos = 0
输出：true
解释：链表中有一个环，其尾部连接到第一个节点。

输入：head = [1], pos = -1
输出：false
解释：链表中没有环。
```

#### 解题思路

**方法一：快慢指针（Floyd判圈算法）** ✅ 推荐

核心思想：
1. 使用两个指针：`slow`（慢指针，每次走一步）和 `fast`（快指针，每次走两步）
2. 如果链表中有环，快指针最终会追上慢指针
3. 如果链表中没有环，快指针会先到达链表末尾（`null`）

**为什么快慢指针能检测环？**
- 假设环的长度为 `C`，慢指针进入环时，快指针已经在环中某个位置
- 设此时快慢指针之间的距离为 `d`（0 ≤ d < C）
- 每走一步，快指针比慢指针多走一步，距离减少 1
- 经过 `d` 步后，快指针会追上慢指针

**方法二：哈希表**

核心思想：
1. 遍历链表，将每个节点存入哈希表
2. 如果遇到已经访问过的节点，说明有环
3. 如果遍历到 `null`，说明没有环

#### 代码实现

**方法一：快慢指针（Floyd判圈算法）**
```java
/**
 * Definition for singly-linked list.
 * class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) {
 *         val = x;
 *         next = null;
 *     }
 * }
 */
public class Solution {
    public boolean hasCycle(ListNode head) {
        if (head == null || head.next == null) {
            return false;
        }
        
        ListNode slow = head;
        ListNode fast = head.next;
        
        // 快指针每次走两步，慢指针每次走一步
        while (fast != null && fast.next != null) {
            if (slow == fast) {
                return true;  // 快慢指针相遇，说明有环
            }
            slow = slow.next;
            fast = fast.next.next;
        }
        
        return false;  // 快指针到达末尾，说明没有环
    }
}
```

**方法二：哈希表**
```java
import java.util.HashSet;
import java.util.Set;

public class Solution {
    public boolean hasCycle(ListNode head) {
        Set<ListNode> visited = new HashSet<>();
        ListNode curr = head;
        
        while (curr != null) {
            if (visited.contains(curr)) {
                return true;  // 遇到已访问的节点，说明有环
            }
            visited.add(curr);
            curr = curr.next;
        }
        
        return false;  // 遍历到末尾，说明没有环
    }
}
```

#### 复杂度分析

- 时间复杂度：
  - 快慢指针：O(n)，最坏情况下需要遍历整个链表
  - 哈希表：O(n)，需要遍历整个链表
- 空间复杂度：
  - 快慢指针：O(1)，只使用常数额外空间 ✅
  - 哈希表：O(n)，需要存储所有节点

---

### 题目2：删除链表的倒数第 N 个结点 (Remove Nth Node From End of List)

**难度**：⭐⭐ 中等

**链接**：[LeetCode 19. 删除链表的倒数第 N 个结点](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/)

#### 题目描述

给你一个链表，删除链表的倒数第 `n` 个结点，并且返回链表的头结点。

**示例：**
```
输入：head = [1,2,3,4,5], n = 2
输出：[1,2,3,5]

输入：head = [1], n = 1
输出：[]

输入：head = [1,2], n = 1
输出：[1]
```

#### 解题思路

**方法一：双指针（一次遍历）** ✅ 推荐

核心思想：
1. 使用两个指针：`first`（先走）和 `second`（后走）
2. `first` 先走 `n+1` 步，然后 `first` 和 `second` 同时向前移动
3. 当 `first` 到达末尾（`null`）时，`second` 指向倒数第 `n+1` 个节点
4. 删除 `second.next`（即倒数第 `n` 个节点）

**关键点**：
- 使用虚拟头节点 `dummy`，可以统一处理删除头节点的情况
- `first` 先走 `n+1` 步，这样 `second` 最终会停在要删除节点的前一个位置

**步骤演示**：
```
初始：dummy -> 1 -> 2 -> 3 -> 4 -> 5 -> null, n = 2
      second  first
      
第1步：first 先走 n+1 = 3 步
      dummy -> 1 -> 2 -> 3 -> 4 -> 5 -> null
      second           first
      
第2步：first 和 second 同时移动，直到 first 为 null
      dummy -> 1 -> 2 -> 3 -> 4 -> 5 -> null
                    second           first
      
第3步：删除 second.next（即节点 4）
      dummy -> 1 -> 2 -> 3 -> 5 -> null
```

**方法二：两次遍历**

核心思想：
1. 第一次遍历：计算链表长度 `len`
2. 第二次遍历：找到第 `len - n + 1` 个节点（即倒数第 `n` 个节点）
3. 删除该节点

#### 代码实现

**方法一：双指针（一次遍历）**
```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        // 创建虚拟头节点，简化边界处理
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        
        // first 先走 n+1 步
        ListNode first = dummy;
        for (int i = 0; i <= n; i++) {
            first = first.next;
        }
        
        // first 和 second 同时移动
        ListNode second = dummy;
        while (first != null) {
            first = first.next;
            second = second.next;
        }
        
        // 删除倒数第 n 个节点
        second.next = second.next.next;
        
        return dummy.next;
    }
}
```

**方法二：两次遍历**
```java
class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        // 创建虚拟头节点
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        
        // 第一次遍历：计算链表长度
        int len = 0;
        ListNode curr = head;
        while (curr != null) {
            len++;
            curr = curr.next;
        }
        
        // 第二次遍历：找到要删除节点的前一个节点
        curr = dummy;
        for (int i = 0; i < len - n; i++) {
            curr = curr.next;
        }
        
        // 删除节点
        curr.next = curr.next.next;
        
        return dummy.next;
    }
}
```

#### 复杂度分析

- 时间复杂度：
  - 双指针：O(L)，其中 L 是链表的长度，只需要一次遍历
  - 两次遍历：O(L)，需要遍历链表两次
- 空间复杂度：O(1)，只使用常数额外空间

---

## 今日总结

### 学到了什么？

1. **快慢指针（Floyd判圈算法）**：检测链表是否有环的经典算法
2. **双指针技巧**：一次遍历找到倒数第 N 个节点
3. **虚拟头节点**：简化边界处理，统一操作逻辑
4. **指针距离控制**：通过控制两个指针的相对距离来定位特定位置

### 关键技巧

| 技巧 | 适用场景 | 时间复杂度 | 空间复杂度 |
|-----|---------|-----------|-----------|
| 快慢指针 | 检测环、找中点 | O(n) | O(1) |
| 双指针（固定距离） | 删除倒数第N个节点 | O(n) | O(1) |
| 虚拟头节点 | 简化边界处理 | - | O(1) |
| 哈希表 | 检测重复节点 | O(n) | O(n) |

### 快慢指针的应用场景

1. **检测环**：
   - 快指针每次走两步，慢指针每次走一步
   - 如果有环，快指针会追上慢指针

2. **找链表中点**：
   - 快指针每次走两步，慢指针每次走一步
   - 当快指针到达末尾时，慢指针指向中点

3. **找倒数第N个节点**：
   - 先让一个指针走N步
   - 然后两个指针同时移动
   - 先走的指针到达末尾时，后走的指针指向倒数第N个节点

### 链表操作要点

1. **虚拟头节点的使用**：
   - 删除头节点时不需要特殊处理
   - 统一操作逻辑，简化代码

2. **指针移动技巧**：
   - 先走固定步数，再同时移动
   - 控制两个指针的相对距离

3. **边界条件处理**：
   - 空链表：`head == null`
   - 单节点：`head.next == null`
   - 删除头节点：使用虚拟头节点

4. **常见错误**：
   - 忘记处理边界情况
   - 指针移动步数计算错误
   - 删除节点后忘记更新指针

### 相似题目推荐

- [环形链表 II](https://leetcode.cn/problems/linked-list-cycle-ii/) - 找到环的入口节点
- [链表的中间结点](https://leetcode.cn/problems/middle-of-the-linked-list/) - 使用快慢指针找中点
- [相交链表](https://leetcode.cn/problems/intersection-of-two-linked-lists/) - 找到两个链表的交点
- [回文链表](https://leetcode.cn/problems/palindrome-linked-list/) - 判断链表是否为回文

### 明日计划

- Day 5 哈希表基础
- 练习：有效的字母异位词、两数之和（复习）
