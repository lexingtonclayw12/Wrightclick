import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PROJECT_TYPES = ['New Website', 'Redesign', 'Web App', 'Brand Identity', 'Motion Design', 'Other']

const INPUT_CLS = `w-full px-4 py-2.5 rounded-xl text-[13px] font-sans
  bg-white/80 border border-[#4f46e5]/14 text-[#0f1029]
  placeholder:text-[#0f1029]/30 outline-none
  focus:border-neon-indigo/40 focus:ring-2 focus:ring-neon-indigo/08
  transition-all duration-200`

export default function Contact() {
  const sectionRef = useRef(null)
  const headRef    = useRef(null)
  const formRef    = useRef(null)
  const [form, setForm] = useState({ name: '', email: '', type: '', message: '' })
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headRef.current,
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: headRef.current, start: 'top 85%' } }
      )
      gsap.fromTo(formRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out',
          scrollTrigger: { trigger: formRef.current, start: 'top 85%' } }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      setSent(true)
    }, 800)
  }

  const field = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <section id="contact" ref={sectionRef} className="py-28 px-6 bg-[#eef0f8]">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.65fr] gap-16">

          {/* Left */}
          <div ref={headRef}>
            <span className="font-mono text-[11px] tracking-[0.35em] text-neon-indigo/70 uppercase">
              Contact
            </span>
            <h2 className="font-display font-black text-[clamp(2rem,4vw,3.5rem)] text-[#1e1b4b]
                           tracking-tight mt-3 leading-none uppercase">
              Let's build<br />something<br />exceptional
            </h2>
            <p className="font-sans text-[14px] text-[#0f1029]/50 mt-5 leading-relaxed max-w-xs">
              Tell us about your project. We review every submission and respond within one business day.
            </p>

            <div className="mt-10 flex flex-col gap-3">
              {[
                { icon: '@', label: 'hello@wrightclick.studio' },
                { icon: '◈', label: 'Available for new projects' },
                { icon: '⚡', label: 'Response within 24h' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neon-indigo/10 border border-neon-indigo/20
                                  flex items-center justify-center shrink-0">
                    <span className="font-mono text-neon-indigo text-sm">{item.icon}</span>
                  </div>
                  <span className="font-mono text-[12px] text-[#0f1029]/55">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Status indicator */}
            <div className="mt-8 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl
                            bg-emerald-50 border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-led-pulse" />
              <span className="font-mono text-[11px] text-emerald-600">Open for projects — Q3 2025</span>
            </div>
          </div>

          {/* Right: form */}
          <div ref={formRef}>
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-5 p-12
                              rounded-2xl bg-white/60 border border-neon-indigo/20"
                   style={{ boxShadow: '0 4px 32px rgba(15,16,41,0.06)', minHeight: '420px' }}>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200
                                flex items-center justify-center">
                  <span className="text-emerald-500 text-xl">✓</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-[#1e1b4b] tracking-tight">
                    Message received
                  </h3>
                  <p className="font-sans text-[13px] text-[#0f1029]/50 max-w-xs mt-2 leading-relaxed">
                    We'll review your project brief and be in touch within one business day.
                  </p>
                </div>
                <button onClick={() => { setSent(false); setForm({ name:'', email:'', type:'', message:'' }) }}
                        className="font-mono text-[12px] text-neon-indigo/70 hover:text-neon-indigo transition-colors">
                  ← Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}
                    className="p-8 rounded-2xl bg-white/70 backdrop-blur-sm border border-[#4f46e5]/12
                               flex flex-col gap-5"
                    style={{ boxShadow: '0 4px 32px rgba(15,16,41,0.06)' }}>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[11px] text-[#0f1029]/45 tracking-[0.15em] uppercase">
                      Name
                    </label>
                    <input required type="text" placeholder="Your name"
                           value={form.name} onChange={field('name')}
                           className={INPUT_CLS} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[11px] text-[#0f1029]/45 tracking-[0.15em] uppercase">
                      Email
                    </label>
                    <input required type="email" placeholder="you@company.com"
                           value={form.email} onChange={field('email')}
                           className={INPUT_CLS} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[11px] text-[#0f1029]/45 tracking-[0.15em] uppercase">
                    Project Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PROJECT_TYPES.map(t => (
                      <button key={t} type="button"
                              onClick={() => setForm(f => ({ ...f, type: t }))}
                              className={`px-3.5 py-1.5 rounded-lg font-mono text-[11px] border
                                          transition-all duration-200 ${
                                form.type === t
                                  ? 'bg-neon-indigo text-white border-neon-indigo'
                                  : 'bg-white/70 border-[#4f46e5]/18 text-[#0f1029]/55 hover:border-neon-indigo/35 hover:text-[#0f1029]/75'
                              }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] text-[#0f1029]/45 tracking-[0.15em] uppercase">
                    Project Brief
                  </label>
                  <textarea rows={4} placeholder="Tell us about your project, timeline, and goals..."
                            value={form.message} onChange={field('message')}
                            className={`${INPUT_CLS} resize-none`} />
                </div>

                <button type="submit" disabled={busy}
                        className="w-full py-3 rounded-xl font-display font-bold text-[13px]
                                   tracking-wider uppercase bg-neon-indigo text-white
                                   hover:bg-[#4338ca] active:scale-[0.99]
                                   disabled:opacity-70 disabled:cursor-not-allowed
                                   transition-all duration-200 flex items-center justify-center gap-2">
                  {busy ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white
                                       animate-spin" />
                      Sending…
                    </>
                  ) : 'Send Brief ›'}
                </button>

                <p className="text-center font-mono text-[10px] text-[#0f1029]/30">
                  No spam. No sales calls. Just a direct conversation.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
