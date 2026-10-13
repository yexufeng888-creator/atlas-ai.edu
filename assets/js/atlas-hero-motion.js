(() => {
  const canvas = document.querySelector('[data-hero-atmosphere]');
  const hero = canvas?.closest('.hero');
  const backgroundVideo = hero?.querySelector('[data-hero-video]');
  const context = canvas instanceof HTMLCanvasElement ? canvas.getContext('2d') : null;

  if (!(canvas instanceof HTMLCanvasElement) || !(hero instanceof HTMLElement) || !context) {
    return;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const particles = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let elapsed = 0;
  let isVisible = false;

  const resize = () => {
    const bounds = hero.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    particles.length = 0;
    const count = Math.min(64, Math.max(20, Math.round(width / 18)));
    for (let index = 0; index < count; index += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.18,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.38 + 0.16
      });
    }

    render();
  };

  const render = () => {
    context.clearRect(0, 0, width, height);
    elapsed += 0.003;

    const glowX = width * (0.69 + Math.sin(elapsed) * 0.055);
    const glowY = height * (0.44 + Math.cos(elapsed * 0.8) * 0.075);
    const glow = context.createRadialGradient(glowX, glowY, 0, glowX, glowY, width * 0.4);
    glow.addColorStop(0, 'rgba(39, 132, 255, 0.12)');
    glow.addColorStop(0.48, 'rgba(72, 109, 231, 0.045)');
    glow.addColorStop(1, 'rgba(7, 11, 19, 0)');
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(137, 220, 255, ${particle.opacity})`;
      context.fill();
    });

    for (let first = 0; first < particles.length; first += 1) {
      for (let second = first + 1; second < particles.length; second += 1) {
        const a = particles[first];
        const b = particles[second];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance > 118) continue;

        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.strokeStyle = `rgba(103, 196, 255, ${0.1 * (1 - distance / 118)})`;
        context.lineWidth = 0.7;
        context.stroke();
      }
    }

    if (isVisible && !document.hidden && !reducedMotion.matches && !hero.classList.contains('has-background-video')) {
      frame = window.requestAnimationFrame(render);
    }
  };

  const updateAnimation = () => {
    window.cancelAnimationFrame(frame);
    if (isVisible && !document.hidden) render();
  };

  const updateVideoPlayback = () => {
    if (!(backgroundVideo instanceof HTMLVideoElement)) return;

    if (!isVisible || document.hidden || reducedMotion.matches) {
      backgroundVideo.pause();
      if (reducedMotion.matches) hero.classList.remove('has-background-video');
      return;
    }

    backgroundVideo.play().catch((error) => {
      hero.classList.remove('has-background-video');
      updateAnimation();
      if (error.name !== 'AbortError') {
        console.warn('ATLAS hero video is unavailable; using the animated fallback.', error);
      }
    });
  };

  if (backgroundVideo instanceof HTMLVideoElement) {
    backgroundVideo.addEventListener('playing', () => {
      hero.classList.add('has-background-video');
      updateAnimation();
    });
    backgroundVideo.addEventListener('error', () => {
      hero.classList.remove('has-background-video');
      updateAnimation();
      console.error('ATLAS hero background video failed to load.', backgroundVideo.error);
    });
  }

  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    updateAnimation();
    updateVideoPlayback();
  }).observe(hero);

  document.addEventListener('visibilitychange', () => {
    updateAnimation();
    updateVideoPlayback();
  });
  reducedMotion.addEventListener('change', () => {
    updateAnimation();
    updateVideoPlayback();
  });
  window.addEventListener('resize', resize, { passive: true });
})();
