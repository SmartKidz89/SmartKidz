/**
 * Minimal skill graph for mastery tracking.
 * This is intentionally small and extensible: add micro-skills over time.
 */
export const SKILLS = {
  maths: {
    y1: [
      { id: "maths.y1.counting", label: "Counting to 20" },
      { id: "maths.y1.addition", label: "Simple addition" },
      { id: "maths.y1.subtraction", label: "Simple subtraction" },
    ],
    y2: [
      { id: "maths.y2.placevalue", label: "Place value" },
      { id: "maths.y2.addition", label: "Addition with regrouping" },
      { id: "maths.y2.subtraction", label: "Subtraction with borrowing" },
    ],
  },
  science: {
    y1: [
      { id: "science.y1.living", label: "Living things" },
      { id: "science.y1.materials", label: "Everyday materials" },
    ],
    y2: [
      { id: "science.y2.forces", label: "Forces and motion" },
      { id: "science.y2.earth", label: "Earth and space basics" },
    ],
  },
  english: {
    y1: [
      { id: "english.y1.phonics", label: "Phonics and sounds" },
      { id: "english.y1.rhyming", label: "Rhyming and patterns" },
      { id: "english.y1.reading", label: "Reading comprehension" },
    ],
    y2: [
      { id: "english.y2.grammar", label: "Grammar basics" },
      { id: "english.y2.writing", label: "Creative writing" },
    ],
  },
};

export function subjectYearKey(subject, yearLevel) {
  const s = String(subject || "").toLowerCase();
  const y = `y${Number(yearLevel) || 1}`;
  return { s, y };
}

export function getSkillsFor(subject, yearLevel) {
  const { s, y } = subjectYearKey(subject, yearLevel);
  return (SKILLS?.[s]?.[y] || []).slice();
}
