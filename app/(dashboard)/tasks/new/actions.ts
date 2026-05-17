'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateTaskData } from '@/lib/validations/task'

async function getProfileId(supabase: SupabaseClient): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase
    .from('profiles').select('id').eq('auth_user_id', user.id).single()
  if (!profile) throw new Error('Profile not found')
  return profile.id
}

export async function createTask(
  data: CreateTaskData
): Promise<{ error: string } | { id: string }> {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)

  const { data: task, error } = await supabase
    .from('operational_tasks')
    .insert({
      title: data.title,
      task_type: data.task_type,
      notes: data.notes ?? null,
      due_date: data.due_date ?? null,
      related_group_id: data.related_group_id ?? null,
      related_school_id: data.related_school_id ?? null,
      related_instructor_id: data.related_instructor_id ?? null,
      status: 'open',
      updated_by: profileId,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/tasks')
  return { id: task.id }
}
