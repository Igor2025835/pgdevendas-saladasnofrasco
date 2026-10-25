# Vídeo da hero

Fonte: `Prepara saladas deliciosas como estas em minutos..mp4`, 54 364 141 bytes, 1080 × 1584, 30 fps, cerca de 52 segundos, com áudio.

O vídeo completo foi convertido para MP4 H.264 (Main), 24 fps, CRF 28, preset slow, yuv420p, sem faixa de áudio, metadados de origem ou capítulos, com faststart.

| Versão | Largura | Bytes | Redução |
| --- | --- | --- | --- |
| Telemóvel | 480 px | 3 391 710 | 93,8% |
| Computador | 640 px | 5 069 448 | 90,7% |

## Carregamento

- A imagem anterior foi retirada. O vídeo não tem imagem de capa nem sobreposição antes da reprodução.
- A moldura mantém a largura responsiva, margens e cantos anteriores; a proporção original 15:22 (1080 × 1584) reserva o espaço antes de carregar o vídeo. `object-fit: contain` mostra o enquadramento completo, sem cortes.
- O HTML não contém um `src` de vídeo nem elementos `source`: os ficheiros não são descarregados durante a renderização inicial.
- `hero-media.js` espera por `window.load`, duas oportunidades de pintura e um período ocioso, com fallback temporizado. Só então pode associar a fonte, se a hero estiver visível.
- Telemóveis e ligações com poupança de dados usam o MP4 menor; computadores usam a versão de 640 px. Não se descarregam as duas versões.
- Autoplay mudo, loop e playsinline, sem controlos ou sobreposições adicionais. O vídeo fica visível no evento `playing`; até lá, o espaço reservado fica livre.
- Pausa fora do ecrã e em separadores ocultos; retoma ao regressar, incluindo restauração do histórico. Erros ou bloqueio de autoplay mantêm o espaço reservado livre.

## Validação

`node --test tests/hero-media.test.mjs tests/exit-offer.test.mjs tests/recovery-attribution.test.mjs`

Validados o início adiado, seleção da versão, pausa/retoma, fallback de erros e navegadores antigos, proporção reservada, ausência de fontes antecipadas, integridade dos links e rastreamento. FFmpeg confirmou a ausência de áudio; os átomos `moov` precedem `mdat` nos dois ficheiros. No navegador foram confirmados a reprodução sem som nas duas versões e a pausa ao navegar para os planos. Uma abertura diretamente em `#oferta` manteve o vídeo sem fonte até a hero entrar no ecrã.
