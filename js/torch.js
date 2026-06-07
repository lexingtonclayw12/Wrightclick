/* ============================================================
   TORCH INTERACTIVE — Main Script
   ============================================================ */

(function () {
  'use strict';

  /* ---- Ember Particle System ---- */
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let raf;

  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  class Ember {
    constructor(x, y, fromTorch) {
      this.x  = x + (Math.random() - 0.5) * (fromTorch ? 16 : 60);
      this.y  = y + (Math.random() - 0.5) * (fromTorch ? 8 : 20);
      this.vx = (Math.random() - 0.5) * (fromTorch ? 2.5 : 1.2);
      this.vy = -(Math.random() * (fromTorch ? 4.5 : 2) + (fromTorch ? 1.5 : 0.4));
      this.life    = 1;
      this.decay   = fromTorch
        ? (Math.random() * 0.018 + 0.01)
        : (Math.random() * 0.006 + 0.003);
      this.size    = Math.random() * (fromTorch ? 2.8 : 1.5) + 0.5;
      this.maxSize = this.size;
      const r = Math.random();
      this.color = r > 0.65 ? '#ff6b1a' : r > 0.35 ? '#ffbf35' : '#ff3000';
    }

    update() {
      this.x   += this.vx;
      this.y   += this.vy;
      this.vy  += 0.04;            // slight upward drift fades to gravity
      this.vx  *= 0.988;
      this.life -= this.decay;
      this.size  = this.maxSize * this.life;
    }

    draw() {
      if (this.life <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.min(this.life, 0.85);
      ctx.fillStyle   = this.color;
      ctx.shadowBlur  = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(this.size, 0.1), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* Torch flame positions relative to canvas */
  let torchPoints = [];

  function updateTorchPoints() {
    torchPoints = [];
    const cr = canvas.getBoundingClientRect();
    document.querySelectorAll('.torch-flame-zone').forEach(el => {
      const r = el.getBoundingClientRect();
      torchPoints.push({
        x: r.left - cr.left + r.width  / 2,
        y: r.top  - cr.top  + r.height / 2
      });
    });
  }

  function spawnEmbers() {
    /* Ambient drifting embers from screen edges */
    if (Math.random() < 0.18) {
      const side   = Math.random() < 0.5 ? 0 : canvas.width;
      const yStart = canvas.height * 0.5 + Math.random() * canvas.height * 0.45;
      particles.push(new Ember(side, yStart, false));
    }

    /* Torch-specific particles */
    for (const pt of torchPoints) {
      const count = Math.random() < 0.4 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        particles.push(new Ember(pt.x, pt.y, true));
      }
    }
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    spawnEmbers();
    particles = particles.filter(p => p.life > 0);
    for (const p of particles) { p.update(); p.draw(); }
    raf = requestAnimationFrame(animateCanvas);
  }

  /* ---- Scroll Reveal ---- */
  function initReveal() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const delay = el.dataset.delay || '0';
        el.style.setProperty('--delay', delay + 'ms');
        el.classList.add('visible');
        obs.unobserve(el);
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  }

  /* ---- Stat Counters ---- */
  function initCounters() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const dur    = 1800;
        let start    = null;

        function step(ts) {
          if (!start) start = ts;
          const progress = Math.min((ts - start) / dur, 1);
          const ease     = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(ease * target);
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
  }

  /* ---- Cursor spotlight ---- */
  function initSpotlight() {
    const spotlight = document.getElementById('heroSpotlight');
    const hero      = document.querySelector('.hero');
    if (!spotlight || !hero) return;

    let targetX = hero.offsetWidth  / 2;
    let targetY = hero.offsetHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      targetX = e.clientX - r.left;
      targetY = e.clientY - r.top;
    });
    hero.addEventListener('mouseleave', () => {
      targetX = hero.offsetWidth  / 2;
      targetY = hero.offsetHeight / 2;
    });

    /* Smooth lerp so it follows with a slight lag */
    (function lerp() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      spotlight.style.left = currentX + 'px';
      spotlight.style.top  = currentY + 'px';
      requestAnimationFrame(lerp);
    })();
  }

  /* ---- Nav scroll state ---- */
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- YouTube background — slow-motion fuse at 1.5× speed ---- */
  function initYouTubeBackground() {
    const el = document.getElementById('heroYTPlayer');
    if (!el) return;

    window.onYouTubeIframeAPIReady = function () {
      new YT.Player('heroYTPlayer', {
        videoId: 'gLH5aCin_2Q',
        playerVars: {
          autoplay: 1, mute: 1, loop: 1,
          playlist: 'gLH5aCin_2Q',
          controls: 0, rel: 0,
          iv_load_policy: 3, modestbranding: 1, playsinline: 1,
        },
        events: {
          onReady: function (e) {
            e.target.setPlaybackRate(1.5);
            e.target.playVideo();
          },
        },
      });
    };

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }

  /* ---- Fuse loop reset ---- */
  function initFuse() {
    const burned = document.querySelector('.fuse-burned');
    if (!burned) return;
    burned.addEventListener('animationiteration', () => {
      /* pause to let the "explosion" moment sit, then loop naturally */
    });
  }

  /* ---- Init ---- */
  function init() {
    resizeCanvas();
    updateTorchPoints();
    animateCanvas();
    initReveal();
    initCounters();
    initNav();
    initFuse();
    initSpotlight();
    initYouTubeBackground();
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    updateTorchPoints();
  }, { passive: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
