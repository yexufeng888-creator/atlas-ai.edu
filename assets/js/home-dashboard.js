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
  const briefCopy = {
    'zh-cn': {
      eyebrow: '每日简报',
      title: '今日简报',
      badge: '示例数据',
      focusLabel: '优先任务',
      nextLabel: '下一项安排',
      noFocus: '重点任务已完成',
      noNext: '今日暂无后续安排',
      tasksLink: '查看任务 →',
      calendarLink: '查看日程 →',
      summary: (count, next) => count
        ? `还有 ${count} 项重点任务待处理${next ? `；${next.time} 将开始「${next.title}」` : ''}。`
        : next
          ? `今日重点任务已完成；下一项安排是 ${next.time} 的「${next.title}」。`
          : '今日重点任务已全部完成。',
      recommendation: (taskName) => taskName
        ? `建议先推进「${taskName}」，再根据下一项安排调整节奏。`
        : '重点任务已全部完成，可用剩余时间做回顾或休息。'
    },
    'zh-hk': {
      eyebrow: '每日摘要',
      title: '今日摘要',
      badge: '示例資料',
      focusLabel: '優先任務',
      nextLabel: '下一項安排',
      noFocus: '重點任務已完成',
      noNext: '今天沒有後續行程',
      tasksLink: '查看任務 →',
      calendarLink: '查看行程 →',
      summary: (count, next) => count
        ? `還有 ${count} 項重點任務待處理${next ? `；${next.time} 將開始「${next.title}」` : ''}。`
        : next
          ? `今日重點任務已完成；下一項安排是 ${next.time} 的「${next.title}」。`
          : '今日重點任務已全部完成。',
      recommendation: (taskName) => taskName
        ? `建議先處理「${taskName}」，再按下一項安排調整節奏。`
        : '重點任務已全部完成，可利用餘下時間回顧或休息。'
    },
    'zh-tw': {
      eyebrow: '每日摘要',
      title: '今日摘要',
      badge: '示例資料',
      focusLabel: '優先任務',
      nextLabel: '下一項安排',
      noFocus: '重點任務已完成',
      noNext: '今天沒有後續行程',
      tasksLink: '查看任務 →',
      calendarLink: '查看行程 →',
      summary: (count, next) => count
        ? `還有 ${count} 項重點任務待處理${next ? `；${next.time} 將開始「${next.title}」` : ''}。`
        : next
          ? `今日重點任務已完成；下一項安排是 ${next.time} 的「${next.title}」。`
          : '今日重點任務已全部完成。',
      recommendation: (taskName) => taskName
        ? `建議先處理「${taskName}」，再依下一項安排調整節奏。`
        : '重點任務已全部完成，可利用剩餘時間回顧或休息。'
    },
    en: {
      eyebrow: 'DAILY BRIEF',
      title: 'Your daily brief',
      badge: 'Sample data',
      focusLabel: 'Priority task',
      nextLabel: 'Up next',
      noFocus: 'All highlighted tasks complete',
      noNext: 'No more events today',
      tasksLink: 'View tasks →',
      calendarLink: 'View calendar →',
      summary: (count, next) => count
        ? `${count} highlighted task${count === 1 ? '' : 's'} remain${next ? `; “${next.title}” is next at ${next.time}` : ''}.`
        : next
          ? `Your highlighted tasks are complete. Next up at ${next.time}: “${next.title}”.`
          : 'All highlighted tasks are complete for today.',
      recommendation: (taskName) => taskName
        ? `Consider prioritizing “${taskName}”, then adjust your pace around the next event.`
        : 'Your highlighted tasks are done. Use the remaining time to review or recharge.'
    },
    ja: {
      eyebrow: '今日のブリーフィング',
      title: '今日の概要',
      badge: 'サンプルデータ',
      focusLabel: '優先タスク',
      nextLabel: '次の予定',
      noFocus: '重点タスクは完了しました',
      noNext: '今日はこの後の予定はありません',
      tasksLink: 'タスクを見る →',
      calendarLink: '予定を見る →',
      summary: (count, next) => count
        ? `重点タスクが ${count} 件残っています${next ? `。次の予定は ${next.time} の「${next.title}」です` : ''}。`
        : next
          ? `重点タスクは完了しました。次の予定は ${next.time} の「${next.title}」です。`
          : '今日の重点タスクはすべて完了しました。',
      recommendation: (taskName) => taskName
        ? `まず「${taskName}」に取り組み、次の予定に合わせて調整しましょう。`
        : '重点タスクはすべて完了しました。残りの時間は振り返りや休憩に使えます。'
    },
    ko: {
      eyebrow: '오늘의 브리핑',
      title: '오늘의 요약',
      badge: '샘플 데이터',
      focusLabel: '우선 작업',
      nextLabel: '다음 일정',
      noFocus: '중요 작업을 모두 완료했어요',
      noNext: '오늘 남은 일정이 없어요',
      tasksLink: '작업 보기 →',
      calendarLink: '일정 보기 →',
      summary: (count, next) => count
        ? `중요 작업 ${count}개가 남아 있어요${next ? `. 다음 일정은 ${next.time} ${next.title}예요` : ''}.`
        : next
          ? `중요 작업을 모두 완료했어요. 다음 일정은 ${next.time} ${next.title}예요.`
          : '오늘의 중요 작업을 모두 완료했어요.',
      recommendation: (taskName) => taskName
        ? `먼저 ${taskName} 작업을 진행하고 다음 일정에 맞춰 계획을 조정해 보세요.`
        : '중요 작업을 모두 완료했어요. 남은 시간은 회고나 휴식에 활용해 보세요.'
    }
  };
  const briefLanguage = briefCopy[locale] || briefCopy['zh-cn'];
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

    return {
      row,
      button,
      initiallyComplete,
      isComplete,
      taskName,
      priority: Number(row.dataset.priority) || Number.MAX_SAFE_INTEGER
    };
  });
  const briefElements = {
    eyebrow: document.getElementById('dailyBriefEyebrow'),
    title: document.getElementById('dailyBriefTitle'),
    badge: document.getElementById('dailyBriefBadge'),
    summary: document.getElementById('dailyBriefSummary'),
    focusLabel: document.getElementById('dailyBriefFocusLabel'),
    focus: document.getElementById('dailyBriefFocus'),
    nextLabel: document.getElementById('dailyBriefNextLabel'),
    next: document.getElementById('dailyBriefNext'),
    recommendation: document.getElementById('dailyBriefRecommendation'),
    tasksLink: document.getElementById('dailyBriefTasksLink'),
    calendarLink: document.getElementById('dailyBriefCalendarLink')
  };
  const dailyEvents = Array.from(document.querySelectorAll('.dashboard-grid .timeline-item'))
    .map((item) => {
      const time = item.querySelector('[data-event-time]')?.dataset.eventTime || '';
      const match = /^(\d{1,2}):(\d{2})$/.exec(time);
      if (!match) return null;

      const hour = Number(match[1]);
      const minute = Number(match[2]);
      if (hour > 23 || minute > 59) return null;

      const title = item.querySelector('.timeline-content > div:first-child')?.textContent.trim() || '';
      if (!title) return null;

      return { time, title, minutes: hour * 60 + minute };
    })
    .filter((event) => event !== null);

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

  function updateDailyBrief() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const nextEvent = dailyEvents
      .filter((event) => event.minutes >= currentMinutes)
      .sort((first, second) => first.minutes - second.minutes)[0];
    const remainingTasks = tasks
      .filter((task) => !task.isComplete)
      .sort((first, second) => first.priority - second.priority);
    const priorityTask = remainingTasks[0];

    briefElements.eyebrow.textContent = briefLanguage.eyebrow;
    briefElements.title.textContent = briefLanguage.title;
    briefElements.badge.textContent = briefLanguage.badge;
    briefElements.summary.textContent = briefLanguage.summary(remainingTasks.length, nextEvent);
    briefElements.focusLabel.textContent = briefLanguage.focusLabel;
    briefElements.focus.textContent = priorityTask ? priorityTask.taskName : briefLanguage.noFocus;
    briefElements.nextLabel.textContent = briefLanguage.nextLabel;
    briefElements.next.textContent = nextEvent
      ? `${nextEvent.time} · ${nextEvent.title}`
      : briefLanguage.noNext;
    briefElements.recommendation.textContent = briefLanguage.recommendation(priorityTask?.taskName);
    briefElements.tasksLink.textContent = briefLanguage.tasksLink;
    briefElements.calendarLink.textContent = briefLanguage.calendarLink;
  }

  tasks.forEach((task) => setTaskState(task, task.isComplete));
  updateTaskCount();
  updateDailyBrief();
  window.setInterval(updateDailyBrief, 60_000);

  function toggleTask(task) {
    setTaskState(task, !task.isComplete);
    persistTasks();
    updateTaskCount();
    updateDailyBrief();
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
