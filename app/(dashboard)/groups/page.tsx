import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FIXED_DAY_LABELS, GROUP_STATUS_LABELS } from '@/lib/validations/group'

function formatTime(time: string | null) {
  if (!time) return '—'
  return time.slice(0, 5)
}

export default async function GroupsPage() {
  const supabase = await createClient()

  const { data: groups } = await supabase
    .from('groups')
    .select(`
      id, name, fixed_day, fixed_hour, status,
      school:schools(name, city),
      default_instructor:instructors!default_instructor_id(full_name),
      lessons(id)
    `)
    .eq('is_active', true)
    .order('name')

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">קבוצות</h1>
        <Link
          href="/groups/new"
          className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          + הוסף קבוצה
        </Link>
      </div>

      {!groups?.length ? (
        <p className="text-sm text-muted-foreground">אין קבוצות פעילות</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">שם</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">בית ספר</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">יום ושעה</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">מדריך</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">שיעורים</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">סטטוס</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {groups.map((group) => {
                const school = group.school as unknown as { name: string; city: string } | null
                const instructor = group.default_instructor as unknown as { full_name: string } | null
                const lessonCount = Array.isArray(group.lessons) ? group.lessons.length : 0
                const dayLabel = group.fixed_day ? (FIXED_DAY_LABELS[group.fixed_day] ?? group.fixed_day) : '—'
                return (
                  <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{group.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{school?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {dayLabel} {formatTime(group.fixed_hour)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{instructor?.full_name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lessonCount}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {GROUP_STATUS_LABELS[group.status] ?? group.status}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/groups/${group.id}`}
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
  )
}
