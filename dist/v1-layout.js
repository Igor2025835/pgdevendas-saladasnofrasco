// Two identical sequences make the automatic review carousel wrap seamlessly.
(() => {
  const track = document.querySelector('#reviews-track');
  if (!track) return;
  const first = track.querySelector('.conversation-card');
  const repeated = track.querySelector('.conversation-card[aria-hidden="true"]');
  const dialog = document.querySelector('#conversation-dialog');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('.reviews-toggle');
  let distance = 0;
  let position = track.scrollLeft;
  let previousTime = null;
  let frame = null;
  let timer;
  let manual = false;
  let hover = false;
  let focused = false;
  let userPaused = false;
  let motionOverride = false;
  let visible = typeof IntersectionObserver !== 'function';
  const wrap = value => distance > 0 ? ((value % distance) + distance) % distance : 0;
  const paused = () => userPaused || (reduced.matches && !motionOverride);
  const mayRun = () => distance > 0 && visible && !document.hidden && !paused() && !manual && !hover && !focused && !dialog?.open;
  const updateToggle = () => {
    toggle.dataset.paused = String(paused());
    toggle.setAttribute('aria-label', paused() ? 'Iniciar rolagem automática' : 'Pausar rolagem automática');
  };
  const tick = time => {
    frame = null;
    if (!mayRun()) { previousTime = null; return; }
    const elapsed = previousTime === null ? 0 : Math.min(time - previousTime, 64);
    previousTime = time;
    position = wrap(position + elapsed * 26 / 1000);
    track.scrollLeft = position;
    frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    if (mayRun()) {
      if (frame === null) {
        position = wrap(track.scrollLeft);
        previousTime = null;
        frame = requestAnimationFrame(tick);
      }
    } else {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      previousTime = null;
    }
  };
  const measure = () => {
    if (!first || !repeated) return;
    distance = repeated.getBoundingClientRect().left - first.getBoundingClientRect().left;
    position = wrap(track.scrollLeft);
    track.scrollLeft = position;
    sync();
  };
  const pauseForInteraction = () => {
    manual = true;
    sync();
    clearTimeout(timer);
    timer = setTimeout(() => { manual = false; sync(); }, 4000);
  };
  const move = direction => {
    pauseForInteraction();
    position = wrap(track.scrollLeft + direction * track.clientWidth * .85);
    track.scrollLeft = position;
  };
  document.querySelector('.reviews-previous').addEventListener('click', () => move(-1));
  document.querySelector('.reviews-next').addEventListener('click', () => move(1));
  toggle.addEventListener('click', () => {
    if (paused()) { userPaused = false; motionOverride = true; }
    else userPaused = true;
    updateToggle();
    sync();
  });
  for (const event of ['pointerdown', 'wheel', 'keydown']) track.addEventListener(event, pauseForInteraction, { passive: true });
  track.addEventListener('pointerenter', () => {
    if (window.matchMedia('(hover: hover)').matches) { hover = true; sync(); }
  });
  track.addEventListener('pointerleave', () => { hover = false; sync(); });
  track.addEventListener('focusin', () => { focused = true; sync(); });
  track.addEventListener('focusout', event => {
    if (!track.contains(event.relatedTarget)) { focused = false; sync(); }
  });
  dialog?.addEventListener('close', sync);
  reduced.addEventListener('change', () => { motionOverride = false; updateToggle(); sync(); });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => { visible = false; sync(); });
  window.addEventListener('pageshow', () => {
    const rect = track.getBoundingClientRect();
    visible = rect.bottom > 0 && rect.top < window.innerHeight;
    sync();
  });
  if (typeof ResizeObserver === 'function') new ResizeObserver(measure).observe(track);
  else window.addEventListener('resize', measure);
  if (typeof IntersectionObserver === 'function') {
    new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      sync();
    }).observe(track);
  }
  updateToggle();
  measure();
})();
