(() => {
  const card = document.querySelector('.action-demo-card');
  const badge = document.querySelector('[data-demo-badge]');
  const status = document.querySelector('[data-demo-status]');
  const actionGroup = document.querySelector('.action-demo-controls');
  const editForm = document.querySelector('[data-demo-edit-form]');
  const editField = editForm?.querySelector('#actionDemoText');
  const planItem = document.querySelector('#actionDemoPlanItem');
  const actions = [...document.querySelectorAll('[data-demo-action]')];
  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
  const translations = {
    'zh-cn': {
      eyebrow: '演示体验 · 用户确认',
      title: '待确认操作',
      description: '先检查建议内容与执行范围，再决定是否继续。',
      notice: '演示说明：以下资料和操作均为示例。当前页面只模拟状态变化，不会写入工作台、预订服务、发送邮件或调用外部操作。',
      sample: '示例项目 · 需要用户确认',
      task: '准备产品评审清单',
      owner: '项目助理 · 演示任务',
      waiting: '待确认',
      planTitle: '建议计划',
      plan: ['核对新版用户流程', '整理仍需确认的问题', '形成评审前的准备清单'],
      basisTitle: '建议依据',
      basis: '示例关联：用户访谈摘录、项目目标与待确认事项。采取行动前，请核对资料来源。',
      group: '选择如何处理此示例建议',
      buttons: { confirm: '确认建议', edit: '修改建议', defer: '暂不采用', save: '保存到演示', cancel: '取消' },
      label: '修改建议内容',
      defaultEdit: '核对新版用户流程，并整理待确认问题。',
      statusWaiting: '等待你的选择。当前操作只更新此页面的演示状态。',
      statusConfirmed: '已在页面演示中确认；没有创建任务或调用外部服务。',
      statusDeferred: '已在页面演示中暂不采用；没有更改账户或任务数据。',
      statusEdited: '已在当前页面更新示例建议，未保存到后台。',
      statusEmpty: '请先填写建议内容。',
      statusRejected: '暂不采用',
      boundaryTitle: '操作边界',
      boundary: '外部操作需要相应的接入能力与权限。本演示不会创建任务、发送邮件、预订服务或修改账户数据。',
      boundaryLink: '查看执行规则说明'
    },
    'zh-hk': {
      eyebrow: '演示體驗 · 用戶確認',
      title: '待確認操作',
      description: '先檢查建議內容與執行範圍，再決定是否繼續。',
      notice: '演示說明：以下資料和操作均為示例。此頁面只模擬狀態變化，不會寫入工作台、預訂服務、傳送郵件或呼叫外部操作。',
      sample: '示例項目 · 需要用戶確認',
      task: '準備產品評審清單',
      owner: '項目助理 · 演示任務',
      waiting: '待確認',
      planTitle: '建議計劃',
      plan: ['核對新版用戶流程', '整理仍需確認的問題', '形成評審前的準備清單'],
      basisTitle: '建議依據',
      basis: '示例關聯：用戶訪談摘錄、項目目標與待確認事項。採取行動前，請核對資料來源。',
      group: '選擇如何處理此示例建議',
      buttons: { confirm: '確認建議', edit: '修改建議', defer: '暫不採用', save: '儲存至演示', cancel: '取消' },
      label: '修改建議內容',
      defaultEdit: '核對新版用戶流程，並整理待確認問題。',
      statusWaiting: '等待你的選擇。目前操作只更新此頁面的演示狀態。',
      statusConfirmed: '已在頁面演示中確認；沒有建立任務或呼叫外部服務。',
      statusDeferred: '已在頁面演示中暫不採用；沒有更改帳戶或任務資料。',
      statusEdited: '已在目前頁面更新示例建議，未儲存到後台。',
      statusEmpty: '請先填寫建議內容。',
      statusRejected: '暫不採用',
      boundaryTitle: '操作界線',
      boundary: '外部操作需要相應的接入能力與權限。本演示不會建立任務、傳送郵件、預訂服務或修改帳戶資料。',
      boundaryLink: '查看執行規則說明'
    },
    'zh-tw': {
      eyebrow: '示範體驗 · 使用者確認',
      title: '待確認操作',
      description: '先檢查建議內容與執行範圍，再決定是否繼續。',
      notice: '示範說明：以下資料和操作均為範例。此頁面只模擬狀態變化，不會寫入工作台、預訂服務、傳送郵件或呼叫外部操作。',
      sample: '範例專案 · 需要使用者確認',
      task: '準備產品評審清單',
      owner: '專案助理 · 示範任務',
      waiting: '待確認',
      planTitle: '建議計畫',
      plan: ['核對新版使用者流程', '整理仍需確認的問題', '形成評審前的準備清單'],
      basisTitle: '建議依據',
      basis: '範例關聯：使用者訪談摘錄、專案目標與待確認事項。採取行動前，請核對資料來源。',
      group: '選擇如何處理此範例建議',
      buttons: { confirm: '確認建議', edit: '修改建議', defer: '暫不採用', save: '儲存至示範', cancel: '取消' },
      label: '修改建議內容',
      defaultEdit: '核對新版使用者流程，並整理待確認問題。',
      statusWaiting: '等待你的選擇。目前操作只更新此頁面的示範狀態。',
      statusConfirmed: '已在頁面示範中確認；沒有建立任務或呼叫外部服務。',
      statusDeferred: '已在頁面示範中暫不採用；沒有更改帳戶或任務資料。',
      statusEdited: '已在目前頁面更新範例建議，未儲存到後台。',
      statusEmpty: '請先填寫建議內容。',
      statusRejected: '暫不採用',
      boundaryTitle: '操作界線',
      boundary: '外部操作需要相應的介接能力與權限。本示範不會建立任務、傳送郵件、預訂服務或修改帳戶資料。',
      boundaryLink: '查看執行規則說明'
    },
    en: {
      eyebrow: 'DEMO · USER CONFIRMATION',
      title: 'Actions awaiting confirmation',
      description: 'Review the suggestion and its scope before deciding what happens next.',
      notice: 'Demo: the information and actions below are examples. This page only simulates state changes; it does not update the workspace, book services, send email, or call external actions.',
      sample: 'Sample project · confirmation required',
      task: 'Prepare a product review checklist',
      owner: 'Project assistant · Demo task',
      waiting: 'Awaiting confirmation',
      planTitle: 'Suggested plan',
      plan: ['Review the updated user flow', 'List questions that still need confirmation', 'Prepare a checklist for the review'],
      basisTitle: 'Why this was suggested',
      basis: 'Sample context: interview notes, project goals, and open questions. Review sources before taking action.',
      group: 'Choose how to handle this sample suggestion',
      buttons: { confirm: 'Confirm suggestion', edit: 'Edit suggestion', defer: 'Set aside', save: 'Save demo text', cancel: 'Cancel' },
      label: 'Edit the suggestion',
      defaultEdit: 'Review the updated user flow and list outstanding questions.',
      statusWaiting: 'Waiting for your choice. This interaction only changes the demo on this page.',
      statusConfirmed: 'Confirmed in this page demo. No task was created and no external service was called.',
      statusDeferred: 'Set aside in this page demo. No account or task data was changed.',
      statusEdited: 'The sample suggestion was updated on this page only; it was not saved to a backend.',
      statusEmpty: 'Enter a suggestion before saving.',
      statusRejected: 'Set aside in demo',
      boundaryTitle: 'Action boundaries',
      boundary: 'External actions require the relevant integrations and permissions. This demo does not create tasks, send email, book services, or change account data.',
      boundaryLink: 'Review execution settings'
    },
    ja: {
      eyebrow: 'デモ · ユーザー確認',
      title: '確認待ちの操作',
      description: '提案内容と実行範囲を確認してから、次の操作を選べます。',
      notice: 'デモ：以下の情報と操作はサンプルです。このページは状態のみをシミュレートし、タスク更新、予約、メール送信、外部操作は行いません。',
      sample: 'サンプルプロジェクト · 確認が必要',
      task: '製品レビューのチェックリストを準備',
      owner: 'プロジェクトアシスタント · デモタスク',
      waiting: '確認待ち',
      planTitle: '提案された計画',
      plan: ['新しいユーザーフローを確認', '確認が必要な質問を整理', 'レビュー前のチェックリストを準備'],
      basisTitle: '提案の根拠',
      basis: 'サンプル情報：インタビュー記録、プロジェクト目標、未確認事項。操作前に出典を確認してください。',
      group: 'サンプル提案の処理方法を選択',
      buttons: { confirm: '提案を確認', edit: '提案を編集', defer: '今回は見送る', save: 'デモに保存', cancel: 'キャンセル' },
      label: '提案内容を編集',
      defaultEdit: '新しいユーザーフローを確認し、未解決の質問を整理します。',
      statusWaiting: '選択をお待ちしています。この操作ではページ上のデモ状態のみが変わります。',
      statusConfirmed: 'デモ内で確認しました。タスク作成や外部サービスの呼び出しは行っていません。',
      statusDeferred: 'デモ内で見送りました。アカウントやタスクデータは変更されていません。',
      statusEdited: 'サンプル提案をこのページ上で更新しました。バックエンドには保存していません。',
      statusEmpty: '保存する前に提案を入力してください。',
      statusRejected: 'デモ内で見送り',
      boundaryTitle: '操作の範囲',
      boundary: '外部操作には対応する連携機能と権限が必要です。このデモではタスク作成、メール送信、予約、アカウントデータ変更は行いません。',
      boundaryLink: '実行ルールを確認'
    },
    ko: {
      eyebrow: '데모 · 사용자 확인',
      title: '확인 대기 작업',
      description: '제안 내용과 실행 범위를 검토한 뒤 다음 작업을 선택하세요.',
      notice: '데모 안내: 아래 정보와 작업은 예시입니다. 이 페이지는 상태만 시뮬레이션하며 작업 공간 업데이트, 예약, 이메일 전송 또는 외부 작업을 실행하지 않습니다.',
      sample: '샘플 프로젝트 · 사용자 확인 필요',
      task: '제품 검토 체크리스트 준비',
      owner: '프로젝트 어시스턴트 · 데모 작업',
      waiting: '확인 대기',
      planTitle: '제안된 계획',
      plan: ['업데이트된 사용자 흐름 검토', '확인이 필요한 질문 정리', '검토 전 체크리스트 준비'],
      basisTitle: '제안 근거',
      basis: '샘플 맥락: 인터뷰 메모, 프로젝트 목표, 미확인 질문입니다. 실행 전에 출처를 확인하세요.',
      group: '샘플 제안 처리 방식 선택',
      buttons: { confirm: '제안 확인', edit: '제안 수정', defer: '보류', save: '데모에 저장', cancel: '취소' },
      label: '제안 내용 편집',
      defaultEdit: '업데이트된 사용자 흐름을 검토하고 미확인 질문을 정리합니다.',
      statusWaiting: '선택을 기다리고 있습니다. 이 작업은 이 페이지의 데모 상태만 변경합니다.',
      statusConfirmed: '데모에서 확인했습니다. 작업을 만들거나 외부 서비스를 호출하지 않았습니다.',
      statusDeferred: '데모에서 보류했습니다. 계정이나 작업 데이터는 변경되지 않았습니다.',
      statusEdited: '샘플 제안을 이 페이지에서만 수정했습니다. 백엔드에는 저장되지 않았습니다.',
      statusEmpty: '저장하기 전에 제안을 입력하세요.',
      statusRejected: '데모에서 보류됨',
      boundaryTitle: '작업 범위',
      boundary: '외부 작업에는 관련 연동 및 권한이 필요합니다. 이 데모는 작업 생성, 이메일 전송, 예약 또는 계정 데이터 변경을 수행하지 않습니다.',
      boundaryLink: '실행 규칙 보기'
    }
  };
  const locale = document.documentElement.lang.toLowerCase();
  const copy = translations[locale] || translations[locale.split('-')[0]] || translations['zh-cn'];
  const pageHeader = document.querySelector('.page-header');
  const notice = document.querySelector('.action-demo-notice');
  const taskTitle = document.querySelector('#actionDemoTitle');
  const owner = document.querySelector('.action-demo-header > div > p:last-child');
  const planTitle = document.querySelector('.action-demo-plan h3');
  const planItems = [...document.querySelectorAll('.action-demo-plan li')];
  const basisTitle = document.querySelector('.action-demo-reason strong');
  const basis = document.querySelector('.action-demo-reason p');
  const cardKicker = card?.querySelector('.action-demo-kicker');
  const editLabel = editForm?.querySelector('label');
  const boundaryTitle = document.querySelector('.action-demo-boundary h2');
  const boundary = document.querySelector('.action-demo-boundary p');
  const boundaryLink = document.querySelector('.action-demo-boundary a');
  const policyFooter = document.querySelector('.page-footer p');

  if (!(card instanceof HTMLElement) || !(badge instanceof HTMLElement) ||
      !(status instanceof HTMLElement) || !(actionGroup instanceof HTMLElement) ||
      !(editForm instanceof HTMLFormElement) || !(editField instanceof HTMLTextAreaElement) ||
      !(planItem instanceof HTMLLIElement) || actions.length !== 5 ||
      !(pageHeader instanceof HTMLElement) || !(notice instanceof HTMLElement) ||
      !(taskTitle instanceof HTMLElement) || !(owner instanceof HTMLElement) ||
      !(planTitle instanceof HTMLElement) || planItems.length !== 3 ||
      !(basisTitle instanceof HTMLElement) || !(basis instanceof HTMLElement) ||
      !(cardKicker instanceof HTMLElement) || !(editLabel instanceof HTMLLabelElement) ||
      !(boundaryTitle instanceof HTMLElement) || !(boundary instanceof HTMLElement) ||
      !(boundaryLink instanceof HTMLAnchorElement)) {
    console.error('The ATLAS action demo is missing required controls or content.');
    return;
  }

  const pageEyebrow = pageHeader.querySelector('.page-eyebrow');
  const pageTitle = pageHeader.querySelector('.page-title');
  const pageDescription = pageHeader.querySelector('.page-description');
  if (!(pageEyebrow instanceof HTMLElement) || !(pageTitle instanceof HTMLElement) ||
      !(pageDescription instanceof HTMLElement)) {
    console.error('The ATLAS action demo is missing its page heading.');
    return;
  }

  document.title = `${copy.title} - ATLAS`;
  pageEyebrow.textContent = copy.eyebrow;
  pageTitle.textContent = copy.title;
  pageDescription.textContent = copy.description;
  notice.textContent = copy.notice;
  cardKicker.textContent = copy.sample;
  taskTitle.textContent = copy.task;
  owner.textContent = copy.owner;
  badge.textContent = copy.waiting;
  planTitle.textContent = copy.planTitle;
  planItems.forEach((item, index) => {
    item.textContent = copy.plan[index];
  });
  basisTitle.textContent = copy.basisTitle;
  basis.textContent = copy.basis;
  actionGroup.setAttribute('aria-label', copy.group);
  editLabel.textContent = copy.label;
  editField.value = copy.defaultEdit;
  boundaryTitle.textContent = copy.boundaryTitle;
  boundary.textContent = copy.boundary;
  boundaryLink.textContent = copy.boundaryLink;
  status.textContent = copy.statusWaiting;
  if (policyFooter instanceof HTMLElement) {
    policyFooter.textContent = locale.startsWith('en')
      ? 'ATLAS · Personal Intelligence OS'
      : 'ATLAS · 个人智能操作系统';
  }

  const updateStatus = (state, message) => {
    status.dataset.state = state;
    status.textContent = message;
  };

  const finishDemo = (state) => {
    card.dataset.state = state;
    badge.textContent = state === 'confirmed' ? copy.buttons.confirm : copy.statusRejected;
    actionGroup.querySelectorAll('button').forEach((button) => {
      button.disabled = true;
    });
    editForm.hidden = true;
    editForm.querySelectorAll('button').forEach((button) => {
      button.disabled = true;
    });
    updateStatus(state, state === 'confirmed' ? copy.statusConfirmed : copy.statusDeferred);
  };

  actions.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    const action = button.dataset.demoAction;
    if (action === 'confirm') button.textContent = copy.buttons.confirm;
    if (action === 'edit') button.textContent = copy.buttons.edit;
    if (action === 'defer') button.textContent = copy.buttons.defer;
    if (action === 'save') button.textContent = copy.buttons.save;
    if (action === 'cancel') button.textContent = copy.buttons.cancel;

    button.addEventListener('click', () => {
      if (action === 'confirm') finishDemo('confirmed');
      if (action === 'defer') finishDemo('deferred');
      if (action === 'edit') {
        editForm.hidden = false;
        editField.focus();
      }
      if (action === 'cancel') {
        editForm.hidden = true;
        updateStatus('waiting', copy.statusWaiting);
      }
    });
  });

  editField.addEventListener('input', () => editField.setCustomValidity(''));
  editForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const suggestion = editField.value.trim();
    if (!suggestion) {
      editField.setCustomValidity(copy.statusEmpty);
      editField.reportValidity();
      return;
    }
    editField.setCustomValidity('');
    planItem.textContent = suggestion;
    editForm.hidden = true;
    updateStatus('waiting', copy.statusEdited);
  });
})();
