import { defineConfig } from 'vitepress';
import { generateSidebar } from 'vitepress-sidebar';

// 自动生成侧边栏配置
const sidebar = generateSidebar([
  {
    documentRootPath: '/docs',
    scanStartPath: 'algorithms',
    resolvePath: '/algorithms/',
    useTitleFromFileHeading: true,      // 使用文件第一个标题作为菜单名
    useFolderTitleFromIndexFile: true,  // 使用 index 文件的标题作为文件夹标题
    sortMenusByFrontmatterOrder: true,  // 支持 frontmatter 排序
    frontmatterOrderDefaultValue: 999,  // 没有设置 order 的文件默认排在后面
    collapsed: false,
  },
  {
    documentRootPath: '/docs',
    scanStartPath: 'basic',
    resolvePath: '/basic/',
    useTitleFromFileHeading: true,
    useFolderTitleFromIndexFile: true,
    sortMenusByFrontmatterOrder: true,
    frontmatterOrderDefaultValue: 999,  // 没有设置 order 的文件默认排在后面
    collapsed: false,
  },
  {
    documentRootPath: '/docs',
    scanStartPath: 'system-design',
    resolvePath: '/system-design/',
    useTitleFromFileHeading: true,
    useFolderTitleFromIndexFile: true,
    sortMenusByFrontmatterOrder: true,
    frontmatterOrderDefaultValue: 999,  // 没有设置 order 的文件默认排在后面
    collapsed: false,
  },
]);

export default defineConfig({
  lang: 'zh-CN',
  title: 'Wang\'s Blog',
  description: '技术探索者的博客 - 分享算法、系统设计与工程实践',
  
  head: [
    ['meta', { name: 'keywords', content: '技术博客,算法,系统设计,数据库,LeetCode' }],
    ['meta', { name: 'author', content: 'Wang' }],
    ['meta', { property: 'og:title', content: 'Wang\'s Blog' }],
    ['meta', { property: 'og:description', content: '技术探索者的博客 - 分享算法、系统设计与工程实践' }],
  ],

  themeConfig: {
    siteTitle: 'Wang\'s Blog',
    
    nav: [
      {
        text: 'LeetCode刷题',
        items: [
          { text: 'LeetCode 100题', link: '/algorithms/leetCode100' },
          { text: '动态规划', link: '/algorithms/dp' },
          { text: '并查集', link: '/algorithms/unionFind' },
        ],
      },
      {
        text: '基础知识',
        items: [
          { text: '数据库', link: '/basic/mysql' },
          { text: '系统设计', link: '/system-design/index' },
        ],
      },
      { text: '关于', link: '/about' },
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
