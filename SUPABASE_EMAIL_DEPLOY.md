# 邮箱验证码登录：从零部署

## 1. 填入公开 key
1. 打开 Supabase 项目 → Settings → API Keys。
2. 复制 **Publishable key**（`sb_publishable_...`，旧项目为 `anon` key）。
3. 填入 `assets/js/supabase-config.js` 的 `publishableKey`。
4. 禁止填 `sb_secret_...` 或 `service_role`，它们等同后台管理员密码。

## 2. 开启邮箱登录
Authentication → Sign In / Providers → **Email**：开启；按需关闭或保留 "Confirm email"。

## 3. 让邮件显示验证码
默认邮件模板发的是链接。Authentication → Emails → Templates：
- **Magic Link**（已有用户）和 **Confirm signup**（新用户）都要改，正文加入 `{{ .Token }}`：

```html
<h2>ATLAS 登录验证码</h2>
<p>你的验证码：<strong>{{ .Token }}</strong></p>
<p>请勿告知他人。如非本人操作请忽略。</p>
```

## 4. 站点地址
Authentication → URL Configuration：
- Site URL：正式域名，如 `https://你的域名`
- Redirect URLs 添加：`http://localhost:8000/**`、`https://你的域名/**`

## 5. 发信服务（重要）
Supabase 内置邮件仅用于测试，只发给团队成员邮箱且限额很低。正式使用需 Authentication → SMTP Settings 配置自己的 SMTP（如 Resend、阿里云邮件推送、腾讯企业邮箱），并配置发件域名 SPF/DKIM。

## 6. 本地测试
```sh
cd /Users/xufengye/Desktop/atlas-html
python3 -m http.server 8000
```
打开 `http://localhost:8000/login.html` → 邮箱验证码 → 勾选同意 → 发送 → 输入邮件验证码。成功后跳转 `home.html`；在 Supabase → Authentication → Users 可看到用户。

## 7. 上线
把整个目录部署到任何 HTTPS 静态托管（Vercel、Netlify、Cloudflare Pages、GitHub Pages）。上线后在 Supabase 把该域名加入 Site URL / Redirect URLs。

## 常见问题
- 提示"尚未配置"：key 没填或页面缓存，强刷。
- 收不到邮件：先查垃圾箱；未配 SMTP 时只能发给团队成员；有 60 秒发送间隔。
- 收到链接没验证码：第 3 步模板未加 `{{ .Token }}`。
- 手机短信：后续再看 `SUPABASE_AUTH_SETUP.md`，本流程无需配置。
