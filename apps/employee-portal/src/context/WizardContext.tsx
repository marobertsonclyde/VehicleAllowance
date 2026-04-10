import { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react'
import { useConnectorContext, useAuthContext } from '@microsoft/power-apps'
import type { EligibilityCheckResult } from '@/types'

type WizardStep = 'eligibility' | 'vehicle' | 'level' | 'insurance' | 'review'

interface WizardState {
  applicationId: string | null
  vehicleId: string | null
  currentStep: WizardStep
  eligibility: EligibilityCheckResult | null
  isDirty: boolean
  hydrated: boolean
}

type WizardAction =
  | { type: 'SET_APPLICATION_ID'; payload: string }
  | { type: 'SET_VEHICLE_ID'; payload: string }
  | { type: 'SET_STEP'; payload: WizardStep }
  | { type: 'SET_ELIGIBILITY'; payload: EligibilityCheckResult }
  | { type: 'MARK_DIRTY' }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; payload: { applicationId: string | null; vehicleId: string | null } }

const initialState: WizardState = {
  applicationId: null,
  vehicleId: null,
  currentStep: 'eligibility',
  eligibility: null,
  isDirty: false,
  hydrated: false,
}

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_APPLICATION_ID':
      return { ...state, applicationId: action.payload }
    case 'SET_VEHICLE_ID':
      return { ...state, vehicleId: action.payload }
    case 'SET_STEP':
      return { ...state, currentStep: action.payload }
    case 'SET_ELIGIBILITY':
      return { ...state, eligibility: action.payload }
    case 'MARK_DIRTY':
      return { ...state, isDirty: true }
    case 'RESET':
      return { ...initialState, hydrated: true }
    case 'HYDRATE':
      return { ...state, ...action.payload, hydrated: true }
    default:
      return state
  }
}

const WizardStateContext = createContext<WizardState>(initialState)
const WizardDispatchContext = createContext<Dispatch<WizardAction>>(() => {})

export function WizardProvider({ children }: { children: ReactNode }) {
  const { connectors } = useConnectorContext()
  const { userId } = useAuthContext()
  const [state, dispatch] = useReducer(wizardReducer, initialState)

  useEffect(() => {
    async function hydrate() {
      try {
        const appsResult = await connectors.dataverse.retrieveMultipleRecords(
          'va_allowanceapplications',
          `?$filter=_va_applicantid_value eq '${userId}' and va_status eq 'Draft'&$orderby=createdon desc&$top=1`,
        )
        const app = appsResult.entities?.[0] as { va_allowanceapplicationid?: string } | undefined
        const appId = app?.va_allowanceapplicationid ?? null

        let vehicleId: string | null = null
        if (appId) {
          const vehicleResult = await connectors.dataverse.retrieveMultipleRecords(
            'va_vehicles',
            `?$filter=_va_applicationid_value eq '${appId}'&$top=1`,
          )
          const vehicle = vehicleResult.entities?.[0] as { va_vehicleid?: string } | undefined
          vehicleId = vehicle?.va_vehicleid ?? null
        }

        dispatch({ type: 'HYDRATE', payload: { applicationId: appId, vehicleId } })
      } catch {
        dispatch({ type: 'HYDRATE', payload: { applicationId: null, vehicleId: null } })
      }
    }
    void hydrate()
  }, [connectors, userId])

  return (
    <WizardStateContext.Provider value={state}>
      <WizardDispatchContext.Provider value={dispatch}>
        {children}
      </WizardDispatchContext.Provider>
    </WizardStateContext.Provider>
  )
}

export function useWizardState() {
  return useContext(WizardStateContext)
}

export function useWizardDispatch() {
  return useContext(WizardDispatchContext)
}
