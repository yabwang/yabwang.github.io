# 剑指Offer算法学习笔记

> 本文档总结了剑指Offer中的经典算法题目，适合面试前复习使用。

## 目录
- [数组与字符串](#数组与字符串)
- [链表](#链表)
- [栈与队列](#栈与队列)
- [树](#树)
- [动态规划](#动态规划)
- [回溯算法](#回溯算法)
- [位运算](#位运算)
- [数学](#数学)
- [其他经典题目](#其他经典题目)

---

## 数组与字符串

### 1. 数组中重复的数字

**题目描述**：在一个长度为n的数组里的所有数字都在0到n-1的范围内。数组中某些数字是重复的，但不知道有几个数字是重复的，也不知道每个数字重复几次。请找出数组中任意一个重复的数字。

**解题思路**：
- 方法1：使用HashSet，时间复杂度O(n)，空间复杂度O(n)
- 方法2：原地交换，时间复杂度O(n)，空间复杂度O(1)

```java
// 方法1：HashSet
public int findRepeatNumber(int[] nums) {
    Set<Integer> set = new HashSet<>();
    for (int num : nums) {
        if (set.contains(num)) {
            return num;
        }
        set.add(num);
    }
    return -1;
}

// 方法2：原地交换
public int findRepeatNumber(int[] nums) {
    for (int i = 0; i < nums.length; i++) {
        while (nums[i] != i) {
            if (nums[nums[i]] == nums[i]) {
                return nums[i];
            }
            int temp = nums[i];
            nums[i] = nums[temp];
            nums[temp] = temp;
        }
    }
    return -1;
}
```

### 2. 二维数组中的查找

**题目描述**：在一个二维数组中，每一行都按照从左到右递增的顺序排序，每一列都按照从上到下递增的顺序排序。请完成一个函数，输入这样的一个二维数组和一个整数，判断数组中是否含有该整数。

**解题思路**：从右上角开始查找，如果目标值大于当前值，向下移动；如果目标值小于当前值，向左移动。

```java
public boolean findNumberIn2DArray(int[][] matrix, int target) {
    if (matrix == null || matrix.length == 0 || matrix[0].length == 0) {
        return false;
    }
    
    int rows = matrix.length;
    int cols = matrix[0].length;
    int row = 0;
    int col = cols - 1;
    
    while (row < rows && col >= 0) {
        if (matrix[row][col] == target) {
            return true;
        } else if (matrix[row][col] > target) {
            col--;
        } else {
            row++;
        }
    }
    return false;
}
```

### 3. 替换空格

**题目描述**：请实现一个函数，把字符串 s 中的每个空格替换成"%20"。

**解题思路**：
- 方法1：使用StringBuilder，时间复杂度O(n)，空间复杂度O(n)
- 方法2：从后往前填充，避免覆盖原数据

```java
// 方法1：StringBuilder
public String replaceSpace(String s) {
    StringBuilder sb = new StringBuilder();
    for (char c : s.toCharArray()) {
        if (c == ' ') {
            sb.append("%20");
        } else {
            sb.append(c);
        }
    }
    return sb.toString();
}

// 方法2：从后往前填充
public String replaceSpace(String s) {
    int count = 0;
    for (char c : s.toCharArray()) {
        if (c == ' ') count++;
    }
    
    char[] chars = new char[s.length() + count * 2];
    int index = chars.length - 1;
    
    for (int i = s.length() - 1; i >= 0; i--) {
        if (s.charAt(i) == ' ') {
            chars[index--] = '0';
            chars[index--] = '2';
            chars[index--] = '%';
        } else {
            chars[index--] = s.charAt(i);
        }
    }
    return new String(chars);
}
```

---

## 链表

### 4. 从尾到头打印链表

**题目描述**：输入一个链表的头节点，从尾到头反过来返回每个节点的值（用数组返回）。

**解题思路**：
- 方法1：使用栈，时间复杂度O(n)，空间复杂度O(n)
- 方法2：先反转链表，再遍历，时间复杂度O(n)，空间复杂度O(1)
- 方法3：递归，时间复杂度O(n)，空间复杂度O(n)

```java
// 方法1：栈
public int[] reversePrint(ListNode head) {
    Stack<Integer> stack = new Stack<>();
    ListNode curr = head;
    while (curr != null) {
        stack.push(curr.val);
        curr = curr.next;
    }
    
    int[] result = new int[stack.size()];
    int index = 0;
    while (!stack.isEmpty()) {
        result[index++] = stack.pop();
    }
    return result;
}

// 方法2：反转链表
public int[] reversePrint(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;
    int count = 0;
    
    // 反转链表并计数
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
        count++;
    }
    
    int[] result = new int[count];
    int index = 0;
    curr = prev;
    while (curr != null) {
        result[index++] = curr.val;
        curr = curr.next;
    }
    return result;
}
```

### 5. 删除链表的节点

**题目描述**：给定单向链表的头指针和一个要删除的节点的值，定义一个函数删除该节点。返回删除后的链表的头节点。

**解题思路**：使用双指针，一个指向当前节点，一个指向前一个节点。

```java
public ListNode deleteNode(ListNode head, int val) {
    if (head == null) return null;
    if (head.val == val) return head.next;
    
    ListNode prev = head;
    ListNode curr = head.next;
    
    while (curr != null) {
        if (curr.val == val) {
            prev.next = curr.next;
            break;
        }
        prev = curr;
        curr = curr.next;
    }
    return head;
}
```

### 6. 链表中倒数第k个节点

**题目描述**：输入一个链表，输出该链表中倒数第k个节点。为了符合大多数人的习惯，本题从1开始计数，即链表的尾节点是倒数第1个节点。

**解题思路**：使用双指针，快指针先走k步，然后快慢指针同时移动。

```java
public ListNode getKthFromEnd(ListNode head, int k) {
    ListNode fast = head;
    ListNode slow = head;
    
    // 快指针先走k步
    for (int i = 0; i < k; i++) {
        fast = fast.next;
    }
    
    // 快慢指针同时移动
    while (fast != null) {
        fast = fast.next;
        slow = slow.next;
    }
    
    return slow;
}
```

---

## 栈与队列

### 7. 用两个栈实现队列

**题目描述**：用两个栈实现一个队列。队列的声明如下，请实现它的两个函数 appendTail 和 deleteHead ，分别完成在队列尾部插入整数和在队列头部删除整数的功能。

**解题思路**：使用两个栈，一个用于入队，一个用于出队。出队时，如果出队栈为空，则将入队栈的所有元素倒序放入出队栈。

```java
class CQueue {
    private Stack<Integer> stack1; // 用于入队
    private Stack<Integer> stack2; // 用于出队
    
    public CQueue() {
        stack1 = new Stack<>();
        stack2 = new Stack<>();
    }
    
    public void appendTail(int value) {
        stack1.push(value);
    }
    
    public int deleteHead() {
        if (stack2.isEmpty()) {
            while (!stack1.isEmpty()) {
                stack2.push(stack1.pop());
            }
        }
        
        if (stack2.isEmpty()) {
            return -1;
        }
        return stack2.pop();
    }
}
```

### 8. 包含min函数的栈

**题目描述**：定义栈的数据结构，请在该类型中实现一个能够得到栈的最小元素的 min 函数在该栈中，调用 min、push 及 pop 的时间复杂度都是 O(1)。

**解题思路**：使用两个栈，一个存储数据，一个存储最小值。

```java
class MinStack {
    private Stack<Integer> dataStack;
    private Stack<Integer> minStack;
    
    public MinStack() {
        dataStack = new Stack<>();
        minStack = new Stack<>();
    }
    
    public void push(int x) {
        dataStack.push(x);
        if (minStack.isEmpty() || x <= minStack.peek()) {
            minStack.push(x);
        }
    }
    
    public void pop() {
        if (dataStack.pop().equals(minStack.peek())) {
            minStack.pop();
        }
    }
    
    public int top() {
        return dataStack.peek();
    }
    
    public int min() {
        return minStack.peek();
    }
}
```

---

## 树

### 9. 重建二叉树

**题目描述**：输入某二叉树的前序遍历和中序遍历的结果，请重建该二叉树。假设输入的前序遍历和中序遍历的结果中都不含重复的数字。

**解题思路**：递归构建，前序遍历的第一个节点是根节点，在中序遍历中找到根节点的位置，左边是左子树，右边是右子树。

```java
public TreeNode buildTree(int[] preorder, int[] inorder) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < inorder.length; i++) {
        map.put(inorder[i], i);
    }
    return buildTreeHelper(preorder, 0, preorder.length - 1, 
                          inorder, 0, inorder.length - 1, map);
}

private TreeNode buildTreeHelper(int[] preorder, int preStart, int preEnd,
                                int[] inorder, int inStart, int inEnd,
                                Map<Integer, Integer> map) {
    if (preStart > preEnd) return null;
    
    TreeNode root = new TreeNode(preorder[preStart]);
    int rootIndex = map.get(preorder[preStart]);
    int leftSize = rootIndex - inStart;
    
    root.left = buildTreeHelper(preorder, preStart + 1, preStart + leftSize,
                               inorder, inStart, rootIndex - 1, map);
    root.right = buildTreeHelper(preorder, preStart + leftSize + 1, preEnd,
                                inorder, rootIndex + 1, inEnd, map);
    
    return root;
}
```

### 10. 二叉树的下一个节点

**题目描述**：给定一棵二叉树和其中的一个节点，如何找出中序遍历序列的下一个节点？树中的节点除了有两个分别指向左、右子节点的指针，还有一个指向父节点的指针。

**解题思路**：
1. 如果节点有右子树，下一个节点是右子树的最左节点
2. 如果节点没有右子树，向上查找父节点，直到找到某个节点是其父节点的左子节点

```java
public TreeNode getNext(TreeNode pNode) {
    if (pNode == null) return null;
    
    // 如果有右子树，下一个节点是右子树的最左节点
    if (pNode.right != null) {
        TreeNode node = pNode.right;
        while (node.left != null) {
            node = node.left;
        }
        return node;
    }
    
    // 如果没有右子树，向上查找父节点
    while (pNode.parent != null) {
        if (pNode.parent.left == pNode) {
            return pNode.parent;
        }
        pNode = pNode.parent;
    }
    
    return null;
}
```

### 11. 对称的二叉树

**题目描述**：请实现一个函数，用来判断一棵二叉树是不是对称的。如果一棵二叉树和它的镜像一样，那么它是对称的。

**解题思路**：递归比较左右子树是否对称。

```java
public boolean isSymmetric(TreeNode root) {
    if (root == null) return true;
    return isSymmetricHelper(root.left, root.right);
}

private boolean isSymmetricHelper(TreeNode left, TreeNode right) {
    if (left == null && right == null) return true;
    if (left == null || right == null) return false;
    if (left.val != right.val) return false;
    
    return isSymmetricHelper(left.left, right.right) && 
           isSymmetricHelper(left.right, right.left);
}
```

---

## 动态规划

### 12. 斐波那契数列

**题目描述**：写一个函数，输入 n ，求斐波那契（Fibonacci）数列的第 n 项（即 F(N)）。

**解题思路**：
- 方法1：递归，时间复杂度O(2^n)，空间复杂度O(n)
- 方法2：动态规划，时间复杂度O(n)，空间复杂度O(1)

```java
// 方法1：递归（不推荐，会超时）
public int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}

// 方法2：动态规划
public int fib(int n) {
    if (n <= 1) return n;
    
    int prev = 0, curr = 1;
    for (int i = 2; i <= n; i++) {
        int sum = (prev + curr) % 1000000007;
        prev = curr;
        curr = sum;
    }
    return curr;
}
```

### 13. 青蛙跳台阶问题

**题目描述**：一只青蛙一次可以跳上1级台阶，也可以跳上2级台阶。求该青蛙跳上一个 n 级的台阶总共有多少种跳法。

**解题思路**：与斐波那契数列类似，f(n) = f(n-1) + f(n-2)。

```java
public int numWays(int n) {
    if (n <= 1) return 1;
    
    int prev = 1, curr = 1;
    for (int i = 2; i <= n; i++) {
        int sum = (prev + curr) % 1000000007;
        prev = curr;
        curr = sum;
    }
    return curr;
}
```

### 14. 连续子数组的最大和

**题目描述**：输入一个整型数组，数组中的一个或连续多个整数组成一个子数组。求所有子数组的和的最大值。

**解题思路**：动态规划，dp[i]表示以第i个元素结尾的子数组的最大和。

```java
public int maxSubArray(int[] nums) {
    if (nums == null || nums.length == 0) return 0;
    
    int maxSum = nums[0];
    int currSum = nums[0];
    
    for (int i = 1; i < nums.length; i++) {
        currSum = Math.max(nums[i], currSum + nums[i]);
        maxSum = Math.max(maxSum, currSum);
    }
    
    return maxSum;
}
```

---

## 回溯算法

### 15. 矩阵中的路径

**题目描述**：请设计一个函数，用来判断在一个n乘m的矩阵中是否存在一条包含某字符串所有字符的路径。路径可以从矩阵中的任意一格开始，每一步可以在矩阵中向左、右、上、下移动一格。

**解题思路**：深度优先搜索 + 回溯。

```java
public boolean exist(char[][] board, String word) {
    if (board == null || board.length == 0 || word == null || word.length() == 0) {
        return false;
    }
    
    int rows = board.length;
    int cols = board[0].length;
    boolean[][] visited = new boolean[rows][cols];
    
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            if (dfs(board, word, i, j, 0, visited)) {
                return true;
            }
        }
    }
    return false;
}

private boolean dfs(char[][] board, String word, int row, int col, int index, boolean[][] visited) {
    if (index == word.length()) return true;
    if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) return false;
    if (visited[row][col] || board[row][col] != word.charAt(index)) return false;
    
    visited[row][col] = true;
    boolean result = dfs(board, word, row + 1, col, index + 1, visited) ||
                    dfs(board, word, row - 1, col, index + 1, visited) ||
                    dfs(board, word, row, col + 1, index + 1, visited) ||
                    dfs(board, word, row, col - 1, index + 1, visited);
    visited[row][col] = false;
    
    return result;
}
```

### 16. 机器人的运动范围

**题目描述**：地上有一个m行n列的方格，从坐标 [0,0] 到坐标 [m-1,n-1] 。一个机器人从坐标 [0, 0] 的格子开始移动，它每次可以向左、右、上、下移动一格（不能移动到方格外），也不能进入行坐标和列坐标的数位之和大于k的格子。

**解题思路**：深度优先搜索，计算数位之和。

```java
public int movingCount(int m, int n, int k) {
    boolean[][] visited = new boolean[m][n];
    return dfs(m, n, 0, 0, k, visited);
}

private int dfs(int m, int n, int row, int col, int k, boolean[][] visited) {
    if (row < 0 || row >= m || col < 0 || col >= n) return 0;
    if (visited[row][col]) return 0;
    if (getDigitSum(row) + getDigitSum(col) > k) return 0;
    
    visited[row][col] = true;
    return 1 + dfs(m, n, row + 1, col, k, visited) +
               dfs(m, n, row - 1, col, k, visited) +
               dfs(m, n, row, col + 1, k, visited) +
               dfs(m, n, row, col - 1, k, visited);
}

private int getDigitSum(int num) {
    int sum = 0;
    while (num > 0) {
        sum += num % 10;
        num /= 10;
    }
    return sum;
}
```

---

## 位运算

### 17. 二进制中1的个数

**题目描述**：请实现一个函数，输入一个整数（以二进制串形式），输出该数二进制表示中 1 的个数。

**解题思路**：
- 方法1：逐位检查，时间复杂度O(log n)
- 方法2：n & (n-1)，时间复杂度O(k)，k为1的个数

```java
// 方法1：逐位检查
public int hammingWeight(int n) {
    int count = 0;
    while (n != 0) {
        count += n & 1;
        n >>>= 1;
    }
    return count;
}

// 方法2：n & (n-1)
public int hammingWeight(int n) {
    int count = 0;
    while (n != 0) {
        n &= (n - 1);
        count++;
    }
    return count;
}
```

### 18. 数值的整数次方

**题目描述**：实现 pow(x, n) ，即计算 x 的 n 次幂函数（即，xn）。

**解题思路**：快速幂算法，将指数分解为二进制形式。

```java
public double myPow(double x, int n) {
    if (n == 0) return 1;
    if (n == 1) return x;
    if (n == -1) return 1 / x;
    
    double half = myPow(x, n / 2);
    double mod = myPow(x, n % 2);
    
    return half * half * mod;
}
```

---

## 数学

### 19. 打印从1到最大的n位数

**题目描述**：输入数字 n，按顺序打印出从 1 到最大的 n 位十进制数。比如输入 3，则打印出 1、2、3 一直到最大的 3 位数 999。

**解题思路**：考虑大数问题，使用字符串或数组表示。

```java
public int[] printNumbers(int n) {
    int max = (int) Math.pow(10, n) - 1;
    int[] result = new int[max];
    for (int i = 0; i < max; i++) {
        result[i] = i + 1;
    }
    return result;
}

// 考虑大数的情况
public void printNumbers(int n) {
    char[] number = new char[n];
    printNumbersHelper(number, 0);
}

private void printNumbersHelper(char[] number, int index) {
    if (index == number.length) {
        printNumber(number);
        return;
    }
    
    for (int i = 0; i <= 9; i++) {
        number[index] = (char) (i + '0');
        printNumbersHelper(number, index + 1);
    }
}

private void printNumber(char[] number) {
    boolean isBeginning0 = true;
    for (int i = 0; i < number.length; i++) {
        if (isBeginning0 && number[i] != '0') {
            isBeginning0 = false;
        }
        if (!isBeginning0) {
            System.out.print(number[i]);
        }
    }
    System.out.println();
}
```

### 20. 圆圈中最后剩下的数字

**题目描述**：0,1,···,n-1这n个数字排成一个圆圈，从数字0开始，每次从这个圆圈里删除第m个数字（删除后从下一个数字开始计数）。求出这个圆圈里剩下的最后一个数字。

**解题思路**：约瑟夫环问题，使用数学公式或递归。

```java
// 数学公式解法
public int lastRemaining(int n, int m) {
    int result = 0;
    for (int i = 2; i <= n; i++) {
        result = (result + m) % i;
    }
    return result;
}

// 递归解法
public int lastRemaining(int n, int m) {
    if (n == 1) return 0;
    return (lastRemaining(n - 1, m) + m) % n;
}
```

---

## 其他经典题目

### 21. 旋转数组的最小数字

**题目描述**：把一个数组最开始的若干个元素搬到数组的末尾，我们称之为数组的旋转。输入一个递增排序的数组的一个旋转，输出旋转数组的最小元素。

**解题思路**：二分查找，注意处理重复元素的情况。

```java
public int minArray(int[] numbers) {
    int left = 0, right = numbers.length - 1;
    
    while (left < right) {
        int mid = left + (right - left) / 2;
        
        if (numbers[mid] > numbers[right]) {
            left = mid + 1;
        } else if (numbers[mid] < numbers[right]) {
            right = mid;
        } else {
            right--;
        }
    }
    
    return numbers[left];
}
```

### 22. 调整数组顺序使奇数位于偶数前面

**题目描述**：输入一个整数数组，实现一个函数来调整该数组中数字的顺序，使得所有奇数位于数组的前半部分，所有偶数位于数组的后半部分。

**解题思路**：双指针，一个从前往后找偶数，一个从后往前找奇数，然后交换。

```java
public int[] exchange(int[] nums) {
    int left = 0, right = nums.length - 1;
    
    while (left < right) {
        while (left < right && nums[left] % 2 == 1) {
            left++;
        }
        while (left < right && nums[right] % 2 == 0) {
            right--;
        }
        
        if (left < right) {
            int temp = nums[left];
            nums[left] = nums[right];
            nums[right] = temp;
        }
    }
    
    return nums;
}
```

### 23. 和为s的两个数字

**题目描述**：输入一个递增排序的数组和一个数字s，在数组中查找两个数，使得它们的和正好是s。如果有多对数字的和等于s，则输出任意一对即可。

**解题思路**：双指针，一个指向开头，一个指向结尾。

```java
public int[] twoSum(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    
    while (left < right) {
        int sum = nums[left] + nums[right];
        if (sum == target) {
            return new int[]{nums[left], nums[right]};
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    return new int[0];
}
```

---

## 面试要点总结

### 1. 时间复杂度分析
- 数组遍历：O(n)
- 二分查找：O(log n)
- 排序算法：O(n log n)
- 动态规划：根据具体问题分析
- 回溯算法：通常是指数级复杂度

### 2. 空间复杂度分析
- 原地算法：O(1)
- 递归调用栈：O(n)
- 额外数组：O(n)
- 哈希表：O(n)

### 3. 常见优化技巧
- 双指针技巧
- 滑动窗口
- 前缀和
- 单调栈/队列
- 位运算优化

### 4. 面试注意事项
- 先理解题目，确认边界条件
- 先给出暴力解法，再优化
- 考虑时间和空间复杂度的权衡
- 注意代码的健壮性（空指针、边界条件等）
- 能够解释算法的正确性

### 5. 经典算法模板
- 二分查找模板
- 深度优先搜索模板
- 广度优先搜索模板
- 动态规划模板
- 回溯算法模板

---

## 练习建议

1. **基础题目**：先掌握数组、字符串、链表的基本操作
2. **进阶题目**：重点练习树、动态规划、回溯算法
3. **高频题目**：重点关注面试中经常出现的题目
4. **综合练习**：尝试解决一些综合性较强的题目

记住：**熟能生巧**，多练习、多总结、多思考！

---

*本文档持续更新中，欢迎补充和修正。* 