import { z } from 'zod'

export const FIXED_DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const

export const FIXED_DAY_LABELS: Record<string, string> = {
  Sunday: 'ראשון',
  Monday: 'שני',
  Tuesday: 'שלישי',
  Wednesday: 'רביעי',
  Thursday: 'חמישי',
  Friday: 'שישי',
  Saturday: 'שבת',
}

export const GROUP_STATUS_LABELS: Record<string, string> = {
  active: 'פעיל',
  paused: 'מושהה',
  completed: 'הסתיים',
}

export const CreateGroupSchema = z
  .object({
    school_id: z.string().min(1, 'בית ספר נדרש'),
    name: z.string().min(1, 'שם נדרש'),
    fixed_day: z.enum(FIXED_DAYS, { message: 'יום נדרש' }),
    fixed_hour: z.string().min(1, 'שעה נדרשת'),
    start_date: z.string().min(1, 'תאריך התחלה נדרש'),
    end_date: z.string().min(1, 'תאריך סיום נדרש'),
    yearly_sessions_count: z.number({ message: 'מספר שיעורים נדרש' }).int().min(1, 'מספר שיעורים נדרש'),
    default_lesson_duration_minutes: z.number().int().min(1),
    default_instructor_id: z.string().min(1).nullable().optional(),
    students_count: z.number().int().min(0).nullable().optional(),
    syllabus_name: z.string().nullable().optional(),
  })
  .refine(
    (d) => !d.start_date || !d.end_date || d.end_date >= d.start_date,
    { message: 'תאריך סיום חייב להיות אחרי תאריך ההתחלה', path: ['end_date'] }
  )

export const SaveGroupSchema = z.object({
  name: z.string().min(1, 'שם נדרש'),
  status: z.enum(['active', 'paused', 'completed']),
  students_count: z.number().int().min(0).nullable().optional(),
  syllabus_name: z.string().nullable().optional(),
  default_instructor_id: z.string().min(1).nullable().optional(),
  default_lesson_duration_minutes: z.number().int().min(1),
})

export type CreateGroupData = z.infer<typeof CreateGroupSchema>
export type SaveGroupData = z.infer<typeof SaveGroupSchema>
