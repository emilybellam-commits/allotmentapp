import { StoreProvider, useStore } from './store/store'
import { WobbleDefs } from './components/WobbleDefs'
import { TopBar } from './components/TopBar'
import { TabBar } from './components/TabBar'
import { TimeScrubber } from './components/TimeScrubber'
import { MapScreen } from './components/MapScreen'
import { DatabaseScreen } from './components/DatabaseScreen'
import { CalendarScreen } from './components/CalendarScreen'
import { JournalScreen } from './components/JournalScreen'
import { SettingsSheet } from './components/SettingsSheet'
import { useAutoSync } from './sync/useAutoSync'

function Shell() {
  const { ready, tab, settingsOpen } = useStore()
  useAutoSync()

  if (!ready) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="hand" style={{ fontSize: 26, color: 'var(--text2)' }}>opening the plot…</div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <WobbleDefs />
      <TopBar />
      {tab === 'map' && <MapScreen />}
      {tab === 'plants' && <DatabaseScreen />}
      {tab === 'calendar' && <CalendarScreen />}
      {tab === 'journal' && <JournalScreen />}
      {(tab === 'map' || tab === 'calendar') && <TimeScrubber />}
      <TabBar />
      {settingsOpen && <SettingsSheet />}
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
