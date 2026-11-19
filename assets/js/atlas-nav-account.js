(function (window, document) {
    'use strict';

    const nav = document.querySelector('.global-nav');
    const slot = nav?.querySelector('[data-atlas-nav-account-slot]');
    if (!nav || !slot) return;

    const copyByLocale = {
        'zh-cn': {
            account: '账户',
            profile: '编辑头像与昵称',
            changeAvatar: '更换头像',
            signOut: '退出登录',
            signingOut: '正在退出…',
            upload: '正在上传头像…',
            saved: '头像已更新',
            uploadFailed: '头像上传失败',
            bucketMissing: '头像存储尚未启用。请管理员先应用 Supabase 头像存储迁移。',
            invalidImage: '请选择 JPG、PNG 或 WebP 图片，且不超过 5 MB。',
            serviceError: '登录服务暂不可用，请刷新页面后重试。',
            signOutFailed: '退出登录失败，请稍后重试。'
        },
        'zh-hk': {
            account: '帳戶',
            profile: '編輯頭像與暱稱',
            changeAvatar: '更換頭像',
            signOut: '登出',
            signingOut: '正在登出…',
            upload: '正在上載頭像…',
            saved: '頭像已更新',
            uploadFailed: '頭像上載失敗',
            bucketMissing: '頭像儲存尚未啟用。請管理員先套用 Supabase 頭像儲存遷移。',
            invalidImage: '請選擇 JPG、PNG 或 WebP 圖片，且不超過 5 MB。',
            serviceError: '登入服務暫時無法使用，請重新整理頁面。',
            signOutFailed: '登出失敗，請稍後重試。'
        },
        'zh-tw': {
            account: '帳戶',
            profile: '編輯頭像與暱稱',
            changeAvatar: '更換頭像',
            signOut: '登出',
            signingOut: '正在登出…',
            upload: '正在上傳頭像…',
            saved: '頭像已更新',
            uploadFailed: '頭像上傳失敗',
            bucketMissing: '頭像儲存尚未啟用。請管理員先套用 Supabase 頭像儲存遷移。',
            invalidImage: '請選擇 JPG、PNG 或 WebP 圖片，且不超過 5 MB。',
            serviceError: '登入服務暫時無法使用，請重新整理頁面。',
            signOutFailed: '登出失敗，請稍後重試。'
        },
        en: {
            account: 'Account',
            profile: 'Edit avatar and name',
            changeAvatar: 'Change avatar',
            signOut: 'Sign out',
            signingOut: 'Signing out…',
            upload: 'Uploading avatar…',
            saved: 'Avatar updated',
            uploadFailed: 'Avatar upload failed',
            bucketMissing: 'Avatar storage is not enabled. Ask the site administrator to apply the Supabase avatar-storage migration.',
            invalidImage: 'Choose a JPG, PNG, or WebP image no larger than 5 MB.',
            serviceError: 'Sign-in is unavailable. Refresh the page and try again.',
            signOutFailed: 'Could not sign out. Try again.'
        },
        ja: {
            account: 'アカウント',
            profile: 'アバターと名前を編集',
            changeAvatar: 'アバターを変更',
            signOut: 'ログアウト',
            signingOut: 'ログアウト中…',
            upload: 'アバターをアップロード中…',
            saved: 'アバターを更新しました',
            uploadFailed: 'アバターをアップロードできませんでした',
            bucketMissing: 'アバター保存が有効ではありません。管理者に Supabase の移行適用を依頼してください。',
            invalidImage: '5 MB 以下の JPG、PNG、WebP 画像を選択してください。',
            serviceError: 'ログインサービスを利用できません。ページを再読み込みしてください。',
            signOutFailed: 'ログアウトできませんでした。もう一度お試しください。'
        },
        ko: {
            account: '계정',
            profile: '프로필 사진 및 이름 편집',
            changeAvatar: '프로필 사진 변경',
            signOut: '로그아웃',
            signingOut: '로그아웃 중…',
            upload: '프로필 사진 업로드 중…',
            saved: '프로필 사진을 업데이트했습니다',
            uploadFailed: '프로필 사진 업로드 실패',
            bucketMissing: '프로필 사진 저장소가 활성화되지 않았습니다. 관리자에게 Supabase 마이그레이션 적용을 요청하세요.',
            invalidImage: '5MB 이하의 JPG, PNG 또는 WebP 이미지를 선택하세요.',
            serviceError: '로그인 서비스를 사용할 수 없습니다. 페이지를 새로고침하세요.',
            signOutFailed: '로그아웃하지 못했습니다. 다시 시도하세요.'
        }
    };
    const locale = document.documentElement.lang.toLowerCase();
    const copy = copyByLocale[locale] || copyByLocale['zh-cn'];
    const loginLink = nav.querySelector('.atlas-login-link');
    let client = window.atlasSupabase || null;
    let currentUser = null;
    let accountControl = null;
    let authStorageKey = '';
    let initialization = null;

    function loadScript(src, isReady) {
        if (isReady()) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => isReady()
                ? resolve()
                : reject(new Error(`Loaded ${src}, but its global was not initialized.`));
            script.onerror = () => reject(new Error(`Unable to load ${src}.`));
            document.head.appendChild(script);
        });
    }

    function waitForDocumentReady() {
        if (document.readyState !== 'loading') return Promise.resolve();
        return new Promise((resolve) => {
            document.addEventListener('DOMContentLoaded', resolve, { once: true });
        });
    }

    async function getClient() {
        if (window.atlasSupabase?.auth) return window.atlasSupabase;

        await loadScript(
            'assets/js/supabase-config.js',
            () => Boolean(window.ATLAS_SUPABASE_CONFIG?.url && window.ATLAS_SUPABASE_CONFIG?.publishableKey)
        );
        const projectRef = new URL(window.ATLAS_SUPABASE_CONFIG.url).hostname.split('.')[0];
        authStorageKey = `sb-${projectRef}-auth-token`;
        try {
            if (!window.localStorage.getItem(authStorageKey)) return null;
        } catch (error) {
            console.warn('Cannot check the saved ATLAS session:', error);
            return null;
        }
        await loadScript(
            'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',
            () => Boolean(window.supabase?.createClient)
        );

        if (!window.ATLAS_SUPABASE_CONFIG?.url ||
            !window.ATLAS_SUPABASE_CONFIG?.publishableKey ||
            typeof window.supabase?.createClient !== 'function') {
            throw new Error('Supabase public configuration is incomplete.');
        }

        client = window.supabase.createClient(
            window.ATLAS_SUPABASE_CONFIG.url,
            window.ATLAS_SUPABASE_CONFIG.publishableKey,
            {
                auth: {
                    autoRefreshToken: true,
                    detectSessionInUrl: true,
                    persistSession: true
                }
            }
        );
        window.atlasSupabase = client;
        return client;
    }

    function safeAvatarUrl(value) {
        if (typeof value !== 'string' || !value) return '';
        try {
            const url = new URL(value, window.location.origin);
            return url.protocol === 'https:' ||
                (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))
                ? url.href
                : '';
        } catch {
            return '';
        }
    }

    function displayName(user) {
        return user.user_metadata?.name ||
            user.user_metadata?.display_name ||
            user.user_metadata?.full_name ||
            user.email?.split('@')[0] ||
            user.phone ||
            copy.account;
    }

    function setMenuOpen(open) {
        const trigger = accountControl?.querySelector('[data-account-trigger]');
        const menu = accountControl?.querySelector('[data-account-menu]');
        if (!trigger || !menu) return;
        menu.hidden = !open;
        trigger.setAttribute('aria-expanded', String(open));
    }

    function setStatus(message, state) {
        const status = accountControl?.querySelector('[data-account-status]');
        if (!status) return;
        status.textContent = message;
        if (state) status.dataset.state = state;
        else delete status.dataset.state;
    }

    function setAvatar(url, name) {
        const image = accountControl?.querySelector('[data-account-image]');
        const fallback = accountControl?.querySelector('[data-account-fallback]');
        if (!image || !fallback) return;
        const safeUrl = safeAvatarUrl(url);
        fallback.textContent = Array.from(name)[0]?.toUpperCase() || 'A';
        image.hidden = true;
        fallback.hidden = false;
        if (safeUrl) image.src = safeUrl;
        else image.removeAttribute('src');
    }

    function buildAccountControl(user) {
        const name = displayName(user);
        const control = document.createElement('div');
        control.className = 'atlas-account-control';

        const trigger = document.createElement('button');
        trigger.className = 'atlas-account-trigger';
        trigger.type = 'button';
        trigger.setAttribute('data-account-trigger', '');
        trigger.setAttribute('aria-haspopup', 'menu');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-label', name);

        const avatar = document.createElement('span');
        avatar.className = 'atlas-account-avatar';
        avatar.setAttribute('aria-hidden', 'true');
        const image = document.createElement('img');
        image.alt = '';
        image.hidden = true;
        image.dataset.accountImage = '';
        const fallback = document.createElement('span');
        fallback.dataset.accountFallback = '';
        avatar.append(image, fallback);

        const nameNode = document.createElement('span');
        nameNode.className = 'atlas-account-name';
        nameNode.textContent = name;

        const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        chevron.setAttribute('viewBox', '0 0 12 12');
        chevron.setAttribute('aria-hidden', 'true');
        chevron.classList.add('atlas-account-chevron');
        const chevronPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        chevronPath.setAttribute('d', 'm2 4 4 4 4-4');
        chevron.appendChild(chevronPath);
        trigger.append(avatar, nameNode, chevron);

        const menu = document.createElement('div');
        menu.className = 'atlas-account-menu';
        menu.dataset.accountMenu = '';
        menu.setAttribute('role', 'menu');
        menu.hidden = true;

        const identity = document.createElement('div');
        identity.className = 'atlas-account-identity';
        const identityName = document.createElement('strong');
        identityName.textContent = name;
        const identityEmail = document.createElement('span');
        identityEmail.textContent = user.email || user.phone || '';
        identity.append(identityName, identityEmail);

        const avatarButton = document.createElement('button');
        avatarButton.type = 'button';
        avatarButton.dataset.changeAvatar = '';
        avatarButton.textContent = copy.changeAvatar;

        const editorLink = document.createElement('a');
        editorLink.href = 'profile.html';
        editorLink.textContent = copy.profile;

        const signOutButton = document.createElement('button');
        signOutButton.type = 'button';
        signOutButton.dataset.signOut = '';
        signOutButton.textContent = copy.signOut;

        const fileInput = document.createElement('input');
        fileInput.className = 'atlas-account-file-input';
        fileInput.type = 'file';
        fileInput.accept = 'image/jpeg,image/png,image/webp';
        fileInput.tabIndex = -1;
        fileInput.setAttribute('aria-label', copy.changeAvatar);

        const status = document.createElement('p');
        status.className = 'atlas-account-status';
        status.dataset.accountStatus = '';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');

        menu.append(identity, avatarButton, editorLink, signOutButton, status);
        control.append(trigger, menu, fileInput);

        trigger.addEventListener('click', (event) => {
            event.stopPropagation();
            setMenuOpen(menu.hidden);
        });
        avatarButton.addEventListener('click', () => fileInput.click());
        signOutButton.addEventListener('click', signOut);
        fileInput.addEventListener('change', handleAvatarSelection);
        editorLink.addEventListener('click', () => setMenuOpen(false));
        image.addEventListener('error', () => {
            image.hidden = true;
            fallback.hidden = false;
        }, { once: true });
        image.addEventListener('load', () => {
            image.hidden = false;
            fallback.hidden = true;
        }, { once: true });

        setAvatar(user.user_metadata?.avatar_url || user.user_metadata?.picture, name);
        return control;
    }

    function renderUser(user) {
        currentUser = user;
        if (!user) {
            accountControl?.remove();
            accountControl = null;
            if (loginLink) loginLink.hidden = false;
            return;
        }

        if (loginLink) loginLink.hidden = true;
        accountControl?.remove();
        accountControl = buildAccountControl(user);
        slot.replaceChildren(accountControl);
    }

    async function signOut(event) {
        const button = event.currentTarget;
        button.disabled = true;
        button.textContent = copy.signingOut;
        setStatus('');
        try {
            const { error } = await client.auth.signOut();
            if (error) throw error;
            renderUser(null);
            setMenuOpen(false);
            if (document.body.dataset.authRequired === 'true') {
                window.location.assign('login.html');
            }
        } catch (error) {
            console.error('Unable to sign out from the ATLAS navigation:', error);
            setStatus(`${copy.signOutFailed} ${error.message || ''}`.trim(), 'error');
        } finally {
            button.disabled = false;
            button.textContent = copy.signOut;
        }
    }

    function imageExtension(type) {
        return {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp'
        }[type] || '';
    }

    function createUploadId() {
        if (window.crypto?.randomUUID) return window.crypto.randomUUID();
        const values = new Uint32Array(4);
        window.crypto.getRandomValues(values);
        return Array.from(values, (value) => value.toString(16)).join('');
    }

    async function uploadAvatar(file) {
        const extension = imageExtension(file.type);
        if (!extension || file.size > 5 * 1024 * 1024) {
            throw new Error(copy.invalidImage);
        }
        if (!client.storage?.from) throw new Error(copy.serviceError);

        const path = `${currentUser.id}/${createUploadId()}.${extension}`;
        const bucket = client.storage.from('atlas-avatars');
        const { error: uploadError } = await bucket.upload(path, file, {
            cacheControl: '3600',
            contentType: file.type,
            upsert: false
        });
        if (uploadError) {
            if (/bucket not found|nosuchbucket/i.test(uploadError.message || '')) {
                throw new Error(copy.bucketMissing);
            }
            throw uploadError;
        }

        const avatarUrl = bucket.getPublicUrl(path).data.publicUrl;
        const { data, error: updateError } = await client.auth.updateUser({
            data: {
                ...(currentUser.user_metadata || {}),
                avatar_url: avatarUrl
            }
        });
        if (updateError) {
            try {
                const { error: cleanupError } = await bucket.remove([path]);
                if (cleanupError) {
                    console.error('Unable to clean up an unused uploaded avatar:', cleanupError);
                }
            } catch (cleanupError) {
                console.error('Unable to clean up an unused uploaded avatar:', cleanupError);
            }
            throw updateError;
        }
        renderUser(data.user || { ...currentUser, user_metadata: { ...currentUser.user_metadata, avatar_url: avatarUrl } });
    }

    async function handleAvatarSelection(event) {
        const input = event.currentTarget;
        const file = input.files?.[0];
        if (!file) return;
        const button = accountControl?.querySelector('[data-change-avatar]');
        if (button) button.disabled = true;
        setStatus(copy.upload);
        try {
            await uploadAvatar(file);
            setMenuOpen(true);
            setStatus(copy.saved, 'success');
        } catch (error) {
            console.error('Unable to update the ATLAS account avatar:', error);
            setStatus(error.message || copy.uploadFailed, 'error');
        } finally {
            input.value = '';
            const nextButton = accountControl?.querySelector('[data-change-avatar]');
            if (nextButton) nextButton.disabled = false;
        }
    }

    function init() {
        if (initialization) return initialization;
        initialization = (async () => {
            await waitForDocumentReady();
            try {
                client = await getClient();
                if (!client) {
                    renderUser(null);
                    return;
                }
                client.auth.onAuthStateChange((_event, session) => {
                    renderUser(session?.user || null);
                });
                const { data, error } = await client.auth.getSession();
                if (error) throw error;
                renderUser(data.session?.user || null);
            } catch (error) {
                console.error('Unable to initialize the ATLAS navigation account:', error);
                if (loginLink) loginLink.hidden = false;
            }
        })();
        return initialization;
    }

    window.addEventListener('atlas:account-updated', (event) => {
        if (event.detail?.user) renderUser(event.detail.user);
    });
    document.addEventListener('click', (event) => {
        if (accountControl && !accountControl.contains(event.target)) setMenuOpen(false);
    });
    document.addEventListener('keydown', (event) => {
        const menu = accountControl?.querySelector('[data-account-menu]');
        if (event.key === 'Escape' && menu && !menu.hidden) {
            setMenuOpen(false);
            accountControl.querySelector('[data-account-trigger]')?.focus();
        }
    });
    window.addEventListener('storage', (event) => {
        if (!authStorageKey || event.key !== authStorageKey) return;
        if (!event.newValue) {
            renderUser(null);
            return;
        }
        if (!client) {
            initialization = null;
            init();
        }
    });

    init();
})(window, document);
