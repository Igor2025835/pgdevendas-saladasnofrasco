export const cookieName = 'saladas_landing_v1';
const pages = new Map([['/', 'pg1'], ['/index.html', 'pg1'], ['/gro', 'gro'], ['/gro/', 'gro'], ['/gro/index.html', 'gro']]);
const valid = value => value === 'pg1' || value === 'gro';

// Only landing documents participate. Assets and recovery offers stay independent.
export function allocateLanding(input, cookie = '', random = Math.random) {
  const url = new URL(input);
  const route = pages.get(url.pathname);
  if (!route) return null;
  const saved = cookie.split(';').map(part => part.trim()).find(part => part.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
  const source = url.searchParams.get('src');
  const variant = route === 'gro' ? 'gro' : valid(source) ? source : valid(saved) ? saved : random() < 0.5 ? 'pg1' : 'gro';
  if (source && !valid(source) && !url.searchParams.has('ad_src')) url.searchParams.set('ad_src', source);
  url.searchParams.set('src', variant);
  url.pathname = variant === 'gro' ? '/gro' : '/';
  const headers = {
    'Cache-Control': 'private, no-store',
    'Vary': 'Cookie',
    'X-Landing-Variant': variant,
  };
  if (saved !== variant) headers['Set-Cookie'] = `${cookieName}=${variant}; Path=/; Max-Age=2592000; SameSite=Lax; HttpOnly${url.protocol === 'https:' ? '; Secure' : ''}`;
  return {variant, headers, redirect: url.href === new URL(input).href ? null : url.href};
}
