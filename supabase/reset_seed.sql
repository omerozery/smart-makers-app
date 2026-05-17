-- ============================================================
-- Smart Makers — Reset Seed Data
-- ============================================================
-- Wipes all seed data so seed.sql can be re-run cleanly.
-- WARNING: deletes ALL rows from ALL operational tables.
-- Only run on a development/test project.
-- ============================================================

TRUNCATE TABLE
  operational_tasks,
  shortages,
  school_materials_state,
  lessons,
  groups,
  models,
  instructors,
  schools
RESTART IDENTITY CASCADE;

-- Remove the seed profile (bypassing FK to auth.users)
SET session_replication_role = replica;
DELETE FROM public.profiles WHERE id = 'a0000000-0000-0000-0000-000000000001';
SET session_replication_role = DEFAULT;
