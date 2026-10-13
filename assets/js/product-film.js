(() => {
  const dialog = document.querySelector('[data-product-film]');
  const opener = document.querySelector('[data-open-product-film]');

  if (!(dialog instanceof HTMLDialogElement) || !(opener instanceof HTMLButtonElement)) {
    return;
  }

  const scenes = [...dialog.querySelectorAll('[data-film-scene]')];
  const progressButtons = [...dialog.querySelectorAll('[data-film-go]')];
  const closeButton = dialog.querySelector('[data-film-close]');
  const toggleButton = dialog.querySelector('[data-film-toggle]');
  const timeLabel = dialog.querySelector('[data-film-time]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 5500;
  let activeScene = 0;
  let timer;
  let isPlaying = !reducedMotion.matches;

  if (scenes.length !== progressButtons.length || scenes.length === 0 ||
      !(closeButton instanceof HTMLButtonElement) ||
      !(toggleButton instanceof HTMLButtonElement) ||
      !(timeLabel instanceof HTMLElement)) {
    return;
  }

  const stopTimer = () => {
    window.clearInterval(timer);
    timer = undefined;
  };

  const updatePlaybackControl = () => {
    toggleButton.textContent = isPlaying ? '暂停' : '继续';
    toggleButton.removeAttribute('aria-pressed');
    dialog.classList.toggle('is-paused', !isPlaying);
  };

  const showScene = (index) => {
    activeScene = (index + scenes.length) % scenes.length;
    scenes.forEach((scene, sceneIndex) => {
      scene.classList.toggle('is-active', sceneIndex === activeScene);
      scene.setAttribute('aria-hidden', String(sceneIndex !== activeScene));
    });
    progressButtons.forEach((button, buttonIndex) => {
      button.classList.toggle('is-active', buttonIndex === activeScene);
      button.classList.toggle('is-complete', buttonIndex < activeScene);
      if (buttonIndex === activeScene) {
        button.setAttribute('aria-current', 'step');
      } else {
        button.removeAttribute('aria-current');
      }
    });
    timeLabel.textContent = `${String(activeScene + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`;
  };

  const startTimer = () => {
    stopTimer();
    if (isPlaying && dialog.open) {
      timer = window.setInterval(() => {
        if (activeScene === scenes.length - 1) {
          isPlaying = false;
          updatePlaybackControl();
          stopTimer();
          return;
        }
        showScene(activeScene + 1);
      }, duration);
    }
  };

  opener.addEventListener('click', () => {
    isPlaying = !reducedMotion.matches;
    showScene(0);
    updatePlaybackControl();
    dialog.showModal();
    startTimer();
    closeButton.focus();
  });

  closeButton.addEventListener('click', () => dialog.close());

  dialog.addEventListener('close', () => {
    stopTimer();
    opener.focus();
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  toggleButton.addEventListener('click', () => {
    isPlaying = !isPlaying;
    updatePlaybackControl();
    startTimer();
  });

  progressButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      showScene(index);
      startTimer();
    });
  });

  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      isPlaying = false;
      updatePlaybackControl();
      stopTimer();
    }
  });

  showScene(0);
  updatePlaybackControl();
})();
