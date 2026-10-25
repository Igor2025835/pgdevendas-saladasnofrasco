import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const main=fs.readFileSync('dist/index.html','utf8');
const v2=fs.readFileSync('dist/v2/index.html','utf8');
const assets=html=>new Set([...html.matchAll(/\b(?:src|poster|data-src|data-src-small|data-src-large|data-conversation-image)="\/?(assets\/[^" ]+)"/g)].map(m=>m[1]));

test('V2 has the seven requested sections in order, one headline and ten FAQ answers',()=>{
 assert.deepEqual([...v2.matchAll(/data-step="(\d+)"/g)].map(m=>m[1]),['1','2','3','4','5','6','7']);
 assert.equal([...v2.matchAll(/<h1\b/g)].length,1);
 assert.equal([...v2.matchAll(/<details>/g)].length,10);
 assert.ok(v2.indexOf('id="avaliacoes"')<v2.indexOf('id="oferta"'));
 assert.ok(v2.indexOf('id="garantia"')>v2.indexOf('id="oferta"'));
});

test('every original image, loop and video is retained with working root-relative paths',()=>{
 const originals=assets(main),reused=assets(v2);
 for(const asset of originals)assert.ok(reused.has(asset),'Missing original visual: '+asset);
 for(const match of v2.matchAll(/\b(?:src|href|poster|data-src|data-src-small|data-src-large|data-conversation-image)="([^"#]+)"/g)){
  const url=match[1];if(/^https?:|^mailto:/.test(url))continue;
  assert.ok(url.startsWith('/'),'Relative path at /v2: '+url);
  assert.ok(fs.existsSync(path.join('dist',url.split('?')[0])),'Missing file: '+url);
 }
 for(const match of v2.matchAll(/\bsrcset="([^"]+)"/g)){
  for(const candidate of match[1].split(',')){
   const url=candidate.trim().split(/\s+/)[0];assert.ok(url.startsWith('/assets/'));assert.ok(fs.existsSync(path.join('dist',url)));
  }
 }
 assert.equal([...v2.matchAll(/<video\b/g)].length,[...main.matchAll(/<video\b/g)].length);
 assert.ok(!v2.includes('<base '),'A base URL would send #oferta to the original page');
});

test('V2 keeps normal and recovery offers distinct and retains UTMify and Clarity',()=>{
 const checkout=v2.match(/<a class="button button-primary plan-checkout" href="([^"]+)"/)?.[1];
 assert.equal(checkout,'https://pay.hotmart.com/O108101669E?checkoutMode=10');
 assert.ok(v2.includes('off=j1f0nk4j&amp;')||v2.includes('off=j1f0nk4j&'));
 assert.ok(v2.includes('src=backredirect'));
 for(const token of ['6ad68f89ef79f1bfa2555745','z0pryz1i8w','data-utmify-prevent-subids'])assert.ok(v2.includes(token));
 assert.ok(!v2.includes("fbq('init'"));
 assert.ok(v2.includes('<strong>11</strong><span class="plan-price-cents">,90</span><span class="plan-price-currency">€</span>'));
 assert.ok(v2.includes('14 dias para experimentar.'));
 for(const link of [...v2.matchAll(/<a class="button button-primary" href="([^"]+)"/g)])assert.equal(link[1],'#oferta');
});

test('V2 keeps lazy native-ratio hero, click-to-play tutorial and modal dependencies',()=>{
 const hero=v2.match(/<video\b[^>]*id="hero-preview-video"[^>]*>/)?.[0];assert.ok(hero);
 assert.ok(!/\s(?:src|poster)=/.test(hero));
 for(const attr of ['autoplay','muted','loop','playsinline','preload="none"','width="1080"','height="1584"'])assert.ok(hero.includes(attr));
 const tutorial=v2.match(/<video\b[^>]*id="method-preview-video"[^>]*>/)?.[0];assert.ok(tutorial&&!tutorial.includes('autoplay'));
 for(const token of ['class="video-dialog"','id="video-offer"','id="year"','id="conversation-dialog"','id="exit-offer"'])assert.ok(v2.includes(token),token);
});

test('the product mockup is exclusive to the offer and hero reassurance follows the video',()=>{
 const contents=v2.slice(v2.indexOf('id="receber"'),v2.indexOf('id="bonus"'));
 assert.ok(!contents.includes('plan-bundle'));
 assert.equal([...v2.matchAll(/<img class="plan-material plan-bundle"/g)].length,1);
 const hero=v2.slice(v2.indexOf('class="hero v2-hero"'),v2.indexOf('id="receber"'));
 assert.ok(!hero.includes('class="v2-eyebrow"'));
 assert.ok(!hero.includes('hero-badge'));
 assert.ok(hero.indexOf('v2-preservation-promise')>hero.indexOf('id="hero-preview-video"'));
 assert.ok(hero.includes('v2-hero-trust'));
 assert.equal([...hero.matchAll(/<li>/g)].length,3);
 for(const value of ['Acesso por e-mail','Pagamento único','14 dias de garantia'])assert.ok(hero.includes(value));
});
