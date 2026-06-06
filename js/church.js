/* ================================================================
   Williamson's Chapel UMC — Interactive Layer
   Premium motion system: Apple · Stripe · Vercel · Linear
   ================================================================ */

'use strict';

const qs  = (s, c = document) => c.querySelector(s);
const qsa = (s, c = document) => [...c.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const isMobile = () => window.innerWidth <= 768 || 'ontouchstart' in window;

/* ================================================================
   GRADIENT MESH CANVAS — Stripe-style animated orbs
   Shared factory used by hero, impact, and begin sections
   ================================================================ */
function initMeshCanvas(id, palette) {
    const canvas = qs(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    const resize = () => {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const orbs = palette.map((col, i) => ({
        col,
        cx:    0.15 + i * 0.28,
        cy:    0.25 + (i % 2) * 0.45,
        r:     0.38 + (i % 3) * 0.08,
        speed: 0.00035 + i * 0.00025,
        phase: i * 2.09,
    }));

    let t = 0;

    const frame = () => {
        ctx.clearRect(0, 0, W, H);
        t += 0.4;

        orbs.forEach(o => {
            const ox = Math.sin(t * o.speed * 1000 + o.phase)       * 0.13;
            const oy = Math.cos(t * o.speed * 780  + o.phase * 1.4) * 0.10;
            const x  = (o.cx + ox) * W;
            const y  = (o.cy + oy) * H;
            const r  = o.r * Math.min(W, H);

            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0,   `rgba(${o.col},0.32)`);
            g.addColorStop(0.45,`rgba(${o.col},0.09)`);
            g.addColorStop(1,   `rgba(${o.col},0)`);

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();
        });

        requestAnimationFrame(frame);
    };

    frame();
}

/* Hero & Begin — Lake Norman deep navy to cerulean */
const LAKE_PALETTE = ['15,52,145', '29,78,216', '14,116,144', '56,189,248'];
initMeshCanvas('#meshCanvas',  LAKE_PALETTE);
initMeshCanvas('#beginCanvas', LAKE_PALETTE);

/* Impact — midnight navy to teal */
const DEEP_PALETTE = ['30,58,138', '29,78,216', '8,145,178'];
initMeshCanvas('#impactCanvas', DEEP_PALETTE);

/* ================================================================
   CUSTOM CURSOR — dot snaps, ring lags via lerp
   ================================================================ */
(function initCursor() {
    if (isMobile()) return;

    const dot  = qs('.c-dot');
    const ring = qs('.c-ring');
    if (!dot || !ring) return;

    let mx = -200, my = -200;
    let rx = -200, ry = -200;

    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
    });

    const tick = () => {
        dot.style.transform  = `translate(${mx}px, ${my}px)`;
        rx = lerp(rx, mx, 0.12);
        ry = lerp(ry, my, 0.12);
        ring.style.transform = `translate(${rx}px, ${ry}px)`;
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const TARGETS = 'a, button, input, textarea, select, .msg-card, .feature-card, .story-card, .service-item';

    document.addEventListener('mouseover', e => {
        ring.classList.toggle('hover', !!e.target.closest(TARGETS));
    });
})();

/* ================================================================
   NAVIGATION — scroll state · mobile menu · active section
   ================================================================ */
(function initNav() {
    const nav    = qs('#site-nav');
    const burger = qs('#navBurger');
    const links  = qs('#navLinks');
    if (!nav) return;

    /* scroll state */
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* mobile toggle */
    burger?.addEventListener('click', () => {
        const isOpen = burger.getAttribute('aria-expanded') === 'true';
        burger.setAttribute('aria-expanded', String(!isOpen));
        links?.classList.toggle('open', !isOpen);
    });

    /* close on nav link click */
    qsa('.nav-link, .nav-cta').forEach(a => a.addEventListener('click', () => {
        burger?.setAttribute('aria-expanded', 'false');
        links?.classList.remove('open');
    }));

    /* active section highlight */
    const sections = qsa('section[id]');
    const navLinks = qsa('.nav-link');

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
   HERO REVEAL — staggered lines on page load
   ================================================================ */
(function initHeroReveal() {
    const lines = qsa('.split-line');
    if (!lines.length) return;

    const extras = [qs('.hero-eyebrow'), qs('.hero-sub'), qs('.hero-actions')];

    /* set initial hidden state */
    lines.forEach(l => {
        l.style.opacity   = '0';
        l.style.transform = 'translateY(48px)';
        l.style.display   = 'block';
    });
    extras.forEach(el => {
        if (!el) return;
        el.style.opacity   = '0';
        el.style.transform = 'translateY(20px)';
    });

    const reveal = () => {
        lines.forEach((l, i) => {
            setTimeout(() => {
                l.style.transition = 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)';
                l.style.opacity    = '1';
                l.style.transform  = 'translateY(0)';
            }, 280 + i * 150);
        });

        const baseDelay = 280 + lines.length * 150 - 80;
        extras.forEach((el, i) => {
            if (!el) return;
            setTimeout(() => {
                el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
                el.style.opacity    = '1';
                el.style.transform  = 'translateY(0)';
            }, baseDelay + i * 110);
        });
    };

    if (document.readyState === 'complete') reveal();
    else window.addEventListener('load', reveal, { once: true });
})();

/* ================================================================
   WORD REVEAL — [data-word-reveal] elements
   Splits text into .word-unit spans, triggers on scroll entry
   ================================================================ */
(function initWordReveal() {
    const els = qsa('[data-word-reveal]');
    if (!els.length) return;

    els.forEach(el => {
        const text  = el.textContent.trim();
        const words = text.split(/\s+/);
        el.innerHTML = words
            .map((w, i) => `<span class="word-unit" style="transition-delay:${i * 60}ms">${w}</span>`)
            .join(' ');
    });

    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                qsa('.word-unit', e.target).forEach(w => w.classList.add('visible'));
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });

    els.forEach(el => io.observe(el));
})();

/* ================================================================
   SCROLL REVEAL — .reveal → .visible via IntersectionObserver
   ================================================================ */
(function initScrollReveal() {
    const els = qsa('.reveal');
    if (!els.length) return;

    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => io.observe(el));
})();

/* ================================================================
   ANIMATED COUNTERS — .impact-num[data-target][data-suffix]
   ================================================================ */
(function initCounters() {
    const nums = qsa('.impact-num[data-target]');
    if (!nums.length) return;

    const easeOut = t => 1 - Math.pow(1 - t, 3);

    const animate = el => {
        const target   = +el.dataset.target;
        const suffix   = el.dataset.suffix || '';
        const duration = target > 1000 ? 2000 : 1400;
        const start    = performance.now();

        const tick = now => {
            const prog = Math.min((now - start) / duration, 1);
            const val  = Math.floor(easeOut(prog) * target);
            el.textContent = (val >= 1000 ? val.toLocaleString() : val) + suffix;
            if (prog < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = (target >= 1000 ? target.toLocaleString() : target) + suffix;
            }
        };
        requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
        });
    }, { threshold: 0.3 });

    nums.forEach(el => io.observe(el));
})();

/* ================================================================
   CONTACT FORM — simulate submission, show success state
   ================================================================ */
(function initForm() {
    const form    = qs('#visitForm');
    const success = qs('#formSuccess');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        const btn = form.querySelector('button[type="submit"]');
        btn.disabled    = true;
        btn.textContent = 'Sending…';

        setTimeout(() => {
            form.hidden = true;
            if (success) success.hidden = false;
        }, 900);
    });
})();

/* ================================================================
   SMOOTH SCROLL — offset for sticky nav height
   ================================================================ */
(function initSmoothScroll() {
    qsa('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id = a.getAttribute('href').slice(1);
            if (!id) return;
            const target = document.getElementById(id);
            if (!target) return;
            e.preventDefault();
            const navH = (qs('#site-nav')?.offsetHeight || 80) + 8;
            const top  = target.getBoundingClientRect().top + window.scrollY - navH;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
})();
