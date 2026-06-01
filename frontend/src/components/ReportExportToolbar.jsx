import { useState } from 'react'
import { downloadRepositoryReport } from '../utils/exportRepositoryReport'
import { downloadPullRequestReport } from '../utils/exportPullRequestReport'

export default function ReportExportToolbar({ reportType, data, shareUrl }) {
  const [copyStatus, setCopyStatus] = useState('')
  const url = shareUrl || (typeof window !== 'undefined' ? window.location.href : '')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopyStatus('Link copied')
      setTimeout(() => setCopyStatus(''), 2000)
    } catch {
      setCopyStatus('Copy failed')
    }
  }

  const handleDownload = () => {
    if (reportType === 'pr') {
      downloadPullRequestReport(data, url)
    } else {
      downloadRepositoryReport(data, url)
    }
  }

  return (
    <div className="report-export-toolbar">
      <button type="button" className="report-export-btn" onClick={handleCopy}>
        Copy link
      </button>
      <button type="button" className="report-export-btn" onClick={handleDownload}>
        Download Markdown
      </button>
      <button type="button" className="report-export-btn" onClick={() => window.print()}>
        Print / PDF
      </button>
      {copyStatus && <span className="report-export-status">{copyStatus}</span>}
    </div>
  )
}
