import { weekToDate } from '../util/weeks'

const RAD = Math.PI / 180
const W = 540, H = 1348
const CX = W / 2, CY = H / 2
const R = 250 // display radius in world px

/**
 * Plan-view sun track for the scrubbed week: real solar geometry
 * (declination → sunrise/sunset azimuths and elevation through the day)
 * projected onto the map. The plot runs NW–SE, so map-up is NW (315°).
 * Distance from centre falls with elevation: the high summer sun passes
 * near the middle of the plot, the low winter sun hugs the southern edge.
 */
export function SunPath({ week, lat }: { week: number; lat: number }) {
  const dayOfYear = Math.min(365, (week - 1) * 7 + 4)
  const decl = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10))
  const phi = lat * RAD, delta = decl * RAD

  const cosH = Math.max(-1, Math.min(1, -Math.tan(phi) * Math.tan(delta)))
  const Hmax = Math.acos(cosH) // half day-length, radians of hour angle
  if (Hmax <= 0) return null

  const pts: [number, number][] = []
  let noon: [number, number] | null = null
  const steps = 24
  for (let i = 0; i <= steps; i++) {
    const h = -Hmax + (2 * Hmax * i) / steps
    const sinE = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(h)
    const e = Math.asin(Math.max(-1, Math.min(1, sinE)))
    if (e < 0) continue
    let cosA = (Math.sin(delta) - Math.sin(phi) * sinE) / (Math.cos(phi) * Math.cos(e))
    cosA = Math.max(-1, Math.min(1, cosA))
    let az = Math.acos(cosA) / RAD // 0–180, from N, morning side
    if (h > 0) az = 360 - az // afternoon: west of south
    // map-up is NW (azimuth 315°)
    const s = (az - 315) * RAD
    const d = R * (1 - (e / RAD) / 90)
    const x = CX + Math.sin(s) * d
    const y = CY - Math.cos(s) * d
    pts.push([x, y])
    if (i === steps / 2) noon = [x, y]
  }
  if (pts.length < 2) return null

  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const [x0, y0] = pts[0]
  const [x1, y1] = pts[pts.length - 1]
  const noonLabel = weekToDate(week)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}
      aria-hidden="true"
    >
      <path d={path} fill="none" stroke="#d9a23a" strokeWidth={2.5} strokeDasharray="2 9" strokeLinecap="round" opacity={0.5} />
      {/* sunrise / sunset ends */}
      <circle cx={x0} cy={y0} r={4.5} fill="none" stroke="#d9a23a" strokeWidth={1.6} opacity={0.5} />
      <circle cx={x1} cy={y1} r={4.5} fill="none" stroke="#d9a23a" strokeWidth={1.6} opacity={0.5} />
      {/* noon sun */}
      {noon && (
        <g opacity={0.65}>
          <circle cx={noon[0]} cy={noon[1]} r={8} fill="#f0c23c" stroke="#d9a23a" strokeWidth={1.6} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * 2 * Math.PI
            return (
              <line
                key={i}
                x1={noon![0] + Math.cos(a) * 11} y1={noon![1] + Math.sin(a) * 11}
                x2={noon![0] + Math.cos(a) * 15} y2={noon![1] + Math.sin(a) * 15}
                stroke="#d9a23a" strokeWidth={1.6} strokeLinecap="round"
              />
            )
          })}
          <text
            x={noon[0]} y={noon[1] + 30}
            textAnchor="middle" fontFamily="Caveat, cursive" fontSize={17} fill="#b3893a"
          >
            noon sun · {noonLabel.day} {noonLabel.month}
          </text>
        </g>
      )}
    </svg>
  )
}
