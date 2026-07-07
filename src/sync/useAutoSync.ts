import { useEffect, useRef } from 'react'
import { useStore } from '../store/store'
import { driveAdapter } from './drive'
import { buildSnapshot } from './snapshot'

/** Debounced push to Drive whenever data changes, when configured + signed in.
 *  Offline changes queue naturally: the next successful push carries them. */
export function useAutoSync() {
  const { dataVersion, settings, updateSettings } = useStore()
  const timer = useRef<number>()
  const pendingWhileOffline = useRef(false)

  useEffect(() => { driveAdapter.setClientId(settings.driveClientId) }, [settings.driveClientId])

  useEffect(() => {
    if (dataVersion === 0) return
    if (!driveAdapter.isConfigured() || !driveAdapter.isSignedIn()) return
    if (!navigator.onLine) { pendingWhileOffline.current = true; return }
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(async () => {
      try {
        await driveAdapter.push(await buildSnapshot())
        updateSettings({ lastSyncAt: Date.now() })
      } catch { /* status surface handles it */ }
    }, 4000)
    return () => window.clearTimeout(timer.current)
  }, [dataVersion])

  // flush the offline queue when we come back online
  useEffect(() => {
    const onOnline = async () => {
      if (!pendingWhileOffline.current) return
      if (!driveAdapter.isConfigured() || !driveAdapter.isSignedIn()) return
      pendingWhileOffline.current = false
      try {
        await driveAdapter.push(await buildSnapshot())
        updateSettings({ lastSyncAt: Date.now() })
      } catch { /* retried on next change */ }
    }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [])
}
