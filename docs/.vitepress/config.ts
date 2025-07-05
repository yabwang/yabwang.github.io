import { defineConfig } from 'vitepress';

// refer https://vitepress.dev/reference/site-config for details
export default defineConfig({
  lang: 'zh-CN',
  title: 'Wang\'s Blog',
  description: '技术探索者的博客 - 分享算法、系统设计与工程实践',
  base: '/',
  
  // 添加头部配置
  head: [
    ['meta', { name: 'keywords', content: '技术博客,算法,系统设计,数据库,LeetCode' }],
    ['meta', { name: 'author', content: 'Wang' }],
    ['meta', { property: 'og:title', content: 'Wang\'s Blog' }],
    ['meta', { property: 'og:description', content: '技术探索者的博客 - 分享算法、系统设计与工程实践' }],
  ],

  themeConfig: {
    // 网站标题和Logo
    siteTitle: 'Wang\'s Blog',
    
    // 导航栏
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
      {
        text: '关于',
        link: '/about'
      }
    ],

    // 侧边栏
    sidebar: {
      '/algorithms/': [
        {
          text: 'LeetCode专题',
          collapsed: false,
          items: [
            { text: 'LeetCode 100题', link: '/algorithms/leetCode100' },
            { text: '动态规划', link: '/algorithms/dp' },
            { text: '并查集', link: '/algorithms/unionFind' }
          ]
        },
        {
          text: '其他算法',
          collapsed: false,
          items: [
            { text: '排序算法', link: '/algorithms/sort' },
            { text: '快速排序', link: '/algorithms/quick-sort-java' },
            { text: '余弦相似度', link: '/algorithms/cosine' },
            { text: '剑指Offer', link: '/algorithms/sword-offer' }
          ]
        }
      ],
      '/basic/': [
        {
          text: '基础知识',
          collapsed: false,
          items: [
            { text: 'MySQL事务机制', link: '/basic/mysql' },
            { text: 'Base64编码', link: '/basic/base64-explanation' }
          ]
        }
      ],
      '/system-design/': [
        {
          text: '系统设计',
          collapsed: false,
          items: [
            { text: '系统设计基础', link: '/system-design/index' }
          ]
        }
      ]
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yabwang' }
    ],

    // 搜索配置
    search: {
      provider: 'local'
    },

    // 更新时间
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },

    // 页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present Wang'
    },

    // 大纲配置
    outline: {
      level: [2, 3],
      label: '目录'
    },

    // 返回顶部
    returnToTopLabel: '返回顶部',

    // 侧边栏切换
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  }
});
