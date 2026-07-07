import { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { fetchWeather, getCachedReading, readingToDisplay, seasonalFallback, type WeatherDisplay } from './weather'

/** Live reading when a location is set and we're (or were recently) online;
 *  seasonal averages for the scrubbed week otherwise. */
export function useWeather(week: number): WeatherDisplay {
  const { settings } = useStore()
  const [live, setLive] = useState<WeatherDisplay | null>(null)

  useEffect(() => {
    let cancelled = false
    if (settings.lat == null || settings.lon == null) { setLive(null); return }
    getCachedReading().then(r => {
      if (!cancelled && r) setLive(readingToDisplay(r))
    })
    fetchWeather(settings.lat, settings.lon).then(r => {
      if (!cancelled && r) setLive(readingToDisplay(r))
    })
    return () => { cancelled = true }
  }, [settings.lat, settings.lon])

  return live ?? seasonalFallback(week)
}
