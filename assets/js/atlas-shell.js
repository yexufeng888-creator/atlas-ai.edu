/**
 * ATLAS Shell - 统一导航和页面框架
 * 支持多地区版本
 */

(function (window, document) {
  'use strict';

  // 获取当前页面
  const rawPage = window.location.pathname.split('/').pop() || 'index.html';
  const page = rawPage || 'index.html';
  const slug = page.replace(/\.html$/i, '').replace(/[^a-z0-9-]/gi, '-').toLowerCase();

  // 添加页面标识类
  document.body.classList.add('has-global-nav', 'page-' + slug);

  // 导航链接配置 - 简体中文
  const linksZhCN = [
    { href: 'index.html', label: '首页' },
    { href: 'home.html', label: '工作台' },
    { href: 'ask.html', label: '询问' },
    { href: 'memory.html', label: '记忆' },
    { href: 'life.html', label: '生活' },
    { href: 'agents.html', label: '智能体' },
    { href: 'settings.html', label: '设置' }
  ];

  // 导航链接配置 - 英文
  const linksEN = [
    { href: 'index-en.html', label: 'Home' },
    { href: 'home-en.html', label: 'Dashboard' },
    { href: 'ask-en.html', label: 'Ask' },
    { href: 'memory-en.html', label: 'Memory' },
    { href: 'life-en.html', label: 'Life' },
    { href: 'agents-en.html', label: 'Agents' },
    { href: 'settings-en.html', label: 'Settings' }
  ];

  // 检测当前语言
  const currentLang = page.includes('-en.html') ? 'en' :
                     page.includes('-hk.html') ? 'hk' :
                     page.includes('-tw.html') ? 'tw' :
                     page.includes('-ja.html') ? 'ja' :
                     page.includes('-ko.html') ? 'ko' : 'zh-cn';

  const links = currentLang === 'en' ? linksEN : linksZhCN;

  // 查找或创建导航栏
  let nav = document.querySelector('body > nav.global-nav');
  if (!nav) {
    nav = document.createElement('nav');
    document.body.insertBefore(nav, document.body.firstChild);
  }

  nav.className = 'global-nav';
  nav.setAttribute('aria-label', 'Main Navigation');

  // 生成导航 HTML
  nav.innerHTML = `
    <div class="atlas-nav-inner">
      <a class="atlas-brand" href="index.html" aria-label="ATLAS Home">
        <img src="assets/img/atlas-logo.jpg" alt="ATLAS Logo" class="atlas-brand-logo">
        <span class="atlas-brand-name">ATLAS</span>
      </a>

      <button class="atlas-menu-toggle" type="button" aria-expanded="false" aria-controls="atlas-nav-panel" aria-label="Open navigation menu">
        <span class="atlas-menu-lines" aria-hidden="true"></span>
      </button>

      <div class="atlas-nav-panel" id="atlas-nav-panel">
        <div class="atlas-nav-links">
          ${links.map((item) => {
            const isCurrent = page.includes(item.href.replace('.html', ''));
            return `<a class="atlas-nav-link${isCurrent ? ' is-current' : ''}" href="${item.href}"${isCurrent ? ' aria-current="page"' : ''}>${item.label}</a>`;
          }).join('')}
        </div>

        <div class="atlas-nav-actions">
          <span class="atlas-system-status"><i></i>系统在线</span>
          <a class="atlas-login-link" href="login.html">登录</a>
          <!-- 地区选择 -->
          <div class="region-selector">
            <button class="region-btn" id="regionBtn">
              <span class="region-flag" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4a12 12 0 0 1 0 16M12 4a12 12 0 0 0 0 16"/></svg></span>
              <span class="region-label">${
                currentLang === 'en' ? 'Region' :
                currentLang === 'ja' ? '地域' :
                currentLang === 'ko' ? '지역' :
                (currentLang === 'hk' || currentLang === 'tw') ? '地區' : '地区'
              }</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none"/>
              </svg>
            </button>
            <div class="region-dropdown" id="regionDropdown">
              <div class="region-section">
                <div class="region-section-title">${currentLang === 'en' ? 'CHINA' : currentLang === 'ja' ? '中国' : currentLang === 'ko' ? '중국' : '中国'}</div>
                <a href="index.html" class="region-item">
                  <span>${
                    currentLang === 'en' ? 'Mainland China (Simplified)' :
                    currentLang === 'ja' ? '中国本土 (簡体字)' :
                    currentLang === 'ko' ? '중국 본토 (간체)' :
                    (currentLang === 'hk' || currentLang === 'tw') ? '中國大陸 (簡體)' : '中国大陆 (简体)'
                  }</span>
                </a>
                <a href="index-hk.html" class="region-item">
                  <span>${
                    currentLang === 'en' ? 'Hong Kong (Traditional)' :
                    currentLang === 'ja' ? '香港 (繁体字)' :
                    currentLang === 'ko' ? '홍콩 (번체)' :
                    '中國香港 (繁體)'
                  }</span>
                </a>
                <a href="index-tw.html" class="region-item">
                  <span>${
                    currentLang === 'en' ? 'Taiwan (Traditional)' :
                    currentLang === 'ja' ? '台湾 (繁体字)' :
                    currentLang === 'ko' ? '대만 (번체)' :
                    '中國台灣 (繁體)'
                  }</span>
                </a>
              </div>
              <div class="region-section">
                <div class="region-section-title">${currentLang === 'en' ? 'ASIA PACIFIC' : currentLang === 'ja' ? 'アジア太平洋' : currentLang === 'ko' ? '아시아 태평양' : (currentLang === 'hk' || currentLang === 'tw') ? '亞太地區' : '亚太地区'}</div>
                <a href="index.html" class="region-item">
                  <span>${
                    currentLang === 'en' ? 'Singapore (Simplified)' :
                    currentLang === 'ja' ? 'シンガポール (簡体字)' :
                    currentLang === 'ko' ? '싱가포르 (간체)' :
                    (currentLang === 'hk' || currentLang === 'tw') ? '新加坡 (簡體)' : '新加坡 (简体)'
                  }</span>
                </a>
                <a href="index.html" class="region-item">
                  <span>${
                    currentLang === 'en' ? 'Malaysia (Simplified)' :
                    currentLang === 'ja' ? 'マレーシア (簡体字)' :
                    currentLang === 'ko' ? '말레이시아 (간체)' :
                    (currentLang === 'hk' || currentLang === 'tw') ? '馬來西亞 (簡體)' : '马来西亚 (简体)'
                  }</span>
                </a>
                <a href="index-ja.html" class="region-item">
                  <span>${
                    currentLang === 'en' ? 'Japan (Japanese)' :
                    currentLang === 'ja' ? '日本 (日本語)' :
                    currentLang === 'ko' ? '일본 (일본어)' :
                    (currentLang === 'hk' || currentLang === 'tw') ? '日本 (日語)' : '日本 (日语)'
                  }</span>
                </a>
                <a href="index-ko.html" class="region-item">
                  <span>${
                    currentLang === 'en' ? 'South Korea (Korean)' :
                    currentLang === 'ja' ? '韓国 (韓国語)' :
                    currentLang === 'ko' ? '대한민국 (한국어)' :
                    (currentLang === 'hk' || currentLang === 'tw') ? '韓國 (韓語)' : '韩国 (韩语)'
                  }</span>
                </a>
              </div>
              <div class="region-section">
                <div class="region-section-title">${currentLang === 'en' ? 'OTHER' : currentLang === 'ja' ? 'その他' : currentLang === 'ko' ? '기타' : (currentLang === 'hk' || currentLang === 'tw') ? '其他地區' : '其他地区'}</div>
                <a href="index-en.html" class="region-item">
                  <span>United States (English)</span>
                </a>
                <a href="index-en.html" class="region-item">
                  <span>Australia (English)</span>
                </a>
                <a href="index-en.html" class="region-item">
                  <span>Germany (English)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  // 移动端菜单切换
  const toggle = nav.querySelector('.atlas-menu-toggle');
  const panel = nav.querySelector('.atlas-nav-panel');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
    panel.style.setProperty('--atlas-menu-state', open ? '1' : '0');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    setMenu(!nav.classList.contains('is-open'));
  });

  // 点击外部关闭菜单
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target)) {
      setMenu(false);
    }
  });

  // ESC 键关闭菜单
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  // 地区选择器
  const regionBtn = document.getElementById('regionBtn');
  const regionDropdown = document.getElementById('regionDropdown');

  if (regionBtn && regionDropdown) {
    regionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      regionDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      regionDropdown.classList.remove('show');
    });

    regionDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // 导出 ATLAS Shell API
  window.ATLAS = window.ATLAS || {};
  window.ATLAS.Shell = {
    currentPage: page,
    currentLang: currentLang,
    closeMenu: () => setMenu(false),
    openMenu: () => setMenu(true),
    toggleMenu: () => setMenu(!nav.classList.contains('is-open'))
  };

  console.log('✅ ATLAS Shell initialized');

})(window, document);
