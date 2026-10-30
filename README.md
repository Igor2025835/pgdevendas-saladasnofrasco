# Saladas Saborosas no Frasco

Página de vendas estática e responsiva, com checkout Hotmart do plano completo (€14,90).

## Executar localmente

Requer Node.js 22 ou posterior, sem dependências adicionais.

```sh
npm start
```

Abra http://localhost:3000/. Os arquivos publicados estão em `dist/`.

## Publicar

O workflow `.github/workflows/pages.yml` publica `dist/` no GitHub Pages a cada envio à branch `main`, quando a variável de repositório `ENABLE_GITHUB_PAGES` estiver definida como `true`. Em Settings → Pages, a origem deve ser GitHub Actions.

O plano atual da conta não permite GitHub Pages neste repositório privado. Para ativar, é necessário um plano compatível ou tornar o repositório público por decisão do proprietário. Também é possível publicar a pasta `dist/` num serviço de hospedagem estática mantendo o repositório privado. A publicação fica desativada até essa configuração ser resolvida.

## Editar

- Estilos: `dist/review.css`.
- Interações: `dist/original-local.js`.
- Componentes e textos: `review-components.mjs`.
- Oferta e checkout: `reference-original/offer-updated.html`.
- Montagem da página: `build-reference.mjs`.
- Versão de conversão em `/gro`: `build-gro.mjs`, com estilos adicionais em `dist/gro.css`.

Após alterar componentes ou oferta, execute `node --use-system-ca build-reference.mjs`. O gerador usa a referência HTML preservada localmente, os arquivos em `backups/before-original-return/index.html` e estilos da página de referência. Requer rede para atualizar os estilos externos. Faça commit também do `dist/` atualizado, que é publicado diretamente sem depender desse serviço externo.

Vídeos decorativos são silenciosos e carregados quando visíveis. A prévia da aula inicia apenas após clique. Imagens de avaliações podem ser ampliadas.

Para recriar `/gro` a partir da página principal atual, execute `node build-gro.mjs`. A saída fica em `dist/gro/index.html`; os ficheiros de imagem, vídeo, CSS e JavaScript partilhados usam caminhos a partir da raiz. A página principal permanece independente.

## Distribuição 50/50 e atribuição

Na Vercel, `traffic-router.mjs` divide novas visitas à raiz entre a principal (`src=pg1`) e `/gro` (`src=gro`), antes de carregar a página e os pixels. A atribuição é aleatória por visitante e fica guardada num cookie durante 30 dias; amostras pequenas podem não resultar exatamente em metade para cada versão. As UTMs e os parâmetros dos anúncios são preservados; um `src` de campanha anterior fica em `ad_src`.

Acesso direto a `/gro` mantém essa versão. Para rever uma página específica, usa `/?src=pg1` ou `/gro?src=gro`. Os checkouts normais mantêm o respetivo `src`, mesmo após alterações da UTMify; as ofertas de saída conservam `src=backredirect`. Assets, `/v2`, `/v3` e `/backredirect` ficam fora da divisão.

O servidor local usa a mesma distribuição. Valida com `node --test tests/*.test.mjs`. A configuração `proxy` em `vercel.json` é necessária para a distribuição em produção; alojamento puramente estático não executa este middleware.
