/**
 * HeroScene — Master GSAP timeline orchestrator.
 *
 * Animation sequence:
 *  Phase 1  (0–3s)    : Monitor fades/rotates in, neon lines glow, chassis sways
 *  Phase 2  (3–4.3s)  : Cinematic zoom — monitor scales to 55×, desktop fades in
 *  Phase 3  (4.3–6.8s): Company name scales in with chromatic aberration + glint
 *  Interact (6.8–8.5s): Virtual cursor glides, right-click ripple, context menu
 *
 * All animated properties use transform/opacity for GPU compositing.
 * Easings: power3.out for entrances, expo.in for the zoom, expo.out for the name.
 */
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import ComputerMonitor    from './ComputerMonitor'
import DesktopEnvironment from './DesktopEnvironment'

export default function HeroScene() {
  const monitorWrapRef = useRef(null)  // the div we scale for the zoom
  const desktopRef     = useRef(null)  // desktop overlay
  const glowRef        = useRef(null)  // ambient glow blob behind monitor
  const [desktopPhase, setDesktopPhase] = useState('hidden')

  useEffect(() => {
    const monitor = monitorWrapRef.current
    const desktop = desktopRef.current
    const glow    = glowRef.current
    if (!monitor || !desktop || !glow) return

    // Lock scroll during intro
    document.body.style.overflow = 'hidden'

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete() {
        document.body.style.overflow = ''
      },
    })

    // ── Initial hidden state ─────────────────────────────
    gsap.set(monitor, { scale: 0.6, opacity: 0, rotateY: -18, z: 0 })
    gsap.set(desktop, { opacity: 0 })
    gsap.set(glow,    { opacity: 0, scale: 0.7 })

    // ─────────────────────────────────────────────────────
    // PHASE 1 — Monitor reveal & sway  (0 → ~3s)
    // ─────────────────────────────────────────────────────
    tl.addLabel('phase1', 0)

    // Monitor fades in with 3D entry
    tl.to(monitor, {
      scale: 1, opacity: 1, rotateY: 0,
      duration: 1.4,
    }, 'phase1')

    // Ambient glow bloom
    tl.to(glow, {
      opacity: 1, scale: 1,
      duration: 1.2,
    }, 'phase1+=0.3')

    // Chassis sway — tilt left, right, settle
    tl.to(monitor, { rotateY: 6,  rotateX: -1.5, duration: 0.65, ease: 'power2.inOut' }, 'phase1+=1.6')
    tl.to(monitor, { rotateY: -4, rotateX:  1,   duration: 0.55, ease: 'power2.inOut' })
    tl.to(monitor, { rotateY: 0,  rotateX:  0,   duration: 0.4,  ease: 'power2.out'  })

    // ─────────────────────────────────────────────────────
    // PHASE 2 — Cinematic zoom through bezel  (~3s → ~4.3s)
    // ─────────────────────────────────────────────────────
    tl.addLabel('phase2', 'phase1+=3.0')

    // Scale the monitor up massively — screen fills viewport
    tl.to(monitor, {
      scale: 55,
      duration: 1.1,
      ease: 'expo.in',
    }, 'phase2')

    // Desktop fades in mid-zoom (just as the screen "fills" the view)
    tl.call(() => setDesktopPhase('visible'), null, 'phase2+=0.6')
    tl.to(desktop, {
      opacity: 1,
      duration: 0.3,
    }, 'phase2+=0.62')

    // Hide monitor (it's been eaten by the zoom)
    tl.to(monitor, {
      opacity: 0,
      duration: 0.18,
    }, 'phase2+=0.88')

    // Kill ambient glow
    tl.to(glow, { opacity: 0, duration: 0.2 }, 'phase2+=0.75')

    // ─────────────────────────────────────────────────────
    // PHASE 3 — Company name  (~4.3s → ~6.8s)
    // ─────────────────────────────────────────────────────
    tl.addLabel('phase3', 'phase2+=1.2')
    tl.call(() => setDesktopPhase('text-in'), null, 'phase3')

    // ─────────────────────────────────────────────────────
    // MICRO-INTERACTION — cursor + context menu  (~6.8s → ~8.5s)
    // ─────────────────────────────────────────────────────
    tl.addLabel('interact', 'phase3+=2.5')
    tl.call(() => setDesktopPhase('cursor'), null, 'interact')
    tl.call(() => setDesktopPhase('menu'),   null, 'interact+=2.0')

    return () => {
      tl.kill()
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <section className="relative flex items-center justify-center w-full h-screen overflow-hidden bg-screen">

      {/* Fine grid background */}
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      {/* Outer vignette */}
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* Ambient glow behind monitor */}
      <div
        ref={glowRef}
        className="absolute pointer-events-none gpu"
        style={{
          width:  '680px',
          height: '560px',
          background: `
            radial-gradient(ellipse at 50% 44%,
              rgba(99,102,241,0.10) 0%,
              rgba(6,182,212,0.05) 40%,
              transparent 68%
            )
          `,
          filter: 'blur(50px)',
          willChange: 'opacity, transform',
        }}
      />

      {/* ── PHASE 1-2: Computer Monitor ─────────────── */}
      <div
        ref={monitorWrapRef}
        className="absolute z-10 gpu"
        style={{
          perspective:      '1800px',
          perspectiveOrigin: '50% 50%',
          transformStyle:   'preserve-3d',
          willChange:       'transform, opacity',
        }}
      >
        <ComputerMonitor />
      </div>

      {/* ── PHASE 2+: Desktop Environment ───────────── */}
      <div
        ref={desktopRef}
        className="absolute inset-0 z-20 gpu"
        style={{ willChange: 'opacity' }}
      >
        <DesktopEnvironment phase={desktopPhase} />
      </div>

    </section>
  )
}
