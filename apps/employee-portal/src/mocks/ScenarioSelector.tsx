/**
 * Floating scenario switcher — visible only in the POC build.
 * Lets stakeholders click through all application lifecycle states.
 */
import { SCENARIOS, type ScenarioKey } from './mock-data'

const ORDER: ScenarioKey[] = ['new', 'in-progress', 'under-review', 'active-ok', 'expiring']

interface ScenarioSelectorProps {
  current: ScenarioKey
  onChange: (key: ScenarioKey) => void
}

export function ScenarioSelector({ current, onChange }: ScenarioSelectorProps) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      background: '#1a1a2e',
      border: '1px solid #444',
      borderRadius: '10px',
      padding: '12px 14px',
      zIndex: 9999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      maxWidth: '320px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
        POC — Scenario Switcher
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {ORDER.map(key => {
          const s = SCENARIOS[key]
          const active = key === current
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              style={{
                background: active ? '#4f46e5' : 'transparent',
                color: active ? '#fff' : '#aaa',
                border: active ? '1px solid #6366f1' : '1px solid #333',
                borderRadius: '6px',
                padding: '5px 10px',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '12px',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: '10px', opacity: 0.75, marginTop: '1px' }}>{s.description}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
