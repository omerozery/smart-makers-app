import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { GroupCreateForm } from '@/components/groups/group-create-form'
import { createGroup } from './actions'

export default async function NewGroupPage({
  searchParams,
}: {
  searchParams: Promise<{ school_id?: string }>
}) {
  const { school_id } = await searchParams
  const supabase = await createClient()

  const [{ data: schools }, { data: instructors }] = await Promise.all([
    supabase.from('schools').select('id, name, city').eq('is_active', true).order('name'),
    supabase.from('instructors').select('id, full_name, phone, lesson_rate, is_active').eq('is_active', true).order('full_name'),
  ])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <Link href="/groups" className="text-sm text-muted-foreground hover:text-foreground">
          ← קבוצות
        </Link>
        <h1 className="text-xl font-bold">קבוצה חדשה</h1>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <GroupCreateForm
          schools={schools ?? []}
          instructors={instructors ?? []}
          defaultSchoolId={school_id}
          onCreate={createGroup}
        />
      </div>
    </div>
  )
}
