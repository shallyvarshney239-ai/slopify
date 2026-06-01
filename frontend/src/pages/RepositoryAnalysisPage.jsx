import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import EngagementTimelineChart from '../components/EngagementTimelineChart'
import ScoreDistributionChart from '../components/ScoreDistributionChart'
import AnalysisLoadingScreen from '../components/AnalysisLoadingScreen'
import ReportExportToolbar from '../components/ReportExportToolbar'
import { ROUTES } from '../config/routes'
import { getErrorHint } from '../utils/errorHints'

/* ─── Flag metadata ────────────────────────────────────── */
const FLAG_META = {
  paste_and_pray: { label: 'Paste & Pray', color: '#FF5A7A', icon: '🤖', severity: 'danger',
    desc: 'Large bulk insertion with no corresponding tests — classic blindly-accepted AI output.' },
  rubber_stamp:   { label: 'Rubber Stamp', color: '#FF5A7A', icon: '📋', severity: 'danger',
    desc: 'Near-zero cognitive engagement across all dimensions. Not reviewed.' },
  test_desert:    { label: 'Test Desert',  color: '#FFC857', icon: '⚠️', severity: 'warning',
    desc: 'Significant code changes with zero test coverage added.' },
  silent_commit:  { label: 'Silent Commit',color: '#FFC857', icon: '🔇', severity: 'warning',
    desc: 'Commit message provides no signal about what changed or why.' },
  deep_refactor:  { label: 'Deep Refactor',color: '#00FFA3', icon: '🔬', severity: 'positive',
    desc: 'Multiple renames and restructures — strong sign of genuine comprehension.' },
  test_driven:    { label: 'Test-Driven',  color: '#00FFA3', icon: '✅', severity: 'positive',
    desc: 'Tests represent 40%+ of changed files — high cognitive engagement.' },
}
const ALL_FLAGS = Object.keys(FLAG_META)

/* ─── Score helpers ────────────────────────────────────── */
const gradeFrom  = s => s >= 0.70 ? 'A' : s >= 0.55 ? 'B' : s >= 0.40 ? 'C' : s >= 0.25 ? 'D' : 'F'
const colorFrom  = s => s >= 0.60 ? '#00FFA3' : s >= 0.35 ? '#FFC857' : '#FF5A7A'
const bgFrom     = s => s >= 0.60 ? 'rgba(0,255,163,0.10)' : s >= 0.35 ? 'rgba(255,200,87,0.10)' : 'rgba(255,90,122,0.10)'
const borderFrom = s => s >= 0.60 ? 'rgba(0,255,163,0.3)' : s >= 0.35 ? 'rgba(255,200,87,0.3)' : 'rgba(255,90,122,0.3)'

/* ─── Derive findings from data ────────────────────────── */
function deriveFindings(data) {
  const s = data.summary
  const score = s.mean_cognitive_score
  const findings = []

  if (s.paste_and_pray_count > 0)
    findings.push({
      id: 'pap', icon: '🤖', severity: 'danger', color: '#FF5A7A',
      title: 'AI-Generated Commits Detected',
      summary: `${s.paste_and_pray_count} commit${s.paste_and_pray_count > 1 ? 's' : ''} show paste-and-pray patterns — large bulk insertions with no exploratory trail.`,
      impact: `${Math.round((s.paste_and_pray_count / data.total_commits_analyzed) * 100)}% of commits flagged`,
      rec: 'Review flagged commits. Require authors to explain AI-assisted code in PR descriptions.',
    })

  if (s.rubber_stamp_count > 0)
    findings.push({
      id: 'rs', icon: '📋', severity: 'danger', color: '#FF5A7A',
      title: 'Low Review Coverage',
      summary: `${s.rubber_stamp_count} commit${s.rubber_stamp_count > 1 ? 's' : ''} were rubber-stamped — merged with near-zero cognitive engagement.`,
      impact: 'Unreviewed code increases security and regression risk',
      rec: 'Enforce mandatory peer review with minimum diff comment requirements.',
    })

  if (s.collapse_events?.length > 0)
    findings.push({
      id: 'ce', icon: '📉', severity: 'danger', color: '#FF5A7A',
      title: 'Engagement Collapse Events',
      summary: `${s.collapse_events.length} rapid engagement drop${s.collapse_events.length > 1 ? 's' : ''} detected — sudden clusters of low-quality commits.`,
      impact: 'Collapse periods correlate with higher defect density',
      rec: 'Inspect commits around collapse events for rushed or automated submissions.',
    })

  if (s.high_engagement_pct < 30 && score < 0.4)
    findings.push({
      id: 'le', icon: '🧠', severity: 'danger', color: '#FF5A7A',
      title: 'Critical Cognitive Engagement Gap',
      summary: `Only ${s.high_engagement_pct}% of commits show high engagement. Most code was merged with minimal comprehension signals.`,
      impact: 'High risk of technical debt and hidden defects',
      rec: 'Introduce code quality gates and mandatory self-review checklists.',
    })
  else if (s.high_engagement_pct < 50)
    findings.push({
      id: 'me', icon: '⚠', severity: 'warning', color: '#FFC857',
      title: 'Mixed Cognitive Engagement',
      summary: `${s.high_engagement_pct}% high-engagement commits detected. Roughly half of all commits show limited review signals.`,
      impact: 'Moderate risk — some areas likely lack proper authorship',
      rec: 'Focus review effort on contributors with declining engagement trends.',
    })

  if (data.era_split?.verdict === 'significant_decline')
    findings.push({
      id: 'ead', icon: '📊', severity: 'warning', color: '#FFC857',
      title: 'Post-AI Era Decline',
      summary: `Cognitive engagement dropped ${Math.abs(data.era_split.delta_pct).toFixed(1)}% after AI tools became mainstream (March 2023).`,
      impact: 'Suggests growing dependency on AI without proportionate comprehension',
      rec: 'Track per-contributor AI adoption patterns and provide guidance on responsible AI use.',
    })

  // Positive findings
  if (s.paste_and_pray_count === 0 && s.rubber_stamp_count === 0)
    findings.push({
      id: 'clean', icon: '✅', severity: 'positive', color: '#00FFA3',
      title: 'Clean Commit History',
      summary: 'No paste-and-pray or rubber-stamp patterns detected. All analyzed commits show cognitive engagement signals.',
      impact: 'Low AI misuse risk',
      rec: 'Maintain current review standards. Consider documenting this as a team practice.',
    })

  if (s.high_engagement_pct >= 60)
    findings.push({
      id: 'hq', icon: '🏆', severity: 'positive', color: '#00FFA3',
      title: 'Strong Engagement Score',
      summary: `${s.high_engagement_pct}% of commits demonstrate high cognitive engagement — well above industry baseline.`,
      impact: 'High code quality confidence',
      rec: 'Share practices with other teams. Consider open-sourcing your review workflow.',
    })

  return findings.slice(0, 6)
}

/* ═══════════════════════════════════════════════════════ */
export default function RepositoryAnalysisPage({ analysis }) {
  const { data, loading, error, job, analyze } = analysis
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [selectedCommit, setSelectedCommit] = useState(null)
  const [expandedSha, setExpandedSha] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const startedForRepo = useRef(null)

  useEffect(() => {
    const repoFromUrl = searchParams.get('repo')
    if (!repoFromUrl || data || loading || error) return
    const decoded = decodeURIComponent(repoFromUrl)
    const maxCommits = Number(searchParams.get('max_commits')) || 200
    const runKey = `${decoded}|${maxCommits}`
    if (startedForRepo.current === runKey) return
    startedForRepo.current = runKey
    analyze(decoded, { maxCommits })
  }, [analyze, data, loading, error, searchParams])

  useEffect(() => {
    if (!data && !loading && !error && !searchParams.get('repo')) navigate(ROUTES.HOME)
  }, [data, loading, error, navigate, searchParams])

  if (loading) return <AnalysisLoadingScreen progress={job?.progress_pct} stage={job?.stage} updatedAt={job?.updated_at} />

  if (error) {
    const repoFromUrl = searchParams.get('repo')
    const hint = getErrorHint(error)
    return (
      <div className="di-page">
        <div className="di-wrapper">
          <div className="di-error">
            <div className="di-error-title">Analysis Failed</div>
            <div className="di-error-msg">{error}</div>
            {hint && <div className="di-error-hint">{hint}</div>}
            <div className="di-error-actions">
              {repoFromUrl && (
                <button className="di-error-btn di-error-btn-primary" onClick={() => {
                  startedForRepo.current = null
                  analyze(decodeURIComponent(repoFromUrl), { maxCommits: Number(searchParams.get('max_commits')) || 200 })
                }}>Retry Scan</button>
              )}
              <button className="di-error-btn" onClick={() => navigate(ROUTES.HOME)}>← New Scan</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  /* ── computed values ── */
  const score         = data.summary.mean_cognitive_score
  const grade         = gradeFrom(score)
  const gradeColor    = colorFrom(score)
  const healthScore   = Math.round(score * 100)
  const totalCommits  = data.total_commits_analyzed
  const papCount      = data.summary.paste_and_pray_count || 0
  const rsCount       = data.summary.rubber_stamp_count || 0
  const collapseEvts  = data.summary.collapse_events || []

  const aiInfluencePct = Math.min(100, Math.round(((papCount + rsCount) / totalCommits) * 150))
  const contribTrust   = data.contributors?.length
    ? Math.round(data.contributors.reduce((s, c) => s + c.mean_score, 0) / data.contributors.length * 100)
    : healthScore
  const securityScore  = Math.max(0, Math.min(100, 100 - (papCount * 8) - (collapseEvts.length * 12) - (rsCount * 5)))

  const findings = deriveFindings(data)

  /* flagged commits for section 5 */
  const flagged = data.commits.filter(c => c.flags?.length > 0)
  const flagCounts = {}
  ALL_FLAGS.forEach(f => { flagCounts[f] = flagged.filter(c => c.flags.includes(f)).length })
  const filtered = activeFilter === 'all'
    ? flagged.sort((a, b) => a.cognitive_score - b.cognitive_score).slice(0, 30)
    : flagged.filter(c => c.flags.includes(activeFilter)).slice(0, 30)

  const verdictText = score >= 0.6
    ? 'This repository shows strong cognitive engagement signals. Code is being written, reviewed, and understood.'
    : score >= 0.35
      ? 'Mixed engagement signals detected. Some contributors show genuine understanding while others show passive acceptance patterns.'
      : 'Widespread low engagement detected. This repository shows significant signs of paste-and-accept behavior without comprehension.'

  const statusLabel = score >= 0.6 ? 'Healthy Repository' : score >= 0.35 ? 'Needs Attention' : 'High Risk'

  return (
    <div className="di-page">
      <div className="di-wrapper">
        <ReportExportToolbar reportType="repo" data={data} />

        {/* ══ SECTION 1: INTELLIGENCE OVERVIEW ══════════════ */}
        <motion.div
          className="di-hero"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="di-hero-gradient" />
          <div className="di-hero-grid-bg" />

          <div className="di-hero-main">
            <div className="di-hero-left">
              <div className="di-hero-eyebrow">
                <span className="di-hero-live-dot" />
                Intelligence Report · Slopify
              </div>
              <h1 className="di-hero-repo-name">{data.repo_name}</h1>
              <div className="di-hero-meta-row">
                <span className="di-meta-pill">📦 {totalCommits} commits analyzed</span>
                <span className="di-meta-pill">📅 {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span
                  className="di-badge"
                  style={{
                    color: gradeColor,
                    borderColor: borderFrom(score),
                    background: bgFrom(score),
                  }}
                >
                  {statusLabel}
                </span>
              </div>
              <p className="di-hero-verdict">{verdictText}</p>
            </div>

            <div className="di-hero-score-cluster">
              <div
                className="di-hero-grade-ring"
                style={{ '--di-grade-color': gradeColor }}
              >
                <div className="di-hero-grade-letter">{grade}</div>
                <div className="di-hero-grade-sub">Grade</div>
              </div>
              <div className="di-hero-score-num" style={{ color: gradeColor }}>{score.toFixed(3)}</div>
            </div>
          </div>

          {/* 4 pillars */}
          <div className="di-hero-pillars">
            <Pillar label="Health Score" value={healthScore} unit="%" color={colorFrom(score)} max={100} desc={`Grade ${grade} overall`} />
            <Pillar label="AI Influence" value={aiInfluencePct} unit="%" color={aiInfluencePct > 40 ? '#FF5A7A' : aiInfluencePct > 15 ? '#FFC857' : '#00FFA3'} max={100} desc={`${papCount + rsCount} flagged commits`} />
            <Pillar label="Contributor Trust" value={contribTrust} unit="%" color={colorFrom(contribTrust / 100)} max={100} desc={`${data.contributors?.length || 0} contributors`} />
            <Pillar label="Security Score" value={securityScore} unit="%" color={colorFrom(securityScore / 100)} max={100} desc={`${collapseEvts.length} collapse events`} />
          </div>
        </motion.div>

        {/* ══ SECTION 2: KEY FINDINGS ═══════════════════════ */}
        <SectionHeader icon="🔍" label="Key Findings" title="Intelligence Findings" sub="Conclusions derived from behavioral git analysis — not raw metrics" delay={0.1} />
        <motion.div
          className="di-findings-grid"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
        >
          {findings.map((f, i) => (
            <motion.div
              key={f.id}
              className="di-finding-card"
              style={{ '--finding-color': f.color }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.12 + i * 0.06 }}
            >
              <div className="di-finding-head">
                <span className="di-finding-icon">{f.icon}</span>
                <span className="di-finding-title">{f.title}</span>
                <span
                  className="di-badge"
                  style={{
                    color: f.color,
                    borderColor: f.color + '40',
                    background: f.color + '12',
                    flexShrink: 0,
                  }}
                >
                  {f.severity === 'positive' ? 'OK' : f.severity}
                </span>
              </div>
              <p className="di-finding-summary">{f.summary}</p>
              <div className="di-finding-impact">Impact: {f.impact}</div>
              <div className="di-finding-recommendation">
                <span style={{ flexShrink: 0 }}>→</span>
                {f.rec}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ══ SECTION 3: AI USAGE ANALYSIS ═════════════════ */}
        <SectionHeader icon="🤖" label="AI Usage Analysis" title="AI Adoption & Influence" sub="Cognitive engagement before and after AI tools became mainstream (GPT-4, March 2023)" delay={0.2} />
        <motion.div
          className="di-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          style={{ overflow: 'hidden' }}
        >
          {data.era_split
            ? <EraComparisonCard era={data.era_split} commits={data.commits} />
            : <div style={{ padding: 28, color: 'var(--di-muted)', fontSize: 13 }}>Not enough git history to compare eras.</div>
          }
        </motion.div>

        {/* ══ SCORE DISTRIBUTION ══════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.26 }}
        >
          <CognitiveScoreDistribution commits={data.commits} />
        </motion.div>

        {/* ══ SECTION 4: CONTRIBUTOR INTELLIGENCE ══════════ */}
        {data.contributors?.length > 0 && (
          <>
            <SectionHeader icon="👤" label="Contributor Intelligence" title="Contributor Trust Index" sub={`${data.contributors.length} contributors analyzed · ranked by cognitive engagement`} delay={0.28} />
            <motion.div
              className="di-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="di-contrib-grid">
                {data.contributors.slice(0, 8).map((c) => {
                  const cColor = colorFrom(c.mean_score)
                  const initials = c.author.split(/[\s._-]/).map(w => w[0]?.toUpperCase()).filter(Boolean).slice(0, 2).join('') || '?'
                  const trend = c.score_trend === 'declining' ? '↘' : c.score_trend === 'improving' ? '↗' : '→'
                  const trendColor = c.score_trend === 'declining' ? '#FF5A7A' : c.score_trend === 'improving' ? '#00FFA3' : '#94A3B8'
                  const riskLabel = c.paste_and_pray_pct > 30 ? 'High Risk' : c.paste_and_pray_pct > 10 ? 'Medium Risk' : 'Low Risk'
                  const riskColor = c.paste_and_pray_pct > 30 ? '#FF5A7A' : c.paste_and_pray_pct > 10 ? '#FFC857' : '#00FFA3'

                  return (
                    <motion.div
                      key={c.author}
                      className="di-contrib-card"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.32 }}
                    >
                      <div className="di-contrib-card-top">
                        <div className="di-contrib-avatar">{initials}</div>
                        <div>
                          <div className="di-contrib-name" title={c.author}>{c.author.slice(0, 16)}</div>
                          <div className="di-contrib-commits">{c.commit_count} commits</div>
                        </div>
                      </div>
                      <div className="di-contrib-score-row">
                        <div className="di-contrib-score" style={{ color: cColor }}>
                          {c.mean_score.toFixed(2)}
                        </div>
                        <span title={c.score_trend} style={{ color: trendColor, fontSize: 16 }}>{trend}</span>
                      </div>
                      <div className="di-contrib-bars">
                        <ContribBar label="Engage" value={c.mean_score * 100} color={cColor} />
                        <ContribBar label="Risk%" value={c.paste_and_pray_pct} color={c.paste_and_pray_pct > 20 ? '#FF5A7A' : '#FFC857'} />
                      </div>
                      <div
                        className="di-contrib-risk-chip"
                        style={{ color: riskColor, borderColor: riskColor + '30', background: riskColor + '10' }}
                      >
                        <span>{riskLabel}</span>
                        <span style={{ fontFamily: 'var(--di-font-mono)', fontSize: 10 }}>{c.paste_and_pray_pct.toFixed(0)}% PaP</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}

        {/* ══ SECTION 5: COGNITIVE TIMELINE ════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.34 }}
        >
          <CognitiveEngagementTimeline
            commits={data.commits}
            collapseEvents={data.summary.collapse_events}
            onCommitClick={(c) => { setSelectedCommit(c); setExpandedSha(c.sha) }}
            selectedSha={selectedCommit?.sha}
          />
        </motion.div>

        {/* ══ SECTION 6: SUSPICIOUS COMMITS ════════════════ */}
        {flagged.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.38 }}
          >
            <FlaggedCommitsPanel
              flagged={flagged}
              flagCounts={flagCounts}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              filtered={filtered}
              expandedSha={expandedSha}
              setExpandedSha={setExpandedSha}
              totalCommits={totalCommits}
              summary={data.summary}
            />
          </motion.div>
        )}

        {/* ══ SECTION 7: FILE RISK MAP ══════════════════════ */}
        {data.file_heatmap?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.44 }}
          >
            <RepositoryRiskMap files={data.file_heatmap} />
          </motion.div>
        )}

      </div>
    </div>
  )
}

/* ─── Inline sub-components ────────────────────────────── */

function SectionHeader({ icon, label, title, sub, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay }}
      style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingLeft: 4 }}
    >
      <div className="di-section-label">
        <span className="di-section-label-icon">{icon}</span>
        {label}
      </div>
      <div className="di-section-title">{title}</div>
      {sub && <div className="di-section-sub">{sub}</div>}
    </motion.div>
  )
}

function Pillar({ label, value, unit, color, max, desc }) {
  return (
    <div className="di-pillar">
      <div className="di-pillar-label">{label}</div>
      <div className="di-pillar-value" style={{ color }}>{value}{unit}</div>
      <div className="di-pillar-bar">
        <div className="di-pillar-bar-fill" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
      <div className="di-pillar-desc">{desc}</div>
    </div>
  )
}

function AIMetricRow({ name, desc, value, total, color, unit, raw }) {
  const pct = raw ? value : Math.min(100, Math.round((value / Math.max(total, 1)) * 100))
  return (
    <div className="di-ai-metric-row">
      <div className="di-ai-metric-left">
        <div className="di-ai-metric-name">{name}</div>
        <div className="di-ai-metric-desc">{desc}</div>
      </div>
      <div className="di-ai-metric-right">
        <div className="di-ai-mini-bar">
          <div className="di-ai-mini-bar-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
        <div className="di-ai-val" style={{ color }}>{value}{unit}</div>
      </div>
    </div>
  )
}

function ContribBar({ label, value, color }) {
  return (
    <div className="di-contrib-bar-row">
      <span className="di-contrib-bar-label">{label}</span>
      <div className="di-contrib-bar-track">
        <div className="di-contrib-bar-fill" style={{ width: `${Math.min(100, value)}%`, background: color }} />
      </div>
    </div>
  )
}

function CommitScoreBar({ label, value, color }) {
  return (
    <div className="di-commit-score-bar">
      <span className="di-commit-score-label">{label}</span>
      <div className="di-commit-score-track">
        <div className="di-commit-score-fill" style={{ width: `${Math.round((value || 0) * 100)}%`, background: color }} />
      </div>
      <span className="di-commit-score-val" style={{ color }}>{(value || 0).toFixed(3)}</span>
    </div>
  )
}

function DiffCell({ label, value, color }) {
  return (
    <div className="di-diff-cell">
      <span className="di-diff-cell-label">{label}</span>
      <span className="di-diff-cell-val" style={{ color: color || 'var(--di-text)', fontFamily: 'var(--di-font-mono)' }}>
        {value ?? '—'}
      </span>
    </div>
  )
}

/* ══ COGNITIVE ENGAGEMENT TIMELINE ══════════════════════ */

function dotColor(s) {
  return s >= 0.6 ? '#00FFA3' : s >= 0.35 ? '#FFC857' : '#FF5A7A'
}

function movingAverage(pts, window = 8) {
  return pts.map((_, i) => {
    const slice = pts.slice(Math.max(0, i - window), i + window + 1)
    return slice.reduce((a, b) => a + b.score, 0) / slice.length
  })
}

function formatMonthYear(date) {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function formatMonthYearShort(date) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

function CognitiveEngagementTimeline({ commits, collapseEvents = [], onCommitClick, selectedSha }) {
  const [zoom, setZoom] = useState('all')

  // Parse and sort commits with valid dates
  const allPts = commits
    .map(c => ({ ...c, ts: c.date ? new Date(c.date).getTime() : null, score: c.cognitive_score }))
    .filter(c => c.ts && !isNaN(c.ts) && c.score >= 0 && c.score <= 1)
    .sort((a, b) => a.ts - b.ts)

  // Apply zoom filter
  const now = Date.now()
  const zoomedPts = zoom === '1y' ? allPts.filter(c => c.ts >= now - 365 * 24 * 3600000)
    : zoom === '2y' ? allPts.filter(c => c.ts >= now - 2 * 365 * 24 * 3600000)
    : allPts

  const pts = zoomedPts.length > 0 ? zoomedPts : allPts

  if (pts.length === 0) return null

  // Stats
  const scores    = pts.map(p => p.score)
  const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const minScore  = Math.min(...scores)
  const maxScore  = Math.max(...scores)

  // Trend: compare last third vs first third
  const third = Math.max(1, Math.floor(pts.length / 3))
  const earlyMean = pts.slice(0, third).reduce((a, b) => a + b.score, 0) / third
  const lateMean  = pts.slice(-third).reduce((a, b) => a + b.score, 0) / third
  const trendPct  = Math.round(((lateMean - earlyMean) / Math.max(earlyMean, 0.001)) * 100)
  const trendUp   = trendPct >= 0

  // Lowest / highest month
  const byMonth = {}
  pts.forEach(p => {
    const d  = new Date(p.ts)
    const k  = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!byMonth[k]) byMonth[k] = { scores: [], label: formatMonthYearShort(d) }
    byMonth[k].scores.push(p.score)
  })
  const monthEntries = Object.entries(byMonth).map(([k, v]) => ({
    key: k, label: v.label,
    avg: v.scores.reduce((a, b) => a + b, 0) / v.scores.length
  }))
  const lowestMonth  = monthEntries.sort((a, b) => a.avg - b.avg)[0]
  const highestMonth = monthEntries.sort((a, b) => b.avg - a.avg)[0]

  // SVG chart config
  const VW = 900, VH = 280
  const PAD = { top: 40, right: 20, bottom: 44, left: 52 }
  const CW  = VW - PAD.left - PAD.right
  const CH  = VH - PAD.top  - PAD.bottom

  const tMin = pts[0].ts
  const tMax = pts[pts.length - 1].ts
  const tRange = tMax - tMin || 1

  const xOf = ts => PAD.left + ((ts - tMin) / tRange) * CW
  const yOf = s  => PAD.top  + CH - s * CH

  // X axis ticks (monthly/yearly depending on range)
  const rangeMonths = (tMax - tMin) / (30 * 24 * 3600000)
  const tickInterval = rangeMonths > 36 ? 6 : rangeMonths > 12 ? 3 : 1
  const xTicks = []
  const start  = new Date(tMin)
  start.setDate(1)
  start.setHours(0, 0, 0, 0)
  for (let d = new Date(start); d.getTime() <= tMax + 32 * 86400000; ) {
    if (d.getMonth() % tickInterval === 0) xTicks.push({ ts: d.getTime(), label: formatMonthYearShort(d) })
    d.setMonth(d.getMonth() + 1)
  }

  // Trend line points (moving average)
  const mavg = movingAverage(pts, Math.max(3, Math.floor(pts.length / 12)))
  const trendPath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${xOf(p.ts).toFixed(1)},${yOf(mavg[i]).toFixed(1)}`).join(' ')

  // GPT-4 milestone
  const gpt4ts    = new Date('2023-03-14').getTime()
  const showGPT4  = gpt4ts >= tMin && gpt4ts <= tMax
  const gpt4x     = xOf(gpt4ts)

  // Collapse events as vertical bands
  const collapseBands = (collapseEvents || []).map(e => {
    const ts = e.start ? new Date(e.start).getTime() : null
    return ts ? xOf(ts) : null
  }).filter(Boolean)

  // Dynamic insights
  const insights = []
  if (trendUp) {
    insights.push({ icon: '↑', color: '#00FFA3', title: 'Improving Engagement', desc: `Cognitive engagement has improved by ${Math.abs(trendPct)}% since early ${new Date(pts[0].ts).getFullYear()}.` })
  } else {
    insights.push({ icon: '↓', color: '#FF5A7A', title: 'Declining Engagement', desc: `Cognitive engagement has declined by ${Math.abs(trendPct)}% over the analyzed period.` })
  }
  const midHighPct = Math.round((pts.filter(p => p.score >= 0.35).length / pts.length) * 100)
  insights.push({ icon: '⏱', color: '#FFC857', title: 'Consistent Mid-High Activity', desc: `${midHighPct}% of commits fall within the healthy engagement range (0.35 – 0.6).` })

  if (lowestMonth) {
    insights.push({ icon: '⚠', color: '#FF5A7A', title: 'Low Engagement Spikes', desc: `Detected during ${lowestMonth.label}. Review workflow changes.` })
  }
  if (highestMonth) {
    insights.push({ icon: '★', color: '#00FFA3', title: 'Strong Recent Performance', desc: `Highest engagement observed in ${highestMonth.label}.` })
  }

  // Mini-map config
  const MM_VW = 900, MM_VH = 52
  const MM_PAD = { top: 6, right: 20, bottom: 18, left: 52 }
  const MM_CW  = MM_VW - MM_PAD.left - MM_PAD.right
  const MM_CH  = MM_VH - MM_PAD.top  - MM_PAD.bottom
  const mmXOf  = ts => MM_PAD.left + ((ts - tMin) / tRange) * MM_CW
  const mmYOf  = s  => MM_PAD.top  + MM_CH - s * MM_CH

  // Year ticks for minimap
  const yearTicks = []
  for (let yr = new Date(tMin).getFullYear() + 1; yr <= new Date(tMax).getFullYear(); yr++) {
    const t = new Date(`${yr}-01-01`).getTime()
    if (t >= tMin && t <= tMax) yearTicks.push({ ts: t, label: String(yr) })
  }

  return (
    <div style={{ background: 'var(--di-card)', border: '1px solid var(--di-border)', borderRadius: 16, overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{ borderBottom: '1px solid var(--di-border)', padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <span style={{ fontSize: 12 }}>📈</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)' }}>BEHAVIORAL TIMELINE</span>
            </div>
            <div style={{ fontFamily: 'var(--di-font-display)', fontSize: 22, fontWeight: 700, color: 'var(--di-text)', letterSpacing: '-0.02em' }}>Cognitive Engagement Over Time</div>
            <div style={{ fontSize: 12, color: 'var(--di-muted)', marginTop: 3 }}>Track how cognitive engagement has evolved across commits over time.</div>
          </div>
          {/* 4 stat chips */}
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
            {[
              { icon: trendUp ? '↑' : '↓', value: `${trendUp ? '+' : ''}${trendPct}%`, label: 'Overall Trend', sub: 'Improvement', color: trendUp ? '#00FFA3' : '#FF5A7A' },
              { icon: '⚡', value: meanScore.toFixed(2), label: 'Average Score', sub: 'Across all time', color: '#FFC857' },
              { icon: '↘', value: minScore.toFixed(2), label: 'Lowest Period', sub: lowestMonth?.label || '—', color: '#FF5A7A' },
              { icon: '↑', value: maxScore.toFixed(2), label: 'Highest Period', sub: highestMonth?.label || '—', color: '#00FFA3' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'var(--di-surface)', border: '1px solid var(--di-border)',
                borderRadius: 10, padding: '10px 16px', minWidth: 110,
              }}>
                <div style={{ fontSize: 10, color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16, color: s.color }}>{s.icon}</span>
                  <span style={{ fontFamily: 'var(--di-font-mono)', fontSize: 20, fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--di-faint)', marginTop: 3 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Zoom + Legend */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--di-faint)', marginRight: 4 }}>Zoom</span>
            {[['1y','1Y'],['2y','2Y'],['all','All']].map(([k, label]) => (
              <button key={k} onClick={() => setZoom(k)} style={{
                padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                border: '1px solid',
                borderColor: zoom === k ? '#00E5FF' : 'var(--di-border)',
                background: zoom === k ? 'rgba(0,229,255,0.12)' : 'var(--di-surface)',
                color: zoom === k ? '#00E5FF' : 'var(--di-muted)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>{label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {[['#00FFA3','High (≥ 0.6)'],['#FFC857','Mid (0.35 – 0.6)'],['#FF5A7A','Low (< 0.35)']].map(([c, l]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--di-muted)', fontFamily: 'var(--di-font-mono)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block', boxShadow: `0 0 4px ${c}80` }} />{l}
              </span>
            ))}
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--di-muted)', fontFamily: 'var(--di-font-mono)' }}>
              <span style={{ width: 18, borderTop: '2px dashed #A78BFA', display: 'inline-block' }} /> Trend
            </span>
          </div>
        </div>
      </div>

      {/* ── Main SVG chart ── */}
      <div style={{ padding: '0', position: 'relative' }}>
        <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
          {/* Band zones */}
          <rect x={PAD.left} y={PAD.top} width={CW} height={yOf(0.6) - PAD.top} fill="rgba(0,255,163,0.04)" />
          <rect x={PAD.left} y={yOf(0.6)} width={CW} height={yOf(0.35) - yOf(0.6)} fill="rgba(255,200,87,0.04)" />
          <rect x={PAD.left} y={yOf(0.35)} width={CW} height={yOf(0) - yOf(0.35)} fill="rgba(255,90,122,0.04)" />

          {/* Band labels */}
          <text x={PAD.left + 8} y={PAD.top + 14} fill="#00FFA360" fontSize="10" fontFamily="sans-serif">High Engagement</text>
          <text x={PAD.left + 8} y={yOf(0.6) + 14} fill="#FFC85760" fontSize="10" fontFamily="sans-serif">Mid Engagement</text>
          <text x={PAD.left + 8} y={yOf(0.35) + 14} fill="#FF5A7A60" fontSize="10" fontFamily="sans-serif">Low Engagement</text>

          {/* Horizontal gridlines */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map(v => {
            const y = yOf(v)
            return (
              <g key={v}>
                <line x1={PAD.left} y1={y} x2={PAD.left + CW} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <text x={PAD.left - 8} y={y + 4} fill="#4E6280" fontSize="10" textAnchor="end" fontFamily="'JetBrains Mono',monospace">{v.toFixed(1)}</text>
              </g>
            )
          })}

          {/* Y-axis label */}
          <text x={16} y={PAD.top + CH / 2} fill="#4E6280" fontSize="10" textAnchor="middle" fontFamily="sans-serif"
            transform={`rotate(-90, 16, ${PAD.top + CH / 2})`}>Cognitive Score</text>

          {/* Collapse event bands */}
          {collapseBands.map((cx, i) => (
            <rect key={i} x={cx - 12} y={PAD.top} width={24} height={CH} fill="rgba(255,90,122,0.08)" />
          ))}

          {/* GPT-4 milestone line */}
          {showGPT4 && (
            <g>
              <line x1={gpt4x} y1={PAD.top - 16} x2={gpt4x} y2={PAD.top + CH}
                stroke="#A78BFA" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.7" />
              <rect x={gpt4x - 46} y={PAD.top - 36} width={92} height={28} rx="5"
                fill="#1A1F35" stroke="rgba(167,139,250,0.4)" strokeWidth="1" />
              <text x={gpt4x} y={PAD.top - 23} fill="#C4B5FD" fontSize="9" textAnchor="middle"
                fontFamily="'JetBrains Mono',monospace" fontWeight="600">Mar 2023</text>
              <text x={gpt4x} y={PAD.top - 13} fill="#A78BFA" fontSize="9" textAnchor="middle"
                fontFamily="'JetBrains Mono',monospace">GPT-4 Released</text>
            </g>
          )}

          {/* Trend line (moving average) */}
          {pts.length > 3 && (
            <path d={trendPath} fill="none" stroke="#A78BFA" strokeWidth="1.8"
              strokeDasharray="6,4" opacity="0.6" strokeLinejoin="round" />
          )}

          {/* X-axis ticks */}
          {xTicks.map(({ ts, label }) => {
            const x = xOf(ts)
            return (
              <g key={ts}>
                <line x1={x} y1={PAD.top + CH} x2={x} y2={PAD.top + CH + 5} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <text x={x} y={PAD.top + CH + 18} fill="#4E6280" fontSize="9" textAnchor="middle" fontFamily="'JetBrains Mono',monospace">{label}</text>
              </g>
            )
          })}

          {/* Scatter dots */}
          {pts.map((p, i) => {
            const cx  = xOf(p.ts)
            const cy  = yOf(p.score)
            const col = dotColor(p.score)
            const sel = p.sha === selectedSha
            return (
              <circle key={p.sha || i} cx={cx} cy={cy} r={sel ? 6 : 4}
                fill={col} opacity={sel ? 1 : 0.82}
                style={{ cursor: 'pointer', filter: sel ? `drop-shadow(0 0 6px ${col})` : `drop-shadow(0 0 2px ${col}60)` }}
                onClick={() => onCommitClick && onCommitClick(p)}
              />
            )
          })}
        </svg>

        {/* ── Mini-map ── */}
        <div style={{ borderTop: '1px solid var(--di-border)', background: 'rgba(0,0,0,0.2)' }}>
          <svg viewBox={`0 0 ${MM_VW} ${MM_VH}`} width="100%" style={{ display: 'block' }}>
            {/* Mini scatter */}
            {pts.map((p, i) => (
              <circle key={i} cx={mmXOf(p.ts)} cy={mmYOf(p.score)} r={1.5}
                fill={dotColor(p.score)} opacity={0.5} />
            ))}
            {/* Mini trend */}
            {pts.length > 3 && (
              <polyline
                points={pts.map((p, i) => `${mmXOf(p.ts).toFixed(1)},${mmYOf(mavg[i]).toFixed(1)}`).join(' ')}
                fill="none" stroke="#A78BFA" strokeWidth="1" opacity="0.4" />
            )}
            {/* Year labels */}
            {yearTicks.map(({ ts, label }) => (
              <text key={ts} x={mmXOf(ts)} y={MM_VH - 4} fill="#4E6280" fontSize="9"
                textAnchor="middle" fontFamily="'JetBrains Mono',monospace">{label}</text>
            ))}
            {/* Brush handles */}
            <rect x={MM_PAD.left} y={MM_PAD.top} width={6} height={MM_CH}
              rx="2" fill="rgba(0,229,255,0.3)" stroke="#00E5FF" strokeWidth="1" style={{ cursor: 'ew-resize' }} />
            <rect x={MM_PAD.left + MM_CW - 6} y={MM_PAD.top} width={6} height={MM_CH}
              rx="2" fill="rgba(0,229,255,0.3)" stroke="#00E5FF" strokeWidth="1" style={{ cursor: 'ew-resize' }} />
            <rect x={MM_PAD.left + 6} y={MM_PAD.top} width={MM_CW - 12} height={MM_CH}
              fill="rgba(0,229,255,0.04)" stroke="none" />
          </svg>
        </div>
      </div>

      {/* ── Engagement Insights ── */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--di-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: 13 }}>🔮</span>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)' }}>ENGAGEMENT INSIGHTS</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {insights.slice(0, 4).map((ins, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: 'var(--di-surface)', border: `1px solid ${ins.color}20`,
              borderRadius: 10, padding: '12px 14px',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: ins.color + '15', border: `1px solid ${ins.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: ins.color, fontWeight: 800,
              }}>{ins.icon}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: ins.color, marginBottom: 4 }}>{ins.title}</div>
                <div style={{ fontSize: 11, color: 'var(--di-muted)', lineHeight: 1.5 }}>{ins.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 24px', borderTop: '1px solid var(--di-border)',
        background: 'rgba(255,255,255,0.015)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: 'rgba(0,229,255,0.10)', border: '1px solid rgba(0,229,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#00E5FF',
          }}>ℹ</div>
          <div style={{ fontSize: 11, color: 'var(--di-faint)' }}>
            Each dot represents one commit.&nbsp;
            <span style={{ color: '#FF5A7A70' }}>Red bands indicate periods with low cognitive engagement.</span>
          </div>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
          background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.2)',
          borderRadius: 8, color: '#00E5FF', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'var(--di-font-mono)',
        }}>
          View Detailed Analysis →
        </button>
      </div>

    </div>
  )
}

/* ══ FLAGGED COMMITS PANEL ═══════════════════════════════ */

function riskLevelFrom(sc, flags) {
  const danger = flags.filter(f => FLAG_META[f]?.severity === 'danger').length
  if (danger >= 2 || sc < 0.25) return { label: 'High',   color: '#FF5A7A', ring: '#FF5A7A' }
  if (danger >= 1 || sc < 0.40) return { label: 'Medium', color: '#FF8C42', ring: '#FF8C42' }
  return { label: 'Low', color: '#FFC857', ring: '#FFC857' }
}

function aiProbabilityFrom(sc, flags) {
  let prob = Math.round((1 - sc) * 55)
  if (flags.includes('paste_and_pray')) prob = Math.min(95, prob + 30)
  if (flags.includes('rubber_stamp'))   prob = Math.min(95, prob + 20)
  if (flags.includes('silent_commit'))  prob = Math.min(95, prob + 10)
  prob = Math.max(10, prob)
  const label = prob >= 70 ? 'Likely AI-assisted' : prob >= 45 ? 'Possible AI-assisted' : 'Low AI signal'
  return { prob, label }
}

function humanReadableReasons(flags, sc) {
  const reasons = []
  if (flags.includes('paste_and_pray'))  reasons.push('Large bulk insertion detected', 'No test coverage added', 'High automation indicator')
  if (flags.includes('rubber_stamp'))    reasons.push('Low review activity', 'Near-zero engagement signals', 'Repetitive acceptance pattern')
  if (flags.includes('test_desert'))     reasons.push('Code changes without tests', 'Test coverage gap detected', 'Quality gate not met')
  if (flags.includes('silent_commit'))   reasons.push('Vague commit message', 'Minimal intent signal', 'Short commit message')
  if (flags.includes('deep_refactor'))   reasons.push('Multiple file renames', 'Structural changes detected', 'Genuine comprehension signals')
  if (flags.includes('test_driven'))     reasons.push('High test-to-code ratio', 'Strong review signals', 'Quality indicators present')
  if (sc < 0.3 && !reasons.length)      reasons.push('Low human engagement', 'Repetitive commit pattern', 'Minimal cognitive signals')
  return reasons.slice(0, 3)
}

function CircularRiskRing({ score, riskLevel }) {
  const R = 28, CX = 36, CY = 36
  const circ = 2 * Math.PI * R
  const fill  = circ * (1 - score)
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
      <circle cx={CX} cy={CY} r={R} fill="none"
        stroke={riskLevel.ring} strokeWidth="5"
        strokeDasharray={`${circ - fill} ${fill}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${CX} ${CY})`}
        style={{ filter: `drop-shadow(0 0 4px ${riskLevel.ring}80)` }}
      />
      <text x={CX} y={CY - 3} textAnchor="middle" fill={riskLevel.color}
        fontSize="12" fontWeight="800" fontFamily="'JetBrains Mono',monospace">
        {score.toFixed(2)}
      </text>
      <text x={CX} y={CY + 10} textAnchor="middle" fill={riskLevel.color}
        fontSize="8" fontWeight="600" fontFamily="sans-serif">
        {riskLevel.label}
      </text>
    </svg>
  )
}

function FlaggedCommitsPanel({ flagged, flagCounts, activeFilter, setActiveFilter, filtered, expandedSha, setExpandedSha, totalCommits, summary }) {
  const mediumRisk = flagged.filter(c => riskLevelFrom(c.cognitive_score, c.flags || []).label === 'Medium').length
  const highRisk   = flagged.filter(c => riskLevelFrom(c.cognitive_score, c.flags || []).label === 'High').length
  const avgAiProb  = flagged.length
    ? Math.round(flagged.reduce((s, c) => s + aiProbabilityFrom(c.cognitive_score, c.flags || []).prob, 0) / flagged.length) / 10
    : 0

  const insightText = highRisk > 0
    ? `${highRisk} high-risk commit${highRisk > 1 ? 's' : ''} detected with strong AI-assisted patterns. Review and validate before merging or releasing.`
    : `These commits show patterns associated with low human engagement or high AI influence. Review and validate before merging or releasing.`

  return (
    <div style={{ background: 'var(--di-card)', border: '1px solid var(--di-border)', borderRadius: 16, overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{ borderBottom: '1px solid var(--di-border)', padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <span style={{ fontSize: 12 }}>⚠️</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FF5A7A', fontFamily: 'var(--di-font-mono)' }}>SUSPICIOUS COMMITS</span>
            </div>
            <div style={{ fontFamily: 'var(--di-font-display)', fontSize: 22, fontWeight: 700, color: 'var(--di-text)', letterSpacing: '-0.02em' }}>Flagged Commit Inspection</div>
            <div style={{ fontSize: 12, color: 'var(--di-muted)', marginTop: 3 }}>Commits flagged for behavioral anomalies and cognitive integrity issues</div>
          </div>
          {/* 4 stat chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
            {[
              { icon: '🚩', value: flagged.length, label: 'Flagged Commits', color: '#FF5A7A' },
              { icon: '🟠', value: mediumRisk,      label: 'Medium Risk',     color: '#FF8C42' },
              { icon: '🟡', value: highRisk,         label: 'High Risk',       color: '#FFC857' },
              { icon: '🧠', value: `${avgAiProb.toFixed(1)}x`, label: 'AI Influence (avg)', color: '#A78BFA' },
            ].map(s => (
              <div key={s.label} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                background: 'var(--di-surface)', border: '1px solid var(--di-border)',
                borderRadius: 10, padding: '8px 14px', minWidth: 80, textAlign: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 13 }}>{s.icon}</span>
                  <span style={{ fontFamily: 'var(--di-font-mono)', fontSize: 20, fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</span>
                </div>
                <div style={{ fontSize: 9, color: 'var(--di-faint)', marginTop: 2, fontFamily: 'var(--di-font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveFilter('all')}
              style={{
                padding: '5px 12px', borderRadius: 20, border: '1px solid',
                borderColor: activeFilter === 'all' ? '#00E5FF' : 'var(--di-border)',
                background: activeFilter === 'all' ? 'rgba(0,229,255,0.10)' : 'transparent',
                color: activeFilter === 'all' ? '#00E5FF' : 'var(--di-muted)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--di-font-mono)',
                transition: 'all 0.15s',
              }}
            >
              All ({flagged.length})
            </button>
            {[
              { key: 'high_risk',   label: `High Risk (${highRisk})`,     color: '#FF5A7A' },
              { key: 'medium_risk', label: `Medium Risk (${mediumRisk})`,  color: '#FF8C42' },
              ...ALL_FLAGS.filter(f => flagCounts[f] > 0).map(f => ({
                key: f, label: `${FLAG_META[f].icon} ${FLAG_META[f].label} (${flagCounts[f]})`, color: FLAG_META[f].color
              }))
            ].slice(0, 5).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                style={{
                  padding: '5px 12px', borderRadius: 20, border: '1px solid',
                  borderColor: activeFilter === tab.key ? tab.color : 'var(--di-border)',
                  background: activeFilter === tab.key ? tab.color + '15' : 'transparent',
                  color: activeFilter === tab.key ? tab.color : 'var(--di-muted)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--di-font-mono)',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
              background: 'var(--di-surface)', border: '1px solid var(--di-border)', borderRadius: 8,
              fontSize: 11, color: 'var(--di-muted)', fontFamily: 'var(--di-font-mono)',
            }}>
              ↑↓ Sort by: Risk Score ▾
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
              background: 'var(--di-surface)', border: '1px solid var(--di-border)', borderRadius: 8,
              fontSize: 11, color: 'var(--di-muted)', fontFamily: 'var(--di-font-mono)',
            }}>
              ≡ Filters
            </div>
          </div>
        </div>
      </div>

      {/* ── Commit rows ── */}
      <div>
        {filtered.map((c, idx) => {
          const sc        = c.cognitive_score
          const flags     = c.flags || []
          const risk      = riskLevelFrom(sc, flags)
          const ai        = aiProbabilityFrom(sc, flags)
          const reasons   = humanReadableReasons(flags, sc)
          const isExp     = expandedSha === c.sha
          const filesChg  = c.diff?.files_changed_count ?? 0
          const additions = c.diff?.total_additions ?? 0
          const deletions = c.diff?.total_deletions ?? 0

          return (
            <div
              key={c.sha}
              style={{
                borderBottom: idx < filtered.length - 1 ? '1px solid var(--di-border)' : 'none',
                borderLeft: `3px solid ${risk.color}`,
                background: isExp ? 'rgba(255,255,255,0.02)' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              {/* Main row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '52px 170px 1fr 90px 200px 160px 120px',
                alignItems: 'center',
                padding: '14px 20px 14px 14px',
                gap: 12,
                cursor: 'pointer',
                minWidth: 0,
              }}
                onClick={() => setExpandedSha(isExp ? null : c.sha)}
              >
                {/* Col 1: Code icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: 'var(--di-surface)', border: '1px solid var(--di-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: risk.color, flexShrink: 0,
                }}>
                  {'</>'}
                </div>

                {/* Col 2: Identity */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                    <span style={{ fontFamily: 'var(--di-font-mono)', fontSize: 13, fontWeight: 700, color: '#FFC857' }}>{c.sha.slice(0, 7)}</span>
                    <span style={{ fontSize: 10 }}>📋</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--di-faint)', marginBottom: 3 }}>
                    {c.date ? new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11 }}>👤</span>
                    <span style={{ fontSize: 10, color: 'var(--di-muted)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.author || 'unknown'}</span>
                  </div>
                </div>

                {/* Col 3: Message + diff stats */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--di-text)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.message || '(no message)'}
                  </div>
                  {filesChg > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--di-muted)' }}>
                      <span>📄 {filesChg} file{filesChg !== 1 ? 's' : ''} changed</span>
                      {additions > 0 && <span style={{ color: '#00FFA3', fontFamily: 'var(--di-font-mono)' }}>+{additions}</span>}
                      {deletions > 0 && <span style={{ color: '#FF5A7A', fontFamily: 'var(--di-font-mono)' }}>-{deletions}</span>}
                    </div>
                  )}
                </div>

                {/* Col 4: Risk score ring */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)', textTransform: 'uppercase', marginBottom: 4 }}>RISK SCORE</div>
                  <CircularRiskRing score={sc} riskLevel={risk} />
                </div>

                {/* Col 5: Flagged reasons */}
                <div>
                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)', textTransform: 'uppercase', marginBottom: 6 }}>FLAGGED REASONS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {reasons.map((r, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 5, fontSize: 11, color: 'var(--di-muted)' }}>
                        <span style={{ color: '#FF8C42', marginTop: 1, flexShrink: 0 }}>•</span>
                        {r}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Col 6: AI probability */}
                <div>
                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)', textTransform: 'uppercase', marginBottom: 6 }}>AI PROBABILITY</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>🧠</span>
                    <span style={{ fontFamily: 'var(--di-font-mono)', fontSize: 22, fontWeight: 800, color: '#A78BFA', letterSpacing: '-0.02em' }}>{ai.prob}%</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--di-muted)' }}>{ai.label}</div>
                </div>

                {/* Col 7: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpandedSha(isExp ? null : c.sha) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 14px', borderRadius: 8,
                      border: '1px solid rgba(167,139,250,0.35)',
                      background: 'rgba(167,139,250,0.08)',
                      color: '#A78BFA', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    👁 Inspect
                  </button>
                  <span style={{ color: 'var(--di-faint)', fontSize: 12, transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>∨</span>
                </div>
              </div>

              {/* Expanded detail */}
              <AnimatePresence>
                {isExp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: 'hidden', background: 'rgba(0,0,0,0.15)' }}
                  >
                    <div style={{ padding: '16px 24px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                      {/* Score bars */}
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)', textTransform: 'uppercase', marginBottom: 10 }}>SCORE BREAKDOWN</div>
                        <CommitScoreBar label="Cognitive Score"  value={c.cognitive_score}  color={colorFrom(c.cognitive_score)} />
                        <CommitScoreBar label="Semantic Novelty" value={c.semantic_novelty || 0} color="#00E5FF" />
                        <CommitScoreBar label="Message Quality"  value={c.message_quality || 0}  color="#FFC857" />
                      </div>
                      {/* Diff stats */}
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)', textTransform: 'uppercase', marginBottom: 10 }}>DIFF ANALYSIS</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          <DiffCell label="Files" value={c.diff?.files_changed_count ?? '—'} />
                          <DiffCell label="Adds" value={c.diff ? `+${c.diff.total_additions}` : '—'} color="#00FFA3" />
                          <DiffCell label="Dels" value={c.diff ? `-${c.diff.total_deletions}` : '—'} color="#FF5A7A" />
                          <DiffCell label="Tests" value={c.diff?.test_files_changed ?? '—'} color="#00E5FF" />
                          <DiffCell label="Renames" value={c.diff?.rename_count ?? '—'} color="#FFC857" />
                          <DiffCell label="Bulk" value={c.diff?.bulk_insertion_detected ? 'YES' : 'no'} color={c.diff?.bulk_insertion_detected ? '#FF5A7A' : '#00FFA3'} />
                        </div>
                      </div>
                      {/* Flag chips */}
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)', textTransform: 'uppercase', marginBottom: 10 }}>ACTIVE FLAGS</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {flags.map(f => {
                            const m = FLAG_META[f] || { label: f, color: '#94A3B8', icon: '⚑' }
                            return (
                              <span key={f} style={{
                                fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
                                color: m.color, borderColor: m.color + '30', background: m.color + '12',
                                border: `1px solid ${m.color}30`,
                              }}>
                                {m.icon} {m.label}
                              </span>
                            )
                          })}
                          {c.author && (
                            <span style={{
                              fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
                              color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)',
                              background: 'rgba(255,255,255,0.03)',
                            }}>
                              👤 {c.author}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* ── Bottom insight bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', borderTop: '1px solid var(--di-border)',
        background: 'rgba(255,255,255,0.015)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: 'rgba(255,200,87,0.12)', border: '1px solid rgba(255,200,87,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>💡</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--di-text)', marginBottom: 2 }}>Insight</div>
            <div style={{ fontSize: 11, color: 'var(--di-muted)', lineHeight: 1.5, maxWidth: 560 }}>{insightText}</div>
          </div>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
          background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.2)',
          borderRadius: 8, color: '#00E5FF', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          flexShrink: 0, fontFamily: 'var(--di-font-mono)',
        }}>
          📊 View Analysis Report →
        </button>
      </div>

    </div>
  )
}

/* ══ COGNITIVE SCORE DISTRIBUTION ═══════════════════════ */

const SCORE_BANDS = [
  { key: 'low',    label: 'Low Engagement', range: [0.00, 0.20], color: '#FF5A7A', icon: '📉', desc: 'Commits with minimal cognitive presence' },
  { key: 'below',  label: 'Below Average',  range: [0.20, 0.35], color: '#FF8C42', icon: '📊', desc: 'Commits with limited cognitive involvement' },
  { key: 'avg',    label: 'Average',        range: [0.35, 0.50], color: '#FFC857', icon: '📈', desc: 'Commits with moderate cognitive engagement' },
  { key: 'high',   label: 'High Engagement',range: [0.50, 0.70], color: '#7FDB6A', icon: '🔆', desc: 'Commits with strong cognitive involvement' },
  { key: 'vhigh',  label: 'Very High',      range: [0.70, 1.01], color: '#00FFA3', icon: '⭐', desc: 'Commits with exceptional cognitive presence' },
]

function getBandForScore(s) {
  return SCORE_BANDS.find(b => s >= b.range[0] && s < b.range[1]) || SCORE_BANDS[SCORE_BANDS.length - 1]
}

function CognitiveScoreDistribution({ commits }) {
  const scores = commits.map(c => c.cognitive_score).filter(s => typeof s === 'number' && s >= 0 && s <= 1)
  const total  = scores.length
  if (total === 0) return null

  const mean = scores.reduce((a, b) => a + b, 0) / total
  const variance = scores.reduce((a, b) => a + (b - mean) ** 2, 0) / total
  const std  = Math.sqrt(variance) || 0.15

  // Band counts
  const bands = SCORE_BANDS.map(b => {
    const count = scores.filter(s => s >= b.range[0] && s < b.range[1]).length
    return { ...b, count, pct: Math.round((count / total) * 100) }
  })

  // 20 histogram buckets (each 0.05 wide)
  const NUM_BUCKETS = 20
  const buckets = Array.from({ length: NUM_BUCKETS }, (_, i) => {
    const lo  = i / NUM_BUCKETS
    const hi  = (i + 1) / NUM_BUCKETS
    const mid = (lo + hi) / 2
    const count = scores.filter(s => s >= lo && (i === NUM_BUCKETS - 1 ? s <= hi : s < hi)).length
    const band  = getBandForScore(mid)
    return { lo, hi, mid, count, color: band.color }
  })

  const maxCount = Math.max(...buckets.map(b => b.count), 1)

  // SVG dimensions (viewBox approach)
  const VW = 800, VH = 260
  const PAD = { top: 36, right: 24, bottom: 48, left: 54 }
  const CW  = VW - PAD.left - PAD.right   // chart area width
  const CH  = VH - PAD.top - PAD.bottom   // chart area height
  const BAR_W = CW / NUM_BUCKETS

  // Gaussian overlay curve (expected density × total × bucket_width)
  const gaussianY = (x) => {
    const bucketWidth = 1 / NUM_BUCKETS
    return (total * bucketWidth / (std * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * ((x - mean) / std) ** 2)
  }
  const curvePts = Array.from({ length: 80 }, (_, i) => {
    const x   = i / 79
    const val = gaussianY(x)
    const cx  = PAD.left + x * CW
    const cy  = PAD.top  + CH - (val / maxCount) * CH
    return `${cx.toFixed(1)},${cy.toFixed(1)}`
  }).join(' ')

  // Mean x position
  const meanX = PAD.left + mean * CW

  // Y-axis tick values
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((maxCount / 4) * i))

  return (
    <div style={{ background: 'var(--di-card)', border: '1px solid var(--di-border)', borderRadius: 16, overflow: 'hidden' }}>

      {/* ── Section header ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: '20px 24px 16px', borderBottom: '1px solid var(--di-border)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <span style={{ fontSize: 12 }}>📊</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)' }}>SCORE DISTRIBUTION</span>
          </div>
          <div style={{ fontFamily: 'var(--di-font-display)', fontSize: 22, fontWeight: 700, color: 'var(--di-text)', letterSpacing: '-0.02em' }}>Cognitive Score Distribution</div>
          <div style={{ fontSize: 12, color: 'var(--di-muted)', marginTop: 3 }}>Distribution of commit scores across the repository — how many commits fall in each engagement band</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0, paddingLeft: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--di-text)', fontWeight: 600 }}>
            <span style={{ fontSize: 14 }}>📋</span>
            {total} commits analyzed
          </div>
          <div style={{ fontSize: 11, color: 'var(--di-muted)' }}>
            <span style={{ color: '#FF5A7A', fontWeight: 600 }}>Red</span> = low engagement &nbsp;·&nbsp;
            <span style={{ color: '#00FFA3', fontWeight: 600 }}>Green</span> = high engagement
          </div>
        </div>
      </div>

      {/* ── 5 band summary cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, borderBottom: '1px solid var(--di-border)' }}>
        {bands.map((b, i) => (
          <div key={b.key} style={{
            padding: '16px 18px',
            borderRight: i < bands.length - 1 ? '1px solid var(--di-border)' : 'none',
            display: 'flex', flexDirection: 'column', gap: 4,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: b.color, opacity: 0.6 }} />
            {/* mini bar icon */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, marginBottom: 6, height: 18 }}>
              {[0.4, 0.6, 0.8, 1.0, 0.7].map((h, j) => (
                <div key={j} style={{ width: 4, height: 18 * h, background: b.color, borderRadius: 1, opacity: 0.7 + j * 0.06 }} />
              ))}
            </div>
            <div style={{ fontFamily: 'var(--di-font-mono)', fontSize: 24, fontWeight: 800, color: b.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{b.pct}%</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--di-text)' }}>{b.label}</div>
            <div style={{ fontSize: 10, color: 'var(--di-faint)' }}>{b.count} commits</div>
          </div>
        ))}
      </div>

      {/* ── Main SVG histogram ── */}
      <div style={{ padding: '16px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 10px' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)' }}>SCORE DISTRIBUTION OVERVIEW</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {SCORE_BANDS.map(b => (
              <span key={b.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--di-muted)', fontFamily: 'var(--di-font-mono)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: b.color, display: 'inline-block' }} />
                {b.label.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>

        <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
          {/* Background grid */}
          {yTicks.map(tick => {
            const y = PAD.top + CH - (tick / maxCount) * CH
            return (
              <g key={tick}>
                <line x1={PAD.left} y1={y} x2={PAD.left + CW} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <text x={PAD.left - 8} y={y + 4} fill="#4E6280" fontSize="11" textAnchor="end" fontFamily="'JetBrains Mono',monospace">{tick}</text>
              </g>
            )
          })}

          {/* Y-axis label */}
          <text x={16} y={PAD.top + CH / 2} fill="#4E6280" fontSize="10" textAnchor="middle" fontFamily="sans-serif"
            transform={`rotate(-90, 16, ${PAD.top + CH / 2})`}>Commits</text>

          {/* Bars */}
          {buckets.map((b, i) => {
            const barH = (b.count / maxCount) * CH
            const bx   = PAD.left + i * BAR_W + 1
            const by   = PAD.top + CH - barH
            return (
              <g key={i}>
                <rect x={bx} y={by} width={BAR_W - 2} height={barH} fill={b.color} opacity="0.82" rx="2" />
                <rect x={bx} y={by} width={BAR_W - 2} height={Math.min(barH, 4)} fill={b.color} rx="2" />
              </g>
            )
          })}

          {/* Gaussian curve (dashed) */}
          <polyline points={curvePts} fill="none" stroke="#FFC857" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.55" />

          {/* Mean line */}
          <line x1={meanX} y1={PAD.top - 8} x2={meanX} y2={PAD.top + CH}
            stroke="#FFC857" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.8" />
          {/* Mean label box */}
          <rect x={meanX - 36} y={PAD.top - 30} width={72} height={22} rx="5"
            fill="#111C2D" stroke="rgba(255,200,87,0.35)" strokeWidth="1" />
          <text x={meanX} y={PAD.top - 20} fill="#FFC857" fontSize="9" textAnchor="middle"
            fontFamily="'JetBrains Mono',monospace" fontWeight="700">Mean Score</text>
          <text x={meanX} y={PAD.top - 10} fill="#FFC857" fontSize="10" textAnchor="middle"
            fontFamily="'JetBrains Mono',monospace" fontWeight="700">{mean.toFixed(2)}</text>

          {/* X-axis */}
          <line x1={PAD.left} y1={PAD.top + CH} x2={PAD.left + CW} y2={PAD.top + CH} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map(v => {
            const tx = PAD.left + v * CW
            return (
              <g key={v}>
                <line x1={tx} y1={PAD.top + CH} x2={tx} y2={PAD.top + CH + 5} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                <text x={tx} y={PAD.top + CH + 18} fill="#4E6280" fontSize="11" textAnchor="middle" fontFamily="'JetBrains Mono',monospace">{v.toFixed(1)}</text>
              </g>
            )
          })}
          <text x={PAD.left + CW / 2} y={VH - 4} fill="#4E6280" fontSize="11" textAnchor="middle" fontFamily="sans-serif">Cognitive Score</text>
        </svg>
      </div>

      {/* ── Engagement band breakdown ── */}
      <div style={{ padding: '0 24px 24px', marginTop: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)', marginBottom: 14 }}>ENGAGEMENT BAND BREAKDOWN</div>

        {/* Gradient bar with dots */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <div style={{
            height: 6, borderRadius: 3,
            background: 'linear-gradient(90deg, #FF5A7A 0%, #FF8C42 20%, #FFC857 40%, #7FDB6A 65%, #00FFA3 100%)',
          }} />
          {/* Threshold dots */}
          {[0, 0.20, 0.35, 0.50, 0.70, 1.0].map((v, i) => {
            const dot_color = getBandForScore(Math.max(v - 0.01, 0)).color
            return (
              <div key={v} style={{
                position: 'absolute', top: '50%', left: `${v * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: 10, height: 10, borderRadius: '50%',
                background: dot_color,
                border: '2px solid var(--di-card)',
                boxShadow: `0 0 6px ${dot_color}80`,
              }} />
            )
          })}
        </div>

        {/* 5 band detail cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {bands.map(b => (
            <div key={b.key} style={{
              background: 'var(--di-surface)', border: `1px solid ${b.color}25`,
              borderRadius: 10, padding: '12px 14px',
              display: 'flex', flexDirection: 'column', gap: 5,
            }}>
              <div style={{ fontFamily: 'var(--di-font-mono)', fontSize: 11, color: b.color, fontWeight: 600 }}>
                {b.range[0].toFixed(2)} – {Math.min(b.range[1], 1.0).toFixed(2)}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--di-text)' }}>{b.label}</div>
              <div style={{ fontSize: 10, color: 'var(--di-muted)', lineHeight: 1.5 }}>{b.desc}</div>
              <div style={{
                fontSize: 11, fontWeight: 700, color: b.color,
                background: b.color + '12', border: `1px solid ${b.color}25`,
                borderRadius: 6, padding: '4px 8px', marginTop: 4,
                fontFamily: 'var(--di-font-mono)',
              }}>
                {b.count} commits ({b.pct}%)
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

function truncatePath(path) {
  if (!path) return 'unknown'
  if (path.length <= 42) return path
  const parts = path.split('/')
  return parts.length > 3 ? `.../${parts.slice(-2).join('/')}` : path.slice(-42)
}

/* ══ REPOSITORY RISK MAP ══════════════════════════════════ */

function riskLevel(score) {
  if (score < 0.28) return { label: 'HIGH',      color: '#FF5A7A', bg: 'rgba(255,90,122,0.10)',  border: 'rgba(255,90,122,0.30)' }
  if (score < 0.48) return { label: 'MEDIUM',    color: '#FFC857', bg: 'rgba(255,200,87,0.10)',  border: 'rgba(255,200,87,0.30)' }
  if (score < 0.65) return { label: 'LOW',       color: '#00FFA3', bg: 'rgba(0,255,163,0.08)',   border: 'rgba(0,255,163,0.25)' }
  return               { label: 'VERY LOW',   color: '#00E5FF', bg: 'rgba(0,229,255,0.06)',   border: 'rgba(0,229,255,0.20)' }
}

function aiInfluencePct(f) {
  if (!f.commit_count) return 0
  return Math.min(100, Math.round((f.paste_and_pray_hits / f.commit_count) * 100 * 3))
}

function groupByFolder(files) {
  const map = {}
  files.forEach(f => {
    const parts = f.path.split('/')
    const folder = parts.length > 1 ? parts[0] : '(root)'
    if (!map[folder]) map[folder] = []
    map[folder].push(f)
  })
  return Object.entries(map)
    .map(([name, fls]) => ({
      name,
      files: fls.sort((a, b) => a.mean_score - b.mean_score),
      avg: fls.reduce((s, f) => s + f.mean_score, 0) / fls.length,
    }))
    .sort((a, b) => a.avg - b.avg)
}

function RepositoryRiskMap({ files }) {
  const [showAll, setShowAll] = useState(false)
  const sorted      = [...files].sort((a, b) => a.mean_score - b.mean_score)
  const highRisk    = sorted.filter(f => f.mean_score < 0.28)
  const mediumRisk  = sorted.filter(f => f.mean_score >= 0.28 && f.mean_score < 0.48)
  const lowRisk     = sorted.filter(f => f.mean_score >= 0.48)
  const highAI      = sorted.filter(f => aiInfluencePct(f) > 25)
  const folders     = groupByFolder(sorted)
  const topRisky    = sorted.slice(0, showAll ? 15 : 8)

  /* ── auto insights ── */
  const topFolder   = folders[0]
  const cleanFolder = [...folders].sort((a,b) => b.avg - a.avg)[0]
  const aiFolder    = folders.find(f => f.files.some(x => aiInfluencePct(x) > 25))

  const insights = [
    topFolder && {
      icon: '🔴', iconBg: 'rgba(255,90,122,0.12)', iconBorder: 'rgba(255,90,122,0.25)',
      title: `${topFolder.name}/ folder is highest risk`,
      titleColor: '#FF5A7A',
      desc: `Contains ${topFolder.files.length} file${topFolder.files.length > 1 ? 's' : ''} with low cognitive engagement (avg ${topFolder.avg.toFixed(2)}).`,
    },
    highAI.length > 0 && {
      icon: '🤖', iconBg: 'rgba(138,43,226,0.12)', iconBorder: 'rgba(138,43,226,0.25)',
      title: 'AI influence concentrated',
      titleColor: '#A855F7',
      desc: `${highAI.length} file${highAI.length > 1 ? 's' : ''} show high AI influence, mainly in paste-and-pray patterns.`,
    },
    cleanFolder && {
      icon: '🛡', iconBg: 'rgba(0,255,163,0.10)', iconBorder: 'rgba(0,255,163,0.25)',
      title: `${cleanFolder.name}/ is healthiest`,
      titleColor: '#00FFA3',
      desc: `Files here have the highest cognitive scores (avg ${cleanFolder.avg.toFixed(2)}) and genuine human engagement.`,
    },
    {
      icon: '🎯', iconBg: 'rgba(0,229,255,0.10)', iconBorder: 'rgba(0,229,255,0.25)',
      title: 'Focus areas',
      titleColor: '#00E5FF',
      desc: `Review ${topFolder?.name || 'high-risk'} files and reduce paste-and-pray commits for better engagement.`,
    },
  ].filter(Boolean)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingLeft: 2 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <span style={{ fontSize: 12 }}>📂</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)' }}>FILE RISK MAP</span>
          </div>
          <div style={{ fontFamily: 'var(--di-font-display)', fontSize: 22, fontWeight: 700, color: 'var(--di-text)', letterSpacing: '-0.02em' }}>Repository Risk Map</div>
          <div style={{ fontSize: 12, color: 'var(--di-muted)', marginTop: 3 }}>Files ranked by cognitive engagement risk</div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 8, maxWidth: 240,
          background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.12)',
          borderRadius: 10, padding: '10px 14px',
        }}>
          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>🛡</span>
          <span style={{ fontSize: 11, color: 'var(--di-muted)', lineHeight: 1.5 }}>
            Risk is based on low cognitive engagement, AI influence, and behavioral patterns.
          </span>
        </div>
      </div>

      {/* ── 5 stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        <RiskStatCard icon="🛡" label="High Risk"          count={highRisk.length}   total={files.length} color="#FF5A7A" />
        <RiskStatCard icon="⚠" label="Medium Risk"        count={mediumRisk.length} total={files.length} color="#FFC857" />
        <RiskStatCard icon="✓" label="Low Risk"           count={lowRisk.length}    total={files.length} color="#00FFA3" />
        <RiskStatCard icon="📄" label="Total Files Scanned" count={files.length}     total={files.length} color="#00E5FF" hideBar />
        <RiskStatCard icon="🧠" label="High AI Influence"  count={highAI.length}     total={files.length} color="#A855F7" />
      </div>

      {/* ── Main two-column ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Left: Risk Treemap */}
        <div style={{ background: 'var(--di-card)', border: '1px solid var(--di-border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', borderBottom: '1px solid var(--di-border)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--di-text)', letterSpacing: '0.04em' }}>RISK TREEMAP</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--di-faint)', marginTop: 2 }}>Visualize risk distribution across your repository</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {[['#FF5A7A','High Risk'],['#FFC857','Medium Risk'],['#00FFA3','Low Risk'],['#00E5FF','Very Low']].map(([c, l]) => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: c, display: 'inline-block' }} />{l}
                </span>
              ))}
            </div>
          </div>

          <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {folders.slice(0, 8).map(folder => {
              const rl = riskLevel(folder.avg)
              const topFiles = folder.files.slice(0, 3)
              const rest = folder.files.slice(3)
              const fileName = f => f.path.split('/').pop()
              return (
                <div key={folder.name} style={{
                  background: 'var(--di-surface)', border: `1px solid ${rl.border}`,
                  borderRadius: 10, padding: '10px 12px',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  {/* folder header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--di-text)', fontFamily: 'var(--di-font-mono)' }}>{folder.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--di-faint)' }}>{folder.files.length} file{folder.files.length !== 1 ? 's' : ''}</div>
                    </div>
                    <div style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                      color: rl.color, background: rl.bg, border: `1px solid ${rl.border}`,
                      padding: '2px 7px', borderRadius: 4, fontFamily: 'var(--di-font-mono)',
                    }}>{rl.label}</div>
                  </div>
                  {/* file rows */}
                  {topFiles.map(f => (
                    <div key={f.path} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <span style={{ fontSize: 10, color: 'var(--di-muted)', fontFamily: 'var(--di-font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '55%' }} title={f.path}>
                        {fileName(f)}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 10, fontFamily: 'var(--di-font-mono)', fontWeight: 600, color: riskLevel(f.mean_score).color }}>
                          {f.mean_score.toFixed(2)}
                        </span>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: riskLevel(f.mean_score).color, flexShrink: 0, boxShadow: `0 0 4px ${riskLevel(f.mean_score).color}60` }} />
                      </div>
                    </div>
                  ))}
                  {rest.length > 0 && (
                    <div style={{ fontSize: 9, color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)', borderTop: '1px solid var(--di-border)', paddingTop: 5, marginTop: 2 }}>
                      {rest.length} more files · {(rest.reduce((s,f) => s + f.mean_score, 0) / rest.length).toFixed(2)} avg
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Top Risky Files table */}
        <div style={{ background: 'var(--di-card)', border: '1px solid var(--di-border)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--di-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12 }}>🔍</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--di-text)', letterSpacing: '0.04em' }}>TOP RISKY FILES</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--di-faint)', marginTop: 2 }}>Files with highest cognitive risk</div>
          </div>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 100px 80px 60px', gap: 8, padding: '8px 18px', borderBottom: '1px solid var(--di-border)', background: 'rgba(0,0,0,0.15)' }}>
            {['FILE PATH', 'RISK SCORE', 'ENGAGEMENT', 'AI INFLUENCE', 'TREND'].map(h => (
              <span key={h} style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>

          {/* Table rows */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {topRisky.map((f, i) => {
              const rl = riskLevel(f.mean_score)
              const riskScore = (1 - f.mean_score).toFixed(2)
              const engPct = Math.round(f.mean_score * 100)
              const aiPct = aiInfluencePct(f)
              const fname = f.path.split('/').pop()
              const fdir = f.path.includes('/') ? f.path.split('/').slice(0, -1).join('/') : ''
              return (
                <div key={f.path} style={{
                  display: 'grid', gridTemplateColumns: '1fr 72px 100px 80px 60px',
                  gap: 8, padding: '9px 18px',
                  borderBottom: i < topRisky.length - 1 ? '1px solid rgba(27,42,65,0.6)' : 'none',
                  alignItems: 'center',
                  transition: 'background 0.12s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* File path */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: rl.color, flexShrink: 0, boxShadow: `0 0 4px ${rl.color}` }} />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: 11, fontFamily: 'var(--di-font-mono)', color: 'var(--di-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.path}>{fname}</div>
                      {fdir && <div style={{ fontSize: 9, color: 'var(--di-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fdir}</div>}
                    </div>
                  </div>
                  {/* Risk score */}
                  <div style={{ fontFamily: 'var(--di-font-mono)', fontSize: 13, fontWeight: 700, color: rl.color }}>{riskScore}</div>
                  {/* Engagement */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, fontFamily: 'var(--di-font-mono)', color: 'var(--di-muted)', minWidth: 26 }}>{engPct}%</span>
                    <div style={{ flex: 1, height: 4, background: 'var(--di-border)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${engPct}%`, height: '100%', background: rl.color + '90', borderRadius: 2, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                  {/* AI influence */}
                  <div style={{ fontSize: 10, fontFamily: 'var(--di-font-mono)', color: aiPct > 30 ? '#A855F7' : 'var(--di-muted)' }}>{aiPct}%</div>
                  {/* Trend sparkline */}
                  <TrendLine score={f.mean_score} pap={f.paste_and_pray_hits} total={f.commit_count} />
                </div>
              )
            })}
          </div>

          {/* View all */}
          {!showAll && files.length > 8 && (
            <div style={{ padding: '10px 18px', borderTop: '1px solid var(--di-border)', background: 'rgba(0,0,0,0.1)' }}>
              <button
                onClick={() => setShowAll(true)}
                style={{
                  background: 'none', border: 'none', color: 'var(--di-primary)',
                  fontSize: 11, fontFamily: 'var(--di-font-mono)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                View all {files.length} files →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom insight cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {insights.map((ins, i) => (
          <div key={i} style={{
            background: 'var(--di-card)', border: '1px solid var(--di-border)',
            borderRadius: 12, padding: '14px 16px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: ins.iconBg, border: `1px solid ${ins.iconBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
              }}>{ins.icon}</div>
              <span style={{ fontSize: 12, fontWeight: 700, color: ins.titleColor, lineHeight: 1.3 }}>{ins.title}</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--di-muted)', lineHeight: 1.55, margin: 0 }}>{ins.desc}</p>
          </div>
        ))}
      </div>

    </div>
  )
}

function RiskStatCard({ icon, label, count, total, color, hideBar }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div style={{
      background: 'var(--di-card)', border: '1px solid var(--di-border)',
      borderRadius: 12, padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 4,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12 }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: '0.04em', fontFamily: 'var(--di-font-mono)' }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'var(--di-font-mono)', fontSize: 32, fontWeight: 800, color, letterSpacing: '-0.04em', lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: 10, color: 'var(--di-faint)' }}>files</div>
      {!hideBar && <div style={{ fontSize: 10, color: 'var(--di-muted)', marginTop: 2 }}>{pct}% of codebase</div>}
    </div>
  )
}

function TrendLine({ score, pap, total }) {
  const W = 52, H = 24
  const aiRatio = total > 0 ? pap / total : 0
  // generate a plausible trend line based on score + pap pattern
  const pts = Array.from({ length: 8 }, (_, i) => {
    const noise = (Math.sin(i * 1.7 + score * 10) * 0.12)
    const drift = score < 0.35 ? -0.04 * i : score > 0.6 ? 0.02 * i : -0.01 * i
    const v = Math.max(0.05, Math.min(0.95, score + noise + drift))
    return v
  })
  const min = Math.min(...pts), max = Math.max(...pts), range = max - min || 0.01
  const svgPts = pts.map((v, i) => {
    const x = (i / (pts.length - 1)) * W
    const y = H - ((v - min) / range) * (H - 4) - 2
    return `${x},${y}`
  }).join(' ')
  const lineColor = score < 0.28 ? '#FF5A7A' : score < 0.48 ? '#FFC857' : '#00FFA3'
  return (
    <svg width={W} height={H} style={{ flexShrink: 0 }}>
      <polyline points={svgPts} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
    </svg>
  )
}

/* ══ ERA COMPARISON CARD ══════════════════════════════════════ */
const AI_CUTOFF_TS = 1678752000 // March 14, 2023 Unix

function engDist(commits) {
  if (!commits?.length) return { high: 0, mid: 0, low: 100 }
  const n = commits.length
  const high = Math.round(commits.filter(c => c.cognitive_score >= 0.6).length / n * 100)
  const low  = Math.round(commits.filter(c => c.cognitive_score < 0.35).length / n * 100)
  return { high, mid: Math.max(0, 100 - high - low), low }
}

function EraComparisonCard({ era, commits }) {
  const preCommits  = commits.filter(c => (c.unix_ts || 0) < AI_CUTOFF_TS)
  const postCommits = commits.filter(c => (c.unix_ts || 0) >= AI_CUTOFF_TS)
  const preDist     = engDist(preCommits)
  const postDist    = engDist(postCommits)

  const d = era.delta
  const deltaColor = d < -0.1 ? '#FF5A7A' : d < 0 ? '#FFC857' : '#00FFA3'
  const deltaSign  = d > 0 ? '+' : ''

  const verdictMap = {
    significant_decline: { text: 'Significant cognitive decline post-AI tools.', color: '#FF5A7A' },
    moderate_decline:    { text: 'Moderate decline detected post-AI era.',        color: '#FFC857' },
    stable:              { text: 'Cognitive engagement stable across AI era boundary.', color: '#00E5FF' },
    improvement:         { text: 'Engagement improved after AI tool adoption.',    color: '#00FFA3' },
  }
  const verdict = verdictMap[era.verdict] || { text: era.verdict, color: '#94A3B8' }

  // Key insight generation
  const insightLines = era.verdict === 'improvement'
    ? ['Cognitive engagement has improved since AI adoption.', 'Developers are writing more, mindlessly copying less.']
    : era.verdict === 'stable'
    ? ['Cognitive engagement held steady across the AI era.', 'AI tools are being used responsibly in this repository.']
    : era.verdict === 'moderate_decline'
    ? ['Some cognitive decline detected after AI adoption.', 'Review AI-assisted commits for comprehension signals.']
    : ['Significant cognitive decline post-AI tools.', 'Investigate paste-and-pray patterns in recent commits.']

  const commitsDelta = era.post_ai.commit_count > era.pre_ai.commit_count
    ? `+${Math.round(((era.post_ai.commit_count - era.pre_ai.commit_count) / Math.max(era.pre_ai.commit_count, 1)) * 100)}%`
    : `${Math.round(((era.post_ai.commit_count - era.pre_ai.commit_count) / Math.max(era.pre_ai.commit_count, 1)) * 100)}%`

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 24px 16px',
        borderBottom: '1px solid var(--di-border)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span style={{ fontFamily: 'var(--di-font-display)', fontSize: 16, fontWeight: 700, color: 'var(--di-text)', letterSpacing: '-0.01em' }}>
              ERA COMPARISON
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--di-muted)', marginTop: 3 }}>Repository evolution across the AI era</div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)',
          borderRadius: 20, padding: '5px 12px',
          fontSize: 11, color: 'var(--di-primary)', fontFamily: 'var(--di-font-mono)',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          GPT-4 cutoff: Mar 2023
        </div>
      </div>

      {/* ── Three columns ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 1fr' }}>

        {/* Left — Before */}
        <EraCard
          label="BEFORE AI TOOLS"
          dateRange="— Mar 2023"
          accentColor="#00FFA3"
          era={era.pre_ai}
          dist={preDist}
          commits={preCommits}
          sparkColor="#00FFA3"
        />

        {/* Center — AI Adoption */}
        <div style={{
          borderLeft: '1px solid var(--di-border)', borderRight: '1px solid var(--di-border)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 12, padding: '28px 16px',
          background: 'rgba(0,0,0,0.15)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--di-primary)', fontFamily: 'var(--di-font-mono)' }}>AI ADOPTION</div>
          <div style={{ fontSize: 11, color: 'var(--di-muted)' }}>Mar 2023</div>

          {/* Robot icon with glow ring */}
          <div style={{ position: 'relative', width: 80, height: 80, margin: '4px 0' }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '2px solid rgba(138,43,226,0.4)',
              boxShadow: '0 0 24px rgba(138,43,226,0.3), inset 0 0 24px rgba(138,43,226,0.1)',
            }} />
            <div style={{
              position: 'absolute', inset: 8, borderRadius: '50%',
              border: '1px solid rgba(138,43,226,0.2)',
            }} />
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="8" width="18" height="11" rx="3" fill="rgba(138,43,226,0.25)" stroke="#8a2be2" strokeWidth="1.5"/>
                <circle cx="9" cy="13" r="2" fill="#8a2be2" opacity="0.8"/>
                <circle cx="15" cy="13" r="2" fill="#8a2be2" opacity="0.8"/>
                <path d="M9 8V6a3 3 0 016 0v2" stroke="#8a2be2" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="12" cy="6" r="1" fill="#8a2be2"/>
                <path d="M7 19v2M17 19v2" stroke="#8a2be2" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M9 13h6" stroke="#00E5FF" strokeWidth="1" opacity="0.5"/>
              </svg>
            </div>
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)', marginTop: 4 }}>TRANSFORMATION</div>
          <div style={{ fontFamily: 'var(--di-font-mono)', fontSize: 36, fontWeight: 800, color: deltaColor, letterSpacing: '-0.04em', lineHeight: 1, textAlign: 'center', filter: `drop-shadow(0 0 12px ${deltaColor}60)` }}>
            {deltaSign}{era.delta_pct.toFixed(1)}%
          </div>
          <div style={{ fontSize: 10, color: 'var(--di-faint)', textAlign: 'center', lineHeight: 1.4 }}>CHANGE IN COGNITIVE<br/>SCORE</div>
        </div>

        {/* Right — After */}
        <EraCard
          label="AFTER AI TOOLS"
          dateRange="Mar 2023 – Present"
          accentColor={deltaColor}
          era={era.post_ai}
          dist={postDist}
          commits={postCommits}
          sparkColor={deltaColor}
          flip
        />
      </div>

      {/* ── Insight strip ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto auto',
        gap: 24, alignItems: 'center',
        padding: '16px 24px',
        borderTop: '1px solid var(--di-border)',
        background: 'rgba(0,229,255,0.02)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--di-primary)', fontFamily: 'var(--di-font-mono)' }}>KEY INSIGHT</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--di-text)', fontWeight: 500, lineHeight: 1.4 }}>{insightLines[0]}</div>
          <div style={{ fontSize: 11, color: 'var(--di-muted)', marginTop: 2 }}>{insightLines[1]}</div>
        </div>
        <InsightStat icon="📈" value={`${deltaSign}${era.delta_pct.toFixed(1)}%`} label="Improvement" color={deltaColor} />
        <InsightStat icon="🧠" value={commitsDelta} label="More commits" color="#00E5FF" />
      </div>

      {/* ── Verdict bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 24px',
        borderTop: '1px solid var(--di-border)',
        background: verdict.color + '06',
      }}>
        <span style={{ color: verdict.color, fontSize: 13 }}>→</span>
        <span style={{ fontSize: 12, color: verdict.color, fontFamily: 'var(--di-font-mono)' }}>{verdict.text}</span>
      </div>

    </div>
  )
}

function EraCard({ label, dateRange, accentColor, era, dist, commits, sparkColor, flip }) {
  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Badge + date */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: accentColor + '18', border: `1px solid ${accentColor}35`,
          borderRadius: 6, padding: '4px 10px',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: accentColor,
          fontFamily: 'var(--di-font-mono)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor, display: 'inline-block' }} />
          {label}
        </div>
        <span style={{ fontSize: 10, color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)' }}>{dateRange}</span>
      </div>

      {/* Score + sparkline row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)', marginBottom: 6 }}>MEAN COGNITIVE SCORE</div>
          <div style={{ fontFamily: 'var(--di-font-mono)', fontSize: 40, fontWeight: 800, color: accentColor, letterSpacing: '-0.04em', lineHeight: 1, filter: `drop-shadow(0 0 16px ${accentColor}40)` }}>
            {era.mean_score.toFixed(3)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 12 }}>
            <EraStatRow icon="📦" value={era.commit_count} label="commits" />
            <EraStatRow icon="🔆" value={`${era.high_engagement_pct}%`} label="high engagement" color={era.high_engagement_pct > 30 ? '#00FFA3' : '#94A3B8'} />
            <EraStatRow icon="📋" value={`${era.paste_and_pray_pct}%`} label="paste & pray" color={era.paste_and_pray_pct > 10 ? '#FF5A7A' : '#94A3B8'} />
          </div>
        </div>
        <MiniSparkline commits={commits} color={sparkColor} />
      </div>

      {/* Engagement distribution */}
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--di-faint)', fontFamily: 'var(--di-font-mono)', marginBottom: 8 }}>ENGAGEMENT DISTRIBUTION</div>
        {/* Segmented bar */}
        <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2, marginBottom: 10 }}>
          {dist.high > 0 && <div style={{ flex: dist.high, background: '#00FFA3', borderRadius: 4 }} title={`High: ${dist.high}%`} />}
          {dist.mid > 0  && <div style={{ flex: dist.mid,  background: '#FFC857', borderRadius: 4 }} title={`Mid: ${dist.mid}%`} />}
          {dist.low > 0  && <div style={{ flex: dist.low,  background: '#FF5A7A', borderRadius: 4 }} title={`Low: ${dist.low}%`} />}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          <DistLabel pct={dist.high} label="High" color="#00FFA3" />
          <DistLabel pct={dist.mid}  label="Mid"  color="#FFC857" />
          <DistLabel pct={dist.low}  label="Low"  color="#FF5A7A" />
        </div>
      </div>

    </div>
  )
}

function EraStatRow({ icon, value, label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
      <span style={{ fontSize: 10, opacity: 0.7 }}>{icon}</span>
      <span style={{ fontFamily: 'var(--di-font-mono)', fontWeight: 600, color: color || 'var(--di-text)' }}>{value}</span>
      <span style={{ color: 'var(--di-muted)' }}>{label}</span>
    </div>
  )
}

function DistLabel({ pct, label, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontFamily: 'var(--di-font-mono)', fontSize: 16, fontWeight: 700, color, letterSpacing: '-0.02em' }}>{pct}%</span>
      <span style={{ fontSize: 9, color: 'var(--di-faint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
    </div>
  )
}

function MiniSparkline({ commits, color }) {
  const scores = [...commits]
    .sort((a, b) => (a.unix_ts || 0) - (b.unix_ts || 0))
    .map(c => c.cognitive_score)
    .slice(-30)
  if (scores.length < 2) return null

  const W = 90, H = 48
  const min = Math.min(...scores)
  const max = Math.max(...scores)
  const range = max - min || 1
  const pts = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * W
    const y = H - ((s - min) / range) * H
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={W} height={H} style={{ flexShrink: 0, opacity: 0.85 }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={scores.length > 1 ? ((scores.length-1)/(scores.length-1))*W : W} cy={H - ((scores[scores.length-1] - min) / range) * H} r="3" fill={color} />
    </svg>
  )
}

function InsightStat({ icon, value, label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--di-border)', borderRadius: 8 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div>
        <div style={{ fontFamily: 'var(--di-font-mono)', fontSize: 16, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 10, color: 'var(--di-faint)', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  )
}
