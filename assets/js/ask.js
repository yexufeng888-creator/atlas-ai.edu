/**
 * AI Ask Interface - JavaScript
 */

// 状态管理
const state = {
    currentModel: 'atlas',
    currentChatId: null,
    chats: [],
    isResponding: false,
    modalOpener: null,
    apiKeys: {
        openai: localStorage.getItem('openai_key') || '',
        claude: localStorage.getItem('claude_key') || '',
        gemini: localStorage.getItem('gemini_key') || ''
    }
};
let chatSequence = 0;

const pageTranslations = window.ATLASSecondaryDashboardI18n?.translations || {};
const pageLocale = window.ATLASPageI18n?.locale || 'zh-cn';
const translateUI = (text) => window.ATLASPageI18n
    ? window.ATLASPageI18n.translate(text, pageTranslations)
    : text;

function formatMessageCount(count) {
    const unit = translateUI('条消息');
    return `${count}${['en'].includes(pageLocale) ? ' ' : ''}${unit}`;
}

// DOM 元素
const elements = {
    welcomeScreen: document.getElementById('welcomeScreen'),
    chatMessages: document.getElementById('chatMessages'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    chatList: document.getElementById('chatList'),
    newChatBtn: document.getElementById('newChatBtn'),
    apiSettingsBtn: document.getElementById('apiSettingsBtn'),
    apiModal: document.getElementById('apiModal'),
    modalClose: document.getElementById('modalClose'),
    modalCancel: document.getElementById('modalCancel'),
    modalSave: document.getElementById('modalSave'),
    askToast: document.getElementById('askToast'),
    modelBtns: document.querySelectorAll('.model-btn'),
    suggestionCards: document.querySelectorAll('.suggestion-card')
};

// 初始化
function init() {
    loadChatsFromStorage();
    setupEventListeners();
    updateAPIStatus();
    autoResizeTextarea();
}

// 设置事件监听
function setupEventListeners() {
    // 发送消息
    elements.sendBtn.addEventListener('click', sendMessage);
    elements.messageInput.addEventListener('keydown', (e) => {
        if (e.isComposing || e.keyCode === 229) return;
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 输入框自动调整高度
    elements.messageInput.addEventListener('input', autoResizeTextarea);

    // 模型选择
    elements.modelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectModel(btn.dataset.model);
        });
    });
    document.getElementById('atlasTestConnection').addEventListener('click', testATLASBackend);

    // 快捷建议
    elements.suggestionCards.forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.dataset.prompt;
            if (state.isResponding || !prompt) return;
            elements.messageInput.value = prompt;
            autoResizeTextarea();
            elements.messageInput.focus();
            sendMessage();
        });
    });

    // 新对话
    elements.newChatBtn.addEventListener('click', createNewChat);
    document.getElementById('newChatTopBtn')?.addEventListener('click', () => {
        createNewChat();
        elements.messageInput.focus();
    });

    // API 设置
    elements.apiSettingsBtn.addEventListener('click', openAPIModal);
    elements.modalClose.addEventListener('click', closeAPIModal);
    elements.modalCancel.addEventListener('click', closeAPIModal);
    elements.modalSave.addEventListener('click', saveAPIKeys);

    const sidebarToggle = document.getElementById('askSidebarToggle');
    const sidebar = document.querySelector('.ask-sidebar');
    const setSidebarOpen = (isOpen) => {
        sidebar?.classList.toggle('open', isOpen);
        sidebarToggle?.setAttribute('aria-expanded', String(isOpen));
        if (isOpen) document.getElementById('askSidebarClose')?.focus();
    };
    const closeSidebar = (restoreFocus = false) => {
        const wasOpen = sidebar?.classList.contains('open');
        setSidebarOpen(false);
        if (restoreFocus && wasOpen) sidebarToggle?.focus();
    };
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            setSidebarOpen(!sidebar?.classList.contains('open'));
        });
    }
    document.getElementById('askSidebarClose')?.addEventListener('click', () => closeSidebar(true));
    document.querySelector('.ask-main')?.addEventListener('click', (event) => {
        if (window.innerWidth <= 768 && sidebar?.classList.contains('open') && !event.target.closest('#askSidebarToggle')) {
            const clickedControl = event.target.closest('button, a, input, textarea, [tabindex]:not([tabindex="-1"])');
            closeSidebar(!clickedControl);
        }
    });

    // 点击模态框外部关闭
    elements.apiModal.addEventListener('click', (e) => {
        if (e.target === elements.apiModal) {
            closeAPIModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (elements.apiModal.classList.contains('is-open')) {
                closeAPIModal();
            } else {
                closeSidebar(true);
            }
        }

        if (event.key === 'Tab' && elements.apiModal.classList.contains('is-open')) {
            keepFocusInModal(event);
        }
    });
}

function selectModel(model) {
    if (!model) return;
    state.currentModel = model;
    elements.modelBtns.forEach((btn) => {
        const isSelected = btn.dataset.model === model;
        btn.classList.toggle('active', isSelected);
        btn.setAttribute('aria-pressed', String(isSelected));
    });

    const currentChat = state.chats.find((chat) => chat.id === state.currentChatId);
    if (currentChat) {
        currentChat.model = model;
        saveChatsToStorage();
    }
}

// 自动调整输入框高度
function autoResizeTextarea() {
    const textarea = elements.messageInput;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';

    // 启用/禁用发送按钮
    elements.sendBtn.disabled = !textarea.value.trim();
}

function setComposerBusy(isBusy) {
    elements.messageInput.disabled = isBusy;
    elements.modelBtns.forEach((button) => {
        button.disabled = isBusy;
    });
    elements.suggestionCards.forEach((button) => {
        button.disabled = isBusy;
    });
    elements.sendBtn.disabled = isBusy || !elements.messageInput.value.trim();
    elements.sendBtn.setAttribute('aria-busy', String(isBusy));
    document.querySelector('.input-area')?.classList.toggle('is-busy', isBusy);
}

function showToast(message) {
    elements.askToast.textContent = message;
    elements.askToast.classList.add('is-visible');
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
        elements.askToast.classList.remove('is-visible');
    }, 2600);
}

// 发送消息
async function sendMessage() {
    const message = elements.messageInput.value.trim();
    if (!message || state.isResponding) return;

    // 创建新对话（如果需要）
    if (!state.currentChatId) {
        createNewChat();
    }
    const chat = state.chats.find((item) => item.id === state.currentChatId);
    if (!chat) return;
    chat.model = state.currentModel;
    if (chat.title === '新对话') {
        chat.title = message.length > 32 ? `${message.slice(0, 32)}…` : message;
    }

    // 隐藏欢迎屏幕，显示聊天区域
    elements.welcomeScreen.style.display = 'none';
    elements.chatMessages.style.display = 'flex';

    // 添加用户消息
    addMessage('user', message, chat.id, chat.model);
    renderChatList();

    // 清空输入框
    elements.messageInput.value = '';
    autoResizeTextarea();

    // 获取 AI 响应
    state.isResponding = true;
    setComposerBusy(true);
    try {
        await getAIResponse(chat.id, chat.model);
    } finally {
        state.isResponding = false;
        setComposerBusy(false);
    }
}

// 添加消息到界面
function addMessage(role, content, chatId = state.currentChatId, model = state.currentModel) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = role === 'user'
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>'
        : getModelIcon(model);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);

    // 保存消息到当前对话
    const currentChat = state.chats.find(c => c.id === chatId);
    if (currentChat) {
        currentChat.messages.push({ role, content, timestamp: Date.now(), model });
        saveChatsToStorage();
    }

    if (chatId === state.currentChatId) {
        elements.chatMessages.appendChild(messageDiv);
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }
}

// 获取模型图标
function getModelIcon(model) {
    const icons = {
        'atlas': '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 3v4M8 12h.01M16 12h.01"/></svg>',
        'gpt-4': '<i class="model-dot model-dot-openai"></i>',
        'claude': '<i class="model-dot model-dot-claude"></i>',
        'gemini': '<i class="model-dot model-dot-gemini"></i>'
    };
    return icons[model] || icons.atlas;
}

// 获取 AI 响应
async function getAIResponse(chatId, model) {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message message-assistant typing';
    typingDiv.innerHTML = `
        <div class="message-avatar">${getModelIcon(model)}</div>
        <div class="message-content">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;
    elements.chatMessages.appendChild(typingDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

    try {
        let response;

        switch (model) {
            case 'gpt-4':
                response = await callOpenAI(getChatHistory(chatId));
                break;
            case 'claude':
                response = await callClaude(getChatHistory(chatId));
                break;
            case 'gemini':
                response = await callGemini(getChatHistory(chatId));
                break;
            case 'atlas':
            default:
                response = await callATLAS(getChatHistory(chatId));
                break;
        }

        // 移除 typing 动画
        typingDiv.remove();

        // 添加 AI 响应
        addMessage('assistant', response, chatId, model);

    } catch (error) {
        typingDiv.remove();
        const errorPrefix = translateUI('错误:');
        const errorMessage = error instanceof Error ? error.message : String(error);
        addMessage('assistant', `${errorPrefix}${errorPrefix.endsWith('：') ? '' : ' '}${errorMessage}`, chatId, model);
    }
}

function getChatHistory(chatId) {
    const chat = state.chats.find((item) => item.id === chatId);
    if (!chat) throw new Error('The current conversation could not be found.');
    return chat.messages
        .filter((message) => message.role === 'user' || message.role === 'assistant')
        .map(({ role, content }) => ({ role, content }));
}

// 调用 OpenAI API
async function callOpenAI(messages) {
    const apiKey = state.apiKeys.openai;
    if (!apiKey) {
        throw new Error(translateUI('请先配置 OpenAI API Key'));
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error(translateUI('OpenAI API 调用失败'));
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;
    if (typeof answer !== 'string' || !answer.trim()) {
        throw new Error(translateUI('OpenAI API 返回了空响应'));
    }
    return answer;
}

// 调用 Claude API
async function callClaude(messages) {
    const apiKey = state.apiKeys.claude;
    if (!apiKey) {
        throw new Error(translateUI('请先配置 Claude API Key'));
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-dangerous-direct-browser-access': 'true',
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-opus-20240229',
            max_tokens: 1024,
            messages
        })
    });

    if (!response.ok) {
        throw new Error(translateUI('Claude API 调用失败'));
    }

    const data = await response.json();
    const answer = data.content?.find((block) => block.type === 'text')?.text;
    if (typeof answer !== 'string' || !answer.trim()) {
        throw new Error(translateUI('Claude API 返回了空响应'));
    }
    return answer;
}

// 调用 Gemini API
async function callGemini(messages) {
    const apiKey = state.apiKeys.gemini;
    if (!apiKey) {
        throw new Error(translateUI('请先配置 Gemini API Key'));
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: messages.map(({ role, content }) => ({
                role: role === 'assistant' ? 'model' : 'user',
                parts: [{ text: content }]
            }))
        })
    });

    if (!response.ok) {
        throw new Error(translateUI('Gemini API 调用失败'));
    }

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .filter((text) => typeof text === 'string')
        .join('');
    if (typeof answer !== 'string' || !answer.trim()) {
        throw new Error(translateUI('Gemini API 返回了空响应'));
    }
    return answer;
}

function getATLASAPIBaseUrl() {
    const value = window.ATLAS_AI_CONFIG?.apiBaseUrl;
    if (!value) {
        throw new Error(translateUI('ATLAS 服务地址尚未配置'));
    }

    let url;
    try {
        url = new URL(value);
    } catch {
        throw new Error(translateUI('ATLAS 服务地址无效'));
    }
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
        throw new Error(translateUI('ATLAS 服务地址必须使用 HTTPS'));
    }
    return url.origin;
}

async function getSupabaseAccessToken() {
    const client = window.atlasSupabase;
    if (!client) {
        throw new Error(translateUI('登录服务不可用，请刷新页面或重新登录'));
    }
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    const token = data.session?.access_token;
    if (!token) throw new Error(translateUI('请登录后使用 ATLAS'));
    return token;
}

async function callATLAS(messages) {
    const endpoint = getATLASAPIBaseUrl();
    const accessToken = await getSupabaseAccessToken();
    let response;
    try {
        response = await fetch(`${endpoint}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ messages: messages.slice(-6) })
        });
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error(translateUI('无法连接 ATLAS 服务，请检查网络和 HTTPS 配置'), { cause: error });
        }
        throw error;
    }
    const data = await response.json();
    if (!response.ok) {
        if (response.status === 401) throw new Error(translateUI('登录状态已失效，请重新登录'));
        if (response.status === 429) throw new Error(translateUI('今天的 ATLAS 使用次数已达上限，请明天再试'));
        if (response.status === 503) throw new Error(translateUI('ATLAS 服务忙碌或暂不可用，请稍后再试'));
        if (response.status >= 500) throw new Error(translateUI('ATLAS 服务暂时无法完成请求，请稍后再试'));
        if (response.status === 413 || response.status === 400) {
            throw new Error(translateUI('消息过长或格式无效，请缩短后重试'));
        }
        throw new Error(data?.error || `${translateUI('ATLAS 请求失败')} (${response.status})`);
    }
    const answer = data?.message?.content;
    if (typeof answer !== 'string' || !answer.trim()) {
        throw new Error(translateUI('ATLAS 服务返回了空响应'));
    }
    return answer;
}

async function testATLASBackend() {
    const button = document.getElementById('atlasTestConnection');
    const status = document.getElementById('atlasBackendStatus');
    const message = document.getElementById('atlasConnectionMessage');
    button.disabled = true;
    status.textContent = translateUI('连接中');
    status.className = 'api-status';
    message.textContent = '';

    try {
        const endpoint = getATLASAPIBaseUrl();
        const accessToken = await getSupabaseAccessToken();
        let response;
        try {
            response = await fetch(`${endpoint}/api/usage`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
        } catch (error) {
            if (error instanceof TypeError) {
                throw new Error(translateUI('无法连接 ATLAS 服务，请检查网络和 HTTPS 配置'), { cause: error });
            }
            throw error;
        }
        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401) throw new Error(translateUI('登录状态已失效，请重新登录'));
            throw new Error(data?.error || `${translateUI('ATLAS 请求失败')} (${response.status})`);
        }
        if (!Number.isInteger(data?.limit) || !Number.isInteger(data?.remaining)) {
            throw new Error(translateUI('ATLAS 服务返回了无效状态'));
        }
        status.textContent = translateUI('已连接');
        status.className = 'api-status active';
        message.textContent = translateUI('服务已连接，今日剩余 {count} 次。').replace('{count}', data.remaining);
    } catch (error) {
        status.textContent = translateUI('连接失败');
        status.className = 'api-status';
        message.textContent = error instanceof Error ? error.message : String(error);
    } finally {
        button.disabled = false;
    }
}

// 创建新对话
function createNewChat() {
    const chat = {
        id: `${Date.now()}-${chatSequence++}`,
        title: '新对话',
        messages: [],
        createdAt: Date.now(),
        model: state.currentModel
    };

    state.chats.unshift(chat);
    state.currentChatId = chat.id;

    // 清空聊天区域
    elements.chatMessages.innerHTML = '';
    elements.chatMessages.style.display = 'none';
    elements.welcomeScreen.style.display = 'flex';

    renderChatList();
    saveChatsToStorage();
    elements.newChatBtn.focus();
}

// 渲染对话列表
function renderChatList() {
    elements.chatList.innerHTML = '';

    state.chats.forEach(chat => {
        const chatRow = document.createElement('div');
        chatRow.className = 'chat-row';
        chatRow.setAttribute('role', 'listitem');

        const chatItem = document.createElement('button');
        chatItem.className = 'chat-item' + (chat.id === state.currentChatId ? ' active' : '');
        chatItem.type = 'button';
        chatItem.setAttribute('aria-pressed', String(chat.id === state.currentChatId));

        const chatInfo = document.createElement('span');
        chatInfo.className = 'chat-info';
        const title = document.createElement('span');
        title.className = 'chat-title';
        title.textContent = translateUI(chat.title);
        const preview = document.createElement('span');
        preview.className = 'chat-preview';
        preview.textContent = formatMessageCount(chat.messages.length);
        chatInfo.append(title, preview);
        chatItem.appendChild(chatInfo);
        chatItem.addEventListener('click', () => loadChat(chat.id));

        const deleteButton = document.createElement('button');
        deleteButton.className = 'chat-delete';
        deleteButton.type = 'button';
        deleteButton.setAttribute('aria-label', `${translateUI('删除对话')}: ${chat.title}`);
        deleteButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
        `;
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteChat(chat.id);
        });

        chatRow.append(chatItem, deleteButton);
        elements.chatList.appendChild(chatRow);
    });
}

// 加载对话
function loadChat(chatId) {
    const chat = state.chats.find(c => c.id === chatId);
    if (!chat) return;

    state.currentChatId = chatId;
    selectModel(chat.model || 'atlas');
    elements.chatMessages.innerHTML = '';

    if (chat.messages.length === 0) {
        elements.chatMessages.style.display = 'none';
        elements.welcomeScreen.style.display = 'flex';
    } else {
        elements.welcomeScreen.style.display = 'none';
        elements.chatMessages.style.display = 'flex';

        chat.messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message message-${msg.role}`;
            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.innerHTML = msg.role === 'user'
                ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>'
                : getModelIcon(msg.model || chat.model);
            const content = document.createElement('div');
            content.className = 'message-content';
            content.textContent = msg.content;
            messageDiv.append(avatar, content);
            elements.chatMessages.appendChild(messageDiv);
        });
    }

    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    renderChatList();
}

// 删除对话
function deleteChat(chatId) {
    if (!confirm(translateUI('确定要删除这个对话吗？'))) return;

    state.chats = state.chats.filter(c => c.id !== chatId);

    if (state.currentChatId === chatId) {
        state.currentChatId = null;
        elements.chatMessages.innerHTML = '';
        elements.chatMessages.style.display = 'none';
        elements.welcomeScreen.style.display = 'flex';
    }

    renderChatList();
    saveChatsToStorage();
}

// 打开 API 设置模态框
function openAPIModal() {
    state.modalOpener = document.activeElement;
    document.getElementById('openaiKey').value = state.apiKeys.openai;
    document.getElementById('claudeKey').value = state.apiKeys.claude;
    document.getElementById('geminiKey').value = state.apiKeys.gemini;
    elements.apiModal.classList.add('is-open');
    elements.apiModal.setAttribute('aria-hidden', 'false');
    elements.apiModal.querySelector('#openaiKey').focus();
}

// 关闭 API 设置模态框
function closeAPIModal() {
    elements.apiModal.classList.remove('is-open');
    elements.apiModal.setAttribute('aria-hidden', 'true');
    if (state.modalOpener instanceof HTMLElement) state.modalOpener.focus();
}

function keepFocusInModal(event) {
    const focusable = Array.from(elements.apiModal.querySelectorAll(
        'a[href], button:not(:disabled), input:not(:disabled)'
    ));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

// 保存 API Keys
function saveAPIKeys() {
    state.apiKeys.openai = document.getElementById('openaiKey').value.trim();
    state.apiKeys.claude = document.getElementById('claudeKey').value.trim();
    state.apiKeys.gemini = document.getElementById('geminiKey').value.trim();

    localStorage.setItem('openai_key', state.apiKeys.openai);
    localStorage.setItem('claude_key', state.apiKeys.claude);
    localStorage.setItem('gemini_key', state.apiKeys.gemini);

    updateAPIStatus();
    closeAPIModal();

    showToast(translateUI('API Keys 已保存！'));
}

// 更新 API 状态
function updateAPIStatus() {
    const statuses = {
        openaiStatus: Boolean(state.apiKeys.openai),
        claudeStatus: Boolean(state.apiKeys.claude),
        geminiStatus: Boolean(state.apiKeys.gemini)
    };

    Object.entries(statuses).forEach(([id, configured]) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = translateUI(configured ? '已配置' : '未配置');
            el.className = 'api-status' + (configured ? ' active' : '');
        }
    });
    const atlasBackendStatus = document.getElementById('atlasBackendStatus');
    const atlasAPIConfigured = Boolean(window.ATLAS_AI_CONFIG?.apiBaseUrl);
    atlasBackendStatus.textContent = translateUI(atlasAPIConfigured ? '待测试' : '未配置');
    atlasBackendStatus.className = 'api-status';
}

// 保存对话到 localStorage
function saveChatsToStorage() {
    localStorage.setItem('atlas_chats', JSON.stringify(state.chats));
}

// 从 localStorage 加载对话
function loadChatsFromStorage() {
    const saved = localStorage.getItem('atlas_chats');
    if (saved) {
        let parsed;
        try {
            parsed = JSON.parse(saved);
        } catch (error) {
            console.error('Unable to parse saved chat history.', error);
            showToast(translateUI('无法读取本地对话记录，原数据未更改。'));
            return;
        }
        if (!Array.isArray(parsed)) {
            console.error('Saved chat history must be an array.');
            showToast(translateUI('无法读取本地对话记录，原数据未更改。'));
            return;
        }
        state.chats = parsed.filter((chat) =>
            chat &&
            typeof chat.id === 'string' &&
            typeof chat.title === 'string' &&
            Array.isArray(chat.messages)
        );
        if (state.chats.length !== parsed.length) {
            console.error('Some malformed chat records were excluded from the loaded history.');
            showToast(translateUI('部分损坏的对话记录已隐藏，其他记录仍可使用。'));
        }
        renderChatList();
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', init);
