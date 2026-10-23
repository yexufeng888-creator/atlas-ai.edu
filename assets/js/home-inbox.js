(function (window, document) {
  'use strict';

  const storageKey = 'atlas-capture-inbox-v1';
  const maxItems = 50;
  const maxTextLength = 240;
  const locale = (document.documentElement.lang || 'zh-CN').toLowerCase();
  const copy = {
    'zh-cn': {
      eyebrow: 'QUICK CAPTURE',
      title: '随手收集箱',
      hint: '先记下来，稍后再整理。',
      label: '记下一件事',
      placeholder: '输入想法、链接或待办...',
      add: '加入收集箱',
      privacy: '仅保存在当前浏览器，不会同步；本设备的其他用户也可能看到，请勿保存密码等敏感信息。',
      empty: '收集箱还是空的。先记下想法，稍后再整理。',
      items: '收集的内容',
      remove: '删除',
      added: '已保存到本机收集箱。',
      removed: '已从收集箱删除。',
      required: '请输入要收集的内容。',
      tooLong: '内容不能超过 240 个字符。',
      full: '收集箱已满，请先删除一些内容。',
      readError: '无法读取收集箱；原有数据未更改，已暂停收集功能。',
      invalidData: '收集箱数据格式无效；原有数据未更改，已暂停收集功能。',
      saveError: '无法保存到本机，请检查浏览器存储空间和权限。',
      missingItem: '找不到这条内容，列表可能已更新。'
    },
    'zh-hk': {
      eyebrow: '快速記錄',
      title: '隨手收集箱',
      hint: '先記下來，稍後再整理。',
      label: '記下一件事',
      placeholder: '輸入想法、連結或待辦...',
      add: '加入收集箱',
      privacy: '只保存在目前瀏覽器，不會同步；本裝置的其他使用者也可能看到，請勿保存密碼等敏感資訊。',
      empty: '收集箱還是空的。先記下想法，稍後再整理。',
      items: '收集的內容',
      remove: '刪除',
      added: '已儲存到本機收集箱。',
      removed: '已從收集箱刪除。',
      required: '請輸入要收集的內容。',
      tooLong: '內容不能超過 240 個字元。',
      full: '收集箱已滿，請先刪除一些內容。',
      readError: '無法讀取收集箱；原有資料未更改，已暫停收集功能。',
      invalidData: '收集箱資料格式無效；原有資料未更改，已暫停收集功能。',
      saveError: '無法儲存到本機，請檢查瀏覽器儲存空間和權限。',
      missingItem: '找不到這項內容，清單可能已更新。'
    },
    'zh-tw': {
      eyebrow: '快速記錄',
      title: '隨手收集箱',
      hint: '先記下來，稍後再整理。',
      label: '記下一件事',
      placeholder: '輸入想法、連結或待辦...',
      add: '加入收集箱',
      privacy: '只保存在目前瀏覽器，不會同步；本裝置的其他使用者也可能看到，請勿儲存密碼等敏感資訊。',
      empty: '收集箱還是空的。先記下想法，稍後再整理。',
      items: '收集的內容',
      remove: '刪除',
      added: '已儲存到本機收集箱。',
      removed: '已從收集箱刪除。',
      required: '請輸入要收集的內容。',
      tooLong: '內容不能超過 240 個字元。',
      full: '收集箱已滿，請先刪除一些內容。',
      readError: '無法讀取收集箱；原有資料未更改，已暫停收集功能。',
      invalidData: '收集箱資料格式無效；原有資料未更改，已暫停收集功能。',
      saveError: '無法儲存到本機，請檢查瀏覽器儲存空間和權限。',
      missingItem: '找不到這項內容，清單可能已更新。'
    },
    en: {
      eyebrow: 'QUICK CAPTURE',
      title: 'Quick capture',
      hint: 'Save it now and organize it later.',
      label: 'Capture a thought',
      placeholder: 'Add a thought, link, or task...',
      add: 'Add to inbox',
      privacy: 'Saved only in this browser; it is not synced and may be visible to other people using this device. Do not store passwords or sensitive information.',
      empty: 'Your inbox is empty. Capture an idea to sort through later.',
      items: 'Captured items',
      remove: 'Remove',
      added: 'Saved to this browser.',
      removed: 'Removed from your inbox.',
      required: 'Enter something to capture.',
      tooLong: 'Keep the entry to 240 characters or fewer.',
      full: 'Your inbox is full. Remove an item before adding another.',
      readError: 'The inbox could not be read. Existing data is unchanged and capture is paused.',
      invalidData: 'The inbox data is invalid. Existing data is unchanged and capture is paused.',
      saveError: 'Could not save in this browser. Check browser storage and permissions.',
      missingItem: 'That item could not be found. The list may have changed.'
    },
    ja: {
      eyebrow: 'クイックキャプチャ',
      title: 'クイックメモ',
      hint: 'まず記録して、あとで整理しましょう。',
      label: 'メモを追加',
      placeholder: 'アイデア、リンク、タスクを入力...',
      add: '受信箱に追加',
      privacy: 'このブラウザー内のみに保存され、同期されません。同じ端末を使う他の人が閲覧できる場合があります。パスワードなどの機密情報は保存しないでください。',
      empty: '受信箱は空です。あとで整理するアイデアを記録しましょう。',
      items: '記録した項目',
      remove: '削除',
      added: 'このブラウザーに保存しました。',
      removed: '受信箱から削除しました。',
      required: '記録する内容を入力してください。',
      tooLong: '内容は240文字以内にしてください。',
      full: '受信箱がいっぱいです。項目を削除してから追加してください。',
      readError: '受信箱を読み取れません。既存データは変更せず、記録機能を一時停止しました。',
      invalidData: '受信箱のデータ形式が無効です。既存データは変更せず、記録機能を一時停止しました。',
      saveError: 'このブラウザーに保存できません。ストレージの空き容量と権限を確認してください。',
      missingItem: '項目が見つかりません。リストが更新された可能性があります。'
    },
    ko: {
      eyebrow: '빠른 기록',
      title: '빠른 수집함',
      hint: '먼저 기록하고 나중에 정리하세요.',
      label: '내용 기록하기',
      placeholder: '아이디어, 링크 또는 할 일을 입력하세요...',
      add: '수집함에 추가',
      privacy: '현재 브라우저에만 저장되며 동기화되지 않습니다. 이 기기의 다른 사용자도 볼 수 있으니 비밀번호 등 민감한 정보는 저장하지 마세요.',
      empty: '수집함이 비어 있어요. 나중에 정리할 내용을 기록해 보세요.',
      items: '수집한 항목',
      remove: '삭제',
      added: '현재 브라우저에 저장했어요.',
      removed: '수집함에서 삭제했어요.',
      required: '기록할 내용을 입력하세요.',
      tooLong: '내용은 240자 이하여야 해요.',
      full: '수집함이 가득 찼어요. 항목을 삭제한 뒤 추가하세요.',
      readError: '수집함을 읽을 수 없어요. 기존 데이터는 그대로 두고 기록 기능을 일시 중지했어요.',
      invalidData: '수집함 데이터 형식이 올바르지 않아요. 기존 데이터는 그대로 두고 기록 기능을 일시 중지했어요.',
      saveError: '현재 브라우저에 저장할 수 없어요. 저장 공간과 권한을 확인하세요.',
      missingItem: '항목을 찾을 수 없어요. 목록이 변경되었을 수 있어요.'
    }
  };
  const language = copy[locale] || copy['zh-cn'];
  const form = document.getElementById('captureInboxForm');
  const input = document.getElementById('captureInboxInput');
  const submitButton = document.getElementById('captureInboxSubmit');
  const count = document.getElementById('captureInboxCount');
  const empty = document.getElementById('captureInboxEmpty');
  const list = document.getElementById('captureInboxList');
  const status = document.getElementById('captureInboxStatus');
  const storageUnavailableText = language.readError;
  const elements = {
    eyebrow: document.getElementById('captureInboxEyebrow'),
    title: document.getElementById('captureInboxTitle'),
    hint: document.getElementById('captureInboxHint'),
    label: document.getElementById('captureInboxLabel'),
    privacy: document.getElementById('captureInboxPrivacyNote')
  };

  if (
    !form ||
    !input ||
    !submitButton ||
    !count ||
    !empty ||
    !list ||
    !status ||
    Object.values(elements).some((element) => !element)
  ) {
    console.error('The capture inbox markup is incomplete.');
    return;
  }

  let items = [];
  let storageUnavailable = false;

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle('is-error', isError);
  }

  function disableCapture(message, isInvalidData = false) {
    storageUnavailable = true;
    input.disabled = true;
    submitButton.disabled = true;
    empty.hidden = true;
    setStatus(message, true);
    if (isInvalidData) {
      console.error('The saved capture inbox data is invalid.');
    }
  }

  function isValidItems(value) {
    return Array.isArray(value) && value.length <= maxItems && value.every((item) =>
      item &&
      typeof item === 'object' &&
      !Array.isArray(item) &&
      typeof item.id === 'string' &&
      item.id.length > 0 &&
      typeof item.text === 'string' &&
      item.text.trim().length > 0 &&
      item.text.length <= maxTextLength
    );
  }

  function readItems() {
    let serialized;
    try {
      serialized = window.localStorage.getItem(storageKey);
    } catch (error) {
      console.error('Unable to read the capture inbox from browser storage:', error);
      disableCapture(storageUnavailableText);
      return;
    }

    if (serialized === null) return;

    let parsed;
    try {
      parsed = JSON.parse(serialized);
    } catch {
      disableCapture(language.invalidData, true);
      return;
    }

    if (!isValidItems(parsed)) {
      disableCapture(language.invalidData, true);
      return;
    }

    items = parsed;
  }

  function createItemElement(item) {
    const row = document.createElement('li');
    row.className = 'capture-inbox__item';

    const text = document.createElement('span');
    text.className = 'capture-inbox__text';
    text.textContent = item.text;

    const removeButton = document.createElement('button');
    removeButton.className = 'capture-inbox__remove';
    removeButton.type = 'button';
    removeButton.textContent = language.remove;
    removeButton.setAttribute('aria-label', `${language.remove}: ${item.text}`);
    removeButton.addEventListener('click', () => removeItem(item.id));

    row.append(text, removeButton);
    return row;
  }

  function renderItems() {
    list.replaceChildren(...items.map(createItemElement));
    count.textContent = `${items.length} / ${maxItems}`;
    empty.hidden = items.length > 0 || storageUnavailable;
    input.disabled = storageUnavailable || items.length >= maxItems;
    submitButton.disabled = storageUnavailable || items.length >= maxItems;
  }

  function saveItems(nextItems) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextItems));
    } catch (error) {
      console.error('Unable to save the capture inbox to browser storage:', error);
      setStatus(language.saveError, true);
      return false;
    }

    items = nextItems;
    renderItems();
    return true;
  }

  function createId() {
    return typeof window.crypto?.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function addItem(value) {
    const text = value.trim();
    if (!text) {
      setStatus(language.required, true);
      input.focus();
      return;
    }
    if (text.length > maxTextLength) {
      setStatus(language.tooLong, true);
      input.focus();
      return;
    }
    if (items.length >= maxItems) {
      setStatus(language.full, true);
      return;
    }

    if (saveItems([{ id: createId(), text }, ...items])) {
      form.reset();
      setStatus(language.added);
      input.focus();
    }
  }

  function removeItem(id) {
    if (!items.some((item) => item.id === id)) {
      setStatus(language.missingItem, true);
      return;
    }

    if (saveItems(items.filter((item) => item.id !== id))) {
      setStatus(language.removed);
    }
  }

  elements.eyebrow.textContent = language.eyebrow;
  elements.title.textContent = language.title;
  elements.hint.textContent = language.hint;
  elements.label.textContent = language.label;
  elements.privacy.textContent = language.privacy;
  input.placeholder = language.placeholder;
  submitButton.textContent = language.add;
  empty.textContent = language.empty;
  list.setAttribute('aria-label', language.items);

  readItems();
  renderItems();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (storageUnavailable) {
      setStatus(storageUnavailableText, true);
      return;
    }
    addItem(input.value);
  });
})(window, document);
