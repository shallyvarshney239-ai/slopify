function gradeFrom(score) {
  if (score >= 0.7) return 'A'
  if (score >= 0.55) return 'B'
  if (score >= 0.4) return 'C'
  if (score >= 0.25) return 'D'
  return 'F'
}

export function buildRepositoryReportMarkdown(data, shareUrl = '') {
  if (!data?.summary) return '# Slopify report\n\nNo data available.\n'

  const s = data.summary
  const score = s.mean_cognitive_score
  const grade = gradeFrom(score)
  const lines = [
    '# Slopify — Repository engagement report',
    '',
    `**Repository:** ${data.repo_name || data.repo_url}`,
    `**Commits analyzed:** ${data.total_commits_analyzed}`,
    `**Health grade:** ${grade}`,
    `**Mean cognitive score:** ${score?.toFixed(3)}`,
    `**High engagement:** ${s.high_engagement_pct}%`,
    `**Paste & pray:** ${s.paste_and_pray_count}`,
    `**Rubber stamp:** ${s.rubber_stamp_count}`,
    `**Collapse events:** ${(s.collapse_events || []).length}`,
    '',
  ]

  if (data.era_split) {
    lines.push(
      '## AI era split',
      '',
      `**Verdict:** ${data.era_split.verdict || 'n/a'}`,
      `**Delta:** ${data.era_split.delta_pct != null ? `${data.era_split.delta_pct.toFixed(1)}%` : 'n/a'}`,
      ''
    )
  }

  const flagged = (data.commits || [])
    .filter((c) => c.flags?.length)
    .sort((a, b) => a.cognitive_score - b.cognitive_score)
    .slice(0, 5)

  if (flagged.length) {
    lines.push('## Top flagged commits', '')
    for (const c of flagged) {
      lines.push(
        `- \`${c.sha.slice(0, 7)}\` score ${c.cognitive_score?.toFixed(2)} — ${(c.flags || []).join(', ')} — ${(c.message || '').slice(0, 80)}`
      )
    }
    lines.push('')
  }

  if (shareUrl) {
    lines.push('## Share', '', shareUrl, '')
  }

  lines.push('_Slopify measures whether code was understood before merge — not whether AI wrote it._')
  return lines.join('\n')
}

export function downloadRepositoryReport(data, shareUrl) {
  const md = buildRepositoryReportMarkdown(data, shareUrl)
  const slug = (data.repo_name || 'repo').replace(/[^\w.-]+/g, '-')
  const date = new Date().toISOString().slice(0, 10)
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `slopify-${slug}-${date}.md`
  a.click()
  URL.revokeObjectURL(a.href)
}
