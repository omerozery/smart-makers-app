import { z } from 'zod'

export const SaveSchoolSchema = z.object({
  name: z.string().min(1, 'שם נדרש'),
  city: z.string().min(1, 'עיר נדרשת'),
  address: z.string().nullable().optional(),
  materials_notes: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type SaveSchoolData = z.infer<typeof SaveSchoolSchema>
