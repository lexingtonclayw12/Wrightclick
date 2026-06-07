/**
 * VirtualCursor — dark cursor that glides near (not over) the company name,
 * fires a right-click ripple, opens the context menu, then fades itself out.
 */
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { gsap } from 'gsap'

const VirtualCursor = forwardRef(function VirtualCursor(
  { targetRef, onMenuReady },
  ref,
) {
  const cursorRef     = useRef(null)
  const ring1Ref      = useRef(null)
  const ring2Ref      = useRef(null)
  const ring3Ref      = useRef(null)
  const rippleWrapRef = useRef(null)

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

    // Aim slightly right of center so menu appears beside — not over — the title
    const destX = tRect.left + tRect.width  * 0.58
    const destY = tRect.top  + tRect.height * 0.5

    const startX = window.innerWidth  * 0.80
    const startY = window.innerHeight * 0.72

    const pos = { x: startX, y: startY }

    gsap.set(cursorRef.current,   { x: startX, y: startY, opacity: 0 })
    gsap.set(rippleWrapRef.current, { opacity: 0 })

    const tl = gsap.timeline()

    // Fade in
    tl.to(cursorRef.current, { opacity: 1, duration: 0.25, ease: 'power2.out' })

    // Glide to target
    tl.to(pos, {
      x: destX, y: destY,
      duration: 1.1, ease: 'power2.inOut',
      onUpdate() { gsap.set(cursorRef.current, { x: pos.x, y: pos.y }) },
    })

    // Hover jitter
    tl.to(pos, {
      x: destX + 3, y: destY + 2, duration: 0.12, ease: 'power1.inOut',
      onUpdate() { gsap.set(cursorRef.current, { x: pos.x, y: pos.y }) },
    })
    tl.to(pos, {
      x: destX + 1, y: destY + 1, duration: 0.08, ease: 'power1.out',
      onUpdate() { gsap.set(cursorRef.current, { x: pos.x, y: pos.y }) },
    })

    // Click press
    tl.to(cursorRef.current, { scale: 0.88, duration: 0.08, ease: 'power1.in' })
    tl.to(cursorRef.current, { scale: 1,    duration: 0.10, ease: 'power1.out' })

    // Ripple
    tl.call(() => {
      gsap.set(rippleWrapRef.current, { opacity: 1, x: pos.x, y: pos.y })
      ;[ring1Ref.current, ring2Ref.current, ring3Ref.current].forEach((r, i) => {
        gsap.fromTo(r,
          { scale: 1, opacity: 0.85 },
          { scale: 6, opacity: 0, duration: 0.72, delay: i * 0.12, ease: 'power2.out' },
        )
      })
      onMenuReady?.({ x: pos.x, y: pos.y })
    })

    // Cursor fades out 3 s after menu appears — clean exit
    tl.to(cursorRef.current, {
      opacity: 0, duration: 0.45, ease: 'power2.in',
    }, '+=3.0')
    tl.to(rippleWrapRef.current, { opacity: 0, duration: 0.2 }, '<')

    return () => tl.kill()
  }, [targetRef, onMenuReady])

  return (
    <>
      {/* Dark SVG cursor */}
      <svg
        ref={cursorRef}
        className="absolute z-50 pointer-events-none gpu"
        style={{ top: 0, left: 0, transform: 'translate(-2px, -2px)' }}
        width="26" height="28" viewBox="0 0 26 28"
      >
        {/* Shadow */}
        <path d="M3 1L22 12L14.5 14.5L11 23L3 1Z"
              fill="rgba(15,16,41,0.25)" transform="translate(1.5,1.5)" />
        {/* Body — dark indigo-slate */}
        <path d="M3 1L22 12L14.5 14.5L11 23L3 1Z"
              fill="rgba(30, 27, 75, 0.88)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.5"
              strokeLinejoin="round" />
        {/* Right-click indicator */}
        <circle cx="19" cy="5" r="2.5" fill="#4f46e5" opacity="0.9" />
      </svg>

      {/* Ripple rings */}
      <div
        ref={rippleWrapRef}
        className="absolute z-40 pointer-events-none gpu"
        style={{ top: 0, left: 0 }}
      >
        {[ring1Ref, ring2Ref, ring3Ref].map((r, i) => (
          <div key={i} ref={r}
            className="absolute rounded-full border border-neon-indigo/60"
            style={{ width: '20px', height: '20px', transform: 'translate(-50%,-50%)', willChange: 'transform,opacity' }}
          />
        ))}
      </div>
    </>
  )
})

export default VirtualCursor
