const LINKS = [
  { label: 'Privacy',  href: '#' },
  { label: 'Legal',    href: '#' },
  { label: 'Careers',  href: '#' },
  { label: 'Press',    href: '#' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo">
        <span style={{ filter: 'drop-shadow(0 0 6px rgba(255,100,0,.6))' }}>🔥</span>
        TORCH INTERACTIVE
      </div>

      <p className="footer-tagline">
        Setting games on fire since 2022
      </p>

      <ul className="footer-links">
        {LINKS.map(l => (
          <li key={l.label}>
            <a href={l.href}>{l.label}</a>
          </li>
        ))}
      </ul>

      <p className="footer-tagline" style={{ color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} Torch Interactive LLC
      </p>
    </footer>
  )
}
