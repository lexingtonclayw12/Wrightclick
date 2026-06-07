import TorchFlame from './TorchFlame'
import BurningFuse from './BurningFuse'

// Fuse starts burning at 0.6s. Spans 4.0s.
// Each character receives a delay proportional to its position in the sequence.

const LINE1 = 'TORCH'
const LINE2 = 'INTERACTIVE'
const CHARS  = LINE1.length + LINE2.length   // 16
const FUSE_START  = 0.6
const FUSE_DURATION = 4.0
const STEP = FUSE_DURATION / CHARS            // ~0.25s per character

function IgnitingLine({ text, charOffset, className }) {
  return (
    <span className={`hero-title-line ${className || ''}`}>
      {text.split('').map((ch, i) => {
        const delay = FUSE_START + (charOffset + i) * STEP
        return (
          <span
            key={i}
            style={{ animationDelay: `${delay.toFixed(2)}s` }}
          >
            {ch}
          </span>
        )
      })}
    </span>
  )
}

export default function Hero() {
  const taglineDelay = `${(FUSE_START + CHARS * STEP + 0.5).toFixed(2)}s`
  const ctaDelay     = `${(FUSE_START + CHARS * STEP + 1.0).toFixed(2)}s`
  const scrollDelay  = `${(FUSE_START + CHARS * STEP + 1.8).toFixed(2)}s`

  return (
    <section className="hero" id="home">
      <div className="hero-bg-glow" />

      <div className="hero-content">
        {/* Company name — letters ignite as the fuse burns */}
        <h1 className="hero-title" aria-label="Torch Interactive">
          <IgnitingLine text={LINE1} charOffset={0} />
          <IgnitingLine text={LINE2} charOffset={LINE1.length} />
        </h1>

        {/* Torch + burning fuse row */}
        <div className="hero-ignition-row">
          <TorchFlame />
          <BurningFuse />
        </div>

        {/* Tagline */}
        <p
          className="hero-tagline"
          style={{ animationDelay: taglineDelay }}
        >
          We Ignite Worlds
        </p>

        {/* CTA buttons */}
        <div
          className="hero-cta-row"
          style={{ animationDelay: ctaDelay }}
        >
          <a href="#games" className="btn-primary">Our Games</a>
          <a href="#studio" className="btn-secondary">Our Story</a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll" style={{ animationDelay: scrollDelay }}>
        <span>Scroll</span>
        <div className="hero-scroll-bar" />
      </div>
    </section>
  )
}
