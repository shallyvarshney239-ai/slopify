import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  validatePrUrlFormat,
  validatePullRequestWithApi,
  formatApiError,
  getApiBase,
} from '../utils/repositoryUrl'
import { ROUTES } from '../config/routes'

const API_BASE = getApiBase()

export function usePullRequestAnalysis() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState(null)
  const [job, setJob] = useState(null)
  const activeJobRef = useRef(null)

  const pollJob = useCallback(async (jobId) => {
    let done = false
    let failures = 0
    const maxFailures = 12
    const maxStallSeconds = 600

    while (!done) {
      if (activeJobRef.current !== jobId) return

      try {
        const res = await axios.get(`${API_BASE}/analyze/pr/status/${jobId}`, { timeout: 60000 })
        const jobData = res.data
        setJob(jobData)
        failures = 0

        if (jobData.status === 'done') {
          const result = jobData.result
          if (result?.error) {
            setError(result.error)
          } else if (result?.verdict != null && result?.pr_number != null) {
            setData(result)
          } else {
            setError('PR analysis finished but returned an invalid result.')
          }
          done = true
          break
        }
        if (jobData.status === 'error') {
          setError(jobData.error || 'PR analysis failed')
          done = true
          break
        }

        if (jobData.status === 'running') {
          const updatedAt = jobData.updated_at || 0
          const stallSeconds = Math.floor(Date.now() / 1000) - updatedAt
          if (stallSeconds > maxStallSeconds) {
            setError(
              'PR analysis stopped responding. The API may have restarted — wait a minute and try again.'
            )
            done = true
            break
          }
        }
      } catch (err) {
        failures += 1
        if (failures >= maxFailures) {
          setError(formatApiError(err))
          done = true
          break
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 2500))
    }
  }, [])

  const analyze = useCallback(
    async (prUrl, options = {}) => {
      if (!prUrl) return

      const formatCheck = validatePrUrlFormat(prUrl)
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

      const skipCommitAnalysis = Boolean(options.skipCommitAnalysis)

      try {
        const validation = await validatePullRequestWithApi(normalized)
        normalized = validation.normalized_url || normalized
      } catch (err) {
        setError(formatApiError(err))
        setLoading(false)
        setValidating(false)
        return
      } finally {
        setValidating(false)
      }

      const query = new URLSearchParams({ pr: normalized })
      if (skipCommitAnalysis) query.set('quick', '1')
      navigate(`${ROUTES.PR_ANALYSIS}?${query.toString()}`)

      try {
        const res = await axios.post(
          `${API_BASE}/analyze/pr`,
          { pr_url: normalized, skip_commit_analysis: skipCommitAnalysis },
          { timeout: 120000 }
        )
        const jobId = res.data.job_id
        if (!jobId) {
          setError('Could not start PR analysis.')
          return
        }

        activeJobRef.current = jobId
        setJob({
          job_id: jobId,
          status: 'queued',
          progress_pct: 0,
          stage: 'fetching_pr',
          updated_at: Math.floor(Date.now() / 1000),
        })
        await pollJob(jobId)
      } catch (err) {
        setError(formatApiError(err))
      } finally {
        activeJobRef.current = null
        setLoading(false)
      }
    },
    [navigate, pollJob]
  )

  return { data, loading, validating, error, job, analyze }
}
