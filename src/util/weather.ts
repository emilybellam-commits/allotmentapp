import { db } from '../store/db'
import { SEASON_META, seasonOf } from './weeks'
import type { WeatherReading } from '../types'

const CACHE_KEY = 'weatherCache'
const MAX_AGE = 60 * 60 * 1000 // refetch after an hour

function codeToText(code: number): { icon: string; word: string } {
  if (code === 0) return { icon: '☀️', word: 'clear' }
  if (code <= 2) return { icon: '🌤', word: 'bright' }
  if (code === 3) return { icon: '☁️', word: 'overcast' }
  if (code <= 48) return { icon: '🌫', word: 'mist' }
  if (code <= 57) return { icon: '🌦', word: 'drizzle' }
  if (code <= 67) return { icon: '🌧', word: 'rain' }
  if (code <= 77) return { icon: '❄️', word: 'snow' }
  if (code <= 82) return { icon: '🌦', word: 'showers' }
  if (code <= 86) return { icon: '❄️', word: 'snow showers' }
  return { icon: '⛈', word: 'thunder' }
}

export interface WeatherDisplay {
  icon: string
  text: string
  /** e.g. "9 mph SW" — live readings only */
  wind?: string
  windDeg?: number
  live: boolean
}

const COMPASS_POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

export function windCompass(deg: number): string {
  return COMPASS_POINTS[Math.round(deg / 45) % 8]
}

export function seasonalFallback(week: number): WeatherDisplay {
  const s = SEASON_META[seasonOf(week)]
  return { icon: s.icon, text: s.fallbackWeather, live: false }
}

export function readingToDisplay(r: WeatherReading): WeatherDisplay {
  const { icon, word } = codeToText(r.code)
  const wind = r.windMph != null && r.windDeg != null
    ? `${Math.round(r.windMph)} mph ${windCompass(r.windDeg)}`
    : undefined
  return { icon, text: `${Math.round(r.tempC)}°C, ${word}`, wind, windDeg: r.windDeg, live: true }
}

export async function getCachedReading(): Promise<WeatherReading | null> {
  const row = await db.kv.get(CACHE_KEY)
  return (row?.value as WeatherReading) ?? null
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherReading | null> {
  const cached = await getCachedReading()
  // a cached reading without wind predates the wind upgrade — refetch
  if (cached && cached.windMph != null && Date.now() - cached.fetchedAt < MAX_AGE) return cached
  if (!navigator.onLine) return cached
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&wind_speed_unit=mph`,
      { signal: AbortSignal.timeout(8000) },
    )
    if (!res.ok) return cached
    const data = await res.json()
    const reading: WeatherReading = {
      tempC: data.current.temperature_2m,
      code: data.current.weather_code,
      windMph: data.current.wind_speed_10m,
      windDeg: data.current.wind_direction_10m,
      fetchedAt: Date.now(),
    }
    await db.kv.put({ key: CACHE_KEY, value: reading })
    return reading
  } catch {
    return cached
  }
}

export interface GeoResult { name: string; lat: number; lon: number; detail: string }

export async function geocode(query: string): Promise<GeoResult[]> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en`,
    { signal: AbortSignal.timeout(8000) },
  )
  if (!res.ok) throw new Error('search failed')
  const data = await res.json()
  return (data.results ?? []).map((r: any) => ({
    name: r.name,
    lat: r.latitude,
    lon: r.longitude,
    detail: [r.admin1, r.country].filter(Boolean).join(', '),
  }))
}
