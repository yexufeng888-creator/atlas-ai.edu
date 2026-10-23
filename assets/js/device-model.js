(function (window, document) {
  'use strict';

  const stage = document.querySelector('[data-phone-stage]');
  const viewer = stage?.querySelector('[data-phone-model]');

  if (!(stage instanceof HTMLElement) || !(viewer instanceof HTMLElement)) {
    return;
  }

  const models = {
    duo: {
      id: 'duo',
      label: 'iPhone Duo',
      src: 'assets/models/apple-iphone-duo-fold-star-white.glb',
      animationName: 'open-close',
      alt: '星白色 iPhone Duo 折叠屏手机的三维模型，内外屏展示 ATLAS 界面',
      cameraOrbit: '0deg 75deg 145%',
      fieldOfView: '32deg',
      kicker: 'ATLAS ON IPHONE DUO',
      headlineFirst: '合上轻装，',
      headlineSecond: '展开从容。',
      description: '合上时快速查看，展开后处理复杂任务。播放折叠演示，看看 ATLAS 如何适应两种屏幕状态。',
      readyHint: '可拖动旋转查看 · 点击播放折叠演示',
      loadErrorHint: '3D 模型暂不可用 · 当前显示 Duo 屏幕预览'
    },
    'iphone-18-pro-max': {
      id: 'iphone-18-pro-max',
      label: 'iPhone 18 Pro Max',
      src: 'assets/models/atlas-iphone-18-pro-max-burgundy.glb',
      screenMaterialName: 'COLOUR_Cherry_Screen',
      screenTexture: 'assets/img/atlas-iphone-screen.jpg',
      alt: '酒红色 iPhone 18 Pro Max 屏幕显示 ATLAS 移动工作台的三维模型',
      cameraOrbit: '0deg 75deg 115%',
      fieldOfView: '28deg',
      kicker: 'ATLAS ON IPHONE 18 PRO MAX',
      headlineFirst: '重要的事，',
      headlineSecond: '随时在手边。',
      description: '熟悉的直板体验，今日重点、日程和记忆清晰呈现。拖动模型，查看 ATLAS 移动工作台。',
      readyHint: '可拖动旋转查看 · ATLAS 工作台已显示',
      textureErrorHint: 'ATLAS 屏幕贴图暂不可用 · 仍可旋转查看'
    }
  };

  const modelButtons = Array.from(stage.querySelectorAll('[data-phone-choice]'));
  const fallbackViews = Array.from(stage.querySelectorAll('[data-phone-fallback]'));
  const kicker = stage.querySelector('[data-phone-kicker]');
  const headlineFirst = stage.querySelector('[data-phone-headline-first]');
  const headlineSecond = stage.querySelector('[data-phone-headline-second]');
  const description = stage.querySelector('[data-phone-description]');
  const hint = stage.querySelector('[data-phone-hint]');
  const toggle = stage.querySelector('[data-phone-animation-toggle]');
  const modelViewerRuntime = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@4.1.0/dist/model-viewer.min.js';
  const modelViewerIntegrity = 'sha384-T4vc5AP9W2o3EVVQC6Is5mbKqFE2eysxg1XHwaZLquK0SjtY+4cLHoN3j1mK/MmB';
  let activeModel = models[viewer.dataset.modelKind];
  let selectionVersion = 0;
  let isInView = false;
  let isLoadingRuntime = false;
  let hasFoldAnimation = false;
  let isAnimationPlaying = false;

  if (!activeModel || !modelButtons.length || !toggle) {
    console.error('The iPhone model selector markup is incomplete.');
    return;
  }

  function setToggleState(isPlaying) {
    isAnimationPlaying = isPlaying;
    toggle.setAttribute('aria-pressed', String(isPlaying));
    toggle.textContent = isPlaying
      ? toggle.dataset.pauseLabel
      : toggle.dataset.playLabel;
  }

  function updateModelCopy() {
    if (kicker) kicker.textContent = activeModel.kicker;
    if (headlineFirst) headlineFirst.textContent = activeModel.headlineFirst;
    if (headlineSecond) headlineSecond.textContent = activeModel.headlineSecond;
    if (description) description.textContent = activeModel.description;

    modelButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.phoneChoice === activeModel.id));
    });
    fallbackViews.forEach((fallback) => {
      fallback.hidden = fallback.dataset.phoneFallback !== activeModel.id;
    });
  }

  function updateViewerAttributes() {
    viewer.dataset.modelKind = activeModel.id;
    viewer.dataset.modelSrc = activeModel.src;
    viewer.setAttribute('alt', activeModel.alt);
    viewer.setAttribute('camera-orbit', activeModel.cameraOrbit);
    viewer.setAttribute('field-of-view', activeModel.fieldOfView);

    if (activeModel.animationName) {
      viewer.setAttribute('data-animation-name', activeModel.animationName);
    } else {
      viewer.removeAttribute('data-animation-name');
    }
  }

  function isCurrentSelection(model, version) {
    return selectionVersion === version &&
      activeModel === model &&
      viewer.dataset.modelSrc === model.src;
  }

  async function applyScreenTexture(model, version) {
    if (!model.screenMaterialName) return true;

    const scene = viewer.model;
    if (!scene) {
      throw new Error('The iPhone 18 Pro Max model scene is not ready.');
    }

    const screenMaterial = scene.materials.find(
      (material) => material.name === model.screenMaterialName
    );
    if (!screenMaterial?.emissiveTexture) {
      throw new Error('The iPhone 18 Pro Max screen material is unavailable.');
    }

    const screenTexture = await viewer.createTexture(model.screenTexture);
    if (!isCurrentSelection(model, version)) return false;
    screenMaterial.emissiveTexture.setTexture(screenTexture);
    return true;
  }

  function setModelReady(model, message = model.readyHint) {
    stage.classList.add('is-model-ready');
    hasFoldAnimation = Boolean(
      model.animationName &&
      Array.from(viewer.availableAnimations || []).includes(model.animationName)
    );

    if (hasFoldAnimation) {
      viewer.animationName = model.animationName;
      viewer.pause();
      viewer.currentTime = 0;
      toggle.hidden = false;
      toggle.disabled = false;
      setToggleState(false);
    } else {
      toggle.hidden = true;
      toggle.disabled = true;
      setToggleState(false);
    }

    if (hint) hint.textContent = message;
  }

  async function handleModelLoad() {
    const model = activeModel;
    const version = selectionVersion;
    if (viewer.getAttribute('src') !== model.src) return;

    try {
      const textureApplied = await applyScreenTexture(model, version);
      if (!textureApplied || !isCurrentSelection(model, version)) return;
      setModelReady(model);
    } catch (error) {
      if (!isCurrentSelection(model, version)) return;
      console.error(`Could not apply the ${model.label} screen preview.`, error);
      setModelReady(model, model.textureErrorHint || model.loadErrorHint);
    }
  }

  function selectModel(modelId) {
    const nextModel = models[modelId];
    if (!nextModel || nextModel === activeModel) return;

    activeModel = nextModel;
    selectionVersion += 1;
    stage.classList.remove('is-model-ready');
    hasFoldAnimation = false;
    setToggleState(false);
    updateModelCopy();
    updateViewerAttributes();

    toggle.hidden = !activeModel.animationName;
    toggle.disabled = true;
    toggle.textContent = activeModel.animationName
      ? toggle.dataset.loadingLabel
      : toggle.dataset.unavailableLabel;
    if (hint) hint.textContent = `正在加载 ${activeModel.label} 三维模型…`;

    if (customElements.get('model-viewer')) {
      if (typeof viewer.pause === 'function') viewer.pause();
      viewer.setAttribute('src', activeModel.src);
    } else if (isInView) {
      loadModelViewer();
    }
  }

  function loadModelViewer() {
    if (!activeModel.src || !isInView || document.hidden) return;

    if (customElements.get('model-viewer')) {
      if (viewer.getAttribute('src') !== activeModel.src) {
        viewer.setAttribute('src', activeModel.src);
      }
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
        if (isInView && !document.hidden) {
          viewer.setAttribute('src', activeModel.src);
        }
      });
    }, { once: true });
    script.addEventListener('error', (event) => {
      isLoadingRuntime = false;
      hasFoldAnimation = false;
      toggle.disabled = true;
      toggle.textContent = toggle.dataset.unavailableLabel;
      console.error('Could not load the 3D viewer; keeping the static phone preview.', event);
      if (hint) hint.textContent = `${activeModel.label} 3D 模型暂不可用 · 当前显示静态预览`;
    }, { once: true });
    document.head.appendChild(script);
  }

  updateModelCopy();
  updateViewerAttributes();
  toggle.hidden = !activeModel.animationName;
  toggle.disabled = true;
  toggle.setAttribute('aria-pressed', 'false');
  toggle.textContent = activeModel.animationName
    ? toggle.dataset.loadingLabel
    : toggle.dataset.unavailableLabel;

  modelButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectModel(button.dataset.phoneChoice);
    });
  });

  viewer.addEventListener('load', handleModelLoad);
  viewer.addEventListener('error', (event) => {
    stage.classList.remove('is-model-ready');
    hasFoldAnimation = false;
    toggle.disabled = true;
    toggle.textContent = toggle.dataset.unavailableLabel;
    console.error(`Could not load the ${activeModel.label} 3D model.`, event);
    if (hint) hint.textContent = `${activeModel.label} 3D 模型暂不可用 · 当前显示静态预览`;
  });
  viewer.addEventListener('finished', () => {
    if (isAnimationPlaying) setToggleState(false);
  });

  toggle.addEventListener('click', () => {
    if (!hasFoldAnimation) return;

    if (isAnimationPlaying) {
      viewer.pause();
      setToggleState(false);
      return;
    }

    viewer.currentTime = 0;
    viewer.animationName = activeModel.animationName;
    viewer.play({ repetitions: 1, pingpong: true });
    setToggleState(true);
  });

  new IntersectionObserver(([entry]) => {
    isInView = entry.isIntersecting;
    if (isInView) loadModelViewer();
  }).observe(stage);

  document.addEventListener('visibilitychange', () => {
    if (isInView && !document.hidden) loadModelViewer();
  });
})(window, document);
