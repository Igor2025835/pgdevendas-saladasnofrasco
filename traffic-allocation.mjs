export const cookieName = 'saladas_landing_v1';
const pages = new Set(['/', '/index.html', '/gro', '/gro/', '/gro/index.html']);
const valid = value => value === 'pg1' || value === 'gro';

// Only landing documents participate. Assets and recovery offers stay independent.
export function allocateLanding(input, cookie = '') {
  const url = new URL(input);
  if (!pages.has(url.pathname)) return null;
  const saved = cookie.split(';').map(part => part.trim()).find(part => part.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
  const source = url.searchParams.get('src');
  // GRO is now the default for every visitor, including prior PG1 assignments.
  const variant = 'gro';
  if (source && !valid(source) && !url.searchParams.has('ad_src')) url.searchParams.set('ad_src', source);
  // Do not reserialize an already-correct query. Vercel may normalize + to %20
  // between requests; comparing those encodings after .set() causes a loop.
  if (source !== variant || url.searchParams.getAll('src').length !== 1) url.searchParams.set('src', variant);
  url.pathname = '/gro';
  const headers = {
    'Cache-Control': 'private, no-store',
    'Vary': 'Cookie',
    'X-Landing-Variant': variant,
  };
  if (saved !== variant) headers['Set-Cookie'] = `${cookieName}=${variant}; Path=/; Max-Age=2592000; SameSite=Lax; HttpOnly${url.protocol === 'https:' ? '; Secure' : ''}`;
  return {variant, headers, redirect: url.href === new URL(input).href ? null : url.href};
}
