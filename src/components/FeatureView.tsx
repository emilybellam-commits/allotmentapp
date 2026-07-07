import React from 'react'
import type { PlotFeature } from '../types'

const INK = '#3a4232'
const SOIL = 'radial-gradient(130% 130% at 35% 22%, rgba(175,126,4,.34), rgba(120,86,20,.26))'

// organic border-radius variants so blobs don't look stamped
const BLOBBY = [
  '52% 48% 50% 50%/55% 50% 50% 45%',
  '48% 52% 52% 48%/50% 50% 50% 50%',
  '50% 50% 48% 52%/52% 48% 52% 48%',
  '46% 54% 50% 50%/55% 50% 50% 45%',
]

function hashOf(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function styleFor(f: PlotFeature): React.CSSProperties {
  const blob = BLOBBY[hashOf(f.id) % BLOBBY.length]
  switch (f.kind) {
    case 'boundary':
      return { border: `2px solid ${INK}`, borderRadius: 10 }
    case 'path':
      return { background: 'linear-gradient(180deg,#efe3a6,#e8dba0)', opacity: 0.6, borderRadius: 4 }
    case 'compost':
      return { background: 'radial-gradient(120% 120% at 35% 25%, rgba(155,106,62,.5), rgba(120,80,46,.32))', border: `1.5px solid ${INK}`, borderRadius: 4 }
    case 'weedbutt':
      return { background: 'radial-gradient(circle at 38% 30%, rgba(170,60,60,.5), rgba(130,40,40,.42))', border: `1.5px solid ${INK}`, borderRadius: '50%' }
    case 'bush':
      return { background: 'radial-gradient(circle at 40% 30%, rgba(150,120,170,.5), rgba(110,80,140,.34))', border: `1.5px solid ${INK}`, borderRadius: blob }
    case 'tree':
      return { background: 'radial-gradient(circle at 38% 32%, rgba(120,160,90,.55), rgba(80,120,60,.4))', border: `1.5px solid ${INK}`, borderRadius: blob }
    case 'cage':
      return { border: '1.5px dashed #5a6048', borderRadius: 8, background: 'rgba(150,170,120,.08)' }
    case 'bed':
      return { background: SOIL, border: `1.5px solid ${INK}`, borderRadius: 5 }
    case 'trellis':
      return { background: 'repeating-linear-gradient(0deg, rgba(90,96,72,.5) 0 2px, transparent 2px 7px)', borderLeft: '1px solid #5a6048' }
    case 'log':
      return { background: 'rgba(150,106,54,.7)', border: `1.2px solid ${INK}`, borderRadius: '50%' }
    case 'pond':
      return { background: 'radial-gradient(circle at 38% 30%, rgba(150,200,220,.7), rgba(95,159,192,.6))', border: `1.5px solid ${INK}`, borderRadius: '52% 48% 50% 50%/55% 50% 50% 45%' }
    case 'tub':
      return { background: 'rgba(255,255,255,.85)', border: `1.5px solid ${INK}`, borderRadius: 6 }
    case 'shed':
      return { background: 'radial-gradient(130% 130% at 35% 25%, rgba(173,240,199,.55), rgba(120,190,150,.4))', border: `2px solid ${INK}`, borderRadius: 5 }
    case 'butt':
      return { background: 'radial-gradient(circle at 38% 30%, rgba(70,70,70,.6), rgba(40,40,40,.5))', border: `1.5px solid ${INK}`, borderRadius: '50%' }
    default:
      return { background: SOIL, border: `1.5px solid ${INK}`, borderRadius: 5 }
  }
}

export const FEATURE_LABELS: Record<PlotFeature['kind'], string> = {
  bed: 'Raised bed', path: 'Path', pond: 'Pond', shed: 'Shed', compost: 'Compost',
  tree: 'Fruit tree', bush: 'Berry bush', cage: 'Fruit cage', border: 'Flower border',
  trellis: 'Trellis', log: 'Log', butt: 'Water butt', weedbutt: 'Weed butt',
  tub: 'Tub', arch: 'Bean arch', boundary: 'Boundary',
}

/** Bean arch: X-lattice with a hint of vines, straight from the reference. */
function ArchSvg() {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', filter: 'url(#sk2)' }} viewBox="0 0 41 89" preserveAspectRatio="none">
      <path d="M5 2 L5 87 M36 2 L36 87" stroke="#8a6d44" strokeWidth={1.7} fill="none" strokeLinecap="round" />
      <path d="M5 6 L36 26 M36 6 L5 26 M5 26 L36 46 M36 26 L5 46 M5 46 L36 66 M36 46 L5 66 M5 66 L36 86 M36 66 L5 86" stroke="#9c7d4e" strokeWidth={1.3} fill="none" />
      <path d="M9 87 C 15 70 5 58 13 45 C 19 33 11 20 16 5" stroke="#6f9a4d" strokeWidth={1.8} fill="none" opacity={0.85} strokeLinecap="round" />
      <path d="M32 87 C 26 71 36 60 28 46 C 22 34 30 22 25 5" stroke="#5f8a3a" strokeWidth={1.8} fill="none" opacity={0.85} strokeLinecap="round" />
      <ellipse cx={13} cy={45} rx={4.2} ry={2.4} fill="#7faf52" transform="rotate(-28 13 45)" />
      <ellipse cx={11} cy={64} rx={4} ry={2.3} fill="#6f9a4d" transform="rotate(22 11 64)" />
      <ellipse cx={16} cy={22} rx={3.8} ry={2.2} fill="#7faf52" transform="rotate(-18 16 22)" />
      <ellipse cx={28} cy={46} rx={4.2} ry={2.4} fill="#5f8a3a" transform="rotate(26 28 46)" />
      <ellipse cx={31} cy={66} rx={3.8} ry={2.2} fill="#6f9a4d" transform="rotate(-22 31 66)" />
      <ellipse cx={25} cy={24} rx={4} ry={2.3} fill="#7faf52" transform="rotate(20 25 24)" />
    </svg>
  )
}

export interface FeatureViewProps {
  feature: PlotFeature
  selected?: boolean
  onPointerDown?: (e: React.PointerEvent) => void
}

export function FeatureView({ feature: f, selected, onPointerDown }: FeatureViewProps) {
  const base: React.CSSProperties = {
    position: 'absolute',
    left: f.x + '%', top: f.y + '%', width: f.w + '%', height: f.h + '%',
    filter: 'url(#sk)',
    transform: f.rotation ? `rotate(${f.rotation}deg)` : undefined,
    pointerEvents: onPointerDown ? 'auto' : 'none',
    touchAction: onPointerDown ? 'none' : undefined,
    cursor: onPointerDown ? 'grab' : undefined,
  }
  const sel = selected ? { outline: '2px solid #6f7f4e', outlineOffset: 2 } : {}

  if (f.kind === 'border' && f.shape === 'lshape') {
    const nw = (f.notchW ?? 0.6) * 100
    const nh = (f.notchH ?? 0.5) * 100
    return (
      <div style={{ ...base, ...sel, filter: undefined }} onPointerDown={onPointerDown}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', filter: 'url(#sk)' }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon
            points={`${nw},0 100,0 100,100 0,100 0,${nh} ${nw},${nh}`}
            fill="url(#fbWash)" stroke="#5a6048" strokeWidth={1.4}
            vectorEffect="non-scaling-stroke" strokeLinejoin="round"
          />
        </svg>
      </div>
    )
  }

  if (f.kind === 'arch') {
    return (
      <div style={{ ...base, ...sel, filter: undefined }} onPointerDown={onPointerDown}>
        <ArchSvg />
      </div>
    )
  }

  return <div style={{ ...base, ...styleFor(f), ...sel }} onPointerDown={onPointerDown} />
}
