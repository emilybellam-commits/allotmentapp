import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/store'
import { geocode, type GeoResult } from '../util/weather'
import { exportBackupFile, importBackupFile, buildSnapshot, mergeSnapshot } from '../sync/snapshot'
import { driveAdapter } from '../sync/drive'
import type { SyncStatus } from '../sync/adapter'
import { db, loadSettings } from '../store/db'

const kicker: React.CSSProperties = { fontSize: 10, color: 'var(--text3)', margin: '18px 0 8px' }

async function reloadFromDb(replaceAll: ReturnType<typeof useStore>['replaceAll']) {
  const [pins, features, journal, tasks, plants, settings] = await Promise.all([
    db.pins.toArray(), db.features.toArray(), db.journal.toArray(), db.tasks.toArray(), db.plants.toArray(), loadSettings(),
  ])
  replaceAll({ pins, features, journal, tasks, plants, settings })
}

export function SettingsSheet() {
  const store = useStore()
  const { settings, updateSettings, setSettingsOpen, persistGranted, replaceAll } = store
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeoResult[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [clientId, setClientId] = useState(settings.driveClientId ?? '')
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ state: 'disabled' })
  const [busy, setBusy] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => driveAdapter.onStatus(setSyncStatus), [])
  useEffect(() => { driveAdapter.setClientId(settings.driveClientId) }, [settings.driveClientId])

  const search = async () => {
    if (!query.trim()) return
    setSearching(true)
    try { setResults(await geocode(query.trim())) }
    catch { setResults([]) }
    setSearching(false)
  }

  const pickLocation = (r: GeoResult) => {
    updateSettings({ locationName: `${r.name}${r.detail ? ', ' + r.detail : ''}`, lat: r.lat, lon: r.lon })
    setResults(null); setQuery('')
  }

  const signInAndSync = async () => {
    setBusy('drive')
    try {
      await driveAdapter.signIn()
      const remote = await driveAdapter.pull()
      if (remote) {
        await mergeSnapshot(remote)
        await reloadFromDb(replaceAll)
      }
      await driveAdapter.push(await buildSnapshot())
      updateSettings({ lastSyncAt: Date.now() })
    } catch (e) {
      alert('Drive sync failed: ' + (e instanceof Error ? e.message : e))
    }
    setBusy(null)
  }

  const doImport = async (f: File) => {
    setBusy('import')
    try {
      await importBackupFile(f)
      await reloadFromDb(replaceAll)
      alert('Backup imported — newest version of each record kept.')
    } catch (e) {
      alert('Import failed: ' + (e instanceof Error ? e.message : e))
    }
    setBusy(null)
  }

  const syncLabel = (() => {
    switch (syncStatus.state) {
      case 'synced': return 'saved to Drive · just now'
      case 'syncing': return 'syncing…'
      case 'error': return 'sync error — will retry'
      case 'signed-out': return settings.lastSyncAt ? `last synced ${new Date(settings.lastSyncAt).toLocaleString()}` : 'not signed in'
      default: return settings.lastSyncAt ? `last synced ${new Date(settings.lastSyncAt).toLocaleString()}` : ''
    }
  })()

  const btn: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: 'var(--accent)', border: '1px solid var(--accent)',
    borderRadius: 7, padding: '10px 14px', background: 'var(--map)',
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 90, background: 'rgba(60,55,35,.25)' }} onClick={() => setSettingsOpen(false)}>
      <div
        className="fade-in"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '88%',
          background: 'var(--paper)', borderRadius: '18px 18px 0 0', overflowY: 'auto',
          padding: '10px 18px calc(20px + var(--sab))', boxShadow: '0 -6px 24px rgba(60,55,35,.2)',
        }}
      >
        <div style={{ width: 46, height: 5, borderRadius: 3, background: '#dcc99c', margin: '0 auto 8px' }} />
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <div className="hand" style={{ fontSize: 28, color: 'var(--ink)' }}>Settings</div>
          <div style={{ flex: 1 }} />
          <button onClick={() => setSettingsOpen(false)} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', padding: 6 }}>Done</button>
        </div>

        <div className="tk" style={kicker}>Weather location</div>
        <div style={{ fontSize: 12.5, color: 'var(--body)', marginBottom: 8 }}>
          {settings.locationName
            ? <>Forecast for <b>{settings.locationName}</b> (Open-Meteo, cached for offline).</>
            : 'No location set — the readout shows seasonal averages. Set your plot’s town once for a real forecast.'}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text" placeholder="Town or postcode area…" value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
          />
          <button onClick={search} disabled={searching} style={{ ...btn, flex: 'none' }}>
            {searching ? '…' : 'Search'}
          </button>
        </div>
        {results && (
          <div style={{ marginTop: 6 }}>
            {results.length === 0 && <div style={{ fontSize: 12, color: 'var(--text2)', padding: 6 }}>Nothing found — try a bigger town nearby.</div>}
            {results.map((r, i) => (
              <button key={i} onClick={() => pickLocation(r)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 8px', borderBottom: '1px solid var(--hairline2)', fontSize: 13 }}>
                <b>{r.name}</b> <span style={{ color: 'var(--text2)' }}>{r.detail}</span>
              </button>
            ))}
          </div>
        )}

        <div className="tk" style={kicker}>Backup — file</div>
        <div style={{ fontSize: 12.5, color: 'var(--body)', marginBottom: 8 }}>
          Everything (pins, plot, journal with photos, settings) in one JSON file. Import merges — the newest version of each record wins.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => exportBackupFile()} style={btn}>Export backup</button>
          <button onClick={() => fileRef.current?.click()} disabled={busy === 'import'} style={btn}>
            {busy === 'import' ? 'Importing…' : 'Import backup'}
          </button>
          <input
            ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) doImport(f); e.target.value = '' }}
          />
        </div>

        <div className="tk" style={kicker}>Backup — Google Drive</div>
        <div style={{ fontSize: 12.5, color: 'var(--body)', marginBottom: 8 }}>
          Auto-saves your data to a hidden app folder in your Google Drive whenever it changes.
          Needs a (free) Google OAuth client ID — create one at console.cloud.google.com
          (OAuth client, type “Web application”, add this site as an authorised JavaScript origin), paste it here once.
        </div>
        <input
          type="text" placeholder="Google OAuth client ID (…apps.googleusercontent.com)"
          value={clientId}
          onChange={e => setClientId(e.target.value)}
          onBlur={() => updateSettings({ driveClientId: clientId.trim() || undefined })}
          style={{ fontSize: 12 }}
        />
        {settings.driveClientId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <button onClick={signInAndSync} disabled={busy === 'drive'} style={btn}>
              {busy === 'drive' ? 'Syncing…' : driveAdapter.isSignedIn() ? 'Sync now' : 'Sign in & sync'}
            </button>
            <span className="hand" style={{ fontSize: 16, color: 'var(--text2)' }}>{syncLabel}</span>
          </div>
        )}

        <div className="tk" style={kicker}>Storage</div>
        <div style={{ fontSize: 12.5, color: 'var(--body)' }}>
          {persistGranted === true && 'Durable storage granted — the browser won’t evict your data under storage pressure. Cache clearing can still wipe it, so keep a backup.'}
          {persistGranted === false && 'The browser declined durable storage — your data is saved locally but could be evicted. Export a backup or connect Drive to be safe.'}
          {persistGranted === undefined && 'Data is saved on this device (IndexedDB). Durable storage will be requested on your first change.'}
        </div>

        <div className="tk" style={kicker}>Add to home screen</div>
        <div style={{ fontSize: 12.5, color: 'var(--body)' }}>
          <b>iPhone:</b> open in Safari → Share → “Add to Home Screen”.<br />
          <b>Android:</b> Chrome menu → “Add to Home screen” (or “Install app”).<br />
          Once added it opens full-screen and works fully offline.
        </div>
      </div>
    </div>
  )
}
