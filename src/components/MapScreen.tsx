import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store/store'
import type { Pin, PlotFeature } from '../types'
import { FLOWER_NUMBERS } from '../data/catalogue'
import { plantGroups } from '../util/plantGroups'
import { PinBlob } from './PinBlob'
import { FeatureView, FEATURE_LABELS } from './FeatureView'
import { PlantKeyCard } from './PlantKeyCard'
import { CompassCard } from './CompassCard'
import { InspectorContent } from './InspectorContent'
import { SunPath } from './SunPath'

const WORLD_W = 540
const WORLD_H = 1348

type SheetPos = 'peek' | 'full'

export function MapScreen() {
  const store = useStore()
  const {
    week, mode, pins, features, plantById,
    tool, setTool, featureTool, setFeatureTool, buildLayer, setBuildLayer,
    selectedPlantId, setSelectedPlantId, selectedPinId, setSelectedPinId,
    selectedFeatureId, setSelectedFeatureId,
    addPin, updatePin, removePin, addFeature, updateFeature, removeFeature,
  } = store

  const worldRef = useRef<HTMLDivElement>(null)
  const [worldW, setWorldW] = useState(360)
  const [showKey, setShowKey] = useState(false)
  const [showCompass, setShowCompass] = useState(false)
  const [sheet, setSheet] = useState<SheetPos>('peek')

  useEffect(() => {
    const el = worldRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setWorldW(el.clientWidth))
    ro.observe(el)
    setWorldW(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const scale = worldW / WORLD_W
  const build = mode === 'build'

  // ---- drag / pinch / tap state ----
  const gesture = useRef<{
    kind: 'pin' | 'feature'
    id: string
    pointers: Map<number, { x: number; y: number }>
    startDist?: number
    startSize?: number
    moved: boolean
    startX: number
    startY: number
    offsetX: number // pointer-to-origin offset in %
    offsetY: number
  } | null>(null)

  const pctOf = (e: { clientX: number; clientY: number }) => {
    const r = worldRef.current!.getBoundingClientRect()
    return {
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    }
  }

  const onPinPointerDown = (e: React.PointerEvent, pin: Pin) => {
    if (!build || buildLayer !== 'plants') return
    e.stopPropagation()
    const g = gesture.current
    if (g && g.kind === 'pin' && g.id === pin.id) {
      // second finger → pinch resize
      g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (g.pointers.size === 2) {
        const [a, b] = [...g.pointers.values()]
        g.startDist = Math.hypot(a.x - b.x, a.y - b.y)
        g.startSize = pin.size
      }
      ;(e.target as Element).setPointerCapture?.(e.pointerId)
      return
    }
    const { x, y } = pctOf(e)
    gesture.current = {
      kind: 'pin', id: pin.id,
      pointers: new Map([[e.pointerId, { x: e.clientX, y: e.clientY }]]),
      moved: false, startX: e.clientX, startY: e.clientY,
      offsetX: x - pin.x, offsetY: y - pin.y,
    }
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    setSelectedPinId(pin.id)
    setSelectedPlantId(pin.plantId)
  }

  const onFeaturePointerDown = (e: React.PointerEvent, f: PlotFeature) => {
    if (!build || buildLayer !== 'features') return
    e.stopPropagation()
    const { x, y } = pctOf(e)
    gesture.current = {
      kind: 'feature', id: f.id,
      pointers: new Map([[e.pointerId, { x: e.clientX, y: e.clientY }]]),
      moved: false, startX: e.clientX, startY: e.clientY,
      offsetX: x - f.x, offsetY: y - f.y,
    }
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    setSelectedFeatureId(f.id)
  }

  const onWorldPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current
    if (!g) return
    if (!g.pointers.has(e.pointerId)) return
    g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (Math.hypot(e.clientX - g.startX, e.clientY - g.startY) > 6) g.moved = true

    if (g.kind === 'pin' && g.pointers.size === 2 && g.startDist && g.startSize) {
      const [a, b] = [...g.pointers.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const size = Math.max(16, Math.min(120, g.startSize * (dist / g.startDist)))
      updatePin(g.id, { size: Math.round(size) })
      return
    }
    if (!g.moved || g.pointers.size !== 1) return
    const { x, y } = pctOf(e)
    if (g.kind === 'pin') {
      updatePin(g.id, {
        x: Math.max(1, Math.min(99, x - g.offsetX)),
        y: Math.max(0.5, Math.min(99.5, y - g.offsetY)),
      })
    } else {
      const f = features.find(ft => ft.id === g.id)
      if (!f) return
      updateFeature(g.id, {
        x: Math.max(-5, Math.min(100 - f.w + 5, x - g.offsetX)),
        y: Math.max(-2, Math.min(100 - f.h + 2, y - g.offsetY)),
      })
    }
  }

  const onWorldPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current
    if (g) {
      g.pointers.delete(e.pointerId)
      if (g.pointers.size === 0) gesture.current = null
      return
    }
  }

  // tap on empty world in build mode = place
  const tapStart = useRef<{ x: number; y: number } | null>(null)
  const onBgPointerDown = (e: React.PointerEvent) => {
    if (e.target !== e.currentTarget) return
    tapStart.current = { x: e.clientX, y: e.clientY }
  }
  const onBgPointerUp = (e: React.PointerEvent) => {
    const t = tapStart.current
    tapStart.current = null
    if (!t || e.target !== e.currentTarget) return
    if (Math.hypot(e.clientX - t.x, e.clientY - t.y) > 8) return
    if (!build) { setSelectedPinId(null); return }
    const { x, y } = pctOf(e)
    if (buildLayer === 'plants') {
      const id = addPin(tool, Math.max(1, Math.min(99, x)), Math.max(0.5, Math.min(99.5, y)))
      setSelectedPinId(id)
      setSelectedPlantId(tool)
    } else {
      setSelectedFeatureId(addFeature(featureTool, x, y))
    }
  }

  const selectedPin = pins.find(p => p.id === selectedPinId) ?? null
  const selectedFeature = features.find(f => f.id === selectedFeatureId) ?? null
  const inspectorPlant = plantById(selectedPin?.plantId ?? selectedPlantId)

  // build peek is taller: the palette stays usable while the map stays tappable
  const sheetHeights: Record<SheetPos, string> = {
    peek: build ? '224px' : '132px',
    full: 'min(66%, 470px)',
  }

  useEffect(() => { setSheet('peek') }, [build])

  // sheet drag handle: tap toggles; drag follows
  const handleDrag = useRef<{ startY: number; open: SheetPos } | null>(null)
  const onHandlePointerDown = (e: React.PointerEvent) => {
    handleDrag.current = { startY: e.clientY, open: sheet }
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }
  const onHandlePointerUp = (e: React.PointerEvent) => {
    const h = handleDrag.current
    handleDrag.current = null
    if (!h) return
    const dy = e.clientY - h.startY
    if (Math.abs(dy) < 10) setSheet(sheet === 'peek' ? 'full' : 'peek')
    else setSheet(dy < 0 ? 'full' : 'peek')
  }

  return (
    <div style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden' }}>
      {/* scrolling map surface */}
      <div
        style={{
          position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden',
          background: 'var(--map)',
          backgroundImage: 'radial-gradient(rgba(120,110,80,.05) 1px, transparent 1px)',
          backgroundSize: '7px 7px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          ref={worldRef}
          onPointerDown={onBgPointerDown}
          onPointerUp={e => { onWorldPointerUp(e); onBgPointerUp(e) }}
          onPointerMove={onWorldPointerMove}
          onPointerCancel={onWorldPointerUp}
          style={{
            position: 'relative',
            width: 'min(100% - 20px, 540px)',
            aspectRatio: `${WORLD_W} / ${WORLD_H}`,
            margin: '14px auto',
            marginBottom: 190,
            cursor: build ? 'crosshair' : 'default',
          }}
        >
          {features.map(f => (
            <FeatureView
              key={f.id}
              feature={f}
              selected={build && buildLayer === 'features' && f.id === selectedFeatureId}
              onPointerDown={build && buildLayer === 'features' ? e => onFeaturePointerDown(e, f) : undefined}
            />
          ))}

          <SunPath week={week} lat={store.settings.lat ?? 51.45} />

          {pins.map(pin => {
            const p = plantById(pin.plantId)
            if (!p) return null
            const px = pin.size * scale
            const sel = pin.id === selectedPinId
            const flowerNum = p.cat === 'Flower' ? FLOWER_NUMBERS[p.id] : undefined
            return (
              <div
                key={pin.id}
                onPointerDown={e => onPinPointerDown(e, pin)}
                onClick={e => {
                  e.stopPropagation()
                  if (gesture.current) return
                  setSelectedPinId(pin.id)
                  setSelectedPlantId(pin.plantId)
                }}
                style={{
                  position: 'absolute', left: pin.x + '%', top: pin.y + '%',
                  width: px, height: px, marginLeft: -px / 2, marginTop: -px / 2,
                  zIndex: sel ? 40 : 14,
                  touchAction: build && buildLayer === 'plants' ? 'none' : undefined,
                  cursor: build ? 'grab' : 'pointer',
                }}
              >
                <PinBlob plant={p} px={px} week={week} />
                {flowerNum != null && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none', fontWeight: 700,
                    fontSize: Math.max(10, Math.min(16, Math.round(px * 0.32))), color: '#3a3228',
                  }}>{flowerNum}</div>
                )}
                {sel && (
                  <div className="hand" style={{
                    position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                    marginTop: 1, fontSize: 15, color: 'var(--ink)', whiteSpace: 'nowrap', pointerEvents: 'none',
                    background: 'rgba(253,251,245,.85)', padding: '0 5px', borderRadius: 4,
                  }}>{p.name}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* floating overlay toggles */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 30, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
        <button className={'paper-btn' + (showKey ? ' active' : '')} onClick={() => setShowKey(k => !k)} style={{ padding: '0 12px' }}>
          <span className="hand" style={{ fontSize: 16 }}>key</span>
        </button>
        {showKey && (
          <div className="card fade-in" style={{ width: 186, padding: '10px 12px 11px', maxHeight: '46vh', overflowY: 'auto' }}>
            <PlantKeyCard onPick={id => { setSelectedPlantId(id); setSelectedPinId(null); if (build) setTool(id) }} />
          </div>
        )}
      </div>
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 30, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
        <button className={'paper-btn' + (showCompass ? ' active' : '')} onClick={() => setShowCompass(c => !c)} style={{ padding: '0 12px' }}>
          <span className="hand" style={{ fontSize: 16 }}>compass</span>
        </button>
        {showCompass && (
          <div className="card fade-in" style={{ width: 168, padding: '11px 12px 9px' }}>
            <CompassCard week={week} />
          </div>
        )}
      </div>

      {/* bottom sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 50,
        height: sheetHeights[sheet],
        background: 'var(--paper)', borderTop: '1px solid var(--card-border)',
        borderRadius: '18px 18px 0 0', boxShadow: '0 -6px 24px rgba(60,55,35,.14)',
        transition: 'height .25s cubic-bezier(.4,1,.5,1)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div
          onPointerDown={onHandlePointerDown}
          onPointerUp={onHandlePointerUp}
          style={{ padding: '7px 0 4px', cursor: 'grab', touchAction: 'none', flex: 'none' }}
        >
          <div style={{ width: 46, height: 5, borderRadius: 3, background: '#dcc99c', margin: '0 auto' }} />
        </div>
        <div style={{ flex: 1, overflowY: build || sheet === 'full' ? 'auto' : 'hidden', padding: '0 18px 14px', minHeight: 0 }}>
          {build ? (
            <BuildSheet
              buildLayer={buildLayer} setBuildLayer={setBuildLayer}
              tool={tool} setTool={setTool}
              featureTool={featureTool} setFeatureTool={setFeatureTool}
              selectedPin={selectedPin} selectedFeature={selectedFeature}
              updatePin={updatePin} removePin={removePin}
              updateFeature={updateFeature} removeFeature={removeFeature}
              plantName={(id: string) => plantById(id)?.name ?? id}
            />
          ) : (
            inspectorPlant && <InspectorContent plant={inspectorPlant} compact={sheet === 'peek'} />
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------- build sheet ----------------

function Chip({ label, swatch, round, active, onClick }: {
  label: string; swatch?: string; round?: boolean; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 7, padding: '9px 11px', borderRadius: 7,
        border: '1px solid ' + (active ? 'var(--accent)' : 'var(--hairline2)'),
        background: active ? 'var(--chip-active)' : 'var(--map)',
        whiteSpace: 'nowrap', flex: 'none', fontSize: 12, fontWeight: 500, color: 'var(--ink)',
      }}
    >
      {swatch && (
        <span style={{
          display: 'inline-block', width: 15, height: 15, flexShrink: 0,
          borderRadius: round ? '50%' : 3, background: swatch, border: '1px solid var(--ink)',
        }} />
      )}
      {label}
    </button>
  )
}

function SliderRow({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 11, color: 'var(--text2)', width: 46, flex: 'none' }}>{label}</span>
      <input
        type="range" min={min} max={max} value={value} step={1}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, background: 'linear-gradient(to right, var(--accent) ' + ((value - min) / (max - min)) * 100 + '%, #d6ccb6 0)', height: 3, borderRadius: 2, alignSelf: 'center' }}
      />
      <span style={{ fontSize: 11, color: 'var(--text2)', width: 30, textAlign: 'right' }}>{Math.round(value)}</span>
    </div>
  )
}

function BuildSheet(props: {
  buildLayer: 'plants' | 'features'; setBuildLayer: (l: 'plants' | 'features') => void
  tool: string; setTool: (t: string) => void
  featureTool: PlotFeature['kind']; setFeatureTool: (k: PlotFeature['kind']) => void
  selectedPin: Pin | null; selectedFeature: PlotFeature | null
  updatePin: (id: string, p: Partial<Pin>) => void; removePin: (id: string) => void
  updateFeature: (id: string, p: Partial<PlotFeature>) => void; removeFeature: (id: string) => void
  plantName: (id: string) => string
}) {
  const store = useStore()
  const { plants, setSelectedPinId, setSelectedFeatureId } = store
  const {
    buildLayer, setBuildLayer, tool, setTool, featureTool, setFeatureTool,
    selectedPin, selectedFeature, updatePin, removePin, updateFeature, removeFeature, plantName,
  } = props

  const groups = plantGroups(plants)
  const featureKinds = Object.keys(FEATURE_LABELS).filter(k => k !== 'boundary') as PlotFeature['kind'][]

  const scroller: React.CSSProperties = { display: 'flex', gap: 7, overflowX: 'auto', padding: '2px 2px 6px', margin: '0 -2px' }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div className="tk" style={{ fontSize: 10, color: 'var(--text2)' }}>Build</div>
        <div style={{ display: 'flex', border: '1px solid #c3b89f', borderRadius: 7, overflow: 'hidden' }}>
          {(['plants', 'features'] as const).map(l => (
            <button key={l} onClick={() => setBuildLayer(l)} style={{
              fontSize: 11, fontWeight: 600, padding: '6px 12px',
              color: buildLayer === l ? '#fdfbf5' : '#6a6450',
              background: buildLayer === l ? 'var(--accent)' : 'transparent',
            }}>
              {l === 'plants' ? 'Plants' : 'Plot'}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'right' }}>
          tap map to place<br />drag to move
        </div>
      </div>

      {buildLayer === 'plants' && selectedPin ? (
        <div className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="hand" style={{ fontSize: 21 }}>{plantName(selectedPin.plantId)}</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>pinch or slide to resize · drag to move</span>
            <div style={{ flex: 1 }} />
            <button onClick={() => setSelectedPinId(null)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', padding: '6px 8px' }}>Done</button>
          </div>
          <SliderRow label="size" value={selectedPin.size} min={16} max={120} onChange={v => updatePin(selectedPin.id, { size: v })} />
          <button
            onClick={() => removePin(selectedPin.id)}
            style={{ marginTop: 12, width: '100%', textAlign: 'center', border: '1px solid #c9a59a', color: 'var(--red)', fontWeight: 600, fontSize: 13, padding: '10px 0', borderRadius: 8 }}
          >
            Remove selected pin
          </button>
        </div>
      ) : buildLayer === 'plants' ? (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 6 }}>
            Placing: <span className="hand" style={{ fontSize: 19, color: 'var(--ink)' }}>{plantName(tool)}</span>
          </div>
          {groups.map((g, gi) => g.plants.length > 0 && (
            <div key={g.key}>
              <div className="tk" style={{ fontSize: 9, color: 'var(--text3)', margin: gi === 0 ? '0 0 5px' : '6px 0 5px' }}>{g.title}</div>
              <div style={scroller}>
                {g.plants.map(p => (
                  <Chip key={p.id} label={p.name} swatch={p.col} round={p.cat === 'Flower'} active={tool === p.id} onClick={() => setTool(p.id)} />
                ))}
              </div>
            </div>
          ))}
        </>
      ) : selectedFeature ? (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="hand" style={{ fontSize: 21 }}>{FEATURE_LABELS[selectedFeature.kind]}</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>drag to move · slide to resize</span>
            <div style={{ flex: 1 }} />
            <button onClick={() => setSelectedFeatureId(null)} style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', padding: '6px 8px' }}>Done</button>
          </div>
          <SliderRow label="width" value={selectedFeature.w} min={2} max={90} onChange={v => updateFeature(selectedFeature.id, { w: v })} />
          <SliderRow label="height" value={selectedFeature.h} min={1} max={95} onChange={v => updateFeature(selectedFeature.id, { h: v })} />
          <button
            onClick={() => removeFeature(selectedFeature.id)}
            style={{ width: '100%', textAlign: 'center', border: '1px solid #c9a59a', color: 'var(--red)', fontWeight: 600, fontSize: 13, padding: '10px 0', borderRadius: 8 }}
          >
            Remove selected feature
          </button>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 6 }}>
            Placing: <span className="hand" style={{ fontSize: 19, color: 'var(--ink)' }}>{FEATURE_LABELS[featureTool]}</span>
          </div>
          <div style={{ ...scroller, flexWrap: 'wrap' }}>
            {featureKinds.map(k => (
              <Chip key={k} label={FEATURE_LABELS[k]} active={featureTool === k} onClick={() => setFeatureTool(k)} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
