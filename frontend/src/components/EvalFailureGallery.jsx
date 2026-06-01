export default function FailureGallery({ failures }) {
  if (!failures) return null
  const fp = failures.false_positive || []
  const fn = failures.false_negative || []

  if (!fp.length && !fn.length) {
    return <p className="eval-empty">No engagement misclassifications in the evaluated bucket.</p>
  }

  return (
    <div className="failure-gallery">
      {fp.length > 0 && (
        <section>
          <h3 className="fg-title fg-fp">False positives ({fp.length})</h3>
          <p className="fg-sub">Flagged as low engagement but labeled high — where we are too harsh.</p>
          <div className="fg-cards">
            {fp.map((item) => (
              <FailureCard key={item.id} item={item} type="fp" />
            ))}
          </div>
        </section>
      )}
      {fn.length > 0 && (
        <section>
          <h3 className="fg-title fg-fn">False negatives ({fn.length})</h3>
          <p className="fg-sub">Missed low engagement — slop that slipped through.</p>
          <div className="fg-cards">
            {fn.map((item) => (
              <FailureCard key={item.id} item={item} type="fn" />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function FailureCard({ item, type }) {
  return (
    <article className={`fg-card fg-${type}`}>
      <header className="fg-card-head">
        <code>{item.id}</code>
        <span className="fg-score">score {item.score}</span>
      </header>
      <p className="fg-message">{item.message}</p>
      <p className="fg-notes">{item.notes}</p>
    </article>
  )
}
