#!/usr/bin/env python3
"""
增强首页内容 - 移除评价，添加更多实质内容
"""

import re
from pathlib import Path

BASE_DIR = Path(__file__).parent

# FAQ 部分
FAQ_HTML = '''
    <!-- FAQ Section -->
    <section class="faq" style="padding: 8rem 2rem; background: #f8f9fa;">
        <div class="section-header" style="text-align: center; max-width: 780px; margin: 0 auto 5rem;">
            <div class="section-eyebrow" style="font-size: 1rem; font-weight: 600; color: var(--color-primary); margin-bottom: 0.5rem; letter-spacing: 0.05em; text-transform: uppercase;">常见问题</div>
            <h2 class="section-title" style="font-size: clamp(2.5rem, 5vw, 3.5rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 1rem;">你可能想知道</h2>
            <p class="section-description" style="font-size: 1.25rem; color: var(--color-text-secondary); line-height: 1.5;">关于 ATLAS 的常见问题解答</p>
        </div>

        <div style="max-width: 800px; margin: 0 auto; display: grid; gap: 1.5rem;">
            <div style="background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);">
                <h3 style="font-size: 1.25rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem;">
                    <span style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.875rem; font-weight: 700; flex-shrink: 0;">Q</span>
                    ATLAS 是什么？
                </h3>
                <p style="font-size: 1rem; line-height: 1.6; color: #4b5563; padding-left: 3rem;">
                    ATLAS 是一个 AI 驱动的个人智能操作系统，帮助你管理日常生活、工作任务、个人记忆和各种信息。它就像你的数字大脑，记住所有重要的事情，并在你需要时提供智能建议。
                </p>
            </div>

            <div style="background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);">
                <h3 style="font-size: 1.25rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem;">
                    <span style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.875rem; font-weight: 700; flex-shrink: 0;">Q</span>
                    我的数据安全吗？
                </h3>
                <p style="font-size: 1rem; line-height: 1.6; color: #4b5563; padding-left: 3rem;">
                    你的数据安全是我们的首要任务。我们使用端到端加密保护你的所有信息，数据只存储在你的设备或加密的云端。我们永远不会将你的个人数据用于训练 AI 模型或出售给第三方。
                </p>
            </div>

            <div style="background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);">
                <h3 style="font-size: 1.25rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem;">
                    <span style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.875rem; font-weight: 700; flex-shrink: 0;">Q</span>
                    需要付费吗？
                </h3>
                <p style="font-size: 1rem; line-height: 1.6; color: #4b5563; padding-left: 3rem;">
                    ATLAS 提供免费版本，包含核心功能。如果你需要更高级的 AI 能力、更大的存储空间和优先支持，可以升级到专业版。我们提供 14 天免费试用，无需信用卡。
                </p>
            </div>

            <div style="background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);">
                <h3 style="font-size: 1.25rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem;">
                    <span style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.875rem; font-weight: 700; flex-shrink: 0;">Q</span>
                    支持哪些平台？
                </h3>
                <p style="font-size: 1rem; line-height: 1.6; color: #4b5563; padding-left: 3rem;">
                    ATLAS 支持 Web、iOS、Android、macOS 和 Windows。你的数据会在所有设备间实时同步，让你随时随地访问。
                </p>
            </div>

            <div style="background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);">
                <h3 style="font-size: 1.25rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem;">
                    <span style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.875rem; font-weight: 700; flex-shrink: 0;">Q</span>
                    可以导入现有数据吗？
                </h3>
                <p style="font-size: 1rem; line-height: 1.6; color: #4b5563; padding-left: 3rem;">
                    可以！ATLAS 支持从 Google Calendar、Notion、Evernote、Apple Notes 等主流应用导入数据。我们还提供 API 和插件，方便与你现有的工具集成。
                </p>
            </div>
        </div>
    </section>
'''

# 核心优势对比
COMPARISON_HTML = '''
    <!-- Comparison Section -->
    <section class="comparison" style="padding: 8rem 2rem; background: #ffffff;">
        <div class="section-header" style="text-align: center; max-width: 780px; margin: 0 auto 5rem;">
            <div class="section-eyebrow" style="font-size: 1rem; font-weight: 600; color: var(--color-primary); margin-bottom: 0.5rem; letter-spacing: 0.05em; text-transform: uppercase;">为什么选择 ATLAS</div>
            <h2 class="section-title" style="font-size: clamp(2.5rem, 5vw, 3.5rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 1rem;">不只是另一个工具</h2>
            <p class="section-description" style="font-size: 1.25rem; color: var(--color-text-secondary); line-height: 1.5;">ATLAS 将多个应用的功能整合为一个统一的智能系统</p>
        </div>

        <div style="max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(2, 1fr); gap: 3rem;">
            <div>
                <h3 style="font-size: 1.5rem; font-weight: 700; color: #ef4444; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.75rem;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    传统方式
                </h3>
                <ul style="list-style: none; padding: 0; display: grid; gap: 1rem;">
                    <li style="display: flex; gap: 0.75rem; padding: 1rem; background: #fef2f2; border-radius: 0.5rem;">
                        <span style="color: #ef4444; flex-shrink: 0;">✗</span>
                        <span style="color: #4b5563;">在多个应用间切换，效率低下</span>
                    </li>
                    <li style="display: flex; gap: 0.75rem; padding: 1rem; background: #fef2f2; border-radius: 0.5rem;">
                        <span style="color: #ef4444; flex-shrink: 0;">✗</span>
                        <span style="color: #4b5563;">数据分散，难以获得全局视角</span>
                    </li>
                    <li style="display: flex; gap: 0.75rem; padding: 1rem; background: #fef2f2; border-radius: 0.5rem;">
                        <span style="color: #ef4444; flex-shrink: 0;">✗</span>
                        <span style="color: #4b5563;">需要手动整理和同步信息</span>
                    </li>
                    <li style="display: flex; gap: 0.75rem; padding: 1rem; background: #fef2f2; border-radius: 0.5rem;">
                        <span style="color: #ef4444; flex-shrink: 0;">✗</span>
                        <span style="color: #4b5563;">缺少智能建议和自动化</span>
                    </li>
                    <li style="display: flex; gap: 0.75rem; padding: 1rem; background: #fef2f2; border-radius: 0.5rem;">
                        <span style="color: #ef4444; flex-shrink: 0;">✗</span>
                        <span style="color: #4b5563;">学习曲线陡峭，需要配置多个工具</span>
                    </li>
                </ul>
            </div>

            <div>
                <h3 style="font-size: 1.5rem; font-weight: 700; color: #10b981; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.75rem;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    </svg>
                    使用 ATLAS
                </h3>
                <ul style="list-style: none; padding: 0; display: grid; gap: 1rem;">
                    <li style="display: flex; gap: 0.75rem; padding: 1rem; background: #f0fdf4; border-radius: 0.5rem;">
                        <span style="color: #10b981; flex-shrink: 0;">✓</span>
                        <span style="color: #4b5563;">一个统一界面，管理所有事务</span>
                    </li>
                    <li style="display: flex; gap: 0.75rem; padding: 1rem; background: #f0fdf4; border-radius: 0.5rem;">
                        <span style="color: #10b981; flex-shrink: 0;">✓</span>
                        <span style="color: #4b5563;">AI 自动连接和分析你的所有数据</span>
                    </li>
                    <li style="display: flex; gap: 0.75rem; padding: 1rem; background: #f0fdf4; border-radius: 0.5rem;">
                        <span style="color: #10b981; flex-shrink: 0;">✓</span>
                        <span style="color: #4b5563;">智能助手主动提醒和建议</span>
                    </li>
                    <li style="display: flex; gap: 0.75rem; padding: 1rem; background: #f0fdf4; border-radius: 0.5rem;">
                        <span style="color: #10b981; flex-shrink: 0;">✓</span>
                        <span style="color: #4b5563;">自动化处理重复性任务</span>
                    </li>
                    <li style="display: flex; gap: 0.75rem; padding: 1rem; background: #f0fdf4; border-radius: 0.5rem;">
                        <span style="color: #10b981; flex-shrink: 0;">✓</span>
                        <span style="color: #4b5563;">开箱即用，几分钟即可上手</span>
                    </li>
                </ul>
            </div>
        </div>
    </section>
'''

# 技术栈展示
TECH_STACK_HTML = '''
    <!-- Tech Stack Section -->
    <section class="tech-stack" style="padding: 8rem 2rem; background: linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 100%); color: white;">
        <div class="section-header" style="text-align: center; max-width: 780px; margin: 0 auto 5rem;">
            <div class="section-eyebrow" style="font-size: 1rem; font-weight: 600; color: #06b6d4; margin-bottom: 0.5rem; letter-spacing: 0.05em; text-transform: uppercase;">强大技术</div>
            <h2 class="section-title" style="font-size: clamp(2.5rem, 5vw, 3.5rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 1rem; color: white;">基于前沿 AI 技术</h2>
            <p class="section-description" style="font-size: 1.25rem; color: #a1a1a6; line-height: 1.5;">我们使用最先进的技术为你提供最佳体验</p>
        </div>

        <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
            <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; padding: 2rem; text-align: center; backdrop-filter: blur(10px);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🤖</div>
                <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">多模型 AI</h3>
                <p style="font-size: 0.9375rem; color: #a1a1a6; line-height: 1.5;">
                    集成 GPT-4、Claude 等顶级 AI 模型
                </p>
            </div>

            <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; padding: 2rem; text-align: center; backdrop-filter: blur(10px);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
                <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">端到端加密</h3>
                <p style="font-size: 0.9375rem; color: #a1a1a6; line-height: 1.5;">
                    军用级加密保护你的隐私
                </p>
            </div>

            <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; padding: 2rem; text-align: center; backdrop-filter: blur(10px);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚡</div>
                <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">实时同步</h3>
                <p style="font-size: 0.9375rem; color: #a1a1a6; line-height: 1.5;">
                    毫秒级响应，跨设备即时更新
                </p>
            </div>

            <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; padding: 2rem; text-align: center; backdrop-filter: blur(10px);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🧠</div>
                <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">知识图谱</h3>
                <p style="font-size: 0.9375rem; color: #a1a1a6; line-height: 1.5;">
                    智能连接你的所有信息
                </p>
            </div>
        </div>
    </section>
'''

def enhance_homepage():
    """增强首页内容"""
    print("=" * 60)
    print("增强首页内容")
    print("=" * 60)
    print()

    source_file = BASE_DIR / 'index.html'

    with open(source_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 移除用户评价部分
    testimonials_pattern = r'<!-- Testimonials Section -->.*?</section>'
    if re.search(testimonials_pattern, content, re.DOTALL):
        content = re.sub(testimonials_pattern, '', content, flags=re.DOTALL)
        print("✅ 已移除用户评价部分")

    # 在 Use Cases 之后添加新内容
    use_cases_pattern = r'(<!-- Use Cases Section -->.*?</section>)'
    if re.search(use_cases_pattern, content, re.DOTALL):
        content = re.sub(
            use_cases_pattern,
            r'\1' + COMPARISON_HTML + FAQ_HTML + TECH_STACK_HTML,
            content,
            flags=re.DOTALL
        )
        print("✅ 已添加对比分析部分")
        print("✅ 已添加 FAQ 部分")
        print("✅ 已添加技术栈展示")

    with open(source_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print()

def main():
    enhance_homepage()

    print("=" * 60)
    print("✅ 首页增强完成！")
    print("=" * 60)
    print()
    print("已完成：")
    print("  ✗ 移除：用户评价（不适合初期项目）")
    print("  ✓ 新增：为什么选择 ATLAS（对比分析）")
    print("  ✓ 新增：常见问题（5个FAQ）")
    print("  ✓ 新增：技术栈展示（4个核心技术）")
    print()
    print("刷新浏览器查看效果")
    print()

if __name__ == '__main__':
    main()
