import { useStore, type Tab } from '../store/store'

const INK_ACTIVE = 'var(--accent)'
const INK_IDLE = '#a59c82'

function Icon({ tab, active }: { tab: Tab; active: boolean }) {
  const stroke = active ? INK_ACTIVE : INK_IDLE
  const common = { fill: 'none', stroke, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (tab) {
    case 'map':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" {...common}>
          <path d="M3 6 L8 4 L14 6 L19 4 V16 L14 18 L8 16 L3 18 Z" />
          <path d="M8 4 V16 M14 6 V18" strokeWidth={1.1} opacity={0.7} />
        </svg>
      )
    case 'plants':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" {...common}>
          <path d="M11 19 V10" />
          <path d="M11 12 C11 8 8 6 4.5 6 C4.5 10 7 12 11 12 Z" />
          <path d="M11 9 C11 5.5 13.5 3.5 17.5 3.5 C17.5 7.5 15 9.5 11 9.5 Z" />
        </svg>
      )
    case 'calendar':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" {...common}>
          <rect x="3.5" y="5" width="15" height="13.5" rx="2" />
          <path d="M3.5 9.5 H18.5 M7.5 3 V6.5 M14.5 3 V6.5" />
          <circle cx="8" cy="13" r="1" fill={stroke} stroke="none" />
          <circle cx="12" cy="13" r="1" fill={stroke} stroke="none" />
        </svg>
      )
    case 'tasks':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" {...common}>
          <path d="M3.5 5.5 L5 7 L7.5 4" />
          <path d="M10 5.5 H18.5" strokeWidth={1.1} />
          <path d="M3.5 11.5 L5 13 L7.5 10" />
          <path d="M10 11.5 H18.5" strokeWidth={1.1} />
          <rect x="3.5" y="15.5" width="3.5" height="3.5" rx="1" />
          <path d="M10 17.5 H18.5" strokeWidth={1.1} />
        </svg>
      )
    case 'journal':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" {...common}>
          <path d="M5 3.5 H16 A1.5 1.5 0 0 1 17.5 5 V17 A1.5 1.5 0 0 1 16 18.5 H5 A1 1 0 0 1 4 17.5 V4.5 A1 1 0 0 1 5 3.5 Z" />
          <path d="M7 3.5 V18.5" strokeWidth={1.1} opacity={0.7} />
          <path d="M9.5 8 H14.5 M9.5 11 H14.5" strokeWidth={1.1} />
        </svg>
      )
  }
}

const LABELS: Record<Tab, string> = { map: 'Map', plants: 'Database', calendar: 'Calendar', tasks: 'Tasks', journal: 'Journal' }

export function TabBar() {
  const { tab, setTab } = useStore()
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-around', alignItems: 'stretch',
      background: 'var(--paper)', borderTop: '1px solid var(--hairline)',
      paddingBottom: 'var(--sab)', flex: 'none',
    }}>
      {(Object.keys(LABELS) as Tab[]).map(t => (
        <button
          key={t}
          onClick={() => setTab(t)}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 6px 7px', minWidth: 52 }}
        >
          <Icon tab={t} active={tab === t} />
          <span style={{ fontSize: 10, fontWeight: 600, color: tab === t ? 'var(--accent)' : INK_IDLE, letterSpacing: '.04em' }}>
            {LABELS[t]}
          </span>
          <span style={{ width: 18, height: 2, borderRadius: 1, background: tab === t ? 'var(--accent)' : 'transparent' }} />
        </button>
      ))}
    </div>
  )
}
