/**
 * VirtualCursor — GSAP-driven cursor that glides to the company name,
 * fires a right-click ripple, then signals the parent to open the context menu.
 *
 * All position updates are direct DOM mutations (no React state) for
 * hardware-accelerated, jank-free animation.
 */
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { gsap } from 'gsap'

const VirtualCursor = forwardRef(function VirtualCursor(
  { targetRef, onRightClick, onMenuReady },
  ref,
) {
  const cursorRef   = useRef(null)
  const ring1Ref    = useRef(null)
  const ring2Ref    = useRef(null)
  const ring3Ref    = useRef(null)
  const rippleWrapRef = useRef(null)

  // Expose a position snapshot for the context menu
  useImperativeHandle(ref, () => ({
    getPosition() {
      const el = cursorRef.current
      if (!el) return { x: 0, y: 0 }
      const { left, top } = el.getBoundingClientRect()
      return { x: left, y: top }
    },
  }))

  useEffect(() => {
    if (!targetRef?.current || !cursorRef.current) return

    const tRect = targetRef.current.getBoundingClientRect()
    // Aim for center of the company name text
    const destX = tRect.left + tRect.width  * 0.5
    const destY = tRect.top  + tRect.height * 0.5

    // Cursor starts bottom-right of viewport
    const startX = window.innerWidth  * 0.78
    const startY = window.innerHeight * 0.72

    const cursor = cursorRef.current
    const pos    = { x: startX, y: startY }

    // Initialise position & make visible
    gsap.set(cursor,         { x: startX, y: startY, opacity: 0 })
    gsap.set(rippleWrapRef.current, { opacity: 0 })

    const tl = gsap.timeline()

    // Fade in cursor
    tl.to(cursor, { opacity: 1, duration: 0.25, ease: 'power2.out' })

    // Glide to target
    tl.to(pos, {
      x: destX,
      y: destY,
      duration: 1.1,
      ease: 'power2.inOut',
      onUpdate() {
        gsap.set(cursor, { x: pos.x, y: pos.y })
      },
    })

    // Micro hover jitter
    tl.to(pos, {
      x: destX + 4,
      y: destY + 2,
      duration: 0.12,
      ease: 'power1.inOut',
      onUpdate() {
        gsap.set(cursor, { x: pos.x, y: pos.y })
      },
    })
    tl.to(pos, {
      x: destX + 2,
      y: destY + 1,
      duration: 0.08,
      ease: 'power1.out',
      onUpdate() {
        gsap.set(cursor, { x: pos.x, y: pos.y })
      },
    })

    // Right-click: cursor scales down briefly (click feel)
    tl.to(cursor, { scale: 0.85, duration: 0.08, ease: 'power1.in' })
    tl.to(cursor, { scale: 1,    duration: 0.12, ease: 'power1.out' })

    // Trigger ripple
    tl.call(() => {
      gsap.set(rippleWrapRef.current, {
        opacity: 1,
        x: pos.x,
        y: pos.y,
      })
      const rings = [ring1Ref.current, ring2Ref.current, ring3Ref.current]
      rings.forEach((r, i) => {
        gsap.fromTo(r,
          { scale: 1, opacity: 0.9 },
          { scale: 6, opacity: 0, duration: 0.75, delay: i * 0.13, ease: 'power2.out' },
        )
      })
      onRightClick?.({ x: pos.x, y: pos.y })
    })

    // Signal parent to open context menu
    tl.call(() => onMenuReady?.({ x: pos.x, y: pos.y }), null, '+=0.22')

    return () => tl.kill()
  }, [targetRef, onRightClick, onMenuReady])

  return (
    <>
      {/* SVG arrow cursor */}
      <svg
        ref={cursorRef}
        className="absolute z-50 pointer-events-none gpu"
        style={{ top: 0, left: 0, transform: 'translate(-2px, -2px)' }}
        width="26"
        height="28"
        viewBox="0 0 26 28"
      >
        {/* Cursor shadow */}
        <path d="M3 1L22 12L14.5 14.5L11 23L3 1Z"
              fill="rgba(0,0,0,0.5)" transform="translate(1,1)" />
        {/* Cursor body */}
        <path d="M3 1L22 12L14.5 14.5L11 23L3 1Z"
              fill="rgba(255,255,255,0.92)"
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="0.5"
              strokeLinejoin="round" />
        {/* Cursor right-click indicator dot */}
        <circle cx="19" cy="5" r="2.5" fill="#6366f1" opacity="0.9" />
      </svg>

      {/* Radial ripple rings */}
      <div
        ref={rippleWrapRef}
        className="absolute z-40 pointer-events-none gpu"
        style={{ top: 0, left: 0 }}
      >
        {[ring1Ref, ring2Ref, ring3Ref].map((r, i) => (
          <div
            key={i}
            ref={r}
            className="absolute rounded-full border border-neon-indigo/70"
            style={{
              width:  '20px',
              height: '20px',
              transform: 'translate(-50%, -50%)',
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>
    </>
  )
})

export default VirtualCursor
