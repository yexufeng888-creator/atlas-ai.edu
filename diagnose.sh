#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║           ATLAS 网站问题诊断工具                                 ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

cd /Users/xufengye/Desktop/atlas-html

echo "📁 检查文件结构..."
echo ""

# 检查关键文件
files=(
    "index.html"
    "assets/js/i18n.js"
    "assets/js/auth.js"
    "assets/js/3d-effects.js"
    "assets/js/theme.js"
    "assets/css/main.css"
    "assets/css/3d-effects.css"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - 文件不存在"
    fi
done

echo ""
echo "🔍 检查 JavaScript 语法..."
echo ""

# 检查 JS 语法
for jsfile in assets/js/*.js; do
    if [ -f "$jsfile" ]; then
        if node -c "$jsfile" 2>&1; then
            echo "✅ $jsfile - 语法正确"
        else
            echo "❌ $jsfile - 语法错误"
        fi
    fi
done

echo ""
echo "📊 检查文件大小..."
echo ""

ls -lh index.html assets/js/i18n.js assets/js/auth.js | awk '{print $9, "-", $5}'

echo ""
echo "🌐 检查 index.html 中的 script 标签..."
echo ""

grep "script src" index.html | sed 's/^[ \t]*//'

echo ""
echo "🔧 检查 i18n.js 关键部分..."
echo ""

if grep -q "class I18nManager" assets/js/i18n.js; then
    echo "✅ I18nManager 类存在"
else
    echo "❌ I18nManager 类不存在"
fi

if grep -q "window.i18n = new I18nManager" assets/js/i18n.js; then
    echo "✅ window.i18n 已创建"
else
    echo "❌ window.i18n 未创建"
fi

if grep -q "data-lang" index.html; then
    echo "✅ 语言按钮 data-lang 属性存在"
else
    echo "❌ 语言按钮 data-lang 属性不存在"
fi

echo ""
echo "📝 生成测试报告..."
echo ""

# 计算翻译条目数量
en_count=$(grep -o "'nav\|'hero\|'feature\|'stats\|'team\|'cta\|'footer" assets/js/i18n.js | wc -l)
echo "翻译条目数量: 约 $en_count 条"

echo ""
echo "✨ 诊断完成！"
echo ""
echo "💡 下一步："
echo "   1. 打开 test-i18n.html 测试基本功能"
echo "   2. 打开浏览器控制台 (F12) 查看错误"
echo "   3. 确保 JavaScript 已启用"
echo ""
