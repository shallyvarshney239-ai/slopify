import { useInView } from 'react-intersection-observer'

function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '')
  const bigint = parseInt(clean, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function DetectionSignalCard({ signal, index }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })
  const dim = hexToRgba(signal.color, 0.12)

  return (
    <div
      ref={ref}
      className={`signal-card ${inView ? 'in-view' : ''}`}
      style={{
        '--delay': `${index * 0.1}s`,
        '--accent': signal.color,
        '--accent-dim': dim
      }}
    >
      <div className="sc-top">
        <span className="sc-id">{signal.id}</span>
        <span className="sc-icon" style={{ color: signal.color }}>{signal.icon}</span>
      </div>
      <h3 className="sc-name" style={{ color: signal.color }}>{signal.name}</h3>
      <p className="sc-desc">{signal.desc}</p>
      <div className="sc-bar">
        <div className="sc-bar-fill" style={{ background: signal.color }} />
      </div>
    </div>
  )
}
