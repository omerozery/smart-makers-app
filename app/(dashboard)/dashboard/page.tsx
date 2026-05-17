import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LessonStatusBadge } from '@/components/lessons/lesson-status-badge'
import type { LessonStatus } from '@/lib/types'

function formatTime(time: string) {
  return time.slice(0, 5)
}

const ITEM_TYPE_LABELS: Record<string, string> = {
  lesson_awaiting_attendance: 'חסרה נוכחות',
  lesson_awaiting_summary: 'חסר סיכום',
  lesson_ready_to_close: 'מוכן לסגירה',
  lesson_closed_with_exception: 'חריגה לא פתורה',
  shortage_open: 'חוסר פתוח',
  task_open: 'משימה פתוחה',
  group_progress_review: 'סקירת התקדמות',
  school_material_shortage: 'חוסר חומרים',
}

const ITEM_TYPE_COLORS: Record<string, string> = {
  lesson_awaiting_attendance: 'bg-red-100 text-red-800 border-red-200',
  lesson_awaiting_summary: 'bg-orange-100 text-orange-800 border-orange-200',
  lesson_ready_to_close: 'bg-blue-100 text-blue-800 border-blue-200',
  lesson_closed_with_exception: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  shortage_open: 'bg-purple-100 text-purple-800 border-purple-200',
  task_open: 'bg-gray-100 text-gray-800 border-gray-200',
  group_progress_review: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  school_material_shortage: 'bg-pink-100 text-pink-800 border-pink-200',
}

type AttentionItem = {
  item_type: string
  priority: number
  title: string
  description: string
  related_lesson_id: string | null
  related_group_id: string | null
  related_school_id: string | null
  related_instructor_id: string | null
  due_date: string | null
  created_at: string
}

type TodayLesson = {
  lesson_id: string
  lesson_date: string
  start_time: string
  end_time: string
  school_name: string
  city: string | null
  group_name: string
  instructor_name: string | null
  computed_status: string
  attendance_received: boolean
  summary_received: boolean
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: todayLessons }, { data: attentionItems }] = await Promise.all([
    supabase.from('v_today_lessons').select('*').order('start_time'),
    supabase.from('v_attention_queue').select('*'),
  ])

  const lessons = (todayLessons ?? []) as TodayLesson[]
  const queue = (attentionItems ?? []) as AttentionItem[]

  const upcoming = lessons.filter((l) =>
    ['Scheduled'].includes(l.computed_status)
  )
  const active = lessons.filter((l) =>
    ['Awaiting Attendance', 'Awaiting Summary', 'Ready To Close'].includes(l.computed_status)
  )
  const done = lessons.filter((l) =>
    ['Completed', 'Completed With Exception', 'Cancelled'].includes(l.computed_status)
  )

  // Group attention items by type for the badge counts
  const queueByType = queue.reduce<Record<string, AttentionItem[]>>((acc, item) => {
    acc[item.item_type] = acc[item.item_type] ?? []
    acc[item.item_type].push(item)
    return acc
  }, {})

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">דשבורד יומי</h1>

      {/* Section A — Today Timeline */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold">לוח זמנים היום</h2>

        {lessons.length === 0 && (
          <p className="text-sm text-muted-foreground">אין שיעורים מתוכננים להיום</p>
        )}

        {active.length > 0 && (
          <TimelineGroup title="פעיל עכשיו" lessons={active} />
        )}

        {upcoming.length > 0 && (
          <TimelineGroup title="הבא" lessons={upcoming} />
        )}

        {done.length > 0 && (
          <TimelineGroup title="הסתיים" lessons={done} muted />
        )}
      </section>

      {/* Section B — Attention Queue */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          תור טיפול
          {queue.length > 0 && (
            <span className="mr-2 text-sm font-normal text-muted-foreground">
              ({queue.length} פריטים)
            </span>
          )}
        </h2>

        {queue.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg px-5 py-4 text-sm text-green-800">
            אין פריטים הדורשים טיפול — הכל תקין
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(queueByType)
              .sort(([, a], [, b]) => a[0].priority - b[0].priority)
              .map(([type, items]) => (
                <AttentionGroup key={type} type={type} items={items} />
              ))}
          </div>
        )}
      </section>
    </div>
  )
}

function TimelineGroup({
  title,
  lessons,
  muted = false,
}: {
  title: string
  lessons: TodayLesson[]
  muted?: boolean
}) {
  return (
    <div>
      <h3 className={`text-sm font-medium mb-2 ${muted ? 'text-muted-foreground' : 'text-foreground'}`}>
        {title}
      </h3>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">שעה</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">בית ספר</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">קבוצה</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">מדריך</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">סטטוס</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">נוכחות</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">סיכום</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {lessons.map((lesson) => (
              <tr
                key={lesson.lesson_id}
                className={`transition-colors ${muted ? 'text-muted-foreground' : 'hover:bg-gray-50'}`}
              >
                <td className="px-4 py-3">
                  {formatTime(lesson.start_time)}–{formatTime(lesson.end_time)}
                </td>
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
    </div>
  )
}

function AttentionGroup({ type, items }: { type: string; items: AttentionItem[] }) {
  const label = ITEM_TYPE_LABELS[type] ?? type
  const colorClass = ITEM_TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-800 border-gray-200'

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${colorClass}`}>
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs font-semibold bg-white/60 rounded-full px-2 py-0.5">
          {items.length}
        </span>
      </div>
      <ul className="divide-y">
        {items.map((item, i) => (
          <li key={i} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50">
            <div className="space-y-0.5">
              <p className="font-medium">{item.title}</p>
              <p className="text-muted-foreground text-xs">{item.description}</p>
            </div>
            {item.related_lesson_id && (
              <Link
                href={`/lessons/${item.related_lesson_id}`}
                className="text-primary underline underline-offset-2 text-sm shrink-0 mr-4"
              >
                פתח שיעור
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
