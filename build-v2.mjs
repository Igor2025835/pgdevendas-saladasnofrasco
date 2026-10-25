import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';

// Build the alternative from the current page so media, reviews and FAQ stay in sync.
const main=await fs.readFile('dist/index.html','utf8');
const take=(pattern,label)=>{const value=main.match(pattern)?.[0];if(!value)throw Error('V2 missing '+label);return value;};
function section(marker){
 const start=main.lastIndexOf('<section',main.indexOf(marker));
 if(start<0)throw Error('V2 section missing '+marker);
 let depth=0;
 for(const token of main.slice(start).matchAll(/<\/?section\b[^>]*>/g)){
  depth+=token[0].startsWith('</')?-1:1;
  if(!depth)return main.slice(start,start+token.index+token[0].length);
 }
 throw Error('V2 unclosed section '+marker);
}
const icon=name=>`<svg aria-hidden="true"><use href="#${name}"/></svg>`;
const cta=(label='Quero as minhas saladas saborosas')=>`<a class="button button-primary" href="#oferta">${label}${icon('arrow')}</a>`;
const header=take(/<header\b[\s\S]*?<\/header>/,'header');
const footer=take(/<footer\b[\s\S]*?<\/footer>/,'footer');
const video=take(/<video\b[^>]*id="hero-preview-video"[^>]*><\/video>/,'hero video');
const bundle=take(/<img class="plan-material plan-bundle"[^>]*>/,'product mockup');
const fridge=take(/<img class="contents-fridge-image"[^>]*>/,'fridge');
const contentsVideo=take(/<div class="contents-video-frame">[\s\S]*?<\/div>/,'contents loop');
const lesson=section('id="camadas"');
const preview=lesson.match(/<div class="reference-video method-video-shell">[\s\S]*?<\/button><\/div><\/div>/)?.[0];
if(!preview)throw Error('V2 missing lesson preview');
const methodPhotos=[...lesson.matchAll(/<img class="method-photo"[^>]*>/g)].map(m=>m[0]).join('');
const names=['Refrescante com molho cítrico','Caprese','Caesar com molho original','Big Mac com molho especial','Mediterrânea com molho agridoce','Toscana com molho siciliano','Rústica com mostarda e mel'];
const saladImages=[...section('id="receitas"').matchAll(/<img\b[^>]*>/g)].map((m,i)=>`<figure>${m[0].replace('alt=""',`alt="Salada ${names[i]}"`)}<figcaption>${names[i]}</figcaption></figure>`).join('');
let bonus=section('id="bonus"').replace('class="new-bonuses section"','class="new-bonuses section v2-section" data-step="3" aria-labelledby="bonus-title"');
bonus=bonus.replace(/<div class="section-heading center-heading">[\s\S]*?<\/div>/,'<div class="section-heading center-heading"><span class="v2-eyebrow">E ainda recebes, sem pagar mais</span><h2 id="bonus-title">3 bónus para dares<br><strong>ainda mais sabor à semana.</strong></h2><p>As receitas são só o começo. Estes extras também fazem parte do teu acesso.</p></div>');
bonus=bonus.replace(/<div class="section-plan-cta">[\s\S]*?<\/div>/g,'');
const app=take(/<div class="plan-deliverables plan-app-bonus">[\s\S]*?<\/ul><\/div>/,'app features');
const sauces=section('class="sauces-section"').replace(/<section[^>]*>/,'<div class="v2-sauces">').replace(/<\/section>$/,'</div>').replace(/<a class="button[\s\S]*?<\/a>/,'').replace('Prepara molhos<br><strong>irresistíveis e saudáveis.</strong>','Um pouco do sabor<br><strong>que te espera.</strong>');
bonus=bonus.replace(/<\/div><\/section>$/,`${app}${sauces}<div class="v2-cta-row">${cta('Quero as receitas e os 3 bónus')}</div></div></section>`);
let reviews=section('id="avaliacoes"').replace('id="avaliacoes"','id="avaliacoes" data-step="4" aria-labelledby="reviews-title"').replace('class="review-heading"','class="review-heading" id="reviews-title"');
reviews=reviews.replace(/<div class="section-plan-cta">[\s\S]*?<\/div>/g,'');
const questions=[...main.matchAll(/<a class="elementor-toggle-title"[^>]*>([\s\S]*?)<\/a>/g)].map(m=>m[1]);
const answers=[...main.matchAll(/<div id="elementor-tab-content-[^"]+"[^>]*>([\s\S]*?)<\/div>/g)].map(m=>m[1]);
if(questions.length!==10||answers.length!==10)throw Error('V2 FAQ has changed');
const faqs=questions.map((q,i)=>`<details><summary>${q.replace('O curso tem garantia?','O acesso tem garantia?')}<span aria-hidden="true">+</span></summary><div>${answers[i]}</div></details>`).join('');
const portrait=take(/<img class="author-photo"[^>]*>/,'author portrait');
const guarantee=take(/<div class="plan-guarantee">[\s\S]*?<\/div>/,'guarantee');
const dialogs=[...main.matchAll(/<dialog\b[\s\S]*?<\/dialog>/g)].map(m=>m[0]).filter(d=>!d.includes('id="conversation-dialog"')).join('');
const sprite=take(/<svg class="svg-sprite"[\s\S]*?<\/svg>/,'sprite');
const bottomScripts=main.match(/<script src="hero-media.js[\s\S]*?(?=<\/body>)/)?.[0];
if(!bottomScripts)throw Error('V2 missing player and tracking scripts');
const cssHash=createHash('sha256').update(await fs.readFile('dist/v2.css')).digest('hex').slice(0,10);
let head=main.slice(0,main.indexOf('<body'))
 .replace(/<link rel="stylesheet" href="reference-css\/(?!fonts.css)[^"]+">/g,'')
 .replace(/<title>[\s\S]*?<\/title>/,'<title>60 receitas para mudares a forma de comer salada — Saladas no Frasco</title>')
 .replace('</head>',`<link rel="stylesheet" href="v2.css?v=${cssHash}"></head>`);
const hero=`<section class="hero v2-hero" data-step="1" aria-labelledby="v2-headline"><div class="wrap v2-hero-grid"><div class="v2-hero-copy"><span class="v2-eyebrow">Saladas Saborosas no Frasco</span><h1 id="v2-headline">Nunca mais vais querer comer salada <em>de outra forma.</em></h1><p class="v2-subheadline">60 receitas de saladas <strong>saborosas e rápidas</strong> que sabem melhor do que fast-food.</p><div class="hero-badge-wrap"><span class="hero-badge">${icon('check')}Prepara uma vez e tem saladas para toda a semana, conservadas e sem murcharem.</span></div></div><div class="v2-hero-demonstration"><div class="hero-main-image hero-media">${video}</div></div><div class="v2-hero-action">${cta()}<p>Acesso por e-mail · Pagamento único · 14 dias de garantia</p></div></div></section>`;
const contents=`<section class="v2-section v2-contents" id="receber" data-step="2" aria-labelledby="contents-title"><div class="v2-container"><div class="v2-section-heading"><span class="v2-eyebrow">Abre, escolhe e prepara</span><h2 id="contents-title">Tudo o que vais receber.<br><em>Vê por ti.</em></h2></div><div class="v2-bundle">${bundle}</div><div class="v2-product-scenes">${contentsVideo}${fridge}</div><h3 class="v2-gallery-heading">Algumas das saladas que vais aprender</h3><div class="v2-salad-gallery" aria-label="Receitas de saladas">${saladImages}</div><div class="v2-method-gallery">${methodPhotos}</div><div class="v2-tutorial"><div><span class="v2-eyebrow">Passo a passo, sem complicações</span><h3>Vê como é simples<br>preparar e conservar.</h3><p>Deixa as saladas da semana prontas em menos de 20 minutos. E descobre como conservá-las sem murcharem.</p></div>${preview}</div><div class="v2-cta-row">${cta('Quero começar a preparar as minhas')}</div></div></section>`;
const checkout='https://pay.hotmart.com/O108101669E?checkoutMode=10';
const offer=`<section class="v2-section v2-offer" id="oferta" data-step="5" aria-labelledby="v2-offer-title"><div class="v2-container"><div class="v2-section-heading"><span class="v2-eyebrow">O teu acesso completo</span><h2 id="v2-offer-title">Mais sabor à mesa.<br><em>Menos complicações na semana.</em></h2></div><div class="v2-offer-grid"><div class="v2-offer-visual">${bundle}<div class="v2-author">${portrait}<p>Receitas de <strong>Livia Siqueira</strong><span>Para simplificares as tuas refeições, todos os dias.</span></p></div></div><article class="v2-price-card"><span class="v2-eyebrow">60 receitas + método + 3 bónus</span><h3>Leva tudo.<br>Começa hoje.</h3><p class="v2-included-line">Receitas, tutoriais, molhos, saladas proteicas e a app para organizares a semana.</p><div class="plan-price"><span>PAGAMENTO ÚNICO</span><div><strong>11</strong><span class="plan-price-cents">,90</span><span class="plan-price-currency">€</span></div><p>Sem mensalidades.</p></div><a class="button button-primary plan-checkout" href="${checkout}">Garantir o meu acesso${icon('arrow')}</a><ul class="v2-checkout-trust"><li>${icon('check')}Acesso enviado por e-mail</li><li>${icon('check')}Pagamento único e seguro</li><li>${icon('check')}3 bónus incluídos</li></ul>${guarantee}</article></div></div></section>`;
const warranty=`<section class="v2-section v2-guarantee" id="garantia" data-step="6" aria-labelledby="guarantee-title"><div class="v2-container v2-guarantee-inner"><div class="v2-guarantee-seal">${icon('shield')}<strong>14</strong><span>DIAS DE GARANTIA</span></div><div><span class="v2-eyebrow">Experimenta com tranquilidade</span><h2 id="guarantee-title">Tens 14 dias<br>para experimentar.</h2><p>Consulta as receitas, explora a app e experimenta na tua cozinha. Se não gostares, podes pedir o reembolso de 100% do valor dentro desse prazo.</p>${cta('Quero experimentar')}</div></div></section>`;
const faq=`<section class="v2-section v2-faq" id="duvidas" data-step="7" aria-labelledby="faq-title"><div class="v2-container"><div class="v2-section-heading"><span class="v2-eyebrow">Antes de começares</span><h2 id="faq-title">As tuas dúvidas,<br><em>respondidas.</em></h2></div><div class="v2-faq-list">${faqs}</div><div class="v2-cta-row">${cta('Garantir o meu acesso')}</div></div></section>`;
let html=head+`<body class="elementor-kit-5 sales-v2"><a class="skip-link" href="#conteudo">Saltar para o conteúdo</a>${header}<main id="conteudo">${hero}${contents}${bonus}${reviews}${offer}${warranty}${faq}</main>${footer}${dialogs}${sprite}${bottomScripts}</body></html>`;
// Absolute asset paths work at both /v2 and /v2/ without redirecting local anchors to /.
html=html.replace(/\b(src|href|poster|data-src|data-src-small|data-src-large|data-conversation-image)="((?:assets|reference-css)\/[^" ]+|(?:[\w-]+\.(?:css|js))(?:\?[^" ]*)?)"/g,'$1="/$2"')
 .replace(/\bsrcset="([^"]+)"/g,(_,list)=>`srcset="${list.replace(/(^|,\s*)(assets\/)/g,'$1/$2')}"`);
await fs.mkdir('dist/v2',{recursive:true});
await fs.writeFile('dist/v2/index.html',html);
console.log('V2 montada: 7 secções, '+questions.length+' perguntas e todos os conteúdos visuais.');
