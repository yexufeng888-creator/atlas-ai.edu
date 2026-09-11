// 主题系统
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
};

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('atlas-theme') || THEMES.SYSTEM;
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupListeners();
    }

    setupListeners() {
        // 系统主题变化监听
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (this.currentTheme === THEMES.SYSTEM) {
                this.updateThemeClass(e.matches ? THEMES.DARK : THEMES.LIGHT);
            }
        });
    }

    applyTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('atlas-theme', theme);

        if (theme === THEMES.SYSTEM) {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.updateThemeClass(isDark ? THEMES.DARK : THEMES.LIGHT);
        } else {
            this.updateThemeClass(theme);
        }
    }

    updateThemeClass(theme) {
        document.documentElement.classList.remove('light-theme', 'dark-theme');
        document.documentElement.classList.add(`${theme}-theme`);
        document.documentElement.setAttribute('data-theme', theme);
    }

    switchTheme(theme) {
        this.applyTheme(theme);
        this.updateThemeButtons();
    }

    updateThemeButtons() {
        document.querySelectorAll('.theme-switch').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.currentTheme);
        });
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

// 初始化主题管理器
const themeManager = new ThemeManager();

// 导出
window.atlasTheme = themeManager;

// DOM 加载完成后设置按钮
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.theme-switch').forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.dataset.theme;
            themeManager.switchTheme(theme);
        });
    });

    themeManager.updateThemeButtons();
});
