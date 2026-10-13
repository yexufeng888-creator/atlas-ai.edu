(() => {
  const stage = document.querySelector('[data-phone-stage]');
  const viewer = stage?.querySelector('[data-phone-model]');

  if (!(stage instanceof HTMLElement) || !(viewer instanceof HTMLElement)) {
    return;
  }

  const modelSource = viewer.dataset.modelSrc;
  const hint = stage.querySelector('[data-phone-hint]');
  const modelViewerRuntime = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@4.1.0/dist/model-viewer.min.js';
  const modelViewerIntegrity = 'sha384-T4vc5AP9W2o3EVVQC6Is5mbKqFE2eysxg1XHwaZLquK0SjtY+4cLHoN3j1mK/MmB';
  let isInView = false;
  let isLoadingRuntime = false;
  let texturePromise;

  const applyScreenTexture = () => {
    if (texturePromise) return texturePromise;

    texturePromise = (async () => {
      const model = viewer.model;
      if (!model) {
        throw new Error('The iPhone model scene is not ready.');
      }

      const screenMaterial = model.materials.find((material) => material.name === 'COLOUR_Cherry_Screen');
      if (!screenMaterial?.emissiveTexture) {
        throw new Error('The iPhone model does not expose its screen material.');
      }

      const screenTexture = await viewer.createTexture('assets/img/atlas-iphone-screen.jpg');
      screenMaterial.emissiveTexture.setTexture(screenTexture);
      stage.classList.add('is-model-ready');
      if (hint) hint.textContent = '可拖动旋转查看 · ATLAS 工作台已显示';
    })();

    return texturePromise;
  };

  const loadModelViewer = () => {
    if (!modelSource || viewer.hasAttribute('src') || document.hidden) return;

    if (customElements.get('model-viewer')) {
      viewer.setAttribute('src', modelSource);
      return;
    }

    if (isLoadingRuntime) return;
    isLoadingRuntime = true;

    const script = document.createElement('script');
    script.type = 'module';
    script.src = modelViewerRuntime;
    script.integrity = modelViewerIntegrity;
    script.crossOrigin = 'anonymous';
    script.addEventListener('load', () => {
      customElements.whenDefined('model-viewer').then(() => {
        isLoadingRuntime = false;
        if (isInView && !document.hidden && !viewer.hasAttribute('src')) {
          viewer.setAttribute('src', modelSource);
        }
      });
    }, { once: true });
    script.addEventListener('error', (event) => {
      isLoadingRuntime = false;
      console.error('Could not load the 3D viewer; keeping the phone screen preview.', event);
      if (hint) hint.textContent = '3D 模型暂不可用 · 当前显示 ATLAS 手机预览';
    }, { once: true });
    document.head.appendChild(script);
  };

  viewer.addEventListener('load', () => {
    applyScreenTexture().catch((error) => {
      stage.classList.remove('is-model-ready');
      console.error('Could not apply the ATLAS screen to the iPhone model.', error);
      if (hint) hint.textContent = 'ATLAS 手机预览图';
    });
  });

  viewer.addEventListener('error', (event) => {
    stage.classList.remove('is-model-ready');
    console.error('Could not load the iPhone 3D model.', event);
    if (hint) hint.textContent = '3D 模型暂不可用 · 当前显示 ATLAS 手机预览';
  });

  new IntersectionObserver(([entry]) => {
    isInView = entry.isIntersecting;
    if (isInView) loadModelViewer();
  }).observe(stage);

  document.addEventListener('visibilitychange', () => {
    if (isInView && !document.hidden) loadModelViewer();
  });
})();
