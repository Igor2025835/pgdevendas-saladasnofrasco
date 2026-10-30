import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';

// GRO is an independent route built from the current main page.
let html=await fs.readFile('dist/index.html','utf8');
const checkout='https://pay.hotmart.com/O108101669E?checkoutMode=10';
const primary='Quero as minhas saladas prontas esta semana';
const painCta='Quero parar de comer saladas sem graça';
const completeCta='Sim, quero o plano completo antes que acabe';
const arrow='<svg aria-hidden="true"><use href="#arrow"/></svg>';
const cta=(label,href='#oferta')=>`<div class="section-plan-cta"><a class="button button-primary" href="${href}">${label}${arrow}</a></div>`;
const photo=(file,alt,extra='')=>`<img src="assets/${file}" alt="${alt}" loading="lazy" decoding="async" ${extra}>`;

function elementRange(source,marker,tag='div'){
 const at=source.indexOf(marker);
 if(at<0)throw Error('Missing element: '+marker);
 const start=source.lastIndexOf('<'+tag,at);
 const tags=new RegExp('<\\/?'+tag+'\\b[^>]*>','g');
 tags.lastIndex=start;
 let depth=0;
 for(let match;(match=tags.exec(source));){
  depth+=match[0].startsWith('</')?-1:1;
  if(depth===0)return {start,end:tags.lastIndex,markup:source.slice(start,tags.lastIndex)};
 }
 throw Error('Unclosed element: '+marker);
}

const hero=html.match(/<section class="hero">[\s\S]*?<\/section>/)?.[0];
if(!hero)throw Error('Missing original hero');
const heroMedia=elementRange(hero,'class="hero-main-image hero-lesson-media"').markup;
const newHero=`<section class="hero gro-hero" aria-labelledby="gro-title"><div class="wrap">
 <h1 id="gro-title"><span class="gro-hook">Pára de mentir a ti mesma.</span><span class="gro-hook-explanation">Enquanto continuares com saladas e dietas sem sabor, nunca vais alcançar o corpo e a rotina que queres.</span></h1>
 <p class="gro-warning">E vais desistir outra vez daqui a poucos dias… como sempre.</p>
 ${heroMedia}
 <p class="gro-value">60 receitas de saladas <em>saborosas e rápidas</em> para teres sempre em casa — que nem parecem “comida de dieta”.</p>
 <p class="gro-support">Prepara as saladas da semana em menos de 20 minutos e conserva-as até 7 dias sem murcharem.</p>
 <div class="hero-action"><a class="button button-primary" href="#oferta">${primary}${arrow}</a></div>
 </div></section>`;
const tasteSection=html.match(/<section class="contents-taste-section"[\s\S]*?<\/section>/)?.[0];
if(!tasteSection)throw Error('Missing original taste video section');
// Keep its heading, video and CTA together inside the pain/method section.
const tasteContent=tasteSection.replace('<section class="contents-taste-section"','<div class="contents-taste-section gro-pain-taste"').replace(/<\/section>$/,'</div>');
html=html.replace(tasteSection,'');
const comparisonImage=(side,alt,height)=>photo(`gro-comparacao-${side}-v1-640.webp`,alt,`srcset="assets/gro-comparacao-${side}-v1-640.webp 640w, assets/gro-comparacao-${side}-v1-1168.webp 1168w" sizes="(max-width: 700px) calc(200vw - 64px), 900px" width="1168" height="${height}"`);
const pain=`<section class="routine-section gro-pain" id="gro-dores" aria-labelledby="gro-pain-title"><div class="review-wrap">
 <h2 class="review-heading" id="gro-pain-title">Isto acontece contigo?</h2>
 <div class="gro-pain-layout"><figure class="gro-pain-image gro-before-after" aria-label="Comparação entre a rotina de encomendar comida e a preparação de saladas saborosas">
 <picture class="gro-comparison-panel gro-comparison-before">${comparisonImage('antes','Antes: mulher frustrada à mesa com pizza, hambúrguer e batatas fritas',784)}</picture>
 <picture class="gro-comparison-panel gro-comparison-after">${comparisonImage('depois','Depois: mulher com saladas em frascos, frango, carne, atum e molhos cremosos',783)}</picture>
 </figure><div>
 <ul class="routine-grid gro-pain-list">
 <li class="routine-item"><span><svg aria-hidden="true"><use href="#leaf"/></svg></span><p>Queres comer saudável mas as saladas que fazes são sem graça e enjoam em 2 dias</p></li>
 <li class="routine-item"><span><svg aria-hidden="true"><use href="#clock"/></svg></span><p>Dizes “amanhã começo” e amanhã já estás a pedir delivery</p></li>
 <li class="routine-item"><span><svg aria-hidden="true"><use href="#jar"/></svg></span><p>Gastas 8-12€ numa salada de restaurante e ainda ficas com fome</p></li>
 <li class="routine-item"><span><svg aria-hidden="true"><use href="#leaf"/></svg></span><p>A alface murcha, o dinheiro vai pelo ralo e a culpa fica</p></li>
 </ul></div></div><div class="gro-method-answer"><p class="gro-pain-answer">Se isto é a tua realidade, o problema não és tu.<strong>É o método.</strong></p></div>
 ${tasteContent}</div></section>`;
// Keep the pain section immediately after the hero, avoiding repetition.
html=html.replace(/<section class="routine-section">[\s\S]*?<\/section>/,'');
html=html.replace(hero,newHero+pain);
html=html.replace('class="elementor-kit-5 sales-v1"','class="elementor-kit-5 sales-v1 sales-gro"');
const announcement=`<aside class="gro-announcement" aria-label="Promoção de aniversário"><div class="gro-announcement-inner"><p><strong>Promoção de aniversário · Acesso vitalício</strong><span data-gro-promo-message>Cerca de 70% de desconto</span></p><div class="gro-announcement-timer" data-gro-timer-wrap><span>Termina em</span><span id="gro-countdown" role="timer" aria-live="off" aria-label="1 hora e 53 minutos">01:53:00</span></div></div></aside>`;
html=html.replace(/(<body\b[^>]*>)/,'$1'+announcement);
html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>Saladas prontas esta semana — Saladas Saborosas no Frasco</title>');
html=html.replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="Muda o método: 60 receitas de saladas saborosas e rápidas, molhos, aulas e app para teres as refeições da semana organizadas.">');

const guarantee='<div class="plan-guarantee gro-guarantee"><svg aria-hidden="true"><use href="#shield"/></svg><p><strong>Tens 14 dias completos para testar.</strong>Se não ficares viciada nas saladas, se não poupares tempo e dinheiro, se não notares diferença… é só pedir o reembolso. Eu devolvo 100%. Sem perguntas.</p></div>';
html=html.replace(/<div class="plan-guarantee">[\s\S]*?<\/div>/,guarantee);
html=html.replace('<div class="plan-price">','<div class="plan-price"><p class="gro-price-before">Antes <del>47 €</del></p>');

// The inherited FAQ is an Elementor container. Give it a genuine media-led section.
const faq=elementRange(html,'data-id="3d6ee6f"');
const faqMedia=`<figure class="gro-faq-media">${photo('conservacao-pt-20min-v1-800.webp','Saladas organizadas no frigorífico e preparação das refeições da semana','width="800" height="800"')}</figure>`;
const faqHeading=elementRange(faq.markup,'data-widget_type="divider.default"');
const faqMarkup=faq.markup.slice(0,faqHeading.end).replace(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/,'<h2$1>$2</h2>')+faqMedia+faq.markup.slice(faqHeading.end);
html=html.slice(0,faq.start)+'<section class="gro-faq" aria-label="Dúvidas frequentes">'+faqMarkup+'</section>'+html.slice(faq.end);

const closing=`<section class="gro-closing section" aria-labelledby="gro-closing-title"><div class="review-wrap">
 <h2 id="gro-closing-title">Daqui a sete dias vais estar numa destas duas realidades:</h2>
 <div class="gro-closing-layout"><figure>${photo('original-11.webp','Uma refeição de salada proteica pronta a servir','width="1080" height="1350"')}</figure><ol class="gro-realities">
 <li>A comer saladas sem graça outra vez (ou a pedir delivery), a adiar os teus objetivos e a sentir que falhaste de novo e a mesma frustração de sempre.</li>
 <li>A abrir o frigorífico e ter refeições prontas, saborosas e organizadas… a comer saudável de verdade, a perder peso ou a manter a forma sem sofrer, e a sentir que desta vez foi diferente.</li>
 </ol></div>
 <div class="gro-decision"><p><strong>Não existe meio-termo.</strong><br>A escolha é tua. O resultado também.</p><p>Ou mudas o método agora, ou aceitas o resultado de sempre.</p></div>
 ${cta(completeCta)}</div></section>`;
html=html.replace('<section class="purchase-section purchase-plans"',closing+'<section class="purchase-section purchase-plans"');

// Make every sales CTA one of the approved lines. The €7.90 claim appears ONLY
// on the existing reduced checkout, which has its own Hotmart offer parameter.
let normalCta=0;
const offerStart=html.indexOf('id="oferta"');
html=html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/g,(all,attrs,body,offset)=>{
 const classes=attrs.match(/\bclass="([^"]*)"/)?.[1].split(/\s+/)||[];
 if(!classes.some(name=>['button','elementor-button','text-link','exit-offer-checkout'].includes(name)))return all;
 if(classes.includes('exit-offer-checkout'))return '<a'+attrs+'>Garantir o meu acesso agora – 7,90€'+arrow+'</a>';
 const isCheckout=classes.includes('plan-checkout')||offset>offerStart;
 const destination=isCheckout?checkout:'#oferta';
 const label=isCheckout||body.includes(completeCta)?completeCta:(normalCta++%2===0?primary:painCta);
 attrs=attrs.replace(/\bhref="[^"]*"/,`href="${destination}"`);
 return '<a'+attrs+'>'+label+arrow+'</a>';
});

// Root-relative files support /gro, /gro/ and /gro/index.html while #oferta
// remains on GRO. Do not use <base>, which would move local anchors to V1.
html=html.replace(/\b(src|href|poster|data-src|data-preview-src|data-full-src|data-src-small|data-src-large|data-conversation-image)="((?:assets|reference-css)\/[^" ]+|(?:[\w-]+\.(?:css|js))(?:\?[^" ]*)?)"/g,'$1="/$2"')
 .replace(/\bsrcset="([^"]+)"/g,(_,list)=>`srcset="${list.replace(/(^|,\s*)(assets\/)/g,'$1/$2')}"`);
const cssHash=createHash('sha256').update(await fs.readFile('dist/gro.css')).digest('hex').slice(0,10);
html=html.replace('</head>',`<link rel="stylesheet" href="/gro.css?v=${cssHash}"></head>`);
const promoHash=createHash('sha256').update(await fs.readFile('dist/gro-promo.js')).digest('hex').slice(0,10);
html=html.replace('</body>',`<script src="/gro-promo.js?v=${promoHash}" defer></script></body>`);
await fs.mkdir('dist/gro',{recursive:true});
await fs.writeFile('dist/gro/index.html',html+'\n');
console.log('GRO criada: copy direta, dores após o vídeo, garantia e fecho com todos os assets locais.');
