-- ============================================================
-- Smart Makers — Seed Data
-- ============================================================
-- Run once in Supabase SQL Editor AFTER applying the schema.
-- Creates: 1 seed profile, 5 schools, 4 instructors, 3 models,
--          5 groups, ~130 lessons in varied statuses,
--          shortages, tasks, and materials state.
--
-- NOTE: The seed profile (manager@seed.test) is a fake user
-- for seed purposes only. It will not be able to log in.
-- Create real users via Supabase Auth dashboard separately.
--
-- To reset: run supabase/reset_seed.sql first.
-- ============================================================

-- ─── Fixed UUIDs ─────────────────────────────────────────────
-- Profile
-- manager: a0000000-0000-0000-0000-000000000001
-- Schools:  b0000000-0000-0000-0000-00000000000{1-5}
-- Instructors: c0000000-0000-0000-0000-00000000000{1-4}
-- Models:   d0000000-0000-0000-0000-00000000000{1-3}
-- Groups:   e0000000-0000-0000-0000-00000000000{1-5}
-- ─────────────────────────────────────────────────────────────


-- ─── Step 1: Seed profile (bypasses auth.users FK) ───────────

SET session_replication_role = replica;

INSERT INTO public.profiles (id, auth_user_id, full_name, role, is_active, created_at, updated_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'מנהל אזור — פיילוט',
  'manager',
  TRUE,
  NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

SET session_replication_role = DEFAULT;


-- ─── Step 2: Schools ─────────────────────────────────────────

INSERT INTO schools (id, name, city, address, updated_by) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'בי"ס עמל',           'תל אביב',     'רחוב הרצל 50',          'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000002', 'בי"ס כפר שמריהו',    'כפר שמריהו',  'דרך השדות 3',           'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000003', 'בי"ס נווה שרת',      'תל אביב',     'רחוב הגפן 12',          'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000004', 'בי"ס רמות',          'ירושלים',     'שדרות לוי אשכול 45',    'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000005', 'בי"ס אורנים',        'גבעתיים',     'רחוב ויצמן 8',          'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;


-- ─── Step 3: Instructors ─────────────────────────────────────

INSERT INTO instructors (id, full_name, phone, lesson_rate, updated_by) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'מיכל לוי',   '050-1111111', 150.00, 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000002', 'דניאל כהן',  '050-2222222', 150.00, 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000003', 'שירה גולן',  '050-3333333', 160.00, 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000004', 'עמי ברק',    '050-4444444', 140.00, 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;


-- ─── Step 4: Models ──────────────────────────────────────────

INSERT INTO models (id, model_name, expected_lessons_count, total_stages, material_notes, updated_by) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'רובוטיקה בסיסית', 12, 3, 'ערכת רובוטיקה מלאה: מנועים, חיישנים, קרטון',   'a0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000002', 'קוד ומחשוב',      10, 2, 'טאבלטים, אפליקציית סקראץ, מדפסת תלת-ממד',       'a0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000003', 'הנדסת חלל',        8, 4, 'ערכת לוויין, חומרי בנייה, מנוע רקטה לייעוד חינוכי', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;


-- ─── Step 5: Groups ──────────────────────────────────────────
-- Group 1: עמל, Sunday    14:00, מיכל,   Robotics
-- Group 2: עמל, Wednesday 15:00, דניאל,  Coding
-- Group 3: כפר שמריהו, Monday 14:30, שירה, Robotics
-- Group 4: נווה שרת, Thursday 13:00, עמי, Space
-- Group 5: גבעתיים, Tuesday 15:30, מיכל, Coding

INSERT INTO groups (id, school_id, name, fixed_day, fixed_hour, default_lesson_duration_minutes, start_date, end_date, yearly_sessions_count, default_instructor_id, students_count, status, updated_by) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'קבוצה א׳ — כיתה ד׳', 'Sunday',    '14:00', 60, '2026-02-01', '2026-07-31', 25, 'c0000000-0000-0000-0000-000000000001', 22, 'active', 'a0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'קבוצה ב׳ — כיתה ה׳', 'Wednesday', '15:00', 60, '2026-02-04', '2026-07-31', 25, 'c0000000-0000-0000-0000-000000000002', 18, 'active', 'a0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'קבוצה א׳ — כיתה ג׳', 'Monday',    '14:30', 60, '2026-02-02', '2026-07-31', 25, 'c0000000-0000-0000-0000-000000000003', 20, 'active', 'a0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'קבוצה א׳ — כיתה ו׳', 'Thursday',  '13:00', 60, '2026-02-05', '2026-07-31', 25, 'c0000000-0000-0000-0000-000000000004', 24, 'active', 'a0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'קבוצה א׳ — כיתה ד׳', 'Tuesday',   '15:30', 60, '2026-02-03', '2026-07-31', 25, 'c0000000-0000-0000-0000-000000000001', 16, 'active', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;


-- ─── Step 6: Lesson skeletons (generate_series) ──────────────

-- Group 1: Sundays from 2026-02-01
INSERT INTO lessons (group_id, school_id, lesson_date, start_time, end_time, planned_instructor_id, lesson_owner_id, updated_by)
SELECT
  'e0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  d::date, '14:00'::time, '15:00'::time,
  'c0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001'
FROM generate_series('2026-02-01'::date, '2026-07-31'::date, '7 days'::interval) d;

-- Group 2: Wednesdays from 2026-02-04
INSERT INTO lessons (group_id, school_id, lesson_date, start_time, end_time, planned_instructor_id, lesson_owner_id, updated_by)
SELECT
  'e0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000001',
  d::date, '15:00'::time, '16:00'::time,
  'c0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001'
FROM generate_series('2026-02-04'::date, '2026-07-31'::date, '7 days'::interval) d;

-- Group 3: Mondays from 2026-02-02
INSERT INTO lessons (group_id, school_id, lesson_date, start_time, end_time, planned_instructor_id, lesson_owner_id, updated_by)
SELECT
  'e0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000002',
  d::date, '14:30'::time, '15:30'::time,
  'c0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001'
FROM generate_series('2026-02-02'::date, '2026-07-31'::date, '7 days'::interval) d;

-- Group 4: Thursdays from 2026-02-05
INSERT INTO lessons (group_id, school_id, lesson_date, start_time, end_time, planned_instructor_id, lesson_owner_id, updated_by)
SELECT
  'e0000000-0000-0000-0000-000000000004',
  'b0000000-0000-0000-0000-000000000003',
  d::date, '13:00'::time, '14:00'::time,
  'c0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001'
FROM generate_series('2026-02-05'::date, '2026-07-31'::date, '7 days'::interval) d;

-- Group 5: Tuesdays from 2026-02-03
INSERT INTO lessons (group_id, school_id, lesson_date, start_time, end_time, planned_instructor_id, lesson_owner_id, updated_by)
SELECT
  'e0000000-0000-0000-0000-000000000005',
  'b0000000-0000-0000-0000-000000000005',
  d::date, '15:30'::time, '16:30'::time,
  'c0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001'
FROM generate_series('2026-02-03'::date, '2026-07-31'::date, '7 days'::interval) d;


-- ─── Step 7: Set planned model / lesson / stage ──────────────
-- Uses ROW_NUMBER per group ordered by lesson_date.
-- Stage logic:
--   Robotics (12 lessons, 3 stages): 1-4 → s1, 5-8 → s2, 9-12 → s3
--   Coding   (10 lessons, 2 stages): 1-5 → s1, 6-10 → s2
--   Space    ( 8 lessons, 4 stages): 1-2 → s1, 3-4 → s2, 5-6 → s3, 7-8 → s4

-- Groups 1 & 3: Robotics
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY group_id ORDER BY lesson_date) AS rn
  FROM lessons
  WHERE group_id IN (
    'e0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000003'
  )
)
UPDATE lessons SET
  planned_model_id      = 'd0000000-0000-0000-0000-000000000001',
  planned_lesson_number = n.rn,
  planned_stage_number  = CASE WHEN n.rn <= 4 THEN 1 WHEN n.rn <= 8 THEN 2 ELSE 3 END,
  updated_by            = 'a0000000-0000-0000-0000-000000000001'
FROM numbered n
WHERE lessons.id = n.id;

-- Groups 2 & 5: Coding
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY group_id ORDER BY lesson_date) AS rn
  FROM lessons
  WHERE group_id IN (
    'e0000000-0000-0000-0000-000000000002',
    'e0000000-0000-0000-0000-000000000005'
  )
)
UPDATE lessons SET
  planned_model_id      = 'd0000000-0000-0000-0000-000000000002',
  planned_lesson_number = n.rn,
  planned_stage_number  = CASE WHEN n.rn <= 5 THEN 1 ELSE 2 END,
  updated_by            = 'a0000000-0000-0000-0000-000000000001'
FROM numbered n
WHERE lessons.id = n.id;

-- Group 4: Space
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY lesson_date) AS rn
  FROM lessons
  WHERE group_id = 'e0000000-0000-0000-0000-000000000004'
)
UPDATE lessons SET
  planned_model_id      = 'd0000000-0000-0000-0000-000000000003',
  planned_lesson_number = n.rn,
  planned_stage_number  = CASE WHEN n.rn <= 2 THEN 1 WHEN n.rn <= 4 THEN 2 WHEN n.rn <= 6 THEN 3 ELSE 4 END,
  updated_by            = 'a0000000-0000-0000-0000-000000000001'
FROM numbered n
WHERE lessons.id = n.id;


-- ─── Step 8: Cancel one lesson FIRST (Group 4, Apr 16) ──────
-- Must run before the bulk close so cancelled_at IS NULL filter
-- in Step 9 correctly skips this lesson.
-- The on_lesson_cancelled trigger auto-creates a syllabus_review task.

UPDATE lessons SET
  cancelled_at     = lesson_ts('2026-04-16', '08:00'::time),
  cancelled_by     = 'a0000000-0000-0000-0000-000000000001',
  cancelled_reason = 'אירוע בית ספרי — יום הזיכרון',
  updated_by       = 'a0000000-0000-0000-0000-000000000001'
WHERE group_id = 'e0000000-0000-0000-0000-000000000004'
  AND lesson_date = '2026-04-16';


-- ─── Step 9: Close historical lessons (before 2026-05-04) ────
-- Normal closure: all 6 required fields + closed_at + closed_by.
-- Skips the cancelled Apr 16 lesson via cancelled_at IS NULL.

UPDATE lessons SET
  actual_instructor_id  = planned_instructor_id,
  actual_model_id       = planned_model_id,
  actual_lesson_number  = planned_lesson_number,
  actual_stage_number   = planned_stage_number,
  attendance_received   = TRUE,
  attendance_count      = 18 + (random() * 6)::int,
  summary_received      = TRUE,
  all_students_aligned  = TRUE,
  closed_at             = lesson_ts(lesson_date, end_time) + interval '25 minutes',
  closed_by             = 'a0000000-0000-0000-0000-000000000001',
  updated_by            = 'a0000000-0000-0000-0000-000000000001'
WHERE lesson_date < '2026-05-04'
  AND cancelled_at IS NULL
  AND planned_lesson_number IS NOT NULL;


-- ─── Step 10: Overwrite Apr 13 as exception (Group 3) ────────
-- Apr 13 was bulk-closed in Step 9; re-open to exception state.

UPDATE lessons SET
  actual_instructor_id  = planned_instructor_id,
  actual_model_id       = planned_model_id,
  actual_lesson_number  = planned_lesson_number,
  actual_stage_number   = planned_stage_number,
  attendance_received   = TRUE,
  attendance_count      = 14,
  summary_received      = FALSE,
  closed_at             = lesson_ts('2026-04-13', '16:30'::time),
  closed_by             = 'a0000000-0000-0000-0000-000000000001',
  closed_with_exception = TRUE,
  exception_reason      = 'סיכום לא התקבל — מדריך לא נגיש',
  updated_by            = 'a0000000-0000-0000-0000-000000000001'
WHERE group_id = 'e0000000-0000-0000-0000-000000000003'
  AND lesson_date = '2026-04-13';


-- ─── Step 11: Alignment deviation — Group 5, Apr 28 ─────────
-- Apr 28 was bulk-closed in Step 9; overwrite with mismatched actual model.
-- Actual model differs from planned (triggers group_progress_review in attention queue).

UPDATE lessons SET
  actual_instructor_id  = 'c0000000-0000-0000-0000-000000000001',
  actual_model_id       = 'd0000000-0000-0000-0000-000000000001', -- Robotics, but planned was Coding
  actual_lesson_number  = planned_lesson_number,
  actual_stage_number   = 2,
  attendance_received   = TRUE,
  attendance_count      = 15,
  summary_received      = TRUE,
  all_students_aligned  = FALSE,
  alignment_notes       = 'הועברה ערכת רובוטיקה במקום קוד — ערכת הקוד לא הגיעה',
  closed_at             = lesson_ts('2026-04-28', '17:00'::time),
  closed_by             = 'a0000000-0000-0000-0000-000000000001',
  updated_by            = 'a0000000-0000-0000-0000-000000000001'
WHERE group_id = 'e0000000-0000-0000-0000-000000000005'
  AND lesson_date = '2026-04-28';


-- ─── Step 12: Recent lessons — varied attention states ────────

-- Group 1, May 10 (Sunday): Awaiting Attendance (left as-is — no updates needed)
-- Group 2, May 6 (Wednesday): Awaiting Summary (has attendance, no summary)
UPDATE lessons SET
  actual_instructor_id = planned_instructor_id,
  attendance_received  = TRUE,
  attendance_count     = 17,
  updated_by           = 'a0000000-0000-0000-0000-000000000001'
WHERE group_id = 'e0000000-0000-0000-0000-000000000002'
  AND lesson_date = '2026-05-06';

-- Group 3, May 4 (Monday): Awaiting Summary
UPDATE lessons SET
  actual_instructor_id = planned_instructor_id,
  attendance_received  = TRUE,
  attendance_count     = 19,
  updated_by           = 'a0000000-0000-0000-0000-000000000001'
WHERE group_id = 'e0000000-0000-0000-0000-000000000003'
  AND lesson_date = '2026-05-04';

-- Group 4, May 7 (Thursday): Ready To Close (all fields set, not closed yet)
UPDATE lessons SET
  actual_instructor_id  = planned_instructor_id,
  actual_model_id       = planned_model_id,
  actual_lesson_number  = planned_lesson_number,
  actual_stage_number   = planned_stage_number,
  attendance_received   = TRUE,
  attendance_count      = 22,
  summary_received      = TRUE,
  all_students_aligned  = TRUE,
  updated_by            = 'a0000000-0000-0000-0000-000000000001'
WHERE group_id = 'e0000000-0000-0000-0000-000000000004'
  AND lesson_date = '2026-05-07';

-- Group 5, May 5 (Tuesday): Awaiting Summary
UPDATE lessons SET
  actual_instructor_id = planned_instructor_id,
  attendance_received  = TRUE,
  attendance_count     = 14,
  updated_by           = 'a0000000-0000-0000-0000-000000000001'
WHERE group_id = 'e0000000-0000-0000-0000-000000000005'
  AND lesson_date = '2026-05-05';


-- ─── Step 13: Open shortage ───────────────────────────────────

INSERT INTO shortages (
  id, related_school_id, related_group_id,
  shortage_type, shortage_description, due_date, status, updated_by
) VALUES (
  'f0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'e0000000-0000-0000-0000-000000000003',
  'school_materials',
  'חסרים 3 ערכות רובוטיקה לקבוצה ב — בי"ס כפר שמריהו',
  '2026-05-25',
  'open',
  'a0000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;


-- ─── Step 14: Open operational task ──────────────────────────

INSERT INTO operational_tasks (
  id, title, task_type, related_group_id, related_school_id,
  due_date, status, notes, updated_by
) VALUES (
  'f0000000-0000-0000-0000-000000000002',
  'לאשר לוח שיעורים לחודש יוני עם מנהלת בי"ס עמל',
  'school_followup',
  'e0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  '2026-05-22',
  'open',
  'יש לתאם פגישה עם ענת — מנהלת בי"ס עמל — לאישור ימי ושעות לחודש יוני',
  'a0000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;


-- ─── Step 15: School materials state (shortage) ──────────────

INSERT INTO school_materials_state (
  id, school_id, model_id,
  current_quantity, required_quantity,
  last_updated_at, notes, updated_by
) VALUES
  (
    'f0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000001',
    2, 5,
    NOW() - interval '10 days',
    'חסרות 3 ערכות — הזמנה בתהליך',
    'a0000000-0000-0000-0000-000000000001'
  ),
  (
    'f0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002',
    6, 6,
    NOW() - interval '3 days',
    NULL,
    'a0000000-0000-0000-0000-000000000001'
  )
ON CONFLICT (id) DO NOTHING;


-- ─── Done ─────────────────────────────────────────────────────
-- Expected attention queue items after seed:
--   1. lesson_awaiting_attendance  — Group 1 (May 10), Group 2 (May 13), Group 3 (May 11), Group 4 (May 14), Group 5 (May 12)
--   2. lesson_awaiting_summary     — Group 2 (May 6), Group 3 (May 4), Group 5 (May 5)
--   3. lesson_ready_to_close       — Group 4 (May 7)
--   4. lesson_closed_with_exception — Group 3 (Apr 13) — unresolved
--   5. shortage_open               — כפר שמריהו shortage
--   6. task_open                   — school followup + auto-created syllabus_review from cancellation
--   7. group_progress_review       — Group 5 (alignment deviation Apr 28)
--   8. school_material_shortage    — כפר שמריהו (2 of 5 required kits)
-- ============================================================
