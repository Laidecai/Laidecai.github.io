/* ═══════════════════════════════
   背景音乐播放控件
════════════════════════════════ */
(function () {
  const audio = document.getElementById('ambient-audio');
  if (!audio) return;

  // 创建控件
  const btn = document.createElement('div');
  btn.id = 'audio-control';
  btn.innerHTML = `
    <div class="audio-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="5,3 19,12 5,21" class="play-icon"/>
        <rect x="7" y="5" width="3" height="14" rx="1" class="pause-icon" style="display:none"/>
        <rect x="14" y="5" width="3" height="14" rx="1" class="pause-icon" style="display:none"/>
      </svg>
    </div>
    <div class="audio-label">背景梵音</div>
  `;
  document.body.appendChild(btn);

  // 样式
  const style = document.createElement('style');
  style.textContent = `
    #audio-control {
      position: fixed;
      bottom: 30px;
      left: 30px;
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(5,5,14,0.6);
      border: 1px solid rgba(59,130,246,0.15);
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    #audio-control:hover {
      border-color: rgba(59,130,246,0.4);
      background: rgba(5,5,14,0.8);
    }
    .audio-icon {
      color: rgba(59,130,246,0.6);
      transition: color 0.3s;
      display: flex;
      align-items: center;
    }
    #audio-control:hover .audio-icon { color: rgba(59,130,246,0.9); }
    .audio-label {
      font-size: 0.65rem;
      font-family: "Ma Shan Zheng",sans-serif;
      letter-spacing: 0.15em;
      color: rgba(148,163,184,0.5);
      transition: color 0.3s;
    }
    #audio-control:hover .audio-label { color: rgba(148,163,184,0.8); }
    #audio-control.playing .play-icon { display: none; }
    #audio-control.playing .pause-icon { display: block !important; }
  `;
  document.head.appendChild(style);

  let isPlaying = false;

  btn.addEventListener('click', () => {
    if (!audio.src) {
      // 设置默认音频源（用户可替换）
      audio.src = './audio/ambient.mp3';
    }
    if (isPlaying) {
      audio.pause();
      btn.classList.remove('playing');
      isPlaying = false;
    } else {
      audio.volume = 0.06;
      audio.loop = true;
      audio.play().catch(() => {});
      btn.classList.add('playing');
      isPlaying = true;
    }
  });

  // 页面点击自动尝试播放（若已有音频源）
  let autoPlayed = false;
  document.addEventListener('click', () => {
    if (!autoPlayed && audio.src) {
      audio.volume = 0.04;
      audio.loop = true;
      audio.play().catch(() => {});
      btn.classList.add('playing');
      isPlaying = true;
      autoPlayed = true;
    }
  }, { once: true });
})();
