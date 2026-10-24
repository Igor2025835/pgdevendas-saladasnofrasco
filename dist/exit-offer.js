// Back opens the dedicated offer page. A desktop-only top-right mouse exit is
// an approximation of close intent, never detection of a browser tab's X.
(() => {
  const offer = document.querySelector('#exit-offer');
  if (!offer || window.self !== window.top) return;
  const marker = '__saladasExitOfferV1'; // Adopt existing guards after an upgrade/reload.
  const redirectKey = 'saladas:exit-redirect:used:v2';
  const desktopKey = 'saladas:desktop-offer:seen:v2';
  const checkoutKey = 'saladas:checkout-started:v1';
  const startedAt = performance.now();
  const read = key => { try { return sessionStorage.getItem(key) === '1'; } catch { return true; } };
  const remember = key => { try { sessionStorage.setItem(key, '1'); return true; } catch { return false; } };
  const existing = history.state?.[marker];
  const token = existing?.slot === 'guard' ? existing.token : (globalThis.crypto?.randomUUID?.() || String(Date.now()) + Math.random());
  let guardActive = existing?.slot === 'guard';
  let guardUrl = location.href;
  let disabled = read(checkoutKey) || read(redirectKey);
  let intentTimer = null;
  let lastMousePoint = null;
  let previousOverflow = '';
  const backUrl = new URL('/backredirect', location.origin);
  backUrl.search = location.search;
  offer.querySelector('.exit-offer-details').href = backUrl.href;
  const otherDialogOpen = () => [...document.querySelectorAll('dialog[open]')].some(dialog => dialog !== offer);
  const videoPlaying = () => [...document.querySelectorAll('video')].some(video => !video.loop && !video.paused && !video.ended);
  const cancelIntent = () => { if (intentTimer !== null) clearTimeout(intentTimer); intentTimer = null; };
  const closeOffer = () => { if (offer.open) offer.close(); };
  const stateWith = slot => ({ ...(history.state && typeof history.state === 'object' ? history.state : {}), [marker]: { token, slot } });
  const arm = event => {
    // No waiting period: the first real non-link interaction can enable Back.
    if (!event.isTrusted || event.defaultPrevented || guardActive || disabled || document.hidden || otherDialogOpen()) return;
    if (event.target?.closest?.('a[href], input, textarea, select')) return;
    if (history.state != null && (typeof history.state !== 'object' || Array.isArray(history.state))) return;
    try {
      guardUrl = location.href;
      history.replaceState(stateWith('base'), '', guardUrl);
      history.pushState(stateWith('guard'), '', guardUrl);
      guardActive = true;
    } catch { disabled = true; }
  };
  document.addEventListener('pointerdown', arm, { passive: true });
  document.addEventListener('keydown', arm);
  document.addEventListener('scroll', arm, { passive: true });
  window.addEventListener('popstate', event => {
    const state = event.state?.[marker];
    if (!guardActive || state?.token !== token || state.slot !== 'base' || location.href !== guardUrl) return;
    guardActive = false;
    cancelIntent();
    if (disabled || read(checkoutKey) || read(redirectKey) || otherDialogOpen() || !remember(redirectKey)) {
      history.back(); // Pass through our one duplicate; never stack new guards.
      return;
    }
    disabled = true;
    closeOffer();
    // Replace the sales-page entry so Back from the offer does not loop here.
    location.replace(backUrl.href);
  });
  document.addEventListener('click', event => {
    if (!event.isTrusted || event.defaultPrevented) return;
    cancelIntent();
    const link = event.target?.closest?.('a[href]');
    if (!link || link.closest?.('.elementor-tab-title')) return;
    let target;
    try { target = new URL(link.href, location.href); } catch { return; }
    if (target.hostname === 'pay.hotmart.com') {
      disabled = true;
      remember(checkoutKey);
    } else if (target.origin !== location.origin || target.pathname !== location.pathname || target.hash !== location.hash) {
      disabled = true;
    }
    if (disabled) closeOffer();
    // Preserve the anchor's original navigation and UTMify click handlers.
  }, true);
  window.addEventListener('hashchange', () => { disabled = true; cancelIntent(); });
  window.addEventListener('pagehide', () => { disabled = true; cancelIntent(); closeOffer(); });
  window.addEventListener('pageshow', event => { if (event.persisted) { disabled = true; closeOffer(); } });

  const desktop = () => window.innerWidth >= 900 && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const canShowDesktop = () => !disabled && !read(checkoutKey) && !read(redirectKey) && !read(desktopKey) && desktop() && performance.now() - startedAt >= 5000 && !document.hidden && document.hasFocus() && !offer.open && !otherDialogOpen() && !videoPlaying();
  document.addEventListener('mousemove', event => {
    if (!event.isTrusted || !desktop()) return;
    cancelIntent();
    if (event.clientY >= 24) lastMousePoint = { y: event.clientY, at: performance.now() };
  }, { passive: true });
  document.addEventListener('mouseout', event => {
    if (!event.isTrusted || event.relatedTarget || event.buttons || event.clientY > 0 || event.clientX < window.innerWidth * .8 || event.clientX > window.innerWidth || !lastMousePoint || performance.now() - lastMousePoint.at > 800 || !canShowDesktop()) return;
    cancelIntent();
    intentTimer = setTimeout(() => {
      intentTimer = null;
      if (!canShowDesktop() || typeof offer.showModal !== 'function' || !remember(desktopKey)) return;
      previousOverflow = document.documentElement.style.overflow;
      try { offer.showModal(); document.documentElement.style.overflow = 'hidden'; } catch { /* Keep navigation usable. */ }
    }, 200);
  });
  window.addEventListener('blur', cancelIntent);
  document.addEventListener('visibilitychange', cancelIntent);
  document.addEventListener('mouseenter', cancelIntent);
  const dismiss = () => { cancelIntent(); remember(redirectKey); disabled = true; closeOffer(); };
  offer.querySelector('.exit-offer-close').addEventListener('click', dismiss);
  offer.querySelector('.exit-offer-leave').addEventListener('click', dismiss);
  offer.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  offer.addEventListener('click', event => {
    if (event.target !== offer) return;
    const rect = offer.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dismiss();
  });
  offer.addEventListener('close', () => { document.documentElement.style.overflow = previousOverflow; });
})();
