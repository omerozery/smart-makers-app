'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { SaveLessonData, AddShortageData } from '@/lib/validations/lesson'

async function getProfileId(supabase: SupabaseClient): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')
  return profile.id
}

type ActionResult = { error: string } | { success: true }

export async function saveLesson(lessonId: string, data: SaveLessonData): Promise<ActionResult> {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)

  const { error } = await supabase
    .from('lessons')
    .update({ ...data, updated_by: profileId })
    .eq('id', lessonId)

  if (error) return { error: error.message }
  revalidatePath(`/lessons/${lessonId}`)
  return { success: true }
}

export async function closeLesson(lessonId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)

  const { error } = await supabase
    .from('lessons')
    .update({
      closed_at: new Date().toISOString(),
      closed_by: profileId,
      updated_by: profileId,
    })
    .eq('id', lessonId)

  if (error) return { error: error.message }
  revalidatePath(`/lessons/${lessonId}`)
  return { success: true }
}

export async function closeLessonWithException(
  lessonId: string,
  exceptionReason: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)

  const { error } = await supabase
    .from('lessons')
    .update({
      closed_at: new Date().toISOString(),
      closed_by: profileId,
      closed_with_exception: true,
      exception_reason: exceptionReason,
      updated_by: profileId,
    })
    .eq('id', lessonId)

  if (error) return { error: error.message }
  revalidatePath(`/lessons/${lessonId}`)
  return { success: true }
}

export async function cancelLesson(
  lessonId: string,
  cancelledReason: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)

  const { error } = await supabase
    .from('lessons')
    .update({
      cancelled_at: new Date().toISOString(),
      cancelled_by: profileId,
      cancelled_reason: cancelledReason,
      updated_by: profileId,
    })
    .eq('id', lessonId)

  if (error) return { error: error.message }
  revalidatePath(`/lessons/${lessonId}`)
  return { success: true }
}

export async function replaceInstructor(
  lessonId: string,
  instructorId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)

  const { error } = await supabase
    .from('lessons')
    .update({
      actual_instructor_id: instructorId,
      updated_by: profileId,
    })
    .eq('id', lessonId)

  if (error) return { error: error.message }
  revalidatePath(`/lessons/${lessonId}`)
  return { success: true }
}

export async function addShortage(
  lessonId: string,
  groupId: string,
  schoolId: string,
  data: AddShortageData
): Promise<ActionResult> {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)

  const { error } = await supabase.from('shortages').insert({
    related_lesson_id: lessonId,
    related_group_id: groupId,
    related_school_id: schoolId,
    shortage_type: data.shortage_type,
    shortage_description: data.shortage_description,
    due_date: data.due_date || null,
    status: 'open',
    updated_by: profileId,
  })

  if (error) return { error: error.message }
  revalidatePath(`/lessons/${lessonId}`)
  return { success: true }
}
