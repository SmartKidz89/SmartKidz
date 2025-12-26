import { getSkillsFor } from "./skills";
import { loadMastery } from "./store";
import { getDemoLessonCatalog } from "@/lib/supabase/client";

/**
 * Compute a simple "next best lesson" recommendation.
 * - Uses mastery gaps: lowest mastered skill in subject/year.
 * - Maps gaps to lesson topics heuristically.
 */
export function recommendNext({ subject = "maths", yearLevel = 1 } = {}) {
  const skills = getSkillsFor(subject, yearLevel);
  const mastery = loadMastery();
  const bySkill = mastery.bySkill || {};

  let weakest = null;
  for (const s of skills) {
    const v = Number(bySkill[s.id] ?? 0);
    if (!weakest || v < weakest.v) weakest = { ...s, v };
  }

  const catalog = getDemoLessonCatalog?.() || [];
  const subj = String(subject).toLowerCase();
  const year = Number(yearLevel) || 1;

  // Very light topic mapping:
  const want = (weakest?.id || "").split(".").pop() || "";
  const pick = catalog.find((l) => {
    return String(l.subject_id).toLowerCase() === subj
      && Number(l.year_level) === year
      && String(l.topic || "").toLowerCase().includes(want);
  }) || catalog.find((l) => String(l.subject_id).toLowerCase() === subj && Number(l.year_level) === year) || null;

  return {
    weakestSkill: weakest || null,
    lesson: pick ? { id: pick.id, title: pick.title, topic: pick.topic, subject: pick.subject_id, yearLevel: pick.year_level } : null,
  };
}
