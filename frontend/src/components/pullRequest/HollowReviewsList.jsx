const REASON_LABELS = {
  hollow_pattern: 'Hollow pattern (LGTM-style)',
  too_short: 'Too short',
  diff_restatement: 'Restates diff',
}

export default function HollowReviewsList({ reviews }) {
  if (!reviews?.length) {
    return (
      <p className="pr-empty-note">No hollow review signals detected on this PR.</p>
    )
  }

  return (
    <ul className="pr-hollow-list">
      {reviews.map((rev, i) => (
        <li key={`${rev.author}-${i}`} className="pr-hollow-item">
          <div className="pr-hollow-author">@{rev.author}</div>
          <div className="pr-hollow-preview">{rev.body_preview}</div>
          {rev.reasons?.length > 0 && (
            <div className="pr-hollow-reasons">
              {rev.reasons.map((r) => (
                <span key={r} className="pr-flag-chip pr-flag-warning">
                  {REASON_LABELS[r] || r}
                </span>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
