import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { InstructorForm } from '@/components/instructors/instructor-form'
import { LessonStatusBadge } from '@/components/lessons/lesson-status-badge'
import { updateInstructor } from './actions'
import type { LessonStatus } from '@/lib/types'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('he-IL', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    year: '2-digit',
  })
}

function formatTime(time: string) {
  return time.slice(0, 5)
}

export default async function InstructorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: instructor, error } = await supabase
    .from('instructors')
    .select('id, full_name, phone, lesson_rate, kit_notes, notes, is_active')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error || !instructor) notFound()

  const { data: lessons } = await supabase
    .from('lessons')
    .select(`
      id, lesson_date, start_time, end_time,
      closed_at, cancelled_at, closed_with_exception,
      attendance_received, summary_received,
      group:groups(name),
      school:schools(name)
    `)
    .eq('actual_instructor_id', id)
    .eq('is_active', true)
    .order('lesson_date', { ascending: false })
    .limit(40)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-1">
        <Link href="/instructors" className="text-sm text-muted-foreground hover:text-foreground">
          ← מדריכים
        </Link>
        <h1 className="text-xl font-bold">{instructor.full_name}</h1>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-base font-semibold">פרטי מדריך</h2>
        <InstructorForm
          instructor={instructor}
          onSave={updateInstructor.bind(null, id)}
        />
      </div>

      {/* Lesson history */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">
          היסטוריית שיעורים
          {lessons?.length ? (
            <span className="mr-2 text-sm font-normal text-muted-foreground">({lessons.length} אחרונים)</span>
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
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">קבוצה</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">בית ספר</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">סטטוס</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {lessons.map((lesson) => {
                  const group = lesson.group as unknown as { name: string } | null
                  const school = lesson.school as unknown as { name: string } | null
                  const status: LessonStatus = lesson.cancelled_at
                    ? 'Cancelled'
                    : lesson.closed_at && lesson.closed_with_exception
                    ? 'Completed With Exception'
                    : lesson.closed_at
                    ? 'Completed'
                    : lesson.summary_received
                    ? 'Ready To Close'
                    : lesson.attendance_received
                    ? 'Awaiting Summary'
                    : 'Scheduled'
                  return (
                    <tr key={lesson.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">{formatDate(lesson.lesson_date)}</td>
                      <td className="px-4 py-3">{formatTime(lesson.start_time)}</td>
                      <td className="px-4 py-3">{group?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{school?.name ?? '—'}</td>
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
