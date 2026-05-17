import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { GroupEditForm } from '@/components/groups/group-edit-form'
import { LessonStatusBadge } from '@/components/lessons/lesson-status-badge'
import { FIXED_DAY_LABELS } from '@/lib/validations/group'
import { updateGroup } from './actions'
import type { GroupWithRelations, LessonStatus } from '@/lib/types'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('he-IL', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
  })
}

function formatTime(time: string) {
  return time.slice(0, 5)
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: group, error } = await supabase
    .from('groups')
    .select(`
      *,
      school:schools(id, name, city),
      default_instructor:instructors!default_instructor_id(id, full_name)
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error || !group) notFound()

  const [{ data: instructors }, { data: lessons }] = await Promise.all([
    supabase.from('instructors').select('id, full_name, phone, lesson_rate, is_active').eq('is_active', true).order('full_name'),
    supabase
      .from('lessons')
      .select('id, lesson_date, start_time, end_time, closed_at, cancelled_at, attendance_received, summary_received, actual_instructor:instructors!actual_instructor_id(full_name)')
      .eq('group_id', id)
      .eq('is_active', true)
      .order('lesson_date', { ascending: false })
      .limit(50),
  ])

  const typedGroup = group as unknown as GroupWithRelations
  const dayLabel = typedGroup.fixed_day ? (FIXED_DAY_LABELS[typedGroup.fixed_day] ?? typedGroup.fixed_day) : null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-1">
        <Link href="/groups" className="text-sm text-muted-foreground hover:text-foreground">
          ← קבוצות
        </Link>
        <h1 className="text-xl font-bold">{typedGroup.name}</h1>
        <p className="text-sm text-muted-foreground">
          {typedGroup.school.name} — {typedGroup.school.city}
          {dayLabel && ` | יום ${dayLabel} ${typedGroup.fixed_hour ? formatTime(typedGroup.fixed_hour) : ''}`}
        </p>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-base font-semibold">פרטי הקבוצה</h2>
        <GroupEditForm
          group={typedGroup}
          instructors={instructors ?? []}
          onSave={updateGroup.bind(null, id)}
        />
      </div>

      {/* Lessons list */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">
          שיעורים
          {lessons?.length ? (
            <span className="mr-2 text-sm font-normal text-muted-foreground">({lessons.length})</span>
          ) : null}
        </h2>

        {!lessons?.length ? (
          <p className="text-sm text-muted-foreground">אין שיעורים</p>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">תאריך</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">שעה</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">מדריך</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">נוכחות</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">סיכום</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">סטטוס</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {lessons.map((lesson) => {
                  const instructor = lesson.actual_instructor as unknown as { full_name: string } | null
                  const status: LessonStatus = lesson.cancelled_at
                    ? 'Cancelled'
                    : lesson.closed_at
                    ? 'Completed'
                    : 'Scheduled'
                  return (
                    <tr key={lesson.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">{formatDate(lesson.lesson_date)}</td>
                      <td className="px-4 py-3">{formatTime(lesson.start_time)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{instructor?.full_name ?? '—'}</td>
                      <td className="px-4 py-3">{lesson.attendance_received ? '✓' : '—'}</td>
                      <td className="px-4 py-3">{lesson.summary_received ? '✓' : '—'}</td>
                      <td className="px-4 py-3">
                        <LessonStatusBadge status={status} />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/lessons/${lesson.id}`}
                          className="text-primary underline underline-offset-2"
                        >
                          פתח
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
