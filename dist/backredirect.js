(() => {
  const remember = key => { try { sessionStorage.setItem(key, '1'); } catch {} };
  // Visiting this page is already the recovery step: do not send visitors back here.
  remember('saladas:exit-redirect:used:v2');
  document.addEventListener('click', event => {
    const link = event.target?.closest?.('a[href]');
    if (link && new URL(link.href, location.href).hostname === 'pay.hotmart.com') remember('saladas:checkout-started:v1');
  }, true);
  document.querySelector('.bd-decline')?.addEventListener('click', () => {
    if (history.length > 1) history.back();
    else location.replace('/');
  });
})();
