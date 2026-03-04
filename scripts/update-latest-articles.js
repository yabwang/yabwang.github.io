import { readdir, readFile, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const docsPath = join(__dirname, '../docs');
const indexPath = join(docsPath, 'index.md');

// 分类配置
const categories = [
  {
    name: '30天算法挑战',
    path: '30-day-algorithm',
    badge: 'NEW',
    icon: '🚀',
    exclude: ['index.md']
  },
  {
    name: 'Java面试',
    path: 'java-learning',
    badge: 'HOT',
    icon: '☕',
    exclude: ['index.md', 'java-interview-outline.md']
  },
  {
    name: '其他技术文章',
    path: 'others',
    badge: '📚',
    icon: '📝',
    exclude: ['index.md']
  }
];

/**
 * 获取文件Git提交时间（时间戳）
 */
async function getFileCommitTime(filePath) {
  try {
    // 使用git log获取文件的最后提交时间戳
    const { stdout } = await execAsync(`git log -1 --format="%ct" -- "${filePath}"`);
    const timestamp = parseInt(stdout.trim());
    return isNaN(timestamp) ? 0 : timestamp * 1000; // 转换为毫秒
  } catch (error) {
    // 如果文件不在git中或git命令失败，返回0
    return 0;
  }
}

/**
 * 从markdown文件提取标题和描述
 */
function extractTitleAndDescription(content) {
  // 提取frontmatter中的title
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  let title = null;
  if (frontmatterMatch) {
    const titleMatch = frontmatterMatch[1].match(/^title:\s*(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
    }
  }

  // 提取第一个一级或二级标题
  if (!title) {
    const h1Match = content.match(/^#\s+(.+)$/m);
    const h2Match = content.match(/^##\s+(.+)$/m);
    if (h1Match) {
      title = h1Match[1].trim();
    } else if (h2Match) {
      title = h2Match[1].trim();
    }
  }

  // 提取描述：优先从frontmatter，否则从第一段内容
  let description = '';
  if (frontmatterMatch) {
    const descMatch = frontmatterMatch[1].match(/^description:\s*(.+)$/m);
    if (descMatch) {
      description = descMatch[1].trim().replace(/^["']|["']$/g, '');
    }
  }

  if (!description) {
    // 移除frontmatter和标题，获取第一段内容
    let contentWithoutFrontmatter = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
    // 移除目录部分（包含"目录"或"## 目录"的行及其后的列表）
    contentWithoutFrontmatter = contentWithoutFrontmatter.replace(/^##?\s*目录[\s\S]*?(?=\n##|\n---|$)/m, '');
    // 移除所有标题
    contentWithoutFrontmatter = contentWithoutFrontmatter.replace(/^#+\s+.+$/gm, '');
    
    // 提取第一段非空内容（去除markdown语法和HTML标签）
    const paragraphs = contentWithoutFrontmatter.split(/\n\n+/);
    const firstParagraph = paragraphs.find(p => {
      const cleaned = p
        .replace(/<[^>]+>/g, '') // 移除HTML标签
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 移除markdown链接，保留文本
        .replace(/[#*_`\[\]()!>]/g, '') // 移除markdown语法
        .replace(/^[-*+]\s+/, '') // 移除列表标记
        .replace(/^\d+\.\s+/, '') // 移除有序列表标记
        .replace(/^>\s*/, '') // 移除引用标记
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ') // 合并多个空格
        .trim();
      return cleaned.length > 20 && !cleaned.match(/^(目录|概述|简介|介绍)/);
    });
    
    if (firstParagraph) {
      description = firstParagraph
        .replace(/<[^>]+>/g, '') // 移除HTML标签
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 移除markdown链接，保留文本
        .replace(/[#*_`\[\]()!>]/g, '') // 移除markdown语法
        .replace(/^[-*+]\s+/, '') // 移除列表标记
        .replace(/^\d+\.\s+/, '') // 移除有序列表标记
        .replace(/^>\s*/, '') // 移除引用标记
        .replace(/id="[^"]*"/g, '') // 移除HTML id属性
        .replace(/<h[1-6][^>]*>/gi, '') // 移除标题标签
        .replace(/<\/h[1-6]>/gi, '') // 移除结束标题标签
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ') // 合并多个空格
        .trim();
      
      // 如果描述太短或包含HTML标签残留，尝试下一段
      if (description.length < 20 || description.includes('<') || description.includes('>')) {
        const nextParagraph = paragraphs.find((p, idx) => {
          if (idx <= paragraphs.indexOf(firstParagraph)) return false;
          const cleaned = p
            .replace(/<[^>]+>/g, '')
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
            .replace(/[#*_`\[\]()!>]/g, '')
            .replace(/^[-*+]\s+/, '')
            .replace(/^\d+\.\s+/, '')
            .replace(/^>\s*/, '')
            .replace(/id="[^"]*"/g, '')
            .replace(/<h[1-6][^>]*>/gi, '')
            .replace(/<\/h[1-6]>/gi, '')
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          return cleaned.length > 20 && !cleaned.match(/^(目录|概述|简介|介绍)/);
        });
        
        if (nextParagraph) {
          description = nextParagraph
            .replace(/<[^>]+>/g, '')
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
            .replace(/[#*_`\[\]()!>]/g, '')
            .replace(/^[-*+]\s+/, '')
            .replace(/^\d+\.\s+/, '')
            .replace(/^>\s*/, '')
            .replace(/id="[^"]*"/g, '')
            .replace(/<h[1-6][^>]*>/gi, '')
            .replace(/<\/h[1-6]>/gi, '')
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
      }
      
      // 截取到合适长度
      description = description.substring(0, 100);
      if (description.length === 100) {
        description += '...';
      }
    }
  }

  // 如果没有找到描述，使用默认描述
  if (!description) {
    description = `最新${title || '文章'}内容，持续更新中`;
  }

  return { title: title || '未命名文章', description };
}

/**
 * 获取分类下的最新文章
 */
async function getLatestArticle(category) {
  const categoryPath = join(docsPath, category.path);
  
  try {
    const files = await readdir(categoryPath);
    const mdFiles = files.filter(file => 
      file.endsWith('.md') && !category.exclude.includes(file)
    );

    if (mdFiles.length === 0) {
      return null;
    }

    // 获取所有文件的Git提交时间和文件系统时间
    const filesWithTime = await Promise.all(
      mdFiles.map(async (file) => {
        const filePath = join(categoryPath, file);
        const commitTime = await getFileCommitTime(filePath);
        // 当提交时间相同时，使用文件系统时间作为次要排序
        let fileSystemTime = 0;
        try {
          const stats = await stat(filePath);
          fileSystemTime = stats.mtime.getTime();
        } catch (error) {
          // 忽略错误
        }
        return { file, commitTime, fileSystemTime, path: filePath };
      })
    );

    // 按Git提交时间排序，如果提交时间相同则按文件系统时间排序
    filesWithTime.sort((a, b) => {
      if (b.commitTime !== a.commitTime) {
        return b.commitTime - a.commitTime;
      }
      return b.fileSystemTime - a.fileSystemTime;
    });
    const latestFile = filesWithTime[0];

    // 读取文件内容提取标题和描述
    const content = await readFile(latestFile.path, 'utf-8');
    const { title, description } = extractTitleAndDescription(content);

    // 生成链接路径（去掉.md扩展名）
    const linkPath = `/${category.path}/${latestFile.file.replace('.md', '')}`;

    return {
      link: linkPath,
      title,
      description,
      badge: category.badge,
      icon: category.icon
    };
  } catch (error) {
    console.error(`获取分类 ${category.name} 的最新文章失败:`, error);
    return null;
  }
}

/**
 * 更新首页卡片
 */
async function updateHomepageCards() {
  try {
    // 读取当前index.md
    const indexContent = await readFile(indexPath, 'utf-8');

    // 获取所有分类的最新文章
    const latestArticles = await Promise.all(
      categories.map(category => getLatestArticle(category))
    );

    // 更新每个卡片 - 使用更精确的匹配
    let updatedContent = indexContent;

    latestArticles.forEach((article, index) => {
      if (!article) return;

      // 匹配每个完整的卡片（从<a>到</a>）
      const cardPattern = new RegExp(
        `(<a href="[^"]*" class="post-card tech-card">[\\s\\S]*?<div class="card-content">[\\s\\S]*?<div class="card-header">[\\s\\S]*?<span class="card-badge">)[^<]*(</span>[\\s\\S]*?<span class="card-icon">)[^<]*(</span>[\\s\\S]*?</div>[\\s\\S]*?<h3>)[^<]*(</h3>[\\s\\S]*?<p>)[^<]*(</p>[\\s\\S]*?</a>)`,
        'g'
      );

      // 找到所有卡片
      const matches = [...updatedContent.matchAll(cardPattern)];
      if (matches[index]) {
        const match = matches[index];
        const matchStart = match.index;
        const matchEnd = matchStart + match[0].length;
        
        // 构建新的卡片内容
        const newCard = match[0]
          .replace(/href="[^"]*"/, `href="${article.link}"`)
          .replace(/(<span class="card-badge">)[^<]*(<\/span>)/, `$1${article.badge}$2`)
          .replace(/(<span class="card-icon">)[^<]*(<\/span>)/, `$1${article.icon}$2`)
          .replace(/(<h3>)[^<]*(<\/h3>)/, `$1${article.title}$2`)
          .replace(/(<p>)[^<]*(<\/p>)/, `$1${article.description}$2`);

        updatedContent = updatedContent.substring(0, matchStart) + newCard + updatedContent.substring(matchEnd);
      }
    });

    // 写入更新后的内容
    await writeFile(indexPath, updatedContent, 'utf-8');
    console.log('✅ 首页卡片已自动更新:');
    latestArticles.forEach((article, index) => {
      if (article) {
        console.log(`   ${index + 1}. ${article.title} -> ${article.link}`);
      }
    });
  } catch (error) {
    console.error('❌ 更新首页卡片失败:', error);
    process.exit(1);
  }
}

// 执行更新
updateHomepageCards();
