/**
 * ContextMenu — Translucent premium dark-mode context menu.
 * Cascades in with GSAP stagger when `visible` becomes true.
 * Position is set from the cursor's right-click coordinates.
 */
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const MENU_ITEMS = [
  {
    icon: '⚡',
    label: 'Initialize System',
    sub:   'boot sequence',
    color: '#6366f1',
  },
  {
    icon: '</>',
    label: 'View Source',
    sub:   'inspect code',
    color: '#06b6d4',
    divider: true,
  },
  {
    icon: '▲',
    label: 'Deploy Core',
    sub:   'launch sequence',
    color: '#a855f7',
  },
  {
    icon: '_',
    label: 'Access Terminal',
    sub:   'cli interface',
    color: '#06b6d4',
    divider: true,
  },
  {
    icon: '×',
    label: 'Exit Protocol',
    sub:   'shutdown',
    color: '#f43f5e',
  },
]

export default function ContextMenu({ visible, position }) {
  const menuRef  = useRef(null)
  const itemsRef = useRef([])

  useEffect(() => {
    if (!visible || !menuRef.current) return

    itemsRef.current = itemsRef.current.filter(Boolean)

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Menu container pops in from cursor origin
    tl.fromTo(
      menuRef.current,
      { scale: 0.82, opacity: 0, y: -8, transformOrigin: 'top left' },
      { scale: 1,    opacity: 1, y: 0,  duration: 0.38 },
    )

    // Items stagger in from left
    tl.fromTo(
      itemsRef.current,
      { x: -14, opacity: 0 },
      { x: 0,   opacity: 1, stagger: 0.055, duration: 0.28 },
      '-=0.15',
    )

    return () => tl.kill()
  }, [visible])

  if (!visible) return null

  // Clamp menu position so it stays inside the viewport
  const menuW = 258
  const menuH = 260
  const clampedX = Math.min(position.x + 18, window.innerWidth  - menuW - 16)
  const clampedY = Math.min(position.y + 10, window.innerHeight - menuH - 16)

  return (
    <div
      ref={menuRef}
      className="ctx-menu absolute z-50 rounded-xl overflow-hidden gpu"
      style={{
        left:   clampedX,
        top:    clampedY,
        width:  `${menuW}px`,
        willChange: 'transform, opacity',
      }}
    >
      {/* Header bar */}
      <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.2em] text-neon-indigo/80 uppercase">
          system.context[]
        </span>
        <span className="font-mono text-[10px] text-white/20">v2.1</span>
      </div>

      {/* Menu items */}
      {MENU_ITEMS.map((item, i) => (
        <div key={item.label}>
          {item.divider && (
            <div className="mx-4 border-t border-white/[0.05]" />
          )}
          <div
            ref={el => { itemsRef.current[i] = el }}
            className="ctx-item flex items-center gap-3 px-4 py-2.5 cursor-pointer group"
          >
            {/* Icon */}
            <span
              className="font-mono text-[13px] w-6 text-center shrink-0 transition-colors duration-150"
              style={{ color: `${item.color}99` }}
            >
              {item.icon}
            </span>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-white/85 font-medium leading-tight group-hover:text-white transition-colors duration-150 truncate">
                {item.label}
              </div>
              <div className="font-mono text-[10px] text-white/30 leading-tight mt-0.5 truncate">
                {item.sub}
              </div>
            </div>

            {/* Arrow */}
            <span className="text-white/20 group-hover:text-neon-indigo/70 text-xs transition-colors duration-150 shrink-0">
              ›
            </span>
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/[0.05]">
        <span className="font-mono text-[10px] text-white/18">WC_OS build.2024</span>
      </div>
    </div>
  )
}
