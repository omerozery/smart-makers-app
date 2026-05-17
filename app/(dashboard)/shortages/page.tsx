import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ShortageList } from '@/components/shortages/shortage-list'

type StatusFilter = 'open' | 'handled' | 'all'

export default async function ShortagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: rawStatus } = await searchParams
  const status: StatusFilter =
    rawStatus === 'handled' ? 'handled' : rawStatus === 'all' ? 'all' : 'open'

  const supabase = await createClient()

  let query = supabase
    .from('shortages')
    .select(`
      id, shortage_type, shortage_description, due_date, status, notes, handled_at, created_at,
      related_lesson:lessons(id, lesson_date),
      related_group:groups(id, name),
      related_school:schools(id, name),
      related_instructor:instructors(id, full_name)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(100)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: shortages } = await query

  const tabs: { label: string; value: StatusFilter }[] = [
    { label: 'פתוחים', value: 'open' },
    { label: 'טופלו', value: 'handled' },
    { label: 'הכל', value: 'all' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">חוסרים</h1>

      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/shortages${tab.value === 'open' ? '' : `?status=${tab.value}`}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              status === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <ShortageList shortages={(shortages ?? []) as unknown as Parameters<typeof ShortageList>[0]['shortages']} status={status} />
    </div>
  )
}
