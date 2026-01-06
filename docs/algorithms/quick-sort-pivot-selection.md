# 快速排序基准值选择策略

## 概述

快速排序中的基准值（pivot）选择是影响算法性能的关键因素。虽然可以选择任意位置的元素作为基准，但不同的选择策略会影响算法的性能表现。

## 基准值选择方案

### 1. 选择右边最后一个值（原代码）

```java
private static int partition(int[] arr, int left, int right) {
    int pivot = arr[right];  // 选择右边最后一个值
    int i = left - 1;

    for (int j = left; j < right; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr, i, j);
        }
    }

    swap(arr, i + 1, right);
    return i + 1;
}
```

### 2. 选择左边第一个值

```java
private static int partition(int[] arr, int left, int right) {
    int pivot = arr[left];  // 选择左边第一个值
    int i = left;

    for (int j = left + 1; j <= right; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr, i, j);
        }
    }

    swap(arr, left, i);  // 将基准值放到正确位置
    return i;
}
```

### 3. 选择中间值

```java
private static int partition(int[] arr, int left, int right) {
    int mid = left + (right - left) / 2;
    int pivot = arr[mid];  // 选择中间值
    int i = left - 1;

    // 先将基准值移到右边
    swap(arr, mid, right);

    for (int j = left; j < right; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr, i, j);
        }
    }

    swap(arr, i + 1, right);
    return i + 1;
}
```

### 4. 随机选择基准值

```java
import java.util.Random;

private static final Random random = new Random();

private static int partition(int[] arr, int left, int right) {
    // 随机选择基准值
    int randomIndex = left + random.nextInt(right - left + 1);
    int pivot = arr[randomIndex];
    int i = left - 1;

    // 将随机选择的基准值移到右边
    swap(arr, randomIndex, right);

    for (int j = left; j < right; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr, i, j);
        }
    }

    swap(arr, i + 1, right);
    return i + 1;
}
```

### 5. 三数取中法（Median of Three）

```java
private static int partition(int[] arr, int left, int right) {
    // 三数取中法选择基准值
    int mid = left + (right - left) / 2;
    int pivotIndex = medianOfThree(arr, left, mid, right);
    int pivot = arr[pivotIndex];
    int i = left - 1;

    // 将选中的基准值移到右边
    swap(arr, pivotIndex, right);

    for (int j = left; j < right; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr, i, j);
        }
    }

    swap(arr, i + 1, right);
    return i + 1;
}

/**
 * 三数取中法：从left、mid、right中选择中位数
 */
private static int medianOfThree(int[] arr, int left, int mid, int right) {
    if (arr[left] <= arr[mid]) {
        if (arr[mid] <= arr[right]) {
            return mid;  // left <= mid <= right
        } else if (arr[left] <= arr[right]) {
            return right;  // left <= right < mid
        } else {
            return left;  // right < left < mid
        }
    } else {
        if (arr[left] <= arr[right]) {
            return left;  // mid < left <= right
        } else if (arr[mid] <= arr[right]) {
            return right;  // mid <= right < left
        } else {
            return mid;  // right < mid < left
        }
    }
}
```

## 完整实现示例

```java
public class QuickSortPivotSelection {
    
    /**
     * 快速排序主函数
     */
    public static void quickSort(int[] arr, int left, int right) {
        if (left < right) {
            int pivotIndex = partition(arr, left, right);
            quickSort(arr, left, pivotIndex - 1);
            quickSort(arr, pivotIndex + 1, right);
        }
    }
    
    /**
     * 分区函数 - 选择左边第一个值作为基准
     */
    private static int partition(int[] arr, int left, int right) {
        int pivot = arr[left];  // 选择左边第一个值
        int i = left;

        // 从第二个元素开始遍历
        for (int j = left + 1; j <= right; j++) {
            if (arr[j] <= pivot) {
                i++;
                swap(arr, i, j);
            }
        }

        // 将基准值放到正确位置
        swap(arr, left, i);
        return i;
    }
    
    /**
     * 交换数组中两个元素的位置
     */
    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    
    /**
     * 打印数组
     */
    public static void printArray(int[] arr, String message) {
        System.out.print(message + ": ");
        for (int i = 0; i < arr.length; i++) {
            System.out.print(arr[i]);
            if (i < arr.length - 1) {
                System.out.print(", ");
            }
        }
        System.out.println();
    }
    
    /**
     * 主函数 - 测试不同基准值选择
     */
    public static void main(String[] args) {
        int[] testArray = {64, 34, 25, 12, 22, 11, 90};
        printArray(testArray, "原数组");
        
        // 测试选择左边第一个值
        int[] array1 = testArray.clone();
        quickSort(array1, 0, array1.length - 1);
        printArray(array1, "选择左边第一个值排序后");
    }
}
```

## 不同基准值选择的比较

### 1. 选择左边第一个值

**优点：**
- 实现简单
- 不需要额外的交换操作
- 代码逻辑清晰

**缺点：**
- 对于已排序或逆序数组性能较差
- 容易导致最坏情况O(n²)

**适用场景：**
- 数据随机分布
- 对实现简单性有要求

### 2. 选择右边最后一个值

**优点：**
- 实现简单
- 与选择左边第一个值类似

**缺点：**
- 同样容易导致最坏情况
- 对特定数据分布敏感

### 3. 选择中间值

**优点：**
- 通常能提供较好的分割
- 对已排序数据表现更好

**缺点：**
- 仍然可能遇到最坏情况
- 实现稍复杂

### 4. 随机选择

**优点：**
- 避免最坏情况
- 平均性能优秀
- 对任何数据分布都表现良好

**缺点：**
- 需要随机数生成
- 性能有随机性

### 5. 三数取中法

**优点：**
- 平衡了简单性和性能
- 通常能选择到较好的基准值
- 避免极端情况

**缺点：**
- 实现相对复杂
- 仍然可能遇到最坏情况

## 性能分析

### 时间复杂度对比

| 基准值选择 | 最好情况 | 平均情况 | 最坏情况 |
|------------|----------|----------|----------|
| 左边第一个 | O(n log n) | O(n log n) | O(n²) |
| 右边最后一个 | O(n log n) | O(n log n) | O(n²) |
| 中间值 | O(n log n) | O(n log n) | O(n²) |
| 随机选择 | O(n log n) | O(n log n) | O(n log n) |
| 三数取中 | O(n log n) | O(n log n) | O(n²) |

### 实际性能测试

```java
import java.util.Arrays;
import java.util.Random;

public class PerformanceTest {
    
    public static void main(String[] args) {
        int[] sizes = {1000, 5000, 10000, 50000};
        
        for (int size : sizes) {
            System.out.println("数组大小: " + size);
            
            // 测试随机数组
            int[] randomArray = generateRandomArray(size);
            testPivotSelection(randomArray, "随机数组");
            
            // 测试已排序数组
            int[] sortedArray = generateSortedArray(size);
            testPivotSelection(sortedArray, "已排序数组");
            
            // 测试逆序数组
            int[] reverseArray = generateReverseArray(size);
            testPivotSelection(reverseArray, "逆序数组");
            
            System.out.println();
        }
    }
    
    private static void testPivotSelection(int[] arr, String arrayType) {
        System.out.println("  " + arrayType + ":");
        
        // 测试选择左边第一个值
        long startTime = System.nanoTime();
        int[] arr1 = arr.clone();
        quickSortLeftPivot(arr1, 0, arr1.length - 1);
        long endTime = System.nanoTime();
        System.out.println("    左边第一个值: " + (endTime - startTime) / 1000000 + "ms");
        
        // 测试随机选择
        startTime = System.nanoTime();
        int[] arr2 = arr.clone();
        quickSortRandomPivot(arr2, 0, arr2.length - 1);
        endTime = System.nanoTime();
        System.out.println("    随机选择: " + (endTime - startTime) / 1000000 + "ms");
    }
    
    // 生成随机数组
    private static int[] generateRandomArray(int size) {
        Random random = new Random();
        int[] arr = new int[size];
        for (int i = 0; i < size; i++) {
            arr[i] = random.nextInt(1000);
        }
        return arr;
    }
    
    // 生成已排序数组
    private static int[] generateSortedArray(int size) {
        int[] arr = new int[size];
        for (int i = 0; i < size; i++) {
            arr[i] = i;
        }
        return arr;
    }
    
    // 生成逆序数组
    private static int[] generateReverseArray(int size) {
        int[] arr = new int[size];
        for (int i = 0; i < size; i++) {
            arr[i] = size - i;
        }
        return arr;
    }
    
    // 选择左边第一个值的快速排序
    private static void quickSortLeftPivot(int[] arr, int left, int right) {
        if (left < right) {
            int pivotIndex = partitionLeftPivot(arr, left, right);
            quickSortLeftPivot(arr, left, pivotIndex - 1);
            quickSortLeftPivot(arr, pivotIndex + 1, right);
        }
    }
    
    // 随机选择基准值的快速排序
    private static void quickSortRandomPivot(int[] arr, int left, int right) {
        if (left < right) {
            int pivotIndex = partitionRandomPivot(arr, left, right);
            quickSortRandomPivot(arr, left, pivotIndex - 1);
            quickSortRandomPivot(arr, pivotIndex + 1, right);
        }
    }
    
    // 选择左边第一个值的分区函数
    private static int partitionLeftPivot(int[] arr, int left, int right) {
        int pivot = arr[left];
        int i = left;
        
        for (int j = left + 1; j <= right; j++) {
            if (arr[j] <= pivot) {
                i++;
                swap(arr, i, j);
            }
        }
        
        swap(arr, left, i);
        return i;
    }
    
    // 随机选择基准值的分区函数
    private static int partitionRandomPivot(int[] arr, int left, int right) {
        Random random = new Random();
        int randomIndex = left + random.nextInt(right - left + 1);
        int pivot = arr[randomIndex];
        int i = left - 1;
        
        swap(arr, randomIndex, right);
        
        for (int j = left; j < right; j++) {
            if (arr[j] <= pivot) {
                i++;
                swap(arr, i, j);
            }
        }
        
        swap(arr, i + 1, right);
        return i + 1;
    }
    
    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
```

## 总结

### 回答您的问题

**是的，基准值完全可以选择左边第一个值！** 实际上，选择左边第一个值作为基准值是快速排序的经典实现方式之一。

### 选择左边第一个值的实现要点

1. **基准值选择**：`int pivot = arr[left];`
2. **遍历范围**：从`left + 1`开始到`right`结束
3. **分区逻辑**：将小于等于基准值的元素移到左边
4. **最终交换**：将基准值放到正确位置

### 推荐策略

- **学习阶段**：选择左边第一个值，实现简单
- **生产环境**：使用随机选择或三数取中法
- **性能要求高**：结合多种策略，如随机选择 + 三数取中

选择左边第一个值作为基准值是完全可行的，只是在某些特定数据分布下可能性能不佳，但在实际应用中通常表现良好。
