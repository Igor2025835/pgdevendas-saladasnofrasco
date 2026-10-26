import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const main=fs.readFileSync('dist/index.html','utf8');
const v2=fs.readFileSync('dist/v2/index.html','utf8');
const snapshot=fs.readFileSync('reference-original/v2-page.html','utf8');
const headline=html=>html.match(/<h1>[\s\S]*?<\/h1>/)?.[0];
const assets=html=>new Set([...html.matchAll(/\b(?:src|poster|data-src|data-src-small|data-src-large|data-conversation-image)="\/?(assets\/[^" ]+)"/g)].map(m=>m[1]));
const bodyText=html=>html.slice(Math.max(0,html.indexOf('<body'))).replace(/<h1>[\s\S]*?<\/h1>/,'HEADLINE').replace(/<script\b[\s\S]*?<\/script>/g,'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();

test('V1 restores the old headline while V2 preserves the current approved version',()=>{
 assert.ok(headline(main).includes('que nem parecem “comida de dieta”'));
 assert.equal(headline(v2),'<h1>Nunca mais vais querer comer salada <em>de outra forma.</em></h1>');
 assert.equal(headline(v2),headline(snapshot));
 assert.equal(bodyText(v2),bodyText(snapshot));
 // V1 now restores the full historical hero, while the remainder stays shared.
 const afterHero=html=>bodyText(html.slice(html.indexOf('<div class="elementor elementor-11737 original-reference">')));
 assert.equal(afterHero(main),afterHero(v2));
 assert.equal((v2.match(/id="avaliacoes"/g)||[]).length,1);
 assert.ok(v2.indexOf('id="avaliacoes"')<v2.indexOf('id="camadas"'));
 assert.ok(v2.includes('id="saladas-com-sabor"'));
});

test('V2 retains every approved media file and uses valid root-relative asset paths',()=>{
 assert.deepEqual(assets(v2),assets(snapshot));
 for(const match of v2.matchAll(/\b(?:src|href|poster|data-src|data-src-small|data-src-large|data-conversation-image)="([^"#]+)"/g)){
  const url=match[1];if(/^https?:|^mailto:/.test(url))continue;
  assert.ok(url.startsWith('/'),'Relative path at /v2: '+url);
  assert.ok(fs.existsSync(path.join('dist',url.split('?')[0])),'Missing file: '+url);
 }
 for(const match of v2.matchAll(/\bsrcset="([^"]+)"/g))for(const candidate of match[1].split(',')){
  const url=candidate.trim().split(/\s+/)[0];assert.ok(url.startsWith('/assets/'));assert.ok(fs.existsSync(path.join('dist',url)));
 }
 assert.ok(!v2.includes('<base '),'Local anchors must stay on V2');
 assert.ok(v2.includes('href="/v2-page.css?v='));
 assert.ok(!v2.includes('href="/v1.css'));
});

test('V2 retains the normal checkout, recovery attribution, price and tracking',()=>{
 const checkout=v2.match(/<a class="button button-primary plan-checkout" href="([^"]+)"/)?.[1];
 assert.equal(checkout,'https://pay.hotmart.com/O108101669E?checkoutMode=10');
 assert.equal((v2.match(/href="#oferta"/g)||[]).length,13);
 for(const token of ['off=j1f0nk4j','src=backredirect','6ad68f89ef79f1bfa2555745','z0pryz1i8w','data-utmify-prevent-subids','14 dias para experimentar.'])assert.ok(v2.includes(token),token);
 assert.ok(!v2.includes("fbq('init'"));
 assert.match(v2,/<strong>11<\/strong><span class="plan-price-cents">,90<\/span>\s*<span class="plan-price-currency">€<\/span>/);
});

test('V2 preserves lazy autoplay, click-to-play tutorial and review enlargement',()=>{
 const hero=v2.match(/<video\b[^>]*id="hero-preview-video"[^>]*>/)?.[0];assert.ok(hero);
 assert.ok(!/\s(?:src|poster)=/.test(hero));
 for(const attr of ['autoplay','muted','loop','playsinline','preload="none"','width="1080"','height="1584"'])assert.ok(hero.includes(attr));
 const tutorial=v2.match(/<video\b[^>]*id="method-preview-video"[^>]*>/)?.[0];assert.ok(tutorial&&!tutorial.includes('autoplay'));
 for(const token of ['class="video-dialog"','id="video-offer"','id="year"','id="conversation-dialog"','id="exit-offer"'])assert.ok(v2.includes(token),token);
 for(let i=1;i<=5;i++)assert.ok(v2.includes(`avaliacao-foto-0${i}-out2026-600.webp`));
});
