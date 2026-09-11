#!/usr/bin/env python3
"""
优化首页 - 移除评分统计，添加 3D 和粒子效果
"""

import re
from pathlib import Path

BASE_DIR = Path(__file__).parent

# 3D 交互效果的 CSS 和 JS
EFFECTS_CODE = '''
    <style>
        /* 3D 卡片效果 */
        .card-3d {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform-style: preserve-3d;
            will-change: transform;
        }

        .card-3d:hover {
            transform: translateY(-10px) rotateX(5deg);
        }

        /* 粒子背景容器 */
        #particles-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
            opacity: 0.6;
        }

        /* 增强的卡片 3D 效果 */
        .feature-card,
        .use-cases > div > div,
        .faq > div > div {
            transform: translateZ(0);
            backface-visibility: hidden;
        }

        .feature-card:hover {
            transform: translateY(-8px) translateZ(20px);
        }

        /* 鼠标跟随光效 */
        .mouse-glow {
            position: fixed;
            width: 600px;
            height: 600px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%);
            pointer-events: none;
            transform: translate(-50%, -50%);
            z-index: 1;
            transition: opacity 0.3s;
        }

        /* 优化动画性能 */
        @media (prefers-reduced-motion: reduce) {
            .card-3d,
            .feature-card {
                transition: none;
                transform: none !important;
            }
        }
    </style>

    <!-- 粒子背景画布 -->
    <canvas id="particles-canvas"></canvas>

    <!-- 鼠标跟随光效 -->
    <div class="mouse-glow" id="mouseGlow" style="opacity: 0;"></div>

    <script>
        // 粒子系统
        (function() {
            const canvas = document.getElementById('particles-canvas');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            let particles = [];
            let animationId;

            function resizeCanvas() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }

            class Particle {
                constructor() {
                    this.reset();
                }

                reset() {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.vx = (Math.random() - 0.5) * 0.5;
                    this.vy = (Math.random() - 0.5) * 0.5;
                    this.radius = Math.random() * 2 + 1;
                    this.opacity = Math.random() * 0.5 + 0.2;
                }

                update() {
                    this.x += this.vx;
                    this.y += this.vy;

                    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
                }

                draw() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(102, 126, 234, ${this.opacity})`;
                    ctx.fill();
                }
            }

            function init() {
                resizeCanvas();
                particles = [];
                for (let i = 0; i < 50; i++) {
                    particles.push(new Particle());
                }
            }

            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // 绘制粒子
                particles.forEach(particle => {
                    particle.update();
                    particle.draw();
                });

                // 连接附近的粒子
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < 150) {
                            ctx.beginPath();
                            ctx.strokeStyle = `rgba(102, 126, 234, ${0.1 * (1 - distance / 150)})`;
                            ctx.lineWidth = 0.5;
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.stroke();
                        }
                    }
                }

                animationId = requestAnimationFrame(animate);
            }

            init();
            animate();

            window.addEventListener('resize', () => {
                cancelAnimationFrame(animationId);
                init();
                animate();
            });
        })();

        // 鼠标跟随光效
        (function() {
            const glow = document.getElementById('mouseGlow');
            if (!glow) return;

            let mouseX = 0, mouseY = 0;
            let glowX = 0, glowY = 0;

            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                glow.style.opacity = '1';
            });

            document.addEventListener('mouseleave', () => {
                glow.style.opacity = '0';
            });

            function animateGlow() {
                glowX += (mouseX - glowX) * 0.1;
                glowY += (mouseY - glowY) * 0.1;

                glow.style.left = glowX + 'px';
                glow.style.top = glowY + 'px';

                requestAnimationFrame(animateGlow);
            }

            animateGlow();
        })();

        // 3D 卡片倾斜效果
        (function() {
            const cards = document.querySelectorAll('.feature-card, .use-cases > div > div');

            cards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    const rotateX = (y - centerY) / 10;
                    const rotateY = (centerX - x) / 10;

                    card.style.transform = `
                        translateY(-8px)
                        rotateX(${rotateX}deg)
                        rotateY(${rotateY}deg)
                        scale(1.02)
                    `;
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform = '';
                });
            });
        })();

        // 滚动视差效果
        (function() {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const parallaxElements = document.querySelectorAll('[data-parallax]');

                parallaxElements.forEach(element => {
                    const speed = element.dataset.parallax || 0.5;
                    const yPos = -(scrolled * speed);
                    element.style.transform = `translateY(${yPos}px)`;
                });
            });
        })();
    </script>
'''

def optimize_homepage():
    """优化首页"""
    print("=" * 60)
    print("优化首页 - 移除统计数据，添加 3D 和粒子效果")
    print("=" * 60)
    print()

    source_file = BASE_DIR / 'index.html'

    with open(source_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 移除 Stats Section
    stats_pattern = r'<!-- Stats Section -->.*?</section>'
    if re.search(stats_pattern, content, re.DOTALL):
        content = re.sub(stats_pattern, '', content, flags=re.DOTALL)
        print("✅ 已移除数据统计部分（活跃用户、评分等）")

    # 在 </body> 之前插入效果代码
    if '</body>' in content:
        content = content.replace('</body>', EFFECTS_CODE + '\n</body>')
        print("✅ 已添加粒子背景效果")
        print("✅ 已添加鼠标跟随光效")
        print("✅ 已添加 3D 卡片倾斜效果")
        print("✅ 已添加滚动视差效果")

    with open(source_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print()

def main():
    optimize_homepage()

    print("=" * 60)
    print("✅ 首页优化完成！")
    print("=" * 60)
    print()
    print("完成的优化：")
    print()
    print("✗ 移除：")
    print("  - 50,000 活跃用户")
    print("  - 1M+ 已完成任务")
    print("  - 99.9% 在线时间")
    print("  - 4.9/5 用户评分")
    print()
    print("✓ 新增：")
    print("  - 粒子背景动画（50个粒子互联）")
    print("  - 鼠标跟随光效（渐变光晕）")
    print("  - 3D 卡片倾斜（鼠标移动响应）")
    print("  - 滚动视差效果（深度感）")
    print()
    print("🎨 效果特点：")
    print("  - 性能优化（requestAnimationFrame）")
    print("  - 尊重用户偏好（prefers-reduced-motion）")
    print("  - GPU 加速（transform, will-change）")
    print("  - 平滑动画（缓动函数）")
    print()
    print("刷新浏览器查看炫酷的交互效果！")
    print()

if __name__ == '__main__':
    main()
