export default function FileHeatMap({ files }) {
  if (!files?.length) return null

  const maxCommits = Math.max(...files.map((f) => f.commit_count))

  return (
    <div className="file-heatmap">
      <div className="fhm-header">
        <span className="section-eyebrow">file risk map</span>
        <span className="fhm-sub">files with consistently low cognitive engagement</span>
      </div>
      <div className="fhm-list">
        {files.slice(0, 20).map((f) => {
          const barWidth = (f.commit_count / maxCommits) * 100
          const scoreColor = f.mean_score < 0.25
            ? '#ff2a6d' : f.mean_score < 0.45
              ? '#ffd700' : '#39ff14'

          return (
            <div key={f.path} className="fhm-row">
              <div className="fhm-path" title={f.path}>
                {truncatePath(f.path)}
              </div>
              <div className="fhm-bar-wrap">
                <div
                  className="fhm-bar-fill"
                  style={{
                    width: `${barWidth}%`,
                    background: `${scoreColor}50`,
                    boxShadow: `0 0 8px ${scoreColor}25`,
                    '--bar-glow': `${scoreColor}25`
                  }}
                />
                <div
                  className="fhm-bar-score"
                  style={{ left: `${barWidth}%`, background: scoreColor, boxShadow: `0 0 6px ${scoreColor}` }}
                />
              </div>
              <div className="fhm-score" style={{ color: scoreColor, textShadow: `0 0 8px ${scoreColor}30` }}>
                {f.mean_score.toFixed(2)}
              </div>
              <div className="fhm-commits">{f.commit_count}x</div>
              {f.paste_and_pray_hits > 0 && (
                <span className="fhm-pap-badge" title="paste and pray hits">
                  ⚠{f.paste_and_pray_hits}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function truncatePath(path) {
  if (!path) return 'unknown'
  if (path.length <= 45) return path
  const parts = path.split('/')
  if (parts.length > 3) {
    return `.../${parts.slice(-2).join('/')}`
  }
  return path.slice(-45)
}
