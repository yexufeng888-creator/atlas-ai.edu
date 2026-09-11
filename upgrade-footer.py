#!/usr/bin/env python3
"""
升级页脚 - 更高级的设计和更多链接
"""

import re
from pathlib import Path

BASE_DIR = Path(__file__).parent

# 新的高级页脚
NEW_FOOTER = '''
    <!-- Footer -->
    <footer class="footer" style="background: #0a0a0a; color: #a1a1a6; padding: 6rem 2rem 2rem; border-top: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="max-width: 1400px; margin: 0 auto;">
            <!-- 页脚主要内容 -->
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 4rem; margin-bottom: 4rem;">
                <!-- 品牌栏 -->
                <div>
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
                        <img src="assets/img/atlas-logo.jpg" alt="ATLAS" style="width: 40px; height: 40px; border-radius: 10px;">
                        <span style="font-size: 1.5rem; font-weight: 700; color: white;">ATLAS</span>
                    </div>
                    <p style="font-size: 0.9375rem; line-height: 1.6; color: #6b7280; margin-bottom: 2rem; max-width: 320px;">
                        你的个人 AI 智能操作系统<br>
                        让生活井井有条，工作高效有序
                    </p>
                    <!-- 社交媒体 -->
                    <div style="display: flex; gap: 1rem;">
                        <a href="#" style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center; color: #a1a1a6; text-decoration: none; transition: all 0.2s;" onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.color='white';" onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'; this.style.color='#a1a1a6';">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                            </svg>
                        </a>
                        <a href="#" style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center; color: #a1a1a6; text-decoration: none; transition: all 0.2s;" onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.color='white';" onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'; this.style.color='#a1a1a6';">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                            </svg>
                        </a>
                        <a href="#" style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center; color: #a1a1a6; text-decoration: none; transition: all 0.2s;" onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.color='white';" onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'; this.style.color='#a1a1a6';">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                            </svg>
                        </a>
                        <a href="#" style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center; color: #a1a1a6; text-decoration: none; transition: all 0.2s;" onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.color='white';" onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'; this.style.color='#a1a1a6';">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                        </a>
                    </div>
                </div>

                <!-- 产品 -->
                <div>
                    <h4 style="font-size: 0.875rem; font-weight: 600; color: white; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em;">产品</h4>
                    <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                        <li><a href="#features" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">功能特性</a></li>
                        <li><a href="pricing.html" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">定价方案</a></li>
                        <li><a href="home.html" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">工作台</a></li>
                        <li><a href="ask.html" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">AI 问询</a></li>
                        <li><a href="memory.html" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">智能记忆</a></li>
                        <li><a href="agents.html" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">AI 智能体</a></li>
                    </ul>
                </div>

                <!-- 资源 -->
                <div>
                    <h4 style="font-size: 0.875rem; font-weight: 600; color: white; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em;">资源</h4>
                    <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                        <li><a href="blog.html" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">博客</a></li>
                        <li><a href="#" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">帮助中心</a></li>
                        <li><a href="#" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">开发者文档</a></li>
                        <li><a href="#" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">API 接口</a></li>
                        <li><a href="#" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">社区论坛</a></li>
                        <li><a href="#" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">更新日志</a></li>
                    </ul>
                </div>

                <!-- 公司 -->
                <div>
                    <h4 style="font-size: 0.875rem; font-weight: 600; color: white; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em;">公司</h4>
                    <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                        <li><a href="#team" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">关于我们</a></li>
                        <li><a href="#" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">加入我们</a></li>
                        <li><a href="#" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">新闻动态</a></li>
                        <li><a href="#" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">合作伙伴</a></li>
                        <li><a href="#" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">联系我们</a></li>
                    </ul>
                </div>

                <!-- 法律 -->
                <div>
                    <h4 style="font-size: 0.875rem; font-weight: 600; color: white; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em;">法律</h4>
                    <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                        <li><a href="privacy-policy.html" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">隐私政策</a></li>
                        <li><a href="#" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">服务条款</a></li>
                        <li><a href="#" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">Cookie 政策</a></li>
                        <li><a href="#" style="color: #6b7280; text-decoration: none; font-size: 0.9375rem; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#6b7280'">版权声明</a></li>
                    </ul>
                </div>
            </div>

            <!-- 页脚底部 -->
            <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <p style="font-size: 0.875rem; color: #6b7280;">
                        © 2026 Campus Intelligence Inc. 保留所有权利。
                    </p>
                    <p style="font-size: 0.75rem; color: #4b5563;">
                        部分功能在中国地区因配合监管工作暂不提供
                    </p>
                </div>
                <a href="index-en.html" style="display: flex; align-items: center; gap: 0.5rem; color: #06b6d4; text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: color 0.2s;" onmouseover="this.style.color='#0891b2'" onmouseout="this.style.color='#06b6d4'">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    Switch to English
                </a>
            </div>
        </div>
    </footer>

    <!-- 响应式样式 -->
    <style>
        @media (max-width: 1024px) {
            .footer > div > div:first-child {
                grid-template-columns: repeat(3, 1fr) !important;
            }

            .footer > div > div:first-child > div:first-child {
                grid-column: 1 / -1 !important;
            }
        }

        @media (max-width: 768px) {
            .footer > div > div:first-child {
                grid-template-columns: 1fr !important;
            }

            .footer > div > div:last-child {
                flex-direction: column !important;
                align-items: flex-start !important;
            }
        }
    </style>
'''

def upgrade_footer():
    """升级页脚"""
    print("=" * 60)
    print("升级页脚")
    print("=" * 60)
    print()

    source_file = BASE_DIR / 'index.html'

    with open(source_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 替换整个 Footer
    footer_pattern = r'<!-- Footer -->.*?</footer>'
    if re.search(footer_pattern, content, re.DOTALL):
        content = re.sub(footer_pattern, NEW_FOOTER.strip(), content, flags=re.DOTALL)
        print("✅ 已替换页脚为新的高级版本")

    with open(source_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print()

def main():
    upgrade_footer()

    print("=" * 60)
    print("✅ 页脚升级完成！")
    print("=" * 60)
    print()
    print("新页脚特性：")
    print()
    print("🎨 设计升级：")
    print("  - 5 列网格布局（品牌 + 4 个分类）")
    print("  - 更深的黑色背景 (#0a0a0a)")
    print("  - 社交媒体图标（Twitter、Facebook、GitHub、LinkedIn）")
    print("  - 悬停动画效果")
    print()
    print("🔗 链接丰富：")
    print("  - 产品：6 个链接（功能、定价、工作台等）")
    print("  - 资源：6 个链接（博客、帮助中心、API 等）")
    print("  - 公司：5 个链接（关于、招聘、合作等）")
    print("  - 法律：4 个链接（隐私、条款、Cookie 等）")
    print()
    print("📝 版权信息：")
    print("  - © 2026 Campus Intelligence Inc.")
    print("  - 中国地区监管提示")
    print("  - Switch to English 链接")
    print()
    print("📱 响应式：")
    print("  - 桌面：5 列布局")
    print("  - 平板：3 列布局")
    print("  - 移动：单列布局")
    print()
    print("刷新浏览器查看新的高级页脚！")
    print()

if __name__ == '__main__':
    main()
