import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export default function ScoreHistogram({ commits }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || !commits?.length) return
    const scores = commits.map((c) => c.cognitive_score)
    const width = ref.current.parentElement.clientWidth || 500
    const height = 120
    const margin = { top: 12, right: 16, bottom: 28, left: 32 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    d3.select(ref.current).selectAll('*').remove()
    const svg = d3.select(ref.current).attr('width', width).attr('height', height)
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear().domain([0, 1]).range([0, innerW])
    const bins = d3.bin().domain([0, 1]).thresholds(20)(scores)
    const y = d3.scaleLinear().domain([0, d3.max(bins, (b) => b.length)]).range([innerH, 0])

    const colorScale = d3.scaleSequential().domain([0, 1]).interpolator(d3.interpolateRgb('#ff2a6d', '#39ff14'))

    g.selectAll('rect')
      .data(bins)
      .join('rect')
      .attr('x', (d) => x(d.x0) + 1)
      .attr('width', (d) => Math.max(0, x(d.x1) - x(d.x0) - 2))
      .attr('y', (d) => y(d.length))
      .attr('height', (d) => innerH - y(d.length))
      .attr('fill', (d) => colorScale((d.x0 + d.x1) / 2))
      .attr('opacity', 0.9)
      .attr('rx', 2)
      .style('filter', (d) => {
        const v = (d.x0 + d.x1) / 2
        return v < 0.35 ? 'drop-shadow(0 0 4px rgba(255,42,109,0.25))' : 'none'
      })

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat((d) => d.toFixed(1)))
      .call((s) => {
        s.select('.domain').attr('stroke', '#232335')
        s.selectAll('.tick line').attr('stroke', '#232335')
        s.selectAll('.tick text').attr('fill', '#7a7a9d').attr('font-size', '10px').attr('font-family', 'var(--font-mono)')
      })

    g.append('g')
      .call(d3.axisLeft(y).ticks(4))
      .call((s) => {
        s.select('.domain').attr('stroke', '#232335')
        s.selectAll('.tick line').attr('stroke', '#232335')
        s.selectAll('.tick text').attr('fill', '#7a7a9d').attr('font-size', '10px').attr('font-family', 'var(--font-mono)')
      })

    const mean = d3.mean(scores)
    g.append('line')
      .attr('x1', x(mean)).attr('x2', x(mean))
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#e8e8f0').attr('stroke-width', 1).attr('stroke-dasharray', '4,2').attr('opacity', 0.35)
    g.append('text')
      .attr('x', x(mean) + 3).attr('y', 10)
      .attr('fill', '#e8e8f0').attr('font-size', '9px').attr('font-family', 'var(--font-mono)')
      .text(`μ=${mean.toFixed(2)}`)
  }, [commits])

  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', boxShadow: 'inset 0 0 40px rgba(255,42,109,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
        <span className="section-eyebrow">score distribution</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
          {commits?.length} commits · red = rubber stamp · green = high engagement
        </span>
      </div>
      <svg ref={ref} style={{ display: 'block', width: '100%' }} />
    </div>
  )
}
