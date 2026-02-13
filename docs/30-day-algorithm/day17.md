---
order: 17
---

# Day 17 - 二叉树

> 📅 日期：2026年1月24日  
> 🎯 主题：路径和与直径

## 今日题目

### 题目1：路径总和 (Path Sum)

**难度**：⭐ 简单

**链接**：[LeetCode 112. 路径总和](https://leetcode.cn/problems/path-sum/)

#### 题目描述

给你二叉树的根节点 `root` 和一个表示目标和的整数 `targetSum`。判断该树中是否存在 **根节点到叶子节点** 的路径，这条路径上所有节点值相加等于目标和 `targetSum`。

叶子节点 是指没有子节点的节点。

**示例：**
```
输入：root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22
输出：true
解释：存在路径 5→4→11→2，和为 22。

输入：root = [1,2,3], targetSum = 5
输出：false
解释：不存在和为 5 的根到叶子路径。

输入：root = [], targetSum = 0
输出：false
```

**提示**：
- 树中节点数目在范围 `[0, 5000]` 内
- `-1000 <= Node.val <= 1000`
- `-1000 <= targetSum <= 1000`

#### 解题思路

**方法一：递归（DFS）** ✅ 推荐

核心思想：
1. 空节点返回 `false`
2. 若当前是叶子（左右都为空），判断 `root.val == targetSum` 返回 true/false
3. 否则递归左子树或右子树，目标和变为 `targetSum - root.val`
4. 左右有一边为 true 即存在路径

**关键点**：
- 必须在**叶子**处判断，不能在半路和为 targetSum 就返回 true（题目要求根到叶子）
- 时间复杂度 O(n)，空间复杂度 O(h)

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
    public boolean hasPathSum(TreeNode root, int targetSum) {
        if (root == null) {
            return false;
        }
        // 叶子节点：判断剩余和是否等于当前值
        if (root.left == null && root.right == null) {
            return root.val == targetSum;
        }
        int next = targetSum - root.val;
        return hasPathSum(root.left, next) || hasPathSum(root.right, next);
    }
}
```

#### 复杂度分析

- 时间复杂度：O(n)，每个节点至多访问一次
- 空间复杂度：O(h)，递归栈深度为树高

---

### 题目2：二叉树的直径 (Diameter of Binary Tree)

**难度**：⭐ 简单

**链接**：[LeetCode 543. 二叉树的直径](https://leetcode.cn/problems/diameter-of-binary-tree/)

#### 题目描述

给你一棵二叉树的根节点，返回该树的 **直径**。二叉树的直径是指树中任意两个节点之间最长路径的 **长度**。这条路径可能经过也可能不经过根节点。两节点之间路径的 **长度** 由它们之间边数表示。

**示例：**
```
输入：root = [1,2,3,4,5]
输出：3
解释：最长的路径是 [4,2,1,3] 或 [5,2,1,3]，长度为 3（边数）。

输入：root = [1,2]
输出：1
```

**提示**：
- 树中节点数目在范围 `[1, 10^4]` 内
- `-100 <= Node.val <= 100`

#### 解题思路

**方法一：递归 + 全局最大直径** ✅ 推荐

核心思想：
1. 对每个节点，若「直径」经过该节点，则直径 = 左子树高度 + 右子树高度（边数 = 左深度 + 右深度）
2. 定义递归函数返回「以当前节点为根的树的高度」（边数，即 max(左高, 右高) + 1，叶子为 0）
3. 在递归过程中，用当前节点的 左高+右高 更新全局最大直径
4. 最终返回全局最大直径

**关键点**：
- 直径是边数，不是节点数；高度也是从当前节点到叶子的边数
- 空节点高度 -1 或 0 均可，统一约定：空返回 0，则高度 = 1 + max(左, 右)，直径 = 左高 + 右高（不 +1）
- 时间复杂度 O(n)，空间复杂度 O(h)

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
    private int maxDiameter = 0;

    public int diameterOfBinaryTree(TreeNode root) {
        height(root);
        return maxDiameter;
    }

    // 返回以 root 为根的树的高度（边数），并顺带更新经过 root 的直径
    private int height(TreeNode root) {
        if (root == null) {
            return 0;
        }
        int leftH = height(root.left);
        int rightH = height(root.right);
        // 经过当前节点的直径 = 左高 + 右高（边数）
        maxDiameter = Math.max(maxDiameter, leftH + rightH);
        return 1 + Math.max(leftH, rightH);
    }
}
```

#### 复杂度分析

- 时间复杂度：O(n)，每个节点访问一次
- 空间复杂度：O(h)，递归栈

---

## 今日总结

### 学到了什么？

1. **路径总和**：根到叶子路径，递归时在叶子处判断 `targetSum == root.val`，非叶子则用 `targetSum - root.val` 递归左右
2. **二叉树的直径**：任意两节点最长路径（边数），可转化为「经过某节点的最长路径 = 左高 + 右高」，递归求高度的同时更新全局最大直径
3. **边数 vs 节点数**：直径、高度按边数计算时，空节点高度 0，非空高度 = 1 + max(左, 右)
4. **全局变量/引用**：在递归中需要「收集所有节点上的某种最值」时，用成员变量或单元素数组在递归中更新

### 关键技巧

| 技巧           | 适用场景           | 时间复杂度 | 空间复杂度 |
|----------------|--------------------|------------|------------|
| DFS 路径和     | 根到叶子路径判断   | O(n)       | O(h)       |
| 递归求高 + 更新 | 直径、最大路径和等 | O(n)       | O(h)       |
| 叶子才判结果   | 路径必须到叶子     | -          | -          |

### 路径与直径要点

1. **路径总和**：必须到叶子再判断；中途 sum 相等不能算（除非题目说明可为任意节点）
2. **直径**：不要求过根；对每个节点算「左高+右高」取 max 即可
3. **常见错误**：路径总和在非叶子返回 true；直径用节点数而非边数；忘记用全局或引用保存最大直径

### 相似题目推荐

- [路径总和 II](https://leetcode.cn/problems/path-sum-ii/) - 输出所有满足条件的路径
- [路径总和 III](https://leetcode.cn/problems/path-sum-iii/) - 路径不必从根开始
- [二叉树的最大路径和](https://leetcode.cn/problems/binary-tree-maximum-path-sum/) - 路径和的最大值（含负值）
- [合并二叉树](https://leetcode.cn/problems/merge-two-binary-trees/) - 递归合并两棵树

### 明日计划

- Day 18 二叉搜索树
- 练习：BST 性质、验证 BST、BST 搜索/插入、中序后继等
