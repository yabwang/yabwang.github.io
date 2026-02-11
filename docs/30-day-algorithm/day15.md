---
order: 15
---

# Day 15 - 二叉树

> 📅 日期：2026年1月22日  
> 🎯 主题：二叉树基础 + 递归与深度

## 今日题目

### 题目1：二叉树的最大深度 (Maximum Depth of Binary Tree)

**难度**：⭐ 简单

**链接**：[LeetCode 104. 二叉树的最大深度](https://leetcode.cn/problems/maximum-depth-of-binary-tree/)

#### 题目描述

给定一个二叉树 `root`，返回其最大深度。

二叉树的 **最大深度** 是指从根节点到最远叶子节点的最长路径上的节点数。

**示例：**
```
输入：root = [3,9,20,null,null,15,7]
输出：3
解释：根节点 3 的深度为 1，节点 9、20 的深度为 2，节点 15、7 的深度为 3，最大深度为 3。

输入：root = [1,null,2]
输出：2
```

**提示**：
- 树中节点数量在 `[0, 10^4]` 范围内
- `-100 <= Node.val <= 100`

#### 解题思路

**方法一：递归（DFS）** ✅ 推荐

核心思想：
1. 空树深度为 0
2. 非空树深度 = 1 + max(左子树最大深度, 右子树最大深度)
3. 递归到叶子节点再回溯，自底向上得到深度

**关键点**：
- 递归定义：当前节点为根的树的最大深度，只依赖左右子树的最大深度
- 时间复杂度 O(n)，空间复杂度 O(h)，h 为树高（递归栈）

**方法二：BFS（层序遍历）**

用队列做层序遍历，层数即最大深度。每处理完一层，深度 +1。

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
    public int maxDepth(TreeNode root) {
        if (root == null) {
            return 0;
        }
        // 当前深度 = 1 + 左右子树深度的较大值
        int leftDepth = maxDepth(root.left);
        int rightDepth = maxDepth(root.right);
        return 1 + Math.max(leftDepth, rightDepth);
    }
}
```

**BFS 实现：**

```java
import java.util.*;

class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) {
            return 0;
        }
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        int depth = 0;
        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                if (node.left != null) {
                    queue.offer(node.left);
                }
                if (node.right != null) {
                    queue.offer(node.right);
                }
            }
            depth++;
        }
        return depth;
    }
}
```

#### 复杂度分析

- **递归**：时间 O(n)，空间 O(h)，h 为树高
- **BFS**：时间 O(n)，空间 O(w)，w 为最大层宽度

---

### 题目2：翻转二叉树 (Invert Binary Tree)

**难度**：⭐ 简单

**链接**：[LeetCode 226. 翻转二叉树](https://leetcode.cn/problems/invert-binary-tree/)

#### 题目描述

给你一棵二叉树的根节点 `root`，翻转这棵二叉树，并返回其根节点。

**示例：**
```
输入：root = [4,2,7,1,3,6,9]
输出：[4,7,2,9,6,3,1]

输入：root = [2,1,3]
输出：[2,3,1]

输入：root = []
输出：[]
```

**提示**：
- 树中节点数目范围在 `[0, 100]` 内
- `-100 <= Node.val <= 100`

#### 解题思路

**方法一：递归** ✅ 推荐

核心思想：
1. 空树直接返回 null
2. 先递归翻转左子树、右子树
3. 再交换当前节点的左右孩子
4. 返回当前节点

**关键点**：
- 先递归再交换，或先交换再递归均可；这里采用先递归再交换，逻辑清晰
- 时间复杂度 O(n)，空间复杂度 O(h)

**方法二：BFS/DFS 迭代**

用栈或队列遍历每个节点，对每个节点交换其左右子节点，再入队/入栈其非空子节点。

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
    public TreeNode invertTree(TreeNode root) {
        if (root == null) {
            return null;
        }
        // 先递归翻转左右子树
        TreeNode left = invertTree(root.left);
        TreeNode right = invertTree(root.right);
        // 再交换当前节点的左右孩子
        root.left = right;
        root.right = left;
        return root;
    }
}
```

**BFS 实现：**

```java
import java.util.*;

class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) {
            return null;
        }
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            // 交换左右子节点
            TreeNode tmp = node.left;
            node.left = node.right;
            node.right = tmp;
            if (node.left != null) {
                queue.offer(node.left);
            }
            if (node.right != null) {
                queue.offer(node.right);
            }
        }
        return root;
    }
}
```

#### 复杂度分析

- 时间复杂度：O(n)，每个节点访问一次
- 空间复杂度：递归 O(h)，BFS O(w)，h 为树高，w 为最大层宽

---

## 今日总结

### 学到了什么？

1. **二叉树递归**：先写递归终止条件（空节点），再写当前层逻辑，最后用左右子树的结果合并
2. **最大深度**：定义「以当前节点为根的树的最大深度」= 1 + max(左深度, 右深度)
3. **翻转二叉树**：先递归翻转左右子树，再交换当前节点的左右指针
4. **层序遍历**：用队列按层扩展，可同时求深度、按层收集节点等

### 关键技巧

| 技巧           | 适用场景           | 时间复杂度 | 空间复杂度 |
|----------------|--------------------|------------|------------|
| 递归 DFS       | 深度、翻转、遍历   | O(n)       | O(h)       |
| 层序遍历 BFS   | 按层处理、求深度   | O(n)       | O(w)       |
| 先递归再处理   | 需要子结果再合并   | O(n)       | O(h)       |

### 二叉树递归要点

1. **三步**：
   - 终止条件：`root == null` 或到达叶子
   - 当前层：用左右子树递归结果做计算或交换
   - 返回值：当前子树需要向上传递的信息（深度、新根等）

2. **常见错误**：
   - 忘记判空导致 NPE
   - 返回值与定义不一致（如求深度却返回节点）
   - 先改指针再递归导致用到已交换的子树

### 相似题目推荐

- [二叉树的最小深度](https://leetcode.cn/problems/minimum-depth-of-binary-tree/) - 注意叶子定义
- [对称二叉树](https://leetcode.cn/problems/symmetric-tree/) - 递归比较左右子树
- [二叉树的层序遍历](https://leetcode.cn/problems/binary-tree-level-order-traversal/) - BFS 按层输出
- [相同的树](https://leetcode.cn/problems/same-tree/) - 递归比较两棵树

### 明日计划

- Day 16 二叉树
- 练习：层序遍历、对称二叉树、路径和等题目
