/**
 * ATLAS High-Craft UI & Interactive Spatial Engine v3.0
 * Powers:
 * 1. Obsidian Dark Mode + Circular View Transition Reveal
 * 2. Floating macOS/iPadOS OS Workspace Dock (with live AtlasOS badges)
 * 3. Cursor-Tracking Optical Spotlight Borders (--spot-x / --spot-y)
 * 4. Scroll-Linked Scrollytelling (#story & #product camera zoom)
 * 5. Force-Directed Neural Star-Map Canvas + Inspector (memory.html)
 * 6. Real-Time Agent Approval & Dispatch Console (agents.html)
 */
(function (window, document) {
  'use strict';

  const THEME_KEY = 'atlas-theme';
  const prefersReducedMotion = () =>
    Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function notifyToast(msg) {
    if (window.AtlasOS && typeof window.AtlasOS.toast === 'function') {
      window.AtlasOS.toast(msg);
    }
  }

  /* ------------------------------------------------------------------------
   * 1. Obsidian Dark Mode + Circular Clip-Path View Transition
   * ------------------------------------------------------------------------ */
  const SUN_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"/></svg>';
  const MOON_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.4A8.5 8.5 0 0 1 9.6 3.5a8.5 8.5 0 1 0 10.9 10.9Z"/></svg>';

  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyThemeValue(nextTheme) {
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch (_) {
      // ignore storage errors
    }
    document.querySelectorAll('.atlas-theme-toggle').forEach((btn) => {
      const isDark = nextTheme === 'dark';
      btn.innerHTML = isDark ? SUN_SVG : MOON_SVG;
      btn.setAttribute('aria-pressed', String(isDark));
      btn.setAttribute(
        'title',
        isDark ? '切换至冰川石板浅色模式' : '切换至黑曜石高定深色模式'
      );
    });
  }

  function toggleTheme(originEvent) {
    const nextTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
    const canViewTransition =
      typeof document.startViewTransition === 'function' && !prefersReducedMotion();

    if (!canViewTransition) {
      applyThemeValue(nextTheme);
      return nextTheme;
    }

    const x =
      originEvent && typeof originEvent.clientX === 'number'
        ? originEvent.clientX
        : window.innerWidth - 48;
    const y =
      originEvent && typeof originEvent.clientY === 'number' ? originEvent.clientY : 28;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    document.documentElement.classList.add('atlas-theme-transitioning');
    const transition = document.startViewTransition(() => {
      applyThemeValue(nextTheme);
    });

    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 460,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      })
      .catch(() => {});

    transition.finished.finally(() => {
      document.documentElement.classList.remove('atlas-theme-transitioning');
    });

    return nextTheme;
  }

  function initThemeEngine() {
    try {
      const saved = window.localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') {
        document.documentElement.setAttribute('data-theme', saved);
      }
    } catch (_) {}

    const navActions = document.querySelector('.atlas-nav-actions');
    if (navActions && !navActions.querySelector('.atlas-theme-toggle')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'atlas-theme-toggle';
      btn.setAttribute('aria-label', '切换深色或浅色主题');
      btn.addEventListener('click', (e) => {
        const mode = toggleTheme(e);
        notifyToast(mode === 'dark' ? '已开启黑曜石高定深色模式' : '已切换至冰川石板浅色模式');
      });
      const cmdkBtn = navActions.querySelector('.atlas-cmdk-trigger');
      if (cmdkBtn && cmdkBtn.nextSibling) {
        navActions.insertBefore(btn, cmdkBtn.nextSibling);
      } else {
        navActions.insertBefore(btn, navActions.firstChild);
      }
    }
    applyThemeValue(getCurrentTheme());
  }

  /* ------------------------------------------------------------------------
   * 2. Floating macOS / iPadOS OS Workspace Dock
   * ------------------------------------------------------------------------ */
  function getPageSlug() {
    const file = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    return file.replace(/\.html$/, '') || 'index';
  }

  function initWorkspaceDock() {
    const slug = getPageSlug();
    const isWorkspacePage = /^(home|ask|memory|life|agents|settings)($|-)/.test(slug);
    if (!isWorkspacePage || document.querySelector('.atlas-os-dock')) return;

    document.body.classList.add('has-atlas-dock');
    const activeGroup = slug.split('-')[0];

    const dock = document.createElement('nav');
    dock.className = 'atlas-os-dock';
    dock.setAttribute('aria-label', 'ATLAS OS 空间切换栏');

    const items = [
      {
        key: 'index',
        href: 'index.html',
        label: '概览',
        icon: '<svg viewBox="0 0 24 24"><path d="M12 3 3.5 9.5V20a1 1 0 0 0 1 1h5.2v-6h4.6v6h5.2a1 1 0 0 0 1-1V9.5L12 3Z"/></svg>'
      },
      {
        key: 'home',
        href: 'home.html',
        label: '工作台',
        badgeKey: 'active_tasks',
        icon: '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7.2" height="7.2" rx="1.8"/><rect x="13.3" y="3.5" width="7.2" height="7.2" rx="1.8"/><rect x="3.5" y="13.3" width="7.2" height="7.2" rx="1.8"/><rect x="13.3" y="13.3" width="7.2" height="7.2" rx="1.8"/></svg>'
      },
      {
        key: 'ask',
        href: 'ask.html',
        label: '问询',
        icon: '<svg viewBox="0 0 24 24"><path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.3-4.6A8.5 8.5 0 1 1 21 12Z"/><path d="M8.8 11.8h6.4M8.8 15h4.2"/></svg>'
      },
      {
        key: 'memory',
        href: 'memory.html',
        label: '记忆',
        badgeKey: 'total_memories',
        icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><circle cx="5" cy="6.5" r="2"/><circle cx="19" cy="6.5" r="2"/><circle cx="5.5" cy="18" r="2"/><circle cx="18.5" cy="18" r="2"/><path d="m6.7 7.8 3.2 2.4M17.3 7.8l-3.2 2.4M7.2 16.8l2.8-2.6M16.8 16.8 14 14.2"/></svg>'
      },
      {
        key: 'life',
        href: 'life.html',
        label: '生活',
        icon: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M8 3.2v3.2M16 3.2v3.2M3.5 9.8h17"/><path d="m9.2 14.8 2 2 3.8-3.8"/></svg>'
      },
      {
        key: 'agents',
        href: 'agents.html',
        label: '智能体',
        badgeKey: 'pending_actions',
        icon: '<svg viewBox="0 0 24 24"><path d="M13 2.8 4.8 13.5h6.4L10.2 21.2 19.2 10.2h-6.5L13 2.8Z"/></svg>'
      }
    ];

    dock.innerHTML =
      items
        .map((item) => {
          const isActive = item.key === activeGroup;
          const badgeHtml = item.badgeKey
            ? `<span class="atlas-dock-badge" data-dock-badge="${item.badgeKey}">0</span>`
            : '';
          return `
            <a class="atlas-dock-item${isActive ? ' is-active' : ''}" href="${item.href}" ${
            isActive ? 'aria-current="page"' : ''
          }>
              ${item.icon}
              <span class="atlas-dock-label">${item.label}</span>
              ${badgeHtml}
            </a>
          `;
        })
        .join('') +
      `<span class="atlas-dock-divider" aria-hidden="true"></span>` +
      `<button type="button" class="atlas-dock-item" data-dock-cmdk aria-label="打开全局命令中心 (⌘K)">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.8"/><path d="m19.5 19.5-3.4-3.4"/></svg>
        <span class="atlas-dock-label">⌘K</span>
      </button>`;

    document.body.appendChild(dock);

    const cmdkBtn = dock.querySelector('[data-dock-cmdk]');
    if (cmdkBtn) {
      cmdkBtn.addEventListener('click', () => {
        if (window.AtlasOS && typeof window.AtlasOS.openCommandPalette === 'function') {
          window.AtlasOS.openCommandPalette();
        }
      });
    }

    function syncBadges() {
      if (!window.AtlasOS) return;
      const summary = window.AtlasOS.getState().summary || {};
      dock.querySelectorAll('[data-dock-badge]').forEach((badge) => {
        const key = badge.getAttribute('data-dock-badge');
        const count = Number(summary[key] || 0);
        badge.textContent = String(count);
        badge.style.display = count > 0 ? 'inline-grid' : 'none';
      });
    }

    syncBadges();
    if (window.AtlasOS && typeof window.AtlasOS.subscribe === 'function') {
      window.AtlasOS.subscribe(syncBadges);
    }
  }

  /* ------------------------------------------------------------------------
   * 3. Cursor-Tracking Optical Spotlight Borders
   * ------------------------------------------------------------------------ */
  const SPOTLIGHT_SELECTOR = [
    '.feature-card',
    '.scene-card',
    '.dashboard-card',
    '.section-card',
    '.pricing-card',
    '.atlas-sandbox-card',
    '.atlas-agent-queue-card',
    '.platform-card',
    '.command-card'
  ].join(',');

  function tagSpotlightCards(root = document) {
    root.querySelectorAll(SPOTLIGHT_SELECTOR).forEach((card) => {
      if (!card.classList.contains('atlas-spotlight-card')) {
        card.classList.add('atlas-spotlight-card');
      }
    });
  }

  function initSpotlightCards() {
    tagSpotlightCards();
    if (prefersReducedMotion()) return;

    document.addEventListener(
      'pointermove',
      (e) => {
        const card = e.target && e.target.closest ? e.target.closest('.atlas-spotlight-card') : null;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', `${(e.clientX - rect.left).toFixed(1)}px`);
        card.style.setProperty('--spot-y', `${(e.clientY - rect.top).toFixed(1)}px`);
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------------------
   * 4. Scroll-Linked Scrollytelling (#story & #product on index.html)
   * ------------------------------------------------------------------------ */
  function initHomepageScrollytelling() {
    const storySection = document.getElementById('story');
    if (storySection) {
      const steps = Array.from(storySection.querySelectorAll('.story-step[data-story-step]'));
      const progressDots = Array.from(storySection.querySelectorAll('.story-progress span'));

      const activateStep = (idx) => {
        steps.forEach((step, i) => step.classList.toggle('is-active', i === idx));
        progressDots.forEach((dot, i) => dot.classList.toggle('is-active', i <= idx));
      };

      steps.forEach((step, idx) => {
        step.addEventListener('click', () => activateStep(idx));
      });

      if ('IntersectionObserver' in window && steps.length) {
        const obs = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const idx = Number(entry.target.getAttribute('data-story-step') || 0);
                activateStep(idx);
              }
            });
          },
          { rootMargin: '-28% 0px -38% 0px', threshold: 0.25 }
        );
        steps.forEach((step) => obs.observe(step));
      }
    }

    const productSection = document.getElementById('product');
    if (productSection) {
      const features = Array.from(productSection.querySelectorAll('.stage-feature'));
      const stageVisual = productSection.querySelector('.product-stage-visual');
      const focusBadge = productSection.querySelector('.stage-badge-focus');
      const badgeLabels = ['聚焦重点任务', '关联长期记忆', '等待确认执行'];

      const setStageFocus = (idx) => {
        features.forEach((feat, i) => {
          const active = i === idx;
          feat.classList.toggle('is-active', active);
          feat.setAttribute('aria-expanded', String(active));
        });
        if (stageVisual) {
          stageVisual.setAttribute('data-stage-focus', String(idx));
        }
        if (focusBadge && badgeLabels[idx]) {
          focusBadge.textContent = badgeLabels[idx];
        }
      };

      features.forEach((feat, idx) => {
        feat.addEventListener('click', () => setStageFocus(idx));
        feat.addEventListener('mouseenter', () => setStageFocus(idx));
        feat.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setStageFocus(idx);
          }
        });
      });
      setStageFocus(0);
    }
  }

  /* ------------------------------------------------------------------------
   * 5. Interactive Force-Directed Neural Star-Map (memory.html)
   * ------------------------------------------------------------------------ */
  function initNeuralMemoryStudio() {
    const studio = document.querySelector('[data-atlas-neural-studio]');
    if (!studio || !window.AtlasOS) return;

    const canvas = studio.querySelector('[data-neural-canvas]');
    const hudEl = studio.querySelector('[data-neural-hud]');
    const filterBtns = Array.from(studio.querySelectorAll('[data-neural-filter]'));
    const inspectorKicker = studio.querySelector('[data-inspector-kicker]');
    const inspectorTitle = studio.querySelector('[data-inspector-title]');
    const inspectorContent = studio.querySelector('[data-inspector-content]');
    const inspectorTags = studio.querySelector('[data-inspector-tags]');
    const inspectorConfidence = studio.querySelector('[data-inspector-confidence]');
    const deleteBtn = studio.querySelector('[data-inspector-delete]');
    const form = studio.querySelector('[data-neural-composer]');

    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let activeCategory = 'all';
    let selectedId = null;
    let hoveredId = null;
    let draggingNode = null;
    let nodes = [];
    let edges = [];
    let animFrame = null;
    let pulseTick = 0;

    const CATEGORY_COLORS = {
      core: '#38bdf8',
      work: '#3b82f6',
      preferences: '#06b6d4',
      relationships: '#818cf8',
      personal: '#34d399',
      task: '#f59e0b'
    };

    const CATEGORY_LABELS = {
      work: '工作与项目',
      preferences: '偏好与习惯',
      relationships: '关系网络',
      personal: '个人信息',
      task: '关联待办任务',
      core: '个人上下文中枢'
    };

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(320, Math.floor(rect.width));
      const height = Math.max(380, Math.floor(rect.height || 440));
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      return { width, height };
    }

    function rebuildGraph() {
      const { width, height } = resizeCanvas();
      const cx = width / 2;
      const cy = height / 2;
      const state = window.AtlasOS.getState();
      const prevMap = new Map(nodes.map((n) => [n.id, n]));

      const filteredMemories = (state.memories || []).filter(
        (m) => activeCategory === 'all' || m.category === activeCategory
      );
      const activeTasks = (state.tasks || []).filter((t) => t.status !== 'done').slice(0, 4);

      const nextNodes = [];
      const nextEdges = [];

      // Central ATLAS Core Hub
      const prevCore = prevMap.get('hub-core');
      nextNodes.push({
        id: 'hub-core',
        kind: 'core',
        category: 'core',
        label: 'ATLAS 核心图谱',
        title: '个人长期记忆与上下文中枢',
        content: '所有长期记忆、偏好与活跃任务在此实时汇聚并供 AI 问询与智能体检索。',
        tags: ['实时同步', '本地优先', '端到端关联'],
        confidence: 1.0,
        radius: 15,
        x: prevCore ? prevCore.x : cx,
        y: prevCore ? prevCore.y : cy,
        vx: 0,
        vy: 0
      });

      filteredMemories.forEach((mem, idx) => {
        const angle = (idx / Math.max(1, filteredMemories.length)) * Math.PI * 2 - Math.PI / 4;
        const dist = 115 + (idx % 2) * 38;
        const prev = prevMap.get(mem.id);
        nextNodes.push({
          id: mem.id,
          kind: 'memory',
          category: mem.category || 'work',
          label: mem.title.slice(0, 12) + (mem.title.length > 12 ? '…' : ''),
          title: mem.title,
          content: mem.content,
          tags: mem.tags || [],
          confidence: mem.confidence || 0.96,
          radius: 9.5,
          x: prev ? prev.x : cx + Math.cos(angle) * dist,
          y: prev ? prev.y : cy + Math.sin(angle) * dist,
          vx: prev ? prev.vx : 0,
          vy: prev ? prev.vy : 0
        });
        nextEdges.push({ source: 'hub-core', target: mem.id, strength: 0.9 });
      });

      // Cross-link memories sharing category or tags
      for (let i = 0; i < filteredMemories.length; i++) {
        for (let j = i + 1; j < filteredMemories.length; j++) {
          const a = filteredMemories[i];
          const b = filteredMemories[j];
          const sharedTag = (a.tags || []).some((t) => (b.tags || []).includes(t));
          if (a.category === b.category || sharedTag) {
            nextEdges.push({ source: a.id, target: b.id, strength: 0.45 });
          }
        }
      }

      // Link active tasks on outer orbit when viewing 'all' or 'work'
      if (activeCategory === 'all' || activeCategory === 'work') {
        activeTasks.forEach((task, idx) => {
          const angle = ((idx + 0.5) / Math.max(1, activeTasks.length)) * Math.PI * 2;
          const prev = prevMap.get(task.id);
          nextNodes.push({
            id: task.id,
            kind: 'task',
            category: 'task',
            label: task.title.slice(0, 10) + (task.title.length > 10 ? '…' : ''),
            title: task.title,
            content: `所属项目：${task.project} · 截止：${task.due_date} · 状态：进行中`,
            tags: [task.project, task.due_date, task.priority === 'high' ? '高优待办' : '待办'],
            confidence: 0.92,
            radius: 7.5,
            x: prev ? prev.x : cx + Math.cos(angle) * 175,
            y: prev ? prev.y : cy + Math.sin(angle) * 150,
            vx: prev ? prev.vx : 0,
            vy: prev ? prev.vy : 0
          });
          const relatedMem =
            filteredMemories.find((m) =>
              (m.tags || []).some((tag) => task.title.includes(tag) || (task.project || '').includes(tag))
            ) || filteredMemories[0];
          nextEdges.push({
            source: relatedMem ? relatedMem.id : 'hub-core',
            target: task.id,
            strength: 0.55
          });
        });
      }

      nodes = nextNodes;
      edges = nextEdges;

      if (!selectedId || !nodes.some((n) => n.id === selectedId)) {
        const firstMem = nodes.find((n) => n.kind === 'memory') || nodes[0];
        selectedId = firstMem ? firstMem.id : null;
      }
      renderInspector();
      if (hudEl) {
        hudEl.textContent = `NODES ${nodes.length} · SYNAPSES ${edges.length} · DRAG TO EXPLORE`;
      }
    }

    function renderInspector() {
      const node = nodes.find((n) => n.id === selectedId) || nodes[0];
      if (!node) return;
      if (inspectorKicker) {
        inspectorKicker.textContent = `${CATEGORY_LABELS[node.category] || '记忆节点'} · ${(
          node.category || 'core'
        ).toUpperCase()}`;
      }
      if (inspectorTitle) inspectorTitle.textContent = node.title;
      if (inspectorContent) inspectorContent.textContent = node.content;
      if (inspectorConfidence) {
        inspectorConfidence.textContent = `置信度 ${Math.round((node.confidence || 0.95) * 100)}%`;
      }
      if (inspectorTags) {
        inspectorTags.innerHTML = (node.tags || [])
          .map((t) => `<span class="atlas-sandbox-tag">#${escapeHtml(t)}</span>`)
          .join('');
      }
      if (deleteBtn) {
        deleteBtn.hidden = node.kind !== 'memory';
        deleteBtn.onclick = () => {
          if (node.kind === 'memory') {
            window.AtlasOS.deleteMemory(node.id);
            notifyToast(`已移除记忆节点：${node.title}`);
          }
        };
      }
    }

    function stepPhysics() {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 640;
      const height = rect.height || 440;
      const cx = width / 2;
      const cy = height / 2;
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));

      // Repulsion between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x || 0.1;
          const dy = b.y - a.y || 0.1;
          const distSq = Math.max(400, dx * dx + dy * dy);
          const force = 2200 / distSq;
          const dist = Math.sqrt(distSq);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          if (a !== draggingNode && a.kind !== 'core') {
            a.vx -= fx;
            a.vy -= fy;
          }
          if (b !== draggingNode && b.kind !== 'core') {
            b.vx += fx;
            b.vy += fy;
          }
        }
      }

      // Spring attraction along edges
      edges.forEach((edge) => {
        const s = nodeMap.get(edge.source);
        const t = nodeMap.get(edge.target);
        if (!s || !t) return;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const targetLen = s.kind === 'core' ? 132 : 105;
        const k = 0.018 * (edge.strength || 0.6);
        const delta = (dist - targetLen) * k;
        const fx = (dx / dist) * delta;
        const fy = (dy / dist) * delta;
        if (s !== draggingNode && s.kind !== 'core') {
          s.vx += fx;
          s.vy += fy;
        }
        if (t !== draggingNode && t.kind !== 'core') {
          t.vx -= fx;
          t.vy -= fy;
        }
      });

      nodes.forEach((n) => {
        if (n.kind === 'core' && n !== draggingNode) {
          n.x += (cx - n.x) * 0.08;
          n.y += (cy - n.y) * 0.08;
          return;
        }
        if (n === draggingNode) return;
        // Gentle centering gravity
        n.vx += (cx - n.x) * 0.0022;
        n.vy += (cy - n.y) * 0.0022;
        n.vx *= 0.84;
        n.vy *= 0.84;
        n.x = Math.max(36, Math.min(width - 36, n.x + n.vx));
        n.y = Math.max(34, Math.min(height - 42, n.y + n.vy));
      });
    }

    function drawFrame() {
      const { width, height } = resizeCanvas();
      ctx.clearRect(0, 0, width, height);
      pulseTick += 0.012;

      const nodeMap = new Map(nodes.map((n) => [n.id, n]));

      // Subtle orbital rings around core
      const core = nodeMap.get('hub-core');
      if (core) {
        ctx.save();
        ctx.strokeStyle = 'rgba(125, 179, 235, 0.09)';
        ctx.lineWidth = 1;
        [95, 160].forEach((r) => {
          ctx.beginPath();
          ctx.arc(core.x, core.y, r, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.restore();
      }

      // Draw edges + animated synaptic pulses
      edges.forEach((edge, idx) => {
        const s = nodeMap.get(edge.source);
        const t = nodeMap.get(edge.target);
        if (!s || !t) return;
        const isHighlighted =
          s.id === selectedId ||
          t.id === selectedId ||
          s.id === hoveredId ||
          t.id === hoveredId;

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = isHighlighted
          ? 'rgba(56, 189, 248, 0.68)'
          : 'rgba(148, 184, 224, 0.18)';
        ctx.lineWidth = isHighlighted ? 1.7 : 1;
        ctx.stroke();

        if (!prefersReducedMotion() && (isHighlighted || idx % 2 === 0)) {
          const p = (pulseTick + idx * 0.21) % 1;
          const px = s.x + (t.x - s.x) * p;
          const py = s.y + (t.y - s.y) * p;
          ctx.beginPath();
          ctx.arc(px, py, isHighlighted ? 2.4 : 1.6, 0, Math.PI * 2);
          ctx.fillStyle = isHighlighted ? '#7dd3fc' : 'rgba(125, 211, 252, 0.48)';
          ctx.fill();
        }
      });

      // Draw nodes + labels
      nodes.forEach((n) => {
        const color = CATEGORY_COLORS[n.category] || '#38bdf8';
        const isSelected = n.id === selectedId;
        const isHovered = n.id === hoveredId;
        const r = n.radius + (isSelected ? 2.5 : isHovered ? 1.5 : 0);

        if (isSelected || isHovered || n.kind === 'core') {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 7, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.24)' : 'rgba(56, 189, 248, 0.12)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = isSelected ? 2.2 : 1.2;
        ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.55)';
        ctx.stroke();

        ctx.font = `${isSelected ? '600' : '500'} 11.5px Inter, -apple-system, "PingFang SC", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(226, 238, 252, 0.86)';
        ctx.fillText(n.label, n.x, n.y + r + 15);
      });
    }

    function loop() {
      stepPhysics();
      drawFrame();
      animFrame = window.requestAnimationFrame(loop);
    }

    function findNodeAt(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        if (Math.hypot(mx - n.x, my - n.y) <= n.radius + 9) {
          return { node: n, mx, my };
        }
      }
      return { node: null, mx, my };
    }

    canvas.addEventListener('pointerdown', (e) => {
      const hit = findNodeAt(e.clientX, e.clientY);
      if (hit.node) {
        selectedId = hit.node.id;
        draggingNode = hit.node;
        renderInspector();
      }
    });

    canvas.addEventListener('pointermove', (e) => {
      const hit = findNodeAt(e.clientX, e.clientY);
      hoveredId = hit.node ? hit.node.id : null;
      canvas.style.cursor = draggingNode ? 'grabbing' : hoveredId ? 'pointer' : 'grab';
      if (draggingNode) {
        const rect = canvas.getBoundingClientRect();
        draggingNode.x = Math.max(30, Math.min(rect.width - 30, hit.mx));
        draggingNode.y = Math.max(30, Math.min(rect.height - 36, hit.my));
        draggingNode.vx = 0;
        draggingNode.vy = 0;
      }
    });

    window.addEventListener('pointerup', () => {
      draggingNode = null;
    });

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        activeCategory = btn.getAttribute('data-neural-filter') || 'all';
        rebuildGraph();
      });
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const catSelect = form.querySelector('[name="category"]');
        const titleInput = form.querySelector('[name="title"]');
        const title = titleInput ? titleInput.value.trim() : '';
        if (!title) return;
        const created = window.AtlasOS.addMemory({
          category: catSelect ? catSelect.value : 'work',
          title,
          content: title,
          tags: ['星图录入', CATEGORY_LABELS[catSelect ? catSelect.value : 'work'] || '记忆']
        });
        selectedId = created.id;
        if (titleInput) titleInput.value = '';
        notifyToast(`已点亮新记忆星点：「${created.title}」`);
      });
    }

    rebuildGraph();
    window.AtlasOS.subscribe(rebuildGraph);
    window.addEventListener('resize', rebuildGraph);
    if (prefersReducedMotion()) {
      for (let i = 0; i < 40; i++) stepPhysics();
      drawFrame();
    } else {
      animFrame = window.requestAnimationFrame(loop);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && animFrame) {
        window.cancelAnimationFrame(animFrame);
        animFrame = null;
      } else if (!document.hidden && !animFrame && !prefersReducedMotion()) {
        animFrame = window.requestAnimationFrame(loop);
      }
    });
  }

  /* ------------------------------------------------------------------------
   * 6. Real-Time Agent Approval & Dispatch Console (agents.html)
   * ------------------------------------------------------------------------ */
  function initLiveAgentConsole() {
    const consoleRoot = document.querySelector('[data-atlas-agent-console]');
    if (!consoleRoot || !window.AtlasOS) return;

    const form = consoleRoot.querySelector('[data-agent-dispatch-form]');
    const input = consoleRoot.querySelector('[data-agent-goal-input]');
    const queueEl = consoleRoot.querySelector('[data-agent-live-queue]');
    const statsEl = consoleRoot.querySelector('[data-agent-live-stats]');

    function renderQueue() {
      const state = window.AtlasOS.getState();
      const actions = state.agent_actions || [];
      if (statsEl) {
        statsEl.textContent = `待你确认 ${state.summary.pending_actions} 项 · 已批准执行 ${state.summary.executed_actions} 项`;
      }
      if (!queueEl) return;

      if (!actions.length) {
        queueEl.innerHTML =
          '<p style="color:#64748b;font-size:0.86rem;margin:0;">暂无智能体提议，在上方输入任意目标即可生成可审批计划。</p>';
        return;
      }

      queueEl.innerHTML = actions
        .map((act) => {
          const isPending = act.status === 'pending';
          const isExecuted = act.status === 'executed';
          const statusLabel = isPending
            ? '等待确认'
            : isExecuted
            ? '✓ 已批准并写入工作台'
            : '已暂缓';
          const statusColor = isPending
            ? 'background:rgba(33,109,184,0.12);color:#1d64b8;'
            : isExecuted
            ? 'background:rgba(22,163,74,0.12);color:#15803d;'
            : 'background:rgba(100,116,139,0.12);color:#64748b;';

          return `
            <article class="atlas-agent-queue-card atlas-spotlight-card ${
              isPending ? 'is-pending' : isExecuted ? 'is-executed' : ''
            }">
              <div style="flex:1;min-width:240px;">
                <div style="display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem;margin-bottom:0.35rem;">
                  <span class="atlas-mono-badge" style="font-size:0.7rem;font-weight:700;color:#256ab8;">${escapeHtml(
                    act.agent_name
                  )}</span>
                  <span style="padding:0.15rem 0.55rem;border-radius:999px;font-size:0.7rem;font-weight:600;${statusColor}">${statusLabel}</span>
                </div>
                <h3 style="margin:0 0 0.25rem;font-size:0.98rem;font-weight:650;">${escapeHtml(act.title)}</h3>
                <p style="margin:0;font-size:0.82rem;color:#5b6e84;line-height:1.55;">${escapeHtml(act.summary)}</p>
              </div>
              ${
                isPending
                  ? `<div style="display:flex;gap:0.5rem;align-items:center;">
                      <button type="button" class="atlas-agent-btn-approve" data-act-approve="${escapeHtml(
                        act.id
                      )}">批准并执行</button>
                      <button type="button" class="atlas-agent-btn-defer" data-act-defer="${escapeHtml(
                        act.id
                      )}">暂缓</button>
                    </div>`
                  : ''
              }
            </article>
          `;
        })
        .join('');

      queueEl.querySelectorAll('[data-act-approve]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-act-approve');
          const res = window.AtlasOS.decideAgentAction(id, 'approve');
          if (res && res.action) {
            notifyToast(`已批准执行：${res.action.title}`);
          }
        });
      });

      queueEl.querySelectorAll('[data-act-defer]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-act-defer');
          const res = window.AtlasOS.decideAgentAction(id, 'defer');
          if (res && res.action) {
            notifyToast(`已暂缓建议：${res.action.title}`);
          }
        });
      });
    }

    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const goal = input.value.trim();
        if (!goal) return;
        const created = window.AtlasOS.addAgentAction(goal);
        input.value = '';
        notifyToast(`智能体已拆解目标并加入待确认队列：「${created.title}」`);
      });
    }

    renderQueue();
    window.AtlasOS.subscribe(renderQueue);
  }

  /* ------------------------------------------------------------------------
   * 7. Hero Glacier Cinema Video Stage (Slow-Cadence + Soft-Focus UI Guard)
   * ------------------------------------------------------------------------ */
  let openHeroVideoPicker = null;

  function initHeroCinemaVideo() {
    const stage = document.querySelector('[data-hero-cinema]');
    const video = document.querySelector('[data-hero-cinema-video]');
    const controls = document.querySelector('[data-hero-cinema-controls]');
    if (!stage || !video) return;

    const toggleBtn = controls ? controls.querySelector('[data-hero-video-toggle]') : null;
    const toggleLabel = controls ? controls.querySelector('[data-hero-video-toggle-label]') : null;
    const pickBtn = controls ? controls.querySelector('[data-hero-video-pick]') : null;
    const fileInput = controls ? controls.querySelector('[data-hero-video-file]') : null;

    let userPaused = false;
    let videoAvailable = false;
    let currentObjectUrl = null;

    // Slow luxury cadence (0.68x) calms down AI video motion automatically
    const LUXURY_PLAYBACK_RATE = 0.68;

    function updateToggleUI(playing) {
      if (!toggleBtn) return;
      toggleBtn.hidden = !videoAvailable;
      toggleBtn.classList.toggle('is-paused', !playing);
      toggleBtn.setAttribute('aria-pressed', String(!playing));
      if (toggleLabel) {
        toggleLabel.textContent = playing ? '暂停光影' : '播放光影';
      }
    }

    function activateVideoPlayback() {
      videoAvailable = true;
      video.playbackRate = LUXURY_PLAYBACK_RATE;
      if (prefersReducedMotion() || userPaused) {
        video.pause();
        video.classList.add('is-playing');
        updateToggleUI(false);
        return;
      }
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            video.playbackRate = LUXURY_PLAYBACK_RATE;
            video.classList.add('is-playing');
            updateToggleUI(true);
          })
          .catch(() => {
            updateToggleUI(false);
          });
      } else {
        video.classList.add('is-playing');
        updateToggleUI(true);
      }
    }

    video.addEventListener('loadeddata', activateVideoPlayback);
    video.addEventListener('canplay', () => {
      if (!videoAvailable) activateVideoPlayback();
    });

    if (video.readyState >= 2) {
      activateVideoPlayback();
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (video.paused) {
          userPaused = false;
          video.playbackRate = LUXURY_PLAYBACK_RATE;
          video.play().catch(() => {});
          video.classList.add('is-playing');
          updateToggleUI(true);
        } else {
          userPaused = true;
          video.pause();
          updateToggleUI(false);
        }
      });
    }

    // Add an instant Soft-Focus toggle button when video is active so busy videos can be optically diffused
    let blurBtn = null;
    function ensureBlurToggle() {
      if (!controls || blurBtn) return;
      blurBtn = document.createElement('button');
      blurBtn.type = 'button';
      blurBtn.className = 'hero-cinema-btn';
      blurBtn.textContent = '柔焦护眼：关';
      blurBtn.title = '对背景视频施加光学浅景深柔焦，突出前景文字与工作台界面';
      blurBtn.addEventListener('click', () => {
        const soft = stage.classList.toggle('is-soft-focus');
        blurBtn.textContent = soft ? '柔焦护眼：开' : '柔焦护眼：关';
      });
      controls.insertBefore(blurBtn, pickBtn || null);
    }

    video.addEventListener('playing', ensureBlurToggle);

    // Show 1-click local Gemini MP4 preview picker on local dev environments
    const isLocalEnv =
      window.location.protocol === 'file:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.local');

    if (pickBtn && fileInput) {
      if (isLocalEnv) {
        pickBtn.hidden = false;
      }
      openHeroVideoPicker = () => fileInput.click();
      pickBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        if (currentObjectUrl) {
          URL.revokeObjectURL(currentObjectUrl);
        }
        currentObjectUrl = URL.createObjectURL(file);
        video.innerHTML = '';
        video.src = currentObjectUrl;
        video.load();
        userPaused = false;
        activateVideoPlayback();
        ensureBlurToggle();
        notifyToast(`已加载预览视频「${file.name}」（自动以 0.68x 电影慢速播放）`);
      });
    }

    // Pause automatically when Hero scrolls out of viewport to save GPU/battery
    if ('IntersectionObserver' in window) {
      const heroEl = stage.closest('.hero') || stage;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!videoAvailable) return;
            if (!entry.isIntersecting && !video.paused) {
              video.pause();
            } else if (entry.isIntersecting && !userPaused && !prefersReducedMotion() && video.paused) {
              video.playbackRate = LUXURY_PLAYBACK_RATE;
              video.play().catch(() => {});
            }
          });
        },
        { threshold: 0.08 }
      );
      io.observe(heroEl);
    }
  }

  /* ------------------------------------------------------------------------
   * Bootstrap & Public API
   * ------------------------------------------------------------------------ */
  window.AtlasHighCraft = {
    toggleTheme,
    getCurrentTheme,
    tagSpotlightCards,
    pickHeroVideoPreview: () => {
      if (typeof openHeroVideoPicker === 'function') {
        openHeroVideoPicker();
      }
    }
  };

  function initAll() {
    initThemeEngine();
    initWorkspaceDock();
    initSpotlightCards();
    initHomepageScrollytelling();
    initNeuralMemoryStudio();
    initLiveAgentConsole();
    initHeroCinemaVideo();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})(window, document);
