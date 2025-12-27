import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60; 

const SUBJECTS = {
  MATH: { name: 'Mathematics', topics: ['Number', 'Algebra', 'Geometry', 'Statistics', 'Measurement'] },
  ENG: { name: 'English', topics: ['Phonics', 'Spelling', 'Grammar', 'Reading', 'Writing'] },
  SCI: { name: 'Science', topics: ['Biology', 'Chemistry', 'Earth', 'Physics', 'Inquiry'] },
  HASS: { name: 'HASS', topics: ['History', 'Geography', 'Civics', 'Community'] },
  HPE: { name: 'Health', topics: ['Health', 'Safety', 'Active Living', 'Movement'] },
  ART: { name: 'Arts', topics: ['Visual Arts', 'Music', 'Drama', 'Dance'] },
  TECH: { name: 'Tech', topics: ['Digital Systems', 'Data', 'Coding', 'Design'] },
  LANG: { name: 'Languages', topics: ['Greetings', 'Culture', 'Vocabulary', 'Phrases'] }
};

const YEARS = [1, 2, 3, 4, 5, 6];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LESSONS_PER_LEVEL = 100; 

function escapeCsv(field, forceQuote = false) {
  if (field == null) return '';
  const s = String(field);
  if (forceQuote || s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function generateContent(subject, topic, year, level) {
  return JSON.stringify({
    duration_minutes: 15,
    objective: `Learn ${topic} (${level})`,
    explanation: `Detailed explanation of ${topic} for Year ${year}.`,
    real_world_application: `See ${topic} in the world around you.`,
    memory_strategies: [`Link ${topic} to daily habits.`],
    worked_example: `Step-by-step guide to ${topic}.`,
    scenarios: [{ context: `Scenario for ${topic}`, questions: [{ prompt: "What next?", answer: "Follow the steps." }] }],
    quiz: [
      { question: `What is key about ${topic}?`, options: ["Correct", "Wrong A", "Wrong B"], answer: "Correct", explanation: "Because it fits the rule." },
      { question: `True or False: ${topic} is useful?`, options: ["True", "False"], answer: "True", explanation: "It is very useful." },
      { question: `Find the mistake in ${topic}.`, options: ["Error", "Correct", "Okay"], answer: "Error", explanation: "This breaks the rule." }
    ]
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

      for (const subjId of Object.keys(SUBJECTS)) {
        const subjectData = SUBJECTS[subjId];
        for (const year of YEARS) {
          for (const level of LEVELS) {
            for (let i = 1; i <= LESSONS_PER_LEVEL; i++) {
              const paddedI = i.toString().padStart(3, '0');
              const levelCode = level.substring(0, 3).toUpperCase();
              const id = `${subjId}_Y${year}_${levelCode}_${paddedI}`;
              const topic = subjectData.topics[(i - 1) % subjectData.topics.length];
              const title = `${topic}: ${level} Mission ${i}`;
              
              // Standard Postgres array literal format: {TAG}
              const tag = `AC9${subjId.charAt(0)}${year}${levelCode}${i}`; 
              const curriculumTags = `{${tag}}`;

              const content = generateContent(subjectData.name, topic, year, level);

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