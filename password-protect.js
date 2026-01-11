/**
 * 简单的密码保护脚本
 * 注意：密码会暴露在代码中，安全性较低，仅适合简单场景
 */

(function() {
  // 配置密码（可以修改为你想要的密码）
  const PASSWORD = 'wangyabingo'; // 请修改为你的密码
  
  // 密码验证函数（使用简单的哈希，增加一点安全性）
  function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }
  
  // 检查是否已通过验证
  function isAuthenticated() {
    const stored = sessionStorage.getItem('blog_authenticated');
    if (stored) {
      const [hash, time] = stored.split('|');
      // 检查是否在24小时内
      if (Date.now() - parseInt(time) < 24 * 60 * 60 * 1000) {
        return hash === hashPassword(PASSWORD);
      }
    }
    return false;
  }
  
  // 显示密码输入框
  function showPasswordPrompt() {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.id = 'password-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 30%, #16213e 60%, #0f172a 100%);
      z-index: 99999;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // 创建密码输入框容器
    const container = document.createElement('div');
    container.style.cssText = `
      background: rgba(22, 33, 62, 0.95);
      backdrop-filter: blur(20px);
      border: 2px solid rgba(0, 255, 255, 0.3);
      border-radius: 20px;
      padding: 3rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5),
                  0 0 60px rgba(0, 255, 255, 0.2);
      text-align: center;
      min-width: 350px;
    `;
    
    // 标题
    const title = document.createElement('h2');
    title.textContent = '🔒 访问受保护';
    title.style.cssText = `
      color: #00d4ff;
      margin: 0 0 1rem 0;
      font-size: 1.8rem;
      text-shadow: 0 0 20px rgba(0, 212, 255, 0.8);
    `;
    
    // 提示文字
    const hint = document.createElement('p');
    hint.textContent = '请输入密码以访问博客';
    hint.style.cssText = `
      color: #94a3b8;
      margin: 0 0 1.5rem 0;
      font-size: 0.95rem;
    `;
    
    // 密码输入框
    const input = document.createElement('input');
    input.type = 'password';
    input.placeholder = '请输入密码';
    input.id = 'password-input';
    input.style.cssText = `
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(10, 10, 26, 0.8);
      border: 2px solid rgba(0, 255, 255, 0.3);
      border-radius: 10px;
      color: #e2e8f0;
      font-size: 1rem;
      outline: none;
      transition: all 0.3s;
      box-sizing: border-box;
    `;
    input.addEventListener('focus', () => {
      input.style.borderColor = 'rgba(0, 255, 255, 0.8)';
      input.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)';
    });
    input.addEventListener('blur', () => {
      input.style.borderColor = 'rgba(0, 255, 255, 0.3)';
      input.style.boxShadow = 'none';
    });
    
    // 错误提示
    const error = document.createElement('div');
    error.id = 'password-error';
    error.style.cssText = `
      color: #ff6b9d;
      margin: 0.5rem 0 0 0;
      font-size: 0.85rem;
      min-height: 1.2rem;
      display: none;
    `;
    
    // 验证函数
    function validatePassword() {
      const enteredPassword = input.value;
      if (hashPassword(enteredPassword) === hashPassword(PASSWORD)) {
        // 保存验证状态
        sessionStorage.setItem('blog_authenticated', 
          hashPassword(PASSWORD) + '|' + Date.now());
        // 移除遮罩层
        overlay.remove();
        // 显示内容（恢复所有被隐藏的元素）
        const app = document.querySelector('#app');
        if (app) {
          app.style.display = '';
        }
        const bodyChildren = Array.from(document.body.children);
        bodyChildren.forEach(child => {
          if (child.style.display === 'none') {
            child.style.display = '';
          }
        });
      } else {
        error.textContent = '❌ 密码错误，请重试';
        error.style.display = 'block';
        input.value = '';
        input.focus();
        // 添加错误动画
        input.style.animation = 'shake 0.5s';
        setTimeout(() => {
          input.style.animation = '';
        }, 500);
      }
    }
    
    // 回车键提交
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        validatePassword();
      }
    });
    
    // 提交按钮
    const button = document.createElement('button');
    button.textContent = '进入';
    button.style.cssText = `
      width: 100%;
      padding: 0.75rem 1rem;
      margin-top: 1rem;
      background: linear-gradient(135deg, #00d4ff 0%, #00ff88 50%, #8a2be2 100%);
      border: none;
      border-radius: 10px;
      color: #0a0a1a;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(0, 212, 255, 0.5);
    `;
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.7)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.5)';
    });
    button.addEventListener('click', validatePassword);
    
    // 组装元素
    container.appendChild(title);
    container.appendChild(hint);
    container.appendChild(input);
    container.appendChild(error);
    container.appendChild(button);
    overlay.appendChild(container);
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
      }
    `;
    document.head.appendChild(style);
    
    // 隐藏页面内容
    // 方法1：隐藏 VitePress 的根容器（如果存在）
    const app = document.querySelector('#app');
    if (app) {
      app.style.display = 'none';
    }
    
    // 方法2：隐藏 body 的所有直接子元素（除了 overlay）
    const bodyChildren = Array.from(document.body.children);
    bodyChildren.forEach(child => {
      if (child.id !== 'password-overlay' && child.id !== 'vite-plugin-pwa-sw') {
        child.style.display = 'none';
      }
    });
    
    // 添加到页面（添加到 body，确保在最上层）
    document.body.appendChild(overlay);
    
    // 确保 overlay 在最上层
    overlay.style.zIndex = '999999';
    
    // 自动聚焦输入框
    setTimeout(() => {
      input.focus();
    }, 100);
  }
  
  // 页面加载时检查（确保在 VitePress 渲染完成后执行）
  function checkAndShowPassword() {
    if (!isAuthenticated()) {
      // 等待一小段时间确保 VitePress 渲染完成
      setTimeout(() => {
        showPasswordPrompt();
      }, 100);
    }
  }
  
  // 多种方式确保脚本执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndShowPassword);
  } else if (document.readyState === 'interactive') {
    // 如果 DOM 已经加载但资源可能还在加载
    window.addEventListener('load', checkAndShowPassword);
    // 同时立即检查一次
    checkAndShowPassword();
  } else {
    // 如果页面已经完全加载
    checkAndShowPassword();
  }
  
  // 监听路由变化（VitePress SPA 路由切换）
  if (window.location.hash) {
    window.addEventListener('hashchange', () => {
      if (!isAuthenticated()) {
        checkAndShowPassword();
      }
    });
  }
})();
