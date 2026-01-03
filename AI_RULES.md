# AI Rules & Tech Stack

## Tech Stack

*   **Framework**: Next.js 15 (App Router).
*   **Language**: JavaScript / JSX (React).
*   **Styling**: Tailwind CSS.
*   **Database & Auth**: Supabase (PostgreSQL + Auth).
*   **Payments**: Stripe.
*   **Animations**: Framer Motion.
*   **Icons**: Lucide React.
*   **AI**: OpenAI API.
*   **Testing**: Playwright.
*   **Deployment**: Vercel.

## Development Rules

1.  **Routing**: Use Next.js App Router (`app/` directory). Use `page.jsx` for routes and `layout.jsx` for layouts. Keep logic in Client Components (`"use client"`) when interactivity is needed.
2.  **Styling**:
    *   Use Tailwind CSS utility classes for all styling.
    *   Adhere to the design tokens in `tailwind.config.js` (e.g., `brand`, `candy` color palettes).
    *   Maintain the distinction between `.app-ui` (dashboard) and `.marketing-ui` (landing pages) themes.
3.  **Components**:
    *   Prioritize using existing UI components in `components/ui/` (e.g., `Button`, `Card`, `PageScaffold`, `Pill`) over raw HTML.
    *   Use `lucide-react` for all icons.
    *   Use `framer-motion` for animations, utilizing the shared variants in `lib/motion.js` for consistency.
4.  **State Management**:
    *   Use React Context for global application state (e.g., `ActiveChildProvider`, `RewardProvider`, `ThemeContext`).
    *   Use `localStorage` wrappers (in `lib/`) for client-side persistence of non-critical data.
5.  **Data Fetching & Backend**:
    *   Use the Supabase client from `@/lib/supabase/client` for client-side operations.
    *   Use Route Handlers (`app/api/`) for server-side logic, third-party API integrations (OpenAI, Stripe), and admin tasks.
    *   Respect Row Level Security (RLS) policies by using the authenticated user's session.
6.  **File Structure**:
    *   `app/`: Pages and layouts.
    *   `components/`: Reusable UI and feature-specific components.
    *   `lib/`: Utility functions, hooks, and shared logic.
    *   `public/`: Static assets (images, sounds).
7.  **Coding Standards**:
    *   Use functional React components with Hooks.
    *   Ensure responsiveness (mobile-first via Tailwind).
    *   Handle errors gracefully and provide user feedback (e.g., toasts, error states).