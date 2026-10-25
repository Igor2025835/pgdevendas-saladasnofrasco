// Reserve the video's native aspect ratio. No video URL is attached until the page
// has loaded, had a chance to paint, and the hero is actually on screen.
(() => {
  const video = document.querySelector('#hero-preview-video');
  if (!video) return;
  const frame = video.closest('.hero-media');
  let ready = false;
  let visible = false;
  let failed = false;
  let scheduled = false;
  const mayPlay = () => ready && visible && !document.hidden && !failed;
  const sync = () => {
    if (!mayPlay()) { video.pause(); return; }
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    if (!video.hasAttribute('src')) {
      const small = window.matchMedia('(max-width: 600px)').matches || navigator.connection?.saveData;
      video.src = small ? video.dataset.srcSmall : video.dataset.srcLarge;
      video.load();
    }
    video.play()?.catch(() => {
      // Keep the reserved area clear when the browser blocks autoplay.
      frame.classList.remove('is-playing');
    });
  };
  video.addEventListener('play', () => { if (!mayPlay()) video.pause(); });
  video.addEventListener('playing', () => {
    if (mayPlay()) frame.classList.add('is-playing');
    else video.pause();
  });
  video.addEventListener('error', () => {
    failed = true;
    video.pause();
    frame.classList.remove('is-playing');
  });
  if (typeof IntersectionObserver === 'function') {
    new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .1);
      sync();
    }, { threshold: [0, .1] }).observe(video);
  } else {
    const check = () => {
      const rect = video.getBoundingClientRect();
      visible = rect.bottom > 0 && rect.top < window.innerHeight;
      sync();
    };
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    check();
  }
  const afterLoad = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const start = () => { ready = true; sync(); };
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(start, { timeout: 1500 });
      else setTimeout(start, 250);
    }));
  };
  if (document.readyState === 'complete') afterLoad();
  else window.addEventListener('load', afterLoad, { once: true });
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('pointerdown', sync, { once: true, passive: true });
  window.addEventListener('pagehide', () => { visible = false; video.pause(); });
  window.addEventListener('pageshow', event => {
    if (document.readyState === 'complete') afterLoad();
    if (event.persisted) {
      const rect = video.getBoundingClientRect();
      visible = rect.bottom > 0 && rect.top < window.innerHeight;
      sync();
    }
  });
})();
