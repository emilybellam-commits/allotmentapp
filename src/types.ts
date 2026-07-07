export type WeekRange = [number, number]

export type PlantCategory = 'Vegetable' | 'Flower' | 'Fruit bush' | 'Herb'

export type SketchStyle = 'spiky' | 'dotted' | 'cloud' | 'cross' | 'smooth'

export type VegSymbol =
  | 'carrot' | 'leek' | 'kale' | 'chard' | 'courgette' | 'beetroot' | 'pea' | 'bean'
  | 'squash' | 'radish' | 'garlic' | 'potato' | 'broccoli' | 'psb' | 'artichoke'
  | 'rhubarb' | 'onion' | 'leaf' | 'strawberry' | 'berry'

export interface StageRule {
  /** inclusive week range this label applies to; ranges may wrap (from > to) */
  from: number
  to: number
  label: string
}

export interface PlantCare {
  light: string
  watering: string
  soil: string
}

export interface PestNote {
  name: string
  control: string
}

export interface Plant {
  id: string
  name: string
  latin: string
  family: string
  cat: PlantCategory
  col: string
  /** default pin diameter in world px */
  size: number
  sketch?: SketchStyle
  veg?: VegSymbol
  perennial?: boolean
  sow?: WeekRange
  plant?: WeekRange
  harvest?: WeekRange
  bloom?: WeekRange
  note: string
  stages: StageRule[]
  /** fallback stage label when no rule matches */
  restStage: string
  care?: PlantCare
  /** plant ids */
  companions?: string[]
  enemies?: string[]
  pests?: PestNote[]
  pruning?: string
  custom?: boolean
  updatedAt?: number
  deleted?: boolean
}

export interface Pin {
  id: string
  plantId: string
  x: number // % of world width
  y: number // % of world height
  size: number // world px diameter
  plantedYear?: number
  updatedAt: number
  deleted?: boolean
}

export type FeatureKind =
  | 'bed' | 'path' | 'pond' | 'shed' | 'compost' | 'tree' | 'bush' | 'cage'
  | 'border' | 'trellis' | 'log' | 'butt' | 'weedbutt' | 'tub' | 'arch' | 'boundary'

export type FeatureShape = 'rect' | 'ellipse' | 'lshape'

export interface PlotFeature {
  id: string
  kind: FeatureKind
  shape: FeatureShape
  x: number // % left
  y: number // % top
  w: number // % width
  h: number // % height
  rotation?: number
  /** for lshape: notch size as fraction (0–1) of w/h, cut from the top-left */
  notchW?: number
  notchH?: number
  updatedAt: number
  deleted?: boolean
}

export interface JournalEntry {
  id: string
  date: string // ISO yyyy-mm-dd
  text: string
  photoId?: string
  /** legacy single tag — superseded by plantIds but still honoured on read */
  plantId?: string
  plantIds?: string[]
  pinId?: string
  /** auto-kept entry collecting the day's ticked-off tasks */
  taskLog?: boolean
  updatedAt: number
  deleted?: boolean
}

export interface TaskItem {
  id: string
  text: string
  /** sort position in the to-do list, ascending */
  order: number
  done: boolean
  /** ISO yyyy-mm-dd of the day it was ticked off */
  doneDate?: string
  updatedAt: number
  deleted?: boolean
}

export interface PhotoRecord {
  id: string
  blob: Blob
  updatedAt: number
}

export interface Settings {
  locationName?: string
  lat?: number
  lon?: number
  lastWeek?: number
  driveClientId?: string
  lastSyncAt?: number
  persistGranted?: boolean
  updatedAt?: number
}

export interface WeatherReading {
  tempC: number
  code: number
  windMph?: number
  windDeg?: number
  fetchedAt: number
}

export interface Snapshot {
  version: 1
  exportedAt: number
  pins: Pin[]
  features: PlotFeature[]
  journal: JournalEntry[]
  plants: Plant[] // custom / edited plants only
  /** absent in backups made before the task list existed */
  tasks?: TaskItem[]
  settings: Settings
  photos: { id: string; type: string; base64: string; updatedAt: number }[]
}
