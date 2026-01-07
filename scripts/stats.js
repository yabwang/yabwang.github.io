import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const docsPath = join(__dirname, '../docs');

/**
 * 递归获取目录下所有文件
 */
async function getAllFiles(dir, fileList = []) {
  const files = await readdir(dir);
  for (const file of files) {
    const filePath = join(dir, file);
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      // 跳过 node_modules、.vitepress、public 等目录
      if (!['node_modules', '.vitepress', 'public', 'test'].includes(file)) {
        await getAllFiles(filePath, fileList);
      }
    } else if (extname(file) === '.md') {
      fileList.push(filePath);
    }
  }
  return fileList;
}

/**
 * 统计算法题解数量（30-day-algorithm 目录下的 day*.md 文件）
 */
async function countAlgorithmSolutions() {
  const algorithmDir = join(docsPath, '30-day-algorithm');
  try {
    const files = await readdir(algorithmDir);
    const dayFiles = files.filter(file => 
      file.startsWith('day') && file.endsWith('.md')
    );
    return dayFiles.length;
  } catch (error) {
    console.error('统计算法题解失败:', error);
    return 0;
  }
}

/**
 * 统计刷题天数（与算法题解数量相同，或者根据文件日期）
 */
async function countDays() {
  // 刷题天数就是算法题解的数量
  return await countAlgorithmSolutions();
}

/**
 * 统计技术文章数量（所有 .md 文件，排除 index.md 和 about.md）
 */
async function countArticles() {
  try {
    const allFiles = await getAllFiles(docsPath);
    // 排除 index.md、about.md，以及 30-day-algorithm 目录下的文件（因为已经单独统计了）
    const articles = allFiles.filter(file => {
      const fileName = file.split(/[/\\]/).pop();
      const relativePath = file.replace(docsPath + '/', '');
      
      // 排除首页和关于页
      if (fileName === 'index.md' || fileName === 'about.md') {
        return false;
      }
      
      // 排除 30-day-algorithm 目录下的文件（已单独统计）
      if (relativePath.startsWith('30-day-algorithm/')) {
        return false;
      }
      
      return true;
    });
    
    return articles.length;
  } catch (error) {
    console.error('统计技术文章失败:', error);
    return 0;
  }
}

/**
 * 生成统计数据
 */
async function generateStats() {
  const [algorithmCount, daysCount, articlesCount] = await Promise.all([
    countAlgorithmSolutions(),
    countDays(),
    countArticles()
  ]);
  
  return {
    algorithmSolutions: algorithmCount,
    days: daysCount,
    articles: articlesCount
  };
}

// 如果直接运行此脚本，输出统计数据
if (import.meta.url === `file://${process.argv[1]}`) {
  generateStats().then(stats => {
    console.log(JSON.stringify(stats, null, 2));
  });
}

export { generateStats };

