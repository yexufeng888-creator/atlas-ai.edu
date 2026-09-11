#!/usr/bin/env python3
"""
修复 home.html - 将所有 data-i18n 替换为直接中文
"""

import re

# 需要替换的翻译键和对应的中文
translations = {
    'home.welcome': '下午好',
    'home.today.intro': '今天你有',
    'home.tasks': '个待办事项',
    'common.and': '和',
    'home.meetings': '个会议',
    'home.priorities': '今日重点',
    'home.priorities.subtitle': '优先处理这些任务',
    'home.schedule': '今日日程',
    'home.schedule.subtitle': '接下来的安排',
    'home.suggestions': 'AI 智能建议',
    'home.suggestions.subtitle': '基于你的工作模式',
    'home.activity': '最近活动',
    'home.activity.subtitle': '你的最新动态',
    'home.actions': '快速操作',
    'home.actions.subtitle': '常用功能',
    'home.stats': '效率统计',
    'home.stats.subtitle': '本周进展',
    'home.completed': '已完成',
    'home.inprogress': '进行中',
    'common.logout': '登出',
}

# 读取文件
with open('home.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 替换所有 data-i18n
for key, value in translations.items():
    # 匹配 data-i18n="key">原文本</
    pattern = f'data-i18n="{key}"[^>]*>([^<]*)<'

    def replace_fn(match):
        # 保留原有的其他属性，只移除 data-i18n 并替换文本
        full_match = match.group(0)
        # 移除 data-i18n 属性
        no_i18n = re.sub(f'data-i18n="{key}"\\s*', '', full_match)
        # 替换文本内容
        result = re.sub(r'>([^<]*)<', f'>{value}<', no_i18n)
        return result

    content = re.sub(pattern, replace_fn, content)

# 移除 i18n.js
content = re.sub(r'<script src="assets/js/i18n\.js"></script>\s*', '', content)

# 移除语言切换相关的样式代码
content = re.sub(r'// 语言切换按钮样式.*?</script>', '</script>', content, flags=re.DOTALL)

# 保存文件
with open('home.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ home.html 已修复 - 所有翻译键已替换为中文")
