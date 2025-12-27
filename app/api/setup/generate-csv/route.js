import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60; 

const YEARS = [1, 2, 3, 4, 5, 6];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LESSONS_PER_LEVEL = 100; 

// Dynamic topic generation based on Year Level for better alignment
function getTopics(subjectId, year) {
  const isEarly = year <= 2; // Year 1-2
  
  switch (subjectId) {
    case 'MATH':
      return isEarly 
        ? ['Counting', 'Shapes', 'Patterns', 'Measurements', 'Simple Data'] 
        : ['Number & Place Value', 'Algebra', 'Geometry', 'Statistics', 'Measurement'];
    case 'ENG':
      return isEarly
        ? ['Phonics', 'Sight Words', 'Listening', 'Simple Sentences', 'Story Time']
        : ['Spelling Rules', 'Grammar', 'Reading Comprehension', 'Persuasive Writing', 'Literature'];
    case 'SCI':
      return isEarly
        ? ['Living Things', 'Weather', 'Materials', 'My Body', 'Senses']
        : ['Biology', 'Chemistry', 'Earth & Space', 'Physics', 'Scientific Inquiry'];
    case 'HASS':
      return isEarly
        ? ['My Family', 'My Place', 'Celebrations', 'Past & Present']
        : ['History', 'Geography', 'Civics', 'Economics'];
    default:
      // Fallback generic topics
      return ['Concepts', 'Skills', 'Practice', 'Review', 'Challenge'];
  }
}

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

function escapeCsv(field, forceQuote = false) {
  if (field == null) return '';
  const s = String(field);
  if (forceQuote || s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function generateContent(subjectName, topic, year, level) {
  // Generate 10 varied questions
  const quiz = Array.from({ length: 10 }).map((_, i) => {
    return {
      question: `${level} Question ${i + 1}: What is a key concept of ${topic}?`,
      options: [
        `The correct principle of ${topic}`, 
        `A common mistake in ${topic}`, 
        `Unrelated option A`,
        `Unrelated option B`
      ],
      answer: `The correct principle of ${topic}`,
      explanation: `This is the correct answer because it aligns with Year ${year} ${topic} standards.`
    };
  });

  return JSON.stringify({
    duration_minutes: 15,
    objective: `Learn ${topic} (${level})`,
    explanation: `Detailed explanation of ${topic} for Year ${year}. Focus on key concepts and practice.`,
    real_world_application: `See ${topic} in the world around you, like when shopping or planning.`,
    memory_strategies: [`Link ${topic} to a daily habit to remember it better.`],
    worked_example: `Step-by-step guide to ${topic}: 1. Identify. 2. Apply rule. 3. Check.`,
    scenarios: [{ context: `Scenario for ${topic}`, questions: [{ prompt: "What next?", answer: "Follow the steps." }] }],
    quiz: quiz
  });
}

export async function GET() {
  const headers = new Headers();
  headers.set('Content-Type', 'text/csv; charset=utf-8');
  headers.set('Content-Disposition', 'attachment; filename="smartkidz_lessons_full.csv"');

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      await writer.write(encoder.encode('id,year_level,subject_id,title,topic,curriculum_tags,content_json,created_at,updated_at\n'));

      const now = new Date().toISOString();
      const subjectIds = Object.keys(SUBJECT_NAMES);

      for (const subjId of subjectIds) {
        const subjectName = SUBJECT_NAMES[subjId];
        
        for (const year of YEARS) {
          const topics = getTopics(subjId, year);
          
          for (const level of LEVELS) {
            for (let i = 1; i <= LESSONS_PER_LEVEL; i++) {
              const paddedI = i.toString().padStart(3, '0');
              const levelCode = level.substring(0, 3).toUpperCase();
              const id = `${subjId}_Y${year}_${levelCode}_${paddedI}`;
              
              // Rotate topics
              const topic = topics[(i - 1) % topics.length];
              const title = `${topic}: ${level} Mission ${i}`;
              
              // Standard Postgres array literal format: {TAG}
              const tag = `AC9${subjId.charAt(0)}${year}${levelCode}${i}`; 
              const curriculumTags = `{${tag}}`;

              const content = generateContent(subjectName, topic, year, level);

              // Force quote complex columns to prevent CSV drift
              const rowParts = [
                escapeCsv(id),
                escapeCsv(year),
                escapeCsv(subjId),
                escapeCsv(title),
                escapeCsv(topic),
                escapeCsv(curriculumTags, true), // FORCE QUOTE ARRAY
                escapeCsv(content, true),        // FORCE QUOTE JSON
                escapeCsv(now),
                escapeCsv(now)
              ];

              const rowString = rowParts.join(',') + '\n';
              await writer.write(encoder.encode(rowString));
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