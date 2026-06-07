/**
 * Terminal — fake WC_OS terminal modal with GSAP line-by-line reveal.
 * Closed via the × button or Escape key.
 */
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const LINES = [
  { type: 'sys',    text: 'WrightClick Studio — WC_OS Terminal v2.1' },
  { type: 'muted',  text: 'Last login: today at wrightclick.studio' },
  { type: 'spacer', text: '' },
  { type: 'prompt', text: 'system.status --verbose' },
  { type: 'ok',     text: '  ✓  modules loaded         [18/18]' },
  { type: 'ok',     text: '  ✓  network interface       online' },
  { type: 'ok',     text: '  ✓  deploy pipeline         armed' },
  { type: 'ok',     text: '  ✓  creative engine         active' },
  { type: 'spacer', text: '' },
  { type: 'prompt', text: 'ls clients/' },
  { type: 'out',    text: '  apex-commerce    luma-labs    noire-collective    orbit-agency' },
  { type: 'spacer', text: '' },
  { type: 'prompt', text: 'whoami' },
  { type: 'out',    text: '  wrightclick_studio — premium digital craftsmen' },
  { type: 'spacer', text: '' },
  { type: 'cursor', text: '' },
]

const COLOR = {
  sys:    'text-neon-indigo font-semibold',
  muted:  'text-[#0f1029]/35',
  prompt: 'text-[#0f1029]/80',
  ok:     'text-emerald-600',
  out:    'text-[#0f1029]/65',
  spacer: '',
  cursor: '',
}

export default function Terminal({ onClose }) {
  const overlayRef  = useRef(null)
  const windowRef   = useRef(null)
  const linesRef    = useRef([])

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Overlay + window slide in
    tl.fromTo(overlayRef.current,
      { opacity: 0 }, { opacity: 1, duration: 0.25 })
    tl.fromTo(windowRef.current,
      { y: 24, opacity: 0, scale: 0.96 },
      { y: 0,  opacity: 1, scale: 1, duration: 0.35 },
      '<0.05',
    )

    // Lines stagger in
    const validLines = linesRef.current.filter(Boolean)
    tl.fromTo(validLines,
      { x: -8, opacity: 0 },
      { x: 0,  opacity: 1, stagger: 0.055, duration: 0.2 },
      '-=0.1',
    )

    // Escape key to close
    const onKey = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      tl.kill()
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const handleClose = () => {
    gsap.to(windowRef.current,  { y: 16, opacity: 0, scale: 0.96, duration: 0.22, ease: 'power2.in' })
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, onComplete: onClose })
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: 'rgba(15,16,41,0.35)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose() }}
    >
      <div
        ref={windowRef}
        className="w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl gpu"
        style={{
          background: 'rgba(248, 249, 255, 0.96)',
          border: '1px solid rgba(79,70,229,0.18)',
          boxShadow: '0 0 0 1px rgba(79,70,229,0.06), 0 24px 80px rgba(15,16,41,0.22)',
        }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#4f46e5]/10
                        bg-white/60 backdrop-blur-sm">
          {/* Traffic lights */}
          <button onClick={handleClose}
                  className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-90 transition-all" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-auto font-mono text-[11px] text-[#0f1029]/40 tracking-wider">
            wc-core — terminal
          </span>
        </div>

        {/* Terminal body */}
        <div className="p-5 font-mono text-[13px] leading-relaxed min-h-[320px]"
             style={{ background: '#f8f9ff' }}>
          {LINES.map((line, i) => {
            if (line.type === 'spacer') {
              return <div key={i} ref={el => { linesRef.current[i] = el }} className="h-2" />
            }
            if (line.type === 'cursor') {
              return (
                <div key={i} ref={el => { linesRef.current[i] = el }}
                     className="flex items-center gap-1 text-[#0f1029]/50">
                  <span className="text-neon-indigo font-bold">root@wc-core</span>
                  <span className="text-[#0f1029]/40"> ~ %</span>
                  <span className="inline-block w-2 h-[1.1em] bg-neon-indigo/70 animate-led-pulse ml-1" />
                </div>
              )
            }
            const isPrompt = line.type === 'prompt'
            return (
              <div key={i} ref={el => { linesRef.current[i] = el }}
                   className={`flex items-start gap-1 ${COLOR[line.type]}`}>
                {isPrompt && (
                  <>
                    <span className="text-neon-indigo font-bold shrink-0">root@wc-core</span>
                    <span className="text-[#0f1029]/40 shrink-0"> ~ %</span>
                  </>
                )}
                <span className={isPrompt ? 'text-[#0f1029]' : ''}>{line.text}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
