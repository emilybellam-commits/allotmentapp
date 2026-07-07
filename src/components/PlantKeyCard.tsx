import { FLOWER_NUMBERS, FLOWER_ORDER, VEG_ORDER } from '../data/catalogue'
import { useStore } from '../store/store'
import { PinBlob } from './PinBlob'

export function PlantKeyCard({ onPick }: { onPick?: (id: string) => void }) {
  const { plants, plantById } = useStore()
  const customIds = plants.filter(p => p.custom && !p.deleted).map(p => p.id)

  const row = (id: string, n: number | null) => {
    const p = plantById(id)
    if (!p) return null
    return (
      <button key={id} onClick={() => onPick?.(id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '1.5px 0', width: '100%', textAlign: 'left' }}>
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
      {head('Flowers')}
      {FLOWER_ORDER.map(id => row(id, FLOWER_NUMBERS[id] ?? null))}
      {head('Vegetables')}
      {VEG_ORDER.map(id => row(id, null))}
      {customIds.length > 0 && head('My plants')}
      {customIds.map(id => row(id, null))}
    </div>
  )
}
