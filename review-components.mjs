const icon=name=>`<svg aria-hidden="true"><use href="#${name}"/></svg>`;
export function reviewHero(html,callout){
 html=html.replace(/<h1>[\s\S]*?<\/h1>/,'<h1>Descobre 60 receitas de saladas <em>saborosas e rápidas</em> para teres sempre em casa, que nem parecem “comida de dieta”.</h1>');
 const oldSubtitle=html.match(/<p class="hero-description">[\s\S]*?<\/p>/)?.[0]||'';
 const subtitle=callout.replace('E descubra como conservar sem murchar.','E conserva-as até <strong>7 dias</strong>, sem murcharem.');
 html=html.replace(oldSubtitle,'').replace(/(<\/button>)(\s*<div class="hero-action">)/,'$1'+subtitle+'$2');
 html=html.replace(/<p class="hero-promise">[\s\S]*?<\/p>/,'').replace('<p>Coma melhor sem viver de alface e tomate.</p>','');
 html=html.replace(/<div class="hero-badge-wrap">[\s\S]*?<\/div>/,'');
 html=html.replace('</h1>','</h1>'+"<div class=\"hero-badge-wrap\"><span class=\"hero-badge\"><svg aria-hidden=\"true\"><use href=\"#check\"/></svg>Saudáveis, fáceis e deliciosas.</span></div>");
 html=html.replace(/<button class="hero-video[\s\S]*?<\/button>/,heroLessonPreview());
 html=html.replace(/<div class="trust-line">[\s\S]*?<\/div>/,'');
 return html.replace('7 dias de garantia','14 dias de garantia').replace('App incluído','App no plano completo');
}
function heroLessonPreview(){
 return '<div class="hero-main-image hero-lesson-media"><video id="hero-lesson-video" width="540" height="960" autoplay muted loop playsinline preload="none" disablepictureinpicture data-preview-src="assets/hero-aula-loop-5s-v1.mp4" data-full-src="assets/metodo-aula-previa-v1.mp4" aria-label="Prévia da aula: os primeiros cinco segundos em loop, sem som"></video><div class="hero-lesson-overlay"><button type="button" class="hero-lesson-play" aria-controls="hero-lesson-video" aria-label="Ver a prévia completa da aula desde o início, com som"><span class="hero-lesson-status">Vê o método das camadas</span><svg viewBox="0 0 32 32" aria-hidden="true"><path d="m12 7 15 9-15 9Z"/></svg><span class="hero-lesson-hint">Clica para ver com som</span></button></div></div>';
}
export function reviewMethod(html){
 const photos=[['metodo-camadas-v1.png','Salada em frasco com grão, frango, vegetais e folhas em camadas'],['metodo-refeicao-v1.png','Salada com frango grelhado, quinoa e vegetais coloridos'],['metodo-molho-v1.png','Molho cremoso de ervas sobre uma salada generosa e colorida']];
 let i=0;html=html.replace(/<article>/g,()=>{const [file,alt]=photos[i++];return '<article><img class="method-photo" src="assets/'+file+'" alt="'+alt+'" width="1536" height="1024" loading="lazy">';});
 let cardIndex=0;
 const compactCards=[['Mais frescura.','Molho no fundo, folhas por cima.','01 / CONSERVAÇÃO'],['Substitua qualquer refeição','Vegetais, proteína e muito sabor.','02 / REFEIÇÃO COMPLETA']];
 html=html.replace(/<article>[\s\S]*?<\/article>/g,card=>{
  const copy=compactCards[cardIndex++];
  if(!copy)return card;
  const photo=card.match(/<img class="method-photo"[^>]*>/)?.[0];
  return '<article class="method-card-compact">'+photo+'<span class="chapter">'+copy[2]+'</span><h3>'+copy[0]+'</h3><p>'+copy[1]+'</p></article>';
 });
 html=html.replace('Molhos caseiros para dar vontade de repetir.','Molhos caseiros e saudáveis.');
 return updateMethodCallout(html).replace(/<p class="small-note centered">[\s\S]*?<\/p>/,'');
}
export function contentsBenefits(){
 const items=[['book','<strong>+60 receitas</strong> saborosas e saudáveis.'],['spark','<strong>Molhos irresistíveis</strong> para variar.'],['clock','Saladas da semana em <strong>20 minutos.</strong>'],['shield','Frescura e conservação <strong>até 7 dias,</strong> sem complicações.'],['check','Montagem <strong>passo a passo.</strong>']];
 return '<div class="contents-benefits contents-benefits-list" role="list" aria-label="O que está incluído">'+items.map(([i,copy])=>'<article class="contents-benefit" role="listitem"><span class="contents-benefit-icon">'+icon(i)+'</span><p>'+copy+'</p></article>').join('')+'</div>';
}
export function contentsAppBonus(){
 const features=['Todas as receitas','Filtro por ingredientes','Tipos de saladas','Tutoriais de preparação'];
 return '<aside class="app-bonus-callout app-bonus-info" aria-label="Aplicativo incluído no plano completo"><div class="app-info-heading"><span class="app-info-icon">'+icon('phone')+'</span><div><p class="app-bonus-label">BÔNUS DO PLANO COMPLETO</p><h3>As receitas no seu telemóvel.</h3></div></div><ul class="app-info-features">'+features.map(text=>'<li>'+icon('check')+'<span>'+text+'</span></li>').join('')+'</ul><p class="app-info-note">Tudo num só app, com muito mais para explorar.</p></aside>';
}
export function placeContentsApp(html){
 return insertAfterContentsWidget(html,'9520a06',contentsAppBonus());
}
function insertAfterContentsWidget(html,id,addition){
 const {end}=contentsWidgetBounds(html,id);
 return html.slice(0,end)+addition+html.slice(end);
}
function contentsWidgetBounds(html,id){
 const dataIndex=html.indexOf('data-id="'+id+'"');
 const start=html.lastIndexOf('<div ',dataIndex);
 if(dataIndex<0||start<0)throw Error('Contents widget missing: '+id);
 let depth=0;
 for(const token of html.slice(start).matchAll(/<\/?div\b[^>]*>/g)){
  depth+=token[0].startsWith('</')?-1:1;
  if(!depth)return {start,end:start+token.index+token[0].length};
 }
 throw Error('Contents widget is unclosed: '+id);
}
function contentsVideo(){
 return '<div class="contents-video-frame"><video class="contents-video" width="432" height="768" autoplay muted loop playsinline preload="none" disablepictureinpicture poster="assets/conteudo-saladas-poster-v1.webp" data-src="assets/conteudo-saladas-loop-v1.mp4" aria-label="Saladas em frascos e uma salada servida com molho"></video></div>';
}
export function contentsTasteSection(){
 return '<section class="contents-taste-section" id="saladas-com-sabor" aria-labelledby="taste-title"><div class="review-wrap"><h2 id="taste-title">Até quem não gosta de salada<br><strong>vai querer repetir.</strong></h2>'+contentsVideo()+'<div class="section-plan-cta"><a class="button button-primary" href="#oferta">Quero estas saladas'+icon('arrow')+'</a></div></div></section>';
}
export function updateMethodCallout(html){
 return html.replace('<p><strong>Cerca de 20 minutos para montar.</strong><br><em>E muita vontade de comer.</em></p>','<p><strong>Deixe as saladas deliciosas da semana prontas em <em>menos de 20 minutos.</em></strong><span class="method-preservation-note">E descubra como conservar sem murchar.</span></p>');
}
export function reviewFooter(html){
 const brand='<a class="brand brand-footer" href="#" aria-label="Saladas Saborosas no Frasco, início"><img src="assets/logo-saladas-frasco-360.webp" width="360" height="240" alt="Saladas Saborosas no Frasco" loading="lazy" decoding="async"></a>';
 return html.replace(/<a class="brand" href="#">[\s\S]*?<\/a>/,brand).replace('Saladas no Pote.','Saladas Saborosas no Frasco.');
}
export function reviewContents(html,source,nodes){
 const n=nodes.find(n=>n.attrs['data-id']==='b7e5891');
 const original=source.slice(n.start,n.end).replace('Conservação de 7 dias','Orientações de conservação');
 if(!html.includes(original))throw Error('Contents list insertion marker missing');
 html=html.replace(original,contentsBenefits());
 const videoSlot=contentsWidgetBounds(html,'9520a06');
 html=html.slice(0,videoSlot.start).replace(/[ \t]+$/,'')+html.slice(videoSlot.end);
 const image='<div class="contents-image-frame"><img class="contents-fridge-image" src="assets/conservacao-pt-20min-v1-480.webp" srcset="assets/conservacao-pt-20min-v1-480.webp 480w, assets/conservacao-pt-20min-v1-800.webp 800w" sizes="(max-width: 600px) calc(100vw - 32px), 500px" width="800" height="800" alt="Frascos de salada no frigorífico: camadas para preservar a frescura e 20 minutos para preparar as saladas da semana" loading="lazy" decoding="async"></div>';
 html=insertAfterContentsWidget(html,'4f85e9fd',image);
 return html;
}
export function compactSaladGallery(html){
 // Fill the final pair with the recipe count and keep only the closing CTA.
 const button=contentsWidgetBounds(html,'16eb5619');
 html=html.slice(0,button.start).replace(/[ \t]+$/,'')+html.slice(button.end);
 const more='<aside class="recipe-more-card" aria-label="Mais de 60 receitas diferentes"><span class="recipe-more-icon">'+icon('book')+'</span><strong>+60</strong><h3>receitas<br>diferentes</h3><p>Para variares o sabor todos os dias.</p></aside>';
 return insertAfterContentsWidget(html,'a46f175',more);
}
export function makeCategories(html){
 const cards=[...html.matchAll(/<article class="category-card">[\s\S]*?<\/article>/g)].map(m=>m[0].replace('<article class="category-card">','<article class="category-card" role="listitem">')).join('');
 const styles=[['🔥','Leves'],['💪','Proteicas'],['🥗','Equilibradas'],['😋','Irresistíveis'],['⚡','Rápidas'],['🌿','Mediterrânicas'],['🌶️','Picantes']];
 const styleBlocks='<ul class="objective-styles" aria-label="Principais estilos de saladas">'+styles.map(([symbol,label])=>'<li class="objective-style"><span aria-hidden="true">'+symbol+'</span><strong>'+label+'</strong></li>').join('')+'<li class="objective-style objective-style-more"><span aria-hidden="true">'+icon('spark')+'</span><strong>+20 estilos</strong></li></ul>';
 return '<div class="salad-objectives"><h2>Saladas para<br><strong>diferentes objetivos.</strong></h2><div class="objectives-viewport" tabindex="0" aria-label="Estilos de saladas"><div class="objectives-marquee"><div class="objectives-group" role="list" aria-label="Tipos de saladas">'+cards+'</div><div class="objectives-group" aria-hidden="true" inert>'+cards+'</div></div></div>'+styleBlocks+'</div>';
}
export function makeSalads(categories){
 const recipes=[['Refrescante','molho cítrico','original-6.webp',100],['Caprese','','original-7.webp',120],['Caesar','molho original','original-9.webp',115],['Big Mac','molho especial','original-14.webp',180],['Mediterrânea','molho agridoce','original-10.webp',120],['Rústica','mostarda e mel','reference-Design-sem-nome-9-1.png',160]];
 const cards=recipes.map(([name,sauce,file,kcal])=>'<article class="recipe-tile"><img src="assets/'+file+'" alt="Salada '+name+(sauce?' com '+sauce:'')+'" loading="lazy"><div class="recipe-tile-copy"><h3>Salada '+name+'</h3><p class="recipe-tile-sauce">'+(sauce?'+ '+sauce:'Tomate, queijo e frescor')+'</p><div class="recipe-tile-facts"><span>'+icon('clock')+'<span><strong>5–7 dias</strong>refrigerada</span></span><span>'+icon('leaf')+'<span><strong>'+kcal+' kcal</strong></span></span></div></div></article>').join('');
 return '<section class="recipe-section" id="receitas"><div class="review-wrap"><h2 class="review-heading">Algumas saladas<br><strong>que irá aprender:</strong></h2><div class="recipe-grid">'+cards+'</div>'+categories+'</div></section>';
}
export function makeSauces(){
 const sauces=[['Verde de ervas','Iogurte, ervas e um toque de limão.',3,20],['Cremoso de limão','Cremosidade com um toque cítrico.',2,40],['Rosé leve','Tomate e iogurte em uma combinação cremosa.',1,30]];
 const cards=sauces.map(([name,copy,file,kcal])=>'<article class="sauce-tile"><div class="sauce-tile-copy"><div class="sauce-tile-title"><h3>'+name+'</h3><span class="sauce-tile-calories"><strong>≈ '+kcal+' kcal</strong><small>estimativa / 30 g</small></span></div><p>'+copy+'</p></div><video class="sauce-video" width="480" height="418" autoplay muted loop playsinline preload="none" disablepictureinpicture poster="assets/molho-'+file+'-poster.webp" data-src="assets/molho-'+file+'-loop.mp4" aria-label="Preparo e apresentação de molho sobre uma salada"></video></article>').join('');
 return '<section class="sauces-section"><div class="review-wrap"><h2 class="review-heading">Faça molhos<br><strong>irresistíveis e saudáveis.</strong></h2><div class="sauce-grid">'+cards+'</div><a class="button button-primary sauces-cta" href="#oferta">Quero as receitas! '+icon('arrow')+'</a></div></section>';
}
export function makePain(){
 const points=[['leaf','Quero comer saudável, mas não quero salada sem graça ou “comidas de dieta”.'],['book','Na correria, a salada acaba ficando para depois.'],['spark','Alface e tomate já perderam a graça.'],['jar','Você quer comer melhor, mas falta praticidade.']];
 return '<section class="routine-section"><div class="review-wrap"><h2 class="review-heading">Isso acontece<br><strong>com você?</strong></h2><div class="routine-grid">'+points.map(([i,t])=>'<div class="routine-item"><span>'+icon(i)+'</span><p>'+t+'</p></div>').join('')+'</div><div class="routine-answer">'+icon('jar')+'<h3>Então a salada no frasco<br><strong>é para você.</strong></h3></div></div></section>';
}

export function addPlanCta(markup,label='Ver os planos'){
 if(markup.includes('href="#oferta"')||markup.includes('id="oferta"'))return markup;
 const cta='<div class="section-plan-cta"><a class="button button-primary" href="#oferta">'+label+' '+icon('arrow')+'</a></div>';
 if(markup.trimStart().startsWith('<section')){
  if(/<\/div>\s*<\/section>\s*$/.test(markup))return markup.replace(/(<\/div>\s*<\/section>\s*)$/,cta+'$1');
  return markup.replace(/(<\/section>\s*)$/,cta+'$1');
 }
 if(markup.includes('class="e-con-inner"'))return markup.replace(/(<\/div>\s*<\/div>\s*)$/,cta+'$1');
 return markup.replace(/(<\/div>\s*)$/,cta+'$1');
}

export function reviewAuthor(html){
 const portrait='<img class="author-photo" src="assets/quem-sou-eu-chef-480.webp" srcset="assets/quem-sou-eu-chef-480.webp 480w, assets/quem-sou-eu-chef-720.webp 720w" sizes="(max-width: 480px) calc(100vw - 40px), 420px" width="720" height="960" alt="Chef preparando uma salada na cozinha" loading="lazy" decoding="async">';
 return html.replace(/<img\b[^>]*src="assets\/original-12\.webp"[^>]*>/,portrait);
}

export function makeConversations(reviews,compact=false){
 const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 const cards=reviews.map(review=>{
  const thumb=review.sizes['600'],full=review.sizes['1000'];
  const alt='Avaliação de '+review.name+' enviada pelo '+review.platform;
  return '<figure class="conversation-card"><button type="button" class="conversation-open" data-conversation-image="assets/'+full.file+'" aria-label="Ampliar a avaliação de '+escape(review.name)+'"><img src="assets/'+thumb.file+'" width="'+thumb.width+'" height="'+thumb.height+'" alt="'+escape(alt)+'" loading="lazy" decoding="async"></button></figure>';
 }).join('');
 const track=compact?'class="conversation-grid conversation-carousel" id="reviews-track" tabindex="0" aria-label="Avaliações dos clientes"':'class="conversation-grid"';
 const repeated=compact?cards.replaceAll('<figure class="conversation-card">','<figure class="conversation-card" aria-hidden="true">').replaceAll('class="conversation-open"','class="conversation-open" tabindex="-1"'):'';
 return '<section class="conversation-section" id="avaliacoes"><div class="review-wrap"><h2 class="review-heading"><strong>O que dizem os nossos clientes</strong></h2><div '+track+'>'+cards+repeated+'</div><dialog id="conversation-dialog" class="conversation-dialog" aria-label="Avaliação ampliada"><button type="button" class="conversation-close" aria-label="Fechar conversa">×</button><img alt="" width="1000" height="1250"></dialog></div></section>';
}

export function methodPreview(){
 return '<div class="reference-video method-video-shell"><video id="method-preview-video" class="method-preview-video" width="540" height="960" playsinline preload="none" poster="assets/metodo-aula-poster-v1.webp" data-src="assets/metodo-aula-previa-v1.mp4" aria-label="Vídeo de apresentação do Método das Camadas Saborosas"></video><div class="method-audio-overlay"><button type="button" class="method-audio-button" aria-label="Reproduzir vídeo com som"><span class="method-audio-status">Assista à prévia da aula</span><svg viewBox="0 0 32 32" aria-hidden="true"><path d="m12 7 15 9-15 9Z"/></svg><span class="method-audio-hint">Clique para assistir</span></button></div></div>';
}
