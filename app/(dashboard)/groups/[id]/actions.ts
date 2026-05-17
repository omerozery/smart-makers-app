'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { SaveGroupData } from '@/lib/validations/group'

async function getProfileId(supabase: SupabaseClient): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase
    .from('profiles').select('id').eq('auth_user_id', user.id).single()
  if (!profile) throw new Error('Profile not found')
  return profile.id
}

type ActionResult = { error: string } | { success: true }

export async function updateGroup(groupId: string, data: SaveGroupData): Promise<ActionResult> {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)

  const { error } = await supabase
    .from('groups')
    .update({ ...data, updated_by: profileId })
    .eq('id', groupId)

  if (error) return { error: error.message }
  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}
