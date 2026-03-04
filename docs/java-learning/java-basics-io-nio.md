---
order: 4
---

# Java基础 - IO/NIO

## 3. IO/NIO

### 3.1 传统IO（BIO）

#### 3.1.1 字节流
**InputStream/OutputStream**：
- `FileInputStream/FileOutputStream`：文件流
- `BufferedInputStream/BufferedOutputStream`：缓冲流
- `DataInputStream/DataOutputStream`：数据流
- `ObjectInputStream/ObjectOutputStream`：对象流

#### 3.1.2 字符流
**Reader/Writer**：
- `FileReader/FileWriter`：文件流
- `BufferedReader/BufferedWriter`：缓冲流
- `InputStreamReader/OutputStreamWriter`：转换流

**面试重点**：
- 字节流 vs 字符流
- 什么时候用字节流？什么时候用字符流？
- 缓冲流的作用

```java
// 字节流读取文件
try (FileInputStream fis = new FileInputStream("file.txt");
     BufferedInputStream bis = new BufferedInputStream(fis)) {
    byte[] buffer = new byte[1024];
    int len;
    while ((len = bis.read(buffer)) != -1) {
        // 处理数据
    }
}

// 字符流读取文件
try (FileReader fr = new FileReader("file.txt");
     BufferedReader br = new BufferedReader(fr)) {
    String line;
    while ((line = br.readLine()) != null) {
        // 处理数据
    }
}
```

### 3.2 NIO（New IO）

**核心组件**：
- `Channel`：通道
- `Buffer`：缓冲区
- `Selector`：选择器

**特点**：
- 非阻塞IO
- 面向缓冲区
- 支持选择器（多路复用）

**面试重点**：
- NIO vs BIO的区别
- NIO的三大核心组件
- 零拷贝（Zero Copy）

```java
// NIO读取文件
try (FileChannel channel = FileChannel.open(Paths.get("file.txt"), 
                                            StandardOpenOption.READ)) {
    ByteBuffer buffer = ByteBuffer.allocate(1024);
    while (channel.read(buffer) != -1) {
        buffer.flip();  // 切换为读模式
        // 处理数据
        buffer.clear();  // 清空缓冲区
    }
}
```

**Buffer的四个属性**：
- `capacity`：容量
- `limit`：限制
- `position`：位置
- `mark`：标记

### 3.3 AIO（Asynchronous IO）

**特点**：
- 异步非阻塞IO
- 基于事件和回调机制

**面试重点**：
- AIO vs NIO的区别
- 使用场景

```java
// AIO读取文件
AsynchronousFileChannel channel = AsynchronousFileChannel.open(
    Paths.get("file.txt"), StandardOpenOption.READ);

ByteBuffer buffer = ByteBuffer.allocate(1024);
channel.read(buffer, 0, buffer, new CompletionHandler<Integer, ByteBuffer>() {
    @Override
    public void completed(Integer result, ByteBuffer attachment) {
        // 读取完成
    }
    
    @Override
    public void failed(Throwable exc, ByteBuffer attachment) {
        // 读取失败
    }
});
```

### 3.4 文件操作

**常用操作**：
- 文件读写
- 文件复制
- 目录遍历
- 文件监控

**面试重点**：
- Files类的使用
- Path和Paths的使用
- 文件操作的最佳实践

```java
// 使用Files类操作文件
// 读取文件
List<String> lines = Files.readAllLines(Paths.get("file.txt"));

// 写入文件
Files.write(Paths.get("file.txt"), "content".getBytes());

// 复制文件
Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING);

// 删除文件
Files.delete(Paths.get("file.txt"));
```
