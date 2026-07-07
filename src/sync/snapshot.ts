import type { Snapshot } from '../types'
import { db, loadSettings } from '../store/db'

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve((r.result as string).split(',')[1])
    r.onerror = reject
    r.readAsDataURL(blob)
  })
}

export function base64ToBlob(base64: string, type: string): Blob {
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type })
}

/** Full data snapshot straight from IndexedDB (includes tombstones). */
export async function buildSnapshot(): Promise<Snapshot> {
  const [pins, features, journal, tasks, plants, settings, photos] = await Promise.all([
    db.pins.toArray(), db.features.toArray(), db.journal.toArray(),
    db.tasks.toArray(), db.plants.toArray(), loadSettings(), db.photos.toArray(),
  ])
  const encodedPhotos = await Promise.all(photos.map(async p => ({
    id: p.id, type: p.blob.type || 'image/jpeg',
    base64: await blobToBase64(p.blob), updatedAt: p.updatedAt,
  })))
  return { version: 1, exportedAt: Date.now(), pins, features, journal, tasks, plants, settings, photos: encodedPhotos }
}

function newerWins<T extends { id: string; updatedAt?: number }>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>()
  for (const r of local) map.set(r.id, r)
  for (const r of remote) {
    const cur = map.get(r.id)
    if (!cur || (r.updatedAt ?? 0) > (cur.updatedAt ?? 0)) map.set(r.id, r)
  }
  return [...map.values()]
}

/** Merge a snapshot into IndexedDB, last-write-wins per record. */
export async function mergeSnapshot(snap: Snapshot): Promise<void> {
  const [pins, features, journal, tasks, plants, settings] = await Promise.all([
    db.pins.toArray(), db.features.toArray(), db.journal.toArray(),
    db.tasks.toArray(), db.plants.toArray(), loadSettings(),
  ])
  const mPins = newerWins(pins, snap.pins ?? [])
  const mFeatures = newerWins(features, snap.features ?? [])
  const mJournal = newerWins(journal, snap.journal ?? [])
  const mTasks = newerWins(tasks, snap.tasks ?? [])
  const mPlants = newerWins(plants, snap.plants ?? [])
  const mSettings = (snap.settings?.updatedAt ?? 0) > (settings.updatedAt ?? 0)
    ? { ...settings, ...snap.settings } : settings

  await db.transaction('rw', [db.pins, db.features, db.journal, db.tasks, db.plants, db.kv], async () => {
    await db.pins.bulkPut(mPins)
    await db.features.bulkPut(mFeatures)
    await db.journal.bulkPut(mJournal)
    await db.tasks.bulkPut(mTasks)
    await db.plants.bulkPut(mPlants)
    await db.kv.put({ key: 'settings', value: mSettings })
    await db.kv.put({ key: 'seeded', value: true })
  })
  for (const p of snap.photos ?? []) {
    const existing = await db.photos.get(p.id)
    if (!existing || p.updatedAt > existing.updatedAt) {
      await db.photos.put({ id: p.id, blob: base64ToBlob(p.base64, p.type), updatedAt: p.updatedAt })
    }
  }
}

export async function exportBackupFile(): Promise<void> {
  const snap = await buildSnapshot()
  const blob = new Blob([JSON.stringify(snap)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const d = new Date()
  a.href = url
  a.download = `plot47-backup-${d.toISOString().slice(0, 10)}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export async function importBackupFile(file: File): Promise<void> {
  const text = await file.text()
  const snap = JSON.parse(text) as Snapshot
  if (!snap || snap.version !== 1 || !Array.isArray(snap.pins)) {
    throw new Error('Not a Plot 47 backup file')
  }
  await mergeSnapshot(snap)
}
