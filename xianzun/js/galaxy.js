/* ═══════════════════════════════
   Three.js — 宇宙银河粒子系统 (增强版)
════════════════════════════════ */
(function () {
  const canvas = document.getElementById('canvas3d');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 5000);
  camera.position.z = 900;

  function makeGlow(c, size) {
    const s = size || 32;
    const e = document.createElement('canvas');
    e.width = e.height = s;
    const x = e.getContext('2d');
    const g = x.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
    g.addColorStop(0, c);
    g.addColorStop(0.4, c.replace('1)', '0.6)'));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, s, s);
    return new THREE.CanvasTexture(e);
  }
  const texStar   = makeGlow('rgba(255,255,255,1)', 16);
  const texBlue   = makeGlow('rgba(59,130,246,1)', 32);
  const texCyan   = makeGlow('rgba(34,211,238,1)', 32);
  const texPurple = makeGlow('rgba(139,92,246,1)', 32);
  const texPink   = makeGlow('rgba(236,72,153,1)', 24);

  /* ═══ 螺旋星系主体 ═══ */
  const N_SPIRAL = 30000;
  function makeSpiral(armOffset, colorTex, baseSize, spreadFactor) {
    const n = Math.floor(N_SPIRAL / 4);
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3);
    const sz = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const t = Math.pow(Math.random(), 0.6) * Math.PI * 3;
      const radius = 50 + t * 100;
      const armAngle = t + armOffset;
      const spread = (Math.random() - 0.5) * spreadFactor * (1 + t * 0.15);
      const angle = armAngle + spread;
      const height = Math.sin(t * 0.5) * 60 + (Math.random() - 0.5) * 30;
      pos[i*3]   = Math.cos(angle) * radius;
      pos[i*3+1] = height;
      pos[i*3+2] = Math.sin(angle) * radius;
      sz[i] = baseSize + Math.random() * 3;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      size: baseSize + 1, map: colorTex, blending: THREE.AdditiveBlending,
      depthWrite: false, transparent: true, opacity: 0.6,
      sizeAttenuation: true
    });
    return new THREE.Points(geo, mat);
  }

  const spiralGroup = new THREE.Group();
  spiralGroup.add(makeSpiral(0, texBlue, 2.2, 0.25));
  spiralGroup.add(makeSpiral(Math.PI * 0.5, texCyan, 2.0, 0.2));
  spiralGroup.add(makeSpiral(Math.PI, texPurple, 2.4, 0.3));
  spiralGroup.add(makeSpiral(Math.PI * 1.5, texPink, 1.8, 0.22));
  spiralGroup.rotation.x = 0.3;
  spiralGroup.rotation.z = -0.15;
  scene.add(spiralGroup);

  /* ═══ 星系核 ═══ */
  const N_CORE = 3000;
  const geoCore = new THREE.BufferGeometry();
  const posCr = new Float32Array(N_CORE * 3);
  for (let i = 0; i < N_CORE; i++) {
    const r = Math.pow(Math.random(), 2) * 120;
    const a = Math.random() * Math.PI * 2;
    posCr[i*3]   = Math.cos(a) * r;
    posCr[i*3+1] = (Math.random() - 0.5) * 25;
    posCr[i*3+2] = Math.sin(a) * r;
  }
  geoCore.setAttribute('position', new THREE.BufferAttribute(posCr, 3));
  const matCore = new THREE.PointsMaterial({
    size: 4.5, map: texStar, blending: THREE.AdditiveBlending,
    depthWrite: false, transparent: true, opacity: 0.9, color: 0x88ccff
  });
  const core = new THREE.Points(geoCore, matCore);
  spiralGroup.add(core);

  /* ═══ 双星云层 ═══ */
  const N_NEB = 600;
  const geoNeb = new THREE.BufferGeometry();
  const posNb = new Float32Array(N_NEB * 3);
  for (let i = 0; i < N_NEB; i++) {
    const r = 100 + Math.random() * 500;
    const a = Math.random() * Math.PI * 2;
    posNb[i*3]   = Math.cos(a) * r + (Math.random() - 0.5) * 100;
    posNb[i*3+1] = (Math.random() - 0.5) * 100;
    posNb[i*3+2] = Math.sin(a) * r + (Math.random() - 0.5) * 100;
  }
  geoNeb.setAttribute('position', new THREE.BufferAttribute(posNb, 3));
  const matNeb1 = new THREE.PointsMaterial({ size: 60, map: texPurple, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.05, sizeAttenuation: true });
  const matNeb2 = new THREE.PointsMaterial({ size: 80, map: texBlue, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.03, sizeAttenuation: true });
  const nebula = new THREE.Points(geoNeb, matNeb1);
  const nebula2 = new THREE.Points(geoNeb, matNeb2);
  scene.add(nebula); scene.add(nebula2);

  /* ═══ 背景星群 ═══ */
  const N_BG = 10000;
  const geoBg = new THREE.BufferGeometry();
  const posBg = new Float32Array(N_BG * 3);
  const szBg = new Float32Array(N_BG);
  for (let i = 0; i < N_BG; i++) {
    posBg[i*3]   = (Math.random() - 0.5) * 5000;
    posBg[i*3+1] = (Math.random() - 0.5) * 3000;
    posBg[i*3+2] = (Math.random() - 0.5) * 3000 - 500;
    szBg[i] = 0.3 + Math.random() * 1.5;
  }
  geoBg.setAttribute('position', new THREE.BufferAttribute(posBg, 3));
  const matBg = new THREE.PointsMaterial({ size: 1, map: texStar, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.12, sizeAttenuation: true });
  scene.add(new THREE.Points(geoBg, matBg));

  /* ═══ 3D 时间环 ═══ */
  const ringGroup = new THREE.Group();
  for (let r = 0; r < 3; r++) {
    const radius = 350 + r * 80;
    const pts = [];
    for (let i = 0; i <= 80; i++) {
      const a = (i / 80) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius * 0.15, -280 + r * 35));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const m = new THREE.LineBasicMaterial({ color: r % 2 === 0 ? 0x3b82f6 : 0x8b5cf6, transparent: true, opacity: 0.06 + r * 0.015 });
    ringGroup.add(new THREE.Line(g, m));
  }
  scene.add(ringGroup);

  /* ═══ 流星系统 ═══ */
  const meteors = [];
  function spawnMeteor() {
    const len = 18, geo = new THREE.BufferGeometry(), pos = new Float32Array(len * 3);
    const sx = (Math.random() - 0.5) * 1600, sy = 400 + Math.random() * 200, sz = (Math.random() - 0.5) * 600;
    for (let i = 0; i < len; i++) { pos[i*3]=sx-i*22; pos[i*3+1]=sy-i*14; pos[i*3+2]=sz; }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
    scene.add(line);
    meteors.push({ line, vx: -4.5, vy: -2.8, life: 0, maxLife: 40 + Math.random() * 30 });
  }

  /* ═══ 鼠标跟踪 ═══ */
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let t = 0, meteorTimer = 0;

  function animate() {
    requestAnimationFrame(animate);
    t += 0.005;

    spiralGroup.rotation.y += 0.0014;
    spiralGroup.rotation.x = 0.3 + Math.sin(t * 0.07) * 0.025;
    spiralGroup.rotation.z = -0.15 + Math.sin(t * 0.04) * 0.012;

    matCore.size = 4.5 + Math.sin(t * 0.5) * 1.8;
    matCore.opacity = 0.75 + Math.sin(t * 0.4) * 0.15;

    ringGroup.rotation.y += 0.0008;
    ringGroup.rotation.x = Math.sin(t * 0.06) * 0.03;

    nebula.rotation.y += 0.0002;
    nebula.rotation.x += 0.00005;
    nebula2.rotation.y += 0.00025;
    nebula2.rotation.x -= 0.00005;

    matBg.opacity = 0.1 + Math.sin(t * 0.15) * 0.04;

    camera.position.x += (mx * 150 - camera.position.x) * 0.02;
    camera.position.y += (-my * 100 - camera.position.y) * 0.02;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    /* 流星 */
    meteorTimer++;
    if (meteorTimer > 180 + Math.random() * 250) { spawnMeteor(); meteorTimer = 0; }
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i]; m.life++;
      const pos = m.line.geometry.attributes.position.array;
      for (let j = 0; j < pos.length; j += 3) { pos[j] += m.vx; pos[j+1] += m.vy; }
      m.line.geometry.attributes.position.needsUpdate = true;
      const p = m.life / m.maxLife;
      m.line.material.opacity = p < 0.2 ? p / 0.2 * 0.7 : (1 - (p - 0.2) / 0.8) * 0.7;
      if (m.life >= m.maxLife) { scene.remove(m.line); meteors.splice(i, 1); }
    }

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
