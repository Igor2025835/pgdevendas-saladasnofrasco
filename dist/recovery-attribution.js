// Tag only the recovery checkouts. Keep UTMify's ad UTMs, SCK and XCOD intact.
// Do not put this value in page-wide URL/storage: that could label later regular sales.
(() => {
  const selector = 'a[data-recovery-checkout]';
  const tag = link => {
    if (!link) return;
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    if (url.hostname !== 'pay.hotmart.com') return;
    url.searchParams.set('src', 'backredirect');
    if (link.href !== url.href) link.href = url.href;
  };
  const links = [...document.querySelectorAll(selector)];
  const observer = new MutationObserver(records => records.forEach(record => tag(record.target)));
  links.forEach(link => {
    tag(link);
    observer.observe(link, { attributes: true, attributeFilter: ['href'] });
  });
  // The capture phase also covers immediate clicks and opening in another tab.
  for (const eventName of ['click', 'auxclick', 'contextmenu']) {
    document.addEventListener(eventName, event => tag(event.target?.closest?.(selector)), true);
  }
})();
