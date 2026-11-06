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
  const isPrimaryLandingPage = page.toLowerCase() === 'index.html';
  const isLandingPage = /^index(?:-(?:en|hk|tw|ja|ko))?\.html$/i.test(page);
  const marketingPageSlugs = new Set([
    'agents', 'memory', 'privacy-policy', 'product', 'team'
  ]);
  const isMarketingPage = isPrimaryLandingPage || marketingPageSlugs.has(slug);

  // 添加页面标识类
  document.body.classList.add('has-global-nav', 'page-' + slug);

  if (/^(home|ask|memory|life|agents|settings)(-|$)/.test(slug)) {
    document.body.classList.add('atlas-app-page');

    const motionStyles = document.createElement('link');
    motionStyles.rel = 'stylesheet';
    motionStyles.href = 'assets/css/app-motion.css?v=20261006b';
    document.head.appendChild(motionStyles);

    const motionScript = document.createElement('script');
    motionScript.src = 'assets/js/app-motion.js?v=20261006b';
    document.body.appendChild(motionScript);
  }

  if (/^settings(-|$)/.test(slug)) {
    const settingsStyles = document.createElement('link');
    settingsStyles.rel = 'stylesheet';
    settingsStyles.href = 'assets/css/settings-ui.css?v=20261007h';
    document.head.appendChild(settingsStyles);

    const settingsScript = document.createElement('script');
    settingsScript.src = 'assets/js/settings-ui.js?v=20261027b';
    document.body.appendChild(settingsScript);
  }

  if (!isLandingPage && !/^(test|debug)-/.test(slug)) {
    const secondaryPageStyles = document.createElement('link');
    secondaryPageStyles.rel = 'stylesheet';
    secondaryPageStyles.href = 'assets/css/secondary-pages.css?v=20261027d';
    document.head.appendChild(secondaryPageStyles);
  }

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

  const localeFromPage = page.includes('-en.html') ? 'en' :
    page.includes('-hk.html') ? 'zh-hk' :
    page.includes('-tw.html') ? 'zh-tw' :
    page.includes('-ja.html') ? 'ja' :
    page.includes('-ko.html') ? 'ko' : 'zh-cn';
  const supportedLocales = ['zh-cn', 'zh-hk', 'zh-tw', 'en', 'ja', 'ko'];
  const requestedLocale = new URLSearchParams(window.location.search).get('lang');
  let storedLocale = null;
  try {
    storedLocale = window.localStorage.getItem('atlas-locale');
  } catch (error) {
    console.warn('Cannot read saved locale preference:', error);
  }
  const isLocalizedLandingPage = isLandingPage;
  const currentLang = isLocalizedLandingPage ? localeFromPage :
    supportedLocales.includes(requestedLocale) ? requestedLocale :
    supportedLocales.includes(storedLocale) ? storedLocale : localeFromPage;
  try {
    window.localStorage.setItem('atlas-locale', currentLang);
  } catch (error) {
    console.warn('Cannot save locale preference:', error);
  }
  document.documentElement.lang = currentLang === 'zh-cn' ? 'zh-CN' :
    currentLang === 'zh-hk' ? 'zh-HK' :
    currentLang === 'zh-tw' ? 'zh-TW' : currentLang;

  const navLabels = {
    'zh-cn': ['首页', '工作台', '对话', '记忆', '生活', '智能体', '设置'],
    'zh-hk': ['首頁', '工作台', '對話', '記憶', '生活', '智能體', '設定'],
    'zh-tw': ['首頁', '工作台', '對話', '記憶', '生活', '智能體', '設定'],
    en: ['Home', 'Dashboard', 'Chat', 'Memory', 'Life', 'Agents', 'Settings'],
    ja: ['ホーム', 'ダッシュボード', '会話', 'メモリ', '生活', 'エージェント', '設定'],
    ko: ['홈', '대시보드', '대화', '메모리', '생활', '에이전트', '설정']
  };
  const localizedLandingPages = {
    'zh-cn': 'index.html',
    'zh-hk': 'index-hk.html',
    'zh-tw': 'index-tw.html',
    en: 'index-en.html',
    ja: 'index-ja.html',
    ko: 'index-ko.html'
  };
  const navHrefs = [
    localizedLandingPages[currentLang] || 'index.html',
    'home.html', 'ask.html', 'memory.html', 'life.html', 'agents.html', 'settings.html'
  ];
  const marketingNavLabels = {
    'zh-cn': ['首页', '产品能力', '智能体', '个人知识库', '产品体验', '关于我们'],
    'zh-hk': ['首頁', '產品能力', '智能體', '個人知識庫', '產品體驗', '關於我們'],
    'zh-tw': ['首頁', '產品能力', '智慧體', '個人知識庫', '產品體驗', '關於我們'],
    en: ['Home', 'Capabilities', 'Agents', 'Personal knowledge', 'Product experience', 'About'],
    ja: ['ホーム', '製品の特長', 'エージェント', 'パーソナルナレッジ', '製品体験', 'ATLASについて'],
    ko: ['홈', '제품 역량', '에이전트', '개인 지식 기반', '제품 체험', 'ATLAS 소개']
  };
  const marketingLinks = [
    { href: navHrefs[0], label: marketingNavLabels[currentLang][0] },
    {
      href: currentLang === 'zh-cn' ? 'product.html' : `${navHrefs[0]}#features`,
      label: marketingNavLabels[currentLang][1]
    },
    { href: 'agents.html', label: marketingNavLabels[currentLang][2] },
    { href: 'memory.html', label: marketingNavLabels[currentLang][3] },
    { href: 'home.html', label: marketingNavLabels[currentLang][4] },
    { href: 'team.html', label: marketingNavLabels[currentLang][5] }
  ];
  const links = isMarketingPage
    ? marketingLinks
    : navHrefs.map((href, index) => ({ href, label: navLabels[currentLang][index] }));

  const localeText = {
    'zh-cn': {
      login: '登录', region: '地区', home: '首页',
      footer: 'ATLAS · 个人智能操作系统',
      pages: {
        home: ['个人工作台', '把任务、日程和智能建议集中在一个清晰的行动面板'],
        ask: ['对话 ATLAS', '把问题交给你的个人智能助手'],
        memory: ['记忆', 'ATLAS 对你的理解：事实、偏好、经历与推断'],
        life: ['生活', '日历、任务、项目、文档和行程的统一视图'],
        agents: ['智能体', 'Agent 能力、权限、运行记录和待确认动作'],
        settings: ['设置', '个人资料、隐私控制、Demo 配置和执行规则'],
        team: ['关于 ATLAS', '了解 ATLAS 的产品愿景、设计原则与个人智能操作系统方向']
      }
    },
    'zh-hk': {
      login: '登入', region: '地區', home: '首頁',
      footer: 'ATLAS · 個人智能操作系統',
      pages: {
        home: ['個人工作台', '將任務、日程和智能建議集中在清晰的行動面板'],
        ask: ['對話 ATLAS', '將問題交給你的個人智能助手'],
        memory: ['記憶', 'ATLAS 對你的理解：事實、偏好、經歷與推斷'],
        life: ['生活', '日曆、任務、項目、文件和行程的統一視圖'],
        agents: ['智能體', 'Agent 能力、權限、運行記錄和待確認動作'],
        settings: ['設定', '個人資料、私隱控制、Demo 配置和執行規則'],
        team: ['關於 ATLAS', '了解 ATLAS 的產品願景、設計原則與個人智能操作系統方向']
      }
    },
    'zh-tw': {
      login: '登入', region: '地區', home: '首頁',
      footer: 'ATLAS · 個人智慧作業系統',
      pages: {
        home: ['個人工作台', '將任務、日程和智慧建議集中在清晰的行動面板'],
        ask: ['對話 ATLAS', '把問題交給你的個人智慧助手'],
        memory: ['記憶', 'ATLAS 對你的理解：事實、偏好、經歷與推論'],
        life: ['生活', '日曆、任務、專案、文件和行程的統一視圖'],
        agents: ['智慧體', 'Agent 能力、權限、執行記錄和待確認動作'],
        settings: ['設定', '個人資料、隱私控制、Demo 配置和執行規則'],
        team: ['關於 ATLAS', '了解 ATLAS 的產品願景、設計原則與個人智慧作業系統方向']
      }
    },
    en: {
      login: 'Sign in', region: 'Region', home: 'Home',
      footer: 'Personal Intelligence OS · Powered by ATLAS',
      pages: {
        home: ['Personal dashboard', 'Tasks, schedules, and intelligent suggestions in one clear action panel'],
        ask: ['Chat with ATLAS', 'Give your questions to your personal intelligent assistant'],
        memory: ['Memory', 'How ATLAS understands you: facts, preferences, experiences, and inferences'],
        life: ['Life', 'One view for your calendar, tasks, projects, documents, and trips'],
        agents: ['Agents', 'Agent capabilities, permissions, runs, and actions awaiting confirmation'],
        settings: ['Settings', 'Profile, privacy controls, demo configuration, and execution rules'],
        team: ['About ATLAS', 'Explore ATLAS’s product vision, design principles, and personal intelligence OS direction']
      }
    },
    ja: {
      login: 'ログイン', region: '地域', home: 'ホーム',
      footer: 'Personal Intelligence OS · ATLAS が提供',
      pages: {
        home: ['パーソナルダッシュボード', 'タスク、予定、インテリジェントな提案を一つの画面に'],
        ask: ['ATLAS と会話', 'パーソナルインテリジェントアシスタントに質問する'],
        memory: ['メモリ', 'ATLAS のあなたへの理解：事実、好み、経験、推論'],
        life: ['生活', 'カレンダー、タスク、プロジェクト、書類、旅行を一つの画面で'],
        agents: ['エージェント', 'エージェントの機能、権限、実行履歴、確認待ちの操作'],
        settings: ['設定', 'プロフィール、プライバシー、デモ設定、実行ルール'],
        team: ['ATLASについて', 'ATLAS の製品ビジョン、設計原則、パーソナルインテリジェンス OS の方向性をご紹介します']
      }
    },
    ko: {
      login: '로그인', region: '지역', home: '홈',
      footer: 'Personal Intelligence OS · ATLAS 제공',
      pages: {
        home: ['개인 대시보드', '작업, 일정, 지능형 제안을 하나의 명확한 화면에서 관리'],
        ask: ['ATLAS와 대화', '개인 지능형 어시스턴트에게 질문하기'],
        memory: ['메모리', 'ATLAS가 이해하는 나: 사실, 선호, 경험, 추론'],
        life: ['생활', '캘린더, 작업, 프로젝트, 문서와 여행을 한눈에'],
        agents: ['에이전트', '에이전트 기능, 권한, 실행 기록, 확인 대기 작업'],
        settings: ['설정', '프로필, 개인정보 보호, 데모 구성 및 실행 규칙'],
        team: ['ATLAS 소개', 'ATLAS의 제품 비전, 디자인 원칙, 개인 인텔리전스 OS 방향을 소개합니다']
      }
    }
  };
  const language = localeText[currentLang];

  // 查找或创建导航栏
  let nav = document.querySelector('body > nav.global-nav');
  if (!nav) {
    nav = document.createElement('nav');
    document.body.insertBefore(nav, document.body.firstChild);
  }

  nav.className = 'global-nav';
  const navigationCopy = {
    'zh-cn': { nav: '主导航', home: 'ATLAS 首页', open: '打开导航菜单', close: '关闭导航菜单', cta: '开始体验' },
    'zh-hk': { nav: '主導覽', home: 'ATLAS 首頁', open: '開啟導覽選單', close: '關閉導覽選單', cta: '開始體驗' },
    'zh-tw': { nav: '主導覽', home: 'ATLAS 首頁', open: '開啟導覽選單', close: '關閉導覽選單', cta: '開始體驗' },
    en: { nav: 'Main navigation', home: 'ATLAS home', open: 'Open navigation menu', close: 'Close navigation menu', cta: 'Get started' },
    ja: { nav: 'メインナビゲーション', home: 'ATLAS ホーム', open: 'メニューを開く', close: 'メニューを閉じる', cta: '利用を開始' },
    ko: { nav: '주요 탐색', home: 'ATLAS 홈', open: '탐색 메뉴 열기', close: '탐색 메뉴 닫기', cta: '시작하기' }
  }[currentLang];
  nav.setAttribute('aria-label', navigationCopy.nav);

  // 生成导航 HTML
  nav.innerHTML = `
    <div class="atlas-nav-inner">
      <a class="atlas-brand" href="index.html" aria-label="${navigationCopy.home}">
        <img src="assets/img/atlas-logo.jpg" alt="" class="atlas-brand-logo">
        <span class="atlas-brand-name">ATLAS</span>
      </a>

      <button class="atlas-menu-toggle" type="button" aria-expanded="false" aria-controls="atlas-nav-panel" aria-label="${navigationCopy.open}">
        <span class="atlas-menu-lines" aria-hidden="true"></span>
      </button>

      <div class="atlas-nav-panel" id="atlas-nav-panel">
        <div class="atlas-nav-links">
          ${links.map((item) => {
            const href = item.href.split('#')[0];
            const isCurrent = isMarketingPage
              ? page === href
              : page.includes(href.replace('.html', ''));
            return `<a class="atlas-nav-link${isCurrent ? ' is-current' : ''}" href="${item.href}"${isCurrent ? ' aria-current="page"' : ''}>${item.label}</a>`;
          }).join('')}
        </div>

        <div class="atlas-nav-actions">
          ${isMarketingPage
            ? `<a class="atlas-login-link atlas-nav-cta" href="signup.html">${navigationCopy.cta} <span aria-hidden="true">→</span></a>`
            : `<a class="atlas-login-link" href="login.html">${language.login}</a>`}
          <!-- 地区选择 -->
          <div class="region-selector">
            <button class="region-btn" id="regionBtn" type="button" aria-expanded="false" aria-controls="regionDropdown">
              <span class="region-flag" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4a12 12 0 0 1 0 16M12 4a12 12 0 0 0 0 16"/></svg></span>
              <span class="region-label">${language.region}</span>
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
                    (currentLang === 'zh-hk' || currentLang === 'zh-tw') ? '中國大陸 (簡體)' : '中国大陆 (简体)'
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
                <div class="region-section-title">${currentLang === 'en' ? 'ASIA PACIFIC' : currentLang === 'ja' ? 'アジア太平洋' : currentLang === 'ko' ? '아시아 태평양' : (currentLang === 'zh-hk' || currentLang === 'zh-tw') ? '亞太地區' : '亚太地区'}</div>
                <a href="index.html" class="region-item">
                  <span>${
                    currentLang === 'en' ? 'Singapore (Simplified)' :
                    currentLang === 'ja' ? 'シンガポール (簡体字)' :
                    currentLang === 'ko' ? '싱가포르 (간체)' :
                    (currentLang === 'zh-hk' || currentLang === 'zh-tw') ? '新加坡 (簡體)' : '新加坡 (简体)'
                  }</span>
                </a>
                <a href="index.html" class="region-item">
                  <span>${
                    currentLang === 'en' ? 'Malaysia (Simplified)' :
                    currentLang === 'ja' ? 'マレーシア (簡体字)' :
                    currentLang === 'ko' ? '말레이시아 (간체)' :
                    (currentLang === 'zh-hk' || currentLang === 'zh-tw') ? '馬來西亞 (簡體)' : '马来西亚 (简体)'
                  }</span>
                </a>
                <a href="index-ja.html" class="region-item">
                  <span>${
                    currentLang === 'en' ? 'Japan (Japanese)' :
                    currentLang === 'ja' ? '日本 (日本語)' :
                    currentLang === 'ko' ? '일본 (일본어)' :
                    (currentLang === 'zh-hk' || currentLang === 'zh-tw') ? '日本 (日語)' : '日本 (日语)'
                  }</span>
                </a>
                <a href="index-ko.html" class="region-item">
                  <span>${
                    currentLang === 'en' ? 'South Korea (Korean)' :
                    currentLang === 'ja' ? '韓国 (韓国語)' :
                    currentLang === 'ko' ? '대한민국 (한국어)' :
                    (currentLang === 'zh-hk' || currentLang === 'zh-tw') ? '韓國 (韓語)' : '韩国 (韩语)'
                  }</span>
                </a>
              </div>
              <div class="region-section">
                <div class="region-section-title">${currentLang === 'en' ? 'OTHER' : currentLang === 'ja' ? 'その他' : currentLang === 'ko' ? '기타' : (currentLang === 'zh-hk' || currentLang === 'zh-tw') ? '其他地區' : '其他地区'}</div>
                <a href="index-en.html" class="region-item">
                  <span>${currentLang === 'en' ? 'United States (English)' : currentLang === 'ja' ? '米国（英語）' : currentLang === 'ko' ? '미국 (영어)' : (currentLang === 'zh-hk' || currentLang === 'zh-tw') ? '美國（英語）' : '美国（英语）'}</span>
                </a>
                <a href="index-en.html" class="region-item">
                  <span>${currentLang === 'en' ? 'Australia (English)' : currentLang === 'ja' ? 'オーストラリア（英語）' : currentLang === 'ko' ? '호주 (영어)' : (currentLang === 'zh-hk' || currentLang === 'zh-tw') ? '澳洲（英語）' : '澳大利亚（英语）'}</span>
                </a>
                <a href="index-en.html" class="region-item">
                  <span>${currentLang === 'en' ? 'Germany (English)' : currentLang === 'ja' ? 'ドイツ（英語）' : currentLang === 'ko' ? '독일 (영어)' : (currentLang === 'zh-hk' || currentLang === 'zh-tw') ? '德國（英語）' : '德国（英语）'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  nav.querySelector('.atlas-brand').href = navHrefs[0];
  const teamHomeLink = document.querySelector('.team-footer a');
  if (teamHomeLink) teamHomeLink.href = navHrefs[0];

  // 移动端菜单切换
  const toggle = nav.querySelector('.atlas-menu-toggle');
  const panel = nav.querySelector('.atlas-nav-panel');
  const mobileNavQuery = window.matchMedia('(max-width: 768px)');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? navigationCopy.close : navigationCopy.open);
    if (mobileNavQuery.matches) {
      panel.setAttribute('aria-hidden', String(!open));
    } else {
      panel.removeAttribute('aria-hidden');
    }
    panel.style.setProperty('--atlas-menu-state', open ? '1' : '0');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  setMenu(false);
  mobileNavQuery.addEventListener('change', () => setMenu(false));

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    setMenu(!nav.classList.contains('is-open'));
  });

  nav.querySelectorAll('.atlas-nav-link').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
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
    const regionLocales = ['zh-cn', 'zh-hk', 'zh-tw', 'zh-cn', 'zh-cn', 'ja', 'ko', 'en', 'en', 'en'];
    regionDropdown.querySelectorAll('a.region-item').forEach((item, index) => {
      const targetLocale = regionLocales[index] || 'en';
      const targetPage = targetLocale === 'en' ? 'index-en.html' :
        targetLocale === 'zh-hk' ? 'index-hk.html' :
        targetLocale === 'zh-tw' ? 'index-tw.html' :
        targetLocale === 'ja' ? 'index-ja.html' :
        targetLocale === 'ko' ? 'index-ko.html' : 'index.html';
      item.href = `${targetPage}?lang=${targetLocale}`;
    });

    regionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = regionDropdown.classList.toggle('show');
      regionBtn.setAttribute('aria-expanded', String(isExpanded));
    });

    document.addEventListener('click', () => {
      regionDropdown.classList.remove('show');
      regionBtn.setAttribute('aria-expanded', 'false');
    });

    regionDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  const teamTranslations = {
    'zh-cn': {
      kicker: '关于 ATLAS / 愿景与原则', title: '让 AI 真正理解、组织并协助管理你的数字生活。',
      intro: 'ATLAS 是围绕个人上下文、知识组织与行动协作构建的个人智能操作系统。我们希望技术不止回答问题，也能帮助你看清信息之间的联系与下一步。',
      manifesto: '让信息形成上下文，让上下文帮助你做出更好的决定。',
      manifestoCaption: 'ATLAS / 产品理念',
      principle1Title: '连接个人上下文', principle1Body: '让任务、资料与长期记忆彼此关联，方便回看和理解。',
      principle2Title: '建议，而非替你决定', principle2Body: '把复杂事务整理成可检查的建议，由你判断如何继续。',
      principle3Title: '边界清晰，持续迭代', principle3Body: '功能和数据处理以实际配置为准，不把演示能力包装成承诺。',
      directionKicker: '产品逻辑', directionTitle: '理解 → 组织 → 决策 → 行动',
      directionBody: '这是 ATLAS 持续探索的产品方向。每一步都应让信息来源和操作边界保持清楚。',
      backHome: '返回 ATLAS 首页'
    },
    'zh-hk': {
      kicker: '關於 ATLAS / 願景與原則', title: '讓 AI 真正理解、整理並協助管理你的數碼生活。',
      intro: 'ATLAS 是圍繞個人脈絡、知識整理與行動協作構建的個人智能操作系統。我們希望技術不止回答問題，也能協助你看清資訊之間的聯繫與下一步。',
      manifesto: '讓資訊形成脈絡，讓脈絡幫助你作出更好的決定。',
      manifestoCaption: 'ATLAS / 產品理念',
      principle1Title: '連結個人脈絡', principle1Body: '讓任務、資料與長期記憶彼此關聯，方便回看和理解。',
      principle2Title: '提出建議，由你決定', principle2Body: '把複雜事務整理成可檢查的建議，由你判斷如何繼續。',
      principle3Title: '界線清晰，持續迭代', principle3Body: '功能和資料處理以實際配置為準，不把演示能力包裝成承諾。',
      directionKicker: '產品邏輯', directionTitle: '理解 → 整理 → 決策 → 行動',
      directionBody: '這是 ATLAS 持續探索的產品方向。每一步都應讓資訊來源和操作界線保持清楚。',
      backHome: '返回 ATLAS 首頁'
    },
    'zh-tw': {
      kicker: '關於 ATLAS / 願景與原則', title: '讓 AI 真正理解、整理並協助管理你的數位生活。',
      intro: 'ATLAS 是圍繞個人脈絡、知識整理與行動協作構建的個人智慧作業系統。我們希望科技不只回答問題，也能協助你看清資訊之間的連結與下一步。',
      manifesto: '讓資訊形成脈絡，讓脈絡幫助你做出更好的決定。',
      manifestoCaption: 'ATLAS / 產品理念',
      principle1Title: '連結個人脈絡', principle1Body: '讓任務、資料與長期記憶彼此關聯，方便回看和理解。',
      principle2Title: '提出建議，由你決定', principle2Body: '把複雜事務整理成可檢查的建議，由你判斷如何繼續。',
      principle3Title: '界線清晰，持續迭代', principle3Body: '功能和資料處理以實際配置為準，不把示範能力包裝成承諾。',
      directionKicker: '產品邏輯', directionTitle: '理解 → 組織 → 決策 → 行動',
      directionBody: '這是 ATLAS 持續探索的產品方向。每一步都應讓資訊來源和操作界線保持清楚。',
      backHome: '返回 ATLAS 首頁'
    },
    en: {
      kicker: 'ABOUT ATLAS / VISION & PRINCIPLES', title: 'AI that understands, organizes, and helps with your digital life.',
      intro: 'ATLAS is a personal intelligence operating system focused on context, knowledge organization, and action. The goal is to help you see how information connects and what a useful next step might be.',
      manifesto: 'Bring information into context, and let context inform better decisions.',
      manifestoCaption: 'ATLAS / PRODUCT PRINCIPLES',
      principle1Title: 'Connect personal context', principle1Body: 'Relate tasks, materials, and long-term memories so they are easier to revisit.',
      principle2Title: 'Suggest, do not decide for you', principle2Body: 'Turn complex work into reviewable suggestions; you choose what happens next.',
      principle3Title: 'Clear boundaries, ongoing iteration', principle3Body: 'Features and data handling depend on actual configuration; demos are not promises.',
      directionKicker: 'PRODUCT LOGIC', directionTitle: 'Understand → Organize → Decide → Act',
      directionBody: 'This is the direction ATLAS is exploring. Each step should keep information sources and action boundaries clear.',
      backHome: 'Back to ATLAS home'
    },
    ja: {
      kicker: 'ATLASについて / ビジョンと原則', title: 'デジタルライフを理解し、整理し、支える AI。',
      intro: 'ATLAS は個人のコンテキスト、知識整理、行動支援を目指すパーソナルインテリジェンス OS です。情報のつながりと次の一歩を見つけやすくすることを目指します。',
      manifesto: '情報を文脈につなぎ、より良い判断を支える。',
      manifestoCaption: 'ATLAS / プロダクト原則',
      principle1Title: '個人のコンテキストをつなぐ', principle1Body: 'タスク、資料、長期記憶を関連付け、振り返りやすくします。',
      principle2Title: '提案し、決定は委ねる', principle2Body: '複雑な作業を確認できる提案に整理し、次の判断はユーザーに委ねます。',
      principle3Title: '明確な境界と継続的な改善', principle3Body: '機能とデータ処理は実際の設定に従い、デモを保証として扱いません。',
      directionKicker: '製品の考え方', directionTitle: '理解 → 整理 → 判断 → 行動',
      directionBody: 'ATLAS が探求を続ける製品の方向性です。情報の出典と操作の境界を明確に保ちます。',
      backHome: 'ATLAS ホームへ戻る'
    },
    ko: {
      kicker: 'ATLAS 소개 / 비전과 원칙', title: '디지털 생활을 이해하고 정리하며 돕는 AI.',
      intro: 'ATLAS는 개인 맥락, 지식 정리, 행동 지원을 지향하는 개인 인텔리전스 OS입니다. 정보의 연결과 다음 단계를 더 쉽게 파악하도록 돕는 것이 목표입니다.',
      manifesto: '정보를 맥락으로 연결하고 더 나은 판단을 돕습니다.',
      manifestoCaption: 'ATLAS / 제품 원칙',
      principle1Title: '개인 맥락 연결', principle1Body: '작업, 자료, 장기 기억을 연관 지어 다시 살펴보기 쉽게 합니다.',
      principle2Title: '제안하고, 결정은 사용자에게', principle2Body: '복잡한 일을 검토 가능한 제안으로 정리하고 다음 선택은 사용자에게 맡깁니다.',
      principle3Title: '명확한 경계와 지속적인 개선', principle3Body: '기능과 데이터 처리는 실제 설정을 따르며 데모를 보장으로 표현하지 않습니다.',
      directionKicker: '제품 방향', directionTitle: '이해 → 정리 → 결정 → 실행',
      directionBody: 'ATLAS가 계속 탐색하는 제품 방향입니다. 정보 출처와 작업 경계를 명확히 유지합니다.',
      backHome: 'ATLAS 홈으로 돌아가기'
    }
  };

  document.querySelectorAll('[data-team-copy]').forEach((element) => {
    const key = element.getAttribute('data-team-copy');
    const translation = teamTranslations[currentLang][key];
    if (translation) element.textContent = translation;
  });

  if (/^(agents|memory)(-|$)/.test(slug) && !document.querySelector('.page-demo-notice')) {
    const pageHeader = document.querySelector('.page-header');
    if (!pageHeader) {
      console.error('The ATLAS demo page is missing its page header.');
    } else {
      const noticeCopy = {
        'zh-cn': '演示内容说明：本页中的资料、人物、统计和状态均为示例，不代表真实账户数据或已接入能力。外部操作不会由此页面触发。',
        'zh-hk': '演示內容說明：本頁中的資料、人物、統計和狀態均為示例，不代表真實帳戶資料或已接入能力。外部操作不會由此頁面觸發。',
        'zh-tw': '示範內容說明：本頁中的資料、人物、統計和狀態均為範例，不代表真實帳戶資料或已介接能力。外部操作不會由此頁面觸發。',
        en: 'Demo content: information, people, metrics, and states on this page are examples. They do not represent real account data or connected capabilities, and this page does not trigger external actions.',
        ja: 'デモ内容：このページの情報、人物、統計、状態はサンプルです。実際のアカウントデータや接続済み機能を示すものではなく、外部操作も実行しません。',
        ko: '데모 콘텐츠 안내: 이 페이지의 정보, 인물, 통계 및 상태는 예시입니다. 실제 계정 데이터나 연결된 기능을 나타내지 않으며 외부 작업을 실행하지 않습니다.'
      }[currentLang];
      const notice = document.createElement('p');
      notice.className = 'page-demo-notice';
      notice.setAttribute('role', 'note');
      notice.textContent = noticeCopy;
      pageHeader.insertAdjacentElement('afterend', notice);
    }
  }

  const pageHeaders = {
    'zh-cn': {
      life: ['统一上下文', '生活', '日历、任务、项目、文档和行程的统一视图'],
      memory: ['个人知识', '个人知识库', '搜索、组织并关联个人资料与项目上下文。页面资料均为示例。'],
      agents: ['受控协作', 'AI 智能体', '理解目标、拆解计划、展示状态，并在行动前由你确认。演示页面不会触发外部操作。'],
      settings: ['用户控制', '设置', '个人资料、隐私控制、Demo 配置和执行规则'],
      ask: ['个人智能助手', '对话', '把问题交给你的个人智能助手']
    },
    'zh-hk': {
      life: ['統一上下文', '生活', '日曆、任務、項目、文件和行程的統一視圖'],
      memory: ['個人知識', '個人知識庫', '搜尋、整理並連結個人資料與項目脈絡。本頁資料均為示例。'],
      agents: ['受控協作', 'AI 智能體', '理解目標、拆解計劃、展示狀態，並在行動前由你確認。演示頁面不會觸發外部操作。'],
      settings: ['用戶控制', '設定', '個人資料、私隱控制、Demo 配置和執行規則'],
      ask: ['個人智能助手', '對話', '將問題交給你的個人智能助手']
    },
    'zh-tw': {
      life: ['統一上下文', '生活', '日曆、任務、專案、文件和行程的統一視圖'],
      memory: ['個人知識', '個人知識庫', '搜尋、整理並連結個人資料與專案脈絡。本頁資料均為範例。'],
      agents: ['受控協作', 'AI 智慧體', '理解目標、拆解計畫、展示狀態，並在行動前由你確認。示範頁面不會觸發外部操作。'],
      settings: ['使用者控制', '設定', '個人資料、隱私控制、Demo 配置和執行規則'],
      ask: ['個人智慧助手', '對話', '把問題交給你的個人智慧助手']
    },
    en: {
      life: ['Unified context', 'Life', 'One view for your calendar, tasks, projects, documents, and trips'],
      memory: ['Personal knowledge', 'Personal knowledge base', 'Search, organize, and connect personal notes with project context. Page content is sample data.'],
      agents: ['Controlled assistance', 'AI agents', 'Understand goals, outline plans, show status, and wait for your confirmation before acting. This demo triggers no external actions.'],
      settings: ['User controls', 'Settings', 'Profile, privacy controls, demo configuration, and execution rules'],
      ask: ['Personal intelligence', 'Chat', 'Give your questions to your personal intelligent assistant']
    },
    ja: {
      life: ['統合コンテキスト', '生活', 'カレンダー、タスク、プロジェクト、書類、旅行を一つの画面で'],
      memory: ['パーソナルナレッジ', '個人ナレッジベース', '個人情報とプロジェクトの文脈を検索・整理・関連付けます。ページ内はサンプルデータです。'],
      agents: ['確認して進める', 'AI エージェント', '目標を理解し、計画と状態を示します。操作前に確認し、このデモでは外部操作を行いません。'],
      settings: ['ユーザー管理', '設定', 'プロフィール、プライバシー、デモ設定、実行ルール'],
      ask: ['パーソナルインテリジェンス', '会話', 'パーソナルアシスタントに質問する']
    },
    ko: {
      life: ['통합 컨텍스트', '생활', '캘린더, 작업, 프로젝트, 문서와 여행을 한눈에'],
      memory: ['개인 지식', '개인 지식 베이스', '개인 메모와 프로젝트 맥락을 검색, 정리하고 연결합니다. 페이지 내용은 샘플 데이터입니다.'],
      agents: ['확인 후 진행', 'AI 에이전트', '목표를 이해하고 계획과 상태를 보여줍니다. 작업 전 확인하며 이 데모는 외부 작업을 실행하지 않습니다.'],
      settings: ['사용자 제어', '설정', '프로필, 개인정보 보호, 데모 구성 및 실행 규칙'],
      ask: ['개인 지능', '대화', '개인 지능형 어시스턴트에게 질문하기']
    }
  };

  const header = (pageHeaders[currentLang] && pageHeaders[currentLang][slug]) ||
    (language.pages[slug] ? ['ATLAS', language.pages[slug][0], language.pages[slug][1]] : null);
  if (header) {
    const eyebrow = document.querySelector('.page-eyebrow');
    const title = document.querySelector('.page-title');
    const description = document.querySelector('.page-description');
    if (eyebrow) eyebrow.textContent = header[0];
    if (title) title.textContent = header[1];
    if (description) description.textContent = header[2];
    document.title = `${header[1]} - ATLAS`;
  }

  const commonCopy = {
    'zh-hk': { '时间线': '時間線', '日历': '日曆', '任务': '任務', '行程': '行程', '项目': '項目', '文档': '文件', '个人信息': '個人資料', '偏好设置': '偏好設定', '工作相关': '工作相關', '关系网络': '關係網絡', '动作中心': '動作中心', '运行记录': '運行記錄', '隐私控制': '私隱控制', '外观设置': '外觀設定' },
    'zh-tw': { '时间线': '時間軸', '日历': '日曆', '任务': '任務', '行程': '行程', '项目': '專案', '文档': '文件', '个人信息': '個人資訊', '偏好设置': '偏好設定', '工作相关': '工作相關', '关系网络': '關係網絡', '动作中心': '動作中心', '运行记录': '執行記錄', '隐私控制': '隱私控制', '外观设置': '外觀設定' },
    en: { '时间线': 'Timeline', '日历': 'Calendar', '任务': 'Tasks', '行程': 'Trips', '项目': 'Projects', '文档': 'Documents', '个人信息': 'Personal information', '偏好设置': 'Preferences', '工作相关': 'Work', '关系网络': 'Relationships', '动作中心': 'Action center', '运行记录': 'Run history', '隐私控制': 'Privacy controls', '外观设置': 'Appearance' },
    ja: { '时间线': 'タイムライン', '日历': 'カレンダー', '任务': 'タスク', '行程': '旅行', '项目': 'プロジェクト', '文档': 'ドキュメント', '个人信息': '個人情報', '偏好设置': '設定', '工作相关': '仕事', '关系网络': '関係ネットワーク', '动作中心': 'アクションセンター', '运行记录': '実行履歴', '隐私控制': 'プライバシー管理', '外观设置': '外観設定' },
    ko: { '时间线': '타임라인', '日历': '캘린더', '任务': '작업', '行程': '여행', '项目': '프로젝트', '文档': '문서', '个人信息': '개인 정보', '偏好设置': '환경설정', '工作相关': '업무', '关系网络': '관계 네트워크', '动作中心': '작업 센터', '运行记录': '실행 기록', '隐私控制': '개인정보 보호', '外观设置': '화면 설정' }
  };
  const pageTitles = {
    'zh-hk': { '日历事件': '日曆事件', '任务管理': '任務管理', '项目管理': '項目管理', '旅行计划': '旅行計劃', '个人资料设置': '個人資料設定', '隐私控制': '私隱控制', '执行规则': '執行規則', '外观设置': '外觀設定', 'Demo 配置': 'Demo 配置', '个人信息记忆': '個人資料記憶' },
    'zh-tw': { '日历事件': '日曆事件', '任务管理': '任務管理', '项目管理': '專案管理', '旅行计划': '旅行計畫', '个人资料设置': '個人資料設定', '隐私控制': '隱私控制', '执行规则': '執行規則', '外观设置': '外觀設定', 'Demo 配置': 'Demo 配置', '个人信息记忆': '個人資訊記憶' },
    en: { '日历事件': 'Calendar events', '任务管理': 'Task management', '项目管理': 'Project management', '旅行计划': 'Travel planning', '个人资料设置': 'Profile settings', '隐私控制': 'Privacy controls', '执行规则': 'Execution rules', '外观设置': 'Appearance', 'Demo 配置': 'Demo configuration', '个人信息记忆': 'Personal memory' },
    ja: { '日历事件': 'カレンダーイベント', '任务管理': 'タスク管理', '项目管理': 'プロジェクト管理', '旅行计划': '旅行計画', '个人资料设置': 'プロフィール設定', '隐私控制': 'プライバシー管理', '执行规则': '実行ルール', '外观设置': '外観設定', 'Demo 配置': 'デモ設定', '个人信息记忆': '個人メモリ' },
    ko: { '日历事件': '캘린더 이벤트', '任务管理': '작업 관리', '项目管理': '프로젝트 관리', '旅行计划': '여행 계획', '个人资料设置': '프로필 설정', '隐私控制': '개인정보 보호', '执行规则': '실행 규칙', '外观设置': '화면 설정', 'Demo 配置': '데모 구성', '个人信息记忆': '개인 메모리' }
  };
  const detailedCopy = {
    'zh-hk': { '统一时间线视图': '統一時間線視圖', '所有日程安排': '所有日程安排', '待办事项和截止日期': '待辦事項和截止日期', '旅行计划管理': '旅行計劃管理', '工作和个人项目': '工作和個人項目', '重要文档管理': '重要文件管理', 'ATLAS 对你的基本了解': 'ATLAS 對你的基本了解', '你的习惯、喜好和决策倾向': '你的習慣、喜好和決策傾向', '项目、职责和协作关系': '項目、職責和協作關係', '你的社交和职业关系': '你的社交和職業關係', '🧳 旅行规划': '🧳 旅行規劃', '智能旅行计划助手（MVP重点）': '智能旅行計劃助手（MVP重點）', '📊 运行记录': '📊 運行記錄', '历史执行和审计日志': '歷史執行和審計日誌', '🔧 Agent 能力': '🔧 Agent 能力', '了解每个 Agent 的权限': '了解每個 Agent 的權限', '✅ 动作中心': '✅ 動作中心', '待确认的行动提案': '待確認的行動提案' },
    'zh-tw': { '统一时间线视图': '統一時間軸視圖', '所有日程安排': '所有日程安排', '待办事项和截止日期': '待辦事項和截止日期', '旅行计划管理': '旅行計畫管理', '工作和个人项目': '工作和個人專案', '重要文档管理': '重要文件管理', 'ATLAS 对你的基本了解': 'ATLAS 對你的基本了解', '你的习惯、喜好和决策倾向': '你的習慣、喜好和決策傾向', '项目、职责和协作关系': '專案、職責和協作關係', '你的社交和职业关系': '你的社交和職業關係', '🧳 旅行规划': '🧳 旅行規劃', '智能旅行计划助手（MVP重点）': '智慧旅行計畫助手（MVP重點）', '📊 运行记录': '📊 執行記錄', '历史执行和审计日志': '歷史執行和稽核日誌', '🔧 Agent 能力': '🔧 Agent 能力', '了解每个 Agent 的权限': '了解每個 Agent 的權限', '✅ 动作中心': '✅ 動作中心', '待确认的行动提案': '待確認的行動提案' },
    en: { '统一时间线视图': 'Unified timeline', '所有日程安排': 'All schedules', '待办事项和截止日期': 'Tasks and deadlines', '旅行计划管理': 'Travel planning', '工作和个人项目': 'Work and personal projects', '重要文档管理': 'Important documents', 'ATLAS 对你的基本了解': 'What ATLAS knows about you', '你的习惯、喜好和决策倾向': 'Habits, preferences, and decisions', '项目、职责和协作关系': 'Projects, responsibilities, and collaboration', '你的社交和职业关系': 'Social and professional relationships', '🧳 旅行规划': '🧳 Travel planning', '智能旅行计划助手（MVP重点）': 'Intelligent travel assistant (MVP)', '📊 运行记录': '📊 Run history', '历史执行和审计日志': 'Execution and audit logs', '🔧 Agent 能力': '🔧 Agent capabilities', '了解每个 Agent 的权限': 'Understand each Agent permission', '✅ 动作中心': '✅ Action center', '待确认的行动提案': 'Actions awaiting confirmation' },
    ja: { '统一时间线视图': '統合タイムライン', '所有日程安排': 'すべての予定', '待办事项和截止日期': 'タスクと締め切り', '旅行计划管理': '旅行計画管理', '工作和个人项目': '仕事と個人プロジェクト', '重要文档管理': '重要なドキュメント', 'ATLAS 对你的基本了解': 'ATLAS が理解するあなた', '你的习惯、喜好和决策倾向': '習慣、好み、意思決定', '项目、职责和协作关系': 'プロジェクト、役割、協働', '你的社交和职业关系': '社会的・職業的な関係', '🧳 旅行规划': '🧳 旅行計画', '智能旅行计划助手（MVP重点）': 'インテリジェント旅行アシスタント', '📊 运行记录': '📊 実行履歴', '历史执行和审计日志': '実行履歴と監査ログ', '🔧 Agent 能力': '🔧 エージェント機能', '了解每个 Agent 的权限': '各エージェントの権限', '✅ 动作中心': '✅ アクションセンター', '待确认的行动提案': '確認待ちのアクション' },
    ko: { '统一时间线视图': '통합 타임라인', '所有日程安排': '모든 일정', '待办事项和截止日期': '작업과 마감일', '旅行计划管理': '여행 계획 관리', '工作和个人项目': '업무 및 개인 프로젝트', '重要文档管理': '중요 문서', 'ATLAS 对你的基本了解': 'ATLAS가 이해하는 나', '你的习惯、喜好和决策倾向': '습관, 선호와 의사결정', '项目、职责和协作关系': '프로젝트, 역할과 협업', '你的社交和职业关系': '사회 및 업무 관계', '🧳 旅行规划': '🧳 여행 계획', '智能旅行计划助手（MVP重点）': '지능형 여행 어시스턴트', '📊 运行记录': '📊 실행 기록', '历史执行和审计日志': '실행 기록 및 감사 로그', '🔧 Agent 能力': '🔧 에이전트 기능', '了解每个 Agent 的权限': '에이전트 권한 확인', '✅ 动作中心': '✅ 작업 센터', '待确认的行动提案': '확인 대기 작업' }
  };
  const replacements = commonCopy[currentLang] || {};
  Object.assign(replacements, detailedCopy[currentLang] || {});
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    const value = node.nodeValue.trim();
    const translated = replacements[value] || (pageTitles[currentLang] && pageTitles[currentLang][value]);
    if (translated) node.nodeValue = node.nodeValue.replace(value, translated);
  });
  document.querySelectorAll('.page-footer p').forEach((element) => {
    element.textContent = language.footer;
  });

  const productNav = document.querySelector('.product-nav');
  if (productNav && 'IntersectionObserver' in window) {
    const sectionLinks = [...productNav.querySelectorAll('a[href^="#"]')];
    const observedSections = sectionLinks
      .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
      .filter((item) => item.section);
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
      if (!visible) return;
      observedSections.forEach(({ link, section }) => {
        const active = section === visible.target;
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-28% 0px -62% 0px', threshold: [0, 0.2, 0.5] });
    observedSections.forEach(({ section }) => sectionObserver.observe(section));
  }
  if (productNav) {
    productNav.addEventListener('click', (event) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest('a[href^="#"]');
      if (!(link instanceof HTMLAnchorElement) || !productNav.contains(link)) return;
      const href = link.getAttribute('href');
      const section = href ? document.getElementById(href.slice(1)) : null;
      if (!href || !section) return;

      event.preventDefault();
      if (window.location.hash !== href) window.history.pushState(null, '', href);
      const top = section.getBoundingClientRect().top + window.scrollY - 132;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
      });
    });
    const updateProductNav = () => {
      productNav.classList.toggle('is-scrolled', window.scrollY > 0);
    };
    updateProductNav();
    window.addEventListener('scroll', updateProductNav, { passive: true });
  }

  const storySteps = [...document.querySelectorAll('.story-step')];
  const storyProgress = [...document.querySelectorAll('.story-progress span')];
  if (storySteps.length && storyProgress.length && 'IntersectionObserver' in window) {
    const storyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const activeIndex = Number(entry.target.getAttribute('data-story-step'));
        storySteps.forEach((step, index) => step.classList.toggle('is-active', index === activeIndex));
        storyProgress.forEach((item, index) => item.classList.toggle('is-active', index === activeIndex));
      });
    }, { rootMargin: '-35% 0px -45% 0px', threshold: 0 });
    storySteps.forEach((step) => storyObserver.observe(step));
  }

  const productStage = document.querySelector('.product-stage');
  if (productStage && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const stickyPanel = productStage.querySelector('.product-stage-inner');
    const updateStageProgress = () => {
      const rect = productStage.getBoundingClientRect();
      const isSticky = stickyPanel && getComputedStyle(stickyPanel).position === 'sticky';
      const stickyHeight = isSticky ? stickyPanel.offsetHeight : window.innerHeight;
      const stickyTop = isSticky ? parseFloat(getComputedStyle(stickyPanel).top) || 0 : 0;
      const travel = Math.max(productStage.offsetHeight - stickyHeight, 1);
      const progress = isSticky
        ? Math.min(Math.max((stickyTop - rect.top) / travel, 0), 1)
        : 1;
      productStage.style.setProperty('--stage-progress', progress.toFixed(3));
    };
    let stageUpdatePending = false;
    const scheduleStageUpdate = () => {
      if (stageUpdatePending) return;
      stageUpdatePending = true;
      window.requestAnimationFrame(() => {
        updateStageProgress();
        stageUpdatePending = false;
      });
    };
    updateStageProgress();
    window.addEventListener('scroll', scheduleStageUpdate, { passive: true });
    window.addEventListener('resize', scheduleStageUpdate);
  }

  const stageFeatures = [...document.querySelectorAll('.stage-feature')];
  stageFeatures.forEach((feature) => {
    const activateFeature = () => {
      stageFeatures.forEach((item) => {
        const active = item === feature;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-expanded', String(active));
      });
    };
    feature.addEventListener('click', activateFeature);
    feature.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      activateFeature();
    });
  });

  const legalFooterCopy = {
    'zh-cn': {
      region: '网站版权与备案信息',
      nav: '法律信息',
      privacy: '隐私政策',
      terms: '服务条款',
      copyright: '版权声明',
      rights: '保留所有权利。'
    },
    'zh-hk': {
      region: '網站版權與備案資訊',
      nav: '法律資訊',
      privacy: '隱私政策',
      terms: '服務條款',
      copyright: '版權聲明',
      rights: '保留所有權利。'
    },
    'zh-tw': {
      region: '網站版權與備案資訊',
      nav: '法律資訊',
      privacy: '隱私政策',
      terms: '服務條款',
      copyright: '版權聲明',
      rights: '保留所有權利。'
    },
    en: {
      region: 'Copyright and registration information',
      nav: 'Legal information',
      privacy: 'Privacy',
      terms: 'Terms',
      copyright: 'Copyright',
      rights: 'All rights reserved.'
    },
    ja: {
      region: '著作権および登録情報',
      nav: '法的情報',
      privacy: 'プライバシー',
      terms: '利用規約',
      copyright: '著作権',
      rights: 'All rights reserved.'
    },
    ko: {
      region: '저작권 및 등록 정보',
      nav: '법률 정보',
      privacy: '개인정보 처리방침',
      terms: '이용약관',
      copyright: '저작권',
      rights: 'All rights reserved.'
    }
  }[currentLang];

  if (!document.querySelector('.site-legal-footer') && !/^(test|debug)-/.test(slug)) {
    if (!document.querySelector('link[href*="site-legal-footer.css"]')) {
      const legalStyles = document.createElement('link');
      legalStyles.rel = 'stylesheet';
      legalStyles.href = 'assets/css/site-legal-footer.css?v=20261026b';
      document.head.appendChild(legalStyles);
    }

    const legalFooter = document.createElement('footer');
    legalFooter.className = 'site-legal-footer';
    const isAppPage = document.body.classList.contains('atlas-app-page') || /^(home|ask|memory|life|agents|settings)(-|$)/.test(slug) || slug === 'team';
    if (isAppPage) {
      legalFooter.classList.add('site-legal-dark');
    }
    legalFooter.setAttribute('aria-label', legalFooterCopy.region);

    const inner = document.createElement('div');
    inner.className = 'site-legal-inner';

    if (language && language.footer) {
      const tagline = document.createElement('p');
      tagline.className = 'site-legal-tagline';
      tagline.textContent = language.footer;
      inner.appendChild(tagline);
    }

    const primary = document.createElement('div');
    primary.className = 'site-legal-primary';

    const copyright = document.createElement('p');
    copyright.textContent = `© 2026 ATLAS. ${legalFooterCopy.rights}`;
    primary.appendChild(copyright);

    const legalLinks = document.createElement('nav');
    legalLinks.className = 'site-legal-links';
    legalLinks.setAttribute('aria-label', legalFooterCopy.nav);
    [
      ['privacy-policy.html', legalFooterCopy.privacy],
      ['terms.html', legalFooterCopy.terms],
      ['copyright.html', legalFooterCopy.copyright]
    ].forEach(([href, label]) => {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = label;
      legalLinks.appendChild(link);
    });
    primary.appendChild(legalLinks);
    inner.appendChild(primary);

    const registration = document.createElement('p');
    registration.className = 'site-legal-meta';
    registration.textContent = '沪ICP备20267238号-2 · wwwatlasai.com';
    inner.appendChild(registration);
    legalFooter.appendChild(inner);

    const existingPageFooter = document.querySelector('.page-footer');
    if (existingPageFooter) {
      existingPageFooter.replaceWith(legalFooter);
    } else {
      document.body.appendChild(legalFooter);
    }
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

  // 立即恢复高定深色/浅色主题偏好，避免闪烁
  try {
    const savedTheme = window.localStorage.getItem('atlas-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  } catch (_) {
    // ignore storage access errors
  }

  // 加载 ATLAS 动态 OS 核心状态层、全局 ⌘K 命令中心与高定交互引擎
  if (!/^(test|debug)-/.test(slug)) {
    if (!document.querySelector('link[href*="atlas-dynamic-os.css"]')) {
      const osStyles = document.createElement('link');
      osStyles.rel = 'stylesheet';
      osStyles.href = 'assets/css/atlas-dynamic-os.css?v=20261106c';
      document.head.appendChild(osStyles);
    }
    const loadInteractiveModules = () => {
      if (!document.querySelector('script[src*="atlas-command-palette.js"]')) {
        const cmdkScript = document.createElement('script');
        cmdkScript.src = 'assets/js/atlas-command-palette.js?v=20261106c';
        document.body.appendChild(cmdkScript);
      }
      if (!document.querySelector('script[src*="atlas-highcraft-ui.js"]')) {
        const hcScript = document.createElement('script');
        hcScript.src = 'assets/js/atlas-highcraft-ui.js?v=20261106c';
        document.body.appendChild(hcScript);
      }
      if (
        document.querySelector('[data-atlas-reflective-pass]') &&
        !document.querySelector('script[src*="atlas-reflective-pass.js"]')
      ) {
        const passScript = document.createElement('script');
        passScript.src = 'assets/js/atlas-reflective-pass.js?v=20261106c';
        document.body.appendChild(passScript);
      }
    };
    if (!window.AtlasOS && !document.querySelector('script[src*="atlas-os-state.js"]')) {
      const stateScript = document.createElement('script');
      stateScript.src = 'assets/js/atlas-os-state.js?v=20261106c';
      stateScript.onload = loadInteractiveModules;
      document.body.appendChild(stateScript);
    } else {
      loadInteractiveModules();
    }
  }

  console.log('✅ ATLAS Shell initialized');

})(window, document);
