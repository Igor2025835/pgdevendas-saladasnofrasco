import {test} from 'node:test';
import assert from 'node:assert/strict';
import {allocateLanding,cookieName} from '../traffic-allocation.mjs';
import proxy from '../traffic-router.js';

test('all landing entries default to GRO and receive its source and cookie',()=>{
 for(const path of ['/','/index.html','/gro','/gro/','/gro/index.html']){
  const r=allocateLanding('https://saladas.test'+path);
  assert.equal(r.variant,'gro');
  assert.match(r.headers['Set-Cookie'],new RegExp(`${cookieName}=gro; Path=/; Max-Age=2592000; SameSite=Lax; HttpOnly; Secure`));
  const url=new URL(r.redirect);assert.equal(url.searchParams.get('src'),'gro');
  assert.equal(url.pathname,'/gro');
 }
});
test('old PG1 cookies and source parameters cannot send visitors to the retired default',()=>{
 for(const variant of ['pg1','gro','invalid'])assert.equal(allocateLanding('https://s.test/',`${cookieName}=${variant}`).variant,'gro');
 assert.equal(allocateLanding('https://s.test/gro',`${cookieName}=pg1`).variant,'gro');
 assert.equal(allocateLanding('https://s.test/?src=pg1',`${cookieName}=gro`).variant,'gro');
 assert.equal(allocateLanding('https://s.test/?src=gro',`${cookieName}=pg1`).variant,'gro');
 assert.match(allocateLanding('https://s.test/',`${cookieName}=pg1`).headers['Set-Cookie'],/saladas_landing_v1=gro/);
});
test('redirects retain all ad parameters and finish without loops on all landing paths',()=>{
 for(const encoded of ['check%20%26%20keep','check+%26+keep']){
  assert.equal(new URL(allocateLanding('https://s.test/?src=pg1&utm_campaign='+encoded,`${cookieName}=pg1`).redirect).pathname,'/gro');
  assert.equal(allocateLanding('https://s.test/gro?src=gro&utm_campaign='+encoded,`${cookieName}=gro`).redirect,null);
 }
 for(const path of ['/','/index.html','/gro','/gro/','/gro/index.html']){
  const input=new URL('https://s.test'+path+'?utm_source=meta&utm_campaign=Ol%C3%A1+%26+teste&fbclid=abc&sck=encoded&src=ad123#oferta');
  const r=allocateLanding(input.href),target=new URL(r.redirect);
  for(const [key,value] of input.searchParams)if(key!=='src')assert.equal(target.searchParams.get(key),value);
  assert.equal(target.searchParams.get('ad_src'),'ad123');assert.equal(target.hash,'#oferta');
  assert.equal(allocateLanding(target.href,`${cookieName}=${r.variant}`).redirect,null);
  assert.equal(r.headers['Cache-Control'],'private, no-store');
 }
 for(const path of ['/assets/file.webp','/backredirect','/v2','/v3','/gro.css'])assert.equal(allocateLanding('https://s.test'+path),null);
});
test('middleware redirects before rendering and continues final documents without caching assignment',()=>{
 const r=proxy(new Request('https://s.test/?src=gro&utm_campaign=keep'));
 assert.equal(r.status,302);assert.equal(new URL(r.headers.get('location')).pathname,'/gro');assert.equal(new URL(r.headers.get('location')).searchParams.get('utm_campaign'),'keep');
 const next=proxy(new Request('https://s.test/gro?src=gro',{headers:{cookie:cookieName+'=gro'}}));
 assert.equal(next.headers.get('x-middleware-next'),'1');assert.equal(next.headers.get('x-landing-variant'),'gro');assert.equal(next.headers.get('set-cookie'),null);
 assert.equal(proxy(new Request('https://s.test/',{method:'POST'})).headers.get('location'),null);
});
