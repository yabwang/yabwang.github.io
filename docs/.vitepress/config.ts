import { defineConfig } from 'vitepress';
import { generateSidebar } from 'vitepress-sidebar';

// 自动生成侧边栏配置
const algorithmSidebar = generateSidebar([
  {
    documentRootPath: '/docs',
    scanStartPath: '30-day-algorithm',
    resolvePath: '/30-day-algorithm/',
    useTitleFromFileHeading: true,
    useFolderTitleFromIndexFile: true,
    sortMenusByFrontmatterOrder: true,
    frontmatterOrderDefaultValue: 999,
    collapsed: false,
  },
]);

// Java 学习侧边栏配置
const javaLearningSidebar = {
  '/java-learning/': [
    {
      text: '☕ Java 学习大纲',
      link: '/java-learning/',
    },
    {
      text: 'Java基础',
      collapsed: false,
      items: [
        {
          text: '语言特性',
          link: '/java-learning/java-basics-language-features',
        },
        {
          text: '集合框架',
          link: '/java-learning/java-basics-collections',
        },
        {
          text: 'IO/NIO',
          link: '/java-learning/java-basics-io-nio',
        },
      ],
    },
    {
      text: '并发编程',
      collapsed: false,
      items: [
        {
          text: '线程基础',
          link: '/java-learning/concurrency-thread-basics',
        },
        {
          text: 'JUC包',
          link: '/java-learning/concurrency-juc',
        },
        {
          text: '并发设计模式',
          link: '/java-learning/concurrency-design-patterns',
        },
      ],
    },
    {
      text: 'JVM',
      collapsed: false,
      items: [
        {
          text: '内存模型、GC与类加载',
          link: '/java-learning/jvm-basics',
        },
      ],
    },
    {
      text: '框架技术',
      collapsed: false,
      items: [
        {
          text: 'Spring 框架',
          link: '/java-learning/spring-framework',
        },
        {
          text: 'MyBatis',
          link: '/java-learning/mybatis',
        },
        {
          text: '其他框架',
          link: '/java-learning/other-frameworks',
        },
      ],
    },
    {
      text: '数据库',
      collapsed: false,
      items: [
        {
          text: 'MySQL 核心原理',
          link: '/java-learning/database-mysql',
        },
        {
          text: 'Redis 核心原理',
          link: '/java-learning/database-redis',
        },
      ],
    },
    {
      text: '分布式系统',
      collapsed: false,
      items: [
        {
          text: '理论基础（CAP/BASE）',
          link: '/java-learning/distributed-system-theory',
        },
        {
          text: '分布式组件',
          link: '/java-learning/distributed-components',
        },
        {
          text: '分布式锁',
          link: '/java-learning/distributed-lock',
        },
      ],
    },
  ],
};

const aiSidebar = {
  '/ai/': [
    {
      text: '大语言模型 (LLM) 探索',
      link: '/ai/',
    },
    {
      text: 'AI 最新进展',
      link: '/ai/latest-developments',
    },
    {
      text: '基础理论',
      collapsed: false,
      items: [
        {
          text: 'Transformer 架构',
          collapsed: false,
          items: [
            { text: '注意力机制 (Attention Mechanism)', link: '/ai/attention-mechanism' },
            { text: '位置编码 (Positional Encoding)', link: '/ai/positional-encoding' },
            { text: '编码器-解码器结构', link: '/ai/encoder-decoder-architecture' },
            { text: '自注意力与交叉', link: '/ai/self-attention-and-cross-attention' },
          ],
        },
      ],
    },
    {
      text: '实践应用',
      collapsed: false,
      items: [
        {
          text: '应用开发',
          collapsed: false,
          items: [
            { text: 'Prompt 工程', link: '/ai/prompt-engineering' },
            { text: '上下文工程 (Context Engineering)', link: '/ai/context-engineering' },
            { text: 'RAG（检索增强生成）', link: '/ai/rag' },
            { text: '向量嵌入 (Vector Embedding)', link: '/ai/vector-embedding' },
            { text: '文本相似度计算', link: '/ai/similarity-metrics' },
            { text: 'Skills / Agent Skills', link: '/ai/agent-skills' },
            { text: 'MCP（Model Context Protocol）', link: '/ai/mcp' },
            { text: 'Agent 开发', link: '/ai/agent-development' },
          ],
        },
        {
          text: 'AI 哲学与思考',
          collapsed: false,
          items: [
            { text: '活文件理论 (Living Files)', link: '/ai/philosophy/living-files-theory' },
            { text: 'OpenClaw 记忆系统架构', link: '/ai/philosophy/openclaw-memory-architecture' },
          ],
        },
      ],
    },
    {
      text: '前沿技术',
      collapsed: false,
      items: [
        {
          text: '模型能力',
          collapsed: false,
          items: [
            { text: '上下文理解与长文本处理', link: '/ai/context-understanding-long-context' },
            { text: '思维链推理 (Chain-of-Thought)', link: '/ai/chain-of-thought-reasoning' },
            { text: '工具使用 (Tool Use)', link: '/ai/tool-use' },
            { text: '多模态能力', link: '/ai/multimodal-capability' },
          ],
        },
        {
          text: '优化技术',
          collapsed: false,
          items: [
            { text: '知识蒸馏', link: '/ai/knowledge-distillation' },
          ],
        },
      ],
    },
    {
      text: '工具与框架',
      collapsed: false,
      items: [
        {
          text: '开发工具',
          collapsed: false,
          items: [
            { text: 'Claude Code 使用技巧', link: '/ai/claude-code-tips' },
            { text: 'Ghostty 终端使用技巧', link: '/ai/ghostty-tips' },
          ],
        },
        {
          text: '部署工具',
          collapsed: false,
          items: [
            { text: 'Ollama', link: '/ai/ollama' },
          ],
        },
      ],
    },
  ],
};

// 随笔杂记侧边栏配置 - 按分类组织
const othersSidebar = {
  '/others/': [
    {
      text: '📚 随笔杂记首页',
      link: '/others/',
    },
    {
      text: '🧮 算法专题',
      collapsed: false,
      items: [
        { text: '排序算法汇总', link: '/others/algorithm/sort' },
        { text: '快速排序 Java 实现', link: '/others/algorithm/quick-sort-java' },
        { text: '二进制加法', link: '/others/algorithm/binary_addition' },
        { text: '动态规划', link: '/others/algorithm/dp' },
        { text: '并查集', link: '/others/algorithm/unionFind' },
        { text: '剑指 Offer', link: '/others/algorithm/sword-offer' },
      ],
    },
    {
      text: '🗄️ 数据库专题',
      collapsed: false,
      items: [
        { text: 'MySQL 基础', link: '/others/database/mysql' },
        { text: '慢 SQL 治理总结', link: '/others/database/slow-sql-governance' },
      ],
    },
    {
      text: '📦 编码与数据格式',
      collapsed: false,
      items: [
        { text: 'Base64 编码详解', link: '/others/encoding/base64-explanation' },
      ],
    },
    {
      text: '💼 面试专题',
      collapsed: false,
      items: [
        { text: '阿里飞猪面试模拟题', link: '/others/interview/ali-feiji-interview-questions' },
        { text: 'Java 后端面试实战题', link: '/others/interview/java-backend-interview-practice' },
        { text: 'Java 高频面试题 100 题', link: '/others/interview/java-interview-100-questions' },
      ],
    },
  ],
};

// 合并侧边栏配置，VitePress 会根据当前路径自动匹配
const sidebar = {
  ...algorithmSidebar,
  ...javaLearningSidebar,
  ...aiSidebar,
  ...othersSidebar,
};

// 确保模块路径正确匹配（处理可能的路径格式差异）
function ensurePathMatch(sidebarConfig, targetSidebar) {
  if (targetSidebar && Object.keys(targetSidebar).length > 0) {
    const keys = Object.keys(targetSidebar);
    keys.forEach(key => {
      targetSidebar[key] = targetSidebar[key];
      // 同时添加不带尾部斜杠的版本
      if (key.endsWith('/')) {
        sidebar[key.slice(0, -1)] = targetSidebar[key];
      } else {
        sidebar[key + '/'] = targetSidebar[key];
      }
    });
  }
}

ensurePathMatch(sidebar, javaLearningSidebar);
ensurePathMatch(sidebar, aiSidebar);

export default defineConfig({
  lang: 'zh-CN',
  title: 'Yabin\'s Tech Journey',
  description: '算法、java、AI',
  
  // 禁用主题切换，强制使用深色模式
  appearance: false,
  
  head: [
    ['meta', { name: 'keywords', content: '技术博客,算法,系统设计,数据库,LeetCode' }],
    ['meta', { name: 'author', content: 'Wang Yabin' }],
    ['meta', { property: 'og:title', content: 'Yabin\'s Tech Journey' }],
    ['meta', { property: 'og:description', content: '技术探索者的博客 - 分享算法、系统设计与工程实践' }],
    // 密码保护脚本已暂时禁用
    // ['script', { src: '/password-protect.js' }],
    // 沉浸式阅读模式
    ['script', { src: '/reading-mode.js', defer: '' }],
    // 强制深色模式脚本
    ['script', {}, `
      (function() {
        document.documentElement.classList.add('dark');
        localStorage.setItem('vitepress-theme-appearance', 'dark');
      })();
    `],
  ],

  themeConfig: {
    siteTitle: 'Yabin\'s Tech Journey',
    
    nav: [
      { text: '🚀 30天算法学习', link: '/30-day-algorithm/' },
      { text: '☕ Java 学习笔记', link: '/java-learning/' },
      { text: '🤖 AI 学习', link: '/ai/' },
      { text: '📝 随笔与杂记', link: '/others/' },
    ],

    // 使用自动生成的侧边栏
    sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yabwang' }
    ],

    search: {
      provider: 'local',
    },

    lastUpdated: {
      text: '最后更新',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present Wang',
    },

    outline: {
      level: [2, 3],
      label: '目录',
    },
  },
});
