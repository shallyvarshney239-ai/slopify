import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function SummaryStats({ summary, repoName, total }) {
  const score = summary.mean_cognitive_score
  const scoreColor = score >= 0.6 ? '#39ff14' : score >= 0.35 ? '#ffd700' : '#ff2a6d'
  const grade = score >= 0.70 ? 'A'
    : score >= 0.55 ? 'B'
      : score >= 0.40 ? 'C'
        : score >= 0.25 ? 'D'
          : 'F'
  const verdict = score >= 0.6
    ? 'High engagement — humans appear to understand their commits.'
    : score >= 0.35
      ? 'Mixed signals — some genuine review, significant rubber-stamping detected.'
      : 'Low engagement — repository shows signs of widespread blind AI acceptance.'

  return (
    <div className="summary-bar">
      <div className="summary-header">
        <span className="repo-name">{repoName}</span>
        <span className="commits-analyzed">{total} commits analyzed</span>
      </div>

      <div className="stat-grid">
        <StatCard
          label="Health grade"
          value={grade}
          color={scoreColor}
          mono
          glow
        />
        <StatCard
          label="Mean cognitive score"
          value={score.toFixed(3)}
          color={scoreColor}
          mono
        />
        <StatCard
          label="High engagement commits"
          value={`${summary.high_engagement_pct}%`}
          color="#39ff14"
          mono
        />
        <StatCard
          label="Paste and pray commits"
          value={summary.paste_and_pray_count}
          color="#ff2a6d"
          mono
          pulse={summary.paste_and_pray_count > 0}
        />
        <StatCard
          label="Rubber stamp commits"
          value={summary.rubber_stamp_count}
          color="#ffd700"
          mono
        />
        <StatCard
          label="Collapse events"
          value={summary.collapse_events?.length || 0}
          color={summary.collapse_events?.length ? '#ff2a6d' : '#39ff14'}
          mono
          pulse={summary.collapse_events?.length > 0}
        />
      </div>

      <div className="verdict-bar" style={{ borderLeftColor: scoreColor }}>
        <span className="verdict-icon" aria-hidden="true">◎</span>
        <span className="verdict-text">{verdict}</span>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, mono, glow, pulse }) {
  const [displayValue, setDisplayValue] = useState(typeof value === 'number' ? 0 : value)
  const ref = useRef(null)
  const isNumeric = typeof value === 'number'

  useEffect(() => {
    if (!isNumeric) {
      setDisplayValue(value)
      return
    }
    const target = value
    const duration = 1200
    const startTime = performance.now()
    let raf

    const tick = (now) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setDisplayValue(Math.round(ease * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          raf = requestAnimationFrame(tick)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [value, isNumeric])

  const display = isNumeric ? displayValue : displayValue

  return (
    <motion.div
      ref={ref}
      className="stat-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        '--accent': color,
        '--accent-dim': color + '18',
        ...(glow ? { boxShadow: `0 0 24px ${color}18` } : {}),
        ...(pulse ? { animation: 'siren-pulse 2.5s ease-in-out infinite' } : {})
      }}
    >
      <span className="stat-label">{label}</span>
      <span
        className="stat-value"
        style={{ color, fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', textShadow: glow ? `0 0 16px ${color}40` : 'none' }}
      >
        {display}
      </span>
    </motion.div>
  )
}
