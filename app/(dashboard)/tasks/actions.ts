'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

async function getProfileId(supabase: SupabaseClient): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase
    .from('profiles').select('id').eq('auth_user_id', user.id).single()
  if (!profile) throw new Error('Profile not found')
  return profile.id
}

type ActionResult = { error: string } | { success: true }

export async function completeTask(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)

  const { error } = await supabase
    .from('operational_tasks')
    .update({
      status: 'done',
      completed_at: new Date().toISOString(),
      completed_by: profileId,
      updated_by: profileId,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/tasks')
  return { success: true }
}

export async function cancelTask(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)

  const { error } = await supabase
    .from('operational_tasks')
    .update({ status: 'cancelled', updated_by: profileId })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/tasks')
  return { success: true }
}
