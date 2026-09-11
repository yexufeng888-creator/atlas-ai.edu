// Page Protection - 通用的页面保护和用户信息显示
// 在需要登录保护的页面中引入此脚本

(function() {
    'use strict';

    // 等待 DOM 和 auth 系统加载完成
    function init() {
        if (typeof auth === 'undefined') {
            // auth.js 还未加载，等待一下
            setTimeout(init, 50);
            return;
        }

        // 检查是否需要登录
        const requiresAuth = document.body.dataset.requireAuth !== 'false';

        if (requiresAuth) {
            // 路由保护
            if (!auth.requireAuth()) {
                return; // 已重定向到登录页
            }

            // 显示用户信息
            const userInfoEl = document.getElementById('userInfo');
            if (userInfoEl) {
                auth.displayUserInfo('userInfo');
            }

            // 更新欢迎语中的用户名
            updateWelcomeMessage();

            // 处理登出按钮
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn && !logoutBtn.dataset.listenerAdded) {
                logoutBtn.dataset.listenerAdded = 'true';
                logoutBtn.addEventListener('click', handleLogout);
            }
        }
    }

    // 更新欢迎语
    function updateWelcomeMessage() {
        const session = auth.getSession();
        if (!session) return;

        // 查找包含"演示用户"或类似文本的元素
        const welcomeSelectors = [
            'h1:contains("演示用户")',
            '.hero-title',
            '[data-user-name]'
        ];

        document.querySelectorAll('h1, .hero-title').forEach(el => {
            if (el.textContent.includes('演示用户')) {
                el.innerHTML = el.innerHTML.replace(
                    '演示用户',
                    `<span style="background: linear-gradient(135deg, #2563eb, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${session.name}</span>`
                );
            }
        });

        // 更新 data-user-name 属性的元素
        document.querySelectorAll('[data-user-name]').forEach(el => {
            el.textContent = session.name;
        });
    }

    // 处理登出
    function handleLogout(e) {
        e.preventDefault();

        if (confirm('确定要登出吗？')) {
            auth.logout();
            window.location.href = 'index.html';
        }
    }

    // 添加用户菜单样式（如果不存在）
    function addUserMenuStyles() {
        if (document.getElementById('user-menu-styles')) return;

        const userMenuStyle = document.createElement('style');
        userMenuStyle.id = 'user-menu-styles';
        userMenuStyle.textContent = `
            #userMenu {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            #userInfo {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            @media (max-width: 768px) {
                #userMenu {
                    display: none;
                }
            }
        `;
        document.head.appendChild(userMenuStyle);
    }

    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    addUserMenuStyles();
})();
