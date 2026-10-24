# Oferta de saída

- Página principal: mantém os 13 botões de compra e o preço de 11,90 €.
- `/backredirect`: plano completo por 7,90 €, incluindo os conteúdos e os bónus do plano. Todos os botões usam `off=j1f0nk4j&checkoutMode=10`.
- Pop-up: usa a mesma oferta e contém uma ligação opcional para a página completa.

## Acionamento conservador

O pop-up só é elegível depois de 12 segundos e de uma interação real fora de controlos interativos. É criada uma única entrada de histórico, com o mesmo URL. Só o regresso dessa entrada para a entrada identificada como base abre o diálogo. O carregamento, scroll, movimentos do rato, mudança de separador e fecho do separador não abrem a oferta.

Não abre durante a reprodução da aula, com outro diálogo aberto, após um clique no checkout, ao regressar do checkout, em recarregamentos nem em navegação interna por âncoras. Aparece no máximo uma vez por sessão do separador. Se o armazenamento da sessão não estiver disponível, não abre. Fechar o diálogo ou escolher continuar a sair prossegue o pedido original de Voltar; não acrescenta novas entradas nem impede a saída. Loops decorativos silenciosos não contam como reprodução da aula.

Uma tentativa de saída antes da interação mínima segue normalmente. Os browsers não permitem um diálogo HTML personalizado no fecho do separador; não é usado `beforeunload` nem um alerta nativo de confirmação.

## Fontes e validação

- Marcação: `reference-original/exit-offer.html` e `reference-original/backredirect.html`.
- Comportamento: `dist/exit-offer.js`.
- Estilos: `dist/review.css`.
- Gerar as páginas: `node --use-system-ca build-reference.mjs`.
- Testes: `node --test tests/exit-offer.test.mjs`.

Os scripts UTMify e Clarity são conservados em ambas as páginas. Não é adicionado um novo pixel nem um disparo manual de checkout. As imagens usam os ficheiros já existentes no projeto. O desconto é de 4 €; não há um contador nem alegações de disponibilidade limitada.
