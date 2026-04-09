import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MockPowerProvider } from './mocks/MockPowerProvider'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MockPowerProvider>
        <App />
      </MockPowerProvider>
    </BrowserRouter>
  </StrictMode>,
)
