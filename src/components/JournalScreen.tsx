import React, { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import { db } from '../store/db'
import type { JournalEntry } from '../types'
import { PinBlob } from './PinBlob'
import { plantGroups } from '../util/plantGroups'
import { journalPlantIds } from '../util/journalTags'

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

/** Alphabetical, grouped plant multi-picker with checkboxes. */
function PlantPicker({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  const { plants } = useStore()
  const [open, setOpen] = useState(false)
  const chosen = selected
    .map(id => plants.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p)

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {chosen.map(p => (
          <button
            key={p.id}
            onClick={() => onToggle(p.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '5px 9px', borderRadius: 12,
              border: '1px solid var(--accent)', background: 'var(--chip-active)', fontSize: 12, color: 'var(--ink)',
            }}
          >
            <span style={{ width: 18, height: 18, display: 'inline-flex' }}><PinBlob plant={p} px={18} inspector /></span>
            {p.name}
            <span style={{ color: 'var(--text2)', marginLeft: 2 }}>×</span>
          </button>
        ))}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            fontSize: 12, fontWeight: 600, color: 'var(--accent)', padding: '6px 10px',
            border: '1px dashed var(--accent)', borderRadius: 12,
          }}
        >
          {open ? 'done tagging' : chosen.length ? '+ more plants' : '+ tag plants'}
        </button>
      </div>
      {open && (
        <div style={{
          marginTop: 8, border: '1px solid var(--card-border)', borderRadius: 8, background: 'var(--map)',
          maxHeight: 220, overflowY: 'auto', padding: '4px 10px 8px',
        }}>
          {plantGroups(plants).map(g => g.plants.length > 0 && (
            <div key={g.key}>
              <div className="tk" style={{ fontSize: 9, color: 'var(--text3)', margin: '8px 0 3px' }}>{g.title}</div>
              {g.plants.map(p => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 13, color: 'var(--ink)' }}>
                  <input
                    type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={() => onToggle(p.id)}
                    style={{ width: 17, height: 17, flex: 'none' }}
                  />
                  <span style={{ width: 20, height: 20, display: 'inline-flex', flex: 'none' }}><PinBlob plant={p} px={20} inspector /></span>
                  {p.name}
                </label>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface Draft {
  id?: string // set = editing an existing entry
  date: string
  text: string
  plantIds: string[]
  existingPhotoId?: string
  newPhoto: File | null
}

const emptyDraft = (): Draft => ({
  date: new Date().toISOString().slice(0, 10),
  text: '', plantIds: [], newPhoto: null,
})

export function JournalScreen() {
  const { journal, plantById, addJournal, updateJournal, removeJournal } = useStore()
  const [draft, setDraft] = useState<Draft | null>(null)

  const save = async () => {
    if (!draft || !draft.text.trim()) return
    if (draft.id) {
      let photoId = draft.existingPhotoId
      if (draft.newPhoto) {
        photoId = crypto.randomUUID()
        await db.photos.put({ id: photoId, blob: draft.newPhoto, updatedAt: Date.now() })
      }
      updateJournal(draft.id, {
        date: draft.date, text: draft.text.trim(),
        plantIds: draft.plantIds, plantId: undefined, photoId,
      })
    } else {
      await addJournal(
        { date: draft.date, text: draft.text.trim(), plantIds: draft.plantIds },
        draft.newPhoto ?? undefined,
      )
    }
    setDraft(null)
  }

  const startEdit = (j: JournalEntry) => {
    setDraft({
      id: j.id, date: j.date, text: j.text,
      plantIds: journalPlantIds(j), existingPhotoId: j.photoId, newPhoto: null,
    })
  }

  const togglePlant = (id: string) => {
    setDraft(d => d && ({
      ...d,
      plantIds: d.plantIds.includes(id) ? d.plantIds.filter(x => x !== id) : [...d.plantIds, id],
    }))
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
        {!draft && (
          <button
            onClick={() => setDraft(emptyDraft())}
            style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 7, padding: '7px 12px' }}
          >
            + New note
          </button>
        )}
      </div>

      {draft && (
        <div className="card fade-in" style={{ padding: 14, marginTop: 12 }}>
          <div className="hand" style={{ fontSize: 20, color: 'var(--accent)', marginBottom: 8 }}>
            {draft.id ? 'Editing note' : 'New note'}
          </div>
          <input type="date" value={draft.date} onChange={e => setDraft(d => d && { ...d, date: e.target.value })} style={{ marginBottom: 8 }} />
          <textarea
            rows={4}
            placeholder="What happened on the plot…"
            value={draft.text}
            onChange={e => setDraft(d => d && { ...d, text: e.target.value })}
            autoFocus
          />
          <div style={{ marginTop: 10 }}>
            <PlantPicker selected={draft.plantIds} onToggle={togglePlant} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <label style={{
              fontSize: 12, fontWeight: 600, color: 'var(--body)', border: '1px solid var(--card-border)',
              borderRadius: 7, padding: '9px 12px', cursor: 'pointer', background: 'var(--map)',
            }}>
              {draft.newPhoto ? '✓ new photo' : draft.existingPhotoId ? 'Replace photo' : 'Attach photo'}
              <input
                type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => setDraft(d => d && { ...d, newPhoto: e.target.files?.[0] ?? null })}
              />
            </label>
            <div style={{ flex: 1 }} />
            <button onClick={() => setDraft(null)} style={{ fontSize: 13, color: 'var(--text2)', padding: '9px 10px' }}>
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!draft.text.trim()}
              style={{
                fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 7,
                background: draft.text.trim() ? 'var(--accent)' : 'var(--hairline)', color: '#fdfbf5',
              }}
            >
              {draft.id ? 'Save changes' : 'Save note'}
            </button>
          </div>
        </div>
      )}

      {journal.length === 0 && !draft && (
        <div className="hand" style={{ fontSize: 22, color: 'var(--text2)', padding: '22px 0' }}>
          Nothing written yet — the plot's story starts here.
        </div>
      )}

      {journal.map(j => {
        const tagged = journalPlantIds(j)
          .map(id => plantById(id))
          .filter((p): p is NonNullable<typeof p> => !!p)
        return (
          <div key={j.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--hairline2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="hand" style={{ fontSize: 20, color: 'var(--accent)' }}>{fmtDate(j.date)}</span>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => startEdit(j)}
                aria-label="Edit note"
                style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', padding: '4px 8px' }}
              >Edit</button>
              <button
                onClick={() => { if (confirm('Delete this note?')) removeJournal(j.id) }}
                aria-label="Delete note"
                style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)', padding: '4px 8px' }}
              >Delete</button>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--body)', marginTop: 4, whiteSpace: 'pre-wrap' }}>{j.text}</div>
            {tagged.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {tagged.map(p => (
                  <span key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text2)' }}>
                    <span style={{ width: 20, height: 20, display: 'inline-flex' }}><PinBlob plant={p} px={20} inspector /></span>
                    {p.name}
                  </span>
                ))}
              </div>
            )}
            {j.photoId && <PhotoThumb photoId={j.photoId} />}
          </div>
        )
      })}
    </div>
  )
}
