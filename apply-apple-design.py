#!/usr/bin/env python3
"""
批量应用 Apple 风格设计到所有 ATLAS 二级页面
"""

import os
import re
from pathlib import Path

# 基础目录
BASE_DIR = Path(__file__).parent

# 需要更新的页面列表
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
]

# 通用的 Apple 风格 CSS
APPLE_STYLE = '''    <style>
        /* Apple-inspired Design System */
        :root {
            --color-primary: #0071e3;
            --color-primary-dark: #0077ED;
            --color-text: #1d1d1f;
            --color-text-secondary: #86868b;
            --color-bg: #fbfbfd;
            --color-surface: #ffffff;
            --color-border: #d2d2d7;
            --font-system: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            --radius-sm: 0.5rem;
            --radius-md: 1rem;
            --radius-lg: 1.5rem;
            --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
            --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
            --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.16);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--font-system);
            background: var(--color-bg);
            color: var(--color-text);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
        }

        /* Page Header */
        .page-hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 6rem 2rem 4rem;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .page-hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
        }

        .page-hero-content {
            position: relative;
            z-index: 10;
            max-width: 800px;
            margin: 0 auto;
        }

        .page-eyebrow {
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            opacity: 0.9;
            margin-bottom: 1rem;
        }

        .page-title {
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: 700;
            line-height: 1.1;
            margin-bottom: 1rem;
            letter-spacing: -0.02em;
        }

        .page-description {
            font-size: 1.25rem;
            opacity: 0.95;
            line-height: 1.5;
            max-width: 600px;
            margin: 0 auto;
        }

        /* Content Container */
        .page-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 4rem 2rem;
        }

        /* Cards */
        .card {
            background: var(--color-surface);
            border-radius: var(--radius-lg);
            padding: 2rem;
            box-shadow: var(--shadow-sm);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid var(--color-border);
        }

        .card:hover {
            box-shadow: var(--shadow-md);
            transform: translateY(-4px);
        }

        .card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }

        /* Buttons */
        .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 980px;
            font-size: 1rem;
            font-weight: 500;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            border: none;
        }

        .btn-primary {
            background: var(--color-primary);
            color: white;
        }

        .btn-primary:hover {
            background: var(--color-primary-dark);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 113, 227, 0.3);
        }

        .btn-secondary {
            background: transparent;
            color: var(--color-primary);
            border: 2px solid var(--color-primary);
        }

        .btn-secondary:hover {
            background: var(--color-primary);
            color: white;
        }

        /* Section Headers */
        .section-header {
            margin-bottom: 3rem;
        }

        .section-eyebrow {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--color-primary);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 0.5rem;
        }

        .section-title {
            font-size: clamp(2rem, 4vw, 3rem);
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 1rem;
            letter-spacing: -0.02em;
        }

        .section-description {
            font-size: 1.125rem;
            color: var(--color-text-secondary);
            line-height: 1.6;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .page-hero {
                padding: 5rem 1.5rem 3rem;
            }

            .page-container {
                padding: 3rem 1.5rem;
            }

            .card-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }
        }

        /* Animation */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        [data-fade-in] {
            animation: fadeInUp 0.6s ease-out both;
        }
    </style>'''

def process_page(filepath):
    """处理单个页面"""
    print(f"处理: {filepath.name}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False

    # 1. 添加 Apple 风格样式（如果还没有）
    if 'Apple-inspired Design System' not in content:
        # 在 </head> 之前添加
        if '</head>' in content:
            content = content.replace('</head>', APPLE_STYLE + '\n</head>')
            modified = True
            print(f"  ✓ 添加了 Apple 风格样式")

    # 2. 确保有 Inter 字体
    if 'fonts.googleapis.com' not in content and 'Inter' not in content:
        font_link = '    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">\n'
        content = content.replace('<head>', '<head>\n' + font_link)
        modified = True
        print(f"  ✓ 添加了 Inter 字体")

    # 3. 保存文件
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ 完成")
        return True
    else:
        print(f"  ⏭️  已是最新")
        return False

def main():
    """主函数"""
    print("=" * 60)
    print("应用 Apple 风格设计到所有二级页面")
    print("=" * 60)
    print()

    processed = 0
    skipped = 0

    for filename in PAGES:
        filepath = BASE_DIR / filename
        if filepath.exists():
            if process_page(filepath):
                processed += 1
            else:
                skipped += 1
            print()
        else:
            print(f"⚠️  文件不存在: {filename}")
            print()

    print("=" * 60)
    print(f"✅ 完成！处理了 {processed} 个页面，跳过 {skipped} 个")
    print("=" * 60)
    print()
    print("新增特性：")
    print("  ✅ Apple 风格设计系统")
    print("  ✅ 统一的视觉语言")
    print("  ✅ 流畅的动画效果")
    print("  ✅ 响应式布局")
    print("  ✅ Inter 字体")
    print()
    print("测试方法：")
    print("  1. 启动服务器: python3 -m http.server 8000")
    print("  2. 访问任意页面")
    print("  3. 查看新的设计效果")
    print()

if __name__ == '__main__':
    main()
