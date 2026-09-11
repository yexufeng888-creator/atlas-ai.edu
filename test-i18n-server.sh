#!/bin/bash
# ATLAS 国际化快速测试脚本

echo "🌐 ATLAS 中英双语功能测试"
echo "================================"
echo ""

# 启动服务器
echo "📡 启动本地服务器..."
python3 -m http.server 8000 > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2

echo "✅ 服务器已启动 (PID: $SERVER_PID)"
echo ""
echo "🔗 访问链接："
echo "   主页: http://localhost:8000/index.html"
echo "   工作台: http://localhost:8000/home.html"
echo "   询问: http://localhost:8000/ask.html"
echo "   记忆: http://localhost:8000/memory.html"
echo "   生活: http://localhost:8000/life.html"
echo "   智能体: http://localhost:8000/agents.html"
echo "   设置: http://localhost:8000/settings.html"
echo ""
echo "🎯 测试步骤："
echo "   1. 在浏览器中打开任意页面"
echo "   2. 点击右上角 [EN] 或 [中文] 按钮"
echo "   3. 观察页面内容是否切换语言"
echo "   4. 刷新页面，确认语言保持"
echo "   5. 访问其他页面，验证语言一致性"
echo ""
echo "⌨️  快捷键: Ctrl+L (或 Cmd+L) 快速切换语言"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 等待用户中断
wait $SERVER_PID
