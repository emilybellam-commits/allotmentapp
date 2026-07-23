const RAD = Math.PI / 180

/** Compass azimuth that map-up points to: the plot runs NW–SE, so up is NW. */
export const MAP_UP_AZ = 315

export interface SunPos {
  /** degrees clockwise from north */
  azimuth: number
  /** degrees above the horizon */
  elevation: number
  /** degrees of hour angle; 0 = solar noon, negative = morning */
  hourAngle: number
}

export interface DayGeometry {
  /** solar declination, degrees */
  declination: number
  /** hour angle from sunrise to solar noon, degrees (0 if the sun never rises) */
  halfDay: number
}

export function dayGeometry(week: number, lat: number): DayGeometry {
  const dayOfYear = Math.min(365, (week - 1) * 7 + 4)
  const declination = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10))
  const cosH = Math.max(-1, Math.min(1, -Math.tan(lat * RAD) * Math.tan(declination * RAD)))
  return { declination, halfDay: Math.acos(cosH) / RAD }
}

/** Sun position for the scrubbed week at daylight fraction t: 0 = sunrise, 0.5 = solar noon, 1 = sunset. */
export function sunAt(week: number, lat: number, t: number): SunPos {
  const { declination, halfDay } = dayGeometry(week, lat)
  const H = (t * 2 - 1) * halfDay
  const phi = lat * RAD, delta = declination * RAD, h = H * RAD
  const sinE = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(h)
  const e = Math.asin(Math.max(-1, Math.min(1, sinE)))
  let cosA = (Math.sin(delta) - Math.sin(phi) * sinE) / (Math.cos(phi) * Math.cos(e))
  cosA = Math.max(-1, Math.min(1, cosA))
  let az = Math.acos(cosA) / RAD
  if (H > 0) az = 360 - az
  return { azimuth: az, elevation: e / RAD, hourAngle: H }
}

/** Unit vector on the map (x right, y down) pointing toward compass azimuth `az`. */
export function mapDir(az: number): [number, number] {
  const s = (az - MAP_UP_AZ) * RAD
  return [Math.sin(s), -Math.cos(s)]
}

/**
 * Approximate wall-clock time for an hour angle: mean solar time shifted by
 * longitude, plus BST during roughly weeks 13–43. Skips the equation of time,
 * hence the ≈ in labels.
 */
export function clockLabel(week: number, hourAngle: number, lon = 0): string {
  const bst = week >= 13 && week <= 43 ? 1 : 0
  let h = 12 + hourAngle / 15 - lon / 15 + bst
  h = ((h % 24) + 24) % 24
  let hh = Math.floor(h)
  let mm = Math.round((h - hh) * 60)
  if (mm === 60) { mm = 0; hh = (hh + 1) % 24 }
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}
