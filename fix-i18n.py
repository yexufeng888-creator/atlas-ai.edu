#!/usr/bin/env python3
"""
快速修复首页中文翻译
"""

import re

# 读取 i18n.js
with open('assets/js/i18n.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 要添加的新翻译（在中文部分）
new_translations = """
            // Stats
            'stats.users': '活跃用户',
            'stats.tasks': '已完成任务',
            'stats.uptime': '在线时间',
            'stats.rating': '用户评分',

            // Showcase
            'showcase.title': '由创新者打造，<br>为创新者服务',
            'showcase.description': 'Campus Intelligence 是一支由设计师、工程师和 AI 研究人员组成的团队，致力于创造赋能你成就更多的工具。',
            'showcase.cta': '认识团队',

            // CTA
            'cta.title': '准备好改变你的生活了吗？',
            'cta.subtitle': '加入数千名使用 ATLAS 保持井井有条和高效的用户。',
            'cta.start': '开始免费试用',
            'cta.pricing': '查看定价',

            // Footer
            'footer.product': '产品',
            'footer.features': '功能',
            'footer.pricing': '定价',
            'footer.dashboard': '工作台',
            'footer.company': '公司',
            'footer.about': '关于',
            'footer.blog': '博客',
            'footer.legal': '法律',
            'footer.privacy': '隐私',
            'footer.terms': '条款',
            'footer.copyright': '© 2024 Campus Intelligence. 保留所有权利。',
"""

# 在中文部分的 Team 之前插入
pattern = r"(// Team\n\s+'team\.badge)"
replacement = new_translations + r"\n            \1"

if re.search(pattern, content):
    content = re.sub(pattern, replacement, content, count=1)
    print("✅ 已添加缺失的中文翻译")
else:
    # 如果找不到 Team，则在文件末尾添加
    print("⚠️ 未找到插入位置，请手动添加")
    print("\n需要添加的翻译：")
    print(new_translations)

# 保存文件
with open('assets/js/i18n.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n🚀 刷新浏览器查看修复效果")
