import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PowerProvider } from './PowerProvider'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PowerProvider>
        <App />
      </PowerProvider>
    </BrowserRouter>
  </StrictMode>,
)
