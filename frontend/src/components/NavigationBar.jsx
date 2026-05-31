import { Link, useLocation } from 'react-router-dom'
import AppLogo from './AppLogo'
import { ROUTES, LEGACY_ROUTES } from '../config/routes'

export default function NavigationBar({ scanning }) {
  const loc = useLocation()
  const isAnalysisPage =
    loc.pathname === ROUTES.ANALYSIS ||
    loc.pathname === ROUTES.PR_ANALYSIS ||
    loc.pathname === LEGACY_ROUTES.RESULTS

  return (
    <nav className="navbar">
      <Link to={ROUTES.HOME} className="nav-logo">
        <AppLogo size={28} className="nav-logo-icon" />
        <span className="nav-logo-text">Slopify</span>
      </Link>

      <div className="nav-right">
        {scanning && (
          <div className="nav-scanning">
            <span className="nav-scan-dot" />
            analyzing evidence...
          </div>
        )}
        <Link to={ROUTES.ACCURACY} className="nav-link-muted">Accuracy</Link>
        {isAnalysisPage && (
          <Link to={ROUTES.HOME} className="nav-new-scan">← new scan</Link>
        )}
        <a
          href="https://github.com/brainRottedCoder/slopify"
          target="_blank"
          rel="noreferrer"
          className="nav-gh"
        >
          GitHub ↗
        </a>
      </div>
    </nav>
  )
}
