(function() {
    'use strict';

// ATLAS Authentication System
// 完整的用户认证、会话管理和路由保护

class AuthSystem {
    constructor() {
        this.storageKey = 'atlas_users';
        this.sessionKey = 'atlas_session';
        this.init();
    }

    init() {
        // 初始化用户存储
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }

        // 创建默认演示账户
        this.createDemoAccount();
    }

    // 创建演示账户
    createDemoAccount() {
        const users = this.getUsers();
        const demoExists = users.find(u => u.email === 'demo@atlas.com');

        if (!demoExists) {
            const demoUser = {
                id: this.generateId(),
                email: 'demo@atlas.com',
                password: this.hashPassword('demo123'),
                name: '演示用户',
                avatar: '👤',
                createdAt: new Date().toISOString(),
                preferences: {
                    language: 'zh-CN',
                    theme: 'system'
                }
            };
            users.push(demoUser);
            localStorage.setItem(this.storageKey, JSON.stringify(users));
        }
    }

    // 生成唯一ID
    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 简单的密码哈希（生产环境应使用 bcrypt）
    hashPassword(password) {
        // 使用简单的哈希模拟（实际应用应使用服务端加密）
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'hash_' + Math.abs(hash).toString(36);
    }

    // 获取所有用户
    getUsers() {
        const storedUsers = localStorage.getItem(this.storageKey);
        if (!storedUsers) return [];

        try {
            const users = JSON.parse(storedUsers);
            if (!Array.isArray(users)) {
                throw new Error('用户数据格式无效');
            }
            return users;
        } catch (error) {
            console.error('无法读取本地用户数据', error);
            return [];
        }
    }

    // 保存用户
    saveUsers(users) {
        localStorage.setItem(this.storageKey, JSON.stringify(users));
    }

    // 注册新用户
    register(email, password, name) {
        const users = this.getUsers();
        email = email.trim().toLowerCase();

        // 检查邮箱是否已存在
        if (users.find(u => u.email === email)) {
            return {
                success: false,
                message: '该邮箱已被注册'
            };
        }

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                success: false,
                message: '邮箱格式不正确'
            };
        }

        // 验证密码强度
        if (password.length < 6) {
            return {
                success: false,
                message: '密码至少需要6个字符'
            };
        }

        // 创建新用户
        const newUser = {
            id: this.generateId(),
            email: email,
            password: this.hashPassword(password),
            name: name || email.split('@')[0],
            avatar: this.generateAvatar(name || email),
            createdAt: new Date().toISOString(),
            preferences: {
                language: 'zh-CN',
                theme: 'system'
            }
        };

        users.push(newUser);
        this.saveUsers(users);

        return {
            success: true,
            message: '注册成功',
            user: this.sanitizeUser(newUser)
        };
    }

    // 生成头像（使用首字母）
    generateAvatar(name) {
        if (!name) return '👤';
        const firstChar = name.charAt(0).toUpperCase();
        return firstChar;
    }

    // 登录
    login(email, password, remember = false) {
        const users = this.getUsers();
        email = email.trim().toLowerCase();
        const user = users.find(u => u.email === email);

        if (!user) {
            return {
                success: false,
                message: '用户不存在'
            };
        }

        if (user.password !== this.hashPassword(password)) {
            return {
                success: false,
                message: '密码错误'
            };
        }

        // 创建会话
        const session = {
            userId: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            loginAt: new Date().toISOString(),
            expiresAt: remember
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30天
                : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时
        };

        // 保存会话
        localStorage.removeItem(this.sessionKey);
        sessionStorage.removeItem(this.sessionKey);
        if (remember) {
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
        } else {
            sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
        }

        return {
            success: true,
            message: '登录成功',
            user: this.sanitizeUser(user)
        };
    }

    // 登出
    logout() {
        localStorage.removeItem(this.sessionKey);
        sessionStorage.removeItem(this.sessionKey);
        return { success: true, message: '已登出' };
    }

    // 检查是否已登录
    isLoggedIn() {
        const session = this.getSession();
        if (!session) return false;

        // 检查会话是否过期
        if (new Date(session.expiresAt) < new Date()) {
            this.logout();
            return false;
        }

        return true;
    }

    // 获取当前会话
    getSession() {
        let session = sessionStorage.getItem(this.sessionKey);
        if (!session) {
            session = localStorage.getItem(this.sessionKey);
        }
        if (!session) return null;

        try {
            return JSON.parse(session);
        } catch (error) {
            console.error('无法读取登录会话', error);
            sessionStorage.removeItem(this.sessionKey);
            localStorage.removeItem(this.sessionKey);
            return null;
        }
    }

    // 获取当前用户
    getCurrentUser() {
        const session = this.getSession();
        if (!session) return null;

        const users = this.getUsers();
        const user = users.find(u => u.id === session.userId);
        return user ? this.sanitizeUser(user) : null;
    }

    // 清理用户数据（移除敏感信息）
    sanitizeUser(user) {
        const { password, ...safeUser } = user;
        return safeUser;
    }

    // 更新用户信息
    updateUser(userId, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);

        if (index === -1) {
            return { success: false, message: '用户不存在' };
        }

        // 不允许更新某些字段
        delete updates.id;
        delete updates.password;
        delete updates.createdAt;

        users[index] = { ...users[index], ...updates };
        this.saveUsers(users);

        return {
            success: true,
            message: '更新成功',
            user: this.sanitizeUser(users[index])
        };
    }

    // 修改密码
    changePassword(userId, oldPassword, newPassword) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        if (user.password !== this.hashPassword(oldPassword)) {
            return { success: false, message: '原密码错误' };
        }

        if (newPassword.length < 6) {
            return { success: false, message: '新密码至少需要6个字符' };
        }

        const index = users.findIndex(u => u.id === userId);
        users[index].password = this.hashPassword(newPassword);
        this.saveUsers(users);

        return { success: true, message: '密码修改成功' };
    }

    resetPassword(email, newPassword) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            return { success: false, message: '该邮箱未注册' };
        }

        if (newPassword.length < 6) {
            return { success: false, message: '新密码至少需要6个字符' };
        }

        user.password = this.hashPassword(newPassword);
        this.saveUsers(users);
        return { success: true, message: '密码重置成功' };
    }

    // 路由保护：需要登录才能访问
    requireAuth(redirectTo = 'login.html') {
        if (!this.isLoggedIn()) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }

    // 显示用户信息（在导航栏等位置）
    displayUserInfo(elementId) {
        if (!this.isLoggedIn()) return;

        const session = this.getSession();
        const element = document.getElementById(elementId);

        if (element) {
            element.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #06b6d4); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">
                        ${session.avatar}
                    </div>
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-weight: 600; font-size: 0.875rem;">${session.name}</span>
                        <span style="font-size: 0.75rem; color: #6b7280;">${session.email}</span>
                    </div>
                </div>
            `;
        }
    }
}

// 创建全局实例
const auth = new AuthSystem();

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {

    // 处理登录表单
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = loginForm.querySelector('input[name="email"]').value;
            const password = loginForm.querySelector('input[name="password"]').value;
            const acknowledgement = loginForm.querySelector('#loginAcknowledgement');
            if (!acknowledgement || !acknowledgement.checked) {
                showMessage('请先阅读并确认登录信息处理说明', 'error');
                acknowledgement?.focus();
                return;
            }

            const remember = loginForm.querySelector('#rememberMe')?.checked || false;

            const result = auth.login(email, password, remember);

            if (result.success) {
                showMessage('演示登录成功！正在跳转...', 'success');
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1000);
            } else {
                showMessage(result.message, 'error');
            }
        });
    }

    // 处理注册表单
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = signupForm.querySelector('input[name="name"]').value;
            const email = signupForm.querySelector('input[type="email"]').value;
            const password = signupForm.querySelector('input[type="password"]').value;
            const confirmPassword = signupForm.querySelector('input[name="confirmPassword"]')?.value;

            if (confirmPassword && password !== confirmPassword) {
                showMessage('两次输入的密码不一致', 'error');
                return;
            }

            const result = auth.register(email, password, name);

            if (result.success) {
                showMessage('注册成功！正在跳转到登录页...', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                showMessage(result.message, 'error');
            }
        });
    }

    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = resetPasswordForm.querySelector('input[type="email"]').value;
            const newPassword = resetPasswordForm.querySelector('input[name="newPassword"]').value;
            const confirmPassword = resetPasswordForm.querySelector('input[name="confirmPassword"]').value;

            if (newPassword !== confirmPassword) {
                showMessage('两次输入的密码不一致', 'error');
                return;
            }

            const result = auth.resetPassword(email, newPassword);
            showMessage(result.message, result.success ? 'success' : 'error');
            if (result.success) {
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
        });
    }

    // 处理登出按钮
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
            showMessage('已登出', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        });
    }

    // 密码显示/隐藏切换
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling || btn.parentElement.querySelector('input');
            if (input) {
                input.type = input.type === 'password' ? 'text' : 'password';
            }
        });
    });

    // 社交登录（演示模式）
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showMessage('第三方登录尚未接入；未向登录平台提交认证信息。', 'info');
        });
    });
});

// 消息提示函数
function showMessage(message, type = 'info') {
    // 移除已存在的消息
    const existing = document.querySelector('.auth-message');
    if (existing) existing.remove();

    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#2563eb'
    };

    const messageDiv = document.createElement('div');
    messageDiv.className = 'auth-message';
    messageDiv.setAttribute('role', type === 'error' ? 'alert' : 'status');
    messageDiv.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    messageDiv.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
        max-width: 400px;
    `;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// 添加动画样式
const authStyle = document.createElement('style');
authStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(authStyle);

// 导出到全局
window.auth = auth;
window.showMessage = showMessage;
})();
