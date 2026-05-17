import { z } from 'zod'

export const SaveLessonSchema = z.object({
  actual_instructor_id: z.string().min(1).nullable().optional(),
  attendance_received: z.boolean(),
  attendance_count: z.number().int().min(0).nullable().optional(),
  attendance_notes: z.string().nullable().optional(),
  summary_received: z.boolean(),
  actual_model_id: z.string().min(1).nullable().optional(),
  actual_model_other_text: z.string().nullable().optional(),
  actual_lesson_number: z.number().int().min(1).nullable().optional(),
  actual_stage_number: z.number().int().min(1).nullable().optional(),
  student_notes: z.string().nullable().optional(),
  all_students_aligned: z.boolean().nullable().optional(),
  alignment_notes: z.string().nullable().optional(),
  manager_notes: z.string().nullable().optional(),
})

export const CloseLessonWithExceptionSchema = z.object({
  exception_reason: z.string().min(1, 'נדרשת סיבת חריגה'),
})

export const CancelLessonSchema = z.object({
  cancelled_reason: z.string().min(1, 'נדרשת סיבת ביטול'),
})

export const AddShortageSchema = z.object({
  shortage_type: z.enum(['instructor_kit', 'school_materials', 'group_materials', 'other']),
  shortage_description: z.string().min(1, 'נדרש תיאור חוסר'),
  due_date: z.string().nullable().optional(),
})

export type SaveLessonData = z.infer<typeof SaveLessonSchema>
export type AddShortageData = z.infer<typeof AddShortageSchema>
