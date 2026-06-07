import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: '40+', label: 'Projects Shipped',  color: '#4f46e5' },
  { value: '98%', label: 'Client Retention',  color: '#0891b2' },
  { value: '5',   label: 'Years Building',    color: '#7c3aed' },
  { value: '12',  label: 'Awards Won',        color: '#4f46e5' },
]

const VALUES = [
  {
    icon: '◈',
    title: 'Premium by Default',
    desc: 'We don\'t do minimum viable. Every detail is considered, every interaction earns its place in the experience.',
  },
  {
    icon: '⚡',
    title: 'Velocity + Quality',
    desc: 'Fast without cutting corners. We\'ve built systems that let us ship premium work at startup speed.',
  },
  {
    icon: '{}',
    title: 'Code as Craft',
    desc: 'Clean component APIs, zero-warning CI, and codebases the next engineer will thank you for.',
  },
]

export default function About() {
  const sectionRef = useRef(null)
  const headRef    = useRef(null)
  const bioRef     = useRef(null)
  const statsRef   = useRef([])
  const valuesRef  = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headRef.current,
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: headRef.current, start: 'top 85%' } }
      )
      gsap.fromTo(bioRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: bioRef.current, start: 'top 87%' } }
      )
      statsRef.current.filter(Boolean).forEach((el, i) => {
        gsap.fromTo(el,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: i * 0.07,
            scrollTrigger: { trigger: el, start: 'top 90%' } }
        )
      })
      valuesRef.current.filter(Boolean).forEach((el, i) => {
        gsap.fromTo(el,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: i * 0.1,
            scrollTrigger: { trigger: el, start: 'top 90%' } }
        )
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={sectionRef}
             className="py-28 px-6"
             style={{ background: 'linear-gradient(180deg, #e8eaf5 0%, #eef0f8 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left: story */}
          <div>
            <div ref={headRef}>
              <span className="font-mono text-[11px] tracking-[0.35em] text-neon-indigo/70 uppercase">
                About
              </span>
              <h2 className="font-display font-black text-[clamp(2rem,4vw,3.5rem)] text-[#1e1b4b]
                             tracking-tight mt-3 leading-none uppercase">
                We build what<br />others pitch
              </h2>
            </div>

            <div ref={bioRef} className="mt-8 space-y-4">
              <p className="font-sans text-[15px] text-[#0f1029]/65 leading-relaxed">
                WrightClick is a boutique digital studio for brands that want to win on quality, not volume. We're a small, senior team — no juniors, no offshore, no account managers between you and your work.
              </p>
              <p className="font-sans text-[14px] text-[#0f1029]/50 leading-relaxed">
                Every project is led end-to-end by the same engineers and designers who scoped it. That's how we hit deadlines, hold quality, and keep 98% of our clients coming back for more.
              </p>

              <div className="pt-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-neon-indigo/10 border border-neon-indigo/25
                                flex items-center justify-center">
                  <span className="font-display font-black text-xs text-neon-indigo">WC</span>
                </div>
                <div>
                  <div className="font-sans text-[13px] font-semibold text-[#1e1b4b]">WrightClick Studio</div>
                  <div className="font-mono text-[11px] text-[#0f1029]/40">Est. 2019 · Remote-first</div>
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4">
              {STATS.map((s, i) => (
                <div key={s.label} ref={el => { statsRef.current[i] = el }}
                     className="p-5 rounded-2xl bg-white/60 border border-[#4f46e5]/10
                                hover:border-[#4f46e5]/20 transition-all duration-300"
                     style={{ boxShadow: '0 2px 12px rgba(15,16,41,0.04)' }}>
                  <div className="font-display font-black text-3xl leading-none"
                       style={{ color: s.color }}>
                    {s.value}
                  </div>
                  <div className="font-mono text-[11px] text-[#0f1029]/45 mt-1.5 tracking-wide">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: values */}
          <div className="flex flex-col gap-4 lg:pt-16">
            {VALUES.map((v, i) => (
              <div key={v.title} ref={el => { valuesRef.current[i] = el }}
                   className="p-6 rounded-2xl bg-white/60 border border-[#4f46e5]/10
                              hover:border-[#4f46e5]/22 transition-all duration-300"
                   style={{ boxShadow: '0 2px 12px rgba(15,16,41,0.04)' }}>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-neon-indigo/10 border border-neon-indigo/20
                                  flex items-center justify-center shrink-0 mt-0.5">
                    <span className="font-mono text-neon-indigo text-sm">{v.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-[14px] text-[#1e1b4b] tracking-tight mb-1.5">
                      {v.title}
                    </h4>
                    <p className="font-sans text-[13px] text-[#0f1029]/50 leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Client trust strip */}
            <div className="p-5 rounded-xl bg-white/40 border border-[#4f46e5]/08 overflow-hidden">
              <div className="font-mono text-[10px] text-[#0f1029]/30 mb-3 tracking-[0.2em] uppercase">
                Trusted by
              </div>
              <div className="flex gap-6 overflow-hidden">
                {['Apex Commerce', 'Luma Labs', 'Noire Collective', 'Orbit Agency'].map((c, i) => (
                  <span key={i}
                        className="shrink-0 font-sans text-[12px] text-[#0f1029]/40 font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
