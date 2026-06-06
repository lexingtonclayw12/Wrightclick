/* ================================================================
   Grace & Glory Church
   Inspired by Life.church · Elevation Church · Ginghamsburg UMC
   ================================================================ */

'use strict';

const qs  = (s, c = document) => c.querySelector(s);
const qsa = (s, c = document) => [...c.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const isMobile = () => window.innerWidth <= 768 || 'ontouchstart' in window;

/* ================================================================
   ANNOUNCEMENT BAR — dismissable, shifts nav
   ================================================================ */
(function initAnnounceBar() {
    const bar  = qs('#announce-bar');
    const btn  = qs('#announceClose');
    const nav  = qs('#navbar');
    if (!bar || !btn || !nav) return;

    btn.addEventListener('click', () => {
        bar.classList.add('hidden');
        nav.classList.add('announce-hidden');
        setTimeout(() => bar.remove(), 700);
    });
})();

/* ================================================================
   CUSTOM CURSOR
   ================================================================ */
(function initCursor() {
    if (isMobile()) return;

    const dot  = qs('.cursor-dot') || Object.assign(document.createElement('div'), { className: 'cursor-dot', id: 'cd' });
    const ring = qs('.cursor-ring') || Object.assign(document.createElement('div'), { className: 'cursor-ring', id: 'cr' });

    if (!dot.parentNode) document.body.append(dot, ring);

    let mx = -100, my = -100, rx = -100, ry = -100;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    const tick = () => {
        dot.style.transform  = `translate(${mx - 3}px, ${my - 3}px)`;
        rx = lerp(rx, mx, 0.13);
        ry = lerp(ry, my, 0.13);
        ring.style.transform = `translate(${rx - 15}px, ${ry - 15}px)`;
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    document.addEventListener('mouseover', e => {
        const hoverable = e.target.closest('a, button, .glass-card, input, textarea, select, .msg-card, .campus-card, .nh-card, .qa-card');
        ring.classList.toggle('hovering', !!hoverable);
    });
})();

/* ================================================================
   NAVBAR — scroll state + active section + mobile menu
   ================================================================ */
(function initNav() {
    const nav     = qs('#navbar');
    const btn     = qs('#mobileMenuBtn');
    const links   = qs('#navLinks');
    if (!nav) return;

    /* scroll state */
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* mobile toggle */
    btn?.addEventListener('click', () => {
        const o = btn.classList.toggle('open');
        links?.classList.toggle('open', o);
    });

    /* close on link click */
    qsa('.nav-link, .live-btn').forEach(a => a.addEventListener('click', () => {
        btn?.classList.remove('open');
        links?.classList.remove('open');
    }));

    /* active section highlight */
    const sections  = qsa('section[id]');
    const navLinks  = qsa('.nav-link');

    window.addEventListener('scroll', () => {
        const mid = window.scrollY + window.innerHeight * 0.4;
        sections.forEach(sec => {
            if (sec.offsetTop <= mid && sec.offsetTop + sec.offsetHeight > mid) {
                navLinks.forEach(l =>
                    l.classList.toggle('active', l.getAttribute('href') === '#' + sec.id)
                );
            }
        });
    }, { passive: true });
})();

/* ================================================================
   HERO CANVAS — particle field with light streaks
   ================================================================ */
(function initHeroCanvas() {
    const canvas = qs('#heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    const COUNT = isMobile() ? 35 : 70;
    const CONNECT_DIST = 130;

    const resize = () => {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    };

    const rand = (min, max) => Math.random() * (max - min) + min;

    let particles = [];

    const makeP = () => ({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.25, 0.25),
        vy: rand(-0.45, -0.1),
        r: rand(0.8, 2),
        alpha: rand(0.2, 0.7),
        blue: Math.random() > 0.3,
    });

    const init = () => {
        resize();
        particles = Array.from({ length: COUNT }, makeP);
    };

    const frame = () => {
        ctx.clearRect(0, 0, W, H);

        /* connections */
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i], b = particles[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < CONNECT_DIST) {
                    const a_ = (1 - d / CONNECT_DIST) * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(59,130,246,${a_})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        /* particles */
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -4)  { p.y = H + 4; p.x = rand(0, W); }
            if (p.x < -4)  { p.x = W + 4; }
            if (p.x > W + 4) { p.x = -4; }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            const color = p.blue ? `rgba(59,130,246,${p.alpha})` : `rgba(248,250,252,${p.alpha * 0.5})`;
            ctx.fillStyle = color;
            ctx.fill();
        });

        requestAnimationFrame(frame);
    };

    window.addEventListener('resize', resize, { passive: true });
    init();
    frame();
})();

/* ================================================================
   SERVE / MISSIONS CANVAS — aurora/orb atmosphere
   ================================================================ */
(function initServeCanvas() {
    const canvas = qs('#serveCanvas');
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
        { cx: 0.5, cy: 0.5, r: 0.4,  col: '29,78,216',  sp: 0.0008 },
        { cx: 0.2, cy: 0.3, r: 0.25, col: '79,70,229',  sp: 0.0012 },
        { cx: 0.8, cy: 0.7, r: 0.2,  col: '59,130,246', sp: 0.001  },
    ];

    const frame = () => {
        ctx.clearRect(0, 0, W, H);
        t++;
        orbs.forEach((o, i) => {
            const ox = Math.sin(t * o.sp * 1000 + i * 2.1) * 0.1;
            const oy = Math.cos(t * o.sp * 900  + i * 1.7) * 0.08;
            const x = (o.cx + ox) * W;
            const y = (o.cy + oy) * H;
            const r = o.r * Math.min(W, H);
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0,   `rgba(${o.col},0.3)`);
            g.addColorStop(0.5, `rgba(${o.col},0.08)`);
            g.addColorStop(1,   `rgba(${o.col},0)`);
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();
        });
        requestAnimationFrame(frame);
    };
    frame();
})();

/* ================================================================
   HERO HEADLINE — staggered reveal on load
   ================================================================ */
(function initHeroReveal() {
    const rows = qsa('.hl-row');
    if (!rows.length) return;

    const onLoad = () => {
        rows.forEach((row, i) => {
            setTimeout(() => {
                row.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, 200 + i * 120);
        });
    };

    rows.forEach(r => {
        r.style.opacity = '0';
        r.style.transform = 'translateY(30px)';
    });

    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });
})();

/* ================================================================
   HORIZONTAL MESSAGE SCROLL
   ================================================================ */
(function initMsgScroll() {
    const scroll  = qs('#msgScroll');
    const leftBtn = qs('#msgLeft');
    const rightBtn= qs('#msgRight');
    if (!scroll) return;

    const scrollBy = dir => {
        const card = scroll.querySelector('.msg-card');
        const cardW = card ? card.offsetWidth + 20 : 260;
        scroll.scrollBy({ left: dir * cardW * 2, behavior: 'smooth' });
    };

    leftBtn?.addEventListener('click',  () => scrollBy(-1));
    rightBtn?.addEventListener('click', () => scrollBy(1));

    /* drag-to-scroll on desktop */
    if (!isMobile()) {
        let isDown = false, startX, scrollLeft;
        scroll.style.cursor = 'grab';

        scroll.addEventListener('mousedown', e => {
            isDown = true;
            scroll.style.cursor = 'grabbing';
            startX = e.pageX - scroll.offsetLeft;
            scrollLeft = scroll.scrollLeft;
        });

        document.addEventListener('mouseup', () => {
            isDown = false;
            scroll.style.cursor = 'grab';
        });

        scroll.addEventListener('mousemove', e => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - scroll.offsetLeft;
            scroll.scrollLeft = scrollLeft - (x - startX) * 1.5;
        });
    }
})();

/* ================================================================
   SCROLL REVEAL
   ================================================================ */
(function initScrollReveal() {
    const els = qsa('.reveal-up, .reveal-left, .reveal-right');
    if (!els.length) return;

    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    els.forEach(el => io.observe(el));
})();

/* ================================================================
   ANIMATED COUNTERS
   ================================================================ */
(function initCounters() {
    const nums = qsa('.stat-number[data-target]');
    if (!nums.length) return;

    const easeOut = t => 1 - Math.pow(1 - t, 4);

    const animate = el => {
        const target   = +el.dataset.target;
        const duration = target > 10000 ? 2200 : 1600;
        const start    = performance.now();

        const tick = now => {
            const prog = Math.min((now - start) / duration, 1);
            const val  = Math.floor(easeOut(prog) * target);
            el.textContent = val >= 1000 ? val.toLocaleString() : val;
            if (prog < 1) requestAnimationFrame(tick);
            else el.textContent = target.toLocaleString();
        };
        requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
        });
    }, { threshold: 0.4 });

    nums.forEach(el => io.observe(el));
})();

/* ================================================================
   COUNTDOWN TIMER — Revival event
   ================================================================ */
(function initCountdown() {
    const target = new Date('2026-06-15T18:00:00');
    const dEl    = qs('#ecd-d');
    const hEl    = qs('#ecd-h');
    const mEl    = qs('#ecd-m');
    if (!dEl) return;

    const pad = n => String(n).padStart(2, '0');

    const update = () => {
        const diff = target - Date.now();
        if (diff <= 0) { dEl.textContent = hEl.textContent = mEl.textContent = '00'; return; }
        const s  = Math.floor(diff / 1000);
        const m  = Math.floor(s / 60);
        const h  = Math.floor(m / 60);
        const d  = Math.floor(h / 24);
        dEl.textContent = pad(d);
        hEl.textContent = pad(h % 24);
        mEl.textContent = pad(m % 60);
    };
    update();
    setInterval(update, 60000); /* update each minute */
})();

/* ================================================================
   CONTACT FORM
   ================================================================ */
(function initForm() {
    const form    = qs('#visitForm');
    const success = qs('#formSuccess');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Sending…';

        setTimeout(() => {
            form.hidden = true;
            if (success) success.hidden = false;
        }, 900);
    });
})();

/* ================================================================
   SMOOTH SCROLL — offset for sticky nav
   ================================================================ */
(function initSmoothScroll() {
    qsa('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id  = a.getAttribute('href').slice(1);
            const sec = document.getElementById(id);
            if (!sec) return;
            e.preventDefault();
            const offset = 80;
            const top    = sec.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
})();

/* ================================================================
   CARD TILT — subtle 3D on glass cards
   ================================================================ */
(function initTilt() {
    if (isMobile()) return;

    qsa('.glass-card, .campus-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r   = card.getBoundingClientRect();
            const cx  = r.left + r.width  / 2;
            const cy  = r.top  + r.height / 2;
            const dx  = (e.clientX - cx) / (r.width  / 2);
            const dy  = (e.clientY - cy) / (r.height / 2);
            card.style.transform = `perspective(700px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg) translateY(-3px)`;
        });

        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
})();

/* ================================================================
   HERO PARALLAX — beams drift on scroll (subtle depth)
   ================================================================ */
(function initParallax() {
    if (isMobile()) return;
    const overlay = qs('.hero-overlay');
    if (!overlay) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            overlay.style.transform = `translateY(${y * 0.15}px)`;
            ticking = false;
        });
    }, { passive: true });
})();
