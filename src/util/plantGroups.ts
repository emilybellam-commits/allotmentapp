import type { Plant } from '../types'

export const byName = (a: Plant, b: Plant) => a.name.localeCompare(b.name)

export interface PlantGroup {
  key: 'fruitveg' | 'perennial' | 'annual'
  title: string
  plants: Plant[]
}

/** The app-wide display grouping: fruit & veg (incl. herbs), perennial
 *  flowers, and annual/biennial flowers — each alphabetical by name. */
export function plantGroups(plants: Plant[]): PlantGroup[] {
  const live = plants.filter(p => !p.deleted)
  const fruitveg = live.filter(p => p.cat !== 'Flower').sort(byName)
  const perennial = live.filter(p => p.cat === 'Flower' && p.perennial).sort(byName)
  const annual = live.filter(p => p.cat === 'Flower' && !p.perennial).sort(byName)
  return [
    { key: 'fruitveg', title: 'Fruit & veg', plants: fruitveg },
    { key: 'perennial', title: 'Perennial flowers', plants: perennial },
    { key: 'annual', title: 'Annual & biennial flowers', plants: annual },
  ]
}
