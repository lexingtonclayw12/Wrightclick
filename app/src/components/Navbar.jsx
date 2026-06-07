/**
 * Navbar — fixed top nav, light theme.
 * Transparent over hero → white + shadow on scroll.
 */
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const NAV_LINKS = ['Work', 'Services', 'Process', 'About', 'Contact']

export default function Navbar() {
  const navRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    gsap.fromTo(navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, delay: 0.5, ease: 'power3.out' },
    )
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400
                  ${scrolled
                    ? 'bg-white/90 backdrop-blur-xl border-b border-[#4f46e5]/08 shadow-sm py-3'
                    : 'bg-transparent py-5'
                  }`}
      style={{ opacity: 0 }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-lg bg-neon-indigo/10
                          border border-neon-indigo/30 flex items-center justify-center
                          group-hover:border-neon-indigo/55 group-hover:bg-neon-indigo/15
                          transition-all duration-300">
            <span className="font-display font-black text-[13px] text-neon-indigo tracking-tight">WC</span>
            <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-neon-cyan/70" />
          </div>
          <span className="font-display font-bold text-sm tracking-[0.12em] text-[#1e1b4b]
                           uppercase hidden sm:block">
            WrightClick
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <li key={link}>
              <a href={`#${link.toLowerCase()}`}
                 className="font-sans text-sm text-[#0f1029]/50 hover:text-[#0f1029]
                            transition-colors duration-200 relative group">
                {link}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-neon-indigo
                                 group-hover:w-full transition-all duration-300" />
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center">
          <a href="#contact"
             className="relative overflow-hidden px-5 py-2 rounded-lg text-sm font-medium
                        bg-neon-indigo/10 border border-neon-indigo/35 text-neon-indigo
                        hover:bg-neon-indigo hover:text-white hover:border-neon-indigo
                        transition-all duration-250 group">
            Start Project
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-[#4f46e5]/06
                     transition-colors duration-200"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-px bg-[#0f1029]/60 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
          <span className={`block w-5 h-px bg-[#0f1029]/60 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-px bg-[#0f1029]/60 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden
                       ${menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 py-4 bg-white/95 backdrop-blur-xl border-t border-[#4f46e5]/08
                        flex flex-col gap-4">
          {NAV_LINKS.map(link => (
            <a key={link} href={`#${link.toLowerCase()}`}
               className="text-sm text-[#0f1029]/60 hover:text-[#0f1029] transition-colors"
               onClick={() => setMenuOpen(false)}>
              {link}
            </a>
          ))}
          <a href="#contact"
             className="w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium
                        bg-neon-indigo text-white hover:bg-neon-indigo/90
                        transition-all duration-200 mt-1">
            Start Project
          </a>
        </div>
      </div>
    </nav>
  )
}
