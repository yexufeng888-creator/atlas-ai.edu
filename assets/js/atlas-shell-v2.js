/**
 * ATLAS Shell - 完全重写版本
 * 修复移动端菜单问题
 */

(function() {
  'use strict';

  // 配置
  const CONFIG = {
    navHeight: '52px',
    breakpoint: 768,
    links: [
      { href: 'index.html', label: '首页' },
      { href: 'home.html', label: '工作台' },
      { href: 'ask.html', label: '询问' },
      { href: 'memory.html', label: '记忆' },
      { href: 'life.html', label: '生活' },
      { href: 'agents.html', label: '智能体' },
      { href: 'settings.html', label: '设置' }
    ]
  };

  // 获取当前页面
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // 创建导航 HTML
  function createNavHTML() {
    const linksHTML = CONFIG.links.map(link => {
      const isActive = link.href === currentPage;
      return `<a href="${link.href}" class="atlas-nav-link ${isActive ? 'active' : ''}">${link.label}</a>`;
    }).join('');

    return `
      <div class="atlas-nav-container">
        <div class="atlas-nav-left">
          <button class="atlas-menu-btn" id="menuBtn" aria-label="菜单">
            <span class="menu-icon"></span>
            <span class="menu-icon"></span>
            <span class="menu-icon"></span>
          </button>
          <a href="index.html" class="atlas-logo">
            <img src="assets/img/atlas-logo.jpg" alt="ATLAS" width="24" height="24">
            <span>ATLAS</span>
          </a>
        </div>
        <nav class="atlas-nav-center">${linksHTML}</nav>
        <div class="atlas-nav-right">
          <button class="region-btn" id="regionBtn">
            <span>🌐</span>
            <span>地区</span>
          </button>
        </div>
      </div>
      <div class="atlas-mobile-menu" id="mobileMenu">
        <div class="mobile-menu-content">
          ${linksHTML}
          <div class="mobile-menu-footer">
            <button class="region-btn-mobile">
              <span>🌐</span>
              <span>地区 / Region</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // 初始化导航
  function initNav() {
    const nav = document.querySelector('.global-nav');
    if (!nav) {
      console.error('导航栏容器未找到');
      return;
    }

    // 插入 HTML
    nav.innerHTML = createNavHTML();

    // 获取元素
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuLinks = mobileMenu.querySelectorAll('.atlas-nav-link');

    if (!menuBtn || !mobileMenu) {
      console.error('菜单元素未找到');
      return;
    }

    // 菜单状态
    let isOpen = false;

    // 切换菜单
    function toggleMenu() {
      isOpen = !isOpen;
      menuBtn.classList.toggle('active', isOpen);
      mobileMenu.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';

      console.log('菜单状态:', isOpen ? '打开' : '关闭');
    }

    // 关闭菜单
    function closeMenu() {
      isOpen = false;
      menuBtn.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    }

    // 事件监听
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // 点击链接关闭菜单
    menuLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // 点击菜单外部关闭
    document.addEventListener('click', (e) => {
      if (isOpen && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
        closeMenu();
      }
    });

    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    });

    console.log('导航栏初始化完成');
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }

})();
