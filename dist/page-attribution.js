// Keep the landing variant on normal checkouts, even after UTMify rewrites URLs.
(() => {
  const variant = /^\/gro(?:\/|$)/.test(location.pathname) ? 'gro' : 'pg1';
  if (!['/', '/index.html', '/gro', '/gro/', '/gro/index.html'].includes(location.pathname)) return;
  const selector = 'a[href*="pay.hotmart.com"]:not([data-recovery-checkout])';
  const tag = link => {
    if (!link || link.hasAttribute('data-recovery-checkout')) return;
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    if (url.hostname !== 'pay.hotmart.com' || url.pathname !== '/O108101669E' || url.searchParams.get('src') === 'backredirect') return;
    for (const [key, value] of new URL(location.href).searchParams) {
      if (/^utm_/.test(key) || ['fbclid', 'ad_src'].includes(key)) {
        if (!url.searchParams.has(key)) url.searchParams.set(key, value);
      }
    }
    url.searchParams.set('src', variant);
    if (link.href !== url.href) link.href = url.href;
  };
  const observer = new MutationObserver(records => records.forEach(record => tag(record.target)));
  document.querySelectorAll(selector).forEach(link => {
    tag(link);
    observer.observe(link, {attributes: true, attributeFilter: ['href']});
  });
  for (const name of ['click', 'auxclick', 'contextmenu']) {
    document.addEventListener(name, event => tag(event.target?.closest?.(selector)), true);
  }
})();
