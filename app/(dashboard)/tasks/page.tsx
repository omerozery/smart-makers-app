import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TaskList } from '@/components/tasks/task-list'

type StatusFilter = 'open' | 'done' | 'all'

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: rawStatus } = await searchParams
  const status: StatusFilter =
    rawStatus === 'done' ? 'done' : rawStatus === 'all' ? 'all' : 'open'

  const supabase = await createClient()

  let query = supabase
    .from('operational_tasks')
    .select(`
      id, title, task_type, notes, due_date, status, created_at,
      related_lesson:lessons(id, lesson_date),
      related_group:groups(id, name),
      related_school:schools(id, name),
      related_instructor:instructors(id, full_name)
    `)
    .eq('is_active', true)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(100)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: tasks } = await query

  const tabs: { label: string; value: StatusFilter }[] = [
    { label: 'פתוחות', value: 'open' },
    { label: 'הושלמו', value: 'done' },
    { label: 'הכל', value: 'all' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">משימות</h1>
        <Link
          href="/tasks/new"
          className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          + משימה חדשה
        </Link>
      </div>

      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/tasks${tab.value === 'open' ? '' : `?status=${tab.value}`}`}
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

      <TaskList tasks={(tasks ?? []) as unknown as Parameters<typeof TaskList>[0]['tasks']} status={status} />
    </div>
  )
}
