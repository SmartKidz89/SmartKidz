# Writing & Tracing Studio (English)

## What it is
A handwriting practice tool for children (desktop MVP) that supports:
- Letter tracing (uppercase + lowercase)
- Sentence writing between handwriting guidelines
- Configurable guideline styles and tracing visibility
- Saveable practice attempts (if an attempts table exists)

## Routes
- /app/english — English Hub
- /app/english/writing — Writing & Tracing Studio

## How practice is saved
The studio attempts to write to:
- attempts (preferred)
- practice_attempts (fallback)

If neither table exists, the UI still works; saving will show a helpful message.

## Next upgrades (Phase 2)
- Baseline/spacing feedback metrics
- Stroke smoothing
- Tablet/stylus optimisations
- Assign-to-child and review flows for parents/teachers
