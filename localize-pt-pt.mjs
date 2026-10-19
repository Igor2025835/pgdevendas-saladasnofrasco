// Localize rendered copy only; never change scripts, checkout URLs or customer screenshots.
export function localizePtPt(html) {
 const swaps=[
 ['Saladas no Pote — Muito além de comida de dieta','Saladas Saborosas no Frasco — Receitas para a semana'],
 ['Pular para o conteúdo','Saltar para o conteúdo'],
 ['Descubra como fazer saladas tão','Descobre como preparar saladas tão'],
 ['Mantenha durante 7 dias sem murchar.','Conserva as saladas até 7 dias sem murcharem.'],
 ['Crie saladas','Prepara saladas'],['Quero minhas saladas saborosas','Quero as minhas saladas saborosas'],
 ['Substitua qualquer refeição','Substitui qualquer refeição'],
 ['SALADAS DA NUTRI','SOBRE A AUTORA'],
 ['manter o frescor','manter a frescura'],
 ['Tudo o que você vai receber','Tudo o que vais receber'],['o que você','o que vais'],
 ['Monte com','Prepara com'],['que já tenha em casa.','que já tenhas em casa.'],
 ['As receitas no seu telemóvel.','As receitas no teu telemóvel.'],
 ['Tudo num só app, com muito mais para explorar.','Tudo numa só app, com muito mais para explorar.'],
 ['que irá aprender:','que vais aprender:'],
 ['Mais presença de fontes de proteína para compor suas refeições.','Mais proteína para compor as tuas refeições.'],
 ['Molhos e texturas que fazem você esquecer a salada sem graça.','Molhos e texturas para te esqueceres das saladas sem graça.'],
 ['Poucos ingredientes e menos etapas para a sua rotina.','Poucos ingredientes e menos passos para o teu dia a dia.'],
 ['Quero aprender essas saladas','Quero aprender a fazer estas saladas'],
 ['Faça molhos','Prepara molhos'],['em uma combinação cremosa.','numa combinação cremosa.'],
 ['ASSISTA a prévia','VÊ a prévia'],['Assista à prévia da aula','Vê a prévia da aula'],
 ['Clique para assistir','Clica para ver'],['Deixe as saladas deliciosas da semana prontas em','Deixa as saladas da semana prontas em'],
 ['E descubra como conservar sem murchar.','E descobre como conservá-las sem murcharem.'],
 ['RECEBA AINDA','RECEBE AINDA'],['Mais sabor e variedade para a sua semana.','Mais sabor e variedade para a tua semana.'],
 ['Incluído no pacote','Incluído no plano'],['Mais fontes de proteína nas suas combinações.','Mais fontes de proteína nas tuas combinações.'],
 ['Isso acontece','Isto acontece'],['com você?','contigo?'],
 ['Quero comer saudável, mas não quero salada sem graça ou “comidas de dieta”.','Quero comer de forma saudável, mas não quero saladas sem graça nem “comida de dieta”.'],
 ['Na correria, a salada acaba ficando para depois.','Com a pressa do dia a dia, a salada fica sempre para depois.'],
 ['Você quer comer melhor, mas falta praticidade.','Queres comer melhor, mas precisas de uma solução prática.'],
 ['é para você.','é para ti.'],['Tudo o que você vai receber','Tudo o que vais receber'],
 ['preparo e conservação','preparação e conservação'],['Mais todos os bônus','E ainda todos os bónus'],
 ['App Monte a Sua Salada com todas as receitas','App com todas as receitas'],
 ['Se não gostar, solicite o reembolso de 100% do valor.','Se não gostares, pede o reembolso de 100% do valor.'],
 ['Minhas receitas de Saladas no Pote e Molhos Irresistíveis sempre fizeram sucesso na internet.','As minhas receitas de saladas em frascos e molhos sempre fizeram sucesso na internet.'],
 ['Escolher meu plano','Escolher o meu plano'],['Veja a montagem','Vê a montagem'],
 ['bônus','bónus'],['BÔNUS','BÓNUS'],['frescor','frescura'],['Frescor','Frescura'],['Cremosidade','Textura cremosa'],
 ['refrigerada','no frigorífico']
 ];
 const faq=[
 ['Preciso de um frasco de vidro específico?','Não. Podes usar qualquer frasco ou recipiente que já tenhas em casa, de vidro ou até de plástico, desde que seja próprio para alimentos e feche bem. Não precisas de comprar um modelo específico.'],
 ['Como recebo as minhas receitas?','Após a confirmação do pagamento, recebes por e-mail as instruções para acederes aos conteúdos digitais e começares a consultar as receitas.'],
 ['O curso tem garantia?','Sim. Tens 14 dias para experimentar as receitas. Se não gostares, podes pedir o reembolso de 100% do valor dentro desse prazo.'],
 ['As receitas incluem os molhos?','Sim. As receitas incluem molhos caseiros e instruções para os preparares e combinares com cada salada.'],
 ['Quanto tempo dura a salada no frigorífico?','Segue o prazo indicado em cada receita. Como referência geral, as preparações com frango, atum, ovos ou massa cozidos devem ser consumidas em 3 a 4 dias, conservadas a 4 °C ou menos. A ordem das camadas não impede a deterioração.'],
 ['Posso preparar as saladas da semana de uma só vez?','Podes organizar os ingredientes e preparar várias saladas com antecedência. O tempo de montagem depende da preparação dos ingredientes. Respeita o prazo de conservação de cada receita.'],
 ['Posso vender as saladas que preparar?','Podes usar as receitas como ponto de partida para as tuas próprias combinações. Para definires o preço, considera os ingredientes, a embalagem, o tempo de preparação e os custos do teu negócio.'],
 ['As receitas são fáceis de preparar?','Sim. Tens instruções claras, passo a passo. Não precisas de ter experiência na cozinha: basta cortar os ingredientes, misturar e temperar de acordo com cada receita.'],
 ['Os ingredientes são fáceis de encontrar?','As receitas usam ingredientes do dia a dia, que encontras no supermercado ou no mercado. Podes também procurar na app receitas com os ingredientes que já tens em casa.'],
 ['Preciso de uma balança ou de utensílios especiais?','Para começar, precisas de frascos ou recipientes adequados, colheres, uma faca e uma tábua de cortar. Consulta os ingredientes e as quantidades indicados em cada receita.']
 ];
 let titleIndex=0,answerIndex=0;
 html=html.replace(/(<a class="elementor-toggle-title"[^>]*>)[\s\S]*?(<\/a>)/g,(_,a,b)=>a+faq[titleIndex++][0]+b);
 html=html.replace(/(<div id="elementor-tab-content-[^"]+"[^>]*>)[\s\S]*?(<\/div>)/g,(_,a,b)=>a+'<p>'+faq[answerIndex++][1]+'</p>'+b);
 if(titleIndex!==10||answerIndex!==10)throw Error('Unexpected FAQ structure');
 html=html.replace(/Resolvi reunir as 60 melhores receitas em um único lugar e compartilhar esse conhecimento\s+com você também\./g,'Reuni as 60 melhores receitas num só lugar para partilhar contigo o que aprendi.');
 // Work on text nodes, leaving media, tracking scripts and destinations intact.
 let skip=0;
 html=html.split(/(<[^>]+>)/).map(part=>{
  if(part.startsWith('<')){if(/^<(script|style)\b/i.test(part))skip++;if(/^<\/(script|style)\b/i.test(part))skip--;return part;}
  if(skip)return part;
  for(const [from,to] of swaps)part=part.split(from).join(to);
  return part;
 }).join('');
 html=html.replace('lang="pt-BR"','lang="pt-PT"');
 const attributes=[
  ['Saladas que viram refeição. Descubra o Método das 5 Camadas Saborosas, 60 receitas, molhos e o app Monte a Sua Salada.','Descobre mais de 60 receitas de saladas em frascos, o método das camadas, molhos caseiros e uma app para organizar as tuas refeições.'],
  ['Aplicativo incluído no plano completo','Aplicação incluída no plano completo'],
  ['Preparo e apresentação de molho sobre uma salada','Preparação e apresentação de molho sobre uma salada'],
  ['Molho cremoso sendo colocado sobre uma salada colorida','Molho cremoso a ser servido sobre uma salada colorida'],
  ['Chef preparando uma salada na cozinha','Chef a preparar uma salada na cozinha'],
  ['três bônus em computador','três bónus em computador']
 ];
 html=html.replace(/\b(?:alt|aria-label|title|content)="[^"]*"/g,attr=>{
  for(const [from,to] of attributes)attr=attr.split(from).join(to);
  return attr;
 });
 // The original heading separates its words across Elementor spans.
 html=html.replace(/o que vais(\s*<[^>]+>\s*)*vai\s*/i,match=>match.replace(/vai\s*$/,''));
 return html;
}
