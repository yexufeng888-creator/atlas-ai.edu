(() => {
    'use strict';

    const root = document.querySelector('[data-chip-story]');
    if (!(root instanceof HTMLElement)) return;

    const stage = root.querySelector('[data-chip-stage]');
    const chapters = [...root.querySelectorAll('[data-chip-chapter]')];
    const visuals = [...root.querySelectorAll('[data-chip-visual]')];
    const navigation = [...root.querySelectorAll('button[data-chip-go]')];
    const current = root.querySelector('[data-chip-current]');
    const activeName = root.querySelector('[data-chip-active-name]');

    if (
        !(stage instanceof HTMLElement) ||
        chapters.length < 2 ||
        visuals.length !== chapters.length ||
        navigation.length !== chapters.length ||
        !chapters.every((chapter) => chapter instanceof HTMLElement && chapter.dataset.chipId && chapter.dataset.chipLabel) ||
        !visuals.every((visual) => visual instanceof HTMLElement && visual.dataset.chipVisual) ||
        !navigation.every((button) => button instanceof HTMLButtonElement) ||
        !(current instanceof HTMLElement) ||
        !(activeName instanceof HTMLElement)
    ) {
        console.error('Chip scroll story markup is incomplete.');
        return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activeIndex = -1;
    let updateFrame = 0;

    const setActiveChapter = (index) => {
        if (!Number.isInteger(index) || index < 0 || index >= chapters.length || index === activeIndex) return;

        const chapter = chapters[index];
        const chipId = chapter.dataset.chipId;
        const chipLabel = chapter.dataset.chipLabel;
        if (!chipId || !chipLabel) {
            console.error('Chip scroll story chapter is missing its chip label.');
            return;
        }

        activeIndex = index;
        stage.dataset.activeChip = chipId;
        activeName.textContent = chipLabel;
        current.textContent = String(index + 1).padStart(2, '0');

        chapters.forEach((item, itemIndex) => {
            item.classList.toggle('is-active', itemIndex === index);
        });
        visuals.forEach((visual) => {
            visual.classList.toggle('is-active', visual.dataset.chipVisual === chipId);
        });
        navigation.forEach((button, buttonIndex) => {
            button.setAttribute('aria-pressed', String(buttonIndex === index));
        });
    };

    const findChapterAtViewportCenter = () => {
        const center = window.innerHeight * 0.5;
        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;

        chapters.forEach((chapter, index) => {
            const rect = chapter.getBoundingClientRect();
            const distance = Math.abs(rect.top + rect.height * 0.5 - center);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = index;
            }
        });

        return nearestIndex;
    };

    const schedulePositionUpdate = () => {
        if (updateFrame) cancelAnimationFrame(updateFrame);
        updateFrame = requestAnimationFrame(() => {
            updateFrame = 0;
            setActiveChapter(findChapterAtViewportCenter());
        });
    };

    navigation.forEach((button, index) => {
        button.addEventListener('click', () => {
            chapters[index].scrollIntoView({
                behavior: reducedMotion.matches ? 'instant' : 'smooth',
                block: 'center'
            });
            setActiveChapter(index);
        });
    });

    window.addEventListener('scroll', schedulePositionUpdate, { passive: true });
    window.addEventListener('resize', schedulePositionUpdate, { passive: true });
    setActiveChapter(findChapterAtViewportCenter());
    schedulePositionUpdate();
})();
