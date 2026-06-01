export default function EraPanel({ eraSplit }) {
  if (!eraSplit) return null

  const { pre_ai, post_ai, delta, delta_pct, verdict } = eraSplit
  const declined = delta < 0
  const deltaColor = delta < -0.1 ? '#ff2a6d' : delta < 0 ? '#ffd700' : '#39ff14'

  const verdictLabel = {
    significant_decline: '⚠ Significant cognitive decline post-AI tools',
    moderate_decline: '◌ Moderate decline detected post-AI tools',
    stable: '→ Cognitive engagement stable across AI era boundary',
    improvement: '↑ Engagement improved post-AI tools adoption'
  }[verdict] || ''

  return (
    <div className="era-panel evidence-tape">
      <div className="era-header">
        <span className="section-eyebrow">AI era analysis</span>
        <span className="era-cutoff-label">GPT-4 release: March 14, 2023</span>
      </div>

      <div className="era-columns">
        <div className="era-col era-col-pre">
          <div className="era-col-label">Before AI tools</div>
          <div className="era-col-score" style={{ color: '#39ff14', textShadow: '0 0 16px rgba(57,255,20,0.2)' }}>
            {pre_ai.mean_score.toFixed(3)}
          </div>
          <div className="era-col-sub">mean cognitive score</div>
          <div className="era-stats-mini">
            <span>{pre_ai.commit_count} commits</span>
            <span>{pre_ai.high_engagement_pct}% high engagement</span>
            <span>{pre_ai.paste_and_pray_pct}% paste and pray</span>
          </div>
        </div>

        <div className="era-delta-col">
          <div className="era-arrow" style={{ color: deltaColor, fontSize: 32, textShadow: `0 0 12px ${deltaColor}40` }}>
            {declined ? '↘' : '↗'}
          </div>
          <div className="era-delta-val" style={{ color: deltaColor, textShadow: `0 0 12px ${deltaColor}40` }}>
            {delta > 0 ? '+' : ''}{delta_pct.toFixed(1)}%
          </div>
          <div className="era-delta-label">change</div>
        </div>

        <div className="era-col era-col-post">
          <div className="era-col-label">After AI tools</div>
          <div className="era-col-score" style={{ color: deltaColor, textShadow: `0 0 16px ${deltaColor}20` }}>
            {post_ai.mean_score.toFixed(3)}
          </div>
          <div className="era-col-sub">mean cognitive score</div>
          <div className="era-stats-mini">
            <span>{post_ai.commit_count} commits</span>
            <span>{post_ai.high_engagement_pct}% high engagement</span>
            <span>{post_ai.paste_and_pray_pct}% paste and pray</span>
          </div>
        </div>
      </div>

      <div className="era-verdict" style={{ borderLeftColor: deltaColor, background: `${deltaColor}08` }}>
        {verdictLabel}
      </div>
    </div>
  )
}
