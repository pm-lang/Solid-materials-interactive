// ============================================================
// ELEMENTIA — Spectacular Reward Animation Engine
// Canvas fireworks, shockwaves, golden bursts & triumphant fanfare
// ============================================================

export class RewardFX {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'reward-fx-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.inset = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.particles = [];
    this.isActive = false;

    window.addEventListener('resize', () => this._resize());
    this._resize();
  }

  _resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  triggerVictory(title = 'Scientific Proof Validated!', subtitle = '+50 Insight Points Earned') {
    this.particles = [];
    this.isActive = true;

    // Create 150 vibrant celebration particles
    const colors = ['#00f2fe', '#ffd700', '#00e676', '#ff007f', '#b388ff', '#ff9100', '#ffffff'];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    for (let i = 0; i < 180; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 12;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2.5 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: 0.012 + Math.random() * 0.015,
        gravity: 0.18
      });
    }

    // Display banner overlay
    this._showBanner(title, subtitle);

    if (!this.animating) {
      this.animating = true;
      this._loop();
    }
  }

  _showBanner(title, subtitle) {
    const banner = document.createElement('div');
    banner.className = 'victory-banner-popup';
    banner.innerHTML = `
      <div class="victory-icon">🏆✨</div>
      <div class="victory-title">${title}</div>
      <div class="victory-sub">${subtitle}</div>
    `;
    document.body.appendChild(banner);

    setTimeout(() => {
      banner.classList.add('fade-out');
      setTimeout(() => banner.remove(), 600);
    }, 3200);
  }

  _loop() {
    if (!this.isActive && this.particles.length === 0) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.animating = false;
      return;
    }

    requestAnimationFrame(() => this._loop());
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    if (this.particles.length === 0) {
      this.isActive = false;
    }
  }
}
