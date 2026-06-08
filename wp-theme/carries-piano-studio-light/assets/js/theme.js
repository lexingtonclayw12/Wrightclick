/**
 * Carrie's Piano Studio — Theme JS
 * Wright Click Studio
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

	// ── Header scroll state ──────────────────────────────────────
	const header = document.getElementById('masthead');
	if (header) {
		const onScroll = () => {
			header.dataset.scroll = window.scrollY > 60 ? 'true' : 'false';
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
	}

	// ── Mobile menu ──────────────────────────────────────────────
	const menuToggle = document.querySelector('.menu-toggle');
	const mainNav    = document.querySelector('.main-navigation');
	if (menuToggle && mainNav) {
		menuToggle.addEventListener('click', () => {
			const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
			menuToggle.setAttribute('aria-expanded', String(!expanded));
			mainNav.classList.toggle('is-open', !expanded);
			document.body.style.overflow = expanded ? '' : 'hidden';
		});

		// Close on link click
		mainNav.querySelectorAll('a').forEach(link => {
			link.addEventListener('click', () => {
				menuToggle.setAttribute('aria-expanded', 'false');
				mainNav.classList.remove('is-open');
				document.body.style.overflow = '';
			});
		});
	}

	// ── Piano string canvas animation ───────────────────────────
	const canvas = document.getElementById('piano-strings-canvas');
	if (canvas) {
		const ctx = canvas.getContext('2d');
		let W, H, strings = [], animId;

		const STRING_COUNT = 88;
		const BASE_ALPHA   = 0.045;
		const GOLD         = '201,169,110';

		function resize() {
			W = canvas.width  = canvas.offsetWidth;
			H = canvas.height = canvas.offsetHeight;
			buildStrings();
		}

		function buildStrings() {
			strings = [];
			for (let i = 0; i < STRING_COUNT; i++) {
				const t = i / (STRING_COUNT - 1);
				strings.push({
					y:         (0.18 + t * 0.64) * H,
					freq:      0.4 + t * 3.2,
					phase:     Math.random() * Math.PI * 2,
					amp:       (2 + t * 6) * (W / 1440),
					speed:     0.008 + t * 0.022,
					thickness: 0.3 + (1 - t) * 0.5,
					alpha:     BASE_ALPHA + t * 0.04,
				});
			}
		}

		let pointer = { x: W / 2, y: H / 2 };

		canvas.addEventListener('mousemove', e => {
			const r = canvas.getBoundingClientRect();
			pointer.x = e.clientX - r.left;
			pointer.y = e.clientY - r.top;
		}, { passive: true });

		function draw(ts) {
			ctx.clearRect(0, 0, W, H);
			const t = ts * 0.001;

			strings.forEach(s => {
				const dy   = Math.abs(pointer.y - s.y);
				const near = Math.max(0, 1 - dy / (H * 0.22));
				const amp  = s.amp * (1 + near * 5);

				ctx.beginPath();
				ctx.moveTo(0, s.y);

				const steps = Math.ceil(W / 4);
				for (let xi = 0; xi <= steps; xi++) {
					const x    = (xi / steps) * W;
					const wave = Math.sin(x * s.freq * 0.012 + s.phase + t * s.speed) * amp;
					ctx.lineTo(x, s.y + wave);
				}

				ctx.strokeStyle = `rgba(${GOLD},${s.alpha * (1 + near * 1.8)})`;
				ctx.lineWidth   = s.thickness + near * 0.8;
				ctx.stroke();
			});

			animId = requestAnimationFrame(draw);
		}

		let ro = new ResizeObserver(resize);
		ro.observe(canvas);
		resize();
		animId = requestAnimationFrame(draw);

		// Pause when hero not visible
		const hero = document.getElementById('hero');
		if (hero) {
			new IntersectionObserver(([entry]) => {
				if (!entry.isIntersecting) {
					cancelAnimationFrame(animId);
				} else {
					animId = requestAnimationFrame(draw);
				}
			}, { threshold: 0 }).observe(hero);
		}
	}

	// ── Scroll reveal ────────────────────────────────────────────
	const revealEls = document.querySelectorAll('[data-reveal-child]');
	if (revealEls.length) {
		const io = new IntersectionObserver(
			entries => {
				entries.forEach(e => {
					if (e.isIntersecting) {
						e.target.classList.add('is-visible');
						io.unobserve(e.target);
					}
				});
			},
			{ threshold: 0.12 }
		);
		revealEls.forEach(el => io.observe(el));
	}

	// ── Piano key animation on hover ─────────────────────────────
	document.querySelectorAll('.piano-key').forEach(key => {
		key.addEventListener('click', () => {
			key.style.transform = 'scaleY(0.96)';
			setTimeout(() => { key.style.transform = ''; }, 120);
		});
	});

	// ── Testimonials drag scroll ─────────────────────────────────
	const track = document.querySelector('.testimonials-track-wrap');
	if (track) {
		let isDragging = false, startX, scrollLeft;

		track.addEventListener('mousedown', e => {
			isDragging = true;
			startX     = e.pageX - track.offsetLeft;
			scrollLeft = track.scrollLeft;
			track.style.cursor = 'grabbing';
		});
		track.addEventListener('mouseleave', () => { isDragging = false; track.style.cursor = ''; });
		track.addEventListener('mouseup',    () => { isDragging = false; track.style.cursor = ''; });
		track.addEventListener('mousemove',  e => {
			if (!isDragging) return;
			e.preventDefault();
			track.scrollLeft = scrollLeft - (e.pageX - track.offsetLeft - startX) * 1.4;
		});
	}

	// ── Contact form ─────────────────────────────────────────────
	const form       = document.getElementById('cps-contact-form');
	const submitBtn  = form?.querySelector('button[type="submit"]');
	const successMsg = form?.querySelector('.form-success');
	const errorMsg   = form?.querySelector('.form-error');

	if (form && submitBtn && typeof cpsData !== 'undefined') {
		form.addEventListener('submit', async e => {
			e.preventDefault();

			if (!form.checkValidity()) {
				form.reportValidity();
				return;
			}

			submitBtn.classList.add('is-loading');
			submitBtn.disabled = true;
			successMsg.hidden  = true;
			errorMsg.hidden    = true;

			const data = new FormData(form);
			data.append('action', 'cps_contact');
			data.append('nonce',  cpsData.nonce);

			try {
				const res = await fetch(cpsData.ajaxUrl, { method: 'POST', body: data });
				const json = await res.json();

				if (json.success) {
					successMsg.hidden = false;
					form.reset();
				} else {
					errorMsg.hidden = false;
				}
			} catch {
				errorMsg.hidden = false;
			} finally {
				submitBtn.classList.remove('is-loading');
				submitBtn.disabled = false;
			}
		});
	}

	// ── Smooth anchor scroll ─────────────────────────────────────
	document.querySelectorAll('a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', e => {
			const id = anchor.getAttribute('href').slice(1);
			const target = document.getElementById(id);
			if (!target) return;
			e.preventDefault();
			const headerH = header ? header.offsetHeight : 0;
			const top     = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
			window.scrollTo({ top, behavior: 'smooth' });
		});
	});

	// ── Animated stat counters ───────────────────────────────────
	const statNumbers = document.querySelectorAll('.stat-number');
	if (statNumbers.length) {
		const io = new IntersectionObserver(entries => {
			entries.forEach(e => {
				if (!e.isIntersecting) return;
				const el  = e.target;
				const raw = el.textContent.trim();
				const num = parseInt(raw);
				if (isNaN(num)) return;
				const suffix = raw.replace(String(num), '');
				let start = 0;
				const step = () => {
					start += Math.ceil(num / 60);
					if (start >= num) { el.textContent = num + suffix; return; }
					el.textContent = start + suffix;
					requestAnimationFrame(step);
				};
				requestAnimationFrame(step);
				io.unobserve(el);
			});
		}, { threshold: 0.5 });
		statNumbers.forEach(el => io.observe(el));
	}

});

// ── AJAX contact handler (add to wp-ajax in functions.php if needed) ──
// wp_ajax_nopriv_cps_contact handled server-side
