import type { LessonStatus } from '@/lib/types'

export const STATUS_LABELS: Record<LessonStatus, string> = {
  'Scheduled': 'מתוכנן',
  'Awaiting Attendance': 'ממתין לנוכחות',
  'Awaiting Summary': 'ממתין לסיכום',
  'Ready To Close': 'מוכן לסגירה',
  'Completed': 'הושלם',
  'Completed With Exception': 'הושלם עם חריגה',
  'Cancelled': 'בוטל',
}

export const STATUS_COLORS: Record<LessonStatus, string> = {
  'Scheduled': 'bg-gray-100 text-gray-700 border-gray-200',
  'Awaiting Attendance': 'bg-orange-100 text-orange-700 border-orange-200',
  'Awaiting Summary': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Ready To Close': 'bg-blue-100 text-blue-700 border-blue-200',
  'Completed': 'bg-green-100 text-green-700 border-green-200',
  'Completed With Exception': 'bg-purple-100 text-purple-700 border-purple-200',
  'Cancelled': 'bg-red-100 text-red-700 border-red-200',
}

export const SHORTAGE_TYPE_LABELS: Record<string, string> = {
  instructor_kit: 'ערכת מדריך',
  school_materials: 'חומרי בית ספר',
  group_materials: 'חומרי קבוצה',
  other: 'אחר',
}

export function isLessonEditable(status: LessonStatus): boolean {
  return status !== 'Completed' && status !== 'Cancelled'
}

export function canClose(status: LessonStatus): boolean {
  return status === 'Ready To Close'
}

export function canCloseWithException(status: LessonStatus): boolean {
  return (
    status === 'Awaiting Attendance' ||
    status === 'Awaiting Summary' ||
    status === 'Ready To Close'
  )
}

export function canCancel(status: LessonStatus): boolean {
  return status === 'Scheduled' || status === 'Awaiting Attendance' || status === 'Awaiting Summary' || status === 'Ready To Close'
}
