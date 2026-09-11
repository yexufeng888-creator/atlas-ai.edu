#!/usr/bin/env python3
"""
批量为 ATLAS HTML 页面添加中英双语支持
"""

import os
import re
from pathlib import Path

# 需要处理的页面
PAGES = [
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
]

# 语言切换按钮 HTML
LANG_SWITCHER = '''<!-- Language Switcher -->
                <div style="display: flex; gap: 0.5rem; margin-left: auto;">
                    <button class="lang-switch" data-lang="en" style="padding: 0.5rem 0.75rem; background: rgba(255, 255, 255, 0.9); border: 1px solid #e5e7eb; border-radius: 0.5rem; cursor: pointer; font-weight: 600; font-size: 0.875rem; transition: all 0.3s ease;">EN</button>
                    <button class="lang-switch" data-lang="zh-CN" style="padding: 0.5rem 0.75rem; background: rgba(255, 255, 255, 0.9); border: 1px solid #e5e7eb; border-radius: 0.5rem; cursor: pointer; font-weight: 600; font-size: 0.875rem; transition: all 0.3s ease;">中文</button>
                </div>'''

# i18n 脚本和样式
I18N_SCRIPT = '''    <script src="assets/js/i18n.js"></script>
    <script>
        // 语言切换按钮样式
        const langStyle = document.createElement('style');
        langStyle.textContent = `
            .lang-switch.active {
                background: linear-gradient(135deg, #2563eb, #06b6d4) !important;
                color: white !important;
                border-color: transparent !important;
            }
        `;
        document.head.appendChild(langStyle);
    </script>'''

def process_file(filepath):
    """处理单个 HTML 文件"""
    print(f"处理: {filepath}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查是否已经有 i18n.js
    if 'i18n.js' in content:
        print(f"  ✓ 已有 i18n.js，跳过")
        return False

    modified = False

    # 1. 在导航栏添加语言切换按钮（如果有导航栏）
    if '<nav' in content and 'lang-switch' not in content:
        # 尝试在用户菜单或导航链接后添加
        patterns = [
            (r'(<div id="userMenu"[^>]*>)', r'\1\n                ' + LANG_SWITCHER + '\n                '),
            (r'(</nav>)', LANG_SWITCHER + '\n        \\1'),
        ]

        for pattern, replacement in patterns:
            new_content = re.sub(pattern, replacement, content, count=1)
            if new_content != content:
                content = new_content
                modified = True
                print(f"  ✓ 添加了语言切换按钮")
                break

    # 2. 在 </body> 前添加 i18n 脚本
    if '</body>' in content:
        content = content.replace('</body>', I18N_SCRIPT + '\n</body>')
        modified = True
        print(f"  ✓ 添加了 i18n.js 脚本")

    # 3. 保存文件
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
    base_dir = Path(__file__).parent
    processed = 0
    skipped = 0

    print("=" * 60)
    print("ATLAS 批量添加中英双语支持")
    print("=" * 60)
    print()

    for page in PAGES:
        filepath = base_dir / page
        if filepath.exists():
            if process_file(filepath):
                processed += 1
            else:
                skipped += 1
        else:
            print(f"⚠️  文件不存在: {page}")
        print()

    print("=" * 60)
    print(f"✅ 完成！处理了 {processed} 个页面，跳过 {skipped} 个")
    print("=" * 60)
    print()
    print("下一步：")
    print("1. 在浏览器中打开任意页面")
    print("2. 点击右上角 EN / 中文 按钮测试")
    print("3. 如需添加更多翻译，编辑 assets/js/i18n.js")
    print()

if __name__ == '__main__':
    main()
