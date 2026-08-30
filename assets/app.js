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
  const railFill= hero.querySelector('.rail__fill');
  const railLbl = hero.querySelector('[data-rail-label]');
  const readout = hero.querySelector('[data-readout]');
  const beatEls = [...hero.querySelectorAll('.beat')];
  const magnet  = hero.querySelector('[data-magnet]');
  const magGlow = magnet && magnet.querySelector('.btn__glow');
  const navMark = document.querySelector('.nav__mark');

  const FRAMES = 192, FPS = 24;
  const LAST_T = (FRAMES - 1) / FPS;       // 7.958s — último quadro

  /* ── janelas de cada batimento: [entra, entrou, sai, saiu] ────
     Casadas na mão com a linha do tempo do vídeo:
       0.17 o anel estoura · 0.25 o globo nasce · 0.50 painéis cheios
       0.76 tudo se dissolve · 0.84 SIMBIONTE limpo na tela          */
  const WINDOWS = [
    /* começa em negativo de propósito: com [0, …] a função devolve 0
       exatamente em p=0 e o hero abria sem título nenhum na tela */
    [-0.100, -0.020, 0.150, 0.210],
    [ 0.235,  0.295, 0.375, 0.425],
    [ 0.455,  0.515, 0.665, 0.715],
    [ 0.800,  0.860, 9.990, 9.999],
  ];
  const RAIL = [[0.22, 'toque'], [0.44, 'expansão'], [0.74, 'sistema'], [2, 'simbionte']];

  /* ── utilidades ───────────────────────────────────────────── */
  const clamp  = (v, a, b) => v < a ? a : v > b ? b : v;
  const smooth = t => t * t * (3 - 2 * t);
  const lerp   = (a, b, t) => a + (b - a) * t;
  const pad3   = n => String(n).padStart(3, '0');

  function windowAt(p, [a, b, c, d]) {
    if (p <= a || p >= d) return 0;
    if (p < b)  return (p - a) / (b - a);
    if (p <= c) return 1;
    return 1 - (p - c) / (d - c);
  }

  /* ── geometria em cache (nunca lida dentro do laço) ───────── */
  let trackTop = 0, range = 1, stageW = 0, stageH = 0;
  function measure() {
    const r = track.getBoundingClientRect();
    trackTop = r.top + window.scrollY;
    range    = Math.max(1, track.offsetHeight - stage.offsetHeight);
    stageW   = stage.offsetWidth;
    stageH   = stage.offsetHeight;
  }

  /* ── estado ───────────────────────────────────────────────── */
  let pRaw = 0, pSmooth = 0;                // progresso alvo e suavizado
  let mxT = .5, myT = .5, mx = .5, my = .5; // cursor normalizado
  let magX = 0, magY = 0, magXT = 0, magYT = 0;
  let magRect = null;
  let pointerIn = false, running = false, visible = false;
  const lastWrite = { p: -1, ignite: -1, frame: -1, rail: '' };

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
    magRect = null;
  }, { passive: true });

  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    hero.addEventListener('pointermove', e => {
      pointerIn = true;
      mxT = e.clientX / stageW;
      myT = e.clientY / stageH;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      pointerIn = false; mxT = .5; myT = .5;
    }, { passive: true });
  }

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
    const k  = 1 - Math.pow(1 - 0.10, dt / 16.667);
    pSmooth = lerp(pSmooth, pRaw, k);
    if (Math.abs(pSmooth - pRaw) < .00002) pSmooth = pRaw;
    mx = lerp(mx, mxT, k);
    my = lerp(my, myT, k);

    const p = pSmooth;

    /* — o vídeo e os indicadores — */
    if (Math.abs(p - lastWrite.p) > .0002) {
      lastWrite.p = p;

      const t = p * LAST_T;
      /* `video.seeking` é a correção do engasgo: sem ela eu mandava um
         currentTime novo a cada quadro por cima de um seek ainda em voo.
         Os pedidos empilhavam e o vídeo andava aos trancos. Agora só peço
         quando o anterior terminou — o alvo seguinte é sempre o mais
         recente, então não perco nada esperando. */
      if (video.readyState >= 1 && !video.seeking &&
          Math.abs(video.currentTime - t) > 1 / (FPS * 2)) {
        try { video.currentTime = t; } catch (e) {}
      }

      railFill.style.setProperty('--p', p.toFixed(4));

      const fr = Math.round(p * (FRAMES - 1)) + 1;
      if (fr !== lastWrite.frame) { lastWrite.frame = fr; readout.textContent = pad3(fr); }

      const lbl = RAIL.find(r => p < r[0])[1];
      if (lbl !== lastWrite.rail) {
        lastWrite.rail = lbl;
        railLbl.textContent = lbl;
        railLbl.toggleAttribute('data-hot', p >= 0.8);
      }

      // o brilho da marca sobe junto com o wordmark do vídeo
      const ig = smooth(clamp((p - 0.74) / 0.18, 0, 1));
      if (Math.abs(ig - lastWrite.ignite) > .004) {
        lastWrite.ignite = ig;
        stage.style.setProperty('--ignite', ig.toFixed(3));
        if (navMark) navMark.style.setProperty('--ignite', ig.toFixed(3));
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

    /* — profundidade pelo cursor — */
    stage.style.setProperty('--px', ((mx - .5) * 2).toFixed(3));
    stage.style.setProperty('--py', ((my - .5) * 2).toFixed(3));
    if (pointerIn) {
      stage.style.setProperty('--mx', (mx * 100).toFixed(2) + '%');
      stage.style.setProperty('--my', (my * 100).toFixed(2) + '%');
    }

    /* — botão magnético — */
    if (magnet) {
      const live = +magnet.closest('.beat').style.opacity > .5;
      if (live && pointerIn) {
        if (!magRect) magRect = magnet.getBoundingClientRect();
        const dx = mxT * stageW - (magRect.left + magRect.width / 2);
        const dy = myT * stageH - (magRect.top + magRect.height / 2);
        const dist = Math.hypot(dx, dy);
        const pull = dist < 190 ? 1 - dist / 190 : 0;
        magXT = dx * .28 * pull;
        magYT = dy * .34 * pull;
        magGlow.style.setProperty('--gx', (mxT * stageW - magRect.left) + 'px');
        magGlow.style.setProperty('--gy', (myT * stageH - magRect.top) + 'px');
      } else {
        magXT = magYT = 0;
        magRect = null;
      }
      magX = lerp(magX, magXT, .16);
      magY = lerp(magY, magYT, .16);
      magnet.style.transform = `translate3d(${magX.toFixed(2)}px, ${magY.toFixed(2)}px, 0)`;
    }

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
  pRaw = pSmooth = clamp((scrollY - trackTop) / range, 0, 1);
})();
