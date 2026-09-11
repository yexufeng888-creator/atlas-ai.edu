# ATLAS 多页面中英双语支持 - 实施指南

## ✅ 已完成的页面

### 核心页面（已添加完整支持）
- ✅ **index.html** - 主页（完整翻译 + 语言切换）
- ✅ **pricing.html** - 定价页面（已添加语言切换）
- ✅ **blog.html** - 博客页面（已添加语言切换）
- ✅ **login.html** - 登录页面（已有 data-i18n 属性）
- ✅ **signup.html** - 注册页面（已有 data-i18n 属性）

---

## 📝 需要完成的页面

### 主要功能页面（需要添加）
- ⏳ **home.html** - 工作台
- ⏳ **ask.html** - AI对话

### Memory 模块（5个页面）
- ⏳ **memory.html** - 记忆主页
- ⏳ **memory-personal.html** - 个人信息
- ⏳ **memory-preferences.html** - 偏好设置
- ⏳ **memory-work.html** - 工作相关
- ⏳ **memory-relationships.html** - 关系网络

### Life 模块（7个页面）
- ⏳ **life.html** - 生活主页
- ⏳ **life-timeline.html** - 时间线
- ⏳ **life-calendar.html** - 日历
- ⏳ **life-tasks.html** - 任务
- ⏳ **life-trips.html** - 行程
- ⏳ **life-projects.html** - 项目
- ⏳ **life-documents.html** - 文档

### Agents 模块（5个页面）
- ⏳ **agents.html** - 智能体主页
- ⏳ **agents-travel.html** - 旅行规划
- ⏳ **agents-runs.html** - 运行记录
- ⏳ **agents-capabilities.html** - 能力与权限
- ⏳ **agents-actions.html** - 动作中心

### Settings 模块（6个页面）
- ⏳ **settings.html** - 设置主页
- ⏳ **settings-profile.html** - 个人资料
- ⏳ **settings-privacy.html** - 隐私控制
- ⏳ **settings-appearance.html** - 外观设置
- ⏳ **settings-execution.html** - 执行规则
- ⏳ **settings-demo.html** - Demo配置

---

## 🔧 实施步骤（每个页面）

### 步骤 1：添加语言切换按钮

在导航栏或页面顶部添加：

```html
<!-- 方式一：简单按钮（适合内部页面） -->
<div style="display: flex; gap: 0.5rem;">
    <button class="lang-switch" data-lang="en">EN</button>
    <button class="lang-switch" data-lang="zh-CN">中文</button>
</div>

<!-- 方式二：带国旗图标（适合登录注册页面） -->
<button class="control-btn lang-switch" data-lang="en" title="English">🇺🇸</button>
<button class="control-btn lang-switch" data-lang="zh-CN" title="中文">🇨🇳</button>
```

### 步骤 2：为文本元素添加 data-i18n 属性

```html
<!-- 标题 -->
<h1 data-i18n="memory.title">Memory</h1>

<!-- 段落 -->
<p data-i18n="memory.subtitle">What ATLAS remembers about you</p>

<!-- 按钮 -->
<button data-i18n="common.save">Save</button>

<!-- 链接 -->
<a href="#" data-i18n="nav.home">Home</a>

<!-- 输入框占位符 -->
<input type="text" data-i18n="search.placeholder" placeholder="Search...">
```

### 步骤 3：在页面底部添加 i18n.js

在 `</body>` 标签前添加：

```html
<script src="assets/js/i18n.js"></script>
<script>
    // 语言切换按钮样式
    const style = document.createElement('style');
    style.textContent = `
        .lang-switch.active {
            background: linear-gradient(135deg, #2563eb, #06b6d4) !important;
            color: white !important;
            border-color: transparent !important;
        }
    `;
    document.head.appendChild(style);
</script>
```

### 步骤 4：在 i18n.js 中添加翻译

```javascript
// 在 translations.en 中添加
'memory.title': 'Memory',
'memory.subtitle': 'What ATLAS remembers about you',

// 在 translations['zh-CN'] 中添加
'memory.title': '记忆',
'memory.subtitle': 'ATLAS 对你的了解',
```

---

## 📚 翻译键命名规范

### 模块级别
```
模块名.功能.元素

例如：
memory.personal.title          // Memory > Personal > 标题
life.calendar.event.new        // Life > Calendar > 事件 > 新建
agents.travel.destination      // Agents > Travel > 目的地
settings.privacy.data          // Settings > Privacy > 数据
```

### 通用元素
```
common.save                    // 保存
common.cancel                  // 取消
common.delete                  // 删除
common.edit                    // 编辑
nav.home                       // 导航 > 首页
```

---

## 🎯 快速添加模板

### 模板 1：带导航的内部页面

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Page Title - ATLAS</title>
    <link rel="stylesheet" href="assets/css/page.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <a href="index.html" class="nav-brand">
                <span class="brand-name">ATLAS</span>
            </a>

            <div class="nav-links">
                <a href="home.html" class="nav-link" data-i18n="nav.home">Home</a>
                <a href="memory.html" class="nav-link" data-i18n="nav.memory">Memory</a>
                <!-- 更多链接 -->
            </div>

            <!-- Language Switcher -->
            <div style="display: flex; gap: 0.5rem; margin-left: auto;">
                <button class="lang-switch" data-lang="en" style="padding: 0.5rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">EN</button>
                <button class="lang-switch" data-lang="zh-CN" style="padding: 0.5rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">中文</button>
            </div>
        </div>
    </nav>

    <!-- Page Content -->
    <main>
        <h1 data-i18n="page.title">Page Title</h1>
        <p data-i18n="page.description">Description text</p>
    </main>

    <script src="assets/js/i18n.js"></script>
    <script>
        const style = document.createElement('style');
        style.textContent = `.lang-switch.active { background: linear-gradient(135deg, #2563eb, #06b6d4) !important; color: white !important; border-color: transparent !important; }`;
        document.head.appendChild(style);
    </script>
</body>
</html>
```

---

## 📊 当前进度

```
总页面数: 30
已完成: 5 (17%)
待完成: 25 (83%)

核心页面: ████████████████████ 100% (5/5)
Memory: ░░░░░░░░░░░░░░░░░░░░ 0% (0/5)
Life: ░░░░░░░░░░░░░░░░░░░░ 0% (0/7)
Agents: ░░░░░░░░░░░░░░░░░░░░ 0% (0/5)
Settings: ░░░░░░░░░░░░░░░░░░░░ 0% (0/6)
其他: ██████████░░░░░░░░░░ 50% (1/2)
```

---

## 🚀 快速测试

### 测试已完成的页面

1. **index.html** - 主页
   ```
   打开 http://localhost:8000/index.html
   点击右上角 EN / 中文 按钮
   观察所有文字变化
   ```

2. **pricing.html** - 定价
   ```
   打开 http://localhost:8000/pricing.html
   切换语言查看标题变化
   ```

3. **blog.html** - 博客
   ```
   打开 http://localhost:8000/blog.html
   切换语言
   ```

---

## 💡 建议

### 优先级排序

**高优先级（用户最常访问）：**
1. home.html - 工作台
2. ask.html - AI对话
3. memory.html - 记忆主页
4. life.html - 生活主页
5. agents.html - 智能体主页
6. settings.html - 设置主页

**中优先级（功能页面）：**
- Memory 模块的 4 个子页面
- Life 模块的 6 个子页面
- Agents 模块的 4 个子页面

**低优先级（设置页面）：**
- Settings 模块的 5 个子页面

---

## ⚡ 批量操作建议

### 使用查找替换

在每个文件中：

1. 查找 `<h1>` → 替换为 `<h1 data-i18n="page.title">`
2. 查找 `<button>Save` → 替换为 `<button data-i18n="common.save">Save`
3. 查找 `placeholder="` → 在对应元素添加 `data-i18n`

### 使用 VS Code 多光标

1. 选中所有需要翻译的文本
2. 使用多光标同时编辑
3. 批量添加 `data-i18n` 属性

---

## ✅ 下一步行动

1. **立即测试**
   - 打开 index.html
   - 验证语言切换功能
   - 确认所有翻译正常

2. **添加高优先级页面**
   - 从 home.html 开始
   - 逐个添加语言切换
   - 测试每个页面

3. **扩展翻译内容**
   - 在 i18n.js 添加新翻译
   - 保持键名一致性
   - 定期测试

---

## 📞 需要帮助？

如果需要为特定页面添加支持，请告诉我：
1. 页面名称（如 home.html）
2. 页面的主要内容
3. 需要翻译的文本

我会帮你生成完整的代码！
