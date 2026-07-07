import React, { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { db } from '../store/db'
import { PinBlob } from './PinBlob'

function PhotoThumb({ photoId }: { photoId: string }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let obj: string | null = null
    db.photos.get(photoId).then(p => {
      if (p) { obj = URL.createObjectURL(p.blob); setUrl(obj) }
    })
    return () => { if (obj) URL.revokeObjectURL(obj) }
  }, [photoId])
  if (!url) return null
  return (
    <img
      src={url}
      alt=""
      style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid var(--card-border)', marginTop: 8, display: 'block' }}
    />
  )
}

export function JournalScreen() {
  const { journal, plants, plantById, addJournal, removeJournal } = useStore()
  const [writing, setWriting] = useState(false)
  const [text, setText] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [plantId, setPlantId] = useState<string>('')
  const [photo, setPhoto] = useState<File | null>(null)

  const save = async () => {
    if (!text.trim()) return
    await addJournal({ date, text: text.trim(), plantId: plantId || undefined }, photo ?? undefined)
    setText(''); setPhoto(null); setPlantId(''); setWriting(false)
  }

  const fmtDate = (iso: string) => {
    const d = new Date(iso + 'T12:00:00')
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '14px 18px 26px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <div className="hand" style={{ fontSize: 28, color: 'var(--ink)' }}>Journal</div>
        <div style={{ flex: 1 }} />
        {!writing && (
          <button
            onClick={() => setWriting(true)}
            style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 7, padding: '7px 12px' }}
          >
            + New note
          </button>
        )}
      </div>

      {writing && (
        <div className="card fade-in" style={{ padding: 14, marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ flex: 1 }} />
            <select value={plantId} onChange={e => setPlantId(e.target.value)} style={{ flex: 1 }}>
              <option value="">— no plant —</option>
              {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <textarea
            rows={4}
            placeholder="What happened on the plot…"
            value={text}
            onChange={e => setText(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <label style={{
              fontSize: 12, fontWeight: 600, color: 'var(--body)', border: '1px solid var(--card-border)',
              borderRadius: 7, padding: '9px 12px', cursor: 'pointer', background: 'var(--map)',
            }}>
              {photo ? '✓ photo attached' : 'Attach photo'}
              <input
                type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => setPhoto(e.target.files?.[0] ?? null)}
              />
            </label>
            <div style={{ flex: 1 }} />
            <button onClick={() => { setWriting(false); setText(''); setPhoto(null) }} style={{ fontSize: 13, color: 'var(--text2)', padding: '9px 10px' }}>
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!text.trim()}
              style={{
                fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 7,
                background: text.trim() ? 'var(--accent)' : 'var(--hairline)', color: '#fdfbf5',
              }}
            >
              Save note
            </button>
          </div>
        </div>
      )}

      {journal.length === 0 && !writing && (
        <div className="hand" style={{ fontSize: 22, color: 'var(--text2)', padding: '22px 0' }}>
          Nothing written yet — the plot's story starts here.
        </div>
      )}

      {journal.map(j => {
        const p = j.plantId ? plantById(j.plantId) : undefined
        return (
          <div key={j.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--hairline2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="hand" style={{ fontSize: 20, color: 'var(--accent)' }}>{fmtDate(j.date)}</span>
              <div style={{ flex: 1 }} />
              {p && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text2)' }}>
                  <span style={{ width: 20, height: 20, display: 'inline-flex' }}><PinBlob plant={p} px={20} inspector /></span>
                  {p.name}
                </span>
              )}
              <button
                onClick={() => { if (confirm('Delete this note?')) removeJournal(j.id) }}
                aria-label="Delete note"
                style={{ color: 'var(--text3)', fontSize: 15, padding: '2px 6px' }}
              >×</button>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--body)', marginTop: 4, whiteSpace: 'pre-wrap' }}>{j.text}</div>
            {j.photoId && <PhotoThumb photoId={j.photoId} />}
          </div>
        )
      })}
    </div>
  )
}
