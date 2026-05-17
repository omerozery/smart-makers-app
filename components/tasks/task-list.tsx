'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { TASK_TYPE_LABELS, TASK_STATUS_LABELS } from '@/lib/validations/task'
import { completeTask, cancelTask } from '@/app/(dashboard)/tasks/actions'

type TaskRow = {
  id: string
  title: string
  task_type: string
  notes: string | null
  due_date: string | null
  status: string
  created_at: string
  related_lesson: { id: string; lesson_date: string } | null
  related_group: { id: string; name: string } | null
  related_school: { id: string; name: string } | null
  related_instructor: { id: string; full_name: string } | null
}

interface Props {
  tasks: TaskRow[]
  status: 'open' | 'done' | 'all'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: '2-digit' })
}

function RelatedCell({ row }: { row: TaskRow }) {
  const parts: React.ReactNode[] = []
  if (row.related_lesson) {
    parts.push(
      <Link key="lesson" href={`/lessons/${row.related_lesson.id}`} className="text-primary underline underline-offset-2">
        שיעור {formatDate(row.related_lesson.lesson_date)}
      </Link>
    )
  }
  if (row.related_group) parts.push(<span key="group">{row.related_group.name}</span>)
  if (row.related_school) parts.push(<span key="school">{row.related_school.name}</span>)
  if (row.related_instructor) parts.push(<span key="instructor">{row.related_instructor.full_name}</span>)
  if (!parts.length) return <span className="text-muted-foreground">—</span>
  return <div className="space-y-0.5">{parts}</div>
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: 'bg-orange-100 text-orange-700',
    done: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-500',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {TASK_STATUS_LABELS[status] ?? status}
    </span>
  )
}

export function TaskList({ tasks, status }: Props) {
  const [pending, startTransition] = useTransition()
  const [actionError, setActionError] = useState<string | null>(null)

  function doComplete(id: string) {
    startTransition(async () => {
      const result = await completeTask(id)
      if ('error' in result) setActionError(result.error)
    })
  }

  function doCancel(id: string) {
    startTransition(async () => {
      const result = await cancelTask(id)
      if ('error' in result) setActionError(result.error)
    })
  }

  if (!tasks.length) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg px-5 py-4 text-sm text-green-800">
        {status === 'open' ? 'אין משימות פתוחות' : 'אין משימות להצגה'}
      </div>
    )
  }

  return (
    <>
      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">כותרת</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">סוג</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">קשור ל</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">תאריך יעד</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">סטטוס</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tasks.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium">
                  <p>{t.title}</p>
                  {t.notes && <p className="text-xs text-muted-foreground mt-0.5">{t.notes}</p>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{TASK_TYPE_LABELS[t.task_type] ?? t.task_type}</td>
                <td className="px-4 py-3"><RelatedCell row={t} /></td>
                <td className="px-4 py-3 text-muted-foreground">
                  {t.due_date ? formatDate(t.due_date) : '—'}
                </td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-3">
                  {t.status === 'open' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => doComplete(t.id)}
                        disabled={pending}
                        className="text-sm text-green-700 hover:underline disabled:opacity-50"
                      >
                        הושלם
                      </button>
                      <button
                        onClick={() => doCancel(t.id)}
                        disabled={pending}
                        className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
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
