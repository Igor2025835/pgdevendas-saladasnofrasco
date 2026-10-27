import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const html=fs.readFileSync('dist/v3/index.html','utf8');
const snapshot=fs.readFileSync('reference-original/v3-page.html','utf8');
const text=source=>source.slice(source.indexOf('<body')).replace(/<script\b[\s\S]*?<\/script>/g,'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
test('V3 preserves all the prior V1 copy including its badge and headline',()=>{
 assert.equal(text(html),text(snapshot));
 assert.ok(html.includes('Saudáveis, fáceis e deliciosas.'));
 assert.ok(html.includes('class="elementor-kit-5 sales-v1 variant-v3"'));
 assert.ok(!fs.readFileSync('dist/v3-page.css','utf8').includes('.hero h1{font-size:42px'));
 assert.ok(fs.readFileSync('dist/index.html','utf8').includes('id="hero-lesson-video"'));
});
test('V3 resolves media and scripts on all route forms without moving internal anchors to V1',()=>{
 for(const match of html.matchAll(/\b(?:src|href|poster|data-src|data-preview-src|data-full-src|data-conversation-image)="([^"#]+)"/g)){
  const url=match[1];if(/^https?:|mailto:/.test(url))continue;
  assert.ok(url.startsWith('/'),url);
  assert.ok(fs.existsSync(path.join('dist',url.split('?')[0])),url);
 }
 for(const match of html.matchAll(/\bsrcset="([^"]+)"/g))for(const item of match[1].split(',')){
  const url=item.trim().split(/\s+/)[0];assert.ok(url.startsWith('/assets/'));assert.ok(fs.existsSync(path.join('dist',url)));
 }
 assert.ok(!html.includes('<base '));
 assert.ok(html.includes('href="#oferta"'));
 for(const file of ['v3-page.css','v3-hero.js','v3-layout.js'])assert.ok(html.includes('/'+file+'?v='));
 assert.ok(!html.includes('src="/v1-layout.js'));
 assert.ok(!html.includes('href="/v1.css'));
});
test('V3 retains checkout, price, tracking, silent excerpt and full lesson',()=>{
 for(const token of ['https://pay.hotmart.com/O108101669E?checkoutMode=10','off=j1f0nk4j','src=backredirect','6ad68f89ef79f1bfa2555745','z0pryz1i8w','hero-aula-loop-5s-v1.mp4','metodo-aula-previa-v1.mp4'])assert.ok(html.includes(token),token);
 assert.match(html,/<strong>11<\/strong><span class="plan-price-cents">,90<\/span>\s*<span class="plan-price-currency">€<\/span>/);
 assert.ok(!html.includes("fbq('init'"));
});
