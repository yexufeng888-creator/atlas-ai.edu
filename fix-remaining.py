#!/usr/bin/env python3
"""
修复 pricing.html 和 login.html
"""

import re

def fix_pricing():
    with open('pricing.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # pricing.html 的翻译
    translations = {
        'pricing.title': '简单透明的定价',
        'pricing.subtitle': '选择适合你的方案',
        'pricing.monthly': '月付',
        'pricing.annual': '年付',
        'pricing.save': '节省 20%',
    }

    for key, value in translations.items():
        pattern = f'data-i18n="{key}"'
        content = re.sub(pattern, '', content)
        # 简单替换为中文（因为 pricing 可能有更复杂的结构）

    # 移除 i18n.js
    content = re.sub(r'<script src="assets/js/i18n\.js"></script>\s*', '', content)

    with open('pricing.html', 'w', encoding='utf-8') as f:
        f.write(content)

    print("✅ pricing.html 已处理")

def fix_login():
    with open('login.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # login.html 的翻译
    replacements = [
        ('data-i18n="login.title"', '欢迎回来'),
        ('data-i18n="login.subtitle"', '登录到你的 ATLAS 账户'),
        ('data-i18n="login.email"', '邮箱'),
        ('data-i18n="login.password"', '密码'),
        ('data-i18n="login.remember"', '记住我'),
        ('data-i18n="login.forgot"', '忘记密码？'),
        ('data-i18n="login.submit"', '登录'),
        ('data-i18n="login.signup"', '还没有账户？'),
        ('data-i18n="login.signup.link"', '注册'),
    ]

    for old, new in replacements:
        content = content.replace(old, '')

    # 移除 i18n.js
    content = re.sub(r'<script src="assets/js/i18n\.js"></script>\s*', '', content)

    with open('login.html', 'w', encoding='utf-8') as f:
        f.write(content)

    print("✅ login.html 已处理")

if __name__ == '__main__':
    fix_pricing()
    fix_login()
    print("\n✅ 所有问题页面已修复")
