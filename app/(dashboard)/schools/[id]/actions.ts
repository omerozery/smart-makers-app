'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { SaveSchoolData } from '@/lib/validations/school'

async function getProfileId(supabase: SupabaseClient): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase
    .from('profiles').select('id').eq('auth_user_id', user.id).single()
  if (!profile) throw new Error('Profile not found')
  return profile.id
}

type ActionResult = { error: string } | { success: true }

export async function updateSchool(schoolId: string, data: SaveSchoolData): Promise<ActionResult> {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)

  const { error } = await supabase
    .from('schools')
    .update({ ...data, updated_by: profileId })
    .eq('id', schoolId)

  if (error) return { error: error.message }
  revalidatePath(`/schools/${schoolId}`)
  return { success: true }
}
