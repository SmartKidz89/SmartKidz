import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60; 

const YEARS = [1, 2, 3, 4, 5, 6];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LESSONS_PER_LEVEL = 100; // 300 total per year/subject

// --- 1. Country Configuration ---
const COUNTRIES = {
  AU: { name: "Australia", term: "Year", codePrefix: "AC9" },
  NZ: { name: "New Zealand", term: "Year", codePrefix: "NZC" },
  US: { name: "United States", term: "Grade", codePrefix: "CCSS" },
  GB: { name: "United Kingdom", term: "Year", codePrefix: "NC" },
  CA: { name: "Canada", term: "Grade", codePrefix: "CAN" },
  IN: { name: "India", term: "Class", codePrefix: "CBSE" },
  SG: { name: "Singapore", term: "Primary", codePrefix: "MOE" },
  ZA: { name: "South Africa", term: "Grade", codePrefix: "CAPS" },
  IE: { name: "Ireland", term: "Class", codePrefix: "NCCA" },
  AE: { name: "UAE", term: "Grade", codePrefix: "MOE" },
  PH: { name: "Philippines", term: "Grade", codePrefix: "K12" },
  INT: { name: "International", term: "Grade", codePrefix: "IB" },
};

const SUBJECT_NAMES = {
  MATH: 'Mathematics',
  ENG: 'English',
  SCI: 'Science',
  HASS: 'HASS',
  HPE: 'Health & PE',
  ART: 'The Arts',
  TECH: 'Technologies',
  LANG: 'Languages'
};

// --- 2. Smart Topics (Age-Appropriate) ---

function getTopics(subjectId, year) {
  // Group 1: Early Years (1-2)
  if (year <= 2) {
    if (subjectId === "MATH") return ["Counting to 100", "Simple Addition", "Shapes & Patterns", "Measuring Length", "Days of the Week", "Money Basics"];
    if (subjectId === "ENG") return ["Phonics & Sounds", "Sight Words", "Simple Sentences", "Story Retelling", "Handwriting", "Rhyming Words"];
    if (subjectId === "SCI") return ["Living Things", "Weather & Seasons", "Materials (Hard/Soft)", "Senses", "Day & Night", "Push & Pull"];
    if (subjectId === "HASS") return ["My Family", "My School", "Local Places", "Celebrations", "Old & New", "Maps of School"];
  }
  
  // Group 2: Middle Years (3-4)
  if (year <= 4) {
    if (subjectId === "MATH") return ["Multiplication Facts", "Fractions 1/2 1/4", "Time (Minutes)", "Money (Change)", "3D Shapes", "Data & Graphs"];
    if (subjectId === "ENG") return ["Paragraph Writing", "Adjectives & Adverbs", "Reading Fluency", "Persuasive Texts", "Spelling Rules", "Punctuation"];
    if (subjectId === "SCI") return ["Life Cycles", "States of Matter", "Heat Energy", "Forces & Magnets", "Earth's Surface", "Solar System"];
    if (subjectId === "HASS") return ["Local Community", "First Nations History", "World Exploration", "Rules & Laws", "Sustainability", "Trade"];
  }

  // Group 3: Upper Primary (5-6)
  if (subjectId === "MATH") return ["Decimals & Percentages", "Algebra & Patterns", "Area & Volume", "Financial Maths", "Angles & Geometry", "Probability"];
  if (subjectId === "ENG") return ["Essay Structure", "Complex Grammar", "Literary Devices", "Media Literacy", "Public Speaking", "Editing Skills"];
  if (subjectId === "SCI") return ["Adaptations", "Chemical Changes", "Electricity & Circuits", "Light & Sound", "Natural Disasters", "Scientific Method"];
  if (subjectId === "HASS") return ["Government & Democracy", "Migration Stories", "Global Connections", "Economics & Business", "Asian Geography", "Social Justice"];

  return ["Core Skills", "Creative Projects", "Understanding Concepts", "Real World Application"];
}

function escapeCsv(field) {
  if (field == null) return '';
  const s = String(field);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// --- 3. PREMIUM CONTENT GENERATOR ---

function generateRichContent(countryCode, subjectName, topic, year, level, index) {
  const config = COUNTRIES[countryCode] || COUNTRIES.INT;
  const gradeLabel = `${config.term} ${year}`;
  
  // Complexity Tuning
  const isJunior = year <= 2;
  const simpleLanguage = isJunior;
  
  const activities = [];

  // PHASE 1: HOOK (Warm Up)
  const hookPrompt = simpleLanguage
    ? `Look around the room! Can you find something that shows **${topic}**? Point to it!`
    : `Let's get started. Think about **${topic}**. Why do you think this is important in the real world?`;

  activities.push({
    phase: "hook",
    type: "visual_observe",
    title: "Warm Up",
    prompt: hookPrompt,
  });

  // PHASE 2: EXPLICIT INSTRUCTION (I Do)
  const explanationTitle = simpleLanguage ? "Learn It" : "Core Concept";
  const explanationText = simpleLanguage
    ? `Today we are learning about **${topic}**. \n\nIt is like a puzzle! When we understand ${topic}, we can solve problems easily.`
    : `In this lesson, we will master **${topic}**. \n\nKey Principle: ${topic} is fundamental to ${subjectName}. It allows us to analyze patterns and predict outcomes.`;

  activities.push({
    phase: "instruction",
    type: "learn",
    title: explanationTitle,
    explanation: explanationText
  });

  // Step-by-Step
  const steps = simpleLanguage
    ? `1. Look.\n2. Think.\n3. Try.`
    : `1. Analyze the inputs.\n2. Apply the rule of ${topic}.\n3. Verify your answer.`;

  activities.push({
    phase: "instruction",
    type: "learn",
    title: "Steps",
    explanation: steps
  });

  // PHASE 3: GUIDED PRACTICE (We Do)
  const scenarioContext = simpleLanguage
    ? `Imagine you have a toy box.`
    : `Imagine you are designing a city park.`;

  activities.push({
    phase: "guided_practice",
    type: "learn",
    title: "Scenario",
    explanation: `${scenarioContext} We need to use **${topic}** to make it work. Let's try together.`
  });

  activities.push({
    phase: "guided_practice",
    type: "fill_blank",
    prompt: simpleLanguage 
       ? `The first thing we do is _____ at the problem.` 
       : `To solve this efficiently, we must first _____ the variables.`,
    correct_answer: simpleLanguage ? "look" : "identify",
    hint_ladder: simpleLanguage ? ["Use your eyes.", "Starts with L."] : ["Find the key parts.", "Starts with I."]
  });

  // PHASE 4: INDEPENDENT PRACTICE (You Do)
  // Generate 12 varied questions
  for(let i=1; i<=12; i++) {
    const isHard = i > 8;
    const questionText = simpleLanguage
      ? `Question ${i}: Which one shows ${topic}?`
      : `Question ${i}: Applying the principles of ${topic}, which statement is valid?`;

    const options = simpleLanguage
      ? [`The right one`, `A silly one`, `A wrong one`]
      : [`The logically correct application`, `A common misconception`, `An irrelevant factor`, `A calculation error`];

    activities.push({
      phase: "independent_practice",
      type: "quiz_question",
      question: questionText,
      options: options,
      correct_answer: options[0],
      explanation: isHard 
         ? `Excellent work. That was a tricky one!`
         : `Correct! You are doing great.`
    });
  }

  // PHASE 5: CHALLENGE / REFLECTION
  const reflectPrompt = simpleLanguage
    ? `Draw a picture of ${topic} in your mind. How does it make you feel?`
    : `How would you explain ${topic} to someone who has never heard of it before? Write one clear sentence.`;

  activities.push({
    phase: "challenge",
    type: "reflection",
    prompt: reflectPrompt,
  });

  return JSON.stringify({
    duration_minutes: 30, 
    objective: `Understand ${topic} (${level})`,
    overview: `${topic} lesson for ${gradeLabel}.`,
    activities: activities
  });
}

// --- 4. STREAMING GENERATOR ---

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const countryParam = searchParams.get('country');
  
  // If specific country requested, generate just that. Otherwise defaults (safeguard).
  let targetCountries = countryParam ? [countryParam] : ["INT"];
  let filename = `smartkidz_lessons_${countryParam || "INT"}.csv`;

  const headers = new Headers();
  headers.set('Content-Type', 'text/csv; charset=utf-8');
  headers.set('Content-Disposition', `attachment; filename="${filename}"`);

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      await writer.write(encoder.encode('id,country,year_level,subject_id,title,topic,curriculum_tags,content_json,created_at,updated_at\n'));
      const now = new Date().toISOString();
      const subjectIds = Object.keys(SUBJECT_NAMES);

      for (const country of targetCountries) {
        const config = COUNTRIES[country];
        if (!config) continue;
        
        const codePrefix = config.codePrefix || "SKZ";

        for (const subjId of subjectIds) {
          let localizedSubject = SUBJECT_NAMES[subjId];
          
          for (const year of YEARS) {
            const topics = getTopics(subjId, year);
            
            for (const level of LEVELS) {
              for (let i = 1; i <= LESSONS_PER_LEVEL; i++) {
                const paddedI = i.toString().padStart(3, '0');
                const levelCode = level.substring(0, 3).toUpperCase();
                
                const id = `${country}_${subjId}_Y${year}_${levelCode}_${paddedI}`;
                const topic = topics[(i - 1) % topics.length];
                const title = `${topic}: ${level} Mission ${i}`;
                const tag = `${codePrefix}.${subjId}.${year}.${paddedI}`;
                
                const content = generateRichContent(country, localizedSubject, topic, year, level, i);

                const rowParts = [
                  escapeCsv(id),
                  escapeCsv(country),
                  escapeCsv(year),
                  escapeCsv(subjId),
                  escapeCsv(title),
                  escapeCsv(topic),
                  escapeCsv(`{${tag}}`, true),
                  escapeCsv(content, true),
                  escapeCsv(now),
                  escapeCsv(now)
                ];

                await writer.write(encoder.encode(rowParts.join(',') + '\n'));
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("CSV Generation Error", err);
    } finally {
      await writer.close();
    }
  })();

  return new NextResponse(stream.readable, { headers });
}