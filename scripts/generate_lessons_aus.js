import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = path.join(__dirname, '../csv_imports/bulk_lessons_aus_expanded.csv');

// Australian Curriculum approximate mappings & Topics
const CURRICULUM = {
    MATH: {
        name: 'Maths',
        strands: ['Number & Algebra', 'Measurement & Geometry', 'Statistics & Probability'],
        topics: [
            'Counting & Place Value', 'Addition & Subtraction', 'Multiplication & Division', 
            'Fractions & Decimals', 'Money & Finance', 'Patterns & Algebra',
            'Shape & Geometric Reasoning', 'Location & Transformation', 'Using Units of Measurement',
            'Chance', 'Data Representation'
        ],
        tags: (year) => [`AC9M${year}N01`, `AC9M${year}G02`, `AC9M${year}SP03`]
    },
    ENG: {
        name: 'English',
        strands: ['Language', 'Literature', 'Literacy'],
        topics: [
            'Phonics & Word Knowledge', 'Spelling Rules', 'Grammar & Punctuation',
            'Reading Comprehension', 'Types of Texts', 'Creating Literature',
            'Listening & Speaking', 'Visual Literacy', 'Handwriting'
        ],
        tags: (year) => [`AC9E${year}LA01`, `AC9E${year}LY02`, `AC9E${year}LE03`]
    },
    SCI: {
        name: 'Science',
        strands: ['Biological Sciences', 'Chemical Sciences', 'Earth & Space', 'Physical Sciences'],
        topics: [
            'Living Things', 'Life Cycles', 'Materials & Properties', 'States of Matter',
            'Earth, Sun & Moon', 'Weather & Seasons', 'Forces & Motion', 'Energy & Electricity',
            'Scientific Inquiry'
        ],
        tags: (year) => [`AC9S${year}U01`, `AC9S${year}H02`]
    },
    HASS: {
        name: 'HASS',
        strands: ['History', 'Geography', 'Civics', 'Economics'],
        topics: [
            'My Community', 'First Nations History', 'World Exploration', 'Celebrations',
            'Maps & Places', 'Sustainability', 'Rules & Laws', 'Needs vs Wants'
        ],
        tags: (year) => [`AC9H${year}K01`, `AC9H${year}S02`]
    },
    ART: {
        name: 'The Arts',
        strands: ['Dance', 'Drama', 'Media Arts', 'Music', 'Visual Arts'],
        topics: [
            'Colour Theory', 'Line & Shape', 'Rhythm & Beat', 'Roleplay & Character',
            'Dance Movements', 'Media Stories', 'Cultural Art'
        ],
        tags: (year) => [`AC9A${year}MA01`]
    },
    TECH: {
        name: 'Technologies',
        strands: ['Design and Technologies', 'Digital Technologies'],
        topics: [
            'Digital Systems', 'Data & Representation', 'Algorithms', 'Design Thinking',
            'Materials & Tools', 'Food & Fibre'
        ],
        tags: (year) => [`AC9T${year}DI01`]
    }
};

const LEVELS = ['Beginning', 'Intermediate', 'Advanced'];
const LESSONS_PER_LEVEL = 75; 
const YEARS = [1, 2, 3, 4, 5, 6];
const QUESTIONS_PER_LESSON = 15;

function escapeCsv(field) {
    if (field == null) return '';
    const stringField = String(field);
    if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
}

function formatPostgresArray(arr) {
    if (!arr || arr.length === 0) return '{}';
    return `"{${arr.join(',')}}"`;
}

function generateContent(subject, topic, year, level, index) {
    const isAdv = level === 'Advanced';
    const isBeg = level === 'Beginning';

    const objective = isBeg 
        ? `Identify and describe key features of ${topic}.`
        : isAdv 
        ? `Analyse and apply complex rules of ${topic} to new situations.`
        : `Understand and practice the core rules of ${topic}.`;

    const explanation = `
        In this ${level} lesson for Year ${year}, we explore ${topic}.
        
        1. **The Core Idea**: ${topic} helps us understand how the world works. At the ${level} stage, we focus on ${isBeg ? 'building strong foundations' : 'connecting ideas together'}.
        
        2. **Why it matters**: Understanding this allows you to solve real problems, like figuring out patterns or explaining observations in nature.
        
        3. **Deep Dive**: Remember that ${topic} involves checking your work. ${isAdv ? 'Look out for common exceptions.' : 'Take your time to spot the pattern.'}
    `.trim().replace(/\s+/g, ' ');

    const memory_strategies = [
        `Anchor Word: Connect "${topic}" to something you see every day.`,
        `Visualise: Close your eyes and picture the steps: First, Next, Then.`,
        `Teach it: Try explaining this rule to a friend or toy.`
    ];

    const real_world_application = `
        You use ${topic} when you are ${isBeg ? 'playing games or organizing toys' : 'planning a project or managing time'}. 
        Next time you are out, look for examples of ${topic} around you!
    `.trim();

    // Generate 15 questions per lesson
    const quiz = Array.from({ length: QUESTIONS_PER_LESSON }).map((_, qIdx) => ({
        q: `[${level}] Question ${qIdx + 1} about ${topic}: What is the key rule?`,
        options: [
            `The correct rule for ${topic} (${level})`,
            `A common mistake for ${topic}`,
            `An unrelated fact`,
            `Another random option`
        ],
        answer: 0, 
        hint: `Think about what we learned in the ${level} explanation.`
    }));

    return {
        duration_minutes: 15,
        objective,
        explanation,
        memory_strategies,
        real_world_application,
        quiz
    };
}

const ROWS = [];
ROWS.push(['id', 'year_level', 'subject_id', 'title', 'topic', 'curriculum_tags', 'content_json'].join(','));

console.log(`Generating lessons: ${Object.keys(CURRICULUM).length} subjects x ${YEARS.length} years x ${LEVELS.length} levels x ${LESSONS_PER_LEVEL} lessons...`);

let totalCount = 0;

for (const subjId of Object.keys(CURRICULUM)) {
    const subjectData = CURRICULUM[subjId];

    for (const year of YEARS) {
        for (const level of LEVELS) {
            for (let i = 1; i <= LESSONS_PER_LEVEL; i++) {
                // Unique ID: MATH_Y3_ADV_001
                const levelCode = level.substring(0, 3).toUpperCase();
                const paddedI = i.toString().padStart(3, '0');
                const id = `${subjId}_Y${year}_${levelCode}_${paddedI}`;
                
                // Cycle topics
                const topic = subjectData.topics[(i - 1) % subjectData.topics.length];
                const title = `${topic}: ${level} Practice ${i}`;
                const tags = subjectData.tags(year);

                const content = generateContent(subjectData.name, topic, year, level, i);

                ROWS.push([
                    id,
                    year,
                    subjId,
                    escapeCsv(title),
                    escapeCsv(topic),
                    formatPostgresArray(tags),
                    escapeCsv(JSON.stringify(content))
                ].join(','));

                totalCount++;
            }
        }
    }
}

fs.writeFileSync(OUTPUT_FILE, ROWS.join('\n'), 'utf8');

console.log(`Success! Generated ${totalCount} lessons to ${OUTPUT_FILE}`);