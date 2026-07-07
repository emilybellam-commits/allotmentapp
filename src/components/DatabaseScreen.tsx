import React, { useState } from 'react'
import { useStore, newId } from '../store/store'
import type { Plant, PlantCategory, WeekRange } from '../types'
import { FLOWER_ORDER, VEG_ORDER } from '../data/catalogue'
import { PinBlob } from './PinBlob'
import { TimelineBars } from './TimelineBars'
import { stageAt, weekLabelShort } from '../util/weeks'

const kicker: React.CSSProperties = { fontSize: 10, color: 'var(--text3)', margin: '18px 0 6px' }

export function DatabaseScreen() {
  const { plants, plantById, dbDetailId, setDbDetailId } = useStore()
  const [adding, setAdding] = useState(false)

  const detail = dbDetailId ? plantById(dbDetailId) : null
  if (adding) return <AddPlantForm onDone={() => setAdding(false)} />
  if (detail) return <PlantDetail plant={detail} onBack={() => setDbDetailId(null)} />

  const customPlants = plants.filter(p => p.custom)

  const section = (title: string, ids: string[]) => (
    <div key={title}>
      <div className="tk" style={{ ...kicker, margin: '14px 16px 4px' }}>{title}</div>
      {ids.map(id => {
        const p = plantById(id)
        if (!p) return null
        return (
          <button
            key={id}
            onClick={() => setDbDetailId(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
              padding: '9px 16px', borderBottom: '1px solid var(--hairline2)',
            }}
          >
            <span style={{ width: 40, height: 40, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PinBlob plant={p} px={38} inspector />
            </span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span className="hand" style={{ fontSize: 21, color: 'var(--ink)', display: 'block', lineHeight: 1 }}>{p.name}</span>
              <span style={{ fontStyle: 'italic', fontSize: 11.5, color: 'var(--text2)' }}>{p.latin}</span>
            </span>
            <span style={{ color: 'var(--text3)', fontSize: 14 }}>›</span>
          </button>
        )
      })}
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', padding: '14px 16px 0' }}>
        <div className="hand" style={{ fontSize: 28, color: 'var(--ink)' }}>Plant database</div>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setAdding(true)}
          style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 7, padding: '7px 12px' }}
        >
          + Add plant
        </button>
      </div>
      {section('Vegetables', VEG_ORDER)}
      {section('Flowers', FLOWER_ORDER)}
      {customPlants.length > 0 && section('My plants', customPlants.map(p => p.id))}
      <div style={{ height: 24 }} />
    </div>
  )
}

// ---------------- detail ----------------

function PlantDetail({ plant: p, onBack }: { plant: Plant; onBack: () => void }) {
  const { week, plants, pins, journal, setDbDetailId, plantById } = useStore()
  const onMap = pins.filter(pin => pin.plantId === p.id).length
  const notes = journal.filter(j => j.plantId === p.id).length

  const linkChips = (ids: string[] | undefined, empty: string) => {
    const list = (ids ?? []).map(id => plantById(id)).filter(Boolean) as Plant[]
    if (list.length === 0) return <span style={{ fontSize: 13, color: 'var(--text3)' }}>{empty}</span>
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {list.map(c => (
          <button
            key={c.id}
            onClick={() => setDbDetailId(c.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 7,
              border: '1px solid var(--hairline2)', background: 'var(--map)', fontSize: 12, color: 'var(--ink)',
            }}
          >
            <span style={{ width: 11, height: 11, borderRadius: c.cat === 'Flower' ? '50%' : 3, background: c.col, border: '1px solid var(--ink)' }} />
            {c.name}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '12px 18px 26px' }}>
      <button onClick={onBack} style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', padding: '4px 0' }}>
        ‹ All plants
      </button>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
        <PinBlob plant={p} px={116} inspector />
      </div>
      <div className="tk" style={{ fontSize: 11, color: 'var(--text2)', marginTop: 6 }}>{p.cat}</div>
      <div className="hand" style={{ fontSize: 34, color: 'var(--ink)', lineHeight: 0.95, marginTop: 2 }}>{p.name}</div>
      <div style={{ fontStyle: 'italic', fontSize: 14, color: 'var(--text2)' }}>{p.latin}</div>
      <div style={{ fontSize: 12, color: '#7a7460', marginTop: 3 }}>{p.family}</div>

      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--hairline2)' }}>
        <div className="tk" style={{ fontSize: 10, color: 'var(--text3)' }}>Right now · {weekLabelShort(week)}</div>
        <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--accent)', marginTop: 2 }}>{stageAt(p, week)}</div>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--body)', marginTop: 12 }}>{p.note}</div>

      <div className="tk" style={kicker}>Sow · plant · {p.bloom ? 'bloom' : 'harvest'}</div>
      <TimelineBars plant={p} />

      {p.care && (
        <>
          <div className="tk" style={kicker}>Care</div>
          <CareRow label="Light" text={p.care.light} />
          <CareRow label="Water" text={p.care.watering} />
          <CareRow label="Soil" text={p.care.soil} />
        </>
      )}

      <div className="tk" style={kicker}>Companions</div>
      {linkChips(p.companions, 'No particular friends — gets on with everyone.')}
      <div className="tk" style={kicker}>Keep away from</div>
      {linkChips(p.enemies, 'No known enemies.')}

      {p.pests && p.pests.length > 0 && (
        <>
          <div className="tk" style={kicker}>Pests & diseases — organic controls</div>
          {p.pests.map(pest => (
            <div key={pest.name} style={{ marginBottom: 10 }}>
              <div className="hand" style={{ fontSize: 19, color: 'var(--ink)', lineHeight: 1.1 }}>{pest.name}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--body)' }}>{pest.control}</div>
            </div>
          ))}
        </>
      )}

      {p.pruning && (
        <>
          <div className="tk" style={kicker}>Pruning & training</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--body)' }}>{p.pruning}</div>
        </>
      )}

      <div style={{ display: 'flex', gap: 22, marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--hairline2)' }}>
        <div>
          <div className="hand" style={{ fontSize: 26, color: 'var(--accent)', lineHeight: 1 }}>{onMap}</div>
          <div className="tk" style={{ fontSize: 9, color: 'var(--text3)' }}>on plan</div>
        </div>
        <div>
          <div className="hand" style={{ fontSize: 26, color: 'var(--accent)', lineHeight: 1 }}>{notes}</div>
          <div className="tk" style={{ fontSize: 9, color: 'var(--text3)' }}>journal notes</div>
        </div>
      </div>
    </div>
  )
}

function CareRow({ label, text }: { label: string; text: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
      <span className="hand" style={{ fontSize: 18, color: 'var(--accent)', width: 52, flex: 'none', lineHeight: 1.3 }}>{label}</span>
      <span style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--body)' }}>{text}</span>
    </div>
  )
}

// ---------------- add plant ----------------

function AddPlantForm({ onDone }: { onDone: () => void }) {
  const { upsertPlant, setDbDetailId } = useStore()
  const [name, setName] = useState('')
  const [latin, setLatin] = useState('')
  const [family, setFamily] = useState('')
  const [cat, setCat] = useState<PlantCategory>('Vegetable')
  const [col, setCol] = useState('#8aa85a')
  const [sketch, setSketch] = useState<Plant['sketch']>('spiky')
  const [size, setSize] = useState(40)
  const [sowFrom, setSowFrom] = useState(14)
  const [sowTo, setSowTo] = useState(20)
  const [plantFrom, setPlantFrom] = useState(18)
  const [plantTo, setPlantTo] = useState(24)
  const [lastFrom, setLastFrom] = useState(28)
  const [lastTo, setLastTo] = useState(40)
  const [note, setNote] = useState('')

  const save = () => {
    if (!name.trim()) return
    const id = 'custom-' + newId()
    const sow: WeekRange = [sowFrom, sowTo]
    const plantW: WeekRange = [plantFrom, plantTo]
    const last: WeekRange = [lastFrom, lastTo]
    const flower = cat === 'Flower'
    const p: Plant = {
      id, name: name.trim(), latin: latin.trim(), family: family.trim(), cat, col,
      size, custom: true,
      sketch: flower ? sketch : undefined,
      veg: flower ? undefined : 'bean',
      sow, plant: plantW,
      ...(flower ? { bloom: last } : { harvest: last }),
      note: note.trim() || `${name.trim()} — added to the plot catalogue.`,
      stages: [
        { from: 1, to: Math.max(1, sowFrom - 1), label: 'Not in yet' },
        { from: sowFrom, to: plantTo, label: 'Young plants' },
        { from: plantTo + 1, to: Math.max(plantTo + 1, lastFrom - 1), label: 'Growing on' },
        { from: lastFrom, to: lastTo, label: flower ? 'In bloom' : 'Harvesting' },
      ],
      restStage: 'Over',
      updatedAt: Date.now(),
    }
    upsertPlant(p)
    setDbDetailId(id)
    onDone()
  }

  const numRow = (label: string, a: number, setA: (n: number) => void, b: number, setB: (n: number) => void) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--text2)', width: 88, flex: 'none' }}>{label}</span>
      <input type="number" min={1} max={52} value={a} onChange={e => setA(parseInt(e.target.value || '1', 10))} style={{ width: 64 }} />
      <span style={{ color: 'var(--text3)' }}>to</span>
      <input type="number" min={1} max={52} value={b} onChange={e => setB(parseInt(e.target.value || '1', 10))} style={{ width: 64 }} />
      <span style={{ fontSize: 11, color: 'var(--text3)' }}>wk</span>
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '12px 18px 26px' }}>
      <button onClick={onDone} style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', padding: '4px 0' }}>‹ Cancel</button>
      <div className="hand" style={{ fontSize: 28, color: 'var(--ink)', margin: '6px 0 12px' }}>Add a plant</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input type="text" placeholder="Name (e.g. Parsnip)" value={name} onChange={e => setName(e.target.value)} />
        <input type="text" placeholder="Latin name" value={latin} onChange={e => setLatin(e.target.value)} />
        <input type="text" placeholder="Family (e.g. Apiaceae)" value={family} onChange={e => setFamily(e.target.value)} />
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={cat} onChange={e => setCat(e.target.value as PlantCategory)}>
            <option>Vegetable</option><option>Flower</option><option>Fruit bush</option><option>Herb</option>
          </select>
          {cat === 'Flower' && (
            <select value={sketch} onChange={e => setSketch(e.target.value as Plant['sketch'])}>
              <option value="spiky">spiky edge</option>
              <option value="dotted">dotted edge</option>
              <option value="cloud">cloud edge</option>
              <option value="cross">cross edge</option>
              <option value="smooth">smooth edge</option>
            </select>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>Pin colour</span>
          <input type="color" value={col} onChange={e => setCol(e.target.value)} style={{ width: 44, height: 32, padding: 2, border: '1px solid var(--card-border)', borderRadius: 6, background: 'var(--map)' }} />
          <span style={{ fontSize: 12, color: 'var(--text2)', marginLeft: 10 }}>Pin size</span>
          <input type="number" min={16} max={120} value={size} onChange={e => setSize(parseInt(e.target.value || '40', 10))} style={{ width: 70 }} />
        </div>
      </div>

      <div className="tk" style={kicker}>Season windows</div>
      {numRow('Sow', sowFrom, setSowFrom, sowTo, setSowTo)}
      {numRow('Plant out', plantFrom, setPlantFrom, plantTo, setPlantTo)}
      {numRow(cat === 'Flower' ? 'Bloom' : 'Harvest', lastFrom, setLastFrom, lastTo, setLastTo)}

      <div className="tk" style={kicker}>Note</div>
      <textarea rows={3} placeholder="A practical note in your own words…" value={note} onChange={e => setNote(e.target.value)} />

      <button
        onClick={save}
        disabled={!name.trim()}
        style={{
          marginTop: 14, width: '100%', padding: '12px 0', borderRadius: 8, fontWeight: 600, fontSize: 14,
          background: name.trim() ? 'var(--accent)' : 'var(--hairline)', color: '#fdfbf5',
        }}
      >
        Add to catalogue
      </button>
    </div>
  )
}
