import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SERVICES = [
  {
    icon: '◈',
    title: 'Web Experiences',
    desc: 'Performant, pixel-perfect sites with cinematic motion and sub-100ms interactions. Built to win awards and ship revenue.',
    color: '#4f46e5',
    tags: ['React', 'Next.js', 'GSAP'],
  },
  {
    icon: '{}',
    title: 'Brand Identity',
    desc: 'Logos, type systems, and motion identities that command premium positioning in competitive markets.',
    color: '#7c3aed',
    tags: ['Figma', 'Motion', 'System'],
  },
  {
    icon: '▲',
    title: 'Motion & Interaction',
    desc: 'GSAP, WebGL, and CSS choreography that makes users feel something — micro-interactions to full-page transitions.',
    color: '#0891b2',
    tags: ['GSAP', 'Three.js', 'CSS'],
  },
  {
    icon: '≡',
    title: 'CMS & Platforms',
    desc: 'Headless architectures with Sanity, Contentful, or Shopify — editorial workflows built to scale without engineering.',
    color: '#4f46e5',
    tags: ['Sanity', 'Shopify', 'Vercel'],
  },
  {
    icon: '⚡',
    title: 'Performance Eng.',
    desc: 'Lighthouse 100 audits, Core Web Vitals tuning, edge caching, and bundle optimization — fast by default.',
    color: '#0891b2',
    tags: ['Vitals', 'Edge', 'Audit'],
  },
  {
    icon: '◻',
    title: 'Digital Strategy',
    desc: 'Conversion-focused architecture, content strategy, and UX decisions grounded in your commercial objectives.',
    color: '#7c3aed',
    tags: ['UX', 'Conversion', 'CRO'],
  },
]

export default function Services() {
  const sectionRef = useRef(null)
  const headRef    = useRef(null)
  const itemsRef   = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headRef.current,
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: headRef.current, start: 'top 85%' } }
      )
      itemsRef.current.filter(Boolean).forEach((el, i) => {
        gsap.fromTo(el,
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: (i % 3) * 0.07,
            scrollTrigger: { trigger: el, start: 'top 90%' } }
        )
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="services" ref={sectionRef}
             className="py-28 px-6"
             style={{ background: 'linear-gradient(180deg, #eef0f8 0%, #e8eaf5 100%)' }}>
      <div className="max-w-7xl mx-auto">

        <div ref={headRef} className="mb-16 flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex-1">
            <span className="font-mono text-[11px] tracking-[0.35em] text-neon-indigo/70 uppercase">
              Services
            </span>
            <h2 className="font-display font-black text-[clamp(2rem,4vw,3.5rem)] text-[#1e1b4b]
                           tracking-tight mt-3 leading-none uppercase">
              The full stack<br />of premium
            </h2>
          </div>
          <p className="md:max-w-xs font-sans text-[14px] text-[#0f1029]/50 leading-relaxed md:mb-1">
            Every engagement is end-to-end. Strategy, design, engineering — one team, zero handoffs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((s, i) => (
            <div
              key={s.title}
              ref={el => { itemsRef.current[i] = el }}
              className="group p-6 rounded-2xl bg-white/60 backdrop-blur-sm
                         border border-[#4f46e5]/10 hover:border-[#4f46e5]/22
                         hover:bg-white/80 transition-all duration-300 cursor-default"
              style={{ boxShadow: '0 2px 16px rgba(15,16,41,0.04)' }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5
                              transition-transform duration-300 group-hover:scale-110"
                   style={{ background: s.color + '12', border: `1px solid ${s.color}28` }}>
                <span className="font-mono text-lg" style={{ color: s.color }}>{s.icon}</span>
              </div>

              <h3 className="font-display font-bold text-[15px] text-[#1e1b4b] tracking-tight mb-2">
                {s.title}
              </h3>
              <p className="font-sans text-[13px] text-[#0f1029]/50 leading-relaxed mb-5">{s.desc}</p>

              <div className="flex flex-wrap gap-1.5">
                {s.tags.map(tag => (
                  <span key={tag}
                        className="font-mono text-[10px] px-2 py-0.5 rounded border"
                        style={{ color: s.color + 'aa', borderColor: s.color + '28', background: s.color + '08' }}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-1 font-mono text-[11px] opacity-0
                              group-hover:opacity-100 transition-opacity duration-300"
                   style={{ color: s.color + 'cc' }}>
                <span>Explore</span>
                <span>›</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-14 p-6 rounded-2xl bg-white/50 border border-[#4f46e5]/10
                        flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-display font-bold text-[15px] text-[#1e1b4b]">
              Need something custom?
            </p>
            <p className="font-sans text-[13px] text-[#0f1029]/45 mt-0.5">
              We scope bespoke engagements for complex requirements.
            </p>
          </div>
          <a href="#contact"
             className="shrink-0 px-6 py-2.5 rounded-xl font-sans text-sm font-medium
                        bg-neon-indigo text-white hover:bg-[#4338ca]
                        transition-all duration-200">
            Discuss your project
          </a>
        </div>
      </div>
    </section>
  )
}
