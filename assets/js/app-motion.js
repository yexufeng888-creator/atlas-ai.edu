(function (window, document) {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const tiltCards = document.querySelectorAll(
    '.section-card, .workspace-card, .task-column, .preference-category, .timeline-item, ' +
    '.dashboard-card, .task-card, .event-card, .info-item, .preference-list li, .suggestion-card'
  );
  const revealItems = document.querySelectorAll(
    '.section-card, .workspace-card, .task-column, .preference-category, .timeline-item, ' +
    '.dashboard-card, .stat-card, .task-card, .event-card, .suggestion-card'
  );

  if (!reducedMotion) {
    const canvas = document.getElementById('particles-canvas') || document.createElement('canvas');
    if (!canvas.id) {
      canvas.id = 'atlas-motion-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      document.body.prepend(canvas);
    }

    const context = canvas.getContext('2d');
    if (context) {
      const particles = [];
      const particleCount = window.innerWidth <= 720 ? 28 : 48;
      let animationFrame = 0;

      function resizeCanvas() {
        const scale = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(window.innerWidth * scale);
        canvas.height = Math.round(window.innerHeight * scale);
        context.setTransform(scale, 0, 0, scale, 0, 0);
      }

      resizeCanvas();
      for (let index = 0; index < particleCount; index += 1) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - .5) * .35,
          vy: (Math.random() - .5) * .35,
          radius: Math.random() * 1.4 + .6,
          opacity: Math.random() * .35 + .15
        });
      }

      function drawParticles() {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        particles.forEach((particle) => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
          if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;

          context.beginPath();
          context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          context.fillStyle = `rgba(103, 164, 255, ${particle.opacity})`;
          context.fill();
        });

        for (let first = 0; first < particles.length; first += 1) {
          for (let second = first + 1; second < particles.length; second += 1) {
            const dx = particles[first].x - particles[second].x;
            const dy = particles[first].y - particles[second].y;
            const distance = Math.hypot(dx, dy);
            if (distance > 140) continue;

            context.beginPath();
            context.strokeStyle = `rgba(103, 164, 255, ${.09 * (1 - distance / 140)})`;
            context.lineWidth = .5;
            context.moveTo(particles[first].x, particles[first].y);
            context.lineTo(particles[second].x, particles[second].y);
            context.stroke();
          }
        }
        animationFrame = window.requestAnimationFrame(drawParticles);
      }

      function setAnimationState() {
        window.cancelAnimationFrame(animationFrame);
        if (!document.hidden) animationFrame = window.requestAnimationFrame(drawParticles);
      }

      window.addEventListener('resize', resizeCanvas, { passive: true });
      document.addEventListener('visibilitychange', setAnimationState);
      setAnimationState();
    }
  }

  function resetTilt(card) {
    card.classList.remove('atlas-tilting');
    card.style.removeProperty('--atlas-tilt-x');
    card.style.removeProperty('--atlas-tilt-y');
  }

  tiltCards.forEach((card) => {
    card.classList.add('atlas-motion-card');

    if (finePointer && !reducedMotion) {
      card.addEventListener('pointermove', (event) => {
        if (event.pointerType !== 'mouse') return;
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        const tiltX = (0.5 - y) * 8;
        const tiltY = (x - 0.5) * 8;

        card.style.setProperty('--atlas-tilt-x', `${tiltX.toFixed(2)}deg`);
        card.style.setProperty('--atlas-tilt-y', `${tiltY.toFixed(2)}deg`);
        card.classList.add('atlas-tilting');
      });

      card.addEventListener('pointerleave', () => resetTilt(card));
      card.addEventListener('pointercancel', () => resetTilt(card));
    }

    card.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'touch' || reducedMotion) return;
      card.classList.add('atlas-touch-pressed');
    });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach((eventName) => {
      card.addEventListener(eventName, () => {
        card.classList.remove('atlas-touch-pressed');
      });
    });
  });

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

    revealItems.forEach((item, index) => {
      item.classList.add('atlas-reveal');
      item.style.setProperty('--atlas-reveal-delay', `${(index % 4) * 65}ms`);
      revealObserver.observe(item);
    });
  }

  document.querySelectorAll('.btn, .btn-primary, .btn-secondary, .quick-action, .new-chat-btn')
    .forEach((button) => {
      if (button.matches(':disabled, [aria-disabled="true"]')) return;
      button.classList.add('atlas-ripple-host');
      button.addEventListener('pointerdown', (event) => {
        if (event.pointerType !== 'mouse' && event.pointerType !== 'touch') return;
        const bounds = button.getBoundingClientRect();
        const size = Math.max(bounds.width, bounds.height) * 1.5;
        const ripple = document.createElement('span');
        ripple.className = 'atlas-ripple';
        ripple.style.setProperty('--atlas-ripple-size', `${size}px`);
        ripple.style.setProperty('--atlas-ripple-x', `${event.clientX - bounds.left - size / 2}px`);
        ripple.style.setProperty('--atlas-ripple-y', `${event.clientY - bounds.top - size / 2}px`);
        button.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
      });
    });

  if (finePointer && !reducedMotion) {
    const glow = document.createElement('div');
    glow.className = 'atlas-pointer-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.prepend(glow);

    let frame = 0;
    document.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        glow.style.left = `${event.clientX}px`;
        glow.style.top = `${event.clientY}px`;
        document.body.classList.add('atlas-pointer-active');
      });
    }, { passive: true });

    document.addEventListener('pointerleave', (event) => {
      if (event.target !== document.documentElement) return;
      document.body.classList.remove('atlas-pointer-active');
    });
  }
})(window, document);
