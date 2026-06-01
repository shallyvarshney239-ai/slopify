import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppLogo from './AppLogo'

const STAGE_LABELS = {
  queued: 'Evidence queued for analysis...',
  starting: 'Starting analysis on the server...',
  'cloning repository': 'Cloning repository (shallow fetch)...',
  'collecting commits': 'Gathering commit fingerprints...',
  'extracting diffs': 'Extracting diff artifacts...',
  'loading semantic model': 'Loading ML model (first scan may take a minute)...',
  'computing semantic signals': 'Computing semantic signals...',
  'embedding commit messages': 'Embedding commit messages...',
  'embedding diff samples': 'Embedding diff samples...',
  'summarizing analysis': 'Summarizing results...',
  reconnecting: 'Reconnecting to server (it may be waking up)...',
  'waiting for status': 'Waiting for server status...',
  cloning: 'Collecting evidence from remote repository...',
  collecting: 'Gathering commit fingerprints...',
  processing: 'Analyzing behavioral artifacts...',
  scoring: 'Cross-referencing cognitive signatures...',
  finalizing: 'Reconstructing engagement timeline...',
  done: 'Analysis complete',
  fetching_pr: 'Fetching pull request from GitHub...',
  scoring_description: 'Scoring PR description density...',
  analyzing_commits: 'Analyzing recent commits in repository...',
}

export default function LoadingScreen({ progress, stage, updatedAt, title }) {
  const percent = Number.isFinite(progress) ? progress : 0
  const label = stage || 'starting'
  const lastUpdated = updatedAt ? Math.max(0, Math.floor((Date.now() / 1000) - updatedAt)) : null
  const [displayPct, setDisplayPct] = useState(percent)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (percent > 0) {
      setDisplayPct(percent)
      return
    }

    const isEarlyStage =
      label.includes('queued') ||
      label.includes('starting') ||
      label.includes('cloning') ||
      label.includes('collecting') ||
      label.includes('reconnecting') ||
      label.includes('waiting')

    if (!isEarlyStage) {
      setDisplayPct(0)
      return
    }

    if (lastUpdated === null || lastUpdated < 3) {
      setDisplayPct(percent > 0 ? percent : 2)
      return
    }

    const start = displayPct || 2
    const target = label.includes('cloning') ? 18 : 12
    const duration = 25000
    const startTime = Date.now()
    let raf

    const tick = () => {
      const elapsed = Date.now() - startTime
      const t = Math.min(elapsed / duration, 1)
      const next = Math.min(target, Math.round(start + (target - start) * t))
      setDisplayPct(next)
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [percent, label, lastUpdated, displayPct])

  /* Matrix-style commit hash rain */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const chars = '0123456789abcdef'
    const fontSize = 12
    const columns = Math.floor(canvas.width / fontSize)
    const drops = Array(columns).fill(1)

    const draw = () => {
      ctx.fillStyle = 'rgba(5,5,8,0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'rgba(255,42,109,0.15)'
      ctx.font = `${fontSize}px JetBrains Mono, monospace`

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
      animationId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const readableStage = STAGE_LABELS[label] || label.replace(/_/g, ' ')
  const circumference = 2 * Math.PI * 52
  const dashOffset = circumference - (displayPct / 100) * circumference

  return (
    <div className="fullscreen-loader">
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.6 }} />

      <div className="fl-radar" />

      <motion.div
        className="fl-logo"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <AppLogo size={64} />
      </motion.div>

      <div className="fl-ring-wrap">
        <svg width="120" height="120" viewBox="0 0 120 120" className="fl-ring-svg">
          <defs>
            <linearGradient id="flRingGrad" x1="0" y1="0" x2="120" y2="120">
              <stop offset="0%" stopColor="#ff2a6d" />
              <stop offset="100%" stopColor="#c9184a" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="52" className="fl-ring-track" />
          <circle
            cx="60"
            cy="60"
            r="52"
            className="fl-ring-fill"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="fl-ring-center">{displayPct}%</div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={readableStage}
          className="fl-progress"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
        >
          <span className="fl-progress-pct">{displayPct}%</span>
          <span className="fl-progress-stage">{readableStage}</span>
        </motion.div>
      </AnimatePresence>

      {lastUpdated !== null && (
        <p className="fl-eta">last signal {lastUpdated}s ago</p>
      )}
      <p className="fl-sub">Measuring cognitive engagement from git behavior — not AI detection</p>
    </div>
  )
}
