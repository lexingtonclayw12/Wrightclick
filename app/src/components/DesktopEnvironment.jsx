/**
 * DesktopEnvironment — the virtual OS desktop revealed after the zoom.
 *
 * Phases (driven by parent HeroScene):
 *  'hidden'   — fully invisible (parent controls opacity)
 *  'visible'  — desktop layout shown, name not yet in
 *  'text-in'  — company name animates in with chromatic aberration + glint
 *  'cursor'   — virtual cursor glides in
 *  'menu'     — right-click context menu opens
 */
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import VirtualCursor from './VirtualCursor'
import ContextMenu   from './ContextMenu'

/* ─── Desktop icons ──────────────────────────────────────── */
const ICONS = [
  { emoji: '⚡', label: 'system.init' },
  { emoji: '{}', label: 'core.deploy' },
  { emoji: '◈',  label: 'terminal' },
  { emoji: '≡',  label: 'archive' },
]

/* ─── Clock (static snapshot) ───────────────────────────── */
function Clock() {
  const now = new Date()
  return (
    <span className="font-mono text-xs text-white/50 tabular-nums">
      {String(now.getHours()).padStart(2,'0')}:{String(now.getMinutes()).padStart(2,'0')}
    </span>
  )
}

/* ─── Status bar (macOS-style menu bar) ─────────────────── */
function StatusBar() {
  return (
    <div className="absolute top-0 left-0 right-0 h-7 z-10 flex items-center px-4
                    bg-black/30 backdrop-blur-sm border-b border-white/[0.04]">
      {/* Left */}
      <div className="flex items-center gap-5">
        <span className="font-display text-[11px] font-bold text-neon-indigo tracking-widest">WC</span>
        {['File', 'View', 'System', 'Network'].map(m => (
          <span key={m} className="font-sans text-[11px] text-white/50 hover:text-white/80 cursor-default">
            {m}
          </span>
        ))}
      </div>
      {/* Right */}
      <div className="ml-auto flex items-center gap-4">
        {/* Signal bars */}
        <svg width="16" height="12" viewBox="0 0 16 12" className="opacity-50">
          {[2,5,8,11,14].map((x, i) => (
            <rect key={i} x={x} y={12 - (i+1)*2.2} width="2" height={(i+1)*2.2}
                  rx="0.5" fill={i > 2 ? '#6366f1' : 'white'} opacity={i > 2 ? '0.4' : '0.8'} />
          ))}
        </svg>
        {/* Battery */}
        <svg width="22" height="12" viewBox="0 0 22 12" className="opacity-50">
          <rect x="0.5" y="1.5" width="18" height="9" rx="2.5" fill="none" stroke="white" strokeWidth="1" />
          <rect x="19" y="4" width="2.5" height="4" rx="1" fill="white" />
          <rect x="1.5" y="2.5" width="14" height="7" rx="1.5" fill="white" />
        </svg>
        <Clock />
      </div>
    </div>
  )
}

/* ─── Desktop icon grid (bottom right) ──────────────────── */
function DesktopIcons({ visible }) {
  return (
    <div
      className={`absolute bottom-16 right-6 flex flex-col gap-4 z-10
                  transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {ICONS.map(ic => (
        <div key={ic.label} className="desktop-icon">
          <div className="desktop-icon-box">{ic.emoji}</div>
          <span className="desktop-icon-label">{ic.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Dock (bottom center) ───────────────────────────────── */
function Dock({ visible }) {
  const DOCK_APPS = ['⚡','{}','◈','▲','≡','◻']
  return (
    <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-10
                     transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="dock-bar flex items-end gap-2 px-4 py-2 rounded-2xl">
        {DOCK_APPS.map((app, i) => (
          <button
            key={i}
            className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08]
                       flex items-center justify-center text-base hover:bg-white/10
                       hover:scale-110 transition-all duration-150 font-mono"
          >
            {app}
          </button>
        ))}
        <div className="w-px h-8 bg-white/10 mx-1 self-center" />
        <button className="w-10 h-10 rounded-xl bg-neon-indigo/20 border border-neon-indigo/30
                           flex items-center justify-center text-xs font-bold text-neon-indigo
                           hover:bg-neon-indigo/30 transition-all duration-150">
          +
        </button>
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────── */
export default function DesktopEnvironment({ phase }) {
  const nameWrapRef  = useRef(null)  // container animated by GSAP
  const nameTextRef  = useRef(null)  // main white text
  const caRedRef     = useRef(null)  // red channel layer
  const caBlueRef    = useRef(null)  // blue channel layer
  const glintBarRef  = useRef(null)  // glint sweep bar
  const cursorRef    = useRef(null)  // VirtualCursor imperative handle
  const [menuState, setMenuState] = useState({ visible: false, position: { x: 0, y: 0 } })

  const uiVisible = phase !== 'hidden'

  /* ── Phase 3: company name animation ──────────────────── */
  useEffect(() => {
    if (phase !== 'text-in') return
    const wrap  = nameWrapRef.current
    const main  = nameTextRef.current
    const red   = caRedRef.current
    const blue  = caBlueRef.current
    const glint = glintBarRef.current
    if (!wrap || !main || !red || !blue || !glint) return

    // Set chromatic layers before the timeline starts to avoid flicker
    gsap.set(red,  { x:  10, opacity: 0.72 })
    gsap.set(blue, { x: -10, opacity: 0.72 })

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

    // Name scales in from a large scale — chromatic layers run in parallel
    tl.fromTo(
      wrap,
      { scale: 3.2, opacity: 0 },
      { scale: 1,   opacity: 1, duration: 1.3 },
    )

    // Chromatic aberration: offset converges to 0, then layers fade out
    tl.to([red, blue], { x: 0, opacity: 0, duration: 1.6, ease: 'power3.out' }, '<')

    // Glint sweep across text (starts after name settles)
    tl.fromTo(
      glint,
      { x: '-120%' },
      { x: '480%', duration: 0.72, ease: 'power2.inOut' },
      '+=0.15',
    )
  }, [phase])

  const handleRightClick  = () => {}
  const handleMenuReady   = (pos) => {
    setMenuState({ visible: true, position: pos })
  }

  return (
    <div className="relative w-full h-full bg-screen overflow-hidden scanlines gpu">

      {/* Fine grid wallpaper */}
      <div className="absolute inset-0 grid-bg opacity-70" />

      {/* Radial vignette */}
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* Subtle corner glow accents */}
      <div className="absolute top-0 left-0 w-64 h-64 pointer-events-none"
           style={{ background: 'radial-gradient(circle at top left, rgba(99,102,241,0.08), transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none"
           style={{ background: 'radial-gradient(circle at bottom right, rgba(6,182,212,0.06), transparent 70%)' }} />

      {/* Animated scanline sweep */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="animate-scanline absolute left-0 right-0 h-32 pointer-events-none"
             style={{ background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.025), transparent)' }} />
      </div>

      {/* Status Bar */}
      <StatusBar />

      {/* Desktop Icons */}
      <DesktopIcons visible={uiVisible} />

      {/* ── COMPANY NAME (centre stage) ──────────────── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        {/* opacity:0 — GSAP animates this in during phase 'text-in' */}
        <div ref={nameWrapRef} className="flex flex-col items-center gap-3" style={{ opacity: 0 }}>
          {/* Chromatic aberration layers + main text */}
          <div className="company-name-wrap">
            {/* Red channel — opacity:0 until GSAP sets it before animation */}
            <div ref={caRedRef} className="ca-layer ca-red" aria-hidden style={{ opacity: 0 }}>
              <span className="font-display font-black text-[clamp(2.8rem,7.5vw,7rem)] tracking-[0.18em] uppercase select-none">
                WRIGHTCLICK
              </span>
            </div>
            {/* Blue channel — opacity:0 until GSAP sets it before animation */}
            <div ref={caBlueRef} className="ca-layer ca-blue" aria-hidden style={{ opacity: 0 }}>
              <span className="font-display font-black text-[clamp(2.8rem,7.5vw,7rem)] tracking-[0.18em] uppercase select-none">
                WRIGHTCLICK
              </span>
            </div>
            {/* Main text */}
            <span
              ref={nameTextRef}
              className="relative font-display font-black text-[clamp(2.8rem,7.5vw,7rem)]
                         tracking-[0.18em] uppercase text-white leading-none select-none"
              style={{
                textShadow: '0 0 60px rgba(99,102,241,0.4), 0 0 120px rgba(99,102,241,0.15)',
              }}
            >
              WRIGHTCLICK
              {/* Glint sweep overlay */}
              <span className="glint-sweep" aria-hidden>
                <span ref={glintBarRef} className="glint-bar" />
              </span>
            </span>
          </div>

          {/* Tagline */}
          <p className="font-mono text-[clamp(0.6rem,1.2vw,0.85rem)] tracking-[0.5em]
                        text-neon-indigo/60 uppercase mt-1">
            Premium Digital Studio
          </p>

          {/* Decorative horizontal rule */}
          <div className="flex items-center gap-3 mt-2">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-neon-indigo/40" />
            <div className="w-2 h-2 rounded-full bg-neon-cyan/60 animate-led-pulse" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-neon-cyan/40" />
          </div>
        </div>
      </div>

      {/* Virtual cursor */}
      {(phase === 'cursor' || phase === 'menu') && (
        <VirtualCursor
          ref={cursorRef}
          targetRef={nameTextRef}
          onRightClick={handleRightClick}
          onMenuReady={handleMenuReady}
        />
      )}

      {/* Context menu */}
      <ContextMenu
        visible={menuState.visible}
        position={menuState.position}
      />

      {/* Dock */}
      <Dock visible={uiVisible} />
    </div>
  )
}
