import { useEffect, useRef } from 'react'

const GAMES = [
  {
    id: 'inferno',
    art: 'art-inferno',
    tag: 'Action RPG · 2025',
    title: 'INFERNO',
    desc: 'Descend into a world consumed by war. A dark fantasy epic built around brutal, visceral combat.',
  },
  {
    id: 'ember-fall',
    art: 'art-ember',
    tag: 'Survival Thriller · 2024',
    title: 'EMBER FALL',
    desc: 'The last city is dying. Navigate ash-choked ruins and unravel the conspiracy that ignited the end.',
  },
  {
    id: 'blacksite',
    art: 'art-blacksite',
    tag: 'Tactical Stealth · 2023',
    title: 'BLACKSITE',
    desc: 'Shadow operations. Zero margin for error. A tactical thriller that rewards patience and precision.',
  },
]

function GameCard({ game, delay }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.animation = `card-rise .65s cubic-bezier(.2,0,.4,1) ${delay}s forwards`
          obs.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className="game-card"
      style={{ opacity: 0 }}
    >
      <div className={`game-card-art ${game.art}`} />
      <div className="game-card-overlay" />
      <div className="game-card-body">
        <div className="game-tag">{game.tag}</div>
        <div className="game-title">{game.title}</div>
        <p className="game-desc">{game.desc}</p>
        <a href="#" className="game-link">
          Explore →
        </a>
      </div>
    </div>
  )
}

export default function GamesSection() {
  return (
    <section className="games-section" id="games">
      <div className="section-header">
        <div className="section-eyebrow">Our Titles</div>
        <h2 className="section-title">Worlds On Fire</h2>
      </div>
      <div className="games-grid">
        {GAMES.map((g, i) => (
          <GameCard key={g.id} game={g} delay={i * 0.12} />
        ))}
      </div>
    </section>
  )
}
