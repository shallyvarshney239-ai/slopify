export default function ConfusionMatrix({ matrix }) {
  if (!matrix) return null
  const cells = [
    { label: 'Actual low → Pred low', value: matrix.low?.low ?? 0, kind: 'tp' },
    { label: 'Actual low → Pred high', value: matrix.low?.high ?? 0, kind: 'fn' },
    { label: 'Actual high → Pred low', value: matrix.high?.low ?? 0, kind: 'fp' },
    { label: 'Actual high → Pred high', value: matrix.high?.high ?? 0, kind: 'tp' },
  ]

  return (
    <div className="confusion-matrix">
      <div className="cm-grid">
        {cells.map((c) => (
          <div key={c.label} className={`cm-cell cm-${c.kind}`}>
            <span className="cm-value">{c.value}</span>
            <span className="cm-label">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
