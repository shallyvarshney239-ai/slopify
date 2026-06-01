import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  validateRepoUrlFormat,
  validateRepositoryWithApi,
  formatApiError,
  getApiBase,
} from '../utils/repositoryUrl'
import { ROUTES } from '../config/routes'

const API_BASE = getApiBase()

export function useRepositoryAnalysis() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [job, setJob] = useState(null)
  const [validating, setValidating] = useState(false)
  const activeJobRef = useRef(null)

  const startWithRetry = useCallback(async (repoUrl, maxCommits, timeoutMs) => {
    const attempts = 3
    for (let i = 0; i < attempts; i += 1) {
      try {
        const res = await axios.post(
          `${API_BASE}/analyze/start`,
          { repo_url: repoUrl, max_commits: maxCommits },
          { timeout: timeoutMs }
        )
        return res.data.job_id
      } catch (err) {
        const isTimeout = err.code === 'ECONNABORTED' || `${err.message || ''}`.includes('timeout')
        if (!isTimeout) throw err
        await new Promise((resolve) => setTimeout(resolve, 1500 * (i + 1)))
      }
    }
    return null
  }, [])

  const pollJob = useCallback(async (jobId) => {
    let done = false
    let failures = 0
    const maxFailures = 12
    // Allow long first-run model download on free-tier hosts (no % change for minutes).
    const maxStallSeconds = 900

    while (!done) {
      if (activeJobRef.current !== jobId) return

      try {
        const res = await axios.get(`${API_BASE}/analyze/status/${jobId}`, { timeout: 60000 })
        const jobData = res.data
        setJob(jobData)
        failures = 0

        if (jobData.status === 'done') {
          const result = jobData.result
          if (result?.error) {
            setError(result.error)
          } else if (result?.summary && Array.isArray(result?.commits)) {
            setData(result)
          } else {
            setError('Analysis finished but returned an invalid result.')
          }
          done = true
          break
        }
        if (jobData.status === 'error') {
          setError(jobData.error || 'Analysis failed')
          done = true
          break
        }

        if (jobData.status === 'running') {
          const updatedAt = jobData.updated_at || 0
          const stallSeconds = Math.floor(Date.now() / 1000) - updatedAt
          if (stallSeconds > maxStallSeconds) {
            setError(
              'Analysis stopped responding. The API may have restarted (common on free hosting). ' +
                'Wait a minute, then try again with fewer commits (50–100).'
            )
            done = true
            break
          }
        }
      } catch (err) {
        failures += 1
        const is404 = err.response?.status === 404
        if (failures >= maxFailures) {
          if (is404) {
            setError(
              'Lost connection to the analysis job (server may have restarted). Please run the scan again.'
            )
          } else {
            setError(formatApiError(err))
          }
          done = true
          break
        }
        setJob((prev) =>
          prev
            ? {
                ...prev,
                stage: is404 ? 'reconnecting' : 'waiting for status',
                progress_pct: prev.progress_pct || 0,
              }
            : prev
        )
      }
      await new Promise((resolve) => setTimeout(resolve, 2500))
    }
  }, [])

  const analyze = useCallback(async (repoUrl, options = {}) => {
    if (!repoUrl) return

    const formatCheck = validateRepoUrlFormat(repoUrl)
    if (!formatCheck.ok) {
      setError(formatCheck.message)
      return
    }
    let normalized = formatCheck.url

    setLoading(true)
    setValidating(true)
    setError(null)
    setData(null)
    setJob(null)
    activeJobRef.current = null
    const maxCommits = options.maxCommits || 200

    try {
      const validation = await validateRepositoryWithApi(normalized)
      normalized = validation.normalized_url || normalized
    } catch (err) {
      setError(formatApiError(err))
      setLoading(false)
      setValidating(false)
      return
    } finally {
      setValidating(false)
    }

    navigate(
      `${ROUTES.ANALYSIS}?repo=${encodeURIComponent(normalized)}&max_commits=${maxCommits}`
    )
    const timeoutMs = options.timeoutMs || (maxCommits >= 200 ? 180000 : 90000)

    try {
      const jobId = await startWithRetry(normalized, maxCommits, timeoutMs)
      if (!jobId) {
        setError('Could not start analysis (server timed out). Free-tier backends may need a minute to wake up — try again.')
        return
      }

      activeJobRef.current = jobId
      setJob({
        job_id: jobId,
        status: 'queued',
        progress_pct: 0,
        stage: 'queued',
        updated_at: Math.floor(Date.now() / 1000),
      })
      await pollJob(jobId)
    } catch (err) {
      if (err.code === 'ECONNABORTED' || `${err.message || ''}`.includes('timeout')) {
        setError('Could not start analysis (server timed out). Free-tier backends may need a minute to wake up — try again.')
      } else {
        setError(formatApiError(err))
      }
    } finally {
      activeJobRef.current = null
      setLoading(false)
    }
  }, [navigate, pollJob, startWithRetry])

  return { data, loading, validating, error, job, analyze }
}
