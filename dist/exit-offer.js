// A single, owned history entry detects Back. Never infer exit from timers,
// scrolling direction, mouse movement, blur, tab switches or beforeunload.
(() => {
  const offer = document.querySelector('#exit-offer');
  if (!offer || typeof offer.showModal !== 'function' || window.self !== window.top) return;
  const marker = '__saladasExitOfferV1';
  const seenKey = 'saladas:exit-offer:seen:v1';
  const checkoutKey = 'saladas:checkout-started:v1';
  const startedAt = performance.now();
  const readFlag = key => { try { return sessionStorage.getItem(key) === '1'; } catch { return true; } };
  const remember = key => { try { sessionStorage.setItem(key, '1'); return true; } catch { return false; } };
  const existing = history.state?.[marker];
  const token = existing?.slot === 'guard' ? existing.token : (globalThis.crypto?.randomUUID?.() || String(Date.now()) + Math.random());
  let guardActive = existing?.slot === 'guard';
  let guardUrl = location.href;
  let disabled = Boolean(existing) || readFlag(seenKey) || readFlag(checkoutKey);
  let shown = false;
  let backPending = false;
  let previousOverflow = '';
  const navigationType = performance.getEntriesByType('navigation')[0]?.type;
  if (navigationType === 'reload' || navigationType === 'back_forward') disabled = true;
  const anotherDialogOpen = () => Boolean(document.querySelector('dialog[open]'));
  const videoPlaying = () => [...document.querySelectorAll('video')].some(video => !video.loop && !video.paused && !video.ended);
  const canOffer = () => !disabled && !shown && !readFlag(seenKey) && !readFlag(checkoutKey) && !document.hidden && document.hasFocus() && !anotherDialogOpen() && !videoPlaying();
  const stateWith = slot => ({ ...(history.state && typeof history.state === 'object' ? history.state : {}), [marker]: { token, slot } });
  const arm = event => {
    if (!event.isTrusted || event.defaultPrevented || guardActive || performance.now() - startedAt < 12000 || !canOffer()) return;
    if (event.target?.closest?.('a, button, input, textarea, select, [role="button"], video')) return;
    // Do not stack another site's router state or interfere with Navigation API apps.
    if (history.state != null && (typeof history.state !== 'object' || Array.isArray(history.state))) return;
    try {
      guardUrl = location.href;
      history.replaceState(stateWith('base'), '', guardUrl);
      history.pushState(stateWith('guard'), '', guardUrl);
      guardActive = true;
    } catch { disabled = true; }
  };
  document.addEventListener('scroll', arm, { passive: true });
  document.addEventListener('pointerdown', arm, { passive: true });
  document.addEventListener('keydown', arm);
  // An intentional link click must always win, especially a checkout click.
  document.addEventListener('click', event => {
    if (!event.isTrusted || event.defaultPrevented) return;
    const link = event.target?.closest?.('a[href]');
    if (!link) return;
    let target;
    try { target = new URL(link.href, location.href); } catch { return; }
    if (target.hostname === 'pay.hotmart.com') {
      disabled = true;
      remember(checkoutKey);
    } else if (target.origin !== location.origin || target.pathname !== location.pathname || target.search !== location.search || target.hash !== location.hash) {
      disabled = true;
    }
    if (disabled && offer.open) {
      backPending = false;
      offer.close(); // Never restore an open offer when returning from checkout.
    }
    // Let the browser and UTMify handle the original link without interception.
  }, true);
  window.addEventListener('hashchange', () => { disabled = true; });
  window.addEventListener('pagehide', () => {
    disabled = true;
    backPending = false;
    if (offer.open) offer.close();
  });
  window.addEventListener('pageshow', event => { if (event.persisted) disabled = true; });
  window.addEventListener('popstate', event => {
    const state = event.state?.[marker];
    // Ignore initial Safari popstate, Forward, hash navigation and unrelated states.
    if (!guardActive || state?.token !== token || state.slot !== 'base' || location.href !== guardUrl) return;
    guardActive = false;
    if (!canOffer() || !remember(seenKey)) {
      history.back(); // Transparently skip our one duplicate, without showing anything.
      return;
    }
    previousOverflow = document.documentElement.style.overflow;
    try { offer.showModal(); } catch { history.back(); return; }
    shown = true;
    backPending = true;
    document.documentElement.style.overflow = 'hidden';
  });
  const leave = () => offer.close();
  offer.querySelector('.exit-offer-close').addEventListener('click', leave);
  offer.querySelector('.exit-offer-leave').addEventListener('click', leave);
  offer.addEventListener('cancel', event => { event.preventDefault(); leave(); });
  offer.addEventListener('click', event => {
    if (event.target !== offer) return;
    const rect = offer.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) leave();
  });
  offer.addEventListener('close', () => {
    document.documentElement.style.overflow = previousOverflow;
    if (backPending) { backPending = false; history.back(); }
  });
  // Preserve ad attribution when the visitor chooses to read the dedicated page.
  const details = offer.querySelector('.exit-offer-details');
  details.href = '/backredirect' + location.search;
})();
