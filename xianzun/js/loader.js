/* ═══════════════════════════════
   加载过渡动画 —— 仙尊降临
════════════════════════════════ */
(function () {
  // 创建加载遮罩
  const overlay = document.createElement('div');
  overlay.id = 'loader-overlay';
  overlay.innerHTML = `
    <div class="loader-ring">
      <svg viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(59,130,246,0.1)" stroke-width="1"/>
        <circle cx="100" cy="100" r="65" fill="none" stroke="rgba(139,92,246,0.08)" stroke-width="0.5"/>
        <polygon points="100,10 190,145 10,145" fill="none" stroke="rgba(59,130,246,0.15)" stroke-width="0.5"/>
        <polygon points="100,190 10,55 190,55" fill="none" stroke="rgba(139,92,246,0.1)" stroke-width="0.5"/>
      </svg>
    </div>
    <div class="loader-text">
      <span>仙</span><span>尊</span><span>降</span><span>临</span>
    </div>
    <div class="loader-sub">古月方源 · 大爱仙尊</div>
    <div class="loader-bar"><div class="loader-bar-fill"></div></div>
  `;
  document.body.appendChild(overlay);

  // 样式
  const style = document.createElement('style');
  style.textContent = `
    #loader-overlay {
      position: fixed; inset: 0; z-index: 99999;
      background: #05050e;
      display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      transition: opacity 1.2s cubic-bezier(.22,1,.36,1),
                  transform 1.2s cubic-bezier(.22,1,.36,1);
    }
    #loader-overlay.hide {
      opacity: 0;
      transform: scale(1.05);
      pointer-events: none;
    }
    #loader-overlay.removed {
      display: none;
    }
    .loader-ring {
      width: 160px; height: 160px;
      animation: loader-ring-spin 6s linear infinite;
      opacity: 0.3;
    }
    .loader-ring svg { width: 100%; height: 100%; }
    @keyframes loader-ring-spin { to { transform: rotate(360deg); } }
    .loader-text {
      margin-top: 32px;
      font-size: clamp(2.4rem, 6vw, 4rem);
      font-family: "ZCOOL QingKe HuangYou","Zhi Mang Xing",sans-serif;
      letter-spacing: 0.3em;
      color: #f8fafc;
      text-shadow: 0 0 30px rgba(59,130,246,0.3), 0 0 60px rgba(139,92,246,0.1);
    }
    .loader-text span {
      display: inline-block;
      opacity: 0;
      transform: translateY(20px);
      animation: loader-char-in 0.6s forwards;
    }
    .loader-text span:nth-child(1) { animation-delay: 0.3s; }
    .loader-text span:nth-child(2) { animation-delay: 0.5s; }
    .loader-text span:nth-child(3) { animation-delay: 0.7s; }
    .loader-text span:nth-child(4) { animation-delay: 0.9s; }
    @keyframes loader-char-in {
      to { opacity: 1; transform: none; }
    }
    .loader-sub {
      margin-top: 12px;
      font-size: 0.8rem;
      font-family: "Ma Shan Zheng",sans-serif;
      letter-spacing: 0.4em;
      color: rgba(100,116,139,0.6);
      opacity: 0;
      animation: loader-fade-in 1s 1.2s forwards;
    }
    @keyframes loader-fade-in { to { opacity: 1; } }
    .loader-bar {
      margin-top: 40px;
      width: 200px; height: 1px;
      background: rgba(59,130,246,0.1);
      border-radius: 1px;
      overflow: hidden;
    }
    .loader-bar-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(to right, #3b82f6, #8b5cf6);
      border-radius: 1px;
      animation: loader-bar-fill 1.8s 0.5s cubic-bezier(.22,1,.36,1) forwards;
    }
    @keyframes loader-bar-fill { to { width: 100%; } }
  `;
  document.head.appendChild(style);

  // 自动消失
  setTimeout(() => {
    overlay.classList.add('hide');
    setTimeout(() => {
      overlay.classList.add('removed');
      // 触发 body 淡入
      document.body.style.opacity = '1';
    }, 1200);
  }, 2500);
})();
