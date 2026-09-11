/**
 * AI Ask Interface - JavaScript
 */

// 状态管理
const state = {
    currentModel: 'atlas',
    currentChatId: null,
    chats: [],
    apiKeys: {
        openai: localStorage.getItem('openai_key') || '',
        claude: localStorage.getItem('claude_key') || '',
        gemini: localStorage.getItem('gemini_key') || ''
    }
};

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
            elements.modelBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentModel = btn.dataset.model;
        });
    });

    // 快捷建议
    elements.suggestionCards.forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.dataset.prompt;
            elements.messageInput.value = prompt;
            elements.messageInput.focus();
            sendMessage();
        });
    });

    // 新对话
    elements.newChatBtn.addEventListener('click', createNewChat);

    // API 设置
    elements.apiSettingsBtn.addEventListener('click', openAPIModal);
    elements.modalClose.addEventListener('click', closeAPIModal);
    elements.modalCancel.addEventListener('click', closeAPIModal);
    elements.modalSave.addEventListener('click', saveAPIKeys);

    const sidebarToggle = document.getElementById('askSidebarToggle');
    const sidebar = document.querySelector('.ask-sidebar');
    const closeSidebar = () => sidebar?.classList.remove('open');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar?.classList.toggle('open');
        });
    }
    document.getElementById('askSidebarClose')?.addEventListener('click', closeSidebar);
    document.querySelector('.ask-main')?.addEventListener('click', (event) => {
        if (window.innerWidth <= 768 && sidebar?.classList.contains('open') && !event.target.closest('#askSidebarToggle')) {
            closeSidebar();
        }
    });

    // 点击模态框外部关闭
    elements.apiModal.addEventListener('click', (e) => {
        if (e.target === elements.apiModal) {
            closeAPIModal();
        }
    });
}

// 自动调整输入框高度
function autoResizeTextarea() {
    const textarea = elements.messageInput;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';

    // 启用/禁用发送按钮
    elements.sendBtn.disabled = !textarea.value.trim();
}

// 发送消息
async function sendMessage() {
    const message = elements.messageInput.value.trim();
    if (!message) return;

    // 创建新对话（如果需要）
    if (!state.currentChatId) {
        createNewChat();
    }

    // 隐藏欢迎屏幕，显示聊天区域
    elements.welcomeScreen.style.display = 'none';
    elements.chatMessages.style.display = 'flex';

    // 添加用户消息
    addMessage('user', message);

    // 清空输入框
    elements.messageInput.value = '';
    autoResizeTextarea();

    // 获取 AI 响应
    await getAIResponse(message);
}

// 添加消息到界面
function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = role === 'user'
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>'
        : getModelIcon(state.currentModel);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);

    elements.chatMessages.appendChild(messageDiv);

    // 滚动到底部
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

    // 保存消息到当前对话
    const currentChat = state.chats.find(c => c.id === state.currentChatId);
    if (currentChat) {
        currentChat.messages.push({ role, content, timestamp: Date.now() });
        saveChatsToStorage();
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
async function getAIResponse(userMessage) {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message message-assistant typing';
    typingDiv.innerHTML = `
        <div class="message-avatar">${getModelIcon(state.currentModel)}</div>
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

        switch (state.currentModel) {
            case 'gpt-4':
                response = await callOpenAI(userMessage);
                break;
            case 'claude':
                response = await callClaude(userMessage);
                break;
            case 'gemini':
                response = await callGemini(userMessage);
                break;
            case 'atlas':
            default:
                response = await callATLAS(userMessage);
                break;
        }

        // 移除 typing 动画
        typingDiv.remove();

        // 添加 AI 响应
        addMessage('assistant', response);

    } catch (error) {
        typingDiv.remove();
        addMessage('assistant', `错误: ${error.message}`);
    }
}

// 调用 OpenAI API
async function callOpenAI(message) {
    const apiKey = state.apiKeys.openai;
    if (!apiKey) {
        throw new Error('请先配置 OpenAI API Key');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: message }],
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error('OpenAI API 调用失败');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// 调用 Claude API
async function callClaude(message) {
    const apiKey = state.apiKeys.claude;
    if (!apiKey) {
        throw new Error('请先配置 Claude API Key');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-opus-20240229',
            max_tokens: 1024,
            messages: [{ role: 'user', content: message }]
        })
    });

    if (!response.ok) {
        throw new Error('Claude API 调用失败');
    }

    const data = await response.json();
    return data.content[0].text;
}

// 调用 Gemini API
async function callGemini(message) {
    const apiKey = state.apiKeys.gemini;
    if (!apiKey) {
        throw new Error('请先配置 Gemini API Key');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: message }] }]
        })
    });

    if (!response.ok) {
        throw new Error('Gemini API 调用失败');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// 调用 ATLAS 本地模型（模拟）
async function callATLAS(message) {
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // 模拟响应
    const responses = [
        `我理解你的问题："${message}"。作为 ATLAS AI 助手，我会尽力帮助你。`,
        `这是一个很好的问题。让我来为你分析一下...`,
        `根据你的描述，我建议...`,
        `我明白了。关于这个问题，我的看法是...`
    ];

    return responses[Math.floor(Math.random() * responses.length)] +
           `\n\n（这是 ATLAS 本地模型的模拟响应。实际部署时，这里会连接到真实的 AI 模型。）`;
}

// 创建新对话
function createNewChat() {
    const chat = {
        id: Date.now().toString(),
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
}

// 渲染对话列表
function renderChatList() {
    elements.chatList.innerHTML = '';

    state.chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item' + (chat.id === state.currentChatId ? ' active' : '');
        chatItem.innerHTML = `
            <div class="chat-info">
                <div class="chat-title">${chat.title}</div>
                <div class="chat-preview">${chat.messages.length} 条消息</div>
            </div>
            <button class="chat-delete" data-id="${chat.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
            </button>
        `;

        chatItem.addEventListener('click', (e) => {
            if (!e.target.closest('.chat-delete')) {
                loadChat(chat.id);
            }
        });

        chatItem.querySelector('.chat-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteChat(chat.id);
        });

        elements.chatList.appendChild(chatItem);
    });
}

// 加载对话
function loadChat(chatId) {
    const chat = state.chats.find(c => c.id === chatId);
    if (!chat) return;

    state.currentChatId = chatId;
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
                : getModelIcon(chat.model);
            const content = document.createElement('div');
            content.className = 'message-content';
            content.textContent = msg.content;
            messageDiv.append(avatar, content);
            elements.chatMessages.appendChild(messageDiv);
        });
    }

    renderChatList();
}

// 删除对话
function deleteChat(chatId) {
    if (!confirm('确定要删除这个对话吗？')) return;

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
    document.getElementById('openaiKey').value = state.apiKeys.openai;
    document.getElementById('claudeKey').value = state.apiKeys.claude;
    document.getElementById('geminiKey').value = state.apiKeys.gemini;
    elements.apiModal.style.display = 'flex';
}

// 关闭 API 设置模态框
function closeAPIModal() {
    elements.apiModal.style.display = 'none';
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

    alert('API Keys 已保存！');
}

// 更新 API 状态
function updateAPIStatus() {
    const statuses = {
        openaiStatus: state.apiKeys.openai ? '已配置' : '未配置',
        claudeStatus: state.apiKeys.claude ? '已配置' : '未配置',
        geminiStatus: state.apiKeys.gemini ? '已配置' : '未配置'
    };

    Object.entries(statuses).forEach(([id, text]) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = text;
            el.className = 'api-status' + (text === '已配置' ? ' active' : '');
        }
    });
}

// 保存对话到 localStorage
function saveChatsToStorage() {
    localStorage.setItem('atlas_chats', JSON.stringify(state.chats));
}

// 从 localStorage 加载对话
function loadChatsFromStorage() {
    const saved = localStorage.getItem('atlas_chats');
    if (saved) {
        state.chats = JSON.parse(saved);
        renderChatList();
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', init);
