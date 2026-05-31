import { useState } from 'react'

export default function RepoInput({ onSubmit, loading }) {
  const [url, setUrl] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (url.trim()) onSubmit(url.trim())
  }

  return (
    <form className="repo-input-form" onSubmit={handleSubmit}>
      <input
        className="repo-input"
        type="text"
        placeholder="https://github.com/owner/repo"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        disabled={loading}
      />
      <button className="scan-btn" type="submit" disabled={loading || !url.trim()}>
        {loading ? 'scanning...' : 'scan *'}
      </button>
    </form>
  )
}
