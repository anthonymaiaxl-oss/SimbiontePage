/* ═══════════════════════════════════════════════════════════════
   SIMBIONTE — fundo de água (WebGL)
   Cáustica de luz azul-neon se movendo devagar atrás da página.
   Adaptado do shader "Water Ripple Image" (21st.dev): tirei a
   textura de imagem — só sobra a luz —, cortei o laço de ruído de
   10 para 6 passos e baixei a ondulação. "Um pouco mais leve."

   Regras de custo (o PC do Luiz é fraco):
   - só roda quando a seção de baixo ou o rodapé estão à vista
     (o hero cobre tudo com fundo opaco, então ali não gasta nada)
   - devicePixelRatio travado em 1, resolução interna a 65%
   - nada disso em prefers-reduced-motion, sem WebGL, ou hardware fraco
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const canvas = document.getElementById('ripple');
  if (!canvas) return;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // celular fora (tela pequena, bateria); 2 núcleos ou menos, fora.
  // O resto entra e se AUTO-DESLIGA se os primeiros quadros vierem lentos.
  if (matchMedia('(max-width: 700px)').matches) return;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return;

  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, premultipliedAlpha: false })
    || canvas.getContext('experimental-webgl');
  if (!gl) return;

  const VERT = `
    precision mediump float;
    attribute vec2 a_position;
    varying vec2 vUv;
    void main() {
      vUv = .5 * (a_position + 1.);
      gl_Position = vec4(a_position, 0., 1.);
    }`;

  const FRAG = `
    precision mediump float;
    varying vec2 vUv;
    uniform float u_time;
    uniform float u_ratio;
    uniform float u_scale;
    uniform float u_amp;
    uniform float u_intensity;
    uniform vec3  u_tint;

    mat2 rot(float r){ return mat2(cos(r), sin(r), -sin(r), cos(r)); }

    // cáustica: soma de senos rotacionados, versão curta (6 passos)
    float surface(vec2 uv, float t, float scale){
      vec2 n = vec2(.1);
      vec2 N = vec2(.1);
      mat2 m = rot(.5);
      for (int j = 0; j < 6; j++){
        uv *= m; n *= m;
        vec2 q = uv * scale + float(j) + n + (.4 + .3 * float(j)) * (mod(float(j), 2.) - 1.) * t;
        n += sin(q);
        N += cos(q) / scale;
        scale *= 1.22;
      }
      return (N.x + N.y + .1);
    }

    void main(){
      vec2 uv = vUv;
      uv.x *= u_ratio;
      float t = .0016 * u_time;

      float wob = sin(1.7 * uv.y + .5 * t) * cos(1.3 * uv.x - .4 * t);
      float s = surface(2.0 * uv + u_amp * wob, t, u_scale);
      s *= pow(vUv.y, .32);
      s = pow(abs(s), 1.9);

      float glow = clamp(s * u_intensity, 0., 1.);
      vec3 col = u_tint * glow;

      // some nas bordas pra não ter aresta
      float e = smoothstep(0., .08, vUv.x) * smoothstep(1., .9, vUv.x)
              * smoothstep(0., .06, vUv.y) * smoothstep(1., .86, vUv.y);

      gl_FragColor = vec4(col * e, glow * e * .9);
    }`;

  function compile(src, type) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn('ripple shader:', gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  const vs = compile(VERT, gl.VERTEX_SHADER);
  const fs = compile(FRAG, gl.FRAGMENT_SHADER);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('ripple link:', gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {
    time:      gl.getUniformLocation(prog, 'u_time'),
    ratio:     gl.getUniformLocation(prog, 'u_ratio'),
    scale:     gl.getUniformLocation(prog, 'u_scale'),
    amp:       gl.getUniformLocation(prog, 'u_amp'),
    intensity: gl.getUniformLocation(prog, 'u_intensity'),
    tint:      gl.getUniformLocation(prog, 'u_tint'),
  };

  // ── ajuste do visual ──────────────────────────────────────────
  gl.uniform1f(U.scale, 3.6);        // original 7 — menos células, ondulação mais calma
  gl.uniform1f(U.amp, 0.06);         // distorção baixa
  gl.uniform1f(U.intensity, 0.36);   // brilho da cáustica
  gl.uniform3f(U.tint, 0.18, 0.75, 1.0); // azul-neon, puxado do --cy #3eb8ff

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const RES = 0.65; // resolução interna
  function resize() {
    const w = Math.max(1, Math.round(innerWidth * RES));
    const h = Math.max(1, Math.round(innerHeight * RES));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform1f(U.ratio, w / h);
    }
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  let running = false, visible = false, raf = 0, killed = false;
  const t0 = performance.now();

  // auto-desligamento: se a máquina não segura ~50fps nos primeiros
  // 40 quadros desenhados, desiste e devolve os fundos sólidos
  let samples = 0, slow = 0, lastFrame = 0;

  function frame() {
    if (!running) return;
    const now = performance.now();
    if (lastFrame && samples < 40) {
      samples++;
      if (now - lastFrame > 22) slow++;
      if (samples === 40 && slow > 22) { kill(); return; }
    }
    lastFrame = now;

    gl.uniform1f(U.time, now - t0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!running && visible && !document.hidden && !killed) { running = true; lastFrame = 0; raf = requestAnimationFrame(frame); } }
  function stop()  { running = false; cancelAnimationFrame(raf); }
  function kill()  { killed = true; stop(); document.documentElement.classList.remove('ripple-on'); }

  // só desenha enquanto a seção de baixo ou o rodapé aparecem
  const io = new IntersectionObserver((entries) => {
    visible = entries.some(e => e.isIntersecting);
    visible ? start() : stop();
  }, { rootMargin: '20% 0px' });
  document.querySelectorAll('.after, .foot').forEach(el => io.observe(el));

  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });

  // liga o CSS que deixa os fundos das seções translúcidos
  document.documentElement.classList.add('ripple-on');
})();
