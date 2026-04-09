import { type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Review Queue',      path: '/admin/queue',      icon: '📋' },
  { label: 'Active Allowances', path: '/admin/allowances', icon: '✅' },
  { label: 'Reference Data',    path: '/admin/reference',  icon: '⚙️' },
]

interface AdminLayoutProps {
  title: string
  children: ReactNode
}

export function AdminLayout({ title, children }: AdminLayoutProps) {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'var(--font-sans)', background: '#f3f2f1' }}>
      {/* Sidebar */}
      <nav style={{
        width: '220px', minWidth: '220px', background: '#1b1a19', color: '#fff',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #333' }}>
          <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Vehicle Allowance</div>
          <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px' }}>Admin Portal</div>
        </div>

        <div style={{ flex: 1, padding: '8px 0' }}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 16px',
                textDecoration: 'none',
                color: isActive ? '#fff' : '#bbb',
                background: isActive ? '#0078d4' : 'transparent',
                fontSize: '14px',
                borderLeft: isActive ? '3px solid #60a5fa' : '3px solid transparent',
              })}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #333' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent', border: '1px solid #444', color: '#aaa',
              borderRadius: '4px', padding: '6px 12px', cursor: 'pointer',
              fontSize: '12px', width: '100%',
            }}
          >
            ← Employee Portal
          </button>
        </div>
      </nav>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{
          background: '#fff', borderBottom: '1px solid #e1dfdd',
          padding: '0 24px', height: '48px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h1 style={{ fontSize: '16px', fontWeight: 600, color: '#323130' }}>{title}</h1>
          <div style={{ fontSize: '13px', color: '#8a8886' }}>Equipment Leader · POC</div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
