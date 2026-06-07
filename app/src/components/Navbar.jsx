/**
 * Navbar — Fixed top navigation.
 * Transitions from fully transparent to a blurred dark strip on scroll.
 */
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const NAV_LINKS = ['Work', 'Services', 'Process', 'About', 'Contact']

export default function Navbar() {
  const navRef     = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Fade nav in after a short delay (lets the hero animation start)
  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, delay: 0.5, ease: 'power3.out' },
    )
  }, [])

  // Scroll-based style swap
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
                  ${scrolled
                    ? 'bg-black/60 backdrop-blur-xl border-b border-white/[0.05] py-3'
                    : 'bg-transparent py-5'
                  }`}
      style={{ opacity: 0 }}   // GSAP animates this in
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          {/* Monogram mark */}
          <div className="relative w-9 h-9 rounded-lg bg-neon-indigo/15
                          border border-neon-indigo/35 flex items-center justify-center
                          group-hover:border-neon-indigo/60 transition-colors duration-300">
            <span className="font-display font-black text-[13px] text-neon-indigo tracking-tight">
              WC
            </span>
            {/* Corner neon dots */}
            <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-neon-cyan/60" />
          </div>
          <span className="font-display font-bold text-sm tracking-[0.15em] text-white/90
                           uppercase hidden sm:block">
            WrightClick
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase()}`}
                className="font-sans text-sm text-white/50 hover:text-white
                           transition-colors duration-200 relative group"
              >
                {link}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-neon-indigo
                                 group-hover:w-full transition-all duration-300" />
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="#contact"
            className="relative overflow-hidden px-5 py-2 rounded-lg text-sm font-medium
                       bg-neon-indigo/15 border border-neon-indigo/40 text-white/85
                       hover:bg-neon-indigo/25 hover:border-neon-indigo/70 hover:text-white
                       transition-all duration-250 group"
          >
            <span className="relative z-10">Start Project</span>
            {/* Hover glow */}
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.15), transparent 70%)' }} />
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/5
                     transition-colors duration-200"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-px bg-white/70 transition-all duration-300
                            ${menuOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
          <span className={`block w-5 h-px bg-white/70 transition-all duration-300
                            ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-px bg-white/70 transition-all duration-300
                            ${menuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden
                       ${menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 py-4 bg-black/80 backdrop-blur-xl border-t border-white/[0.05]
                        flex flex-col gap-4">
          {NAV_LINKS.map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm text-white/60 hover:text-white transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link}
            </a>
          ))}
          <a href="#contact"
             className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium
                        bg-neon-indigo/20 border border-neon-indigo/40 text-white/85
                        hover:bg-neon-indigo/30 transition-all duration-200 mt-1">
            Start Project
          </a>
        </div>
      </div>
    </nav>
  )
}
