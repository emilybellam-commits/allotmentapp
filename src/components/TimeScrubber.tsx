import { useStore } from '../store/store'
import { weekLabel } from '../util/weeks'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function TimeScrubber() {
  const { week, setWeek } = useStore()
  const pct = ((week - 1) / 51) * 100

  return (
    <div style={{ padding: '6px 16px 8px', borderTop: '1px solid var(--hairline)', background: 'var(--paper)', flex: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => setWeek(Math.max(1, week - 1))}
          aria-label="Previous week"
          style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8468', fontSize: 13 }}
        >◀</button>
        <div className="hand" style={{ fontSize: 20, color: 'var(--ink)', minWidth: 128, textAlign: 'center', whiteSpace: 'nowrap' }}>
          {weekLabel(week)}
        </div>
        <button
          onClick={() => setWeek(Math.min(52, week + 1))}
          aria-label="Next week"
          style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8468', fontSize: 13 }}
        >▶</button>
        <div style={{ flex: 1, minWidth: 60 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 13.5, left: 0, right: 0, height: 3, borderRadius: 2, background: '#d6ccb6' }} />
            <div style={{ position: 'absolute', top: 13.5, left: 0, height: 3, borderRadius: 2, background: 'var(--accent)', width: pct + '%' }} />
            <input
              type="range" min={1} max={52} value={week}
              onChange={e => setWeek(parseInt(e.target.value, 10))}
              style={{ position: 'relative', width: '100%', zIndex: 2, display: 'block' }}
              aria-label="Week of the year"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: 'var(--text3)', marginTop: -3 }}>
            {MONTHS.map(m => <span key={m}>{m[0]}</span>)}
          </div>
        </div>
      </div>
    </div>
  )
}
