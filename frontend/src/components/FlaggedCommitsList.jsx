import { useState } from 'react'

const FLAG_COLOR = {
  paste_and_pray: '#ff2a6d',
  rubber_stamp: '#ff2a6d',
  test_desert: '#ffd700',
  silent_commit: '#ffd700',
  deep_refactor: '#39ff14',
  test_driven: '#39ff14'
}

const ALL_FLAGS = ['paste_and_pray', 'rubber_stamp', 'test_desert', 'silent_commit', 'deep_refactor', 'test_driven']

export default function FlagList({ commits, onSelect, selectedSha }) {
  const [activeFilter, setActiveFilter] = useState('all')

  const flagged = commits.filter((c) => c.flags?.length > 0)
  const filtered = activeFilter === 'all'
    ? flagged
    : flagged.filter((c) => c.flags.includes(activeFilter))

  const sorted = filtered
    .sort((a, b) => b.flags.length - a.flags.length)
    .slice(0, 40)

  const counts = {}
  ALL_FLAGS.forEach((flag) => {
    counts[flag] = flagged.filter((c) => c.flags.includes(flag)).length
  })

  return (
    <div className="flag-list-wrap">
      <div className="flag-filter-bar">
        <button
          className={`flag-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          all <span className="ffb-count">{flagged.length}</span>
        </button>
        {ALL_FLAGS.filter((flag) => counts[flag] > 0).map((flag) => (
          <button
            key={flag}
            className={`flag-filter-btn ${activeFilter === flag ? 'active' : ''}`}
            onClick={() => setActiveFilter(flag)}
            style={{ '--ffb-color': FLAG_COLOR[flag], '--ffb-dim': FLAG_COLOR[flag] + '18' }}
          >
            <span className="ffb-dot" style={{ background: FLAG_COLOR[flag] }} />
            {flag.replace(/_/g, ' ')}
            <span className="ffb-count">{counts[flag]}</span>
          </button>
        ))}
      </div>

      <div className="flag-list">
        {sorted.length === 0 && (
          <p className="no-flags">No evidence matches this filter.</p>
        )}
        {sorted.map((c) => (
          <div
            key={c.sha}
            className={`flag-row ${c.sha === selectedSha ? 'selected' : ''}`}
            onClick={() => onSelect(c)}
          >
            <span className="flag-sha">{c.sha}</span>
            <span className="flag-msg">{c.message?.slice(0, 32)}</span>
            <div className="flag-chips-mini">
              {c.flags.map((f) => (
                <span
                  key={f}
                  className="flag-dot"
                  style={{ background: FLAG_COLOR[f] || '#7a7a9d', boxShadow: `0 0 4px ${FLAG_COLOR[f]}40` }}
                  title={f}
                />
              ))}
            </div>
            <span
              className="flag-score"
              style={{ color: c.cognitive_score < 0.3 ? '#ff2a6d' : '#7a7a9d' }}
            >
              {c.cognitive_score.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
