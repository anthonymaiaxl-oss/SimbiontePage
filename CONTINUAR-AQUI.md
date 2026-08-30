# Continuar daqui — Landing Page Simbionte

Registro da sessão de **30/08/2026** (Claude Opus 5, Claude Code).
Escrito para ser colado no início de um chat novo, em conta nova, que não
tem nenhuma memória do que aconteceu aqui.

> **Cole este arquivo inteiro na primeira mensagem do chat novo.**
> Ele substitui a memória que a conta antiga tinha.

---

# 1. Quem é o usuário

Chama-se **Luiz** (`anthonymaiaxl@gmail.com`).

A força dele é **produto, design e decisão visual** — nessas áreas é preciso
e direto: aponta desalinhamento de poucos pixels, percebe animação travada,
sabe exatamente o que quer na tela. Não confundir com leigo.

Onde ele é iniciante: **automação e n8n**. Disse explicitamente "não manjo
disso". Está aprendendo enquanto constrói.

Tem pressa e cobra ritmo.

## Como explicar para ele

- **Passo a passo literal.** Dizer onde clicar, com o nome do botão.
- **Nunca cortar detalhe para economizar token.** Ele pediu isso
  explicitamente. Um resumo enxuto que o obriga a perguntar de novo custa
  mais caro que a explicação completa de primeira.
- Português do Brasil, direto, sem enrolação.

## Duas regras de trabalho que ele impôs

1. **Olhe o resultado antes de chamar ele.** Se dá para renderizar a página
   e conferir, faça. Não entregar dizendo "está pronto" sem ter olhado — ele
   vira seu par de olhos e perde tempo abrindo, olhando e voltando para
   dizer o que ficou feio.

2. **Não editar arquivo com `sed` nem script no terminal.** Usar as
   ferramentas próprias de edição. Editar por fora faz o sistema reenviar o
   arquivo inteiro a cada mensagem seguinte e queima o contexto à toa.

## Uma preferência de design que ele já reprovou uma vez

**"Quero que seja uma página, não um filme."**

Ele rejeitou explicitamente vídeo de fundo com texto parado por cima. O que
ele quer: a cena **responde**. Mouse move a câmera, scroll conduz a
transição, elementos têm profundidades diferentes. Todo elemento de UI é
HTML/CSS real com hover e foco, nunca pixel achatado dentro de imagem.

---

# 2. As 15 skills

## O gatilho

Quando ele escrever **"usa as 15 skills"**, **"ativa as 15"**, **"liga as
15"** ou variação, é para trabalhar com o stack abaixo. Ele não vai citar
skill por nome — digitar 15 nomes toda vez é atrito.

**"Ativa as 15" significa "esse é o stack, escolhe as certas"**, não
"carrega todas". Carregar `seo` e `article-writing` para animar um botão só
entope o contexto. **Carregue as que a tarefa pede e diga a ele quais foram.**

## A lista

| Skill | Para quê |
|---|---|
| `motion-foundations` | tokens de movimento, easing, springs, performance |
| `motion-patterns` | animações prontas: botão, modal, toast, stagger, scroll |
| `motion-advanced` | drag, gestos, animação de texto, SVG, sequências |
| `make-interfaces-feel-better` | acabamento: espaçamento, sombras, hit areas, estados |
| `design-spells` | microinterações que dão personalidade |
| `design-mattnigh` | direção de UX/UI |
| `design-system-affaan` | gerar ou auditar design system |
| `design-system-patterns` | tokens, temas, arquitetura de componentes |
| `ui-pattern` | blocos de UI reutilizáveis |
| `ui-review` | QA da UI antes de publicar |
| `accessibility-compliance` | WCAG 2.2, ARIA, leitor de tela, mobile |
| `seo` | SEO técnico, dados estruturados, Core Web Vitals |
| `article-writing` | conteúdo longo com voz consistente |
| `fal-ai-media` | gerar imagem/vídeo/áudio via fal.ai |
| `deep-research` | pesquisa com múltiplas fontes e citações |

**Ordem de dependência:** `motion-foundations` sempre antes de
`motion-patterns` e `motion-advanced`.

**Em projeto HTML/CSS/JS puro** as de motion valem como *princípio*, não como
código (são escritas para React com `motion/react`): tokens de duração e
easing, animar só `transform` e `opacity`, nunca `width`/`height`/`top`/`left`,
e `prefers-reduced-motion` mandando em tudo. Quem entrega de verdade nesse
tipo de projeto é `make-interfaces-feel-better`, `design-spells`, `ui-review`
e `accessibility-compliance`.

**Duas precisam de MCP que ele não tem configurado:** `deep-research`
(firecrawl + exa) e `fal-ai-media` (fal.ai, créditos pagos). Avisar em vez de
tentar e dar erro.

## Como instalar no computador novo

⚠️ **Se a conta nova for no MESMO PC, não precisa fazer nada.** As skills
ficam numa pasta do computador, não da conta. O chat novo já enxerga.

Só se for em outra máquina:

1. Copie a pasta `skills` que veio junto com este arquivo
2. Cole em:
   - **Windows:** `C:\Users\SEU-NOME\.claude\skills`
   - **Mac / Linux:** `~/.claude/skills`
3. Dentro de `skills` tem que ficar uma pasta por skill
   (`.claude/skills/seo/SKILL.md`, e não `.claude/skills/skills/seo/`)
4. Feche e abra o Claude Code

São **23 pastas** (as 15 do stack + 8 extras que já estavam instaladas:
`banner-design`, `brand`, `design`, `design-system`, `frontend-design`,
`slides`, `ui-styling`, `ui-ux-pro-max`).

**Origem:** são skills gratuitas e de código aberto de `affaan-m`,
`wshobson`, `sickn33` e `mattnigh`. O site `agentskill.sh` (que distribui
via `/learn`) estava fora do ar, então foram baixadas direto dos
repositórios dos autores. Duas foram renomeadas para não colidir:
`design` (mattnigh) virou **`design-mattnigh`** e `design-system` (affaan)
virou **`design-system-affaan`**.

---

# 3. O projeto

**Landing page própria da Simbionte.** O serviço que o Luiz vende é
justamente criar landing pages — então esta é a peça de anúncio dele. Vai
receber tráfego pago.

- **Pasta:** `C:\dev\simbionte-lp`
- **Repositório:** https://github.com/anthonymaiaxl-oss/SimbiontePage
- Estático, arquivos na raiz, sem build, sem `npm install`, zero dependência

## Rodar no PC

```bash
python C:/dev/simbionte-lp/serve.py
```

Depois abrir `http://localhost:5622`.

🚨 **Não trocar por `python -m http.server`.** Ver a seção 5 — esse detalhe
sozinho custou boa parte da sessão.

## Publicar na Vercel

**Add New → Project** → repositório `SimbiontePage` → Framework Preset
**Other** → Build Command **vazio** → Output Directory **vazio** → Deploy.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | a página inteira. Texto e WhatsApp ficam aqui |
| `assets/styles.css` | todo o visual, com as fontes embutidas no topo |
| `assets/app.js` | motor do hero (280 linhas, sem dependência) |
| `assets/hero.mp4` | vídeo desktop — 1920×1080, 192 quadros, 7,1 MB |
| `assets/hero-720.mp4` | vídeo celular — 1280×720, 192 quadros, 3,6 MB |
| `assets/poster.avif` / `.jpg` | primeiro quadro, aparece antes do vídeo |
| `assets/og.jpg` | imagem de compartilhamento |
| `assets/fonts/` | Archivo, DM Sans, Fira Code hospedadas no projeto |
| `serve.py` | servidor local **com HTTP Range** (obrigatório) |
| `README.md` | manual do projeto |

---

# 4. 🚨 PENDÊNCIA QUE BLOQUEIA O ANÚNCIO

**O número de WhatsApp é falso.** Está `5500000000000`. Quem clicar não
chega em lugar nenhum.

**Como trocar:**
1. Abrir `index.html`
2. **Ctrl + F** → digitar `wa.me`
3. Aparecem **3 resultados**: botão do topo, botão do hero, botão do rodapé
4. Trocar o número nos três
5. Formato: `55` + DDD + número, tudo junto, sem espaço nem traço.
   `(11) 99876-5432` vira `5511998765432`

Depois do `?text=` vem a mensagem que já aparece digitada para o cliente,
codificada para URL (`%20` é espaço, `%21` é `!`).

---

# 5. Como o hero funciona

O vídeo **não toca**. Ele é **rebobinado pela rolagem** (`currentTime`
amarrado ao scroll). Quem rola constrói a cena.

O vídeo é uma peça de marca da Simbionte com arco narrativo próprio:
dedo toca um ponto de luz → anel de energia se abre → vira um globo →
o globo se enche de painéis de dados → tudo se dissolve na palavra
**SIMBIONTE** acesa.

Quatro blocos de texto entram e saem **casados na mão** com a linha do
tempo da animação:

| Bloco | Janela (progresso) | O que o vídeo mostra |
|---|---|---|
| 1 — "Um toque decide tudo." | 0 → 0,21 | mão e ponto de luz |
| 2 — "A maioria das páginas morre…" | 0,235 → 0,425 | anel abrindo, globo nascendo |
| 3 — "A nossa não abre. Ela liga." + 3 cartões | 0,455 → 0,715 | sistema completo de painéis |
| 4 — kicker + CTAs | 0,80 → fim | SIMBIONTE aceso |

O truque de composição: o CTA pousa **embaixo do wordmark do próprio
vídeo**. A marca que acende na tela é a do vídeo, não HTML.

Referências de tempo: 0,17 o anel estoura · 0,25 o globo nasce · 0,50
painéis cheios · 0,76 tudo se dissolve · 0,84 SIMBIONTE limpo na tela.

## Detalhes de personalidade

- **Botão magnético**: o CTA principal é puxado na direção do cursor, com
  brilho que segue o ponteiro dentro dele
- **Malha revelada pelo cursor**: uma planta baixa fraca que só aparece
  onde o mouse está
- **Trilho de progresso** na lateral esquerda, com o nome da fase
  (`toque` → `expansão` → `sistema` → `simbionte`)
- **Leitura de quadro** no canto: `QUADRO 087 / 192` — mostra que quem
  rola está dirigindo
- **Parallax por profundidade** reagindo ao mouse
- **Contadores** que sobem quando o bloco entra
- **Revelação do H1** palavra por palavra

---

# 6. Decisões técnicas e armadilhas

**Não desfaça nada daqui sem ler o porquê.** Cada item destes custou tempo
real de depuração nesta sessão.

## 🔴 `python -m http.server` não faz HTTP Range

Sem range o navegador reporta `video.seekable = [0, 0]` e escrever
`video.currentTime` é **aceito sem lançar erro e silenciosamente revertido
para 0**.

O sintoma engana muito: o vídeo carrega, `readyState` é 4, `buffered` cobre
o arquivo inteiro, o evento `seeked` até dispara — e o quadro não muda.
Cheguei a suspeitar do encode, do `mix-blend-mode`, de esgotamento de
decodificador e do próprio arquivo (que estava impecável no `ffprobe`).

**A pista que resolve é `video.seekable`, não `buffered`.** Em qualquer
página que rebobine vídeo pela rolagem, checar isso *primeiro*.

O `serve.py` do projeto responde `206 Partial Content`. Hospedagem de
verdade (Vercel, Netlify, nginx) já faz range sozinha.

## 🔴 O vídeo não pode parecer vídeo

O Luiz reprovou a primeira versão: *"o recorte do vídeo tá muito visível,
fica claro que é um vídeo colado ali"*.

Solução, em três partes que só funcionam juntas:

1. Esmagar o preto a zero **no encode**:
   `curves=all='0/0 0.05/0 0.5/0.53 1/1'`
2. Compor com `mix-blend-mode: screen`
3. O elemento **pai** precisa ter a cor da página como `background` — o
   `screen` mistura com o fundo do próprio pai, não com a página

Preto não soma nada em `screen`, então some. Sobra só a luz, direto sobre o
fundo da página: sem retângulo, sem borda.

**De brinde a tarja do letterbox também fica invisível**, então dá para usar
`object-fit: contain` sempre e nunca cortar o wordmark. Isso eliminou um
compromisso que existia antes: cortar a palavra ou mostrar a caixa.

Só funciona com conteúdo que é *luz sobre preto* (holograma, partícula, neon).

## Encode — números medidos, para não remedir

- **`-g 1` (todo quadro keyframe) saiu de graça** neste vídeo:
  `g1` 19,27 MB · `g6` 19,30 MB · `g12` 17,98 MB. O campo de partículas
  muda todo quadro e a predição entre quadros não aproveita nada. Ou seja:
  seek instantâneo sem pagar por isso.
- **CRF 33 é o piso.** Testado contra 35 e 37 em recorte 1:1. Em 35 o campo
  de estrelas some e a malha do mapa borra; 37 desmonta.
- **Nada de `hqdn3d`.** A primeira versão tinha redução de ruído e era ela
  que comia a partícula fina — a causa real do "perdeu muita qualidade".
- **1080p nativo ganha de 900p reescalado** no mesmo peso: o 900p borra as
  linhas finas.
- **AVIF como imagem estática perde feio** para h264 all-intra aqui: 96
  quadros em 960×540 deram 7,57 MB, mais que o vídeo 1080p **inteiro** de
  192 quadros (7,12 MB).

Comando para regerar (os dois **juntos**, senão desktop e celular mostram
animações diferentes):

```bash
SRC="seu-video.mp4"
CRUSH="curves=all='0/0 0.05/0 0.5/0.53 1/1'"

ffmpeg -i "$SRC" -vf "$CRUSH,scale=1920:1080" \
  -c:v libx264 -preset veryslow -crf 33 -g 1 \
  -pix_fmt yuv420p -an -movflags +faststart assets/hero.mp4

ffmpeg -i "$SRC" -vf "$CRUSH,scale=1280:720" \
  -c:v libx264 -preset veryslow -crf 33 -g 1 \
  -pix_fmt yuv420p -an -movflags +faststart assets/hero-720.mp4
```

Se a contagem de quadros mudar, ajustar `FRAMES` no topo de `assets/app.js`
e o `/192` em `index.html`.

## Arrasto fluido

- **`!video.seeking` antes de escrever `currentTime`.** Sem isso o código
  mandava um alvo novo a cada quadro por cima de um seek em voo, os pedidos
  empilhavam e o vídeo andava aos trancos.
- **Suavização por tempo (`dt`), não por quadro.** Em 144 Hz o lerp por
  quadro convergia quase o dobro mais rápido que em 60 Hz e a parada saía
  seca.
- **A cena respira**: `scale` animado por CSS. `scale` é propriedade
  separada de `transform`, então compõe com o parallax do mouse sem
  briga. É o que impede a cena de congelar quando a rolagem para.

## Armadilhas de CSS

- **`overflow-x` vai só no `body`, nunca no `<html>`.** No `<html>` ele
  transforma o próprio elemento em container de rolagem: `position: sticky`
  para de grudar e o hero inteiro morre.
- **Nada de `content-visibility: auto` na seção depois do hero.** Quando ela
  saía de vista voltava ao tamanho estimado, o documento encolhia e o
  navegador reancorava a rolagem — dava salto de centenas de pixels no meio
  do hero.
- **Os blocos são `position: absolute` dentro de `.beats`, que precisa de
  `inset: 0`.** Sem isso `.beats` tem altura zero (todo filho é absoluto) e
  `top`/`bottom` resolvem contra o nada: o título vaza para fora da tela.
- **A janela do primeiro bloco começa em negativo** (`-0.100`). Com `0` a
  função de opacidade devolve 0 exatamente em `p = 0` e o hero abria **sem
  título nenhum**.
- **`viewport-fit=cover` obriga a tratar `env(safe-area-inset-*)`.**
  Declarar sem tratar é pior que não declarar: a marca some atrás do notch.

## Escolha desktop/celular

É por largura (`min-width: 861px`) e **só decide resolução do vídeo**.
Errar não quebra nada, no pior caso a imagem fica mais mole.

Já foi por `innerWidth` para decidir o *caminho de renderização* inteiro, e
isso prendia um desktop que abriu com a janela estreita na versão de baixa
resolução, para sempre — porque a escolha acontece uma vez só no boot.

Houve também uma versão que pintava 96 quadros AVIF num `<canvas>` no
celular, para fugir do seek lento do iOS. **Foi abandonada**: a causa da
lentidão era decodificar desde um keyframe distante, e com `-g 1` a busca
decodifica um quadro só. Os AVIF acabavam pesando mais e entregando menos.
Hoje é **um caminho só, vídeo, em qualquer aparelho**.

---

# 7. Acessibilidade — estado auditado

- Contraste mínimo medido: **5,57:1** (mínimo AA é 4,5). O valor anterior
  era 4,43 e reprovava por pouco — a cor `--ink-3` foi de `#63788f` para
  `#7189a1`.
- **Teclado**: dar Tab num botão escondido faz o hero rolar sozinho até o
  momento em que ele aparece. Verificado com Tab real: 7 Tabs levam ao CTA,
  o hero vai ao quadro 173 e o anel de foco fica visível.
- **`prefers-reduced-motion`**: entrega a página inteira parada e empilhada,
  texto todo visível de uma vez, sem rolagem sequestrada e sem vídeo.
  Verificado aplicando as 15 regras reais do bloco via CSSOM.
- **Sem JavaScript** a página também fica legível, no mesmo formato empilhado.
- Zoom 200%: sem rolagem horizontal, sem título cortado.
- Zero requisição a terceiro (fontes hospedadas no projeto).

---

# 8. O que NÃO foi testado

**iPhone real.** O navegador do painel de preview não decodifica AVIF, então
não deu para validar o poster AVIF ali (o fallback JPEG entrou e funcionou).
E o celular passou a usar vídeo em vez do canvas de quadros — a razão do
canvas era o seek lento do iOS, que deixou de existir com `-g 1`, mas quem
confirma é um iPhone de verdade.

**Vale abrir no iPhone antes de mandar tráfego pago.**

Se falhar no iOS, o degrade é elegante: fica o poster estático e os textos
continuam animando. Não quebra a página.

---

# 9. Peso e o compromisso

- **Desktop: 7,5 MB** (7,1 MB é o vídeo)
- **Celular: 4,0 MB** (3,6 MB é o vídeo)

Cada aparelho baixa **só o seu** — o JS promove um dos dois a `src`.

Esse é o preço da qualidade que ele pediu; a versão anterior tinha 2,6 MB e
ele reprovou por qualidade. Para tráfego pago vale acompanhar a taxa de
rejeição. **O CRF é a alavanca**: subir de 33 para 35 tira cerca de 1,3 MB,
com perda visível só em tela grande.

O poster de 80 KB aparece na hora, então a página nunca fica em branco
esperando o vídeo.

---

# 10. Outros projetos dele (contexto)

- **Simbionte (produto)** — `C:\dev\simbionte-site`, Next.js. Interface
  conectada a workflow do n8n. É o objetivo maior dele. Usa verde `#16a34a`
  como cor primária, diferente desta landing (que é ciano, puxado do vídeo).
- **Landing Vértice** — arquitetura/construtora.
  `C:\Users\J\OneDrive\Documentos\GitHub\vertice`, repo `vertice`.
  Usa a arquitetura antiga de hero (desktop vídeo / celular quadros no
  canvas) — que continua correta lá, porque aquele vídeo não é all-keyframe.
- **Landing Barbearia** — `C:\dev\barbearia`, repo `barbeariaport`.
- Regra geral: projetos ficam em `C:\dev`, **fora do OneDrive**, porque o
  OneDrive briga com build.

## Coisas que já custaram caro em outras sessões

- **n8n: um nó roda uma vez por item.** Leituras em corrente multiplicam o
  resultado — ligar `executeOnce`.
- **n8n: salvar não é publicar.** Sem publicar, os testes mentem.
- **Figma é plano Gratuito** — o MCP do Figma não funciona; ler pelo Chrome
  logado.
- **Screenshot em Chrome headless**: o Chrome dele fica minimizado e o
  `requestAnimationFrame` não roda. Renderizar com `puppeteer-core`. E isso
  trava o PC dele — agrupar prints, fechar sempre, checar sobras.
- **Painel de preview roda `rAF` a ~1 fps quando não está composto na tela.**
  Screenshot vem velho e qualquer medida de animação mente. Para validar
  scroll-scrub, ler o DOM, não confiar em screenshot. Trazer a aba para a
  frente resolve (medi 61 fps depois disso).

---

# 11. O que aconteceu nesta sessão, em ordem

1. Identifiquei que o vídeo entregue era uma peça de marca Simbionte com
   arco narrativo — o roteiro de scroll já vinha pronto dentro dele.
2. Construí o hero completo: 4 blocos casados com a linha do tempo, trilho
   de progresso, botão magnético, malha revelada pelo cursor, contadores.
3. Auditei com `make-interfaces-feel-better`, `design-spells`,
   `accessibility-compliance`, `ui-review` e `seo`. Saíram correções reais
   (contraste, safe-area, `content-visibility`, título com palavra-chave na
   frente, `robots.txt`, `sitemap.xml`, favicon, fontes auto-hospedadas).
4. Ele reprovou três coisas: qualidade baixa, moldura do vídeo visível e
   arrasto travando ao parar.
5. Refiz o encode em 1080p com 192 quadros, apliquei o `screen` sobre preto
   esmagado (a moldura sumiu), e corrigi o engasgo do arrasto.
6. Ele pediu paridade no mobile e funil para WhatsApp — feitos.
7. **Descobri no meio disso que o servidor local não fazia HTTP Range**, que
   era a causa do vídeo não rebobinar. Reescrevi o `serve.py`.
8. Subi para o GitHub.

---

# 12. Próximos passos sugeridos

1. **Trocar o número do WhatsApp** (seção 4) — bloqueia o anúncio
2. **Abrir no iPhone** e confirmar que o hero rebobina (seção 8)
3. Publicar na Vercel e apontar o domínio
4. Trocar o `https://simbionte.com.br/` do `canonical`, do `og:image`,
   do `sitemap.xml` e do `robots.txt` pelo domínio real, se for outro
5. As seções `Método`, `Trabalhos` e `Preços` da navbar apontam todas para
   `#depois` — são âncoras provisórias, ainda não existem essas seções
