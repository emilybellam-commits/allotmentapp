import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { JournalEntry, Pin, Plant, PlotFeature, Settings, TaskItem } from '../types'
import { db, loadSettings, saveSettings, requestPersistence } from './db'
import { SEED_PLANTS } from '../data/catalogue'
import { defaultFeatures, defaultPins } from '../data/defaultPlot'
import { currentWeek } from '../util/weeks'

export type Mode = 'view' | 'build'
export type Tab = 'map' | 'plants' | 'calendar' | 'tasks' | 'journal'
export type BuildLayer = 'plants' | 'features'

let idCounter = 0
export const newId = () => `${Date.now().toString(36)}-${(idCounter++).toString(36)}-${Math.random().toString(36).slice(2, 6)}`

interface Store {
  ready: boolean
  // UI state
  tab: Tab; setTab: (t: Tab) => void
  week: number; setWeek: (w: number) => void
  mode: Mode; setMode: (m: Mode) => void
  buildLayer: BuildLayer; setBuildLayer: (l: BuildLayer) => void
  tool: string; setTool: (t: string) => void
  featureTool: PlotFeature['kind']; setFeatureTool: (k: PlotFeature['kind']) => void
  selectedPlantId: string; setSelectedPlantId: (id: string) => void
  selectedPinId: string | null; setSelectedPinId: (id: string | null) => void
  selectedFeatureId: string | null; setSelectedFeatureId: (id: string | null) => void
  sheetOpen: boolean; setSheetOpen: (b: boolean) => void
  settingsOpen: boolean; setSettingsOpen: (b: boolean) => void
  dbDetailId: string | null; setDbDetailId: (id: string | null) => void
  // data
  pins: Pin[]
  features: PlotFeature[]
  journal: JournalEntry[]
  tasks: TaskItem[]
  plants: Plant[]
  plantById: (id: string) => Plant | undefined
  settings: Settings
  dataVersion: number
  persistGranted: boolean | undefined
  // mutators
  addPin: (plantId: string, x: number, y: number) => string
  updatePin: (id: string, patch: Partial<Pin>) => void
  removePin: (id: string) => void
  addFeature: (kind: PlotFeature['kind'], x: number, y: number) => string
  updateFeature: (id: string, patch: Partial<PlotFeature>) => void
  removeFeature: (id: string) => void
  addJournal: (entry: Omit<JournalEntry, 'id' | 'updatedAt'>, photo?: Blob) => Promise<string>
  updateJournal: (id: string, patch: Partial<JournalEntry>) => void
  removeJournal: (id: string) => void
  addTask: (text: string) => void
  updateTask: (id: string, patch: Partial<TaskItem>) => void
  removeTask: (id: string) => void
  /** flip done; ticking logs the task into that day's journal entry, unticking removes it */
  toggleTask: (id: string) => void
  /** rewrite sort order to match the given id sequence */
  reorderTasks: (ids: string[]) => void
  upsertPlant: (p: Plant) => void
  updateSettings: (patch: Partial<Settings>) => void
  /** replace whole dataset (import / drive pull) */
  replaceAll: (data: { pins: Pin[]; features: PlotFeature[]; journal: JournalEntry[]; tasks?: TaskItem[]; plants: Plant[]; settings: Settings }) => void
}

const StoreCtx = createContext<Store | null>(null)

export function useStore(): Store {
  const s = useContext(StoreCtx)
  if (!s) throw new Error('store not mounted')
  return s
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState<Tab>('map')
  const [week, setWeekState] = useState(currentWeek())
  const [mode, setMode] = useState<Mode>('view')
  const [buildLayer, setBuildLayer] = useState<BuildLayer>('plants')
  const [tool, setTool] = useState('dahlia')
  const [featureTool, setFeatureTool] = useState<PlotFeature['kind']>('bed')
  const [selectedPlantId, setSelectedPlantId] = useState('broadbean')
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null)
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [dbDetailId, setDbDetailId] = useState<string | null>(null)

  const [pins, setPins] = useState<Pin[]>([])
  const [features, setFeatures] = useState<PlotFeature[]>([])
  const [journal, setJournal] = useState<JournalEntry[]>([])
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [customPlants, setCustomPlants] = useState<Plant[]>([])
  const [settings, setSettings] = useState<Settings>({})
  const [dataVersion, setDataVersion] = useState(0)
  const [persistGranted, setPersistGranted] = useState<boolean | undefined>(undefined)

  const bump = useCallback(() => setDataVersion(v => v + 1), [])

  // ---- boot: load or seed ----
  useEffect(() => {
    (async () => {
      const seeded = await db.kv.get('seeded')
      if (!seeded) {
        await db.features.bulkPut(defaultFeatures())
        await db.pins.bulkPut(defaultPins())
        await db.kv.put({ key: 'seeded', value: true })
      }
      const [p, f, j, t, pl, s] = await Promise.all([
        db.pins.toArray(), db.features.toArray(), db.journal.toArray(),
        db.tasks.toArray(), db.plants.toArray(), loadSettings(),
      ])
      setPins(p.filter(x => !x.deleted))
      setFeatures(f.filter(x => !x.deleted))
      setJournal(j.filter(x => !x.deleted).sort((a, b) => b.date.localeCompare(a.date)))
      setTasks(t.filter(x => !x.deleted))
      setCustomPlants(pl.filter(x => !x.deleted))
      setSettings(s)
      if (s.persistGranted !== undefined) setPersistGranted(s.persistGranted)
      if (s.lastWeek) setWeekState(s.lastWeek)
      else setWeekState(currentWeek())
      setReady(true)
    })()
  }, [])

  // first meaningful save → ask for durable storage, surface the result
  const ensurePersist = useCallback(() => {
    requestPersistence().then(granted => {
      if (granted === undefined) return
      setPersistGranted(granted)
      setSettings(prev => {
        const next = { ...prev, persistGranted: granted, updatedAt: Date.now() }
        saveSettings(next)
        return next
      })
    })
  }, [])

  // ---- week persist (debounced) ----
  const weekTimer = useRef<number>()
  const setWeek = useCallback((w: number) => {
    setWeekState(w)
    window.clearTimeout(weekTimer.current)
    weekTimer.current = window.setTimeout(() => {
      setSettings(prev => {
        const next = { ...prev, lastWeek: w }
        saveSettings(next)
        return next
      })
    }, 600)
  }, [])

  // merged catalogue: seed plants overridden/extended by user rows
  const plants = useMemo(() => {
    const map = new Map<string, Plant>()
    for (const p of SEED_PLANTS) map.set(p.id, p)
    for (const p of customPlants) map.set(p.id, p)
    return [...map.values()]
  }, [customPlants])

  // ---- mutators ----
  const addPin = useCallback((plantId: string, x: number, y: number) => {
    const plant = plants.find(p => p.id === plantId)
    const id = newId()
    const pin: Pin = { id, plantId, x, y, size: plant?.size ?? 40, plantedYear: new Date().getFullYear(), updatedAt: Date.now() }
    setPins(ps => [...ps, pin])
    db.pins.put(pin); ensurePersist(); bump()
    return id
  }, [bump, ensurePersist, plants])

  const updatePin = useCallback((id: string, patch: Partial<Pin>) => {
    setPins(ps => ps.map(p => {
      if (p.id !== id) return p
      const next = { ...p, ...patch, updatedAt: Date.now() }
      db.pins.put(next)
      return next
    }))
    bump()
  }, [bump])

  const removePin = useCallback((id: string) => {
    setPins(ps => ps.filter(p => p.id !== id))
    db.pins.update(id, { deleted: true, updatedAt: Date.now() })
    setSelectedPinId(cur => (cur === id ? null : cur))
    bump()
  }, [bump])

  const addFeature = useCallback((kind: PlotFeature['kind'], x: number, y: number) => {
    const defaults: Record<string, [number, number]> = {
      bed: [30, 6.5], path: [30, 3], pond: [17, 5], shed: [30, 7], compost: [18, 4.6],
      tree: [9, 2.8], bush: [9, 2.1], cage: [40, 8], border: [40, 5], trellis: [1.5, 12],
      log: [5, 2], butt: [6.6, 2.4], weedbutt: [6.6, 2.4], tub: [24, 4], arch: [7.6, 6.6], boundary: [75, 91],
    }
    const [w, h] = defaults[kind] ?? [20, 5]
    const id = newId()
    const f: PlotFeature = {
      id, kind, shape: ['pond', 'tree', 'bush', 'log', 'butt', 'weedbutt'].includes(kind) ? 'ellipse' : 'rect',
      x: Math.max(0, Math.min(100 - w, x - w / 2)), y: Math.max(0, Math.min(100 - h, y - h / 2)), w, h,
      ...(kind === 'border' ? { shape: 'lshape' as const, notchW: 0.6, notchH: 0.5 } : {}),
      updatedAt: Date.now(),
    }
    setFeatures(fs => [...fs, f])
    db.features.put(f); ensurePersist(); bump()
    return id
  }, [bump, ensurePersist])

  const updateFeature = useCallback((id: string, patch: Partial<PlotFeature>) => {
    setFeatures(fs => fs.map(f => {
      if (f.id !== id) return f
      const next = { ...f, ...patch, updatedAt: Date.now() }
      db.features.put(next)
      return next
    }))
    bump()
  }, [bump])

  const removeFeature = useCallback((id: string) => {
    setFeatures(fs => fs.filter(f => f.id !== id))
    db.features.update(id, { deleted: true, updatedAt: Date.now() })
    setSelectedFeatureId(cur => (cur === id ? null : cur))
    bump()
  }, [bump])

  const addJournal = useCallback(async (entry: Omit<JournalEntry, 'id' | 'updatedAt'>, photo?: Blob) => {
    const id = newId()
    let photoId: string | undefined
    if (photo) {
      photoId = newId()
      await db.photos.put({ id: photoId, blob: photo, updatedAt: Date.now() })
    }
    const j: JournalEntry = { ...entry, id, photoId, updatedAt: Date.now() }
    setJournal(js => [j, ...js].sort((a, b) => b.date.localeCompare(a.date)))
    db.journal.put(j); ensurePersist(); bump()
    return id
  }, [bump, ensurePersist])

  const updateJournal = useCallback((id: string, patch: Partial<JournalEntry>) => {
    setJournal(js => js.map(j => {
      if (j.id !== id) return j
      const next = { ...j, ...patch, updatedAt: Date.now() }
      // undefined in a patch means "remove the field" — strip before storing
      for (const k of Object.keys(next) as (keyof JournalEntry)[]) {
        if (next[k] === undefined) delete next[k]
      }
      db.journal.put(next)
      return next
    }))
    bump()
  }, [bump])

  const removeJournal = useCallback((id: string) => {
    setJournal(js => js.filter(j => j.id !== id))
    db.journal.update(id, { deleted: true, updatedAt: Date.now() })
    bump()
  }, [bump])

  const addTask = useCallback((text: string) => {
    const order = tasks.reduce((m, t) => Math.max(m, t.order), -1) + 1
    const t: TaskItem = { id: newId(), text, order, done: false, updatedAt: Date.now() }
    setTasks(ts => [...ts, t])
    db.tasks.put(t); ensurePersist(); bump()
  }, [bump, ensurePersist, tasks])

  const updateTask = useCallback((id: string, patch: Partial<TaskItem>) => {
    setTasks(ts => ts.map(t => {
      if (t.id !== id) return t
      const next = { ...t, ...patch, updatedAt: Date.now() }
      // undefined in a patch means "remove the field" — strip before storing
      for (const k of Object.keys(next) as (keyof TaskItem)[]) {
        if (next[k] === undefined) delete next[k]
      }
      db.tasks.put(next)
      return next
    }))
    bump()
  }, [bump])

  const removeTask = useCallback((id: string) => {
    setTasks(ts => ts.filter(t => t.id !== id))
    db.tasks.update(id, { deleted: true, updatedAt: Date.now() })
    bump()
  }, [bump])

  const toggleTask = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const line = `✓ ${task.text}`
    if (!task.done) {
      const today = new Date().toISOString().slice(0, 10)
      updateTask(id, { done: true, doneDate: today })
      const entry = journal.find(j => j.taskLog && j.date === today)
      if (entry) updateJournal(entry.id, { text: `${entry.text}\n${line}` })
      else addJournal({ date: today, text: line, taskLog: true })
    } else {
      // untick: back to the bottom of the to-do list, and unlog it
      const order = tasks.reduce((m, t) => Math.max(m, t.order), -1) + 1
      updateTask(id, { done: false, doneDate: undefined, order })
      const entry = journal.find(j => j.taskLog && j.date === task.doneDate)
      if (entry) {
        const lines = entry.text.split('\n')
        const i = lines.indexOf(line)
        if (i !== -1) {
          lines.splice(i, 1)
          if (lines.join('').trim()) updateJournal(entry.id, { text: lines.join('\n') })
          else removeJournal(entry.id)
        }
      }
    }
  }, [tasks, journal, updateTask, updateJournal, addJournal, removeJournal])

  const reorderTasks = useCallback((ids: string[]) => {
    const pos = new Map(ids.map((tid, i) => [tid, i]))
    setTasks(ts => ts.map(t => {
      const p = pos.get(t.id)
      if (p === undefined || p === t.order) return t
      const next = { ...t, order: p, updatedAt: Date.now() }
      db.tasks.put(next)
      return next
    }))
    bump()
  }, [bump])

  const upsertPlant = useCallback((p: Plant) => {
    const next = { ...p, updatedAt: Date.now() }
    setCustomPlants(ps => {
      const rest = ps.filter(x => x.id !== p.id)
      return [...rest, next]
    })
    db.plants.put(next); ensurePersist(); bump()
  }, [bump, ensurePersist])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch, updatedAt: Date.now() }
      saveSettings(next)
      return next
    })
    bump()
  }, [bump])

  const replaceAll = useCallback((data: { pins: Pin[]; features: PlotFeature[]; journal: JournalEntry[]; tasks?: TaskItem[]; plants: Plant[]; settings: Settings }) => {
    setPins(data.pins.filter(x => !x.deleted))
    setFeatures(data.features.filter(x => !x.deleted))
    setJournal(data.journal.filter(x => !x.deleted).sort((a, b) => b.date.localeCompare(a.date)))
    setTasks((data.tasks ?? []).filter(x => !x.deleted))
    setCustomPlants(data.plants.filter(x => !x.deleted))
    setSettings(data.settings)
    bump()
  }, [bump])

  const plantById = useCallback((id: string) => plants.find(p => p.id === id), [plants])

  const store: Store = {
    ready,
    tab, setTab, week, setWeek, mode, setMode, buildLayer, setBuildLayer,
    tool, setTool, featureTool, setFeatureTool,
    selectedPlantId, setSelectedPlantId, selectedPinId, setSelectedPinId,
    selectedFeatureId, setSelectedFeatureId, sheetOpen, setSheetOpen,
    settingsOpen, setSettingsOpen, dbDetailId, setDbDetailId,
    pins, features, journal, tasks, plants, plantById, settings, dataVersion, persistGranted,
    addPin, updatePin, removePin, addFeature, updateFeature, removeFeature,
    addJournal, updateJournal, removeJournal,
    addTask, updateTask, removeTask, toggleTask, reorderTasks,
    upsertPlant, updateSettings, replaceAll,
  }

  return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>
}
