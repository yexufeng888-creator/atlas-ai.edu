(function (window, document) {
  'use strict';

  const storageKey = 'atlas-dashboard-task-state';
  const locale = (document.documentElement.lang || 'zh-CN').toLowerCase();
  const labels = {
    'zh-cn': { complete: '标记为已完成', reopen: '重新打开' },
    'zh-hk': { complete: '標記為已完成', reopen: '重新開啟' },
    'zh-tw': { complete: '標示為已完成', reopen: '重新開啟' },
    en: { complete: 'Mark complete', reopen: 'Reopen task' },
    ja: { complete: '完了にする', reopen: 'タスクを再開' },
    ko: { complete: '완료로 표시', reopen: '작업 다시 열기' }
  };
  const language = labels[locale] || labels['zh-cn'];
  const helper = window.ATLASPageI18n;
  const translations = window.ATLASSecondaryDashboardI18n?.translations;
  const stored = window.localStorage.getItem(storageKey);
  const parsedStates = stored ? JSON.parse(stored) : {};
  const savedStates = parsedStates && typeof parsedStates === 'object' && !Array.isArray(parsedStates)
    ? parsedStates
    : {};
  const taskRows = Array.from(document.querySelectorAll('.task-item[data-task-id]'));
  const tasks = taskRows.map((row) => {
    const button = row.querySelector('[data-action="toggle-task"]');
    const initiallyComplete = row.dataset.completed === 'true';
    const savedState = savedStates[row.dataset.taskId];
    const isComplete = typeof savedState === 'boolean' ? savedState : initiallyComplete;
    const taskName = row.querySelector('.task-copy > div:first-child')?.textContent.trim() || '';

    return { row, button, initiallyComplete, isComplete, taskName };
  });

  function setTaskState(task, isComplete) {
    task.isComplete = isComplete;
    task.row.classList.toggle('is-complete', isComplete);
    task.button.classList.toggle('checked', isComplete);
    task.button.setAttribute('aria-pressed', String(isComplete));
    task.button.setAttribute(
      'aria-label',
      `${isComplete ? language.reopen : language.complete}: ${task.taskName}`
    );

    const status = task.row.querySelector('.task-status');
    if (status && helper && translations) {
      status.textContent = isComplete
        ? '✓'
        : helper.translate('进行中', translations);
    }
  }

  function persistTasks() {
    const state = {};
    tasks.forEach((task) => {
      state[task.row.dataset.taskId] = task.isComplete;
    });
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function updateTaskCount() {
    const count = tasks.reduce(
      (total, task) => total + Number(task.initiallyComplete) - Number(task.isComplete),
      5
    );
    const countElement = document.getElementById('taskCount');
    if (countElement) countElement.textContent = String(count);
  }

  tasks.forEach((task) => setTaskState(task, task.isComplete));
  updateTaskCount();

  function toggleTask(task) {
    setTaskState(task, !task.isComplete);
    persistTasks();
    updateTaskCount();
  }

  tasks.forEach((task) => {
    task.button.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleTask(task);
    });
    task.row.addEventListener('click', (event) => {
      if (event.target.closest('button')) return;
      event.stopPropagation();
      toggleTask(task);
    });
  });

  document.querySelectorAll('.dashboard-card[data-href]').forEach((card) => {
    const navigate = () => {
      window.location.href = card.dataset.href;
    };

    card.addEventListener('click', (event) => {
      if (event.target.closest('a, button')) return;
      navigate();
    });
    card.addEventListener('keydown', (event) => {
      if (event.target !== card || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      navigate();
    });
  });

  const now = new Date();
  const dateElement = document.getElementById('current-time');
  if (dateElement) {
    dateElement.textContent = new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric'
    }).format(now);
  }

  const weekdayElement = document.getElementById('current-weekday');
  if (weekdayElement) {
    weekdayElement.textContent = new Intl.DateTimeFormat(locale, {
      weekday: 'long'
    }).format(now);
  }
})(window, document);
