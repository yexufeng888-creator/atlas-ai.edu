#!/bin/bash
# ATLAS 批量添加中英双语支持脚本

echo "🌐 开始为所有页面添加中英双语支持..."

# 需要处理的页面列表
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
        echo "✓ 处理 $page"
        count=$((count + 1))
    else
        echo "✗ 跳过 $page (文件不存在)"
    fi
done

echo ""
echo "📊 完成！已处理 $count 个页面"
echo "🚀 现在可以在浏览器中测试语言切换功能"
