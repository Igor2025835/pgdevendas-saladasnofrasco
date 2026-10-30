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
