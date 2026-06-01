import { format } from 'date-fns'

const FLAG_META = {
  paste_and_pray: {
    label: 'Paste and pray',
    color: '#ff2a6d',
    desc: 'Large bulk insertion with no corresponding tests. Classic blindly-accepted AI output.'
  },
  rubber_stamp: {
    label: 'Rubber stamp',
    color: '#ff2a6d',
    desc: 'Near-zero cognitive engagement signal across all dimensions.'
  },
  test_desert: {
    label: 'Test desert',
    color: '#ffd700',
    desc: 'Significant code changes with zero test coverage added.'
  },
  silent_commit: {
    label: 'Silent commit',
    color: '#ffd700',
    desc: 'Commit message provides no signal about what changed or why.'
  },
  deep_refactor: {
    label: 'Deep refactor',
    color: '#39ff14',
    desc: 'Multiple renames or restructures detected - strong sign of genuine comprehension.'
  },
  test_driven: {
    label: 'Test-driven',
    color: '#39ff14',
    desc: 'Tests represent 40%+ of changed files - high cognitive engagement.'
  }
}

export default function CommitInspector({ commit, onClose }) {
  const diff = commit.diff || {}
  const date = format(new Date(commit.timestamp), 'PPpp')
  const scoreColor = commit.cognitive_score >= 0.6
    ? '#39ff14'
    : commit.cognitive_score >= 0.35
      ? '#ffd700'
      : '#ff2a6d'

  return (
    <div className="inspector-card evidence-tape">
      <div className="inspector-header">
        <div>
          <span className="sha-badge">EVIDENCE ID: {commit.sha}</span>
          <span className="inspector-author">{commit.author}</span>
          <span className="inspector-date">{date}</span>
        </div>
        <button className="close-btn" onClick={onClose}>x</button>
      </div>

      <p className="inspector-message">"{commit.message}"</p>

      <div className="score-breakdown">
        <ScoreBar label="Overall cognitive score" value={commit.cognitive_score} max={1} color={scoreColor} />
        <ScoreBar label="Semantic novelty" value={commit.semantic_novelty} max={1} color="#a5a3e8" />
        <ScoreBar label="Message quality" value={commit.message_quality} max={1} color="#58a6ff" />
      </div>

      <div className="diff-stats">
        <DiffStat label="Files changed" value={diff.files_changed_count} />
        <DiffStat label="Additions" value={`+${diff.total_additions}`} color="#39ff14" />
        <DiffStat label="Deletions" value={`-${diff.total_deletions}`} color="#ff2a6d" />
        <DiffStat label="Test files" value={diff.test_files_changed} color="#58a6ff" />
        <DiffStat label="Renames" value={diff.rename_count} color="#ffd700" />
        <DiffStat label="Comment lines added" value={diff.comment_lines_added} />
        <DiffStat
          label="Bulk insertion"
          value={diff.bulk_insertion_detected ? 'YES' : 'no'}
          color={diff.bulk_insertion_detected ? '#ff2a6d' : '#39ff14'}
        />
      </div>

      {commit.flags?.length > 0 && (
        <div className="flag-section">
          <span className="flag-section-label">Findings detected</span>
          <div className="flag-list-inline">
            {commit.flags.map((flag) => {
              const meta = FLAG_META[flag] || { label: flag, color: '#7a7a9d', desc: '' }
              return (
                <div key={flag} className="flag-chip" style={{ borderColor: meta.color }}>
                  <span className="flag-chip-label" style={{ color: meta.color }}>{meta.label}</span>
                  <span className="flag-chip-desc">{meta.desc}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function ScoreBar({ label, value, max, color }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="score-bar-row">
      <span className="score-bar-label">{label}</span>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}30` }} />
      </div>
      <span className="score-bar-val" style={{ color, fontFamily: 'var(--font-mono)' }}>
        {value.toFixed(3)}
      </span>
    </div>
  )
}

function DiffStat({ label, value, color }) {
  return (
    <div className="diff-stat-item">
      <span className="diff-stat-label">{label}</span>
      <span
        className="diff-stat-val"
        style={{ color: color || 'var(--text-primary)', fontFamily: 'var(--font-mono)', textShadow: color ? `0 0 8px ${color}25` : 'none' }}
      >
        {value}
      </span>
    </div>
  )
}
