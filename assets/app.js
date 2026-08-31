/* ═══════════════════════════════════════════════════════════════
   SIMBIONTE — motor do hero
   Um só requestAnimationFrame. Zero dependência.
   Regras: nenhuma leitura de layout dentro do laço, só transform
   e opacity animam, e prefers-reduced-motion desliga tudo.
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const hero = document.querySelector('.hero');
  if (!hero) return;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; // o CSS entrega a versão parada

  const track   = hero.querySelector('.hero__track');
  const stage   = hero.querySelector('.hero__stage');
  const video   = hero.querySelector('.stage__video');
  const beatEls = [...hero.querySelectorAll('.beat')];
  const navMark = document.querySelector('.nav__mark');

  const FRAMES = 121, FPS = 24;
  const LAST_T = (FRAMES - 1) / FPS;       // 5.0s — último quadro

  /* ── janelas de cada batimento: [entra, entrou, sai, saiu] ────
     Casadas na mão com a linha do tempo do 2º vídeo textless do Kling (5s):
       0.00–0.20 mão e anéis no preto puro · 0.22 o globo nasce
       0.30–0.45 anéis de HUD · 0.45–0.75 painéis orbitando (o "sistema")
       0.78–0.86 tudo colapsa numa luz · 0.90+ ponto de luz no preto */
  const WINDOWS = [
    /* começa em negativo de propósito: com [0, …] a função devolve 0
       exatamente em p=0 e o hero abria sem título nenhum na tela */
    [-0.100, -0.020, 0.150, 0.210],
    [ 0.240,  0.300, 0.400, 0.450],
    [ 0.480,  0.550, 0.700, 0.760],
    [ 0.830,  0.900, 9.990, 9.999],
  ];

  /* ── utilidades ───────────────────────────────────────────── */
  const clamp  = (v, a, b) => v < a ? a : v > b ? b : v;
  const smooth = t => t * t * (3 - 2 * t);
  const lerp   = (a, b, t) => a + (b - a) * t;

  function windowAt(p, [a, b, c, d]) {
    if (p <= a || p >= d) return 0;
    if (p < b)  return (p - a) / (b - a);
    if (p <= c) return 1;
    return 1 - (p - c) / (d - c);
  }

  /* ── geometria em cache (nunca lida dentro do laço) ───────── */
  let trackTop = 0, range = 1;
  function measure() {
    const r = track.getBoundingClientRect();
    trackTop = r.top + window.scrollY;
    range    = Math.max(1, track.offsetHeight - stage.offsetHeight);
  }

  /* ── estado ───────────────────────────────────────────────── */
  let pRaw = 0, pSmooth = 0, pVid = 0;      // alvo · glide lento (CSS) · glide rápido (vídeo)
  let running = false, visible = false;
  const lastWrite = { p: -1, pv: -1, ignite: -1, focus: -1, bloom: -1 };

  /* ── o palco ──────────────────────────────────────────────────
     Um caminho só, vídeo, em qualquer aparelho. Antes o celular
     pintava 96 AVIF num canvas para fugir do seek lento do iOS —
     mas com TODO quadro sendo keyframe a busca decodifica um quadro
     só, que era a causa da lentidão. E os AVIF acabaram pesando
     mais que o vídeo 1080p inteiro entregando menos nitidez.
     A escolha de arquivo aqui é só resolução: errar não quebra nada,
     no pior caso a imagem fica mais mole. */
  const grande = matchMedia('(min-width: 861px)').matches;
  video.src = grande ? video.dataset.src : video.dataset.srcSm;
  video.load();

  video.addEventListener('loadeddata', () => {
    try { video.currentTime = 0; } catch (e) {}
    stage.classList.add('is-ready');
  }, { once: true });

  // o iOS às vezes só entrega o primeiro quadro depois de um play/pause mudo
  video.addEventListener('canplay', () => {
    const pr = video.play();
    if (pr && pr.then) pr.then(() => video.pause()).catch(() => {});
  }, { once: true });

  /* ── entrada: rolagem e cursor ────────────────────────────── */
  addEventListener('scroll', () => {
    pRaw = clamp((scrollY - trackTop) / range, 0, 1);
  }, { passive: true });

  addEventListener('resize', () => {
    measure();
    pRaw = clamp((scrollY - trackTop) / range, 0, 1);
  }, { passive: true });

  /* teclado: focar um botão escondido rola o hero até ele */
  beatEls.forEach((el, i) => {
    el.addEventListener('focusin', () => {
      const [, b, c] = WINDOWS[i];
      const y = trackTop + ((b + Math.min(c, 1)) / 2) * range;
      if (Math.abs(scrollY - y) > 8) scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* ── revelação do H1, palavra por palavra ─────────────────── */
  (function splitTitle() {
    const h = hero.querySelector('[data-split]');
    if (!h) return;
    const words = h.textContent.trim().split(/\s+/);
    h.textContent = '';
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.dataset.w = ''; s.style.setProperty('--i', i);
      s.textContent = w;
      h.append(s, i < words.length - 1 ? ' ' : '');
    });
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-revealed')));
  })();

  /* ── contadores ───────────────────────────────────────────── */
  const stats = [...hero.querySelectorAll('.stat')].map(el => ({
    el, out: el.querySelector('.stat__num'),
    to: +el.dataset.count, done: false,
  }));
  function runCount(s) {
    if (s.done) return;
    s.done = true;
    const t0 = performance.now(), D = 900;
    const step = now => {
      const t = clamp((now - t0) / D, 0, 1);
      s.out.textContent = Math.round(s.to * (1 - Math.pow(1 - t, 4)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ── o laço ───────────────────────────────────────────────── */
  let lastT = performance.now();

  function frame() {
    if (!running) return;

    /* Suavização por TEMPO, não por quadro: num monitor de 144 Hz o lerp
       por quadro convergia quase o dobro mais rápido que num de 60, e a
       parada ficava seca. Assim o glide dura o mesmo em qualquer tela. */
    const now = performance.now();
    const dt = Math.min(64, now - lastT); lastT = now;
    /* dois ritmos: o progresso persegue o alvo devagar, então quando a
       rolagem para a cena ainda desliza um pouco antes de assentar — é o
       "continua fluido" que o Luiz pediu. O cursor persegue mais rápido,
       senão o parallax fica borrachudo e atrasado. */
    const kP = 1 - Math.pow(1 - 0.052, dt / 16.667);
    /* O VÍDEO persegue quase 1:1 (kV alto): assim ele anda liso indo E
       voltando, sem ficar catando o alvo devagar (era o "lag na volta").
       Só os efeitos de CSS (batimentos, --ignite) é que ganham o glide
       lento — ali o atraso é bonito, no vídeo não. */
    const kV = 1 - Math.pow(1 - 0.4, dt / 16.667);
    pSmooth = lerp(pSmooth, pRaw, kP);
    if (Math.abs(pSmooth - pRaw) < .00002) pSmooth = pRaw;
    pVid = lerp(pVid, pRaw, kV);
    if (Math.abs(pVid - pRaw) < .00002) pVid = pRaw;

    const p = pSmooth;

    /* — o vídeo — persegue pVid, não p, pra não lagar na volta — */
    if (Math.abs(pVid - lastWrite.pv) > .0002) {
      lastWrite.pv = pVid;
      const t = pVid * LAST_T;
      /* `video.seeking` é a correção do engasgo: sem ela eu mandava um
         currentTime novo a cada quadro por cima de um seek ainda em voo.
         Os pedidos empilhavam e o vídeo andava aos trancos. */
      if (video.readyState >= 1 && !video.seeking &&
          Math.abs(video.currentTime - t) > 1 / (FPS * 3)) {
        try { video.currentTime = t; } catch (e) {}
      }
    }

    /* — indicadores e batimentos (glide lento) — */
    if (Math.abs(p - lastWrite.p) > .0002) {
      lastWrite.p = p;


      /* o wordmark acende quando o vídeo colapsa na luz (~0.80) e assenta
         no ponto de luz sobre o preto — a luz "vira" a palavra. O vídeo
         não tem mais texto, então não há o que tapar: sem véu. */
      const ig = smooth(clamp((p - 0.80) / 0.13, 0, 1));
      if (Math.abs(ig - lastWrite.ignite) > .004) {
        lastWrite.ignite = ig;
        stage.style.setProperty('--ignite', ig.toFixed(3));
        if (navMark) navMark.style.setProperty('--ignite', ig.toFixed(3));
      }

      /* o brilho azul de fundo entra com a palavra mas CAI de volta a zero
         no fim — o Luiz quer só a escrita SIMBIONTE quando o vídeo acaba,
         nada solto atrás */
      const bl = ig * (1 - smooth(clamp((p - 0.93) / 0.06, 0, 1)));
      if (Math.abs(bl - lastWrite.bloom) > .004) {
        lastWrite.bloom = bl;
        stage.style.setProperty('--bloom', bl.toFixed(3));
      }

      /* a máscara do vídeo aperta quando o globo entra: na mão (preto puro)
         ela nem precisa existir; do globo ao túnel é o que dissolve a borda */
      const fo = smooth(clamp((p - 0.16) / 0.09, 0, 1));
      if (Math.abs(fo - lastWrite.focus) > .004) {
        lastWrite.focus = fo;
        stage.style.setProperty('--focus', fo.toFixed(3));
      }

      /* — batimentos — */
      for (let i = 0; i < beatEls.length; i++) {
        const w = WINDOWS[i];
        const e = smooth(windowAt(p, w));
        const el = beatEls[i];
        const mid = (w[1] + Math.min(w[2], 1)) / 2;
        const y = (p < mid ? 1 : -1) * (1 - e) * 34;

        el.style.opacity = e.toFixed(3);
        el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
        el.style.pointerEvents = e > .5 ? 'auto' : 'none';
        el.style.willChange = e > 0 && e < 1 ? 'transform, opacity' : 'auto';

        if (e > .35) for (const s of stats) if (el.contains(s.el)) runCount(s);
      }
    }

    /* O Luiz não quer NENHUMA reação da hero ao mouse — nada de parallax,
       de malha revelada pelo cursor, nem de botão magnético. O laço só
       cuida do scrub do vídeo e dos batimentos. */

    requestAnimationFrame(frame);
  }

  const start = () => { if (!running) { running = true; lastT = performance.now(); requestAnimationFrame(frame); } };
  const stop  = () => { running = false; };

  /* só gasta quadro enquanto o hero está na tela e a aba, à vista */
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    visible && !document.hidden ? start() : stop();
  }, { rootMargin: '10% 0px' }).observe(hero);

  document.addEventListener('visibilitychange', () => {
    document.hidden || !visible ? stop() : start();
  });

  measure();
  addEventListener('load', measure);
  pRaw = pSmooth = pVid = clamp((scrollY - trackTop) / range, 0, 1);
})();
