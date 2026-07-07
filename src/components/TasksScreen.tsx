import React, { useRef, useState } from 'react'
import { useStore } from '../store/store'

const ROW_H = 52

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

interface Drag { id: string; from: number; to: number; dy: number }

function CheckBox({ done, onToggle, label }: { done: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      onClick={onToggle}
      aria-label={label}
      style={{
        width: 26, height: 26, borderRadius: 8, flex: 'none',
        border: `1.5px solid ${done ? 'var(--accent)' : 'var(--card-border)'}`,
        background: done ? 'var(--chip-active)' : 'var(--map)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {done && (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 8 L6 11.5 L12.5 3.5" />
        </svg>
      )}
    </button>
  )
}

export function TasksScreen() {
  const { tasks, addTask, removeTask, toggleTask, reorderTasks } = useStore()
  const [text, setText] = useState('')
  const [drag, setDragState] = useState<Drag | null>(null)
  const dragRef = useRef<Drag | null>(null)
  const startY = useRef(0)
  const setDrag = (d: Drag | null) => { dragRef.current = d; setDragState(d) }

  const active = tasks.filter(t => !t.done).sort((a, b) => a.order - b.order)
  const done = tasks.filter(t => t.done).sort((a, b) =>
    (b.doneDate ?? '').localeCompare(a.doneDate ?? '') || b.updatedAt - a.updatedAt)

  const add = () => {
    const t = text.trim()
    if (!t) return
    addTask(t)
    setText('')
  }

  const onHandleDown = (e: React.PointerEvent<HTMLElement>, id: string, index: number) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    startY.current = e.clientY
    setDrag({ id, from: index, to: index, dy: 0 })
  }
  const onHandleMove = (e: React.PointerEvent<HTMLElement>) => {
    const d = dragRef.current
    if (!d) return
    const dy = e.clientY - startY.current
    const to = clamp(d.from + Math.round(dy / ROW_H), 0, active.length - 1)
    setDrag({ ...d, dy, to })
  }
  const onHandleUp = () => {
    const d = dragRef.current
    if (d && d.to !== d.from) {
      const ids = active.map(t => t.id)
      const [moved] = ids.splice(d.from, 1)
      ids.splice(d.to, 0, moved)
      reorderTasks(ids)
    }
    setDrag(null)
  }

  // vertical shift for a resting row while another row is being dragged past it
  const shiftFor = (i: number): number => {
    if (!drag || drag.to === drag.from) return 0
    if (drag.from < drag.to && i > drag.from && i <= drag.to) return -ROW_H
    if (drag.from > drag.to && i >= drag.to && i < drag.from) return ROW_H
    return 0
  }

  const fmtDate = (iso?: string) => {
    if (!iso) return ''
    return new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '14px 18px 26px' }}>
      <div className="hand" style={{ fontSize: 28, color: 'var(--ink)' }}>Tasks</div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input
          type="text"
          placeholder="Something that needs doing…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add() }}
        />
        <button
          onClick={add}
          disabled={!text.trim()}
          style={{
            fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 7, flex: 'none',
            background: text.trim() ? 'var(--accent)' : 'var(--hairline)', color: '#fdfbf5',
          }}
        >
          Add
        </button>
      </div>

      {active.length === 0 && done.length === 0 && (
        <div className="hand" style={{ fontSize: 22, color: 'var(--text2)', padding: '22px 0' }}>
          Nothing on the list — enjoy a wander round the plot.
        </div>
      )}

      {active.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: 'var(--text3)', margin: '12px 0 4px' }}>
            Hold ⠿ to reorder. Ticked tasks are written into that day&rsquo;s journal.
          </div>
          <div style={{ position: 'relative' }}>
            {active.map((t, i) => {
              const dragging = drag?.id === t.id
              return (
                <div
                  key={t.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, height: ROW_H,
                    borderBottom: '1px solid var(--hairline2)',
                    transform: `translateY(${dragging ? drag.dy : shiftFor(i)}px)`,
                    transition: dragging ? 'none' : 'transform .16s ease',
                    position: 'relative', zIndex: dragging ? 2 : 1,
                    background: dragging ? 'var(--card)' : 'transparent',
                    boxShadow: dragging ? 'var(--card-shadow)' : 'none',
                    borderRadius: dragging ? 8 : 0,
                  }}
                >
                  <span
                    onPointerDown={e => onHandleDown(e, t.id, i)}
                    onPointerMove={onHandleMove}
                    onPointerUp={onHandleUp}
                    onPointerCancel={onHandleUp}
                    aria-label="Drag to reorder"
                    style={{
                      touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab',
                      width: 32, height: '100%', flex: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text3)', fontSize: 15, userSelect: 'none',
                    }}
                  >
                    ⠿
                  </span>
                  <CheckBox done={false} onToggle={() => toggleTask(t.id)} label="Tick off" />
                  <span style={{
                    flex: 1, fontSize: 14, color: 'var(--body)', minWidth: 0,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {t.text}
                  </span>
                  <button
                    onClick={() => removeTask(t.id)}
                    aria-label="Delete task"
                    style={{ fontSize: 16, color: 'var(--text3)', padding: '4px 8px', flex: 'none' }}
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}

      {done.length > 0 && (
        <>
          <div className="tk" style={{ fontSize: 10, color: 'var(--text3)', margin: '20px 0 4px' }}>Done</div>
          {done.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0 9px 6px', borderBottom: '1px solid var(--hairline2)' }}>
              <CheckBox done onToggle={() => toggleTask(t.id)} label="Untick" />
              <span style={{ flex: 1, fontSize: 14, color: 'var(--text2)', textDecoration: 'line-through', minWidth: 0, overflowWrap: 'anywhere' }}>
                {t.text}
              </span>
              {t.doneDate && (
                <span className="hand" style={{ fontSize: 16, color: 'var(--text3)', flex: 'none' }}>{fmtDate(t.doneDate)}</span>
              )}
              <button
                onClick={() => removeTask(t.id)}
                aria-label="Delete task"
                style={{ fontSize: 16, color: 'var(--text3)', padding: '4px 8px', flex: 'none' }}
              >
                ×
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
