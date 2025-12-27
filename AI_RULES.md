# AI_RULES.md — SmartKidz

This document is the single source of truth for how AI assistants should work in this repo. Keep changes minimal, consistent with existing patterns, and avoid introducing new frameworks unless requested.

---

## Tech Stack (5–10 bullets)

- **Next.js (App Router)** with `app/` directory routing, server components by default, client components marked with `"use client"`.
- **React 18** for UI, with heavy use of **Client Components** for interactive app experiences.
- **TypeScript** is used in parts of the codebase (e.g. `*.ts`, `*.tsx`) and should be preferred for new logic/modules.
- **Tailwind CSS** for styling, with custom theme tokens in `styles/theme.css` and `styles/premium.css`, and global styles in `app/globals.css`.
- **Supabase** for Auth + Postgres data + RLS, using:
  - `@supabase/ssr` for server-side clients
  - `@supabase/supabase-js` for admin/server tasks and some client usage
- **Stripe** for subscriptions/checkout + webhook handling via `/app/api/stripe/*`.
- **Framer Motion** for premium UI motion in many app screens/components.
- **Playwright** for smoke + journey E2E tests (demo mode supported via `NEXT_PUBLIC_DEMO_MODE=1`).
- **PostHog** for optional analytics (no-ops without env vars).
- **Three.js + @react-three/fiber + drei** for the 3D World Explorer globe.

---

## Library & Architecture Rules (what to use for what)

### 1) Routing & Pages
- Use **Next.js App Router** conventions:
  - Pages live at `app/**/page.(js|jsx|ts|tsx)`
  - API routes live at `app/api/**/route.(js|ts)`
  - Layouts at `app/**/layout.(js|tsx)`
- Do not introduce React Router; routing is entirely Next.js based.
- For server-rendered pages, prefer `PageScaffoldServer` (`@/components/ui/PageScaffoldServer`) to avoid forcing client boundaries.

### 2) UI Layout & Scaffolding
- For most client pages, wrap content with:
  - `PageScaffold` (`@/components/ui/PageScaffold`)
- For server pages, wrap content with:
  - `PageScaffoldServer` (`@/components/ui/PageScaffoldServer`)
- Use existing bento helpers from the scaffold (`BentoGrid`, `BentoCard`, `Divider`, `Kpi`) rather than inventing new layout systems.

### 3) Styling
- Use **Tailwind CSS** first for all styling.
- Respect existing theme tokens and premium styles:
  - `styles/theme.css`, `styles/premium.css`, `app/globals.css`
- Do not add new CSS frameworks (no MUI, Chakra, etc.).
- Avoid inline styles unless needed for dynamic sizing/positioning.

### 4) Buttons, Cards, and Common UI
- Use existing primitives:
  - `Button` from `@/components/ui/Button`
  - `Card` from `@/components/ui/Card`
  - `Badge` from `@/components/ui/Badge`
  - `Pill` from `@/components/ui/Pill`
- If you need a new reusable UI element, create a new file in `components/ui/` and keep it small and focused.

### 5) Animation & Motion
- Use **Framer Motion** for UI animations where motion is needed.
- Respect reduced motion:
  - Prefer `useReducedMotion()` patterns as seen in the codebase.
- For page transitions in `/app`, rely on the existing providers/layouts:
  - `NavMotionProvider`, `FocusModeProvider`, `MomentsProvider`, `RewardProvider`

### 6) Notifications, Rewards, and Feedback
- Prefer the existing reward/toast system:
  - `useRewards()` from `@/components/ui/RewardProvider`
- For audio + haptics:
  - `playUISound()` and `haptic()` from `@/components/ui/sound`
- Do not add new toast libraries unless explicitly requested.

### 7) Supabase Usage Rules (Client vs Server)
- **Client Components**:
  - Use `createClient()` from `@/lib/supabase/client` (or `getSupabaseClient()` via `@/lib/supabaseClient` for back-compat).
  - Never use service role keys in client code.
- **Server Components / Route Handlers**:
  - Use `createClient()` from `@/lib/supabase/server` for user-session aware reads.
  - Use `getSupabaseAdmin()` from `lib/supabaseAdmin.js` ONLY for admin/server tasks (webhooks, cron, protected server export/import).
- Prefer RLS-safe patterns and existing RPCs where present.

### 8) Stripe Rules
- Stripe logic must remain server-side (route handlers under `app/api/stripe/*`).
- Do not expose secret keys to the browser.
- Keep webhook verification using raw body (`req.text()`) as currently implemented.

### 9) Analytics Rules
- Use:
  - `track()` from `@/lib/telemetry/track`
  - event names from `@/lib/telemetry/events`
- Analytics must no-op cleanly when env vars are missing.

### 10) Demo / UAT Mode
- Respect `NEXT_PUBLIC_DEMO_MODE`:
  - In demo mode the app should render even without Supabase configured.
  - Avoid hard-failing UI when Supabase is missing; use existing safe fallbacks where already implemented.

### 11) File/Folder Conventions
- Keep code in existing top-level folders:
  - `app/` for routes
  - `components/` for UI/features
  - `lib/` for shared logic
  - `hooks/` for hooks
  - `data/` for static data
- Prefer TypeScript for new `lib/` modules and hooks.

### 12) Keep It Consistent
- Do not refactor unrelated files.
- Reuse existing patterns and naming:
  - existing hooks (`useSession`, `useProfile`, `useActiveChild`)
  - existing UI systems (`skz-*` classes, scaffolds, rewards)
- Avoid adding new dependencies unless the feature truly requires it and the user requests it.