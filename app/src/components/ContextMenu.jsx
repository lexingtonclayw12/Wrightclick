/**
 * ContextMenu — light glassmorphism premium context menu.
 * Auto-dismisses 3.5 s after appearing.
 */
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const MENU_ITEMS = [
  { icon: '⚡',  label: 'Initialize System', sub: 'boot sequence',   color: '#4f46e5' },
  { icon: '</>',  label: 'View Source',       sub: 'inspect code',    color: '#0891b2', divider: true },
  { icon: '▲',   label: 'Deploy Core',        sub: 'launch sequence', color: '#7c3aed' },
  { icon: '_',   label: 'Access Terminal',    sub: 'cli interface',   color: '#0891b2', divider: true },
  { icon: '×',   label: 'Exit Protocol',      sub: 'shutdown',        color: '#e11d48' },
]

export default function ContextMenu({ visible, position }) {
  const menuRef  = useRef(null)
  const itemsRef = useRef([])

  useEffect(() => {
    if (!visible || !menuRef.current) return

    itemsRef.current = itemsRef.current.filter(Boolean)

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Cascade in
    tl.fromTo(menuRef.current,
      { scale: 0.84, opacity: 0, y: -8, transformOrigin: 'top left' },
      { scale: 1,    opacity: 1, y: 0,  duration: 0.36 },
    )
    tl.fromTo(itemsRef.current,
      { x: -12, opacity: 0 },
      { x: 0,   opacity: 1, stagger: 0.05, duration: 0.26 },
      '-=0.12',
    )

    // Auto-dismiss after 3.5 s
    tl.to(menuRef.current, {
      opacity: 0, y: -6, scale: 0.95,
      duration: 0.4, ease: 'power2.in',
    }, '+=3.5')

    return () => tl.kill()
  }, [visible])

  if (!visible) return null

  // Position menu below-right of cursor, clamped to viewport
  const menuW = 256
  const menuH = 254
  const x = Math.min(position.x + 16, window.innerWidth  - menuW - 16)
  const y = Math.min(position.y + 14, window.innerHeight - menuH - 16)

  return (
    <div
      ref={menuRef}
      className="ctx-menu absolute z-50 rounded-xl overflow-hidden gpu"
      style={{ left: x, top: y, width: `${menuW}px`, willChange: 'transform,opacity' }}
    >
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[#4f46e5]/10 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.2em] text-neon-indigo/75 uppercase">
          system.context[]
        </span>
        <span className="font-mono text-[10px] text-[#0f1029]/30">v2.1</span>
      </div>

      {MENU_ITEMS.map((item, i) => (
        <div key={item.label}>
          {item.divider && <div className="mx-4 border-t border-[#4f46e5]/08" />}
          <div ref={el => { itemsRef.current[i] = el }}
               className="ctx-item flex items-center gap-3 px-4 py-2.5 cursor-pointer group">
            <span className="font-mono text-[13px] w-6 text-center shrink-0 transition-colors duration-150"
                  style={{ color: `${item.color}99` }}>
              {item.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-[#0f1029]/80 font-medium leading-tight
                              group-hover:text-[#0f1029] transition-colors duration-150 truncate">
                {item.label}
              </div>
              <div className="font-mono text-[10px] text-[#0f1029]/35 leading-tight mt-0.5 truncate">
                {item.sub}
              </div>
            </div>
            <span className="text-[#0f1029]/25 group-hover:text-neon-indigo/60
                             text-xs transition-colors duration-150 shrink-0">›</span>
          </div>
        </div>
      ))}

      <div className="px-4 py-2 border-t border-[#4f46e5]/08">
        <span className="font-mono text-[10px] text-[#0f1029]/25">WC_OS build.2024</span>
      </div>
    </div>
  )
}
