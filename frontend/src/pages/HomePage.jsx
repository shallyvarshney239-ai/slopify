import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import DetectionSignalCard from '../components/DetectionSignalCard'
import AppLogo from '../components/AppLogo'
import HeroSignalPanel from '../components/HeroSignalPanel'
import { ROUTES } from '../config/routes'
import {
  validateRepoUrlFormat,
  validatePrUrlFormat,
  validateRepositoryWithApi,
  validatePullRequestWithApi,
  formatApiError,
} from '../utils/repositoryUrl'

/* === NEON CYBERPUNK ICONS === */
const IconPulse = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
)

const IconCircuit = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M2 12h5l2-5 4 10 2-5h5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
)

const IconNeural = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2.5" />
    <circle cx="5" cy="12" r="2.5" />
    <circle cx="19" cy="12" r="2.5" />
    <circle cx="8" cy="19" r="2.5" />
    <circle cx="16" cy="19" r="2.5" />
    <path d="M12 7.5v3M7 12h3M14 12h3M9.5 17l1.5-2M13.5 17l-1.5-2" />
  </svg>
)

const IconSatellite = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 0 1 10 10c0 5-4 10-10 10S2 17 2 12 7 2 12 2z" />
    <path d="M12 6v12M6 12h12" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const IconShield = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

const IconZap = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const IconBrain = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z" />
  </svg>
)

const IconGhost = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2a8 8 0 0 0-8-8z" />
    <path d="M11 18v3a1 1 0 0 0 2 0v-3" />
  </svg>
)

const IconCrosshair = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="22" y1="12" x2="18" y2="12" />
    <line x1="6" y1="12" x2="2" y2="12" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
  </svg>
)

const IconLock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const IconEye = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 5v2M12 17v2M5 12H3M21 12h-2" opacity="0.5" />
  </svg>
)

/* === DATA === */
const SIGNALS = [
  {
    id: 'SIG-01',
    name: 'Entropy Pulse',
    color: '#00f3ff',
    icon: <IconPulse />,
    desc: 'Shannon entropy of changed tokens. Conscious coding produces chaotic, irregular patterns. Autopilot generates syntactically uniform noise — the flatline of a mind on standby.'
  },
  {
    id: 'SIG-02',
    name: 'Coverage Resonance',
    color: '#bc13fe',
    icon: <IconShield />,
    desc: 'Developers who comprehend their changes build guardrails. Zero tests alongside significant new code is the silence of someone who never stopped to ask "what could break?"'
  },
  {
    id: 'SIG-03',
    name: 'Semantic Divergence',
    color: '#ff00ff',
    icon: <IconNeural />,
    desc: 'Vector distance between consecutive diffs. Copy-paste commits cluster in embedding space like echoes. Real thought diverges, explores, wanders into the unknown.'
  },
  {
    id: 'SIG-04',
    name: 'Restructuring Signal',
    color: '#39ff14',
    icon: <IconCircuit />,
    desc: 'Renaming variables, refactoring functions, restructuring logic. These are the fingerprints of comprehension — the strongest single indicator a human mind was present.'
  },
  {
    id: 'SIG-05',
    name: 'Intent Clarity',
    color: '#ffd700',
    icon: <IconSatellite />,
    desc: '"fix" is a ghost word. Specific, issue-referencing, intent-describing messages are consciousness artifacts. They prove someone knew why the change existed.'
  },
  {
    id: 'SIG-06',
    name: 'Autopilot Fingerprint',
    color: '#ff2a6d',
    icon: <IconZap />,
    desc: '+200 lines, -0 lines, no tests, vague message. The biometric signature of a developer sleepwalking through AI suggestions. We call it the Autopilot Dump.'
  }
]

const FLAGS = [
  {
    name: 'Autopilot Dump',
    color: '#ff2a6d',
    icon: <IconZap />,
    desc: 'Mass insertion with zero cognitive residue. No tests, no renames, no intent. The thermal exhaust port of blindly accepted machine output.'
  },
  {
    name: 'Zombie Review',
    color: '#ff2a6d',
    icon: <IconGhost />,
    desc: 'Near-zero signal across every dimension. Someone clicked merge without reading — a walking-dead approval that shipped invisible risk to production.'
  },
  {
    name: 'Coverage Void',
    color: '#ffd700',
    icon: <IconCrosshair />,
    desc: 'Significant code changes with absolutely no test coverage added. Risk accumulates in the dark spaces where no one thought to shine a light.'
  },
  {
    name: 'Ghost Commit',
    color: '#ffd700',
    icon: <IconGhost />,
    desc: 'Message is "fix" or "update" or "wip". No intent, no context, no trace of a human decision. A phantom in the git history.'
  },
  {
    name: 'Conscious Refactor ✓',
    color: '#39ff14',
    icon: <IconBrain />,
    desc: 'Multiple renames, structural shifts, and semantic reorganization. Positive signal — someone understood deeply enough to improve, not just add.'
  },
  {
    name: 'Test-First Mind ✓',
    color: '#39ff14',
    icon: <IconEye />,
    desc: 'Tests represent 40%+ of the diff. The strongest positive signal of developer comprehension — thinking before typing, designing before shipping.'
  }
]

const DEMO_REPOS = [
  { label: 'expressjs/morgan', url: 'https://github.com/expressjs/morgan' },
  { label: 'expressjs/cors', url: 'https://github.com/expressjs/cors' },
  { label: 'sindresorhus/ora', url: 'https://github.com/sindresorhus/ora' },
]

const DEMO_PRS = [
  {
    label: 'morgan PR #1',
    url: 'https://github.com/expressjs/morgan/pull/1',
  },
]

/* === ANIMATION VARIANTS === */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
}

/* === NEON BACKGROUND COMPONENT === */
function NeonBackground() {
  return (
    <div className="neon-bg" aria-hidden="true">
      {/* Perspective grid floor */}
      <div className="neon-grid-floor" />
      
      {/* Floating orbs */}
      <div className="neon-orb orb-1" />
      <div className="neon-orb orb-2" />
      <div className="neon-orb orb-3" />
      <div className="neon-orb orb-4" />
      
      {/* Neon rings */}
      <svg className="neon-rings" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
        <circle cx="400" cy="400" r="200" fill="none" stroke="rgba(0,243,255,0.08)" strokeWidth="1" />
        <circle cx="400" cy="400" r="280" fill="none" stroke="rgba(188,19,254,0.06)" strokeWidth="1" strokeDasharray="8 12" />
        <circle cx="400" cy="400" r="360" fill="none" stroke="rgba(255,42,109,0.05)" strokeWidth="1" strokeDasharray="4 20" />
        <circle cx="400" cy="400" r="150" fill="none" stroke="rgba(0,243,255,0.12)" strokeWidth="0.5">
          <animateTransform attributeName="transform" type="rotate" from="0 400 400" to="360 400 400" dur="60s" repeatCount="indefinite" />
        </circle>
        <circle cx="400" cy="400" r="320" fill="none" stroke="rgba(255,0,255,0.06)" strokeWidth="0.5">
          <animateTransform attributeName="transform" type="rotate" from="360 400 400" to="0 400 400" dur="90s" repeatCount="indefinite" />
        </circle>
      </svg>
      
      {/* Scan line */}
      <div className="neon-scanline" />
      
      {/* Particle dots */}
      <div className="neon-particles">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="neon-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 6}s`
            }}
          />
        ))}
      </div>
    </div>
  )
}

/* === MAIN COMPONENT === */
export default function HomePage({ analysis, prAnalysis }) {
  const [url, setUrl] = useState('')
  const [depth, setDepth] = useState('200')
  const [scanMode, setScanMode] = useState('repo')
  const [prQuickScan, setPrQuickScan] = useState(false)
  const [inlineStatus, setInlineStatus] = useState(null)
  const [checking, setChecking] = useState(false)
  const debounceRef = useRef(null)

  const { error: repoError, validating: repoValidating, loading: repoLoading } = analysis
  const { error: prError, validating: prValidating, loading: prLoading } = prAnalysis
  const error = scanMode === 'repo' ? repoError : prError
  const busy = repoLoading || prLoading || repoValidating || prValidating || checking

  const runBlurValidate = useCallback(
    (value) => {
      if (!value?.trim()) {
        setInlineStatus(null)
        return
      }
      if (scanMode === 'repo') {
        const fmt = validateRepoUrlFormat(value)
        if (!fmt.ok) {
          setInlineStatus({ ok: false, message: fmt.message })
          return
        }
        setChecking(true)
        validateRepositoryWithApi(fmt.url)
          .then((res) => setInlineStatus({ ok: true, message: `Validated: ${res.full_name}` }))
          .catch((err) => setInlineStatus({ ok: false, message: formatApiError(err) }))
          .finally(() => setChecking(false))
      } else {
        const fmt = validatePrUrlFormat(value)
        if (!fmt.ok) {
          setInlineStatus({ ok: false, message: fmt.message })
          return
        }
        setChecking(true)
        validatePullRequestWithApi(fmt.url)
          .then((res) => setInlineStatus({ ok: true, message: `Validated: ${res.full_name}` }))
          .catch((err) => setInlineStatus({ ok: false, message: formatApiError(err) }))
          .finally(() => setChecking(false))
      }
    },
    [scanMode]
  )

  const handleInputBlur = () => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runBlurValidate(url.trim()), 300)
  }

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  const handleScan = (targetUrl) => {
    setInlineStatus(null)
    if (scanMode === 'repo') {
      analysis.analyze(targetUrl, { maxCommits: Number(depth) || 200 })
    } else {
      prAnalysis.analyze(targetUrl, { skipCommitAnalysis: prQuickScan })
    }
  }

  return (
    <div className="landing landing-neon">
      <NeonBackground />
      
      {/* ========== HERO ========== */}
      <section className="neon-hero">
        <motion.div
          className="neon-hero-content"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div className="neon-hero-eyebrow" variants={fadeUp} custom={0}>
            <span className="neon-pip" />
            <span>NEURAL SIGNAL EXTRACTION PROTOCOL</span>
          </motion.div>

          <motion.h1 className="neon-hero-title" variants={fadeUp} custom={1}>
            Does your code
            <br />
            have a{' '}
            <span className="neon-title-glow">pulse</span>
            <span className="neon-title-cursor">_</span>
          </motion.h1>

          <motion.p className="neon-hero-sub" variants={fadeUp} custom={2}>
            Slopify reads the biometric signatures of developer consciousness buried in 
            commit history. Not "who wrote this" — but who <em>actually understood it</em> before 
            it shipped to production.
          </motion.p>

          <motion.div className="neon-scan-mode" variants={fadeUp} custom={3}>
            <button
              type="button"
              className={`neon-mode-btn ${scanMode === 'repo' ? 'active' : ''}`}
              onClick={() => { setScanMode('repo'); setInlineStatus(null) }}
            >
              Repository
            </button>
            <button
              type="button"
              className={`neon-mode-btn ${scanMode === 'pr' ? 'active' : ''}`}
              onClick={() => { setScanMode('pr'); setInlineStatus(null) }}
            >
              Pull request
            </button>
          </motion.div>

          <motion.div className="neon-input-group" variants={fadeUp} custom={3}>
            <div className="neon-input-wrap">
              <span className="neon-input-prompt">&gt;</span>
              <input
                className="neon-input"
                type="text"
                placeholder={
                  scanMode === 'repo'
                    ? 'github.com/owner/repo'
                    : 'github.com/owner/repo/pull/123'
                }
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setInlineStatus(null)
                }}
                onBlur={handleInputBlur}
                onKeyDown={(e) => e.key === 'Enter' && url.trim() && !busy && handleScan(url.trim())}
              />
              <span className="neon-input-blink">▌</span>
            </div>

            {scanMode === 'repo' && (
              <div className="neon-select-wrap">
                <span className="neon-select-label">DEPTH</span>
                <select
                  className="neon-select"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                >
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                </select>
              </div>
            )}

            {scanMode === 'pr' && (
              <label className="neon-quick-pr">
                <input
                  type="checkbox"
                  checked={prQuickScan}
                  onChange={(e) => setPrQuickScan(e.target.checked)}
                />
                Quick PR scan (description only)
              </label>
            )}

            <button
              className="neon-btn"
              onClick={() => url.trim() && handleScan(url.trim())}
              disabled={!url.trim() || busy}
            >
              <span className="neon-btn-glow" />
              <span className="neon-btn-text">
                {busy ? 'CHECKING…' : 'INITIALIZE SCAN'}
              </span>
            </button>
          </motion.div>

          {inlineStatus && (
            <motion.div
              className={inlineStatus.ok ? 'neon-validate-ok' : 'neon-error'}
              variants={fadeUp}
            >
              <span>{inlineStatus.message}</span>
            </motion.div>
          )}

          {error && (
            <motion.div className="neon-error" variants={fadeUp}>
              <span className="neon-error-icon">◈</span>
              <span>{error}</span>
            </motion.div>
          )}

          <motion.div className="neon-demo-pills" variants={fadeUp} custom={4}>
            <span className="neon-demo-label">TRY A LIVE SIGNAL →</span>
            {(scanMode === 'repo' ? DEMO_REPOS : DEMO_PRS).map((item) => (
              <button
                key={item.url}
                type="button"
                className="neon-demo-pill"
                onClick={() => handleScan(item.url)}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        </motion.div>

        <HeroSignalPanel />
      </section>

      {/* ========== PROBLEM SECTION ========== */}
      <section className="neon-problem">
        <motion.div
          className="neon-problem-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className="neon-problem-left">
            <motion.span className="neon-section-eyebrow" variants={fadeUp}>
              <span className="neon-eyebrow-line" />
              THE SILENT COLLAPSE
            </motion.span>
            
            <motion.h2 className="neon-problem-title" variants={fadeUp} custom={1}>
              The threat isn't AI writing code.
              <br />
              It's humans <span className="neon-text-glow">not thinking</span> about it.
            </motion.h2>
            
            <motion.p className="neon-problem-body" variants={fadeUp} custom={2}>
              Every engineering team using copilots and assistants faces the same invisible 
              collapse: developers accept suggestions without comprehension, merge without 
              understanding, and ship without knowing what changed. Traditional metrics 
              measure velocity. Slopify measures <em>consciousness</em>.
            </motion.p>
            
            <motion.p className="neon-problem-body" variants={fadeUp} custom={3}>
              We extract behavioral biometric data from git — the telltale traces humans 
              leave (or fail to leave) when they genuinely engage with code. Entropy 
              fingerprints. Test evolution patterns. Semantic divergence. Rename density. 
              Six signals. One consciousness score.
            </motion.p>

            <motion.div className="neon-badges" variants={fadeUp} custom={4}>
              <span className="neon-badge"><IconLock /> Zero source access</span>
              <span className="neon-badge"><IconEye /> Behavior-only</span>
              <span className="neon-badge"><IconBrain /> AI-native detection</span>
            </motion.div>
          </div>
          
          <motion.div
            className="neon-problem-right"
            variants={fadeUp}
            custom={2}
          >
            <div className="neon-quote-card">
              <div className="neon-quote-glow" />
              <span className="neon-quote-mark">“</span>
              <p className="neon-quote-text">
                The most dangerous thing in modern development isn't the machine writing 
                code — it's the human who stopped reading it.
              </p>
              <div className="neon-quote-rule" />
              <p className="neon-quote-attr">
                <span className="neon-quote-dot" />
                Slopify — Team Avenger
              </p>
            </div>
            
            {/* Decorative neural SVG */}
            <svg className="neon-neural-deco" viewBox="0 0 200 200" aria-hidden="true">
              <defs>
                <linearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f3ff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#bc13fe" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="40" r="4" fill="#00f3ff" opacity="0.6" />
              <circle cx="60" cy="100" r="4" fill="#bc13fe" opacity="0.6" />
              <circle cx="140" cy="100" r="4" fill="#ff00ff" opacity="0.6" />
              <circle cx="100" cy="160" r="4" fill="#ff2a6d" opacity="0.6" />
              <line x1="100" y1="40" x2="60" y2="100" stroke="url(#neuralGrad)" strokeWidth="1" />
              <line x1="100" y1="40" x2="140" y2="100" stroke="url(#neuralGrad)" strokeWidth="1" />
              <line x1="60" y1="100" x2="100" y2="160" stroke="url(#neuralGrad)" strokeWidth="1" />
              <line x1="140" y1="100" x2="100" y2="160" stroke="url(#neuralGrad)" strokeWidth="1" />
              <line x1="60" y1="100" x2="140" y2="100" stroke="url(#neuralGrad)" strokeWidth="0.5" opacity="0.5" />
              <circle cx="100" cy="100" r="2" fill="#ffd700" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite" />
              </circle>
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ========== SIGNALS SECTION ========== */}
      <section className="neon-signals">
        <motion.div
          className="neon-signals-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.span className="neon-section-eyebrow center" variants={fadeUp}>
            <span className="neon-eyebrow-line" />
            EXTRACTION METHODOLOGY
            <span className="neon-eyebrow-line right" />
          </motion.span>
          
          <motion.h2 className="neon-signals-title" variants={fadeUp} custom={1}>
            Six Biometric Signals.
            <br />
            <span className="neon-text-dim">Zero source intrusion.</span>
          </motion.h2>
          
          <motion.p className="neon-signals-sub" variants={fadeUp} custom={2}>
            Slopify never reads your code. It reads the fingerprints your team leaves 
            on the glass while they work.
          </motion.p>
        </motion.div>
        
        <div className="neon-signals-grid">
          {SIGNALS.map((signal, index) => (
            <DetectionSignalCard key={signal.id} signal={signal} index={index} />
          ))}
        </div>
      </section>

      {/* ========== FLAGS SECTION ========== */}
      <section className="neon-flags">
        <motion.div
          className="neon-flags-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.span className="neon-section-eyebrow center" variants={fadeUp}>
            <span className="neon-eyebrow-line" />
            DETECTION TAXONOMY
            <span className="neon-eyebrow-line right" />
          </motion.span>
          
          <motion.h2 className="neon-flags-title" variants={fadeUp} custom={1}>
            What Slopify <span className="neon-text-glow">flags</span>
          </motion.h2>
        </motion.div>
        
        <motion.div
          className="neon-flags-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
        >
          {FLAGS.map((flag, i) => (
            <motion.div
              key={flag.name}
              className="neon-flag-card"
              style={{ '--flag-color': flag.color }}
              variants={fadeUp}
              custom={i}
            >
              <div className="neon-flag-glow" />
              <div className="neon-flag-header">
                <span className="neon-flag-icon" style={{ color: flag.color }}>{flag.icon}</span>
                <span className="neon-flag-name" style={{ color: flag.color }}>{flag.name}</span>
              </div>
              <p className="neon-flag-desc">{flag.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="neon-cta">
        <div className="neon-cta-glow" />
        <motion.div
          className="neon-cta-content"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeUp}>
            Ready to measure <span className="neon-text-glow">consciousness</span>?
          </motion.h2>
          <motion.p variants={fadeUp} custom={1}>
            Plug any public repository into the signal extractor and watch the neural 
            patterns surface. No signup. No source access. Pure behavior.
          </motion.p>
          <motion.div className="neon-cta-input" variants={fadeUp} custom={2}>
            <div className="neon-input-wrap large">
              <span className="neon-input-prompt">&gt;</span>
              <input
                className="neon-input"
                type="text"
                placeholder="github.com/owner/repo"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && url.trim() && handleScan(url.trim())}
              />
            </div>
            <button
              className="neon-btn large"
              onClick={() => url.trim() && handleScan(url.trim())}
              disabled={!url.trim()}
            >
              <span className="neon-btn-glow" />
              <span className="neon-btn-text">EXTRACT SIGNALS</span>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="neon-footer">
        <div className="neon-footer-inner">
          <div className="neon-footer-brand">
            <AppLogo size={24} />
            <span className="neon-footer-name">
              <span className="neon-footer-g">S</span>lopify
            </span>
          </div>
          <p className="neon-footer-sub">
            Team Avenger · Neural signal intelligence for code review
          </p>
          <div className="neon-footer-links">
            <Link to={ROUTES.ACCURACY}>Accuracy Report</Link>
            <span className="neon-footer-dot" />
            <a href="#" onClick={(e) => e.preventDefault()}>Documentation</a>
            <span className="neon-footer-dot" />
            <a href="#" onClick={(e) => e.preventDefault()}>GitHub</a>
          </div>
        </div>
        <div className="neon-footer-bar" />
      </footer>
    </div>
  )
}
