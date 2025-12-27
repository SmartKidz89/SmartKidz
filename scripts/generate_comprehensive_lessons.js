import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure directory exists
const OUT_DIR = path.join(__dirname, '../csv_imports');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const OUTPUT_FILE = path.join(OUT_DIR, 'comprehensive_curriculum.csv');

// --- Configuration ---

const YEARS = [1, 2, 3, 4, 5, 6];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LESSONS_PER_LEVEL = 100; // 100 per level = 300 per year per subject

const SUBJECTS = {
  MATH: {
    name: 'Mathematics',
    topics: [
      'Number and Place Value', 'Patterns and Algebra', 'Fractions and Decimals',
      'Money and Finance', 'Shape and Geometry', 'Location and Transformation',
      'Units of Measurement', 'Time', 'Chance', 'Data Representation'
    ]
  },
  ENG: {
    name: 'English',
    topics: [
      'Phonics and Word Knowledge', 'Spelling Rules', 'Grammar and Punctuation',
      'Reading Fluency', 'Comprehension Strategies', 'Types of Texts',
      'Narrative Writing', 'Persuasive Writing', 'Poetry', 'Visual Literacy'
    ]
  },
  SCI: {
    name: 'Science',
    topics: [
      'Biological Sciences (Living Things)', 'Chemical Sciences (Materials)',
      'Earth and Space Sciences', 'Physical Sciences (Energy & Force)',
      'Scientific Inquiry', 'Fair Testing', 'Data Analysis'
    ]
  },
  HASS: {
    name: 'HASS',
    topics: [
      'History: First Nations', 'History: World Exploration', 'Geography: Places',
      'Geography: Maps', 'Civics and Citizenship', 'Economics and Business',
      'Community and Culture', 'Sustainability'
    ]
  },
  HPE: {
    name: 'Health & PE',
    topics: [
      'Personal Health', 'Safety and Risk', 'Active Living', 'Movement Skills',
      'Teamwork and Fair Play', 'Nutrition', 'Mental Wellbeing', 'Relationships'
    ]
  },
  ART: {
    name: 'The Arts',
    topics: [
      'Visual Arts: Techniques', 'Visual Arts: Colour Theory', 'Music: Rhythm and Beat',
      'Music: Pitch and Melody', 'Drama: Role and Character', 'Dance: Movement',
      'Media Arts: Storytelling'
    ]
  },
  TECH: {
    name: 'Technologies',
    topics: [
      'Digital Systems', 'Data Representation', 'Algorithms (Coding)',
      'Design Thinking', 'Materials and Tools', 'Food and Fibre Production'
    ]
  },
  LANG: {
    name: 'Languages',
    topics: [
      'Greetings and Introductions', 'Family and Friends', 'Numbers and Counting',
      'Food and Drink', 'School and Hobbies', 'Time and Weather',
      'Cultural Traditions', 'Travel'
    ]
  }
};

// --- Content Generators ---

function escapeCsv(field) {
  if (field == null) return '';
  const s = String(field);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function generateQuiz(subject, topic, level, count = 15) {
  return Array.from({ length: count }).map((_, i) => ({
    question: `${level} Question ${i + 1} about ${topic}: What is the correct approach?`,
    options: [
      `The correct answer for ${topic} (${level})`,
      `A common misconception about ${topic}`,
      `An unrelated fact`,
      `A plausible but wrong answer`
    ],
    answer: `The correct answer for ${topic} (${level})`,
    explanation: `For ${level} level understanding of ${topic}, this is the correct choice because it follows the core rule.`
  }));
}

function generateLessonContent(subject, topic, year, level, index) {
  const isAdv = level === 'Advanced';
  const isBeg = level === 'Beginner';
  
  const complexity = isBeg ? "fundamental" : isAdv ? "complex" : "core";
  const action = isBeg ? "identify" : isAdv ? "analyse" : "apply";

  return {
    duration_minutes: 15,
    objective: `Students will learn to ${action} ${complexity} concepts related to ${topic}.`,
    
    explanation: `
      **Welcome to ${topic}!**
      
      In this ${level} lesson, we are exploring the ${complexity} rules of ${topic}.
      
      1. **Concept**: Ideally, we focus on how ${topic} works in the real world.
      2. **Process**: To solve problems in this area, first check your inputs, then apply the rule.
      3. **Key Terminology**: Remember the word "Variable" implies change, while "Constant" implies staying the same.
      
      *Tip*: ${isAdv ? "Look out for exceptions to the rule." : "Take your time and double-check."}
    `.trim(),

    real_world_application: `You can see ${topic} in action when you are ${isBeg ? 'shopping or playing' : 'planning a project or building something'}.`,
    
    memory_strategies: [
      `Keyword Association: Link ${topic} with the word "${isBeg ? 'Start' : 'Build'}".`,
      `Visualization: Picture a ${isBeg ? 'simple box' : 'complex machine'} when thinking about this.`
    ],

    worked_example: `
      **Problem**: How do we apply ${topic}?
      **Step 1**: Identify the key parts.
      **Step 2**: Apply the ${level} rule.
      **Solution**: The result shows how ${topic} functions correctly.
    `.trim(),

    scenarios: [
      {
        context: `Imagine you are explaining ${topic} to a friend.`,
        questions: [
          { prompt: "What is the most important rule?", answer: "The core rule defined above." },
          { prompt: "What happens if you reverse it?", answer: "It usually breaks the pattern." }
        ]
      }
    ],

    quiz: generateQuiz(subject, topic, level, 15) // 15 Questions
  };
}

// --- Main Execution ---

const stream = fs.createWriteStream(OUTPUT_FILE);

// Write Header
stream.write('id,year_level,subject_id,title,topic,curriculum_tags,content_json\n');

let totalCount = 0;
console.log("Starting massive lesson generation...");

Object.keys(SUBJECTS).forEach(subjId => {
  const subjectData = SUBJECTS[subjId];
  
  YEARS.forEach(year => {
    LEVELS.forEach(level => {
      // 100 lessons per level
      for (let i = 1; i <= LESSONS_PER_LEVEL; i++) {
        const paddedI = i.toString().padStart(3, '0');
        const levelCode = level.substring(0, 3).toUpperCase();
        
        // ID Format: MATH_Y1_BEG_001
        const id = `${subjId}_Y${year}_${levelCode}_${paddedI}`;
        
        // Topic Rotation
        const topic = subjectData.topics[(i - 1) % subjectData.topics.length];
        
        const title = `${topic}: ${level} Mission ${i}`;
        
        // Approx curriculum tag
        const tag = `AC9${subjId.charAt(0)}${year}${levelCode}${i}`; 
        
        const content = generateLessonContent(subjectData.name, topic, year, level, i);

        const row = [
          id,
          year,
          subjId,
          escapeCsv(title),
          escapeCsv(topic),
          `"{${tag}}"`, // Postgres array format
          escapeCsv(JSON.stringify(content))
        ].join(',') + '\n';

        stream.write(row);
        totalCount++;
      }
    });
  });
  console.log(`Finished ${subjectData.name}...`);
});

stream.end();

console.log(`\nDONE! Generated ${totalCount} lessons.`);
console.log(`File saved to: ${OUTPUT_FILE}`);
console.log(`\nNext Steps:`);
console.log(`1. Go to Supabase Dashboard -> Table Editor -> 'lessons' table`);
console.log(`2. Click 'Insert' -> 'Import Data from CSV'`);
console.log(`3. Select this file. Ensure 'content_json' maps to JSONB type.`);