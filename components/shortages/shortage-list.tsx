'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { SHORTAGE_TYPE_LABELS } from '@/lib/lesson-status'
import { SHORTAGE_STATUS_LABELS } from '@/lib/validations/task'
import { handleShortage, cancelShortage } from '@/app/(dashboard)/shortages/actions'

type ShortageRow = {
  id: string
  shortage_type: string
  shortage_description: string
  due_date: string | null
  status: string
  notes: string | null
  handled_at: string | null
  created_at: string
  related_lesson: { id: string; lesson_date: string } | null
  related_group: { id: string; name: string } | null
  related_school: { id: string; name: string } | null
  related_instructor: { id: string; full_name: string } | null
}

interface Props {
  shortages: ShortageRow[]
  status: 'open' | 'handled' | 'all'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: '2-digit' })
}

function RelatedCell({ row }: { row: ShortageRow }) {
  if (row.related_lesson) {
    return (
      <Link href={`/lessons/${row.related_lesson.id}`} className="text-primary underline underline-offset-2">
        שיעור {formatDate(row.related_lesson.lesson_date)}
      </Link>
    )
  }
  if (row.related_group) return <span>{row.related_group.name}</span>
  if (row.related_school) return <span>{row.related_school.name}</span>
  if (row.related_instructor) return <span>{row.related_instructor.full_name}</span>
  return <span className="text-muted-foreground">—</span>
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: 'bg-orange-100 text-orange-700',
    handled: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-500',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {SHORTAGE_STATUS_LABELS[status] ?? status}
    </span>
  )
}

function HandleDialog({ id, onDone }: { id: string; onDone: () => void }) {
  const [notes, setNotes] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function submit() {
    startTransition(async () => {
      const result = await handleShortage(id, notes.trim() || null)
      if ('error' in result) { setError(result.error); return }
      onDone()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm space-y-4">
        <h3 className="font-semibold">סמן כטופל</h3>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">הערה (אופציונלי)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={submit}
            disabled={pending}
            className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {pending ? 'שומר...' : 'אשר טיפול'}
          </button>
          <button onClick={onDone} className="text-sm text-muted-foreground hover:text-foreground">
            ביטול
          </button>
        </div>
      </div>
    </div>
  )
}

export function ShortageList({ shortages, status }: Props) {
  const [handleId, setHandleId] = useState<string | null>(null)
  const [cancelling, startCancelTransition] = useTransition()
  const [actionError, setActionError] = useState<string | null>(null)

  function doCancel(id: string) {
    startCancelTransition(async () => {
      const result = await cancelShortage(id)
      if ('error' in result) setActionError(result.error)
    })
  }

  if (!shortages.length) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg px-5 py-4 text-sm text-green-800">
        {status === 'open' ? 'אין חוסרים פתוחים' : 'אין חוסרים להצגה'}
      </div>
    )
  }

  return (
    <>
      {handleId && <HandleDialog id={handleId} onDone={() => setHandleId(null)} />}
      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">סוג</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">תיאור</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">קשור ל</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">תאריך יעד</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">סטטוס</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {shortages.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium">{SHORTAGE_TYPE_LABELS[s.shortage_type] ?? s.shortage_type}</td>
                <td className="px-4 py-3 max-w-xs">
                  <p>{s.shortage_description}</p>
                  {s.notes && <p className="text-xs text-muted-foreground mt-0.5">{s.notes}</p>}
                </td>
                <td className="px-4 py-3"><RelatedCell row={s} /></td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.due_date ? formatDate(s.due_date) : '—'}
                </td>
                <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-3">
                  {s.status === 'open' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setHandleId(s.id)}
                        className="text-sm text-green-700 hover:underline"
                      >
                        טופל
                      </button>
                      <button
                        onClick={() => doCancel(s.id)}
                        disabled={cancelling}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        בטל
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
