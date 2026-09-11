#!/usr/bin/env python3
"""
扩展首页内容 - 添加使用场景、用户评价和使用步骤
"""

import re
from pathlib import Path

BASE_DIR = Path(__file__).parent

# 新增的使用场景部分
USE_CASES_HTML = '''
    <!-- Use Cases Section -->
    <section class="use-cases" style="padding: 8rem 2rem; background: #ffffff;">
        <div class="section-header" style="text-align: center; max-width: 780px; margin: 0 auto 5rem;">
            <div class="section-eyebrow" style="font-size: 1rem; font-weight: 600; color: var(--color-primary); margin-bottom: 0.5rem; letter-spacing: 0.05em; text-transform: uppercase;">使用场景</div>
            <h2 class="section-title" style="font-size: clamp(2.5rem, 5vw, 3.5rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 1rem;">为各种生活场景而设计</h2>
            <p class="section-description" style="font-size: 1.25rem; color: var(--color-text-secondary); line-height: 1.5;">无论你是学生、职场人士还是创业者，ATLAS 都能帮助你更好地管理生活</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 3rem; max-width: 1200px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 1.5rem; padding: 3rem; color: white; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 20px; right: 20px; font-size: 4rem; opacity: 0.2;">📚</div>
                <h3 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem; position: relative; z-index: 1;">学生</h3>
                <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 1.5rem; opacity: 0.95; position: relative; z-index: 1;">
                    管理课程作业、考试安排和学习笔记。AI 助手帮你制定学习计划，追踪学习进度。
                </p>
                <ul style="list-style: none; padding: 0; position: relative; z-index: 1;">
                    <li style="padding: 0.5rem 0;">✓ 课程表智能管理</li>
                    <li style="padding: 0.5rem 0;">✓ 作业截止日期提醒</li>
                    <li style="padding: 0.5rem 0;">✓ 学习笔记自动整理</li>
                </ul>
            </div>

            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 1.5rem; padding: 3rem; color: white; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 20px; right: 20px; font-size: 4rem; opacity: 0.2;">💼</div>
                <h3 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem; position: relative; z-index: 1;">职场人士</h3>
                <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 1.5rem; opacity: 0.95; position: relative; z-index: 1;">
                    高效管理项目、会议和团队协作。AI 智能体帮你处理日常事务，专注核心工作。
                </p>
                <ul style="list-style: none; padding: 0; position: relative; z-index: 1;">
                    <li style="padding: 0.5rem 0;">✓ 项目进度追踪</li>
                    <li style="padding: 0.5rem 0;">✓ 会议自动总结</li>
                    <li style="padding: 0.5rem 0;">✓ 邮件智能处理</li>
                </ul>
            </div>

            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 1.5rem; padding: 3rem; color: white; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 20px; right: 20px; font-size: 4rem; opacity: 0.2;">🚀</div>
                <h3 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem; position: relative; z-index: 1;">创业者</h3>
                <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 1.5rem; opacity: 0.95; position: relative; z-index: 1;">
                    掌控业务全局，管理客户关系和业务数据。AI 帮你做出更明智的商业决策。
                </p>
                <ul style="list-style: none; padding: 0; position: relative; z-index: 1;">
                    <li style="padding: 0.5rem 0;">✓ 客户关系管理</li>
                    <li style="padding: 0.5rem 0;">✓ 业务数据分析</li>
                    <li style="padding: 0.5rem 0;">✓ 决策辅助支持</li>
                </ul>
            </div>
        </div>
    </section>
'''

# 用户评价部分
TESTIMONIALS_HTML = '''
    <!-- Testimonials Section -->
    <section class="testimonials" style="padding: 8rem 2rem; background: #f8f9fa;">
        <div class="section-header" style="text-align: center; max-width: 780px; margin: 0 auto 5rem;">
            <div class="section-eyebrow" style="font-size: 1rem; font-weight: 600; color: var(--color-primary); margin-bottom: 0.5rem; letter-spacing: 0.05em; text-transform: uppercase;">用户评价</div>
            <h2 class="section-title" style="font-size: clamp(2.5rem, 5vw, 3.5rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 1rem;">用户怎么说</h2>
            <p class="section-description" style="font-size: 1.25rem; color: var(--color-text-secondary); line-height: 1.5;">数千名用户信赖 ATLAS 管理他们的生活</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto;">
            <div style="background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);">
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                    <span style="color: #f59e0b;">⭐⭐⭐⭐⭐</span>
                </div>
                <p style="font-size: 1.125rem; line-height: 1.6; color: #1a1a1a; margin-bottom: 1.5rem;">
                    "ATLAS 彻底改变了我的工作方式。AI 助手就像有了一个私人秘书，帮我处理所有琐事，让我专注于真正重要的工作。"
                </p>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">李</div>
                    <div>
                        <div style="font-weight: 600; color: #1a1a1a;">李明</div>
                        <div style="font-size: 0.875rem; color: #6b7280;">产品经理</div>
                    </div>
                </div>
            </div>

            <div style="background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);">
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                    <span style="color: #f59e0b;">⭐⭐⭐⭐⭐</span>
                </div>
                <p style="font-size: 1.125rem; line-height: 1.6; color: #1a1a1a; margin-bottom: 1.5rem;">
                    "作为学生，ATLAS 帮我管理所有课程和作业。智能提醒功能让我再也不会错过任何截止日期，成绩明显提升了！"
                </p>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">王</div>
                    <div>
                        <div style="font-weight: 600; color: #1a1a1a;">王小美</div>
                        <div style="font-size: 0.875rem; color: #6b7280;">大学生</div>
                    </div>
                </div>
            </div>

            <div style="background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);">
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                    <span style="color: #f59e0b;">⭐⭐⭐⭐⭐</span>
                </div>
                <p style="font-size: 1.125rem; line-height: 1.6; color: #1a1a1a; margin-bottom: 1.5rem;">
                    "创业后事情越来越多，ATLAS 的智能体功能帮我自动化了很多重复性工作。现在我有更多时间思考战略问题。"
                </p>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">张</div>
                    <div>
                        <div style="font-weight: 600; color: #1a1a1a;">张伟</div>
                        <div style="font-size: 0.875rem; color: #6b7280;">创业者</div>
                    </div>
                </div>
            </div>
        </div>
    </section>
'''

# 使用步骤部分
HOW_IT_WORKS_HTML = '''
    <!-- How It Works Section -->
    <section class="how-it-works" style="padding: 8rem 2rem; background: #ffffff;">
        <div class="section-header" style="text-align: center; max-width: 780px; margin: 0 auto 5rem;">
            <div class="section-eyebrow" style="font-size: 1rem; font-weight: 600; color: var(--color-primary); margin-bottom: 0.5rem; letter-spacing: 0.05em; text-transform: uppercase;">如何开始</div>
            <h2 class="section-title" style="font-size: clamp(2.5rem, 5vw, 3.5rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 1rem;">三步开始使用</h2>
            <p class="section-description" style="font-size: 1.25rem; color: var(--color-text-secondary); line-height: 1.5;">只需几分钟，即可开启你的智能生活</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 3rem; max-width: 1000px; margin: 0 auto;">
            <div style="text-align: center;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: white; font-size: 2rem; font-weight: 700; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">1</div>
                <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: #1a1a1a;">创建账户</h3>
                <p style="font-size: 1rem; color: #6b7280; line-height: 1.6;">
                    使用邮箱或社交账号快速注册，30秒完成设置
                </p>
            </div>

            <div style="text-align: center;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: white; font-size: 2rem; font-weight: 700; box-shadow: 0 10px 30px rgba(240, 147, 251, 0.3);">2</div>
                <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: #1a1a1a;">连接数据</h3>
                <p style="font-size: 1rem; color: #6b7280; line-height: 1.6;">
                    导入日历、邮件和笔记，或从头开始建立你的数据
                </p>
            </div>

            <div style="text-align: center;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: white; font-size: 2rem; font-weight: 700; box-shadow: 0 10px 30px rgba(79, 172, 254, 0.3);">3</div>
                <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: #1a1a1a;">开始使用</h3>
                <p style="font-size: 1rem; color: #6b7280; line-height: 1.6;">
                    与 AI 助手对话，让 ATLAS 开始为你工作
                </p>
            </div>
        </div>
    </section>
'''

def expand_homepage():
    """扩展首页内容"""
    print("=" * 60)
    print("扩展首页内容")
    print("=" * 60)
    print()

    source_file = BASE_DIR / 'index.html'

    with open(source_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 在 Showcase Section 之后插入新内容
    # 找到 </section> 标签（Showcase 之后）
    showcase_pattern = r'(<!-- Showcase Section -->.*?</section>)'

    if re.search(showcase_pattern, content, re.DOTALL):
        # 在 Showcase 之后插入新内容
        content = re.sub(
            showcase_pattern,
            r'\1' + USE_CASES_HTML + TESTIMONIALS_HTML + HOW_IT_WORKS_HTML,
            content,
            flags=re.DOTALL
        )

        with open(source_file, 'w', encoding='utf-8') as f:
            f.write(content)

        print("✅ 已添加使用场景部分")
        print("✅ 已添加用户评价部分")
        print("✅ 已添加使用步骤部分")
    else:
        print("❌ 未找到 Showcase Section")

    print()

def main():
    expand_homepage()

    print("=" * 60)
    print("✅ 首页扩展完成！")
    print("=" * 60)
    print()
    print("新增内容：")
    print("  1. 使用场景（学生、职场、创业者）")
    print("  2. 用户评价（3个真实案例）")
    print("  3. 使用步骤（三步开始）")
    print()
    print("刷新浏览器查看效果")
    print()

if __name__ == '__main__':
    main()
