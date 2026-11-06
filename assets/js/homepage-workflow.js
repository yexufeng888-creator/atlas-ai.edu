(() => {
  const root = document.querySelector('.workflow-demo');
  if (!(root instanceof HTMLElement)) return;

  const steps = [...root.querySelectorAll('[data-workflow-step]')];
  const panels = [...root.querySelectorAll('[data-workflow-panel]')];
  const statusText = root.querySelector('[data-workflow-status]');
  const statusGroup = statusText?.parentElement;
  const confirmButton = root.querySelector('[data-workflow-confirm]');
  const deferButton = root.querySelector('[data-workflow-defer]');

  if (steps.length !== 5 || panels.length !== steps.length ||
      !(statusText instanceof HTMLElement) ||
      !(statusGroup instanceof HTMLElement) ||
      !(confirmButton instanceof HTMLButtonElement) ||
      !(deferButton instanceof HTMLButtonElement)) {
    console.error('The ATLAS workflow demo is missing a step, panel, or confirmation control.');
    return;
  }

  const setActiveStep = (activeIndex) => {
    steps.forEach((step, index) => {
      const active = index === activeIndex;
      step.classList.toggle('is-active', active);
      step.setAttribute('aria-pressed', String(active));
      panels[index].classList.toggle('is-active', active);
      panels[index].hidden = !active;
    });
  };

  const updateConfirmation = (nextState) => {
    statusText.dataset.state = nextState;
    statusGroup.classList.toggle('is-confirmed', nextState === 'confirmed');
    statusGroup.classList.toggle('is-deferred', nextState === 'deferred');
    if (nextState === 'confirmed') {
      if (window.AtlasOS) {
        window.AtlasOS.addTask({
          title: '核对新版用户流程与产品评审待确认问题',
          notes: '由首页 5 步工作流演练确认生成',
          priority: 'high',
          due_date: '周五评审前',
          project: '产品评审',
          source: 'workflow_demo'
        });
        if (typeof window.AtlasOS.toast === 'function') {
          window.AtlasOS.toast('已确认建议并写入工作台待办任务！');
        }
      }
      statusText.textContent = '已确认建议并同步至你的工作台待办列表（可按 ⌘K 查看）';
    } else if (nextState === 'deferred') {
      if (window.AtlasOS && typeof window.AtlasOS.toast === 'function') {
        window.AtlasOS.toast('已标记为暂不采用');
      }
      statusText.textContent = '已标记为暂不采用；没有更改工作台任务数据';
    }
    confirmButton.disabled = nextState !== 'waiting';
    deferButton.disabled = nextState !== 'waiting';
  };

  steps.forEach((step, index) => {
    step.addEventListener('click', () => setActiveStep(index));
  });
  confirmButton.addEventListener('click', () => updateConfirmation('confirmed'));
  deferButton.addEventListener('click', () => updateConfirmation('deferred'));
})();
