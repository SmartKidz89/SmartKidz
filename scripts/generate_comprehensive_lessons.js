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
    question: `${level} Question ${i + 1}: What is the key rule of ${topic}?`,
    options: [
      `The correct principle of ${topic}`,
      `A common mistake made in ${topic}`,
      `An unrelated answer`,
      `A trick answer`
    ],
    answer: `The correct principle of ${topic}`,
    explanation: `For ${level} level understanding, this is correct because it follows the main rule of ${topic}.`
  }));
}

function generateLessonContent(subject, topic, year, level, index) {
  const isAdv = level === 'Advanced';
  const isBeg = level === 'Beginner';
  
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
    
    *Tip:* Take your time. It is not about being fast, it is about being sure!
  `.trim();

  const realWorldApps = [
    `Next time you are at the shops, look for **${topic}** in action!`,
    `Architects and builders use **${topic}** every day.`,
    `Scientists use **${topic}** to measure things in nature.`
  ];

  return {
    duration_minutes: 15,
    objective: `Master the concepts of ${topic} at a ${level} level.`,
    explanation: `${explanationIntro}\n\n${explanationBody}`,
    real_world_application: realWorldApps[index % realWorldApps.length],
    memory_strategies: [
      `**The 'Stop & Think' Method:** Pause for 3 seconds before answering.`,
      `**Visualise It:** Picture the problem in your head.`,
      `**Teach a Friend:** Explain it to someone else to test your knowledge.`
    ],
    worked_example: `
      **Let's try one together!**
      
      *Problem:* How do we use ${topic}?
      
      **Step 1:** Read the question carefully.
      **Step 2:** Look for clues.
      **Step 3:** Apply the rule.
      **Step 4:** Check your work.
      
      *Result:* You solved it!
    `.trim(),
    scenarios: [
      {
        context: `Imagine you are explaining ${topic} to a friend.`,
        questions: [
          { prompt: "What is the most important rule?", answer: "The core rule defined above." }
        ]
      }
    ],
    quiz: generateQuiz(subject, topic, level, 15)
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