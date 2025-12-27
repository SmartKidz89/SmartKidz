import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60; 

const YEARS = [1, 2, 3, 4, 5, 6];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LESSONS_PER_LEVEL = 100; 

// --- Country Configuration ---
const COUNTRIES = {
  AU: { name: "Australia", term: "Year", curriculum: "Australian Curriculum (AC9)", code: "AU", math: "Maths", hass: "HASS" },
  NZ: { name: "New Zealand", term: "Year", curriculum: "New Zealand Curriculum", code: "NZ", math: "Maths", hass: "Social Sciences" },
  US: { name: "United States", term: "Grade", curriculum: "Common Core / State", code: "US", math: "Math", hass: "Social Studies" },
  GB: { name: "United Kingdom", term: "Year", curriculum: "National Curriculum", code: "GB", math: "Maths", hass: "Humanities" },
  CA: { name: "Canada", term: "Grade", curriculum: "Provincial Standards", code: "CA", math: "Math", hass: "Social Studies" },
  IN: { name: "India", term: "Class", curriculum: "CBSE/ICSE Aligned", code: "IN", math: "Maths", hass: "Social Science" },
  SG: { name: "Singapore", term: "Primary", curriculum: "MOE Syllabus", code: "SG", math: "Maths", hass: "Social Studies" },
  ZA: { name: "South Africa", term: "Grade", curriculum: "CAPS", code: "ZA", math: "Maths", hass: "Social Sciences" },
  IE: { name: "Ireland", term: "Class", curriculum: "Primary Curriculum", code: "IE", math: "Maths", hass: "SESE" },
  AE: { name: "UAE", term: "Grade", curriculum: "Ministry of Education", code: "AE", math: "Math", hass: "Social Studies" },
  PH: { name: "Philippines", term: "Grade", curriculum: "K-12", code: "PH", math: "Math", hass: "Araling Panlipunan" },
  INT: { name: "International", term: "Year", curriculum: "General International", code: "INT", math: "Mathematics", hass: "Humanities" },
};

function getTopics(subjectId, year, countryCode) {
  const isEarly = year <= 2;
  const config = COUNTRIES[countryCode] || COUNTRIES.AU;
  
  // Localize Topic Names
  const moneyTerm = ["US", "CA", "IE", "AE"].includes(countryCode) ? "Money & Cents" : "Money & Finance";
  const historyTerm = countryCode === "US" ? "History" : "History";

  switch (subjectId) {
    case 'MATH':
      return isEarly 
        ? ['Counting', 'Shapes', 'Patterns', 'Measurements', 'Simple Data'] 
        : ['Number Sense', 'Algebra', 'Geometry', 'Data Handling', moneyTerm];
    case 'ENG':
      return isEarly
        ? ['Phonics', 'Sight Words', 'Listening', 'Sentences', 'Stories']
        : ['Spelling', 'Grammar', 'Reading Comprehension', 'Writing', 'Literature'];
    case 'SCI':
      return isEarly
        ? ['Living Things', 'Weather', 'Materials', 'My Body', 'Senses']
        : ['Biology', 'Chemistry', 'Earth & Space', 'Physics', 'Scientific Inquiry'];
    case 'HASS':
      return isEarly
        ? ['My Family', 'My Community', 'Celebrations']
        : [historyTerm, 'Geography', 'Civics', 'Community'];
    default:
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

function generateContent(countryCode, subjectName, topic, year, level) {
  const config = COUNTRIES[countryCode] || COUNTRIES.AU;
  const gradeLabel = `${config.term} ${year}`;
  
  const isBeg = level === 'Beginner';
  const isAdv = level === 'Advanced';

  const explanationIntro = isBeg 
    ? `Welcome to **${topic}**! In ${gradeLabel}, we build strong foundations. This skill helps you understand the world around you.`
    : isAdv
    ? `Ready for a challenge? We are diving deep into **${topic}**. We will apply rules to solve complex problems.`
    : `Let's practice **${topic}**. We will use strategies to make you faster and more accurate.`;

  const explanationBody = `
    **Key Idea:**
    ${topic} is important in the ${config.curriculum}. Whether in ${config.math} or ${subjectName}, there is a pattern to find.
    
    **How it works:**
    1. **Observe:** Look closely at the question.
    2. **Connect:** Use what you know from ${gradeLabel}.
    3. **Solve:** Take your time.
  `.trim();

  const realWorld = `You use ${topic} every day in ${config.name}. Look for examples around your home or school!`;

  const quiz = Array.from({ length: 10 }).map((_, i) => ({
    question: `${level} Question ${i + 1}: Which applies to ${topic}?`,
    options: [
      `The correct principle of ${topic}`, 
      `A common mistake`, 
      `An unrelated answer`, 
      `A trick answer`
    ],
    answer: `The correct principle of ${topic}`,
    explanation: `Correct! This matches what we learn in ${gradeLabel}.`
  }));

  return JSON.stringify({
    duration_minutes: 15,
    objective: `Master ${topic} at a ${level} level (${gradeLabel}).`,
    explanation: `${explanationIntro}\n\n${explanationBody}`,
    real_world_application: realWorld,
    memory_strategies: [`Stop & Think`, `Visualise It`, `Teach a Friend`],
    worked_example: `Let's solve a ${topic} problem step-by-step using ${config.math} rules.`,
    scenarios: [{ context: `Explaining ${topic} to a friend.`, questions: [{ prompt: "Key rule?", answer: "Follow the steps." }] }],
    quiz: quiz
  });
}

export async function GET() {
  const headers = new Headers();
  headers.set('Content-Type', 'text/csv; charset=utf-8');
  headers.set('Content-Disposition', 'attachment; filename="smartkidz_lessons_global_v2.csv"');

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      await writer.write(encoder.encode('id,country,year_level,subject_id,title,topic,curriculum_tags,content_json,created_at,updated_at\n'));

      const now = new Date().toISOString();
      const subjectIds = Object.keys(SUBJECT_NAMES);
      const countryCodes = Object.keys(COUNTRIES);

      for (const country of countryCodes) {
        const config = COUNTRIES[country];

        for (const subjId of subjectIds) {
          // Localize Subject Name (e.g. HASS -> Social Studies)
          let localizedSubject = SUBJECT_NAMES[subjId];
          if (subjId === "MATH") localizedSubject = config.math; // Math vs Maths
          if (subjId === "HASS") localizedSubject = config.hass; // HASS vs Social Studies
          
          for (const year of YEARS) {
            const topics = getTopics(subjId, year, country);
            
            for (const level of LEVELS) {
              for (let i = 1; i <= LESSONS_PER_LEVEL; i++) {
                const paddedI = i.toString().padStart(3, '0');
                const levelCode = level.substring(0, 3).toUpperCase();
                
                // ID: US_MATH_Y1_BEG_001
                const id = `${country}_${subjId}_Y${year}_${levelCode}_${paddedI}`;
                
                const topic = topics[(i - 1) % topics.length];
                const title = `${topic}: ${level} Mission ${i}`;
                
                // Tag: CCSS_MATH_G1... or AC9_MATH_Y1...
                const tagPrefix = country === 'US' ? 'CCSS' : country === 'GB' ? 'NC' : country === 'AU' ? 'AC9' : country;
                const tag = `${tagPrefix}_${subjId}_${config.term.charAt(0)}${year}_${levelCode}${i}`; 
                const curriculumTags = `{${tag}}`;

                const content = generateContent(country, localizedSubject, topic, year, level);

                const rowParts = [
                  escapeCsv(id),
                  escapeCsv(country),
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