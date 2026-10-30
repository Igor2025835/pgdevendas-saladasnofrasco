import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const main=fs.readFileSync('dist/index.html','utf8');
const gro=fs.readFileSync('dist/gro/index.html','utf8');
const attributes=['src','href','poster','data-src','data-preview-src','data-full-src','data-src-small','data-src-large','data-conversation-image'];
const files=html=>{
 const values=[...html.matchAll(new RegExp('\\b(?:'+attributes.join('|')+')="([^"#]+)"','g'))].map(m=>m[1]);
 for(const m of html.matchAll(/\bsrcset="([^"]+)"/g))for(const part of m[1].split(','))values.push(part.trim().split(/\s+/)[0]);
 return values.filter(value=>!/^https?:|mailto:/.test(value));
};

test('GRO preserves all original image/video files and resolves local files on every route form',()=>{
 for(const url of files(gro)){
  assert.ok(url.startsWith('/'),url);
  assert.ok(fs.existsSync(path.join('dist',url.split('?')[0])),url);
 }
 const inherited=files(main).filter(url=>/^assets\//.test(url));
 const actual=new Set(files(gro));
 for(const url of inherited)assert.ok(actual.has('/'+url),'Lost media: '+url);
 assert.equal((gro.match(/<video\b/g)||[]).length,(main.match(/<video\b/g)||[]).length);
 assert.ok(!gro.includes('<base '));
 assert.ok(gro.includes('href="#oferta"'));
 assert.ok(gro.includes('data-preview-src="/assets/hero-aula-loop-5s-v1.mp4"'));
 assert.ok(gro.includes('data-full-src="/assets/metodo-aula-previa-v1.mp4"'));
});

test('GRO has one H1, mandatory copy, media in every section and pain immediately after hero',()=>{
 assert.equal((gro.match(/<h1\b/g)||[]).length,1);
 assert.ok(gro.includes('Pára de mentir a ti mesma.'));
 assert.ok(gro.includes('O resultado também.'));
 assert.ok(gro.includes('Eu devolvo 100%. Sem perguntas.'));
 assert.ok(gro.includes('saborosas e rápidas</em> para teres sempre em casa — que nem parecem “comida de dieta”.'));
 const sections=[...gro.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/g)].map(m=>m[0]);
 assert.ok(sections.length>=10);
 for(const section of sections)assert.match(section,/<(?:img|video)\b/,'Section without media: '+section.slice(0,100));
 assert.ok(sections[0].includes('hero-lesson-video'));
 assert.ok(sections[1].includes('id="gro-dores"'));
 const hero=sections[0];
 assert.ok(hero.indexOf('class="hero-action"')<hero.indexOf('<video'));
 assert.equal((gro.match(/class="routine-section/g)||[]).length,1);
 assert.ok(!main.includes('gro-dores'));
 assert.ok(!gro.includes('</h2><figure class="gro-faq-media"'));
});

test('GRO keeps regular and reduced checkouts consistent with their CTAs and tracking',()=>{
 assert.ok(gro.includes('<strong>14</strong><span class="plan-price-cents">,90</span>'));
 const approved=new Set(['Quero as minhas saladas prontas esta semana','Quero parar de comer saladas sem graça','Garantir o meu acesso agora – 7,90€','Sim, quero o plano completo antes que acabe']);
 for(const match of gro.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)){
  const attrs=match[1];
  const classes=attrs.match(/class="([^"]*)"/)?.[1].split(/\s+/)||[];
  if(!classes.some(name=>['button','elementor-button','text-link','exit-offer-checkout'].includes(name)))continue;
  const label=match[2].replace(/<svg\b[\s\S]*?<\/svg>/g,'').trim();
  assert.ok(approved.has(label),label);
  const href=attrs.match(/href="([^"]+)"/)?.[1];
  if(label.includes('7,90'))assert.ok(href.includes('off=j1f0nk4j')&&href.includes('src=backredirect'));
  else assert.ok(href==='#oferta'||href==='https://pay.hotmart.com/O108101669E?checkoutMode=10');
 }
 for(const script of ['scripts/utms/latest.js','scripts/pixel/pixel.js','hero-lesson.js?v=','recovery-attribution.js?v=','exit-offer.js?v='])assert.equal(gro.split(script).length-1,1,script);
 assert.ok(gro.includes('z0pryz1i8w'));
 assert.ok(!gro.includes("fbq('init'"));
});
