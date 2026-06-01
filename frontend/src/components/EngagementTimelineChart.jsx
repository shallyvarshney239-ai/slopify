import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { format } from 'date-fns'

export default function TimelineView({ commits, collapseEvents, onCommitClick, selectedSha }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!commits || !svgRef.current) return
    drawTimeline(svgRef.current, commits, collapseEvents, onCommitClick, selectedSha)
  }, [commits, collapseEvents, onCommitClick, selectedSha])

  return (
    <div className="timeline-container">
      <svg ref={svgRef} className="timeline-svg" />
    </div>
  )
}

function drawTimeline(node, commits, collapseEvents, onCommitClick, selectedSha) {
  const container = node.parentElement
  const width = container.clientWidth || 900
  const height = 260
  const margin = { top: 20, right: 24, bottom: 40, left: 48 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  d3.select(node).selectAll('*').remove()

  const svg = d3
    .select(node)
    .attr('width', width)
    .attr('height', height)

  const g = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const x = d3
    .scaleTime()
    .domain(d3.extent(commits, (c) => new Date(c.timestamp)))
    .range([0, innerW])

  const y = d3
    .scaleLinear()
    .domain([0, 1])
    .range([innerH, 0])

  const scoreColor = d3
    .scaleSequential()
    .domain([0, 1])
    .interpolator(d3.interpolateRgb('#ff2a6d', '#39ff14'))

  /* Collapse events = breach zones */
  collapseEvents?.forEach((evt) => {
    const cx = x(new Date(evt.timestamp * 1000))
    g.append('rect')
      .attr('x', cx - 20)
      .attr('y', 0)
      .attr('width', 40)
      .attr('height', innerH)
      .attr('fill', 'rgba(255,42,109,0.06)')
      .attr('stroke', 'rgba(255,42,109,0.25)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,2')

    g.append('text')
      .attr('x', cx)
      .attr('y', -6)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ff2a6d')
      .attr('font-size', '10px')
      .attr('font-family', 'var(--font-mono)')
      .text('BREACH')
  })

  // AI era boundary line
  const AI_CUTOFF = new Date(1678752000 * 1000)
  if (AI_CUTOFF > x.domain()[0] && AI_CUTOFF < x.domain()[1]) {
    const cx = x(AI_CUTOFF)
    g.append('line')
      .attr('x1', cx).attr('x2', cx)
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#a5a3e8')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '6,3')
      .attr('opacity', 0.7)

    g.append('text')
      .attr('x', cx + 4).attr('y', 12)
      .attr('fill', '#a5a3e8')
      .attr('font-size', '10px')
      .attr('font-family', 'var(--font-mono)')
      .text('GPT-4 →')
  }

  const lineData = [...commits].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  const smoothed = rollingMean(lineData.map((c) => c.cognitive_score), 8)

  const line = d3
    .line()
    .x((d, i) => x(new Date(lineData[i].timestamp)))
    .y((d) => y(d))
    .curve(d3.curveCatmullRom)

  /* Glowing trend line */
  g.append('path')
    .datum(smoothed)
    .attr('fill', 'none')
    .attr('stroke', '#ff2a6d')
    .attr('stroke-width', 4)
    .attr('stroke-dasharray', '4,2')
    .attr('d', line)
    .attr('opacity', 0.15)
    .attr('filter', 'blur(3px)')

  g.append('path')
    .datum(smoothed)
    .attr('fill', 'none')
    .attr('stroke', '#7a7a9d')
    .attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '4,2')
    .attr('d', line)
    .attr('opacity', 0.5)

  g.selectAll('.commit-dot')
    .data(commits)
    .join('circle')
    .attr('class', 'commit-dot')
    .attr('cx', (d) => x(new Date(d.timestamp)))
    .attr('cy', (d) => y(d.cognitive_score))
    .attr('r', (d) => (d.sha === selectedSha ? 6 : 4))
    .attr('fill', (d) => scoreColor(d.cognitive_score))
    .attr('stroke', (d) => (d.sha === selectedSha ? '#e8e8f0' : 'transparent'))
    .attr('stroke-width', 2)
    .attr('opacity', 0.9)
    .style('cursor', 'pointer')
    .style('filter', (d) => d.cognitive_score < 0.3 ? 'drop-shadow(0 0 3px rgba(255,42,109,0.5))' : 'none')
    .on('click', (event, d) => onCommitClick(d))
    .on('mouseover', function (event, d) {
      d3.select(this).attr('r', 7).attr('opacity', 1)
      showTooltip(svg, event, d, width, height)
    })
    .on('mouseout', function (event, d) {
      d3.select(this)
        .attr('r', d.sha === selectedSha ? 6 : 4)
        .attr('opacity', 0.9)
      svg.select('.tooltip').remove()
    })

  const xAxis = d3.axisBottom(x).ticks(6).tickFormat((d) => format(d, 'MMM yyyy'))
  const yAxis = d3.axisLeft(y).ticks(5).tickFormat((d) => d.toFixed(1))

  g.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .call(xAxis)
    .call(applyAxisStyle)

  g.append('g')
    .call(yAxis)
    .call(applyAxisStyle)

  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -innerH / 2)
    .attr('y', -36)
    .attr('text-anchor', 'middle')
    .attr('fill', '#7a7a9d')
    .attr('font-size', '11px')
    .attr('font-family', 'var(--font-sans)')
    .text('cognitive score')
}

function applyAxisStyle(selection) {
  selection.select('.domain').attr('stroke', '#232335')
  selection.selectAll('.tick line').attr('stroke', '#232335')
  selection.selectAll('.tick text')
    .attr('fill', '#7a7a9d')
    .attr('font-size', '11px')
    .attr('font-family', 'var(--font-mono)')
}

function showTooltip(svg, event, d, width, height) {
  const [mx, my] = d3.pointer(event, svg.node())
  const flags = d.flags?.join(', ') || 'none'
  const tooltipG = svg.append('g').attr('class', 'tooltip')
  const tw = 200
  const th = 70
  const tx = Math.min(mx + 10, width - tw - 10)
  const ty = Math.max(my - th - 5, 5)

  tooltipG.append('rect')
    .attr('x', tx)
    .attr('y', ty)
    .attr('width', tw)
    .attr('height', th)
    .attr('rx', 6)
    .attr('fill', '#0c0c14')
    .attr('stroke', '#232335')
    .attr('stroke-width', 0.5)

  tooltipG.append('text')
    .attr('x', tx + 10)
    .attr('y', ty + 18)
    .attr('fill', '#58a6ff')
    .attr('font-size', '11px')
    .attr('font-family', 'var(--font-mono)')
    .text(d.sha)

  tooltipG.append('text')
    .attr('x', tx + 10)
    .attr('y', ty + 34)
    .attr('fill', '#e8e8f0')
    .attr('font-size', '11px')
    .attr('font-family', 'var(--font-sans)')
    .text(`${d.message?.slice(0, 28)}${d.message?.length > 28 ? '...' : ''}`)

  tooltipG.append('text')
    .attr('x', tx + 10)
    .attr('y', ty + 52)
    .attr('fill', '#7a7a9d')
    .attr('font-size', '10px')
    .attr('font-family', 'var(--font-mono)')
    .text(`score: ${d.cognitive_score.toFixed(3)}  flags: ${flags}`)

  tooltipG.append('text')
    .attr('x', tx + 10)
    .attr('y', ty + 65)
    .attr('fill', '#7a7a9d')
    .attr('font-size', '10px')
    .attr('font-family', 'var(--font-sans)')
    .text(d.author)
}

function rollingMean(arr, window) {
  return arr.map((_, i) => {
    const start = Math.max(0, i - Math.floor(window / 2))
    const end = Math.min(arr.length, i + Math.ceil(window / 2))
    const slice = arr.slice(start, end)
    return slice.reduce((a, b) => a + b, 0) / slice.length
  })
}
