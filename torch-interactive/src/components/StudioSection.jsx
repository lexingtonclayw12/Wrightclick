const PILLARS = [
  {
    icon: '🔥',
    title: 'IGNITE',
    desc: 'Every project starts with a spark — an idea that cannot be ignored. We protect that spark and build a world around it.',
  },
  {
    icon: '⚒️',
    title: 'FORGE',
    desc: 'Craft lives in the details. We iterate obsessively until every frame, mechanic, and moment feels inevitable.',
  },
  {
    icon: '💎',
    title: 'TEMPER',
    desc: 'Pressure produces diamonds. We ship polished, live-service-ready games that hold up under the scrutiny of millions.',
  },
]

const STATS = [
  { number: '12', label: 'Core Devs' },
  { number: '03', label: 'Shipped Titles' },
  { number: '40+', label: 'Awards' },
]

export default function StudioSection() {
  return (
    <section className="studio-section" id="studio">
      <div className="studio-inner">
        <div className="studio-left">
          <div className="section-header">
            <div className="section-eyebrow">Who We Are</div>
            <h2 className="section-title">Forged in Fire</h2>
          </div>
          <p className="studio-statement">
            Torch Interactive is a boutique studio obsessed with one thing:
            making games that burn themselves into memory. We are developers,
            artists, and storytellers who refuse to ship anything we would not
            play ourselves — long after launch.
          </p>
          <div className="studio-stats">
            {STATS.map(s => (
              <div key={s.label} className="stat-item">
                <div className="stat-number">{s.number}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="studio-pillars">
          {PILLARS.map(p => (
            <div key={p.title} className="pillar">
              <div className="pillar-icon">{p.icon}</div>
              <div className="pillar-title">{p.title}</div>
              <p className="pillar-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
