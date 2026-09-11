#!/usr/bin/env python3
"""
将 ATLAS 网站改造为类似 GDYXeAI 的统一架构
- 添加统一导航系统 (atlas-shell.js/css)
- 添加 Apple 风格滚动效果 (atlas-scroll.js/css)
- 保持现有的国际化功能
"""

import os
import re
from pathlib import Path

# 基础目录
BASE_DIR = Path(__file__).parent

# 需要处理的 HTML 文件
HTML_FILES = [
    "index.html",
    "home.html",
    "ask.html",
    "memory.html",
    "memory-personal.html",
    "memory-preferences.html",
    "memory-work.html",
    "memory-relationships.html",
    "life.html",
    "life-timeline.html",
    "life-calendar.html",
    "life-tasks.html",
    "life-trips.html",
    "life-projects.html",
    "life-documents.html",
    "agents.html",
    "agents-travel.html",
    "agents-runs.html",
    "agents-capabilities.html",
    "agents-actions.html",
    "settings.html",
    "settings-profile.html",
    "settings-privacy.html",
    "settings-appearance.html",
    "settings-execution.html",
    "settings-demo.html",
    "login.html",
    "signup.html",
    "pricing.html",
    "blog.html"
]

# 需要添加的 CSS 引用
CSS_INCLUDES = '''    <link rel="stylesheet" href="assets/css/atlas-shell.css">
    <link rel="stylesheet" href="assets/css/atlas-scroll.css">'''

# 需要添加的 JS 引用（在 </body> 前）
JS_INCLUDES = '''    <script src="assets/js/atlas-shell.js"></script>
    <script src="assets/js/atlas-scroll.js"></script>'''

def process_html_file(filepath):
    """处理单个 HTML 文件"""
    print(f"处理: {filepath.name}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    modified = False

    # 1. 添加 CSS 引用（如果还没有）
    if 'atlas-shell.css' not in content:
        # 在 </head> 之前添加
        if '</head>' in content:
            content = content.replace('</head>', CSS_INCLUDES + '\n</head>')
            modified = True
            print(f"  ✓ 添加了 CSS 引用")

    # 2. 移除旧的导航栏（如果存在）
    # 保留导航栏内容，但让 atlas-shell.js 接管
    nav_patterns = [
        r'<nav class="navbar">.*?</nav>',
        r'<nav [^>]*class="[^"]*navbar[^"]*"[^>]*>.*?</nav>',
    ]

    for pattern in nav_patterns:
        if re.search(pattern, content, re.DOTALL):
            # 用简单的 nav 标签替换，让 atlas-shell.js 接管
            content = re.sub(pattern, '<nav class="global-nav"></nav>', content, flags=re.DOTALL, count=1)
            modified = True
            print(f"  ✓ 替换了导航栏为统一架构")
            break

    # 3. 添加 JS 引用（如果还没有）
    if 'atlas-shell.js' not in content:
        # 在 i18n.js 之后，</body> 之前添加
        if 'i18n.js' in content:
            content = content.replace(
                '<script src="assets/js/i18n.js"></script>',
                '<script src="assets/js/i18n.js"></script>\n' + JS_INCLUDES
            )
        elif '</body>' in content:
            content = content.replace('</body>', JS_INCLUDES + '\n</body>')

        if content != original_content:
            modified = True
            print(f"  ✓ 添加了 JS 引用")

    # 4. 确保 body 有正确的类
    if '<body>' in content and 'has-global-nav' not in content:
        content = content.replace('<body>', '<body class="has-global-nav">')
        modified = True
        print(f"  ✓ 添加了 body 类")

    # 保存文件
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ 完成")
        return True
    else:
        print(f"  ⏭️  无需修改")
        return False

def main():
    """主函数"""
    print("=" * 60)
    print("ATLAS 架构升级 - 参考 GDYXeAI")
    print("=" * 60)
    print()

    processed = 0
    skipped = 0

    for filename in HTML_FILES:
        filepath = BASE_DIR / filename
        if filepath.exists():
            if process_html_file(filepath):
                processed += 1
            else:
                skipped += 1
            print()
        else:
            print(f"⚠️  文件不存在: {filename}")
            print()

    print("=" * 60)
    print(f"✅ 完成！处理了 {processed} 个文件，跳过 {skipped} 个")
    print("=" * 60)
    print()
    print("新架构特性：")
    print("  ✅ 统一的全局导航（类似 GDYXeAI site-shell.js）")
    print("  ✅ Apple 风格滚动效果")
    print("  ✅ 响应式移动端菜单")
    print("  ✅ 保留完整的国际化功能")
    print()
    print("测试方法：")
    print("  1. 启动服务器: python3 -m http.server 8000")
    print("  2. 访问: http://localhost:8000")
    print("  3. 测试导航、滚动效果、语言切换")
    print()

if __name__ == '__main__':
    main()
