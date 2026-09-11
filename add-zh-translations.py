#!/usr/bin/env python3
"""
为新首页添加完整的中文翻译
"""

# 需要添加到 i18n.js 的中文翻译
zh_translations = """
            // Hero Section (新首页)
            'hero.eyebrow': '个人智能操作系统',
            'hero.title': '你的生活，<br>智能化管理',
            'hero.subtitle': '将信息转化为智能，将决策转化为行动。ATLAS 是你的 AI 驱动的生活操作系统。',
            'hero.cta.start': '免费开始',
            'hero.cta.learn': '了解更多',

            // Features (新首页)
            'features.eyebrow': '功能特性',
            'features.title': '为你的成功而设计',
            'features.description': '你需要的一切，让你保持井井有条、高效和掌控全局。',

            'feature.memory.title': '智能记忆',
            'feature.memory.desc': '在你需要的时候，记住你需要的一切。你的个人知识图谱与你一起成长。',

            'feature.tasks.title': '智能任务管理',
            'feature.tasks.desc': 'AI 驱动的优先级排序，适应你的工作风格，帮助你专注于重要的事情。',

            'feature.agents.title': 'AI 智能体',
            'feature.agents.desc': '专业智能体自动处理从旅行规划到邮件管理的所有事务。',

            'feature.analytics.title': '生活分析',
            'feature.analytics.desc': '美观的仪表板可视化你的生产力、健康和习惯。',

            'feature.privacy.title': '隐私优先',
            'feature.privacy.desc': '你的数据属于你。端到端加密和透明的 AI 操作。',

            'feature.speed.title': '闪电般快速',
            'feature.speed.desc': '原生性能，即时搜索和跨设备实时同步。',

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

print("=" * 60)
print("新首页中文翻译")
print("=" * 60)
print("\n请将以下内容添加到 assets/js/i18n.js 的中文部分：\n")
print(zh_translations)
print("\n提示：在 i18n.js 中找到 'zh-CN': { 部分，添加这些翻译。")
print("=" * 60)
