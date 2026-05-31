import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RepositoryAnalysisPage from './pages/RepositoryAnalysisPage'
import AccuracyReportPage from './pages/AccuracyReportPage'
import PullRequestAnalysisPage from './pages/PullRequestAnalysisPage'
import NavigationBar from './components/NavigationBar'
import { useRepositoryAnalysis } from './hooks/useRepositoryAnalysis'
import { usePullRequestAnalysis } from './hooks/usePullRequestAnalysis'
import { ROUTES, LEGACY_ROUTES } from './config/routes'

function LegacyAnalysisRedirect() {
  const [searchParams] = useSearchParams()
  const query = searchParams.toString()
  const target = query ? `${ROUTES.ANALYSIS}?${query}` : ROUTES.ANALYSIS
  return <Navigate to={target} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

function AppRoutes() {
  const analysis = useRepositoryAnalysis()
  const prAnalysis = usePullRequestAnalysis()
  const scanning =
    analysis.loading ||
    analysis.validating ||
    prAnalysis.loading ||
    prAnalysis.validating

  return (
    <>
      <NavigationBar scanning={scanning} />
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage analysis={analysis} prAnalysis={prAnalysis} />} />
        <Route path={ROUTES.ANALYSIS} element={<RepositoryAnalysisPage analysis={analysis} />} />
        <Route path={ROUTES.PR_ANALYSIS} element={<PullRequestAnalysisPage analysis={prAnalysis} />} />
        <Route path={ROUTES.ACCURACY} element={<AccuracyReportPage />} />
        <Route path={LEGACY_ROUTES.RESULTS} element={<LegacyAnalysisRedirect />} />
        <Route path={LEGACY_ROUTES.EVAL} element={<Navigate to={ROUTES.ACCURACY} replace />} />
      </Routes>
    </>
  )
}
