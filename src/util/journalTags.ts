import type { JournalEntry } from '../types'

/** Plant ids tagged on an entry — honours both the new multi-tag field
 *  and the original single plantId. */
export function journalPlantIds(j: JournalEntry): string[] {
  if (j.plantIds && j.plantIds.length) return j.plantIds
  return j.plantId ? [j.plantId] : []
}

export function journalCountFor(journal: JournalEntry[], plantId: string): number {
  return journal.filter(j => journalPlantIds(j).includes(plantId)).length
}
