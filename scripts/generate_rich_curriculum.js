import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output Directory
const OUT_DIR = path.join(__dirname, '../csv_imports/rich_curriculum');
if (fs.existsSync(OUT_DIR)) {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(OUT_DIR, { recursive: true });

// --- Configuration ---

const CONFIG = {
  country: "AU",
  locale: "en-AU",
  curriculum_id: "AC9",
  primary_years: [1, 2, 3, 4, 5, 6],
  secondary_years: [7, 8, 9, 10, 11, 12]
};

// Curriculum Definitions
const PRIMARY_SUBJECTS = {
  MATH: { name: "Mathematics", strands: ["Number", "Algebra (Patterns)", "Measurement", "Space", "Statistics"] },
  ENG: { name: "English", strands: ["Language", "Literature", "Literacy"] },
  SCI: { name: "Science", strands: ["Biological", "Chemical", "Earth & Space", "Physical"] },
  HASS: { name: "HASS", strands: ["History", "Geography", "Civics", "Economics"] }
};

const SECONDARY_SUBJECTS = {
  MATH: { name: "Mathematics", strands: ["Number & Algebra", "Measurement & Geometry", "Statistics & Probability", "Calculus (11-12)"] },
  ENG: { name: "English", strands: ["Language", "Literature", "Literacy", "Text Response"] },
  SCI: { name: "Science", strands: ["Biology", "Chemistry", "Physics", "Earth & Environmental"] },
  HIST: { name: "History", strands: ["Ancient World", "Modern World", "Australian History"] },
  GEO:  { name: "Geography", strands: ["Biomes", "Urbanisation", "Water", "Human Wellbeing"] }
};

const LESSONS_PER_TOPIC = 200; 

// --- Helpers ---

function escapeCsv(field) {
  if (field === null || field === undefined) return '';
  const s = String(field);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

class CsvWriter {
  constructor(filename, headers) {
    this.path = path.join(OUT_DIR, filename);
    this.headers = headers;
    this.stream = fs.createWriteStream(this.path);
    this.stream.write(headers.join(',') + '\n');
  }
  write(row) {
    const line = this.headers.map(h => escapeCsv(row[h])).join(',');
    this.stream.write(line + '\n');
  }
  end() {
    this.stream.end();
  }
}

// --- Content Logic (Age Appropriate) ---

function getAgeAppropriatePrompt(subject, strand, year, index) {
  // Primary Logic (Years 1-6)
  if (year <= 6) {
    if (subject === 'MATH') {
      if (strand.includes("Algebra")) return `Look at this pattern: 2, 4, 6... What comes next?`; // Simple patterns only
      if (strand.includes("Number")) return `Count the objects. How many are there?`;
      return `Let's practice ${strand} together!`;
    }
    if (subject === 'SCI') {
      return `Look at the picture. Is it living or non-living?`;
    }
    return `Let's read a story about ${strand}.`;
  } 
  
  // Secondary Logic (Years 7-12)
  else {
    if (subject === 'MATH') {
      if (strand.includes("Calculus")) return `Solve for x: derivative of f(x)...`;
      if (strand.includes("Algebra")) return `Simplify the expression: 2x + 4y - x...`;
      return `Apply the ${strand} theorem to solve this problem.`;
    }
    if (subject === 'SCI') {
      return `Analyze the chemical reaction. What are the products?`;
    }
    return `Analyze the text for themes of ${strand}.`;
  }
}

function generatePedagogy(year, strand) {
  // Bloom's Taxonomy scaling
  const bloom = year <= 3 ? "Remember" : year <= 6 ? "Apply" : "Analyze";
  
  return {
    hint_progressive: [
      `Hint 1: Recall what we learned about ${strand}.`,
      `Hint 2: Try breaking it down into smaller steps.`,
      `Hint 3: Look at the example again.`
    ],
    adaptive_difficulty: true,
    cognitive_taxonomy: bloom,
    topic_revisit: Math.random() > 0.7,
    age_group: year <= 6 ? "primary" : "secondary"
  };
}

function generateGamification(index, year) {
  const isTeen = year >= 7;
  return {
    virtual_currency: "coins",
    xp_yield: 10 + (index * 2),
    streak_bonus: true,
    emotional_valence: "positive",
    mascot_reaction_state: isTeen ? "cool_nod" : "high_five", // Less 'cute' for teens
    ui_theme: isTeen ? "minimal_dark" : "vibrant_playful"
  };
}

// --- Main Generator Loop ---

const writers = {
  templates: new CsvWriter('lesson_templates_out.csv', ['template_id', 'subject_id', 'year_level', 'title', 'topic', 'canonical_tags']),
  editions: new CsvWriter('lesson_editions_out.csv', ['edition_id', 'template_id', 'country_code', 'locale_code', 'curriculum_id', 'title', 'wrapper_json']),
  items: new CsvWriter('lesson_content_items_out.csv', ['content_id', 'edition_id', 'activity_order', 'phase', 'type', 'title', 'content_json']),
  pedagogy: new CsvWriter('content_item_pedagogy_out.csv', ['content_id', 'pedagogy_json']),
  gamification: new CsvWriter('content_item_gamification_out.csv', ['content_id', 'gamification_json'])
};

console.log(`Starting Massive Generation (${CONFIG.country})...`);
console.log(`Target: ${LESSONS_PER_TOPIC} lessons per topic per year.`);

let totalLessons = 0;

function processYearGroup(years, subjectsMap) {
  years.forEach(year => {
    Object.keys(subjectsMap).forEach(subjId => {
      const subject = subjectsMap[subjId];
      
      subject.strands.forEach(strand => {
        // High volume loop
        for(let i = 1; i <= LESSONS_PER_TOPIC; i++) {
          
          const templateId = `${subjId}_Y${year}_${strand.substring(0,3).toUpperCase()}_${String(i).padStart(3,'0')}`;
          const title = `${strand}: Mission ${i}`;
          
          // 1. Template
          writers.templates.write({
            template_id: templateId,
            subject_id: subjId,
            year_level: year,
            title: title,
            topic: strand,
            canonical_tags: `{${CONFIG.curriculum_id}.${subjId}.${year}.${strand.substring(0,3)}.${i}}`
          });

          // 2. Edition
          const editionId = `${templateId}_${CONFIG.country}`;
          const wrapper = {
            narrative_setup: year <= 6 
              ? `Welcome to the ${strand} zone! Today's mission is #${i}.`
              : `Module ${i}: Advanced concepts in ${strand}.`,
            mascot_greeting_anim: year <= 6 ? "wave" : "nod"
          };

          writers.editions.write({
            edition_id: editionId,
            template_id: templateId,
            country_code: CONFIG.country,
            locale_code: CONFIG.locale,
            curriculum_id: CONFIG.curriculum_id,
            title: title,
            wrapper_json: JSON.stringify(wrapper)
          });

          // 3. Content Items (3 activities per lesson to keep file size sane)
          const phases = ['hook', 'practice', 'challenge'];
          
          phases.forEach((phase, idx) => {
            const contentId = `${editionId}_ACT_${idx + 1}`;
            const prompt = getAgeAppropriatePrompt(subjId, strand, year, i);
            
            const contentBody = {
              id: contentId,
              type: "constructed_response", // Upgraded from simple quiz
              phase: phase,
              title: phase.charAt(0).toUpperCase() + phase.slice(1),
              prompt_markdown: prompt,
              media_urls: []
            };

            writers.items.write({
              content_id: contentId,
              edition_id: editionId,
              activity_order: idx + 1,
              phase: phase,
              type: "constructed_response",
              title: contentBody.title,
              content_json: JSON.stringify(contentBody)
            });

            // 4. Layers
            writers.pedagogy.write({
              content_id: contentId,
              pedagogy_json: JSON.stringify(generatePedagogy(year, strand))
            });

            writers.gamification.write({
              content_id: contentId,
              gamification_json: JSON.stringify(generateGamification(idx, year))
            });
          });

          totalLessons++;
          if (totalLessons % 1000 === 0) console.log(`Generated ${totalLessons} lessons...`);
        }
      });
    });
  });
}

// Run Primary
processYearGroup(CONFIG.primary_years, PRIMARY_SUBJECTS);

// Run Secondary
processYearGroup(CONFIG.secondary_years, SECONDARY_SUBJECTS);

Object.values(writers).forEach(w => w.end());

console.log(`\nDONE. Total Lessons: ${totalLessons}`);
console.log(`Output Location: ${OUT_DIR}`);