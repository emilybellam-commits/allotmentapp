import React from 'react'
import type { Plant, WeekRange } from '../types'
import { lastLabel, lastRange } from '../util/weeks'

function barStyle(range: WeekRange | undefined, color: string): React.CSSProperties {
  if (!range) return { display: 'none' }
  const [a, b] = range
  if (a === b) return { display: 'none' }
  const left = ((a - 1) / 52) * 100
  const width = Math.max(((b - a) / 52) * 100, 3)
  return { position: 'absolute', top: 0, left: left + '%', width: width + '%', height: 8, borderRadius: 5, background: color }
}

const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

export function TimelineBars({ plant: p }: { plant: Plant }) {
  const last = lastRange(p)
  const ll = lastLabel(p)
  const rows: [string, WeekRange | undefined, string][] = [
    ['sow', p.sow, 'var(--bar-sow)'],
    ['plant', p.plant, 'var(--bar-plant)'],
    [ll, last, ll === 'bloom' ? 'var(--bar-bloom)' : 'var(--bar-harvest)'],
  ]
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map(([label, range, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, width: 42, color: 'var(--text2)', flex: 'none' }}>{label}</span>
            <div style={{ flex: 1, height: 8, borderRadius: 5, background: 'var(--track)', position: 'relative' }}>
              <div style={barStyle(range, color)} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#bcb39a', marginTop: 4, paddingLeft: 50 }}>
        {MONTH_LETTERS.map((m, i) => <span key={i}>{m}</span>)}
      </div>
    </div>
  )
}
