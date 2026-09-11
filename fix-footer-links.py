#!/usr/bin/env python3
"""
修复页脚链接 - 确保所有链接指向正确的页面
"""

import re
from pathlib import Path

BASE_DIR = Path(__file__).parent

def fix_footer_links():
    """修复页脚链接"""
    print("=" * 60)
    print("修复页脚链接")
    print("=" * 60)
    print()

    source_file = BASE_DIR / 'index.html'

    with open(source_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 链接映射（将错误的链接替换为正确的）
    replacements = [
        # 资源栏
        (r'<a href="#"[^>]*>帮助中心</a>', '<a href="help-center.html" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color=\'white\'" onmouseout="this.style.color=\'#6b7280\'">帮助中心</a>'),
        (r'<a href="#"[^>]*>开发者文档</a>', '<a href="developers.html" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color=\'white\'" onmouseout="this.style.color=\'#6b7280\'">开发者文档</a>'),
        (r'<a href="#"[^>]*>API 接口</a>', '<a href="api.html" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color=\'white\'" onmouseout="this.style.color=\'#6b7280\'">API 接口</a>'),
        (r'<a href="#"[^>]*>社区论坛</a>', '<a href="community.html" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color=\'white\'" onmouseout="this.style.color=\'#6b7280\'">社区论坛</a>'),
        (r'<a href="#"[^>]*>更新日志</a>', '<a href="changelog.html" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color=\'white\'" onmouseout="this.style.color=\'#6b7280\'">更新日志</a>'),

        # 公司栏
        (r'<a href="#"[^>]*>加入我们</a>', '<a href="careers.html" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color=\'white\'" onmouseout="this.style.color=\'#6b7280\'">加入我们</a>'),
        (r'<a href="#"[^>]*>新闻动态</a>', '<a href="news.html" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color=\'white\'" onmouseout="this.style.color=\'#6b7280\'">新闻动态</a>'),
        (r'<a href="#"[^>]*>合作伙伴</a>', '<a href="partners.html" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color=\'white\'" onmouseout="this.style.color=\'#6b7280\'">合作伙伴</a>'),
        (r'<a href="#"[^>]*>联系我们</a>', '<a href="contact.html" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color=\'white\'" onmouseout="this.style.color=\'#6b7280\'">联系我们</a>'),

        # 法律栏
        (r'<a href="#"[^>]*>服务条款</a>', '<a href="terms.html" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color=\'white\'" onmouseout="this.style.color=\'#6b7280\'">服务条款</a>'),
        (r'<a href="#"[^>]*>Cookie 政策</a>', '<a href="cookies.html" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color=\'white\'" onmouseout="this.style.color=\'#6b7280\'">Cookie 政策</a>'),
        (r'<a href="#"[^>]*>版权声明</a>', '<a href="copyright.html" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color=\'white\'" onmouseout="this.style.color=\'#6b7280\'">版权声明</a>'),
    ]

    fixed_count = 0
    for pattern, replacement in replacements:
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            fixed_count += 1
            print(f"✅ 修复链接: {pattern[:30]}...")

    with open(source_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print()
    print(f"共修复 {fixed_count} 个链接")
    print()

def main():
    fix_footer_links()

    print("=" * 60)
    print("✅ 页脚链接修复完成！")
    print("=" * 60)
    print()
    print("已修复的链接：")
    print()
    print("资源栏：")
    print("  ✓ 帮助中心 → help-center.html")
    print("  ✓ 开发者文档 → developers.html")
    print("  ✓ API 接口 → api.html")
    print("  ✓ 社区论坛 → community.html")
    print("  ✓ 更新日志 → changelog.html")
    print()
    print("公司栏：")
    print("  ✓ 加入我们 → careers.html")
    print("  ✓ 新闻动态 → news.html")
    print("  ✓ 合作伙伴 → partners.html")
    print("  ✓ 联系我们 → contact.html")
    print()
    print("法律栏：")
    print("  ✓ 服务条款 → terms.html")
    print("  ✓ Cookie 政策 → cookies.html")
    print("  ✓ 版权声明 → copyright.html")
    print()
    print("刷新浏览器测试所有链接！")
    print()

if __name__ == '__main__':
    main()
