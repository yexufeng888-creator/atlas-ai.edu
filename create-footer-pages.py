#!/usr/bin/env python3
"""
批量创建页脚功能页面
"""

from pathlib import Path

BASE_DIR = Path(__file__).parent

# 统一的页面模板
PAGE_TEMPLATE = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - ATLAS</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="icon" type="image/jpeg" href="assets/img/atlas-logo.jpg">
    <link rel="stylesheet" href="assets/css/atlas-shell.css">
    {extra_css}
</head>
<body class="has-global-nav">
    <nav class="global-nav"></nav>

    <!-- Page Hero -->
    <section class="page-hero" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8rem 2rem 6rem; text-align: center; position: relative; overflow: hidden;">
        <div style="position: relative; z-index: 10; max-width: 800px; margin: 0 auto;">
            <div style="font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.9; margin-bottom: 1rem;">{eyebrow}</div>
            <h1 style="font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 700; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -0.02em;">{heading}</h1>
            <p style="font-size: 1.25rem; opacity: 0.95; line-height: 1.5; max-width: 600px; margin: 0 auto;">{description}</p>
        </div>
    </section>

    <!-- Page Content -->
    <section style="padding: 6rem 2rem; background: #ffffff;">
        <div style="max-width: 1000px; margin: 0 auto;">
            {content}
        </div>
    </section>

    <script src="assets/js/atlas-shell.js"></script>
</body>
</html>
'''

# 页面配置
PAGES = {
    'help-center.html': {
        'title': '帮助中心',
        'eyebrow': '支持',
        'heading': '我们随时为你提供帮助',
        'description': '查找答案、浏览文档或联系我们的支持团队',
        'content': '''
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 4rem;">
                <div style="background: #f9fafb; border-radius: 1rem; padding: 2rem; border: 1px solid #e5e7eb;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">📚</div>
                    <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem;">快速入门</h3>
                    <p style="color: #6b7280; margin-bottom: 1rem;">了解 ATLAS 的基础功能和使用方法</p>
                    <a href="#" style="color: #0071e3; font-weight: 500; text-decoration: none;">查看指南 →</a>
                </div>
                <div style="background: #f9fafb; border-radius: 1rem; padding: 2rem; border: 1px solid #e5e7eb;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">🎓</div>
                    <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem;">视频教程</h3>
                    <p style="color: #6b7280; margin-bottom: 1rem;">通过视频快速掌握 ATLAS 的使用技巧</p>
                    <a href="#" style="color: #0071e3; font-weight: 500; text-decoration: none;">观看教程 →</a>
                </div>
                <div style="background: #f9fafb; border-radius: 1rem; padding: 2rem; border: 1px solid #e5e7eb;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">💬</div>
                    <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem;">联系支持</h3>
                    <p style="color: #6b7280; margin-bottom: 1rem;">遇到问题？我们的团队随时准备帮助你</p>
                    <a href="contact.html" style="color: #0071e3; font-weight: 500; text-decoration: none;">联系我们 →</a>
                </div>
            </div>

            <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 2rem;">常见问题</h2>
            <div style="display: grid; gap: 1rem;">
                <details style="background: #f9fafb; border-radius: 0.75rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
                    <summary style="font-weight: 600; cursor: pointer;">如何开始使用 ATLAS？</summary>
                    <p style="margin-top: 1rem; color: #6b7280;">注册账户后，你可以立即开始使用 ATLAS。我们建议先完成新手引导，了解核心功能。</p>
                </details>
                <details style="background: #f9fafb; border-radius: 0.75rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
                    <summary style="font-weight: 600; cursor: pointer;">ATLAS 支持哪些平台？</summary>
                    <p style="margin-top: 1rem; color: #6b7280;">ATLAS 支持 Web、iOS、Android、macOS 和 Windows 平台。</p>
                </details>
                <details style="background: #f9fafb; border-radius: 0.75rem; padding: 1.5rem; border: 1px solid #e5e7eb;">
                    <summary style="font-weight: 600; cursor: pointer;">如何导入现有数据？</summary>
                    <p style="margin-top: 1rem; color: #6b7280;">前往设置 → 数据导入，选择你要导入的来源，按照向导完成导入。</p>
                </details>
            </div>
        '''
    },

    'developers.html': {
        'title': '开发者文档',
        'eyebrow': '开发者',
        'heading': '为开发者打造',
        'description': '使用 ATLAS API 构建强大的集成和应用',
        'content': '''
            <div style="background: #f9fafb; border-radius: 1rem; padding: 3rem; border: 1px solid #e5e7eb; margin-bottom: 3rem;">
                <h2 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem;">快速开始</h2>
                <p style="color: #6b7280; margin-bottom: 2rem;">通过我们的 RESTful API 访问 ATLAS 的所有功能</p>
                <div style="background: #1a1a1a; border-radius: 0.75rem; padding: 1.5rem; font-family: 'Courier New', monospace; color: #a1a1a6; overflow-x: auto;">
                    <code>curl -X GET https://api.atlas.ai/v1/tasks \\<br>
  -H "Authorization: Bearer YOUR_API_KEY"</code>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">📖 文档</h3>
                    <ul style="list-style: none; padding: 0; display: grid; gap: 0.75rem;">
                        <li><a href="api.html" style="color: #0071e3; text-decoration: none;">API 参考</a></li>
                        <li><a href="#" style="color: #0071e3; text-decoration: none;">SDK 文档</a></li>
                        <li><a href="#" style="color: #0071e3; text-decoration: none;">集成指南</a></li>
                    </ul>
                </div>
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">🔧 工具</h3>
                    <ul style="list-style: none; padding: 0; display: grid; gap: 0.75rem;">
                        <li><a href="#" style="color: #0071e3; text-decoration: none;">API 密钥管理</a></li>
                        <li><a href="#" style="color: #0071e3; text-decoration: none;">Webhook 配置</a></li>
                        <li><a href="#" style="color: #0071e3; text-decoration: none;">测试工具</a></li>
                    </ul>
                </div>
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">💡 示例</h3>
                    <ul style="list-style: none; padding: 0; display: grid; gap: 0.75rem;">
                        <li><a href="#" style="color: #0071e3; text-decoration: none;">代码示例</a></li>
                        <li><a href="#" style="color: #0071e3; text-decoration: none;">集成案例</a></li>
                        <li><a href="#" style="color: #0071e3; text-decoration: none;">最佳实践</a></li>
                    </ul>
                </div>
            </div>
        '''
    },

    'api.html': {
        'title': 'API 接口',
        'eyebrow': 'API',
        'heading': 'ATLAS API',
        'description': '强大、灵活、易用的 RESTful API',
        'content': '''
            <div style="margin-bottom: 4rem;">
                <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 2rem;">API 端点</h2>
                <div style="display: grid; gap: 1.5rem;">
                    <div style="background: #f9fafb; border-radius: 0.75rem; padding: 2rem; border: 1px solid #e5e7eb;">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <span style="background: #10b981; color: white; padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600;">GET</span>
                            <code style="font-family: 'Courier New', monospace; color: #1a1a1a;">/v1/tasks</code>
                        </div>
                        <p style="color: #6b7280;">获取任务列表</p>
                    </div>
                    <div style="background: #f9fafb; border-radius: 0.75rem; padding: 2rem; border: 1px solid #e5e7eb;">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <span style="background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600;">POST</span>
                            <code style="font-family: 'Courier New', monospace; color: #1a1a1a;">/v1/tasks</code>
                        </div>
                        <p style="color: #6b7280;">创建新任务</p>
                    </div>
                    <div style="background: #f9fafb; border-radius: 0.75rem; padding: 2rem; border: 1px solid #e5e7eb;">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <span style="background: #f59e0b; color: white; padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600;">PUT</span>
                            <code style="font-family: 'Courier New', monospace; color: #1a1a1a;">/v1/tasks/:id</code>
                        </div>
                        <p style="color: #6b7280;">更新任务</p>
                    </div>
                    <div style="background: #f9fafb; border-radius: 0.75rem; padding: 2rem; border: 1px solid #e5e7eb;">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <span style="background: #ef4444; color: white; padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600;">DELETE</span>
                            <code style="font-family: 'Courier New', monospace; color: #1a1a1a;">/v1/tasks/:id</code>
                        </div>
                        <p style="color: #6b7280;">删除任务</p>
                    </div>
                </div>
            </div>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 1rem; padding: 3rem; color: white; text-align: center;">
                <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">准备开始？</h3>
                <p style="opacity: 0.95; margin-bottom: 2rem;">获取你的 API 密钥并开始构建</p>
                <a href="#" style="background: white; color: #667eea; padding: 0.75rem 2rem; border-radius: 980px; text-decoration: none; font-weight: 600; display: inline-block;">获取 API 密钥</a>
            </div>
        '''
    },

    'community.html': {
        'title': '社区论坛',
        'eyebrow': '社区',
        'heading': '加入 ATLAS 社区',
        'description': '与其他用户交流、分享经验、获取帮助',
        'content': '''
            <div style="text-align: center; margin-bottom: 4rem;">
                <p style="font-size: 1.125rem; color: #6b7280; margin-bottom: 2rem;">社区论坛即将上线，敬请期待</p>
                <div style="display: inline-flex; gap: 1rem;">
                    <a href="#" style="background: #0071e3; color: white; padding: 0.75rem 2rem; border-radius: 980px; text-decoration: none; font-weight: 600;">订阅更新</a>
                </div>
            </div>

            <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 2rem; text-align: center;">在此之前，你可以</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">💬</div>
                    <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem;">Discord</h3>
                    <p style="color: #6b7280; margin-bottom: 1rem;">加入我们的 Discord 服务器</p>
                    <a href="#" style="color: #0071e3; font-weight: 500; text-decoration: none;">立即加入 →</a>
                </div>
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🐦</div>
                    <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem;">Twitter</h3>
                    <p style="color: #6b7280; margin-bottom: 1rem;">关注我们获取最新动态</p>
                    <a href="#" style="color: #0071e3; font-weight: 500; text-decoration: none;">关注我们 →</a>
                </div>
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📧</div>
                    <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem;">邮件支持</h3>
                    <p style="color: #6b7280; margin-bottom: 1rem;">直接联系我们的团队</p>
                    <a href="contact.html" style="color: #0071e3; font-weight: 500; text-decoration: none;">发送邮件 →</a>
                </div>
            </div>
        '''
    },

    'changelog.html': {
        'title': '更新日志',
        'eyebrow': '更新',
        'heading': '更新日志',
        'description': '查看 ATLAS 的最新更新和改进',
        'content': '''
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="border-left: 2px solid #e5e7eb; padding-left: 2rem; margin-left: 1rem;">
                    <div style="margin-bottom: 3rem; position: relative;">
                        <div style="position: absolute; left: -2.5rem; width: 1rem; height: 1rem; background: #0071e3; border-radius: 50%; border: 3px solid white;"></div>
                        <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">2026年1月15日</div>
                        <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">v1.0.0 - 正式发布</h3>
                        <ul style="color: #6b7280; line-height: 1.8;">
                            <li>🎉 ATLAS 正式发布</li>
                            <li>✨ 智能记忆系统</li>
                            <li>🤖 AI 智能体功能</li>
                            <li>📊 生活数据分析</li>
                            <li>🔒 端到端加密</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 3rem; position: relative;">
                        <div style="position: absolute; left: -2.5rem; width: 1rem; height: 1rem; background: #6b7280; border-radius: 50%; border: 3px solid white;"></div>
                        <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">2025年12月1日</div>
                        <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">Beta 0.9.0</h3>
                        <ul style="color: #6b7280; line-height: 1.8;">
                            <li>🎨 全新 UI 设计</li>
                            <li>⚡ 性能优化</li>
                            <li>🐛 修复已知问题</li>
                        </ul>
                    </div>

                    <div style="position: relative;">
                        <div style="position: absolute; left: -2.5rem; width: 1rem; height: 1rem; background: #6b7280; border-radius: 50%; border: 3px solid white;"></div>
                        <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">2025年11月1日</div>
                        <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">Beta 0.8.0</h3>
                        <ul style="color: #6b7280; line-height: 1.8;">
                            <li>🔄 数据同步功能</li>
                            <li>📱 移动端适配</li>
                            <li>🌐 多语言支持</li>
                        </ul>
                    </div>
                </div>
            </div>
        '''
    },
}

# 第二批页面配置
PAGES_BATCH_2 = {
    'careers.html': {
        'title': '加入我们',
        'eyebrow': '招聘',
        'heading': '一起创造未来',
        'description': '加入 Campus Intelligence，打造改变世界的产品',
        'content': '''
            <div style="text-align: center; margin-bottom: 4rem;">
                <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 1rem;">为什么加入我们？</h2>
                <p style="font-size: 1.125rem; color: #6b7280; max-width: 600px; margin: 0 auto;">
                    我们是一个充满激情的团队，致力于用 AI 技术让人们的生活更美好
                </p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; margin-bottom: 4rem;">
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🚀</div>
                    <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem;">前沿技术</h3>
                    <p style="color: #6b7280;">使用最新的 AI 和云技术</p>
                </div>
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🌏</div>
                    <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem;">远程优先</h3>
                    <p style="color: #6b7280;">在任何地方工作</p>
                </div>
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">💰</div>
                    <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem;">有竞争力的薪资</h3>
                    <p style="color: #6b7280;">公平的薪酬和股权</p>
                </div>
            </div>

            <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 2rem;">开放职位</h2>
            <div style="display: grid; gap: 1.5rem;">
                <div style="background: #f9fafb; border-radius: 1rem; padding: 2rem; border: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">高级前端工程师</h3>
                        <p style="color: #6b7280;">全职 · 远程</p>
                    </div>
                    <a href="contact.html" style="background: #0071e3; color: white; padding: 0.75rem 1.5rem; border-radius: 980px; text-decoration: none; font-weight: 600;">申请</a>
                </div>
                <div style="background: #f9fafb; border-radius: 1rem; padding: 2rem; border: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">AI 研究工程师</h3>
                        <p style="color: #6b7280;">全职 · 远程</p>
                    </div>
                    <a href="contact.html" style="background: #0071e3; color: white; padding: 0.75rem 1.5rem; border-radius: 980px; text-decoration: none; font-weight: 600;">申请</a>
                </div>
                <div style="background: #f9fafb; border-radius: 1rem; padding: 2rem; border: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">产品设计师</h3>
                        <p style="color: #6b7280;">全职 · 远程</p>
                    </div>
                    <a href="contact.html" style="background: #0071e3; color: white; padding: 0.75rem 1.5rem; border-radius: 980px; text-decoration: none; font-weight: 600;">申请</a>
                </div>
            </div>
        '''
    },

    'news.html': {
        'title': '新闻动态',
        'eyebrow': '新闻',
        'heading': 'ATLAS 新闻',
        'description': '最新的公司动态和产品更新',
        'content': '''
            <div style="display: grid; gap: 3rem;">
                <article style="display: grid; grid-template-columns: 300px 1fr; gap: 2rem; align-items: start;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 1rem; aspect-ratio: 16/9;"></div>
                    <div>
                        <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">2026年1月15日</div>
                        <h2 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem;">ATLAS 正式发布</h2>
                        <p style="color: #6b7280; line-height: 1.6; margin-bottom: 1rem;">
                            今天，我们很高兴地宣布 ATLAS 正式发布。经过一年的开发和测试，ATLAS 现在已经准备好帮助你管理生活的方方面面。
                        </p>
                        <a href="#" style="color: #0071e3; font-weight: 500; text-decoration: none;">阅读更多 →</a>
                    </div>
                </article>

                <article style="display: grid; grid-template-columns: 300px 1fr; gap: 2rem; align-items: start;">
                    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 1rem; aspect-ratio: 16/9;"></div>
                    <div>
                        <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">2025年12月1日</div>
                        <h2 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem;">完成 A 轮融资</h2>
                        <p style="color: #6b7280; line-height: 1.6; margin-bottom: 1rem;">
                            Campus Intelligence 宣布完成 A 轮融资，将加速产品开发和团队扩张。
                        </p>
                        <a href="#" style="color: #0071e3; font-weight: 500; text-decoration: none;">阅读更多 →</a>
                    </div>
                </article>
            </div>
        '''
    },

    'partners.html': {
        'title': '合作伙伴',
        'eyebrow': '合作',
        'heading': '我们的合作伙伴',
        'description': '与优秀的公司一起创造价值',
        'content': '''
            <div style="text-align: center; margin-bottom: 4rem;">
                <p style="font-size: 1.125rem; color: #6b7280; margin-bottom: 2rem;">
                    我们与全球领先的技术公司合作，为用户提供最佳体验
                </p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 3rem; margin-bottom: 4rem;">
                <div style="background: #f9fafb; border-radius: 1rem; padding: 3rem; text-align: center; border: 1px solid #e5e7eb;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">🏢</div>
                    <h3 style="font-weight: 600;">技术合作伙伴</h3>
                </div>
                <div style="background: #f9fafb; border-radius: 1rem; padding: 3rem; text-align: center; border: 1px solid #e5e7eb;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">🤝</div>
                    <h3 style="font-weight: 600;">战略合作伙伴</h3>
                </div>
                <div style="background: #f9fafb; border-radius: 1rem; padding: 3rem; text-align: center; border: 1px solid #e5e7eb;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">🌟</div>
                    <h3 style="font-weight: 600;">生态合作伙伴</h3>
                </div>
            </div>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 1rem; padding: 3rem; color: white; text-align: center;">
                <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">成为合作伙伴</h3>
                <p style="opacity: 0.95; margin-bottom: 2rem;">与我们一起创造更大的价值</p>
                <a href="contact.html" style="background: white; color: #667eea; padding: 0.75rem 2rem; border-radius: 980px; text-decoration: none; font-weight: 600; display: inline-block;">联系我们</a>
            </div>
        '''
    },

    'contact.html': {
        'title': '联系我们',
        'eyebrow': '联系',
        'heading': '联系我们',
        'description': '我们随时准备听取你的意见',
        'content': '''
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-bottom: 4rem;">
                <div>
                    <h2 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 2rem;">发送消息</h2>
                    <form style="display: grid; gap: 1.5rem;">
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">姓名</label>
                            <input type="text" style="width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; font-size: 1rem;">
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">邮箱</label>
                            <input type="email" style="width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; font-size: 1rem;">
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">消息</label>
                            <textarea rows="5" style="width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; font-size: 1rem; font-family: inherit;"></textarea>
                        </div>
                        <button type="submit" style="background: #0071e3; color: white; padding: 0.75rem 2rem; border: none; border-radius: 980px; font-size: 1rem; font-weight: 600; cursor: pointer;">发送消息</button>
                    </form>
                </div>

                <div>
                    <h2 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 2rem;">其他联系方式</h2>
                    <div style="display: grid; gap: 2rem;">
                        <div>
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📧</div>
                            <h3 style="font-weight: 600; margin-bottom: 0.25rem;">邮箱</h3>
                            <a href="mailto:hello@atlas.ai" style="color: #0071e3; text-decoration: none;">hello@atlas.ai</a>
                        </div>
                        <div>
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">💬</div>
                            <h3 style="font-weight: 600; margin-bottom: 0.25rem;">在线聊天</h3>
                            <p style="color: #6b7280;">周一至周五 9:00-18:00</p>
                        </div>
                        <div>
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🐦</div>
                            <h3 style="font-weight: 600; margin-bottom: 0.25rem;">社交媒体</h3>
                            <a href="#" style="color: #0071e3; text-decoration: none;">@ATLASapp</a>
                        </div>
                    </div>
                </div>
            </div>
        '''
    },

    'terms.html': {
        'title': '服务条款',
        'eyebrow': '法律',
        'heading': '服务条款',
        'description': '使用 ATLAS 即表示你同意以下条款',
        'content': '''
            <div style="max-width: 800px; margin: 0 auto; line-height: 1.8; color: #4b5563;">
                <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 2rem;">最后更新：2026年1月1日</p>

                <h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin: 2rem 0 1rem;">1. 接受条款</h2>
                <p>通过访问和使用 ATLAS 服务，你接受并同意受这些服务条款的约束。</p>

                <h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin: 2rem 0 1rem;">2. 服务描述</h2>
                <p>ATLAS 是一个个人智能操作系统，帮助用户管理日常生活、工作任务和个人信息。</p>

                <h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin: 2rem 0 1rem;">3. 用户责任</h2>
                <p>你对通过你的账户进行的所有活动负责。你同意：</p>
                <ul style="margin: 1rem 0; padding-left: 2rem;">
                    <li>提供准确和完整的注册信息</li>
                    <li>维护账户安全</li>
                    <li>不滥用服务</li>
                    <li>遵守所有适用的法律</li>
                </ul>

                <h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin: 2rem 0 1rem;">4. 知识产权</h2>
                <p>ATLAS 服务及其内容受知识产权法保护。未经许可，你不得复制、修改或分发我们的内容。</p>

                <h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin: 2rem 0 1rem;">5. 免责声明</h2>
                <p>服务按"原样"提供。我们不保证服务不会中断或无错误。</p>

                <h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin: 2rem 0 1rem;">6. 联系我们</h2>
                <p>如有问题，请联系：<a href="mailto:legal@atlas.ai" style="color: #0071e3;">legal@atlas.ai</a></p>
            </div>
        '''
    },

    'cookies.html': {
        'title': 'Cookie 政策',
        'eyebrow': '法律',
        'heading': 'Cookie 政策',
        'description': '了解我们如何使用 Cookie',
        'content': '''
            <div style="max-width: 800px; margin: 0 auto; line-height: 1.8; color: #4b5563;">
                <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 2rem;">最后更新：2026年1月1日</p>

                <h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin: 2rem 0 1rem;">什么是 Cookie？</h2>
                <p>Cookie 是存储在你设备上的小型文本文件，帮助网站记住你的偏好和活动。</p>

                <h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin: 2rem 0 1rem;">我们如何使用 Cookie？</h2>
                <p>我们使用 Cookie 来：</p>
                <ul style="margin: 1rem 0; padding-left: 2rem;">
                    <li>保持你的登录状态</li>
                    <li>记住你的偏好设置</li>
                    <li>分析网站使用情况</li>
                    <li>改善服务性能</li>
                </ul>

                <h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin: 2rem 0 1rem;">Cookie 类型</h2>

                <h3 style="font-size: 1.25rem; font-weight: 600; color: #1a1a1a; margin: 1.5rem 0 0.75rem;">必要 Cookie</h3>
                <p>这些 Cookie 对网站运行至关重要，无法禁用。</p>

                <h3 style="font-size: 1.25rem; font-weight: 600; color: #1a1a1a; margin: 1.5rem 0 0.75rem;">功能 Cookie</h3>
                <p>这些 Cookie 使网站能够记住你的选择。</p>

                <h3 style="font-size: 1.25rem; font-weight: 600; color: #1a1a1a; margin: 1.5rem 0 0.75rem;">分析 Cookie</h3>
                <p>这些 Cookie 帮助我们了解网站的使用情况。</p>

                <h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin: 2rem 0 1rem;">管理 Cookie</h2>
                <p>你可以通过浏览器设置管理 Cookie 偏好。请注意，禁用某些 Cookie 可能影响网站功能。</p>

                <div style="background: #f9fafb; border-radius: 1rem; padding: 2rem; margin: 2rem 0; border: 1px solid #e5e7eb;">
                    <p style="margin: 0;"><strong>问题？</strong> 联系我们：<a href="mailto:privacy@atlas.ai" style="color: #0071e3;">privacy@atlas.ai</a></p>
                </div>
            </div>
        '''
    },

    'copyright.html': {
        'title': '版权声明',
        'eyebrow': '法律',
        'heading': '版权声明',
        'description': '保护我们的知识产权',
        'content': '''
            <div style="max-width: 800px; margin: 0 auto; line-height: 1.8; color: #4b5563;">
                <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 2rem;">最后更新：2026年1月1日</p>

                <h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin: 2rem 0 1rem;">版权所有</h2>
                <p>© 2026 Campus Intelligence Inc. 保留所有权利。</p>
                <p>ATLAS 及其相关标志是 Campus Intelligence Inc. 的商标。未经书面许可，不得使用。</p>

                <h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin: 2rem 0 1rem;">受保护的内容</h2>
                <p>以下内容受版权保护：</p>
                <ul style="margin: 1rem 0; padding-left: 2rem;">
                    <li>ATLAS 软件和源代码</li>
                    <li>网站设计和布局</li>
                    <li>文档和教程</li>
                    <li>图形、Logo 和商标</li>
                    <li>音频和视频内容</li>
                </ul>

                <h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin: 2rem 0 1rem;">许可使用</h2>
                <p>你可以：</p>
                <ul style="margin: 1rem 0; padding-left: 2rem;">
                    <li>使用 ATLAS 服务（根据服务条款）</li>
                    <li>出于个人用途下载文档</li>
                    <li>在遵守品牌指南的情况下使用 ATLAS Logo</li>
                </ul>

                <h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin: 2rem 0 1rem;">禁止行为</h2>
                <p>未经许可，你不得：</p>
                <ul style="margin: 1rem 0; padding-left: 2rem;">
                    <li>复制或修改软件</li>
                    <li>逆向工程</li>
                    <li>商业使用内容</li>
                    <li>移除版权声明</li>
                </ul>

                <h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin: 2rem 0 1rem;">DMCA 通知</h2>
                <p>如果你认为你的版权被侵犯，请联系我们：</p>
                <p style="background: #f9fafb; border-radius: 0.5rem; padding: 1rem; border: 1px solid #e5e7eb; margin: 1rem 0;">
                    Email: <a href="mailto:legal@atlas.ai" style="color: #0071e3;">legal@atlas.ai</a><br>
                    主题：DMCA Takedown Notice
                </p>

                <h2 style="font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin: 2rem 0 1rem;">许可请求</h2>
                <p>如需特殊许可，请联系：<a href="mailto:partnerships@atlas.ai" style="color: #0071e3;">partnerships@atlas.ai</a></p>
            </div>
        '''
    },
}

def create_pages():
    """创建所有页面"""
    print("=" * 60)
    print("批量创建页脚功能页面")
    print("=" * 60)
    print()

    total = len(PAGES) + len(PAGES_BATCH_2)
    created = 0

    # 创建第一批
    for filename, config in PAGES.items():
        filepath = BASE_DIR / filename
        html = PAGE_TEMPLATE.format(
            title=config['title'],
            eyebrow=config['eyebrow'],
            heading=config['heading'],
            description=config['description'],
            content=config['content'],
            extra_css=''
        )

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)

        created += 1
        print(f"✅ {filename:30} ({created}/{total})")

    # 创建第二批
    for filename, config in PAGES_BATCH_2.items():
        filepath = BASE_DIR / filename
        html = PAGE_TEMPLATE.format(
            title=config['title'],
            eyebrow=config['eyebrow'],
            heading=config['heading'],
            description=config['description'],
            content=config['content'],
            extra_css=''
        )

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)

        created += 1
        print(f"✅ {filename:30} ({created}/{total})")

    print()

def main():
    create_pages()

    print("=" * 60)
    print("✅ 所有页面创建完成！")
    print("=" * 60)
    print()
    print(f"已创建 {len(PAGES) + len(PAGES_BATCH_2)} 个新页面")
    print()
    print("资源栏：")
    print("  - help-center.html")
    print("  - developers.html")
    print("  - api.html")
    print("  - community.html")
    print("  - changelog.html")
    print()
    print("公司栏：")
    print("  - careers.html")
    print("  - news.html")
    print("  - partners.html")
    print("  - contact.html")
    print()
    print("法律栏：")
    print("  - terms.html")
    print("  - cookies.html")
    print("  - copyright.html")
    print()
    print("现在所有页脚链接都可用了！")
    print()

if __name__ == '__main__':
    main()
