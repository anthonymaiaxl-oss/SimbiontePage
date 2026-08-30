# Simbionte — Landing Page

Hero em rolagem: o vídeo não toca sozinho, ele é **rebobinado pela rolagem**.
Quem rola constrói a cena — toque → anel → globo → SIMBIONTE — e no fim a
própria marca do vídeo acende com os botões embaixo.

Site estático. Sem build, sem `npm install`, sem dependência.

---

## ⚠️ ANTES DE ANUNCIAR: trocar o WhatsApp

O número que está no site agora é **falso** (`5500000000000`). Se alguém
clicar, não vai chegar em você.

**Como trocar:**

1. Abra o arquivo `index.html`
2. Aperte **Ctrl + F** e digite: `wa.me`
3. Vão aparecer **3 resultados** — botão do topo, botão do hero e botão
   do rodapé. Troque o número nos três.
4. O formato é `55` + DDD + número, tudo junto, sem espaço, traço ou
   parêntese.

   | Seu número | Vira |
   |---|---|
   | (11) 99876-5432 | `5511998765432` |
   | (21) 98765-4321 | `5521987654321` |

Depois do `?text=` vem a mensagem que já aparece digitada para o cliente.
Ela está codificada para URL: `%20` é espaço e `%21` é `!`.

---

## Rodar no seu PC

```bash
python C:/dev/simbionte-lp/serve.py
```

Depois abra `http://localhost:5622`.

**Não troque por `python -m http.server`.** O servidor padrão do Python não
responde a *HTTP Range*, e sem isso o navegador diz que o vídeo não é
rebobinável (`video.seekable` vazio): a página abre, mas o hero fica
congelado no primeiro quadro. O `serve.py` existe justamente para isso.
Hospedagem de verdade (Vercel, Netlify, nginx) já faz range sozinha.

---

## Publicar na Vercel

1. Vercel → **Add New → Project** → escolha o repositório `SimbiontePage`
2. **Framework Preset:** `Other`
3. **Build Command:** deixe **vazio**
4. **Output Directory:** deixe **vazio** (é a raiz)
5. Deploy

Não tem build. Os arquivos da raiz já são o site.

---

## Mapa dos arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | a página inteira. É aqui que fica o texto e o WhatsApp |
| `assets/styles.css` | todo o visual, incluindo as fontes embutidas |
| `assets/app.js` | o motor do hero (rolagem, batimentos, botão magnético) |
| `assets/hero.mp4` | vídeo do desktop — 1920×1080, 192 quadros, 7,1 MB |
| `assets/hero-720.mp4` | vídeo do celular — 1280×720, 3,6 MB |
| `assets/poster.avif/.jpg` | primeiro quadro, aparece antes do vídeo carregar |
| `assets/og.jpg` | imagem que aparece ao compartilhar no WhatsApp/redes |
| `assets/fonts/` | Archivo, DM Sans e Fira Code hospedadas aqui |

---

## Trocar o vídeo do hero

Os dois arquivos precisam ser regerados **juntos**, senão desktop e celular
mostram animações diferentes.

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

Se a contagem de quadros mudar, ajuste `FRAMES` no topo de `assets/app.js`
e o `/192` em `index.html`.

### Por que esses parâmetros

- **`-g 1`** — todo quadro vira keyframe. É o que faz a rolagem rebobinar
  na hora: buscar qualquer ponto custa decodificar **um** quadro. Neste
  vídeo isso saiu de graça: medi `-g 1`, `-g 6` e `-g 12` e a diferença de
  peso foi menor que 7%, porque o campo de partículas muda todo quadro e
  a predição entre quadros não tem o que aproveitar.

- **`curves=...`** — esmaga o preto até zero de verdade. **Não é opcional.**
  O CSS compõe o vídeo com `mix-blend-mode: screen`, onde preto não soma
  nada e portanto some. É isso que faz o holograma parecer estar *na*
  página em vez de num retângulo colado. Se o preto ficar em cinza escuro,
  volta a aparecer a moldura do vídeo.

- **`-crf 33`** — testado contra 35 e 37. Em 35 o campo de estrelas começa
  a sumir e a malha do mapa borra. 33 é o piso.

- **sem `hqdn3d`** — a primeira versão tinha redução de ruído e era ela que
  comia a partícula fina e deixava tudo mole.

---

## Detalhes que custaram tempo (não desfaça sem ler)

- **`overflow-x` vai só no `body`, nunca no `<html>`.** No `<html>` ele
  transforma o próprio elemento em container de rolagem: `position: sticky`
  para de grudar e o hero inteiro morre.

- **Nada de `content-visibility: auto` na seção depois do hero.** Quando ela
  saía de vista voltava ao tamanho estimado, o documento encolhia e o
  navegador reancorava a rolagem — dava salto de centenas de pixels no meio
  do hero.

- **Os batimentos são `position: absolute` dentro de `.beats`, que precisa
  de `inset: 0`.** Sem isso `.beats` tem altura zero (todo filho é absoluto)
  e `top`/`bottom` resolvem contra o nada: o título vaza para fora da tela.

- **A janela do primeiro batimento começa em número negativo** (`-0.100`).
  Com `0` a função de opacidade devolve 0 exatamente em `p = 0` e o hero
  abria sem título nenhum.

- **A escolha desktop/celular é por largura só para resolução.** Já foi por
  `innerWidth` para decidir o *caminho* inteiro, e isso prendia um desktop
  que abriu com a janela estreita na versão de baixa resolução, para sempre.

- **Sem `!video.seeking`, o arrasto engasga.** O código mandava um
  `currentTime` novo a cada quadro por cima de um seek ainda em voo e os
  pedidos empilhavam.

---

## Acessibilidade

- Contraste mínimo medido: **5,57:1** (o mínimo AA é 4,5).
- Tudo funciona no teclado: dar Tab num botão que está escondido faz o hero
  rolar sozinho até o momento em que ele aparece.
- Quem tem "reduzir movimento" ligado no sistema recebe a página inteira
  parada e empilhada, com o texto todo visível de uma vez — sem rolagem
  sequestrada e sem vídeo.
- Sem JavaScript a página também fica legível, no mesmo formato empilhado.
