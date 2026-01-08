# 二进制加法算法

## 题目描述
给定两个二进制字符串，返回它们的和（用二进制表示）

**示例：**
- 输入：a = "11", b = "1"
- 输出："100"

## 算法实现

### 方法一：模拟人工加法（推荐）

```java
/**
 * 方法一：模拟人工加法（推荐）
 * 从右到左逐位相加，处理进位
 */
public String addBinary(String a, String b) {
    StringBuilder result = new StringBuilder();
    int carry = 0;  // 进位
    
    // 从右到左遍历两个字符串
    int i = a.length() - 1;
    int j = b.length() - 1;
    
    // 当还有数字需要处理或还有进位时，继续循环
    while (i >= 0 || j >= 0 || carry > 0) {
        // 获取当前位的值，如果超出范围则用0
        int sum = carry;
        if (i >= 0) {
            sum += a.charAt(i) - '0';  // 将字符转换为数字
            i--;
        }
        if (j >= 0) {
            sum += b.charAt(j) - '0';  // 将字符转换为数字
            j--;
        }
        
        // 计算当前位的结果和进位
        result.insert(0, sum % 2);  // 当前位 = 和 % 2
        carry = sum / 2;            // 进位 = 和 / 2
    }
    
    return result.toString();
}
```

### 方法二：位运算实现

```java
/**
 * 方法二：位运算实现
 */
public String addBinaryBitwise(String a, String b) {
    // 确保a是较长的字符串
    if (a.length() < b.length()) {
        String temp = a;
        a = b;
        b = temp;
    }
    
    StringBuilder result = new StringBuilder();
    int carry = 0;
    
    // 从右到左处理
    for (int i = 0; i < a.length(); i++) {
        int aBit = a.charAt(a.length() - 1 - i) - '0';
        int bBit = (i < b.length()) ? b.charAt(b.length() - 1 - i) - '0' : 0;
        
        // 使用位运算计算
        int sum = aBit ^ bBit ^ carry;  // 当前位 = a⊕b⊕carry
        carry = (aBit & bBit) | ((aBit ^ bBit) & carry);  // 进位 = (a&b) | ((a⊕b)&carry)
        
        result.insert(0, sum);
    }
    
    // 如果还有进位，添加到最前面
    if (carry > 0) {
        result.insert(0, carry);
    }
    
    return result.toString();
}
```

## 算法复杂度分析

| 方法 | 时间复杂度 | 空间复杂度 | 特点 |
|------|------------|------------|------|
| 模拟加法 | O(max(M, N)) | O(max(M, N)) | 直观易懂，无限制 |
| 位运算 | O(max(M, N)) | O(max(M, N)) | 效率高，底层运算 |

其中 M 和 N 是两个二进制字符串的长度。

## 算法思路详解

### 1. 模拟人工加法（推荐方法）
- **核心思想**：模拟我们手动计算二进制加法的过程
- **步骤**：
  - 从右到左逐位相加
  - 维护一个进位变量
  - 当前位 = (a位 + b位 + 进位) % 2
  - 新进位 = (a位 + b位 + 进位) / 2

### 2. 位运算方法
- **核心思想**：使用位运算操作符进行二进制计算
- **公式**：
  - 当前位：`sum = a⊕b⊕carry`
  - 进位：`carry = (a&b) | ((a⊕b)&carry)`

### 3. 处理边界情况
- 字符串长度不同
- 最后还有进位
- 空字符串或单个字符

## 示例演示

### 示例：a = "11", b = "1"

**步骤详解：**

1. **步骤1**：1 + 1 = 2
   - 进位：1
   - 当前位：0

2. **步骤2**：1 + 0 + 1(进位) = 2
   - 进位：1
   - 当前位：0

3. **步骤3**：0 + 0 + 1(进位) = 1
   - 进位：0
   - 当前位：1

**结果：** "100"

## 测试用例

```java
// 测试用例
String[][] testCases = {
    {"11", "1"},      // 期望: "100"
    {"1010", "1011"}, // 期望: "10101"
    {"0", "0"},       // 期望: "0"
    {"1", "1"},       // 期望: "10"
    {"111", "111"}    // 期望: "1110"
};
```

**测试结果：**
- "11" + "1" = "100"
- "1010" + "1011" = "10101"
- "0" + "0" = "0"
- "1" + "1" = "10"
- "111" + "111" = "1110"

## 应用场景

1. **计算机底层运算**：CPU中的加法器实现
2. **大数运算**：处理超出基本数据类型范围的二进制数
3. **面试题目**：考察位运算和字符串处理能力
4. **数字电路设计**：逻辑门电路的设计基础

## 相关题目

- [67. 二进制求和](https://leetcode.cn/problems/add-binary/)
- [2. 两数相加](https://leetcode.cn/problems/add-two-numbers/)
- [415. 字符串相加](https://leetcode.cn/problems/add-strings/) 