(() => {
  const root = document.querySelector('.agent-workflow-demo');
  if (!(root instanceof HTMLElement)) return;

  const panels = [...root.querySelectorAll('[data-agent-panel]')];
  const progress = [...root.querySelectorAll('[data-agent-progress]')];
  const nextButtons = [...root.querySelectorAll('[data-agent-next]')];
  const confirmButton = root.querySelector('[data-agent-confirm]');
  const deferButton = root.querySelector('[data-agent-defer]');
  const resetButton = root.querySelector('[data-agent-reset]');
  const status = root.querySelector('[data-agent-status]');
  const statusMessages = {
    'zh-hk': {
      waiting: '目前為互動演示，不會觸發外部操作。',
      confirmed: '已在頁面演示中確認，沒有建立任務或呼叫外部服務。',
      deferred: '已在頁面演示中暫不採用，沒有更改帳戶或任務資料。'
    },
    'zh-tw': {
      waiting: '目前為互動示範，不會觸發外部操作。',
      confirmed: '已在頁面示範中確認，沒有建立任務或呼叫外部服務。',
      deferred: '已在頁面示範中暫不採用，沒有更改帳戶或任務資料。'
    },
    en: {
      waiting: 'This interactive demo does not trigger external actions.',
      confirmed: 'Confirmed in the page demo. No task was created and no external service was called.',
      deferred: 'Set aside in the page demo. No account or task data was changed.'
    },
    ja: {
      waiting: 'このインタラクティブデモでは外部操作を行いません。',
      confirmed: 'ページ上のデモで確認しました。タスク作成や外部サービス呼び出しは行っていません。',
      deferred: 'ページ上のデモで見送りました。アカウントやタスクデータは変更されていません。'
    },
    ko: {
      waiting: '이 인터랙티브 데모는 외부 작업을 실행하지 않습니다.',
      confirmed: '페이지 데모에서 확인했습니다. 작업 생성이나 외부 서비스 호출은 없었습니다.',
      deferred: '페이지 데모에서 보류했습니다. 계정이나 작업 데이터는 변경되지 않았습니다.'
    }
  };
  const locale = document.documentElement.lang.toLowerCase();
  const messages = statusMessages[locale] || statusMessages[locale.split('-')[0]] || {
    waiting: '当前为交互演示，不会触发外部操作。',
    confirmed: '已在页面演示中确认，没有创建任务或调用外部服务。',
    deferred: '已在页面演示中暂不采用，没有更改账户或任务数据。'
  };

  if (panels.length !== 5 || progress.length !== 4 || nextButtons.length !== 2 ||
      !(confirmButton instanceof HTMLButtonElement) ||
      !(deferButton instanceof HTMLButtonElement) ||
      !(resetButton instanceof HTMLButtonElement) ||
      !(status instanceof HTMLElement)) {
    console.error('The ATLAS agent workflow demo is missing required steps or controls.');
    return;
  }

  let state = 0;
  const stateToProgress = [0, 1, 2, 3, 3];

  const render = () => {
    panels.forEach((panel, index) => {
      panel.hidden = index !== state;
    });
    progress.forEach((step, index) => {
      const current = index === stateToProgress[state];
      step.toggleAttribute('aria-current', current);
      if (current) step.setAttribute('aria-current', 'step');
      step.classList.toggle('is-complete', index < stateToProgress[state]);
    });
    nextButtons.forEach((button) => {
      button.hidden = state > 1;
    });
    confirmButton.hidden = state !== 2;
    deferButton.hidden = state !== 2;
    resetButton.hidden = state < 3;
    status.textContent = state < 3
      ? messages.waiting
      : state === 3
        ? messages.confirmed
        : messages.deferred;
  };

  nextButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (state < 2) {
        state += 1;
        render();
      }
    });
  });
  confirmButton.addEventListener('click', () => {
    if (state === 2) {
      state = 3;
      render();
    }
  });
  deferButton.addEventListener('click', () => {
    if (state === 2) {
      state = 4;
      render();
    }
  });
  resetButton.addEventListener('click', () => {
    state = 0;
    render();
  });

  render();
})();
