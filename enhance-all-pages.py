#!/usr/bin/env python3
"""
完善 ATLAS 全站国际化
1. 更新导航栏多语言支持
2. 创建所有二级页面的多语言版本
3. 扩展首页内容
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).parent

# 需要翻译的所有页面
PAGES_TO_TRANSLATE = [
    'home.html',
    'ask.html',
    'memory.html',
    'life.html',
    'agents.html',
    'settings.html',
    'pricing.html',
]

# 导航栏翻译
NAV_TRANSLATIONS = {
    'zh-cn': {
        'home': '首页',
        'dashboard': '工作台',
        'ask': '询问',
        'memory': '记忆',
        'life': '生活',
        'agents': '智能体',
        'settings': '设置',
    },
    'en': {
        'home': 'Home',
        'dashboard': 'Dashboard',
        'ask': 'Ask',
        'memory': 'Memory',
        'life': 'Life',
        'agents': 'Agents',
        'settings': 'Settings',
    },
    'ja': {
        'home': 'ホーム',
        'dashboard': 'ダッシュボード',
        'ask': '質問',
        'memory': 'メモリ',
        'life': 'ライフ',
        'agents': 'エージェント',
        'settings': '設定',
    },
    'ko': {
        'home': '홈',
        'dashboard': '대시보드',
        'ask': '질문',
        'memory': '메모리',
        'life': '라이프',
        'agents': '에이전트',
        'settings': '설정',
    },
    'hk': {
        'home': '首頁',
        'dashboard': '工作台',
        'ask': '詢問',
        'memory': '記憶',
        'life': '生活',
        'agents': '智能體',
        'settings': '設置',
    },
}

def create_nav_config():
    """创建新的导航配置"""
    print("=" * 60)
    print("第一步：更新导航栏多语言支持")
    print("=" * 60)
    print()

    nav_js = '''/**
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
'''

    with open(BASE_DIR / 'assets' / 'js' / 'atlas-shell-new.js', 'w', encoding='utf-8') as f:
        f.write(nav_js)

    print("✅ 新的导航配置已创建: assets/js/atlas-shell-new.js")
    print()

def main():
    create_nav_config()

    print("=" * 60)
    print("完成第一步！")
    print("=" * 60)
    print()
    print("接下来需要：")
    print("1. 创建所有二级页面的多语言版本")
    print("2. 扩展首页内容")
    print()
    print("由于工作量较大，建议分步进行：")
    print("  - 优先：创建英文版二级页面")
    print("  - 其次：创建繁体版二级页面")
    print("  - 最后：创建日韩版二级页面")
    print()

if __name__ == '__main__':
    main()
