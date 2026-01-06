import { defineConfig } from 'vitepress';

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

    sidebar: {
      '/algorithms/': [
        {
          text: '算法题解',
          items: [
            { text: 'LeetCode 100题', link: '/algorithms/leetCode100' },
            { text: '动态规划', link: '/algorithms/dp' },
            { text: '并查集', link: '/algorithms/unionFind' },
            { text: '排序算法', link: '/algorithms/sort' },
            { text: '快速排序', link: '/algorithms/quick-sort-java' },
            { text: '数组', link: '/algorithms/array' },
            { text: '余弦相似度', link: '/algorithms/cosine' },
            { text: '剑指Offer', link: '/algorithms/sword-offer' },
          ]
        }
      ],
      '/basic/': [
        {
          text: '基础知识',
          items: [
            { text: 'MySQL事务机制', link: '/basic/mysql' },
            { text: 'Base64编码', link: '/basic/base64-explanation' },
          ]
        }
      ],
      '/system-design/': [
        {
          text: '系统设计',
          items: [
            { text: '系统设计基础', link: '/system-design/index' },
          ]
        }
      ],
    },

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
