import { useMemo } from 'react'

const GRIP_POSITIONS = [22, 36, 50, 64]

function EmberField() {
  const embers = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      dx:    Math.sin(i * 137.508 * Math.PI / 180) * 22,
      delay: (i * 0.22) % 1.6,
      dur:   1.0 + (i * 0.14) % 0.9,
      size:  1.8 + (i % 4) * 0.6,
    }))
  , [])

  return (
    <div className="ember-field">
      {embers.map(e => (
        <div
          key={e.id}
          className="ember"
          style={{
            '--dx':    `${e.dx}px`,
            '--delay': `${e.delay}s`,
            '--dur':   `${e.dur}s`,
            animationDelay:    `${e.delay}s`,
            animationDuration: `${e.dur}s`,
            width:  `${e.size}px`,
            height: `${e.size}px`,
          }}
        />
      ))}
    </div>
  )
}

export default function TorchFlame() {
  return (
    <div className="torch-wrap">
      {/* Handle */}
      <div className="torch-handle">
        {GRIP_POSITIONS.map(pos => (
          <div
            key={pos}
            className="torch-grip"
            style={{ bottom: `${pos}px` }}
          />
        ))}
      </div>

      {/* Metal parts */}
      <div className="torch-ferrule" />
      <div className="torch-cup" />

      {/* Flame layers */}
      <div className="flame-group">
        <div className="flame-glow" />
        <div className="flame-layer flame-l1" />
        <div className="flame-layer flame-l2" />
        <div className="flame-layer flame-l3" />
        <div className="flame-layer flame-l4" />
        <div className="flame-core" />
      </div>

      <EmberField />
    </div>
  )
}
