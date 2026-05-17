export type LessonStatus =
  | 'Cancelled'
  | 'Completed With Exception'
  | 'Completed'
  | 'Awaiting Attendance'
  | 'Awaiting Summary'
  | 'Ready To Close'
  | 'Scheduled'

export type GroupStatus = 'active' | 'paused' | 'completed'

export interface School {
  id: string
  name: string
  city: string
  address: string | null
  materials_notes: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Group {
  id: string
  school_id: string
  name: string
  fixed_day: string | null
  fixed_hour: string | null
  default_lesson_duration_minutes: number
  start_date: string | null
  end_date: string | null
  yearly_sessions_count: number | null
  default_instructor_id: string | null
  students_count: number | null
  syllabus_name: string | null
  status: GroupStatus
  alignment_reviewed_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GroupWithRelations extends Group {
  school: { id: string; name: string; city: string }
  default_instructor: { id: string; full_name: string } | null
}

export interface Lesson {
  id: string
  group_id: string
  school_id: string
  lesson_date: string
  start_time: string
  end_time: string
  planned_instructor_id: string | null
  actual_instructor_id: string | null
  lesson_owner_id: string | null
  planned_model_id: string | null
  planned_model_other_text: string | null
  planned_lesson_number: number | null
  planned_stage_number: number | null
  actual_model_id: string | null
  actual_model_other_text: string | null
  actual_lesson_number: number | null
  actual_stage_number: number | null
  attendance_received: boolean
  attendance_count: number | null
  attendance_notes: string | null
  summary_received: boolean
  student_notes: string | null
  all_students_aligned: boolean | null
  alignment_notes: string | null
  manager_notes: string | null
  closed_at: string | null
  closed_by: string | null
  closed_with_exception: boolean
  exception_reason: string | null
  exception_resolved_at: string | null
  cancelled_at: string | null
  cancelled_by: string | null
  cancelled_reason: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  updated_by: string | null
}

export interface LessonWithRelations extends Lesson {
  school: { id: string; name: string; city: string }
  group: { id: string; name: string }
  planned_instructor: { id: string; full_name: string } | null
  actual_instructor: { id: string; full_name: string } | null
  planned_model: { id: string; model_name: string; expected_lessons_count: number; total_stages: number } | null
  actual_model: { id: string; model_name: string } | null
  shortages: Shortage[]
}

export interface Shortage {
  id: string
  shortage_type: 'instructor_kit' | 'school_materials' | 'group_materials' | 'other'
  shortage_description: string
  due_date: string | null
  status: 'open' | 'handled' | 'cancelled'
  notes: string | null
}

export interface Instructor {
  id: string
  full_name: string
  phone: string | null
  lesson_rate: number | null
  is_active: boolean
}

export interface Model {
  id: string
  model_name: string
  expected_lessons_count: number
  total_stages: number
  is_active: boolean
}

export interface Profile {
  id: string
  full_name: string
  role: 'admin' | 'manager'
}
