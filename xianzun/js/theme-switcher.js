/* ═══════════════════════════════
   主题切换器 —— 银河蓝 ⇄ 血红暗黑
════════════════════════════════ */
(function () {
  const btn = document.createElement('div');
  btn.id = 'theme-switcher';
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2m0 16v2m-10-10h2m16 0h2"/>
    </svg>
  `;
  document.body.appendChild(btn);

  // 样式
  const style = document.createElement('style');
  style.textContent = `
    #theme-switcher {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 100;
      width: 36px; height: 36px;
      border-radius: 50%;
      background: rgba(5,5,14,0.5);
      border: 1px solid rgba(59,130,246,0.15);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      color: rgba(59,130,246,0.5);
      transition: all 0.3s;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    #theme-switcher:hover {
      border-color: rgba(59,130,246,0.4);
      color: rgba(59,130,246,0.8);
      transform: rotate(45deg);
    }
  `;
  document.head.appendChild(style);

  let isDark = false;

  btn.addEventListener('click', () => {
    isDark = !isDark;
    if (isDark) {
      // 血红暗黑主题（CSS + 银河同步过渡）
      document.documentElement.style.setProperty('--blood', '#ef4444');
      document.documentElement.style.setProperty('--void', '#0a0505');
      document.documentElement.style.setProperty('--cosmic-blue', '#ef4444');
      document.documentElement.style.setProperty('--cosmic-cyan', '#f87171');
      document.documentElement.style.setProperty('--cosmic-purple', '#dc2626');
      document.documentElement.style.setProperty('--cosmic-pink', '#b91c1c');
      document.documentElement.style.setProperty('--scan-color', 'rgba(239,68,68,0.4)');
      btn.style.color = 'rgba(239,68,68,0.6)';
      btn.style.borderColor = 'rgba(239,68,68,0.2)';
      // 银河颜色过渡
      if (window.__galaxyTheme) window.__galaxyTheme.setBlood();
    } else {
      // 恢复银河蓝
      document.documentElement.style.setProperty('--blood', '#dc2626');
      document.documentElement.style.setProperty('--void', '#05050e');
      document.documentElement.style.setProperty('--cosmic-blue', '#3b82f6');
      document.documentElement.style.setProperty('--cosmic-cyan', '#22d3ee');
      document.documentElement.style.setProperty('--cosmic-purple', '#8b5cf6');
      document.documentElement.style.setProperty('--cosmic-pink', '#ec4899');
      document.documentElement.style.setProperty('--scan-color', 'rgba(59,130,246,0.4)');
      btn.style.color = 'rgba(59,130,246,0.5)';
      btn.style.borderColor = 'rgba(59,130,246,0.15)';
      // 银河颜色过渡
      if (window.__galaxyTheme) window.__galaxyTheme.setCosmic();
    }
  });
})();
