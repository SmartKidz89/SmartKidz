# Writing Studio Phase 4 – Path Matching (Tracing)

## What it adds
For letter tracing mode, the app now calculates a conservative similarity score between:
- The learner’s traced strokes
- A normalized “template” letter path

It also provides a simple “start zone” hint to encourage correct starting position.

## Where it shows
- /app/english/writing → Writing feedback panel → "Tracing match"

## How it works (MVP)
- Flatten strokes into one polyline
- Resample to fixed number of points
- Normalize into unit box [0,1]
- Compute average point-to-point distance
- Map distance to a 0–100 score (gentle guide)

## Templates
- Stored in `lib/writing/templates.js`
- MVP includes A–E (easy to extend to full A–Z)

## Next improvements
- Full A–Z templates + lowercase variants
- Stroke-order models (multi-stroke recognition)
- Better alignment using Procrustes / DTW variants
- Per-segment feedback: "corner here", "curve here"


## Update
- Templates expanded to full A–Z and a–z.
- Letters mode now supports tracing uppercase only, lowercase only, or both.
