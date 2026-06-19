/* ═══════════════════════════════
   鼠标拖尾 — 星河星尘
════════════════════════════════ */
(function () {
  const canvas = document.getElementById('trail-canvas');
  const ctx = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  const trails = [];
  const palette = ['rgba(59,130,246,', 'rgba(34,211,238,', 'rgba(139,92,246,', 'rgba(255,255,255,'];
  let mouse = { x: -999, y: -999 };

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    for (let i = 0; i < 5; i++) {
      trails.push({
        x: mouse.x + (Math.random() - 0.5) * 16,
        y: mouse.y + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 1.8,
        vy: (Math.random() - 0.5) * 1.8 - 0.2,
        life: 1,
        size: Math.random() * 3.5 + 0.5,
        color: palette[Math.floor(Math.random() * palette.length)]
      });
    }
  });

  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);
    for (let i = trails.length - 1; i >= 0; i--) {
      const p = trails[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.025;
      if (p.life <= 0) { trails.splice(i, 1); continue; }
      const s = p.size * p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, s + 0.5, 0, Math.PI * 2);
      ctx.fillStyle = p.color + (p.life * 0.6) + ')';
      ctx.fill();
      ctx.shadowColor = p.color + '0.3)';
      ctx.shadowBlur = s * 2;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  loop();

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });
})();


/* ═══════════════════════════════
   点击扩散 — 星河冲击波 + 字体故障
════════════════════════════════ */
(function () {
  const canvas = document.getElementById('click-canvas');
  const ctx = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  const rings = [];
  const charParticles = [];
  const clickChars = '春秋蝉仙尊道命运宿天地方源';

  document.addEventListener('click', e => {
    const colors = ['rgba(59,130,246,', 'rgba(34,211,238,', 'rgba(139,92,246,'];
    rings.push({ x: e.clientX, y: e.clientY, r: 0, life: 1, color: colors[0], delay: 0 });
    rings.push({ x: e.clientX, y: e.clientY, r: 0, life: 1, color: colors[1], delay: 5 });
    rings.push({ x: e.clientX, y: e.clientY, r: 0, life: 1, color: colors[2], delay: 10 });

    // 春秋蝉字符消散
    for (let i = 0; i < 6; i++) {
      charParticles.push({
        x: e.clientX + (Math.random() - 0.5) * 40,
        y: e.clientY + (Math.random() - 0.5) * 40,
        char: clickChars[Math.floor(Math.random() * clickChars.length)],
        size: 12 + Math.random() * 16,
        vx: (Math.random() - 0.5) * 3,
        vy: -(1 + Math.random() * 3),
        life: 1,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8
      });
    }

    const title = document.getElementById('hero-title');
    if (title) {
      title.classList.add('glitch');
      title.style.textShadow = `0 0 40px rgba(59,130,246,0.6), 0 0 80px rgba(139,92,246,0.3), 1px 1px 0 #000, 3px 3px 0 var(--cosmic-blue)`;
      setTimeout(() => {
        title.classList.remove('glitch');
        title.style.textShadow = '';
      }, 300);
    }

    const frame = document.getElementById('title-scan-frame');
    if (frame) {
      frame.classList.add('active');
      setTimeout(() => frame.classList.remove('active'), 400);
    }
  });

  function drawRing(x, y, r, alpha, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(r * 0.02);
    ctx.globalAlpha = alpha * 0.4;
    ctx.strokeStyle = color + '1)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const px = Math.cos(a) * r * 0.5;
      const py = Math.sin(a) * r * 0.5;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = color + '0.5)';
    ctx.stroke();

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + r * 0.01;
      const d = r * (0.6 + Math.random() * 0.3);
      ctx.beginPath();
      ctx.arc(Math.cos(a) * d, Math.sin(a) * d, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = color + (0.3 + Math.random() * 0.3) + ')';
      ctx.fill();
    }
    ctx.restore();
  }

  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);
    for (let i = rings.length - 1; i >= 0; i--) {
      const a = rings[i];
      if (a.delay > 0) { a.delay--; continue; }
      a.r += 3.5;
      a.life -= 0.018;
      if (a.life <= 0) { rings.splice(i, 1); continue; }
      drawRing(a.x, a.y, a.r, a.life, a.color);
    }
    // 春秋蝉字符消散
    for (let i = charParticles.length - 1; i >= 0; i--) {
      const p = charParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.life -= 0.018;
      p.rot += p.rotSpeed;
      if (p.life <= 0) { charParticles.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = p.life * 0.5;
      ctx.fillStyle = Math.random() > 0.5 ? '#3b82f6' : '#8b5cf6';
      ctx.font = `${p.size}px "Zhi Mang Xing","Ma Shan Zheng",sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(59,130,246,0.3)';
      ctx.shadowBlur = 10;
      ctx.fillText(p.char, 0, 0);
      ctx.restore();
    }
  }
  loop();

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });
})();


/* ═══════════════════════════════
   封面人物 —— 故障/能量/时间扭曲效果
════════════════════════════════ */
(function () {
  const container = document.getElementById('character');
  const canvas = document.getElementById('char-glitch');
  if (!container || !canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    const rect = container.getBoundingClientRect();
    canvas.width = W = rect.width;
    canvas.height = H = rect.height;
  }
  resize();
  window.addEventListener('resize', resize);

  let t = 0;
  let glitchTimer = 0;
  let isGlitching = false;
  let glitchDuration = 0;

  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: Math.random(),
      y: 0.3 + Math.random() * 0.7,
      size: 1 + Math.random() * 3,
      speedX: (Math.random() - 0.5) * 0.004,
      speedY: -(0.002 + Math.random() * 0.006),
      phase: Math.random() * Math.PI * 2,
      alpha: 0.2 + Math.random() * 0.5,
      color: Math.random() > 0.5 ? '59,130,246' : '139,92,246'
    });
  }

  function drawGlitch() {
    if (isGlitching && glitchDuration > 0) {
      glitchDuration--;
      const blocks = 2 + Math.floor(Math.random() * 3);
      for (let b = 0; b < blocks; b++) {
        const y = Math.random() * H;
        const h = 1 + Math.random() * 4;
        const offset = (Math.random() - 0.5) * 12;
        ctx.fillStyle = `rgba(59,130,246,${0.04 + Math.random() * 0.06})`;
        ctx.fillRect(offset, y, W + Math.abs(offset), h);
        ctx.fillStyle = `rgba(34,211,238,${0.02 + Math.random() * 0.04})`;
        ctx.fillRect(-offset * 0.5, y + h + 1, W, 1);
        ctx.fillStyle = `rgba(236,72,153,${0.02 + Math.random() * 0.04})`;
        ctx.fillRect(offset * 0.3, y - 1, W, 1);
      }
      for (let p = 0; p < 10; p++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`;
        ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
      }
    }
    if (glitchDuration <= 0) isGlitching = false;
  }

  function drawEnergyWaves() {
    const waveCount = 3;
    for (let w = 0; w < waveCount; w++) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(59,130,246,${0.02 + Math.sin(t * 0.5 + w) * 0.015})`;
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 2) {
        const y = H * 0.85 + Math.sin(x * 0.01 + t * 1.5 + w * 2) * 15
          + Math.sin(x * 0.02 + t * 0.8 + w) * 8;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  function drawParticles() {
    for (const p of particles) {
      p.x += p.speedX + Math.sin(t + p.phase) * 0.002;
      p.y += p.speedY;
      if (p.y < 0) { p.y = 1; p.x = Math.random(); }

      const px = p.x * W;
      const py = p.y * H;
      const alpha = p.alpha * (0.5 + Math.sin(t * 0.8 + p.phase) * 0.3);
      const size = p.size * (0.8 + Math.sin(t + p.phase) * 0.3);

      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${alpha * 0.15})`;
      ctx.fill();

      ctx.shadowColor = `rgba(${p.color},${alpha * 0.08})`;
      ctx.shadowBlur = size * 4;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function drawScanlines() {
    for (let y = 0; y < H; y += 4) {
      ctx.fillStyle = `rgba(0,0,0,${0.015 + Math.sin(y * 0.1 + t) * 0.005})`;
      ctx.fillRect(0, y, W, 1);
    }
  }

  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);
    t += 0.03;

    glitchTimer++;
    if (!isGlitching && glitchTimer > 120 + Math.random() * 200) {
      isGlitching = true;
      glitchDuration = 6 + Math.floor(Math.random() * 12);
      glitchTimer = 0;
    }

    drawScanlines();
    drawEnergyWaves();
    drawParticles();
    drawGlitch();
  }
  loop();
})();


/* ═══════════════════════════════
   扫描字符框层（scan-canvas）
════════════════════════════════ */
(function () {
  const canvas = document.getElementById('scan-canvas');
  const ctx = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  const chars = '天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏';
  const particles = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      char: chars[Math.floor(Math.random() * chars.length)],
      size: 8 + Math.random() * 14,
      alpha: 0,
      speed: 0.3 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2
    });
  }

  let t = 0;

  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);
    t += 0.02;

    for (const p of particles) {
      p.alpha = 0.08 + Math.sin(t * 0.5 + p.phase) * 0.07;
      p.y += p.speed * 0.3;
      if (p.y > H) { p.y = -20; p.x = Math.random() * W; }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = Math.random() > 0.6 ? '#8b5cf6' : '#3b82f6';
      ctx.font = `${p.size}px "Zhi Mang Xing", "Ma Shan Zheng", sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(59,130,246,0.3)';
      ctx.shadowBlur = 10;
      ctx.fillText(p.char, p.x, p.y);
      ctx.restore();
    }
  }
  loop();

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });
})();


/* ═══════════════════════════════
   扫描框 —— 动态跟踪"古月方源"标题
════════════════════════════════ */
(function () {
  const frame = document.getElementById('title-scan-frame');
  const title = document.getElementById('hero-title');
  if (!frame || !title) return;

  function positionFrame() {
    const rect = title.getBoundingClientRect();
    const pad = 20;
    frame.style.left = (rect.left - pad) + 'px';
    frame.style.top = (rect.top - pad) + 'px';
    frame.style.width = (rect.width + pad * 2) + 'px';
    frame.style.height = (rect.height + pad * 2) + 'px';
  }

  positionFrame();
  window.addEventListener('resize', positionFrame);
  window.addEventListener('scroll', positionFrame);

  document.addEventListener('mousemove', e => {
    const rect = title.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2);
    if (dist < 300) {
      frame.classList.add('active');
    } else {
      frame.classList.remove('active');
    }
  });
})();


/* ═══════════════════════════════
   副标题逐字浮现
════════════════════════════════ */
(function () {
  const spans = document.querySelectorAll('#hero-sub-text span');
  spans.forEach((s, i) => {
    setTimeout(() => {
      s.classList.add('revealed');
    }, 1800 + i * 120);
  });
})();


/* ═══════════════════════════════
   淡入淡出滚动进场（IntersectionObserver）
════════════════════════════════ */
(function () {
  const acts = document.querySelectorAll('.act:not(#act-hero)');
  acts.forEach(a => a.classList.add('fade-section'));

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        e.target.classList.add('in-view');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  acts.forEach(a => obs.observe(a));
})();


/* ═══════════════════════════════
   3D 倾斜效果（鼠标跟踪标题）
════════════════════════════════ */
(function () {
  const title = document.getElementById('hero-title');
  if (!title) return;
  const hero = document.getElementById('act-hero');

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotY = x * 12;
    const rotX = -y * 8;
    title.style.transform =
      `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(20px)`;
  });

  hero.addEventListener('mouseleave', () => {
    title.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)';
  });
})();


/* ═══════════════════════════════
   方块翻转导航（翻页指示器）
════════════════════════════════ */
(function () {
  const sections = document.querySelectorAll('.act');
  const nav = document.createElement('div');
  nav.className = 'flip-indicator';
  nav.id = 'flip-nav';

  const sectionIds = [];
  sections.forEach((s, i) => {
    sectionIds.push(s.id);
    const dot = document.createElement('div');
    dot.className = 'flip-dot' + (i === 0 ? ' active' : '');
    dot.dataset.index = i;
    dot.addEventListener('click', () => {
      s.scrollIntoView({ behavior: 'smooth' });
    });
    nav.appendChild(dot);
  });
  document.body.appendChild(nav);

  setTimeout(() => { nav.style.opacity = '1'; }, 3000);

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const dots = nav.querySelectorAll('.flip-dot');
        dots.forEach(d => d.classList.remove('active'));
        const idx = sectionIds.indexOf(e.target.id);
        if (idx >= 0 && dots[idx]) dots[idx].classList.add('active');
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => obs.observe(s));
})();


/* ═══════════════════════════════
   滚动条自定义
════════════════════════════════ */
(function () {
  const style = document.createElement('style');
  style.textContent = `
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--void); }
    ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.25); border-radius: 2px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.5); }
  `;
  document.head.appendChild(style);
})();


/* ═══════════════════════════════
   页面加载淡入
════════════════════════════════ */
(function () {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 1.5s ease';
  setTimeout(() => { document.body.style.opacity = '1'; }, 200);
})();


/* ═══════════════════════════════
   鼠标悬停逐字变色 + 抖动
════════════════════════════════ */
(function () {
  const chars = document.querySelectorAll('.char-glow');
  chars.forEach((c, i) => {
    c.addEventListener('mouseenter', () => {
      c.style.color = '#8b5cf6';
      c.style.transform = 'scale(1.2) translateY(-5px)';
      c.style.transition = 'all 0.2s cubic-bezier(.22,1,.36,1)';
      c.style.textShadow = '0 0 30px rgba(139,92,246,0.6), 0 0 60px rgba(59,130,246,0.2)';
    });
    c.addEventListener('mouseleave', () => {
      c.style.color = '';
      c.style.transform = '';
      c.style.textShadow = '';
    });
  });
})();


/* ═══════════════════════════════
   透明水玻璃 —— 鼠标跟随水波纹
════════════════════════════════ */
(function () {
  const targets = document.querySelectorAll(
    '.act-eyebrow, .act-heading, .act-body, .act-quote, .id-item'
  );
  if (!targets.length) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'ripple-canvas';
  canvas.style.cssText =
    'position:fixed;inset:0;z-index:999;pointer-events:none;opacity:0.4';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const ripples = [];

  targets.forEach(el => {
    el.addEventListener('mouseenter', e => {
      const rect = el.getBoundingClientRect();
      const cx = e.clientX;
      const cy = rect.top + rect.height / 2;
      for (let i = 0; i < 2; i++) {
        ripples.push({
          x: cx + (Math.random() - 0.5) * rect.width * 0.3,
          y: cy + (Math.random() - 0.5) * 10,
          r: 2,
          life: 1,
          maxR: 20 + Math.random() * 15,
          speed: 0.3 + Math.random() * 0.3
        });
      }
    });
    el.addEventListener('mousemove', e => {
      if (Math.random() < 0.15) {
        ripples.push({
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 8,
          r: 1,
          life: 1,
          maxR: 12 + Math.random() * 10,
          speed: 0.2 + Math.random() * 0.25
        });
      }
    });
  });

  let t = 0;

  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);
    t += 0.02;

    if (Math.random() < 0.02) {
      ripples.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 1,
        life: 1,
        maxR: 30 + Math.random() * 40,
        speed: 0.15 + Math.random() * 0.15
      });
    }

    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.r += r.speed;
      r.life -= 0.018;
      if (r.life <= 0) { ripples.splice(i, 1); continue; }

      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(59,130,246,${r.life * 0.12})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59,130,246,${r.life * 0.04})`;
      ctx.fill();
    }
  }
  loop();
})();


/* ═══════════════════════════════
   3D 场景倾斜 — 鼠标跟踪每个 act
════════════════════════════════ */
(function () {
  const acts = document.querySelectorAll('.act');
  acts.forEach(act => {
    const content = act.querySelector('.act-content-3d');
    if (!content) return;
    act.addEventListener('mousemove', e => {
      const rect = act.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      content.style.transform =
        `rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateZ(10px)`;
    });
    act.addEventListener('mouseleave', () => {
      content.style.transform = 'rotateX(0) rotateY(0) translateZ(0)';
    });
  });
})();


/* ═══════════════════════════════
   滚动进度条
════════════════════════════════ */
(function () {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  bar.style.cssText =
    'position:fixed;top:0;left:0;height:2px;z-index:200;' +
    'background:linear-gradient(to right,#3b82f6,#8b5cf6);' +
    'transition:width 0.1s;width:0';
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / h * 100) + '%';
  });
})();


/* ═══════════════════════════════
   音效（首次点击激活）
════════════════════════════════ */
(function () {
  const audio = document.getElementById('ambient-audio');
  let played = false;
  document.addEventListener('click', () => {
    if (!played && audio.src) {
      audio.volume = 0.08;
      audio.play().catch(() => {});
      played = true;
    }
  }, { once: false });
})();
