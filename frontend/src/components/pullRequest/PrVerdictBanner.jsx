export default function PrVerdictBanner({ verdict, title, repo, prNumber, prUrl }) {
  const needsReview = verdict === 'needs_review'
  return (
    <header className="pr-report-header">
      <div className="pr-report-header-top">
        <span className={`pr-verdict-badge pr-verdict-${verdict || 'unknown'}`}>
          {needsReview ? 'Needs review' : 'Acceptable'}
        </span>
        <a href={prUrl} target="_blank" rel="noreferrer" className="pr-github-link">
          {repo}#{prNumber} on GitHub ↗
        </a>
      </div>
      <h1 className="pr-report-title">{title || 'Pull request analysis'}</h1>
    </header>
  )
}
