# Oferta de saída

- Página principal: mantém os 13 botões de compra e o preço de 11,90 €.
- `/backredirect`: plano completo por 7,90 €, incluindo os conteúdos e os bónus do plano. Todos os botões usam `off=j1f0nk4j&checkoutMode=10`.
- Origem dos pedidos: os dois botões dessa página e o botão do pop-up enviam `src=backredirect`. `recovery-attribution.js` conserva essa etiqueta mesmo quando a UTMify atualiza os links, preservando UTMs, SCK e XCOD. Não escreve `src` no URL da página nem no armazenamento global da UTMify, para não marcar compras posteriores da página principal como recuperação.
- Ao voltar: navega diretamente para `/backredirect`, sem pop-up.
- Pop-up: só no computador, como aproximação de intenção de fecho ao sair com o rato pelo topo direito. Usa a mesma oferta e contém uma ligação para a página completa.

## Acionamento conservador

O primeiro gesto real na página (fora de uma ligação ou de um campo) pode criar uma única entrada de histórico com o mesmo URL. Não há espera de 12 segundos. Só o regresso dessa entrada para a entrada identificada como base navega para a oferta. A navegação usa `location.replace`, preserva os parâmetros da campanha e evita um ciclo de regresso à página principal. Guardas já existentes são reaproveitadas após recarregar, sem adicionar outra entrada.

O pop-up exige computador com rato, largura mínima de 900 px, cinco segundos na página e uma saída real do ponteiro pelo topo direito, precedida por movimento recente dentro da página. Há uma confirmação de 200 ms, cancelada ao regressar com o rato, perder o foco, mudar de separador ou clicar numa ligação. Não aparece durante a reprodução da aula, com outro diálogo aberto ou depois de iniciar o checkout. Não usa timers isolados, scroll invertido nem perda de foco como gatilhos. O botão Voltar tem prioridade e abre a página.

Os dois fluxos são limitados à sessão do separador e ficam desativados após recusar a oferta, visitar a página de recuperação ou iniciar o checkout. O armazenamento indisponível falha sem acionar a oferta. A página de recuperação não instala uma nova guarda. Fechar o pop-up não força navegação e não impede fechar a guia.

O movimento do rato é apenas uma heurística: o clique exato no X da guia pertence à interface do navegador e não é acessível ao site. Não é usado `beforeunload` nem um alerta nativo de confirmação. Sem qualquer interação na página, o navegador pode ignorar entradas de histórico criadas por scripts; não se promete capturar todas as saídas.

## Fontes e validação

- Marcação: `reference-original/exit-offer.html` e `reference-original/backredirect.html`.
- Comportamento: `dist/exit-offer.js` e `dist/backredirect.js`.
- Estilos: `dist/review.css` e `dist/backredirect.css`.
- Gerar as páginas: `node --use-system-ca build-reference.mjs`.
- Testes: `node --test tests/exit-offer.test.mjs`.

Os scripts UTMify e Clarity são conservados em ambas as páginas. Não é adicionado um novo pixel nem um disparo manual de checkout. A nova imagem dos frascos foi exportada em WebP com larguras de 640 e 1200 px. O desconto é de 4 €; não há contador nem alegações de disponibilidade limitada. A página foi encurtada com a oferta e o botão na primeira dobra e uma lista de conteúdos e bónus abaixo.
