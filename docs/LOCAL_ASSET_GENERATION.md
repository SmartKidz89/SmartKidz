# Local asset generation (Forge / Stable Diffusion)

This project can generate missing image assets **locally** using WebUI Forge/A1111 SDAPI and upload them into your production Supabase Storage.

This avoids OpenAI limits and avoids running Stable Diffusion on Vercel.

## Prerequisites

1. WebUI Forge is running with SDAPI enabled:
   - Start Forge with: `python launch.py --api --listen --port 7860`
   - Verify in a browser: `http://127.0.0.1:7860/sdapi/v1/options` returns JSON

2. Your local `.env.local` contains at least:

```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ASSETS_BUCKET=assets
SD_API_URL=http://127.0.0.1:7860
```

## Run

From the project root:

```bash
node scripts/generate-assets-local.mjs --limit 50
```

Optional flags:

- `--dry-run` (shows what would be generated, but does not generate/upload)
- `--width 1024 --height 576`
- `--limit 25`

## What it does

- Finds rows in `public.assets` where `asset_type='image'` and `metadata.public_url` is null.
- Uses `metadata.prompt` when present; otherwise synthesizes a reasonable prompt from `alt_text` / `uri`.
- Calls Forge `POST /sdapi/v1/txt2img`.
- Uploads PNG to Supabase Storage bucket and writes `metadata.public_url`.

## Notes

- This script requires the Supabase **service role** key. Keep it local and never expose it in the browser.
