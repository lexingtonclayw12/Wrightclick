/* ============================================
   WRIGHT CLICK STUDIO — main.js
   ============================================ */

(function () {
  'use strict';

  /* ------------------------------------------
     UTILITY
  ------------------------------------------ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const isMobile = () => window.matchMedia('(max-width: 768px)').matches ||
    ('ontouchstart' in window);

  /* ------------------------------------------
     CUSTOM CURSOR
  ------------------------------------------ */
  const cursorEl = $('#cursor');
  const cursorRipple = $('#cursorRipple');
  let mouseX = -200, mouseY = -200;
  let ringX = -200, ringY = -200;
  let rafId;

  function initCursor() {
    if (isMobile()) {
      document.body.classList.add('mobile-cursor');
      return;
    }

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    document.addEventListener('mouseenter', () => {
      if (cursorEl) cursorEl.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
      if (cursorEl) cursorEl.style.opacity = '0';
    });

    // Hover state
    document.addEventListener('mouseover', (e) => {
      const hoverable = e.target.closest('a, button, [data-hover], input, select, textarea, .work-card, .service-card, .wom-item');
      if (hoverable) document.body.classList.add('cursor-hovering');
    });

    document.addEventListener('mouseout', (e) => {
      const hoverable = e.target.closest('a, button, [data-hover], input, select, textarea, .work-card, .service-card, .wom-item');
      if (hoverable) document.body.classList.remove('cursor-hovering');
    });

    // Click ripple
    document.addEventListener('mousedown', (e) => {
      document.body.classList.add('cursor-clicking');
      if (cursorRipple) {
        cursorRipple.style.left = e.clientX + 'px';
        cursorRipple.style.top = e.clientY + 'px';
        cursorRipple.classList.remove('active');
        void cursorRipple.offsetWidth; // reflow
        cursorRipple.classList.add('active');
      }
    });

    document.addEventListener('mouseup', () => {
      document.body.classList.remove('cursor-clicking');
    });

    function animateCursor() {
      if (cursorEl) {
        cursorEl.style.left = mouseX + 'px';
        cursorEl.style.top = mouseY + 'px';
      }
      rafId = requestAnimationFrame(animateCursor);
    }

    animateCursor();
  }

  /* ------------------------------------------
     CONTEXT MENU (RIGHT-CLICK)
  ------------------------------------------ */
  const contextMenu = $('#contextMenu');
  let contextMenuOpen = false;

  function showContextMenu(x, y) {
    if (!contextMenu || isMobile()) return;

    const menuW = 240;
    const menuH = 260;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let posX = x;
    let posY = y;

    if (posX + menuW > vw - 16) posX = vw - menuW - 16;
    if (posY + menuH > vh - 16) posY = vh - menuH - 16;
    if (posX < 8) posX = 8;
    if (posY < 8) posY = 8;

    contextMenu.style.left = posX + 'px';
    contextMenu.style.top = posY + 'px';
    contextMenu.classList.add('visible');
    contextMenuOpen = true;
  }

  function hideContextMenu() {
    if (!contextMenu) return;
    contextMenu.classList.remove('visible');
    contextMenuOpen = false;
  }

  document.addEventListener('contextmenu', (e) => {
    if (isMobile()) return;
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY);
  });

  document.addEventListener('click', (e) => {
    if (contextMenu && contextMenuOpen && !contextMenu.contains(e.target)) {
      hideContextMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideContextMenu();
  });

  // Context menu navigation items
  if (contextMenu) {
    $$('.context-menu-item[data-target]', contextMenu).forEach(item => {
      item.addEventListener('click', () => {
        const target = item.dataset.target;
        const el = document.getElementById(target);
        hideContextMenu();
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      });
    });
  }

  /* ------------------------------------------
     NAVIGATION
  ------------------------------------------ */
  const nav = $('#nav');
  const navToggle = $('#navToggle');
  const navLinks = $('.nav-links');

  window.addEventListener('scroll', () => {
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }
  }, { passive: true });

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // Close mobile nav on link click
  $$('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks) navLinks.classList.remove('open');
    });
  });

  /* ------------------------------------------
     SMOOTH SCROLL — all anchor links
  ------------------------------------------ */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  /* ------------------------------------------
     TYPEWRITER EFFECT (HERO)
  ------------------------------------------ */
  const typewriterEl = $('#typewriter');
  const words = [
    'Web Possible',
    'Unforgettable',
    'Wright',
    'Launch-Ready',
    'Your Vision',
  ];

  let wordIdx = 0, charIdx = 0, deleting = false;
  let typeTimeout;

  function type() {
    if (!typewriterEl) return;
    const word = words[wordIdx];

    if (!deleting) {
      typewriterEl.textContent = word.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === word.length) {
        deleting = true;
        typeTimeout = setTimeout(type, 2000);
        return;
      }
    } else {
      typewriterEl.textContent = word.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        wordIdx = (wordIdx + 1) % words.length;
        typeTimeout = setTimeout(type, 400);
        return;
      }
    }

    typeTimeout = setTimeout(type, deleting ? 60 : 95);
  }

  type();

  /* ------------------------------------------
     HERO CANVAS — Particle Field
  ------------------------------------------ */
  const canvas = $('#heroCanvas');

  function initCanvas() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    const PARTICLE_COUNT = isMobile() ? 30 : 70;
    const COLORS = ['rgba(99,102,241,', 'rgba(6,182,212,', 'rgba(139,92,246,'];

    class Particle {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.x = Math.random() * w;
        this.y = initial ? Math.random() * h : h + 10;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = -(Math.random() * 0.6 + 0.2);
        this.alpha = 0;
        this.maxAlpha = Math.random() * 0.5 + 0.1;
        this.fadeIn = true;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += this.pulseSpeed;
        const pAlpha = this.maxAlpha * (0.7 + 0.3 * Math.sin(this.pulse));
        if (this.fadeIn) {
          this.alpha = Math.min(this.alpha + 0.008, pAlpha);
          if (this.alpha >= pAlpha * 0.9) this.fadeIn = false;
        } else {
          this.alpha = pAlpha;
        }
        if (this.y < -10) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.alpha + ')';
        ctx.fill();
      }
    }

    // Connecting lines between close particles
    function drawConnections() {
      const maxDist = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.08;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);
      drawConnections();
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    }

    animate();
  }

  initCanvas();

  /* ------------------------------------------
     SCROLL REVEAL — Intersection Observer
  ------------------------------------------ */
  const revealEls = $$('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const siblings = $$(`.reveal`, entry.target.parentElement);
        const delay = siblings.indexOf(entry.target) * 80;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, Math.min(delay, 400));
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ------------------------------------------
     ANIMATED STAT COUNTERS
  ------------------------------------------ */
  const statNums = $$('.stat-num[data-target]');

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const start = performance.now();

      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }

      requestAnimationFrame(step);
      statsObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => statsObserver.observe(el));

  /* ------------------------------------------
     CONTACT FORM — Simulated Submit
  ------------------------------------------ */
  const form = $('#contactForm');
  const formSuccess = $('#formSuccess');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.querySelector('span').textContent = 'Sending…';

      setTimeout(() => {
        form.reset();
        btn.disabled = false;
        btn.querySelector('span').textContent = 'Send Message';
        if (formSuccess) {
          formSuccess.classList.add('visible');
          setTimeout(() => formSuccess.classList.remove('visible'), 6000);
        }
      }, 1400);
    });
  }

  /* ------------------------------------------
     SERVICE CARDS — right-click shows menu detail
  ------------------------------------------ */
  $$('.service-card:not(.service-card--cta)').forEach(card => {
    card.addEventListener('contextmenu', (e) => {
      if (isMobile()) return;
      e.preventDefault();
      e.stopPropagation();
      const label = card.dataset.menuLabel || 'Service';
      showContextMenu(e.clientX, e.clientY);
    });
  });

  /* ------------------------------------------
     NAV ACTIVE STATE on scroll
  ------------------------------------------ */
  const sections = $$('section[id]');
  const navLinkEls = $$('.nav-links .nav-link:not(.nav-link--cta)');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinkEls.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}`
          ? 'var(--text)' : '';
      });
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObserver.observe(s));

  /* ------------------------------------------
     HERO DEMO ANIMATION — periodic right-click
  ------------------------------------------ */
  const demoCursor = $('#demoCursor');
  const demoContextMenuEl = $('#demoContextMenu');

  /* Handled purely by CSS keyframe animations */

  /* ------------------------------------------
     EASTER EGG — Konami code shows special menu
  ------------------------------------------ */
  const KONAMI = [38,38,40,40,37,39,37,39,66,65];
  let konamiIdx = 0;

  document.addEventListener('keydown', (e) => {
    if (e.keyCode === KONAMI[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === KONAMI.length) {
        konamiIdx = 0;
        const x = window.innerWidth / 2 - 110;
        const y = window.innerHeight / 2 - 130;
        showContextMenu(x, y);
        // Replace menu content briefly
        const header = contextMenu.querySelector('.context-menu-header span:last-child');
        if (header) {
          const orig = header.textContent;
          header.textContent = '✦ You found the secret!';
          setTimeout(() => { header.textContent = orig; }, 3000);
        }
      }
    } else {
      konamiIdx = 0;
    }
  });

  /* ------------------------------------------
     INIT
  ------------------------------------------ */
  initCursor();

  // Fade in page
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';
  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
  });

  // Fallback if load already fired
  if (document.readyState === 'complete') {
    document.body.style.opacity = '1';
  }

})();
