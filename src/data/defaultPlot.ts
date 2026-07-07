import type { Pin, PlotFeature } from '../types'
import { SEED_PLANTS } from './catalogue'

// The real Plot 47 layout, digitised from the design reference.
// Coordinates are % of the world box (540 × 1348 aspect).
const F = (
  kind: PlotFeature['kind'], shape: PlotFeature['shape'],
  x: number, y: number, w: number, h: number,
  extra?: Partial<PlotFeature>,
): Omit<PlotFeature, 'id' | 'updatedAt'> => ({ kind, shape, x, y, w, h, ...extra })

const RAW_FEATURES = [
  F('boundary', 'rect', 13.6, 3.8, 75.1, 91.5),
  F('path', 'rect', 13.6, 3.8, 66.9, 2.9),
  F('compost', 'rect', 35.9, 8.7, 17.7, 4.65),
  F('compost', 'rect', 53.7, 8.7, 18.6, 4.65),
  F('weedbutt', 'ellipse', 28.6, 10.1, 6.6, 2.45),
  F('bush', 'ellipse', 23.3, 12.2, 6.6, 2.1),
  F('bush', 'ellipse', 22.6, 15.8, 9, 2.1),
  F('bush', 'ellipse', 30.7, 17.3, 9, 2.1),
  F('bush', 'ellipse', 39.8, 13.5, 22, 2.9),
  F('tree', 'ellipse', 29.4, 13.3, 9.5, 2.9),
  F('tree', 'ellipse', 62.6, 13.3, 8.5, 2.7),
  F('tree', 'ellipse', 61.8, 16.2, 10.2, 2.9),
  F('cage', 'rect', 14.6, 20.7, 43.2, 8),
  F('border', 'lshape', 13.6, 26.2, 55.4, 5, { notchW: 0.798, notchH: 0.5 }),
  F('bed', 'rect', 13.6, 31.3, 5.5, 12.2),
  F('trellis', 'rect', 12.2, 31.3, 1.2, 12.2),
  F('log', 'ellipse', 21, 31.8, 5.1, 1.9),
  F('log', 'ellipse', 27, 31.8, 5.1, 1.9),
  F('log', 'ellipse', 32.9, 31.8, 5.1, 1.9),
  F('pond', 'ellipse', 21, 34.8, 17, 5.1),
  F('bed', 'rect', 52.2, 34.1, 36.5, 6.6),
  F('bed', 'rect', 13.6, 43.3, 31, 6.6),
  F('bed', 'rect', 52.2, 43.3, 36.5, 6.6),
  F('arch', 'rect', 44.6, 43.3, 7.6, 6.6),
  F('bed', 'rect', 13.6, 52.4, 31.1, 6.6),
  F('bed', 'rect', 52.2, 52.4, 36.5, 6.6),
  F('bed', 'rect', 13.6, 61.7, 31.1, 6.6),
  F('bed', 'rect', 52.2, 61.7, 36.5, 6.6),
  F('bed', 'rect', 13.6, 70.9, 31.1, 6.5),
  F('bed', 'rect', 52.2, 70.9, 36.5, 6.5),
  F('tub', 'rect', 14.5, 71.6, 24.8, 4.1),
  F('shed', 'rect', 17.9, 84.7, 30.5, 7.3),
  F('border', 'lshape', 48.4, 81, 40.3, 14.3, { notchW: 0.687, notchH: 0.462 }),
  F('butt', 'ellipse', 22, 92.3, 6.6, 2.45),
  F('butt', 'ellipse', 32.2, 92.3, 6.6, 2.45),
]

const RAW_PINS: [string, number, number][] = [
  ['broadbean', 70, 37.4], ['kale', 70, 46.6], ['chard', 70, 55.7], ['leek', 70, 65],
  ['pea', 29, 46.6], ['carrot', 29, 55.7], ['beetroot', 29, 65], ['courgette', 29, 74.2],
  ['dahlia', 20, 29.5], ['cosmos', 34, 29.5], ['allium', 46, 29.5], ['calendula', 58, 29.5],
  ['tulip', 63, 27.4],
  ['sunflower', 58, 90.5], ['cosmos', 74, 90.5],
  ['lavender', 82, 83.5], ['dahlia', 82, 90],
  ['sweetpea', 66, 90.5],
]

export function defaultFeatures(): PlotFeature[] {
  const t = Date.now()
  return RAW_FEATURES.map((f, i) => ({ ...f, id: 'f' + i, updatedAt: t }))
}

export function defaultPins(): Pin[] {
  const t = Date.now()
  const sizeOf = (plantId: string) => SEED_PLANTS.find(p => p.id === plantId)?.size ?? 40
  return RAW_PINS.map(([plantId, x, y], i) => ({
    id: 's' + i, plantId, x, y, size: sizeOf(plantId), updatedAt: t,
  }))
}
