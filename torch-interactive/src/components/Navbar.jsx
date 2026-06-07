import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <a href="#" className="nav-logo">
        <span className="nav-logo-flame">🔥</span>
        TORCH INTERACTIVE
      </a>

      <ul className="nav-links">
        <li><a href="#games">Games</a></li>
        <li><a href="#studio">Studio</a></li>
        <li><a href="#careers">Careers</a></li>
        <li><a href="#press">Press</a></li>
      </ul>

      <a href="#contact" className="nav-cta">Contact Us</a>
    </nav>
  )
}
