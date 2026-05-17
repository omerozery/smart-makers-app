'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SaveInstructorSchema, type SaveInstructorData } from '@/lib/validations/instructor'

interface Instructor {
  id: string
  full_name: string
  phone: string | null
  lesson_rate: number | null
  kit_notes: string | null
  notes: string | null
}

interface Props {
  instructor?: Instructor
  onSave: (data: SaveInstructorData) => Promise<{ error: string } | { id: string } | { success: true }>
}

export function InstructorForm({ instructor, onSave }: Props) {
  const router = useRouter()
  const isEdit = !!instructor

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setError,
    reset,
  } = useForm<SaveInstructorData>({
    resolver: zodResolver(SaveInstructorSchema),
    defaultValues: {
      full_name: instructor?.full_name ?? '',
      phone: instructor?.phone ?? '',
      lesson_rate: instructor?.lesson_rate ?? null,
      kit_notes: instructor?.kit_notes ?? '',
      notes: instructor?.notes ?? '',
    },
  })

  async function onSubmit(data: SaveInstructorData) {
    const result = await onSave(data)
    if ('error' in result) {
      setError('root', { message: result.error })
      return
    }
    if ('id' in result) {
      router.push(`/instructors/${result.id}`)
    } else {
      reset(data)
    }
  }

  const inputClass = 'w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
  const labelClass = 'text-sm font-medium'
  const errorClass = 'text-xs text-red-600'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errors.root && (
        <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
          {errors.root.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>שם מלא *</label>
          <input {...register('full_name')} className={inputClass} />
          {errors.full_name && <p className={errorClass}>{errors.full_name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>טלפון</label>
          <input
            type="tel"
            {...register('phone', { setValueAs: (v) => (v === '' ? null : v) })}
            className={inputClass}
            dir="ltr"
          />
        </div>
      </div>

      <div className="space-y-1.5 max-w-xs">
        <label className={labelClass}>תעריף לשיעור (₪)</label>
        <input
          type="number"
          min={0}
          step="0.01"
          {...register('lesson_rate', {
            setValueAs: (v) => (v === '' || v == null ? null : Number(v)),
          })}
          className={inputClass}
          dir="ltr"
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>הערות ערכה</label>
        <textarea
          {...register('kit_notes', { setValueAs: (v) => (v === '' ? null : v) })}
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>הערות</label>
        <textarea
          {...register('notes', { setValueAs: (v) => (v === '' ? null : v) })}
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || (isEdit && !isDirty)}
          className="bg-primary text-primary-foreground text-sm font-medium px-5 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'שומר...' : isEdit ? 'שמור שינויים' : 'צור מדריך'}
        </button>
        {!isEdit && (
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ביטול
          </button>
        )}
      </div>
    </form>
  )
}
