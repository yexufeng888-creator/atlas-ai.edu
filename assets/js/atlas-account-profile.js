(function () {
    'use strict';

    const client = window.atlasSupabase;
    const form = document.querySelector('[data-account-editor]');
    const status = document.querySelector('[data-account-editor-status]');
    const saveButton = document.querySelector('[data-account-editor-save]');
    const nameField = form?.elements.namedItem('display_name');
    const avatarUrlField = form?.elements.namedItem('avatar_url');
    const avatarFileField = form?.elements.namedItem('avatar_file');
    const previewImage = document.querySelector('[data-account-preview-image]');
    const previewFallback = document.querySelector('[data-account-preview-fallback]');
    const previewName = document.querySelector('[data-account-preview-name]');
    let user = null;
    let previewObjectUrl = '';

    function setStatus(message, state) {
        status.textContent = message;
        if (state) status.dataset.state = state;
        else delete status.dataset.state;
    }

    function safeAvatarUrl(value) {
        if (!value) return '';
        try {
            const url = new URL(value, window.location.origin);
            if (url.protocol === 'https:') return url.href;
            if (url.protocol === 'http:' &&
                ['localhost', '127.0.0.1'].includes(url.hostname)) return url.href;
        } catch {
            return '';
        }
        return '';
    }

    function renderPreview(avatarUrl) {
        const name = nameField.value.trim() || 'ATLAS 用户';
        previewName.textContent = name;
        previewFallback.textContent = Array.from(name)[0]?.toUpperCase() || 'A';
        previewFallback.hidden = Boolean(avatarUrl);
        previewImage.hidden = !avatarUrl;
        if (avatarUrl) previewImage.src = avatarUrl;
        else previewImage.removeAttribute('src');
    }

    function imageExtension(type) {
        return {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp'
        }[type] || '';
    }

    function uploadId() {
        if (window.crypto?.randomUUID) return window.crypto.randomUUID();
        const bytes = new Uint32Array(4);
        window.crypto.getRandomValues(bytes);
        return Array.from(bytes, (byte) => byte.toString(16)).join('');
    }

    async function uploadAvatar(file) {
        const extension = imageExtension(file.type);
        if (!extension || file.size > 5 * 1024 * 1024) {
            throw new Error('请选择 JPG、PNG 或 WebP 图片，且不超过 5 MB。');
        }
        if (!client.storage?.from) {
            throw new Error('Supabase 头像存储服务不可用。');
        }

        const path = `${user.id}/${uploadId()}.${extension}`;
        const bucket = client.storage.from('atlas-avatars');
        const { error: uploadError } = await bucket.upload(path, file, {
            cacheControl: '3600',
            contentType: file.type,
            upsert: false
        });
        if (uploadError) {
            if (/bucket not found|nosuchbucket/i.test(uploadError.message || '')) {
                throw new Error('头像上传尚未启用。请管理员先应用 Supabase 头像存储迁移。');
            }
            throw uploadError;
        }
        return { bucket, path, url: bucket.getPublicUrl(path).data.publicUrl };
    }

    async function loadProfile() {
        if (!client?.auth || !form) {
            setStatus('登录服务不可用，请刷新页面后重试。', 'error');
            return;
        }

        try {
            const { data, error } = await client.auth.getUser();
            if (error) throw error;
            user = data.user;
            if (!user) {
                setStatus('登录状态已失效，请重新登录。', 'error');
                return;
            }

            nameField.value = user.user_metadata?.name ||
                user.user_metadata?.display_name ||
                user.user_metadata?.full_name ||
                user.email?.split('@')[0] ||
                '';
            avatarUrlField.value = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
            renderPreview(safeAvatarUrl(avatarUrlField.value));
        } catch (error) {
            console.error('Unable to load the ATLAS account profile:', error);
            setStatus(`无法读取账户资料：${error.message || '请稍后重试。'}`, 'error');
        }
    }

    nameField?.addEventListener('input', () => {
        renderPreview(previewObjectUrl || safeAvatarUrl(avatarUrlField.value.trim()));
    });
    avatarUrlField?.addEventListener('input', () => {
        renderPreview(previewObjectUrl || safeAvatarUrl(avatarUrlField.value.trim()));
    });
    avatarFileField?.addEventListener('change', () => {
        const file = avatarFileField.files?.[0];
        if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
        previewObjectUrl = '';
        if (!file) {
            renderPreview(safeAvatarUrl(avatarUrlField.value.trim()));
            return;
        }
        if (!imageExtension(file.type) || file.size > 5 * 1024 * 1024) {
            avatarFileField.value = '';
            setStatus('请选择 JPG、PNG 或 WebP 图片，且不超过 5 MB。', 'error');
            renderPreview(safeAvatarUrl(avatarUrlField.value.trim()));
            return;
        }
        previewObjectUrl = URL.createObjectURL(file);
        renderPreview(previewObjectUrl);
    });
    previewImage?.addEventListener('error', () => {
        previewImage.hidden = true;
        previewFallback.hidden = false;
    });

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!user || !client?.auth) {
            setStatus('登录状态已失效，请重新登录。', 'error');
            return;
        }

        const name = nameField.value.trim();
        if (!name) {
            setStatus('请填写昵称。', 'error');
            nameField.focus();
            return;
        }

        const selectedFile = avatarFileField.files?.[0];
        let avatarUrl = avatarUrlField.value.trim();
        if (!selectedFile && avatarUrl) {
            avatarUrl = safeAvatarUrl(avatarUrl);
            if (!avatarUrl) {
                setStatus('头像地址必须是有效的 HTTPS 图片地址。', 'error');
                avatarUrlField.focus();
                return;
            }
        }

        saveButton.disabled = true;
        setStatus(selectedFile ? '正在上传头像并保存资料…' : '正在保存资料…');
        let uploaded = null;
        let avatarUploadFailure = '';
        try {
            if (selectedFile) {
                try {
                    uploaded = await uploadAvatar(selectedFile);
                    avatarUrl = uploaded.url;
                } catch (error) {
                    avatarUploadFailure = error.message || '头像上传失败。';
                    console.warn('Avatar upload failed; saving the nickname and keeping the previous avatar:', error);
                    avatarUrl = safeAvatarUrl(avatarUrl) ||
                        safeAvatarUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture);
                }
            }

            const metadata = {
                ...(user.user_metadata || {}),
                name,
                display_name: name,
                avatar_url: avatarUrl
            };
            const { data, error } = await client.auth.updateUser({ data: metadata });
            if (error) throw error;
            user = data.user || { ...user, user_metadata: metadata };
            avatarUrlField.value = avatarUrl;
            avatarFileField.value = '';
            if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
            previewObjectUrl = '';
            renderPreview(safeAvatarUrl(avatarUrl));
            window.dispatchEvent(new CustomEvent('atlas:account-updated', { detail: { user } }));
            setStatus(
                avatarUploadFailure
                    ? `昵称已保存；头像未上传：${avatarUploadFailure}`
                    : '昵称和头像已保存，并会显示在导航栏。',
                avatarUploadFailure ? 'error' : 'success'
            );
        } catch (error) {
            console.error('Unable to update the ATLAS account profile:', error);
            if (uploaded) {
                try {
                    const { error: cleanupError } = await uploaded.bucket.remove([uploaded.path]);
                    if (cleanupError) {
                        console.error('Unable to clean up the unused uploaded avatar:', cleanupError);
                    }
                } catch (cleanupError) {
                    console.error('Unable to clean up the unused uploaded avatar:', cleanupError);
                }
            }
            setStatus(error.message || '保存失败，请稍后重试。', 'error');
        } finally {
            saveButton.disabled = false;
        }
    });

    loadProfile();
})();
