/** Actionable hint for common analysis validation errors. */
export function getErrorHint(errorMessage) {
  const msg = (errorMessage || '').toLowerCase()
  if (!msg) return null
  if (msg.includes('not found') || msg.includes('does not exist')) {
    return 'Check owner, repository, or PR number for typos.'
  }
  if (msg.includes('private') || msg.includes('denied access') || msg.includes('forbidden')) {
    return 'Private repos need GITHUB_TOKEN on the API host, or use a public repository.'
  }
  if (msg.includes('network') || msg.includes('cannot reach')) {
    return 'Verify VITE_API_URL on Vercel and that the API is running.'
  }
  if (msg.includes('rate limit')) {
    return 'Wait a few minutes or configure GITHUB_TOKEN on the API server.'
  }
  return null
}
