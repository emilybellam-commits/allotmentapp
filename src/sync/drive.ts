import type { Snapshot } from '../types'
import type { SyncAdapter, SyncStatus } from './adapter'

const SCOPE = 'https://www.googleapis.com/auth/drive.appdata'
const FILE_NAME = 'plot47-backup.json'
const GSI_SRC = 'https://accounts.google.com/gsi/client'

declare global {
  interface Window { google?: any }
}

function loadGsi(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('failed to load Google sign-in')))
      if (window.google?.accounts?.oauth2) resolve()
      return
    }
    const s = document.createElement('script')
    s.src = GSI_SRC
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('failed to load Google sign-in'))
    document.head.appendChild(s)
  })
}

/**
 * Google Drive appDataFolder adapter. Needs only an OAuth client ID
 * (Google Identity Services token flow) — no server. Inert until the
 * user pastes a client ID into Settings.
 */
export class DriveAdapter implements SyncAdapter {
  readonly name = 'Google Drive'
  private clientId: string | undefined
  private token: string | null = null
  private tokenExpiry = 0
  private tokenClient: any = null
  private listeners = new Set<(s: SyncStatus) => void>()
  private lastStatus: SyncStatus = { state: 'disabled' }

  setClientId(id: string | undefined) {
    this.clientId = id?.trim() || undefined
    if (!this.clientId) this.emit({ state: 'disabled' })
    else if (!this.token) this.emit({ state: 'signed-out' })
  }

  isConfigured() { return !!this.clientId }
  isSignedIn() { return !!this.token && Date.now() < this.tokenExpiry }

  onStatus(cb: (s: SyncStatus) => void) {
    this.listeners.add(cb)
    cb(this.lastStatus)
    return () => { this.listeners.delete(cb) }
  }

  private emit(s: SyncStatus) {
    this.lastStatus = s
    for (const cb of this.listeners) cb(s)
  }

  async signIn(): Promise<void> {
    if (!this.clientId) throw new Error('No Google client ID configured')
    await loadGsi()
    await new Promise<void>((resolve, reject) => {
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: SCOPE,
        callback: (resp: any) => {
          if (resp.error) { reject(new Error(resp.error)); return }
          this.token = resp.access_token
          this.tokenExpiry = Date.now() + (Number(resp.expires_in) - 60) * 1000
          resolve()
        },
      })
      this.tokenClient.requestAccessToken({ prompt: '' })
    })
    this.emit({ state: 'idle' })
  }

  signOut() {
    if (this.token && window.google?.accounts?.oauth2) {
      try { window.google.accounts.oauth2.revoke(this.token, () => {}) } catch { /* ignore */ }
    }
    this.token = null
    this.tokenExpiry = 0
    this.emit({ state: 'signed-out' })
  }

  private async ensureToken(): Promise<string> {
    if (this.isSignedIn()) return this.token!
    await this.signIn()
    return this.token!
  }

  private async api(path: string, init?: RequestInit): Promise<Response> {
    const token = await this.ensureToken()
    const res = await fetch(path, {
      ...init,
      headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Drive API ${res.status}`)
    return res
  }

  private async findFileId(): Promise<string | null> {
    const res = await this.api(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${FILE_NAME}'&fields=files(id)`,
    )
    const data = await res.json()
    return data.files?.[0]?.id ?? null
  }

  async push(snapshot: Snapshot): Promise<void> {
    this.emit({ state: 'syncing' })
    try {
      const fileId = await this.findFileId()
      const body = JSON.stringify(snapshot)
      if (fileId) {
        await this.api(
          `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
          { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body },
        )
      } else {
        const meta = { name: FILE_NAME, parents: ['appDataFolder'] }
        const boundary = 'plot47' + Math.random().toString(36).slice(2)
        const multipart =
          `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n` +
          `--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`
        await this.api(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
          { method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body: multipart },
        )
      }
      this.emit({ state: 'synced', at: Date.now() })
    } catch (e) {
      this.emit({ state: 'error', message: e instanceof Error ? e.message : String(e) })
      throw e
    }
  }

  async pull(): Promise<Snapshot | null> {
    this.emit({ state: 'syncing' })
    try {
      const fileId = await this.findFileId()
      if (!fileId) { this.emit({ state: 'idle' }); return null }
      const res = await this.api(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`)
      const snap = (await res.json()) as Snapshot
      this.emit({ state: 'synced', at: Date.now() })
      return snap
    } catch (e) {
      this.emit({ state: 'error', message: e instanceof Error ? e.message : String(e) })
      throw e
    }
  }
}

export const driveAdapter = new DriveAdapter()
