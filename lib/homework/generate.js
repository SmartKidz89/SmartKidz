export function generateHomeworkQuestions({ subjectId, lessonTitles = [], count = 20 }) {
  const seedBase = `${subjectId}|${lessonTitles.join("|")}|${new Date().toISOString().slice(0, 10)}`;
  let seed = 0;
  for (let i = 0; i < seedBase.length; i++) seed = (seed * 31 + seedBase.charCodeAt(i)) >>> 0;

  function rand() {
    // xorshift32
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  }

  const titles = lessonTitles.length ? lessonTitles : ["Recent lessons"];
  const pickTitle = () => titles[Math.floor(rand() * titles.length)];

  const q = [];
  const push = (question, answer) => q.push({ question, answer });

  const makeMath = () => {
    const a = Math.floor(rand() * 90) + 10;
    const b = Math.floor(rand() * 90) + 10;
    const op = rand() < 0.33 ? "+" : rand() < 0.66 ? "-" : "×";
    const title = pickTitle();
    if (op === "+") push(`[${title}] ${a} + ${b} = ?`, a + b);
    if (op === "-") push(`[${title}] ${a} - ${b} = ?`, a - b);
    if (op === "×") push(`[${title}] ${a} × ${b} = ?`, a * b);
  };

  const makeEnglish = () => {
    const title = pickTitle();
    const words = ["because", "although", "however", "therefore", "carefully", "quickly", "bright", "curious", "discover"];
    const w = words[Math.floor(rand() * words.length)];
    const types = [
      `Write a sentence using the word "${w}" about: ${title}.`,
      `Find a synonym for "${w}" and use it in a sentence.`,
      `Rewrite this sentence to improve it: "I like ${title}."`,
      `List 3 key vocabulary words you learned in: ${title}.`,
    ];
    push(`[${title}] ${types[Math.floor(rand() * types.length)]}`, "");
  };

  const makeScience = () => {
    const title = pickTitle();
    const prompts = [
      `Explain one cause-and-effect relationship you learned in: ${title}.`,
      `Draw and label a simple diagram related to: ${title}.`,
      `Write 3 true/false statements about: ${title}.`,
      `Describe an experiment you could do at home (safely) to explore: ${title}.`,
    ];
    push(`[${title}] ${prompts[Math.floor(rand() * prompts.length)]}`, "");
  };

  const makeGeneric = () => {
    const title = pickTitle();
    const prompts = [
      `Write 5 bullet points summarizing: ${title}.`,
      `Create 3 quiz questions based on: ${title}.`,
      `Teach this topic to someone else in 4 sentences: ${title}.`,
      `Write one thing you found challenging and one thing you found easy in: ${title}.`,
    ];
    push(`[${title}] ${prompts[Math.floor(rand() * prompts.length)]}`, "");
  };

  const maker =
    subjectId === "MAT" ? makeMath :
    subjectId === "ENG" ? makeEnglish :
    subjectId === "SCI" ? makeScience :
    makeGeneric;

  while (q.length < Math.max(20, Math.min(40, count))) maker();
  return q.slice(0, Math.max(20, Math.min(40, count)));
}
