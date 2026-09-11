#!/bin/bash

# ATLAS 批量添加语言切换功能脚本

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║        ATLAS 批量添加语言切换功能                                 ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

cd /Users/xufengye/Desktop/atlas-html

# 需要添加语言切换的页面列表
pages=(
    "home.html"
    "ask.html"
    "memory.html"
    "memory-personal.html"
    "memory-preferences.html"
    "memory-work.html"
    "memory-relationships.html"
    "life.html"
    "life-timeline.html"
    "life-calendar.html"
    "life-tasks.html"
    "life-trips.html"
    "life-projects.html"
    "life-documents.html"
    "agents.html"
    "agents-travel.html"
    "agents-runs.html"
    "agents-capabilities.html"
    "agents-actions.html"
    "settings.html"
    "settings-profile.html"
    "settings-privacy.html"
    "settings-appearance.html"
    "settings-execution.html"
    "settings-demo.html"
)

count=0
for page in "${pages[@]}"; do
    if [ -f "$page" ]; then
        echo "✅ 处理 $page"

        # 检查是否已经有 i18n.js
        if ! grep -q "assets/js/i18n.js" "$page"; then
            # 在 </body> 前添加 i18n.js
            sed -i '' 's|</body>|    <script src="assets/js/i18n.js"></script>\n    <script>\n        const style = document.createElement("style");\n        style.textContent = `.lang-switch.active { background: linear-gradient(135deg, #2563eb, #06b6d4) !important; color: white !important; border-color: transparent !important; }`;\n        document.head.appendChild(style);\n    </script>\n</body>|' "$page"
            echo "   ↳ 已添加 i18n.js"
            ((count++))
        else
            echo "   ↳ 已存在 i18n.js，跳过"
        fi
    else
        echo "⚠️  文件不存在: $page"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ 完成！共处理 $count 个文件"
echo ""
echo "💡 提示："
echo "   • 每个页面需要手动添加语言切换按钮（EN / 中文）"
echo "   • 需要为页面元素添加 data-i18n 属性"
echo "   • 在 i18n.js 中添加对应的翻译"
echo ""
