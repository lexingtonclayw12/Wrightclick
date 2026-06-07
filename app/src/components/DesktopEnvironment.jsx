/**
 * DesktopEnvironment — light-themed virtual OS desktop.
 *
 * Phases:
 *  'hidden'   — invisible (parent controls opacity)
 *  'visible'  — desktop layout shown
 *  'text-in'  — company name animates in with chromatic aberration + glint
 *  'cursor'   — virtual cursor glides in
 *  'menu'     — context menu cascades open
 *  'settled'  — cursor + menu fade out, page rests
 */
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import VirtualCursor from './VirtualCursor'
import ContextMenu   from './ContextMenu'

const ICONS = [
  { emoji: '⚡', label: 'system.init' },
  { emoji: '{}', label: 'core.deploy' },
  { emoji: '◈',  label: 'terminal'    },
  { emoji: '≡',  label: 'archive'     },
]

function Clock() {
  const now = new Date()
  return (
    <span className="font-mono text-xs text-[#4b5280]/70 tabular-nums">
      {String(now.getHours()).padStart(2,'0')}:{String(now.getMinutes()).padStart(2,'0')}
    </span>
  )
}

function StatusBar() {
  return (
    <div className="absolute top-0 left-0 right-0 h-7 z-10 flex items-center px-4
                    bg-white/50 backdrop-blur-sm border-b border-[#4f46e5]/08">
      <div className="flex items-center gap-5">
        <span className="font-display text-[11px] font-bold text-neon-indigo tracking-widest">WC</span>
        {['File', 'View', 'System', 'Network'].map(m => (
          <span key={m} className="font-sans text-[11px] text-[#0f1029]/50 hover:text-[#0f1029]/80 cursor-default">
            {m}
          </span>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-4">
        <svg width="16" height="12" viewBox="0 0 16 12" className="opacity-40">
          {[2,5,8,11,14].map((x, i) => (
            <rect key={i} x={x} y={12-(i+1)*2.2} width="2" height={(i+1)*2.2}
                  rx="0.5" fill={i > 2 ? '#4f46e5' : '#0f1029'} opacity={i > 2 ? '0.5' : '0.7'} />
          ))}
        </svg>
        <svg width="22" height="12" viewBox="0 0 22 12" className="opacity-40">
          <rect x="0.5" y="1.5" width="18" height="9" rx="2.5" fill="none" stroke="#0f1029" strokeWidth="1" />
          <rect x="19" y="4" width="2.5" height="4" rx="1" fill="#0f1029" />
          <rect x="1.5" y="2.5" width="14" height="7" rx="1.5" fill="#0f1029" />
        </svg>
        <Clock />
      </div>
    </div>
  )
}

function DesktopIcons({ visible }) {
  return (
    <div className={`absolute bottom-16 right-6 flex flex-col gap-4 z-10 transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {ICONS.map(ic => (
        <div key={ic.label} className="desktop-icon">
          <div className="desktop-icon-box">{ic.emoji}</div>
          <span className="desktop-icon-label">{ic.label}</span>
        </div>
      ))}
    </div>
  )
}

function Dock({ visible }) {
  const DOCK_APPS = ['⚡','{}','◈','▲','≡','◻']
  return (
    <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="dock-bar flex items-end gap-2 px-4 py-2 rounded-2xl">
        {DOCK_APPS.map((app, i) => (
          <button key={i}
            className="w-10 h-10 rounded-xl bg-white/60 border border-[#4f46e5]/15
                       flex items-center justify-center text-base
                       hover:bg-white/90 hover:scale-110 transition-all duration-150 font-mono text-[#0f1029]/70">
            {app}
          </button>
        ))}
        <div className="w-px h-8 bg-[#4f46e5]/15 mx-1 self-center" />
        <button className="w-10 h-10 rounded-xl bg-neon-indigo/10 border border-neon-indigo/25
                           flex items-center justify-center text-xs font-bold text-neon-indigo
                           hover:bg-neon-indigo/20 transition-all duration-150">+</button>
      </div>
    </div>
  )
}

export default function DesktopEnvironment({ phase }) {
  const nameWrapRef = useRef(null)
  const nameTextRef = useRef(null)
  const caRedRef    = useRef(null)
  const caBlueRef   = useRef(null)
  const glintBarRef = useRef(null)
  const cursorRef   = useRef(null)
  const [menuState, setMenuState] = useState({ visible: false, position: { x: 0, y: 0 } })

  const uiVisible = phase !== 'hidden'

  /* ── Phase: company name in ──────────────────────────── */
  useEffect(() => {
    if (phase !== 'text-in') return
    const wrap  = nameWrapRef.current
    const red   = caRedRef.current
    const blue  = caBlueRef.current
    const glint = glintBarRef.current
    if (!wrap || !red || !blue || !glint) return

    gsap.set(red,  { x:  10, opacity: 0.65 })
    gsap.set(blue, { x: -10, opacity: 0.65 })

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.fromTo(wrap, { scale: 3.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.3 })
    tl.to([red, blue], { x: 0, opacity: 0, duration: 1.5, ease: 'power3.out' }, '<')
    tl.fromTo(glint, { x: '-120%' }, { x: '480%', duration: 0.7, ease: 'power2.inOut' }, '+=0.1')
  }, [phase])

  /* ── Phase: settled — fade out cursor + menu ────────── */
  useEffect(() => {
    if (phase !== 'settled') return
    setMenuState(s => ({ ...s, visible: false }))
  }, [phase])

  const handleMenuReady = (pos) => setMenuState({ visible: true, position: pos })

  return (
    <div className="relative w-full h-full bg-screen overflow-hidden scanlines gpu">

      {/* Grid wallpaper */}
      <div className="absolute inset-0 grid-bg opacity-80" />

      {/* Radial vignette */}
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* Corner accent glows */}
      <div className="absolute top-0 left-0 w-72 h-72 pointer-events-none"
           style={{ background: 'radial-gradient(circle at top left, rgba(79,70,229,0.07), transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-72 h-72 pointer-events-none"
           style={{ background: 'radial-gradient(circle at bottom right, rgba(8,145,178,0.06), transparent 70%)' }} />

      {/* Scanline sweep */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="animate-scanline absolute left-0 right-0 h-28 pointer-events-none"
             style={{ background: 'linear-gradient(to bottom, transparent, rgba(79,70,229,0.015), transparent)' }} />
      </div>

      <StatusBar />
      <DesktopIcons visible={uiVisible} />

      {/* ── COMPANY NAME ─────────────────────────────── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        <div ref={nameWrapRef} className="flex flex-col items-center gap-3" style={{ opacity: 0 }}>

          <div className="company-name-wrap">
            {/* Red channel */}
            <div ref={caRedRef} className="ca-layer ca-red" aria-hidden style={{ opacity: 0 }}>
              <span className="font-display font-black text-[clamp(2.4rem,6.5vw,6rem)] tracking-[0.12em] uppercase select-none">
                WRIGHTCLICK
              </span>
            </div>
            {/* Blue channel */}
            <div ref={caBlueRef} className="ca-layer ca-blue" aria-hidden style={{ opacity: 0 }}>
              <span className="font-display font-black text-[clamp(2.4rem,6.5vw,6rem)] tracking-[0.12em] uppercase select-none">
                WRIGHTCLICK
              </span>
            </div>
            {/* Main text — dark indigo on light bg */}
            <span
              ref={nameTextRef}
              className="relative font-display font-black text-[clamp(2.4rem,6.5vw,6rem)]
                         tracking-[0.12em] uppercase leading-none select-none text-[#1e1b4b]"
              style={{ textShadow: '0 0 40px rgba(79,70,229,0.25), 0 2px 0 rgba(79,70,229,0.08)' }}
            >
              WRIGHTCLICK
              <span className="glint-sweep" aria-hidden>
                <span ref={glintBarRef} className="glint-bar" />
              </span>
            </span>
          </div>

          {/* Tagline */}
          <p className="font-mono text-[clamp(0.55rem,1.1vw,0.8rem)] tracking-[0.45em]
                        text-neon-indigo/55 uppercase mt-1">
            Premium Digital Studio
          </p>

          {/* Decorative rule */}
          <div className="flex items-center gap-3 mt-1">
            <div className="w-14 h-px bg-gradient-to-r from-transparent to-neon-indigo/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan/70 animate-led-pulse" />
            <div className="w-14 h-px bg-gradient-to-l from-transparent to-neon-cyan/30" />
          </div>
        </div>
      </div>

      {/* Virtual cursor */}
      {(phase === 'cursor' || phase === 'menu' || phase === 'settled') && (
        <VirtualCursor
          ref={cursorRef}
          targetRef={nameTextRef}
          phase={phase}
          onMenuReady={handleMenuReady}
        />
      )}

      {/* Context menu */}
      <ContextMenu visible={menuState.visible} position={menuState.position} />

      <Dock visible={uiVisible} />
    </div>
  )
}
