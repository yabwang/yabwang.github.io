/**
 * 沉浸式阅读模式
 * 一键隐藏侧边栏、导航栏，专注阅读
 */

(function() {
  // 阅读模式状态
  let isReadingMode = false;

  // 存储原始显示状态
  const originalStyles = {};

  // 需要隐藏的元素选择器
  const hideSelectors = [
    '.VPNav',           // 顶部导航
    '.VPSidebar',       // 侧边栏
    '.VPFooter',        // 页脚
    '.VPLocalNav',      // 本地导航
    '.VPDocFooter',     // 文档页脚
    '.vp-doc > .vp-doc-footer',  // 文档底部导航
  ];

  // 需要调整的容器
  const contentContainer = '.VPContent';

  // 创建阅读模式按钮
  function createReadingButton() {
    const button = document.createElement('button');
    button.id = 'reading-mode-btn';
    button.title = '切换阅读模式 (快捷键: R)';
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
      </svg>
    `;

    // 按钮样式
    button.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 24px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      background: rgba(45, 55, 72, 0.95);
      color: #a0aec0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      z-index: 1000;
      opacity: 0.7;
    `;

    // 悬停效果
    button.addEventListener('mouseenter', () => {
      button.style.opacity = '1';
      button.style.transform = 'scale(1.1)';
      button.style.background = 'rgba(66, 153, 225, 0.9)';
      button.style.color = '#fff';
    });

    button.addEventListener('mouseleave', () => {
      if (!isReadingMode) {
        button.style.opacity = '0.7';
        button.style.transform = 'scale(1)';
        button.style.background = 'rgba(45, 55, 72, 0.95)';
        button.style.color = '#a0aec0';
      }
    });

    button.addEventListener('click', toggleReadingMode);

    document.body.appendChild(button);
    return button;
  }

  // 切换阅读模式
  function toggleReadingMode() {
    isReadingMode = !isReadingMode;
    const button = document.getElementById('reading-mode-btn');

    if (isReadingMode) {
      enterReadingMode();
      if (button) {
        button.style.background = 'rgba(72, 187, 120, 0.9)';
        button.style.color = '#fff';
        button.style.opacity = '1';
        button.title = '退出阅读模式 (快捷键: R 或 ESC)';
        // 更换图标为退出图标
        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
            <path d="m15 5 4 4"></path>
          </svg>
        `;
      }
      // 保存状态
      sessionStorage.setItem('readingMode', 'true');
    } else {
      exitReadingMode();
      if (button) {
        button.style.background = 'rgba(45, 55, 72, 0.95)';
        button.style.color = '#a0aec0';
        button.style.opacity = '0.7';
        button.title = '切换阅读模式 (快捷键: R)';
        // 恢复原图标
        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        `;
      }
      sessionStorage.removeItem('readingMode');
    }
  }

  // 进入阅读模式
  function enterReadingMode() {
    // 隐藏元素
    hideSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el) {
          originalStyles[selector] = el.style.display;
          el.style.display = 'none';
          el.setAttribute('data-reading-hidden', 'true');
        }
      });
    });

    // 调整内容容器
    const content = document.querySelector(contentContainer);
    if (content) {
      originalStyles['content'] = content.style.cssText;
      content.style.cssText = `
        padding-top: 40px !important;
        padding-bottom: 40px !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
      `;
      content.setAttribute('data-reading-adjusted', 'true');
    }

    // 调整文档容器
    const doc = document.querySelector('.VPDoc');
    if (doc) {
      originalStyles['doc'] = doc.style.cssText;
      doc.style.maxWidth = '100%';
      doc.setAttribute('data-reading-adjusted', 'true');
    }

    // 调整内容宽度，使其居中且适中
    const docContent = document.querySelector('.content-container');
    if (docContent) {
      originalStyles['docContent'] = docContent.style.cssText;
      docContent.style.maxWidth = '800px';
      docContent.style.margin = '0 auto';
      docContent.setAttribute('data-reading-adjusted', 'true');
    }

    // 添加阅读模式样式类
    document.body.classList.add('reading-mode');

    // 显示提示
    showNotification('阅读模式已开启，按 R 或 ESC 退出');
  }

  // 退出阅读模式
  function exitReadingMode() {
    // 恢复隐藏元素
    document.querySelectorAll('[data-reading-hidden]').forEach(el => {
      el.style.display = '';
      el.removeAttribute('data-reading-hidden');
    });

    // 恢复调整的容器
    document.querySelectorAll('[data-reading-adjusted]').forEach(el => {
      el.style.cssText = '';
      el.removeAttribute('data-reading-adjusted');
    });

    // 移除阅读模式样式类
    document.body.classList.remove('reading-mode');

    showNotification('已退出阅读模式');
  }

  // 显示提示消息
  function showNotification(message) {
    // 检查是否已存在通知
    let notification = document.getElementById('reading-notification');
    if (notification) {
      notification.remove();
    }

    notification = document.createElement('div');
    notification.id = 'reading-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(45, 55, 72, 0.95);
      color: #e2e8f0;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: fadeInOut 2s ease-in-out;
    `;

    // 添加动画样式
    if (!document.getElementById('reading-mode-styles')) {
      const style = document.createElement('style');
      style.id = 'reading-mode-styles';
      style.textContent = `
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          15% { opacity: 1; transform: translateX(-50%) translateY(0); }
          85% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
        .reading-mode .vp-doc {
          max-width: 100% !important;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // 2秒后移除
    setTimeout(() => {
      notification.remove();
    }, 2000);
  }

  // 键盘快捷键
  function handleKeyboard(e) {
    // R 键切换阅读模式（非输入状态）
    if (e.key === 'r' || e.key === 'R') {
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
      );
      if (!isInputFocused) {
        e.preventDefault();
        toggleReadingMode();
      }
    }

    // ESC 键退出阅读模式
    if (e.key === 'Escape' && isReadingMode) {
      e.preventDefault();
      toggleReadingMode();
    }
  }

  // 初始化
  function init() {
    // 创建按钮
    createReadingButton();

    // 添加键盘监听
    document.addEventListener('keydown', handleKeyboard);

    // 恢复之前的阅读模式状态
    if (sessionStorage.getItem('readingMode') === 'true') {
      setTimeout(() => {
        isReadingMode = false; // 重置状态，让 toggleReadingMode 正确工作
        toggleReadingMode();
      }, 300);
    }
  }

  // 等待页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // VitePress SPA 路由切换后重新初始化
    init();
  }

  // 监听 VitePress 路由变化
  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', () => {
      // 路由变化时检查按钮是否存在
      if (!document.getElementById('reading-mode-btn')) {
        init();
      }
    });
  }
})();