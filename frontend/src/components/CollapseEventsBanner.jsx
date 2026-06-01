import { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

export default function CollapseEventBanner({ events, onJumpTo }) {
  const [dismissed, setDismissed] = useState(false)
  if (!events?.length || dismissed) return null

  const worst = events.reduce((a, b) => (b.drop_magnitude > a.drop_magnitude ? b : a))
  const date = format(new Date(worst.timestamp * 1000), 'MMM d, yyyy')

  return (
    <motion.div
      className="collapse-banner"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
    >
      <div className="cb-left">
        <span className="cb-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </span>
        <div>
          <p className="cb-title">
            Cognitive breach detected — {date}
          </p>
          <p className="cb-sub">
            Score dropped <strong>{(worst.drop_magnitude * 100).toFixed(0)} points</strong> over a 10-commit window.
            From {worst.score_before.toFixed(2)} → {worst.score_after.toFixed(2)}.
            {events.length > 1 && ` ${events.length} total breach events found.`}
          </p>
        </div>
      </div>
      <div className="cb-right">
        <button className="cb-jump" onClick={() => onJumpTo(worst.commit_sha)}>
          Jump to commit ↓
        </button>
        <button className="cb-dismiss" onClick={() => setDismissed(true)}>✕</button>
      </div>
    </motion.div>
  )
}
