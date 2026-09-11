/**
 * ATLAS Shell - 多语言导航系统
 */

(function (window, document) {
  'use strict';

  // 获取当前页面和语言
  const rawPage = window.location.pathname.split('/').pop() || 'index.html';
  const page = rawPage || 'index.html';

  // 检测当前语言
  const currentLang = page.includes('-en.html') ? 'en' :
                     page.includes('-hk.html') ? 'hk' :
                     page.includes('-tw.html') ? 'tw' :
                     page.includes('-ja.html') ? 'ja' :
                     page.includes('-ko.html') ? 'ko' : 'zh-cn';

  // 导航链接配置（多语言）
  const navLinks = {
    'zh-cn': [
      { href: 'index.html', label: '首页' },
      { href: 'home.html', label: '工作台' },
      { href: 'ask.html', label: '询问' },
      { href: 'memory.html', label: '记忆' },
      { href: 'life.html', label: '生活' },
      { href: 'agents.html', label: '智能体' },
      { href: 'settings.html', label: '设置' }
    ],
    'en': [
      { href: 'index-en.html', label: 'Home' },
      { href: 'home-en.html', label: 'Dashboard' },
      { href: 'ask-en.html', label: 'Ask' },
      { href: 'memory-en.html', label: 'Memory' },
      { href: 'life-en.html', label: 'Life' },
      { href: 'agents-en.html', label: 'Agents' },
      { href: 'settings-en.html', label: 'Settings' }
    ],
    'ja': [
      { href: 'index-ja.html', label: 'ホーム' },
      { href: 'home-ja.html', label: 'ダッシュボード' },
      { href: 'ask-ja.html', label: '質問' },
      { href: 'memory-ja.html', label: 'メモリ' },
      { href: 'life-ja.html', label: 'ライフ' },
      { href: 'agents-ja.html', label: 'エージェント' },
      { href: 'settings-ja.html', label: '設定' }
    ],
    'ko': [
      { href: 'index-ko.html', label: '홈' },
      { href: 'home-ko.html', label: '대시보드' },
      { href: 'ask-ko.html', label: '질문' },
      { href: 'memory-ko.html', label: '메모리' },
      { href: 'life-ko.html', label: '라이프' },
      { href: 'agents-ko.html', label: '에이전트' },
      { href: 'settings-ko.html', label: '설정' }
    ],
    'hk': [
      { href: 'index-hk.html', label: '首頁' },
      { href: 'home-hk.html', label: '工作台' },
      { href: 'ask-hk.html', label: '詢問' },
      { href: 'memory-hk.html', label: '記憶' },
      { href: 'life-hk.html', label: '生活' },
      { href: 'agents-hk.html', label: '智能體' },
      { href: 'settings-hk.html', label: '設置' }
    ],
    'tw': [
      { href: 'index-tw.html', label: '首頁' },
      { href: 'home-tw.html', label: '工作台' },
      { href: 'ask-tw.html', label: '詢問' },
      { href: 'memory-tw.html', label: '記憶' },
      { href: 'life-tw.html', label: '生活' },
      { href: 'agents-tw.html', label: '智能體' },
      { href: 'settings-tw.html', label: '設置' }
    ]
  };

  const links = navLinks[currentLang] || navLinks['zh-cn'];

  // 查找或创建导航栏
  let nav = document.querySelector('body > nav.global-nav');
  if (!nav) {
    nav = document.createElement('nav');
    document.body.insertBefore(nav, document.body.firstChild);
  }

  nav.className = 'global-nav';

  // 生成导航 HTML
  nav.innerHTML = `
    <div class="atlas-nav-inner">
      <a class="atlas-brand" href="${links[0].href}">
        <img src="assets/img/atlas-logo.jpg" alt="ATLAS" class="atlas-brand-logo">
        <span class="atlas-brand-name">ATLAS</span>
      </a>

      <button class="atlas-menu-toggle" type="button">
        <span class="atlas-menu-lines"></span>
      </button>

      <div class="atlas-nav-panel">
        <div class="atlas-nav-links">
          ${links.map((item, i) => {
            const isCurrent = page.includes(item.href.replace('.html', '')) ||
                            (i === 0 && (page === 'index.html' || page === ''));
            return `<a class="atlas-nav-link${isCurrent ? ' is-current' : ''}" href="${item.href}">${item.label}</a>`;
          }).join('')}
        </div>

        <div class="atlas-nav-actions">
          <div class="region-selector">
            <button class="region-btn" id="regionBtn">
              <span class="region-flag">🌐</span>
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
              <!-- 地区选择内容 -->
            </div>
          </div>
        </div>
      </div>
    </div>`;

  // 事件处理
  const toggle = nav.querySelector('.atlas-menu-toggle');
  const panel = nav.querySelector('.atlas-nav-panel');

  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });

  window.ATLAS = window.ATLAS || {};
  window.ATLAS.Shell = { currentLang, currentPage: page };

})(window, document);
