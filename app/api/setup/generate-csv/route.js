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
  const isBeg = level === 'Beginner';
  const isAdv = level === 'Advanced';

  // Richer Content Templates
  const explanationIntro = isBeg 
    ? `Welcome to **${topic}**! Today we are going to learn the basics. This is a super useful skill that helps you understand the world around you.`
    : isAdv
    ? `Ready for a challenge? We are diving deep into **${topic}**. We will look at complex rules and how to solve tricky problems.`
    : `Let's build on what you know about **${topic}**. We will practice new strategies to make you faster and more accurate.`;

  const explanationBody = `
    **Key Idea:**
    ${topic} is all about finding patterns. Whether you are looking at numbers, words, or nature, there is always a rule to discover.
    
    **How it works:**
    1. **Observe:** Look closely at the question. What do you see?
    2. **Connect:** Does this remind you of something you already know?
    3. **Solve:** Use the steps we practice to find the answer.
    
    *Remember:* Take your time. It is not about being fast, it is about being sure!
  `.trim();

  const realWorldApps = [
    `Next time you are at the shops, look for **${topic}** in action! It helps people compare prices and count change.`,
    `Architects and builders use **${topic}** every day to make sure buildings stand up straight and strong.`,
    `Scientists use **${topic}** to measure things in nature, like how tall a tree grows or how fast a car moves.`
  ];
  const realWorld = realWorldApps[Math.floor(Math.random() * realWorldApps.length)];

  const strategies = [
    `**The 'Stop & Think' Method:** Before you answer, pause for 3 seconds. Reread the question.`,
    `**Visualise It:** Close your eyes and picture the problem in your head.`,
    `**Teach a Friend:** If you can explain it to a toy or a friend, you really know it!`
  ];

  const workedExample = `
    **Let's try one together!**
    
    *Problem:* How do we use ${topic} to solve a puzzle?
    
    **Step 1:** Read the question carefully. What is it asking us to find?
    **Step 2:** Look for clues. Are there numbers? Key words? Pictures?
    **Step 3:** Apply the rule. For ${topic}, we usually look for the pattern first.
    **Step 4:** Check your work. Does the answer make sense?
    
    *Result:* Great job! You just used ${topic} to solve a problem.
  `.trim();

  // Generate 10 varied questions
  const quiz = Array.from({ length: 10 }).map((_, i) => {
    return {
      question: `${level} Question ${i + 1}: Which statement about ${topic} is true?`,
      options: [
        `The core rule of ${topic} applies here.`, 
        `This is a common mistake people make.`, 
        `This option is unrelated to the topic.`,
        `This looks right but is actually wrong.`
      ],
      answer: `The core rule of ${topic} applies here.`,
      explanation: `Correct! In ${topic}, we always look for the core rule first. This helps us solve the problem accurately.`
    };
  });

  return JSON.stringify({
    duration_minutes: 15,
    objective: `Master the concepts of ${topic} at a ${level} level.`,
    explanation: `${explanationIntro}\n\n${explanationBody}`,
    real_world_application: realWorld,
    memory_strategies: strategies,
    worked_example: workedExample,
    scenarios: [{ 
      context: `Imagine you are explaining ${topic} to a younger student.`, 
      questions: [{ prompt: "What is the most important thing to remember?", answer: "Follow the steps carefully." }] 
    }],
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