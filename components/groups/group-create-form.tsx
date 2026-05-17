'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateGroupSchema, FIXED_DAYS, FIXED_DAY_LABELS, type CreateGroupData } from '@/lib/validations/group'
import type { Instructor } from '@/lib/types'

interface School {
  id: string
  name: string
  city: string
}

interface Props {
  schools: School[]
  instructors: Instructor[]
  defaultSchoolId?: string
  onCreate: (data: CreateGroupData) => Promise<{ error: string } | { id: string; lessonsCreated: number }>
}

export function GroupCreateForm({ schools, instructors, defaultSchoolId, onCreate }: Props) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateGroupData>({
    resolver: zodResolver(CreateGroupSchema),
    defaultValues: {
      school_id: defaultSchoolId ?? '',
      name: '',
      fixed_day: undefined,
      fixed_hour: '',
      start_date: '',
      end_date: '',
      yearly_sessions_count: undefined,
      default_lesson_duration_minutes: 60,
      default_instructor_id: null,
      students_count: null,
      syllabus_name: '',
    },
  })

  async function onSubmit(data: CreateGroupData) {
    const result = await onCreate(data)
    if ('error' in result) {
      setError('root', { message: result.error })
      return
    }
    router.push(`/groups/${result.id}`)
  }

  const inputClass = 'w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
  const labelClass = 'text-sm font-medium'
  const errorClass = 'text-xs text-red-600'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errors.root && (
        <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
          {errors.root.message}
        </div>
      )}

      {/* Basic info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>בית ספר *</label>
          <select {...register('school_id')} className={inputClass}>
            <option value="">בחר בית ספר...</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>{s.name} — {s.city}</option>
            ))}
          </select>
          {errors.school_id && <p className={errorClass}>{errors.school_id.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>שם הקבוצה *</label>
          <input {...register('name')} className={inputClass} />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>
      </div>

      {/* Schedule */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>יום קבוע *</label>
          <select {...register('fixed_day')} className={inputClass}>
            <option value="">בחר יום...</option>
            {FIXED_DAYS.map((d) => (
              <option key={d} value={d}>{FIXED_DAY_LABELS[d]}</option>
            ))}
          </select>
          {errors.fixed_day && <p className={errorClass}>{errors.fixed_day.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>שעת התחלה *</label>
          <input type="time" {...register('fixed_hour')} className={inputClass} />
          {errors.fixed_hour && <p className={errorClass}>{errors.fixed_hour.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>תאריך התחלה *</label>
          <input type="date" {...register('start_date')} className={inputClass} />
          {errors.start_date && <p className={errorClass}>{errors.start_date.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>תאריך סיום *</label>
          <input type="date" {...register('end_date')} className={inputClass} />
          {errors.end_date && <p className={errorClass}>{errors.end_date.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>מספר שיעורים *</label>
          <input
            type="number"
            min={1}
            {...register('yearly_sessions_count', {
              setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
            })}
            className={inputClass}
          />
          {errors.yearly_sessions_count && (
            <p className={errorClass}>{errors.yearly_sessions_count.message}</p>
          )}
        </div>
      </div>

      {/* Optional fields */}
      <div className="grid grid-cols-3 gap-4">
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
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground text-sm font-medium px-5 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'יוצר קבוצה...' : 'צור קבוצה'}
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
