import { Routes, Route, Navigate } from 'react-router-dom'
import { HomeScreen } from './components/screens/HomeScreen'
import { EligibilityCheckScreen } from './components/screens/EligibilityCheckScreen'
import { VehicleDetailsScreen } from './components/screens/VehicleDetailsScreen'
import { AllowanceLevelScreen } from './components/screens/AllowanceLevelScreen'
import { InsuranceDocumentsScreen } from './components/screens/InsuranceDocumentsScreen'
import { ReviewSubmitScreen } from './components/screens/ReviewSubmitScreen'
import { StatusTrackerScreen } from './components/screens/StatusTrackerScreen'
import { InsuranceRenewalScreen } from './components/screens/InsuranceRenewalScreen'
import { OptOutScreen } from './components/screens/OptOutScreen'

/**
 * Application routes.
 *
 * New application wizard flow:
 *   /eligibility → /apply/vehicle → /apply/level → /apply/insurance → /apply/review
 *
 * Ongoing management (requires active AllowanceRecord):
 *   / → /status/:applicationId → /renewal → /opt-out
 */
export default function App() {
  return (
    <div className="app-container">
      <Routes>
        {/* Home dashboard */}
        <Route path="/" element={<HomeScreen />} />

        {/* New application wizard */}
        <Route path="/eligibility" element={<EligibilityCheckScreen />} />
        <Route path="/apply/vehicle" element={<VehicleDetailsScreen />} />
        <Route path="/apply/level" element={<AllowanceLevelScreen />} />
        <Route path="/apply/insurance" element={<InsuranceDocumentsScreen />} />
        <Route path="/apply/review" element={<ReviewSubmitScreen />} />

        {/* Post-submission / ongoing */}
        <Route path="/status/:applicationId" element={<StatusTrackerScreen />} />
        <Route path="/renewal" element={<InsuranceRenewalScreen />} />
        <Route path="/opt-out" element={<OptOutScreen />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
