import { useStore } from '../store/store'
import { SEASON_META, seasonOf } from '../util/weeks'
import { useWeather } from '../util/useWeather'

export function TopBar() {
  const { week, tab, mode, setMode, setSettingsOpen } = useStore()
  const weather = useWeather(week)
  const season = SEASON_META[seasonOf(week)]

  return (
    <div style={{
      paddingTop: 'var(--sat)', background: 'var(--paper)', borderBottom: '1px solid var(--hairline)',
      flex: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
        <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
          <div className="tk" style={{ fontSize: 10.5, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Alderman Moore&rsquo;s &middot; Plot 47
          </div>
          <div className="hand" style={{ fontSize: 14, color: '#8a8468', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            a working garden plan
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 'none' }}>
          <span style={{ fontSize: 14 }}>{weather.icon}</span>
          <span>
            <span className="tk" style={{ fontSize: 9, color: '#6a6450', display: 'block', lineHeight: 1.2 }}>{season.label}</span>
            <span style={{ color: 'var(--text3)', display: 'block', fontSize: 9.5, lineHeight: 1.15, whiteSpace: 'nowrap' }}>{weather.text}</span>
            {weather.wind && (
              <span style={{ color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3, fontSize: 9.5, lineHeight: 1.15, whiteSpace: 'nowrap' }}>
                {/* arrow points the way the wind is blowing (met. direction + 180°),
                    rotated into the plot map's frame — map-up is NW (315°) */}
                <svg width="9" height="9" viewBox="0 0 10 10" style={{ transform: `rotate(${(weather.windDeg ?? 0) + 180 - 315}deg)`, flex: 'none' }}>
                  <path d="M5 1 L5 9 M5 1 L2.4 4 M5 1 L7.6 4" stroke="#6f8fae" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {weather.wind}
              </span>
            )}
          </span>
        </div>
        {tab === 'map' && (
          <div style={{ display: 'flex', border: '1px solid #c3b89f', borderRadius: 7, overflow: 'hidden', flex: 'none' }}>
            {(['view', 'build'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  fontSize: 12, fontWeight: 600, padding: '8px 10px',
                  color: mode === m ? '#fdfbf5' : '#6a6450',
                  background: mode === m ? 'var(--accent)' : 'transparent',
                  transition: 'background .2s ease',
                }}
              >
                {m === 'view' ? 'View' : 'Build'}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings"
          style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #c3b89f', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6a6450" strokeWidth="1.4">
            <circle cx="8" cy="8" r="2.6" />
            <path d="M8 1.5 V4 M8 12 V14.5 M1.5 8 H4 M12 8 H14.5 M3.4 3.4 L5.2 5.2 M10.8 10.8 L12.6 12.6 M12.6 3.4 L10.8 5.2 M5.2 10.8 L3.4 12.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
