---
layout: home

hero:
  name: 技术探索者
  text: 技术博客导航
  tagline: 系统性整理计算机领域核心知识，分享算法、系统设计与工程实践

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

---

<div class="tech-hero-wrapper">
  <canvas id="particleCanvas"></canvas>
  <div class="tech-hero-content">
    <div class="code-line">const explorer = new TechExplorer();</div>
    <div class="code-line">explorer.startJourney();</div>
  </div>
</div>

## <span class="section-title"><span class="tech-icon">⚡</span> 最新文章</span>

<div class="recent-posts">
  <a href="/30-day-algorithm/day01" class="post-card tech-card">
    <div class="card-glow"></div>
    <div class="card-content">
      <div class="card-header">
        <span class="card-badge">NEW</span>
        <span class="card-icon">🚀</span>
      </div>
      <h3>30天算法挑战 - Day 1</h3>
      <p>数组基础与双指针技巧：两数之和、盛最多水的容器，从零开始系统学习算法</p>
      <div class="card-footer">
        <span class="read-more">查看详情</span>
      </div>
    </div>
  </a>
</div>

<div class="tech-stats">
  <div class="stat-item">
    <div class="stat-number" data-target="100">0</div>
    <div class="stat-label">算法题解</div>
  </div>
  <div class="stat-item">
    <div class="stat-number" data-target="30">0</div>
    <div class="stat-label">刷题天数</div>
  </div>
  <div class="stat-item">
    <div class="stat-number" data-target="50">0</div>
    <div class="stat-label">技术文章</div>
  </div>
</div>

<style>
/* 高科技风格样式 */
.tech-hero-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  margin: 3rem 0;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2d1b4e 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
}

#particleCanvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.6;
}

.tech-hero-content {
  position: relative;
  z-index: 1;
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
}

.code-line {
  color: #00ff88;
  font-size: 1.1rem;
  margin: 0.5rem 0;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
  animation: blink 1.5s infinite;
}

.code-line:last-child::after {
  content: '▋';
  animation: blink 1s infinite;
  margin-left: 4px;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 3rem 0 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tech-icon {
  font-size: 1.5rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.recent-posts {
  display: grid;
  grid-template-columns: 1fr;
  max-width: 600px;
  margin: 2rem auto;
  gap: 2rem;
}

.post-card.tech-card {
  position: relative;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  padding: 0;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  text-decoration: none;
  display: block;
  color: inherit;
}

.post-card.tech-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.2), transparent);
  transition: left 0.5s;
}

.post-card.tech-card:hover::before {
  left: 100%;
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s;
}

.post-card.tech-card:hover .card-glow {
  opacity: 1;
}

.post-card.tech-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(102, 126, 234, 0.6);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
}

.card-content {
  position: relative;
  z-index: 1;
  padding: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.card-icon {
  font-size: 1.5rem;
  filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.6));
}

.post-card.tech-card h3 {
  color: #e2e8f0;
  margin-bottom: 0.75rem;
  font-size: 1.3rem;
  font-weight: 600;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;
}

.post-card.tech-card:hover h3 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.post-card.tech-card p {
  color: #94a3b8;
  margin-bottom: 0;
  line-height: 1.7;
  font-size: 0.95rem;
}

.card-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(102, 126, 234, 0.2);
}

.read-more {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.post-card.tech-card:hover .read-more {
  opacity: 1;
  color: #a78bfa;
}

.read-more::after {
  content: '→';
  transition: transform 0.3s ease;
  display: inline-block;
  margin-left: 0.25rem;
}

.post-card.tech-card:hover .read-more::after {
  transform: translateX(6px);
}

.tech-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
  margin: 4rem 0;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-4px);
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.4);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

@media (max-width: 768px) {
  .recent-posts {
    grid-template-columns: 1fr;
  }
  
  .tech-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 1.5rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .code-line {
    font-size: 0.9rem;
  }
  
  .tech-hero-wrapper {
    height: 150px;
  }
}

/* 粒子动画脚本 */
</style>

<script>
// 粒子背景动画
(function() {
  // 检查是否在浏览器环境中（避免 SSR 错误）
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  
  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  
  function createParticles() {
    particles = [];
    const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 15000));
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }
  
  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((particle, i) => {
      // 更新位置
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // 边界检测
      if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
      
      // 绘制粒子
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(102, 126, 234, ${particle.opacity})`;
      ctx.fill();
      
      // 绘制连线
      particles.slice(i + 1).forEach(otherParticle => {
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(otherParticle.x, otherParticle.y);
          ctx.strokeStyle = `rgba(102, 126, 234, ${0.2 * (1 - distance / 100)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    });
    
    animationId = requestAnimationFrame(drawParticles);
  }
  
  function init() {
    resizeCanvas();
    createParticles();
    drawParticles();
  }
  
  window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
  });
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// 数字动画
(function() {
  // 检查是否在浏览器环境中（避免 SSR 错误）
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  
  function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.floor(progress * (end - start) + start);
      element.textContent = current;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }
  
  function observeStats() {
    const stats = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute('data-target'));
          animateValue(entry.target, 0, target, 2000);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeStats);
  } else {
    observeStats();
  }
})();
</script>
