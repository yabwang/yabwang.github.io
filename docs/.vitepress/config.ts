import { defineConfig } from 'vitepress';
import { generateSidebar } from 'vitepress-sidebar';

// 自动生成侧边栏配置 - 只展示30天刷题计划
const sidebar = generateSidebar([
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
      { text: '🚀 30天刷题计划', link: '/30-day-algorithm/' },
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
