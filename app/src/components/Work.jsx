import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PROJECTS = [
  {
    id: 'apex',
    name: 'Apex Commerce',
    category: 'E-Commerce Platform',
    year: '2024',
    initials: 'AC',
    desc: 'End-to-end commerce rebuild with sub-100ms TTFB, custom PDP animations, and a 34% conversion lift.',
    tags: ['React', 'Next.js', 'GSAP', 'Shopify'],
    color: '#4f46e5',
    result: '+34% CVR',
  },
  {
    id: 'luma',
    name: 'Luma Labs',
    category: 'SaaS Dashboard',
    year: '2024',
    initials: 'LL',
    desc: 'Data-dense analytics platform with real-time charts, micro-interactions, and adaptive dark/light modes.',
    tags: ['React', 'D3.js', 'TypeScript', 'Figma'],
    color: '#0891b2',
    result: '100 Lighthouse',
  },
  {
    id: 'noire',
    name: 'Noire Collective',
    category: 'Brand Identity & Web',
    year: '2023',
    initials: 'NC',
    desc: 'Complete brand system — wordmark, motion identity, and a cinematic web experience with WebGL transitions.',
    tags: ['WebGL', 'Three.js', 'Branding', 'Motion'],
    color: '#7c3aed',
    result: '2× Site Award',
  },
  {
    id: 'orbit',
    name: 'Orbit Agency',
    category: 'Marketing Site',
    year: '2023',
    initials: 'OA',
    desc: 'Award-winning marketing site with scroll-driven storytelling, 3D elements, and a 98 Lighthouse score.',
    tags: ['Astro', 'GSAP', 'ScrollTrigger', 'Vercel'],
    color: '#4f46e5',
    result: '3× Nominee',
  },
]

export default function Work() {
  const sectionRef = useRef(null)
  const headRef    = useRef(null)
  const cardsRef   = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headRef.current,
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: headRef.current, start: 'top 85%' } }
      )
      cardsRef.current.filter(Boolean).forEach((card, i) => {
        gsap.fromTo(card,
          { y: 48, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: i * 0.08,
            scrollTrigger: { trigger: card, start: 'top 88%' } }
        )
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="work" ref={sectionRef} className="py-28 px-6 bg-[#eef0f8]">
      <div className="max-w-7xl mx-auto">

        <div ref={headRef} className="mb-16 flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex-1">
            <span className="font-mono text-[11px] tracking-[0.35em] text-neon-indigo/70 uppercase">
              Selected Work
            </span>
            <h2 className="font-display font-black text-[clamp(2rem,4vw,3.5rem)] text-[#1e1b4b]
                           tracking-tight mt-3 leading-none uppercase">
              Craft that<br />converts
            </h2>
          </div>
          <p className="md:max-w-xs font-sans text-[14px] text-[#0f1029]/50 leading-relaxed md:mb-1">
            Premium digital experiences built for brands that refuse to blend in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROJECTS.map((p, i) => (
            <div
              key={p.id}
              ref={el => { cardsRef.current[i] = el }}
              className="group relative rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm
                         border border-[#4f46e5]/10 hover:border-[#4f46e5]/25
                         transition-all duration-400 cursor-pointer"
              style={{ boxShadow: '0 4px 24px rgba(15,16,41,0.06)' }}
            >
              {/* Thumbnail */}
              <div className="h-52 relative overflow-hidden"
                   style={{ background: `linear-gradient(135deg, ${p.color}12, ${p.color}06)` }}>
                <div className="absolute inset-0 grid-bg opacity-50" />

                <div className="absolute top-4 left-4 font-mono text-[11px] tracking-[0.2em] uppercase"
                     style={{ color: p.color + 'aa' }}>
                  {String(i + 1).padStart(2, '0')} / {PROJECTS.length.toString().padStart(2, '0')}
                </div>
                <div className="absolute top-4 right-4 font-mono text-[11px] px-2.5 py-1 rounded-lg border"
                     style={{ color: p.color, borderColor: p.color + '33', background: p.color + '0d' }}>
                  {p.result}
                </div>
                <div className="absolute bottom-4 right-4 font-mono text-[11px] text-[#0f1029]/30">
                  {p.year}
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl border flex items-center justify-center
                                  transition-all duration-300 group-hover:scale-110"
                       style={{ borderColor: p.color + '40', background: p.color + '0d' }}>
                    <span className="font-display font-black text-lg" style={{ color: p.color }}>
                      {p.initials}
                    </span>
                  </div>
                </div>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                     style={{ background: `linear-gradient(135deg, ${p.color}16, transparent)` }} />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase"
                          style={{ color: p.color + 'bb' }}>
                      {p.category}
                    </span>
                    <h3 className="font-display font-bold text-xl text-[#1e1b4b] mt-1 tracking-tight">
                      {p.name}
                    </h3>
                  </div>
                  <span className="text-[#0f1029]/25 group-hover:text-neon-indigo/60 text-lg mt-1
                                   transition-all duration-300 group-hover:translate-x-1 inline-block">›</span>
                </div>
                <p className="font-sans text-[13px] text-[#0f1029]/55 leading-relaxed mb-4">{p.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map(tag => (
                    <span key={tag}
                          className="font-mono text-[10px] px-2.5 py-1 rounded-lg border
                                     text-[#0f1029]/45 bg-white/60 border-[#4f46e5]/12">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <a href="#contact"
             className="font-sans text-sm font-medium px-6 py-3 rounded-xl
                        bg-white/70 border border-[#4f46e5]/20 text-[#0f1029]/60
                        hover:border-neon-indigo/40 hover:text-neon-indigo
                        transition-all duration-250">
            Start your project ›
          </a>
        </div>
      </div>
    </section>
  )
}
