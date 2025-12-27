/**
 * Writing metrics (MVP+)
 * Provides gentle, explainable feedback about:
 * - baseline alignment
 * - height band usage (for 3-line)
 * - spacing between words (sentences mode)
 * - stroke smoothness (simple)
 *
 * This is intentionally conservative to avoid false confidence or harsh judgments.
 */

export function flattenPoints(strokes) {
  const pts = [];
  for (const s of strokes || []) {
    for (const p of s.points || []) pts.push(p);
  }
  return pts;
}

export function bbox(strokes) {
  const pts = flattenPoints(strokes);
  if (pts.length === 0) return null;
  let minX = pts[0].x, maxX = pts[0].x, minY = pts[0].y, maxY = pts[0].y;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY };
}

export function polylineLength(points) {
  let L = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    L += Math.hypot(dx, dy);
  }
  return L;
}

export function smoothnessScore(strokes) {
  // Ratio of polyline length to straight-line length between endpoints.
  // Lower ratios tend to be smoother; we invert into a 0-100 "smoothness" score.
  let ratios = [];
  for (const s of strokes || []) {
    const pts = s.points || [];
    if (pts.length < 3) continue;
    const L = polylineLength(pts);
    const dx = pts[pts.length - 1].x - pts[0].x;
    const dy = pts[pts.length - 1].y - pts[0].y;
    const D = Math.hypot(dx, dy) || 1;
    ratios.push(L / D);
  }
  if (ratios.length === 0) return null;
  const r = ratios.reduce((a,b)=>a+b,0) / ratios.length;
  // Typical r ranges ~1.0 to 3.5 (messy). Map to 100..0.
  const score = clamp(100 - (r - 1) * 45, 0, 100);
  return Math.round(score);
}

export function guidelineYs(height, preset, spacingMult = 1.0) {
  const topPad = 40;
  const innerH = height - topPad * 2;

  const presets = {
    threeLine: [0.25, 0.5, 0.75],
    twoLine: [0.5, 0.75],
    lined: [0.75],
    blank: []
  };

  const ratios = presets[preset] || presets.threeLine;
  return ratios.map((r) => topPad + innerH * r * spacingMult);
}

export function baselineFeedback(strokes, canvasHeight, preset, spacingMult = 1.0) {
  const b = bbox(strokes);
  if (!b) return null;

  const ys = guidelineYs(canvasHeight, preset, spacingMult);
  const baseline = ys.length ? ys[ys.length - 1] : null;
  if (!baseline) return null;

  // Use the bottom of drawn bbox as proxy for baseline contact.
  const delta = baseline - b.maxY; // positive means writing is above baseline (floating)
  const abs = Math.abs(delta);

  // Thresholds
  if (abs <= 10) {
    return { score: 100, note: "Nice—your writing sits close to the baseline." };
  }
  if (delta > 10) {
    return { score: clamp(100 - abs * 1.5, 40, 95), note: "Your writing is floating a little. Try to touch the baseline (bottom line)." };
  }
  // Below baseline
  return { score: clamp(100 - abs * 1.5, 40, 95), note: "Your writing drops below the baseline a little. Try to keep letters sitting on the line." };
}

export function heightBandFeedback(strokes, canvasHeight, preset, spacingMult = 1.0) {
  if (preset !== "threeLine") return null;
  const b = bbox(strokes);
  if (!b) return null;

  const [top, mid, base] = guidelineYs(canvasHeight, preset, spacingMult);

  // Evaluate whether the writing uses the band reasonably
  const tallRoom = mid - top;  // zone for tall letters
  const xRoom = base - mid;    // zone for short letters

  // Use bbox height as a rough measure
  const h = b.h;

  // heuristics: if too small, suggest bigger; if too big, suggest staying within lines
  const ideal = tallRoom + xRoom * 0.95;
  const ratio = h / (ideal || 1);

  if (ratio < 0.6) return { score: 65, note: "Try writing a little bigger so your letters fill the space between the lines." };
  if (ratio > 1.15) return { score: 65, note: "Try keeping letters inside the lines. Tall letters can touch the top line." };
  return { score: 90, note: "Great size—your letters fit nicely between the lines." };
}

export function wordSpacingFeedback(strokes, traceText) {
  // Very conservative: estimate spacing by detecting "gaps" in x between stroke clusters.
  // Only meaningful for sentence prompts (with spaces).
  if (!traceText || !traceText.includes(" ")) return null;

  // Approx: compute bbox per stroke, sort by minX, then compute gaps.
  const boxes = (strokes || [])
    .map((s) => bbox([s]))
    .filter(Boolean)
    .sort((a,b)=>a.minX-b.minX);

  if (boxes.length < 2) return null;

  const gaps = [];
  for (let i = 1; i < boxes.length; i++) {
    gaps.push(Math.max(0, boxes[i].minX - boxes[i-1].maxX));
  }
  if (gaps.length === 0) return null;

  const avgGap = gaps.reduce((a,b)=>a+b,0)/gaps.length;

  // Heuristic targets (pixels)
  if (avgGap < 8) return { score: 65, note: "Try leaving a little more space between words—about one finger-width." };
  if (avgGap > 40) return { score: 70, note: "Your word spaces are quite large. Slightly smaller spaces can make sentences easier to read." };
  return { score: 90, note: "Nice spacing between words. Keep it consistent." };
}

export function overallWritingFeedback({ strokes, canvasHeight, preset, spacingMult, traceText }) {
  if (!strokes || strokes.length === 0) return null;

  const baseline = baselineFeedback(strokes, canvasHeight, preset, spacingMult);
  const heightBand = heightBandFeedback(strokes, canvasHeight, preset, spacingMult);
  const spacing = wordSpacingFeedback(strokes, traceText);
  const smooth = smoothnessScore(strokes);

  const notes = [baseline?.note, heightBand?.note, spacing?.note].filter(Boolean);

  // Aggregate a conservative score
  const parts = [baseline?.score, heightBand?.score, spacing?.score, smooth].filter((v)=>typeof v==="number");
  const score = parts.length ? Math.round(parts.reduce((a,b)=>a+b,0)/parts.length) : null;

  return {
    score,
    smoothness: smooth,
    notes,
    baseline,
    heightBand,
    spacing
  };
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }


// --- Path matching (Phase 4) ---
// Rough similarity between a user's strokes and a normalized letter template.
// This is conservative, designed for encouragement rather than strict grading.

export function resamplePolyline(points, n = 64) {
  if (!points || points.length === 0) return [];
  // compute cumulative lengths
  const d = [0];
  for (let i = 1; i < points.length; i++) {
    d.push(d[i-1] + Math.hypot(points[i].x - points[i-1].x, points[i].y - points[i-1].y));
  }
  const total = d[d.length - 1] || 1;
  const out = [];
  let j = 1;
  for (let k = 0; k < n; k++) {
    const target = (k * total) / (n - 1);
    while (j < d.length && d[j] < target) j++;
    if (j >= d.length) {
      out.push({ x: points[points.length-1].x, y: points[points.length-1].y });
    } else {
      const t = (target - d[j-1]) / ((d[j] - d[j-1]) || 1);
      out.push({
        x: lerp(points[j-1].x, points[j].x, t),
        y: lerp(points[j-1].y, points[j].y, t)
      });
    }
  }
  return out;
}

export function normalizeToUnit(points) {
  if (!points || points.length === 0) return [];
  let minX = points[0].x, maxX = points[0].x, minY = points[0].y, maxY = points[0].y;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const w = (maxX - minX) || 1;
  const h = (maxY - minY) || 1;
  // keep aspect by scaling into [0,1] box
  return points.map(p => ({
    x: (p.x - minX) / w,
    y: (p.y - minY) / h
  }));
}

export function averagePointDistance(a, b) {
  const n = Math.min(a.length, b.length);
  if (n === 0) return null;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += Math.hypot(a[i].x - b[i].x, a[i].y - b[i].y);
  }
  return sum / n;
}

export function startZoneFeedback(strokes, canvasHeight, preset, spacingMult = 1.0) {
  // Simple: start near top-left-ish region inside writing box.
  const pts = flattenPoints(strokes);
  if (pts.length === 0) return null;
  const p0 = pts[0];
  const zoneX = p0.x < 260; // left region
  // near upper half of writing area
  const ys = guidelineYs(canvasHeight, preset, spacingMult);
  const upper = ys.length ? ys[0] : canvasHeight * 0.25;
  const mid = ys.length > 1 ? ys[1] : canvasHeight * 0.5;
  const zoneY = p0.y < mid + 20 && p0.y > upper - 40;
  if (zoneX && zoneY) return { score: 90, note: "Good start point. Starting near the top helps neat letter formation." };
  return { score: 70, note: "Try starting a little closer to the top-left of the guide before you trace." };
}

export function pathMatchFeedback({ strokes, templatePoints }) {
  if (!strokes || strokes.length === 0 || !templatePoints) return null;

  // Use all points as one path (works reasonably for tracing letters)
  const pts = flattenPoints(strokes);
  if (pts.length < 10) return null;

  const userNorm = normalizeToUnit(resamplePolyline(pts, 64));
  const templNorm = normalizeToUnit(resamplePolyline(templatePoints, 64));

  const dist = averagePointDistance(userNorm, templNorm); // 0..~1.5
  if (dist === null) return null;

  // Map distance to score (conservative)
  const score = clamp(100 - dist * 140, 0, 100);

  let note = "Nice tracing. Keep your lines smooth and steady.";
  if (score < 50) note = "Try tracing a little more slowly. Follow the dotted path as closely as you can.";
  else if (score < 75) note = "Good effort. Stay closer to the guide, especially around corners.";
  else if (score >= 90) note = "Excellent tracing—very close to the guide!";

  return { score: Math.round(score), distance: Number(dist.toFixed(3)), note };
}

function lerp(a, b, t) { return a + (b - a) * t; }
