# 🚀 ATLAS HTML 部署指南

## 📁 项目文件

你的纯 HTML 网站位于：`/Users/xufengye/Desktop/atlas-html/`

包含：
- ✅ 27 个 HTML 页面
- ✅ 2 个 CSS 样式表
- ✅ 2 个 JavaScript 文件
- ✅ 完整的导航系统
- ✅ 精美的动画效果

---

## 🌐 部署方法

### 方法 1: GitHub Pages（推荐）

#### 步骤 1: 创建 GitHub 仓库
```bash
# 1. 访问 https://github.com/new
# 2. Repository name: atlas
# 3. 选择 Public
# 4. 不要勾选任何初始化选项
# 5. 点击 "Create repository"
```

#### 步骤 2: 上传代码
```bash
cd /Users/xufengye/Desktop/atlas-html

git init
git add .
git commit -m "🎉 Initial commit: ATLAS HTML Website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/atlas.git
git push -u origin main
```

#### 步骤 3: 启用 Pages
```
1. 进入仓库页面
2. 点击 Settings
3. 左侧菜单找到 Pages
4. Source 选择: Deploy from a branch
5. Branch 选择: main 和 / (root)
6. 点击 Save
```

#### 步骤 4: 访问网站
等待 1-2 分钟，访问：
```
https://YOUR-USERNAME.github.io/atlas/
```

---

### 方法 2: Netlify（最简单）

1. 访问 https://app.netlify.com/drop
2. 直接拖拽 `atlas-html` 文件夹到页面
3. 完成！立即获得一个网址

---

### 方法 3: Vercel

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
cd /Users/xufengye/Desktop/atlas-html
vercel

# 按提示操作，几秒钟即可部署完成
```

---

### 方法 4: 本地测试

#### 使用 Python（推荐）
```bash
cd /Users/xufengye/Desktop/atlas-html
python3 -m http.server 8000

# 访问 http://localhost:8000
```

#### 使用 Node.js
```bash
npx serve /Users/xufengye/Desktop/atlas-html

# 访问显示的 URL
```

#### 直接打开
```bash
# macOS
open /Users/xufengye/Desktop/atlas-html/index.html

# 或者在访达中双击 index.html
```

---

### 方法 5: 其他平台

#### 阿里云 OSS
1. 创建 OSS Bucket（公共读）
2. 上传所有文件
3. 启用静态网站托管
4. 设置 index.html 为默认首页

#### 腾讯云 COS
1. 创建 COS 存储桶
2. 上传所有文件
3. 开启静态网站功能
4. 配置自定义域名（可选）

#### Cloudflare Pages
1. 连接 GitHub 仓库
2. 选择项目
3. 自动部署

---

## 📝 更新网站

### GitHub Pages
```bash
cd /Users/xufengye/Desktop/atlas-html

# 修改文件后
git add .
git commit -m "更新说明"
git push

# 等待 1-2 分钟自动部署
```

### Netlify
- 重新拖拽文件夹
- 或连接 GitHub 自动部署

---

## 🎨 自定义

### 修改颜色
编辑 `assets/css/main.css`：
```css
:root {
    --color-primary: #2563eb;  /* 主色 */
    --color-accent: #06b6d4;   /* 强调色 */
}
```

### 修改动画速度
编辑 `assets/css/main.css`：
```css
.orb-1 {
    animation-duration: 10s;  /* 改为你想要的秒数 */
}
```

### 添加新页面
1. 复制 `template.html`
2. 修改内容
3. 在其他页面添加链接

---

## 📊 性能

- **首页大小**: ~15KB
- **加载时间**: <100ms（本地）
- **无外部依赖**: 完全离线可用
- **SEO 友好**: 完整的 HTML 语义化

---

## ⚠️ 常见问题

### Q: 页面显示不正常？
A: 确保文件夹结构完整：
```
atlas-html/
├── index.html
├── assets/
│   ├── css/
│   └── js/
└── (其他 HTML 文件)
```

### Q: 动画不流畅？
A: 检查浏览器版本：
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Q: 如何修改语言？
A: 编辑 HTML 文件中的文字内容

---

## 📧 需要帮助？

在 GitHub 仓库创建 Issue 或联系我们。

---

**🎉 祝你部署顺利！**
