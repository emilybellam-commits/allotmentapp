import { FLOWER_NUMBERS } from '../data/catalogue'
import { useStore } from '../store/store'
import { plantGroups } from '../util/plantGroups'
import type { Plant } from '../types'
import { PinBlob } from './PinBlob'

export function PlantKeyCard({ onPick }: { onPick?: (id: string) => void }) {
  const { plants } = useStore()

  const row = (p: Plant) => {
    const n = p.cat === 'Flower' ? FLOWER_NUMBERS[p.id] ?? null : null
    return (
      <button key={p.id} onClick={() => onPick?.(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '1.5px 0', width: '100%', textAlign: 'left' }}>
        <span style={{ position: 'relative', width: 27, height: 27, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PinBlob plant={p} px={27} inspector />
          {n != null && (
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, color: '#3a3228', pointerEvents: 'none' }}>{n}</span>
          )}
        </span>
        <span style={{ fontSize: 11.5, color: 'var(--ink)' }}>{n != null ? `${n}.  ` : ''}{p.name}</span>
      </button>
    )
  }

  const head = (t: string) => (
    <div key={'h' + t} className="tk" style={{ fontSize: 9.5, letterSpacing: '.14em', color: 'var(--text2)', margin: '9px 0 3px' }}>{t}</div>
  )

  return (
    <div>
      <div className="hand" style={{ fontSize: 21, color: 'var(--ink)', lineHeight: 1, marginBottom: 1 }}>Plant key</div>
      {plantGroups(plants).map(g => g.plants.length > 0 && (
        <div key={g.key}>
          {head(g.title)}
          {g.plants.map(row)}
        </div>
      ))}
    </div>
  )
}
