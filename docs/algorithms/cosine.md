[[toc]]

# 余弦相似度-3gram

## 余弦相似度
余弦相似度是一种用于衡量两个向量之间相似度的方法。它通过计算两个向量的夹角来判断它们的相似程度。
余弦相似度的计算公式如下：
$$
\cos(\theta) = \frac{\vec{A} \cdot \vec{B}}{||\vec{A}|| \times ||\vec{B}||}
$$
其中，$\vec{A}$ 和 $\vec{B}$ 分别表示两个向量，$\theta$ 表示它们之间的夹角。
余弦相似度的取值范围是 [-1, 1]，当两个向量完全相同时，余弦相似度为 1；当两个向量完全相反时，余弦相似度为 -1；当两个向量正交时，余弦相似度为 0。
余弦相似度的优点是不受向量长度的影响，适用于计算文本相似度等场景。
## 3-gram
3-gram 是一种将文本分割成连续的三个字符的方法。它可以用于计算文本的相似度。
3-gram 的计算公式如下：
$$
\cos(\theta) = \frac{\vec{A} \cdot \vec{B}}{||\vec{A}|| \times ||\vec{B}||}
$$

3-gram 的优点是可以捕捉到文本中的局部特征，适用于计算文本相似度等场景。

### 应用
余弦相似度和 3-gram 可以用于计算文本相似度。
例如，假设有两个文本 A 和 B，我们可以将它们分割成连续的三个字符，然后计算它们的余弦相似度。
具体步骤如下：
1. 将文本 A 和 B 分割成连续的三个字符。
2. 计算文本 A 和 B 的余弦相似度。
3. 如果余弦相似度大于一个阈值，那么我们可以认为文本 A 和 B 是相似的。
4. 如果余弦相似度小于一个阈值，那么我们可以认为文本 A 和 B 是不相似的。