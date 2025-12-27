import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60; 

const YEARS = [1, 2, 3, 4, 5, 6];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LESSONS_PER_LEVEL = 100; 

// --- AU Configuration ---
function getTopicsAU(subjectId, year) {
  const isEarly = year <= 2;
  switch (subjectId) {
    case 'MATH': return isEarly ? ['Counting', 'Shapes', 'Patterns', 'Simple Data'] : ['Number & Place Value', 'Algebra', 'Geometry', 'Statistics'];
    case 'ENG': return isEarly ? ['Phonics', 'Sight Words', 'Listening'] : ['Spelling Rules', 'Grammar', 'Reading Comprehension', 'Persuasive Writing'];
    case 'SCI': return isEarly ? ['Living Things', 'Weather', 'Materials'] : ['Biology', 'Chemistry', 'Earth & Space', 'Physics'];
    case 'HASS': return isEarly ? ['My Family', 'My Place'] : ['History', 'Geography', 'Civics'];
    default: return ['Concepts', 'Skills', 'Practice'];
  }
}

// --- NZ Configuration ---
// NZC maps Years 1-6 roughly to Levels 1-3
function getTopicsNZ(subjectId, year) {
  // Level 1: Years 1-2
  // Level 2: Years 3-4
  // Level 3: Years 5-6
  const nzLevel = year <= 2 ? 1 : year <= 4 ? 2 : 3;
  
  switch (subjectId) {
    case 'MATH': // Mathematics and Statistics
      return nzLevel === 1 
        ? ['Number Strategies', 'Shapes', 'Patterns', 'Sorting Data'] 
        : ['Number Knowledge', 'Algebraic Thinking', 'Measurement', 'Geometric Properties', 'Statistical Investigation'];
    case 'ENG': // English
      return ['Listening, Reading, Viewing', 'Speaking, Writing, Presenting', 'Making Meaning', 'Creating Meaning'];
    case 'SCI': // Science
      return ['Living World', 'Planet Earth and Beyond', 'Physical World', 'Material World', 'Nature of Science'];
    case 'HASS': // Social Sciences
      return ['Identity, Culture, and Organisation', 'Place and Environment', 'Continuity and Change', 'The Economic World'];
    default:
      return ['Key Competencies', 'Values', 'Principles'];
  }
}

const SUBJECT_NAMES = {
  MATH: 'Mathematics',
  ENG: 'English',
  SCI: 'Science',
  HASS: 'HASS', // AU term, mapped to Social Sciences for NZ in content
  HPE: 'Health & PE',
  ART: 'The Arts',
  TECH: 'Technologies',
  LANG: 'Languages'
};

function escapeCsv(field, forceQuote = false) {
  if (field == null) return '';
  const s = String(field);
  if (forceQuote || s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function generateContent(country, subjectName, topic, year, level) {
  const isNZ = country === 'NZ';
  const currName = isNZ ? "New Zealand Curriculum" : "Australian Curriculum";
  
  const explanationBody = `
    **Key Idea:**
    ${topic} is a core part of the ${currName}. 
    
    **How it works:**
    1. **Observe:** Look closely at the question.
    2. **Connect:** Use what you know about ${topic}.
    3. **Solve:** Take your time to find the answer.
  `.trim();

  // Generate 10 varied questions
  const quiz = Array.from({ length: 10 }).map((_, i) => ({
    question: `${level} Question ${i + 1}: Which statement about ${topic} is true?`,
    options: [
      `The core rule of ${topic} applies here.`, 
      `This is a common mistake people make.`, 
      `This option is unrelated to the topic.`,
      `This looks right but is actually wrong.`
    ],
    answer: `The core rule of ${topic} applies here.`,
    explanation: `Correct! understanding ${topic} helps us solve this.`
  }));

  return JSON.stringify({
    duration_minutes: 15,
    objective: `Master ${topic} (${isNZ ? `NZC Level ${Math.ceil(year/2)}` : `Year ${year}`}).`,
    explanation: `Welcome to **${topic}**! \n\n${explanationBody}`,
    real_world_application: `You see ${topic} used in daily life around you.`,
    memory_strategies: [`Stop & Think`, `Visualise It`],
    worked_example: `Let's solve a ${topic} problem together step-by-step.`,
    scenarios: [{ context: `Explaining ${topic} to a friend.`, questions: [{ prompt: "Key rule?", answer: "Follow the steps." }] }],
    quiz: quiz
  });
}

export async function GET() {
  const headers = new Headers();
  headers.set('Content-Type', 'text/csv; charset=utf-8');
  headers.set('Content-Disposition', 'attachment; filename="smartkidz_lessons_global.csv"');

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      // Added 'country' column
      await writer.write(encoder.encode('id,country,year_level,subject_id,title,topic,curriculum_tags,content_json,created_at,updated_at\n'));

      const now = new Date().toISOString();
      const subjectIds = Object.keys(SUBJECT_NAMES);
      const countries = ['AU', 'NZ'];

      for (const country of countries) {
        for (const subjId of subjectIds) {
          const subjectName = SUBJECT_NAMES[subjId];
          
          for (const year of YEARS) {
            // Pick topics based on country curriculum
            const topics = country === 'AU' 
              ? getTopicsAU(subjId, year) 
              : getTopicsNZ(subjId, year);
            
            for (const level of LEVELS) {
              for (let i = 1; i <= LESSONS_PER_LEVEL; i++) {
                const paddedI = i.toString().padStart(3, '0');
                const levelCode = level.substring(0, 3).toUpperCase();
                
                // ID Format: AU_MATH_Y1_BEG_001 or NZ_MATH_Y1_BEG_001
                const id = `${country}_${subjId}_Y${year}_${levelCode}_${paddedI}`;
                
                const topic = topics[(i - 1) % topics.length];
                const title = `${topic}: ${level} Mission ${i}`;
                
                // Tag: AC9... for AU, NZC... for NZ
                const tagPrefix = country === 'AU' ? 'AC9' : 'NZC';
                const tag = `${tagPrefix}${subjId.charAt(0)}${year}${levelCode}${i}`; 
                const curriculumTags = `{${tag}}`;

                const content = generateContent(country, subjectName, topic, year, level);

                const rowParts = [
                  escapeCsv(id),
                  escapeCsv(country), // New column
                  escapeCsv(year),
                  escapeCsv(subjId),
                  escapeCsv(title),
                  escapeCsv(topic),
                  escapeCsv(curriculumTags, true),
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