import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SchoolForm } from '@/components/schools/school-form'
import { FIXED_DAY_LABELS, GROUP_STATUS_LABELS } from '@/lib/validations/group'
import { updateSchool } from './actions'
import type { School } from '@/lib/types'

function formatTime(time: string | null) {
  if (!time) return '—'
  return time.slice(0, 5)
}

export default async function SchoolPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: school, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error || !school) notFound()

  const { data: groups } = await supabase
    .from('groups')
    .select('id, name, fixed_day, fixed_hour, status, students_count, default_instructor:instructors!default_instructor_id(full_name)')
    .eq('school_id', id)
    .eq('is_active', true)
    .order('name')

  const typedSchool = school as unknown as School

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-1">
        <Link href="/schools" className="text-sm text-muted-foreground hover:text-foreground">
          ← בתי ספר
        </Link>
        <h1 className="text-xl font-bold">{typedSchool.name}</h1>
        <p className="text-sm text-muted-foreground">{typedSchool.city}</p>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-base font-semibold">פרטי בית הספר</h2>
        <SchoolForm
          school={typedSchool}
          onSave={updateSchool.bind(null, id)}
        />
      </div>

      {/* Groups */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">קבוצות</h2>
          <Link
            href={`/groups/new?school_id=${id}`}
            className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
          >
            + הוסף קבוצה
          </Link>
        </div>

        {!groups?.length ? (
          <p className="text-sm text-muted-foreground">אין קבוצות פעילות בבית ספר זה</p>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">שם</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">יום ושעה</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">מדריך</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">תלמידים</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">סטטוס</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {groups.map((group) => {
                  const instructor = group.default_instructor as unknown as { full_name: string } | null
                  const dayLabel = group.fixed_day ? (FIXED_DAY_LABELS[group.fixed_day] ?? group.fixed_day) : '—'
                  return (
                    <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{group.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {dayLabel} {formatTime(group.fixed_hour)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{instructor?.full_name ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{group.students_count ?? '—'}</td>
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
    </div>
  )
}
