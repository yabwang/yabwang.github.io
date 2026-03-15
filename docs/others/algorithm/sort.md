# 排序算法全面总结

## 概述

排序算法是计算机科学中最基础、最重要的算法之一。它将一组数据按照某种顺序（通常是升序或降序）进行排列。排序算法在各种应用场景中都非常重要，例如数据库索引、搜索引擎结果排序、数据分析等。

## 排序算法分类

### 按时间复杂度分类

| 算法 | 最好情况 | 平均情况 | 最坏情况 | 空间复杂度 | 稳定性 | 类型 |
|------|----------|----------|----------|------------|--------|------|
| 冒泡排序 | O(n) | O(n²) | O(n²) | O(1) | 稳定 | 比较排序 |
| 选择排序 | O(n²) | O(n²) | O(n²) | O(1) | 不稳定 | 比较排序 |
| 插入排序 | O(n) | O(n²) | O(n²) | O(1) | 稳定 | 比较排序 |
| 希尔排序 | O(n log n) | O(n^1.3) | O(n²) | O(1) | 不稳定 | 比较排序 |
| 快速排序 | O(n log n) | O(n log n) | O(n²) | O(log n) | 不稳定 | 比较排序 |
| 归并排序 | O(n log n) | O(n log n) | O(n log n) | O(n) | 稳定 | 比较排序 |
| 堆排序 | O(n log n) | O(n log n) | O(n log n) | O(1) | 不稳定 | 比较排序 |
| 计数排序 | O(n+k) | O(n+k) | O(n+k) | O(k) | 稳定 | 非比较排序 |
| 桶排序 | O(n+k) | O(n+k) | O(n²) | O(n+k) | 稳定 | 非比较排序 |
| 基数排序 | O(d*(n+k)) | O(d*(n+k)) | O(d*(n+k)) | O(n+k) | 稳定 | 非比较排序 |

## 经典排序算法详解

### 1. 快速排序 (Quick Sort)

快速排序是一种高效的排序算法，采用分治法策略。它的平均时间复杂度为O(n log n)，最坏情况为O(n²)，空间复杂度为O(log n)。

**算法步骤：**
1. 选择基准元素（pivot）
2. 分区操作：将数组分为小于基准和大于基准的两部分
3. 递归对子数组进行排序

**Java实现：**
```java
public class QuickSort {
    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pivotIndex = partition(arr, low, high);
            quickSort(arr, low, pivotIndex - 1);
            quickSort(arr, pivotIndex + 1, high);
        }
    }
    
    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        
        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                swap(arr, i, j);
            }
        }
        
        swap(arr, i + 1, high);
        return i + 1;
    }
    
    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
```

### 2. 归并排序 (Merge Sort)

归并排序是一种稳定的排序算法，采用分治法策略，时间复杂度始终为O(n log n)，但需要O(n)的额外空间。

**算法步骤：**
1. 将数组分成两半
2. 递归排序两半
3. 合并两个已排序的数组

**Java实现：**
```java
public class MergeSort {
    public static void mergeSort(int[] arr, int left, int right) {
        if (left < right) {
            int mid = left + (right - left) / 2;
            
            mergeSort(arr, left, mid);
            mergeSort(arr, mid + 1, right);
            
            merge(arr, left, mid, right);
        }
    }
    
    private static void merge(int[] arr, int left, int mid, int right) {
        int n1 = mid - left + 1;
        int n2 = right - mid;
        
        int[] leftArr = new int[n1];
        int[] rightArr = new int[n2];
        
        for (int i = 0; i < n1; i++)
            leftArr[i] = arr[left + i];
        for (int j = 0; j < n2; j++)
            rightArr[j] = arr[mid + 1 + j];
        
        int i = 0, j = 0, k = left;
        
        while (i < n1 && j < n2) {
            if (leftArr[i] <= rightArr[j]) {
                arr[k] = leftArr[i];
                i++;
            } else {
                arr[k] = rightArr[j];
                j++;
            }
            k++;
        }
        
        while (i < n1) {
            arr[k] = leftArr[i];
            i++;
            k++;
        }
        
        while (j < n2) {
            arr[k] = rightArr[j];
            j++;
            k++;
        }
    }
}
```

### 3. 堆排序 (Heap Sort)

堆排序利用堆这种数据结构设计的排序算法。它的时间复杂度始终为O(n log n)，空间复杂度为O(1)，但不稳定。

**算法步骤：**
1. 构建最大堆
2. 重复执行：将堆顶元素与末尾元素交换，调整堆

**Java实现：**
```java
public class HeapSort {
    public static void heapSort(int[] arr) {
        int n = arr.length;
        
        // 构建最大堆
        for (int i = n / 2 - 1; i >= 0; i--)
            heapify(arr, n, i);
        
        // 逐个提取元素
        for (int i = n - 1; i > 0; i--) {
            swap(arr, 0, i);
            heapify(arr, i, 0);
        }
    }
    
    private static void heapify(int[] arr, int n, int i) {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;
        
        if (left < n && arr[left] > arr[largest])
            largest = left;
        
        if (right < n && arr[right] > arr[largest])
            largest = right;
        
        if (largest != i) {
            swap(arr, i, largest);
            heapify(arr, n, largest);
        }
    }
    
    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
```

### 4. 计数排序 (Counting Sort)

计数排序是一种非比较排序算法，适用于已知数据范围的情况，时间复杂度为O(n+k)，空间复杂度为O(k)。

**算法步骤：**
1. 找出数组中的最大值和最小值
2. 统计每个元素出现的次数
3. 根据统计结果重构数组

**Java实现：**
```java
public class CountingSort {
    public static void countingSort(int[] arr) {
        if (arr.length <= 1) return;
        
        int max = arr[0], min = arr[0];
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > max) max = arr[i];
            if (arr[i] < min) min = arr[i];
        }
        
        int range = max - min + 1;
        int[] count = new int[range];
        int[] output = new int[arr.length];
        
        // 统计每个元素出现的次数
        for (int i = 0; i < arr.length; i++)
            count[arr[i] - min]++;
        
        // 计算累积计数
        for (int i = 1; i < range; i++)
            count[i] += count[i - 1];
        
        // 构建输出数组
        for (int i = arr.length - 1; i >= 0; i--) {
            output[count[arr[i] - min] - 1] = arr[i];
            count[arr[i] - min]--;
        }
        
        // 复制回原数组
        for (int i = 0; i < arr.length; i++)
            arr[i] = output[i];
    }
}
```

## 算法选择指南

### 一般情况下的选择

- **小数据量（n < 50）**：插入排序
- **中等数据量（50 ≤ n ≤ 1000）**：希尔排序
- **大数据量（n > 1000）**：快速排序、归并排序、堆排序

### 特殊情况下的选择

- **需要稳定性**：归并排序、计数排序
- **内存受限**：堆排序、快速排序
- **数据范围小**：计数排序
- **数据近似有序**：插入排序、冒泡排序
- **需要保证O(n log n)**：归并排序、堆排序

## 实际应用

### Java内置排序

Java的`Arrays.sort()`方法根据不同数据类型和长度选择不同的排序算法：

- 基本数据类型：双轴快速排序（Dual-Pivot Quicksort）
- 引用数据类型：Tim排序（改进的归并排序）
- 小数组（< 47）：插入排序
- 中等数组（47 ≤ n ≤ 286）：快速排序
- 大数组：归并排序

### JavaScript内置排序

JavaScript的`Array.prototype.sort()`使用Timsort算法，这是一种结合了归并排序和插入排序的混合算法。

## 性能测试

在实际应用中，不同排序算法的性能差异很大，选择合适的排序算法可以显著提升程序性能。对于大多数实际应用，快速排序和归并排序是最常用的选择，因为它们在平均情况下的性能表现优异。

## 总结

排序算法是算法学习的基础，理解各种排序算法的原理、特点和适用场景对于提高编程能力非常重要。在实际开发中，虽然我们通常使用语言内置的排序函数，但了解其底层实现原理有助于更好地选择和优化算法。