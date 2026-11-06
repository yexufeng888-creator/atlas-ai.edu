/**
 * ATLAS Reflective Metal Pass — Real-Time WebGL2 Physical Planar Reflection Engine
 *
 * Implements exact physical & mathematical specifications:
 * 1. Dimensions: 320×500px, border-radius 24px, card number "0001  2345  6789", title "反射通行证".
 * 2. Dynamic Planar Environment: Offscreen 2D Canvas drawing blue panel (蓝色板), warm sphere (暖色球),
 *    and white light strips (白色灯条), uploaded per-frame via texSubImage2D -> WebGL2 Horizontal +
 *    Vertical 2-pass separable Gaussian blur FBOs -> desaturated after sampling (取样后去色).
 * 3. Surface Normal & Planar Reflection: Rounded-rect bevel (倒角) + micro-noise normal (微噪声法线) N,
 *    rotated in lockstep with card tilt; I = camera -> surface, R = reflect(I, N),
 *    q = R.xy / max(R.z, 0.2), UV = vUv + 0.12 * q.
 * 4. Spring Physics: Stiffness = 120, Damping = 16, target tilt ±12°, synchronized CSS 3D transform &
 *    GLSL normal rotation, smooth return-to-zero on pointer leave.
 * 5. Lifecycle & Resilience: Per-frame DPR/size check (resize only on change), non-WebGL2 graceful
 *    fallback with identical spring physics, and complete GPU/DOM resource cleanup on unmount.
 */
(function (window, document) {
  'use strict';

  const STIFFNESS = 120;
  const DAMPING = 16;
  const MAX_TILT_DEG = 12;
  const ENV_SIZE = 256;

  const FULLSCREEN_VERT = `#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  vec2 pos = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = pos;
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}
`;

  // Separable 13-tap Gaussian blur shader (run horizontally then vertically)
  const BLUR_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D u_tex;
uniform vec2 u_dir;
out vec4 fragColor;

void main() {
  const float weights[7] = float[](
    0.19648255,
    0.17469721,
    0.12098536,
    0.06559753,
    0.02783468,
    0.00924472,
    0.00240316
  );
  vec3 acc = texture(u_tex, vUv).rgb * weights[0];
  for (int i = 1; i < 7; i++) {
    vec2 offset = u_dir * float(i) * 2.2;
    acc += texture(u_tex, clamp(vUv + offset, 0.002, 0.998)).rgb * weights[i];
    acc += texture(u_tex, clamp(vUv - offset, 0.002, 0.998)).rgb * weights[i];
  }
  fragColor = vec4(acc, 1.0);
}
`;

  // Physically-inspired Planar Reflection Metal Shader
  const METAL_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;

uniform sampler2D u_envBlur;
uniform vec2 u_resolution;
uniform vec2 u_cardSize;   // CSS px (320, 500)
uniform vec2 u_tilt;       // (rotX_rad, rotY_rad) synced with CSS
uniform float u_time;

out vec4 fragColor;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Signed distance to 320x500 rounded rectangle with 24px corner radius
float sdRoundedCard(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + vec2(radius);
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
}

mat3 rotateXY(float rx, float ry) {
  float cx = cos(rx), sx = sin(rx);
  float cy = cos(ry), sy = sin(ry);
  mat3 mx = mat3(
    1.0, 0.0, 0.0,
    0.0,  cx, -sx,
    0.0,  sx,  cx
  );
  mat3 my = mat3(
     cy, 0.0, -sy,
    0.0, 1.0, 0.0,
     sy, 0.0,  cy
  );
  return mx * my;
}

void main() {
  vec2 halfCard = u_cardSize * 0.5;
  // Convert UV (0..1, Y up) into card-centered pixel coordinates
  vec2 pPx = (vUv - 0.5) * u_cardSize;
  float dist = sdRoundedCard(pPx, halfCard, 24.0);

  // Analytical SDF gradient for machined 24px-corner perimeter bevel (倒角)
  float eps = 1.0;
  float dx = sdRoundedCard(pPx + vec2(eps, 0.0), halfCard, 24.0) -
             sdRoundedCard(pPx - vec2(eps, 0.0), halfCard, 24.0);
  float dy = sdRoundedCard(pPx + vec2(0.0, eps), halfCard, 24.0) -
             sdRoundedCard(pPx - vec2(0.0, eps), halfCard, 24.0);
  vec2 sdfGrad = normalize(vec2(dx, dy) + 1e-6);

  // Bevel zone on outer 9.5px rim
  float bevelMask = smoothstep(-9.5, -0.4, dist);
  vec2 bevelXY = sdfGrad * bevelMask * 0.52;

  // Fine CNC bead-blasted + brushed micro-noise normal perturbation (微噪声法线)
  vec2 grainCoord = pPx * vec2(1.35, 3.8);
  float n0 = valueNoise(grainCoord);
  float nx = valueNoise(grainCoord + vec2(0.85, 0.0)) - n0;
  float ny = valueNoise(grainCoord + vec2(0.0, 0.85)) - n0;
  float fineHash = hash21(floor(pPx * 1.5)) - 0.5;
  vec2 microXY = vec2(nx * 0.042 + fineHash * 0.012, ny * 0.036);

  vec3 localN = normalize(vec3(bevelXY + microXY, 1.0));

  // Rotate normal N by exact same angle as CSS tilt (同一角度同步 CSS 与法线)
  vec3 N = normalize(rotateXY(u_tilt.x, u_tilt.y) * localN);

  // Incident vector I: Camera -> Surface
  float aspect = u_cardSize.x / max(u_cardSize.y, 1.0);
  vec3 camPos = vec3(0.0, 0.0, 2.15);
  vec3 surfPos = vec3((vUv.x - 0.5) * aspect, vUv.y - 0.5, 0.0);
  vec3 I = normalize(surfPos - camPos);

  // Exact Planar Reflection Formula: R = reflect(I, N), q = R.xy / max(R.z, 0.2), UV = vUv + 0.12 * q
  vec3 R = reflect(I, N);
  vec2 q = R.xy / max(R.z, 0.2);
  vec2 reflUv = clamp(vUv + 0.12 * q, 0.004, 0.996);

  // Sample 2-pass blurred planar studio texture, then desaturate (取样后去色)
  vec3 sampledRgb = texture(u_envBlur, reflUv).rgb;
  float luma = dot(sampledRgb, vec3(0.2126, 0.7152, 0.0722));

  // Machined anodized titanium-silver tonal curve (100% monochrome desaturated reflection)
  float specCurve = smoothstep(0.08, 0.96, luma);
  float highlight = pow(max(luma, 0.0), 3.1) * 0.52;
  float fresnel = pow(1.0 - clamp(dot(-I, N), 0.0, 1.0), 2.4);

  // Subtle anisotropic brushed sheen modulated solely by desaturated luma
  float brushLine = (valueNoise(vec2(pPx.x * 0.35, pPx.y * 5.2)) - 0.5) * 0.032;
  float metalValue = clamp(0.13 + specCurve * 0.64 + highlight + fresnel * 0.14 + bevelMask * 0.11 + brushLine, 0.05, 0.98);

  // Neutral machined titanium silver (zero color saturation)
  vec3 metalColor = vec3(metalValue);

  // Crisp anti-aliased rounded mask
  float alpha = 1.0 - smoothstep(-0.65, 0.65, dist);
  fragColor = vec4(metalColor, alpha);
}
`;

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error('GLSL compile error: ' + info);
    }
    return shader;
  }

  function createProgram(gl, vsSource, fsSource) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(prog);
      gl.deleteProgram(prog);
      throw new Error('GLSL link error: ' + info);
    }
    return prog;
  }

  function createColorTexture(gl, width, height) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  }

  function createFbo(gl, tex) {
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return fbo;
  }

  /**
   * Draw dynamic planar studio environment on offscreen 2D Canvas:
   * - 蓝色板 (Architectural blue panel)
   * - 暖色球 (Warm studio sphere)
   * - 白色灯条 (Overhead white softbox light strips)
   */
  function paintEnvironmentCanvas(ctx, size, timeSec, tiltXDeg, tiltYDeg) {
    // Deep studio base
    ctx.fillStyle = '#0c121c';
    ctx.fillRect(0, 0, size, size);

    const driftX = Math.sin(timeSec * 0.55) * 14 + tiltYDeg * 1.4;
    const driftY = Math.cos(timeSec * 0.42) * 12 + tiltXDeg * 1.4;

    // 1. 蓝色板 (Tilted studio blue diffuser panel)
    ctx.save();
    ctx.translate(size * 0.32 + driftX * 0.7, size * 0.54 + driftY * 0.6);
    ctx.rotate(-0.24 + Math.sin(timeSec * 0.3) * 0.05);
    const blueGrad = ctx.createLinearGradient(-75, -90, 75, 90);
    blueGrad.addColorStop(0, '#1e56c8');
    blueGrad.addColorStop(0.55, '#3b82f6');
    blueGrad.addColorStop(1, '#173679');
    ctx.fillStyle = blueGrad;
    ctx.fillRect(-76, -92, 152, 184);
    ctx.restore();

    // 2. 暖色球 (Warm glowing studio sphere)
    const orbX = size * 0.7 + Math.cos(timeSec * 0.68) * 22 - driftX * 0.5;
    const orbY = size * 0.36 + Math.sin(timeSec * 0.58) * 18 - driftY * 0.5;
    const orbRadius = size * 0.27;
    const warmGrad = ctx.createRadialGradient(orbX, orbY, 4, orbX, orbY, orbRadius);
    warmGrad.addColorStop(0, '#fff3d6');
    warmGrad.addColorStop(0.38, '#fb923c');
    warmGrad.addColorStop(0.75, '#c2410c');
    warmGrad.addColorStop(1, 'rgba(194, 65, 12, 0)');
    ctx.fillStyle = warmGrad;
    ctx.beginPath();
    ctx.arc(orbX, orbY, orbRadius, 0, Math.PI * 2);
    ctx.fill();

    // 3. 白色灯条 (Crisp studio white softbox light strips)
    ctx.save();
    ctx.translate(size * 0.5 + driftX * 0.9, size * 0.48 + driftY * 0.9);
    ctx.rotate(-0.52);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-size * 0.75, -52, size * 1.5, 22);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.fillRect(-size * 0.75, 26, size * 1.5, 13);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fillRect(-size * 0.75, 78, size * 1.5, 8);
    ctx.restore();
  }

  function mountReflectivePass(cardEl) {
    if (!cardEl || cardEl.__atlasPassInstance) return cardEl && cardEl.__atlasPassInstance;

    const canvas = cardEl.querySelector('[data-pass-canvas]');
    if (!canvas) return null;

    // Spring state (stiffness = 120, damping = 16, target ±12°)
    let rx = 0;
    let ry = 0;
    let vx = 0;
    let vy = 0;
    let targetRx = 0;
    let targetRy = 0;
    let isHovered = false;

    let rafId = 0;
    let destroyed = false;
    let isVisible = true;
    let lastTime = performance.now();
    const startTime = lastTime;

    // Cached canvas backing dimensions (per-frame DPR/size check, resize only on change)
    let curWidth = 0;
    let curHeight = 0;
    let curCssW = 320;
    let curCssH = 500;

    // Pointer interaction handlers
    function onPointerMove(e) {
      const rect = cardEl.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
      const ny = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height) * 2 - 1));
      targetRy = nx * MAX_TILT_DEG;
      targetRx = -ny * MAX_TILT_DEG;
      isHovered = true;
    }

    function onPointerLeave() {
      targetRx = 0;
      targetRy = 0;
      isHovered = false;
    }

    cardEl.addEventListener('pointermove', onPointerMove, { passive: true });
    cardEl.addEventListener('pointerleave', onPointerLeave, { passive: true });
    cardEl.addEventListener('pointercancel', onPointerLeave, { passive: true });

    // Attempt WebGL2 initialization (with graceful non-WebGL2 fallback)
    let gl = null;
    try {
      gl = canvas.getContext('webgl2', {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        powerPreference: 'high-performance'
      });
    } catch (_) {
      gl = null;
    }

    let glResources = null;
    let envCanvas = null;
    let envCtx = null;

    if (gl) {
      try {
        envCanvas = document.createElement('canvas');
        envCanvas.width = ENV_SIZE;
        envCanvas.height = ENV_SIZE;
        envCtx = envCanvas.getContext('2d', { willReadFrequently: false });

        const blurProg = createProgram(gl, FULLSCREEN_VERT, BLUR_FRAG);
        const metalProg = createProgram(gl, FULLSCREEN_VERT, METAL_FRAG);
        const emptyVao = gl.createVertexArray();

        const texEnv = createColorTexture(gl, ENV_SIZE, ENV_SIZE);
        const texBlurH = createColorTexture(gl, ENV_SIZE, ENV_SIZE);
        const texBlurV = createColorTexture(gl, ENV_SIZE, ENV_SIZE);
        const fboBlurH = createFbo(gl, texBlurH);
        const fboBlurV = createFbo(gl, texBlurV);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        glResources = {
          blurProg,
          metalProg,
          emptyVao,
          texEnv,
          texBlurH,
          texBlurV,
          fboBlurH,
          fboBlurV,
          blurLocs: {
            tex: gl.getUniformLocation(blurProg, 'u_tex'),
            dir: gl.getUniformLocation(blurProg, 'u_dir')
          },
          metalLocs: {
            envBlur: gl.getUniformLocation(metalProg, 'u_envBlur'),
            resolution: gl.getUniformLocation(metalProg, 'u_resolution'),
            cardSize: gl.getUniformLocation(metalProg, 'u_cardSize'),
            tilt: gl.getUniformLocation(metalProg, 'u_tilt'),
            time: gl.getUniformLocation(metalProg, 'u_time')
          }
        };
      } catch (err) {
        console.warn('AtlasReflectivePass: WebGL2 shader setup failed, using CSS fallback.', err);
        gl = null;
      }
    }

    if (!gl) {
      cardEl.classList.add('is-webgl-fallback');
    }

    // Viewport observer to pause rendering when scrolled completely off-screen
    let intersectionObs = null;
    if ('IntersectionObserver' in window) {
      intersectionObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const wasVisible = isVisible;
            isVisible = entry.isIntersecting;
            if (isVisible && !wasVisible && !destroyed) {
              lastTime = performance.now();
              rafId = window.requestAnimationFrame(frame);
            }
          });
        },
        { threshold: 0.02 }
      );
      intersectionObs.observe(cardEl);
    }

    // DOM unmount observer so removing cardEl automatically cleans up GPU memory
    let mutationObs = null;
    if ('MutationObserver' in window && cardEl.parentNode) {
      mutationObs = new MutationObserver(() => {
        if (!document.body.contains(cardEl)) {
          destroy();
        }
      });
      mutationObs.observe(document.body, { childList: true, subtree: true });
    }

    function syncSizeIfNeeded() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const cssW = canvas.clientWidth || 320;
      const cssH = canvas.clientHeight || 500;
      const nextW = Math.max(1, Math.round(cssW * dpr));
      const nextH = Math.max(1, Math.round(cssH * dpr));
      if (nextW !== curWidth || nextH !== curHeight) {
        curWidth = nextW;
        curHeight = nextH;
        curCssW = cssW;
        curCssH = cssH;
        canvas.width = nextW;
        canvas.height = nextH;
      }
    }

    function frame(now) {
      if (destroyed || !isVisible) return;

      const dt = Math.min(Math.max((now - lastTime) / 1000, 0.001), 0.032);
      lastTime = now;
      const elapsed = (now - startTime) / 1000;

      // 1. Per-frame DPR & size check (only reallocates canvas buffer on actual change)
      syncSizeIfNeeded();

      // 2. Spring 120/16 integration toward target ±12° (or 0° when pointer leaves)
      const ax = -STIFFNESS * (rx - targetRx) - DAMPING * vx;
      const ay = -STIFFNESS * (ry - targetRy) - DAMPING * vy;
      vx += ax * dt;
      vy += ay * dt;
      rx += vx * dt;
      ry += vy * dt;

      if (!isHovered && Math.abs(rx) < 0.002 && Math.abs(ry) < 0.002 && Math.abs(vx) < 0.002 && Math.abs(vy) < 0.002) {
        rx = 0;
        ry = 0;
        vx = 0;
        vy = 0;
      }

      // 3. Synchronize CSS 3D transform & specular border variables with exact spring angle
      cardEl.style.transform = `perspective(980px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`;
      cardEl.style.setProperty('--pass-rx', `${rx.toFixed(2)}deg`);
      cardEl.style.setProperty('--pass-ry', `${ry.toFixed(2)}deg`);
      cardEl.style.setProperty('--pass-sheen-x', `${(50 + (ry / MAX_TILT_DEG) * 36).toFixed(1)}%`);
      cardEl.style.setProperty('--pass-sheen-y', `${(50 - (rx / MAX_TILT_DEG) * 36).toFixed(1)}%`);

      // 4. WebGL2 Multi-Pass Rendering: Canvas Upload -> H-Blur -> V-Blur -> Planar Metal Reflection
      if (gl && glResources && envCtx) {
        paintEnvironmentCanvas(envCtx, ENV_SIZE, elapsed, rx, ry);

        gl.bindVertexArray(glResources.emptyVao);

        // Upload updated 2D Canvas environment texture per-frame
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, glResources.texEnv);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, envCanvas);

        // Pass 1: Horizontal Gaussian Blur -> fboBlurH
        gl.bindFramebuffer(gl.FRAMEBUFFER, glResources.fboBlurH);
        gl.viewport(0, 0, ENV_SIZE, ENV_SIZE);
        gl.useProgram(glResources.blurProg);
        gl.uniform1i(glResources.blurLocs.tex, 0);
        gl.uniform2f(glResources.blurLocs.dir, 1.0 / ENV_SIZE, 0.0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // Pass 2: Vertical Gaussian Blur -> fboBlurV
        gl.bindFramebuffer(gl.FRAMEBUFFER, glResources.fboBlurV);
        gl.bindTexture(gl.TEXTURE_2D, glResources.texBlurH);
        gl.uniform2f(glResources.blurLocs.dir, 0.0, 1.0 / ENV_SIZE);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // Pass 3: Main Planar Reflection Metal Surface -> Screen
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, curWidth, curHeight);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(glResources.metalProg);
        gl.bindTexture(gl.TEXTURE_2D, glResources.texBlurV);
        gl.uniform1i(glResources.metalLocs.envBlur, 0);
        gl.uniform2f(glResources.metalLocs.resolution, curWidth, curHeight);
        gl.uniform2f(glResources.metalLocs.cardSize, curCssW, curCssH);
        gl.uniform2f(
          glResources.metalLocs.tilt,
          (rx * Math.PI) / 180,
          (ry * Math.PI) / 180
        );
        gl.uniform1f(glResources.metalLocs.time, elapsed);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        gl.bindVertexArray(null);
      }

      rafId = window.requestAnimationFrame(frame);
    }

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      cardEl.removeEventListener('pointermove', onPointerMove);
      cardEl.removeEventListener('pointerleave', onPointerLeave);
      cardEl.removeEventListener('pointercancel', onPointerLeave);
      if (intersectionObs) intersectionObs.disconnect();
      if (mutationObs) mutationObs.disconnect();

      if (gl && glResources) {
        gl.deleteTexture(glResources.texEnv);
        gl.deleteTexture(glResources.texBlurH);
        gl.deleteTexture(glResources.texBlurV);
        gl.deleteFramebuffer(glResources.fboBlurH);
        gl.deleteFramebuffer(glResources.fboBlurV);
        gl.deleteVertexArray(glResources.emptyVao);
        gl.deleteProgram(glResources.blurProg);
        gl.deleteProgram(glResources.metalProg);
        glResources = null;
      }
      delete cardEl.__atlasPassInstance;
    }

    window.addEventListener('pagehide', destroy, { once: true });

    const instance = { destroy, cardEl };
    cardEl.__atlasPassInstance = instance;
    instances.add(instance);
    rafId = window.requestAnimationFrame(frame);
    return instance;
  }

  const instances = new Set();

  function syncPassContextTelemetry() {
    if (!window.AtlasOS) return;
    const state = window.AtlasOS.getState();
    const statusNodes = document.querySelectorAll('[data-pass-live-telemetry]');
    statusNodes.forEach((el) => {
      el.textContent = `MEM ${String(state.summary.total_memories).padStart(2, '0')} · TASK ${String(
        state.summary.active_tasks
      ).padStart(2, '0')}`;
    });
  }

  function initAllPasses() {
    document.querySelectorAll('[data-atlas-reflective-pass]').forEach((el) => {
      mountReflectivePass(el);
    });
    syncPassContextTelemetry();
    if (window.AtlasOS && typeof window.AtlasOS.subscribe === 'function') {
      window.AtlasOS.subscribe(syncPassContextTelemetry);
    }
  }

  window.AtlasReflectivePass = {
    mount: mountReflectivePass,
    initAll: initAllPasses,
    destroyAll() {
      instances.forEach((inst) => inst.destroy());
      instances.clear();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllPasses);
  } else {
    initAllPasses();
  }
})(window, document);
