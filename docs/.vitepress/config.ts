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

// 手动配置 interview 侧边栏，实现分组结构
const interviewSidebar = {
  '/interview/': [
    {
      text: 'Java程序员面试学习大纲',
      link: '/interview/java-interview-outline',
    },
    {
      text: '☕ Java 面试学习',
      link: '/interview/',
    },
    {
      text: 'Java基础',
      collapsed: false,
      items: [
        {
          text: '语言特性',
          link: '/interview/java-basics-language-features',
        },
        {
          text: '集合框架',
          link: '/interview/java-basics-collections',
        },
        {
          text: 'IO/NIO',
          link: '/interview/java-basics-io-nio',
        },
      ],
    },
    {
      text: '并发编程',
      collapsed: false,
      items: [
        {
          text: '线程基础',
          link: '/interview/concurrency-thread-basics',
        },
        {
          text: 'JUC包',
          link: '/interview/concurrency-juc',
        },
        {
          text: '并发设计模式',
          link: '/interview/concurrency-design-patterns',
        },
      ],
    },
    {
      text: 'JVM',
      collapsed: false,
      items: [
        {
          text: '内存模型、GC与类加载',
          link: '/interview/jvm-basics',
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
            { text: 'Skills / Agent Skills', link: '/ai/agent-skills' },
            { text: 'MCP（Model Context Protocol）', link: '/ai/mcp' },
            { text: 'Agent 开发', link: '/ai/agent-development' },
            { text: '活文件理论 (Living Files)', link: '/ai/living-files-theory' },
            { text: 'OpenClaw 记忆系统架构', link: '/ai/openclaw-memory-architecture' },
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

const othersSidebar = generateSidebar([
  {
    documentRootPath: '/docs',
    scanStartPath: 'others',
    resolvePath: '/others/',
    useTitleFromFileHeading: true,
    useFolderTitleFromIndexFile: true,
    sortMenusByFrontmatterOrder: true,
    frontmatterOrderDefaultValue: 999,
    collapsed: false,
  },
]);

// 合并侧边栏配置，VitePress 会根据当前路径自动匹配
const sidebar = {
  ...algorithmSidebar,
  ...interviewSidebar,
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

ensurePathMatch(sidebar, interviewSidebar);
ensurePathMatch(sidebar, aiSidebar);
ensurePathMatch(sidebar, othersSidebar);

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
    // 密码保护脚本（在深色模式脚本之前加载）
    ['script', { src: '/password-protect.js' }],
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
      { text: '🚀 30天刷题计划', link: '/30-day-algorithm/' },
      { text: '☕ Java 面试', link: '/interview/' },
      { text: '🤖 AI 探索', link: '/ai/' },
      { text: '📝 其他文章', link: '/others/' },
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
