export default function PrMetricsPanel({ density, restatement, meanCommitScore }) {
  return (
    <div className="pr-metrics-grid">
      <div className="pr-metric-card">
        <div className="pr-metric-label">Description density</div>
        <div className="pr-metric-value">{density != null ? density.toFixed(2) : '—'}</div>
        <div className="pr-metric-hint">Higher = more substantive PR text</div>
      </div>
      <div className="pr-metric-card">
        <div className="pr-metric-label">Diff restatement</div>
        <div className="pr-metric-value">{restatement != null ? restatement.toFixed(2) : '—'}</div>
        <div className="pr-metric-hint">High = body mostly repeats the diff</div>
      </div>
      {meanCommitScore != null && (
        <div className="pr-metric-card">
          <div className="pr-metric-label">Mean commit score</div>
          <div className="pr-metric-value">{meanCommitScore.toFixed(2)}</div>
          <div className="pr-metric-hint">Recent repo commits (see footnote)</div>
        </div>
      )}
    </div>
  )
}
