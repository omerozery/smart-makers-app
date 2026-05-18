-- ============================================================
-- Smart Makers Operations System
-- Supabase PostgreSQL Schema v1.3 — FINAL
-- ============================================================
--
-- ┌─────────────────────────────────────────────────────────┐
-- │  APPLICATION RESPONSIBILITY: updated_by                 │
-- │                                                         │
-- │  updated_by is NOT set by any trigger.                  │
-- │  The application must supply profiles.id on every       │
-- │  INSERT and UPDATE mutation.                            │
-- │                                                         │
-- │  Pattern (Supabase JS):                                 │
-- │    .insert({ ..., updated_by: currentProfileId })       │
-- │    .update({ ..., updated_by: currentProfileId })       │
-- └─────────────────────────────────────────────────────────┘
--
-- ┌─────────────────────────────────────────────────────────┐
-- │  OPERATIONAL TIMEZONE                                   │
-- │                                                         │
-- │  Defined ONLY in Section 6 (three helper functions).   │
-- │  Current value: Australia/Sydney                        │
-- │  To change: update only those three functions.          │
-- └─────────────────────────────────────────────────────────┘
--
-- ┌─────────────────────────────────────────────────────────┐
-- │  EXECUTION INSTRUCTIONS                                 │
-- │                                                         │
-- │  Run this file once in full on a fresh Supabase project │
-- │  via the SQL Editor. Do not run sections individually.  │
-- │                                                         │
-- │  After running:                                         │
-- │  1. Create a test auth user.                            │
-- │  2. Confirm a row exists in public.profiles.            │
-- │  3. Call generate_group_lesson_skeleton() on a test     │
-- │     group and confirm lessons are created.              │
-- │  4. Cancel one of those lessons and confirm an          │
-- │     operational_task of type syllabus_review appears.   │
-- └─────────────────────────────────────────────────────────┘
--
-- ┌─────────────────────────────────────────────────────────┐
-- │  v1.3 ADDITIONS SUMMARY                                 │
-- │                                                         │
-- │  + school_materials_state table                         │
-- │  + groups.default_lesson_duration_minutes               │
-- │  + generate_group_lesson_skeleton() RPC                 │
-- │  + Cancellation → syllabus_review task trigger          │
-- │  + v_school_materials_state view                        │
-- │  + school_material_shortage in v_attention_queue        │
-- │                                                         │
-- │  All v1.2 content preserved without modification.       │
-- └─────────────────────────────────────────────────────────┘


-- ============================================================
-- SECTION 1: EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- SECTION 2: ENUMS
-- ============================================================

CREATE TYPE profile_role AS ENUM (
  'admin',
  'manager'
);

CREATE TYPE group_status AS ENUM (
  'active',
  'paused',
  'completed'
);

CREATE TYPE shortage_type AS ENUM (
  'instructor_kit',
  'school_materials',
  'group_materials',
  'other'
);

CREATE TYPE shortage_status AS ENUM (
  'open',
  'handled',
  'cancelled'
);

CREATE TYPE task_type AS ENUM (
  'materials',
  'instructor_followup',
  'school_followup',
  'syllabus_review',
  'missing_information',
  'other'
);

CREATE TYPE task_status AS ENUM (
  'open',
  'done',
  'cancelled'
);

-- lesson_status: function return type only, not a stored column.
CREATE TYPE lesson_status AS ENUM (
  'Cancelled',
  'Completed With Exception',
  'Completed',
  'Awaiting Attendance',
  'Awaiting Summary',
  'Ready To Close',
  'Scheduled'
);


-- ============================================================
-- SECTION 3: TABLES
-- Creation order respects all FK dependencies.
-- ============================================================


-- ------------------------------------------------------------
-- 3.1 profiles
-- System users. Roles: admin, manager.
-- updated_by self-ref FK added via ALTER TABLE in 3.11.
-- Auto-created from auth.users via trigger in Section 8.
-- ------------------------------------------------------------

CREATE TABLE profiles (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  UUID         NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE RESTRICT,
  full_name     TEXT         NOT NULL,
  role          profile_role NOT NULL DEFAULT 'manager',
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_by    UUID         -- FK added via ALTER TABLE in 3.11
);


-- ------------------------------------------------------------
-- 3.2 areas
-- Minimal reference table for future multi-area operation.
-- Assign to schools and instructors only.
-- All other entities derive area through JOIN chains.
-- Not required in the pilot — all fields nullable-compatible.
-- ------------------------------------------------------------

CREATE TABLE areas (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID        REFERENCES profiles(id) ON DELETE SET NULL
);


-- ------------------------------------------------------------
-- 3.3 schools
-- area_id: nullable, not required during pilot.
-- external_id / external_source: for future system integrations.
--   Set both together. external_source identifies the system
--   (e.g. 'google_places', 'old_crm').
-- ------------------------------------------------------------

CREATE TABLE schools (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT        NOT NULL,
  city             TEXT        NOT NULL,
  address          TEXT,
  materials_notes  TEXT,
  notes            TEXT,
  area_id          UUID        REFERENCES areas(id) ON DELETE SET NULL,
  external_id      TEXT,
  external_source  TEXT,
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by       UUID        REFERENCES profiles(id) ON DELETE SET NULL
);


-- ------------------------------------------------------------
-- 3.4 instructors
-- lesson_rate: per-lesson rate for summary only. Not full payroll.
-- area_id: nullable, not required during pilot.
-- ------------------------------------------------------------

CREATE TABLE instructors (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT         NOT NULL,
  phone           TEXT,
  lesson_rate     NUMERIC(10,2),
  kit_notes       TEXT,
  notes           TEXT,
  area_id         UUID         REFERENCES areas(id) ON DELETE SET NULL,
  external_id     TEXT,
  external_source TEXT,
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_by      UUID         REFERENCES profiles(id) ON DELETE SET NULL
);


-- ------------------------------------------------------------
-- 3.5 models
-- ------------------------------------------------------------

CREATE TABLE models (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name             TEXT        NOT NULL,
  expected_lessons_count INTEGER     NOT NULL CHECK (expected_lessons_count > 0),
  total_stages           INTEGER     NOT NULL CHECK (total_stages > 0),
  material_notes         TEXT,
  is_active              BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by             UUID        REFERENCES profiles(id) ON DELETE SET NULL
);


-- ------------------------------------------------------------
-- 3.6 groups
-- v1.1: alignment_reviewed_at / _by / _notes
-- v1.2: external_id / external_source
-- v1.3: default_lesson_duration_minutes
--
-- default_lesson_duration_minutes:
--   Used by generate_group_lesson_skeleton() to compute
--   lesson end_time from fixed_hour.
--   Defaults to 60. Set per group if lessons vary in length.
--
-- fixed_day values (English only):
--   'Sunday', 'Monday', 'Tuesday', 'Wednesday',
--   'Thursday', 'Friday', 'Saturday'
--
-- Area derivation:
--   Groups derive area via: group → school → area_id.
--   Do NOT add area_id directly to this table.
--
-- Alignment review lifecycle:
--   A group enters the queue when a closed lesson has a
--   curriculum mismatch or all_students_aligned = FALSE,
--   AND that lesson closed after alignment_reviewed_at
--   (or no review has ever been done).
--   Set all three alignment fields together to clear.
--   The group re-enters automatically when a newer
--   problematic lesson is closed after the review timestamp.
-- ------------------------------------------------------------

CREATE TABLE groups (
  id                              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id                       UUID         NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
  name                            TEXT         NOT NULL,
  fixed_day                       TEXT,
  fixed_hour                      TIME,
  default_lesson_duration_minutes INTEGER      NOT NULL DEFAULT 60
                                               CHECK (default_lesson_duration_minutes > 0),
  start_date                      DATE,
  end_date                        DATE,
  yearly_sessions_count           INTEGER      CHECK (yearly_sessions_count > 0),
  default_instructor_id           UUID         REFERENCES instructors(id) ON DELETE SET NULL,
  students_count                  INTEGER      CHECK (students_count >= 0),
  syllabus_name                   TEXT,
  status                          group_status NOT NULL DEFAULT 'active',
  alignment_reviewed_at           TIMESTAMPTZ,
  alignment_reviewed_by           UUID         REFERENCES profiles(id) ON DELETE SET NULL,
  alignment_review_notes          TEXT,
  external_id                     TEXT,
  external_source                 TEXT,
  is_active                       BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at                      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_by                      UUID         REFERENCES profiles(id) ON DELETE SET NULL,

  CONSTRAINT groups_dates_valid CHECK (
    end_date IS NULL OR start_date IS NULL OR end_date >= start_date
  ),

  CONSTRAINT groups_alignment_reviewed_by_required CHECK (
    NOT (alignment_reviewed_at IS NOT NULL AND alignment_reviewed_by IS NULL)
  )
);


-- ------------------------------------------------------------
-- 3.7 lessons
-- v1.1: exception_resolved_at / _by / _notes
-- v1.2: lesson_owner_id, external_id / external_source
-- v1.3: unchanged — skeleton + cancellation logic in Sections 9–10
--
-- lesson_owner_id:
--   The profile responsible for this lesson operationally.
--   Set to the creating profile on INSERT.
--   Distinct from closed_by / cancelled_by (who performed an
--   action) and updated_by (who last touched the record).
--
-- school_id is retained for query performance and enforced
-- by the trigger in Section 7 to always match group.school_id.
--
-- Area derivation:
--   lesson → group → school → area_id
--   Do NOT add area_id directly to this table.
--
-- DB-level closure constraint added via ALTER TABLE in Section 12.
-- ------------------------------------------------------------

CREATE TABLE lessons (
  id                         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core references
  group_id                   UUID        NOT NULL REFERENCES groups(id) ON DELETE RESTRICT,
  school_id                  UUID        NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
  lesson_date                DATE        NOT NULL,
  start_time                 TIME        NOT NULL,
  end_time                   TIME        NOT NULL,

  -- Instructor assignments
  planned_instructor_id      UUID        REFERENCES instructors(id) ON DELETE SET NULL,
  actual_instructor_id       UUID        REFERENCES instructors(id) ON DELETE SET NULL,

  -- Ownership
  lesson_owner_id            UUID        REFERENCES profiles(id) ON DELETE SET NULL,

  -- Planned curriculum
  planned_model_id           UUID        REFERENCES models(id) ON DELETE SET NULL,
  planned_model_other_text   TEXT,
  planned_lesson_number      INTEGER     CHECK (planned_lesson_number > 0),
  planned_stage_number       INTEGER     CHECK (planned_stage_number > 0),

  -- Actual curriculum (filled after lesson)
  actual_model_id            UUID        REFERENCES models(id) ON DELETE SET NULL,
  actual_model_other_text    TEXT,
  actual_lesson_number       INTEGER     CHECK (actual_lesson_number > 0),
  actual_stage_number        INTEGER     CHECK (actual_stage_number > 0),

  -- Attendance
  attendance_received        BOOLEAN     NOT NULL DEFAULT FALSE,
  attendance_count           INTEGER     CHECK (attendance_count >= 0),
  attendance_notes           TEXT,

  -- Summary
  summary_received           BOOLEAN     NOT NULL DEFAULT FALSE,
  student_notes              TEXT,
  all_students_aligned       BOOLEAN,
  alignment_notes            TEXT,
  manager_notes              TEXT,

  -- Closure
  closed_at                  TIMESTAMPTZ,
  closed_by                  UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  closed_with_exception      BOOLEAN     NOT NULL DEFAULT FALSE,
  exception_reason           TEXT,

  -- Exception resolution
  -- APPLICATION: set all three together on resolution.
  exception_resolved_at      TIMESTAMPTZ,
  exception_resolved_by      UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  exception_resolution_notes TEXT,

  -- Cancellation
  cancelled_at               TIMESTAMPTZ,
  cancelled_by               UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  cancelled_reason           TEXT,

  -- External reference
  external_id                TEXT,
  external_source            TEXT,

  -- Metadata
  is_active                  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by                 UUID        REFERENCES profiles(id) ON DELETE SET NULL,

  -- ── Integrity constraints ───────────────────────────────

  CONSTRAINT lessons_time_valid CHECK (
    end_time > start_time
  ),

  CONSTRAINT lessons_not_closed_and_cancelled CHECK (
    NOT (closed_at IS NOT NULL AND cancelled_at IS NOT NULL)
  ),

  CONSTRAINT lessons_exception_reason_required CHECK (
    NOT (closed_with_exception = TRUE AND exception_reason IS NULL)
  ),

  CONSTRAINT lessons_exception_resolved_by_required CHECK (
    NOT (exception_resolved_at IS NOT NULL AND exception_resolved_by IS NULL)
  ),

  CONSTRAINT lessons_exception_resolution_only_if_exception CHECK (
    NOT (exception_resolved_at IS NOT NULL AND closed_with_exception = FALSE)
  ),

  CONSTRAINT lessons_cancelled_by_required CHECK (
    NOT (cancelled_at IS NOT NULL AND cancelled_by IS NULL)
  ),

  CONSTRAINT lessons_closed_by_required CHECK (
    NOT (closed_at IS NOT NULL AND closed_by IS NULL)
  )

  -- NOTE: lessons_normal_closure_requires_complete_data
  -- added via ALTER TABLE in Section 12.
);


-- ------------------------------------------------------------
-- 3.8 school_materials_state  [NEW in v1.3]
--
-- Tracks current vs required kit quantity per school per model.
-- NOT a full inventory system:
--   - No component-level tracking
--   - No automatic decrement on lesson close
--   - No procurement or delivery workflow
--   - Manager updates quantities manually
--
-- last_updated_at vs updated_at:
--   updated_at   = metadata timestamp, auto-maintained by trigger.
--   last_updated_at = physical verification timestamp.
--                 APPLICATION sets this explicitly when a manager
--                 records or verifies actual quantities.
--                 It is NOT updated automatically.
--
-- Shortage detection:
--   has_shortage = (current_quantity < required_quantity)
--   Surfaced in v_school_materials_state and v_attention_queue.
--   The manager responds by updating quantities or creating a
--   shortage record manually. No automation.
--
-- One record per school-model combination (UNIQUE constraint).
-- ------------------------------------------------------------

CREATE TABLE school_materials_state (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id         UUID        NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
  model_id          UUID        NOT NULL REFERENCES models(id) ON DELETE RESTRICT,
  current_quantity  INTEGER     NOT NULL DEFAULT 0 CHECK (current_quantity >= 0),
  required_quantity INTEGER     NOT NULL DEFAULT 0 CHECK (required_quantity >= 0),
  last_updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes             TEXT,
  is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by        UUID        REFERENCES profiles(id) ON DELETE SET NULL,

  -- One state record per school per model
  CONSTRAINT school_materials_state_unique UNIQUE (school_id, model_id)
);


-- ------------------------------------------------------------
-- 3.9 shortages
-- Unchanged from v1.2.
-- ------------------------------------------------------------

CREATE TABLE shortages (
  id                    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  related_lesson_id     UUID            REFERENCES lessons(id) ON DELETE SET NULL,
  related_group_id      UUID            REFERENCES groups(id) ON DELETE SET NULL,
  related_school_id     UUID            REFERENCES schools(id) ON DELETE SET NULL,
  related_instructor_id UUID            REFERENCES instructors(id) ON DELETE SET NULL,
  shortage_type         shortage_type   NOT NULL,
  shortage_description  TEXT            NOT NULL,
  due_date              DATE,
  status                shortage_status NOT NULL DEFAULT 'open',
  notes                 TEXT,
  handled_at            TIMESTAMPTZ,
  handled_by            UUID            REFERENCES profiles(id) ON DELETE SET NULL,
  is_active             BOOLEAN         NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_by            UUID            REFERENCES profiles(id) ON DELETE SET NULL,

  CONSTRAINT shortages_has_relation CHECK (
    related_lesson_id     IS NOT NULL
    OR related_group_id   IS NOT NULL
    OR related_school_id  IS NOT NULL
    OR related_instructor_id IS NOT NULL
  ),

  CONSTRAINT shortages_handled_by_required CHECK (
    NOT (handled_at IS NOT NULL AND handled_by IS NULL)
  )
);


-- ------------------------------------------------------------
-- 3.10 operational_tasks
-- Unchanged from v1.2.
-- syllabus_review tasks are auto-created on lesson cancellation
-- by the trigger in Section 9. Manual creation also supported.
-- ------------------------------------------------------------

CREATE TABLE operational_tasks (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 TEXT        NOT NULL,
  task_type             task_type   NOT NULL,
  related_lesson_id     UUID        REFERENCES lessons(id) ON DELETE SET NULL,
  related_group_id      UUID        REFERENCES groups(id) ON DELETE SET NULL,
  related_school_id     UUID        REFERENCES schools(id) ON DELETE SET NULL,
  related_instructor_id UUID        REFERENCES instructors(id) ON DELETE SET NULL,
  related_shortage_id   UUID        REFERENCES shortages(id) ON DELETE SET NULL,
  due_date              DATE,
  status                task_status NOT NULL DEFAULT 'open',
  notes                 TEXT,
  completed_at          TIMESTAMPTZ,
  completed_by          UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  is_active             BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by            UUID        REFERENCES profiles(id) ON DELETE SET NULL,

  CONSTRAINT tasks_has_relation CHECK (
    related_lesson_id     IS NOT NULL
    OR related_group_id   IS NOT NULL
    OR related_school_id  IS NOT NULL
    OR related_instructor_id IS NOT NULL
    OR related_shortage_id IS NOT NULL
  ),

  CONSTRAINT tasks_completed_by_required CHECK (
    NOT (completed_at IS NOT NULL AND completed_by IS NULL)
  )
);


-- ------------------------------------------------------------
-- 3.11 Deferred self-referencing FK: profiles.updated_by
-- ------------------------------------------------------------

ALTER TABLE profiles
  ADD CONSTRAINT profiles_updated_by_fk
  FOREIGN KEY (updated_by) REFERENCES profiles(id) ON DELETE SET NULL;


-- ============================================================
-- SECTION 4: INDEXES
-- ============================================================

-- lessons
CREATE INDEX idx_lessons_date                ON lessons(lesson_date);
CREATE INDEX idx_lessons_group_id            ON lessons(group_id);
CREATE INDEX idx_lessons_school_id           ON lessons(school_id);
CREATE INDEX idx_lessons_actual_instr        ON lessons(actual_instructor_id);
CREATE INDEX idx_lessons_planned_instr       ON lessons(planned_instructor_id);
CREATE INDEX idx_lessons_owner               ON lessons(lesson_owner_id);
CREATE INDEX idx_lessons_closed_at           ON lessons(closed_at);
CREATE INDEX idx_lessons_cancelled_at        ON lessons(cancelled_at);
CREATE INDEX idx_lessons_is_active           ON lessons(is_active);
CREATE INDEX idx_lessons_exception_resolved
  ON lessons(exception_resolved_at)
  WHERE closed_with_exception = TRUE;
CREATE INDEX idx_lessons_external_id
  ON lessons(external_id)
  WHERE external_id IS NOT NULL;

-- groups
CREATE INDEX idx_groups_school_id            ON groups(school_id);
CREATE INDEX idx_groups_default_instr        ON groups(default_instructor_id);
CREATE INDEX idx_groups_status               ON groups(status);
CREATE INDEX idx_groups_alignment_reviewed   ON groups(alignment_reviewed_at);
CREATE INDEX idx_groups_external_id
  ON groups(external_id)
  WHERE external_id IS NOT NULL;

-- schools
CREATE INDEX idx_schools_area_id
  ON schools(area_id)
  WHERE area_id IS NOT NULL;
CREATE INDEX idx_schools_external_id
  ON schools(external_id)
  WHERE external_id IS NOT NULL;

-- instructors
CREATE INDEX idx_instructors_area_id
  ON instructors(area_id)
  WHERE area_id IS NOT NULL;
CREATE INDEX idx_instructors_external_id
  ON instructors(external_id)
  WHERE external_id IS NOT NULL;

-- school_materials_state  [v1.3]
-- Primary access patterns: by school, by model, and shortage detection.
CREATE INDEX idx_materials_school_id
  ON school_materials_state(school_id);
CREATE INDEX idx_materials_model_id
  ON school_materials_state(model_id);
-- Partial index covering only shortage rows — used by attention queue query.
CREATE INDEX idx_materials_shortage
  ON school_materials_state(school_id, model_id)
  WHERE current_quantity < required_quantity AND is_active = TRUE;

-- shortages
CREATE INDEX idx_shortages_status            ON shortages(status);
CREATE INDEX idx_shortages_due_date          ON shortages(due_date);
CREATE INDEX idx_shortages_group_id          ON shortages(related_group_id);
CREATE INDEX idx_shortages_school_id         ON shortages(related_school_id);
CREATE INDEX idx_shortages_is_active         ON shortages(is_active);

-- operational_tasks
CREATE INDEX idx_tasks_status                ON operational_tasks(status);
CREATE INDEX idx_tasks_due_date              ON operational_tasks(due_date);
CREATE INDEX idx_tasks_group_id              ON operational_tasks(related_group_id);
CREATE INDEX idx_tasks_school_id             ON operational_tasks(related_school_id);
CREATE INDEX idx_tasks_is_active             ON operational_tasks(is_active);


-- ============================================================
-- SECTION 5: UPDATED_AT TRIGGER
-- Automatically maintains updated_at on every UPDATE.
-- Does NOT set updated_by — that is the application's job.
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_areas
  BEFORE UPDATE ON areas
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_schools
  BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_instructors
  BEFORE UPDATE ON instructors
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_models
  BEFORE UPDATE ON models
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_groups
  BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_lessons
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_school_materials_state   -- v1.3
  BEFORE UPDATE ON school_materials_state
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_shortages
  BEFORE UPDATE ON shortages
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_operational_tasks
  BEFORE UPDATE ON operational_tasks
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ============================================================
-- SECTION 6: TIMEZONE HELPER FUNCTIONS
-- ============================================================
--
-- Operational timezone: Australia/Sydney
--
-- All lesson times are stored as naive DATE + TIME values
-- (local Sydney time). lesson_ts() converts them to UTC-aware
-- TIMESTAMPTZ for correct comparison against app_now().
--
-- TO CHANGE TIMEZONE: update ONLY the string 'Australia/Sydney'
-- in the three functions below. Change nothing else.

CREATE OR REPLACE FUNCTION app_now()
RETURNS TIMESTAMPTZ LANGUAGE sql STABLE AS $$
  SELECT NOW();
$$;
COMMENT ON FUNCTION app_now() IS
  'Current UTC timestamp. Use in all time comparisons. '
  'Operational timezone: Australia/Sydney (see app_today, lesson_ts).';

CREATE OR REPLACE FUNCTION app_today()
RETURNS DATE LANGUAGE sql STABLE AS $$
  SELECT (NOW() AT TIME ZONE 'Australia/Sydney')::DATE;
$$;
COMMENT ON FUNCTION app_today() IS
  'Today''s date in the operational timezone (Australia/Sydney). '
  'Use instead of CURRENT_DATE in all views and functions.';

CREATE OR REPLACE FUNCTION lesson_ts(p_date DATE, p_time TIME)
RETURNS TIMESTAMPTZ LANGUAGE sql STABLE AS $$
  SELECT (p_date + p_time)::TIMESTAMP AT TIME ZONE 'Australia/Sydney';
$$;
COMMENT ON FUNCTION lesson_ts(DATE, TIME) IS
  'Converts a naive lesson date+time (Sydney local) to UTC-aware '
  'TIMESTAMPTZ for comparison with app_now().';


-- ============================================================
-- SECTION 7: SCHOOL_ID CONSISTENCY TRIGGER
-- ============================================================
--
-- Enforces that lessons.school_id always matches the school_id
-- of the related group. Fires on INSERT and on UPDATE of
-- school_id or group_id only (not on every column change).
--
-- Known limitation: if a group's school_id is changed after
-- lessons exist, existing lessons are not re-validated.
-- Treat group school reassignment as a rare admin action.

CREATE OR REPLACE FUNCTION check_lesson_school_id()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_group_school_id UUID;
BEGIN
  SELECT school_id INTO v_group_school_id
    FROM groups WHERE id = NEW.group_id;

  IF v_group_school_id IS NULL THEN
    RAISE EXCEPTION
      'lessons: group_id % not found or has no school_id', NEW.group_id;
  END IF;

  IF NEW.school_id IS DISTINCT FROM v_group_school_id THEN
    RAISE EXCEPTION
      'lessons.school_id (%) does not match school_id (%) of group %',
      NEW.school_id, v_group_school_id, NEW.group_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_lesson_school_id
  BEFORE INSERT OR UPDATE OF school_id, group_id ON lessons
  FOR EACH ROW EXECUTE FUNCTION check_lesson_school_id();


-- ============================================================
-- SECTION 8: PROFILE AUTO-CREATION TRIGGER
-- ============================================================
--
-- Creates a public.profiles row whenever a user is created
-- in Supabase Auth (auth.users). Standard Supabase pattern.
--
-- SECURITY DEFINER + search_path = public:
--   Runs as the function owner (postgres/service_role),
--   bypassing RLS. Required because the trigger fires during
--   the signup process before any session exists.
--
-- full_name: taken from raw_user_meta_data->>'full_name'.
--   Falls back to 'New User' if not supplied at signup.
--   The application should always pass full_name.
--
-- Default role: 'manager'. Promote to 'admin' manually
-- via Supabase dashboard or a privileged RPC.
--
-- VERIFICATION: after deploying, create a test auth user
-- and confirm a profiles row exists with the correct auth_user_id.

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, full_name, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    'manager',
    TRUE
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();


-- ============================================================
-- SECTION 9: CANCELLATION → SYLLABUS REVIEW TASK TRIGGER  [NEW v1.3]
-- ============================================================
--
-- When a lesson is cancelled (cancelled_at transitions from NULL
-- to a non-NULL value), automatically creates an operational_task
-- of type syllabus_review.
--
-- This is the only automatic task creation in the system.
-- All other tasks are created manually by the manager.
--
-- Auto-created task fields:
--   title         = 'Syllabus Review — [group name] on [date]'
--   task_type     = 'syllabus_review'
--   related_lesson_id = cancelled lesson
--   related_group_id  = lesson's group
--   related_school_id = lesson's school
--   due_date      = cancelled lesson date + 7 days
--   status        = 'open'
--   updated_by    = cancelled_by (the profile who cancelled)
--
-- No series shifting occurs. The manager reviews the syllabus
-- impact manually and updates planned lesson/stage numbers as needed.
--
-- Fires AFTER UPDATE only (not on INSERT — skeleton lessons
-- are never created in a cancelled state).
--
-- SECURITY INVOKER (default): runs with the permissions of the
-- session that performed the UPDATE. Authenticated users have
-- INSERT on operational_tasks per RLS policy. Service role
-- bypasses RLS. Both cases work correctly.

CREATE OR REPLACE FUNCTION create_cancellation_syllabus_task()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_group_name TEXT;
BEGIN
  -- Only fire when cancelled_at transitions NULL → non-NULL
  IF NEW.cancelled_at IS NOT NULL AND OLD.cancelled_at IS NULL THEN

    SELECT name INTO v_group_name
      FROM groups WHERE id = NEW.group_id;

    INSERT INTO operational_tasks (
      title,
      task_type,
      related_lesson_id,
      related_group_id,
      related_school_id,
      due_date,
      status,
      notes,
      updated_by
    ) VALUES (
      'Syllabus Review — ' || COALESCE(v_group_name, 'Group') || ' on ' || NEW.lesson_date::TEXT,
      'syllabus_review',
      NEW.id,
      NEW.group_id,
      NEW.school_id,
      NEW.lesson_date + INTERVAL '7 days',
      'open',
      'Auto-created on lesson cancellation. Review syllabus and adjust planned progress if needed.',
      NEW.cancelled_by
    );

  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_lesson_cancelled
  AFTER UPDATE OF cancelled_at ON lessons
  FOR EACH ROW EXECUTE FUNCTION create_cancellation_syllabus_task();


-- ============================================================
-- SECTION 10: LESSON SKELETON GENERATION RPC  [NEW v1.3]
-- ============================================================
--
-- Generates a full set of scheduled (skeleton) lessons for a
-- group based on its fixed schedule, producing one lesson per
-- week for each occurrence of fixed_day within the date range.
--
-- Usage (Supabase JS):
--   const { data } = await supabase.rpc('generate_group_lesson_skeleton', {
--     p_group_id: '...uuid...',
--     p_owner_id: '...profile_uuid...'
--   })
--   // Returns: number of lessons created (integer)
--
-- Prerequisites on the group:
--   fixed_day             TEXT    — day of week in English
--   fixed_hour            TIME    — lesson start time
--   default_lesson_duration_minutes INTEGER — lesson length
--   start_date            DATE    — first possible lesson date
--   end_date              DATE    — last possible lesson date
--   yearly_sessions_count INTEGER — max lessons to generate
--   school_id             UUID    — copied to each lesson
--   default_instructor_id UUID    — copied as planned_instructor_id
--
-- Behaviour:
--   - Advances from start_date to first occurrence of fixed_day.
--   - Generates one lesson per week thereafter.
--   - Stops when end_date is reached OR yearly_sessions_count
--     lessons have been created, whichever comes first.
--   - IDEMPOTENT: skips dates where an active lesson already
--     exists for this group (safe to call more than once).
--   - Returns the count of new lessons created.
--
-- fixed_day DOW mapping (PostgreSQL EXTRACT(DOW)):
--   Sunday=0, Monday=1, Tuesday=2, Wednesday=3,
--   Thursday=4, Friday=5, Saturday=6
--
-- The school_id consistency trigger (Section 7) fires on each
-- INSERT and validates school_id against the group — no issue
-- since we use v_group.school_id directly from the group row.
--
-- DB closure constraint does NOT apply — generated lessons
-- have closed_at = NULL and closed_with_exception = FALSE,
-- which satisfies the constraint trivially.

CREATE OR REPLACE FUNCTION generate_group_lesson_skeleton(
  p_group_id UUID,
  p_owner_id UUID     -- profiles.id of the user running the generation
)
RETURNS INTEGER       -- count of lessons created
LANGUAGE plpgsql AS $$
DECLARE
  v_group          groups%ROWTYPE;
  v_target_dow     INTEGER;
  v_current_dow    INTEGER;
  v_current_date   DATE;
  v_start_time     TIME;
  v_end_time       TIME;
  v_max_lessons    INTEGER;
  v_created        INTEGER := 0;
BEGIN

  -- Load and validate group
  SELECT * INTO v_group
    FROM groups
   WHERE id = p_group_id AND is_active = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'generate_group_lesson_skeleton: group % not found or inactive', p_group_id;
  END IF;

  IF v_group.start_date IS NULL THEN
    RAISE EXCEPTION 'generate_group_lesson_skeleton: group % has no start_date', p_group_id;
  END IF;

  IF v_group.end_date IS NULL THEN
    RAISE EXCEPTION 'generate_group_lesson_skeleton: group % has no end_date', p_group_id;
  END IF;

  IF v_group.fixed_day IS NULL THEN
    RAISE EXCEPTION 'generate_group_lesson_skeleton: group % has no fixed_day', p_group_id;
  END IF;

  IF v_group.fixed_hour IS NULL THEN
    RAISE EXCEPTION 'generate_group_lesson_skeleton: group % has no fixed_hour', p_group_id;
  END IF;

  -- Map fixed_day text to PostgreSQL DOW integer (0=Sunday … 6=Saturday)
  v_target_dow := CASE LOWER(TRIM(v_group.fixed_day))
    WHEN 'sunday'    THEN 0
    WHEN 'monday'    THEN 1
    WHEN 'tuesday'   THEN 2
    WHEN 'wednesday' THEN 3
    WHEN 'thursday'  THEN 4
    WHEN 'friday'    THEN 5
    WHEN 'saturday'  THEN 6
    ELSE NULL
  END;

  IF v_target_dow IS NULL THEN
    RAISE EXCEPTION
      'generate_group_lesson_skeleton: group % fixed_day ''%'' is not a valid English day name',
      p_group_id, v_group.fixed_day;
  END IF;

  -- Compute start and end times for each generated lesson
  v_start_time := v_group.fixed_hour;
  v_end_time   := v_start_time
                  + (v_group.default_lesson_duration_minutes * INTERVAL '1 minute');

  -- Cap generation at yearly_sessions_count (default 52 if not set)
  v_max_lessons := COALESCE(v_group.yearly_sessions_count, 52);

  -- Advance start_date to the first occurrence of target DOW
  v_current_date := v_group.start_date;
  v_current_dow  := EXTRACT(DOW FROM v_current_date)::INTEGER;

  IF v_current_dow != v_target_dow THEN
    v_current_date := v_current_date
                      + ((v_target_dow - v_current_dow + 7) % 7);
  END IF;

  -- Generate lessons weekly until end_date or session cap
  WHILE v_current_date <= v_group.end_date
    AND v_created < v_max_lessons
  LOOP

    -- Skip if an active lesson already exists on this date for this group
    IF NOT EXISTS (
      SELECT 1 FROM lessons
       WHERE group_id    = p_group_id
         AND lesson_date = v_current_date
         AND is_active   = TRUE
    ) THEN

      INSERT INTO lessons (
        group_id,
        school_id,
        lesson_date,
        start_time,
        end_time,
        planned_instructor_id,
        lesson_owner_id,
        updated_by
      ) VALUES (
        p_group_id,
        v_group.school_id,
        v_current_date,
        v_start_time,
        v_end_time,
        v_group.default_instructor_id,
        p_owner_id,
        p_owner_id
      );

      v_created := v_created + 1;

    END IF;

    v_current_date := v_current_date + 7;

  END LOOP;

  RETURN v_created;

END;
$$;

COMMENT ON FUNCTION generate_group_lesson_skeleton(UUID, UUID) IS
  'Generates weekly skeleton lessons for a group within its date range. '
  'Idempotent — skips dates where a lesson already exists. '
  'Returns the number of new lessons created. '
  'No series shifting on cancellation — handle that manually via syllabus_review tasks.';


-- ============================================================
-- SECTION 11: COMPUTED LESSON STATUS FUNCTION
-- ============================================================
--
-- Not stored — computed on demand per row.
--
-- Priority order:
--   1. Cancelled              — cancelled_at IS NOT NULL
--   2. Completed With Exception — closed_at set + exception flag
--   3. Completed              — closed_at set, no exception
--   4. Awaiting Attendance    — started >5 min ago, no attendance
--   5. Awaiting Summary       — ended, has attendance, no summary
--   6. Ready To Close         — ended, all required fields present
--   7. Scheduled              — default / upcoming / in-progress
--
-- Ready To Close requires ALL of:
--   attendance_received = TRUE, attendance_count IS NOT NULL,
--   summary_received = TRUE,
--   actual_model_id OR actual_model_other_text IS NOT NULL,
--   actual_lesson_number IS NOT NULL, actual_stage_number IS NOT NULL,
--   lesson not closed, not cancelled.

CREATE OR REPLACE FUNCTION compute_lesson_status(
  p_lesson_date          DATE,
  p_start_time           TIME,
  p_end_time             TIME,
  p_cancelled_at         TIMESTAMPTZ,
  p_closed_at            TIMESTAMPTZ,
  p_closed_exception     BOOLEAN,
  p_attendance_recv      BOOLEAN,
  p_attendance_count     INTEGER,
  p_summary_recv         BOOLEAN,
  p_actual_model_id      UUID,
  p_actual_model_other   TEXT,
  p_actual_lesson_number INTEGER,
  p_actual_stage_number  INTEGER
)
RETURNS lesson_status
LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_lesson_start  TIMESTAMPTZ;
  v_lesson_end    TIMESTAMPTZ;
  v_now           TIMESTAMPTZ := app_now();
  v_data_complete BOOLEAN;
BEGIN

  v_lesson_start := lesson_ts(p_lesson_date, p_start_time);
  v_lesson_end   := lesson_ts(p_lesson_date, p_end_time);

  IF p_cancelled_at IS NOT NULL THEN
    RETURN 'Cancelled';
  END IF;

  IF p_closed_at IS NOT NULL THEN
    IF p_closed_exception = TRUE THEN
      RETURN 'Completed With Exception';
    ELSE
      RETURN 'Completed';
    END IF;
  END IF;

  IF v_now >= v_lesson_start + INTERVAL '5 minutes'
     AND p_attendance_recv = FALSE THEN
    RETURN 'Awaiting Attendance';
  END IF;

  IF v_now >= v_lesson_end
     AND p_attendance_recv = TRUE
     AND p_summary_recv = FALSE THEN
    RETURN 'Awaiting Summary';
  END IF;

  v_data_complete := (
    p_attendance_recv       = TRUE
    AND p_attendance_count  IS NOT NULL
    AND p_summary_recv      = TRUE
    AND (p_actual_model_id IS NOT NULL OR p_actual_model_other IS NOT NULL)
    AND p_actual_lesson_number IS NOT NULL
    AND p_actual_stage_number  IS NOT NULL
  );

  IF v_now >= v_lesson_end AND v_data_complete THEN
    RETURN 'Ready To Close';
  END IF;

  RETURN 'Scheduled';

END;
$$;


-- ============================================================
-- SECTION 12: DB-LEVEL CLOSURE INTEGRITY CONSTRAINT
-- ============================================================
--
-- Normal closure (closed_with_exception = FALSE) requires all
-- of: attendance_received, attendance_count, summary_received,
-- actual model (id or text), actual_lesson_number, actual_stage_number.
--
-- Exception closure has no data requirements by design.
--
-- The application must send all required fields together with
-- closed_at in one UPDATE — or populate them in a prior UPDATE
-- before setting closed_at.

ALTER TABLE lessons
  ADD CONSTRAINT lessons_normal_closure_requires_complete_data CHECK (
    NOT (
      closed_at IS NOT NULL
      AND closed_with_exception = FALSE
      AND NOT (
        attendance_received    = TRUE
        AND attendance_count   IS NOT NULL
        AND summary_received   = TRUE
        AND (actual_model_id IS NOT NULL OR actual_model_other_text IS NOT NULL)
        AND actual_lesson_number IS NOT NULL
        AND actual_stage_number  IS NOT NULL
      )
    )
  );


-- ============================================================
-- SECTION 13: ROW LEVEL SECURITY (RLS)
-- ============================================================
--
-- SELECT  → authenticated users see only is_active = TRUE rows.
-- INSERT  → any authenticated user.
-- UPDATE  → any authenticated user (including inactive rows,
--           to support reactivation).
-- DELETE  → BLOCKED. No DELETE policy is defined on any table.
--
-- Role split (admin vs manager) is NOT enforced at DB level.
-- service_role key bypasses RLS — never expose to the browser.
-- The profile auto-creation trigger (Section 8) uses SECURITY
-- DEFINER to bypass RLS during the signup flow.

ALTER TABLE areas                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools               ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors           ENABLE ROW LEVEL SECURITY;
ALTER TABLE models                ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups                ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons               ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_materials_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_tasks     ENABLE ROW LEVEL SECURITY;

-- areas
CREATE POLICY "areas_select" ON areas
  FOR SELECT TO authenticated USING (is_active = TRUE);
CREATE POLICY "areas_insert" ON areas
  FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "areas_update" ON areas
  FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- profiles
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated USING (is_active = TRUE);
CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- schools
CREATE POLICY "schools_select" ON schools
  FOR SELECT TO authenticated USING (is_active = TRUE);
CREATE POLICY "schools_insert" ON schools
  FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "schools_update" ON schools
  FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- instructors
CREATE POLICY "instructors_select" ON instructors
  FOR SELECT TO authenticated USING (is_active = TRUE);
CREATE POLICY "instructors_insert" ON instructors
  FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "instructors_update" ON instructors
  FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- models
CREATE POLICY "models_select" ON models
  FOR SELECT TO authenticated USING (is_active = TRUE);
CREATE POLICY "models_insert" ON models
  FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "models_update" ON models
  FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- groups
CREATE POLICY "groups_select" ON groups
  FOR SELECT TO authenticated USING (is_active = TRUE);
CREATE POLICY "groups_insert" ON groups
  FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "groups_update" ON groups
  FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- lessons
CREATE POLICY "lessons_select" ON lessons
  FOR SELECT TO authenticated USING (is_active = TRUE);
CREATE POLICY "lessons_insert" ON lessons
  FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "lessons_update" ON lessons
  FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- school_materials_state  [v1.3]
CREATE POLICY "materials_select" ON school_materials_state
  FOR SELECT TO authenticated USING (is_active = TRUE);
CREATE POLICY "materials_insert" ON school_materials_state
  FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "materials_update" ON school_materials_state
  FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- shortages
CREATE POLICY "shortages_select" ON shortages
  FOR SELECT TO authenticated USING (is_active = TRUE);
CREATE POLICY "shortages_insert" ON shortages
  FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "shortages_update" ON shortages
  FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- operational_tasks
CREATE POLICY "tasks_select" ON operational_tasks
  FOR SELECT TO authenticated USING (is_active = TRUE);
CREATE POLICY "tasks_insert" ON operational_tasks
  FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "tasks_update" ON operational_tasks
  FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);


-- ============================================================
-- SECTION 14: VIEW — v_today_lessons
-- ============================================================
--
-- All lessons for today (Sydney timezone).
-- Computes lesson status per row.
-- Unchanged from v1.2 except lesson_owner_id is exposed.

CREATE OR REPLACE VIEW v_today_lessons AS
SELECT
  l.id                                               AS lesson_id,
  l.lesson_date,
  l.start_time,
  l.end_time,
  s.name                                             AS school_name,
  s.city,
  g.name                                             AS group_name,
  i.full_name                                        AS instructor_name,
  l.lesson_owner_id,
  compute_lesson_status(
    l.lesson_date,
    l.start_time,
    l.end_time,
    l.cancelled_at,
    l.closed_at,
    l.closed_with_exception,
    l.attendance_received,
    l.attendance_count,
    l.summary_received,
    l.actual_model_id,
    l.actual_model_other_text,
    l.actual_lesson_number,
    l.actual_stage_number
  )                                                  AS computed_status,
  l.attendance_received,
  l.attendance_count,
  l.summary_received
FROM lessons l
JOIN schools      s ON s.id = l.school_id
JOIN groups       g ON g.id = l.group_id
LEFT JOIN instructors i
  ON i.id = COALESCE(l.actual_instructor_id, l.planned_instructor_id)
WHERE l.lesson_date = app_today()
  AND l.is_active = TRUE;


-- ============================================================
-- SECTION 15: VIEW — v_attention_queue
-- ============================================================
--
-- Primary operational surface. Returns all items requiring
-- manager action, ordered by priority then due date.
--
-- item_type values and priorities:
--   1  lesson_awaiting_attendance    — no attendance >5 min after start
--   2  lesson_awaiting_summary       — no summary after lesson ends
--   3  lesson_ready_to_close         — all data present, awaiting close
--   4  lesson_closed_with_exception  — unresolved exception (no resolved_at)
--   5  shortage_open                 — open shortage record
--   6  task_open                     — open operational task
--   7  group_progress_review         — curriculum mismatch not yet reviewed
--   8  school_material_shortage      — current_quantity < required_quantity
--
-- v1.3: Added school_material_shortage branch (priority 8).
-- All other branches unchanged from v1.2.

CREATE OR REPLACE VIEW v_attention_queue AS

-- 15a. Awaiting attendance
SELECT
  'lesson_awaiting_attendance'             AS item_type,
  1                                        AS priority,
  'Missing Attendance: ' || g.name         AS title,
  s.name || ' — ' || l.lesson_date::TEXT   AS description,
  l.id                                     AS related_lesson_id,
  l.group_id                               AS related_group_id,
  l.school_id                              AS related_school_id,
  NULL::UUID                               AS related_instructor_id,
  l.lesson_date                            AS due_date,
  l.created_at
FROM lessons l
JOIN groups  g ON g.id = l.group_id
JOIN schools s ON s.id = l.school_id
WHERE l.is_active = TRUE
  AND l.cancelled_at IS NULL
  AND l.closed_at IS NULL
  AND l.attendance_received = FALSE
  AND lesson_ts(l.lesson_date, l.start_time) <= app_now() - INTERVAL '5 minutes'

UNION ALL

-- 15b. Awaiting summary
SELECT
  'lesson_awaiting_summary'                AS item_type,
  2                                        AS priority,
  'Missing Summary: ' || g.name           AS title,
  s.name || ' — ' || l.lesson_date::TEXT   AS description,
  l.id, l.group_id, l.school_id, NULL::UUID,
  l.lesson_date, l.created_at
FROM lessons l
JOIN groups  g ON g.id = l.group_id
JOIN schools s ON s.id = l.school_id
WHERE l.is_active = TRUE
  AND l.cancelled_at IS NULL
  AND l.closed_at IS NULL
  AND l.attendance_received = TRUE
  AND l.summary_received = FALSE
  AND lesson_ts(l.lesson_date, l.end_time) <= app_now()

UNION ALL

-- 15c. Ready to close
-- All required closure fields present; lesson has ended.
SELECT
  'lesson_ready_to_close'                  AS item_type,
  3                                        AS priority,
  'Ready to Close: ' || g.name            AS title,
  s.name || ' — ' || l.lesson_date::TEXT   AS description,
  l.id, l.group_id, l.school_id, NULL::UUID,
  l.lesson_date, l.created_at
FROM lessons l
JOIN groups  g ON g.id = l.group_id
JOIN schools s ON s.id = l.school_id
WHERE l.is_active = TRUE
  AND l.cancelled_at IS NULL
  AND l.closed_at IS NULL
  AND l.attendance_received = TRUE
  AND l.attendance_count IS NOT NULL
  AND l.summary_received = TRUE
  AND (l.actual_model_id IS NOT NULL OR l.actual_model_other_text IS NOT NULL)
  AND l.actual_lesson_number IS NOT NULL
  AND l.actual_stage_number IS NOT NULL
  AND lesson_ts(l.lesson_date, l.end_time) <= app_now()

UNION ALL

-- 15d. Closed with exception — unresolved only.
-- Set exception_resolved_at to remove from queue.
SELECT
  'lesson_closed_with_exception'           AS item_type,
  4                                        AS priority,
  'Unresolved Exception: ' || g.name      AS title,
  COALESCE(l.exception_reason, 'No reason provided') AS description,
  l.id, l.group_id, l.school_id, NULL::UUID,
  l.lesson_date, l.created_at
FROM lessons l
JOIN groups  g ON g.id = l.group_id
WHERE l.is_active = TRUE
  AND l.closed_at IS NOT NULL
  AND l.closed_with_exception = TRUE
  AND l.exception_resolved_at IS NULL

UNION ALL

-- 15e. Open shortages
SELECT
  'shortage_open'                          AS item_type,
  5                                        AS priority,
  'Shortage: ' || sh.shortage_type::TEXT   AS title,
  sh.shortage_description                  AS description,
  sh.related_lesson_id, sh.related_group_id, sh.related_school_id,
  sh.related_instructor_id, sh.due_date, sh.created_at
FROM shortages sh
WHERE sh.is_active = TRUE
  AND sh.status = 'open'

UNION ALL

-- 15f. Open operational tasks
SELECT
  'task_open'                              AS item_type,
  6                                        AS priority,
  'Task: ' || ot.title                    AS title,
  COALESCE(ot.notes, '')                  AS description,
  ot.related_lesson_id, ot.related_group_id, ot.related_school_id,
  ot.related_instructor_id, ot.due_date, ot.created_at
FROM operational_tasks ot
WHERE ot.is_active = TRUE
  AND ot.status = 'open'

UNION ALL

-- 15g. Group alignment review required.
-- Surfaces when a closed lesson has curriculum mismatch or
-- alignment issue AND it was closed after alignment_reviewed_at
-- (or no review has been done).
-- Clear by setting groups.alignment_reviewed_at = NOW().
SELECT
  'group_progress_review'                  AS item_type,
  7                                        AS priority,
  'Progress Review: ' || g.name           AS title,
  s.name || ' — alignment issue detected' AS description,
  NULL::UUID, g.id, g.school_id, NULL::UUID,
  app_today(), g.created_at
FROM groups g
JOIN schools s ON s.id = g.school_id
WHERE g.is_active = TRUE
  AND g.status = 'active'
  AND EXISTS (
    SELECT 1 FROM lessons l_chk
    WHERE l_chk.group_id     = g.id
      AND l_chk.is_active    = TRUE
      AND l_chk.closed_at    IS NOT NULL
      AND l_chk.cancelled_at IS NULL
      AND (
            l_chk.planned_model_id        IS DISTINCT FROM l_chk.actual_model_id
         OR l_chk.planned_lesson_number   IS DISTINCT FROM l_chk.actual_lesson_number
         OR l_chk.planned_stage_number    IS DISTINCT FROM l_chk.actual_stage_number
         OR l_chk.all_students_aligned    = FALSE
      )
      AND (
            g.alignment_reviewed_at IS NULL
         OR l_chk.closed_at > g.alignment_reviewed_at
      )
  )

UNION ALL

-- 15h. School materials shortage  [NEW v1.3]
-- Surfaces when current_quantity < required_quantity.
-- No automatic procurement. Manager reviews and acts manually.
-- Remove from queue by updating current_quantity >= required_quantity.
SELECT
  'school_material_shortage'               AS item_type,
  8                                        AS priority,
  'Low Materials: ' || m.model_name        AS title,
  s.name || ' — '
    || sms.current_quantity::TEXT || ' of '
    || sms.required_quantity::TEXT || ' required'
                                           AS description,
  NULL::UUID                               AS related_lesson_id,
  NULL::UUID                               AS related_group_id,
  sms.school_id                            AS related_school_id,
  NULL::UUID                               AS related_instructor_id,
  NULL::DATE                               AS due_date,
  sms.created_at
FROM school_materials_state sms
JOIN schools s ON s.id = sms.school_id
JOIN models  m ON m.id = sms.model_id
WHERE sms.is_active = TRUE
  AND s.is_active   = TRUE
  AND m.is_active   = TRUE
  AND sms.current_quantity < sms.required_quantity

ORDER BY priority ASC, due_date ASC NULLS LAST, created_at ASC;


-- ============================================================
-- SECTION 16: RPC — get_instructor_lesson_summary
-- ============================================================
--
-- Date-ranged lesson count and estimated pay per instructor.
-- Requires explicit from_date and to_date.
-- Counts only: closed, non-cancelled, actual_instructor_id set,
-- lesson_date within range.
-- Returns all active instructors (0-count rows included).
--
-- Unchanged from v1.2.

CREATE OR REPLACE FUNCTION get_instructor_lesson_summary(
  from_date DATE,
  to_date   DATE
)
RETURNS TABLE (
  instructor_id   UUID,
  instructor_name TEXT,
  lesson_rate     NUMERIC,
  lesson_count    BIGINT,
  estimated_total NUMERIC
)
LANGUAGE plpgsql STABLE AS $$
BEGIN

  IF from_date IS NULL OR to_date IS NULL THEN
    RAISE EXCEPTION
      'get_instructor_lesson_summary: from_date and to_date are required';
  END IF;

  IF to_date < from_date THEN
    RAISE EXCEPTION
      'get_instructor_lesson_summary: to_date must be >= from_date';
  END IF;

  RETURN QUERY
  SELECT
    i.id,
    i.full_name,
    i.lesson_rate,
    COUNT(l.id),
    ROUND(COUNT(l.id) * COALESCE(i.lesson_rate, 0), 2)
  FROM instructors i
  LEFT JOIN lessons l
    ON  l.actual_instructor_id = i.id
    AND l.is_active             = TRUE
    AND l.closed_at             IS NOT NULL
    AND l.cancelled_at          IS NULL
    AND l.actual_instructor_id  IS NOT NULL
    AND l.lesson_date           BETWEEN from_date AND to_date
  WHERE i.is_active = TRUE
  GROUP BY i.id, i.full_name, i.lesson_rate
  ORDER BY i.full_name;

END;
$$;


-- ============================================================
-- SECTION 17: VIEW — v_group_alignment
-- ============================================================
--
-- Curriculum alignment state per group, based on last closed lesson.
-- has_mismatch: any planned vs actual deviation, or alignment issue.
-- requires_review: has_mismatch AND review is absent or predates close.
--
-- Unchanged from v1.2.

CREATE OR REPLACE VIEW v_group_alignment AS
WITH last_closed AS (
  SELECT DISTINCT ON (group_id)
    id, group_id, closed_at,
    planned_model_id, planned_model_other_text,
    actual_model_id, actual_model_other_text,
    planned_lesson_number, actual_lesson_number,
    planned_stage_number,  actual_stage_number,
    all_students_aligned
  FROM lessons
  WHERE is_active = TRUE AND closed_at IS NOT NULL AND cancelled_at IS NULL
  ORDER BY group_id, lesson_date DESC, closed_at DESC
)
SELECT
  g.id                                                        AS group_id,
  g.name                                                      AS group_name,
  lc.id                                                       AS last_closed_lesson_id,
  lc.closed_at                                                AS last_closed_at,
  pm.model_name                                               AS planned_model,
  COALESCE(am.model_name, lc.actual_model_other_text)         AS actual_model,
  lc.planned_lesson_number,
  lc.actual_lesson_number,
  lc.planned_stage_number,
  lc.actual_stage_number,
  lc.all_students_aligned,
  g.alignment_reviewed_at,
  g.alignment_reviewed_by,
  g.alignment_review_notes,
  (
    lc.planned_model_id        IS DISTINCT FROM lc.actual_model_id
    OR lc.planned_lesson_number IS DISTINCT FROM lc.actual_lesson_number
    OR lc.planned_stage_number  IS DISTINCT FROM lc.actual_stage_number
    OR lc.all_students_aligned = FALSE
  )                                                           AS has_mismatch,
  (
    (
      lc.planned_model_id        IS DISTINCT FROM lc.actual_model_id
      OR lc.planned_lesson_number IS DISTINCT FROM lc.actual_lesson_number
      OR lc.planned_stage_number  IS DISTINCT FROM lc.actual_stage_number
      OR lc.all_students_aligned = FALSE
    )
    AND (
      g.alignment_reviewed_at IS NULL
      OR g.alignment_reviewed_at < lc.closed_at
    )
  )                                                           AS requires_review
FROM groups g
LEFT JOIN last_closed lc ON lc.group_id = g.id
LEFT JOIN models pm ON pm.id = lc.planned_model_id
LEFT JOIN models am ON am.id = lc.actual_model_id
WHERE g.is_active = TRUE
ORDER BY requires_review DESC NULLS LAST, g.name;


-- ============================================================
-- SECTION 18: VIEW — v_school_materials_state  [NEW v1.3]
-- ============================================================
--
-- Materials state per school per model.
-- Read-only — manager updates school_materials_state directly.
--
-- shortage_count = required_quantity - current_quantity
--   Positive  → shortage (need more kits)
--   Zero      → exact match
--   Negative  → surplus (have more than needed)
--
-- has_shortage = TRUE when current_quantity < required_quantity.
--   This drives the school_material_shortage attention queue item.
--
-- last_updated_at: when the manager last physically verified
-- or updated the quantity. Distinct from updated_at (metadata).
-- The application must set last_updated_at explicitly when
-- recording a quantity change — it is not auto-maintained.

CREATE OR REPLACE VIEW v_school_materials_state AS
SELECT
  sms.id,
  sms.school_id,
  s.name                                              AS school_name,
  s.city                                              AS school_city,
  sms.model_id,
  m.model_name,
  sms.current_quantity,
  sms.required_quantity,
  sms.required_quantity - sms.current_quantity        AS shortage_count,
  sms.current_quantity < sms.required_quantity        AS has_shortage,
  sms.last_updated_at,
  sms.notes,
  sms.updated_by
FROM school_materials_state sms
JOIN schools s ON s.id = sms.school_id
JOIN models  m ON m.id = sms.model_id
WHERE sms.is_active = TRUE
  AND s.is_active   = TRUE
  AND m.is_active   = TRUE
ORDER BY has_shortage DESC, s.name, m.model_name;


-- ============================================================
-- END OF SCHEMA v1.3 — FINAL
-- ============================================================
