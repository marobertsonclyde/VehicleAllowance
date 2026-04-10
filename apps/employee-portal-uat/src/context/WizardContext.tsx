/**
 * UAT WizardContext — localStorage-backed, no Power Apps SDK.
 *
 * Replaces the production version that hydrates from Dataverse.
 * In UAT, wizard state (applicationId, vehicleId, step) is persisted to
 * localStorage under 'va-uat-wizard' so page reloads don't lose progress.
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  type Dispatch,
} from 'react'
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
  vehicleId:     null,
  currentStep:   'eligibility',
  eligibility:   null,
  isDirty:       false,
  hydrated:      false,
}

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_APPLICATION_ID': return { ...state, applicationId: action.payload }
    case 'SET_VEHICLE_ID':     return { ...state, vehicleId: action.payload }
    case 'SET_STEP':           return { ...state, currentStep: action.payload }
    case 'SET_ELIGIBILITY':    return { ...state, eligibility: action.payload }
    case 'MARK_DIRTY':         return { ...state, isDirty: true }
    case 'RESET':              return { ...initialState, hydrated: true }
    case 'HYDRATE':            return { ...state, ...action.payload, hydrated: true }
    default:                   return state
  }
}

const STORAGE_KEY = 'va-uat-wizard'

const WizardStateContext    = createContext<WizardState>(initialState)
const WizardDispatchContext = createContext<Dispatch<WizardAction>>(() => {})

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const { applicationId, vehicleId } = JSON.parse(saved) as {
          applicationId: string | null
          vehicleId: string | null
        }
        dispatch({ type: 'HYDRATE', payload: { applicationId, vehicleId } })
      } else {
        dispatch({ type: 'HYDRATE', payload: { applicationId: null, vehicleId: null } })
      }
    } catch {
      dispatch({ type: 'HYDRATE', payload: { applicationId: null, vehicleId: null } })
    }
  }, [])

  // Persist applicationId + vehicleId whenever they change
  useEffect(() => {
    if (!state.hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      applicationId: state.applicationId,
      vehicleId:     state.vehicleId,
    }))
  }, [state.hydrated, state.applicationId, state.vehicleId])

  return (
    <WizardStateContext.Provider value={state}>
      <WizardDispatchContext.Provider value={dispatch}>
        {children}
      </WizardDispatchContext.Provider>
    </WizardStateContext.Provider>
  )
}

export function useWizardState()    { return useContext(WizardStateContext) }
export function useWizardDispatch() { return useContext(WizardDispatchContext) }
