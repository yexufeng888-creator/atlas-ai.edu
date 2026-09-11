/**
 * ATLAS Apple Scroll Effects
 * 类似 GDYXeAI 的 apple-scroll.js
 */

(function(window, document) {
  'use strict';

  // 视差滚动效果
  class ParallaxScroll {
    constructor() {
      this.elements = [];
      this.init();
    }

    init() {
      // 查找所有带 data-parallax 属性的元素
      document.querySelectorAll('[data-parallax]').forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.5;
        this.elements.push({ el, speed });
      });

      if (this.elements.length > 0) {
        this.bindEvents();
        this.update();
      }
    }

    bindEvents() {
      let ticking = false;

      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            this.update();
            ticking = false;
          });
          ticking = true;
        }
      });
    }

    update() {
      const scrollY = window.pageYOffset;

      this.elements.forEach(({ el, speed }) => {
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const elementHeight = rect.height;
        const viewportHeight = window.innerHeight;

        // 只在元素在视口附近时计算
        if (scrollY + viewportHeight > elementTop - 200 &&
            scrollY < elementTop + elementHeight + 200) {
          const offset = (scrollY - elementTop) * speed;
          el.style.transform = `translateY(${offset}px)`;
        }
      });
    }
  }

  // 淡入动画
  class FadeInObserver {
    constructor() {
      this.elements = [];
      this.init();
    }

    init() {
      if (!('IntersectionObserver' in window)) return;

      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // 一次性动画，观察后即移除
            this.observer.unobserve(entry.target);
          }
        });
      }, options);

      // 观察所有带 data-fade-in 属性的元素
      document.querySelectorAll('[data-fade-in]').forEach(el => {
        el.classList.add('atlas-fade-in');
        this.observer.observe(el);
      });
    }
  }

  // Apply the same calm, section-by-section reveal to all formal page layouts.
  class SectionRevealObserver {
    constructor() {
      if (!('IntersectionObserver' in window)) return;

      this.elements = [...document.querySelectorAll(
        'body > section:not(.hero):not(.atlas-no-reveal), main > section:not(.atlas-no-reveal), .page-section:not(.atlas-no-reveal)'
      )];
      if (!this.elements.length) return;

      this.elements.forEach((element) => element.classList.add('atlas-section-reveal'));
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          this.observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

      this.elements.forEach((element) => this.observer.observe(element));
    }
  }

  // 平滑锚点滚动
  class SmoothAnchor {
    constructor() {
      this.init();
    }

    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const href = anchor.getAttribute('href');
          if (href === '#') return;

          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 60;

            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });

            // 更新 URL
            if (history.pushState) {
              history.pushState(null, null, href);
            }
          }
        });
      });
    }
  }

  // 滚动进度条
  class ScrollProgress {
    constructor() {
      this.init();
    }

    init() {
      // 创建进度条元素
      this.bar = document.createElement('div');
      this.bar.className = 'atlas-scroll-progress';
      this.bar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #2563eb, #06b6d4);
        z-index: 10000;
        transform-origin: left;
        transform: scaleX(0);
        transition: transform 0.1s ease-out;
      `;
      document.body.appendChild(this.bar);

      this.update();
      window.addEventListener('scroll', () => this.update());
      window.addEventListener('resize', () => this.update());
    }

    update() {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) : 0;
      this.bar.style.transform = `scaleX(${scrolled})`;
    }
  }

  // 数字滚动动画
  class CountUp {
    constructor(element, target, duration = 2000) {
      this.element = element;
      this.target = parseFloat(target);
      this.duration = duration;
      this.start = 0;
      this.decimals = (target.toString().split('.')[1] || '').length;
    }

    animate() {
      const startTime = performance.now();
      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / this.duration, 1);

        // 缓动函数
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = this.start + (this.target - this.start) * easeOut;

        this.element.textContent = current.toFixed(this.decimals);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          this.element.textContent = this.target.toFixed(this.decimals);
        }
      };

      requestAnimationFrame(step);
    }
  }

  // 自动初始化数字滚动
  function initCountUp() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = el.dataset.countup || el.textContent;
          const duration = parseInt(el.dataset.duration) || 2000;

          new CountUp(el, target, duration).animate();
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-countup]').forEach(el => {
      observer.observe(el);
    });
  }

  // 初始化所有效果
  function init() {
    new ParallaxScroll();
    new FadeInObserver();
    new SectionRevealObserver();
    new SmoothAnchor();
    new ScrollProgress();
    initCountUp();

    console.log('✅ ATLAS Scroll Effects initialized');
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 导出 API
  window.ATLAS = window.ATLAS || {};
  window.ATLAS.Scroll = {
    CountUp: CountUp
  };

})(window, document);
