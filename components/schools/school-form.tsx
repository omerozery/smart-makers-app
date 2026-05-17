'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SaveSchoolSchema, type SaveSchoolData } from '@/lib/validations/school'
import type { School } from '@/lib/types'

interface Props {
  school?: School
  onSave: (data: SaveSchoolData) => Promise<{ error: string } | { id: string } | { success: true }>
}

export function SchoolForm({ school, onSave }: Props) {
  const router = useRouter()
  const isEdit = !!school

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SaveSchoolData>({
    resolver: zodResolver(SaveSchoolSchema),
    defaultValues: {
      name: school?.name ?? '',
      city: school?.city ?? '',
      address: school?.address ?? '',
      materials_notes: school?.materials_notes ?? '',
      notes: school?.notes ?? '',
    },
  })

  async function onSubmit(data: SaveSchoolData) {
    const result = await onSave(data)
    if ('error' in result) {
      setError('root', { message: result.error })
      return
    }
    if ('id' in result) {
      router.push(`/schools/${result.id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errors.root && (
        <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
          {errors.root.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">שם בית הספר *</label>
          <input
            {...register('name')}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">עיר *</label>
          <input
            {...register('city')}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.city && <p className="text-xs text-red-600">{errors.city.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">כתובת</label>
        <input
          {...register('address')}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">הערות חומרים</label>
        <textarea
          {...register('materials_notes')}
          rows={2}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">הערות</label>
        <textarea
          {...register('notes')}
          rows={2}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground text-sm font-medium px-5 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'שומר...' : isEdit ? 'שמור שינויים' : 'צור בית ספר'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ביטול
        </button>
      </div>
    </form>
  )
}
