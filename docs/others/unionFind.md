# 并查集(Disjoint Set Union)

## 核心概念
- **父节点数组**：记录每个元素的父节点
- **秩数组**：记录树的深度(用于按秩合并)
- **路径压缩**：查询时扁平化树结构
- **按秩合并**：防止树退化为链表

## 时间复杂度
| 操作        | 未优化 | 路径压缩+按秩合并 |
|-----------|-----|------------|
| 查找(find) | O(n) | O(α(n))  |
| 合并(union) | O(n) | O(α(n))  |

## Java实现
```java
class UnionFind {
    int[] parent;
    int[] rank;

    public UnionFind(int size) {
        parent = new int[size];
        rank = new int[size];
        for (int i = 0; i < size; i++) {
            parent[i] = i;
            rank[i] = 1;
        }
    }

    public int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]); // 路径压缩
        }
        return parent[x];
    }

    public void union(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);
        if (rootX != rootY) {
            if (rank[rootX] > rank[rootY]) {
                parent[rootY] = rootX;
            } else if (rank[rootX] < rank[rootY]) {
                parent[rootX] = rootY;
            } else {
                parent[rootY] = rootX;
                rank[rootX] += 1;
            }
        }
    }
}
```

## 应用场景

### 1. 朋友圈问题 [LeetCode 547](https://leetcode.cn/problems/number-of-provinces/)
<details>
<summary>点击查看Java实现</summary>

```java
class Solution {
    class UnionFind {
        int[] parent;
        int count;

        public UnionFind(int n) {
            parent = new int[n];
            count = n;
            for (int i = 0; i < n; i++) parent[i] = i;
        }

        public int find(int x) {
            if (parent[x] != x) parent[x] = find(parent[x]);
            return parent[x];
        }

        public void union(int x, int y) {
            int rootX = find(x);
            int rootY = find(y);
            if (rootX != rootY) {
                parent[rootX] = rootY;
                count--;
            }
        }
    }

    public int findCircleNum(int[][] isConnected) {
        int n = isConnected.length;
        UnionFind uf = new UnionFind(n);
        
        for (int i = 0; i < n; i++) {
            for (int j = i+1; j < n; j++) {
                if (isConnected[i][j] == 1) {
                    uf.union(i, j);
                }
            }
        }
        return uf.count;
    }
}
```
</details>
**问题描述**  
有n个城市，其中一些彼此相连。如果城市a与城市b直接相连，且城市b与城市c直接相连，则城市a与城市c间接相连。计算省份数量。

**示例**  
输入：isConnected = [[1,1,0],[1,1,0],[0,0,1]]  
输出：2

**解决方案**  
使用并查集统计连通分量个数，遍历邻接矩阵进行union操作

### 2. 岛屿数量 [LeetCode 200](https://leetcode.cn/problems/number-of-islands/)
<details>
<summary>点击查看并查集实现</summary>

```java
class Solution {
    class UnionFind {
        int[] parent;
        int[] rank;

        public UnionFind(int size) {
            parent = new int[size];
            rank = new int[size];
            for (int i = 0; i < size; i++) {
                parent[i] = i;
                rank[i] = 1;
            }
        }

        public int find(int x) {
            if (parent[x] != x) {
                parent[x] = find(parent[x]); // 路径压缩
            }
            return parent[x];
        }

        public void union(int x, int y) {
            int rootX = find(x);
            int rootY = find(y);
            if (rootX != rootY) {
                if (rank[rootX] > rank[rootY]) {
                    parent[rootY] = rootX;
                } else if (rank[rootX] < rank[rootY]) {
                    parent[rootX] = rootY;
                } else {
                    parent[rootY] = rootX;
                    rank[rootX] += 1;
                }
            }
        }
    }

    public int numIslands(char[][] grid) {
        if (grid.length == 0) return 0;
        int m = grid.length;
        int n = grid[0].length;
        
        UnionFind uf = new UnionFind(m * n);
        int water = 0;
        
        int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};
        
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == '1') {
                    int pos = i * n + j;
                    for (int[] dir : dirs) {
                        int x = i + dir[0];
                        int y = j + dir[1];
                        if (x >= 0 && x < m && y >= 0 && y < n && grid[x][y] == '1') {
                            uf.union(pos, x * n + y);
                        }
                    }
                } else {
                    water++;
                }
            }
        }
        return uf.getCount() - water;
    }
}
```
</details>
**问题描述**  
给定'1'(陆地)和'0'(水)组成的二维网格，计算岛屿数量

**示例**  
输入：
[
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
输出：3

**解决方案**  
遍历每个陆地单元格，与相邻陆地执行union操作

### 3. 最小生成树 [LeetCode 1584](https://leetcode.cn/problems/min-cost-to-connect-all-points/)
<details>
<summary>点击查看Kruskal实现</summary>

```java
class Solution {
    class UnionFind {
        int[] parent;
        int[] rank;

        public UnionFind(int size) {
            parent = new int[size];
            rank = new int[size];
            for (int i = 0; i < size; i++) {
                parent[i] = i;
                rank[i] = 1;
            }
        }

        public int find(int x) {
            if (parent[x] != x) {
                parent[x] = find(parent[x]); // 路径压缩
            }
            return parent[x];
        }

        public void union(int x, int y) {
            int rootX = find(x);
            int rootY = find(y);
            if (rootX != rootY) {
                if (rank[rootX] > rank[rootY]) {
                    parent[rootY] = rootX;
                } else if (rank[rootX] < rank[rootY]) {
                    parent[rootX] = rootY;
                } else {
                    parent[rootY] = rootX;
                    rank[rootX] += 1;
                }
            }
        }
    }

    public int minCostConnectPoints(int[][] points) {
        List<int[]> edges = new ArrayList<>();
        int n = points.length;
        
        // 生成所有边
        for (int i = 0; i < n; i++) {
            for (int j = i+1; j < n; j++) {
                int cost = Math.abs(points[i][0]-points[j][0]) + Math.abs(points[i][1]-points[j][1]);
                edges.add(new int[]{i, j, cost});
            }
        }
        
        // 按权值排序
        Collections.sort(edges, (a, b) -> a[2] - b[2]);
        
        UnionFind uf = new UnionFind(n);
        int minCost = 0;
        int edgesUsed = 0;
        
        for (int[] edge : edges) {
            if (uf.find(edge[0]) != uf.find(edge[1])) {
                uf.union(edge[0], edge[1]);
                minCost += edge[2];
                if (++edgesUsed == n-1) break;
            }
        }
        return minCost;
    }
}
```
</details>
**Kruskal算法实现**  
1. 生成所有边的权值
2. 按权值排序后依次选取
3. 使用并查集检测是否形成环

### 4. 网络连通性 [LeetCode 1319](https://leetcode.cn/problems/number-of-operations-to-make-network-connected/)
<details>
<summary>点击查看连通性检测实现</summary>

```java
class Solution {
    class UnionFind {
        int[] parent;
        int[] rank;

        public UnionFind(int size) {
            parent = new int[size];
            rank = new int[size];
            for (int i = 0; i < size; i++) {
                parent[i] = i;
                rank[i] = 1;
            }
        }

        public int find(int x) {
            if (parent[x] != x) {
                parent[x] = find(parent[x]); // 路径压缩
            }
            return parent[x];
        }

        public void union(int x, int y) {
            int rootX = find(x);
            int rootY = find(y);
            if (rootX != rootY) {
                if (rank[rootX] > rank[rootY]) {
                    parent[rootY] = rootX;
                } else if (rank[rootX] < rank[rootY]) {
                    parent[rootX] = rootY;
                } else {
                    parent[rootY] = rootX;
                    rank[rootX] += 1;
                }
            }
        }
    }

    public int makeConnected(int n, int[][] connections) {
        if (connections.length < n-1) return -1;
        
        UnionFind uf = new UnionFind(n);
        int redundant = 0;
        
        for (int[] conn : connections) {
            if (uf.find(conn[0]) != uf.find(conn[1])) {
                uf.union(conn[0], conn[1]);
            } else {
                redundant++;
            }
        }
        
        int needed = uf.getCount() - 1;
        return redundant >= needed ? needed : -1;
    }
}
```
</details>
**问题描述**  
给定n台计算机和连接线数组，求使所有计算机连通所需的最少操作次数

**示例**  
输入：n = 4, connections = [[0,1],[0,2],[1,2]]  
输出：1

**解决方案**  
计算连通分量个数k，至少需要k-1条额外连接

## 复杂度证明
α(n)是阿克曼函数的反函数，增长极其缓慢，对于任何实际应用的n值，α(n) ≤ 5