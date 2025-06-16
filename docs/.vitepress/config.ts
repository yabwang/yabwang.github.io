import { defineConfig } from 'vitepress';

// refer https://vitepress.dev/reference/site-config for details
export default defineConfig({
  lang: 'en-US',
  title: 'Wang"s Blog',
  description: 'Vite & Vue powered static site generator.',
  base: '/',


  themeConfig: {


      nav: [
        {
          text: 'LeetCode刷题',
          items: [
            { text: 'LeetCode 100题', link: '/algorithms/leetCode100' },
          ],
        },
        {
          text: '基础知识',
          items: [
            { text: '数据库', link: '/basic/mysql' },
          ],
        }
        // ,{
        //   text: 'java 基础',
        //   items: [
        //     { text: 'java 基础', link: '/java/' },
        //   ],
        // }

      ],

      //侧边栏
      sidebar: {
        '/algorithms/': [
          {
            text: 'LeetCode专题',
            collapsed: true,
            items: [
              { text: 'LeetCode 100题', link: '/algorithms/leetCode100' },
              // { text: '动态规划', link: '/algorithms/dp' },
              { text: '并查集', link: '/algorithms/unionFind' }
              // ... existing code ...
            ]
          },
          {
            text: '其他算法',
            collapsed: true,
            items: [
              { text: '排序算法', link: '/algorithms/sort' },
              { text: '余弦相似度', link: '/algorithms/cosine' }
            ]
          }
        ],
        '/basic/': [
          {
            text: '数据库',
            collapsed: true,
            items: [
              { text: '事务实现机制', link: '/basic/mysql' }
            ]
         }
        ]
      },


      //update time
      lastUpdated: {
        text: 'Updated at',
        formatOptions: {
          dateStyle: 'full',
          timeStyle: 'medium'
        }
      },

      //页脚
      footer: {
        message: 'Released under the MIT License.',
        copyright: 'Copyright © 2025-present Wang'
      }

  },

  


});

