
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../csv_imports/bulk_lessons.csv');

const SUBJECTS = [
    { id: 'MATH', name: 'Maths', topics: ['Number', 'Algebra', 'Geometry', 'Statistics', 'Measurement'] },
    { id: 'ENG', name: 'English', topics: ['Reading', 'Writing', 'Grammar', 'Spelling', 'Speaking'] },
    { id: 'SCI', name: 'Science', topics: ['Biology', 'Chemistry', 'Physics', 'Earth Science', 'Space'] },
    { id: 'ART', name: 'Art', topics: ['Drawing', 'Painting', 'Sculpture', 'Digital', 'History'] },
    { id: 'CODE', name: 'Coding', topics: ['Logic', 'Algorithms', 'Python', 'Web', 'Data'] },
    { id: 'MUS', name: 'Music', topics: ['Theory', 'Rhythm', 'Pitch', 'History', 'Composition'] },
    { id: 'HIST', name: 'History', topics: ['Ancient', 'Modern', 'Local', 'World', 'Civics'] },
    { id: 'GEO', name: 'Geography', topics: ['Maps', 'Landforms', 'Climate', 'Population', 'Culture'] }
];

const YEARS = [1, 2, 3, 4, 5, 6];
const LESSONS_PER_YEAR = 50;

function escapeCsv(field) {
    if (field == null) return '';
    const stringField = String(field);
    // If it contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
    if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
}

const ROWS = [];
// Header
ROWS.push(['id', 'year_level', 'subject_id', 'title', 'topic', 'content_json'].join(','));

console.log(`Generating ${LESSONS_PER_YEAR} lessons for ${SUBJECTS.length} subjects across ${YEARS.length} year levels...`);

let totalCount = 0;

for (const subject of SUBJECTS) {
    for (const year of YEARS) {
        for (let i = 1; i <= LESSONS_PER_YEAR; i++) {
            const paddedI = i.toString().padStart(3, '0');
            const id = `${subject.id}_Y${year}_${paddedI}`;

            // Rotate topics
            const topic = subject.topics[(i - 1) % subject.topics.length];

            // Generate a title
            const title = `${subject.name} Level ${year} - ${topic} Lesson ${Math.ceil(i / subject.topics.length)}`;

            // Generate Content
            // We vary the content slightly so it's not all identical
            const content = {
                hook: `Welcome to ${title}!`,
                overview: `In this lesson, we will explore key concepts of ${topic} suitable for Year ${year} students.`,
                explanation: {
                    concepts: [
                        `Concept A about ${topic}`,
                        `Concept B about ${topic}`
                    ],
                    worked_example: `Here is an example problem for ${topic}...`
                },
                activities: [
                    {
                        type: "activity",
                        title: `Practice ${topic}`,
                        instructions: `Complete the ${topic} exercise sheet.`,
                        duration_min: 10 + (year * 2)
                    }
                ],
                quiz: {
                    questions: [
                        {
                            q: `What is a key rule of ${topic}?`,
                            options: ["Rule 1", "Rule 2", "Rule 3"]
                        }
                    ]
                }
            };

            ROWS.push([
                id,
                year,
                subject.id,
                escapeCsv(title),
                escapeCsv(topic),
                escapeCsv(JSON.stringify(content))
            ].join(','));

            totalCount++;
        }
    }
}

fs.writeFileSync(OUTPUT_FILE, ROWS.join('\n'), 'utf8');

console.log(`Done! Generated ${totalCount} lessons to ${OUTPUT_FILE}`);
