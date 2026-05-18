# Smart Makers Operations System — Developer Handoff

**Version:** 1.0  
**Status:** Ready for Development  
**Prepared for:** Lead Developer  
**Do not modify scope without written approval from the product owner.**

-----

## 1. System Description

### Purpose

An internal web-based operational control dashboard for a Regional Manager at Smart Makers — an educational company running hands-on STEM programs in primary schools (ages 6–10).

The system solves one specific problem:

> The Regional Manager has no single reliable place to see what lessons are running, who is teaching them, whether they happened, and what needs attention right now.

### Target Users — V1

- **One Regional Manager** — all data entry and operational management
- **One System Administrator** — full access

No instructor login. No parent portal. No public-facing features.

### Design Philosophy

- **Management By Exception** — if everything is operating correctly, the system should feel quiet
- **Operational clarity over feature richness** — if the manager doesn’t open it every morning, the system has failed
- **Data foundation over data processing** — V1 captures clean structured records; payroll and finance connect in Phase 2
- **Nothing is deleted** — records are marked inactive, never hard deleted
- **Smallest possible system** that lets one manager maintain control over schools, groups, lessons, attendance confirmation, instructor follow-up, and open alerts

-----

## 2. Technology Stack

|Layer         |Choice                  |Reason                                                              |
|--------------|------------------------|--------------------------------------------------------------------|
|Frontend      |Next.js (App Router)    |First-class Vercel deployment                                       |
|Database      |Supabase (PostgreSQL)   |Project already provisioned; built-in auth and RLS                  |
|Authentication|Supabase Auth           |Native RLS integration via `auth.uid()`                             |
|Hosting       |Vercel                  |Zero-config Next.js deployment                                      |
|Styling       |Tailwind CSS            |Default for Next.js                                                 |
|UI Components |shadcn/ui               |Consistent design language, no lock-in                              |
|Forms         |react-hook-form + zod   |Standard pattern, shared validation                                 |
|Language      |TypeScript (strict mode)|Required. No untyped code.                                          |
|Migrations    |Supabase CLI            |All schema changes via versioned migration files committed to GitHub|

**One library per concern. Do not introduce alternatives without approval.**

### UI Language

- **Manager-facing interface: Hebrew, RTL layout**
- **Code, database, filenames, variables: English only**

RTL must be configured from day one in Tailwind. Do not start frontend work without this in place.

### Device Target

- **Primary: Desktop and laptop browser**
- **Secondary: Tablet**
- Basic iOS Safari compatibility is useful but not the main design target
- No mobile app. No responsive-mobile-first design.

-----

## 3. Database Schema

**The complete schema is in `smart_makers_schema_v1.3.sql`.**  
Run it once in full on a fresh Supabase project via the SQL Editor. Do not run sections individually.

After running, verify:

1. A test auth user creates a row in `public.profiles`
1. `generate_group_lesson_skeleton()` creates lesson skeletons for a test group
1. Cancelling a lesson creates an `operational_task` of type `syllabus_review`

### Schema Summary — Core Tables

|Table                   |Purpose                                                            |
|------------------------|-------------------------------------------------------------------|
|`profiles`              |System users (admin, manager)                                      |
|`areas`                 |Reference table for future multi-area operation (nullable in pilot)|
|`schools`               |School registry                                                    |
|`instructors`           |Instructor registry with per-lesson rate                           |
|`models`                |Curriculum models (kit definitions)                                |
|`groups`                |Class groups linked to schools                                     |
|`lessons`               |Individual lesson records (the atomic operational unit)            |
|`shortages`             |Materials or equipment shortage tracking                           |
|`operational_tasks`     |Follow-up tasks linked to operational entities                     |
|`school_materials_state`|Materials inventory state per school per model                     |

### Key Views (pre-built in schema)

- `v_attention_queue` — all items requiring manager attention, prioritised
- `v_group_alignment` — curriculum alignment state per group
- `v_school_materials_state` — materials shortage state

### Key RPC Functions (pre-built in schema)

- `generate_group_lesson_skeleton(group_id)` — creates lesson records from group schedule
- `get_instructor_lesson_summary(from_date, to_date)` — lesson count and estimated pay per instructor

### Lesson Status Logic

Lesson status is **computed, not stored** — derived from the state of the lesson record.

|Status                    |Condition                                           |
|--------------------------|----------------------------------------------------|
|`Scheduled`               |Lesson date/time has not yet started                |
|`Awaiting Attendance`     |5+ minutes past lesson start, no attendance received|
|`Awaiting Summary`        |Lesson end time passed, no summary received         |
|`Ready To Close`          |All required fields present, not yet closed         |
|`Completed`               |Closed normally — all fields present                |
|`Completed With Exception`|Closed with missing data, exception reason provided |
|`Cancelled`               |Lesson cancelled with recorded reason               |

### Lesson Closure Rules

A lesson can close normally only if:

- `attendance_received = true`
- `attendance_count` is set
- `summary_received = true`
- `actual_model_id` is set
- `actual_lesson_number` is set
- `actual_stage_number` is set

If any field is missing, the manager may choose **Close With Exception** — requires `exception_reason`. The lesson closes, counts for payroll, leaves the attention queue, but retains an exception flag.

### Planned vs Actual

Every lesson has both planned and actual fields for model, lesson number, and stage number. The system surfaces deviations — it does not auto-correct syllabus progression. The manager intervenes manually.

### Audit Fields

All tables include `created_at`, `updated_at`, `updated_by`.  
Lessons additionally include `closed_at`, `closed_by`, `exception_closed_at`, `exception_reason`.  
**`updated_by` is set by the application on every INSERT and UPDATE — not by trigger.**

-----

## 4. Architecture Decisions — Locked

|Decision             |Outcome                                                                                       |
|---------------------|----------------------------------------------------------------------------------------------|
|Lesson status        |Computed, not stored. Four active states + Cancelled + exception variant.                     |
|Auto-resolution      |**Prohibited.** System never auto-resolves lesson status. Only user actions change status.    |
|Manual override      |Once applied, cannot be overwritten by any automated process.                                 |
|Hard deletes         |**Prohibited.** Use `is_active = false`. No delete button exposed in UI for core entities.    |
|Conflict detection   |Soft warnings only (duplicate instructor schedule, duplicate school slot). No blocking engine.|
|Payroll in V1        |`Completed Lessons Count × instructor.lesson_rate` — no travel, no tax, no invoices.          |
|WhatsApp templates   |**Out of scope for MVP.** Removed entirely.                                                   |
|PlanDo integration   |**Out of scope for MVP.** No API, no sync, no dependency. Manual data entry only.             |
|External integrations|**None in MVP.** No API connections to any external system.                                   |
|Multi-user / roles   |Admin and Manager only. Server-side enforcement on every request.                             |
|Notifications        |**None in MVP.** All flags surface on dashboard only.                                         |

-----

## 5. Core Operational Flow

### Group Creation

1. Manager creates a Group (school, name, day, time, start date, end date, session count, default instructor)
1. System auto-creates lesson skeletons via `generate_group_lesson_skeleton()`
1. Manager fills planned model, lesson number, and stage number for each lesson

### Daily Operational Loop

1. Lesson is scheduled
1. 5 minutes after start → system flags **Awaiting Attendance**
1. Manager confirms attendance was received
1. After lesson end → system flags **Awaiting Summary**
1. Manager confirms instructor summary received
1. Manager closes the lesson (normal or with exception)
1. Unclosed lessons remain visible as alerts in the Attention Queue

### Cancellation

- Manager cancels lesson → `cancelled_reason` required
- System auto-creates an `operational_task` of type `syllabus_review`
- No automatic syllabus shifting

-----

## 6. Attention Queue

The `v_attention_queue` view surfaces all items requiring manager attention, in priority order:

1. Missing attendance (past grace period)
1. Missing summary
1. Lessons closed with exception
1. Replaced instructor flag
1. Cancelled lesson requiring follow-up
1. Group off planned progress
1. Missing planned model for upcoming lesson
1. Open shortage
1. Open operational task
1. Upcoming scheduling risk

-----

## 7. Dashboard Structure

### Section A — Today Timeline

- Upcoming lessons
- Active lessons
- Completed lessons
- Fields shown: time, school, group, instructor, status, attendance, summary

### Section B — Attention Queue

- All items from `v_attention_queue`
- Emphasis on unresolved flags and open loops

-----

## 8. Implementation Phases

Build in this order. Do not begin a phase until the previous phase is deployed and working in production.

|Phase      |Scope                           |Goal                                        |
|-----------|--------------------------------|--------------------------------------------|
|**Phase 0**|Schema + Auth + Seed Data       |DB running, two users created, RLS verified |
|**Phase 1**|Lesson Page                     |Core operational interaction working        |
|**Phase 2**|Today Dashboard                 |Manager can see daily status at a glance    |
|**Phase 3**|Groups + Schools                |Full group creation and lesson generation   |
|**Phase 4**|Shortages + Tasks               |Operational follow-up centralised           |
|**Phase 5**|Instructor Page + Lesson Summary|Instructor management and estimated payroll |
|**Phase 6**|Pilot Testing                   |Manager uses system for 4+ consecutive weeks|

**Phase 1 is not complete until it is deployed and working on the Vercel production URL.**

-----

## 9. What NOT to Build in MVP

Do not build the following without explicit written approval:

- Payroll calculation beyond lesson count × rate
- Travel or km reimbursement
- Rental cost tracking
- Invoice or payslip generation
- Instructor login or instructor-facing screens
- Parent or student portal
- WhatsApp integration or message templates
- Email or SMS notifications
- PlanDo or any external system integration
- Advanced scheduling engine or conflict blocking
- Analytics dashboards or trend reports
- Multi-region or multi-franchise support
- Pedagogical progress tracking (curriculum stages per student)
- Mobile app (responsive web targeting desktop is sufficient)

-----

## 10. MVP Success Definition

The MVP succeeds if:

- The manager checks the dashboard every morning
- No lesson falls through the cracks for 4 consecutive weeks
- Missing attendance becomes consistently visible
- Missing summaries are reduced
- Operational follow-up is centralised
- The manager feels reduced operational stress

-----

## 11. Open Questions — Resolve Before Development

|#  |Question                                                                                                        |Impact                        |Priority|
|---|----------------------------------------------------------------------------------------------------------------|------------------------------|--------|
|OQ1|Is any existing data to be migrated at launch? (school list, instructor list, group schedules — format?)        |Adds migration task to Phase 0|High    |
|OQ2|What is the exact `exception_reason` list? Fixed values or free text?                                           |Affects lesson closure UX     |Medium  |
|OQ3|What shortage types are used in practice? (schema has: instructor_kit, school_materials, group_materials, other)|Confirm or adjust enum        |Medium  |
|OQ4|Daily sync time or automated job — is any background scheduling required in MVP?                                |Affects infrastructure setup  |Low     |

All other questions from earlier documents are resolved or deferred to post-pilot phases.

-----

## 12. Developer Instructions

### Do First — In This Order

1. Read `smart_makers_schema_v1.3.sql` in full before writing any code
1. Write `ARCHITECTURE.md` and `CONVENTIONS.md` — commit them — point Cursor at these files every session
1. Configure RTL in Tailwind before building any UI component
1. Run the full schema on Supabase, verify all three post-run checks
1. Deploy a blank “Hello World” to Vercel before any feature code
1. Build Phase 1 (Lesson Page) end-to-end before starting Phase 2

### Do Not Change Without Client Approval

- Lesson status states and transition rules
- The closure rule requiring all fields before normal close
- The exception override policy
- Append-only audit fields
- The prohibition on hard deletes
- The prohibition on auto-resolving lesson status
- The payroll formula (lesson count × rate only)
- The phase build order

### Defensive Practices Against AI-Generated Drift

- Open `ARCHITECTURE.md` and `CONVENTIONS.md` before each Cursor session
- After Cursor generates code, diff it against the established pattern
- If Cursor suggests a new library — refuse unless explicitly approved
- If Cursor suggests skipping RLS “for now” — refuse

### Escalate Immediately If

- Schema v1.3 conflicts with this document
- Supabase Auth behaviour differs from the official Next.js guide
- RLS scoping fails in a way that requires schema changes
- Any phase exceeds its time estimate by more than 50%

-----

*Document version: 1.0 — Pilot MVP handoff*  
*Based on: Pilot MVP Technical Blueprint + Smart Makers Schema v1.3*  
*All decisions documented here are final unless changed in writing by the product owner.*  
*Developer questions not covered here should be directed to the product owner before implementation.*