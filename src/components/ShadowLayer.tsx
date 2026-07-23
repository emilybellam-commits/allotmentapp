import { useMemo } from 'react'
import type { PlotFeature } from '../types'
import { sunAt, mapDir } from '../util/sun'

const RAD = Math.PI / 180
const W = 540, H = 1348

// The plot is 6 m across × 20 m long, digitised as the boundary box
// (75.1% × 91.5% of the world). Per-axis scales absorb the small
// off-scale stretch in the drawing so shadows land on the right features.
const PX_PER_M_X = (W * 0.751) / 6
const PX_PER_M_Y = (H * 0.915) / 20

/** Typical heights in metres; anything absent sits at ground level and casts nothing. */
const HEIGHTS: Partial<Record<PlotFeature['kind'], number>> = {
  shed: 2.4, tree: 4, bush: 1.5, cage: 1.8, trellis: 1.8, arch: 1.8,
  compost: 1, butt: 0.9, weedbutt: 0.9, tub: 0.45, log: 0.25, bed: 0.25,
}

const MAX_SHADOW_M = 40

function footprint(f: PlotFeature): [number, number][] {
  const x = (f.x / 100) * W, y = (f.y / 100) * H
  const w = (f.w / 100) * W, h = (f.h / 100) * H
  const cx = x + w / 2, cy = y + h / 2
  let pts: [number, number][]
  if (f.shape === 'ellipse') {
    const n = 12
    pts = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * 2 * Math.PI
      return [cx + (Math.cos(a) * w) / 2, cy + (Math.sin(a) * h) / 2] as [number, number]
    })
  } else if (f.shape === 'lshape') {
    const nw = (f.notchW ?? 0.6) * w, nh = (f.notchH ?? 0.5) * h
    pts = [[x + nw, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y + nh], [x + nw, y + nh]]
  } else {
    pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]
  }
  if (f.rotation) {
    const c = Math.cos(f.rotation * RAD), s = Math.sin(f.rotation * RAD)
    pts = pts.map(([px, py]) => [cx + (px - cx) * c - (py - cy) * s, cy + (px - cx) * s + (py - cy) * c])
  }
  return pts
}

/** One closed subpath, wound consistently so overlapping subpaths union under nonzero fill. */
function ring(pts: [number, number][]): string {
  let area = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length]
    area += x1 * y2 - x2 * y1
  }
  const p = area < 0 ? [...pts].reverse() : pts
  return 'M ' + p.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ') + ' Z'
}

/** Footprint swept along the shadow offset: base + translated copy + a quad per edge. */
function sweep(base: [number, number][], dx: number, dy: number): string {
  const moved = base.map(([x, y]) => [x + dx, y + dy] as [number, number])
  const parts = [ring(base), ring(moved)]
  for (let i = 0; i < base.length; i++) {
    const j = (i + 1) % base.length
    parts.push(ring([base[i], base[j], moved[j], moved[i]]))
  }
  return parts.join(' ')
}

/**
 * Ground shadows for the scrubbed week + time of day: each feature's footprint
 * is extruded away from the sun by height ÷ tan(elevation), in real metres.
 */
export function ShadowLayer({ features, week, lat, dayT }: {
  features: PlotFeature[]; week: number; lat: number; dayT: number
}) {
  const sun = sunAt(week, lat, dayT)

  const d = useMemo(() => {
    if (sun.elevation <= 0.5) return ''
    const tanE = Math.tan(Math.max(sun.elevation, 1.5) * RAD)
    const [ux, uy] = mapDir(sun.azimuth + 180)
    return features
      .filter(f => (HEIGHTS[f.kind] ?? 0) > 0)
      .map(f => {
        const len = Math.min(HEIGHTS[f.kind]! / tanE, MAX_SHADOW_M)
        return sweep(footprint(f), ux * len * PX_PER_M_X, uy * len * PX_PER_M_Y)
      })
      .join(' ')
  }, [features, sun.elevation, sun.azimuth])

  if (!d) return null
  // ease shadows in at dawn and out at dusk instead of snapping
  const opacity = 0.17 * Math.min(1, sun.elevation / 6)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 8 }}
      aria-hidden="true"
    >
      <path d={d} fill="#3a4232" fillRule="nonzero" opacity={opacity} style={{ mixBlendMode: 'multiply', filter: 'blur(2px)' }} />
    </svg>
  )
}
