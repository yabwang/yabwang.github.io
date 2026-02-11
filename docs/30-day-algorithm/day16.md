---
order: 16
---

# Day 16 - 二叉树

> 📅 日期：2026年1月23日  
> 🎯 主题：层序遍历与对称性

## 今日题目

### 题目1：二叉树的层序遍历 (Binary Tree Level Order Traversal)

**难度**：⭐⭐ 中等

**链接**：[LeetCode 102. 二叉树的层序遍历](https://leetcode.cn/problems/binary-tree-level-order-traversal/)

#### 题目描述

给你二叉树的根节点 `root`，返回其节点值的 **层序遍历** 结果。（即逐层地，从左到右访问所有节点）。

**示例：**
```
输入：root = [3,9,20,null,null,15,7]
输出：[[3],[9,20],[15,7]]

输入：root = [1]
输出：[[1]]

输入：root = []
输出：[]
```

**提示**：
- 树中节点数目在范围 `[0, 2000]` 内
- `-1000 <= Node.val <= 1000`

#### 解题思路

**方法一：BFS + 按层收集** ✅ 推荐

核心思想：
1. 用队列做 BFS，每次处理一层
2. 进入循环时记录当前层节点数 `size`，只 poll 出 `size` 个节点，这些节点即当前层
3. 将当前层节点值收集到列表，并把下一层非空子节点入队
4. 当前层列表加入结果，继续下一层

**关键点**：
- 用 `size = queue.size()` 区分层与层，保证同一层的节点在一次循环内处理完
- 时间复杂度 O(n)，空间复杂度 O(w)，w 为最大层宽

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
import java.util.*;

class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) {
            return result;
        }
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) {
                    queue.offer(node.left);
                }
                if (node.right != null) {
                    queue.offer(node.right);
                }
            }
            result.add(level);
        }
        return result;
    }
}
```

#### 复杂度分析

- 时间复杂度：O(n)，每个节点入队出队各一次
- 空间复杂度：O(w)，队列中最多一层节点数

---

### 题目2：对称二叉树 (Symmetric Tree)

**难度**：⭐ 简单

**链接**：[LeetCode 101. 对称二叉树](https://leetcode.cn/problems/symmetric-tree/)

#### 题目描述

给你一个二叉树的根节点 `root`，检查它是否轴对称。

**示例：**
```
输入：root = [1,2,2,3,4,4,3]
输出：true
解释：树是轴对称的。

输入：root = [1,2,2,null,3,null,3]
输出：false
解释：树不轴对称。
```

**提示**：
- 树中节点数目在范围 `[1, 1000]` 内
- `-100 <= Node.val <= 100`

#### 解题思路

**方法一：递归** ✅ 推荐

核心思想：
1. 空树对称；否则比较左右子树是否「镜像对称」
2. 定义辅助函数 `isMirror(left, right)`：两棵树镜像对称当且仅当
   - 都为空，或
   - 根值相等，且 left 的左与 right 的右镜像、left 的右与 right 的左镜像
3. 主函数：若 root 为空则 true，否则返回 `isMirror(root.left, root.right)`

**关键点**：
- 对称是「左子树的左 vs 右子树的右」「左子树的右 vs 右子树的左」
- 时间复杂度 O(n)，空间复杂度 O(h)

**方法二：迭代（队列）**

用队列每次放入一对节点 (left, right)，取出时比较值是否相等，再按 (left.left, right.right)、(left.right, right.left) 入队，直到队列空。

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
    public boolean isSymmetric(TreeNode root) {
        if (root == null) {
            return true;
        }
        return isMirror(root.left, root.right);
    }

    // 判断两棵树是否镜像对称
    private boolean isMirror(TreeNode left, TreeNode right) {
        if (left == null && right == null) {
            return true;
        }
        if (left == null || right == null) {
            return false;
        }
        if (left.val != right.val) {
            return false;
        }
        // 左的左 vs 右的右，左的右 vs 右的左
        return isMirror(left.left, right.right) && isMirror(left.right, right.left);
    }
}
```

**迭代实现（队列）：**

```java
import java.util.*;

class Solution {
    public boolean isSymmetric(TreeNode root) {
        if (root == null) {
            return true;
        }
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root.left);
        queue.offer(root.right);
        while (!queue.isEmpty()) {
            TreeNode p = queue.poll();
            TreeNode q = queue.poll();
            if (p == null && q == null) {
                continue;
            }
            if (p == null || q == null || p.val != q.val) {
                return false;
            }
            queue.offer(p.left);
            queue.offer(q.right);
            queue.offer(p.right);
            queue.offer(q.left);
        }
        return true;
    }
}
```

#### 复杂度分析

- 时间复杂度：O(n)
- 空间复杂度：递归 O(h)，迭代 O(w)，h 为树高，w 为最大层宽

---

## 今日总结

### 学到了什么？

1. **层序遍历**：BFS 时用 `size = queue.size()` 固定当前层节点数，循环内只处理这一层并收集到列表
2. **对称二叉树**：转化为「两棵树是否镜像」——根值相等且 (左的左, 右的右)、(左的右, 右的左) 分别镜像
3. **辅助函数**：`isMirror(left, right)` 成对比较，比「单树递归」更清晰
4. **成对入队**：迭代做法每次处理 (p, q) 一对，按镜像顺序入队子节点

### 关键技巧

| 技巧           | 适用场景           | 时间复杂度 | 空间复杂度 |
|----------------|--------------------|------------|------------|
| BFS 按层       | 层序遍历、按层收集 | O(n)       | O(w)       |
| 固定 size      | 区分层与层         | -          | -          |
| 镜像递归       | 对称、翻转类判断   | O(n)       | O(h)       |
| 成对入队       | 对称性迭代         | O(n)       | O(w)       |

### 二叉树层序与对称要点

1. **层序遍历模板**：
   - 队列非空时，`size = queue.size()`，循环 `size` 次 poll，收集 val，子节点入队，当前层列表加入 result

2. **对称判断**：
   - 递归：比较两棵子树是否镜像（根相等 + 交叉比较左右）
   - 迭代：队列中存 (p, q)，比较后按 (p.left, q.right)、(p.right, q.left) 入队

3. **常见错误**：
   - 层序时不用 size 固定，导致层与层混在一起
   - 对称时比较成 (left.left, right.left) 等，未交叉比较

### 相似题目推荐

- [二叉树的层序遍历 II](https://leetcode.cn/problems/binary-tree-level-order-traversal-ii/) - 自底向上层序
- [二叉树的右视图](https://leetcode.cn/problems/binary-tree-right-side-view/) - 每层最右节点
- [翻转二叉树](https://leetcode.cn/problems/invert-binary-tree/) - 结构翻转
- [相同的树](https://leetcode.cn/problems/same-tree/) - 两棵树结构+值完全相同

### 明日计划

- Day 17 二叉树
- 练习：路径和、子树判断、构造/遍历结合等题目
