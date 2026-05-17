# Smart Makers — Architecture

> Open this file at the start of every coding session.

## Stack

| Layer      | Choice                        |
|------------|-------------------------------|
| Framework  | Next.js 16 (App Router)       |
| Database   | Supabase (PostgreSQL)         |
| Auth       | Supabase Auth via `@supabase/ssr` |
| Styling    | Tailwind CSS v4               |
| Components | shadcn/ui (Radix primitives)  |
| Forms      | react-hook-form + zod         |
| Language   | TypeScript strict             |

## Directory Structure

```
smart-makers-app/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth routes (login, etc.)
│   ├── (dashboard)/            # Protected dashboard routes
│   │   ├── dashboard/          # Today view
│   │   ├── lessons/            # Lesson pages
│   │   ├── groups/             # Groups management
│   │   ├── schools/            # Schools management
│   │   ├── instructors/        # Instructor pages
│   │   ├── shortages/          # Shortages
│   │   └── tasks/              # Operational tasks
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                     # shadcn/ui primitives (auto-generated, do not edit)
│   └── [feature]/              # Feature-specific components
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   └── server.ts           # Server client (RSC / Server Actions)
│   └── utils.ts                # cn() helper
├── hooks/                      # Custom React hooks
├── supabase/
│   └── migrations/             # SQL migration files (source of truth)
├── middleware.ts               # Auth redirect logic
├── .env.local                  # Local env (never commit)
└── .env.example                # Env template (commit this)
```

## Key Patterns

### Data Fetching
- Server Components fetch directly via `lib/supabase/server.ts`
- Client Components use `lib/supabase/client.ts`
- Mutations go through Next.js Server Actions

### Auth
- Middleware redirects unauthenticated users to `/login`
- All protected routes live under `app/(dashboard)/`
- Role check (admin vs manager) happens server-side on every request

### Lesson Status
- **Never stored in the database** — always computed via `compute_lesson_status()` RPC
- Query `v_today_lessons` or `v_attention_queue` views directly; they call the function
- Do not add a `status` column to the lessons table

### Forms
- All forms use `react-hook-form` with `zod` schema validation
- Shared validation schemas live in `lib/validations/`
- Always pass `updated_by: currentProfileId` on every INSERT and UPDATE

### No Hard Deletes
- Set `is_active = false` instead of DELETE
- RLS SELECT policies filter `is_active = TRUE` automatically
- No delete buttons in the UI for core entities

## UI Rules
- Language: Hebrew, RTL (`dir="rtl"` on `<html>`, `lang="he"`)
- Code/variables/DB: English only
- Device target: Desktop browser (no mobile breakpoints needed)
- One library per concern — do not add alternatives without approval
