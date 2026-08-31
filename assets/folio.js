/* ═══════════════════════════════════════════════════════════════
   SIMBIONTE — carrossel 3D do portfólio
   Cards num cilindro. Arrasta (toque/mouse) ou setas giram o anel.
   Momentum + encaixe no card mais próximo. Clicar num card centrado
   abre o link (por enquanto href="#", então não navega).
   Sem dependência. Um só requestAnimationFrame, e só enquanto a
   seção está perto da tela.
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const vp = document.querySelector('.folio__viewport');
  if (!vp) return;
  const ring  = vp.querySelector('.folio__ring');
  const slots = [...ring.querySelectorAll('.folio__slot')];
  const N = slots.length;
  if (!N) return;

  const STEP = 360 / N;
  vp.style.setProperty('--step', STEP + 'deg');
  slots.forEach((s, i) => s.style.setProperty('--n', i));

  /* raio do cilindro: derivado da largura da tela (NÃO de medir o slot —
     isso às vezes vinha 0 no load e empilhava os cards). Card mais
     estreito no celular pra as laterais espiarem. */
  function setRadius() {
    const vw = vp.clientWidth || window.innerWidth || 1280;
    const cardW = vw <= 640
      ? Math.max(150, Math.min(230, vw * 0.5))
      : Math.max(210, Math.min(320, vw * 0.24));
    const r = (cardW / 2) / Math.tan((STEP / 2) * Math.PI / 180);
    vp.style.setProperty('--radius', Math.max(r * 1.12, cardW * 1.02).toFixed(0) + 'px');
    vp.style.setProperty('--cardw', cardW.toFixed(0) + 'px');
  }
  setRadius();
  addEventListener('resize', () => { setRadius(); apply(); }, { passive: true });

  let rot = 0, vel = 0;
  let dragging = false, lastX = 0, moved = 0, downTime = 0, pid = null;

  function radius() {
    return parseFloat(getComputedStyle(vp).getPropertyValue('--radius')) || 430;
  }

  function apply() {
    ring.style.transform = `translateZ(${(-radius()).toFixed(1)}px) rotateY(${(-rot).toFixed(2)}deg)`;
    for (let i = 0; i < N; i++) {
      let a = (i * STEP - rot) % 360;
      if (a > 180) a -= 360;
      if (a < -180) a += 360;
      const face = Math.max(0, Math.cos(a * Math.PI / 180));
      const s = slots[i];
      s.style.setProperty('--face', face.toFixed(3));
      s.style.zIndex = String(Math.round(face * 100));
      s.style.pointerEvents = face > 0.55 ? 'auto' : 'none';
    }
  }
  apply();

  let raf = 0, running = false;
  function loop() {
    if (!dragging) {
      rot += vel;
      vel *= 0.90;
      const nearest = Math.round(rot / STEP) * STEP;
      if (Math.abs(vel) < 0.45) {
        rot += (nearest - rot) * 0.10;
        if (Math.abs(nearest - rot) < 0.02 && Math.abs(vel) < 0.02) {
          rot = nearest; vel = 0; running = false;
        }
      }
    }
    apply();
    if (running || dragging) raf = requestAnimationFrame(loop);
  }
  function kick() { if (!running) { running = true; cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); } }

  vp.addEventListener('pointerdown', e => {
    dragging = true; pid = e.pointerId;
    lastX = e.clientX; moved = 0; downTime = performance.now();
    vel = 0;
    try { vp.setPointerCapture(e.pointerId); } catch (_) {}
    kick();
  });
  vp.addEventListener('pointermove', e => {
    if (!dragging || e.pointerId !== pid) return;
    const dx = e.clientX - lastX; lastX = e.clientX;
    moved += Math.abs(dx);
    const d = dx * 0.30;
    rot -= d; vel = -d;
  });
  function release(e) {
    if (!dragging) return;
    dragging = false;
    try { vp.releasePointerCapture(pid); } catch (_) {}

    if (moved < 8 && performance.now() - downTime < 450) {
      const card = e.target && e.target.closest && e.target.closest('.folio__card');
      if (card) {
        const slot = card.closest('.folio__slot');
        const face = parseFloat(slot.style.getPropertyValue('--face') || '0');
        if (face > 0.92) {
          const href = card.getAttribute('href');
          if (href && href !== '#') window.open(href, '_blank', 'noopener');
        } else {
          // card lateral → traz pra frente
          let a = (slots.indexOf(slot) * STEP - rot) % 360;
          if (a > 180) a -= 360;
          if (a < -180) a += 360;
          vel = -a * 0.06;
        }
      }
    }
    kick();
  }
  vp.addEventListener('pointerup', release);
  vp.addEventListener('pointercancel', () => { dragging = false; kick(); });

  const prev = vp.querySelector('.folio__arrow--prev');
  const next = vp.querySelector('.folio__arrow--next');
  if (prev) prev.addEventListener('click', () => { vel += STEP * 0.11; kick(); });
  if (next) next.addEventListener('click', () => { vel -= STEP * 0.11; kick(); });

  slots.forEach(s => {
    const c = s.querySelector('.folio__card');
    c.addEventListener('click', e => { if (c.getAttribute('href') === '#') e.preventDefault(); });
    const im = c.querySelector('img');
    if (im) im.draggable = false;
  });
  // o navegador tenta iniciar um drag nativo da imagem/link e rouba o gesto
  vp.addEventListener('dragstart', e => e.preventDefault());

  ring.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { vel -= STEP * 0.11; kick(); }
    else if (e.key === 'ArrowLeft') { vel += STEP * 0.11; kick(); }
  });

  new IntersectionObserver(([en]) => { if (en.isIntersecting) kick(); },
    { rootMargin: '20% 0px' }).observe(vp);
})();
