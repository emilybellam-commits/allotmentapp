import type { JournalEntry } from '../types'

/** Plant ids tagged on an entry — honours both the new multi-tag field
 *  and the original single plantId. */
export function journalPlantIds(j: JournalEntry): string[] {
  if (j.plantIds && j.plantIds.length) return j.plantIds
  return j.plantId ? [j.plantId] : []
}

/** Photo ids attached to an entry — honours both the new multi-photo field
 *  and the original single photoId. */
export function journalPhotoIds(j: JournalEntry): string[] {
  if (j.photoIds) return j.photoIds
  return j.photoId ? [j.photoId] : []
}

export function journalCountFor(journal: JournalEntry[], plantId: string): number {
  return journal.filter(j => journalPlantIds(j).includes(plantId)).length
}
