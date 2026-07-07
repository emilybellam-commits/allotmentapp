import type { Snapshot } from '../types'

export type SyncStatus =
  | { state: 'idle' }
  | { state: 'disabled' }
  | { state: 'signed-out' }
  | { state: 'syncing' }
  | { state: 'synced'; at: number }
  | { state: 'error'; message: string }

/**
 * A sync backend: pushes/pulls whole snapshots. Merging is last-write-wins
 * per record (see snapshot.ts) — sufficient for a single-user app.
 */
export interface SyncAdapter {
  readonly name: string
  isConfigured(): boolean
  isSignedIn(): boolean
  signIn(): Promise<void>
  signOut(): void
  push(snapshot: Snapshot): Promise<void>
  pull(): Promise<Snapshot | null>
  onStatus(cb: (s: SyncStatus) => void): () => void
}
