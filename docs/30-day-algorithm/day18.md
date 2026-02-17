---
order: 18
---

# Day 18 - 二叉搜索树

> 📅 日期：2026年1月25日  
> 🎯 主题：BST 性质与验证、搜索

## 今日题目

### 题目1：验证二叉搜索树 (Validate Binary Search Tree)

**难度**：⭐⭐ 中等

**链接**：[LeetCode 98. 验证二叉搜索树](https://leetcode.cn/problems/validate-binary-search-tree/)

#### 题目描述

给你一个二叉树的根节点 `root`，判断其是否是一个有效的 **二叉搜索树**。

有效 二叉搜索树定义如下：
- 节点的左子树只包含 **小于** 当前节点的数。
- 节点的右子树只包含 **大于** 当前节点的数。
- 所有左子树和右子树自身必须也是二叉搜索树。

**示例：**
```
输入：root = [2,1,3]
输出：true

输入：root = [5,1,4,null,null,3,6]
输出：false
解释：根节点的值是 5 ，但是右子节点的值是 4 ，不满足「右子树所有节点都大于根」。
```

**提示**：
- 树中节点数目范围在 `[1, 10^4]` 内
- `-2^31 <= Node.val <= 2^31 - 1`

#### 解题思路

**方法一：递归 + 上下界** ✅ 推荐

核心思想：
1. BST 要求：当前节点值必须在某个开区间 `(minVal, maxVal)` 内
2. 根节点无限制，可设为 `(Long.MIN_VALUE, Long.MAX_VALUE)` 避免边界溢出
3. 递归左子树时，上界变为当前值；递归右子树时，下界变为当前值
4. 空节点返回 true；当前值不在区间内返回 false；再递归左右子树

**关键点**：
- 不能只判断「左 < 根 < 右」，必须把祖先的约束传下去（例如右子树的左孩子必须 > 根且 < 右子树根）
- 用 long 或包装类传界，避免节点值为 Integer.MIN_VALUE/MAX_VALUE 时出错

**方法二：中序遍历**

BST 中序遍历为严格递增序列。中序遍历一遍，若发现当前值 <= 前驱值则非法。

#### 代码实现

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
class Solution {
    public boolean isValidBST(TreeNode root) {
        return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    private boolean validate(TreeNode node, long minVal, long maxVal) {
        if (node == null) {
            return true;
        }
        if (node.val <= minVal || node.val >= maxVal) {
            return false;
        }
        return validate(node.left, minVal, node.val)
            && validate(node.right, node.val, maxVal);
    }
}
```

**中序遍历实现：**

```java
class Solution {
    private Long prev = null;

    public boolean isValidBST(TreeNode root) {
        if (root == null) {
            return true;
        }
        if (!isValidBST(root.left)) {
            return false;
        }
        if (prev != null && root.val <= prev) {
            return false;
        }
        prev = (long) root.val;
        return isValidBST(root.right);
    }
}
```

#### 复杂度分析

- 时间复杂度：O(n)
- 空间复杂度：O(h)，递归栈

---

### 题目2：二叉搜索树中的搜索 (Search in a Binary Search Tree)

**难度**：⭐ 简单

**链接**：[LeetCode 700. 二叉搜索树中的搜索](https://leetcode.cn/problems/search-in-a-binary-search-tree/)

#### 题目描述

给定二叉搜索树（BST）的根节点 `root` 和一个整数值 `val`。你需要在 BST 中找到节点值等于 `val` 的节点。返回以该节点为根的子树。如果节点不存在，则返回 `null`。

**示例：**
```
输入：root = [4,2,7,1,3], val = 2
输出：[2,1,3]

输入：root = [4,2,7,1,3], val = 5
输出：[]
```

**提示**：
- 树中节点数在 `[1, 5000]` 范围内
- `1 <= Node.val <= 10^7`
- `root` 是二叉搜索树
- `1 <= val <= 10^7`

#### 解题思路

**方法一：利用 BST 性质递归** ✅ 推荐

核心思想：
1. 空树返回 null
2. 若 `root.val == val` 返回 root
3. 若 `val < root.val` 只在左子树搜；若 `val > root.val` 只在右子树搜
4. 每次排除一半，类似二分

**关键点**：
- 时间复杂度 O(h)，h 为树高；平衡 BST 为 O(log n)

**方法二：迭代**

用 while 循环，根据 val 与当前节点值比较决定走左还是右，直到找到或为空。

#### 代码实现

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
class Solution {
    public TreeNode searchBST(TreeNode root, int val) {
        if (root == null || root.val == val) {
            return root;
        }
        if (val < root.val) {
            return searchBST(root.left, val);
        }
        return searchBST(root.right, val);
    }
}
```

**迭代实现：**

```java
class Solution {
    public TreeNode searchBST(TreeNode root, int val) {
        while (root != null && root.val != val) {
            root = val < root.val ? root.left : root.right;
        }
        return root;
    }
}
```

#### 复杂度分析

- 时间复杂度：O(h)，h 为树高
- 空间复杂度：递归 O(h)，迭代 O(1)

---

## 今日总结

### 学到了什么？

1. **BST 性质**：左子树所有节点 < 根 < 右子树所有节点；中序遍历为严格递增
2. **验证 BST**：递归时传上下界 (min, max)，当前值必须在开区间内；或中序遍历检查是否递增
3. **BST 搜索**：根据 val 与根比较，只走左或只走右，O(h) 时间
4. **边界**：用 long 或包装类传界，避免 Integer 边界值导致误判

### 关键技巧

| 技巧           | 适用场景           | 时间复杂度 | 空间复杂度 |
|----------------|--------------------|------------|------------|
| 上下界递归     | 验证 BST、范围查询 | O(n)       | O(h)       |
| 中序递增       | 验证 BST、第 K 小  | O(n)       | O(h)       |
| 比较后走一侧   | BST 查找、插入     | O(h)       | O(1) 迭代  |

### 二叉搜索树要点

1. **验证 BST**：不能只判「左 < 根 < 右」，必须把祖先的 min/max 传下去；或用中序看是否严格递增
2. **搜索/插入**：始终根据与当前节点比较决定向左或向右，迭代可省栈空间
3. **常见错误**：验证时忽略祖先约束；用 int 传界遇到 Integer.MIN_VALUE/MAX_VALUE 出错

### 相似题目推荐

- [二叉搜索树中第K小的元素](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/) - 中序遍历
- [二叉搜索树的最近公共祖先](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-search-tree/) - 利用 BST 性质
- [将有序数组转换为二叉搜索树](https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/) - 二分建树
- [二叉搜索树中的插入操作](https://leetcode.cn/problems/insert-into-a-binary-search-tree/) - 找空位插入

### 明日计划

- Day 19 回溯
- 练习：组合、排列、子集、分割等回溯模板
