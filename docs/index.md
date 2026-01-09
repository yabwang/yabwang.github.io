---
layout: home

---

<div class="tech-hero-wrapper">
  <div class="grid-overlay"></div>
  <div class="scan-line"></div>
  <div class="data-stream"></div>
  <div class="corner-decoration top-left"></div>
  <div class="corner-decoration top-right"></div>
  <div class="corner-decoration bottom-left"></div>
  <div class="corner-decoration bottom-right"></div>
  <canvas id="particleCanvas"></canvas>
  <div class="tech-hero-content">
    <div class="code-line">
      <span class="code-keyword">const</span> <span class="code-var">explorer</span> = <span class="code-keyword">new</span> <span class="code-class">TechExplorer</span>();
    </div>
    <div class="code-line">
      <span class="code-var">explorer</span>.<span class="code-method">startJourney</span>();
    </div>
  </div>
  <div class="hero-glow"></div>
  <div class="tech-pattern"></div>
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
  
  <a href="/interview/java-interview-outline" class="post-card tech-card">
    <div class="card-glow"></div>
    <div class="card-content">
      <div class="card-header">
        <span class="card-badge">HOT</span>
        <span class="card-icon">☕</span>
      </div>
      <h3>Java 面试学习大纲</h3>
      <p>系统性整理 Java 程序员面试核心知识点，涵盖基础、并发、JVM、框架等全方位内容</p>
      <div class="card-footer">
        <span class="read-more">查看详情</span>
      </div>
    </div>
  </a>
  
  <a href="/others/" class="post-card tech-card">
    <div class="card-glow"></div>
    <div class="card-content">
      <div class="card-header">
        <span class="card-badge">📚</span>
        <span class="card-icon">📝</span>
      </div>
      <h3>其他技术文章</h3>
      <p>收录算法、数据结构、数据库、编码等各个方面的技术文章，持续更新中</p>
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
/* 未来世界风格样式 */
.tech-hero-wrapper {
  position: relative;
  width: 100%;
  height: 280px;
  margin: 4rem 0;
  border-radius: 20px;
  overflow: hidden;
  /* 暗色系科技感样式 */
  background: 
    radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.15) 0%, transparent 60%),
    radial-gradient(circle at 80% 80%, rgba(138, 43, 226, 0.12) 0%, transparent 60%),
    radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.1) 0%, transparent 70%),
    linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 30%, #16213e 60%, #0f172a 100%);
  border: 2px solid rgba(0, 255, 255, 0.4);
  box-shadow: 
    0 0 60px rgba(0, 255, 255, 0.3),
    0 0 120px rgba(138, 43, 226, 0.25),
    0 0 180px rgba(0, 255, 136, 0.2),
    inset 0 0 80px rgba(0, 255, 255, 0.1),
    0 8px 32px rgba(0, 0, 0, 0.5);
  animation: borderPulse 3s ease-in-out infinite;
}

/* 数据流效果 */
.data-stream {
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    transparent 0px,
    transparent 2px,
    rgba(0, 255, 255, 0.15) 2px,
    rgba(0, 255, 255, 0.15) 4px,
    transparent 4px,
    transparent 6px,
    rgba(0, 255, 136, 0.12) 6px,
    rgba(0, 255, 136, 0.12) 8px
  );
  animation: dataStream 8s linear infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes dataStream {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* 角落装饰 */
.corner-decoration {
  position: absolute;
  width: 40px;
  height: 40px;
  z-index: 2;
  pointer-events: none;
}

.corner-decoration::before,
.corner-decoration::after {
  content: '';
  position: absolute;
  background: linear-gradient(135deg, rgba(0, 150, 255, 0.8), rgba(0, 255, 136, 0.6));
  box-shadow: 
    0 0 10px rgba(0, 150, 255, 0.8),
    0 0 20px rgba(0, 255, 136, 0.6);
}

.corner-decoration.top-left {
  top: 10px;
  left: 10px;
  border-top: 3px solid rgba(0, 150, 255, 0.8);
  border-left: 3px solid rgba(0, 150, 255, 0.8);
  border-top-left-radius: 10px;
}

.corner-decoration.top-left::before {
  top: -3px;
  left: -3px;
  width: 20px;
  height: 3px;
  animation: cornerGlow 2s ease-in-out infinite;
}

.corner-decoration.top-left::after {
  top: -3px;
  left: -3px;
  width: 3px;
  height: 20px;
  animation: cornerGlow 2s ease-in-out infinite 0.1s;
}

.corner-decoration.top-right {
  top: 10px;
  right: 10px;
  border-top: 3px solid rgba(0, 150, 255, 0.8);
  border-right: 3px solid rgba(0, 150, 255, 0.8);
  border-top-right-radius: 10px;
}

.corner-decoration.top-right::before {
  top: -3px;
  right: -3px;
  width: 20px;
  height: 3px;
  animation: cornerGlow 2s ease-in-out infinite 0.2s;
}

.corner-decoration.top-right::after {
  top: -3px;
  right: -3px;
  width: 3px;
  height: 20px;
  animation: cornerGlow 2s ease-in-out infinite 0.3s;
}

.corner-decoration.bottom-left {
  bottom: 10px;
  left: 10px;
  border-bottom: 3px solid rgba(0, 150, 255, 0.8);
  border-left: 3px solid rgba(0, 150, 255, 0.8);
  border-bottom-left-radius: 10px;
}

.corner-decoration.bottom-left::before {
  bottom: -3px;
  left: -3px;
  width: 20px;
  height: 3px;
  animation: cornerGlow 2s ease-in-out infinite 0.4s;
}

.corner-decoration.bottom-left::after {
  bottom: -3px;
  left: -3px;
  width: 3px;
  height: 20px;
  animation: cornerGlow 2s ease-in-out infinite 0.5s;
}

.corner-decoration.bottom-right {
  bottom: 10px;
  right: 10px;
  border-bottom: 3px solid rgba(0, 150, 255, 0.8);
  border-right: 3px solid rgba(0, 150, 255, 0.8);
  border-bottom-right-radius: 10px;
}

.corner-decoration.bottom-right::before {
  bottom: -3px;
  right: -3px;
  width: 20px;
  height: 3px;
  animation: cornerGlow 2s ease-in-out infinite 0.6s;
}

.corner-decoration.bottom-right::after {
  bottom: -3px;
  right: -3px;
  width: 3px;
  height: 20px;
  animation: cornerGlow 2s ease-in-out infinite 0.7s;
}

@keyframes cornerGlow {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 科技图案背景 */
.tech-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(0, 150, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(138, 43, 226, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.08) 0%, transparent 60%);
  background-size: 200% 200%;
  animation: patternMove 15s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
}

@keyframes patternMove {
  0%, 100% { background-position: 0% 0%; }
  25% { background-position: 100% 0%; }
  50% { background-position: 100% 100%; }
  75% { background-position: 0% 100%; }
}


@keyframes borderPulse {
  0%, 100% {
    border-color: rgba(0, 255, 255, 0.4);
    box-shadow: 
      0 0 60px rgba(0, 255, 255, 0.3),
      0 0 120px rgba(138, 43, 226, 0.25),
      0 0 180px rgba(0, 255, 136, 0.2),
      inset 0 0 80px rgba(0, 255, 255, 0.1),
      0 8px 32px rgba(0, 0, 0, 0.5);
  }
  50% {
    border-color: rgba(0, 255, 255, 0.7);
    box-shadow: 
      0 0 90px rgba(0, 255, 255, 0.5),
      0 0 180px rgba(138, 43, 226, 0.4),
      0 0 240px rgba(0, 255, 136, 0.3),
      inset 0 0 100px rgba(0, 255, 255, 0.15),
      0 12px 48px rgba(0, 0, 0, 0.6);
  }
}


.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 255, 255, 0.15) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.15) 1px, transparent 1px),
    linear-gradient(rgba(138, 43, 226, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(138, 43, 226, 0.1) 1px, transparent 1px);
  background-size: 50px 50px, 50px 50px, 25px 25px, 25px 25px;
  opacity: 0.5;
  animation: gridMove 20s linear infinite;
  pointer-events: none;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(0, 255, 255, 0.9) 30%,
    rgba(0, 255, 136, 0.9) 50%,
    rgba(138, 43, 226, 0.9) 70%,
    transparent 100%);
  box-shadow: 
    0 0 15px rgba(0, 255, 255, 0.8),
    0 0 30px rgba(0, 255, 136, 0.6),
    0 0 45px rgba(138, 43, 226, 0.4);
  animation: scanMove 3s linear infinite;
  pointer-events: none;
  z-index: 2;
}

@keyframes scanMove {
  0% { top: 0; opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

.hero-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  background: 
    radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, rgba(0, 255, 136, 0.2) 30%, rgba(138, 43, 226, 0.15) 50%, transparent 70%);
  border-radius: 50%;
  animation: glowPulse 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
  filter: blur(20px);
}

@keyframes glowPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.6;
  }
}

#particleCanvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.8;
  z-index: 1;
}

.tech-hero-content {
  position: relative;
  z-index: 3;
  padding: 2.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
}

.code-line {
  font-size: 1.2rem;
  margin: 0.75rem 0;
  line-height: 1.8;
  text-shadow: 
    0 0 10px rgba(0, 255, 255, 0.8),
    0 0 20px rgba(0, 255, 255, 0.6),
    0 0 30px rgba(0, 255, 136, 0.4);
  animation: codeGlow 2s ease-in-out infinite;
}

.code-keyword {
  color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 1);
}

.code-var {
  color: #00ff88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 1);
}

.code-class {
  color: #ff6b9d;
  text-shadow: 0 0 10px rgba(255, 107, 157, 1);
}

.code-method {
  color: #ffd93d;
  text-shadow: 0 0 10px rgba(255, 217, 61, 1);
}

.code-line:last-child::after {
  content: '▋';
  color: #00ff88;
  animation: blink 1s infinite;
  margin-left: 6px;
  text-shadow: 0 0 10px rgba(0, 255, 136, 1);
}

@keyframes codeGlow {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.2);
  }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  margin: 4rem 0 2.5rem;
  /* 暗色系科技感 */
  background: linear-gradient(135deg, #00d4ff 0%, #00ff88 30%, #a855f7 50%, #00d4ff 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  padding-left: 1rem;
  text-shadow: 
    0 0 20px rgba(0, 212, 255, 0.8),
    0 0 40px rgba(0, 255, 136, 0.6),
    0 0 60px rgba(168, 85, 247, 0.4);
  animation: titleShine 3s ease-in-out infinite, gradientShift 5s ease infinite;
  filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.6));
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}


.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 70%;
  /* 暗色系科技感 */
  background: linear-gradient(180deg, #00d4ff, #00ff88, #a855f7, #00d4ff);
  background-size: 100% 200%;
  border-radius: 3px;
  box-shadow: 
    0 0 10px rgba(0, 212, 255, 1),
    0 0 20px rgba(0, 255, 136, 0.8),
    0 0 30px rgba(168, 85, 247, 0.6);
  animation: linePulse 2s ease-in-out infinite, lineGradient 3s ease infinite;
}

@keyframes lineGradient {
  0%, 100% { background-position: 0% 0%; }
  50% { background-position: 0% 100%; }
}


@keyframes titleShine {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.3);
  }
}

@keyframes linePulse {
  0%, 100% {
    opacity: 0.8;
    transform: translateY(-50%) scaleY(1);
  }
  50% {
    opacity: 1;
    transform: translateY(-50%) scaleY(1.2);
  }
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
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.post-card.tech-card {
  position: relative;
  /* 暗色系科技感 */
  background: 
    linear-gradient(135deg, rgba(10, 10, 26, 0.95) 0%, rgba(22, 33, 62, 0.95) 50%, rgba(15, 23, 42, 0.95) 100%);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  padding: 0;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(0, 255, 255, 0.2) inset,
    0 0 40px rgba(0, 255, 255, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.3);
  text-decoration: none;
  display: block;
  color: inherit;
  transform-style: preserve-3d;
  perspective: 1000px;
}

.post-card.tech-card::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, 
    #0066ff, #00cc88, #00ff99, #8a2be2, #0066ff);
  border-radius: 20px;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.5s;
  background-size: 400% 400%;
  animation: borderRotate 4s linear infinite;
  filter: blur(1px);
}


.post-card.tech-card:hover::after {
  opacity: 0.6;
}

@keyframes borderRotate {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.post-card.tech-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(0, 212, 255, 0.4) 30%,
    rgba(0, 255, 136, 0.5) 50%,
    rgba(138, 43, 226, 0.4) 70%,
    transparent 100%);
  transition: left 0.8s;
  z-index: 1;
  filter: blur(10px);
}


.post-card.tech-card:hover::before {
  left: 100%;
}

.card-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, 
    rgba(0, 212, 255, 0.5) 0%, 
    rgba(0, 255, 136, 0.3) 30%,
    rgba(138, 43, 226, 0.2) 60%,
    transparent 100%);
  opacity: 0;
  transition: opacity 0.6s, transform 0.6s;
  pointer-events: none;
  z-index: 0;
  filter: blur(30px);
}


.post-card.tech-card:hover .card-glow {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.2);
  animation: glowRotate 4s linear infinite;
}

@keyframes glowRotate {
  0% { transform: translate(-50%, -50%) scale(1.2) rotate(0deg); }
  100% { transform: translate(-50%, -50%) scale(1.2) rotate(360deg); }
}

.post-card.tech-card:hover {
  transform: translateY(-12px) scale(1.03) rotateX(2deg);
  border-color: rgba(0, 255, 255, 0.8);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.6),
    0 0 60px rgba(0, 255, 255, 0.5),
    0 0 100px rgba(0, 255, 136, 0.4),
    0 0 140px rgba(138, 43, 226, 0.3),
    inset 0 0 50px rgba(0, 255, 255, 0.15),
    0 8px 32px rgba(0, 255, 255, 0.3);
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
  padding: 0.3rem 0.9rem;
  background: linear-gradient(135deg, #00d4ff 0%, #00ff88 50%, #8a2be2 100%);
  color: #0a0a1a;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 
    0 4px 15px rgba(0, 212, 255, 0.5),
    0 0 20px rgba(0, 255, 136, 0.3);
  position: relative;
  overflow: hidden;
}

.card-badge::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(255, 255, 255, 0.3) 50%, 
    transparent 70%);
  animation: badgeShine 2s linear infinite;
}

@keyframes badgeShine {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

.card-icon {
  font-size: 1.8rem;
  filter: drop-shadow(0 0 15px rgba(0, 212, 255, 0.8));
  animation: iconFloat 3s ease-in-out infinite;
  transition: all 0.3s;
}

.post-card.tech-card:hover .card-icon {
  filter: drop-shadow(0 0 25px rgba(0, 255, 136, 1));
  transform: scale(1.2) rotate(10deg);
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.post-card.tech-card h3 {
  color: #e2e8f0;
  margin-bottom: 0.75rem;
  font-size: 1.4rem;
  font-weight: 700;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.4s ease;
  text-shadow: 0 0 25px rgba(226, 232, 240, 0.5);
  filter: brightness(1.1);
}

.post-card.tech-card:hover h3 {
  /* 暗色系悬停 */
  background: linear-gradient(135deg, #00d4ff 0%, #00ff88 50%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 35px rgba(0, 212, 255, 0.8);
  transform: translateX(5px);
  filter: brightness(1.2);
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
  color: #00d4ff;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.4s ease;
  opacity: 0.8;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.post-card.tech-card:hover .read-more {
  opacity: 1;
  color: #00ff88;
  text-shadow: 0 0 15px rgba(0, 255, 136, 0.8);
  transform: translateX(5px);
}

.read-more::after {
  content: '→';
  transition: all 0.4s ease;
  display: inline-block;
  margin-left: 0.5rem;
  filter: drop-shadow(0 0 5px rgba(0, 212, 255, 0.8));
}

.post-card.tech-card:hover .read-more::after {
  transform: translateX(8px);
  filter: drop-shadow(0 0 10px rgba(0, 255, 136, 1));
}

.tech-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
  margin: 5rem 0;
  padding: 2.5rem;
  /* 暗色系科技感 */
  background: 
    linear-gradient(135deg, rgba(10, 10, 26, 0.95) 0%, rgba(22, 33, 62, 0.95) 50%, rgba(15, 23, 42, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 2px solid rgba(0, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(0, 255, 255, 0.2) inset,
    0 0 60px rgba(0, 255, 255, 0.2),
    0 4px 16px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: visible;
}

.tech-stats::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(0, 150, 255, 0.2) 30%,
    rgba(0, 255, 136, 0.25) 50%,
    rgba(138, 43, 226, 0.2) 70%,
    transparent 100%);
  animation: statsScan 4s linear infinite;
  filter: blur(15px);
}


@keyframes statsScan {
  0% { left: -100%; }
  100% { left: 100%; }
}

.stat-item {
  text-align: center;
  padding: 2rem 1.5rem;
  border-radius: 16px;
  /* 暗色系科技感 */
  background: 
    linear-gradient(135deg, rgba(0, 212, 255, 0.12) 0%, rgba(0, 255, 136, 0.08) 50%, rgba(138, 43, 226, 0.06) 100%);
  border: 1px solid rgba(0, 255, 255, 0.3);
  transition: all 0.4s ease;
  position: relative;
  overflow: visible;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 0 20px rgba(0, 255, 255, 0.08);
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    #00d4ff 50%, 
    transparent 100%);
  transform: scaleX(0);
  transition: transform 0.4s;
  z-index: 1;
}

.stat-item:hover::before {
  transform: scaleX(1);
}

.stat-item:hover {
  transform: translateY(-8px) scale(1.05);
  background: 
    linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 255, 136, 0.15) 50%, rgba(138, 43, 226, 0.12) 100%);
  border-color: rgba(0, 255, 255, 0.6);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.6),
    0 0 40px rgba(0, 212, 255, 0.5),
    0 0 70px rgba(0, 255, 136, 0.4),
    0 0 100px rgba(138, 43, 226, 0.3),
    inset 0 0 30px rgba(0, 255, 255, 0.15);
}

.stat-number {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  /* 暗色系科技感 */
  background: linear-gradient(135deg, #00d4ff 0%, #00ff88 30%, #a855f7 50%, #00d4ff 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.75rem;
  text-shadow: 
    0 0 20px rgba(0, 212, 255, 0.8),
    0 0 40px rgba(0, 255, 136, 0.6),
    0 0 60px rgba(168, 85, 247, 0.4);
  filter: drop-shadow(0 0 15px rgba(0, 212, 255, 0.6)) brightness(1.2);
  transition: all 0.4s ease;
  animation: gradientShift 5s ease infinite;
  position: relative;
  z-index: 2;
  display: block;
  min-height: 1.2em;
}

.stat-item:hover .stat-number {
  filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.6));
  transform: scale(1.1);
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
    height: 200px;
    margin: 2rem 0;
  }
  
  .section-title {
    font-size: 1.5rem;
    margin: 3rem 0 2rem;
  }
  
  .stat-number {
    font-size: 2.2rem;
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
    const particleCount = Math.min(120, Math.floor((canvas.width * canvas.height) / 8000));
    
    // 检测是否为暗色模式
    const isDark = document.documentElement.classList.contains('dark');
    
    for (let i = 0; i < particleCount; i++) {
      const colorType = Math.random();
      let color;
      if (isDark) {
        // 暗色模式颜色
        if (colorType < 0.4) {
          color = { r: 0, g: 212, b: 255 }; // 青色
        } else if (colorType < 0.7) {
          color = { r: 0, g: 255, b: 136 }; // 绿色
        } else {
          color = { r: 138, g: 43, b: 226 }; // 紫色
        }
      } else {
        // 浅色模式颜色 - 更鲜艳
        if (colorType < 0.4) {
          color = { r: 0, g: 150, b: 255 }; // 亮蓝色
        } else if (colorType < 0.7) {
          color = { r: 0, g: 255, b: 136 }; // 亮绿色
        } else {
          color = { r: 138, g: 43, b: 226 }; // 紫色
        }
      }
      
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 0.8,
        speedX: (Math.random() - 0.5) * 1.2,
        speedY: (Math.random() - 0.5) * 1.2,
        opacity: Math.random() * 0.8 + 0.4,
        color: color,
        glow: Math.random() * 0.7 + 0.5,
        pulse: Math.random() * Math.PI * 2 // 脉冲相位
      });
    }
  }
  
  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const time = Date.now() * 0.001;
    
    particles.forEach((particle, i) => {
      // 更新位置
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // 边界检测
      if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
      
      // 脉冲效果
      const pulseSize = 1 + Math.sin(time * 2 + particle.pulse) * 0.3;
      const currentRadius = particle.radius * pulseSize;
      const currentOpacity = particle.opacity * (0.7 + Math.sin(time * 3 + particle.pulse) * 0.3);
      
      // 绘制粒子光晕 - 增强光效
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, currentRadius * 5
      );
      gradient.addColorStop(0, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${currentOpacity})`);
      gradient.addColorStop(0.3, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${currentOpacity * 0.6})`);
      gradient.addColorStop(0.6, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${currentOpacity * 0.3})`);
      gradient.addColorStop(1, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0)`);
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, currentRadius * 5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // 绘制粒子核心 - 增强亮度
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 1)`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0.8)`;
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // 绘制连线 - 增强可见性
      particles.slice(i + 1).forEach(otherParticle => {
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const opacity = (1 - distance / 150) * 0.4;
          const midR = Math.floor((particle.color.r + otherParticle.color.r) / 2);
          const midG = Math.floor((particle.color.g + otherParticle.color.g) / 2);
          const midB = Math.floor((particle.color.b + otherParticle.color.b) / 2);
          
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(otherParticle.x, otherParticle.y);
          ctx.strokeStyle = `rgba(${midR}, ${midG}, ${midB}, ${opacity})`;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(${midR}, ${midG}, ${midB}, ${opacity * 0.8})`;
          ctx.stroke();
          ctx.shadowBlur = 0;
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
  
  // 加载统计数据
  async function loadStats() {
    try {
      const response = await fetch('/stats.json');
      if (!response.ok) {
        console.warn('无法加载统计数据，使用默认值');
        return null;
      }
      const stats = await response.json();
      return stats;
    } catch (error) {
      console.warn('加载统计数据失败，使用默认值:', error);
      return null;
    }
  }
  
  // 更新统计数据
  async function updateStats() {
    const stats = await loadStats();
    const statNumbers = document.querySelectorAll('.stat-number');
    
    if (stats && statNumbers.length >= 3) {
      // 更新 data-target 属性
      statNumbers[0].setAttribute('data-target', stats.algorithmSolutions);
      statNumbers[1].setAttribute('data-target', stats.days);
      statNumbers[2].setAttribute('data-target', stats.articles);
    }
    
    // 开始观察和动画
    observeStats();
  }
  
  function observeStats() {
    const stats = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute('data-target')) || 0;
          animateValue(entry.target, 0, target, 2000);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateStats);
  } else {
    updateStats();
  }
})();
</script>
