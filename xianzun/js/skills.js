/* ═══════════════════════════════
   修炼进度环形图表 + 新 Act 插入
════════════════════════════════ */
(function () {
  // 在第五幕之前插入一个修炼进度章节
  const actSelf = document.getElementById('act-self');
  if (!actSelf) return;

  const section = document.createElement('section');
  section.className = 'act fade-section';
  section.id = 'act-skills';
  section.innerHTML = `
    <div class="act-content-3d">
    <p class="act-eyebrow">卷外 · 道行</p>
    <h2 class="act-heading">苦修<em>百万年</em><br>道行今朝显</h2>

    <div class="skills-grid" id="skills-grid">
      <div class="skill-item">
        <canvas class="skill-canvas" data-label="心意气功" data-value="92" data-color="#3b82f6"></canvas>
        <div class="skill-label">心意气功</div>
        <div class="skill-level">九转 · 九二品</div>
      </div>
      <div class="skill-item">
        <canvas class="skill-canvas" data-label="春秋蝉" data-value="78" data-color="#8b5cf6"></canvas>
        <div class="skill-label">春秋蝉</div>
        <div class="skill-level">九转 · 七八品</div>
      </div>
      <div class="skill-item">
        <canvas class="skill-canvas" data-label="偷天手" data-value="65" data-color="#ec4899"></canvas>
        <div class="skill-label">偷天手</div>
        <div class="skill-level">九转 · 六五品</div>
      </div>
      <div class="skill-item">
        <canvas class="skill-canvas" data-label="宿命道" data-value="45" data-color="#22d3ee"></canvas>
        <div class="skill-label">宿命道</div>
        <div class="skill-level">九转 · 四五品</div>
      </div>
    </div>

    <p class="act-body" style="margin-top:40px;max-width:480px;">
    万载修行，不过弹指。宿命既定，唯我逆天。
    </p>
    </div>
  `;

  actSelf.parentNode.insertBefore(section, actSelf);

  // 样式
  const style = document.createElement('style');
  style.textContent = `
    #act-skills { background: radial-gradient(ellipse at 50% 50%, rgba(20,10,60,0.2) 0%, transparent 65%); }
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      max-width: 640px;
      width: 100%;
      margin-top: 40px;
    }
    .skill-item {
      display: flex; flex-direction: column; align-items: center;
      gap: 8px;
      padding: 16px 8px;
      border-radius: 12px;
      transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), background 0.3s;
      cursor: default;
    }
    .skill-item:hover {
      transform: scale(1.08);
      background: rgba(59,130,246,0.03);
    }
    .skill-canvas { width: 80px; height: 80px; }
    .skill-label {
      font-size: 0.8rem; font-family: "Zhi Mang Xing","Ma Shan Zheng",sans-serif;
      color: rgba(248,250,252,0.7); letter-spacing: 0.1em;
    }
    .skill-level {
      font-size: 0.55rem; font-family: "Ma Shan Zheng",sans-serif;
      color: rgba(100,116,139,0.5); letter-spacing: 0.1em;
    }
    @media (max-width: 600px) {
      .skills-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
    }
  `;
  document.head.appendChild(style);

  // 绘制环形图表
  function drawRing(canvas, value, color) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 160;
    const h = canvas.height = 160;
    const cx = w / 2, cy = h / 2, r = 62, lw = 10;
    const angle = (value / 100) * Math.PI * 2;

    // 动效
    let progress = 0;
    const speed = 0.02;

    function animateRing() {
      ctx.clearRect(0, 0, w, h);
      progress += speed;
      if (progress > 1) progress = 1;
      const currentAngle = angle * progress;

      // 背景圆
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(59,130,246,0.06)';
      ctx.lineWidth = lw;
      ctx.stroke();

      // 前景弧
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + currentAngle);
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 数值
      ctx.fillStyle = 'rgba(248,250,252,0.7)';
      ctx.font = '28px "ZCOOL QingKe HuangYou","Zhi Mang Xing",sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(value * progress) + '%', cx, cy);

      if (progress < 1) requestAnimationFrame(animateRing);
    }

    // 滚动进入时触发动画
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          progress = 0;
          animateRing();
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    obs.observe(canvas);
  }

  // 初始化所有图表
  document.querySelectorAll('.skill-canvas').forEach(c => {
    const val = parseFloat(c.dataset.value) || 50;
    const color = c.dataset.color || '#3b82f6';
    drawRing(c, val, color);
  });
})();
