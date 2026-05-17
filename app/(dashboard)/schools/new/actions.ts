'use server'

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

export async function createSchool(
  data: SaveSchoolData
): Promise<{ error: string } | { id: string }> {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)

  const { data: school, error } = await supabase
    .from('schools')
    .insert({ ...data, updated_by: profileId })
    .select('id')
    .single()

  if (error) return { error: error.message }
  return { id: school.id }
}
