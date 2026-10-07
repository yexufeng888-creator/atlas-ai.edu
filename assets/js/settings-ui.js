(function () {
  'use strict';

  const storageKey = 'atlas_settings_state_v1';
  const page = document.body.className.match(/\bpage-(settings(?:-[a-z-]+)?)\b/)?.[1] || 'settings';
  const locale = window.localStorage.getItem('atlas-locale') || 'zh-cn';
  const navLabels = {
    'zh-cn': ['设置总览', '个人资料', '隐私控制', '执行规则', '外观设置', 'Demo 配置'],
    'zh-hk': ['設定總覽', '個人資料', '私隱控制', '執行規則', '外觀設定', 'Demo 配置'],
    'zh-tw': ['設定總覽', '個人資料', '隱私控制', '執行規則', '外觀設定', 'Demo 配置'],
    en: ['Overview', 'Profile', 'Privacy', 'Execution', 'Appearance', 'Demo'],
    ja: ['設定概要', 'プロフィール', 'プライバシー', '実行ルール', '外観設定', 'Demo 設定'],
    ko: ['설정 개요', '프로필', '개인정보 보호', '실행 규칙', '화면 설정', 'Demo 구성']
  };
  const demoExitLabels = {
    'zh-cn': ['退出演示模式', '重新开启演示模式'],
    'zh-hk': ['退出演示模式', '重新開啟演示模式'],
    'zh-tw': ['退出演示模式', '重新開啟演示模式'],
    en: ['Exit demo mode', 'Resume demo mode'],
    ja: ['デモモードを終了', 'デモモードを再開'],
    ko: ['데모 모드 종료', '데모 모드 다시 시작']
  };
  const accentLabels = {
    'zh-cn': ['蓝色', '紫色', '绿色', '琥珀色'],
    'zh-hk': ['藍色', '紫色', '綠色', '琥珀色'],
    'zh-tw': ['藍色', '紫色', '綠色', '琥珀色'],
    en: ['Blue', 'Violet', 'Green', 'Amber'],
    ja: ['青', '紫', '緑', '琥珀色'],
    ko: ['파랑', '보라', '초록', '호박색']
  };
  const densitySuffix = { 'zh-cn': '密度', 'zh-hk': '密度', 'zh-tw': '密度', en: ' density', ja: '密度', ko: ' 밀도' };
  const defaults = {
    theme: 'dark',
    accent: 'blue',
    density: 'standard',
    execution: 'medium',
    accountStatus: 'active',
    demoEnabled: true,
    twoFactor: true,
    plan: 'pro',
    profile: { displayName: '演示用户', email: 'demo@atlas.com', phone: '138****8888' },
    privacy: {
      analytics: true,
      errors: true,
      performance: true,
      recommendations: true,
      apiAccess: false,
      dataSharing: false,
      apps: { calendar: true, drive: true, notion: true }
    },
    demo: { scenario: '产品经理', memories: 48, tasks: 23, documents: 156, chats: 89 }
  };
  let state;
  let toastTimer;

  function readState() {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return structuredClone(defaults);
    const parsed = JSON.parse(saved);
    return {
      ...structuredClone(defaults),
      ...parsed,
      profile: { ...defaults.profile, ...parsed.profile },
      privacy: {
        ...defaults.privacy,
        ...parsed.privacy,
        apps: { ...defaults.privacy.apps, ...parsed.privacy?.apps }
      },
      demo: { ...defaults.demo, ...parsed.demo }
    };
  }

  function saveState() {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function notify(message) {
    let toast = document.querySelector('.settings-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'settings-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3200);
  }

  function closeDialog(dialog) {
    dialog.close();
    dialog.remove();
  }

  function openDialog({ title, description, fields = [], submitLabel = '保存', danger = false, onSubmit }) {
    const dialog = document.createElement('dialog');
    dialog.className = 'settings-dialog';
    dialog.setAttribute('aria-labelledby', 'settings-dialog-title');
    const form = document.createElement('form');
    form.method = 'dialog';
    const heading = document.createElement('h2');
    heading.id = 'settings-dialog-title';
    heading.textContent = title;
    form.append(heading);
    if (description) {
      const copy = document.createElement('p');
      copy.textContent = description;
      form.append(copy);
    }

    fields.forEach((field) => {
      const label = document.createElement('label');
      label.textContent = field.label;
      const input = document.createElement(field.type === 'select' ? 'select' : 'input');
      input.name = field.name;
      if (field.type === 'select') {
        field.options.forEach((option) => {
          const optionElement = document.createElement('option');
          optionElement.value = option.value;
          optionElement.textContent = option.label;
          input.append(optionElement);
        });
        input.value = field.value;
      } else {
        input.type = field.type || 'text';
        if (field.type === 'checkbox') {
          input.checked = Boolean(field.value);
        } else {
          input.value = field.value ?? '';
          input.required = Boolean(field.required);
          if (field.autocomplete) input.autocomplete = field.autocomplete;
          if (field.placeholder) input.placeholder = field.placeholder;
        }
      }
      label.append(input);
      form.append(label);
    });

    const actions = document.createElement('div');
    actions.className = 'settings-dialog-actions';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = '取消';
    cancel.addEventListener('click', () => closeDialog(dialog));
    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = `settings-primary${danger ? ' settings-danger' : ''}`;
    submit.textContent = submitLabel;
    actions.append(cancel, submit);
    form.append(actions);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form).entries());
      form.querySelectorAll('input[type="checkbox"]').forEach((input) => {
        values[input.name] = input.checked;
      });
      if (onSubmit(values) !== false) closeDialog(dialog);
    });
    dialog.append(form);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener('close', () => dialog.remove(), { once: true });
    document.body.append(dialog);
    dialog.showModal();
    form.querySelector('input, select, button')?.focus();
    return dialog;
  }

  function addSettingsNavigation() {
    const container = document.querySelector('.content-container');
    const header = container?.querySelector('.page-header');
    if (!container || !header) return;
    const links = [
      ['settings.html', 'settings'],
      ['settings-profile.html', 'settings-profile'],
      ['settings-privacy.html', 'settings-privacy'],
      ['settings-execution.html', 'settings-execution'],
      ['settings-appearance.html', 'settings-appearance'],
      ['settings-demo.html', 'settings-demo']
    ];
    const nav = document.createElement('nav');
    nav.className = 'settings-subnav';
    nav.setAttribute('aria-label', '设置页面导航');
    const indicator = document.createElement('span');
    indicator.className = 'settings-glass-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    nav.append(indicator);
    const navLinks = [];
    links.forEach(([href, slug], index) => {
      const link = document.createElement('a');
      link.className = 'settings-nav-link';
      link.href = href;
      link.textContent = (navLabels[locale] || navLabels['zh-cn'])[index];
      if (page === slug) {
        link.setAttribute('aria-current', 'page');
        link.dataset.active = 'true';
      }
      nav.append(link);
      navLinks.push(link);
    });
    header.after(nav);

    const moveIndicator = (link) => {
      if (!link) return;
      indicator.style.width = `${link.offsetWidth}px`;
      indicator.style.height = `${link.offsetHeight}px`;
      indicator.style.transform = `translate3d(${link.offsetLeft}px, ${link.offsetTop}px, 0)`;
      indicator.style.opacity = '1';
    };
    const activeLink = navLinks.find((link) => link.dataset.active === 'true') || navLinks[0];
    navLinks.forEach((link) => {
      link.addEventListener('pointerenter', () => moveIndicator(link));
      link.addEventListener('focus', () => moveIndicator(link));
      link.addEventListener('click', () => moveIndicator(link));
    });
    nav.addEventListener('pointerleave', () => {
      if (!nav.contains(document.activeElement)) moveIndicator(activeLink);
    });
    nav.addEventListener('focusout', (event) => {
      if (!nav.contains(event.relatedTarget)) moveIndicator(activeLink);
    });

    const positionActiveIndicator = (scrollActiveLink = false) => {
      moveIndicator(activeLink);
      if (scrollActiveLink && activeLink) {
        const centeredOffset = activeLink.offsetLeft - (nav.clientWidth - activeLink.offsetWidth) / 2;
        nav.scrollTo({
          left: Math.max(0, Math.min(centeredOffset, nav.scrollWidth - nav.clientWidth)),
          behavior: 'smooth'
        });
      }
    };
    positionActiveIndicator(true);
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(() => positionActiveIndicator());
      observer.observe(nav);
    } else {
      window.addEventListener('resize', () => positionActiveIndicator(), { passive: true });
    }
  }

  function syncButtonGroup(buttons, selectedIndex) {
    buttons.forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === selectedIndex));
      button.type = 'button';
    });
  }

  function buttonLabel(button) {
    return button.querySelector('div:last-child')?.textContent.trim() || button.textContent.trim();
  }

  function updateInfoValue(sectionIndex, rowIndex, value) {
    const section = document.querySelectorAll('.memory-sections > .section-card')[sectionIndex];
    const valueNode = section?.querySelectorAll('.info-item .info-value')[rowIndex];
    if (valueNode) valueNode.textContent = value;
  }

  function applyState() {
    const theme = state.theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
      : state.theme;
    document.body.classList.toggle('atlas-settings-light', theme === 'light');
    document.documentElement.style.setProperty('--settings-accent', state.accent === 'violet' ? '#b38bff' : state.accent === 'green' ? '#53d6ad' : state.accent === 'amber' ? '#ffb86b' : '#63a4ff');
    document.documentElement.style.setProperty('--settings-accent-rgb', state.accent === 'violet' ? '179, 139, 255' : state.accent === 'green' ? '83, 214, 173' : state.accent === 'amber' ? '255, 184, 107' : '99, 164, 255');
    document.body.classList.remove('atlas-settings-compact', 'atlas-settings-spacious');
    if (state.density !== 'standard') document.body.classList.add(`atlas-settings-${state.density}`);
    document.querySelectorAll('.settings-theme-options button').forEach((button, index) => {
      button.setAttribute('aria-pressed', String(['light', 'dark', 'system'][index] === state.theme));
    });
    document.querySelectorAll('.settings-accent-options button').forEach((button, index) => {
      button.setAttribute('aria-pressed', String(['blue', 'violet', 'green', 'amber'][index] === state.accent));
    });
    document.querySelectorAll('.settings-density-options button').forEach((button, index) => {
      button.setAttribute('aria-pressed', String(['compact', 'standard', 'spacious'][index] === state.density));
    });
    const themeSummary = document.querySelector('.settings-theme-summary');
    if (themeSummary) {
      const activeThemeButton = document.querySelector('.settings-theme-options button[aria-pressed="true"]');
      const activeTheme = activeThemeButton && buttonLabel(activeThemeButton);
      const prefix = themeSummary.textContent.match(/^(.+?[:：]\s*)/)?.[1] || '当前使用：';
      if (activeTheme) themeSummary.textContent = prefix + activeTheme;
    }
    const densitySummary = document.querySelector('.settings-density-summary');
    if (densitySummary) {
      const activeDensityButton = document.querySelector('.settings-density-options button[aria-pressed="true"]');
      const activeDensity = activeDensityButton && buttonLabel(activeDensityButton);
      const prefix = densitySummary.textContent.match(/^(.+?[:：]\s*)/)?.[1] || '当前使用：';
      if (activeDensity) densitySummary.textContent = `${prefix}${activeDensity}${densitySuffix[locale] || densitySuffix['zh-cn']}`;
    }
    const accentSummary = document.querySelector('.settings-accent-summary');
    if (accentSummary) {
      const activeAccent = document.querySelector('.settings-accent-options button[aria-pressed="true"]')?.getAttribute('aria-label');
      const prefix = accentSummary.textContent.match(/^(.+?[:：]\s*)/)?.[1] || '当前使用：';
      if (activeAccent) accentSummary.textContent = `${prefix}${activeAccent}渐变`;
    }
    if (page === 'settings-profile') {
      updateInfoValue(0, 1, state.profile.displayName);
      updateInfoValue(0, 2, state.profile.email);
      updateInfoValue(0, 3, state.profile.phone);
      updateInfoValue(2, 1, state.twoFactor ? '✓ 已启用' : '✕ 未启用');
      updateInfoValue(4, 0, { free: 'Free 免费版', pro: 'Pro 专业版', team: 'Team 团队版' }[state.plan] || 'Pro 专业版');
      updateInfoValue(4, 1, {
        active: '✓ 活跃',
        inactive: '✕ 已停用（本地演示）',
        'deleted-demo': '本地演示资料已清除'
      }[state.accountStatus] || '✓ 活跃');
    }
    if (page === 'settings-privacy') {
      updateInfoValue(3, 0, `${Object.values(state.privacy.apps).filter(Boolean).length} 个`);
      updateInfoValue(3, 1, state.privacy.apiAccess ? '✓ 已启用' : '✕ 未启用');
      updateInfoValue(3, 2, state.privacy.dataSharing ? '✓ 已允许' : '✕ 未允许');
    }
    if (page === 'settings-demo') {
      updateInfoValue(0, 0, `${state.demo.scenario}${state.demoEnabled ? ' · 已加载' : ' · 已暂停'}`);
      updateInfoValue(1, 0, `${state.demo.memories} 条`);
      updateInfoValue(1, 1, `${state.demo.tasks} 条`);
      updateInfoValue(1, 2, `${state.demo.documents} 份`);
      updateInfoValue(1, 3, `${state.demo.chats} 条`);
      const status = document.querySelector('.demo-mode-status');
      if (status) status.textContent = state.demoEnabled ? '当前处于演示模式' : '演示模式已暂停';
      const exitButton = document.querySelector('.page-body > div:last-child > button');
      if (exitButton) exitButton.textContent = (demoExitLabels[locale] || demoExitLabels['zh-cn'])[state.demoEnabled ? 0 : 1];
    }
  }

  function exportSettings() {
    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: state.profile,
      appearance: { theme: state.theme, accent: state.accent, density: state.density },
      privacy: state.privacy,
      execution: state.execution,
      demo: state.demo
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'atlas-settings-export.json';
    anchor.hidden = true;
    document.body.append(anchor);
    anchor.click();
    window.setTimeout(() => {
      anchor.remove();
      URL.revokeObjectURL(url);
    }, 1000);
    notify('设置数据已导出为 JSON 文件。');
  }

  function profileAction(action) {
    if (action === 0) {
      openDialog({
        title: '编辑个人资料',
        description: '更新的信息保存在此浏览器的本地演示设置中。',
        fields: [
          { name: 'displayName', label: '显示名称', value: state.profile.displayName, required: true },
          { name: 'email', label: '邮箱地址', type: 'email', value: state.profile.email, required: true },
          { name: 'phone', label: '手机号码', value: state.profile.phone }
        ],
        onSubmit: (values) => {
          state.profile = { ...state.profile, ...values };
          saveState();
          applyState();
          notify('个人资料已保存到本地。');
        }
      });
    } else if (action === 1) {
      openDialog({
        title: '账户安全',
        description: '这里是本地演示设置；实际密码和设备管理需连接账户服务。',
        fields: [
          { name: 'twoFactor', label: '启用双因素认证', type: 'checkbox', value: state.twoFactor },
          { name: 'password', label: '设置新密码（仅演示）', type: 'password', autocomplete: 'new-password', placeholder: '至少 8 个字符' }
        ],
        onSubmit: (values) => {
          if (values.password && String(values.password).length < 8) {
            notify('演示密码至少需要 8 个字符。');
            return false;
          }
          state.twoFactor = Boolean(values.twoFactor);
          saveState();
          applyState();
          notify('安全偏好已保存；密码未发送到任何服务。');
        }
      });
    } else if (action === 2) {
      openDialog({
        title: '订阅计划',
        description: '当前展示的是演示订阅信息。此站点尚未连接支付服务，升级不会产生扣款。',
        fields: [{ name: 'plan', label: '选择计划', type: 'select', value: 'pro', options: [
          { value: 'free', label: 'Free · 免费' },
          { value: 'pro', label: 'Pro · ¥99/月' },
          { value: 'team', label: 'Team · 联系销售' }
        ] }],
        submitLabel: '保存演示选择',
        onSubmit: (values) => {
          state.plan = values.plan;
          saveState();
          notify('已记录本地演示计划选择；未创建订阅或扣款。');
        }
      });
    } else if (action === 3) {
      exportSettings();
    } else if (action === 4) {
      openDialog({
        title: '停用演示账户',
        description: '停用只会记录在当前浏览器，不会注销服务器账户。',
        submitLabel: '确认停用',
        onSubmit: () => {
          state.accountStatus = 'inactive';
          saveState();
          applyState();
          notify('已将演示账户标记为停用。');
        }
      });
    } else if (action === 5) {
      openDialog({
        title: '删除本地演示资料',
        description: '输入 DELETE 确认清除本页面保存的演示资料。此操作不会删除服务器账户。',
        fields: [{ name: 'confirmation', label: '输入 DELETE 继续', required: true }],
        submitLabel: '清除本地资料',
        danger: true,
        onSubmit: (values) => {
          if (values.confirmation !== 'DELETE') {
            notify('确认文字不匹配，资料未清除。');
            return false;
          }
          state = structuredClone(defaults);
          state.accountStatus = 'deleted-demo';
          saveState();
          applyState();
          notify('本地演示资料已清除；服务器账户未受影响。');
        }
      });
    }
  }

  function privacyAction() {
    openDialog({
      title: '第三方访问与授权',
      description: '选择保留的演示授权。更改仅保存在本地，不会连接第三方服务。',
      fields: [
        { name: 'calendar', label: '保留日历应用授权', type: 'checkbox', value: state.privacy.apps.calendar },
        { name: 'drive', label: '保留云端硬盘授权', type: 'checkbox', value: state.privacy.apps.drive },
        { name: 'notion', label: '保留 Notion 应用授权', type: 'checkbox', value: state.privacy.apps.notion },
        { name: 'apiAccess', label: '允许 API 访问', type: 'checkbox', value: state.privacy.apiAccess },
        { name: 'dataSharing', label: '允许数据共享', type: 'checkbox', value: state.privacy.dataSharing }
      ],
      onSubmit: (values) => {
        state.privacy.apps = { calendar: Boolean(values.calendar), drive: Boolean(values.drive), notion: Boolean(values.notion) };
        state.privacy.apiAccess = Boolean(values.apiAccess);
        state.privacy.dataSharing = Boolean(values.dataSharing);
        saveState();
        applyState();
        notify('隐私偏好已保存在本地。');
      }
    });
  }

  function setExecutionMode(mode, buttons, selectedIndex) {
    state.execution = mode;
    saveState();
    syncButtonGroup(buttons, selectedIndex);
    const summary = document.querySelector('.execution-mode-summary');
    if (summary) {
      summary.dataset.mode = ['manual', 'medium', 'full'][selectedIndex];
      const prefix = summary.textContent.match(/^(.+?[:：]\s*)/)?.[1] || '当前设置：';
      summary.textContent = prefix + (buttons[selectedIndex]?.textContent.trim() || '');
    }
    notify('本地演示自动化级别已保存；真实 Agent 权限未更改。');
  }

  function setupExecution() {
    const buttons = [...document.querySelectorAll('.page-content button')].slice(0, 3);
    const mode = { manual: 0, medium: 1, full: 2 }[state.execution] ?? 1;
    const paragraph = document.querySelector('.page-content h3')?.parentElement?.querySelector('p');
    if (paragraph) paragraph.classList.add('execution-mode-summary');
    syncButtonGroup(buttons, mode);
    if (paragraph) {
      const prefix = paragraph.textContent.match(/^(.+?[:：]\s*)/)?.[1] || '当前设置：';
      paragraph.textContent = prefix + (buttons[mode] ? buttonLabel(buttons[mode]) : '');
    }
    buttons.forEach((button, index) => button.addEventListener('click', () => {
      setExecutionMode(['manual', 'medium', 'full'][index], buttons, index);
    }));
  }

  function setupAppearance() {
    const cards = [...document.querySelectorAll('.memory-sections > .section-card')];
    const themeButtons = [...(cards[0]?.querySelectorAll('button') || [])];
    const accentButtons = [...(cards[1]?.querySelectorAll('button') || [])];
    const densityButtons = [...(cards[4]?.querySelectorAll('button') || [])];
    const themeSummary = cards[0]?.querySelector('p');
    const densitySummary = cards[4]?.querySelector('p');
    themeButtons.forEach((button) => button.classList.add('settings-theme-option'));
    accentButtons.forEach((button, index) => {
      button.classList.add('settings-accent-swatch');
      button.setAttribute('aria-label', (accentLabels[locale] || accentLabels['zh-cn'])[index]);
    });
    if (cards[0]) cards[0].classList.add('settings-theme-options');
    if (cards[1]) cards[1].classList.add('settings-accent-options');
    if (cards[4]) cards[4].classList.add('settings-density-options');
    if (themeSummary) themeSummary.classList.add('settings-theme-summary');
    const accentSummary = cards[1]?.querySelector('p');
    if (accentSummary) accentSummary.classList.add('settings-accent-summary');
    if (densitySummary) densitySummary.classList.add('settings-density-summary');
    themeButtons.forEach((button, index) => button.addEventListener('click', () => {
      state.theme = ['light', 'dark', 'system'][index];
      saveState();
      applyState();
      notify('主题偏好已保存。');
    }));
    accentButtons.forEach((button, index) => button.addEventListener('click', () => {
      state.accent = ['blue', 'violet', 'green', 'amber'][index];
      saveState();
      applyState();
      notify('主题色已更新。');
    }));
    densityButtons.forEach((button, index) => button.addEventListener('click', () => {
      state.density = ['compact', 'standard', 'spacious'][index];
      saveState();
      applyState();
      notify('布局密度已更新。');
    }));
    const advancedButton = document.querySelector('.page-body > div:last-child button');
    advancedButton?.addEventListener('click', () => openDialog({
          title: '高级外观偏好',
          description: '选项立即应用到当前设置页面，并保存在此浏览器。',
          fields: [
            { name: 'density', label: '布局密度', type: 'select', value: state.density, options: [
              { value: 'compact', label: '紧凑' },
              { value: 'standard', label: '标准' },
              { value: 'spacious', label: '宽松' }
            ] },
            { name: 'theme', label: '主题模式', type: 'select', value: state.theme, options: [
              { value: 'light', label: '明亮模式' },
              { value: 'dark', label: '深色模式' },
              { value: 'system', label: '跟随系统' }
            ] }
          ],
          onSubmit: (values) => {
            state.density = values.density;
            state.theme = values.theme;
            saveState();
            applyState();
            notify('高级外观偏好已保存。');
          }
        }));
  }

  function setupProfile() {
    const buttons = [...document.querySelectorAll('.page-content button')];
    buttons.forEach((button, index) => button.addEventListener('click', () => profileAction(index)));
  }

  function setupPrivacy() {
    document.querySelector('.page-content button')?.addEventListener('click', privacyAction);
  }

  function updateDemoScenario(scenario) {
    state.demo.scenario = scenario;
    saveState();
    applyState();
    document.querySelectorAll('.tag-list button').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.textContent.trim() === scenario));
    });
    notify(`已切换到“${scenario}”演示场景。`);
  }

  function setupDemo() {
    const buttons = [...document.querySelectorAll('.page-content button')];
    document.querySelector('.page-body > div[style] h3')?.classList.add('demo-mode-status');
    buttons.forEach((button, index) => {
      button.type = 'button';
      if (index === 0) {
        button.addEventListener('click', () => openDialog({
          title: '切换演示场景',
          description: '切换后仅更新本地演示状态。',
          fields: [{ name: 'scenario', label: '演示场景', type: 'select', value: state.demo.scenario, options: [
            '产品经理', '软件工程师', '设计师', '学生', '创业者', '自由职业者'
          ].map((scenario) => ({ value: scenario, label: scenario })) }],
          submitLabel: '切换场景',
          onSubmit: (values) => updateDemoScenario(values.scenario)
        }));
      } else if (index === 1) {
        button.addEventListener('click', () => {
          state.demo = structuredClone(defaults.demo);
          state.demoEnabled = true;
          saveState();
          applyState();
          notify('演示数据已恢复到初始状态。');
        });
      } else if (index === 2) {
        button.addEventListener('click', () => {
          state.demo.memories = Math.floor(Math.random() * 90) + 10;
          state.demo.tasks = Math.floor(Math.random() * 45) + 5;
          state.demo.documents = Math.floor(Math.random() * 250) + 20;
          state.demo.chats = Math.floor(Math.random() * 150) + 10;
          saveState();
          applyState();
          notify('已生成一组随机演示数据。');
        });
      } else if (index === 3) {
        button.addEventListener('click', () => {
          const filePicker = document.createElement('input');
          filePicker.type = 'file';
          filePicker.accept = 'application/json,.json';
          filePicker.addEventListener('change', async () => {
            const file = filePicker.files?.[0];
            if (!file) return;
            let imported;
            try {
              imported = JSON.parse(await file.text());
            } catch (error) {
              notify(`JSON 文件无法解析：${error instanceof Error ? error.message : String(error)}`);
              return;
            }
            const counts = imported.demo || imported;
            const keys = ['memories', 'tasks', 'documents', 'chats'];
            if (!imported || typeof imported !== 'object' || Array.isArray(imported) ||
                !counts || typeof counts !== 'object' ||
                keys.some((key) => !Number.isInteger(Number(counts[key])) || Number(counts[key]) < 0)) {
              notify('文件格式不正确，需要 memories、tasks、documents、chats 四个非负数字字段。');
              return;
            }
            state.demo = { ...state.demo, ...Object.fromEntries(keys.map((key) => [key, Number(counts[key])])) };
            saveState();
            applyState();
            notify('演示数据已从 JSON 导入。');
          });
          filePicker.click();
        });
      } else if (index === 4) {
        button.addEventListener('click', () => {
          const wasEnabled = state.demoEnabled;
          state.demoEnabled = !state.demoEnabled;
          if (wasEnabled) state.demo = structuredClone(defaults.demo);
          saveState();
          applyState();
          button.textContent = (demoExitLabels[locale] || demoExitLabels['zh-cn'])[state.demoEnabled ? 0 : 1];
          notify(state.demoEnabled ? '演示模式已重新开启。' : '演示模式已退出并重置本地测试数据；此页面不连接服务器。');
        });
      }
    });
    document.querySelectorAll('.tag-list .tag').forEach((tag) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = tag.className;
      button.textContent = tag.textContent;
      button.setAttribute('aria-pressed', String(tag.textContent.trim() === state.demo.scenario));
      button.addEventListener('click', () => updateDemoScenario(tag.textContent.replace(/^✓\s*/, '').trim()));
      tag.replaceWith(button);
    });
  }

  function setupButtonSemantics() {
    document.querySelectorAll('.page-content button').forEach((button) => {
      button.type = 'button';
    });
  }

  function init() {
    state = readState();
    addSettingsNavigation();
    document.body.classList.add('atlas-settings-page');
    setupButtonSemantics();
    if (page === 'settings-profile') setupProfile();
    if (page === 'settings-privacy') setupPrivacy();
    if (page === 'settings-execution') setupExecution();
    if (page === 'settings-appearance') setupAppearance();
    if (page === 'settings-demo') setupDemo();
    applyState();
  }

  init();
})();
