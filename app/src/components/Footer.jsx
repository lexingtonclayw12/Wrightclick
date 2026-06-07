const LINKS = {
  Work:    ['Apex Commerce', 'Luma Labs', 'Noire Collective', 'Orbit Agency'],
  Services:['Web Experiences', 'Brand Identity', 'Motion Design', 'Performance Eng.'],
  Company: ['About', 'Process', 'Contact', 'GitHub'],
}

const SOCIAL = ['GH', 'TW', 'LI']

export default function Footer() {
  return (
    <footer className="py-16 px-6 border-t border-[#4f46e5]/08"
            style={{ background: '#e8eaf5' }}>
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-9 h-9 rounded-lg bg-neon-indigo/10 border border-neon-indigo/30
                              flex items-center justify-center">
                <span className="font-display font-black text-[13px] text-neon-indigo tracking-tight">WC</span>
                <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-neon-cyan/70" />
              </div>
              <span className="font-display font-bold text-sm tracking-[0.12em] text-[#1e1b4b] uppercase">
                WrightClick
              </span>
            </div>

            <p className="font-sans text-[13px] text-[#0f1029]/45 leading-relaxed max-w-[200px] mb-6">
              Premium digital studio for brands that build to last.
            </p>

            <div className="flex gap-2.5">
              {SOCIAL.map(s => (
                <div key={s}
                     className="w-8 h-8 rounded-lg bg-white/60 border border-[#4f46e5]/14
                                flex items-center justify-center font-mono text-[10px] text-[#0f1029]/45
                                hover:border-neon-indigo/35 hover:text-neon-indigo
                                cursor-pointer transition-all duration-200">
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <div className="font-mono text-[10px] tracking-[0.25em] text-neon-indigo/60 uppercase mb-4">
                {heading}
              </div>
              <ul className="flex flex-col gap-2.5">
                {items.map(item => (
                  <li key={item}>
                    <a href="#"
                       className="font-sans text-[13px] text-[#0f1029]/50 hover:text-[#0f1029]/80
                                  transition-colors duration-200">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#4f46e5]/08
                        flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[11px] text-[#0f1029]/35">
            © {new Date().getFullYear()} WrightClick Studio. All rights reserved.
          </span>

          <div className="flex items-center gap-5">
            {['Privacy', 'Terms', 'Cookies'].map(l => (
              <a key={l} href="#"
                 className="font-mono text-[11px] text-[#0f1029]/30 hover:text-[#0f1029]/55
                            transition-colors duration-200">
                {l}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-led-pulse" />
            <span className="font-mono text-[10px] text-[#0f1029]/35">Systems nominal</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
