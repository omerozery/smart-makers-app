import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LessonStatusBadge } from '@/components/lessons/lesson-status-badge'
import { LessonForm } from '@/components/lessons/lesson-form'
import type { LessonWithRelations, LessonStatus } from '@/lib/types'

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: lesson, error } = await supabase
    .from('lessons')
    .select(`
      *,
      school:schools(id, name, city),
      group:groups(id, name),
      planned_instructor:instructors!planned_instructor_id(id, full_name),
      actual_instructor:instructors!actual_instructor_id(id, full_name),
      planned_model:models!planned_model_id(id, model_name, expected_lessons_count, total_stages),
      actual_model:models!actual_model_id(id, model_name),
      shortages(id, shortage_type, shortage_description, due_date, status, notes)
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error || !lesson) notFound()

  // Compute status via DB RPC to stay authoritative on timezone
  const { data: statusData } = await supabase.rpc('compute_lesson_status', {
    p_lesson_date: lesson.lesson_date,
    p_start_time: lesson.start_time,
    p_end_time: lesson.end_time,
    p_cancelled_at: lesson.cancelled_at,
    p_closed_at: lesson.closed_at,
    p_closed_exception: lesson.closed_with_exception,
    p_attendance_recv: lesson.attendance_received,
    p_attendance_count: lesson.attendance_count,
    p_summary_recv: lesson.summary_received,
    p_actual_model_id: lesson.actual_model_id,
    p_actual_model_other: lesson.actual_model_other_text,
    p_actual_lesson_number: lesson.actual_lesson_number,
    p_actual_stage_number: lesson.actual_stage_number,
  })

  const status = (statusData ?? 'Scheduled') as LessonStatus

  // Fetch instructors and models for dropdowns
  const [{ data: instructors }, { data: models }] = await Promise.all([
    supabase.from('instructors').select('id, full_name, phone, lesson_rate, is_active').eq('is_active', true).order('full_name'),
    supabase.from('models').select('id, model_name, expected_lessons_count, total_stages, is_active').eq('is_active', true).order('model_name'),
  ])

  const typedLesson = lesson as unknown as LessonWithRelations

  const dateFormatted = new Date(lesson.lesson_date).toLocaleDateString('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link href="/lessons" className="text-sm text-muted-foreground hover:text-foreground">
            ← שיעורים
          </Link>
          <h1 className="text-xl font-bold">
            {typedLesson.group.name} — {typedLesson.school.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            {dateFormatted} | {lesson.start_time.slice(0, 5)} – {lesson.end_time.slice(0, 5)}
          </p>
        </div>
        <LessonStatusBadge status={status} />
      </div>

      <LessonForm
        lesson={typedLesson}
        status={status}
        instructors={instructors ?? []}
        models={models ?? []}
      />
    </div>
  )
}
