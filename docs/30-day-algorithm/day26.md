---
order: 26
---

# Day 26 - 图论基础

> 📅 日期：2026 年 3 月 12 日
> 🎯 主题：图论基础 - DFS、BFS 与图的遍历

## 今日题目

### 题目 1：岛屿数量 (Number of Islands)

**难度**：⭐⭐ 中等

**链接**：[LeetCode 200. 岛屿数量](https://leetcode.cn/problems/number-of-islands/)

#### 题目描述

给你一个由 `'1'`（陆地）和 `'0'`（水域）组成的的二维网格，请你计算网格中岛屿的数量。

岛屿总是被水包围，并且每座岛屿只能由水平方向和/或竖直方向上相邻的陆地连接形成。

此外，你可以假设该网格的四条边均被水包围。

**示例：**
```
输入：grid = [
  ['1','1','1','1','0'],
  ['1','1','0','1','0'],
  ['1','1','0','0','0'],
  ['0','0','0','0','0']
]
输出：1

输入：grid = [
  ['1','1','0','0','0'],
  ['1','1','0','0','0'],
  ['0','0','1','0','0'],
  ['0','0','0','1','1']
]
输出：3
```

**提示**：
- `m == grid.length`
- `n == grid[i].length`
- `1 <= m, n <= 300`
- `grid[i][j]` 的值为 `'0'` 或 `'1'`

#### 解题思路

**方法一：深度优先搜索 (DFS)**

核心思想：
1. 遍历整个网格，当遇到陆地 (`'1'`) 时，岛屿数量 +1
2. 从该陆地开始进行 DFS，将所有相连的陆地都标记为已访问（可以改为 `'0'`）
3. 继续遍历，直到所有格子都被访问过

**方法二：广度优先搜索 (BFS)**

核心思想：
1. 同样遍历整个网格，遇到陆地时岛屿数量 +1
2. 使用队列进行 BFS，将相连的陆地全部标记为已访问

**关键点**：
- DFS 适合递归实现，代码简洁
- BFS 需要队列，但不会导致栈溢出（对于特别大的图更安全）
- 时间复杂度相同，空间复杂度取决于图的形状

#### 代码实现

```java
// DFS 解法
class Solution {
    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) return 0;

        int count = 0;
        int m = grid.length;
        int n = grid[0].length;

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == '1') {
                    count++;
                    dfs(grid, i, j);
                }
            }
        }

        return count;
    }

    private void dfs(char[][] grid, int i, int j) {
        int m = grid.length;
        int n = grid[0].length;

        // 边界检查
        if (i < 0 || i >= m || j < 0 || j >= n || grid[i][j] == '0') {
            return;
        }

        // 标记为已访问
        grid[i][j] = '0';

        // 向四个方向扩展
        dfs(grid, i - 1, j); // 上
        dfs(grid, i + 1, j); // 下
        dfs(grid, i, j - 1); // 左
        dfs(grid, i, j + 1); // 右
    }
}
```

**BFS 解法：**
```java
class Solution {
    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) return 0;

        int count = 0;
        int m = grid.length;
        int n = grid[0].length;
        int[][] directions = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == '1') {
                    count++;
                    bfs(grid, i, j, m, n, directions);
                }
            }
        }

        return count;
    }

    private void bfs(char[][] grid, int startI, int startJ, int m, int n, int[][] directions) {
        Queue<int[]> queue = new LinkedList<>();
        queue.offer(new int[]{startI, startJ});
        grid[startI][startJ] = '0'; // 标记为已访问

        while (!queue.isEmpty()) {
            int[] curr = queue.poll();
            int i = curr[0];
            int j = curr[1];

            for (int[] dir : directions) {
                int ni = i + dir[0];
                int nj = j + dir[1];

                if (ni >= 0 && ni < m && nj >= 0 && nj < n && grid[ni][nj] == '1') {
                    grid[ni][nj] = '0';
                    queue.offer(new int[]{ni, nj});
                }
            }
        }
    }
}
```

#### 复杂度分析

- 时间复杂度：O(m*n) - 每个格子最多访问一次
- 空间复杂度：O(m*n) - DFS 递归栈或 BFS 队列的最坏情况

---

### 题目 2：克隆图 (Clone Graph)

**难度**：⭐⭐⭐ 中等偏难

**链接**：[LeetCode 133. 克隆图](https://leetcode.cn/problems/clone-graph/)

#### 题目描述

给你无向连通图中一个节点的引用，请你返回该图的深拷贝（克隆）。

图中的每个节点都包含它的值 `val`（int）和其邻居的列表（`List[Node]`）。

```java
class Node {
    public int val;
    public List<Node> neighbors;
}
```

**示例：**
```
输入：adjList = [[2,4],[1,3],[2,4],[1,3]]
输出：[[2,4],[1,3],[2,4],[1,3]]
解释：
图中有 4 个节点。
节点 1 的值 = 1，它有两个邻居：节点 2 和 4。
节点 2 的值 = 2，它有两个邻居：节点 1 和 3。
节点 3 的值 = 3，它有两个邻居：节点 2 和 4。
节点 4 的值 = 4，它有两个邻居：节点 1 和 3。
```

**提示**：
- 节点数不超过 100
- 每个节点值都是唯一的
- 图中没有自环和重复边

#### 解题思路

**方法一：深度优先搜索 (DFS)**

核心思想：
1. 使用哈希表记录原节点到克隆节点的映射关系
2. DFS 遍历原图，对于每个节点：
   - 如果已经克隆过，直接从哈希表返回
   - 否则创建新节点，然后递归克隆所有邻居

**方法二：广度优先搜索 (BFS)**

核心思想：
1. 同样使用哈希表记录映射关系
2. BFS 遍历原图，先将所有节点克隆并放入哈希表
3. 再次遍历，为每个克隆节点添加邻居

**关键点**：
- 必须用哈希表记录已访问节点，否则会进入死循环（因为图中有环）
- DFS 代码更简洁，BFS 更直观

#### 代码实现

```java
// DFS 解法
class Solution {
    private Map<Node, Node> visited = new HashMap<>();

    public Node cloneGraph(Node node) {
        if (node == null) return null;

        // 如果已经访问过，直接返回克隆节点
        if (visited.containsKey(node)) {
            return visited.get(node);
        }

        // 创建克隆节点
        Node cloneNode = new Node(node.val, new ArrayList<>());

        // 记录映射关系
        visited.put(node, cloneNode);

        // 递归克隆所有邻居
        for (Node neighbor : node.neighbors) {
            cloneNode.neighbors.add(cloneGraph(neighbor));
        }

        return cloneNode;
    }
}
```

**BFS 解法：**
```java
class Solution {
    public Node cloneGraph(Node node) {
        if (node == null) return null;

        Map<Node, Node> visited = new HashMap<>();
        Queue<Node> queue = new LinkedList<>();

        // 克隆起始节点
        visited.put(node, new Node(node.val, new ArrayList<>()));
        queue.offer(node);

        while (!queue.isEmpty()) {
            Node curr = queue.poll();

            for (Node neighbor : curr.neighbors) {
                if (!visited.containsKey(neighbor)) {
                    // 克隆邻居节点
                    visited.put(neighbor, new Node(neighbor.val, new ArrayList<>()));
                    queue.offer(neighbor);
                }
                // 添加邻居关系到克隆节点
                visited.get(curr).neighbors.add(visited.get(neighbor));
            }
        }

        return visited.get(node);
    }
}
```

#### 复杂度分析

- 时间复杂度：O(N) - N 为节点数，每个节点和边都访问一次
- 空间复杂度：O(N) - 哈希表和递归栈/队列的空间

---

## 今日总结

### 学到了什么？

1. **图的表示方法**：
   - 邻接矩阵：适合稠密图，空间 O(n²)
   - 邻接表：适合稀疏图，空间 O(n+e)
   - 二维网格：特殊的图，每个格子是节点，上下左右是边

2. **深度优先搜索 (DFS)**：
   - 递归实现简洁，适合树和图的遍历
   - 注意处理 visited 状态，防止死循环
   - 可用于：连通分量、拓扑排序、路径查找

3. **广度优先搜索 (BFS)**：
   - 队列实现，层层扩展
   - 适合求最短路径（无权图）
   - 不会栈溢出，适合深层图

4. **图的遍历技巧**：
   - 标记已访问节点（修改原值或使用 visited 集合）
   - 使用方向数组简化代码
   - 处理边界条件

### DFS vs BFS 对比

| 特性 | DFS | BFS |
|------|-----|-----|
| 数据结构 | 栈（递归） | 队列 |
| 空间复杂度 | O(h) - 树高 | O(w) - 最大宽度 |
| 应用场景 | 路径查找、连通性 | 最短路径、层级遍历 |
| 优点 | 代码简洁 | 不会栈溢出 |
| 缺点 | 可能栈溢出 | 需要显式队列 |

### 图论常用技巧

| 技巧 | 应用场景 | 说明 |
|------|----------|------|
| 方向数组 | 网格遍历 | <span v-pre>`{{-1,0},{1,0},{0,-1},{0,1}}`</span> |
| visited 标记 | 防止重复访问 | 修改原值或用 Set/Map |
| 哈希表映射 | 图克隆、节点映射 | 原节点→新节点 |
| 并查集 | 连通性问题 | 快速合并和查询 |

### 相似题目推荐

- [被围绕的区域](https://leetcode.cn/problems/surrounded-regions/) - DFS 边界填充
- [太平洋大西洋水流问题](https://leetcode.cn/problems/pacific-atlantic-water-flow/) - 逆向 DFS/BFS
- [课程表](https://leetcode.cn/problems/course-schedule/) - 拓扑排序
- [单词接龙](https://leetcode.cn/problems/word-ladder/) - BFS 最短路径
- [岛屿的最大面积](https://leetcode.cn/problems/max-area-of-island/) - DFS 求面积

### 明日计划

- Day 27 图论进阶
- 练习：拓扑排序、最短路径算法
