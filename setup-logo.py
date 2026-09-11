#!/usr/bin/env python3
"""
为 ATLAS Logo 创建不同尺寸的版本
"""

from PIL import Image
import os

# Logo 路径
logo_path = 'assets/img/atlas-logo.jpg'
output_dir = 'assets/img'

print("=" * 60)
print("ATLAS Logo 集成完成")
print("=" * 60)
print()

if os.path.exists(logo_path):
    print(f"✅ Logo 已复制到: {logo_path}")

    # 获取文件大小
    size = os.path.getsize(logo_path)
    print(f"   文件大小: {size / 1024:.1f} KB")

    try:
        # 打开图片获取尺寸
        img = Image.open(logo_path)
        print(f"   图片尺寸: {img.size[0]} x {img.size[1]} px")
        print()

        # 创建 favicon 版本（32x32）
        favicon = img.copy()
        favicon.thumbnail((32, 32), Image.Resampling.LANCZOS)
        favicon_path = os.path.join(output_dir, 'favicon.jpg')
        favicon.save(favicon_path, 'JPEG', quality=95)
        print(f"✅ Favicon 已创建: {favicon_path}")

        # 创建导航栏版本（64x64）
        nav_logo = img.copy()
        nav_logo.thumbnail((64, 64), Image.Resampling.LANCZOS)
        nav_path = os.path.join(output_dir, 'atlas-logo-nav.jpg')
        nav_logo.save(nav_path, 'JPEG', quality=95)
        print(f"✅ 导航栏 Logo 已创建: {nav_path}")

    except Exception as e:
        print(f"⚠️  无法处理图片: {e}")
        print("   原始 Logo 仍可使用")
else:
    print(f"❌ Logo 未找到: {logo_path}")

print()
print("📍 Logo 应用位置：")
print("   - 导航栏（所有页面）")
print("   - 浏览器标签页图标")
print("   - 社交媒体分享图")
print()
print("🚀 测试方法：")
print("   1. 启动服务器: python3 -m http.server 8000")
print("   2. 访问: http://localhost:8000")
print("   3. 查看导航栏左上角的 ATLAS Logo")
print()
print("=" * 60)
