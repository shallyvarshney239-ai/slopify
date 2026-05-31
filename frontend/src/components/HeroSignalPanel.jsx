import { motion } from 'framer-motion'
import AppLogo from './AppLogo'

const METRICS = [
  { label: 'Mean score', value: '0.38', tone: 'amber' },
  { label: 'High engagement', value: '24%', tone: 'green' },
  { label: 'Flagged commits', value: '6', tone: 'rose' },
  { label: 'Commits analyzed', value: '200', tone: 'teal' },
]

function toneColor(tone) {
  if (tone === 'green') return '#22c55e'
  if (tone === 'amber') return '#eab308'
  if (tone === 'rose') return '#f43f5e'
  return '#14b8a6'
}

/** Hero right column — commit engagement preview (replaces cyberpunk terminal). */
export default function HeroSignalPanel() {
  return (
    <motion.div
      className="hero-signal-panel"
      initial={{ opacity: 0, x: 40, y: 12 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    >
      <div className="hero-signal-panel-accent" />

      <header className="hero-signal-panel-header">
        <div className="hero-signal-panel-brand">
          <AppLogo size={36} />
          <div>
            <span className="hero-signal-panel-title">Slopify</span>
            <span className="hero-signal-panel-sub">Commit intelligence preview</span>
          </div>
        </div>
        <span className="hero-signal-panel-live">
          <span className="hero-signal-panel-live-dot" />
          Live scan
        </span>
      </header>

      <div className="hero-signal-panel-metrics">
        {METRICS.map((m) => (
          <div key={m.label} className="hero-signal-metric">
            <span className="hero-signal-metric-val" style={{ color: toneColor(m.tone) }}>
              {m.value}
            </span>
            <span className="hero-signal-metric-label">{m.label}</span>
          </div>
        ))}
      </div>

      <div className="hero-signal-chart-wrap">
        <img
          src="/hero-engagement.svg"
          alt=""
          className="hero-signal-chart-img"
          width={480}
          height={320}
          draggable={false}
        />
        <div className="hero-signal-chart-overlay">
          <span className="hero-signal-chart-tag">Cognitive engagement</span>
        </div>
      </div>

      <footer className="hero-signal-panel-footer">
        <span>Behavioral signals from git history — no source code read</span>
      </footer>
    </motion.div>
  )
}
