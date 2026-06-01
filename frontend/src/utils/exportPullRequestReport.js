export function buildPullRequestReportMarkdown(data, shareUrl = '') {
  if (!data?.pr_number) return '# Slopify PR report\n\nNo data available.\n'

  const lines = [
    '# Slopify — Pull request scan',
    '',
    `**PR:** ${data.repo}#${data.pr_number}`,
    `**Title:** ${data.title || '—'}`,
    `**URL:** ${data.pr_url}`,
    `**Verdict:** ${data.verdict}`,
    `**Description density:** ${data.description_density}`,
    `**Diff restatement:** ${data.diff_restatement_score}`,
  ]

  if (data.mean_commit_score != null) {
    lines.push(`**Mean commit score:** ${data.mean_commit_score}`)
  }
  if (data.flags?.length) {
    lines.push(`**Flags:** ${data.flags.join(', ')}`)
  }
  lines.push('')

  if (data.risky_commits?.length) {
    lines.push('## Lowest-scoring commits', '')
    for (const c of data.risky_commits) {
      lines.push(`- \`${c.sha}\` (${c.score}) — ${(c.message || '').slice(0, 80)}`)
    }
    lines.push('')
  }

  if (data.hollow_reviews?.length) {
    lines.push(`## Hollow review signals (${data.hollow_reviews.length})`, '')
    for (const r of data.hollow_reviews.slice(0, 5)) {
      lines.push(`- @${r.author}: ${(r.body_preview || '').slice(0, 100)}`)
    }
    lines.push('')
  }

  if (data.suggested_review_questions?.length) {
    lines.push('## Suggested review questions', '')
    for (const q of data.suggested_review_questions) {
      lines.push(`- ${q}`)
    }
    lines.push('')
  }

  if (shareUrl) {
    lines.push('## Share', '', shareUrl, '')
  }

  lines.push('_Slopify measures whether code was understood before merge — not whether AI wrote it._')
  return lines.join('\n')
}

export function downloadPullRequestReport(data, shareUrl) {
  const md = buildPullRequestReportMarkdown(data, shareUrl)
  const slug = `${data.repo}-pr-${data.pr_number}`.replace(/[^\w.-]+/g, '-')
  const date = new Date().toISOString().slice(0, 10)
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `slopify-${slug}-${date}.md`
  a.click()
  URL.revokeObjectURL(a.href)
}
