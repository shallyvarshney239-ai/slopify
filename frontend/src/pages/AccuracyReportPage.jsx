import { useEffect, useState } from 'react'
import axios from 'axios'
import EngagementConfusionMatrix from '../components/EngagementConfusionMatrix'
import EvalFailureGallery from '../components/EvalFailureGallery'
import { getApiBase } from '../utils/repositoryUrl'

const API_BASE = getApiBase()

export default function AccuracyReportPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = (refresh = false) => {
    setLoading(true)
    setError(null)
    axios
      .get(`${API_BASE}/eval/metrics`, { params: refresh ? { refresh: true } : {} })
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.detail || err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <div className="eval-page"><p className="eval-loading">Loading evaluation metrics…</p></div>
  if (error) {
    return (
      <div className="eval-page">
        <p className="eval-error">⚠ {error}</p>
        <button type="button" className="hero-btn" onClick={() => load(true)}>Retry</button>
      </div>
    )
  }

  const engagement = data.engagement || {}
  const flags = data.flag_metrics || {}

  return (
    <div className="eval-page">
      <header className="eval-header">
        <h1>Detection accuracy</h1>
        <p className="eval-intro">
          Honest metrics on {data.fixture_count} labeled commits. Slopify measures behavioral engagement,
          not “AI-generated” probability.
        </p>
        <button type="button" className="share-btn" onClick={() => load(true)}>↻ refresh eval</button>
      </header>

      <section className="eval-section">
        <h2>Engagement classification</h2>
        <p className="eval-meta">
          Thresholds: low &lt; {engagement.thresholds?.low}, high ≥ {engagement.thresholds?.high}.
          {' '}{engagement.evaluated_count} commits in clear bucket.
          {' '}Accuracy: <strong>{(engagement.accuracy * 100).toFixed(1)}%</strong>
          {' '}(mode: {data.mode})
        </p>
        <EngagementConfusionMatrix matrix={engagement.confusion_matrix} />
      </section>

      <section className="eval-section">
        <h2>Per-flag F1</h2>
        <div className="flag-metrics-table-wrap">
          <table className="flag-metrics-table">
            <thead>
              <tr>
                <th>Flag</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1</th>
                <th>Support</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(flags).map(([name, m]) => (
                <tr key={name}>
                  <td><code>{name}</code></td>
                  <td>{m.precision}</td>
                  <td>{m.recall}</td>
                  <td>{m.f1}</td>
                  <td>{m.support}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="eval-section">
        <h2>Failure gallery</h2>
        <EvalFailureGallery failures={engagement.failures} />
      </section>

      <section className="eval-section eval-limitations">
        <h2>Limitations</h2>
        <ul>
          {(data.limitations || []).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
