import { useStore } from '../store/store'
import type { Plant } from '../types'
import { stageAt, weekLabelShort } from '../util/weeks'
import { PinBlob } from './PinBlob'
import { TimelineBars } from './TimelineBars'
import { journalCountFor } from '../util/journalTags'

/** View-mode inspector body: used in the map bottom sheet. */
export function InspectorContent({ plant: p, compact }: { plant: Plant; compact: boolean }) {
  const { week, pins, journal, setTab, setDbDetailId } = useStore()
  const onMap = pins.filter(pin => pin.plantId === p.id).length
  const notes = journalCountFor(journal, p.id)

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 'none', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PinBlob plant={p} px={52} inspector />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="tk" style={{ fontSize: 9, color: 'var(--text2)' }}>{p.cat}</div>
          <div className="hand" style={{ fontSize: 25, color: 'var(--ink)', lineHeight: 0.95, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
          <div style={{ fontStyle: 'italic', fontSize: 11.5, color: 'var(--text2)' }}>{p.latin}</div>
        </div>
        <div style={{ flex: 'none', textAlign: 'right', maxWidth: '42%' }}>
          <div className="tk" style={{ fontSize: 8.5, color: 'var(--text3)', whiteSpace: 'nowrap' }}>Right now · {weekLabelShort(week)}</div>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--accent)', marginTop: 2, lineHeight: 1.2 }}>{stageAt(p, week)}</div>
        </div>
      </div>

      {!compact && (
        <div className="fade-in">
          <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--body)', marginTop: 10 }}>{p.note}</div>

          <div className="tk" style={{ fontSize: 10, color: 'var(--text3)', margin: '14px 0 8px' }}>
            Sow · plant · {p.bloom ? 'bloom' : 'harvest'}
          </div>
          <TimelineBars plant={p} />

          <div style={{ display: 'flex', gap: 22, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--hairline2)', alignItems: 'center' }}>
            <div>
              <div className="hand" style={{ fontSize: 24, color: 'var(--accent)', lineHeight: 1 }}>{onMap}</div>
              <div className="tk" style={{ fontSize: 8.5, color: 'var(--text3)' }}>on plan</div>
            </div>
            <div>
              <div className="hand" style={{ fontSize: 24, color: 'var(--accent)', lineHeight: 1 }}>{notes}</div>
              <div className="tk" style={{ fontSize: 8.5, color: 'var(--text3)' }}>journal notes</div>
            </div>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => { setDbDetailId(p.id); setTab('plants') }}
              style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 7, padding: '8px 12px' }}
            >
              Full care notes →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
