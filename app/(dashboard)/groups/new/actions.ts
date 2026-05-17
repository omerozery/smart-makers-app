'use server'

import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateGroupData } from '@/lib/validations/group'

async function getProfileId(supabase: SupabaseClient): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase
    .from('profiles').select('id').eq('auth_user_id', user.id).single()
  if (!profile) throw new Error('Profile not found')
  return profile.id
}

export async function createGroup(
  data: CreateGroupData
): Promise<{ error: string } | { id: string; lessonsCreated: number }> {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)

  const { data: group, error } = await supabase
    .from('groups')
    .insert({
      school_id: data.school_id,
      name: data.name,
      fixed_day: data.fixed_day,
      fixed_hour: data.fixed_hour,
      start_date: data.start_date,
      end_date: data.end_date,
      yearly_sessions_count: data.yearly_sessions_count,
      default_lesson_duration_minutes: data.default_lesson_duration_minutes,
      default_instructor_id: data.default_instructor_id ?? null,
      students_count: data.students_count ?? null,
      syllabus_name: data.syllabus_name ?? null,
      updated_by: profileId,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  const { data: lessonsCreated, error: skeletonError } = await supabase.rpc(
    'generate_group_lesson_skeleton',
    { p_group_id: group.id, p_owner_id: profileId }
  )

  if (skeletonError) return { error: `הקבוצה נוצרה אך יצירת השיעורים נכשלה: ${skeletonError.message}` }

  return { id: group.id, lessonsCreated: lessonsCreated ?? 0 }
}
