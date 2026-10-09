# ATLAS - Personal Intelligence OS

## 📁 纯 HTML 静态网站

这是 ATLAS 的纯 HTML/CSS/JavaScript 版本，不依赖任何框架，可以直接在浏览器中打开或部署到任何静态服务器。

## 🗂️ 项目结构

```
atlas-html/
├── index.html              # 主页（精美设计）
├── home.html              # 首页工作台
├── ask.html               # 询问 ATLAS
├── memory.html            # 记忆管理
├── life.html              # 生活视图
├── agents.html            # 智能体
├── settings.html          # 设置
├── memory-*.html          # Memory 子页面 (4个)
├── life-*.html            # Life 子页面 (6个)
├── agents-*.html          # Agents 子页面 (4个)
├── settings-*.html        # Settings 子页面 (5个)
├── assets/
│   ├── css/
│   │   ├── main.css       # 主页样式
│   │   └── page.css       # 内页样式
│   └── js/
│       ├── main.js        # 主页脚本
│       └── page.js        # 内页脚本
└── README.md
```

## 🚀 快速开始

### 方法 1: 直接打开
双击 `index.html` 文件即可在浏览器中打开。

### 方法 2: 使用本地服务器
```bash
# Python 3
cd atlas-html
python3 -m http.server 8000

# 然后访问 http://localhost:8000
```

### 方法 3: 使用 Node.js
```bash
npx serve atlas-html

# 然后访问显示的 URL
```

## 🤖 连接 ECS 上的 Ollama

公开网站不能直接访问访客电脑上的 `localhost`，也不应把 Ollama 的 `11434` 端口暴露到公网。本项目使用 ECS 上的受保护 API：验证 Supabase 登录、限制每个用户每天 20 次，再将请求转发到仅监听本机的 Ollama。

部署步骤、DNS、HTTPS、防火墙和 systemd 配置见 [server/DEPLOY.md](./server/DEPLOY.md)。API 使用 Python 标准库和 SQLite，不需要额外 Python 包。

## 🌐 部署

### GitHub Pages
1. 创建 GitHub 仓库
2. 上传所有文件
3. 在 Settings → Pages 中启用 Pages
4. 选择 main 分支和 root 目录

### Netlify
直接拖拽 `atlas-html` 文件夹到 Netlify Drop

### Vercel
```bash
npx vercel atlas-html
```

### 其他平台
- 阿里云 OSS
- 腾讯云 COS  
- Cloudflare Pages
- 任何支持静态文件的服务器

## 📄 页面列表

### 主页面 (6个)
- `index.html` - 欢迎页
- `home.html` - 首页工作台
- `ask.html` - 询问 ATLAS
- `memory.html` - 记忆
- `life.html` - 生活
- `agents.html` - 智能体
- `settings.html` - 设置

### Memory 子页面 (4个)
- `memory-personal.html` - 个人信息
- `memory-preferences.html` - 偏好设置
- `memory-work.html` - 工作相关
- `memory-relationships.html` - 关系网络

### Life 子页面 (6个)
- `life-timeline.html` - 时间线
- `life-calendar.html` - 日历
- `life-tasks.html` - 任务
- `life-trips.html` - 行程
- `life-projects.html` - 项目
- `life-documents.html` - 文档

### Agents 子页面 (4个)
- `agents-travel.html` - 旅行规划
- `agents-runs.html` - 运行记录
- `agents-capabilities.html` - Agent 能力
- `agents-actions.html` - 动作中心

### Settings 子页面 (5个)
- `settings-profile.html` - 个人资料
- `settings-privacy.html` - 隐私控制
- `settings-demo.html` - Demo 配置
- `settings-execution.html` - 执行规则
- `settings-appearance.html` - 外观设置

**总计: 26 个完整的 HTML 页面**

## 🎨 特色功能

- ✨ **玻璃态设计**: 半透明背景 + 模糊效果
- 🌈 **动态背景**: 3层浮动渐变球体动画
- 💫 **流畅动画**: 原生 CSS 动画
- 📱 **响应式**: 完美适配所有设备
- 🎯 **零依赖**: 纯 HTML/CSS/JavaScript
- ⚡ **高性能**: 无框架开销
- 🌐 **SEO 友好**: 语义化 HTML

## 📝 自定义

### 修改颜色
编辑 `assets/css/main.css` 中的 CSS 变量：
```css
:root {
    --color-primary: #2563eb;
    --color-accent: #06b6d4;
    /* ... */
}
```

### 添加新页面
1. 复制 `template.html`
2. 修改内容
3. 更新导航链接

### 修改动画
编辑 `assets/css/main.css` 中的 `@keyframes` 规则

## 🔧 技术栈

- **HTML5**: 语义化标签
- **CSS3**: 动画、渐变、Grid、Flexbox
- **JavaScript**: 原生 ES6+
- **无依赖**: 不需要任何库或框架

## 📊 性能

- 首页大小: ~15KB (HTML + CSS + JS)
- 加载时间: <100ms (本地)
- 无外部请求
- 完全离线可用

## ⚠️ 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📧 问题反馈

如有问题或建议，欢迎提出！

## 📄 许可证

MIT License

---

**🎉 享受使用 ATLAS!**
