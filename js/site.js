/* ==========================================================================
   WRIGHT CLICK STUDIO — site.js
   Everything degrades: no JS, reduced motion, touch and keyboard all work.
   ========================================================================== */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const body = document.body;

  const stillMedia  = matchMedia('(prefers-reduced-motion: reduce)');
  const coarseMedia = matchMedia('(hover: none), (pointer: coarse)');
  const still  = () => stillMedia.matches;
  const coarse = () => coarseMedia.matches;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp  = (a, b, t) => a + (b - a) * t;

  /* ------------------------------------------------------------------
     1. COLD OPEN — the studio ident, then the gates open.
     Only the first visit of a session gets the full 2 seconds.
  ------------------------------------------------------------------ */
  (function coldOpen() {
    let seen = false;
    try { seen = sessionStorage.getItem('wcs.seen') === '1'; } catch (e) {}

    const hold = still() || seen || location.hash ? 60 : 1900;

    const strike = () => {
      body.classList.remove('is-booting');
      try { sessionStorage.setItem('wcs.seen', '1'); } catch (e) {}
      const co = $('#coldopen');
      if (co) setTimeout(() => co.remove(), 1200);
    };

    setTimeout(strike, hold);
    // Any deliberate input cuts the ident short.
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev =>
      addEventListener(ev, function once() {
        if (body.classList.contains('is-booting')) strike();
        removeEventListener(ev, once);
      }, { passive: true })
    );
  })();

  /* ------------------------------------------------------------------
     2. THE KEY LIGHT — one tungsten source the page is lit by.
     Drives the page-wide glow AND the gradient inside the headline,
     so the letters are actually lit rather than merely coloured.
  ------------------------------------------------------------------ */
  (function keyLight() {
    if (coarse()) return;

    const litEls = $$('[data-lit]');
    let tx = innerWidth * 0.5, ty = innerHeight * 0.4;
    let cx = tx, cy = ty;
    let running = false;

    addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      tx = e.clientX; ty = e.clientY;
      if (!running) { running = true; requestAnimationFrame(follow); }
    }, { passive: true });

    function follow() {
      // The light has mass — it lags the pointer.
      cx = lerp(cx, tx, still() ? 1 : 0.085);
      cy = lerp(cy, ty, still() ? 1 : 0.085);

      root.style.setProperty('--mx', cx.toFixed(1) + 'px');
      root.style.setProperty('--my', cy.toFixed(1) + 'px');

      for (const el of litEls) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) continue;
        el.style.setProperty('--lx', clamp(((cx - r.left) / r.width) * 100, -60, 160).toFixed(1) + '%');
        el.style.setProperty('--ly', clamp(((cy - r.top) / r.height) * 100, -160, 260).toFixed(1) + '%');
      }

      if (Math.abs(cx - tx) > 0.4 || Math.abs(cy - ty) > 0.4) {
        requestAnimationFrame(follow);
      } else {
        running = false;
      }
    }
    follow();
  })();

  /* ------------------------------------------------------------------
     3. FOCUS RING — camera autofocus brackets that snap to whatever
     the pointer is framing.
  ------------------------------------------------------------------ */
  (function focusRing() {
    if (coarse() || still()) return;
    const ring = $('#focusring');
    if (!ring) return;
    let held = null;

    const snap = (el) => {
      const r = el.getBoundingClientRect();
      const pad = 9;
      ring.style.width  = (r.width  + pad * 2) + 'px';
      ring.style.height = (r.height + pad * 2) + 'px';
      ring.style.transform = `translate3d(${r.left - pad}px, ${r.top - pad}px, 0)`;
      ring.classList.add('is-on');
    };

    addEventListener('pointerover', (e) => {
      const el = e.target.closest('[data-frame]');
      if (!el || el === held) return;
      held = el;
      snap(el);
    }, { passive: true });

    addEventListener('pointerout', (e) => {
      if (!held) return;
      if (e.relatedTarget && held.contains(e.relatedTarget)) return;
      held = null;
      ring.classList.remove('is-on');
    }, { passive: true });

    const retrack = () => { if (held) snap(held); };
    addEventListener('scroll', retrack, { passive: true });
    addEventListener('resize', retrack);
  })();

  /* ------------------------------------------------------------------
     4. REVEALS — a wipe up from the cut line, staggered per group.
  ------------------------------------------------------------------ */
  (function reveals() {
    const groups = [
      ['.sec-head > *', 1],
      ['.reel-head > *', 1],
      ['.frame', 1],
      ['.dept', 1],
      ['.specs li', 1],
      ['.sheet-row', 1],
      ['.studio-copy > *', 1],
      ['.studio-plate', 1],
      ['.tier', 1],
      ['.brief', 1]
    ];

    const targets = [];
    for (const [sel] of groups) {
      $$(sel).forEach((el, i) => {
        el.classList.add('rv');
        el.style.setProperty('--d', Math.min(i, 6));
        targets.push(el);
      });
    }

    if (still() || !('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('is-lit'));
      return;
    }

    // threshold MUST stay 0: the reveal's own clip-path collapses the
    // element's intersection ratio to zero, so any ratio-based threshold
    // would wait forever for a reveal that only happens once it fires.
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        en.target.classList.add('is-lit');
        io.unobserve(en.target);
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });

    targets.forEach(el => io.observe(el));

    // Insurance: anything sitting in view but still dark after the page
    // settles gets lit anyway. Nothing on this site may stay invisible.
    const sweep = () => {
      for (const el of targets) {
        if (el.classList.contains('is-lit')) continue;
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0 && r.width > 0) {
          el.classList.add('is-lit');
          io.unobserve(el);
        }
      }
    };
    addEventListener('load', () => setTimeout(sweep, 400));
    setTimeout(sweep, 2500);
  })();

  /* ------------------------------------------------------------------
     5. HEADER — condenses on scroll, ducks out of the way going down.
  ------------------------------------------------------------------ */
  (function header() {
    const head = $('#head');
    if (!head) return;
    let last = 0, ticking = false;

    const read = () => {
      const y = scrollY;
      head.classList.toggle('is-stuck', y > 40);
      head.classList.toggle('is-gone', y > 460 && y > last && !body.classList.contains('no-scroll'));
      last = y;
      ticking = false;
    };

    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(read); }
    }, { passive: true });
    read();
  })();

  /* ------------------------------------------------------------------
     6. DRAWER
  ------------------------------------------------------------------ */
  (function drawer() {
    const btn = $('#burger'), panel = $('#drawer');
    if (!btn || !panel) return;

    const set = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      panel.hidden = !open;
      body.classList.toggle('no-scroll', open);
    };

    btn.addEventListener('click', () => set(panel.hidden));
    panel.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { set(false); btn.focus(); } });
  })();

  /* ------------------------------------------------------------------
     7. TRANSPORT — which reel is playing, how far into it, and a
     timecode running against a nominal nine-minute picture.
  ------------------------------------------------------------------ */
  (function transport() {
    const bar = $('#rail'), tc = $('#railTc'), now = $('#railNow'), idx = $('#railIdx');
    if (!bar) return;

    const marks = $$('.scrub-list li', bar)
      .map(li => ({ li, sec: document.getElementById(li.dataset.rail) }))
      .filter(m => m.sec);
    if (!marks.length) return;

    const NAMES = ['Title', 'The Reel', 'Departments', 'Production', 'The Studio', 'End Card'];
    const RUNTIME = 9 * 60;
    let ticking = false;

    const read = () => {
      const y = scrollY + innerHeight * 0.42;

      let live = 0;
      for (let i = 0; i < marks.length; i++) if (marks[i].sec.offsetTop <= y) live = i;

      marks.forEach((m, i) => {
        // Filled behind, filling in place, empty ahead.
        let seg = 0;
        if (i < live) seg = 1;
        else if (i === live) {
          const top = m.sec.offsetTop;
          const h = Math.max(1, m.sec.offsetHeight);
          seg = clamp((y - top) / h, 0, 1);
        }
        m.li.style.setProperty('--seg', seg.toFixed(3));
      });

      if (now) now.textContent = NAMES[live] || '';
      if (idx) idx.textContent = String(live + 1).padStart(2, '0');

      const span = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const p = clamp(scrollY / span, 0, 1);
      // On through the picture, off over the title card and the credits.
      bar.classList.toggle('is-on', scrollY > innerHeight * 0.5 && p < 0.982);

      if (tc) {
        const t = p * RUNTIME;
        const mm = String(Math.floor(t / 60)).padStart(2, '0');
        const ss = String(Math.floor(t % 60)).padStart(2, '0');
        const ff = String(Math.floor((t % 1) * 24)).padStart(2, '0');
        tc.textContent = `${mm}:${ss}:${ff}`;
      }
      ticking = false;
    };

    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(read); }
    }, { passive: true });
    addEventListener('resize', read);
    read();
  })();

  /* ------------------------------------------------------------------
     8. THE REEL — vertical scroll pulls the filmstrip sideways.
     Touch and reduced-motion get a real horizontal scroller instead.
  ------------------------------------------------------------------ */
  (function reel() {
    const sec = $('#reel'), track = $('#reelTrack'), view = $('.reel-viewport', sec || document);
    if (!sec || !track || !view) return;

    // Narrow windows get the plain scroller too — a scroll-hijacked
    // filmstrip is miserable in a small viewport.
    const native = () => coarse() || still() || innerWidth < 900;
    let travel = 0, ticking = false;

    const layout = () => {
      if (native()) {
        sec.classList.add('reel--native');
        sec.style.height = '';
        view.style.transform = '';
        return;
      }
      sec.classList.remove('reel--native');
      // How far the strip has to move to show its last frame.
      travel = Math.max(0, view.scrollWidth - innerWidth);
      // Pace it: roughly one screen of scroll per screen of strip.
      sec.style.height = (innerHeight + travel * 0.92) + 'px';
      paint();
    };

    const paint = () => {
      if (native() || travel <= 0) return;
      const start = sec.offsetTop;
      const span  = sec.offsetHeight - innerHeight;
      const p = clamp((scrollY - start) / Math.max(1, span), 0, 1);
      view.style.transform = `translate3d(${-(p * travel).toFixed(1)}px,0,0)`;
      ticking = false;
    };

    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    }, { passive: true });

    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 140); });
    stillMedia.addEventListener?.('change', layout);
    coarseMedia.addEventListener?.('change', layout);

    // Fonts land late and change the strip's width.
    if (document.fonts?.ready) document.fonts.ready.then(layout);
    addEventListener('load', layout);
    layout();
  })();

  /* ------------------------------------------------------------------
     9. SPEC COUNTERS
  ------------------------------------------------------------------ */
  (function counters() {
    const nums = $$('.spec-n[data-count]');
    if (!nums.length) return;

    const run = (el) => {
      const end = parseFloat(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || '';
      if (still()) { el.textContent = end + suffix; return; }
      const dur = 1400;
      const t0 = performance.now();
      const step = (t) => {
        const p = clamp((t - t0) / dur, 0, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * e) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
    }, { threshold: 0.5 });
    nums.forEach(n => io.observe(n));
  })();

  /* ------------------------------------------------------------------
     10. THE BRIEF
     Set ENDPOINT to a form service (Formspree, Basin, Netlify fn…) and
     submissions post as JSON. Until then it composes a mail draft so the
     form is never a dead end.
  ------------------------------------------------------------------ */
  (function brief() {
    const form = $('#brief'), status = $('#briefStatus');
    if (!form) return;

    const ENDPOINT = '';                              // <— paste form URL here
    const INBOX = 'hello@wrightclickstudio.com';

    const say = (msg, bad) => {
      if (!status) return;
      status.textContent = msg;
      status.classList.toggle('is-bad', !!bad);
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!form.reportValidity()) { say('A few fields still need you.', true); return; }

      const data = Object.fromEntries(new FormData(form).entries());
      const btn = $('button[type="submit"]', form);
      const label = $('span', btn);
      const was = label ? label.textContent : '';
      if (label) label.textContent = 'Rolling…';
      btn.disabled = true;

      try {
        if (ENDPOINT) {
          const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(data)
          });
          if (!res.ok) throw new Error(res.status);
          form.reset();
          say("That's a wrap — we'll reply within one business day.");
        } else {
          const subject = `Production brief — ${data.name || 'new enquiry'}`;
          const lines = [
            `Name: ${data.name || ''}`,
            `Company: ${data.company || ''}`,
            `Email: ${data.email || ''}`,
            `Format: ${data.format || ''}`,
            `Release by: ${data.timeline || ''}`,
            '',
            data.brief || ''
          ].join('\n');
          location.href = `mailto:${INBOX}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`;
          say('Opening your mail app with the brief attached.');
        }
      } catch (err) {
        say(`Something jammed. Email us directly at ${INBOX}.`, true);
      } finally {
        btn.disabled = false;
        if (label) label.textContent = was;
      }
    });
  })();

  /* ------------------------------------------------------------------
     11. HOUSEKEEPING
  ------------------------------------------------------------------ */
  const yr = $('#yr');
  if (yr) yr.textContent = String(new Date().getFullYear());

  // Anchor jumps land below the fixed header.
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      body.classList.remove('no-scroll');   // drawer may be holding the page
      requestAnimationFrame(() => {
        const top = t.getBoundingClientRect().top + scrollY - 74;
        scrollTo({ top, behavior: still() ? 'auto' : 'smooth' });
        history.replaceState(null, '', id);
      });
    });
  });
})();
