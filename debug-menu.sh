#!/bin/bash
# 移动端导航栏调试脚本

echo "=================================="
echo "移动端导航栏调试"
echo "=================================="
echo ""

echo "1. 检查 CSS 文件..."
if grep -q "atlas-menu-toggle" assets/css/atlas-shell.css; then
    echo "   ✅ CSS 中存在菜单按钮样式"
else
    echo "   ❌ CSS 中缺少菜单按钮样式"
fi

echo ""
echo "2. 检查 JavaScript 文件..."
if grep -q "atlas-menu-toggle" assets/js/atlas-shell.js; then
    echo "   ✅ JS 中存在菜单按钮逻辑"
else
    echo "   ❌ JS 中缺少菜单按钮逻辑"
fi

echo ""
echo "3. 检查响应式断点..."
grep "@media (max-width: 768px)" assets/css/atlas-shell.css | head -3

echo ""
echo "4. 测试建议："
echo "   - 访问 http://localhost:8000/test-menu.html"
echo "   - 打开浏览器开发者工具（F12）"
echo "   - 切换到手机模式（Ctrl+Shift+M）"
echo "   - 查看控制台是否有错误"
echo "   - 点击菜单按钮测试"
echo ""
