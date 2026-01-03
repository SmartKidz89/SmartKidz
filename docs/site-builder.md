# Site Builder (in-app page editor)

This repo now includes a lightweight "Site Builder" that lets an admin user:

- Create/delete pages
- Add/reorder blocks (Hero, Section, Cards, Markdown, Spacer)
- Publish pages to public marketing routes or in-app routes
- Optionally draft a page using OpenAI ("AI draft")

## 1) Database changes (Supabase)

Run the SQL in the **"7) Site Builder (CMS pages)"** section of `SUPABASE_SCHEMA_AND_RLS_FIXED_v2.sql` in your Supabase SQL editor.

This creates:

- `public.cms_pages` table
- RLS policies:
  - public read of published pages
  - admin-only write (based on `profiles.role = 'admin'`)

## 2) Routes

### Admin editor

- `/app/admin/site-builder`

### Published page rendering

- Marketing (public): `/marketing/p/<slug>`
- In-app: `/app/p/<slug>`

The page record includes `scope` (`marketing` or `app`) and `slug` (the part after the base path).

## 3) Environment variables

The editor requires users to be authenticated and have `profiles.role = 'admin'`.

The AI draft button requires:

- `OPENAI_API_KEY`

Optional (if you want a specific model):

- `OPENAI_TEXT_MODEL`

## 4) Extending the builder

Block definitions live in:

- `lib/cms/blocks.js` (defaults and allowed types)
- `components/cms/RenderBlocks.jsx` (front-end rendering)
- `components/cms/SiteBuilderEditor.jsx` (editing UI)

To add a new block type:

1. Add it to `BLOCK_TYPES`
2. Add a default in `defaultBlock(type)`
3. Implement rendering in `RenderBlocks`
4. Implement fields in `BlockFields` inside `SiteBuilderEditor`
