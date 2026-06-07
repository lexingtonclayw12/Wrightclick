import { useEffect, useRef } from 'react'

const PATH_D =
  'M 0 24 C 60 10 120 38 180 24 C 240 10 300 38 360 24 ' +
  'C 420 10 480 38 540 24 C 600 10 660 38 720 24 L 800 24'

const FUSE_DELAY    = 0.6   // seconds before fuse starts burning
const FUSE_DURATION = 4.0   // seconds for full burn

export default function BurningFuse() {
  const ropeRef  = useRef(null)
  const trailRef = useRef(null)
  const smokeRef = useRef(null)

  useEffect(() => {
    const rope  = ropeRef.current
    const trail = trailRef.current
    const smoke = smokeRef.current
    if (!rope || !trail || !smoke) return

    const len = rope.getTotalLength()

    // Initialise dashed state before animating
    trail.style.strokeDasharray  = len
    trail.style.strokeDashoffset = len
    smoke.style.strokeDasharray  = len
    smoke.style.strokeDashoffset = len

    const id = setTimeout(() => {
      const t = `stroke-dashoffset ${FUSE_DURATION}s linear`
      trail.style.transition    = t
      smoke.style.transition    = t
      trail.style.strokeDashoffset = 0
      smoke.style.strokeDashoffset = 0
    }, FUSE_DELAY * 1000)

    return () => clearTimeout(id)
  }, [])

  const beginAttr = `${FUSE_DELAY}s`
  const durAttr   = `${FUSE_DURATION}s`

  return (
    <div className="fuse-wrap">
      <svg
        className="fuse-svg"
        viewBox="0 0 800 48"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id="ember-halo" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="spark-blur" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Rope (unburned) */}
        <path
          id="fuse-rope"
          ref={ropeRef}
          d={PATH_D}
          stroke="#7a5c20"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />

        {/* Charred trail */}
        <path
          ref={trailRef}
          d={PATH_D}
          stroke="#1a0800"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Smoke haze above trail */}
        <path
          ref={smokeRef}
          d={PATH_D}
          stroke="rgba(80,55,35,0.18)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          filter="url(#spark-blur)"
        />

        {/* Outer ember glow */}
        <circle r="8" fill="rgba(255,100,0,0.35)" filter="url(#spark-blur)">
          <animateMotion
            dur={durAttr}
            begin={beginAttr}
            fill="freeze"
            calcMode="linear"
          >
            <mpath href="#fuse-rope" />
          </animateMotion>
        </circle>

        {/* Core ember dot */}
        <circle r="5" fill="#FF8C00" filter="url(#ember-halo)">
          <animateMotion
            dur={durAttr}
            begin={beginAttr}
            fill="freeze"
            calcMode="linear"
          >
            <mpath href="#fuse-rope" />
          </animateMotion>
        </circle>

        {/* Bright hot centre */}
        <circle r="2.5" fill="#FFE066">
          <animateMotion
            dur={durAttr}
            begin={beginAttr}
            fill="freeze"
            calcMode="linear"
          >
            <mpath href="#fuse-rope" />
          </animateMotion>
        </circle>
      </svg>
    </div>
  )
}
