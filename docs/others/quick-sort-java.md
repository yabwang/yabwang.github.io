# 快速排序算法 - Java实现

## 概述

快速排序（Quick Sort）是一种高效的排序算法，采用分治法（Divide and Conquer）策略。它的平均时间复杂度为O(n log n)，最坏情况为O(n²)，空间复杂度为O(log n)。

## 算法原理

1. **选择基准元素**：从数组中选择一个元素作为基准（pivot）
2. **分区操作**：将数组重新排列，使得所有小于基准的元素都在基准前面，大于基准的元素都在基准后面
3. **递归排序**：对基准前后的子数组递归执行快速排序

## Java实现

### 基础版本

```java
public class QuickSort {
    
    /**
     * 快速排序主函数
     * 
     * @param arr 待排序的数组
     * @param low 数组起始索引
     * @param high 数组结束索引
     */
    public static void quickSort(int[] arr, int low, int high) {
        // 递归终止条件：当子数组只有一个元素或为空时
        if (low < high) {
            // 分区操作，返回基准元素的最终位置
            int pivotIndex = partition(arr, low, high);
            
            // 递归排序基准左边的子数组
            quickSort(arr, low, pivotIndex - 1);
            
            // 递归排序基准右边的子数组
            quickSort(arr, pivotIndex + 1, high);
        }
    }
    
    /**
     * 分区函数 - 快速排序的核心
     * 
     * @param arr 待排序的数组
     * @param low 数组起始索引
     * @param high 数组结束索引
     * @return 基准元素的最终位置
     */
    private static int partition(int[] arr, int low, int high) {
        // 选择最后一个元素作为基准
        int pivot = arr[high];
        
        // i是小于基准元素的区域的边界索引
        // 初始时，小于基准的区域为空，所以i = low - 1
        int i = low - 1;
        
        // 遍历数组，将小于基准的元素移到左边
        for (int j = low; j < high; j++) {
            // 如果当前元素小于或等于基准
            if (arr[j] <= pivot) {
                // 扩展小于基准的区域
                i++;
                // 交换元素，将小于基准的元素移到左边
                swap(arr, i, j);
            }
        }
        
        // 将基准元素放到正确的位置
        // i+1是基准元素的最终位置
        swap(arr, i + 1, high);
        
        // 返回基准元素的最终位置
        return i + 1;
    }
    
    /**
     * 交换数组中两个元素的位置
     * 
     * @param arr 数组
     * @param i 第一个元素的索引
     * @param j 第二个元素的索引
     */
    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    
    /**
     * 快速排序包装函数，提供更简洁的接口
     * 
     * @param arr 待排序的数组
     * @return 排序后的数组
     */
    public static int[] quickSort(int[] arr) {
        // 创建数组副本，避免修改原数组
        int[] sortedArr = arr.clone();
        
        // 调用快速排序
        quickSort(sortedArr, 0, sortedArr.length - 1);
        
        return sortedArr;
    }
    
    /**
     * 打印数组
     * 
     * @param arr 要打印的数组
     * @param message 打印前的消息
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
     * 主函数 - 测试快速排序
     */
    public static void main(String[] args) {
        // 测试用例1：普通数组
        int[] testArray1 = {64, 34, 25, 12, 22, 11, 90};
        printArray(testArray1, "原数组");
        int[] sortedArray1 = quickSort(testArray1);
        printArray(sortedArray1, "排序后");
        System.out.println();
        
        // 测试用例2：已排序数组
        int[] testArray2 = {1, 2, 3, 4, 5};
        printArray(testArray2, "原数组");
        int[] sortedArray2 = quickSort(testArray2);
        printArray(sortedArray2, "排序后");
        System.out.println();
        
        // 测试用例3：逆序数组
        int[] testArray3 = {5, 4, 3, 2, 1};
        printArray(testArray3, "原数组");
        int[] sortedArray3 = quickSort(testArray3);
        printArray(sortedArray3, "排序后");
        System.out.println();
        
        // 测试用例4：包含重复元素
        int[] testArray4 = {3, 1, 4, 1, 5, 9, 2, 6, 5};
        printArray(testArray4, "原数组");
        int[] sortedArray4 = quickSort(testArray4);
        printArray(sortedArray4, "排序后");
        System.out.println();
        
        // 测试用例5：单个元素
        int[] testArray5 = {42};
        printArray(testArray5, "原数组");
        int[] sortedArray5 = quickSort(testArray5);
        printArray(sortedArray5, "排序后");
        System.out.println();
        
        // 测试用例6：空数组
        int[] testArray6 = {};
        printArray(testArray6, "原数组");
        int[] sortedArray6 = quickSort(testArray6);
        printArray(sortedArray6, "排序后");
    }
}
```

### 泛型版本

```java
import java.util.Comparator;

public class QuickSortGeneric<T> {
    
    /**
     * 快速排序主函数（泛型版本）
     * 
     * @param arr 待排序的数组
     * @param low 数组起始索引
     * @param high 数组结束索引
     * @param comparator 比较器
     */
    public static <T> void quickSort(T[] arr, int low, int high, Comparator<T> comparator) {
        // 递归终止条件：当子数组只有一个元素或为空时
        if (low < high) {
            // 分区操作，返回基准元素的最终位置
            int pivotIndex = partition(arr, low, high, comparator);
            
            // 递归排序基准左边的子数组
            quickSort(arr, low, pivotIndex - 1, comparator);
            
            // 递归排序基准右边的子数组
            quickSort(arr, pivotIndex + 1, high, comparator);
        }
    }
    
    /**
     * 分区函数（泛型版本）
     * 
     * @param arr 待排序的数组
     * @param low 数组起始索引
     * @param high 数组结束索引
     * @param comparator 比较器
     * @return 基准元素的最终位置
     */
    private static <T> int partition(T[] arr, int low, int high, Comparator<T> comparator) {
        // 选择最后一个元素作为基准
        T pivot = arr[high];
        
        // i是小于基准元素的区域的边界索引
        int i = low - 1;
        
        // 遍历数组，将小于基准的元素移到左边
        for (int j = low; j < high; j++) {
            // 如果当前元素小于或等于基准
            if (comparator.compare(arr[j], pivot) <= 0) {
                // 扩展小于基准的区域
                i++;
                // 交换元素
                swap(arr, i, j);
            }
        }
        
        // 将基准元素放到正确的位置
        swap(arr, i + 1, high);
        
        // 返回基准元素的最终位置
        return i + 1;
    }
    
    /**
     * 交换数组中两个元素的位置（泛型版本）
     * 
     * @param arr 数组
     * @param i 第一个元素的索引
     * @param j 第二个元素的索引
     */
    private static <T> void swap(T[] arr, int i, int j) {
        T temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    
    /**
     * 快速排序包装函数（泛型版本）
     * 
     * @param arr 待排序的数组
     * @param comparator 比较器
     * @return 排序后的数组
     */
    public static <T> T[] quickSort(T[] arr, Comparator<T> comparator) {
        // 创建数组副本
        T[] sortedArr = arr.clone();
        
        // 调用快速排序
        quickSort(sortedArr, 0, sortedArr.length - 1, comparator);
        
        return sortedArr;
    }
    
    /**
     * 打印数组（泛型版本）
     * 
     * @param arr 要打印的数组
     * @param message 打印前的消息
     */
    public static <T> void printArray(T[] arr, String message) {
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
     * 主函数 - 测试泛型快速排序
     */
    public static void main(String[] args) {
        // 测试字符串数组
        String[] stringArray = {"banana", "apple", "cherry", "date", "elderberry"};
        printArray(stringArray, "原字符串数组");
        String[] sortedStringArray = quickSort(stringArray, String.CASE_INSENSITIVE_ORDER);
        printArray(sortedStringArray, "排序后");
        System.out.println();
        
        // 测试整数数组（使用Integer包装类）
        Integer[] intArray = {64, 34, 25, 12, 22, 11, 90};
        printArray(intArray, "原整数数组");
        Integer[] sortedIntArray = quickSort(intArray, Integer::compareTo);
        printArray(sortedIntArray, "排序后");
        System.out.println();
        
        // 测试自定义对象数组
        Person[] personArray = {
            new Person("Alice", 25),
            new Person("Bob", 30),
            new Person("Charlie", 20),
            new Person("David", 35)
        };
        
        printArray(personArray, "原人员数组");
        Person[] sortedPersonArray = quickSort(personArray, Comparator.comparing(Person::getAge));
        printArray(sortedPersonArray, "按年龄排序后");
    }
    
    /**
     * 人员类 - 用于测试自定义对象排序
     */
    static class Person {
        private String name;
        private int age;
        
        public Person(String name, int age) {
            this.name = name;
            this.age = age;
        }
        
        public String getName() {
            return name;
        }
        
        public int getAge() {
            return age;
        }
        
        @Override
        public String toString() {
            return name + "(" + age + ")";
        }
    }
}
```

### 优化版本

```java
import java.util.Random;

public class QuickSortOptimized {
    
    private static final Random random = new Random();
    
    /**
     * 随机化快速排序 - 随机选择基准元素
     * 
     * @param arr 待排序的数组
     * @param low 数组起始索引
     * @param high 数组结束索引
     */
    public static void quickSortRandomized(int[] arr, int low, int high) {
        if (low < high) {
            // 随机选择基准元素
            int randomIndex = random.nextInt(high - low + 1) + low;
            swap(arr, randomIndex, high);
            
            // 分区操作
            int pivotIndex = partition(arr, low, high);
            
            // 递归排序
            quickSortRandomized(arr, low, pivotIndex - 1);
            quickSortRandomized(arr, pivotIndex + 1, high);
        }
    }
    
    /**
     * 三路快速排序 - 优化处理重复元素
     * 
     * @param arr 待排序的数组
     * @param low 数组起始索引
     * @param high 数组结束索引
     */
    public static void quickSort3Way(int[] arr, int low, int high) {
        if (low < high) {
            // 三路分区
            int[] pivotIndices = partition3Way(arr, low, high);
            int lt = pivotIndices[0];
            int gt = pivotIndices[1];
            
            // 递归排序小于基准的部分
            quickSort3Way(arr, low, lt - 1);
            
            // 递归排序大于基准的部分
            quickSort3Way(arr, gt + 1, high);
        }
    }
    
    /**
     * 三路分区函数
     * 
     * @param arr 待排序的数组
     * @param low 数组起始索引
     * @param high 数组结束索引
     * @return 包含lt和gt的数组
     */
    private static int[] partition3Way(int[] arr, int low, int high) {
        // 选择基准元素
        int pivot = arr[low];
        
        // 初始化指针
        int lt = low;      // arr[low..lt-1] < pivot
        int i = low + 1;   // arr[lt..i-1] = pivot
        int gt = high;     // arr[gt+1..high] > pivot
        
        while (i <= gt) {
            if (arr[i] < pivot) {
                // 当前元素小于基准，交换到左边
                swap(arr, lt, i);
                lt++;
                i++;
            } else if (arr[i] > pivot) {
                // 当前元素大于基准，交换到右边
                swap(arr, i, gt);
                gt--;
            } else {
                // 当前元素等于基准，继续
                i++;
            }
        }
        
        return new int[]{lt, gt};
    }
    
    /**
     * 基础分区函数
     */
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
     * 主函数 - 测试优化版本
     */
    public static void main(String[] args) {
        // 测试随机化快速排序
        int[] testArray1 = {64, 34, 25, 12, 22, 11, 90};
        printArray(testArray1, "原数组");
        quickSortRandomized(testArray1, 0, testArray1.length - 1);
        printArray(testArray1, "随机化快排后");
        System.out.println();
        
        // 测试三路快速排序
        int[] testArray2 = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5};
        printArray(testArray2, "原数组");
        quickSort3Way(testArray2, 0, testArray2.length - 1);
        printArray(testArray2, "三路快排后");
    }
}
```

## 算法分析

### 时间复杂度

- **最好情况**：O(n log n) - 每次分区都能将数组平均分成两部分
- **平均情况**：O(n log n) - 随机选择基准元素
- **最坏情况**：O(n²) - 每次选择的基准都是最大或最小元素

### 空间复杂度

- **平均情况**：O(log n) - 递归调用栈的深度
- **最坏情况**：O(n) - 递归调用栈的深度

### 稳定性

快速排序是不稳定的排序算法，因为相等元素的相对位置可能会改变。

## 与其他排序算法比较

| 算法 | 平均时间复杂度 | 最坏时间复杂度 | 空间复杂度 | 稳定性 |
|------|----------------|----------------|------------|--------|
| 快速排序 | O(n log n) | O(n²) | O(log n) | 不稳定 |
| 归并排序 | O(n log n) | O(n log n) | O(n) | 稳定 |
| 堆排序 | O(n log n) | O(n log n) | O(1) | 不稳定 |
| 冒泡排序 | O(n²) | O(n²) | O(1) | 稳定 |

## 适用场景

### 优点
- 平均性能优秀
- 原地排序（空间复杂度低）
- 实现相对简单
- 支持泛型编程

### 缺点
- 最坏情况性能差
- 不稳定排序
- 递归调用可能栈溢出

### 推荐使用场景
- 数据量较大且分布相对随机
- 对空间复杂度有要求
- 不需要稳定排序
- 需要支持多种数据类型

## 总结

Java版本的快速排序提供了多种实现方式，包括基础版本、泛型版本和优化版本。通过详细的注释和测试用例，帮助理解算法的实现原理和适用场景。快速排序是一种高效的排序算法，在实际应用中表现优秀。
