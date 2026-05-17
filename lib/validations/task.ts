import { z } from 'zod'

export const TASK_TYPES = [
  'materials',
  'instructor_followup',
  'school_followup',
  'syllabus_review',
  'missing_information',
  'other',
] as const

export const TASK_TYPE_LABELS: Record<string, string> = {
  materials: 'חומרים',
  instructor_followup: 'מעקב מדריך',
  school_followup: 'מעקב בית ספר',
  syllabus_review: 'סקירת סילבוס',
  missing_information: 'מידע חסר',
  other: 'אחר',
}

export const TASK_STATUS_LABELS: Record<string, string> = {
  open: 'פתוח',
  done: 'הושלם',
  cancelled: 'בוטל',
}

export const SHORTAGE_STATUS_LABELS: Record<string, string> = {
  open: 'פתוח',
  handled: 'טופל',
  cancelled: 'בוטל',
}

export const CreateTaskSchema = z
  .object({
    title: z.string().min(1, 'כותרת נדרשת'),
    task_type: z.enum(TASK_TYPES, { message: 'סוג נדרש' }),
    notes: z.string().nullable().optional(),
    due_date: z.string().nullable().optional(),
    related_group_id: z.string().min(1).nullable().optional(),
    related_school_id: z.string().min(1).nullable().optional(),
    related_instructor_id: z.string().min(1).nullable().optional(),
  })
  .refine(
    (d) => d.related_group_id || d.related_school_id || d.related_instructor_id,
    { message: 'נדרש לבחור קבוצה, בית ספר, או מדריך' }
  )

export type CreateTaskData = z.infer<typeof CreateTaskSchema>
