# Step 3 Lesson Builder (Production-grade)

This step upgrades the Lesson Builder so it is safer and more usable in production.

## What changes

- **Lesson JSON validation + automatic repair** (Ajv + 1 repair pass via your Llama endpoint).
- **Normalized `lesson_content_items` generation** from the lesson wrapper JSON, so the lesson UI can render activities consistently.
- **Asset jobs upgraded**:
  - Optional `usage` + `target_content_id` fields so generated assets can be attached to content items automatically.
  - Automatic insertion into `public.assets` + linking into `public.content_item_assets` after each ComfyUI generation.
- **Year Profiles import** from the spreadsheet (optional). If present, these fields are injected into the prompt template variables.
- **ComfyUI workflow templates in Supabase** (optional) with an Admin UI page.

## DB migration

Run:

- `docs/STEP3_LESSON_BUILDER_PRO_UPDATES.sql`

## Env vars

### LLM (self-hosted Llama)
- `LLM_BASE_URL` (OpenAI-compatible, e.g. `https://your-llama-host/v1`)
- `LLM_MODEL` (e.g. `llama-3.1-70b-instruct`)
- `LLM_API_KEY` (optional)

### ComfyUI
- `COMFYUI_BASE_URL` (must be reachable from Vercel; typically HTTPS)
- `LESSON_ASSETS_BUCKET` (default `cms-assets`)

### Workflow templates (optional)
- `COMFYUI_WORKFLOW_SOURCE`:
  - `file` (default): uses `comfyui/workflows/<name>.json`
  - `db`: loads from `public.comfyui_workflows`
  - `auto`: try DB first, then file

## Admin UI

- `/admin/workflows`: upload/edit workflow JSON stored in Supabase
- `/admin/lesson-builder`: import spreadsheet, generate lessons, generate assets

