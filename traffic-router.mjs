import {allocateLanding} from './traffic-allocation.mjs';

export default function proxy(request) {
  const allocation = ['GET', 'HEAD'].includes(request.method)
    ? allocateLanding(request.url, request.headers.get('cookie') || '') : null;
  const headers = new Headers(allocation?.headers);
  if (allocation?.redirect) {
    headers.set('Location', allocation.redirect);
    return new Response(null, {status: 302, headers});
  }
  // Native equivalent of @vercel/functions next(); no runtime dependency needed.
  headers.set('x-middleware-next', '1');
  return new Response(null, {headers});
}
