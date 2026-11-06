/**
 * ATLAS Personal Intelligence OS — Unified Reactive State & Cloud Sync Engine
 * Bridges local-first optimistic state (localStorage) with the authenticated Python/Supabase API.
 */
(function (window, document) {
  'use strict';

  const STORAGE_KEY = 'atlas-os-state-v2';
  const LEGACY_INBOX_KEY = 'atlas-capture-inbox-v1';

  function uid(prefix) {
    return prefix + '-' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function getDefaultState() {
    const ts = nowIso();
    return {
      version: 2,
      syncedWithCloud: false,
      lastUpdated: ts,
      memories: [
        {
          id: 'mem-seed-1',
          category: 'work',
          title: '正在推进 ATLAS V2 产品架构评审',
          content: '核心目标是打通长期记忆、今日工作台与智能体动作确认闭环，消除静态页面割裂感。',
          tags: ['产品评审', '架构', 'V2'],
          confidence: 0.98,
          created_at: ts,
          updated_at: ts
        },
        {
          id: 'mem-seed-2',
          category: 'preferences',
          title: '偏好结构化、结论先行的沟通方式',
          content: '汇报与方案整理时优先列出核心结论、风险点与可执行的下一步行动。',
          tags: ['沟通偏好', '效率', '工作流'],
          confidence: 0.96,
          created_at: ts,
          updated_at: ts
        },
        {
          id: 'mem-seed-3',
          category: 'relationships',
          title: '产品评审核心协作人：林峰（设计）、陈晨（研发）',
          content: '周五下午评审前需与林峰确认交互终稿，与陈晨对齐接口配额策略。',
          tags: ['团队协作', '设计', '研发'],
          confidence: 0.94,
          created_at: ts,
          updated_at: ts
        },
        {
          id: 'mem-seed-4',
          category: 'personal',
          title: '深度工作时段集中在上午 09:30 – 11:30',
          content: '重要架构设计与核心文档撰写优先排在上午，下午集中处理会议与外部协同。',
          tags: ['时间管理', '习惯'],
          confidence: 0.95,
          created_at: ts,
          updated_at: ts
        }
      ],
      tasks: [
        {
          id: 'task-seed-1',
          title: '确认 ATLAS V2 用户核心流程与评审材料',
          notes: '结合最近 3 次用户访谈纪要，收敛首屏工作台与智能体确认交互。',
          status: 'in_progress',
          priority: 'high',
          due_date: '周五 14:00',
          project: '产品评审',
          source: 'system_seed',
          created_at: ts,
          updated_at: ts
        },
        {
          id: 'task-seed-2',
          title: '复核知识图谱节点关联与隐私边界说明',
          notes: '确保所有记忆条目支持按分类筛选、实时增删与来源回溯。',
          status: 'todo',
          priority: 'medium',
          due_date: '本周内',
          project: '智能记忆',
          source: 'system_seed',
          created_at: ts,
          updated_at: ts
        },
        {
          id: 'task-seed-3',
          title: '完成 ECS Ollama 接口压测与每日配额验证',
          notes: '验证 20 次/日限额与个人上下文注入稳定性。',
          status: 'done',
          priority: 'medium',
          due_date: '已完成',
          project: '后端架构',
          source: 'system_seed',
          created_at: ts,
          updated_at: ts
        }
      ],
      inbox: [
        {
          id: 'inb-seed-1',
          text: '下周三下午和林峰复盘新版首页动态沙盒的用户点击热力图',
          parsed_type: 'collaborative_task',
          status: 'pending',
          created_at: ts
        }
      ],
      agent_actions: [
        {
          id: 'act-seed-1',
          agent_name: '规划智能体 · Planner',
          title: '生成周五产品评审会前准备清单',
          summary: '根据记忆中的协作人（林峰、陈晨）与当前重点任务，自动拆解 1 项高优会前同步任务。',
          action_type: 'create_task',
          payload: {
            title: '会前与林峰、陈晨同步 V2 评审定稿与接口方案',
            priority: 'high',
            due_date: '周五 11:00',
            project: '产品评审'
          },
          status: 'pending',
          created_at: ts,
          updated_at: ts
        },
        {
          id: 'act-seed-2',
          agent_name: '记忆整理智能体 · Curator',
          title: '归档本周用户访谈关键结论到长期记忆',
          summary: '将访谈中高频出现的“希望直接在首页体验动态拆解”提炼为产品工作记忆。',
          action_type: 'create_memory',
          payload: {
            category: 'work',
            title: '用户访谈洞察：首屏即时交互显著提升信任感',
            content: '受访用户普遍希望无需繁琐配置即可在工作台体验任务拆解与记忆关联。',
            tags: ['用户访谈', '产品洞察', '转化率']
          },
          status: 'pending',
          created_at: ts,
          updated_at: ts
        }
      ]
    };
  }

  function analyzeNaturalInputLocal(rawText, memories) {
    const text = String(rawText || '').trim();
    if (!text) return null;

    const scheduleMatch = text.match(
      /(今天|明天|后天|本周[一二三四五六日天]?|下周[一二三四五六日天]?|周[一二三四五六日天]|\d{1,2}月\d{1,2}日|\d{1,2}:\d{2}|(?:上午|下午|晚上)\s*\d{1,2}\s*[点:：]\d{0,2})/
    );
    const dueDate = scheduleMatch ? scheduleMatch[0] : '今日待办';

    const isHigh = /(紧急|高优|评审|截止|马上|立刻|重要|上线|終稿|终稿)/.test(text);
    const priority = isHigh ? 'high' : 'medium';

    let intent = 'task';
    let category = 'work';
    if (/(偏好|习惯|喜欢|原则|记住|风格)/.test(text)) {
      intent = 'memory';
      category = 'preferences';
    } else if (/(会议|评审|约|讨论|同步|林峰|陈晨|团队|访谈)/.test(text)) {
      intent = 'collaborative_task';
      category = 'work';
    }

    const project = /(评审|V2|v2|原型)/.test(text)
      ? '产品评审'
      : /(记忆|图谱|知识)/.test(text)
      ? '智能记忆'
      : '个人工作台';

    const memList = Array.isArray(memories) ? memories : [];
    const matchedMemories = memList.filter((m) => {
      const tags = Array.isArray(m.tags) ? m.tags : [];
      return (
        tags.some((t) => text.includes(t)) ||
        ['评审', '林峰', '陈晨', '访谈', '架构', '偏好', '沟通'].some(
          (kw) => text.includes(kw) && (m.title.includes(kw) || m.content.includes(kw))
        )
      );
    });

    const related = (matchedMemories.length ? matchedMemories : memList.slice(0, 2))
      .slice(0, 3)
      .map((m) => ({ id: m.id, title: m.title, category: m.category }));

    return {
      raw_text: text,
      intent: intent,
      extracted_task: {
        title: text.slice(0, 84),
        priority: priority,
        due_date: dueDate,
        project: project
      },
      extracted_memory: {
        category: category,
        title: (intent === 'memory' ? text : '上下文记录：' + text).slice(0, 48),
        content: text,
        tags: [project, dueDate, intent === 'memory' ? '个人偏好' : '任务上下文']
      },
      related_memories: related,
      suggested_action: {
        agent_name: intent === 'memory' ? '记忆整理智能体 · Curator' : '规划智能体 · Planner',
        title:
          intent === 'memory'
            ? `将「${text.slice(0, 22)}」归档至长期记忆 (${category})`
            : `将「${text.slice(0, 22)}」排入「${project}」(${dueDate})`,
        summary: `已识别时间锚点（${dueDate}）、优先级（${
          priority === 'high' ? '高优先级' : '常规推进'
        }）并关联 ${related.length} 条已有记忆，确认后立即写入工作台。`
      }
    };
  }

  function loadLocalState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.memories) && Array.isArray(parsed.tasks)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('AtlasOS: unable to read local state', err);
    }

    const initial = getDefaultState();
    // Migrate any legacy inbox items from home-inbox.js if present
    try {
      const legacyRaw = window.localStorage.getItem(LEGACY_INBOX_KEY);
      if (legacyRaw) {
        const legacyItems = JSON.parse(legacyRaw);
        if (Array.isArray(legacyItems) && legacyItems.length) {
          legacyItems.slice(0, 15).forEach((item) => {
            if (item && typeof item.text === 'string' && item.text.trim()) {
              initial.inbox.unshift({
                id: item.id || uid('inb'),
                text: item.text.trim(),
                parsed_type: 'note',
                status: 'pending',
                created_at: item.createdAt || nowIso()
              });
            }
          });
        }
      }
    } catch (_) {
      // ignore migration errors
    }
    saveLocalState(initial);
    return initial;
  }

  function saveLocalState(nextState) {
    nextState.lastUpdated = nowIso();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      // Keep legacy inbox key in sync so home-inbox.js also reflects pending items seamlessly
      const legacyList = (nextState.inbox || [])
        .filter((i) => i.status === 'pending')
        .map((i) => ({ id: i.id, text: i.text, createdAt: i.created_at }));
      window.localStorage.setItem(LEGACY_INBOX_KEY, JSON.stringify(legacyList));
    } catch (err) {
      console.warn('AtlasOS: unable to persist state', err);
    }
  }

  let currentState = loadLocalState();
  const subscribers = new Set();

  function notify() {
    const snapshot = getState();
    subscribers.forEach((fn) => {
      try {
        fn(snapshot);
      } catch (err) {
        console.error('AtlasOS subscriber error:', err);
      }
    });
    window.dispatchEvent(new CustomEvent('atlas:state-change', { detail: snapshot }));
  }

  function computeSummary(stateObj) {
    const memories = stateObj.memories || [];
    const tasks = stateObj.tasks || [];
    const inbox = stateObj.inbox || [];
    const actions = stateObj.agent_actions || [];
    return {
      total_memories: memories.length,
      active_tasks: tasks.filter((t) => t.status !== 'done').length,
      in_progress_tasks: tasks.filter((t) => t.status === 'in_progress').length,
      completed_tasks: tasks.filter((t) => t.status === 'done').length,
      pending_inbox: inbox.filter((i) => i.status === 'pending').length,
      pending_actions: actions.filter((a) => a.status === 'pending').length,
      executed_actions: actions.filter((a) => a.status === 'executed').length
    };
  }

  function getState() {
    return {
      ...currentState,
      summary: computeSummary(currentState)
    };
  }

  async function getAccessToken() {
    try {
      if (window.AtlasSupabaseAuth && typeof window.AtlasSupabaseAuth.getAccessToken === 'function') {
        return await window.AtlasSupabaseAuth.getAccessToken();
      }
      // Fallback: inspect supabase auth token in localStorage
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          const session = JSON.parse(window.localStorage.getItem(key) || '{}');
          if (session && session.access_token) return session.access_token;
        }
      }
    } catch (_) {
      return null;
    }
    return null;
  }

  function getApiBaseUrl() {
    return (window.ATLAS_AI_CONFIG && window.ATLAS_AI_CONFIG.apiBaseUrl) || '';
  }

  async function apiRequest(path, options = {}) {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) return null;
    const token = await getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    try {
      const response = await window.fetch(`${baseUrl}${path}`, {
        ...options,
        headers
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (_) {
      return null;
    }
  }

  async function syncFromCloud() {
    const token = await getAccessToken();
    if (!token) return false;
    const remote = await apiRequest('/api/state', { method: 'GET' });
    if (remote && Array.isArray(remote.memories) && Array.isArray(remote.tasks)) {
      currentState = {
        ...currentState,
        syncedWithCloud: true,
        memories: remote.memories,
        tasks: remote.tasks,
        inbox: Array.isArray(remote.inbox) ? remote.inbox : currentState.inbox,
        agent_actions: Array.isArray(remote.agent_actions) ? remote.agent_actions : currentState.agent_actions
      };
      saveLocalState(currentState);
      notify();
      return true;
    }
    return false;
  }

  // Listen for cross-tab storage updates
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        currentState = JSON.parse(event.newValue);
        notify();
      } catch (_) {
        // ignore malformed storage
      }
    }
  });

  const AtlasOS = {
    getState,
    subscribe(callback) {
      if (typeof callback === 'function') {
        subscribers.add(callback);
        return () => subscribers.delete(callback);
      }
      return () => {};
    },
    syncFromCloud,

    analyzeInput(text) {
      return analyzeNaturalInputLocal(text, currentState.memories);
    },

    async analyzeInputAsync(text) {
      const localResult = analyzeNaturalInputLocal(text, currentState.memories);
      const remote = await apiRequest('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ text })
      });
      return (remote && remote.analysis) || localResult;
    },

    addInboxItem(text) {
      const cleaned = String(text || '').trim();
      if (!cleaned) throw new Error('请输入要记录的内容');
      const analysis = analyzeNaturalInputLocal(cleaned, currentState.memories);
      const item = {
        id: uid('inb'),
        text: cleaned.slice(0, 240),
        parsed_type: analysis ? analysis.intent : 'note',
        status: 'pending',
        created_at: nowIso(),
        analysis
      };
      currentState.inbox = [item, ...(currentState.inbox || [])];
      saveLocalState(currentState);
      notify();

      apiRequest('/api/inbox', {
        method: 'POST',
        body: JSON.stringify({ text: item.text })
      });
      return item;
    },

    promoteInboxItem(itemId) {
      const target = (currentState.inbox || []).find((i) => i.id === itemId);
      if (!target) return null;
      target.status = 'promoted';
      const analysis = analyzeNaturalInputLocal(target.text, currentState.memories);
      const newTask = this.addTask({
        title: analysis.extracted_task.title,
        notes: `由随手收集箱结构化升级（原记录：${target.text}）`,
        priority: analysis.extracted_task.priority,
        due_date: analysis.extracted_task.due_date,
        project: analysis.extracted_task.project,
        source: 'inbox_promoted'
      });
      saveLocalState(currentState);
      notify();

      apiRequest(`/api/inbox/${encodeURIComponent(itemId)}/promote`, {
        method: 'POST',
        body: JSON.stringify({})
      });
      return newTask;
    },

    deleteInboxItem(itemId) {
      currentState.inbox = (currentState.inbox || []).filter((i) => i.id !== itemId);
      saveLocalState(currentState);
      notify();
      apiRequest(`/api/inbox/${encodeURIComponent(itemId)}`, { method: 'DELETE' });
    },

    addTask(data) {
      const title = String((data && data.title) || '').trim();
      if (!title) throw new Error('请输入任务标题');
      const ts = nowIso();
      const task = {
        id: uid('task'),
        title: title.slice(0, 200),
        notes: String((data && data.notes) || '').trim().slice(0, 600),
        status: ['todo', 'in_progress', 'done'].includes(data && data.status) ? data.status : 'todo',
        priority: ['high', 'medium', 'low'].includes(data && data.priority) ? data.priority : 'medium',
        due_date: String((data && data.due_date) || '今日待办').trim(),
        project: String((data && data.project) || '个人工作台').trim(),
        source: String((data && data.source) || 'manual').trim(),
        created_at: ts,
        updated_at: ts
      };
      currentState.tasks = [task, ...(currentState.tasks || [])];
      saveLocalState(currentState);
      notify();

      apiRequest('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(task)
      });
      return task;
    },

    toggleTaskStatus(taskId) {
      const task = (currentState.tasks || []).find((t) => t.id === taskId);
      if (!task) return null;
      const nextStatus = task.status === 'done' ? 'todo' : 'done';
      return this.updateTask(taskId, { status: nextStatus });
    },

    updateTask(taskId, patch) {
      const task = (currentState.tasks || []).find((t) => t.id === taskId);
      if (!task) return null;
      Object.assign(task, patch, { updated_at: nowIso() });
      saveLocalState(currentState);
      notify();

      apiRequest(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: 'PATCH',
        body: JSON.stringify(patch)
      });
      return task;
    },

    deleteTask(taskId) {
      currentState.tasks = (currentState.tasks || []).filter((t) => t.id !== taskId);
      saveLocalState(currentState);
      notify();
      apiRequest(`/api/tasks/${encodeURIComponent(taskId)}`, { method: 'DELETE' });
    },

    addMemory(data) {
      const title = String((data && data.title) || '').trim();
      const content = String((data && data.content) || title).trim();
      if (!title) throw new Error('请输入记忆标题');
      const category = ['personal', 'preferences', 'work', 'relationships'].includes(data && data.category)
        ? data.category
        : 'work';
      const ts = nowIso();
      const mem = {
        id: uid('mem'),
        category,
        title: title.slice(0, 160),
        content: content.slice(0, 1000),
        tags: Array.isArray(data && data.tags) && data.tags.length ? data.tags.slice(0, 6) : ['动态记录'],
        confidence: 0.96,
        created_at: ts,
        updated_at: ts
      };
      currentState.memories = [mem, ...(currentState.memories || [])];
      saveLocalState(currentState);
      notify();

      apiRequest('/api/memories', {
        method: 'POST',
        body: JSON.stringify(mem)
      });
      return mem;
    },

    deleteMemory(memoryId) {
      currentState.memories = (currentState.memories || []).filter((m) => m.id !== memoryId);
      saveLocalState(currentState);
      notify();
      apiRequest(`/api/memories/${encodeURIComponent(memoryId)}`, { method: 'DELETE' });
    },

    addAgentAction(goalText) {
      const cleaned = String(goalText || '').trim();
      if (!cleaned) throw new Error('请输入智能体目标');
      const analysis = analyzeNaturalInputLocal(cleaned, currentState.memories);
      const isMem = analysis && analysis.intent === 'memory';
      const ts = nowIso();
      const action = {
        id: uid('act'),
        agent_name: isMem ? '记忆整理智能体 · Curator' : '规划智能体 · Planner',
        title: analysis ? analysis.suggested_action.title : `拆解目标：${cleaned.slice(0, 32)}`,
        summary: analysis
          ? analysis.suggested_action.summary
          : '已解析目标并生成可执行建议，等待你的确认。',
        action_type: isMem ? 'create_memory' : 'create_task',
        payload: isMem ? analysis.extracted_memory : analysis.extracted_task,
        status: 'pending',
        created_at: ts,
        updated_at: ts
      };
      currentState.agent_actions = [action, ...(currentState.agent_actions || [])];
      saveLocalState(currentState);
      notify();

      apiRequest('/api/agents/actions', {
        method: 'POST',
        body: JSON.stringify({ goal: cleaned })
      });
      return action;
    },

    decideAgentAction(actionId, decision) {
      const action = (currentState.agent_actions || []).find((a) => a.id === actionId);
      if (!action) return null;
      action.status = decision === 'approve' ? 'executed' : 'deferred';
      action.updated_at = nowIso();

      let createdEntity = null;
      if (decision === 'approve') {
        const payload = action.payload || {};
        if (action.action_type === 'create_memory') {
          createdEntity = this.addMemory({
            category: payload.category || 'work',
            title: payload.title || action.title,
            content: payload.content || action.summary,
            tags: payload.tags || ['智能体归档']
          });
        } else {
          createdEntity = this.addTask({
            title: payload.title || action.title,
            notes: `由 ${action.agent_name} 提议并经你确认执行`,
            priority: payload.priority || 'high',
            due_date: payload.due_date || '待排期',
            project: payload.project || '智能体协同',
            source: 'agent_approved'
          });
        }
      }
      saveLocalState(currentState);
      notify();

      apiRequest(`/api/agents/actions/${encodeURIComponent(actionId)}/decision`, {
        method: 'POST',
        body: JSON.stringify({ decision })
      });
      return { action, createdEntity };
    },

    commitSandboxAnalysis(rawText) {
      const analysis = analyzeNaturalInputLocal(rawText, currentState.memories);
      if (!analysis) return null;
      const createdTask = this.addTask({
        title: analysis.extracted_task.title,
        notes: `来自 ATLAS 实时上下文沙盒拆解`,
        priority: analysis.extracted_task.priority,
        due_date: analysis.extracted_task.due_date,
        project: analysis.extracted_task.project,
        status: 'in_progress',
        source: 'live_sandbox'
      });
      const createdMemory = this.addMemory({
        category: analysis.extracted_memory.category,
        title: analysis.extracted_memory.title,
        content: `关联任务「${createdTask.title}」，识别时间节点：${analysis.extracted_task.due_date}。`,
        tags: analysis.extracted_memory.tags
      });
      return { analysis, createdTask, createdMemory };
    },

    buildPromptContextSummary() {
      const state = getState();
      const topMemories = state.memories.slice(0, 5);
      const activeTasks = state.tasks.filter((t) => t.status !== 'done').slice(0, 5);
      const lines = [];
      if (topMemories.length) {
        lines.push('【用户长期记忆】');
        topMemories.forEach((m) => lines.push(`- [${m.category}] ${m.title}：${m.content}`));
      }
      if (activeTasks.length) {
        lines.push('【当前待办任务】');
        activeTasks.forEach((t) => lines.push(`- (${t.priority} / ${t.due_date}) ${t.title}`));
      }
      return {
        contextBlock: lines.join('\n'),
        memoryCount: topMemories.length,
        taskCount: activeTasks.length,
        refs: [
          ...topMemories.map((m) => ({ type: '记忆', title: m.title })),
          ...activeTasks.map((t) => ({ type: '任务', title: t.title }))
        ]
      };
    },

    resetDemoData() {
      currentState = getDefaultState();
      saveLocalState(currentState);
      notify();
      return getState();
    }
  };

  window.AtlasOS = AtlasOS;

  // Attempt background cloud sync once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      AtlasOS.syncFromCloud();
    });
  } else {
    AtlasOS.syncFromCloud();
  }
})(window, document);
