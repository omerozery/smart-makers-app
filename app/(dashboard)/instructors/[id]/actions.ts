'use server'

import { revalidatePath } from 'next/cache'
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

type ActionResult = { error: string } | { success: true }

export async function updateInstructor(
  instructorId: string,
  data: SaveInstructorData
): Promise<ActionResult> {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)

  const { error } = await supabase
    .from('instructors')
    .update({
      full_name: data.full_name,
      phone: data.phone ?? null,
      lesson_rate: data.lesson_rate ?? null,
      kit_notes: data.kit_notes ?? null,
      notes: data.notes ?? null,
      updated_by: profileId,
    })
    .eq('id', instructorId)

  if (error) return { error: error.message }
  revalidatePath(`/instructors/${instructorId}`)
  return { success: true }
}
