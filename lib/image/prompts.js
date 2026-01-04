export const MASTER_STYLE = `SmartKidz brand illustration for kids aged 8–11 (upper primary). 
Visual tone: confident, curious, modern, STEM-leaning; friendly and safe (not babyish), no toddler styling, no chibi proportions.
Design language: 3D layered paper-cutout / cardstock diorama style with stacked cut-paper layers, clean crisp edges, soft drop shadows for depth, soft global illumination, subtle paper grain, high definition.

Palette: vibrant educational palette anchored in teal, orange, and soft yellow; balanced saturation; avoid neon and avoid muddy/dark tones.
Character (if present): friendly robot mascot with rounded geometry, slightly more “tech” detail (panel lines, simple joints, screen face), expressive but not oversized eyes, confident smile, approachable posture, matte paper finish (NOT metallic).

Composition: clear focal point, readable silhouettes, minimal clutter, strong iconography, modern classroom/STEM props (tablet, molecule diagram, gears, books, graphs, lab glassware, rocket) used sparingly.
Background: clean solid-color or subtle gradient background; minimal scene elements unless requested; ample negative space for UI where relevant.
Output: crisp, smooth edges, no artifacts, no text.`;

export const MASTER_NEGATIVE_PROMPT = `text, typography, letters, numbers, watermark, logo, captions,
toddler, baby, preschool, overly cute, chibi, giant head, giant eyes,
scary, creepy, horror, violent, weapons,
metallic, chrome, reflective metal, photorealistic, hyperreal,
grunge, dirt, scratches, messy, dark, gloomy, harsh lighting,
distorted, deformed, extra limbs, bad hands, blurry, low-res, noise,
busy background, clutter, overly complex shadows`;

/**
 * Combines the master style with a specific subject.
 * @param {string} subject - The specific thing to illustrate (e.g. "A volcano")
 * @returns {string} The full prompt
 */
export function buildPrompt(subject) {
  // If the subject already looks like a full prompt (long), we might just append the style.
  // But for consistency, we treat the input as the "Subject" of the diorama.
  const cleanSubject = (subject || "learning concept").trim();
  return `${MASTER_STYLE}\n\nSubject: ${cleanSubject}`;
}