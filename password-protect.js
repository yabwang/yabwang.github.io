/**
 * 密码保护脚本 + 干净分享模式
 * 支持通过带有 token 的分享链接绕过密码验证
 * 分享模式下：无需密码、隐藏导航、禁止访问其他页面
 */

(function() {
  // 配置密码（可以修改为你想要的密码）
  const PASSWORD = 'wangyabingo'; // 请修改为你的密码

  // 分享密钥（用于生成分享 token，请修改为你自己的密钥）
  const SHARE_SECRET = 'my-blog-share-2024';

  // 分享模式状态
  let isShareMode = false;
  let shareAllowedPath = '';

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

  // 生成分享 token
  function generateShareToken(path) {
    const data = path + SHARE_SECRET;
    return hashPassword(data);
  }

  // 验证分享 token
  function verifyShareToken(path, token) {
    const expectedToken = generateShareToken(path);
    return token === expectedToken;
  }

  // 检查URL参数是否为有效的分享链接
  function checkShareLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const shareToken = urlParams.get('share');

    if (shareToken) {
      const currentPath = window.location.pathname;
      // 解码 token（token 是路径的 hash）
      if (verifyShareToken(currentPath, shareToken)) {
        isShareMode = true;
        shareAllowedPath = currentPath;
        return true;
      }
    }
    return false;
  }

  // 检查是否已通过验证
  function isAuthenticated() {
    // 分享模式下直接通过
    if (isShareMode) return true;

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

  // 分享模式下的页面锁定
  function lockShareModePage() {
    // 拦截所有链接点击
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        // 允许锚点链接
        if (href && href.startsWith('#')) {
          return;
        }
        // 阻止所有其他导航
        e.preventDefault();
        e.stopPropagation();
        showShareModeWarning();
        return false;
      }
    }, true);

    // 拦截 popstate（浏览器前进/后退）
    window.addEventListener('popstate', (e) => {
      e.preventDefault();
      // 强制回到当前页面
      history.pushState(null, '', location.href);
      showShareModeWarning();
    });

    // 强制 pushState 防止导航
    history.pushState(null, '', location.href);

    // 禁用右键菜单（防止复制链接等）
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showShareModeWarning('右键功能已被禁用');
    });

    // 禁用键盘快捷键导航
    document.addEventListener('keydown', (e) => {
      // 禁用 Alt+Left/Right（浏览器前进后退）
      // 禁用 Ctrl+L（地址栏）
      if ((e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) ||
          (e.ctrlKey && e.key === 'l') ||
          (e.metaKey && e.key === 'l')) {
        e.preventDefault();
        showShareModeWarning();
      }
    });
  }

  // 显示分享模式警告
  function showShareModeWarning(message) {
    const existingWarning = document.getElementById('share-warning');
    if (existingWarning) {
      existingWarning.remove();
    }

    const warning = document.createElement('div');
    warning.id = 'share-warning';
    warning.textContent = message || '此链接仅限阅读当前文章';
    warning.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(220, 38, 38, 0.95);
      color: white;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      z-index: 999999;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      animation: warningFade 2s ease-in-out forwards;
    `;

    // 添加动画样式
    if (!document.getElementById('share-warning-style')) {
      const style = document.createElement('style');
      style.id = 'share-warning-style';
      style.textContent = `
        @keyframes warningFade {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(warning);
    setTimeout(() => warning.remove(), 2000);
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
    // 先检查是否为有效的分享链接
    if (checkShareLink()) {
      // 分享模式：隐藏导航、锁定页面
      setTimeout(() => {
        // 隐藏导航相关元素
        const navSelectors = [
          '.VPNav',           // 顶部导航
          '.VPSidebar',       // 侧边栏
          '.VPFooter',        // 页脚
          '.VPLocalNav',      // 本地导航
        ];

        navSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el) {
              el.style.display = 'none';
            }
          });
        });

        // 调整内容布局
        const content = document.querySelector('.VPContent');
        if (content) {
          content.style.paddingTop = '40px';
          content.style.paddingLeft = '0';
          content.style.paddingRight = '0';
        }

        const doc = document.querySelector('.VPDoc');
        if (doc) {
          doc.style.maxWidth = '100%';
        }

        const docContent = document.querySelector('.content-container');
        if (docContent) {
          docContent.style.maxWidth = '800px';
          docContent.style.margin = '0 auto';
        }

        // 锁定页面，禁止导航到其他页面
        lockShareModePage();

        // 显示分享模式提示
        showShareModeNotification();
      }, 500);
      return;
    }

    // 非分享模式，检查密码验证
    if (!isAuthenticated()) {
      // 等待一小段时间确保 VitePress 渲染完成
      setTimeout(() => {
        showPasswordPrompt();
      }, 100);
    }
  }

  // 显示分享模式提示
  function showShareModeNotification() {
    const notification = document.createElement('div');
    notification.id = 'share-mode-notification';
    notification.innerHTML = `
      <span style="margin-right: 8px;">🔗</span>
      <span>分享模式 - 仅可阅读当前文章</span>
    `;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(34, 197, 94, 0.95);
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 0.9rem;
      z-index: 99999;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    document.body.appendChild(notification);

    // 5秒后淡出
    setTimeout(() => {
      notification.style.transition = 'opacity 0.5s';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 500);
    }, 5000);
  }

  // 暴露生成分享链接的函数到全局
  window.generateShareUrl = function() {
    const currentPath = window.location.pathname;
    const token = generateShareToken(currentPath);
    const url = new URL(window.location.href);
    // 清除其他参数，只保留 share
    url.search = '?share=' + token + '&reading=true';
    return url.toString();
  };

  // 复制分享链接到剪贴板
  window.copyShareUrlToClipboard = async function() {
    const shareUrl = window.generateShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch (err) {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (e) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  };
  
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
