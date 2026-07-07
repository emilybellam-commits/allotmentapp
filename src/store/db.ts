import Dexie, { type Table } from 'dexie'
import type { JournalEntry, PhotoRecord, Pin, Plant, PlotFeature, Settings } from '../types'

class Plot47DB extends Dexie {
  pins!: Table<Pin, string>
  features!: Table<PlotFeature, string>
  journal!: Table<JournalEntry, string>
  plants!: Table<Plant, string> // custom plants + edits of seed plants
  photos!: Table<PhotoRecord, string>
  kv!: Table<{ key: string; value: unknown }, string>

  constructor() {
    super('plot47')
    this.version(1).stores({
      pins: 'id, plantId',
      features: 'id, kind',
      journal: 'id, date, plantId, pinId',
      plants: 'id',
      photos: 'id',
      kv: 'key',
    })
  }
}

export const db = new Plot47DB()

export async function loadSettings(): Promise<Settings> {
  const row = await db.kv.get('settings')
  return (row?.value as Settings) ?? {}
}

export async function saveSettings(s: Settings) {
  await db.kv.put({ key: 'settings', value: s })
}

let persistAsked = false
/** Ask the browser to make our storage durable; returns whether it granted. */
export async function requestPersistence(): Promise<boolean | undefined> {
  if (persistAsked) return undefined
  persistAsked = true
  try {
    if (navigator.storage?.persist) {
      const already = await navigator.storage.persisted()
      if (already) return true
      return await navigator.storage.persist()
    }
  } catch { /* not supported */ }
  return undefined
}
