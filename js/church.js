/* ============================================================
   Grace & Glory Church — JavaScript
   ============================================================ */

'use strict';

/* ---- Utility ---------------------------------------------- */
const qs  = (s, c = document) => c.querySelector(s);
const qsa = (s, c = document) => [...c.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const isMobile = () => window.innerWidth <= 768 || 'ontouchstart' in window;

/* ============================================================
   PRELOADER
   ============================================================ */
(function initPreloader() {
    const el = qs('#preloader');
    if (!el) return;

    const finish = () => {
        el.classList.add('done');
        setTimeout(() => el.remove(), 700);
        document.body.style.overflow = '';
    };

    document.body.style.overflow = 'hidden';

    if (document.readyState === 'complete') {
        setTimeout(finish, 1200);
    } else {
        window.addEventListener('load', () => setTimeout(finish, 1200), { once: true });
    }
})();

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
(function initCursor() {
    if (isMobile()) return;

    const dot  = qs('#cursorDot');
    const ring = qs('#cursorRing');
    if (!dot || !ring) return;

    let mx = -100, my = -100;
    let rx = -100, ry = -100;

    const move = e => { mx = e.clientX; my = e.clientY; };
    document.addEventListener('mousemove', move);

    const update = () => {
        dot.style.transform  = `translate(${mx - 4}px, ${my - 4}px)`;
        rx = lerp(rx, mx, 0.14);
        ry = lerp(ry, my, 0.14);
        ring.style.transform = `translate(${rx - 17}px, ${ry - 17}px)`;
        requestAnimationFrame(update);
    };
    requestAnimationFrame(update);

    const hoverEls = qsa('a, button, .glass-card, input, textarea, select, [data-cursor]');
    hoverEls.forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });
})();

/* ============================================================
   NAVBAR
   ============================================================ */
(function initNav() {
    const nav    = qs('#navbar');
    const btn    = qs('#mobileMenuBtn');
    const links  = qs('#navLinks');
    if (!nav) return;

    const setScrolled = () => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', setScrolled, { passive: true });
    setScrolled();

    btn?.addEventListener('click', () => {
        const open = btn.classList.toggle('open');
        links?.classList.toggle('open', open);
    });

    qsa('.nav-link, .nav-cta-btn').forEach(a => {
        a.addEventListener('click', () => {
            btn?.classList.remove('open');
            links?.classList.remove('open');
        });
    });

    /* Active link on scroll */
    const sections = qsa('section[id]');
    const navLinks = qsa('.nav-link');
    const onScroll = () => {
        const mid = window.scrollY + window.innerHeight / 3;
        sections.forEach(sec => {
            if (sec.offsetTop <= mid && sec.offsetTop + sec.offsetHeight > mid) {
                navLinks.forEach(l => {
                    l.classList.toggle('active', l.getAttribute('href') === '#' + sec.id);
                });
            }
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ============================================================
   HERO CANVAS — particle field with connecting lines
   ============================================================ */
(function initHeroCanvas() {
    const canvas = qs('#heroCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    const COUNT = isMobile() ? 40 : 80;
    const MAX_DIST = 140;

    const resize = () => {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    };

    const rand = (min, max) => Math.random() * (max - min) + min;

    const makeParticle = () => ({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.3, 0.3), vy: rand(-0.15, -0.5),
        r: rand(1, 2.5),
        alpha: rand(0.3, 0.9),
        color: Math.random() > 0.5
            ? `rgba(139,92,246,`    /* purple */
            : `rgba(251,191,36,`    /* gold */
    });

    const init = () => {
        resize();
        particles = Array.from({ length: COUNT }, makeParticle);
    };

    const draw = () => {
        ctx.clearRect(0, 0, W, H);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -4) { p.y = H + 4; p.x = rand(0, W); }
            if (p.x < 0)  { p.x = W; }
            if (p.x > W)  { p.x = 0; }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `${p.color}${p.alpha})`;
            ctx.fill();
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i], b = particles[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < MAX_DIST) {
                    const alpha = (1 - d / MAX_DIST) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize, { passive: true });
    init();
    draw();
})();

/* ============================================================
   GIVE CANVAS — floating orbs / aurora
   ============================================================ */
(function initGiveCanvas() {
    const canvas = qs('#giveCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, t = 0;

    const resize = () => {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const orbs = [
        { cx: 0.5, cy: 0.5, r: 0.35, color: '109,40,217', speed: 0.0007 },
        { cx: 0.3, cy: 0.4, r: 0.22, color: '217,119,6',  speed: 0.0011 },
        { cx: 0.7, cy: 0.6, r: 0.18, color: '6,182,212',  speed: 0.0009 },
    ];

    const draw = () => {
        ctx.clearRect(0, 0, W, H);
        t += 1;

        orbs.forEach((o, i) => {
            const ox = Math.sin(t * o.speed * 1000 + i * 2) * 0.12;
            const oy = Math.cos(t * o.speed * 800  + i)     * 0.10;
            const x  = (o.cx + ox) * W;
            const y  = (o.cy + oy) * H;
            const r  = o.r * Math.min(W, H);
            const g  = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0,   `rgba(${o.color},0.35)`);
            g.addColorStop(0.5, `rgba(${o.color},0.10)`);
            g.addColorStop(1,   `rgba(${o.color},0)`);
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();
        });

        requestAnimationFrame(draw);
    };

    draw();
})();

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
(function initScrollReveal() {
    const els = qsa('.reveal-up, .reveal-left, .reveal-right');
    if (!els.length) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => io.observe(el));
})();

/* ============================================================
   ANIMATED COUNTERS
   ============================================================ */
(function initCounters() {
    const nums = qsa('.stat-number[data-target]');
    if (!nums.length) return;

    const ease = t => 1 - Math.pow(1 - t, 4);

    const animateCounter = (el) => {
        const target   = +el.dataset.target;
        const duration = 1800;
        const start    = performance.now();

        const tick = (now) => {
            const prog = Math.min((now - start) / duration, 1);
            el.textContent = Math.floor(ease(prog) * target).toLocaleString();
            if (prog < 1) requestAnimationFrame(tick);
            else el.textContent = target.toLocaleString();
        };

        requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                animateCounter(e.target);
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.5 });

    nums.forEach(el => io.observe(el));
})();

/* ============================================================
   COUNTDOWN TIMER
   ============================================================ */
(function initCountdown() {
    const target = new Date('2026-06-15T18:00:00');
    const daysEl  = qs('#cd-days');
    const hrsEl   = qs('#cd-hours');
    const minsEl  = qs('#cd-mins');
    const secsEl  = qs('#cd-secs');

    if (!daysEl) return;

    const pad = n => String(n).padStart(2, '0');

    const update = () => {
        const diff = target - Date.now();
        if (diff <= 0) {
            daysEl.textContent = hrsEl.textContent = minsEl.textContent = secsEl.textContent = '00';
            return;
        }
        const s   = Math.floor(diff / 1000);
        const m   = Math.floor(s / 60);
        const h   = Math.floor(m / 60);
        const d   = Math.floor(h / 24);
        daysEl.textContent = pad(d);
        hrsEl.textContent  = pad(h % 24);
        minsEl.textContent = pad(m % 60);
        secsEl.textContent = pad(s % 60);
    };

    update();
    setInterval(update, 1000);
})();

/* ============================================================
   CONTACT FORM
   ============================================================ */
(function initForm() {
    const form    = qs('#visitForm');
    const success = qs('#formSuccess');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        /* Simulate async submission */
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.querySelector('span').textContent = 'Sending…';

        setTimeout(() => {
            form.hidden = true;
            success.hidden = false;
        }, 1000);
    });
})();

/* ============================================================
   SMOOTH SCROLL for nav links
   ============================================================ */
(function initSmoothScroll() {
    qsa('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id  = a.getAttribute('href').slice(1);
            const sec = document.getElementById(id);
            if (!sec) return;
            e.preventDefault();
            const offset = 80; /* nav height */
            const top    = sec.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
})();

/* ============================================================
   NAVBAR CURSOR HOVER — re-register after nav is ready
   ============================================================ */
(function refreshCursorHovers() {
    if (isMobile()) return;
    const ring = qs('#cursorRing');
    if (!ring) return;

    document.addEventListener('mouseover', e => {
        const isHoverable = e.target.closest('a, button, .glass-card, input, textarea, select');
        ring.classList.toggle('hovering', !!isHoverable);
    });
})();

/* ============================================================
   CARD TILT EFFECT (desktop only, subtle)
   ============================================================ */
(function initTilt() {
    if (isMobile()) return;

    qsa('.glass-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r    = card.getBoundingClientRect();
            const cx   = r.left + r.width  / 2;
            const cy   = r.top  + r.height / 2;
            const dx   = (e.clientX - cx) / (r.width  / 2);
            const dy   = (e.clientY - cy) / (r.height / 2);
            card.style.transform = `perspective(800px) rotateY(${dx * 5}deg) rotateX(${-dy * 5}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
})();

/* ============================================================
   PARALLAX — subtle depth on hero background
   ============================================================ */
(function initParallax() {
    if (isMobile()) return;
    const beams = qs('.light-beams');
    if (!beams) return;

    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            beams.style.transform = `translateY(${y * 0.25}px)`;
            ticking = false;
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
})();
