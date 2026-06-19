/* ═══════════════════════════════════════════════════════════════════
   THREE.JS — 铺满全屏 3D 环绕宇宙 (v8 FINAL)
   20万+ 粒子 · 球面环绕 · 巨型对数螺旋 · ShaderMaterial
   参考诗云 + laidecai.github.io/xianzun 全屏沉浸体验
═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const canvas = document.getElementById('canvas3d');
  // 全屏画布必须覆盖整个视口
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.filter = 'contrast(1.8) brightness(1.15) saturate(1.1)';
  canvas.style.mixBlendMode = 'screen';
  // 禁止文本选中和右键菜单（保证拖拽流畅）
  canvas.style.userSelect = 'none';
  canvas.style.webkitUserSelect = 'none';

  /* ─── Renderer ─── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const dpr = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 4.0;

  const scene = new THREE.Scene();
  scene.background = null;

  // 广角镜头 + 超大远平面 → 宇宙全屏包围感
  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 20000);
  // 摄像机置于星场内部，形成环绕感
  camera.position.set(0, 20, 80);
  camera.lookAt(0, 0, -100);

  /* ─── 性能自适应 ─── */
  const isMobile = window.innerWidth < 768;
  const perfScale = isMobile ? 0.35 : Math.min(window.innerWidth / 1920, 1);

  // ════════════════════════════════════════════
  // 诗云级密度 + 巨型对数螺旋
  // 桌面: 200,000 粒子 / 移动: 70,000
  // ════════════════════════════════════════════
  const N_TOTAL = Math.floor(200000 * Math.max(perfScale, 0.35));

  // ─── 分配: 主螺旋 60% + 球面星场 30% + 远端深空 10% ───
  const N_SPIRAL = Math.floor(N_TOTAL * 0.6);
  const N_SPHERE = Math.floor(N_TOTAL * 0.3);
  const N_DEEP   = N_TOTAL - N_SPIRAL - N_SPHERE;

  const positions = new Float32Array(N_TOTAL * 3);
  const colors = new Float32Array(N_TOTAL * 3);
  const sizes = new Float32Array(N_TOTAL);
  const flowPhases = new Float32Array(N_TOTAL);
  const tempColor = new THREE.Color();

  let idx = 0;

  /* ═══════════════════════════════════════════
     第一部分: 巨型对数螺旋 (5 旋臂, 半径达 400+)
     公式: r = a × exp(b × θ)
     全屏环绕的核心
     ═══════════════════════════════════════════ */
  const NUM_ARMS = 5;
  const SPIRAL_A = 6;          // 起始半径
  const SPIRAL_B = 0.22;       // 螺旋紧密度（越大越扩散）
  const SPIRAL_TURNS = 5.0;    // 圈数

  function logSpiral(theta, armIdx) {
    const r = SPIRAL_A * Math.exp(SPIRAL_B * theta);
    const angle = theta + (armIdx / NUM_ARMS) * Math.PI * 2;
    return { r, angle };
  }

  const spiralMaxR = SPIRAL_A * Math.exp(SPIRAL_B * SPIRAL_TURNS * Math.PI);
  // spiralMaxR ≈ 6 * exp(0.22 * 15.7) ≈ 6 * exp(3.45) ≈ 6 * 31.5 ≈ 189

  const N_PER_ARM = Math.floor(N_SPIRAL / NUM_ARMS);

  for (let i = 0; i < N_SPIRAL; i++) {
    const armIdx = Math.min(Math.floor(i / N_PER_ARM), NUM_ARMS - 1);
    const localIdx = i - armIdx * N_PER_ARM;
    const localT = localIdx / N_PER_ARM;

    // θ: 从 0 到 SPIRAL_TURNS * PI，外围略稀疏
    const theta = Math.pow(localT, 0.6) * SPIRAL_TURNS * Math.PI;
    const { r, angle } = logSpiral(theta, armIdx);

    // 空间抖动
    const jitterScale = 0.5 + theta * 0.08;
    const finalAngle = angle + (Math.random() - 0.5) * jitterScale;
    const radius = r + (Math.random() - 0.5) * jitterScale * 0.5;

    // 垂直波动：正弦波 + 随机
    const heightWave = Math.sin(theta * 0.6 + armIdx * 1.5) * (3 + theta * 0.5);
    const yJitter = (Math.random() - 0.5) * (4 + theta * 1.2);

    const x = Math.cos(finalAngle) * radius;
    const z = Math.sin(finalAngle) * radius;
    const y = heightWave + yJitter;

    positions[idx*3]   = x;
    positions[idx*3+1] = y;
    positions[idx*3+2] = z;

    // ─── 颜色梯度 ───
    const t = Math.min(theta / (SPIRAL_TURNS * Math.PI), 1);
    if (t < 0.03) {
      // 核心: 暖白
      tempColor.setHSL(0.58, 0.15, 0.7);
    } else if (t < 0.15 && Math.random() < 0.015) {
      // 内层极少量彩色粒子：红/蓝/绿/紫 (宇宙湍流) — 仅 1.5%
      const rareHues = [0.0, 0.3, 0.6, 0.75];
      const rareHue = rareHues[Math.floor(Math.random() * rareHues.length)];
      tempColor.setHSL(rareHue, 0.6 + Math.random() * 0.3, 0.5 + Math.random() * 0.3);
    } else if (t < 0.1) {
      // 内圈: 青白过渡
      tempColor.setHSL(0.55 + Math.random() * 0.04, 0.25, 0.55 + Math.random() * 0.15);
    } else {
      // 外圈: 自然银河色调 (蓝白/淡紫/淡青 — 低饱和)
      const armHue = 0.55 + (armIdx / NUM_ARMS) * 0.12;
      const hue = armHue + (Math.random() - 0.5) * 0.06;
      const sat = 0.12 + Math.random() * 0.2;
      const lig = 0.4 + Math.random() * 0.25 * (1 - t * 0.4);
      tempColor.setHSL(hue, sat, lig);
    }
    colors[idx*3]   = tempColor.r;
    colors[idx*3+1] = tempColor.g;
    colors[idx*3+2] = tempColor.b;

    // ─── 大小: 核心大而柔和 → 外围渐小 ───
    const baseSize = 0.6 + Math.random() * 0.8;
    const tFactor = 1 - t * 0.7;
    sizes[idx] = baseSize * Math.max(tFactor, 0.15);
    if (t < 0.02) sizes[idx] *= 2.0;

    flowPhases[idx] = Math.random() * Math.PI * 2;
    idx++;
  }

  /* ═══════════════════════════════════════════
     第二部分: 球面环绕星场 (全方向包围)
     半径 200~1500, 形成深邃宇宙感
     ═══════════════════════════════════════════ */
  for (let i = 0; i < N_SPHERE; i++) {
    const radius = 200 + Math.pow(Math.random(), 0.7) * 1500;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    // 略微扁平的分布
    const flatFactor = 0.6;
    positions[idx*3]   = Math.sin(phi) * Math.cos(theta) * radius;
    positions[idx*3+1] = Math.sin(phi) * Math.sin(theta) * radius * flatFactor;
    positions[idx*3+2] = Math.cos(phi) * radius;

    // 颜色: 自然冷色系 (淡蓝/淡紫/白 — 低饱和)
    const hue = 0.54 + Math.random() * 0.18;
    const sat = 0.08 + Math.random() * 0.15;
    const lig = 0.25 + Math.random() * 0.35;
    tempColor.setHSL(hue, sat, lig);
    colors[idx*3]   = tempColor.r;
    colors[idx*3+1] = tempColor.g;
    colors[idx*3+2] = tempColor.b;

    // 大小: 小而均匀
    sizes[idx] = 0.2 + Math.random() * 0.6;

    flowPhases[idx] = Math.random() * Math.PI * 2;
    idx++;
  }

  /* ═══════════════════════════════════════════
     第三部分: 远端深空 (半径 1500~6000)
     微弱星点, 极深邃背景
     ═══════════════════════════════════════════ */
  for (let i = 0; i < N_DEEP; i++) {
    const radius = 1500 + Math.pow(Math.random(), 0.5) * 4500;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[idx*3]   = Math.sin(phi) * Math.cos(theta) * radius;
    positions[idx*3+1] = Math.sin(phi) * Math.sin(theta) * radius * 0.3;
    positions[idx*3+2] = Math.cos(phi) * radius;

    const lig = 0.1 + Math.random() * 0.2;
    tempColor.setHSL(0.58, 0.1, lig);
    colors[idx*3]   = tempColor.r;
    colors[idx*3+1] = tempColor.g;
    colors[idx*3+2] = tempColor.b;

    sizes[idx] = 0.1 + Math.random() * 0.3;

    flowPhases[idx] = Math.random() * Math.PI * 2;
    idx++;
  }

  /* ═══════════════════════════════════════════
     GPU ShaderMaterial — 全粒子渲染
     支持 per-vertex size + color + 圆形遮罩 + 光晕
     ═══════════════════════════════════════════ */
  const mainGeo = new THREE.BufferGeometry();
  mainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  mainGeo.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
  mainGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mainMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: dpr }
    },
    vertexShader: `
      attribute float size;
      attribute vec3 customColor;
      varying vec3 vColor;
      uniform float uPixelRatio;
      void main() {
        vColor = customColor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
        gl_PointSize = clamp(gl_PointSize, 0.5, 100.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.0, 0.5, d);
        float glow = exp(-d * 8.0);
        vec3 color = vColor + vec3(0.2, 0.1, 0.05) * glow;
        // 外圈粒子轻微泛蓝光晕
        float outerGlow = exp(-d * 4.0) * 0.15;
        vec3 finalColor = color + vec3(0.1, 0.15, 0.2) * outerGlow;
        gl_FragColor = vec4(finalColor, alpha * 0.88);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const mainMesh = new THREE.Points(mainGeo, mainMat);
  const galaxyGroup = new THREE.Group();
  galaxyGroup.add(mainMesh);
  galaxyGroup.rotation.x = 0.3;
  galaxyGroup.rotation.z = -0.05;
  scene.add(galaxyGroup);

  /* ═══════════════════════════════════════════
     宇宙粒子乱流 / 伽马射线暴 (Turbulent Flow System)
     参考诗云粒子自然流动 + 宇宙湍流物理
     ── 600 粒子从核心向外持续喷射，随机扰动，循环再生
     ═══════════════════════════════════════════ */
  const N_FLOW = 600;
  const flowPos = new Float32Array(N_FLOW * 3);
  const flowVel = new Float32Array(N_FLOW * 3);
  const flowSizes = new Float32Array(N_FLOW);
  const flowColors = new Float32Array(N_FLOW * 3);
  const flowLife = new Float32Array(N_FLOW);
  const flowMaxLife = new Float32Array(N_FLOW);
  const flowPhase = new Float32Array(N_FLOW);
  const flowTurbPhase = new Float32Array(N_FLOW);

  // 流速控制：静止缓慢如星尘漂移，滚动温和加速如潮汐涌动
  let flowSpeedBoost = 0.3;
  let flowTargetBoost = 0.3;

  // 滚轮事件：滚动时温和加速
  window.addEventListener('wheel', () => {
    flowTargetBoost = 2.2;
  }, { passive: true });

  // 初始化粒子（随机分布在核心附近，各方向）
  for (let i = 0; i < N_FLOW; i++) {
    recycleFlowParticle(i, true);
  }

  function recycleFlowParticle(idx, initial) {
    const i3 = idx * 3;
    // 方向（球面均匀）
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1) * 0.6;

    // 速度（1~4 单位/帧，随机）
    const speed = 0.5 + Math.random() * 2.5;
    flowVel[i3]   = Math.sin(phi) * Math.cos(theta) * speed;
    flowVel[i3+1] = Math.cos(phi) * speed * 0.3;
    flowVel[i3+2] = Math.sin(phi) * Math.sin(theta) * speed;

    if (initial) {
      // 初始时均匀分布在 0~最大距离
      const dist = Math.random() * 250;
      flowPos[i3]   = flowVel[i3]   * dist;
      flowPos[i3+1] = flowVel[i3+1] * dist;
      flowPos[i3+2] = flowVel[i3+2] * dist;
      flowLife[idx] = Math.random() * 200;
    } else {
      // 重生：从核心附近出发
      const startDist = 5 + Math.random() * 15;
      flowPos[i3]   = flowVel[i3]   * startDist + (Math.random() - 0.5) * 8;
      flowPos[i3+1] = flowVel[i3+1] * startDist + (Math.random() - 0.5) * 4;
      flowPos[i3+2] = flowVel[i3+2] * startDist + (Math.random() - 0.5) * 8;
      flowLife[idx] = 0;
    }

    flowMaxLife[idx] = 200 + Math.random() * 250;
    flowPhase[idx] = Math.random() * Math.PI * 2;
    flowTurbPhase[idx] = Math.random() * 100;

    // 大小
    flowSizes[idx] = 0.8 + Math.random() * 2.5;

    // 颜色：大部分青蓝白，少部分紫/淡红
    const hue = Math.random() < 0.1 ? 0.75 : Math.random() < 0.08 ? 0.0 : 0.52 + Math.random() * 0.12;
    const c = new THREE.Color().setHSL(hue, 0.4 + Math.random() * 0.4, 0.5 + Math.random() * 0.3);
    flowColors[i3]   = c.r;
    flowColors[i3+1] = c.g;
    flowColors[i3+2] = c.b;
  }

  const flowGeo = new THREE.BufferGeometry();
  flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos, 3));
  flowGeo.setAttribute('customColor', new THREE.BufferAttribute(flowColors, 3));
  flowGeo.setAttribute('size', new THREE.BufferAttribute(flowSizes, 1));

  const flowMat = new THREE.ShaderMaterial({
    uniforms: { uPixelRatio: { value: dpr }, uBoost: { value: 1.0 } },
    vertexShader: `
      attribute float size;
      attribute vec3 customColor;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uPixelRatio;
      uniform float uBoost;
      void main() {
        vColor = customColor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * uPixelRatio * (200.0 / -mvPosition.z);
        gl_PointSize = clamp(gl_PointSize, 1.0, 40.0 * uBoost);
        gl_Position = projectionMatrix * mvPosition;
        // 基于距离的淡出
        float dist = length(position.xyz) / 350.0;
        vAlpha = clamp(1.0 - dist * 0.8, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.0, 0.5, d);
        float glow = exp(-d * 5.0);
        vec3 color = vColor + vec3(0.15) * glow;
        gl_FragColor = vec4(color, alpha * vAlpha * 0.7 + glow * 0.3);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const flowMesh = new THREE.Points(flowGeo, flowMat);
  scene.add(flowMesh);

  /* ═══════════════════════════════════════════
     中央能量奇点 (Core Singularity)
     超亮白核 + 3000 密集粒子 + 脉动
     ═══════════════════════════════════════════ */
  const N_SING = Math.floor(3000 * Math.max(perfScale, 0.5));
  const singGeo = new THREE.BufferGeometry();
  const singPos = new Float32Array(N_SING * 3);
  const singSizes = new Float32Array(N_SING);
  for (let i = 0; i < N_SING; i++) {
    const r = Math.pow(Math.random(), 3) * 30;
    const a = Math.random() * Math.PI * 2;
    const h = (Math.random() - 0.5) * 6;
    singPos[i*3] = Math.cos(a) * r;
    singPos[i*3+1] = h;
    singPos[i*3+2] = Math.sin(a) * r;
    singSizes[i] = 1.5 + Math.random() * 4;
  }
  singGeo.setAttribute('position', new THREE.BufferAttribute(singPos, 3));
  singGeo.setAttribute('size', new THREE.BufferAttribute(singSizes, 1));

  const singMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: dpr } },
    vertexShader: `
      attribute float size;
      uniform float uPixelRatio;
      varying float vAlpha;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * uPixelRatio * (200.0 / -mvPosition.z);
        gl_PointSize = clamp(gl_PointSize, 1.0, 100.0);
        gl_Position = projectionMatrix * mvPosition;
        float depth = abs(position.z) / 30.0;
        vAlpha = 0.7 + 0.3 * (1.0 - depth);
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.0, 0.5, d);
        float core = exp(-d * 8.0);
        vec3 color = vec3(0.85, 0.82, 0.78) + vec3(0.3, 0.15, 0.05) * core;
        gl_FragColor = vec4(color, alpha * 0.8 * vAlpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const singMesh = new THREE.Points(singGeo, singMat);
  galaxyGroup.add(singMesh);

  /* ═══════════════════════════════════════════
     星云雾层 (Nebula Dust) — 大尺寸半透明
     ═══════════════════════════════════════════ */
  const N_NEB = Math.floor(2000 * Math.max(perfScale, 0.5));
  const nebGeo = new THREE.BufferGeometry();
  const nebPos = new Float32Array(N_NEB * 3);
  const nebColors = new Float32Array(N_NEB * 3);
  const nebSizes = new Float32Array(N_NEB);
  const nebPhases = new Float32Array(N_NEB);

  for (let i = 0; i < N_NEB; i++) {
    const t = Math.random() * 6;
    const armNeb = Math.floor(Math.random() * 4);
    const r = 3 + t * 150;
    const a = t + (armNeb / 4) * Math.PI * 2 + (Math.random() - 0.5) * 1.5;
    nebPos[i*3]   = Math.cos(a) * r + (Math.random() - 0.5) * 120;
    nebPos[i*3+1] = Math.sin(t * 0.4) * 80 + (Math.random() - 0.5) * 60;
    nebPos[i*3+2] = Math.sin(a) * r + (Math.random() - 0.5) * 120;

    const hue = 0.5 + Math.random() * 0.35;
    tempColor.setHSL(hue, 0.4, 0.2 + Math.random() * 0.15);
    nebColors[i*3]   = tempColor.r;
    nebColors[i*3+1] = tempColor.g;
    nebColors[i*3+2] = tempColor.b;
    nebSizes[i] = 60 + Math.random() * 140;
    nebPhases[i] = Math.random() * Math.PI * 2;
  }
  nebGeo.setAttribute('position', new THREE.BufferAttribute(nebPos, 3));
  nebGeo.setAttribute('customColor', new THREE.BufferAttribute(nebColors, 3));
  nebGeo.setAttribute('size', new THREE.BufferAttribute(nebSizes, 1));

  const nebMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: dpr } },
    vertexShader: `
      attribute float size;
      attribute vec3 customColor;
      varying vec3 vColor;
      uniform float uPixelRatio;
      void main() {
        vColor = customColor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * uPixelRatio * (150.0 / -mvPosition.z);
        gl_PointSize = clamp(gl_PointSize, 10.0, 400.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.0, 0.5, d);
        alpha = pow(alpha, 1.8);
        gl_FragColor = vec4(vColor, alpha * 0.05);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const nebMesh = new THREE.Points(nebGeo, nebMat);
  scene.add(nebMesh);

  /* ═══════════════════════════════════════════
     环形命运轨道 (16 条, 超大环绕)
     ═══════════════════════════════════════════ */
  const orbitGroup = new THREE.Group();
  const N_RINGS = 16;

  for (let r = 0; r < N_RINGS; r++) {
    const radius = 80 + r * 35 + Math.random() * 15;
    const segs = 100;
    const pts = [];
    const tiltX = (Math.random() - 0.5) * 0.7;
    const tiltZ = (Math.random() - 0.5) * 0.5;
    const yOff = (Math.random() - 0.5) * 70;
    const ellipt = 0.65 + Math.random() * 0.35;
    const zOff = (Math.random() - 0.5) * 100;
    const dir = Math.random() > 0.5 ? 1 : -1;

    const ringHue = 0.48 + (r / N_RINGS) * 0.35;
    tempColor.setHSL(ringHue, 0.6, 0.3 + Math.random() * 0.2);

    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2 * dir;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius * ellipt;
      const y = Math.sin(a * 2 + r) * 10;
      pts.push(new THREE.Vector3(
        x + z * tiltX,
        y + yOff + z * tiltZ,
        z + zOff
      ));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const m = new THREE.LineBasicMaterial({
      color: tempColor, transparent: true,
      opacity: 0.04 + Math.random() * 0.06,
      blending: THREE.AdditiveBlending
    });
    const line = new THREE.Line(g, m);
    line.userData = {
      speed: (0.04 + Math.random() * 0.12) * dir,
      phase: Math.random() * Math.PI * 2,
      baseOp: m.opacity
    };
    orbitGroup.add(line);
  }
  scene.add(orbitGroup);

  /* ═══════════════════════════════════════════
     流星系统
     ═══════════════════════════════════════════ */
  const meteors = [];
  function spawnMeteor() {
    const len = 20;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(len * 3);
    const sx = (Math.random() - 0.5) * 3000;
    const sy = 600 + Math.random() * 400;
    const sz = (Math.random() - 0.5) * 2500;
    const vx = -(4 + Math.random() * 5);
    const vy = -(2.5 + Math.random() * 2.5);
    for (let i = 0; i < len; i++) {
      pos[i*3] = sx + i * vx;
      pos[i*3+1] = sy + i * vy;
      pos[i*3+2] = sz;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
      color: 0x88ccff, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending
    }));
    scene.add(line);
    meteors.push({ line, vx, vy, life: 0, maxLife: 40 + Math.random() * 25 });
  }

  /* ═══════════════════════════════════════════
     鼠标左键拖拽旋转 (平滑惯性)
     ═══════════════════════════════════════════ */
  let isDragging = false;
  let dragStartX = 0, dragStartY = 0;
  let prevDragX = 0, prevDragY = 0;
  let dragRotY = 0, dragRotX = 0.3;
  let targetDragRotY = 0, targetDragRotX = 0.3;

  // 阻止拖拽时文本被选中
  function preventSelect(e) { e.preventDefault(); }

  // 注入全局样式阻止选中
  const dragStyle = document.createElement('style');
  dragStyle.id = 'drag-no-select';
  dragStyle.textContent = '.dragging * { user-select: none !important; -webkit-user-select: none !important; }';

  // 使用 window 级事件，确保无论点击在哪层都能拖拽
  window.addEventListener('mousedown', e => {
    if (e.button === 0) {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      prevDragX = e.clientX;
      prevDragY = e.clientY;
      document.addEventListener('selectstart', preventSelect);
      document.body.classList.add('dragging');
    }
  });

  window.addEventListener('mousemove', e => {
    if (isDragging) {
      const dx = e.clientX - prevDragX;
      const dy = e.clientY - prevDragY;
      targetDragRotY += dx * 0.004;
      targetDragRotX += dy * 0.003;
      targetDragRotX = Math.max(-0.2, Math.min(0.8, targetDragRotX));
      prevDragX = e.clientX;
      prevDragY = e.clientY;
    }
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      document.removeEventListener('selectstart', preventSelect);
      document.body.classList.remove('dragging');
    }
  });

  // 阻止右键菜单
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  document.head.appendChild(dragStyle);

  /* ═══════════════════════════════════════════
     滚动纵深
     ═══════════════════════════════════════════ */
  let targetSZ = 0, currentSZ = 0;
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    targetSZ = h > 0 ? (window.scrollY / h) * 100 : 0;
  });

  /* ═══════════════════════════════════════════
     动画循环
     ═══════════════════════════════════════════ */
  let t = 0, meteorTimer = 0;
  const nebBasePos = new Float32Array(nebPos);

  function animate() {
    requestAnimationFrame(animate);
    t += 0.003;

    // 更新 uniforms
    mainMat.uniforms.uTime.value = t;
    singMat.uniforms.uTime.value = t;
    nebMat.uniforms.uTime.value = t;

    // ─── 银河自转（不拖拽时缓慢自转） ───
    if (!isDragging) {
      targetDragRotY += 0.0008;
    }
    // 球面星场独立缓慢漂移（视差效果）
    mainMesh.rotation.y += 0.0001;

    // ─── 奇点柔和脉动 ───
    const singSA = singGeo.attributes.size.array;
    const pulseSlow = Math.sin(t * 0.2) * 0.5 + 0.5;
    for (let i = 0; i < N_SING; i++) {
      const base = 1.2 + (i % 3) * 0.5;
      singSA[i] = base + Math.sin(t * 0.3 + i * 0.02) * 0.8 * pulseSlow;
    }
    singGeo.attributes.size.needsUpdate = true;

    // ─── 星云呼吸 ───
    const nebPA = nebGeo.attributes.position.array;
    for (let i = 0; i < N_NEB; i++) {
      const i3 = i * 3;
      const ph = nebPhases[i];
      const br = Math.sin(t * 0.08 + ph) * 15;
      nebPA[i3]   = nebBasePos[i3]   + br * Math.cos(ph);
      nebPA[i3+1] = nebBasePos[i3+1] + br * 0.3 * Math.sin(ph * 0.7);
      nebPA[i3+2] = nebBasePos[i3+2] + br * Math.sin(ph * 0.5);
    }
    nebGeo.attributes.position.needsUpdate = true;

    // ─── 轨道旋转 ───
    orbitGroup.children.forEach(line => {
      const d = line.userData;
      line.rotation.y += d.speed * 0.005;
      line.material.opacity = d.baseOp * (0.6 + Math.sin(t * 0.1 + d.phase) * 0.4);
    });

    // ─── 流速平滑过渡（更柔和的缓动） ───
    flowSpeedBoost += (flowTargetBoost - flowSpeedBoost) * 0.015;
    // 目标缓慢衰减回 0.3（无滚动时约 6 秒恢复平静）
    if (flowTargetBoost > 0.3) {
      flowTargetBoost -= 0.0008;
      if (flowTargetBoost < 0.3) flowTargetBoost = 0.3;
    }
    const boost = flowSpeedBoost;
    flowMat.uniforms.uBoost.value = boost;

    // ─── 宇宙粒子乱流（600 粒子持续喷射/湍流/循环） ───
    const fp = flowGeo.attributes.position.array;
    const baseLife = 120;
    for (let i = 0; i < N_FLOW; i++) {
      const i3 = i * 3;
      flowLife[i]++;

      // 生命周期 = base / boost（加速时生命周期缩短=更多新粒子）
      const effectiveMaxLife = flowMaxLife[i] / boost;

      // 生命周期结束 → 回收重生
      if (flowLife[i] >= effectiveMaxLife) {
        recycleFlowParticle(i, false);
        continue;
      }

      // 生命周期比例
      const lifeRatio = flowLife[i] / effectiveMaxLife;

      // 湍流扰动：速度受正弦波影响，产生乱流感
      const turbScale = 0.3 * boost;
      const turb = Math.sin(t * 0.5 + flowTurbPhase[i]) * turbScale;
      const turb2 = Math.cos(t * 0.3 + flowPhase[i] * 2) * turbScale * 0.7;

      // 更新位置（速度 × boost + 湍流偏移）
      fp[i3]   += flowVel[i3] * boost + Math.sin(t * 0.7 + flowPhase[i]) * turb;
      fp[i3+1] += flowVel[i3+1] * boost + Math.cos(t * 0.5 + flowPhase[i] * 1.3) * turb2;
      fp[i3+2] += flowVel[i3+2] * boost + Math.sin(t * 0.4 + flowPhase[i] * 0.7) * turb * 0.8;

      // 粒子大小：boost 越高，粒子越大越亮
      const sizeCurve = Math.sin(lifeRatio * Math.PI);
      const boostSize = 1 + (boost - 1) * 0.5;
      flowSizes[i] = ((0.3 + Math.random() * 0.2) + sizeCurve * (1.0 + Math.random())) * boostSize;
    }
    flowGeo.attributes.position.needsUpdate = true;
    flowGeo.attributes.size.needsUpdate = true;

    // ─── 鼠标拖拽旋转（平滑 lerp） ───
    dragRotY += (targetDragRotY - dragRotY) * 0.06;
    dragRotX += (targetDragRotX - dragRotX) * 0.06;
    galaxyGroup.rotation.y = dragRotY;
    galaxyGroup.rotation.x = dragRotX + Math.sin(t * 0.03) * 0.015;
    galaxyGroup.rotation.z = -0.05 + Math.sin(t * 0.02) * 0.005;

    // ─── 流星 ───
    meteorTimer++;
    if (meteorTimer > 200 + Math.random() * 300) {
      spawnMeteor();
      meteorTimer = 0;
    }
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i]; m.life++;
      const mp = m.line.geometry.attributes.position.array;
      for (let j = 0; j < mp.length; j += 3) {
        mp[j] += m.vx;
        mp[j+1] += m.vy;
      }
      m.line.geometry.attributes.position.needsUpdate = true;
      const p = m.life / m.maxLife;
      m.line.material.opacity = p < 0.15 ? p / 0.15 * 0.5 : (1 - (p - 0.15) / 0.85) * 0.5;
      if (m.life >= m.maxLife) { scene.remove(m.line); meteors.splice(i, 1); }
    }

    // ─── 滚动纵深 ───
    currentSZ += (targetSZ - currentSZ) * 0.04;
    galaxyGroup.position.z = -currentSZ;
    orbitGroup.position.z = -currentSZ * 0.5;
    nebMesh.position.z = -currentSZ * 0.25;

    // ─── 渲染 ───
    renderer.render(scene, camera);
  }
  animate();

  /* ═══ Resize ═══ */
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

})();
