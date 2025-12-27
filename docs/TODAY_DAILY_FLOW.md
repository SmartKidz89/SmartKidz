# Today (Daily 3‑Mission Flow)

## Purpose
Reduce decision fatigue and build daily learning habits with a fixed routine:
1) Reading
2) Writing
3) Maths

## Routes
- `/app/today` — Today’s Plan
- `/app/today/complete?mission=reading|writing|maths` — Mark a mission complete

## Tracking
- MVP progress: localStorage per-user per-local-date (`lib/today/session.js`)
- When a mission is marked complete, a lightweight row is also written to `attempts` (for future streaks + weekly stories).

## Next upgrades
- Streaks and weekly learning stories
- Teacher/parent-assigned daily plans
- Cloud storage for reading recordings (Supabase Storage)
