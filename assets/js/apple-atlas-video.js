(() => {
    const video = document.querySelector('[data-apple-atlas-video]');

    if (!(video instanceof HTMLVideoElement)) {
        return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const section = video.closest('.apple-atlas-showcase');
    let scrollObserver;

    const setupScrollReveal = () => {
        if (!section || reducedMotion.matches || !('IntersectionObserver' in window) || scrollObserver) {
            return;
        }

        section.classList.add('apple-atlas-showcase--scroll-ready');
        scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                section.classList.toggle('is-in-view', entry.isIntersecting);
                if (entry.isIntersecting && !video.ended) {
                    void startVideo();
                } else if (!entry.isIntersecting && !video.ended) {
                    video.pause();
                }
            });
        }, { threshold: 0.12 });
        scrollObserver.observe(section);
    };

    const clearScrollReveal = () => {
        scrollObserver?.disconnect();
        scrollObserver = undefined;
        section?.classList.remove('apple-atlas-showcase--scroll-ready', 'is-in-view');
    };

    const startVideo = async () => {
        if (reducedMotion.matches) {
            video.pause();
            return;
        }

        try {
            await video.play();
        } catch (error) {
            if (error instanceof DOMException && error.name === 'NotAllowedError') {
                console.warn('ATLAS showcase autoplay was blocked; the poster remains visible.');
                return;
            }

            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }

            console.error('ATLAS showcase video could not start playback.', error);
        }
    };

    video.addEventListener('error', () => {
        const mediaError = video.error;
        console.error('ATLAS showcase video failed to load.', {
            code: mediaError?.code,
            message: mediaError?.message
        });
    });

    reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches) {
            video.pause();
            clearScrollReveal();
        } else if (!video.ended) {
            setupScrollReveal();
            if (!section || !('IntersectionObserver' in window)) {
                void startVideo();
            }
        }
    });

    if (section && 'IntersectionObserver' in window) {
        setupScrollReveal();
    } else {
        void startVideo();
    }
})();
