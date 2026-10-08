(function () {
    'use strict';

    const status = document.getElementById('authStatus');
    const config = window.ATLAS_SUPABASE_CONFIG;
    const sdk = window.supabase;
    const authRequired = document.body.dataset.authRequired === 'true';

    function showStatus(message, state = 'info') {
        if (!status) return;
        status.textContent = message;
        status.dataset.state = state;
    }

    function getErrorMessage(error) {
        return error && typeof error.message === 'string'
            ? error.message
            : '请求未能完成，请稍后重试。';
    }

    function setBusy(button, busy, label) {
        if (!button) return;
        button.disabled = busy;
        button.classList.toggle('loading', busy);
        if (label) {
            const text = button.querySelector('span');
            if (text) text.textContent = label;
        }
    }

    function hasConsent() {
        const acknowledgement = document.getElementById('loginAcknowledgement');
        if (!acknowledgement || acknowledgement.checked) return true;
        showStatus('请先阅读并确认服务条款与隐私政策。', 'error');
        acknowledgement.focus();
        return false;
    }

    function validWebOrigin() {
        return window.location.protocol === 'https:' ||
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';
    }

    function isPublicSupabaseKey(key) {
        if (key.startsWith('sb_publishable_')) return true;
        if (key.startsWith('sb_secret_')) return false;
        const parts = key.split('.');
        if (parts.length !== 3) return false;
        try {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            return payload.role === 'anon';
        } catch {
            return false;
        }
    }

    let authUnavailableMessage = '';
    const loginForm = document.getElementById('loginForm');
    document.querySelectorAll('.password-toggle').forEach((button) => {
        button.addEventListener('click', () => {
            const input = button.parentElement.querySelector('input');
            if (input) input.type = input.type === 'password' ? 'text' : 'password';
        });
    });

    document.querySelectorAll('.social-btn').forEach((button) => {
        button.addEventListener('click', () => {
            showStatus('该第三方登录尚未配置，请使用手机号验证码或邮箱密码登录。', 'info');
        });
    });

    if (loginForm) {
        document.querySelectorAll('[data-auth-method]').forEach((tab) => {
            tab.addEventListener('click', () => {
                const panels = {
                    emailOtp: document.getElementById('emailOtpForm'),
                    email: loginForm,
                    phone: document.getElementById('phoneLoginForm')
                };
                Object.entries(panels).forEach(([method, panel]) => {
                    panel.hidden = method !== tab.dataset.authMethod;
                });
                document.querySelectorAll('[data-auth-method]').forEach((item) => {
                    const active = item === tab;
                    item.setAttribute('aria-selected', String(active));
                    item.classList.toggle('active', active);
                });
                showStatus(authUnavailableMessage, authUnavailableMessage ? 'error' : 'info');
            });
        });
    }

    function blockUnconfiguredForms(message) {
        document.querySelectorAll('#loginForm, #emailOtpForm, #phoneLoginForm, #signupForm, #resetPasswordForm, #updatePasswordForm')
            .forEach((form) => {
                form.addEventListener('submit', (event) => {
                    event.preventDefault();
                    showStatus(message, 'error');
                });
            });
        ['sendOtpButton', 'sendEmailOtpButton'].forEach((id) => {
            document.getElementById(id)?.addEventListener('click', () => showStatus(message, 'error'));
        });
    }

    if (!sdk || typeof sdk.createClient !== 'function') {
        const message = 'Supabase SDK 加载失败。请检查网络连接后重试。';
        authUnavailableMessage = message;
        showStatus(message, 'error');
        blockUnconfiguredForms(message);
        if (authRequired) window.location.replace('login.html');
        return;
    }

    if (!config || !config.url || !config.publishableKey || !isPublicSupabaseKey(config.publishableKey)) {
        const message = config?.publishableKey
            ? '配置错误：浏览器只能使用 Supabase Publishable/anon key，不能使用 Secret/service_role key。'
            : '真实认证尚未配置：请在 assets/js/supabase-config.js 中填写 Supabase Publishable/anon key，并完成 SUPABASE_AUTH_SETUP.md 中的后台设置。';
        authUnavailableMessage = message;
        showStatus(message, 'error');
        blockUnconfiguredForms(message);
        if (authRequired) window.location.replace('login.html');
        return;
    }

    let client;
    try {
        client = sdk.createClient(config.url, config.publishableKey, {
            auth: {
                autoRefreshToken: true,
                detectSessionInUrl: true,
                persistSession: true
            }
        });
    } catch (error) {
        const message = `Supabase 配置无效：${getErrorMessage(error)}`;
        authUnavailableMessage = message;
        showStatus(message, 'error');
        blockUnconfiguredForms(message);
        if (authRequired) window.location.replace('login.html');
        return;
    }
    window.atlasSupabase = client;

    function goToDashboard() {
        window.location.assign('home.html');
    }

    function normalizeMainlandPhone(value) {
        const phone = value.replace(/[\s()-]/g, '');
        return /^\+861[3-9]\d{9}$/.test(phone) ? phone : null;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!hasConsent() || !validWebOrigin()) {
                if (!validWebOrigin()) showStatus('请通过 HTTPS 网站或 localhost 打开登录页，不要直接用 file:// 打开。', 'error');
                return;
            }

            const button = loginForm.querySelector('[type="submit"]');
            setBusy(button, true);
            try {
                const { error } = await client.auth.signInWithPassword({
                    email: document.getElementById('loginEmail').value.trim(),
                    password: document.getElementById('loginPassword').value
                });
                if (error) throw error;
                showStatus('登录成功，正在进入工作台…', 'success');
                window.setTimeout(goToDashboard, 300);
            } catch (error) {
                showStatus(getErrorMessage(error), 'error');
            } finally {
                setBusy(button, false);
            }
        });

        const emailOtpForm = document.getElementById('emailOtpForm');
        const otpEmail = document.getElementById('otpEmail');
        const emailOtpGroup = document.getElementById('emailOtpGroup');
        const emailOtpCode = document.getElementById('emailOtpCode');
        const sendEmailButton = document.getElementById('sendEmailOtpButton');
        const verifyEmailButton = document.getElementById('verifyEmailOtpButton');
        let pendingEmail = null;
        let emailTimer;

        sendEmailButton.addEventListener('click', async () => {
            if (!hasConsent()) return;
            if (!validWebOrigin()) {
                showStatus('请通过 HTTPS 网站或 localhost 打开登录页，不要直接用 file:// 打开。', 'error');
                return;
            }
            if (!otpEmail.reportValidity()) return;
            const email = otpEmail.value.trim();

            setBusy(sendEmailButton, true, '正在发送…');
            let cooldown = false;
            try {
                const { error } = await client.auth.signInWithOtp({
                    email,
                    options: { shouldCreateUser: true }
                });
                if (error) throw error;
                pendingEmail = email;
                emailOtpGroup.hidden = false;
                emailOtpCode.required = true;
                verifyEmailButton.hidden = false;
                showStatus('验证码已发送，请查收邮件（含垃圾箱）。验证码有有效期，请勿告知他人。', 'success');
                emailOtpCode.focus();

                cooldown = true;
                let seconds = 60;
                const label = sendEmailButton.querySelector('span');
                sendEmailButton.disabled = true;
                label.textContent = `重新发送（${seconds}s）`;
                window.clearInterval(emailTimer);
                emailTimer = window.setInterval(() => {
                    seconds -= 1;
                    if (seconds <= 0) {
                        window.clearInterval(emailTimer);
                        sendEmailButton.disabled = false;
                        label.textContent = '重新发送验证码';
                    } else {
                        label.textContent = `重新发送（${seconds}s）`;
                    }
                }, 1000);
            } catch (error) {
                showStatus(getErrorMessage(error), 'error');
            } finally {
                if (!cooldown) setBusy(sendEmailButton, false, '发送验证码');
                else sendEmailButton.classList.remove('loading');
            }
        });

        otpEmail.addEventListener('input', () => {
            pendingEmail = null;
            emailOtpGroup.hidden = true;
            emailOtpCode.required = false;
            emailOtpCode.value = '';
            verifyEmailButton.hidden = true;
            window.clearInterval(emailTimer);
            setBusy(sendEmailButton, false, '发送验证码');
        });

        emailOtpForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!hasConsent()) return;
            const email = otpEmail.value.trim();
            const token = emailOtpCode.value.trim();
            if (!pendingEmail || email !== pendingEmail || !/^\d{6,8}$/.test(token)) {
                showStatus('请先发送验证码，并检查邮箱与验证码。', 'error');
                return;
            }
            setBusy(verifyEmailButton, true);
            try {
                const { error } = await client.auth.verifyOtp({ email, token, type: 'email' });
                if (error) throw error;
                showStatus('验证成功，正在进入工作台…', 'success');
                window.setTimeout(goToDashboard, 300);
            } catch (error) {
                showStatus(getErrorMessage(error), 'error');
            } finally {
                setBusy(verifyEmailButton, false);
            }
        });

        const phoneInput = document.getElementById('loginPhone');
        const otpInput = document.getElementById('loginOtp');
        const otpGroup = document.getElementById('otpGroup');
        const sendButton = document.getElementById('sendOtpButton');
        const verifyButton = document.getElementById('verifyOtpButton');
        let resendTimer;
        let resendSeconds = 0;
        let pendingPhone = null;

        function startResendCountdown() {
            window.clearInterval(resendTimer);
            resendSeconds = 60;
            sendButton.disabled = true;
            const label = sendButton.querySelector('span');
            if (label) label.textContent = `重新发送（${resendSeconds}s）`;
            resendTimer = window.setInterval(() => {
                resendSeconds -= 1;
                if (resendSeconds <= 0) {
                    window.clearInterval(resendTimer);
                    sendButton.disabled = false;
                    if (label) label.textContent = '重新发送验证码';
                    return;
                }
                if (label) label.textContent = `重新发送（${resendSeconds}s）`;
            }, 1000);
        }

        sendButton.addEventListener('click', async () => {
            if (!hasConsent()) return;
            if (!validWebOrigin()) {
                showStatus('请通过 HTTPS 网站或 localhost 打开登录页，不要直接用 file:// 打开。', 'error');
                return;
            }
            const phone = normalizeMainlandPhone(phoneInput.value);
            if (!phone) {
                showStatus('请输入有效的中国大陆手机号，例如 +86 138 0000 0000。', 'error');
                phoneInput.focus();
                return;
            }

            setBusy(sendButton, true, '正在发送…');
            try {
                const { error } = await client.auth.signInWithOtp({
                    phone,
                    options: { shouldCreateUser: true }
                });
                if (error) throw error;
                if (normalizeMainlandPhone(phoneInput.value) !== phone) {
                    showStatus('验证码已发送到请求时填写的号码。请恢复该手机号后再输入验证码。', 'error');
                    return;
                }
                pendingPhone = phone;
                otpGroup.hidden = false;
                otpInput.required = true;
                verifyButton.hidden = false;
                showStatus('验证码已提交发送请求。若暂未收到，请检查短信服务配置和手机号。', 'success');
                startResendCountdown();
                otpInput.focus();
            } catch (error) {
                showStatus(getErrorMessage(error), 'error');
            } finally {
                if (resendSeconds === 0) setBusy(sendButton, false, '发送验证码');
            }
        });

        phoneInput.addEventListener('input', () => {
            otpGroup.hidden = true;
            otpInput.required = false;
            otpInput.value = '';
            pendingPhone = null;
            verifyButton.hidden = true;
            window.clearInterval(resendTimer);
            resendSeconds = 0;
            sendButton.disabled = false;
            const label = sendButton.querySelector('span');
            if (label) label.textContent = '发送验证码';
        });

        document.getElementById('phoneLoginForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!hasConsent()) return;
            const phone = normalizeMainlandPhone(phoneInput.value);
            const token = otpInput.value.trim();
            if (!phone || phone !== pendingPhone || !/^\d{6}$/.test(token)) {
                showStatus('请检查手机号和 6 位短信验证码。', 'error');
                return;
            }

            setBusy(verifyButton, true);
            try {
                const { error } = await client.auth.verifyOtp({ phone, token, type: 'sms' });
                if (error) throw error;
                showStatus('验证成功，正在进入工作台…', 'success');
                window.setTimeout(goToDashboard, 300);
            } catch (error) {
                showStatus(getErrorMessage(error), 'error');
            } finally {
                setBusy(verifyButton, false);
            }
        });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!validWebOrigin()) {
                showStatus('请通过 HTTPS 网站或 localhost 打开注册页。', 'error');
                return;
            }

            const password = document.getElementById('signupPassword').value;
            const confirmPassword = signupForm.querySelector('[name="confirmPassword"]').value;
            if (password !== confirmPassword) {
                showStatus('两次输入的密码不一致。', 'error');
                return;
            }

            const consent = signupForm.querySelector('input[type="checkbox"]');
            if (!consent || !consent.checked) {
                showStatus('请先阅读并同意服务条款与隐私政策。', 'error');
                consent?.focus();
                return;
            }

            const button = signupForm.querySelector('[type="submit"]');
            setBusy(button, true);
            try {
                const { data, error } = await client.auth.signUp({
                    email: document.getElementById('signupEmail').value.trim(),
                    password,
                    options: {
                        data: { name: document.getElementById('signupName').value.trim() },
                        emailRedirectTo: new URL('login.html', window.location.href).href
                    }
                });
                if (error) throw error;
                if (data.session) {
                    showStatus('账户已创建，正在进入工作台…', 'success');
                    window.setTimeout(goToDashboard, 300);
                } else {
                    showStatus('注册请求已提交。请查收验证邮件，完成邮箱验证后再登录。', 'success');
                }
            } catch (error) {
                showStatus(getErrorMessage(error), 'error');
            } finally {
                setBusy(button, false);
            }
        });
    }

    const resetForm = document.getElementById('resetPasswordForm');
    if (resetForm) {
        const updateForm = document.getElementById('updatePasswordForm');

        client.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                resetForm.hidden = true;
                updateForm.hidden = false;
                showStatus('验证成功，请设置新密码。', 'success');
            }
        });

        if (new URLSearchParams(window.location.search).has('recovery')) {
            client.auth.getSession().then(({ data, error }) => {
                if (error) {
                    showStatus(getErrorMessage(error), 'error');
                    return;
                }
                if (data.session) {
                    resetForm.hidden = true;
                    updateForm.hidden = false;
                    showStatus('验证成功，请设置新密码。', 'success');
                }
            }).catch((error) => {
                showStatus(getErrorMessage(error), 'error');
            });
        }

        resetForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!validWebOrigin()) {
                showStatus('请通过 HTTPS 网站或 localhost 打开重置密码页。', 'error');
                return;
            }

            const button = resetForm.querySelector('[type="submit"]');
            setBusy(button, true);
            try {
                const { error } = await client.auth.resetPasswordForEmail(
                    document.getElementById('resetEmail').value.trim(),
                    { redirectTo: `${window.location.origin}${window.location.pathname}?recovery=1` }
                );
                if (error) throw error;
                showStatus('如果该邮箱已注册，系统会发送密码重置邮件，请检查收件箱及垃圾邮件。', 'success');
            } catch (error) {
                showStatus(getErrorMessage(error), 'error');
            } finally {
                setBusy(button, false);
            }
        });

        updateForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!validWebOrigin()) {
                showStatus('请通过 HTTPS 网站或 localhost 打开重置密码页。', 'error');
                return;
            }
            const password = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (password !== confirmPassword) {
                showStatus('两次输入的密码不一致。', 'error');
                return;
            }

            const button = updateForm.querySelector('[type="submit"]');
            setBusy(button, true);
            try {
                const { error } = await client.auth.updateUser({ password });
                if (error) throw error;
                showStatus('密码已更新，正在进入工作台…', 'success');
                window.setTimeout(goToDashboard, 500);
            } catch (error) {
                showStatus(getErrorMessage(error), 'error');
            } finally {
                setBusy(button, false);
            }
        });
    }

    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            setBusy(logoutButton, true, '正在退出…');
            try {
                const { error } = await client.auth.signOut();
                if (error) throw error;
                window.location.replace('login.html');
            } catch (error) {
                showStatus(getErrorMessage(error), 'error');
                setBusy(logoutButton, false, '退出登录');
            }
        });
    }

    if (authRequired) {
        client.auth.getSession().then(({ data, error }) => {
            if (error || !data.session) {
                window.location.replace('login.html');
                return;
            }
            const userName = document.getElementById('userName');
            if (userName) {
                userName.textContent = data.session.user.user_metadata.name ||
                    data.session.user.phone ||
                    data.session.user.email ||
                    'ATLAS 用户';
            }
        }).catch((error) => {
            showStatus(getErrorMessage(error), 'error');
            window.location.replace('login.html');
        });
    } else if (loginForm || signupForm) {
        client.auth.getSession().then(({ data, error }) => {
            if (error) {
                showStatus(getErrorMessage(error), 'error');
                return;
            }
            if (data.session) goToDashboard();
        }).catch((error) => {
            showStatus(getErrorMessage(error), 'error');
        });
    }
})();
