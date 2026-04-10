import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react'
import type { EligibilityCheckResult } from '@/types'

type WizardStep = 'eligibility' | 'vehicle' | 'level' | 'insurance' | 'review'

interface WizardState {
  applicationId: string | null
  vehicleId: string | null
  currentStep: WizardStep
  eligibility: EligibilityCheckResult | null
  isDirty: boolean
}

type WizardAction =
  | { type: 'SET_APPLICATION_ID'; payload: string }
  | { type: 'SET_VEHICLE_ID'; payload: string }
  | { type: 'SET_STEP'; payload: WizardStep }
  | { type: 'SET_ELIGIBILITY'; payload: EligibilityCheckResult }
  | { type: 'MARK_DIRTY' }
  | { type: 'RESET' }

const initialState: WizardState = {
  applicationId: null,
  vehicleId: null,
  currentStep: 'eligibility',
  eligibility: null,
  isDirty: false,
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
      return initialState
    default:
      return state
  }
}

const WizardStateContext = createContext<WizardState>(initialState)
const WizardDispatchContext = createContext<Dispatch<WizardAction>>(() => {})

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState)

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
