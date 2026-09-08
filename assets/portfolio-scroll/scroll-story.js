(() => {
  const site = document.querySelector('[data-story-site]');
  if (!site) return;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const range = (value, start, end) => clamp((value - start) / (end - start));
  const smooth = (value) => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };
  const lerp = (from, to, progress) => from + (to - from) * progress;

  const sections = [...site.querySelectorAll('[data-story-section]')];
  const navButtons = [...site.querySelectorAll('[data-story-nav]')];
  const preview = site.querySelector('.story-preview');
  const previewHeading = site.querySelector('.preview-heading');
  const previewStack = site.querySelector('[data-preview-stack]');
  const previewCards = [...site.querySelectorAll('.preview-card')];
  const about = site.querySelector('.story-about');
  const aboutBody = site.querySelector('.story-about-body');
  const aboutMask = site.querySelector('.story-about-mask');
  const aboutMaskImage = aboutMask?.querySelector('img');
  const aboutTitle = site.querySelector('.about-big-title');
  const aboutMeta = site.querySelector('.about-persistent-meta');
  const aboutIntroTip = site.querySelector('.about-intro-tip');
  const aboutEnd = site.querySelector('.story-about-end');
  const works = site.querySelector('.story-works');
  const worksTitle = site.querySelector('.story-works-heading .story-chapter-title');
  const worksCards = [...site.querySelectorAll('.story-work-card')];
  const home = site.querySelector('.story-home');
  const homeScene = site.querySelector('.story-home-scene');
  const homeCard = site.querySelector('.hero-card-stage') || site.querySelector('.story-home-card');
  const homeLogoRail = site.querySelector('.story-logo-rail');
  const previewTip = site.querySelector('.preview-end-tip');
  const aboutTip = site.querySelector('.about-end-tip');
  const footer = site.querySelector('.story-footer');
  const footerWord = site.querySelector('.story-footer-word');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const previewContentWidth = 800;
  const previewContentHeight = 10250;
  const previewStackWidths = [480, 480, 480, 480, 480];

  previewCards.forEach((card, index) => {
    card.style.setProperty('--card-index', index);
    card.style.setProperty('--stack-order', Math.max(0, 4 - index));
    card.style.zIndex = String(previewCards.length - index);
  });

  site.querySelectorAll('[data-split-title]').forEach((title) => {
    const text = title.textContent.trim();
    title.setAttribute('aria-label', text);
    title.textContent = '';
    [...text].forEach((letter, index) => {
      const span = document.createElement('span');
      span.className = 'story-title-letter';
      span.style.setProperty('--letter-index', index);
      span.setAttribute('aria-hidden', 'true');
      span.textContent = letter;
      title.append(span);
    });
    if (title === worksTitle) {
      const mask = document.createElement('span');
      mask.className = 'story-title-mask';
      mask.append(...title.childNodes);
      title.append(mask);
    }
  });

  const loadModule = (module) => {
    if (!module || module.dataset.moduleLoaded === 'true') return;
    module.dataset.moduleLoaded = 'true';
    module.querySelectorAll('img[data-src]').forEach((image, index) => {
      image.loading = (module === preview && index < 5) || (module === about && index === 0) || module === works ? 'eager' : 'lazy';
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
    });
  };

  const enterModule = (module) => {
    if (!module) return;
    loadModule(module);
    requestAnimationFrame(() => module.classList.add('is-entered'));
  };

  if ('IntersectionObserver' in window) {
    const moduleObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (entry.target === preview || entry.target === about || entry.target === works) loadModule(entry.target);
        else enterModule(entry.target);
        moduleObserver.unobserve(entry.target);
      });
    }, { rootMargin: '20% 0px', threshold: 0.01 });

    site.querySelectorAll('[data-lazy-module]').forEach((module) => moduleObserver.observe(module));

    const titleObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-entered');
        titleObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    if (footer) titleObserver.observe(footer);
  } else {
    site.querySelectorAll('[data-lazy-module]').forEach((module) => {
      if (module === preview || module === about || module === works) loadModule(module);
      else enterModule(module);
    });
    site.querySelector('.story-footer')?.classList.add('is-entered');
  }

  const readSectionMetrics = (section) => {
    const rect = section.getBoundingClientRect();
    const start = rect.top + window.scrollY;
    return { start, height: rect.height, end: start + rect.height };
  };

  let metrics = new Map();
  let previewScale = 1;
  let previewIntroState = 'idle';
  let previewLayoutAnchor = 0;
  let previewIntroTimer = 0;
  let previewTiltResetTimer = 0;
  let previousPreviewScrollY = window.scrollY;
  let previewNavigationTimer = 0;
  let previewNavPending = false;
  let aboutNavPending = false;
  let worksNavPending = false;
  let navigationTarget = null;
  let navigationSequence = 0;
  let aboutIntroState = 'idle';
  let aboutIntroTimer = 0;
  let aboutIntroSequence = 0;
  let aboutLayoutAnchor = 0;
  let previewCardMetrics = [];
  let frame = 0;
  let aboutScrollLock = null;

  const fitSplitTitleToWidth = (title, referenceWeight) => {
    if (!title) return;
    const previousVariation = title.style.fontVariationSettings;
    title.style.removeProperty('font-size');
    title.style.fontVariationSettings = `"wght" ${referenceWeight}`;

    const baseSize = Number.parseFloat(getComputedStyle(title).fontSize);
    const renderedWidth = [...title.querySelectorAll('.story-title-letter')].reduce(
      (width, letter) => width + letter.getBoundingClientRect().width,
      0
    );
    if (renderedWidth > 0 && title.clientWidth > 0) {
      title.style.fontSize = `${baseSize * title.clientWidth / renderedWidth}px`;
    }

    if (previousVariation) title.style.fontVariationSettings = previousVariation;
    else title.style.removeProperty('font-variation-settings');
  };
  let aboutEndStart = 0;
  let aboutReturnTimer = 0;
  let aboutReturning = false;
  let aboutReturnPhase = 'idle';
  let aboutReturnProgress = 0;
  let worksIntroState = 'idle';
  let worksIntroTimer = 0;
  let worksTitleTimer = 0;
  let worksCardsTimer = 0;
  let worksIntroSequence = 0;
  let worksLayoutAnchor = 0;
  let worksScrollLock = null;
  let worksReturnTimer = 0;
  let worksReturning = false;
  let previousTouchY = null;

  const releaseAboutScroll = () => {
    if (!aboutScrollLock) return;
    const lock = aboutScrollLock;
    aboutScrollLock = null;
    if (lock.resumeLenis) lock.engine.start();
  };

  const lockAboutScroll = () => {
    const engine = typeof lenis !== 'undefined' ? lenis : null;
    const top = Math.round(metrics.get(about)?.start ?? window.scrollY);
    aboutScrollLock = { top, engine, resumeLenis: Boolean(engine && !engine.isStopped) };
    if (engine) {
      engine.scrollTo(top, { immediate: true, force: true });
      engine.stop();
    } else {
      window.scrollTo({ top, behavior: 'instant' });
    }
  };

  const releaseWorksScroll = () => {
    if (!worksScrollLock) return;
    const lock = worksScrollLock;
    worksScrollLock = null;
    if (lock.resumeLenis) lock.engine.start();
  };

  const lockWorksScroll = () => {
    const engine = typeof lenis !== 'undefined' ? lenis : null;
    const top = Math.round(metrics.get(works)?.start ?? window.scrollY);
    worksScrollLock = { top, engine, resumeLenis: Boolean(engine && !engine.isStopped) };
    if (engine) {
      engine.scrollTo(top, { immediate: true, force: true });
      engine.stop();
    } else {
      window.scrollTo({ top, behavior: 'instant' });
    }
  };

  const preventIntroScroll = (event) => {
    const aboutStart = metrics.get(about)?.start;
    const worksStart = metrics.get(works)?.start;
    const touchY = event.type === 'touchmove' ? event.touches[0].clientY : null;
    const upward = event.type === 'wheel' ? event.deltaY < 0
      : event.type === 'touchmove' ? previousTouchY !== null && touchY > previousTouchY
      : ['ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey);
    const gestureDelta = event.type === 'wheel' ? -event.deltaY
      : event.type === 'touchmove' && previousTouchY !== null ? touchY - previousTouchY
      : event.type === 'keydown' ? (upward ? 80 : -80)
      : 0;
    if (event.type === 'touchmove') previousTouchY = touchY;
    if (aboutReturning && !event.ctrlKey && !event.metaKey) {
      if (event.type === 'keydown' && event.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      event.preventDefault();
      updateAboutReturnGesture(gestureDelta);
      return;
    }
    if (!navigationTarget && !aboutReturning && aboutIntroState === 'ready' && upward && window.scrollY <= aboutStart + 2) {
      event.preventDefault();
      returnToPreview(gestureDelta);
      return;
    }
    if (!navigationTarget && !worksReturning && worksIntroState === 'ready' && upward && window.scrollY <= worksStart + 2) {
      event.preventDefault();
      returnToAbout();
      return;
    }
    if ((!aboutScrollLock && !worksScrollLock) || event.ctrlKey || event.metaKey) return;
    if (event.type === 'keydown') {
      if (event.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) return;
    }
    event.preventDefault();
  };
  window.addEventListener('wheel', preventIntroScroll, { passive: false, capture: true });
  window.addEventListener('touchstart', (event) => { previousTouchY = event.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove', preventIntroScroll, { passive: false, capture: true });
  window.addEventListener('keydown', preventIntroScroll, { capture: true });

  const refreshMetrics = () => {
    const available = Math.max(280, window.innerWidth - (window.innerWidth <= 900 ? 32 : 160));
    previewScale = Math.min(1, available / previewContentWidth);
    const scaledContentHeight = previewContentHeight * previewScale;
    const previewHeight = scaledContentHeight + window.innerHeight * 4.5;
    preview.style.height = `${Math.max(window.innerHeight * 5, previewHeight)}px`;

    previewStack.style.width = `${previewContentWidth * previewScale}px`;
    previewStack.style.height = `${scaledContentHeight}px`;

    const stackCenter = Math.min(220, window.innerHeight * 0.235);
    previewCards.forEach((card, index) => {
      const style = getComputedStyle(card);
      const width = Number.parseFloat(style.getPropertyValue('--card-width')) || 720;
      const height = Number.parseFloat(style.getPropertyValue('--card-height')) || 560;
      const scaledHeight = height * previewScale;
      const stackWidth = previewStackWidths[index] || 480;
      card.style.width = `${width * previewScale}px`;
      card.style.height = `${scaledHeight}px`;
      card.style.setProperty('--stack-start-scale', 720 / width);
      card.style.setProperty('--stack-scale', stackWidth / width);
      card.style.setProperty('--stack-top', `${stackCenter - scaledHeight / 2}px`);
    });

    previewCardMetrics = previewCards.map((card) => {
      const style = getComputedStyle(card);
      return {
        target: Number.parseFloat(style.getPropertyValue('--target-y')) * previewScale,
        top: Number.parseFloat(style.getPropertyValue('--stack-top')),
        scale: Number.parseFloat(style.getPropertyValue('--stack-scale'))
      };
    });
    fitSplitTitleToWidth(previewHeading.querySelector('.story-chapter-title'), 700);

    aboutTitle.style.fontSize = '';
    const aboutTitleSize = Number.parseFloat(getComputedStyle(aboutTitle).fontSize);
    const aboutTitleWidth = [...aboutTitle.children].reduce((sum, letter) => sum + letter.getBoundingClientRect().width, 0);
    if (aboutTitleWidth > aboutTitle.clientWidth) {
      aboutTitle.style.fontSize = `${aboutTitleSize * aboutTitle.clientWidth / aboutTitleWidth}px`;
    }

    const aboutHeading = aboutTitle.closest('.about-heading');
    if (aboutIntroTip && aboutHeading) {
      const titleRect = aboutTitle.getBoundingClientRect();
      const headingRect = aboutHeading.getBoundingClientRect();
      const titleLineHeight = Number.parseFloat(getComputedStyle(aboutTitle).lineHeight);
      const titleLineTop = titleRect.top + Math.max(0, (titleRect.height - titleLineHeight) / 2);
      const tipTop = titleLineTop - headingRect.top - aboutIntroTip.offsetHeight - 48;
      aboutIntroTip.style.top = `${tipTop}px`;
    }

    about.querySelector('.about-heading').style.paddingBottom = `${aboutMeta.offsetHeight}px`;
    about.style.setProperty('--about-hero-end', `${about.querySelector('.story-about-hero').offsetHeight}px`);
    aboutEndStart = aboutEnd.getBoundingClientRect().top + window.scrollY;
    fitSplitTitleToWidth(footerWord, 760);
    metrics = new Map(sections.map((section) => [section, readSectionMetrics(section)]));
    updateStory();
  };

  const setTipVisible = (tip, visible) => {
    if (!tip || tip.classList.contains('is-visible') === visible) return;
    tip.classList.toggle('is-visible', visible);
  };

  const requestStoryUpdate = () => {
    if (frame) return;
    frame = requestAnimationFrame(updateStory);
  };

  const resetPreviewIntro = () => {
    window.clearTimeout(previewIntroTimer);
    window.clearTimeout(previewTiltResetTimer);
    previewStack.style.setProperty('--preview-list-tilt', '0deg');
    previewIntroState = 'idle';
    preview.classList.remove('is-entered', 'is-preview-intro', 'is-preview-ready', 'is-returning-from-about');
    previewCards.forEach((card) => card.style.removeProperty('opacity'));
  };

  const finishPreviewIntro = () => {
    previewIntroState = 'ready';
    previewLayoutAnchor = window.scrollY;
    preview.classList.remove('is-preview-intro');
    preview.classList.add('is-preview-ready');
    requestStoryUpdate();
  };

  const startPreviewIntro = (restart = false) => {
    if (previewIntroState === 'playing' && !restart) return;
    if (previewIntroState === 'ready' && !restart) return;

    loadModule(preview);
    window.clearTimeout(previewIntroTimer);
    preview.classList.remove('is-entered', 'is-preview-intro', 'is-preview-ready', 'is-returning-from-about');
    previewCards.forEach((card) => card.style.removeProperty('opacity'));
    void preview.offsetWidth;

    previewIntroState = 'playing';
    preview.classList.add('is-entered', 'is-preview-intro');

    if (reducedMotion) {
      finishPreviewIntro();
      return;
    }

    previewIntroTimer = window.setTimeout(finishPreviewIntro, 3180);
  };

  const resetAboutIntro = () => {
    releaseAboutScroll();
    window.clearTimeout(aboutReturnTimer);
    aboutReturning = false;
    aboutReturnPhase = 'idle';
    aboutReturnProgress = 0;
    aboutIntroSequence += 1;
    window.clearTimeout(aboutIntroTimer);
    aboutIntroState = 'idle';
    about.classList.remove(
      'is-entered',
      'is-meta-active',
      'is-exiting',
      'is-returning-to-preview',
      'is-return-fading',
      'is-nav-hidden'
    );
    aboutMask?.style.removeProperty('clip-path');
    aboutMask?.style.removeProperty('-webkit-clip-path');
    aboutMaskImage?.style.removeProperty('transform');
    preview.classList.remove('is-returning-from-about');
    setTipVisible(aboutIntroTip, false);
  };

  const startAboutIntro = async (restart = false) => {
    if (aboutIntroState !== 'idle' && !restart) return;
    resetAboutIntro();
    aboutIntroState = 'loading';
    lockAboutScroll();
    const sequence = aboutIntroSequence;
    loadModule(about);
    const image = about.querySelector('.story-about-mask img');
    let imageTimeout;
    await Promise.race([
      image.decode().catch(() => undefined),
      new Promise(resolve => { imageTimeout = window.setTimeout(resolve, 5000); })
    ]);
    window.clearTimeout(imageTimeout);
    if (sequence !== aboutIntroSequence) return;
    // Commit the collapsed mask before starting the automatic entry animation.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (sequence !== aboutIntroSequence) return;
      aboutIntroState = 'playing';
      about.classList.add('is-entered');
      aboutIntroTimer = window.setTimeout(() => {
        aboutIntroState = 'ready';
        aboutLayoutAnchor = aboutScrollLock?.top ?? window.scrollY;
        releaseAboutScroll();
        setTipVisible(aboutIntroTip, true);
        requestStoryUpdate();
      }, reducedMotion ? 0 : 1520);
    }));
  };

  const setAboutReturnProgress = (progress) => {
    aboutReturnProgress = clamp(progress);
    const inset = aboutReturnProgress * 50;
    const maskInset = `inset(${inset}% ${inset}% ${inset}% ${inset}%)`;
    aboutMask?.style.setProperty('clip-path', maskInset);
    aboutMask?.style.setProperty('-webkit-clip-path', maskInset);
    aboutMaskImage?.style.setProperty('transform', `scale(${lerp(1, 0.9, aboutReturnProgress)})`);
  };

  const cancelAboutReturn = () => {
    if (!aboutReturning || aboutReturnPhase !== 'gesture') return;
    aboutReturning = false;
    aboutReturnPhase = 'idle';
    aboutReturnProgress = 0;
    about.classList.remove('is-returning-to-preview', 'is-return-fading');
    aboutMask?.style.removeProperty('clip-path');
    aboutMask?.style.removeProperty('-webkit-clip-path');
    aboutMaskImage?.style.removeProperty('transform');
    setTipVisible(aboutIntroTip, true);
    releaseAboutScroll();
    requestStoryUpdate();
  };

  const showPreviewTail = () => {
      const previewMeasure = metrics.get(preview);
      const target = Math.max(
        previewMeasure?.start ?? 0,
        (previewMeasure?.end ?? window.scrollY) - window.innerHeight * 2.9
      );
      loadModule(preview);
      window.clearTimeout(previewIntroTimer);
      previewIntroState = 'ready';
      previewLayoutAnchor = previewMeasure?.start ?? 0;
      preview.classList.remove('is-entered', 'is-preview-intro', 'is-returning-from-about');
      preview.classList.add('is-preview-ready');
      aboutIntroSequence += 1;
      window.clearTimeout(aboutIntroTimer);
      aboutIntroState = 'idle';
      about.classList.remove('is-entered', 'is-meta-active', 'is-returning-to-preview', 'is-return-fading');
      aboutMask?.style.removeProperty('clip-path');
      aboutMask?.style.removeProperty('-webkit-clip-path');
      aboutMaskImage?.style.removeProperty('transform');

      if (aboutScrollLock) aboutScrollLock.top = target;
      const engine = aboutScrollLock?.engine;
      if (engine) engine.scrollTo(target, { immediate: true, force: true });
      else window.scrollTo({ top: target, behavior: 'instant' });

      void preview.offsetWidth;
      preview.classList.add('is-entered', 'is-returning-from-about');
      aboutReturnPhase = 'preview';
      requestStoryUpdate();

      aboutReturnTimer = window.setTimeout(() => {
        releaseAboutScroll();
        aboutReturning = false;
        aboutReturnPhase = 'idle';
        aboutReturnProgress = 0;
        requestStoryUpdate();
      }, reducedMotion ? 0 : 1200);
  };

  const finishAboutReturn = () => {
    if (!aboutReturning || aboutReturnPhase !== 'gesture') return;
    aboutReturnPhase = 'fading';
    setAboutReturnProgress(1);
    about.classList.add('is-return-fading');
    setTipVisible(aboutIntroTip, false);
    aboutReturnTimer = window.setTimeout(showPreviewTail, reducedMotion ? 0 : 220);
  };

  const updateAboutReturnGesture = (delta) => {
    if (!aboutReturning || aboutReturnPhase !== 'gesture' || !delta) return;
    const gestureDistance = Math.max(360, window.innerHeight * 0.65);
    setAboutReturnProgress(aboutReturnProgress + delta / gestureDistance);
    if (aboutReturnProgress >= 1) finishAboutReturn();
    else if (aboutReturnProgress <= 0 && delta < 0) cancelAboutReturn();
  };

  const returnToPreview = (initialDelta = 80) => {
    if (aboutReturning) return;
    aboutReturning = true;
    aboutReturnPhase = 'gesture';
    aboutReturnProgress = 0;
    lockAboutScroll();
    about.classList.add('is-returning-to-preview');
    aboutTitle.style.fontVariationSettings = '"wght" 700';
    setAboutReturnProgress(0);
    updateAboutReturnGesture(initialDelta);
  };

  const resetWorksIntro = () => {
    window.clearTimeout(worksReturnTimer);
    worksReturning = false;
    works.classList.remove('is-returning');
    releaseWorksScroll();
    worksIntroSequence += 1;
    window.clearTimeout(worksIntroTimer);
    window.clearTimeout(worksTitleTimer);
    window.clearTimeout(worksCardsTimer);
    worksIntroState = 'idle';
    works.classList.remove('is-entered', 'is-cards-entered');
    about.classList.remove('is-exiting', 'is-nav-hidden');
    worksTitle.style.removeProperty('font-variation-settings');
    worksTitle.style.removeProperty('visibility');
  };

  const finishWorksIntro = (sequence) => {
    if (sequence !== worksIntroSequence) return;
    worksIntroState = 'ready';
    worksLayoutAnchor = worksScrollLock?.top ?? window.scrollY;
    releaseWorksScroll();
    requestStoryUpdate();
  };

  const returnToAbout = () => {
    if (worksReturning) return;
    worksReturning = true;
    lockWorksScroll();
    works.classList.add('is-returning');
    worksReturnTimer = window.setTimeout(() => {
      works.classList.remove('is-entered', 'is-cards-entered');
      // Keep both scenes stationary at their shared boundary during the dissolve.
      loadModule(about);
      aboutIntroState = 'ready';
      aboutLayoutAnchor = metrics.get(about)?.start ?? 0;
      about.classList.add('is-entered');
      about.classList.remove('is-exiting', 'is-nav-hidden');
      about.classList.add('is-meta-active');
      setTipVisible(aboutTip, true);
      worksReturnTimer = window.setTimeout(() => {
        const top = Math.max(aboutEndStart, (metrics.get(works)?.start ?? window.scrollY) - 4);
        const engine = worksScrollLock?.engine;
        if (engine) engine.scrollTo(top, { immediate: true, force: true });
        else window.scrollTo({ top, behavior: 'instant' });
        releaseWorksScroll();
        worksIntroState = 'idle';
        worksReturning = false;
        works.classList.remove('is-returning');
        requestStoryUpdate();
      }, reducedMotion ? 0 : 660);
    }, reducedMotion ? 0 : 660);
  };

  const startWorksIntro = (restart = false) => {
    if (worksIntroState !== 'idle' && !restart) return;
    const directNavigation = restart;
    resetWorksIntro();
    worksIntroState = 'playing';
    const sequence = worksIntroSequence;
    loadModule(works);
    lockWorksScroll();
    about.classList.add('is-exiting');
    about.classList.toggle('is-nav-hidden', directNavigation);
    void works.offsetWidth;
    if (reducedMotion) {
      works.classList.add('is-entered', 'is-cards-entered');
      finishWorksIntro(sequence);
      return;
    }

    // Direct navigation skips the overlapping About exit; scroll entry keeps it.
    const headingDelay = directNavigation ? 0 : 660;
    const cardsDelay = directNavigation ? 980 : 1640;
    const finishDelay = directNavigation ? 2340 : 3000;
    worksTitleTimer = window.setTimeout(() => {
      if (sequence !== worksIntroSequence) return;
      works.classList.add('is-entered');
    }, headingDelay);
    worksCardsTimer = window.setTimeout(() => {
      if (sequence !== worksIntroSequence) return;
      works.classList.add('is-cards-entered');
    }, cardsDelay);
    worksIntroTimer = window.setTimeout(() => finishWorksIntro(sequence), finishDelay);
  };

  const updatePreviewTilt = (scrollY, active) => {
    const delta = scrollY - previousPreviewScrollY;
    previousPreviewScrollY = scrollY;

    if (!active || reducedMotion) {
      window.clearTimeout(previewTiltResetTimer);
      previewStack.style.setProperty('--preview-list-tilt', '0deg');
      return;
    }
    if (Math.abs(delta) < 0.5) return;

    // Content moves opposite to scrollY: upward motion tips down, downward motion tips up.
    const angle = clamp(delta * 0.18, -7, 7);
    previewStack.style.setProperty('--preview-list-tilt', `${angle.toFixed(2)}deg`);
    window.clearTimeout(previewTiltResetTimer);
    previewTiltResetTimer = window.setTimeout(() => {
      previewStack.style.setProperty('--preview-list-tilt', '0deg');
    }, 110);
  };

  const updatePreview = (scrollY) => {
    const measure = metrics.get(preview);
    if (!measure) return;
    const scrollRange = Math.max(1, measure.height - window.innerHeight);
    const progress = clamp((scrollY - measure.start) / scrollRange);

    if (scrollY < measure.start - window.innerHeight * 0.3 && previewIntroState === 'ready') {
      resetPreviewIntro();
    } else if (
      scrollY >= measure.start &&
      scrollY < measure.end - window.innerHeight &&
      previewIntroState === 'idle' &&
      !previewNavPending
    ) {
      startPreviewIntro();
    }

    const localAfterIntro = previewIntroState === 'ready'
      ? Math.max(0, scrollY - previewLayoutAnchor)
      : 0;
    const layoutDistance = window.innerHeight * 1.15;
    const layout = reducedMotion ? 1 : smooth(range(localAfterIntro, 0, layoutDistance));
    const listScrollStart = window.innerHeight * 1.02;
    const listScrollEnd = Math.max(
      listScrollStart + 1,
      measure.end - window.innerHeight * 2.9 - previewLayoutAnchor
    );
    const listScroll = range(localAfterIntro, listScrollStart, listScrollEnd);
    const contentHeight = previewContentHeight * previewScale;
    const viewportAllowance = window.innerHeight * (456.19 / 1024);
    const stackOffset = previewStack.offsetTop;
    const travel = Math.max(0, stackOffset + contentHeight - viewportAllowance) * listScroll;

    previewCards.forEach((card, index) => {
      const { target, top: stackTop, scale: stackScale } = previewCardMetrics[index];
      const top = lerp(stackTop, target - travel, layout);
      const scale = lerp(stackScale, 1, layout);
      card.style.top = `${top}px`;
      card.style.transform = `translate3d(-50%, 0, 0) scale(${scale})`;

      if (previewIntroState === 'ready') {
        const revealStart = index < 5
          ? 0
          : ((index - 5) / Math.max(1, previewCards.length - 5)) * 0.38;
        card.style.opacity = index < 5
          ? '1'
          : String(smooth(range(layout, revealStart, revealStart + 0.24)));
      } else if (previewIntroState === 'playing') {
        card.style.removeProperty('opacity');
      }
    });

    const tail = localAfterIntro - listScrollEnd;
    const titleSettle = smooth(range(localAfterIntro, 0, layoutDistance));
    const titleBlack = smooth(range(listScroll, 0.83, 1));
    const titleExit = smooth(range(tail, window.innerHeight * 0.3, window.innerHeight * 1.4));
    const fade = smooth(range(tail, window.innerHeight * 1.05, window.innerHeight * 1.85));
    updatePreviewTilt(
      scrollY,
      previewIntroState === 'ready' && layout > 0.08 && fade < 0.98 && !aboutReturning && !navigationTarget
    );
    const gray = Math.round(lerp(lerp(0, 245, titleSettle), 0, titleBlack));
    const title = previewHeading.querySelector('.story-chapter-title');
    title.style.color = `rgb(${gray}, ${gray}, ${gray})`;
    title.style.fontVariationSettings = `"wght" ${Math.round(lerp(700, 100, titleExit))}`;
    title.style.visibility = titleExit >= 1 ? 'hidden' : 'visible';
    previewHeading.querySelector('.story-chapter-meta').style.opacity = previewIntroState === 'ready' ? String(1 - titleExit) : '';
    previewStack.style.opacity = String(1 - fade);
    setTipVisible(previewTip, listScroll >= 0.995 && titleExit < 1);
  };

  const updateAbout = (scrollY) => {
    if (worksReturning || aboutReturning) return;
    const measure = metrics.get(about);
    if (!measure) return;
    const local = scrollY - measure.start;
    const worksStart = metrics.get(works)?.start ?? measure.end;
    const aboutHold = Math.max(0, Math.min(scrollY - aboutEndStart, worksStart - aboutEndStart));
    aboutBody.style.transform = `translate3d(0, ${aboutHold}px, 0)`;
    const keepMetaDuringExit = worksIntroState === 'playing';
    about.classList.toggle('is-meta-active', local >= -1 && (scrollY < worksStart - 1 || keepMetaDuringExit));
    if (local < -1 && aboutIntroState === 'ready' && !navigationTarget) {
      returnToPreview();
      return;
    }
    if (local < -window.innerHeight * 0.3 && aboutIntroState !== 'idle') resetAboutIntro();
    if (local >= -1 && local < window.innerHeight && aboutIntroState === 'idle' && !aboutNavPending && !navigationTarget) startAboutIntro();
    const afterIntro = aboutIntroState === 'ready' ? Math.max(0, scrollY - aboutLayoutAnchor) : 0;
    const titleExit = smooth(range(afterIntro, window.innerHeight * 0.08, window.innerHeight * 0.72));
    const titleWeight = Math.round(lerp(700, 100, titleExit));
    aboutTitle.style.fontVariationSettings = `"wght" ${titleWeight}`;
    aboutTitle.style.removeProperty('visibility');
    setTipVisible(aboutIntroTip, aboutIntroState === 'ready');
    setTipVisible(aboutTip, aboutIntroState === 'ready' && scrollY >= aboutEndStart - 1 && scrollY < worksStart - 1 && worksIntroState === 'idle');
  };

  const updateWorks = (scrollY) => {
    if (worksReturning) return;
    const measure = metrics.get(works);
    if (!measure) return;
    const local = scrollY - measure.start;
    if (local < -1 && worksIntroState === 'ready' && !navigationTarget) {
      returnToAbout();
      return;
    }
    if (local < -window.innerHeight * 0.3 && worksIntroState !== 'idle') resetWorksIntro();
    if (local >= -1 && local < window.innerHeight && worksIntroState === 'idle' && !worksNavPending && !navigationTarget) startWorksIntro();
    const afterIntro = worksIntroState === 'ready' ? Math.max(0, scrollY - worksLayoutAnchor) : 0;
    const titleExit = smooth(range(afterIntro, 0, 444));
    const titleWeight = Math.round(lerp(760, 100, titleExit));
    worksTitle.style.fontVariationSettings = `"wght" ${titleWeight}`;
    worksTitle.style.removeProperty('visibility');
    if (footerWord) {
      const footerTop = footer.getBoundingClientRect().top + scrollY;
      const pageEnd = document.documentElement.scrollHeight - window.innerHeight;
      const footerStart = Math.min(pageEnd - 1, footerTop - window.innerHeight * 0.9);
      const footerProgress = smooth(range(scrollY, footerStart, pageEnd));
      footerWord.style.fontVariationSettings = `"wght" ${Math.round(lerp(100, 760, footerProgress))}`;
    }
  };

  const updateHome = (scrollY) => {
    const measure = metrics.get(home);
    if (!measure) return;
    const progress = clamp((scrollY - measure.start) / Math.max(1, measure.height));
    const opacity = reducedMotion ? 1 : 1 - smooth(progress);
    homeScene.style.removeProperty('opacity');
    homeCard.style.opacity = String(opacity);
    homeLogoRail.style.opacity = String(opacity);
  };

  const updateNavigation = (scrollY) => {
    const marker = scrollY + window.innerHeight * 0.28;
    let active = sections[0]?.dataset.storySection;
    sections.forEach((section) => {
      const measure = metrics.get(section);
      if (measure && measure.start <= marker) active = section.dataset.storySection;
    });
    const worksStart = metrics.get(works)?.start;
    if (aboutReturning) active = 'about';
    if (worksReturning || (active === 'works' && scrollY < worksStart - 1)) active = 'about';
    navButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.storyNav === active));
  };

  function updateStory() {
    frame = 0;
    // Hold native touch momentum and scrollbar movement as well as Lenis input.
    if (aboutScrollLock && Math.abs(window.scrollY - aboutScrollLock.top) > 0.5) {
      window.scrollTo({ top: aboutScrollLock.top, behavior: 'instant' });
    }
    if (worksScrollLock && Math.abs(window.scrollY - worksScrollLock.top) > 0.5) {
      window.scrollTo({ top: worksScrollLock.top, behavior: 'instant' });
    }
    const scrollY = window.scrollY;
    updateHome(scrollY);
    updatePreview(scrollY);
    updateAbout(scrollY);
    updateWorks(scrollY);
    updateNavigation(scrollY);
  }

  const scrollToSection = (name) => {
    const section = site.querySelector(`[data-story-section="${name}"]`);
    if (!section) return;

    // Navigation is an immediate scene change. Cancel every previous scene's
    // timers and return gesture before moving the document, otherwise its next
    // scroll update can mistake the jump for a reverse-scroll transition.
    resetPreviewIntro();
    resetAboutIntro();
    resetWorksIntro();
    navigationTarget = name;
    const navigationId = ++navigationSequence;
    const top = metrics.get(section)?.start ?? section.offsetTop;
    const storyLenis = typeof lenis !== 'undefined' ? lenis : null;
    let navigationFinished = false;
    const completeNavigation = () => {
      if (navigationFinished || navigationId !== navigationSequence) return;
      navigationFinished = true;
      navigationTarget = null;
      window.clearTimeout(previewNavigationTimer);
      previewNavPending = false;
      aboutNavPending = false;
      worksNavPending = false;
      if (name === 'preview') startPreviewIntro(true);
      else if (name === 'about') startAboutIntro(true);
      else if (name === 'works') startWorksIntro(true);
      requestStoryUpdate();
    };

    if (name === 'preview' || name === 'about' || name === 'works') {
      previewNavPending = name === 'preview';
      aboutNavPending = name === 'about';
      worksNavPending = name === 'works';
      loadModule(section);
      window.clearTimeout(previewNavigationTimer);
    } else {
      previewNavPending = false;
      aboutNavPending = false;
      worksNavPending = false;
      window.clearTimeout(previewNavigationTimer);
    }

    if (storyLenis) storyLenis.scrollTo(top, { immediate: true, force: true });
    else window.scrollTo({ top, behavior: 'instant' });
    completeNavigation();
  };

  navButtons.forEach((button) => button.addEventListener('click', () => scrollToSection(button.dataset.storyNav)));
  site.querySelector('[data-story-link="home"]')?.addEventListener('click', (event) => {
    event.preventDefault();
    scrollToSection('home');
  });

  site.querySelectorAll('[data-story-project]').forEach((card) => {
    card.addEventListener('click', () => {
      const key = card.dataset.storyProject;
      const legacyCard = document.querySelector(`[data-works-set] [data-project="${key}"]`);
      legacyCard?.click();
    });
  });

  const wechatCopyButton = site.querySelector('[data-wechat-copy]');
  let wechatCopyResetTimer;
  wechatCopyButton?.addEventListener('click', () => {
    const wechatId = wechatCopyButton.dataset.wechatCopy;
    window.clearTimeout(wechatCopyResetTimer);
    wechatCopyButton.textContent = 'WeChat ID Copied';
    wechatCopyButton.setAttribute('aria-label', 'WeChat ID copied');

    const copyField = document.createElement('textarea');
    copyField.value = wechatId;
    copyField.setAttribute('readonly', '');
    copyField.style.position = 'fixed';
    copyField.style.opacity = '0';
    document.body.append(copyField);
    copyField.select();

    try {
      document.execCommand('copy');
    } finally {
      copyField.remove();
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(wechatId).catch(() => undefined);
    }

    wechatCopyResetTimer = window.setTimeout(() => {
      wechatCopyButton.textContent = 'WeChat';
      wechatCopyButton.setAttribute('aria-label', 'Copy WeChat ID');
    }, 3000);
  });

  window.addEventListener('scroll', requestStoryUpdate, { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(refreshMetrics), { passive: true });
  window.addEventListener('load', refreshMetrics, { once: true });

  const showInitialScene = async () => {
    const homeImage = site.querySelector('.hero-card-portrait-default') || site.querySelector('.story-home-image img');
    const fontReady = document.fonts?.ready || Promise.resolve();
    const imageReady = homeImage?.decode
      ? homeImage.decode().catch(() => undefined)
      : Promise.resolve();

    await Promise.all([fontReady, imageReady]);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-home-ready');
        document.querySelector('[data-story-section="home"]')?.classList.add('is-entered');
        refreshMetrics();
      });
    });
  };

  showInitialScene();
})();
