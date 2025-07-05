---
layout: home

hero:
  name: 技术探索者
  text: 技术博客导航
  tagline: 系统性整理计算机领域核心知识，分享算法、系统设计与工程实践
  actions:
    - theme: brand
      text: 开始探索
      link: /algorithms/leetCode100
    - theme: alt
      text: 查看源码
      link: https://github.com/your-username/wang-blogs

features:
  - icon: 🧮
    title: 算法与数据结构
    details: LeetCode高频题解 | 经典算法实现 | 动态规划 | 并查集 | 排序算法
    link: /algorithms/leetCode100
  - icon: 🗄️
    title: 数据库原理
    details: MySQL核心机制 | InnoDB存储引擎 | 事务实现机制 | 索引优化
    link: /basic/mysql
  - icon: 🏗️
    title: 系统设计
    details: 高并发架构 | 分布式系统 | 云原生 | 微服务设计
    link: /system-design/index
  - icon: 📚
    title: 学习笔记
    details: 系统性知识整理 | 实战经验分享 | 技术深度解析
    link: /basic/
  - icon: ⚡
    title: 性能优化
    details: 代码优化技巧 | 系统性能调优 | 最佳实践
    link: /algorithms/
  - icon: 🔧
    title: 工程实践
    details: 开发工具 | 部署方案 | 监控运维
    link: /system-design/

---

## 📊 博客统计

<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-number">100+</div>
    <div class="stat-label">LeetCode题解</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">50+</div>
    <div class="stat-label">技术文章</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">10+</div>
    <div class="stat-label">系统设计</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">∞</div>
    <div class="stat-label">持续更新</div>
  </div>
</div>

## 🚀 最新文章

<div class="recent-posts">
  <div class="post-card">
    <h3>LeetCode 100题精选</h3>
    <p>精选LeetCode高频题目，涵盖数组、字符串、链表、树、动态规划等核心算法</p>
    <a href="/algorithms/leetCode100" class="post-link">阅读全文 →</a>
  </div>
  <div class="post-card">
    <h3>MySQL事务实现机制</h3>
    <p>深入解析MySQL事务的ACID特性、隔离级别和InnoDB存储引擎的实现原理</p>
    <a href="/basic/mysql" class="post-link">阅读全文 →</a>
  </div>
  <div class="post-card">
    <h3>系统设计基础</h3>
    <p>从零开始学习系统设计，掌握高并发、高可用、分布式系统的设计原则</p>
    <a href="/system-design/index" class="post-link">阅读全文 →</a>
  </div>
</div>


<style>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
}

.recent-posts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.post-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  border-color: #667eea;
}

.post-card h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.post-card p {
  color: #6c757d;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.post-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.post-link:hover {
  color: #764ba2;
}

.tech-stack {
  margin: 2rem 0;
}

.tech-category {
  margin-bottom: 1.5rem;
}

.tech-category h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: transform 0.2s ease;
}

.tech-tag:hover {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .recent-posts {
    grid-template-columns: 1fr;
  }
  
  .tech-tags {
    justify-content: center;
  }
}
</style>
