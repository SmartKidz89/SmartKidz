# Reading Studio (Prep–Year 3)

## What it includes
- Read Along: voiceover + tap-to-hear word + sentence highlight
- Echo Reading: listen to one sentence, then record and play back
- Sight Words: banded sight word list with audio + recording
- Comprehension: 2–3 gentle questions per passage

## Content library
- `data/reading/library.json`
- Mix of original Smart Kidz passages + public-domain-inspired retellings (written in new wording)

## Storage
- Saves reading session metadata into `attempts` (migration 0003 in prior ZIP).
- Recording audio is playback-only (local). If you want cloud review, we can add Supabase Storage upload next.

## Next upgrade options
- Reading review screen (history + trends)
- Teacher/parent assignments for passages
- Speech-to-text scoring (premium)
