// ATLAS i18n (Internationalization) System
// 完整的中英双语支持

(function() {
    'use strict';

    console.log('i18n.js loading...');

    const translations = {
        'en': {
            // Navigation
            'nav.features': 'Features',
            'nav.team': 'Team',
            'nav.pricing': 'Pricing',
            'nav.blog': 'Blog',
            'nav.contact': 'Contact',
            'nav.signin': 'Sign In',
            'nav.getstarted': 'Get Started',
            'nav.home': 'Home',
            'nav.ask': 'Ask',
            'nav.memory': 'Memory',
            'nav.life': 'Life',
            'nav.agents': 'Agents',
            'nav.settings': 'Settings',

            // Hero Section
            'hero.eyebrow': 'Personal Intelligence OS',
            'hero.title': 'Your Life,<br>Intelligently Organized',
            'hero.subtitle': 'Transform information into intelligence, decisions into actions. ATLAS is your AI-powered operating system for life.',
            'hero.cta.start': 'Start Free',
            'hero.cta.learn': 'Learn More',

            // Trusted By
            'trusted.title': 'Trusted by innovators worldwide',

            // Features
            'features.eyebrow': 'Features',
            'features.title': 'Designed for Your Success',
            'features.description': 'Everything you need to stay organized, productive, and in control.',

            'feature.memory.title': 'Intelligent Memory',
            'feature.memory.desc': 'Remembers everything you need, when you need it. Your personal knowledge graph grows with you.',

            'feature.tasks.title': 'Smart Task Management',
            'feature.tasks.desc': 'AI-powered prioritization that adapts to your work style and helps you focus on what matters.',

            'feature.agents.title': 'AI Agents',
            'feature.agents.desc': 'Specialized agents handle everything from travel planning to email management automatically.',

            'feature.analytics.title': 'Life Analytics',
            'feature.analytics.desc': 'Beautiful dashboards that visualize your productivity, health, and habits.',

            'feature.privacy.title': 'Privacy First',
            'feature.privacy.desc': 'Your data stays yours. End-to-end encryption and transparent AI operations.',

            'feature.speed.title': 'Lightning Fast',
            'feature.speed.desc': 'Native performance with instant search and real-time sync across all devices.',

            // Stats
            'stats.users': 'Active Users',
            'stats.tasks': 'Tasks Completed',
            'stats.uptime': 'Uptime',
            'stats.rating': 'User Rating',

            
            // Stats
            'stats.users': '活跃用户',
            'stats.tasks': '已完成任务',
            'stats.uptime': '在线时间',
            'stats.rating': '用户评分',

            // Showcase
            'showcase.title': '让智能，<br>真正融入日常',
            'showcase.description': '将任务、记忆与行动连接起来，让技术在真实生活中发挥作用。',
            'showcase.cta': '认识团队',

            // CTA
            'cta.title': '准备好改变你的生活了吗？',
            'cta.subtitle': '加入数千名使用 ATLAS 保持井井有条和高效的用户。',
            'cta.start': '开始免费试用',
            'cta.pricing': '查看定价',

            // Footer
            'footer.product': '产品',
            'footer.features': '功能',
            'footer.pricing': '定价',
            'footer.dashboard': '工作台',
            'footer.company': '公司',
            'footer.about': '关于',
            'footer.blog': '博客',
            'footer.legal': '法律',
            'footer.privacy': '隐私',
            'footer.terms': '条款',
            'footer.copyright': '© 2024 Campus Intelligence. 保留所有权利。',

            // Team
            'team.badge': 'Our Team',
            'team.title': 'Campus Intelligence Team',
            'team.subtitle': 'A passionate team of innovators building the future of personal productivity.',
            'team.design.title': 'Design & UX',
            'team.design.desc': 'Creating intuitive and beautiful experiences that users love.',
            'team.engineering.title': 'Engineering',
            'team.engineering.desc': 'Building scalable, secure, and reliable systems.',
            'team.ai.title': 'AI Research',
            'team.ai.desc': 'Pioneering intelligent systems that understand and assist you.',
            'team.mission': 'We\'re a dedicated team of designers, engineers, and AI researchers committed to creating tools that empower people to achieve more. Our mission is to make personal intelligence accessible, private, and genuinely useful for everyone.',

            // Showcase
            'showcase.title': 'Intelligence that<br>fits real life',
            'showcase.description': 'Connect tasks, memory, and action so technology can make a meaningful difference in everyday life.',
            'showcase.cta': 'Meet the Team',

            // CTA
            'cta.title': 'Ready to Transform Your Life?',
            'cta.subtitle': 'Join thousands using ATLAS to stay organized and productive.',
            'cta.start': 'Start Free Trial',
            'cta.pricing': 'View Pricing',

            // Footer
            'footer.product': 'Product',
            'footer.features': 'Features',
            'footer.pricing': 'Pricing',
            'footer.dashboard': 'Dashboard',
            'footer.company': 'Company',
            'footer.about': 'About',
            'footer.blog': 'Blog',
            'footer.legal': 'Legal',
            'footer.privacy': 'Privacy',
            'footer.terms': 'Terms',
            'footer.copyright': '© 2024 Campus Intelligence. All rights reserved.',

            // Pricing
            'pricing.title': 'Simple, Transparent Pricing',
            'pricing.subtitle': 'Choose the plan that\'s right for you',
            'pricing.monthly': 'Monthly',
            'pricing.annual': 'Annual',
            'pricing.save': 'Save 20%',

            // Login & Signup
            'login.title': 'Welcome Back',
            'login.subtitle': 'Sign in to your ATLAS account',
            'login.email': 'Email Address',
            'login.password': 'Password',
            'login.remember': 'Remember me',
            'login.forgot': 'Forgot password?',
            'login.submit': 'Sign In',
            'login.signup': 'Don\'t have an account?',
            'login.signup.link': 'Sign Up',
            'login.demo': 'Demo Account',

            'signup.title': 'Create Account',
            'signup.subtitle': 'Join ATLAS today',
            'signup.name': 'Full Name',
            'signup.email': 'Email Address',
            'signup.password': 'Password',
            'signup.confirm': 'Confirm Password',
            'signup.agree': 'I agree to the',
            'signup.terms': 'Terms of Service',
            'signup.privacy': 'Privacy Policy',
            'signup.submit': 'Create Account',
            'signup.login': 'Already have an account?',
            'signup.login.link': 'Sign In',

            // Home/Dashboard
            'home.welcome': 'Good afternoon',
            'home.today.intro': 'Today you have',
            'home.tasks': 'tasks',
            'home.meetings': 'meetings',
            'home.priorities': 'Today\'s Priorities',
            'home.priorities.subtitle': 'Focus on these tasks',
            'home.schedule': 'Today\'s Schedule',
            'home.schedule.subtitle': 'Upcoming events',
            'home.stats': 'Efficiency Stats',
            'home.stats.subtitle': 'This week\'s progress',
            'home.suggestions': 'AI Suggestions',
            'home.suggestions.subtitle': 'Based on your work patterns',
            'home.actions': 'Quick Actions',
            'home.actions.subtitle': 'Common features',
            'home.activity': 'Recent Activity',
            'home.activity.subtitle': 'Your latest updates',
            'home.completed': 'Completed',
            'home.inprogress': 'In Progress',

            // Ask Page
            'ask.title': 'Ask ATLAS',
            'ask.subtitle': 'Describe what you want to do in natural language',
            'ask.placeholder': 'Describe what you want to do...',
            'ask.send': 'Send',
            'ask.suggestions.title': 'Suggested Questions',
            'ask.capabilities': 'ATLAS Capabilities',

            // Memory Pages
            'memory.title': 'Memory',
            'memory.subtitle': 'What ATLAS remembers about you',
            'memory.personal': 'Personal Info',
            'memory.preferences': 'Preferences',
            'memory.work': 'Work Context',
            'memory.relationships': 'Relationships',

            // Life Pages
            'life.title': 'Life',
            'life.subtitle': 'Your unified life view',
            'life.timeline': 'Timeline',
            'life.calendar': 'Calendar',
            'life.tasks': 'Tasks',
            'life.trips': 'Trips',
            'life.projects': 'Projects',
            'life.documents': 'Documents',

            // Agents Pages
            'agents.title': 'AI Agents',
            'agents.subtitle': 'Specialized agents working for you',
            'agents.travel': 'Travel Planning',
            'agents.runs': 'Run History',
            'agents.capabilities': 'Capabilities',
            'agents.actions': 'Actions',

            // Settings Pages
            'settings.title': 'Settings',
            'settings.subtitle': 'Manage your preferences',
            'settings.profile': 'Profile',
            'settings.privacy': 'Privacy',
            'settings.appearance': 'Appearance',
            'settings.execution': 'Execution Rules',
            'settings.demo': 'Demo Mode',

            // Common
            'common.save': 'Save',
            'common.cancel': 'Cancel',
            'common.delete': 'Delete',
            'common.edit': 'Edit',
            'common.back': 'Back',
            'common.next': 'Next',
            'common.loading': 'Loading...',
            'common.error': 'Error',
            'common.success': 'Success',
            'common.logout': 'Logout',
            'common.and': 'and',
        },

        'zh-CN': {
            // Navigation
            'nav.features': '产品功能',
            'nav.team': '团队介绍',
            'nav.pricing': '定价方案',
            'nav.blog': '博客',
            'nav.contact': '联系我们',
            'nav.signin': '登录',
            'nav.getstarted': '开始使用',
            'nav.home': '首页',
            'nav.ask': '询问',
            'nav.memory': '记忆',
            'nav.life': '生活',
            'nav.agents': '智能体',
            'nav.settings': '设置',

            // Hero Section
            'hero.eyebrow': '个人智能操作系统',
            'hero.title': '你的生活，<br>智能化管理',
            'hero.subtitle': '将信息转化为智能，将决策转化为行动。ATLAS 是你的 AI 驱动的生活操作系统。',
            'hero.cta.start': '免费开始',
            'hero.cta.learn': '了解更多',

            // Trusted By
            'trusted.title': '受全球创新者信赖',

            // Features
            'features.badge': '产品功能',
            'features.title': '保持井然有序所需的一切',
            'features.subtitle': 'ATLAS 将 AI 智能与直观设计相结合，打造真正个性化的操作系统。',

            'feature.memory.title': '智能记忆',
            'feature.memory.desc': 'ATLAS 记住关于你的一切——偏好、关系、工作环境，并利用这些知识提供个性化洞察。',

            'feature.tasks.title': '智能任务管理',
            'feature.tasks.desc': 'AI 驱动的优先级排序帮你专注于最重要的事。自动调度适应你的生产力模式。',

            'feature.agents.title': 'AI 智能体',
            'feature.agents.desc': '专业代理处理从旅行规划到邮件管理的一切，让你专注于高价值工作。',

            'feature.analytics.title': '生活分析',
            'feature.analytics.desc': '用精美的仪表板可视化你的生产力、健康和习惯。数据驱动的洞察帮你持续改进。',

            'feature.privacy.title': '隐私优先',
            'feature.privacy.desc': '你的数据属于你。端到端加密、本地存储选项和透明的 AI 操作让你完全掌控。',

            'feature.performance.title': '闪电般快速',
            'feature.performance.desc': '原生性能，即时搜索、实时同步和离线功能。在所有设备上无缝运行。',

            // Stats
            'stats.users': '活跃用户',
            'stats.tasks': '完成任务',
            'stats.uptime': '正常运行',
            'stats.rating': '用户评分',

            // Team
            'team.badge': '我们的团队',
            'team.title': 'Campus Intelligence 团队',
            'team.subtitle': '一支充满激情的创新团队，致力于打造个人生产力的未来。',
            'team.design.title': '设计与体验',
            'team.design.desc': '创造用户喜爱的直观和美观的体验。',
            'team.engineering.title': '工程技术',
            'team.engineering.desc': '构建可扩展、安全和可靠的系统。',
            'team.ai.title': 'AI 研究',
            'team.ai.desc': '开拓理解并辅助你的智能系统。',
            'team.mission': '我们是一支由设计师、工程师和 AI 研究人员组成的专业团队，致力于创造赋能人们成就更多的工具。我们的使命是让个人智能变得易用、私密且真正有用。',

            // CTA
            'cta.title': '准备好改变你的生活了吗？',
            'cta.subtitle': '加入数千名使用 ATLAS 保持井然有序和高效的人们。',

            // Footer
            'footer.tagline': '你的个人智能操作系统。由 Campus Intelligence 用 ❤️ 打造。',
            'footer.product': '产品',
            'footer.company': '公司',
            'footer.resources': '资源',
            'footer.legal': '法律',
            'footer.copyright': '© 2024 Campus Intelligence. 版权所有 | 用激情打造生产力工具。',

            // Pricing
            'pricing.title': '简单透明的定价',
            'pricing.subtitle': '选择适合你的方案',
            'pricing.monthly': '按月付费',
            'pricing.annual': '按年付费',
            'pricing.save': '节省 20%',

            // Login & Signup
            'login.title': '欢迎回来',
            'login.subtitle': '登录你的 ATLAS 账户',
            'login.email': '邮箱地址',
            'login.password': '密码',
            'login.remember': '记住我',
            'login.forgot': '忘记密码？',
            'login.submit': '登录',
            'login.signup': '还没有账户？',
            'login.signup.link': '立即注册',
            'login.demo': '演示账户',

            'signup.title': '创建账户',
            'signup.subtitle': '加入 ATLAS',
            'signup.name': '姓名',
            'signup.email': '邮箱地址',
            'signup.password': '密码',
            'signup.confirm': '确认密码',
            'signup.agree': '我同意',
            'signup.terms': '服务条款',
            'signup.privacy': '隐私政策',
            'signup.submit': '创建账户',
            'signup.login': '已经有账户？',
            'signup.login.link': '立即登录',

            // Home/Dashboard
            'home.welcome': '下午好',
            'home.today.intro': '今天你有',
            'home.tasks': '个待办事项',
            'home.meetings': '个会议',
            'home.priorities': '今日重点',
            'home.priorities.subtitle': '优先处理这些任务',
            'home.schedule': '今日日程',
            'home.schedule.subtitle': '接下来的安排',
            'home.stats': '效率统计',
            'home.stats.subtitle': '本周进展',
            'home.suggestions': 'AI 智能建议',
            'home.suggestions.subtitle': '基于你的工作模式',
            'home.actions': '快速操作',
            'home.actions.subtitle': '常用功能',
            'home.activity': '最近活动',
            'home.activity.subtitle': '你的最新动态',
            'home.completed': '已完成',
            'home.inprogress': '进行中',

            // Ask Page
            'ask.title': '询问 ATLAS',
            'ask.subtitle': '用自然语言描述你想做的事',
            'ask.placeholder': '描述你想做的事情...',
            'ask.send': '发送',
            'ask.suggestions.title': '建议的问题',
            'ask.capabilities': 'ATLAS 的能力',

            // Memory Pages
            'memory.title': '记忆',
            'memory.subtitle': 'ATLAS 对你的了解',
            'memory.personal': '个人信息',
            'memory.preferences': '偏好设置',
            'memory.work': '工作相关',
            'memory.relationships': '关系网络',

            // Life Pages
            'life.title': '生活',
            'life.subtitle': '你的统一生活视图',
            'life.timeline': '时间线',
            'life.calendar': '日历',
            'life.tasks': '任务',
            'life.trips': '行程',
            'life.projects': '项目',
            'life.documents': '文档',

            // Agents Pages
            'agents.title': 'AI 智能体',
            'agents.subtitle': '为你工作的专业代理',
            'agents.travel': '旅行规划',
            'agents.runs': '运行记录',
            'agents.capabilities': '能力与权限',
            'agents.actions': '动作中心',

            // Settings Pages
            'settings.title': '设置',
            'settings.subtitle': '管理你的偏好',
            'settings.profile': '个人资料',
            'settings.privacy': '隐私控制',
            'settings.appearance': '外观设置',
            'settings.execution': '执行规则',
            'settings.demo': 'Demo配置',

            // Common
            'common.save': '保存',
            'common.cancel': '取消',
            'common.delete': '删除',
            'common.edit': '编辑',
            'common.back': '返回',
            'common.next': '下一步',
            'common.loading': '加载中...',
            'common.error': '错误',
            'common.success': '成功',
            'common.logout': '登出',
            'common.and': '和',
        }
    };

    // i18n Manager
    class I18nManager {
        constructor() {
            console.log('I18nManager initializing...');
            this.currentLang = this.getStoredLanguage() || this.detectLanguage();
            this.translations = translations;
            console.log('Current language:', this.currentLang);
        }

        // 检测浏览器语言
        detectLanguage() {
            const browserLang = navigator.language || navigator.userLanguage;
            console.log('Browser language:', browserLang);
            if (browserLang.startsWith('zh')) {
                return 'zh-CN';
            }
            return 'en';
        }

        // 获取存储的语言
        getStoredLanguage() {
            try {
                return localStorage.getItem('atlas_language');
            } catch (e) {
                console.warn('localStorage not available:', e);
                return null;
            }
        }

        // 设置语言
        setLanguage(lang) {
            console.log('Setting language to:', lang);
            this.currentLang = lang;

            try {
                localStorage.setItem('atlas_language', lang);
            } catch (e) {
                console.warn('Cannot save language preference:', e);
            }

            document.documentElement.lang = lang;
            this.updatePage();
        }

        // 获取翻译文本
        t(key) {
            const keys = key.split('.');
            let value = this.translations[this.currentLang];

            for (const k of keys) {
                if (value && typeof value === 'object') {
                    value = value[k];
                } else {
                    console.warn('Translation not found for:', key);
                    return key;
                }
            }

            return value || key;
        }

        // 更新页面所有翻译
        updatePage() {
            console.log('Updating page translations...');
            let count = 0;

            // 更新所有带 data-i18n 属性的元素
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = this.t(key);

                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.innerHTML = translation;
                }
                count++;
            });

            console.log('Updated', count, 'elements');

            // 更新语言切换按钮状态
            document.querySelectorAll('.lang-switch').forEach(btn => {
                const lang = btn.getAttribute('data-lang');
                if (lang === this.currentLang) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // 触发自定义事件
            try {
                document.dispatchEvent(new CustomEvent('languageChanged', {
                    detail: { language: this.currentLang }
                }));
            } catch (e) {
                console.warn('Cannot dispatch event:', e);
            }
        }

        // 切换语言
        toggle() {
            const newLang = this.currentLang === 'en' ? 'zh-CN' : 'en';
            this.setLanguage(newLang);
        }
    }

    // 创建全局实例
    window.i18n = new I18nManager();
    window.t = function(key) { return window.i18n.t(key); };

    console.log('i18n object created:', window.i18n);

    // 页面加载完成后初始化
    function initI18n() {
        console.log('Initializing i18n...');

        // 初始化页面翻译
        window.i18n.updatePage();

        // 绑定语言切换按钮
        document.querySelectorAll('.lang-switch').forEach(btn => {
            console.log('Binding lang-switch button:', btn.getAttribute('data-lang'));

            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const lang = this.getAttribute('data-lang');
                console.log('Language button clicked:', lang);
                window.i18n.setLanguage(lang);
            });
        });

        // 快捷键切换语言 (Ctrl/Cmd + L)
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                window.i18n.toggle();
            }
        });

        console.log('i18n initialization complete');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initI18n);
    } else {
        initI18n();
    }

})();
