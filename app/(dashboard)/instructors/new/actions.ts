'use server'

import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { SaveInstructorData } from '@/lib/validations/instructor'

async function getProfileId(supabase: SupabaseClient): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase
    .from('profiles').select('id').eq('auth_user_id', user.id).single()
  if (!profile) throw new Error('Profile not found')
  return profile.id
}

export async function createInstructor(
  data: SaveInstructorData
): Promise<{ error: string } | { id: string }> {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)

  const { data: instructor, error } = await supabase
    .from('instructors')
    .insert({
      full_name: data.full_name,
      phone: data.phone ?? null,
      lesson_rate: data.lesson_rate ?? null,
      kit_notes: data.kit_notes ?? null,
      notes: data.notes ?? null,
      updated_by: profileId,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  return { id: instructor.id }
}
