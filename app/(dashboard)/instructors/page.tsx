import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PayrollDateForm } from '@/components/instructors/payroll-date-form'

function currentMonthRange() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  return { from, to }
}

function formatCurrency(n: number | null) {
  if (n == null) return '—'
  return `₪${n.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export default async function InstructorsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const params = await searchParams
  const defaults = currentMonthRange()
  const from = params.from ?? defaults.from
  const to = params.to ?? defaults.to

  const supabase = await createClient()

  const [{ data: instructors }, { data: summary }] = await Promise.all([
    supabase
      .from('instructors')
      .select('id, full_name, phone, lesson_rate, kit_notes, notes, is_active')
      .eq('is_active', true)
      .order('full_name'),
    supabase.rpc('get_instructor_lesson_summary', {
      from_date: from,
      to_date: to,
    }),
  ])

  const summaryMap = new Map(
    (summary ?? []).map((row: { instructor_id: string; lesson_count: number; estimated_total: number }) => [
      row.instructor_id,
      row,
    ])
  )

  const totalLessons = (summary ?? []).reduce(
    (sum: number, row: { lesson_count: number }) => sum + Number(row.lesson_count),
    0
  )
  const totalPay = (summary ?? []).reduce(
    (sum: number, row: { estimated_total: number }) => sum + Number(row.estimated_total),
    0
  )

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">מדריכים</h1>
        <Link
          href="/instructors/new"
          className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          + הוסף מדריך
        </Link>
      </div>

      {/* Instructor list */}
      {!instructors?.length ? (
        <p className="text-sm text-muted-foreground">אין מדריכים פעילים</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">שם</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">טלפון</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">תעריף לשיעור</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {instructors.map((instructor) => (
                <tr key={instructor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{instructor.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground" dir="ltr">{instructor.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {instructor.lesson_rate != null ? formatCurrency(instructor.lesson_rate) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/instructors/${instructor.id}`}
                      className="text-primary underline underline-offset-2"
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

      {/* Payroll summary */}
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-semibold">סיכום שיעורים</h2>
          <PayrollDateForm defaultFrom={from} defaultTo={to} />
        </div>

        {!summary?.length ? (
          <p className="text-sm text-muted-foreground">אין נתונים לטווח זה</p>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">מדריך</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">שיעורים</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">תעריף</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">סה״כ משוער</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(summary as Array<{ instructor_id: string; instructor_name: string; lesson_rate: number | null; lesson_count: number; estimated_total: number }>).map((row) => (
                  <tr
                    key={row.instructor_id}
                    className={`transition-colors ${Number(row.lesson_count) === 0 ? 'text-muted-foreground' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/instructors/${row.instructor_id}`}
                        className="hover:underline"
                      >
                        {row.instructor_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{Number(row.lesson_count)}</td>
                    <td className="px-4 py-3">{formatCurrency(row.lesson_rate)}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(Number(row.estimated_total))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t bg-gray-50">
                <tr>
                  <td className="px-4 py-3 font-semibold">סך הכל</td>
                  <td className="px-4 py-3 font-semibold">{totalLessons}</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(totalPay)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
