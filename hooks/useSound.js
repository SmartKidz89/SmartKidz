
"use client";

import { useCallback } from "react";

// Simple sounds - optional: replace with real audio files later
const SOUNDS = {
    click: "/sounds/click.mp3",
    hover: "/sounds/hover.mp3",
    success: "/sounds/success.mp3",
};

export function useSound() {
    const play = useCallback((type = "click") => {
        // In a real implementation we'd play an audio file.
        // user interaction required for audio often.
        // For now, this is a placeholder or could use Web Audio API for synth sounds.
        // We'll leave it empty to avoid 404s on missing mp3s, 
        // but the hook is ready for when files are added.
        // console.log(`Playing sound: ${type}`);
    }, []);

    return { play };
}
