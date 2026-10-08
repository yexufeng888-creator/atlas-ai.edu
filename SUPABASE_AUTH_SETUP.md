# Supabase 登录与阿里云短信配置

前端已按项目 `qyxsknignotmouyrhqqw` 接入 Supabase Auth：手机号验证码、邮箱密码注册/登录和邮箱密码重置都会请求 Supabase。短信 Hook 未启用、Supabase 公钥未填写之前，登录不会退回本地演示认证。

## 1. 配置浏览器端公开参数

1. 打开 [Supabase 项目 API Keys](https://supabase.com/dashboard/project/qyxsknignotmouyrhqqw/settings/api-keys)。
2. 复制项目 URL（应为 `https://qyxsknignotmouyrhqqw.supabase.co`）和 `Publishable key`。旧项目也可使用 `anon` 公钥。
3. 将公钥填入 `assets/js/supabase-config.js` 的 `publishableKey`。

此 key 是浏览器公开 key，不是密码；严禁在前端填写 `service_role`、Secret key、阿里云 AccessKey Secret 或 Hook secret。数据库表仍必须启用 RLS 并配置正确策略。

## 2. 开通 Supabase Auth

1. 在 Supabase Dashboard 的 **Authentication → Sign In / Providers** 中启用 **Phone**。此页面的短信发送由下面的 Send SMS Hook 接管。
2. 在 **Authentication → URL Configuration** 设置正式站点的 Site URL，并将正式登录页 URL、含 `?recovery=1` 的重置页 URL和本地测试 URL（例如 `http://localhost:8000/**`）加入 Redirect URLs。部署地址或端口变化时同步更新。
3. 如需邮箱密码注册、验证邮件和找回密码，在 **Authentication → SMTP Settings** 配置你实际使用的 SMTP 服务；同时检查 Email provider 的确认邮件设置和邮件模板。
4. 配置 Auth 短信发送频率限制。前端 60 秒倒计时只改善体验，不是安全限流。当前页面尚未接入 CAPTCHA widget；如果要在 Supabase 强制 CAPTCHA，需先在前端集成所选验证组件并将 captcha token 传给 `signInWithOtp`，仅打开 Dashboard 开关会导致短信登录请求失败。

## 3. 准备阿里云短信

1. 在阿里云开通短信服务，完成账户及中国大陆短信要求的资质审核。
2. 创建并审核短信签名和验证码模板。模板变量使用 `${code}`，例如“验证码${code}，请勿泄露”。将模板参数及用途按阿里云规范提交审核。
3. 创建仅有短信发送权限的 RAM 子账号 AccessKey，不要使用主账号密钥。记录 AccessKey ID/Secret、审核通过的签名名称和模板 Code。
4. 本站当前短信 Hook 仅接收 `+86` 中国大陆手机号，并将号码交给阿里云发送；其他国家/地区号码会被拒绝。

## 4. 部署并配置 Send SMS Hook

仓库已包含 `supabase/functions/send-sms-hook/index.ts`。它会验证 Supabase 的 Standard Webhooks 签名，再通过阿里云 `SendSms` API 发送短信；OTP 和密钥不会进入浏览器代码或日志。

1. 安装并登录 [Supabase CLI](https://supabase.com/docs/guides/cli)，在仓库根目录链接项目：

   ```sh
   supabase login
   supabase link --project-ref qyxsknignotmouyrhqqw
   ```

2. 在 Supabase Dashboard 的 **Edge Functions → Secrets** 安全保存以下变量（也可通过 CLI secrets 命令设置，切勿提交到 Git）：

   - `ALIBABA_CLOUD_ACCESS_KEY_ID`
   - `ALIBABA_CLOUD_ACCESS_KEY_SECRET`
   - `ALIYUN_SMS_SIGN_NAME`
   - `ALIYUN_SMS_TEMPLATE_CODE`
   - `SEND_SMS_HOOK_SECRET`

   最后一个变量必须与 Supabase 创建 Send SMS Hook 时生成/配置的完整签名密钥一致（包含 `v1,whsec_` 前缀）。不要把上述任何密钥写入 `assets/js/`、HTML、公开仓库或浏览器控制台。

3. 部署函数：

   ```sh
   supabase functions deploy send-sms-hook --project-ref qyxsknignotmouyrhqqw --no-verify-jwt
   ```

   `supabase/config.toml` 已为此函数关闭 JWT 校验。函数仍会强制验证 Supabase Hook 签名；不要删除代码中的签名校验。

4. 在 Supabase Dashboard 的 **Authentication → Hooks** 创建/启用 **Send SMS** Hook，选择 HTTP 请求目标并填写：

   `https://qyxsknignotmouyrhqqw.supabase.co/functions/v1/send-sms-hook`

   将此 Hook 使用的签名密钥同样保存为 Edge Function secret `SEND_SMS_HOOK_SECRET`。保存 Hook 后，在 Phone provider 中确认短信发送使用此 Hook。Supabase 会把 `user.phone` 和 `sms.otp` 放入签名请求；函数成功时返回 HTTP 200 和空 JSON 对象。

## 5. 本地与上线验证

1. 用本地 HTTP 服务或正式 HTTPS 域名打开网站，不要通过 `file://` 打开。可在仓库目录运行 `python3 -m http.server 8000`，然后访问 `http://localhost:8000/login.html`。
2. 勾选服务条款与隐私政策确认，输入 `+86` 手机号，点击发送验证码。检查 Supabase Auth Hook/Edge Function 日志及阿里云发送记录；确认短信收到后输入 6 位验证码。
3. 成功后应创建/验证 Supabase Auth 用户、建立 Supabase session 并进入 `home.html`。未登录访问工作台会被送回登录页。测试邮箱注册、验证邮件和重置密码时也要使用配置过的 SMTP 和 Redirect URLs。
4. 上线前确认 Aliyun RAM 权限最小化、Supabase RLS、短信限流以及（如已完成前端集成）CAPTCHA、隐私政策中的实际服务商及数据处理披露均已完成。短信送达、账户实名/备案及合规要求取决于你的 Supabase 与阿里云账户配置。

> 工作台登录拦截在静态前端完成，只能控制页面展示，不能保护仓库中公开可下载的静态文件或替代后端授权。任何用户数据都应存入受 RLS 保护的表，并由 Supabase 按当前用户身份执行授权。
