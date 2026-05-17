import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TaskCreateForm } from '@/components/tasks/task-create-form'
import { createTask } from './actions'

export default async function NewTaskPage() {
  const supabase = await createClient()

  const [{ data: groups }, { data: schools }, { data: instructors }] = await Promise.all([
    supabase
      .from('groups')
      .select('id, name, school:schools(name)')
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('schools')
      .select('id, name, city')
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('instructors')
      .select('id, full_name, phone, lesson_rate, is_active')
      .eq('is_active', true)
      .order('full_name'),
  ])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <Link href="/tasks" className="text-sm text-muted-foreground hover:text-foreground">
          ← משימות
        </Link>
        <h1 className="text-xl font-bold">משימה חדשה</h1>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <TaskCreateForm
          groups={(groups ?? []) as unknown as Parameters<typeof TaskCreateForm>[0]['groups']}
          schools={schools ?? []}
          instructors={instructors ?? []}
          onCreate={createTask}
        />
      </div>
    </div>
  )
}
