/* ═══════════════════════════════════════════════════════════
 * Canvas scene — "Mountain golden hour"
 * Exposes window.portalScene.setAlpha(0..1) for GSAP scrub.
 * ═══════════════════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('portalCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w = 0, h = 0, dpr = 1;
  let alpha = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth || window.innerWidth;
    h = canvas.clientHeight || window.innerHeight;
    canvas.width  = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Mountain ranges (peaks as normalised x,y) ─────────── */
  const mFar = [
    {x:0,    y:0.78}, {x:0.06, y:0.60}, {x:0.14, y:0.70}, {x:0.22, y:0.53},
    {x:0.30, y:0.63}, {x:0.38, y:0.50}, {x:0.46, y:0.58}, {x:0.54, y:0.48},
    {x:0.62, y:0.62}, {x:0.70, y:0.52}, {x:0.78, y:0.65}, {x:0.86, y:0.55},
    {x:0.94, y:0.68}, {x:1.00, y:0.75},
  ];
  const mMid = [
    {x:0,    y:0.85}, {x:0.05, y:0.62}, {x:0.12, y:0.72}, {x:0.20, y:0.52},
    {x:0.28, y:0.65}, {x:0.36, y:0.47}, {x:0.44, y:0.60}, {x:0.52, y:0.45},
    {x:0.60, y:0.58}, {x:0.68, y:0.50}, {x:0.76, y:0.64}, {x:0.84, y:0.53},
    {x:0.92, y:0.67}, {x:1.00, y:0.80},
  ];
  const mNear = [
    {x:0,    y:0.90}, {x:0.04, y:0.68}, {x:0.10, y:0.56}, {x:0.17, y:0.70},
    {x:0.24, y:0.52}, {x:0.32, y:0.66}, {x:0.40, y:0.44}, {x:0.47, y:0.60},
    {x:0.54, y:0.48}, {x:0.61, y:0.63}, {x:0.68, y:0.50}, {x:0.75, y:0.58},
    {x:0.82, y:0.46}, {x:0.88, y:0.62}, {x:0.94, y:0.54}, {x:1.00, y:0.82},
  ];

  /* ── Interpolate Y on a mountain range at normalised x ─── */
  function ridgeY(xNorm, range) {
    for (let i = 0; i < range.length - 1; i++) {
      if (xNorm >= range[i].x && xNorm <= range[i + 1].x) {
        const t = (xNorm - range[i].x) / (range[i + 1].x - range[i].x);
        return range[i].y + t * (range[i + 1].y - range[i].y);
      }
    }
    return range[range.length - 1].y;
  }

  /* ── Draw a filled mountain silhouette ─────────────────── */
  function drawRange(range) {
    ctx.beginPath();
    ctx.moveTo(0, h);
    range.forEach(p => ctx.lineTo(p.x * w, p.y * h));
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }

  /* ── Tiny pine tree ─────────────────────────────────────── */
  function drawPine(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size * 0.42, y);
    ctx.lineTo(x + size * 0.42, y);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, y - size * 1.55);
    ctx.lineTo(x - size * 0.32, y - size * 0.7);
    ctx.lineTo(x + size * 0.32, y - size * 0.7);
    ctx.closePath();
    ctx.fill();
  }

  /* ── Particles ──────────────────────────────────────────── */
  const pollen = Array.from({ length: 80 }, () => ({
    x: Math.random(), y: Math.random(),
    r: 0.6 + Math.random() * 1.6,
    vy: -(0.0001 + Math.random() * 0.0003),
    phase: Math.random() * Math.PI * 2,
    phaseSpeed: 0.005 + Math.random() * 0.01,
    base: 0.25 + Math.random() * 0.6,
  }));

  const fireflies = Array.from({ length: 28 }, () => ({
    x: 0.1 + Math.random() * 0.8,
    y: 0.45 + Math.random() * 0.45,
    vx: (Math.random() - 0.5) * 0.0002,
    vy: (Math.random() - 0.5) * 0.0002,
    life: Math.random() * Math.PI * 2,
    ls: 0.014 + Math.random() * 0.022,
    r: 1.2 + Math.random() * 1.6,
  }));

  /* ── Main draw ──────────────────────────────────────────── */
  function draw() {
    ctx.clearRect(0, 0, w, h);
    const a = alpha;

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0,    'rgba(10,6,2,1)');
    sky.addColorStop(0.28, `rgba(${50*a|0},${18*a|0},${3*a|0},1)`);
    sky.addColorStop(0.60, `rgba(${140*a|0},${62*a|0},${12*a|0},1)`);
    sky.addColorStop(0.85, `rgba(${60*a|0},${28*a|0},${8*a|0},1)`);
    sky.addColorStop(1,    'rgba(5,3,1,1)');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    if (a < 0.02) return;

    const cx = w * 0.50;
    const cy = h * 0.44;

    // Sun — outer halo
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.72);
    halo.addColorStop(0,   `rgba(255,200,80,${0.20 * a})`);
    halo.addColorStop(0.3, `rgba(255,120,25,${0.11 * a})`);
    halo.addColorStop(0.7, `rgba(180,60,8, ${0.04 * a})`);
    halo.addColorStop(1,   'transparent');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);

    // Sun — mid glow
    const mid = ctx.createRadialGradient(cx, cy, 0, cx, cy, h * 0.28);
    mid.addColorStop(0,   `rgba(255,245,170,${0.55 * a})`);
    mid.addColorStop(0.35,`rgba(255,170,55, ${0.25 * a})`);
    mid.addColorStop(1,   'transparent');
    ctx.fillStyle = mid;
    ctx.fillRect(0, 0, w, h);

    // Sun — core disc
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90);
    core.addColorStop(0,   `rgba(255,255,230,${0.98 * a})`);
    core.addColorStop(0.25,`rgba(255,225,130,${0.70 * a})`);
    core.addColorStop(0.65,`rgba(255,155,45, ${0.28 * a})`);
    core.addColorStop(1,   'transparent');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, 90, 0, Math.PI * 2);
    ctx.fill();

    // Light rays
    ctx.save();
    ctx.globalAlpha = 0.035 * a;
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const bw = 0.04;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, Math.max(w, h) * 1.2, angle - bw, angle + bw);
      ctx.closePath();
      ctx.fillStyle = '#ffe090';
      ctx.fill();
    }
    ctx.restore();

    /* ── Far mountains ── */
    ctx.save();
    ctx.globalAlpha = a;
    // atmospheric tint — fades towards horizon
    const farGrad = ctx.createLinearGradient(0, h * 0.45, 0, h);
    farGrad.addColorStop(0, `rgba(${80*a|0},${45*a|0},${20*a|0},1)`);
    farGrad.addColorStop(1, `rgba(${20*a|0},${10*a|0},${4*a|0},1)`);
    ctx.fillStyle = farGrad;
    drawRange(mFar);
    ctx.restore();

    // Atmospheric haze between layers
    const haze = ctx.createLinearGradient(0, h * 0.5, 0, h * 0.75);
    haze.addColorStop(0, `rgba(180,110,50,${0.07 * a})`);
    haze.addColorStop(1, 'transparent');
    ctx.fillStyle = haze;
    ctx.fillRect(0, h * 0.5, w, h * 0.25);

    /* ── Mid mountains ── */
    ctx.save();
    ctx.globalAlpha = a;
    const midGrad = ctx.createLinearGradient(0, h * 0.4, 0, h);
    midGrad.addColorStop(0, `rgba(${38*a|0},${20*a|0},${8*a|0},1)`);
    midGrad.addColorStop(1, `rgba(${10*a|0},${5*a|0},${2*a|0},1)`);
    ctx.fillStyle = midGrad;
    drawRange(mMid);
    ctx.restore();

    /* ── Near mountains ── */
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = '#0a0502';
    drawRange(mNear);
    ctx.restore();

    /* ── Tree line on near mountains ── */
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = '#050200';
    const step = 0.012;
    for (let xn = 0.01; xn <= 0.99; xn += step) {
      const yn = ridgeY(xn, mNear);
      const px = xn * w;
      const py = yn * h;
      // Tree size varies slightly for organic feel
      const sz = 6 + Math.sin(xn * 47.3) * 2.5 + Math.cos(xn * 31.1) * 1.5;
      drawPine(px, py, sz);
    }
    ctx.restore();

    /* ── Valley fog / ground mist ── */
    const fog = ctx.createRadialGradient(cx, h * 0.82, 0, cx, h * 0.82, w * 0.7);
    fog.addColorStop(0,   `rgba(210,140,65,${0.10 * a})`);
    fog.addColorStop(0.45,`rgba(160,85,28, ${0.04 * a})`);
    fog.addColorStop(1,   'transparent');
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, w, h);

    /* ── Pollen ── */
    pollen.forEach(p => {
      p.phase += p.phaseSpeed;
      p.y += p.vy;
      if (p.y < -0.05) p.y = 1.05;
      const flicker = (Math.sin(p.phase) + 1) / 2;
      ctx.save();
      ctx.globalAlpha = p.base * flicker * a * 0.65;
      ctx.fillStyle = '#ffe090';
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    /* ── Fireflies ── */
    fireflies.forEach(f => {
      f.life += f.ls;
      f.x += f.vx + Math.sin(f.life * 0.7) * 0.00016;
      f.y += f.vy + Math.cos(f.life * 0.5) * 0.00012;
      if (f.x < 0.05) f.vx =  Math.abs(f.vx);
      if (f.x > 0.95) f.vx = -Math.abs(f.vx);
      if (f.y < 0.42) f.vy =  Math.abs(f.vy);
      if (f.y > 0.92) f.vy = -Math.abs(f.vy);

      const bright = (Math.sin(f.life) + 1) / 2;
      if (bright < 0.1) return;
      const fx = f.x * w, fy = f.y * h;
      ctx.save();
      ctx.globalAlpha = bright * a * 0.85;
      const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, f.r * 8);
      g.addColorStop(0, 'rgba(220,255,120,1)');
      g.addColorStop(1, 'rgba(100,200,30,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(fx, fy, f.r * 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = bright * a;
      ctx.fillStyle = '#eeffaa';
      ctx.beginPath();
      ctx.arc(fx, fy, f.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function loop() {
    draw();
    requestAnimationFrame(loop);
  }
  loop();

  window.portalScene = {
    setAlpha: v => { alpha = Math.max(0, Math.min(1, v)); },
    getAlpha: () => alpha,
  };
})();
