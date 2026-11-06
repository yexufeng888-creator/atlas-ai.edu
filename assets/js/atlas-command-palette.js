/**
 * ATLAS Global Command Center (⌘K) & Live Interactive Sandbox Controller
 * Connects every page to window.AtlasOS reactive state.
 */
(function (window, document) {
  'use strict';

  let toastTimer = null;

  function showToast(message) {
    let toastEl = document.getElementById('atlas-os-toast');
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'atlas-os-toast';
      toastEl.className = 'atlas-os-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      toastEl.innerHTML = '<span class="atlas-os-toast-dot"></span><span class="atlas-os-toast-text"></span>';
      document.body.appendChild(toastEl);
    }
    const textNode = toastEl.querySelector('.atlas-os-toast-text');
    if (textNode) textNode.textContent = message;
    toastEl.classList.add('is-visible');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove('is-visible');
    }, 3400);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function injectNavTrigger() {
    const navActions = document.querySelector('.atlas-nav-actions');
    if (!navActions || navActions.querySelector('.atlas-cmdk-trigger')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'atlas-cmdk-trigger';
    btn.setAttribute('aria-label', '打开 ATLAS 全局命令中心 (Command + K)');
    btn.innerHTML =
      '<span class="atlas-cmdk-count-dot" aria-hidden="true"></span>' +
      '<span>命令中心</span>' +
      '<kbd>⌘K</kbd>';
    btn.addEventListener('click', openCommandPalette);
    navActions.insertBefore(btn, navActions.firstChild);
  }

  let dialogEl = null;
  let inputEl = null;
  let bodyEl = null;
  let statusPillsEl = null;
  let currentItems = [];
  let selectedIndex = 0;

  function ensureDialog() {
    if (dialogEl) return dialogEl;
    dialogEl = document.createElement('dialog');
    dialogEl.className = 'atlas-cmdk-dialog';
    dialogEl.setAttribute('aria-label', 'ATLAS 全局命令与上下文中心');
    dialogEl.innerHTML = `
      <div class="atlas-cmdk-shell">
        <header class="atlas-cmdk-header">
          <svg class="atlas-cmdk-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7"></circle>
            <path d="m20 20-3.5-3.5"></path>
          </svg>
          <input
            type="text"
            class="atlas-cmdk-input"
            placeholder="搜索记忆与任务，或直接输入想法（如：周五 14:00 评审 V2 方案 / task: ... / mem: ...）"
            autocomplete="off"
          />
          <button type="button" class="atlas-cmdk-close" data-cmdk-close>ESC</button>
        </header>
        <div class="atlas-cmdk-status-bar">
          <span>实时个人上下文已就绪</span>
          <div class="atlas-cmdk-pills" data-cmdk-pills></div>
        </div>
        <div class="atlas-cmdk-body" data-cmdk-body role="listbox"></div>
        <footer class="atlas-cmdk-footer">
          <span>↑↓ 选择 · Enter 执行 · 支持直接输入自然语言拆解</span>
          <span>ATLAS Dynamic OS v2.0</span>
        </footer>
      </div>
    `;
    document.body.appendChild(dialogEl);

    inputEl = dialogEl.querySelector('.atlas-cmdk-input');
    bodyEl = dialogEl.querySelector('[data-cmdk-body]');
    statusPillsEl = dialogEl.querySelector('[data-cmdk-pills]');

    dialogEl.querySelector('[data-cmdk-close]').addEventListener('click', closeCommandPalette);
    dialogEl.addEventListener('click', (e) => {
      if (e.target === dialogEl) closeCommandPalette();
    });

    inputEl.addEventListener('input', () => {
      selectedIndex = 0;
      renderPaletteList();
    });

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentItems.length) {
          selectedIndex = (selectedIndex + 1) % currentItems.length;
          highlightSelected();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentItems.length) {
          selectedIndex = (selectedIndex - 1 + currentItems.length) % currentItems.length;
          highlightSelected();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = currentItems[selectedIndex];
        if (item && typeof item.run === 'function') {
          item.run();
        }
      }
    });

    return dialogEl;
  }

  function highlightSelected() {
    if (!bodyEl) return;
    const buttons = bodyEl.querySelectorAll('.atlas-cmdk-item');
    buttons.forEach((btn, idx) => {
      btn.classList.toggle('is-selected', idx === selectedIndex);
      if (idx === selectedIndex) {
        btn.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  function renderPaletteList() {
    if (!window.AtlasOS || !bodyEl) return;
    const state = window.AtlasOS.getState();
    const query = (inputEl ? inputEl.value : '').trim();
    const qLower = query.toLowerCase();

    if (statusPillsEl) {
      statusPillsEl.innerHTML =
        `<span class="atlas-cmdk-pill">记忆 ${state.summary.total_memories}</span>` +
        `<span class="atlas-cmdk-pill">待办 ${state.summary.active_tasks}</span>` +
        `<span class="atlas-cmdk-pill">收集箱 ${state.summary.pending_inbox}</span>` +
        `<span class="atlas-cmdk-pill">待确认动作 ${state.summary.pending_actions}</span>`;
    }

    const groups = [];
    currentItems = [];

    // 1. Dynamic creation commands when user types anything
    if (query) {
      const quickCreate = [];
      if (qLower.startsWith('task:') || qLower.startsWith('任务:') || qLower.startsWith('任务：')) {
        const title = query.replace(/^(task:|任务:|任务：)\s*/i, '').trim();
        if (title) {
          quickCreate.push({
            badge: '新建任务',
            badgeClass: 'is-task',
            title: `创建待办任务：「${title}」`,
            meta: '立即写入工作台',
            run() {
              window.AtlasOS.addTask({ title, priority: 'high', due_date: '今日待办' });
              showToast(`已创建任务：${title}`);
              inputEl.value = '';
              renderPaletteList();
            }
          });
        }
      } else if (qLower.startsWith('mem:') || qLower.startsWith('记忆:') || qLower.startsWith('记忆：')) {
        const title = query.replace(/^(mem:|记忆:|记忆：)\s*/i, '').trim();
        if (title) {
          quickCreate.push({
            badge: '存入记忆',
            badgeClass: 'is-memory',
            title: `归档长期记忆：「${title}」`,
            meta: '写入个人知识库',
            run() {
              window.AtlasOS.addMemory({ category: 'preferences', title, content: title, tags: ['命令中心'] });
              showToast(`已存入长期记忆：${title}`);
              inputEl.value = '';
              renderPaletteList();
            }
          });
        }
      } else {
        const analysis = window.AtlasOS.analyzeInput(query);
        quickCreate.push({
          badge: '智能拆解',
          badgeClass: 'is-agent',
          title: `拆解「${query.slice(0, 32)}」→ 任务 (${analysis.extracted_task.due_date}) + 关联记忆`,
          meta: '回车一键执行',
          run() {
            const res = window.AtlasOS.commitSandboxAnalysis(query);
            showToast(`已拆解写入工作台：「${res.createdTask.title}」`);
            inputEl.value = '';
            renderPaletteList();
          }
        });
        quickCreate.push({
          badge: '收集箱',
          badgeClass: '',
          title: `仅存入随手收集箱：「${query.slice(0, 36)}」`,
          meta: '稍后整理',
          run() {
            window.AtlasOS.addInboxItem(query);
            showToast('已加入随手收集箱');
            inputEl.value = '';
            renderPaletteList();
          }
        });
        quickCreate.push({
          badge: '询问 AI',
          badgeClass: 'is-agent',
          title: `带着个人上下文询问 ATLAS：「${query.slice(0, 32)}」`,
          meta: '跳转至 AI 问询',
          run() {
            window.sessionStorage.setItem('atlas-prefill-ask', query);
            window.location.href = 'ask.html';
          }
        });
      }
      if (quickCreate.length) {
        groups.push({ title: '实时动态指令', items: quickCreate });
      }
    }

    // 2. Pending Agent Actions
    const pendingActions = (state.agent_actions || []).filter(
      (a) =>
        a.status === 'pending' &&
        (!qLower || a.title.toLowerCase().includes(qLower) || a.summary.toLowerCase().includes(qLower))
    );
    if (pendingActions.length) {
      groups.push({
        title: '待确认智能体建议（回车直接批准执行）',
        items: pendingActions.map((act) => ({
          badge: '待确认',
          badgeClass: 'is-agent',
          title: `${act.title}`,
          meta: `${act.agent_name} · 点击批准`,
          run() {
            window.AtlasOS.decideAgentAction(act.id, 'approve');
            showToast(`已批准并执行：${act.title}`);
            renderPaletteList();
          }
        }))
      });
    }

    // 3. Active Tasks
    const matchingTasks = (state.tasks || [])
      .filter((t) => !qLower || t.title.toLowerCase().includes(qLower) || (t.project || '').toLowerCase().includes(qLower))
      .slice(0, 5);
    if (matchingTasks.length) {
      groups.push({
        title: '工作台任务（回车切换完成状态）',
        items: matchingTasks.map((t) => ({
          badge: t.status === 'done' ? '已完成' : t.priority === 'high' ? '高优待办' : '待办',
          badgeClass: 'is-task',
          title: `${t.status === 'done' ? '✓ ' : ''}${t.title}`,
          meta: `${t.project} · ${t.due_date}`,
          run() {
            const updated = window.AtlasOS.toggleTaskStatus(t.id);
            showToast(updated.status === 'done' ? `已完成任务：${t.title}` : `已恢复待办：${t.title}`);
            renderPaletteList();
          }
        }))
      });
    }

    // 4. Long-term Memories
    const matchingMemories = (state.memories || [])
      .filter(
        (m) =>
          !qLower ||
          m.title.toLowerCase().includes(qLower) ||
          m.content.toLowerCase().includes(qLower) ||
          (m.tags || []).some((tag) => tag.toLowerCase().includes(qLower))
      )
      .slice(0, 4);
    if (matchingMemories.length) {
      groups.push({
        title: '长期记忆库（点击前往记忆图谱）',
        items: matchingMemories.map((m) => ({
          badge: m.category.toUpperCase(),
          badgeClass: 'is-memory',
          title: m.title,
          meta: (m.tags || []).slice(0, 2).join(' · '),
          run() {
            closeCommandPalette();
            window.location.href = 'memory.html';
          }
        }))
      });
    }

    // 5. Navigation & System Actions
    const navItems = [
      { badge: '跳转', badgeClass: '', title: '进入个人工作台 (Dashboard)', meta: 'home.html', href: 'home.html' },
      { badge: '跳转', badgeClass: 'is-agent', title: '打开上下文感知 AI 问询 (Ask ATLAS)', meta: 'ask.html', href: 'ask.html' },
      { badge: '跳转', badgeClass: 'is-memory', title: '浏览个人记忆与知识图谱 (Memory)', meta: 'memory.html', href: 'memory.html' },
      { badge: '跳转', badgeClass: 'is-agent', title: '管理智能体与动作确认队列 (Agents)', meta: 'agents.html', href: 'agents.html' },
      { badge: '跳转', badgeClass: 'is-task', title: '打开生活与日程任务视图 (Life)', meta: 'life.html', href: 'life.html' },
      {
        badge: '主题',
        badgeClass: 'is-memory',
        title: '切换高定深色 / 浅色模式 (Obsidian Dark Mode)',
        meta: 'Theme Toggle',
        run() {
          if (window.AtlasHighCraft && typeof window.AtlasHighCraft.toggleTheme === 'function') {
            window.AtlasHighCraft.toggleTheme();
          } else {
            const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try {
              window.localStorage.setItem('atlas-theme', next);
            } catch (_) {}
          }
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          showToast(isDark ? '已切换至黑曜石高定深色模式' : '已切换至冰川石板浅色模式');
          renderPaletteList();
        }
      },
      {
        badge: '光影',
        badgeClass: 'is-agent',
        title: '试看本地 Gemini 首页背景视频 (选择 MP4 实时预览)',
        meta: 'Hero Video Preview',
        run() {
          closeCommandPalette();
          if (document.querySelector('[data-hero-cinema-video]') && window.AtlasHighCraft) {
            window.AtlasHighCraft.pickHeroVideoPreview();
          } else {
            window.location.href = 'index.html';
          }
        }
      },
      {
        badge: '系统',
        badgeClass: '',
        title: '重置演示上下文数据至初始状态',
        meta: 'Reset Demo State',
        run() {
          window.AtlasOS.resetDemoData();
          showToast('已重置个人上下文演示数据');
          renderPaletteList();
        }
      }
    ].filter((item) => !qLower || item.title.toLowerCase().includes(qLower) || item.meta.toLowerCase().includes(qLower));

    if (navItems.length) {
      groups.push({
        title: '系统导航与快捷操作',
        items: navItems.map((item) => ({
          ...item,
          run:
            item.run ||
            function () {
              closeCommandPalette();
              window.location.href = item.href;
            }
        }))
      });
    }

    let html = '';
    groups.forEach((group) => {
      html += `<div class="atlas-cmdk-group"><div class="atlas-cmdk-group-title">${escapeHtml(group.title)}</div>`;
      group.items.forEach((item) => {
        const idx = currentItems.length;
        currentItems.push(item);
        html += `
          <button type="button" class="atlas-cmdk-item${idx === selectedIndex ? ' is-selected' : ''}" data-cmdk-idx="${idx}">
            <span class="atlas-cmdk-item-main">
              <span class="atlas-cmdk-badge ${escapeHtml(item.badgeClass || '')}">${escapeHtml(item.badge)}</span>
              <span class="atlas-cmdk-item-title">${escapeHtml(item.title)}</span>
            </span>
            <span class="atlas-cmdk-item-meta">${escapeHtml(item.meta || '')}</span>
          </button>
        `;
      });
      html += `</div>`;
    });

    bodyEl.innerHTML = html;
    bodyEl.querySelectorAll('.atlas-cmdk-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-cmdk-idx'));
        if (currentItems[idx] && typeof currentItems[idx].run === 'function') {
          currentItems[idx].run();
        }
      });
    });
  }

  function openCommandPalette() {
    const dlg = ensureDialog();
    selectedIndex = 0;
    renderPaletteList();
    if (!dlg.open && typeof dlg.showModal === 'function') {
      dlg.showModal();
    } else {
      dlg.setAttribute('open', '');
    }
    if (inputEl) {
      inputEl.focus();
      inputEl.select();
    }
  }

  function closeCommandPalette() {
    if (!dialogEl) return;
    if (dialogEl.open && typeof dialogEl.close === 'function') {
      dialogEl.close();
    } else {
      dialogEl.removeAttribute('open');
    }
  }

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (dialogEl && dialogEl.open) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
    }
  });

  // Initialize Homepage Live Interactive Sandbox & Reactive Command Panel if on index.html
  function initHomepageInteractiveSandbox() {
    const sandboxRoot = document.querySelector('[data-atlas-live-sandbox]');
    if (sandboxRoot && window.AtlasOS) {
      const textarea = sandboxRoot.querySelector('[data-sandbox-input]');
      const presets = sandboxRoot.querySelectorAll('[data-sandbox-preset]');
      const taskTitleEl = sandboxRoot.querySelector('[data-sandbox-task-title]');
      const taskMetaEl = sandboxRoot.querySelector('[data-sandbox-task-meta]');
      const memListEl = sandboxRoot.querySelector('[data-sandbox-memories]');
      const actionTitleEl = sandboxRoot.querySelector('[data-sandbox-action-title]');
      const actionSummaryEl = sandboxRoot.querySelector('[data-sandbox-action-summary]');
      const commitBtn = sandboxRoot.querySelector('[data-sandbox-commit]');
      const counterEl = sandboxRoot.querySelector('[data-sandbox-live-counts]');

      function renderAnalysis() {
        const raw = textarea ? textarea.value.trim() : '';
        const analysis = window.AtlasOS.analyzeInput(
          raw || '下周五 14:00 和林峰评审 ATLAS V2 原型终稿，提前整理最近 3 次用户访谈结论'
        );
        if (!analysis) return;
        if (taskTitleEl) taskTitleEl.textContent = analysis.extracted_task.title;
        if (taskMetaEl) {
          taskMetaEl.innerHTML =
            `<span class="atlas-sandbox-tag">项目：${escapeHtml(analysis.extracted_task.project)}</span>` +
            `<span class="atlas-sandbox-tag">时间：${escapeHtml(analysis.extracted_task.due_date)}</span>` +
            `<span class="atlas-sandbox-tag">优先级：${
              analysis.extracted_task.priority === 'high' ? '高优' : '常规'
            }</span>`;
        }
        if (memListEl) {
          memListEl.innerHTML = (analysis.related_memories || [])
            .map(
              (m) =>
                `<span class="atlas-sandbox-tag">[${escapeHtml(m.category)}] ${escapeHtml(m.title)}</span>`
            )
            .join('');
        }
        if (actionTitleEl) actionTitleEl.textContent = analysis.suggested_action.title;
        if (actionSummaryEl) actionSummaryEl.textContent = analysis.suggested_action.summary;
      }

      function renderCounts() {
        if (!counterEl) return;
        const st = window.AtlasOS.getState();
        counterEl.textContent = `当前工作台实时状态：记忆 ${st.summary.total_memories} 条 · 待办任务 ${st.summary.active_tasks} 项 · 待确认动作 ${st.summary.pending_actions} 项`;
      }

      if (textarea) {
        textarea.addEventListener('input', renderAnalysis);
      }
      presets.forEach((btn) => {
        btn.addEventListener('click', () => {
          presets.forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          if (textarea) {
            textarea.value = btn.getAttribute('data-sandbox-preset') || '';
            renderAnalysis();
          }
        });
      });
      if (commitBtn) {
        commitBtn.addEventListener('click', () => {
          const text =
            (textarea && textarea.value.trim()) ||
            '下周五 14:00 和林峰评审 ATLAS V2 原型终稿，提前整理最近 3 次用户访谈结论';
          const res = window.AtlasOS.commitSandboxAnalysis(text);
          if (res) {
            showToast(`已写入工作台任务「${res.createdTask.title.slice(0, 20)}…」并关联长期记忆！`);
            renderCounts();
            syncHomepageOverviewPanel();
          }
        });
      }

      renderAnalysis();
      renderCounts();
      window.AtlasOS.subscribe(() => {
        renderCounts();
        syncHomepageOverviewPanel();
      });
    }
    syncHomepageOverviewPanel();
  }

  // Make the Homepage #overview Command Panel reflect live AtlasOS data
  function syncHomepageOverviewPanel() {
    if (!window.AtlasOS) return;
    const state = window.AtlasOS.getState();
    const focusTitle = document.querySelector('[data-live-focus-title]');
    const focusMeta = document.querySelector('[data-live-focus-meta]');
    const memTitle = document.querySelector('[data-live-memory-title]');
    const memMeta = document.querySelector('[data-live-memory-meta]');
    const actTitle = document.querySelector('[data-live-action-title]');
    const actMeta = document.querySelector('[data-live-action-meta]');

    const topTask = state.tasks.find((t) => t.status !== 'done') || state.tasks[0];
    const topMem = state.memories[0];
    const topAct = state.agent_actions.find((a) => a.status === 'pending') || state.agent_actions[0];

    if (focusTitle && topTask) focusTitle.textContent = topTask.title;
    if (focusMeta && topTask) {
      focusMeta.textContent = `${topTask.project} · ${topTask.due_date} · 共 ${state.summary.active_tasks} 项进行中`;
    }
    if (memTitle && topMem) memTitle.textContent = topMem.title;
    if (memMeta && topMem) {
      memMeta.textContent = `已归档 ${state.summary.total_memories} 条长期记忆 · 标签：${(topMem.tags || []).join(' / ')}`;
    }
    if (actTitle && topAct) actTitle.textContent = topAct.title;
    if (actMeta && topAct) {
      actMeta.textContent = `${topAct.agent_name} · ${
        topAct.status === 'pending' ? '等待你的确认' : '已确认执行'
      }`;
    }
  }

  // Sync home.html focus task card with dynamic AtlasOS tasks
  function syncWorkspaceDashboard() {
    if (!window.AtlasOS) return;
    const focusContainer = document.querySelector('.dashboard-card--focus .card-content');
    if (!focusContainer) return;

    let dynamicList = focusContainer.querySelector('[data-atlas-dynamic-tasks]');
    if (!dynamicList) {
      dynamicList = document.createElement('div');
      dynamicList.setAttribute('data-atlas-dynamic-tasks', 'true');
      focusContainer.insertBefore(dynamicList, focusContainer.firstChild);
    }

    const state = window.AtlasOS.getState();
    const userTasks = (state.tasks || []).filter((t) => t.source !== 'system_seed');
    dynamicList.innerHTML = userTasks
      .map((t) => {
        const isDone = t.status === 'done';
        const badgeColor = isDone
          ? 'background:rgba(16,185,129,0.12);color:#10b981;'
          : t.priority === 'high'
          ? 'background:rgba(239,68,68,0.1);color:#ef4444;'
          : 'background:rgba(37,99,235,0.1);color:#2563eb;';
        const badgeLabel = isDone ? '✓' : t.priority === 'high' ? '高' : '动态';
        return `
          <div class="task-item${isDone ? ' is-complete' : ''}" data-os-task-id="${escapeHtml(t.id)}">
            <button class="task-checkbox${isDone ? ' checked' : ''}" type="button" aria-pressed="${isDone}"></button>
            <div class="task-copy" style="flex:1;min-width:0;">
              <div style="font-weight:600;margin-bottom:0.25rem;${isDone ? 'text-decoration:line-through;' : ''}">${escapeHtml(t.title)}</div>
              <div style="font-size:0.75rem;color:#6b7280;">${escapeHtml(t.project)} · ${escapeHtml(t.due_date)}</div>
            </div>
            <span style="padding:0.25rem 0.75rem;border-radius:999px;font-size:0.75rem;font-weight:600;${badgeColor}">${badgeLabel}</span>
          </div>
        `;
      })
      .join('');

    dynamicList.querySelectorAll('[data-os-task-id]').forEach((row) => {
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = row.getAttribute('data-os-task-id');
        const updated = window.AtlasOS.toggleTaskStatus(taskId);
        if (updated) {
          showToast(updated.status === 'done' ? `已完成：${updated.title}` : `已重新打开：${updated.title}`);
        }
      });
    });
  }

  if (window.AtlasOS) {
    window.AtlasOS.toast = showToast;
    window.AtlasOS.openCommandPalette = openCommandPalette;
    window.AtlasOS.subscribe(() => {
      syncWorkspaceDashboard();
    });
  }

  function init() {
    injectNavTrigger();
    initHomepageInteractiveSandbox();
    syncWorkspaceDashboard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
