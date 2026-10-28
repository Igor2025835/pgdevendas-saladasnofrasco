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

test('V1 restores its original headline while V2 preserves its approved version',()=>{
 assert.equal(headline(main),'<h1>60 receitas de saladas <em>saborosas e rápidas</em> para teres sempre em casa, que nem parecem “comida de dieta”.</h1>');
 assert.ok(!main.includes('class="hero-subheadline"'));
 assert.equal(headline(v2),'<h1>Nunca mais vais querer comer salada <em>de outra forma.</em></h1>');
 assert.equal(headline(v2),headline(snapshot));
 assert.equal(bodyText(v2),bodyText(snapshot));
 // V1 evolves independently; V2's content remains equal to its approved snapshot.
 assert.equal((v2.match(/id="avaliacoes"/g)||[]).length,1);
 assert.ok(v2.indexOf('id="avaliacoes"')<v2.indexOf('id="camadas"'));
 assert.ok(v2.includes('id="saladas-com-sabor"'));
});

test('V1 compacts the gallery and reviews, removes the duplicate lesson and highlights purchase conditions',()=>{
 assert.ok(!main.includes('id="camadas"'));
 assert.ok(!main.includes('id="method-preview-video"'));
 assert.ok(main.includes('id="hero-lesson-video"'));
 const gallery=main.match(/<section class="reference-recipes"[\s\S]*?<\/section>/)[0];
 assert.equal((gallery.match(/class="elementor-image-box-img"/g)||[]).length,7);
 assert.ok(!gallery.includes('data-id="16eb5619"'));
 assert.equal((gallery.match(/href="#oferta"/g)||[]).length,1);
 assert.ok(gallery.indexOf('class="recipe-more-card"')>gallery.indexOf('data-id="a46f175"'));
 const reviews=main.match(/<section class="conversation-section"[\s\S]*?<\/section>/)[0];
 assert.equal((reviews.match(/class="conversation-card">/g)||[]).length,9);
 assert.equal((reviews.match(/class="conversation-card" aria-hidden="true"/g)||[]).length,9);
 assert.ok(reviews.includes('id="reviews-track"'));
 assert.ok(!reviews.includes('conversation-navigation'));
 assert.ok(!reviews.includes('Vê as avaliações e toca para ampliar.'));
 assert.ok(main.includes(reviews+'<section class="new-bonuses section"'));
 const names=[...reviews.matchAll(/aria-label="Ampliar a avaliação de ([^"]+)"/g)].slice(0,3).map(m=>m[1]);
 assert.deepEqual(names,['Beatriz Lopes','Sónia Ferreira','Carla Mendes']);
 const offer=main.match(/<section class="purchase-section[\s\S]*?<\/section>/)[0];
 assert.ok(offer.indexOf('plan-checkout')<offer.indexOf('class="plan-assurances"'));
 for(const text of ['Acesso enviado por e-mail','Pagamento único','14 dias de garantia'])assert.ok(offer.includes(text));
 assert.ok(!v2.includes('reviews-track'));
 assert.ok(!v2.includes('plan-assurances'));
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
