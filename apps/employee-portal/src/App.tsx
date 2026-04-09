import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { HomeScreen } from './components/screens/HomeScreen'
import { EligibilityCheckScreen } from './components/screens/EligibilityCheckScreen'
import { VehicleDetailsScreen } from './components/screens/VehicleDetailsScreen'
import { AllowanceLevelScreen } from './components/screens/AllowanceLevelScreen'
import { InsuranceDocumentsScreen } from './components/screens/InsuranceDocumentsScreen'
import { ReviewSubmitScreen } from './components/screens/ReviewSubmitScreen'
import { StatusTrackerScreen } from './components/screens/StatusTrackerScreen'
import { InsuranceRenewalScreen } from './components/screens/InsuranceRenewalScreen'
import { OptOutScreen } from './components/screens/OptOutScreen'
import { AdminReviewQueueScreen } from './components/screens/admin/AdminReviewQueueScreen'
import { AdminApplicationDetailScreen } from './components/screens/admin/AdminApplicationDetailScreen'
import { AdminActiveAllowancesScreen } from './components/screens/admin/AdminActiveAllowancesScreen'

function PortalSwitcher() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div style={{
      position: 'fixed', top: '12px', left: '50%', transform: 'translateX(-50%)',
      background: '#1b1a19', borderRadius: '20px', padding: '4px',
      display: 'flex', gap: '2px', zIndex: 8000, boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
    }}>
      {[
        { label: '👤 Employee Portal', path: '/',      active: !isAdmin },
        { label: '🛡 Admin Portal',    path: '/admin', active: isAdmin  },
      ].map(p => (
        <button
          key={p.path}
          onClick={() => navigate(p.path)}
          style={{
            padding: '5px 14px', borderRadius: '16px', border: 'none',
            background: p.active ? '#0078d4' : 'transparent',
            color: p.active ? '#fff' : '#999',
            cursor: 'pointer', fontSize: '12px', fontWeight: p.active ? 600 : 400,
            transition: 'all 0.15s',
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

export default function App() {
  return (
    <>
      <PortalSwitcher />
      <div className="app-container">
        <Routes>
          {/* ── Employee Portal ── */}
          <Route path="/" element={<HomeScreen />} />
          <Route path="/eligibility" element={<EligibilityCheckScreen />} />
          <Route path="/apply/vehicle" element={<VehicleDetailsScreen />} />
          <Route path="/apply/level" element={<AllowanceLevelScreen />} />
          <Route path="/apply/insurance" element={<InsuranceDocumentsScreen />} />
          <Route path="/apply/review" element={<ReviewSubmitScreen />} />
          <Route path="/status/:applicationId" element={<StatusTrackerScreen />} />
          <Route path="/renewal" element={<InsuranceRenewalScreen />} />
          <Route path="/opt-out" element={<OptOutScreen />} />

          {/* ── Admin Portal ── */}
          <Route path="/admin" element={<Navigate to="/admin/queue" replace />} />
          <Route path="/admin/queue" element={<AdminReviewQueueScreen />} />
          <Route path="/admin/applications/:id" element={<AdminApplicationDetailScreen />} />
          <Route path="/admin/allowances" element={<AdminActiveAllowancesScreen />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  )
}
