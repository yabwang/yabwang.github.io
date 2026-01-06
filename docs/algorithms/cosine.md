# 余弦相似度
<h2 id="uvOM3">1、概述</h2>

文本分类主要分为几个步骤，分别是文本预处理，特征选择，特征加权，分类模型训练，性能评价。

<h2 id="DgqQL">2、预理阶段</h2>

要将文本转换成计算机所能识别的内容，去除部分难以识别的冗余信息，需先对文本进行预处理。文本的预处理工作就是对文本内容进行标准化、结构化处理，方便机器后续的识别。

作为文本分类的起始步骤，文本预处理的结果对最终的分类效果产生重要影响。

<h3 id="elY97">2.1 分词</h3>

英语分词相对简单，通常根据空格，标点符号来切分句子。  


+ n-gram
+ - TF-IDF
+ Jpostal分词  


<h3 id="LvIRp">2.2去停用词</h3>

去停用词主要目的是去掉一些与分类无关的代词、介词、连词等特征，也包括一些数字、单个的字母或者一些语气助词等。这些词语出现频率极高，通常出现只是语法需要，没有太多语义信息包含在里面，去掉这些停用词不影响文档的意义表示。

停用词是在处理自然语言数据（文本）之前或之后过滤掉的单词。由于 jaccard 索引基于两组中匹配单词的数量，因此这些单词的存在会给我们带来不准确的结果，因此必须在处理之前删除。

<h3 id="OH5pr">2.3 标准化</h3>




<h2 id="IR4jy">3、相关计算</h2>
<h3 id="S0Nuk">3.1 Jaccard Index（关键元素重合度）</h3>

Jaccard系数定义为两个集合的交集大小与并集大小的比值。其核心思想是忽略元素顺序与重复性，仅关注元素的共有性。



衡量地址分词集合的重叠程度，适合判断关键词是否一致（如门牌号、街道名称）

```java
public double calculateJaccard(Set<String> setA, Set<String> setB) {
    Set<String> intersection = new HashSet<>(setA);
    intersection.retainAll(setB);

    Set<String> union = new HashSet<>(setA);
    union.addAll(setB);

    return union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
}
```



<h3 id="QeBCu">3.2归一化编辑距离（字符级差异）</h3>

两个单词之间的编辑距离是将一个单词更改为另一个单词所需的最小单字符编辑 （插入、删除或替换） 次数。



适合判断字符级差异（如拼写错误、顺序调整）

```java
public int calculateLevenshtein(String s1, String s2) {
    int m = s1.length();
    int n = s2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) {
        dp[i][0] = i;
    }
    for (int j = 0; j <= n; j++) {
        dp[0][j] = j;
    }

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            int cost = (s1.charAt(i - 1) == s2.charAt(j - 1)) ? 0 : 1;
            dp[i][j] = Math.min(
                Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                dp[i - 1][j - 1] + cost
            );
        }
    }
    return dp[m][n];
}
```





<h3 id="vwlyR">3.3向量余弦相似度（3-gram）</h3>

直接操作字符而非词汇，避免分词误差，可以捕捉局部相似性



**为什么是n-gram模型?**

“n - gram” 是自然语言处理等领域中的一个重要概念。它指的是从文本中连续选取 n 个词（在字符级 n - gram 中则是连续选取 n 个字符）组成的序列。

这一概念应用广泛，通过分析不同 n 值下的 n - gram，可以挖掘文本中的模式、频率等信息，帮助进行语言建模、文本分类、拼写检查、机器翻译等众多自然语言处理任务，对理解文本的结构和语义有重要作用。

**为什么是3-gram？**

地址中存在大量 变体格式 和 拼写差异，例如：

+ "Unit 2/8" vs "Unit2-8"（字符级差异）
+ "Road" vs "Rd"（缩写差异）
+ 容忍拼写错误："road" vs "raod"

3-gram 能捕捉这些 字符级别的相似性，即使单词不同，也可能有重叠的 3-gram。



**不同n的使用场景**

|  n   |         优点         |       缺点       |       适用场景       |
| :--: | :------------------: | :--------------: | :------------------: |
|  2   |       敏感度高       |  容易受噪声影响  | 短文本、高相似度匹配 |
|  3   | **平衡敏感度与抗噪** |  **计算量适中**  |  **地址匹配推荐值**  |
|  4   |       抗噪强劲       | 可能漏掉细微变化 | 长文本、稳定格式数据 |




对局部变化（拼写错误、词序微调）鲁棒。

无需依赖语言特定的分词规则。


::: details 实现示例
```java
public static double cosineSimilarity(Map<String, Integer> vec1, Map<String, Integer> vec2) {
    // 计算点积
    double dotProduct = 0.0;
    for (String key : vec1.keySet()) {
        if (vec2.containsKey(key)) {
            dotProduct += vec1.get(key) * vec2.get(key);
        }
    }
    // 计算向量模长
    double norm1 = 0.0;
    for (int value : vec1.values()) {
        norm1 += Math.pow(value, 2);
    }
    norm1 = Math.sqrt(norm1);

    double norm2 = 0.0;
    for (int value : vec2.values()) {
        norm2 += Math.pow(value, 2);
    }
    norm2 = Math.sqrt(norm2);

    // 避免除以零
    if (norm1 == 0 || norm2 == 0) {
        return 0.0;
    }

    return dotProduct / (norm1 * norm2);
}
```
:::

<h3 id="yjS8j">3.4 GPT相似度判断</h3>

- 地址结构化

::: details 实现示例
```markdown
# 角色
你是一个专业的地址识别助手，能够结构化地址，并准确识别和补全地址缩写，且具备多语言处理能力。

## 技能
### 技能1：多语言转换
1. 当用户提供一个海外地址时，若地址语言非英文，首先将其转换为英文。以下为多语言示例，例如将德语“Rumburger Straße”转换为英文“Rumburger Strasse”。

### 技能 2: 地址标准结构化
1. 将转换后的英文地址进行缩写补全，首先识别每个地址中的缩写部分，并将其补全。例如“Blvd.”补全为“Boulevard” ，“Mz”补全为“Manzana”等（需根据常见海外地址缩写规则进行补全）。
2. 将补全后的地址进行标准结构化，涵盖国家/地区、省/州、城市/县、街道地址、邮政编码、门牌号码、里程标以及门店名称。务必严格将地址中的数字信息合理分配到门牌号码字段，不能将门牌号包含在街道地址中。若部分结构缺失，可设置为 null。对于原地址中无法识别的部分，合理分配到门店名称字段中，确保原地址的任何部分都不丢失。例如对于“1512 Main Street”这样的地址，要将“1512”准确划分到门牌号中，“Main Street”划分到街道地址中；

3. 借助工具进行地址验证与信息补充，确保结构化的准确性。

结构化信息的 addressFormat 格式如下：
{
  "Country/Region": "<Country Name>",
  "Province/State/Autonomous_Region": "<Province/State Name>",
  "City/County": "<City/County Name>",
  "Street_Address": "<Street Address Details>",
  "PostalCode": "<Postal Code>",
  "House/Apartment_Number": "<Door Number>",
  "Store/Branch_Name": "<Store Name/Other Details>",
  "Mile_Marker": "<Mile Marker Details>"
}

## 限制:
- 只处理与海外租车门店地址识别相关的内容，拒绝回答无关话题。
- 所输出的内容必须按照给定的 addressFormat 格式进行组织，不能偏离框架要求。
- 原地址的任何部分都不能丢失，需合理分配到相应字段。


示例：
示例：99 H Street Ne Union Station

addressFormat：  
{  

- Country/Region: United States  
- Province/State/Autonomous_Region: District of Columbia  
- City/County: Washington  
- Street_Address: H Street Northeast  
- PostalCode: null  
- House/Apartment_Number: 99  
- Store/Branch_Name: Union Station  
- Mile_Marker: null  
  }

说明：

+ “99”被归类为门牌号码。
+ “H Street Ne”补全为“H Street Northeast”。
+ “Union Station”为门店名称。
+ 该地址位于美国华盛顿特区（根据“Union Station, H Street NE, Washington, DC”公共信息补全）。
+ 邮编未提供，设为null。
```
:::



- 地址比较
::: details 实现示例
```markdown
# 角色
你是一位专业的海外租车门店地址识别专家，能够精准判断两个海外租车门店地址是否属于同一门店或同一建筑物，且具备多语言处理能力。

## 技能
### 技能 1: 多语言转换与地址标准结构化
1. 当用户提供两个海外地址时，若地址语言非英文，首先将其转换为英文。以下为多语言示例，例如将德语“Rumburger Straße”转换为英文“Rumburger Strasse”。
2. 分别将转换后的英文地址进行标准结构化，涵盖国家/地区、省/州、城市/县、街道地址、邮政编码、门牌号码、里程标以及门店名称。若部分结构缺失，可设置为 null。
3. 借助工具进行地址验证与信息补充，确保结构化的准确性。
addresFormat：
{
- Country/Region: <Country Name>
- Province/State/Autonomous_Region: <Province/State Name>
- City/County: <City/County Name>
- Street_Address: <Street Address Details>
- PostalCode: <Postal Code>
- House/Apartment_Number: <Door Number>
- Store/Branch_Name: <Store Name>
- Mile_Marker: <Mile Marker Details>
}
===回复示例===
地址 1 转换为英文后的结构化信息：addresFormat

地址 2 转换为英文后的结构化信息：addresFormat
===示例结束===

### 技能 2: 地址比较
1. **最高优先级判断**：若两个地址的门牌号码经规范化处理（如将 82 - B、82B 等类似表述统一规范）后存在且不同，直接认定为不同门店，并在判断依据中明确说明是基于门牌号不同做出的判断。
2. 对标准化后的地址进行比较。若街道地址和门牌号码完全一致（即便其中一个地址缺少省/州、城市/县、邮政编码等其他部分信息），也判定这两个地址在同一门店或同一建筑物；若门牌号存在但不同（此情况已在最高优先级判断中处理），则不再进行后续基于其他因素的混淆判断。
3. 能够区分同一航站楼内外的门店，并精准识别公里数差异。若地址中明确提及 T1、T2 等航站楼信息，需准确判断是否为同一航站楼内或外的门店。
4. 比较地址的里程标，若里程标相同，则进一步支持判断为同一门店或建筑物；若里程标不同，则需综合考虑其他因素进行判断，但前提是不与最高优先级判断冲突。
5. 当两个地址的描述虽不完全一致，但显示出相同的空间关系和方向，且位于同一城市、省份和国家时，应仔细分析其可能指向同一位置的可能性。如存在标志性建筑或地点的描述相同，可作为判断为同一位置的依据之一，但前提是不与最高优先级判断冲突。
6. 若其中一个地址缺少城市、国家部分，但门牌号、街道一致，在不与最高优先级判断冲突的情况下，可认为是同一个地点；若缺少除城市、国家外其他更多关键部分结构，依据国家/地区、省/州、城市/县进行判断，若存在包含关系，也可认为是同一地点，但前提同样是不与最高优先级判断冲突。
7. 若根据现有信息无法准确判断两个地址是否在同一门店或同一建筑物，判断结果为 no，并在判断依据中详细说明原因，但前提是不与最高优先级判断冲突。
===回复示例===
 - judgment_result：[yes/no]
- judgment_basis：<详细说明判断依据，需突出最高优先级判断的应用情况>
===示例结束===

## 限制:
- 仅处理海外租车门店地址的识别问题，拒绝回答与地址无关无关的话题。
- 输出内容必须严格按照给定格式进行组织，优先输出“judgment_result”的结果结果（yes/no），不得偏离框架要求。 


**示例：**

address1：Liberia International Airport

address2：In front of Liberia Airport, Liberia, Costa Rica

地址 1 转换为英文后的结构化信息：  
addressFormat：{

+ Country/Region: Costa Rica
+ Province/State/Autonomous_Region: Guanacaste (default primary province for Liberia International Airport)
+ City/County: Liberia
+ Street_Address: Liberia International Airport
+ PostalCode: null
+ House/Apartment_Number: null
+ Store/Branch_Name: null
+ Mile_Marker: null  
  }

地址 2 转换为英文后的结构化信息：  
addressFormat：{

+ Country/Region: Costa Rica
+ Province/State/Autonomous_Region: null
+ City/County: Liberia
+ Street_Address: In front of Liberia Airport
+ PostalCode: null
+ House/Apartment_Number: null
+ Store/Branch_Name: null
+ Mile_Marker: null  
  }
+ judgment_result：yes
+ judgment_basis：两个地址均明确指向“Liberia International Airport”或其正前方，且城市均为Liberia。虽然没有具体门牌号及更多详细结构，但依据机场类门店的地标特性，两地址均指同一机场主入口或周边区域，在缺乏门牌号且机场只有一个主入口的情况下，可判断为同一门店或同一建筑物。
```
:::

<h3 id="Wfwf0">3.5 层次聚类</h3>

[https://zh.wikipedia.org/wiki/%E5%B1%82%E6%AC%A1%E8%81%9A%E7%B1%BB](https://zh.wikipedia.org/wiki/%E5%B1%82%E6%AC%A1%E8%81%9A%E7%B1%BB)

[Plot Hierarchical Clustering Dendrogram](https://scikit-learn.org/stable/auto_examples/cluster/plot_agglomerative_dendrogram.html#sphx-glr-auto-examples-cluster-plot-agglomerative-dendrogram-py)

为什么是全链接不是单链接？

+ 单链接（Single Link）：以两簇中最近样本距离为簇间距离。
+ 全链接（Complete Link）：以两簇中最远样本距离为簇间距离。




<h2 id="XCAU9">5.数据验证</h2>

+ 若业务更关注完整地址格式匹配 → 提高余弦相似度权重
+ 若允许缩写但要求关键词匹配 → 提高Jaccard权重

计算两个地址的综合相似度得分（Jaccard 60% + 余弦相似度 40%）

分类阈值：

| 场景特点                     | 推荐阈值 | 说明                               |
| ---------------------------- | -------- | ---------------------------------- |
| 高精度需求（如地址去重）     | 0.7-0.8  | 确保合并的地址高度相似，减少错误。 |
| 平衡精度与召回（常规聚类）   | 0.5-0.65 | 兼顾准确性和覆盖率。               |
| 高召回需求（如初步数据清洗） | 0.4-0.5  | 容忍部分误合并，优先捕获潜在匹配。 |

