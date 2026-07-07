import type { Plant, WeekRange } from '../types'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export function seasonOf(w: number): Season {
  if (w >= 9 && w <= 22) return 'spring'
  if (w >= 23 && w <= 35) return 'summer'
  if (w >= 36 && w <= 48) return 'autumn'
  return 'winter'
}

export const SEASON_META: Record<Season, { label: string; icon: string; fallbackWeather: string }> = {
  spring: { label: 'Spring', icon: '🌦', fallbackWeather: '12°C, showers' },
  summer: { label: 'Summer', icon: '☀️', fallbackWeather: '21°C, bright' },
  autumn: { label: 'Autumn', icon: '🍃', fallbackWeather: '14°C, breezy' },
  winter: { label: 'Winter', icon: '❄️', fallbackWeather: '4°C, frost' },
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function weekToDate(week: number, year = new Date().getFullYear()) {
  const d = new Date(year, 0, 1 + (week - 1) * 7)
  return { day: d.getDate(), month: MONTHS[d.getMonth()], date: d }
}

export function weekLabel(week: number) {
  const { day, month } = weekToDate(week)
  return `Week ${week} · ${day} ${month}`
}

export function weekLabelShort(week: number) {
  const { day, month } = weekToDate(week)
  return `Wk ${week} · ${day} ${month}`
}

export function currentWeek(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const week = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 3600 * 1000)) + 1
  return Math.min(52, Math.max(1, week))
}

export function inRange(w: number, range: WeekRange | undefined): boolean {
  if (!range) return false
  const [a, b] = range
  if (a === b) return false
  if (b < a) return w >= a || w <= b // wraps the new year
  return w >= a && w <= b
}

export function lastRange(p: Plant): WeekRange | undefined {
  return p.bloom || p.harvest
}

export function lastLabel(p: Plant): 'bloom' | 'harvest' {
  return p.bloom ? 'bloom' : 'harvest'
}

export function isPresent(p: Plant, w: number): boolean {
  if (p.perennial) return true
  const start = p.sow ? p.sow[0] : p.plant ? p.plant[0] : 1
  const last = lastRange(p)
  const end = last ? last[1] : 52
  if (end < start) return w >= start || w <= end
  return w >= start && w <= end
}

export type CropState = 'empty' | 'sown' | 'full' | 'bloom' | 'harvest'

export function cropState(p: Plant, w: number): CropState {
  if (!isPresent(p, w)) return 'empty'
  const last = lastRange(p)
  if (last && inRange(w, last)) return p.bloom ? 'bloom' : 'harvest'
  const start = p.sow ? p.sow[0] : p.plant ? p.plant[0] : 1
  if (!p.perennial && w >= start && w < start + 3) return 'sown'
  return 'full'
}

export function stageAt(p: Plant, w: number): string {
  for (const r of p.stages) {
    if (r.to < r.from ? w >= r.from || w <= r.to : w >= r.from && w <= r.to) return r.label
  }
  return p.restStage
}
