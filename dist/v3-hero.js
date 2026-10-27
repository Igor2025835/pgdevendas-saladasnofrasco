// Only the compact, silent five-second excerpt loads before an explicit click.
(() => {
  const video = document.querySelector('#hero-lesson-video');
  if (!video) return;
  const frame = video.closest('.hero-lesson-media');
  const button = frame.querySelector('.hero-lesson-play');
  const hint = button.querySelector('.hero-lesson-hint');
  let ready = false;
  let visible = false;
  let full = false;
  let failed = false;
  let scheduled = false;
  const onScreen = () => {
    const rect = video.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  };
  const sync = () => {
    if (!visible || document.hidden) { video.pause(); return; }
    if (!ready || full || failed) return;
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    if (!video.hasAttribute('src')) {
      video.src = video.dataset.previewSrc;
      video.load();
    }
    video.play()?.catch(() => {}); // The play button remains usable if autoplay is blocked.
  };
  button.addEventListener('click', () => {
    full = true;
    failed = false;
    visible = true;
    video.pause();
    video.muted = false;
    video.defaultMuted = false;
    video.loop = false;
    video.controls = true;
    video.volume = 1;
    video.setAttribute('aria-label', 'Prévia completa da aula do método das camadas, com som');
    video.src = video.dataset.fullSrc;
    video.load();
    video.currentTime = 0;
    button.hidden = true;
    video.play()?.catch(() => {
      button.hidden = false;
      hint.textContent = 'Clica para reproduzir';
    });
  });
  video.addEventListener('play', () => {
    if (!visible || document.hidden) video.pause();
  });
  video.addEventListener('error', () => {
    failed = true;
    video.pause();
    button.hidden = false;
    hint.textContent = 'Clica para tentar novamente';
  });
  video.addEventListener('ended', () => {
    if (full) {
      button.hidden = false;
      hint.textContent = 'Voltar a ver com som';
    }
  });
  if (typeof IntersectionObserver === 'function') {
    new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .1);
      sync();
    }, { threshold: [0, .1] }).observe(video);
  } else {
    const check = () => { visible = onScreen(); sync(); };
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
  window.addEventListener('pagehide', () => { visible = false; video.pause(); });
  window.addEventListener('pageshow', event => {
    if (document.readyState === 'complete') afterLoad();
    if (event.persisted) { visible = onScreen(); sync(); }
  });
})();
