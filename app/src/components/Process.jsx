import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    num: '01',
    title: 'Discover',
    sub: 'Deep dive',
    desc: 'Stakeholder interviews, competitor audits, and user journey mapping. We uncover where your brand has leverage before writing a single line.',
    dur: '1–2 wks',
    color: '#4f46e5',
    deliverables: ['Brief & goals', 'Audit report', 'Success metrics'],
  },
  {
    num: '02',
    title: 'Strategy',
    sub: 'Blueprint',
    desc: 'Information architecture, content strategy, and a technical spec that gives every subsequent decision a clear north star.',
    dur: '1 wk',
    color: '#7c3aed',
    deliverables: ['IA diagram', 'Tech stack', 'Content plan'],
  },
  {
    num: '03',
    title: 'Design',
    sub: 'Prototype',
    desc: 'High-fidelity Figma prototypes with motion specs, design tokens, and fully interactive states — before a line of code is written.',
    dur: '2–3 wks',
    color: '#0891b2',
    deliverables: ['Design system', 'Prototype', 'Motion spec'],
  },
  {
    num: '04',
    title: 'Build',
    sub: 'Engineering',
    desc: 'Component-driven development with daily preview URLs, automated CI pipelines, and Lighthouse performance gates at every PR.',
    dur: '3–6 wks',
    color: '#4f46e5',
    deliverables: ['Weekly builds', 'QA sessions', 'Staging env'],
  },
  {
    num: '05',
    title: 'Launch',
    sub: 'Deployment',
    desc: 'Zero-downtime deploy, full performance validation, analytics wiring, and 30-day hyper-care support post-launch.',
    dur: '1 wk',
    color: '#0891b2',
    deliverables: ['Live deploy', 'Analytics', '30-day care'],
  },
]

export default function Process() {
  const sectionRef = useRef(null)
  const headRef    = useRef(null)
  const stepsRef   = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headRef.current,
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: headRef.current, start: 'top 85%' } }
      )
      stepsRef.current.filter(Boolean).forEach((el, i) => {
        gsap.fromTo(el,
          { x: -28, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.65, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%' } }
        )
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="process" ref={sectionRef} className="py-28 px-6 bg-[#eef0f8]">
      <div className="max-w-5xl mx-auto">

        <div ref={headRef} className="mb-16 text-center">
          <span className="font-mono text-[11px] tracking-[0.35em] text-neon-indigo/70 uppercase">
            Process
          </span>
          <h2 className="font-display font-black text-[clamp(2rem,4vw,3.5rem)] text-[#1e1b4b]
                         tracking-tight mt-3 leading-none uppercase">
            No guesswork.<br />Just craft.
          </h2>
          <p className="font-sans text-[#0f1029]/50 mt-4 max-w-md mx-auto text-[14px] leading-relaxed">
            A proven five-phase engagement model refined across 40+ premium digital builds.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              ref={el => { stepsRef.current[i] = el }}
              className="group relative flex gap-5 p-6 rounded-2xl
                         bg-white/60 backdrop-blur-sm border border-[#4f46e5]/10
                         hover:border-[#4f46e5]/22 hover:bg-white/75
                         transition-all duration-300"
              style={{ boxShadow: '0 2px 16px rgba(15,16,41,0.04)' }}
            >
              {/* Step number badge */}
              <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center self-start
                              transition-transform duration-300 group-hover:scale-105"
                   style={{ background: step.color + '10', border: `1.5px solid ${step.color}2a` }}>
                <span className="font-display font-black text-sm" style={{ color: step.color }}>
                  {step.num}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase"
                          style={{ color: step.color + 'aa' }}>
                      {step.sub}
                    </span>
                    <h3 className="font-display font-bold text-xl text-[#1e1b4b] tracking-tight leading-tight">
                      {step.title}
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] text-[#0f1029]/35 shrink-0
                                   border border-[#4f46e5]/12 px-2.5 py-1 rounded-lg bg-white/60">
                    {step.dur}
                  </span>
                </div>

                <p className="font-sans text-[13px] text-[#0f1029]/55 leading-relaxed mb-4">
                  {step.desc}
                </p>

                <div className="flex flex-wrap gap-2">
                  {step.deliverables.map(d => (
                    <span key={d}
                          className="flex items-center gap-1.5 font-mono text-[10px] text-[#0f1029]/45">
                      <span style={{ color: step.color + 'bb' }}>✓</span>
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vertical connector (not on last) */}
              {i < STEPS.length - 1 && (
                <div className="absolute left-[44px] -bottom-4 w-px h-4 hidden sm:block"
                     style={{ background: `linear-gradient(to bottom, ${step.color}30, transparent)` }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
