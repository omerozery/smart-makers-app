'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SaveGroupSchema, GROUP_STATUS_LABELS, type SaveGroupData } from '@/lib/validations/group'
import type { GroupWithRelations, Instructor } from '@/lib/types'

interface Props {
  group: GroupWithRelations
  instructors: Instructor[]
  onSave: (data: SaveGroupData) => Promise<{ error: string } | { success: true }>
}

export function GroupEditForm({ group, instructors, onSave }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setError,
    reset,
  } = useForm<SaveGroupData>({
    resolver: zodResolver(SaveGroupSchema),
    defaultValues: {
      name: group.name,
      status: group.status,
      students_count: group.students_count,
      syllabus_name: group.syllabus_name ?? '',
      default_instructor_id: group.default_instructor_id,
      default_lesson_duration_minutes: group.default_lesson_duration_minutes,
    },
  })

  async function onSubmit(data: SaveGroupData) {
    const result = await onSave(data)
    if ('error' in result) {
      setError('root', { message: result.error })
      return
    }
    reset(data)
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
          <label className={labelClass}>שם הקבוצה *</label>
          <input {...register('name')} className={inputClass} />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>סטטוס</label>
          <select {...register('status')} className={inputClass}>
            {Object.entries(GROUP_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>מדריך ברירת מחדל</label>
          <select
            {...register('default_instructor_id', {
              setValueAs: (v) => (v === '' ? null : v),
            })}
            className={inputClass}
          >
            <option value="">ללא</option>
            {instructors.map((i) => (
              <option key={i.id} value={i.id}>{i.full_name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>מספר תלמידים</label>
          <input
            type="number"
            min={0}
            {...register('students_count', {
              setValueAs: (v) => (v === '' || v == null ? null : Number(v)),
            })}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>משך שיעור (דקות)</label>
          <input
            type="number"
            min={1}
            {...register('default_lesson_duration_minutes', {
              setValueAs: (v) => (v === '' || v == null ? 60 : Number(v)),
            })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>שם סילבוס</label>
        <input
          {...register('syllabus_name', { setValueAs: (v) => (v === '' ? null : v) })}
          className={inputClass}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="bg-primary text-primary-foreground text-sm font-medium px-5 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'שומר...' : 'שמור שינויים'}
        </button>
      </div>
    </form>
  )
}
