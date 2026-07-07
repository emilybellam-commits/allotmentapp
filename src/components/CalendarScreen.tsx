import React from 'react'
import { useStore } from '../store/store'
import type { Plant } from '../types'
import { inRange, weekLabel } from '../util/weeks'
import { byName } from '../util/plantGroups'
import { PinBlob } from './PinBlob'
import { TimelineBars } from './TimelineBars'

export function CalendarScreen() {
  const { week, plants, pins, setDbDetailId, setTab } = useStore()
  const live = plants.filter(p => !p.deleted).sort(byName)
  const onMapCount = (id: string) => pins.filter(pin => pin.plantId === id).length

  const openPlant = (id: string) => { setDbDetailId(id); setTab('plants') }

  const sowNow = live.filter(p => inRange(week, p.sow))
  const plantNow = live.filter(p => inRange(week, p.plant) && !(p.sow && p.sow[0] === p.plant?.[0] && p.sow[1] === p.plant?.[1]))
  const harvestNow = live.filter(p => p.harvest && inRange(week, p.harvest))
  const bloomNow = live.filter(p => p.bloom && inRange(week, p.bloom))

  const row = (p: Plant) => {
    const n = onMapCount(p.id)
    return (
      <button
        key={p.id}
        onClick={() => openPlant(p.id)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '6px 0' }}
      >
        <span style={{ width: 30, height: 30, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PinBlob plant={p} px={28} inspector />
        </span>
        <span className="hand" style={{ fontSize: 20, color: 'var(--ink)', flex: 1, minWidth: 0 }}>{p.name}</span>
        {n > 0 && (
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 9, padding: '2px 8px' }}>
            {n} on plan
          </span>
        )}
      </button>
    )
  }

  const section = (title: string, color: string, list: Plant[]) =>
    list.length > 0 && (
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
          <span className="tk" style={{ fontSize: 10, color: 'var(--text2)' }}>{title}</span>
        </div>
        <div style={{ marginLeft: 4 }}>{list.map(row)}</div>
      </div>
    )

  return (
    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '14px 18px 26px' }}>
      <div className="hand" style={{ fontSize: 28, color: 'var(--ink)' }}>{weekLabel(week)}</div>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14 }}>
        Scrub the timeline below to plan any week of the year.
      </div>

      {section('Sow now', 'var(--bar-sow)', sowNow)}
      {section('Plant out now', 'var(--bar-plant)', plantNow)}
      {section('Harvest now', 'var(--bar-harvest)', harvestNow)}
      {section('In bloom', 'var(--bar-bloom)', bloomNow)}
      {sowNow.length + plantNow.length + harvestNow.length + bloomNow.length === 0 && (
        <div className="hand" style={{ fontSize: 22, color: 'var(--text2)', padding: '18px 0' }}>
          A quiet week on the plot — plan the beds & sharpen the hoe.
        </div>
      )}

      <div className="tk" style={{ fontSize: 10, color: 'var(--text3)', margin: '18px 0 10px' }}>The whole year</div>
      {live.map(p => (
        <button key={p.id} onClick={() => openPlant(p.id)} style={{ width: '100%', textAlign: 'left', marginBottom: 12, display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="hand" style={{ fontSize: 18, color: 'var(--ink)' }}>{p.name}</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{onMapCount(p.id) > 0 ? `${onMapCount(p.id)} on plan` : ''}</span>
          </div>
          <div style={{ position: 'relative' }}>
            <TimelineBars plant={p} />
            {/* current week marker */}
            <div style={{
              position: 'absolute', top: -2, bottom: 10,
              left: `calc(50px + (100% - 50px) * ${(week - 1) / 52})`,
              width: 1.5, background: 'var(--red)', opacity: 0.55, pointerEvents: 'none',
            }} />
          </div>
        </button>
      ))}
    </div>
  )
}
