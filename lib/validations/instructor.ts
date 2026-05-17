import { z } from 'zod'

export const SaveInstructorSchema = z.object({
  full_name: z.string().min(1, 'שם נדרש'),
  phone: z.string().nullable().optional(),
  lesson_rate: z.number().min(0).nullable().optional(),
  kit_notes: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type SaveInstructorData = z.infer<typeof SaveInstructorSchema>
