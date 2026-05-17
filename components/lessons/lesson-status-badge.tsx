import { STATUS_LABELS, STATUS_COLORS } from '@/lib/lesson-status'
import type { LessonStatus } from '@/lib/types'

export function LessonStatusBadge({ status }: { status: LessonStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
