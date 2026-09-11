#!/usr/bin/env python3
"""
全面检查并修复 ATLAS 所有页面的中文显示
确保不再出现翻译键问题
"""

import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).parent

# 所有需要检查的页面
PAGES = [
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
    "pricing.html",
    "blog.html",
    "login.html",
    "signup.html",
]

def check_page(filepath):
    """检查页面的问题"""
    issues = []

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查1：是否有 data-i18n 属性
    data_i18n_count = len(re.findall(r'data-i18n="[^"]*"', content))

    # 检查2：是否加载了 i18n.js
    has_i18n_js = 'i18n.js' in content

    # 检查3：是否有硬编码中文
    has_chinese = bool(re.search(r'[一-鿿]', content))

    return {
        'file': filepath.name,
        'data_i18n_count': data_i18n_count,
        'has_i18n_js': has_i18n_js,
        'has_chinese': has_chinese,
        'size': len(content)
    }

def fix_page(filepath):
    """修复页面 - 移除 i18n.js 依赖，直接使用中文"""
    print(f"处理: {filepath.name}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False

    # 如果页面有 data-i18n 属性，说明依赖翻译系统
    if 'data-i18n=' in content:
        print(f"  ⚠️  发现 data-i18n 属性，需要手动检查和替换")
        return False

    # 如果页面已经是纯中文，不需要修改
    if 'i18n.js' not in content:
        print(f"  ✓ 已是纯中文页面")
        return False

    # 移除 i18n.js 引用（如果有的话）
    if 'i18n.js' in content:
        content = re.sub(r'<script src="assets/js/i18n\.js"></script>\s*', '', content)
        modified = True
        print(f"  ✓ 移除了 i18n.js 引用")

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ 完成")
        return True

    return False

def main():
    print("=" * 60)
    print("ATLAS 全站页面检查和修复")
    print("=" * 60)
    print()

    print("第一步：检查所有页面状态")
    print("-" * 60)

    issues_found = []

    for filename in PAGES:
        filepath = BASE_DIR / filename
        if filepath.exists():
            result = check_page(filepath)
            print(f"{result['file']:30} | 翻译键: {result['data_i18n_count']:3d} | i18n.js: {'✓' if result['has_i18n_js'] else '✗'} | 中文: {'✓' if result['has_chinese'] else '✗'}")

            if result['data_i18n_count'] > 0:
                issues_found.append(result['file'])

    print()
    print("=" * 60)
    print(f"检查完成！发现 {len(issues_found)} 个页面使用了 data-i18n")
    print("=" * 60)
    print()

    if issues_found:
        print("需要手动检查的页面：")
        for file in issues_found:
            print(f"  - {file}")
        print()
        print("这些页面使用了 data-i18n 属性，需要：")
        print("  1. 检查显示是否正常")
        print("  2. 如果显示翻译键，需要将内容改为直接中文")
        print()

    print("第二步：修复非关键页面（移除不必要的 i18n.js）")
    print("-" * 60)

    fixed_count = 0
    for filename in PAGES:
        if filename in issues_found:
            continue  # 跳过有 data-i18n 的页面

        filepath = BASE_DIR / filename
        if filepath.exists():
            if fix_page(filepath):
                fixed_count += 1
            print()

    print("=" * 60)
    print(f"✅ 修复完成！处理了 {fixed_count} 个页面")
    print("=" * 60)
    print()
    print("建议：")
    print("  1. 刷新浏览器测试所有页面")
    print("  2. 重点检查上面列出的使用 data-i18n 的页面")
    print("  3. 如有问题，手动将 data-i18n 的内容改为直接中文")
    print()

if __name__ == '__main__':
    main()
