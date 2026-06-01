import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import AnalysisLoadingScreen from '../components/AnalysisLoadingScreen'
import ReportExportToolbar from '../components/ReportExportToolbar'
import PrVerdictBanner from '../components/pullRequest/PrVerdictBanner'
import PrMetricsPanel from '../components/pullRequest/PrMetricsPanel'
import HollowReviewsList from '../components/pullRequest/HollowReviewsList'
import { ROUTES } from '../config/routes'
import { getErrorHint } from '../utils/errorHints'

const FLAG_LABELS = {
  hollow_description: 'Hollow description',
  low_description_density: 'Low description density',
  diff_restatement: 'Diff restatement',
  hollow_reviews: 'Hollow reviews',
}

export default function PullRequestAnalysisPage({ analysis }) {
  const { data, loading, error, job, analyze } = analysis
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const startedForPr = useRef(null)

  useEffect(() => {
    const prFromUrl = searchParams.get('pr')
    if (!prFromUrl || loading || error) return
    const decoded = decodeURIComponent(prFromUrl)
    if (data?.pr_url && data.pr_url.replace(/\/$/, '') === decoded.replace(/\/$/, '')) return
    const quick = searchParams.get('quick') === '1'
    const runKey = `${decoded}|${quick}`
    if (startedForPr.current === runKey) return
    startedForPr.current = runKey
    analyze(decoded, { skipCommitAnalysis: quick })
  }, [analyze, data, loading, error, searchParams])

  useEffect(() => {
    if (!data && !loading && !error && !searchParams.get('pr')) {
      navigate(ROUTES.HOME)
    }
  }, [data, loading, error, navigate, searchParams])

  if (loading) {
    return (
      <AnalysisLoadingScreen
        progress={job?.progress_pct}
        stage={job?.stage}
        updatedAt={job?.updated_at}
        title="Analyzing pull request"
      />
    )
  }

  if (error) {
    const prFromUrl = searchParams.get('pr')
    const hint = getErrorHint(error)
    const quick = searchParams.get('quick') === '1'
    return (
      <div className="di-page">
        <div className="di-wrapper">
          <div className="di-error">
            <div className="di-error-title">PR Analysis Failed</div>
            <div className="di-error-msg">{error}</div>
            {hint && <div className="di-error-hint">{hint}</div>}
            <div className="di-error-actions">
              {prFromUrl && (
                <button
                  type="button"
                  className="di-error-btn di-error-btn-primary"
                  onClick={() => {
                    startedForPr.current = null
                    analyze(decodeURIComponent(prFromUrl), { skipCommitAnalysis: quick })
                  }}
                >
                  Retry
                </button>
              )}
              <button type="button" className="di-error-btn" onClick={() => navigate(ROUTES.HOME)}>
                ← New Scan
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const repoUrl = `https://github.com/${data.repo}`
  const flags = data.flags || []

  return (
    <div className="di-page pr-report-page">
      <div className="di-wrapper">
        <ReportExportToolbar reportType="pr" data={data} />
        <PrVerdictBanner
          verdict={data.verdict}
          title={data.title}
          repo={data.repo}
          prNumber={data.pr_number}
          prUrl={data.pr_url}
        />
        <PrMetricsPanel
          density={data.description_density}
          restatement={data.diff_restatement_score}
          meanCommitScore={data.mean_commit_score}
        />
        {flags.length > 0 && (
          <section className="pr-section">
            <h2 className="pr-section-title">Flags</h2>
            <div className="pr-flags-row">
              {flags.map((f) => (
                <span key={f} className="pr-flag-chip pr-flag-danger">
                  {FLAG_LABELS[f] || f}
                </span>
              ))}
            </div>
          </section>
        )}
        <section className="pr-section">
          <h2 className="pr-section-title">Review comments</h2>
          <HollowReviewsList reviews={data.hollow_reviews} />
        </section>
        {data.risky_commits?.length > 0 && (
          <section className="pr-section">
            <h2 className="pr-section-title">Lowest-scoring commits (recent history)</h2>
            <ul className="pr-risky-list">
              {data.risky_commits.map((c) => (
                <li key={c.sha}>
                  <a
                    href={`${repoUrl}/commit/${c.sha}`}
                    target="_blank"
                    rel="noreferrer"
                    className="pr-commit-link"
                  >
                    <code>{c.sha.slice(0, 7)}</code>
                  </a>
                  <span className="pr-commit-score">{c.score?.toFixed(2)}</span>
                  <span className="pr-commit-msg">{c.message}</span>
                  {c.flags?.length > 0 && (
                    <span className="pr-commit-flags">{c.flags.join(', ')}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
        {data.suggested_review_questions?.length > 0 && (
          <section className="pr-section">
            <h2 className="pr-section-title">Suggested review questions</h2>
            <ul className="pr-questions-list">
              {data.suggested_review_questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </section>
        )}
        <p className="pr-footnote">
          Commit scores reflect recent repository activity (last ~50 commits), not isolated PR diff
          commits only.
        </p>
        <div className="pr-actions-row">
          <Link
            to={`${ROUTES.ANALYSIS}?repo=${encodeURIComponent(repoUrl)}`}
            className="di-error-btn"
          >
            Full repository scan →
          </Link>
        </div>
      </div>
    </div>
  )
}
