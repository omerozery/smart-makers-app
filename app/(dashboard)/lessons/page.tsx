import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LessonStatusBadge } from '@/components/lessons/lesson-status-badge'
import type { LessonStatus } from '@/lib/types'

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

export default async function LessonsPage() {
  const supabase = await createClient()

  // Today's lessons with computed status
  const { data: todayLessons } = await supabase
    .from('v_today_lessons')
    .select('*')
    .order('start_time')

  // Recent unclosed lessons (last 14 days, excluding today)
  const today = new Date().toISOString().split('T')[0]
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const { data: recentLessons } = await supabase
    .from('lessons')
    .select(`
      id, lesson_date, start_time, end_time,
      school:schools(name),
      group:groups(name),
      instructor:instructors!actual_instructor_id(full_name),
      planned_instructor:instructors!planned_instructor_id(full_name),
      closed_at, cancelled_at, attendance_received, summary_received
    `)
    .gte('lesson_date', twoWeeksAgo)
    .lt('lesson_date', today)
    .is('closed_at', null)
    .is('cancelled_at', null)
    .order('lesson_date', { ascending: false })
    .limit(30)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">שיעורים</h1>

      {/* Today */}
      <section>
        <h2 className="text-lg font-semibold mb-3">היום</h2>
        {!todayLessons?.length ? (
          <p className="text-muted-foreground text-sm">אין שיעורים היום</p>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">שעה</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">בית ספר</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">קבוצה</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">מדריך</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">סטטוס</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">נוכחות</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">סיכום</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {todayLessons.map((lesson) => (
                  <tr key={lesson.lesson_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">{formatTime(lesson.start_time)}</td>
                    <td className="px-4 py-3">{lesson.school_name}</td>
                    <td className="px-4 py-3">{lesson.group_name}</td>
                    <td className="px-4 py-3">{lesson.instructor_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <LessonStatusBadge status={lesson.computed_status as LessonStatus} />
                    </td>
                    <td className="px-4 py-3">{lesson.attendance_received ? '✓' : '—'}</td>
                    <td className="px-4 py-3">{lesson.summary_received ? '✓' : '—'}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/lessons/${lesson.lesson_id}`}
                        className="text-primary underline underline-offset-2 text-sm"
                      >
                        פתח
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent unclosed */}
      {!!recentLessons?.length && (
        <section>
          <h2 className="text-lg font-semibold mb-3">ממתינים לטיפול (14 יום אחרונים)</h2>
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">תאריך</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">שעה</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">בית ספר</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">קבוצה</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">נוכחות</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">סיכום</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentLessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">{formatDate(lesson.lesson_date)}</td>
                    <td className="px-4 py-3">{formatTime(lesson.start_time)}</td>
                    <td className="px-4 py-3">{(lesson.school as unknown as { name: string })?.name}</td>
                    <td className="px-4 py-3">{(lesson.group as unknown as { name: string })?.name}</td>
                    <td className="px-4 py-3">{lesson.attendance_received ? '✓' : '—'}</td>
                    <td className="px-4 py-3">{lesson.summary_received ? '✓' : '—'}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/lessons/${lesson.id}`}
                        className="text-primary underline underline-offset-2 text-sm"
                      >
                        פתח
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
