/**
 * Deterministic-ish daily quest generator.
 * Keep it simple and safe; tune rewards/pacing in one place.
 */
export function generateDailyQuests({ childId, dateISO }) {
  const seed = hash(`${childId}:${dateISO}`);
  const pick = (arr, offset = 0) => arr[(seed + offset) % arr.length];

  const subjects = ["maths", "english", "science"];
  const subject = pick(subjects);
  const quests = [
    {
      key: "complete_lesson",
      title: "Complete 1 lesson",
      desc: `Finish a ${subject} lesson today.`,
      type: "lesson_complete",
      subject,
      target: 1,
      rewardCoins: 25,
      rewardXp: 10,
    },
    {
      key: "practice_streak",
      title: "Keep your streak",
      desc: "Do a quick mission to keep your flame alive.",
      type: "any_activity",
      target: 1,
      rewardCoins: 15,
      rewardXp: 6,
    },
    {
      key: "accuracy_boost",
      title: "Accuracy star",
      desc: "Get 80%+ accuracy in any activity.",
      type: "accuracy",
      target: 80,
      rewardCoins: 20,
      rewardXp: 8,
    },
  ];

  return quests;
}

function hash(str) {
  // small, fast, deterministic hash -> uint32
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
