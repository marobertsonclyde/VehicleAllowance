import { Routes, Route, Navigate } from 'react-router-dom'
import { Spinner } from '@fluentui/react-components'
import { useUserRole, canAccessAdmin, canAccessReview, canAccessPayroll } from '@/hooks/useUserRole'
import { WizardProvider } from '@/context/WizardContext'
import { AppShell } from '@/components/shared/AppShell'

// Employee screens
import { HomeScreen }              from '@/components/screens/employee/HomeScreen'
import { EligibilityCheckScreen }  from '@/components/screens/employee/EligibilityCheckScreen'
import { VehicleDetailsScreen }    from '@/components/screens/employee/VehicleDetailsScreen'
import { AllowanceLevelScreen }    from '@/components/screens/employee/AllowanceLevelScreen'
import { InsuranceDocumentsScreen }from '@/components/screens/employee/InsuranceDocumentsScreen'
import { ReviewSubmitScreen }      from '@/components/screens/employee/ReviewSubmitScreen'
import { StatusTrackerScreen }     from '@/components/screens/employee/StatusTrackerScreen'
import { InsuranceRenewalScreen }  from '@/components/screens/employee/InsuranceRenewalScreen'
import { OptOutScreen }            from '@/components/screens/employee/OptOutScreen'

// Reviewer screens
import { ReviewQueueScreen }       from '@/components/screens/reviewer/ReviewQueueScreen'
import { ApplicationDetailScreen } from '@/components/screens/reviewer/ApplicationDetailScreen'
import { DecisionScreen }          from '@/components/screens/reviewer/DecisionScreen'

// Admin screens
import { AdminDashboard }   from '@/components/screens/admin/AdminDashboard'
import { ApplicationsTable }from '@/components/screens/admin/ApplicationsTable'
import { AllowancesTable }  from '@/components/screens/admin/AllowancesTable'
import { ConfigLevels }     from '@/components/screens/admin/ConfigLevels'
import { ConfigReminders }  from '@/components/screens/admin/ConfigReminders'
import { ConfigCompanies }  from '@/components/screens/admin/ConfigCompanies'
import { AuditLogScreen }   from '@/components/screens/admin/AuditLogScreen'

// Payroll screens
import { PayrollDashboard }  from '@/components/screens/payroll/PayrollDashboard'
import { PayrollAllowances } from '@/components/screens/payroll/PayrollAllowances'

export default function App() {
  const { allRoles, loading } = useUserRole()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size="large" label="Loading..." />
      </div>
    )
  }

  return (
    <AppShell allRoles={allRoles}>
      <WizardProvider>
        <Routes>
          {/* ── Employee routes ── */}
          <Route path="/"                element={<HomeScreen />} />
          <Route path="/eligibility"     element={<EligibilityCheckScreen />} />
          <Route path="/apply/vehicle"   element={<VehicleDetailsScreen />} />
          <Route path="/apply/level"     element={<AllowanceLevelScreen />} />
          <Route path="/apply/insurance" element={<InsuranceDocumentsScreen />} />
          <Route path="/apply/review"    element={<ReviewSubmitScreen />} />
          <Route path="/status/:applicationId" element={<StatusTrackerScreen />} />
          <Route path="/renewal"         element={<InsuranceRenewalScreen />} />
          <Route path="/opt-out"         element={<OptOutScreen />} />

          {/* ── Reviewer routes ── */}
          {canAccessReview(allRoles) && <>
            <Route path="/review"                          element={<ReviewQueueScreen />} />
            <Route path="/review/:applicationId"           element={<ApplicationDetailScreen />} />
            <Route path="/review/:applicationId/decide"    element={<DecisionScreen />} />
          </>}

          {/* ── Admin routes ── */}
          {canAccessAdmin(allRoles) && <>
            <Route path="/admin"                   element={<AdminDashboard />} />
            <Route path="/admin/applications"      element={<ApplicationsTable />} />
            <Route path="/admin/allowances"        element={<AllowancesTable />} />
            <Route path="/admin/config/levels"     element={<ConfigLevels />} />
            <Route path="/admin/config/reminders"  element={<ConfigReminders />} />
            <Route path="/admin/config/companies"  element={<ConfigCompanies />} />
            <Route path="/admin/audit"             element={<AuditLogScreen />} />
          </>}

          {/* ── Payroll routes ── */}
          {canAccessPayroll(allRoles) && <>
            <Route path="/payroll"            element={<PayrollDashboard />} />
            <Route path="/payroll/allowances" element={<PayrollAllowances />} />
          </>}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </WizardProvider>
    </AppShell>
  )
}
