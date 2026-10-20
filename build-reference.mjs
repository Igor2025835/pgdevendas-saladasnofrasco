import {reviewHero,reviewMethod,reviewContents,makeCategories,makeSalads,makeSauces,makePain,addPlanCta,reviewAuthor,reviewFooter,makeConversations,methodPreview} from './review-components.mjs';
import fs from 'node:fs/promises';
import {localizePtPt} from './localize-pt-pt.mjs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const base='https://controle.nutriliacastro.com/';
const backup='backups/before-original-return';
await fs.mkdir(backup,{recursive:true});
for(const name of ['index.html','redesign.js']) {
 await fs.copyFile('dist/'+name,backup+'/'+name,fs.constants.COPYFILE_EXCL).catch(e=>{if(e.code!=='EEXIST')throw e;});
}
const current=await fs.readFile(backup+'/index.html','utf8');
const source=await fs.readFile('reference-original/source.html','utf8');
const nodes=JSON.parse(await fs.readFile('reference-original/tree.json','utf8'));
const get=id=>{const n=nodes.find(x=>x.attrs['data-id']===id);if(!n)throw Error('Missing section '+id);const raw=source.slice(n.start,n.end);if(!raw.startsWith('<div '))throw Error('Section offset mismatch '+id);return raw;};
const match=(pattern,label)=>{const value=current.match(pattern)?.[0];if(!value)throw Error('Missing local '+label);return value;};
const header="<header class=\"header\"><a class=\"brand brand-image\" href=\"#\" aria-label=\"Saladas Saborosas no Frasco, início\"><img src=\"assets/logo-saladas-frasco-360.webp\" srcset=\"assets/logo-saladas-frasco-360.webp 360w, assets/logo-saladas-frasco-600.webp 600w\" sizes=\"(max-width: 600px) 180px, 220px\" width=\"600\" height=\"400\" alt=\"Saladas Saborosas no Frasco\" decoding=\"async\" fetchpriority=\"high\"></a></header>";
const hero=reviewHero(match(/<section class="hero">[\s\S]*?<\/section>/,'hero'));
const method=reviewMethod(match(/<section class="method-intro[^>]*>[\s\S]*?<\/section>/,'method'));
const methodBenefits=method.match(/<div class="method-grid visual-cards">[\s\S]*?<\/div>(?=\s*<div class="method-callout">)/)?.[0];
const methodCallout=method.match(/<div class="method-callout">[\s\S]*?<\/div>/)?.[0];
if(!methodBenefits||!methodCallout)throw Error('Missing method content for the combined section');
const categories=makeCategories(match(/<section class="category-section[^>]*>[\s\S]*?<\/section>/,'categories'));
const dialog=match(/<dialog[\s\S]*?<\/dialog>/,'dialog');
const footer=reviewFooter(match(/<footer[\s\S]*?<\/footer>/,'footer').replace(/<a\b[^>]*>Fale com a equipe[\s\S]*?<\/a>/,''));
const sprite=current.slice(current.indexOf('  <svg class="svg-sprite"'),current.indexOf('</body>'));
const mediaCache=new Map();
await fs.mkdir('dist/reference-css',{recursive:true});
async function localMedia(value) {
 const url=new URL(value,base).href;
 if(mediaCache.has(url))return mediaCache.get(url);
 const basename=path.basename(new URL(url).pathname);
 const numeric=basename.match(/^(\d+)\.webp$/);
 const file=numeric?'assets/original-'+numeric[1]+'.webp':'assets/reference-'+basename;
 try{await fs.access('dist/'+file);}catch{const r=await fetch(url);if(!r.ok)throw Error('Image '+r.status+' '+url);await fs.writeFile('dist/'+file,Buffer.from(await r.arrayBuffer()));}
 mediaCache.set(url,file);return file;
}
async function localize(markup) {
 markup=markup.replace(/\s(?:srcset|sizes)="[^"]*"/g,'').replace(/elementor-invisible/g,'').replace(/<script\b[\s\S]*?<\/script>/g,'');
 const images=[...markup.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/g)];
 for(const item of images){const file=await localMedia(item[1]);markup=markup.replace(item[0],item[0].replace(item[1],file));}
 markup=markup.replace(/href="#(?:price|comprar)"/g,'href="#oferta"');
 markup=markup.replace(/href="\/cdn-cgi\/l\/email-protection[^"]*"/g,'href="mailto:contato@nutriliacastro.site"').replace(/<span class="__cf_email__"[^>]*>[^<]*<\/span>/g,'contato@nutriliacastro.site');
 return markup;
}
const links=[...source.matchAll(/<link\b[^>]*rel=['"]stylesheet['"][^>]*>/g)].map(m=>m[0].match(/href=['"]([^'"]+)/)?.[1]).filter(x=>x?.startsWith('wp-content/')&&!/google-fonts|font-awesome|v4-shims/.test(x));
const cssFiles=[];
for(let i=0;i<links.length;i++){
 const url=new URL(links[i],base);const response=await fetch(url);if(!response.ok)throw Error('CSS '+url);
 const css=(await response.text()).replaceAll('#FFF7E7','#FFFFFF').replace(/url\((['"]?)([^)'"\s]+)\1\)/g,(all,quote,value)=>value.startsWith('data:')||value.startsWith('#')?all:`url("${new URL(value,url).href}")`);
 const filename='reference-css/'+String(i).padStart(2,'0')+'-'+path.basename(url.pathname);
 await fs.writeFile('dist/'+filename,css);cssFiles.push(filename);
}
const ua='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
let fontCss='';
for(const [family,query,name,weight] of [['Sora','Sora:wght@100..800','sora-original','100 800'],['Poppins','Poppins:wght@200','poppins-original-200','200'],['Poppins','Poppins:wght@400','poppins-original-400','400'],['Poppins','Poppins:wght@500','poppins-original-500','500'],['Poppins','Poppins:wght@600','poppins-original-600','600'],['Poppins','Poppins:wght@700','poppins-original-700','700'],['Open Sans','Open+Sans:wght@300..800','open-sans-original','300 800'],['Roboto','Roboto:wght@100..900','roboto-original','100 900']]){
 const file='assets/'+name+'.woff2';
 try{await fs.access('dist/'+file);}catch{
  const r=await fetch('https://fonts.googleapis.com/css2?family='+query+'&display=swap',{headers:{'User-Agent':ua}});const css=await r.text();const latin=css.split('/* latin */').at(-1);const url=latin.match(/url\((https[^)]+)\)/)?.[1];if(!url)throw Error('Missing font '+family);const data=await fetch(url);await fs.writeFile('dist/'+file,Buffer.from(await data.arrayBuffer()));
 }
 fontCss+=`@font-face{font-family:'${family}';src:url('../${file}') format('woff2');font-weight:${weight};font-display:swap}\n`;
}
await fs.writeFile('dist/reference-css/fonts.css',fontCss);cssFiles.push('reference-css/fonts.css');
let contents=await localize(get('5c6c16f'));
contents=contents.replace('eNCONTRAR:','encontrar:').replace('Conservação de 7 dias','Orientações de conservação');
contents=reviewContents(contents,source,nodes);
const salads=makeSalads(categories);
const sauces=makeSauces();
const video='assets/metodo-aula-previa-v1.mp4';
const lesson=`<section class="reference-lesson combined-method" id="camadas"><div class="lesson-inner"><span id="metodo" class="method-anchor" aria-hidden="true"></span><h2 class="lesson-watch-heading">ASSISTA a prévia <strong>da aula 1:</strong></h2>${methodPreview()}<div class="method-after-video"><p class="method-eyebrow">O MÉTODO POR DENTRO</p><h2><strong><span>Camadas saborosas</span><br><span>e saudáveis</span></strong></h2></div>${methodBenefits}${methodCallout}</div></section>`;
const bonuses="<section class=\"new-bonuses section\" id=\"bonus\"><div class=\"wrap\"><div class=\"section-heading center-heading\"><h2>Recebe ainda<br><strong>3 bónus incluídos</strong></h2><p>Mais variedade e organização para as tuas refeições.</p></div><div class=\"bonus-grid\"><article class=\"bonus-card\"><img src=\"assets/original-1.webp\" alt=\"Molho caseiro sobre uma salada\" loading=\"lazy\"><div><span class=\"block-icon\"><svg aria-hidden=\"true\"><use href=\"#spark\"/></svg></span><span class=\"chapter\">BÓNUS 01</span><h3>Molhos saudáveis</h3><p>Molhos caseiros para variar o sabor das tuas saladas, com ingredientes simples.</p><span class=\"included\"><svg aria-hidden=\"true\"><use href=\"#check\"/></svg>Incluído no plano</span></div></article><article class=\"bonus-card\"><img src=\"assets/original-11.webp\" alt=\"Salada proteica com frango\" loading=\"lazy\"><div><span class=\"block-icon\"><svg aria-hidden=\"true\"><use href=\"#shield\"/></svg></span><span class=\"chapter\">BÓNUS 02</span><h3>Saladas proteicas</h3><p>Refeições com proteína que podem ajudar a emagrecer e a ganhar massa muscular, no contexto de uma alimentação equilibrada e de exercício adequado.</p><span class=\"included\"><svg aria-hidden=\"true\"><use href=\"#check\"/></svg>Incluído no plano</span></div></article><article class=\"bonus-card\"><div class=\"bonus-app-preview\" role=\"img\" aria-label=\"Ilustração da app com receitas organizadas\"><div class=\"bonus-phone\"><span>As tuas receitas</span><div><img src=\"assets/original-9.webp\" alt=\"\" loading=\"lazy\"><img src=\"assets/original-14.webp\" alt=\"\" loading=\"lazy\"><img src=\"assets/original-6.webp\" alt=\"\" loading=\"lazy\"><img src=\"assets/original-7.webp\" alt=\"\" loading=\"lazy\"></div><small>Escolhe · Planeia · Prepara</small></div></div><div><span class=\"block-icon\"><svg aria-hidden=\"true\"><use href=\"#phone\"/></svg></span><span class=\"chapter\">BÓNUS 03</span><h3>App de receitas</h3><p>Todas as receitas organizadas, filtros pelos ingredientes que tens em casa, lista de compras, tutoriais, tipos de saladas, planeamento semanal e molhos.</p><span class=\"included\"><svg aria-hidden=\"true\"><use href=\"#check\"/></svg>Incluído no plano</span></div></article></div></div></section>";
const pain=makePain();
const offer=await fs.readFile('reference-original/offer-updated.html','utf8');
const author=reviewAuthor(await localize(get('cbc5459')));
const testimonials=makeConversations(JSON.parse(await fs.readFile('reference-original/review-conversations.json','utf8')));
let faq=await localize(get('3d6ee6f'));
for(const content of nodes.filter(n=>(n.attrs.class||'').includes('elementor-tab-content'))) {
 let replacement=null;
 if(content.text.join(' ').includes('Quando montada corretamente')) replacement='Siga a conservação indicada em cada receita. Como referência geral, preparos com frango, atum, ovos ou massa cozidos devem ser consumidos em 3 a 4 dias, refrigerados a 4 °C ou menos. A ordem das camadas não impede a deterioração.';
 if(content.text.join(' ').includes('A maioria das mulheres prepara')) replacement='Você pode organizar os ingredientes e montar suas saladas com antecedência. O tempo de montagem depende do preparo dos ingredientes; siga a conservação de cada receita e evite guardar preparos além do prazo indicado.';
 if(replacement){const raw=source.slice(content.start,content.end);faq=faq.replace(raw,raw.slice(0,raw.indexOf('>')+1)+'<p>'+replacement+'</p></div>');}
}
let head=current.slice(0,current.indexOf('<body>'));
head=head.replace('<link rel="stylesheet" href="redesign.css">',cssFiles.map(file=>`<link rel="stylesheet" href="${file}">`).join('')+'<link rel="stylesheet" href="redesign.css">');
head=head.replace('<script src="redesign.js" defer></script>','<link rel="stylesheet" href="original-local.css"><script src="original-local.js" defer></script>');
let result=head+'<body class="elementor-kit-5"><a class="skip-link" href="#conteudo">Pular para o conteúdo</a>'+header+'<main id="conteudo">'+hero+'<div class="elementor elementor-11737 original-reference">'+contents+addPlanCta(salads,'Quero aprender essas saladas')+sauces+addPlanCta(lesson,'Quero acesso às aulas')+addPlanCta(bonuses,'Quero o plano completo')+addPlanCta(pain,'Quero começar')+offer+addPlanCta(testimonials,'Garantir o meu acesso')+addPlanCta(author,'Ver os planos')+addPlanCta(faq,'Escolher meu plano')+'</div></main>'+footer+dialog+sprite+'</body></html>';
// Keep every sales CTA pointed at the plans; checkout destinations are configured separately.
result=result.replace(/<a\b[^>]*>/g,tag=>{
 const classes=tag.match(/\bclass="([^"]*)"/)?.[1].split(/\s+/)||[];
 if(classes.includes('plan-checkout')||!classes.some(name=>['button','elementor-button','text-link'].includes(name)))return tag;
 return /\bhref="[^"]*"/.test(tag)?tag.replace(/\bhref="[^"]*"/,'href="#oferta"'):tag.replace(/>$/,' href="#oferta">');
});
const reviewVersion=createHash('sha256').update(await fs.readFile('dist/review.css')).digest('hex').slice(0,10);
const scriptVersion=createHash('sha256').update(await fs.readFile('dist/original-local.js')).digest('hex').slice(0,10);
const trackingHead=await fs.readFile('reference-original/tracking-head.html','utf8');
result=result.replace('</head>',trackingHead+'\n</head>');
result=result.replaceAll('7 dias de garantia','14 dias de garantia').replaceAll('7 dias de garantia incondicional','14 dias de garantia incondicional').replace('</head>',`<link rel="stylesheet" href="review.css?v=${reviewVersion}"></head>`);
result=result.replace('src="original-local.js"',`src="original-local.js?v=${scriptVersion}"`);
result=localizePtPt(result);
// Visitors who have already passed the offer can proceed directly to checkout.
const afterOffer=result.indexOf('</section>',result.indexOf('id="oferta"'))+'</section>'.length;
result=result.slice(0,afterOffer)+result.slice(afterOffer).replace(/<a\b([^>]*\bclass="[^"]*\b(?:button|text-link)\b[^"]*"[^>]*)>([\s\S]*?)<\/a>/g,(all,attrs,body)=>{
 if(!attrs.includes('href="#oferta"'))return all;
 const icon=body.match(/<svg\b[\s\S]*?<\/svg>/)?.[0]||'';
 return '<a'+attrs.replace('href="#oferta"','href="https://pay.hotmart.com/O108101669E?checkoutMode=10"')+'>Garantir o meu acesso'+icon+'</a>';
});
await fs.writeFile('dist/index.html',result);
await fs.writeFile('reference-original/build-report.json',JSON.stringify({source:base,sections:["hero com subtítulo atualizado","conteúdo original + bônus do app","seis saladas em duas colunas + carrossel infinito de estilos","dez conversas ilustrativas: seis Instagram e quatro WhatsApp","molhos em blocos","método unificado: aula prévia e três blocos ilustrados","três bônus locais","dificuldades em vermelho","planos de €4,90 e €7,90","autoria original","FAQ original atualizado"],video,media:[...mediaCache.values()],styles:cssFiles},null,2));
console.log('Página montada. '+mediaCache.size+' imagens originais; '+cssFiles.length+' folhas de estilo.');
