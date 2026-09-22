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

  const localeFromPage = page.includes('-en.html') ? 'en' :
    page.includes('-hk.html') ? 'zh-hk' :
    page.includes('-tw.html') ? 'zh-tw' :
    page.includes('-ja.html') ? 'ja' :
    page.includes('-ko.html') ? 'ko' : 'zh-cn';
  const supportedLocales = ['zh-cn', 'zh-hk', 'zh-tw', 'en', 'ja', 'ko'];
  const requestedLocale = new URLSearchParams(window.location.search).get('lang');
  const storedLocale = window.localStorage.getItem('atlas-locale');
  const currentLang = supportedLocales.includes(requestedLocale) ? requestedLocale :
    supportedLocales.includes(storedLocale) ? storedLocale : localeFromPage;
  window.localStorage.setItem('atlas-locale', currentLang);
  document.documentElement.lang = currentLang === 'zh-cn' ? 'zh-CN' :
    currentLang === 'zh-hk' ? 'zh-HK' :
    currentLang === 'zh-tw' ? 'zh-TW' : currentLang;

  const navLabels = {
    'zh-cn': ['首页', '工作台', '询问', '记忆', '生活', '智能体', '设置'],
    'zh-hk': ['首頁', '工作台', '查詢', '記憶', '生活', '智能體', '設定'],
    'zh-tw': ['首頁', '工作台', '詢問', '記憶', '生活', '智能體', '設定'],
    en: ['Home', 'Dashboard', 'Ask', 'Memory', 'Life', 'Agents', 'Settings'],
    ja: ['ホーム', 'ダッシュボード', '質問', 'メモリ', '生活', 'エージェント', '設定'],
    ko: ['홈', '대시보드', '질문', '메모리', '생활', '에이전트', '설정']
  };
  const navHrefs = currentLang === 'en'
    ? ['index-en.html', 'home.html', 'ask.html', 'memory.html', 'life.html', 'agents.html', 'settings.html']
    : ['index.html', 'home.html', 'ask.html', 'memory.html', 'life.html', 'agents.html', 'settings.html'];
  const links = navHrefs.map((href, index) => ({ href, label: navLabels[currentLang][index] }));

  const localeText = {
    'zh-cn': {
      online: '系统在线', login: '登录', region: '地区', home: '首页',
      footer: 'Personal Intelligence OS · 由 ATLAS 驱动',
      pages: {
        home: ['个人工作台', '把任务、日程和智能建议集中在一个清晰的行动面板'],
        ask: ['询问 ATLAS', '把问题交给你的个人智能助手'],
        memory: ['记忆', 'ATLAS 对你的理解：事实、偏好、经历与推断'],
        life: ['生活', '日历、任务、项目、文档和行程的统一视图'],
        agents: ['智能体', 'Agent 能力、权限、运行记录和待确认动作'],
        settings: ['设置', '个人资料、隐私控制、Demo 配置和执行规则']
      }
    },
    'zh-hk': {
      online: '系統在線', login: '登入', region: '地區', home: '首頁',
      footer: 'Personal Intelligence OS · 由 ATLAS 驅動',
      pages: {
        home: ['個人工作台', '將任務、日程和智能建議集中在清晰的行動面板'],
        ask: ['查詢 ATLAS', '將問題交給你的個人智能助手'],
        memory: ['記憶', 'ATLAS 對你的理解：事實、偏好、經歷與推斷'],
        life: ['生活', '日曆、任務、項目、文件和行程的統一視圖'],
        agents: ['智能體', 'Agent 能力、權限、運行記錄和待確認動作'],
        settings: ['設定', '個人資料、私隱控制、Demo 配置和執行規則']
      }
    },
    'zh-tw': {
      online: '系統在線', login: '登入', region: '地區', home: '首頁',
      footer: 'Personal Intelligence OS · 由 ATLAS 驅動',
      pages: {
        home: ['個人工作台', '將任務、日程和智慧建議集中在清晰的行動面板'],
        ask: ['詢問 ATLAS', '把問題交給你的個人智慧助手'],
        memory: ['記憶', 'ATLAS 對你的理解：事實、偏好、經歷與推論'],
        life: ['生活', '日曆、任務、專案、文件和行程的統一視圖'],
        agents: ['智慧體', 'Agent 能力、權限、執行記錄和待確認動作'],
        settings: ['設定', '個人資料、隱私控制、Demo 配置和執行規則']
      }
    },
    en: {
      online: 'System online', login: 'Sign in', region: 'Region', home: 'Home',
      footer: 'Personal Intelligence OS · Powered by ATLAS',
      pages: {
        home: ['Personal dashboard', 'Tasks, schedules, and intelligent suggestions in one clear action panel'],
        ask: ['Ask ATLAS', 'Give your questions to your personal intelligent assistant'],
        memory: ['Memory', 'How ATLAS understands you: facts, preferences, experiences, and inferences'],
        life: ['Life', 'One view for your calendar, tasks, projects, documents, and trips'],
        agents: ['Agents', 'Agent capabilities, permissions, runs, and actions awaiting confirmation'],
        settings: ['Settings', 'Profile, privacy controls, demo configuration, and execution rules']
      }
    },
    ja: {
      online: 'システム稼働中', login: 'ログイン', region: '地域', home: 'ホーム',
      footer: 'Personal Intelligence OS · ATLAS が提供',
      pages: {
        home: ['パーソナルダッシュボード', 'タスク、予定、インテリジェントな提案を一つの画面に'],
        ask: ['ATLAS に質問', 'パーソナルインテリジェントアシスタントに質問する'],
        memory: ['メモリ', 'ATLAS のあなたへの理解：事実、好み、経験、推論'],
        life: ['生活', 'カレンダー、タスク、プロジェクト、書類、旅行を一つの画面で'],
        agents: ['エージェント', 'エージェントの機能、権限、実行履歴、確認待ちの操作'],
        settings: ['設定', 'プロフィール、プライバシー、デモ設定、実行ルール']
      }
    },
    ko: {
      online: '시스템 온라인', login: '로그인', region: '지역', home: '홈',
      footer: 'Personal Intelligence OS · ATLAS 제공',
      pages: {
        home: ['개인 대시보드', '작업, 일정, 지능형 제안을 하나의 명확한 화면에서 관리'],
        ask: ['ATLAS에 질문', '개인 지능형 어시스턴트에게 질문하기'],
        memory: ['메모리', 'ATLAS가 이해하는 나: 사실, 선호, 경험, 추론'],
        life: ['생활', '캘린더, 작업, 프로젝트, 문서와 여행을 한눈에'],
        agents: ['에이전트', '에이전트 기능, 권한, 실행 기록, 확인 대기 작업'],
        settings: ['설정', '프로필, 개인정보 보호, 데모 구성 및 실행 규칙']
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
          <span class="atlas-system-status"><i></i>${language.online}</span>
          <a class="atlas-login-link" href="login.html">${language.login}</a>
          <!-- 地区选择 -->
          <div class="region-selector">
            <button class="region-btn" id="regionBtn">
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
      regionDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      regionDropdown.classList.remove('show');
    });

    regionDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  const pageHeaders = {
    'zh-cn': {
      life: ['统一上下文', '生活', '日历、任务、项目、文档和行程的统一视图'],
      memory: ['个人知识', '记忆', 'ATLAS 对你的理解：事实、偏好、经历与推断'],
      agents: ['受控自动化', '智能体', 'Agent 能力、权限、运行记录和待确认动作'],
      settings: ['用户控制', '设置', '个人资料、隐私控制、Demo 配置和执行规则'],
      ask: ['个人智能助手', '询问 ATLAS', '把问题交给你的个人智能助手']
    },
    'zh-hk': {
      life: ['統一上下文', '生活', '日曆、任務、項目、文件和行程的統一視圖'],
      memory: ['個人知識', '記憶', 'ATLAS 對你的理解：事實、偏好、經歷與推斷'],
      agents: ['受控自動化', '智能體', 'Agent 能力、權限、運行記錄和待確認動作'],
      settings: ['用戶控制', '設定', '個人資料、私隱控制、Demo 配置和執行規則'],
      ask: ['個人智能助手', '查詢 ATLAS', '將問題交給你的個人智能助手']
    },
    'zh-tw': {
      life: ['統一上下文', '生活', '日曆、任務、專案、文件和行程的統一視圖'],
      memory: ['個人知識', '記憶', 'ATLAS 對你的理解：事實、偏好、經歷與推論'],
      agents: ['受控自動化', '智慧體', 'Agent 能力、權限、執行記錄和待確認動作'],
      settings: ['使用者控制', '設定', '個人資料、隱私控制、Demo 配置和執行規則'],
      ask: ['個人智慧助手', '詢問 ATLAS', '把問題交給你的個人智慧助手']
    },
    en: {
      life: ['Unified context', 'Life', 'One view for your calendar, tasks, projects, documents, and trips'],
      memory: ['Personal knowledge', 'Memory', 'How ATLAS understands you: facts, preferences, experiences, and inferences'],
      agents: ['Controlled automation', 'Agents', 'Agent capabilities, permissions, runs, and actions awaiting confirmation'],
      settings: ['User controls', 'Settings', 'Profile, privacy controls, demo configuration, and execution rules'],
      ask: ['Personal intelligence', 'Ask ATLAS', 'Give your questions to your personal intelligent assistant']
    },
    ja: {
      life: ['統合コンテキスト', '生活', 'カレンダー、タスク、プロジェクト、書類、旅行を一つの画面で'],
      memory: ['パーソナルナレッジ', 'メモリ', 'ATLAS のあなたへの理解：事実、好み、経験、推論'],
      agents: ['制御された自動化', 'エージェント', 'エージェントの機能、権限、実行履歴、確認待ちの操作'],
      settings: ['ユーザー管理', '設定', 'プロフィール、プライバシー、デモ設定、実行ルール'],
      ask: ['パーソナルインテリジェンス', 'ATLAS に質問', 'パーソナルアシスタントに質問する']
    },
    ko: {
      life: ['통합 컨텍스트', '생활', '캘린더, 작업, 프로젝트, 문서와 여행을 한눈에'],
      memory: ['개인 지식', '메모리', 'ATLAS가 이해하는 나: 사실, 선호, 경험, 추론'],
      agents: ['제어된 자동화', '에이전트', '에이전트 기능, 권한, 실행 기록, 확인 대기 작업'],
      settings: ['사용자 제어', '설정', '프로필, 개인정보 보호, 데모 구성 및 실행 규칙'],
      ask: ['개인 지능', 'ATLAS에 질문', '개인 지능형 어시스턴트에게 질문하기']
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
