import { seasonOf } from '../util/weeks'

const INK = '#3a4232'

/** Orientation widget: compass (N upper-right — plot runs NW–SE),
 *  SW prevailing wind, seasonal sun-path arc. */
export function CompassCard({ week }: { week: number }) {
  const cx = 46, cy = 38, r = 27
  const pos = (bearing: number, rad: number): [number, number] =>
    [cx + rad * Math.sin((bearing * Math.PI) / 180), cy - rad * Math.cos((bearing * Math.PI) / 180)]
  const dirs: [string, number][] = [['N', 45], ['E', 135], ['S', 225], ['W', 315]]
  const [nx, ny] = pos(45, r - 2)
  const s = seasonOf(week)
  const peak = s === 'summer' ? 7 : s === 'winter' ? 24 : 15
  const arc = (p: number, col: string, wd: number, key: string) => (
    <path key={key} d={`M 12 34 Q 50 ${2 * p - 34} 88 34`} fill="none" stroke={col} strokeWidth={wd} strokeDasharray="3 3" />
  )
  return (
    <div>
      <svg width="100%" height="86" viewBox="0 0 92 80" style={{ display: 'block' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#c3b89f" strokeWidth={1} />
        <path d={`M ${cx} ${cy} L ${nx} ${ny}`} stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
        <circle cx={nx} cy={ny} r={3} fill="#a85742" />
        <g>
          <line x1={cx - r} y1={cy + r - 4} x2={cx + r - 6} y2={cy + r - 4} stroke="#6f8fae" strokeWidth={1.6} strokeDasharray="3 3" />
          <path d={`M ${cx + r - 12} ${cy + r - 8} L ${cx + r - 5} ${cy + r - 4} L ${cx + r - 12} ${cy + r}`} stroke="#6f8fae" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x={cx - r + 1} y={cy + r - 8} fill="#6f8fae" fontSize={8} fontFamily="Caveat, cursive">SW wind</text>
        </g>
        {dirs.map(([t, b], i) => {
          const [x, y] = pos(b, r + 9)
          return (
            <text key={t} x={x} y={y + 3} fill={i === 0 ? INK : '#8a8468'} fontSize={i === 0 ? 12 : 9} fontWeight={i === 0 ? 700 : 500} fontFamily="Archivo" textAnchor="middle">{t}</text>
          )
        })}
      </svg>
      <div style={{ height: 1, background: 'var(--hairline2)', margin: '4px 0 6px' }} />
      <svg width="100%" height="42" viewBox="0 0 100 44" style={{ display: 'block' }}>
        <line x1={8} y1={34} x2={92} y2={34} stroke="#d8cdb4" strokeWidth={1} />
        {arc(7, '#e6d6ac', 1, 'a1')}
        {arc(15, '#e6d6ac', 1, 'a2')}
        {arc(24, '#e6d6ac', 1, 'a3')}
        {arc(peak, '#d9a23a', 1.6, 'aN')}
        <circle cx={50} cy={peak} r={3.5} fill="#f0c23c" stroke="#d9a23a" strokeWidth={1} />
        <text x={6} y={44} fill="#b3a682" fontSize={7} fontFamily="Archivo">E</text>
        <text x={90} y={44} fill="#b3a682" fontSize={7} fontFamily="Archivo">W</text>
      </svg>
      <div className="hand" style={{ fontSize: 13, color: '#8a8468', textAlign: 'center', lineHeight: 1.15, marginTop: 2 }}>
        shed end = sunniest (S)
      </div>
    </div>
  )
}
