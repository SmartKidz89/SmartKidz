import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60; 

const YEARS = [1, 2, 3, 4, 5, 6];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LESSONS_PER_LEVEL = 50; 

const COUNTRIES = {
  AU: { name: "Australia", term: "Year", curriculum: "Australian Curriculum (AC9)", code: "AU", math: "Maths", hass: "HASS" },
  NZ: { name: "New Zealand", term: "Year", curriculum: "New Zealand Curriculum", code: "NZ", math: "Maths", hass: "Social Sciences" },
  US: { name: "United States", term: "Grade", curriculum: "Common Core", code: "US", math: "Math", hass: "Social Studies" },
  GB: { name: "United Kingdom", term: "Year", curriculum: "National Curriculum", code: "GB", math: "Maths", hass: "Humanities" },
  CA: { name: "Canada", term: "Grade", curriculum: "Provincial Standards", code: "CA", math: "Math", hass: "Social Studies" },
  IN: { name: "India", term: "Class", curriculum: "CBSE Aligned", code: "IN", math: "Maths", hass: "Social Science" },
  SG: { name: "Singapore", term: "Primary", curriculum: "MOE Syllabus", code: "SG", math: "Maths", hass: "Social Studies" },
  ZA: { name: "South Africa", term: "Grade", curriculum: "CAPS", code: "ZA", math: "Maths", hass: "Social Sciences" },
  IE: { name: "Ireland", term: "Class", curriculum: "Primary Curriculum", code: "IE", math: "Maths", hass: "SESE" },
  AE: { name: "UAE", term: "Grade", curriculum: "Ministry of Education", code: "AE", math: "Math", hass: "Social Studies" },
  PH: { name: "Philippines", term: "Grade", curriculum: "K-12", code: "PH", math: "Math", hass: "Araling Panlipunan" },
  INT: { name: "International", term: "Year", curriculum: "Global Standards", code: "INT", math: "Mathematics", hass: "Humanities" },
};

const ALL_COUNTRY_CODES = Object.keys(COUNTRIES);

// --- 1. Year-Specific Curriculum Matrix ---
// This ensures Year 1 gets "Counting" and Year 6 gets "Algebra".

const TOPICS = {
  MATH: {
    1: ["Counting to 100", "Simple Addition", "2D Shapes", "Days of the Week", "Length & Height", "Simple Patterns"],
    2: ["Place Value (100s)", "Addition & Subtraction", "Money Basics", "3D Objects", "Fractions (Halves/Quarters)", "Telling Time"],
    3: ["Times Tables (2,5,10)", "3-Digit Place Value", "Measuring Liquids", "Angles Basics", "Data Charts", "Chance"],
    4: ["Times Tables (Full)", "Division Basics", "Fractions & Decimals", "Area & Perimeter", "Symmetry", "Word Problems"],
    5: ["Decimals & Percentages", "Long Multiplication", "Factors & Multiples", "24-Hour Time", "Angles & Degrees", "Budgets"],
    6: ["Integers", "Cartesian Planes", "Order of Operations", "Volume & Capacity", "Probability", "Data Analysis"]
  },
  ENG: {
    1: ["Phonics (Blends)", "Simple Sentences", "Retelling Stories", "Handwriting", "Capital Letters", "Rhyming"],
    2: ["Compound Words", "Adjectives & Verbs", "Story Structure", "Punctuation (!?)", "Reading Fluency", "Spelling Rules"],
    3: ["Paragraphs", "Persuasive Basics", "Nouns & Pronouns", "Editing Skills", "Prefixes & Suffixes", "Reading Comprehension"],
    4: ["Narrative Arcs", "Dialogue", "Information Reports", "Similes & Metaphors", "Complex Sentences", "Vocabulary"],
    5: ["Persuasive Devices", "Poetry Analysis", "Novel Studies", "Grammar Mechanics", "Note Taking", "Debating"],
    6: ["Media Literacy", "Essay Structure", "Advanced Grammar", "Author's Purpose", "Creative Writing", "Research Skills"]
  },
  SCI: {
    1: ["Living vs Non-Living", "Seasons & Weather", "Materials", "Five Senses", "Movement", "My Body"],
    2: ["Life Cycles", "Water Cycle", "Mixing Materials", "Push & Pull", "Earth's Resources", "Sound"],
    3: ["Heat & Energy", "Solids & Liquids", "Living Things Grow", "Day & Night", "Magnets", "Rocks & Soil"],
    4: ["Forces & Friction", "Life Cycles (Advanced)", "Properties of Matter", "Erosion", "Sustainable Materials", "Plants"],
    5: ["Light & Shadows", "Adaptations", "Solids Liquids Gases", "Solar System", "Electricity", "Scientific Method"],
    6: ["Energy Sources", "Extreme Weather", "Chemical Changes", "Micro-organisms", "Circuits", "Environmental Science"]
  },
  // Default fallback for other subjects (can be expanded similarly)
  GENERIC: {
    1: ["Basics Level 1", "Exploration 1", "My World 1", "Creativity 1"],
    2: ["Basics Level 2", "Exploration 2", "My World 2", "Creativity 2"],
    3: ["Concepts Level 3", "Skills Level 3", "Inquiry 3", "Projects 3"],
    4: ["Concepts Level 4", "Skills Level 4", "Inquiry 4", "Projects 4"],
    5: ["Advanced Concepts 5", "Analysis 5", "Global View 5", "Innovation 5"],
    6: ["Advanced Concepts 6", "Analysis 6", "Global View 6", "Innovation 6"]
  }
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

function getTopics(subjectId, year) {
  return TOPICS[subjectId]?.[year] || TOPICS.GENERIC[year] || ["General Topic"];
}

function escapeCsv(field) {
  if (field == null) return '';
  const s = String(field);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// --- 2. Nuanced Content Generator ---

function generateContent(countryCode, subjectName, topic, year, level) {
  const config = COUNTRIES[countryCode] || COUNTRIES.AU;
  const gradeLabel = `${config.term} ${year}`;
  
  // Distinguish levels by depth, not just label
  let focus = "";
  let complexity = "";
  
  if (level === 'Beginner') {
    focus = "Introduction to the concept.";
    complexity = "simple, direct questions";
  } else if (level === 'Intermediate') {
    focus = "Practising the core skills.";
    complexity = "standard problems";
  } else {
    focus = "Applying knowledge to new situations.";
    complexity = "multi-step or critical thinking problems";
  }

  const explanation = `
    **Topic:** ${topic} (${gradeLabel})
    
    **Focus:** ${focus}
    
    In this lesson, we explore **${topic}**. This is a key part of the ${subjectName} curriculum for ${gradeLabel}.
    
    **Key Points:**
    1. Understand the main idea of ${topic}.
    2. Practice using ${topic} in ${complexity}.
    3. Check your work carefully.
  `.trim();

  // Generate specific quiz style based on level
  const quiz = Array.from({ length: 10 }).map((_, i) => {
    let qText = "";
    let correct = "";
    let distractors = [];

    if (level === 'Beginner') {
      qText = `What is the basic rule of ${topic}? (Question ${i+1})`;
      correct = `The foundational rule of ${topic}.`;
      distractors = [`A rule for a different topic`, `The opposite rule`, `Unrelated fact`];
    } else if (level === 'Intermediate') {
      qText = `How do you apply ${topic} in a standard situation? (Question ${i+1})`;
      correct = `Apply the standard method for ${topic}.`;
      distractors = [`Use a guessing method`, `Skip the first step`, `Apply a Year ${year-1} method`];
    } else {
      qText = `Solve this challenge problem about ${topic}. (Question ${i+1})`;
      correct = `The solution derived from careful analysis of ${topic}.`;
      distractors = [`A common misconception answer`, `A partially correct answer`, `A guess`];
    }

    return {
      question: qText,
      options: [correct, ...distractors], // In real app, shuffle these
      answer: correct,
      explanation: `Correct! ${focus}`
    };
  });

  return JSON.stringify({
    duration_minutes: 15,
    objective: `${level}: ${topic} for ${gradeLabel}.`,
    explanation: explanation,
    real_world_application: `We see ${topic} in the world around us in ${config.name}.`,
    memory_strategies: [`Link ${topic} to something you know`, `Practice makes perfect`],
    worked_example: `Here is how we solve a ${level} problem in ${topic}...`,
    scenarios: [{ context: `A real-life situation involving ${topic}.`, questions: [{ prompt: "What would you do?", answer: "Apply the concept." }] }],
    quiz: quiz
  });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const batch = searchParams.get('batch');
  
  // Batch logic remains same
  let targetCountries = ALL_COUNTRY_CODES;
  let filename = "smartkidz_lessons_full.csv";

  if (batch === "1") {
    targetCountries = ALL_COUNTRY_CODES.slice(0, 3); 
    filename = "smartkidz_lessons_part1_AU_NZ_US.csv";
  } else if (batch === "2") {
    targetCountries = ALL_COUNTRY_CODES.slice(3, 6);
    filename = "smartkidz_lessons_part2_GB_CA_IN.csv";
  } else if (batch === "3") {
    targetCountries = ALL_COUNTRY_CODES.slice(6, 9);
    filename = "smartkidz_lessons_part3_SG_ZA_IE.csv";
  } else if (batch === "4") {
    targetCountries = ALL_COUNTRY_CODES.slice(9, 12);
    filename = "smartkidz_lessons_part4_AE_PH_INT.csv";
  }

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

        for (const subjId of subjectIds) {
          let localizedSubject = SUBJECT_NAMES[subjId];
          if (subjId === "MATH") localizedSubject = config.math; 
          if (subjId === "HASS") localizedSubject = config.hass; 
          
          for (const year of YEARS) {
            // NEW: Get topics specific to this year level
            const topics = getTopics(subjId, year);
            
            for (const level of LEVELS) {
              for (let i = 1; i <= LESSONS_PER_LEVEL; i++) {
                const paddedI = i.toString().padStart(3, '0');
                const levelCode = level.substring(0, 3).toUpperCase();
                
                const id = `${country}_${subjId}_Y${year}_${levelCode}_${paddedI}`;
                
                // Distribute topics evenly across the lessons in this level
                const topic = topics[(i - 1) % topics.length];
                const title = `${topic}: ${level} Mission ${i}`;
                
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