import { weekToDate } from '../util/weeks'
import { sunAt, mapDir, clockLabel } from '../util/sun'

const W = 540, H = 1348
const CX = W / 2, CY = H / 2
const R = 250 // display radius in world px

/**
 * Plan-view sun track for the scrubbed week: real solar geometry
 * (declination → sunrise/sunset azimuths and elevation through the day)
 * projected onto the map. The plot runs NW–SE, so map-up is NW (315°).
 * Distance from centre falls with elevation: the high summer sun passes
 * near the middle of the plot, the low winter sun hugs the southern edge.
 * The sun disc sits at the day scrubber's time of day.
 */
export function SunPath({ week, lat, lon, dayT }: { week: number; lat: number; lon?: number; dayT: number }) {
  const project = (t: number): [number, number] | null => {
    const { azimuth, elevation } = sunAt(week, lat, t)
    if (elevation < 0) return null
    const [ux, uy] = mapDir(azimuth)
    const d = R * (1 - elevation / 90)
    return [CX + ux * d, CY + uy * d]
  }

  const steps = 24
  const pts: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const p = project(i / steps)
    if (p) pts.push(p)
  }
  if (pts.length < 2) return null

  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const [x0, y0] = pts[0]
  const [x1, y1] = pts[pts.length - 1]

  const now = project(dayT)
  const { hourAngle } = sunAt(week, lat, dayT)
  const date = weekToDate(week)
  const label = `≈${clockLabel(week, hourAngle, lon)} · ${date.day} ${date.month}`

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
      {/* the sun, at the scrubbed time of day */}
      {now && (
        <g opacity={0.65}>
          <circle cx={now[0]} cy={now[1]} r={8} fill="#f0c23c" stroke="#d9a23a" strokeWidth={1.6} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * 2 * Math.PI
            return (
              <line
                key={i}
                x1={now[0] + Math.cos(a) * 11} y1={now[1] + Math.sin(a) * 11}
                x2={now[0] + Math.cos(a) * 15} y2={now[1] + Math.sin(a) * 15}
                stroke="#d9a23a" strokeWidth={1.6} strokeLinecap="round"
              />
            )
          })}
          <text
            x={now[0]} y={now[1] + 30}
            textAnchor="middle" fontFamily="Caveat, cursive" fontSize={17} fill="#b3893a"
          >
            {label}
          </text>
        </g>
      )}
    </svg>
  )
}
