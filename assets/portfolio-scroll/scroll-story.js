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
  const previewTitle = previewHeading?.querySelector('.story-chapter-title');
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
  const storyTopbar = site.querySelector('.story-topbar');
  const storyStickyScenes = [...site.querySelectorAll('.story-sticky')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileLayoutQuery = window.matchMedia('(max-width: 900px)');
  const coarsePointerQuery = window.matchMedia('(hover: none), (pointer: coarse)');
  const isMobileInteraction = () => mobileLayoutQuery.matches || coarsePointerQuery.matches;

  const imagePlaceholderColors = Object.freeze({
    'assets/portfolio-frame7/hero-card-frame7-1400.webp': '#f3f3f3',
    'assets/portfolio-scroll/about-hero-source.png': '#f2f3f3',
    'assets/portfolio-scroll/about-hero.png': '#141313',
    'assets/portfolio-scroll/about-portrait-source.png': '#fdfdfd',
    'assets/portfolio-scroll/preview-01-mobile.webp': '#fafafa',
    'assets/portfolio-scroll/preview-01.png': '#fafaf9',
    'assets/portfolio-scroll/preview-02-mobile.webp': '#e4e4e4',
    'assets/portfolio-scroll/preview-02.png': '#e4e4e4',
    'assets/portfolio-scroll/preview-03-mobile.webp': '#151e0a',
    'assets/portfolio-scroll/preview-03.png': '#151e0a',
    'assets/portfolio-scroll/preview-04-mobile.webp': '#b3f2f4',
    'assets/portfolio-scroll/preview-04.png': '#b2f1f4',
    'assets/portfolio-scroll/preview-05-mobile.webp': '#0e0f0f',
    'assets/portfolio-scroll/preview-05.png': '#0e0f0f',
    'assets/portfolio-scroll/preview-06-mobile.webp': '#000000',
    'assets/portfolio-scroll/preview-06.png': '#000000',
    'assets/portfolio-scroll/preview-07-mobile.webp': '#fafafa',
    'assets/portfolio-scroll/preview-07.png': '#fafaf9',
    'assets/portfolio-scroll/preview-08-mobile.webp': '#ffffff',
    'assets/portfolio-scroll/preview-08.png': '#ffffff',
    'assets/portfolio-scroll/preview-09-mobile.webp': '#fafafa',
    'assets/portfolio-scroll/preview-09.png': '#fafaf9',
    'assets/portfolio-scroll/preview-10-mobile.webp': '#cccccc',
    'assets/portfolio-scroll/preview-10.png': '#cbcbcb',
    'assets/portfolio-scroll/preview-11-mobile.webp': '#ffffff',
    'assets/portfolio-scroll/preview-11.png': '#ffffff',
    'assets/portfolio-scroll/preview-12-mobile.webp': '#000000',
    'assets/portfolio-scroll/preview-12.png': '#000000',
    'assets/portfolio-scroll/preview-13-mobile.webp': '#0a1119',
    'assets/portfolio-scroll/preview-13.png': '#0a1018',
    'assets/portfolio-scroll/preview-14-mobile.webp': '#e6e9ef',
    'assets/portfolio-scroll/preview-14.png': '#d0d6de',
    'assets/portfolio-scroll/preview-15-mobile.webp': '#030303',
    'assets/portfolio-scroll/preview-15.png': '#040506',
    'assets/portfolio-v6/about-bytedance.png': '#ffffff',
    'assets/portfolio-v6/work-base.png': '#010101',
    'assets/portfolio-v6/work-blurrr.png': '#f2f8e9',
    'assets/portfolio-v6/work-capcut-lite.png': '#000000',
    'assets/portfolio-v6/work-capcut.png': '#000000',
    'assets/portfolio-v6/work-dreamina.png': '#000000',
    'assets/portfolio-v7/hero-card-image-1600.webp': '#ececec',
    'assets/portfolio-v7/paperclip-hd-384.webp': '#ffffff'
  });

  const normalizeImageSource = (source = '') => source.split('?')[0];
  const resolveImageSource = (image) => (
    (isMobileInteraction() && image.dataset.srcMobile) || image.dataset.src || image.getAttribute('src') || ''
  );
  const markStoryImageLoaded = (image) => {
    const reveal = () => image.classList.add('is-story-image-loaded');
    if (typeof image.decode === 'function') image.decode().then(reveal, reveal);
    else reveal();
  };
  const prepareStoryImage = (image, source = resolveImageSource(image)) => {
    const key = normalizeImageSource(source);
    image.style.setProperty('--story-image-placeholder', imagePlaceholderColors[key] || '#ffffff');
    if (image.dataset.storyImagePrepared !== 'true') {
      image.dataset.storyImagePrepared = 'true';
      image.addEventListener('load', () => markStoryImageLoaded(image));
    }
    if (image.complete && image.naturalWidth > 0) markStoryImageLoaded(image);
  };

  site.querySelectorAll('img').forEach((image) => prepareStoryImage(image));

  const previewContentWidth = 800;
  const previewContentHeight = 10250;
  const previewStackWidths = [480, 468, 468, 468, 468];

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

  const loadModule = (module, { eager = false, lowPriority = false } = {}) => {
    if (!module) return;
    if (module.dataset.moduleLoaded === 'true') {
      if (eager) {
        module.querySelectorAll('img').forEach((image) => {
          image.loading = 'eager';
          if (lowPriority) image.fetchPriority = 'low';
        });
      }
      return;
    }
    module.dataset.moduleLoaded = 'true';
    module.querySelectorAll('img[data-src]').forEach((image, index) => {
      const source = resolveImageSource(image);
      prepareStoryImage(image, source);
      image.loading = eager || (module === preview && index < 5) || (module === about && index === 0) || module === works ? 'eager' : 'lazy';
      if (lowPriority) image.fetchPriority = 'low';
      image.src = source;
      image.removeAttribute('data-src');
      image.removeAttribute('data-src-mobile');
    });
  };

  const preloadPreviewImages = () => loadModule(preview, { eager: true, lowPriority: true });
  if (isMobileInteraction()) {
    preloadPreviewImages();
  } else if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadPreviewImages, { timeout: 900 });
  } else {
    window.setTimeout(preloadPreviewImages, 250);
  }

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
  let mobileTitleScrollDistances = new Map();
  let previewScale = 1;
  let previewIntroState = 'idle';
  let previewLayoutAnchor = 0;
  let previewIntroTimer = 0;
  let previewTiltResetTimer = 0;
  let previousPreviewScrollY = window.scrollY;
  let previousPreviewLayout = -1;
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

  const fitSplitTitleToWidth = (title, referenceWeight, lockReferenceWeight = false) => {
    if (!title) return;
    const previousVariation = title.style.fontVariationSettings;
    const previousTransition = title.style.transition;
    if (lockReferenceWeight) title.style.transition = 'none';
    title.style.removeProperty('font-size');
    title.style.fontVariationSettings = `"wght" ${referenceWeight}`;
    if (lockReferenceWeight) void title.offsetWidth;

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
    if (lockReferenceWeight) {
      void title.offsetWidth;
      if (previousTransition) title.style.transition = previousTransition;
      else title.style.removeProperty('transition');
    }
  };

  const fitAboutIntroLayout = (mobile) => {
    const aboutHeading = aboutTitle.closest('.about-heading');
    const aboutIdentity = about.querySelector('.story-about-identity');
    if (!aboutHeading || !aboutIdentity || !aboutIntroTip) return;

    aboutHeading.style.removeProperty('top');
    aboutHeading.style.removeProperty('bottom');
    aboutHeading.style.paddingBottom = `${aboutMeta.offsetHeight}px`;
    aboutTitle.style.removeProperty('font-size');
    const baseTitleSize = Number.parseFloat(getComputedStyle(aboutTitle).fontSize);
    const renderedTitleWidth = [...aboutTitle.querySelectorAll('.story-title-letter')].reduce(
      (width, letter) => width + letter.getBoundingClientRect().width,
      0
    );
    if (renderedTitleWidth > aboutTitle.clientWidth) {
      aboutTitle.style.fontSize = `${baseTitleSize * aboutTitle.clientWidth / renderedTitleWidth}px`;
    }

    const titleGap = 48;
    const identityGap = 48;
    const readTipTop = () => {
      const titleRect = aboutTitle.getBoundingClientRect();
      const headingRect = aboutHeading.getBoundingClientRect();
      const titleLineHeight = Number.parseFloat(getComputedStyle(aboutTitle).lineHeight);
      const titleLineTop = titleRect.top + Math.max(0, (titleRect.height - titleLineHeight) / 2);
      return {
        relative: titleLineTop - headingRect.top - aboutIntroTip.offsetHeight - titleGap
      };
    };

    if (!mobile) {
      const fittedSize = Number.parseFloat(getComputedStyle(aboutTitle).fontSize);
      const minimumSize = Math.min(72, fittedSize);
      const identityStyle = getComputedStyle(aboutIdentity);
      const identityTransform = identityStyle.transform === 'none'
        ? 0
        : new DOMMatrixReadOnly(identityStyle.transform).m42;
      const requiredTipTop = aboutIdentity.getBoundingClientRect().bottom - identityTransform + identityGap;
      const aboutScene = about.querySelector('.story-about-scene');
      const availableBottom = aboutScene.getBoundingClientRect().bottom - 24;
      const fitsAtSize = (size) => {
        aboutTitle.style.fontSize = `${size}px`;
        const tipTop = readTipTop().relative;
        const desiredHeadingTop = requiredTipTop - tipTop;
        return desiredHeadingTop + aboutHeading.offsetHeight <= availableBottom;
      };
      let low = minimumSize;
      let high = fittedSize;

      if (!fitsAtSize(fittedSize)) {
        for (let index = 0; index < 12; index += 1) {
          const candidate = (low + high) / 2;
          if (fitsAtSize(candidate)) low = candidate;
          else high = candidate;
        }
        aboutTitle.style.fontSize = `${low}px`;
      }

      const headingTop = requiredTipTop - readTipTop().relative;
      aboutHeading.style.top = `${headingTop - aboutScene.getBoundingClientRect().top}px`;
      aboutHeading.style.bottom = 'auto';
    }

    aboutIntroTip.style.top = `${readTipTop().relative}px`;
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
  let storyViewportHeight = Math.max(1, window.visualViewport?.height || window.innerHeight);
  let footerScrollStart = 0;
  let pageScrollEnd = 0;
  let resizeTimer = 0;
  let lastViewportWidth = window.innerWidth;
  let mobileScrollFreeze = null;

  const setMobileTitleWeight = (title, weight) => {
    if (!title) return;
    const value = String(Math.round(weight));
    if (title.dataset.mobileTitleWeight === value) return;
    title.dataset.mobileTitleWeight = value;
    title.style.fontVariationSettings = `"wght" ${value}`;
  };

  const freezeMobileScroll = (top) => {
    if (!isMobileInteraction()) return false;
    const bodyStyle = document.body.style;
    if (!mobileScrollFreeze) {
      mobileScrollFreeze = {
        top,
        position: bodyStyle.position,
        topStyle: bodyStyle.top,
        left: bodyStyle.left,
        right: bodyStyle.right,
        width: bodyStyle.width,
        overflow: bodyStyle.overflow
      };
    }
    mobileScrollFreeze.top = top;
    window.scrollTo({ top, behavior: 'instant' });
    bodyStyle.position = 'fixed';
    bodyStyle.top = `${-top}px`;
    bodyStyle.left = '0';
    bodyStyle.right = '0';
    bodyStyle.width = '100%';
    bodyStyle.overflow = 'hidden';
    document.documentElement.classList.add('is-story-scroll-locked');
    return true;
  };

  const moveMobileScrollFreeze = (top) => {
    if (!mobileScrollFreeze) return false;
    mobileScrollFreeze.top = top;
    document.body.style.top = `${-top}px`;
    return true;
  };

  const releaseMobileScroll = (top) => {
    if (!mobileScrollFreeze) return false;
    const frozen = mobileScrollFreeze;
    const target = Number.isFinite(top) ? top : frozen.top;
    mobileScrollFreeze = null;
    const bodyStyle = document.body.style;
    bodyStyle.position = frozen.position;
    bodyStyle.top = frozen.topStyle;
    bodyStyle.left = frozen.left;
    bodyStyle.right = frozen.right;
    bodyStyle.width = frozen.width;
    bodyStyle.overflow = frozen.overflow;
    document.documentElement.classList.remove('is-story-scroll-locked');
    window.scrollTo({ top: target, behavior: 'instant' });
    return true;
  };

  const releaseAboutScroll = () => {
    if (!aboutScrollLock) return;
    const lock = aboutScrollLock;
    aboutScrollLock = null;
    releaseMobileScroll(lock.top);
    if (lock.resumeLenis) lock.engine.start();
  };

  const lockAboutScroll = () => {
    const engine = !isMobileInteraction() && typeof lenis !== 'undefined' ? lenis : null;
    const top = Math.round(metrics.get(about)?.start ?? window.scrollY);
    aboutScrollLock = { top, engine, resumeLenis: Boolean(engine && !engine.isStopped) };
    if (engine) {
      engine.scrollTo(top, { immediate: true, force: true });
      engine.stop();
    } else if (freezeMobileScroll(top)) {
      aboutScrollLock.mobileFrozen = true;
    } else {
      window.scrollTo({ top, behavior: 'instant' });
    }
  };

  const releaseWorksScroll = () => {
    if (!worksScrollLock) return;
    const lock = worksScrollLock;
    worksScrollLock = null;
    releaseMobileScroll(lock.top);
    if (lock.resumeLenis) lock.engine.start();
  };

  const lockWorksScroll = () => {
    const engine = !isMobileInteraction() && typeof lenis !== 'undefined' ? lenis : null;
    const top = Math.round(metrics.get(works)?.start ?? window.scrollY);
    worksScrollLock = { top, engine, resumeLenis: Boolean(engine && !engine.isStopped) };
    if (engine) {
      engine.scrollTo(top, { immediate: true, force: true });
      engine.stop();
    } else if (freezeMobileScroll(top)) {
      worksScrollLock.mobileFrozen = true;
    } else {
      window.scrollTo({ top, behavior: 'instant' });
    }
  };

  const preventIntroScroll = (event) => {
    if (isMobileInteraction()) {
      if (event.type === 'touchmove') previousTouchY = event.touches[0].clientY;
      return;
    }
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
    const mobileBoundaryAllowance = isMobileInteraction() ? 24 : 2;
    const projectedScrollY = window.scrollY - Math.max(0, gestureDelta);
    const reachesAboutStart = Number.isFinite(aboutStart) && (
      window.scrollY <= aboutStart + mobileBoundaryAllowance ||
      projectedScrollY <= aboutStart + mobileBoundaryAllowance
    );
    const reachesWorksStart = Number.isFinite(worksStart) && (
      window.scrollY <= worksStart + mobileBoundaryAllowance ||
      projectedScrollY <= worksStart + mobileBoundaryAllowance
    );
    if (!navigationTarget && !aboutReturning && aboutIntroState === 'ready' && upward && reachesAboutStart) {
      event.preventDefault();
      returnToPreview(gestureDelta);
      return;
    }
    if (!navigationTarget && !worksReturning && worksIntroState === 'ready' && upward && reachesWorksStart) {
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
  const finishTouchGesture = () => {
    previousTouchY = null;
    if (!aboutReturning || aboutReturnPhase !== 'gesture') return;
    if (aboutReturnProgress >= 0.32) finishAboutReturn();
    else cancelAboutReturn();
  };
  window.addEventListener('touchend', finishTouchGesture, { passive: true });
  window.addEventListener('touchcancel', finishTouchGesture, { passive: true });
  window.addEventListener('keydown', preventIntroScroll, { capture: true });

  const refreshMetrics = () => {
    storyViewportHeight = Math.max(1, window.visualViewport?.height || window.innerHeight);
    document.documentElement.style.setProperty('--story-viewport-height', `${storyViewportHeight}px`);
    if (isMobileInteraction()) {
      document.documentElement.style.setProperty('--story-about-mask-height', `${Math.min(storyViewportHeight * 0.28, 220)}px`);
      document.documentElement.style.setProperty('--story-about-end-height', `${storyViewportHeight * 1.7}px`);
      document.documentElement.style.setProperty('--story-about-end-offset', `${storyViewportHeight * 0.5}px`);
    }
    const available = Math.max(280, window.innerWidth - (window.innerWidth <= 900 ? 32 : 160));
    previewScale = Math.min(1, available / previewContentWidth);
    const scaledContentHeight = previewContentHeight * previewScale;
    const mobile = isMobileInteraction();
    if (mobile) {
      preview.style.removeProperty('height');
      previewStack.style.removeProperty('width');
      previewStack.style.removeProperty('height');
      previewCards.forEach((card) => {
        card.style.removeProperty('width');
        card.style.removeProperty('height');
        card.style.removeProperty('top');
        card.style.removeProperty('transform');
        card.style.removeProperty('opacity');
      });
      previewCardMetrics = [];
    } else {
      const previewHeight = scaledContentHeight + storyViewportHeight * 4.5;
      preview.style.height = `${Math.max(storyViewportHeight * 5, previewHeight)}px`;
      previewStack.style.width = `${previewContentWidth * previewScale}px`;
      previewStack.style.height = `${scaledContentHeight}px`;

      const stackCenter = Math.min(220, storyViewportHeight * 0.235);
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
    }
    fitSplitTitleToWidth(previewHeading.querySelector('.story-chapter-title'), 700);

    fitAboutIntroLayout(mobile);
    about.style.setProperty('--about-hero-end', `${about.querySelector('.story-about-hero').offsetHeight}px`);
    aboutEndStart = aboutEnd.getBoundingClientRect().top + window.scrollY;
    fitSplitTitleToWidth(footerWord, 760, !mobile);
    metrics = new Map(sections.map((section) => [section, readSectionMetrics(section)]));
    if (mobile) {
      mobileTitleScrollDistances = new Map([
        [previewTitle, Math.max(previewTitle.offsetHeight * 1.25, previewTitle.getBoundingClientRect().top + window.scrollY - metrics.get(preview).start + previewTitle.offsetHeight)],
        [aboutTitle, Math.min(storyViewportHeight * 0.9, Math.max(aboutTitle.offsetHeight * 1.25, aboutTitle.getBoundingClientRect().top + window.scrollY - metrics.get(about).start + aboutTitle.offsetHeight))],
        [worksTitle, Math.max(worksTitle.offsetHeight * 1.25, worksTitle.getBoundingClientRect().top + window.scrollY - metrics.get(works).start + worksTitle.offsetHeight)]
      ]);
    } else {
      mobileTitleScrollDistances.clear();
    }
    pageScrollEnd = Math.max(1, document.documentElement.scrollHeight - storyViewportHeight);
    if (footer) {
      const footerTop = footer.getBoundingClientRect().top + window.scrollY;
      footerScrollStart = Math.min(pageScrollEnd - 1, footerTop - storyViewportHeight * 0.9);
    }
    previousPreviewLayout = -1;
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
    previewStack.classList.remove('is-tilt-resting');
    previewStack.style.setProperty('--preview-list-y', '0px');
    previewStack.style.setProperty('--preview-list-tilt', '0deg');
    previousPreviewLayout = -1;
    previewIntroState = 'idle';
    preview.classList.remove('is-entered', 'is-preview-intro', 'is-preview-ready', 'is-returning-from-about');
    previewCards.forEach((card, index) => {
      const cardMetrics = previewCardMetrics[index];
      if (cardMetrics) {
        card.style.top = `${cardMetrics.top}px`;
        card.style.transform = `translate3d(-50%, 0, 0) scale(${cardMetrics.scale})`;
      }
      card.style.removeProperty('opacity');
    });
  };

  const finishPreviewIntro = () => {
    previewIntroState = 'ready';
    previewLayoutAnchor = window.scrollY;
    previousPreviewLayout = -1;
    preview.classList.remove('is-preview-intro');
    preview.classList.add('is-preview-ready');
    requestStoryUpdate();
  };

  const startPreviewIntro = (restart = false) => {
    if (previewIntroState === 'playing' && !restart) return;
    if (previewIntroState === 'ready' && !restart) return;

    loadModule(preview);
    if (isMobileInteraction()) {
      previewIntroState = 'ready';
      previewLayoutAnchor = metrics.get(preview)?.start ?? window.scrollY;
      preview.classList.remove('is-preview-intro', 'is-returning-from-about');
      preview.classList.add('is-entered', 'is-preview-ready');
      requestStoryUpdate();
      return;
    }
    window.clearTimeout(previewIntroTimer);
    previewStack.style.setProperty('--preview-list-y', '0px');
    preview.classList.remove('is-entered', 'is-preview-intro', 'is-preview-ready', 'is-returning-from-about');
    previewCards.forEach((card) => card.style.removeProperty('opacity'));
    void preview.offsetWidth;

    previewIntroState = 'playing';
    preview.classList.add('is-entered', 'is-preview-intro');

    if (reducedMotion) {
      finishPreviewIntro();
      return;
    }

    previewIntroTimer = window.setTimeout(finishPreviewIntro, isMobileInteraction() ? 2200 : 3180);
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
    if (isMobileInteraction()) {
      aboutIntroState = 'playing';
      loadModule(about);
      aboutLayoutAnchor = metrics.get(about)?.start ?? window.scrollY;
      requestAnimationFrame(() => requestAnimationFrame(() => about.classList.add('is-entered')));
      window.clearTimeout(aboutIntroTimer);
      aboutIntroTimer = window.setTimeout(() => {
        aboutIntroState = 'ready';
        setTipVisible(aboutIntroTip, true);
        requestStoryUpdate();
      }, reducedMotion ? 0 : 950);
      return;
    }
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
      }, reducedMotion ? 0 : (isMobileInteraction() ? 1120 : 1520));
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
        (previewMeasure?.end ?? window.scrollY) - storyViewportHeight * 2.9
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
      else if (aboutScrollLock?.mobileFrozen) moveMobileScrollFreeze(target);
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
    const gestureDistance = Math.max(280, storyViewportHeight * 0.65);
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
    works.classList.remove('is-returning', 'is-suspended');
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
      loadModule(about);
      aboutIntroState = 'ready';
      aboutLayoutAnchor = metrics.get(about)?.start ?? 0;
      about.classList.add('is-entered');
      about.classList.remove('is-exiting', 'is-nav-hidden');
      about.classList.add('is-meta-active');
      setTipVisible(aboutTip, true);
      const top = Math.max(aboutEndStart, (metrics.get(works)?.start ?? window.scrollY) - 4);
      if (worksScrollLock) worksScrollLock.top = top;
      const engine = worksScrollLock?.engine;
      if (engine) engine.scrollTo(top, { immediate: true, force: true });
      else if (worksScrollLock?.mobileFrozen) moveMobileScrollFreeze(top);
      else window.scrollTo({ top, behavior: 'instant' });
      requestStoryUpdate();
      worksReturnTimer = window.setTimeout(() => {
        releaseWorksScroll();
        worksIntroState = 'idle';
        worksReturning = false;
        works.classList.replace('is-returning', 'is-suspended');
        requestStoryUpdate();
      }, reducedMotion ? 0 : 80);
    }, reducedMotion ? 0 : (isMobileInteraction() ? 420 : 620));
  };

  const startWorksIntro = (restart = false) => {
    if (worksIntroState !== 'idle' && !restart) return;
    const directNavigation = restart;
    resetWorksIntro();
    if (isMobileInteraction()) {
      loadModule(works);
      worksIntroState = 'ready';
      worksLayoutAnchor = metrics.get(works)?.start ?? window.scrollY;
      works.classList.add('is-entered', 'is-cards-entered');
      about.classList.remove('is-exiting', 'is-nav-hidden');
      requestStoryUpdate();
      return;
    }
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
    const mobile = isMobileInteraction();
    const headingDelay = directNavigation ? 0 : (mobile ? 360 : 660);
    const cardsDelay = directNavigation ? (mobile ? 620 : 980) : (mobile ? 900 : 1640);
    const finishDelay = directNavigation ? (mobile ? 1560 : 2340) : (mobile ? 1880 : 3000);
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

    if (isMobileInteraction()) {
      window.clearTimeout(previewTiltResetTimer);
      previewStack.style.setProperty('--preview-list-tilt', '0deg');
      return;
    }

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
    if (isMobileInteraction()) {
      if (scrollY >= measure.start - storyViewportHeight && previewIntroState === 'idle') startPreviewIntro();
      const local = scrollY - measure.start;
      const titleProgress = smooth(range(local, 0, mobileTitleScrollDistances.get(previewTitle) || storyViewportHeight * 0.9));
      previewTitle.style.color = '#000';
      setMobileTitleWeight(previewTitle, lerp(760, 100, titleProgress));
      previewTitle.style.visibility = 'visible';
      previewHeading.querySelector('.story-chapter-meta').style.opacity = '1';
      previewStack.style.opacity = '1';
      previewStack.style.setProperty('--preview-list-y', '0px');
      setTipVisible(previewTip, false);
      previousPreviewScrollY = scrollY;
      return;
    }
    if (scrollY < measure.start - storyViewportHeight * 0.3 && previewIntroState === 'ready') {
      resetPreviewIntro();
    } else if (
      scrollY >= measure.start &&
      scrollY < measure.end - storyViewportHeight &&
      previewIntroState === 'idle' &&
      !previewNavPending
    ) {
      startPreviewIntro();
    }

    if (
      scrollY < measure.start - storyViewportHeight ||
      (scrollY > measure.end + storyViewportHeight && !aboutReturning && navigationTarget !== 'preview')
    ) {
      previousPreviewScrollY = scrollY;
      return;
    }

    const localAfterIntro = previewIntroState === 'ready'
      ? Math.max(0, scrollY - previewLayoutAnchor)
      : 0;
    const mobile = isMobileInteraction();
    const layoutDistance = storyViewportHeight * 1.15;
    const layout = reducedMotion ? 1 : smooth(range(localAfterIntro, 0, layoutDistance));
    const listScrollStart = storyViewportHeight * 1.02;
    const contentHeight = previewContentHeight * previewScale;
    const viewportAllowance = storyViewportHeight * (456.19 / 1024);
    const stackOffset = previewStack.offsetTop;
    const listScrollEnd = Math.max(
      listScrollStart + 1,
      mobile
        ? stackOffset + contentHeight - viewportAllowance
        : measure.end - storyViewportHeight * 2.9 - previewLayoutAnchor
    );
    const listScroll = range(localAfterIntro, listScrollStart, listScrollEnd);
    const travel = Math.max(0, stackOffset + contentHeight - viewportAllowance) * listScroll;
    previewStack.style.setProperty('--preview-list-y', '0px');

    if (!mobile || Math.abs(layout - previousPreviewLayout) > 0.0005) {
      previewCards.forEach((card, index) => {
        const { target, top: stackTop, scale: stackScale } = previewCardMetrics[index];
        const top = lerp(stackTop, target - (mobile ? 0 : travel), layout);
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
      previousPreviewLayout = layout;
    }

    const tail = localAfterIntro - listScrollEnd;
    const titleSettle = smooth(range(localAfterIntro, 0, layoutDistance));
    const titleBlack = smooth(range(listScroll, 0.83, 1));
    const titleExit = smooth(range(tail, storyViewportHeight * 0.3, storyViewportHeight * 1.4));
    const fade = smooth(range(tail, storyViewportHeight * 1.05, storyViewportHeight * 1.85));
    updatePreviewTilt(
      scrollY,
      previewIntroState === 'ready' && layout > 0.08 && fade < 0.98 && !aboutReturning && !navigationTarget
    );
    const gray = Math.round(lerp(lerp(0, 245, titleSettle), 0, titleBlack));
    const title = previewHeading.querySelector('.story-chapter-title');
    title.style.color = `rgb(${gray}, ${gray}, ${gray})`;
    title.style.fontVariationSettings = `"wght" ${lerp(700, 100, titleExit).toFixed(2)}`;
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
    if (isMobileInteraction()) {
      aboutBody.style.removeProperty('transform');
      if (local >= -storyViewportHeight * 0.8 && local < measure.height && aboutIntroState === 'idle') {
        startAboutIntro();
      }
      about.classList.toggle('is-meta-active', local >= 0 && scrollY < worksStart);
      const titleProgress = smooth(range(local, 0, mobileTitleScrollDistances.get(aboutTitle) || storyViewportHeight * 0.9));
      setMobileTitleWeight(aboutTitle, lerp(760, 100, titleProgress));
      aboutTitle.style.removeProperty('visibility');
      setTipVisible(aboutIntroTip, aboutIntroState === 'ready');
      setTipVisible(aboutTip, false);
      return;
    }
    if (scrollY < measure.start - storyViewportHeight || scrollY > worksStart + storyViewportHeight) return;
    const aboutHold = Math.max(0, Math.min(scrollY - aboutEndStart, worksStart - aboutEndStart));
    aboutBody.style.transform = `translate3d(0, ${aboutHold}px, 0)`;
    const keepMetaDuringExit = worksIntroState === 'playing';
    about.classList.toggle('is-meta-active', local >= -1 && (scrollY < worksStart - 1 || keepMetaDuringExit));
    if (!isMobileInteraction() && local < -1 && aboutIntroState === 'ready' && !navigationTarget) {
      returnToPreview();
      return;
    }
    if (local < -storyViewportHeight * 0.3 && aboutIntroState !== 'idle') resetAboutIntro();
    if (local >= -1 && local < storyViewportHeight && aboutIntroState === 'idle' && !aboutNavPending && !navigationTarget) startAboutIntro();
    const afterIntro = aboutIntroState === 'ready' ? Math.max(0, scrollY - aboutLayoutAnchor) : 0;
    const titleExit = smooth(range(afterIntro, storyViewportHeight * 0.08, storyViewportHeight * 0.72));
    const titleWeight = lerp(700, 100, titleExit);
    aboutTitle.style.fontVariationSettings = `"wght" ${titleWeight.toFixed(2)}`;
    aboutTitle.style.removeProperty('visibility');
    setTipVisible(aboutIntroTip, aboutIntroState === 'ready');
    setTipVisible(aboutTip, aboutIntroState === 'ready' && scrollY >= aboutEndStart - 1 && scrollY < worksStart - 1 && worksIntroState === 'idle');
  };

  const updateWorks = (scrollY) => {
    if (worksReturning) return;
    const measure = metrics.get(works);
    if (!measure) return;
    if (isMobileInteraction()) {
      const local = scrollY - measure.start;
      if (local >= -storyViewportHeight * 0.8 && worksIntroState === 'idle') startWorksIntro();
      const titleProgress = smooth(range(local, 0, mobileTitleScrollDistances.get(worksTitle) || storyViewportHeight * 0.9));
      setMobileTitleWeight(worksTitle, lerp(760, 100, titleProgress));
      worksTitle.style.removeProperty('visibility');
      if (footerWord) {
        const footerProgress = smooth(range(scrollY, footerScrollStart, pageScrollEnd));
        setMobileTitleWeight(footerWord, lerp(100, 760, footerProgress));
      }
      return;
    }
    if (scrollY < measure.start - storyViewportHeight) return;
    const local = scrollY - measure.start;
    if (!isMobileInteraction() && local < -1 && worksIntroState === 'ready' && !navigationTarget) {
      returnToAbout();
      return;
    }
    if (local < -storyViewportHeight * 0.3 && worksIntroState !== 'idle') resetWorksIntro();
    if (local >= -1 && local < storyViewportHeight && worksIntroState === 'idle' && !worksNavPending && !navigationTarget) startWorksIntro();
    const afterIntro = worksIntroState === 'ready' ? Math.max(0, scrollY - worksLayoutAnchor) : 0;
    const titleExit = smooth(range(afterIntro, 0, 444));
    const titleWeight = lerp(760, 100, titleExit);
    worksTitle.style.fontVariationSettings = `"wght" ${titleWeight.toFixed(2)}`;
    worksTitle.style.removeProperty('visibility');
    if (footerWord) {
      const footerProgress = smooth(range(scrollY, footerScrollStart, pageScrollEnd));
      footerWord.style.fontVariationSettings = `"wght" ${lerp(100, 760, footerProgress).toFixed(2)}`;
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
    const marker = scrollY + storyViewportHeight * 0.28;
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

  const updateMobileViewportLayers = (scrollY) => {
    if (!isMobileInteraction()) {
      storyTopbar?.style.removeProperty('transform');
      storyStickyScenes.forEach((scene) => scene.style.removeProperty('transform'));
      aboutMeta?.style.removeProperty('transform');
      return;
    }

    storyTopbar?.style.removeProperty('transform');
    aboutMeta?.style.removeProperty('transform');
    storyStickyScenes.forEach((scene) => scene.style.removeProperty('transform'));
  };

  function updateStory() {
    frame = 0;
    // Hold native touch momentum and scrollbar movement as well as Lenis input.
    if (!isMobileInteraction() && aboutScrollLock && Math.abs(window.scrollY - aboutScrollLock.top) > 0.5) {
      window.scrollTo({ top: aboutScrollLock.top, behavior: 'instant' });
    }
    if (!isMobileInteraction() && worksScrollLock && Math.abs(window.scrollY - worksScrollLock.top) > 0.5) {
      window.scrollTo({ top: worksScrollLock.top, behavior: 'instant' });
    }
    const scrollY = aboutScrollLock?.mobileFrozen
      ? aboutScrollLock.top
      : worksScrollLock?.mobileFrozen
        ? worksScrollLock.top
        : window.scrollY;
    updateMobileViewportLayers(scrollY);
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
    const storyLenis = !isMobileInteraction() && typeof lenis !== 'undefined' ? lenis : null;
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
  const scheduleMetricsRefresh = (event) => {
    const widthChanged = Math.abs(window.innerWidth - lastViewportWidth) > 1;
    lastViewportWidth = window.innerWidth;
    // Mobile Safari fires resize continuously while its browser chrome expands
    // and collapses. Rebuilding section geometry during that gesture moves the
    // module boundaries underneath the user's finger and causes scroll jitter.
    if (isMobileInteraction() && !widthChanged && event?.type !== 'orientationchange') {
      requestStoryUpdate();
      return;
    }
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => requestAnimationFrame(refreshMetrics), widthChanged ? 50 : 180);
  };
  window.addEventListener('resize', scheduleMetricsRefresh, { passive: true });
  window.visualViewport?.addEventListener('resize', scheduleMetricsRefresh, { passive: true });
  window.visualViewport?.addEventListener('scroll', requestStoryUpdate, { passive: true });
  window.addEventListener('orientationchange', scheduleMetricsRefresh, { passive: true });
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
