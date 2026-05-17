# Smart Makers — Conventions

> Open this file at the start of every coding session.

## Naming

| Thing              | Convention         | Example                        |
|--------------------|--------------------|--------------------------------|
| Files/folders      | kebab-case         | `lesson-card.tsx`              |
| Components         | PascalCase         | `LessonCard`                   |
| Functions/vars     | camelCase          | `fetchLesson`                  |
| DB columns         | snake_case         | `actual_instructor_id`         |
| Zod schemas        | PascalCase + Schema| `CloseLessonSchema`            |
| Server Actions     | camelCase verb     | `closeLesson`, `cancelLesson`  |
| Supabase views     | `v_` prefix        | `v_attention_queue`            |
| Supabase RPCs      | snake_case verb    | `generate_group_lesson_skeleton` |

## Component Rules

- `components/ui/` — shadcn primitives only, never edited manually
- `components/[feature]/` — feature components, e.g. `components/lessons/`
- Server Components by default; add `"use client"` only when needed (interactivity, hooks)

## Supabase Mutations

Every INSERT and UPDATE **must** include `updated_by: currentProfileId`.

```ts
await supabase
  .from("lessons")
  .update({ attendance_received: true, updated_by: profileId })
  .eq("id", lessonId)
```

## Server Actions

Place in `app/(dashboard)/[feature]/actions.ts`. Always:
1. Get the current user with the server client
2. Look up `profiles.id` for `updated_by`
3. Return typed results `{ data, error }`

## Lesson Closure Checklist

Normal close requires all six fields present:
- `attendance_received = true`
- `attendance_count` set
- `summary_received = true`
- `actual_model_id` or `actual_model_other_text` set
- `actual_lesson_number` set
- `actual_stage_number` set

If any are missing → use Close With Exception (requires `exception_reason`).

## Locked Rules — Never Change Without Written Approval

- Lesson status is computed, never stored
- No auto-resolution of lesson status
- No hard deletes (`is_active = false` only)
- No automatic syllabus shifting on cancellation
- Payroll = lesson count × rate only
- No external integrations
- No WhatsApp sending (templates only, copy to clipboard)

## Phase Build Order

Build phases in order. Do not start a phase until the previous one works in production.

1. Phase 0 — Schema + Auth + Seed Data ← **current**
2. Phase 1 — Lesson Page
3. Phase 2 — Today Dashboard
4. Phase 3 — Groups + Schools
5. Phase 4 — Shortages + Tasks
6. Phase 5 — Instructor Page + Lesson Summary
7. Phase 6 — Pilot Testing
