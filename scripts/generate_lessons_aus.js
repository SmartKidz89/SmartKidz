
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = path.join(__dirname, '../csv_imports/bulk_lessons_aus.csv');

// Australian Curriculum approximate mappings
const CURRICULUM = {
    MATH: {
        name: 'Maths',
        strands: ['Number and Algebra', 'Measurement and Geometry', 'Statistics and Probability'],
        tags: (year) => [`AC9M${year}N01`, `AC9M${year}G02`, `AC9M${year}SP03`]
    },
    ENG: {
        name: 'English',
        strands: ['Language', 'Literature', 'Literacy'],
        tags: (year) => [`AC9E${year}LA01`, `AC9E${year}LY02`, `AC9E${year}LE03`]
    },
    SCI: {
        name: 'Science',
        strands: ['Biological Sciences', 'Chemical Sciences', 'Earth and Space Sciences', 'Physical Sciences'],
        tags: (year) => [`AC9S${year}U01`, `AC9S${year}H02`]
    },
    HASS: {
        name: 'HASS',
        strands: ['History', 'Geography', 'Civics and Citizenship', 'Economics and Business'],
        tags: (year) => [`AC9H${year}K01`, `AC9H${year}S02`]
    },
    ART: {
        name: 'The Arts',
        strands: ['Dance', 'Drama', 'Media Arts', 'Music', 'Visual Arts'],
        tags: (year) => [`AC9A${year}MA01`]
    },
    TECH: {
        name: 'Technologies',
        strands: ['Design and Technologies', 'Digital Technologies'],
        tags: (year) => [`AC9T${year}DI01`]
    }
};

const SUBJECT_IDS = Object.keys(CURRICULUM);
const YEARS = [1, 2, 3, 4, 5, 6];
const LESSONS_PER_YEAR = 50;

function escapeCsv(field) {
    if (field == null) return '';
    const stringField = String(field);
    if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
}

// PostgreSQL array format for CSV: "{tag1,tag2}"
function formatPostgresArray(arr) {
    if (!arr || arr.length === 0) return '{}';
    return `"{${arr.join(',')}}"`;
}

const ROWS = [];
// Header matches the schema provided
ROWS.push(['id', 'year_level', 'subject_id', 'title', 'topic', 'curriculum_tags', 'content_json'].join(','));

console.log(`Generating Australian Curriculum data...`);

let totalCount = 0;

for (const subjId of SUBJECT_IDS) {
    const subjectData = CURRICULUM[subjId];

    for (const year of YEARS) {
        for (let i = 1; i <= LESSONS_PER_YEAR; i++) {
            const paddedI = i.toString().padStart(3, '0');
            const id = `${subjId}_Y${year}_${paddedI}`;

            // Pick a random strand/topic
            const strand = subjectData.strands[(i - 1) % subjectData.strands.length];
            const tags = subjectData.tags(year);

            // Generate a title
            const title = `${subjectData.name} Yr ${year}: ${strand} - Lesson ${Math.ceil(i / 5)}`;

            const content = {
                hook: `Today in ${subjectData.name}, we are looking at ${strand}.`,
                overview: `This lesson aligns with the Australian Curriculum for Year ${year}, focusing on ${strand}.`,
                explanation: {
                    concepts: [
                        `Key concept 1 for ${strand}`,
                        `Key concept 2 for ${strand}`
                    ],
                    worked_example: `Here is a ${subjectData.name} example focusing on ${strand}...`
                },
                activities: [
                    {
                        type: "activity",
                        title: `${strand} Practice`,
                        instructions: `Complete the following task related to ${strand}.`,
                        duration_min: 15
                    }
                ],
                quiz: {
                    questions: [
                        {
                            q: `What is the main idea of ${strand}?`,
                            options: ["Option A", "Option B", "Option C"]
                        }
                    ]
                }
            };

            ROWS.push([
                id,
                year,
                subjId,
                escapeCsv(title),
                escapeCsv(strand), // topic
                formatPostgresArray(tags), // curriculum_tags
                escapeCsv(JSON.stringify(content)) // content_json
            ].join(','));

            totalCount++;
        }
    }
}

fs.writeFileSync(OUTPUT_FILE, ROWS.join('\n'), 'utf8');

console.log(`Success! Generated ${totalCount} lessons to ${OUTPUT_FILE}`);
