'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateTaskSchema, TASK_TYPES, TASK_TYPE_LABELS, type CreateTaskData } from '@/lib/validations/task'
import type { Instructor } from '@/lib/types'

interface Group { id: string; name: string; school: { name: string } | null }
interface School { id: string; name: string; city: string }

interface Props {
  groups: Group[]
  schools: School[]
  instructors: Instructor[]
  onCreate: (data: CreateTaskData) => Promise<{ error: string } | { id: string }>
}

export function TaskCreateForm({ groups, schools, instructors, onCreate }: Props) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateTaskData>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      title: '',
      task_type: undefined,
      notes: '',
      due_date: '',
      related_group_id: null,
      related_school_id: null,
      related_instructor_id: null,
    },
  })

  async function onSubmit(data: CreateTaskData) {
    const result = await onCreate(data)
    if ('error' in result) {
      setError('root', { message: result.error })
      return
    }
    router.push('/tasks')
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
        <div className="space-y-1.5 col-span-2">
          <label className={labelClass}>כותרת *</label>
          <input {...register('title')} className={inputClass} />
          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>סוג *</label>
          <select {...register('task_type')} className={inputClass}>
            <option value="">בחר סוג...</option>
            {TASK_TYPES.map((t) => (
              <option key={t} value={t}>{TASK_TYPE_LABELS[t]}</option>
            ))}
          </select>
          {errors.task_type && <p className={errorClass}>{errors.task_type.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>תאריך יעד</label>
          <input
            type="date"
            {...register('due_date', { setValueAs: (v) => (v === '' ? null : v) })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>הערות</label>
        <textarea
          {...register('notes', { setValueAs: (v) => (v === '' ? null : v) })}
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Relations — at least one required */}
      <div className="space-y-2">
        <p className={`${labelClass} text-muted-foreground`}>קשור ל (נדרש לפחות אחד)</p>
        {errors.root?.message?.includes('קבוצה') && (
          <p className={errorClass}>{errors.root.message}</p>
        )}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">קבוצה</label>
            <select
              {...register('related_group_id', { setValueAs: (v) => (v === '' ? null : v) })}
              className={inputClass}
            >
              <option value="">ללא</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}{g.school ? ` — ${g.school.name}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">בית ספר</label>
            <select
              {...register('related_school_id', { setValueAs: (v) => (v === '' ? null : v) })}
              className={inputClass}
            >
              <option value="">ללא</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.city}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">מדריך</label>
            <select
              {...register('related_instructor_id', { setValueAs: (v) => (v === '' ? null : v) })}
              className={inputClass}
            >
              <option value="">ללא</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>{i.full_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground text-sm font-medium px-5 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'יוצר...' : 'צור משימה'}
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
