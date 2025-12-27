# SmartKidz Sound + Haptics (Step 13)

This release adds optional UI sound and vibration feedback.

- Tap: light beep + light vibrate
- Lesson complete: pleasant two-tone chime + medium vibrate
- Rewards/streak toasts: chime + light vibrate

Implementation uses WebAudio oscillator by default (no assets required).  
If you want richer audio, add files:

- public/sounds/tap.mp3
- public/sounds/complete.mp3
- public/sounds/streak.mp3

Then flip `hasFiles` to `true` in `components/ui/sound.ts`.
