import axios from 'axios'

/** API origin without trailing slash (avoids //analyze/start 404 when env has trailing /). */
export function getApiBase() {
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim()
  return base.replace(/\/+$/, '')
}

const GITHUB_REPO_RE =
  /^https?:\/\/(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i

const OWNER_REPO_ONLY_RE = /^([\w.-]+)\/([\w.-]+)$/

const GITHUB_PR_RE =
  /^https?:\/\/(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+)\/pull\/(\d+)\/?$/i

export function normalizeRepoUrl(url) {
  const trimmed = (url || '').trim()
  if (!trimmed) return trimmed

  if (trimmed.startsWith('github.com/')) {
    return `https://${trimmed}`
  }

  if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith('git@')) {
    const path = trimmed.replace(/^\/+/, '')
    if (path.includes('/') && !path.includes(' ')) {
      return `https://github.com/${path}`
    }
  }

  return trimmed.replace(/\/+$/, '')
}

/**
 * Client-side format checks before calling the API.
 * @returns {{ ok: true, url: string } | { ok: false, message: string }}
 */
export function validateRepoUrlFormat(url) {
  const trimmed = (url || '').trim()
  if (!trimmed) {
    return { ok: false, message: 'Enter a GitHub repository URL (example: github.com/expressjs/morgan).' }
  }

  if (/gitlab\.com|bitbucket\.org|dev\.azure\.com/i.test(trimmed)) {
    return {
      ok: false,
      message: 'Only GitHub repositories are supported. Use github.com/owner/repo.',
    }
  }

  let normalized
  try {
    normalized = normalizeRepoUrl(trimmed)
  } catch {
    return { ok: false, message: 'Enter a valid GitHub repository URL.' }
  }

  const ownerRepo = normalized.match(OWNER_REPO_ONLY_RE)
  if (ownerRepo) {
    return { ok: true, url: `https://github.com/${ownerRepo[1]}/${ownerRepo[2]}` }
  }

  const match = normalized.match(GITHUB_REPO_RE)
  if (!match) {
    if (/github\.com/i.test(normalized) && normalized.split('/').filter(Boolean).length < 4) {
      return {
        ok: false,
        message:
          'Incomplete GitHub URL. Include both owner and repo (example: github.com/expressjs/morgan).',
      }
    }
    return {
      ok: false,
      message:
        'Use a GitHub repository link like github.com/owner/repo (example: github.com/expressjs/morgan).',
    }
  }

  const [, owner, repo] = match
  if (!owner || !repo) {
    return { ok: false, message: 'Missing owner or repository name in the URL.' }
  }

  return { ok: true, url: `https://github.com/${owner}/${repo}` }
}

export function normalizePrUrl(url) {
  const trimmed = (url || '').trim().replace(/\/+$/, '')
  if (!trimmed) return trimmed
  if (trimmed.startsWith('github.com/')) {
    return `https://${trimmed}`
  }
  return trimmed
}

/**
 * Client-side PR URL format checks.
 * @returns {{ ok: true, url: string } | { ok: false, message: string }}
 */
export function validatePrUrlFormat(url) {
  const trimmed = (url || '').trim()
  if (!trimmed) {
    return {
      ok: false,
      message: 'Enter a GitHub pull request URL (example: github.com/owner/repo/pull/1).',
    }
  }
  if (/gitlab\.com|bitbucket\.org/i.test(trimmed)) {
    return { ok: false, message: 'Only GitHub pull requests are supported.' }
  }
  const normalized = normalizePrUrl(trimmed)
  const match = normalized.match(GITHUB_PR_RE)
  if (!match) {
    if (/github\.com/i.test(normalized) && !/\/pull\/\d+/i.test(normalized)) {
      return {
        ok: false,
        message:
          'That looks like a repository URL, not a pull request. Use github.com/owner/repo/pull/123.',
      }
    }
    return {
      ok: false,
      message:
        'Use a GitHub PR link like github.com/owner/repo/pull/123.',
    }
  }
  const [, owner, repo, num] = match
  return { ok: true, url: `https://github.com/${owner}/${repo}/pull/${num}` }
}

export async function validateRepositoryWithApi(repoUrl) {
  const API_BASE = getApiBase()
  const res = await axios.get(`${API_BASE}/repos/validate`, {
    params: { repo_url: repoUrl },
    timeout: 30000,
  })
  return res.data
}

export async function validatePullRequestWithApi(prUrl) {
  const API_BASE = getApiBase()
  const res = await axios.get(`${API_BASE}/prs/validate`, {
    params: { pr_url: prUrl },
    timeout: 30000,
  })
  return res.data
}

/** Extract a user-facing message from FastAPI / axios errors. */
export function formatApiError(err) {
  const detail = err?.response?.data?.detail
  if (typeof detail === 'string' && detail.trim()) {
    if (detail === 'Not Found') {
      return 'API route not found. Remove any trailing slash from VITE_API_URL on Vercel, redeploy, or try again in a minute.'
    }
    return detail
  }
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || d.message || String(d)).join('; ')
  }
  if (detail && typeof detail === 'object' && detail.message) return detail.message
  if (err?.message === 'Network Error') {
    return 'Cannot reach the API. Check VITE_API_URL on Vercel and redeploy.'
  }
  return err?.message || 'Something went wrong. Please try again.'
}
