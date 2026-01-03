const BLOCKLIST = [
  "kill", "murder", "death", "die", "dead", "suicide", "hurt", "pain", "blood", "bleed",
  "sex", "naked", "nude", "porn", "xxx", "erotic", "kiss", "body part",
  "gun", "shoot", "weapon", "bomb", "terror", "attack", "fight", "war",
  "stupid", "idiot", "dumb", "hate", "ugly", "fat", "shut up",
  "drug", "beer", "wine", "alcohol", "smoke", "cigarette",
  "hell", "damn", "ass", "crap", "shit", "fuck", "bitch", "bastard"
];

/**
 * Checks if the text contains any inappropriate terms.
 * Returns { safe: boolean, reason: string | null }
 */
export function checkContentSafety(text) {
  if (!text) return { safe: true };
  
  const lower = text.toLowerCase();
  
  // 1. Check specific blocklist terms
  for (const word of BLOCKLIST) {
    // Check for whole words or words embedded in spaces
    // Simple inclusion check is often safer for kids apps than exact match
    if (lower.includes(word)) {
      return { 
        safe: false, 
        reason: "Let's use kind and safe words only." 
      };
    }
  }

  return { safe: true };
}

export function validatePrompt(prompt) {
  const check = checkContentSafety(prompt);
  if (!check.safe) {
    throw new Error(check.reason || "Content not allowed.");
  }
}