/* ═══════════════════════════════
   章节导航侧滑面板
════════════════════════════════ */
(function () {
  const avatar = document.getElementById('character');
  if (!avatar) return;

  // 创建面板
  const panel = document.createElement('div');
  panel.id = 'nav-panel';
  panel.innerHTML = `
    <div class="nav-panel-header">
      <div class="nav-panel-title">章节索引</div>
      <div class="nav-panel-close">✕</div>
    </div>
    <div class="nav-panel-body" id="nav-panel-body"></div>
  `;
  document.body.appendChild(panel);

  // 创建遮罩
  const mask = document.createElement('div');
  mask.id = 'nav-mask';
  document.body.appendChild(mask);

  // 样式
  const style = document.createElement('style');
  style.textContent = `
    #nav-mask {
      position: fixed; inset: 0; z-index: 199;
      background: rgba(0,0,0,0.4);
      opacity: 0; pointer-events: none;
      transition: opacity 0.4s;
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
    }
    #nav-mask.open { opacity: 1; pointer-events: auto; }

    #nav-panel {
      position: fixed; top: 0; left: -320px;
      width: 300px; height: 100vh; z-index: 200;
      background: rgba(5,5,20,0.95);
      border-right: 1px solid rgba(59,130,246,0.1);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      transition: left 0.5s cubic-bezier(.22,1,.36,1);
      display: flex; flex-direction: column;
      padding: 24px;
    }
    #nav-panel.open { left: 0; }

    .nav-panel-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 32px; padding-bottom: 16px;
      border-bottom: 1px solid rgba(59,130,246,0.08);
    }
    .nav-panel-title {
      font-size: 1rem; font-family: "ZCOOL QingKe HuangYou","Zhi Mang Xing",sans-serif;
      letter-spacing: 0.2em; color: rgba(248,250,252,0.7);
    }
    .nav-panel-close {
      font-size: 1.2rem; color: rgba(100,116,139,0.5);
      cursor: pointer; transition: color 0.3s; padding: 4px;
    }
    .nav-panel-close:hover { color: rgba(248,250,252,0.7); }

    .nav-panel-body {
      flex: 1; overflow-y: auto;
      display: flex; flex-direction: column; gap: 4px;
    }
    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
      border-left: 2px solid transparent;
    }
    .nav-item:hover {
      background: rgba(59,130,246,0.04);
      border-left-color: rgba(59,130,246,0.3);
    }
    .nav-item.active {
      background: rgba(59,130,246,0.06);
      border-left-color: rgba(59,130,246,0.5);
    }
    .nav-item-num {
      font-size: 0.6rem; font-family: "Ma Shan Zheng",sans-serif;
      color: rgba(59,130,246,0.3); min-width: 24px;
      letter-spacing: 0.1em;
    }
    .nav-item-title {
      font-size: 0.85rem; font-family: "Ma Shan Zheng","Zhi Mang Xing",sans-serif;
      color: rgba(248,250,252,0.6); letter-spacing: 0.05em;
      transition: color 0.3s;
    }
    .nav-item:hover .nav-item-title { color: rgba(248,250,252,0.85); }
    .nav-item.active .nav-item-title { color: rgba(248,250,252,0.9); }
    .nav-item-sub {
      font-size: 0.6rem; color: rgba(100,116,139,0.4);
      margin-left: auto;
    }
  `;
  document.head.appendChild(style);

  // 章节数据
  const chapters = [
    { num: '00', id: 'act-hero', title: '英雄降世', sub: '古月方源' },
    { num: '01', id: 'act-youth', title: '少年时期', sub: '早岁已知世事艰' },
    { num: '02', id: 'act-rise', title: '逆天崛起', sub: '命若天定我便破天' },
    { num: '03', id: 'act-cosmos', title: '大爱仙尊', sub: '诸天万界唯我独尊' },
    { num: '04', id: 'act-self', title: '现世修行', sub: '入世修道以技证道' },
  ];

  const body = document.getElementById('nav-panel-body');
  chapters.forEach((ch, i) => {
    const item = document.createElement('div');
    item.className = 'nav-item' + (i === 0 ? ' active' : '');
    item.dataset.target = ch.id;
    item.innerHTML = `
      <span class="nav-item-num">${ch.num}</span>
      <span class="nav-item-title">${ch.title}</span>
      <span class="nav-item-sub">${ch.sub}</span>
    `;
    item.addEventListener('click', () => {
      document.getElementById(ch.id)?.scrollIntoView({ behavior: 'smooth' });
      closePanel();
    });
    body.appendChild(item);
  });

  function openPanel() {
    panel.classList.add('open');
    mask.classList.add('open');
    // 更新当前章节高亮
    const items = body.querySelectorAll('.nav-item');
    chapters.forEach((ch, i) => {
      const el = document.getElementById(ch.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        items[i].classList.toggle('active',
          rect.top < window.innerHeight / 2 && rect.bottom > 0);
      }
    });
  }

  function closePanel() {
    panel.classList.remove('open');
    mask.classList.remove('open');
  }

  avatar.addEventListener('click', (e) => {
    e.stopPropagation();
    if (panel.classList.contains('open')) {
      closePanel();
    } else {
      openPanel();
    }
  });

  mask.addEventListener('click', closePanel);
  document.querySelector('.nav-panel-close')?.addEventListener('click', closePanel);

  // 更新导航高亮
  window.addEventListener('scroll', () => {
    if (!panel.classList.contains('open')) return;
    const items = body.querySelectorAll('.nav-item');
    chapters.forEach((ch, i) => {
      const el = document.getElementById(ch.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        items[i].classList.toggle('active',
          rect.top < window.innerHeight / 2 && rect.bottom > 0);
      }
    });
  });
})();
