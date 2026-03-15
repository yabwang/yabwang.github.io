---
order: 27
---

# Day 27 - 图论进阶

> 📅 日期：2026 年 3 月 13 日
> 🎯 主题：图论进阶 - 拓扑排序与最短路径算法

## 今日题目

### 题目 1：课程表 (Course Schedule)

**难度**：⭐⭐⭐ 中等偏难

**链接**：[LeetCode 207. 课程表](https://leetcode.cn/problems/course-schedule/)

#### 题目描述

你这个学期必须选修 `numCourses` 门课程，记为 `0` 到 `numCourses - 1`。

在选修某些课程之前需要一些先修课程。给定先修课程数组 `prerequisites`，其中 `prerequisites[i] = [ai, bi]`，表示如果要学习课程 `ai` 则必须先学习课程 `bi`。

请你判断是否可能完成所有课程的学习？如果可以，返回 `true`；否则，返回 `false`。

**示例：**
```
输入：numCourses = 2, prerequisites = [[1,0]]
输出：true
解释：总共有 2 门课程。学习课程 1 之前，你需要完成课程 0。这是可能的。

输入：numCourses = 2, prerequisites = [[1,0],[0,1]]
输出：false
解释：总共有 2 门课程。学习课程 1 之前，你需要先完成课程 0；
     并且学习课程 0 之前，你还应先完成课程 1。这是不可能的。
```

**提示**：
- `1 <= numCourses <= 2000`
- `0 <= prerequisites.length <= 5000`
- `prerequisites[i].length == 2`
- `0 <= ai, bi < numCourses`
- `prerequisites[i]` 中的所有课程对都是唯一的

#### 解题思路

**方法一：拓扑排序 - Kahn 算法（BFS）**

核心思想：
1. 将课程依赖关系转化为有向图，如果存在环则无法完成所有课程
2. 计算每个节点的入度（有多少先修课程）
3. 将所有入度为 0 的节点加入队列（没有先修课程的课程）
4. 依次处理队列中的节点，将其邻接节点的入度减 1
5. 如果某个邻接节点入度变为 0，加入队列
6. 最后检查处理的节点数是否等于总课程数

**方法二：深度优先搜索 (DFS)**

核心思想：
1. 使用三色标记法：0=未访问，1=访问中，2=已访问
2. DFS 遍历每个节点，如果在遍历过程中遇到"访问中"的节点，说明存在环
3. 如果某个节点的所有邻接节点都访问完成，标记为"已访问"

**关键点**：
- 本质是判断有向图中是否存在环
- Kahn 算法基于入度，BFS 实现，更直观
- DFS 实现更简洁，适合递归思维

#### 代码实现

```java
// 方法一：拓扑排序 (Kahn 算法)
class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        // 构建邻接表和入度数组
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) {
            graph.add(new ArrayList<>());
        }
        int[] inDegree = new int[numCourses];

        // 建图
        for (int[] prereq : prerequisites) {
            int course = prereq[0];
            int prerequisite = prereq[1];
            graph.get(prerequisite).add(course);  // prerequisite -> course
            inDegree[course]++;
        }

        // 将入度为 0 的节点加入队列
        Queue<Integer> queue = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) {
            if (inDegree[i] == 0) {
                queue.offer(i);
            }
        }

        int processed = 0;  // 已处理的课程数

        while (!queue.isEmpty()) {
            int curr = queue.poll();
            processed++;

            // 处理邻接节点
            for (int neighbor : graph.get(curr)) {
                inDegree[neighbor]--;
                if (inDegree[neighbor] == 0) {
                    queue.offer(neighbor);
                }
            }
        }

        // 如果所有课程都处理完，说明无环
        return processed == numCourses;
    }
}
```

**DFS 解法：**
```java
class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        // 构建邻接表
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) {
            graph.add(new ArrayList<>());
        }
        for (int[] prereq : prerequisites) {
            graph.get(prereq[1]).add(prereq[0]);
        }

        // 0=未访问，1=访问中，2=已访问
        int[] visited = new int[numCourses];

        // 对每个节点进行 DFS
        for (int i = 0; i < numCourses; i++) {
            if (hasCycle(graph, visited, i)) {
                return false;
            }
        }

        return true;
    }

    private boolean hasCycle(List<List<Integer>> graph, int[] visited, int node) {
        if (visited[node] == 1) return true;   // 访问中，发现环
        if (visited[node] == 2) return false;  // 已访问，无环

        visited[node] = 1;  // 标记为访问中

        for (int neighbor : graph.get(node)) {
            if (hasCycle(graph, visited, neighbor)) {
                return true;
            }
        }

        visited[node] = 2;  // 标记为已访问
        return false;
    }
}
```

#### 复杂度分析

- 时间复杂度：O(V+E) - V 为课程数，E 为边数
- 空间复杂度：O(V+E) - 邻接表和入度数组

---

### 题目 2：网络延迟时间 (Network Delay Time)

**难度**：⭐⭐⭐ 中等偏难

**链接**：[LeetCode 743. 网络延迟时间](https://leetcode.cn/problems/network-delay-time/)

#### 题目描述

有 `n` 个网络节点，标记为 `1` 到 `n`。

给定一个列表 `times`，表示信号经过有向边的传输时间。`times[i] = (ui, vi, wi)`，其中 `ui` 是源节点，`vi` 是目标节点，`wi` 是信号从源节点传输到目标节点的时间。

现在，从某个节点 `k` 发出一个信号。返回所有节点都接收到信号所需的最少时间。如果不可能使所有节点都接收到信号，返回 `-1`。

**示例：**
```
输入：times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2
输出：2
解释：从节点 2 发出信号，1 秒后节点 1 和 3 收到信号，再经过 1 秒节点 4 收到信号。

输入：times = [[1,2,1]], n = 2, k = 1
输出：1

输入：times = [[1,2,1]], n = 2, k = 2
输出：-1
解释：节点 1 无法从节点 2 到达。
```

**提示**：
- `1 <= k <= n <= 100`
- `1 <= times.length <= 6000`
- `times[i].length == 3`
- `1 <= ui, vi <= n`
- `ui != vi`
- `0 <= wi <= 100`
- 所有 (ui, vi) 对都唯一

#### 解题思路

**方法一：Dijkstra 算法（最小堆优化）**

核心思想：
1. 这是单源最短路径问题，使用 Dijkstra 算法
2. 维护一个距离数组 `dist[]`，记录从起点到各节点的最短距离
3. 使用优先队列（最小堆），每次选择距离最小的节点进行扩展
4. 松弛操作：如果通过当前节点到达邻接节点的距离更短，则更新距离
5. 最后取所有节点的最大距离作为答案

**方法二：Bellman-Ford 算法**

核心思想：
1. 对图中的所有边进行 n-1 轮松弛操作
2. 每轮松弛操作后，至少有一个节点的距离被确定
3. 如果第 n-1 轮后还能继续松弛，说明存在负权环

**方法三：Floyd-Warshall 算法（多源最短路）**

核心思想：
1. 动态规划思想，`dist[i][j]` 表示从 i 到 j 的最短距离
2. 状态转移：`dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])`
3. 三重循环，枚举所有中间节点 k

**关键点**：
- Dijkstra 适用于非负权图，时间复杂度最优
- Bellman-Ford 可处理负权边，但效率较低
- Floyd-Warshall 是多源最短路，适合稠密图

#### 代码实现

```java
// 方法一：Dijkstra 算法（最小堆优化）
class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {
        // 构建邻接表
        List<List<int[]>> graph = new ArrayList<>();
        for (int i = 0; i <= n; i++) {
            graph.add(new ArrayList<>());
        }
        for (int[] time : times) {
            int u = time[0];
            int v = time[1];
            int w = time[2];
            graph.get(u).add(new int[]{v, w});  // {目标节点，权重}
        }

        // 距离数组
        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[k] = 0;

        // 优先队列：{节点，距离}，按距离排序
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);
        pq.offer(new int[]{k, 0});

        while (!pq.isEmpty()) {
            int[] curr = pq.poll();
            int node = curr[0];
            int d = curr[1];

            // 如果当前距离大于已记录的最短距离，跳过
            if (d > dist[node]) continue;

            // 松弛操作
            for (int[] edge : graph.get(node)) {
                int neighbor = edge[0];
                int weight = edge[1];

                if (dist[node] + weight < dist[neighbor]) {
                    dist[neighbor] = dist[node] + weight;
                    pq.offer(new int[]{neighbor, dist[neighbor]});
                }
            }
        }

        // 找出最大距离
        int maxDist = 0;
        for (int i = 1; i <= n; i++) {
            if (dist[i] == Integer.MAX_VALUE) return -1;
            maxDist = Math.max(maxDist, dist[i]);
        }

        return maxDist;
    }
}
```

**Bellman-Ford 解法：**
```java
class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {
        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[k] = 0;

        // 进行 n-1 轮松弛
        for (int i = 0; i < n - 1; i++) {
            boolean changed = false;
            for (int[] time : times) {
                int u = time[0];
                int v = time[1];
                int w = time[2];

                if (dist[u] != Integer.MAX_VALUE && dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    changed = true;
                }
            }
            if (!changed) break;  // 提前结束
        }

        // 找出最大距离
        int maxDist = 0;
        for (int i = 1; i <= n; i++) {
            if (dist[i] == Integer.MAX_VALUE) return -1;
            maxDist = Math.max(maxDist, dist[i]);
        }

        return maxDist;
    }
}
```

**Floyd-Warshall 解法（多源最短路）：**
```java
class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {
        // 初始化距离矩阵
        int[][] dist = new int[n + 1][n + 1];
        for (int i = 1; i <= n; i++) {
            Arrays.fill(dist[i], Integer.MAX_VALUE);
            dist[i][i] = 0;
        }
        for (int[] time : times) {
            dist[time[0]][time[1]] = time[2];
        }

        // Floyd-Warshall 算法
        for (int mid = 1; mid <= n; mid++) {
            for (int i = 1; i <= n; i++) {
                for (int j = 1; j <= n; j++) {
                    if (dist[i][mid] != Integer.MAX_VALUE &&
                        dist[mid][j] != Integer.MAX_VALUE) {
                        dist[i][j] = Math.min(dist[i][j],
                                            dist[i][mid] + dist[mid][j]);
                    }
                }
            }
        }

        // 找出从 k 出发的最大距离
        int maxDist = 0;
        for (int i = 1; i <= n; i++) {
            if (dist[k][i] == Integer.MAX_VALUE) return -1;
            maxDist = Math.max(maxDist, dist[k][i]);
        }

        return maxDist;
    }
}
```

#### 复杂度分析

- 时间复杂度：
  - Dijkstra：O(E*logV) - 堆优化版本
  - Bellman-Ford：O(V*E)
  - Floyd-Warshall：O(V³)
- 空间复杂度：O(V²) - 邻接表或距离矩阵

---

## 今日总结

### 学到了什么？

1. **拓扑排序**：
   - 应用于有向无环图 (DAG) 的线性排序
   - Kahn 算法基于入度，BFS 实现
   - DFS 三色标记法判断环
   - 典型应用：任务调度、课程安排、依赖解析

2. **Dijkstra 算法**：
   - 单源最短路径算法，适用于非负权图
   - 贪心思想 + 优先队列优化
   - 松弛操作：`dist[v] = min(dist[v], dist[u] + w)`

3. **最短路径算法对比**：
   - Dijkstra：非负权图，单源，O(E*logV)
   - Bellman-Ford：可处理负权边，O(V*E)
   - Floyd-Warshall：多源最短路，O(V³)

### 拓扑排序详解

| 方法 | 核心思想 | 实现方式 | 应用场景 |
|------|----------|----------|----------|
| Kahn 算法 | 不断移除入度为 0 的节点 | BFS + 入度数组 | 判断是否有环、求拓扑序 |
| DFS 算法 | 后序遍历的逆序 | DFS + 三色标记 | 判断环、输出拓扑序 |

### 最短路径算法对比

| 算法 | 单源/多源 | 负权边 | 时间复杂度 | 适用场景 |
|------|-----------|--------|------------|----------|
| Dijkstra | 单源 | ❌ | O(E*logV) | 非负权图，稀疏图 |
| Bellman-Ford | 单源 | ✅ | O(V*E) | 可处理负权边 |
| Floyd-Warshall | 多源 | ❌ | O(V³) | 稠密图，需要所有点对距离 |
| SPFA | 单源 | ✅ | O(kE) 平均 | 负权图，实际效率较高 |

### Dijkstra 算法模板

```java
// Dijkstra 模板（最小堆优化）
public int[] dijkstra(List<List<int[]>> graph, int start, int n) {
    int[] dist = new int[n + 1];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[start] = 0;

    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);
    pq.offer(new int[]{start, 0});

    while (!pq.isEmpty()) {
        int[] curr = pq.poll();
        int node = curr[0];
        int d = curr[1];

        if (d > dist[node]) continue;

        for (int[] edge : graph.get(node)) {
            int neighbor = edge[0];
            int weight = edge[1];

            if (dist[node] + weight < dist[neighbor]) {
                dist[neighbor] = dist[node] + weight;
                pq.offer(new int[]{neighbor, dist[neighbor]});
            }
        }
    }

    return dist;
}
```

### 相似题目推荐

- [课程表 II](https://leetcode.cn/problems/course-schedule-ii/) - 输出拓扑排序结果
- [最小高度树](https://leetcode.cn/problems/minimum-height-trees/) - 拓扑排序变形
- [Cheapest Flights Within K Stops](https://leetcode.cn/problems/cheapest-flights-within-k-stops/) - 有约束的最短路
- [到达目的地的第二短时间](https://leetcode.cn/problems/second-minimum-time-to-reach-destination/) - 次短路
- [信号强度最大的点](https://leetcode.cn/problems/path-with-maximum-probability/) - 最大概率路径

### 明日计划

- Day 28 二分查找
- 练习：二分查找基础、旋转数组查找
