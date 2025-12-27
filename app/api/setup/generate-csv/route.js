import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60; 

const YEARS = [1, 2, 3, 4, 5, 6];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LESSONS_PER_LEVEL = 50; 

// --- 1. Country & Curriculum Configuration ---

const COUNTRIES = {
  // --- AU / NZ Group ---
  AU: { name: "Australia", type: "AU", term: "Year", math: "Maths", hass: "HASS" },
  NZ: { name: "New Zealand", type: "AU", term: "Year", math: "Maths", hass: "Social Sciences" },
  
  // --- US / North America Group ---
  US: { name: "United States", type: "US", term: "Grade", math: "Math", hass: "Social Studies" },
  CA: { name: "Canada", type: "US", term: "Grade", math: "Math", hass: "Social Studies" },
  PH: { name: "Philippines", type: "US", term: "Grade", math: "Math", hass: "Araling Panlipunan" },

  // --- UK / British Curriculum Group ---
  GB: { name: "United Kingdom", type: "UK", term: "Year", math: "Maths", hass: "Humanities" },
  IE: { name: "Ireland", type: "UK", term: "Class", math: "Maths", hass: "SESE" },
  ZA: { name: "South Africa", type: "UK", term: "Grade", math: "Maths", hass: "Social Sciences" },
  SG: { name: "Singapore", type: "UK", term: "Primary", math: "Maths", hass: "Social Studies" },
  AE: { name: "UAE", type: "UK", term: "Grade", math: "Math", hass: "Social Studies" },
  
  // --- International ---
  IN: { name: "India", type: "UK", term: "Class", math: "Maths", hass: "Social Science" },
  INT: { name: "International", type: "UK", term: "Year", math: "Mathematics", hass: "Humanities" },
};

const ALL_COUNTRY_CODES = Object.keys(COUNTRIES);

// --- 2. Country-Specific Topic Matrices ---

const CURRICULA = {
  // === AUSTRALIAN / NZ STYLE (Metric, HASS, First Nations) ===
  AU: {
    MATH: {
      1: ["Counting to 100", "Australian Money", "2D Shapes", "Days of Week", "Length (cm)", "Patterns"],
      2: ["Place Value (100s)", "Addition/Subtraction", "Counting Change", "3D Objects", "Fractions (Halves)", "Time (Half-hour)"],
      3: ["Times Tables (2,3,5,10)", "4-Digit Numbers", "Measuring Liquids (mL/L)", "Angles", "Data Charts", "Chance"],
      4: ["Times Tables (Full)", "Division", "Fractions & Decimals", "Area & Perimeter (m²)", "Symmetry", "Word Problems"],
      5: ["Decimals & Percentages", "Long Multiplication", "Factors", "24-Hour Time", "Angles & Degrees", "Budgets & GST"],
      6: ["Integers", "Cartesian Planes", "Order of Operations", "Volume & Capacity", "Probability", "Data Interpretation"]
    },
    HASS: {
      1: ["My Family History", "Local Places", "Weather & Seasons", "Daily Life Then & Now", "Caring for Places"],
      2: ["History of My Community", "Continents & Oceans", "Connecting to Country", "Technology Over Time", "Celebrations"],
      3: ["First Nations Communities", "Australia's Neighbours", "Climate Zones", "Community Rules", "Democracy Basics"],
      4: ["First Fleet & Exploration", "Sustainable Living", "Laws & Local Government", "African/South American Geography", "Trade Basics"],
      5: ["Australian Colonies", "Gold Rush", "Disaster Management", "Elections", "Consumer Rights"],
      6: ["Federation 1901", "Migration Stories", "Asian Geography", "Global Citizenship", "Economics & Business"]
    },
    SCI: {
      1: ["Living Things", "Daily Weather", "Materials & Uses", "How Things Move", "Senses"],
      2: ["Life Cycles", "Water Use", "Mixing Materials", "Push & Pull", "Sound"],
      3: ["Heat Energy", "Solids Liquids Gases", "Living vs Non-Living", "Day & Night", "Rocks"],
      4: ["Forces & Friction", "Plant Life Cycles", "Material Properties", "Erosion", "Magnets"],
      5: ["Light & Shadows", "Animal Adaptations", "Matter (States)", "Solar System", "Electricity"],
      6: ["Energy Sources", "Extreme Weather", "Chemical Changes", "Micro-organisms", "Circuits"]
    }
  },

  // === US / NORTH AMERICAN STYLE (Imperial, Social Studies, Civics) ===
  US: {
    MATH: {
      1: ["Base Ten Basics", "Addition to 20", "Geometry (Shapes)", "Time to Hour", "Length (Inches)", "Data Analysis"],
      2: ["Place Value to 1000", "Money (Dollars/Cents)", "Measurement (Feet)", "Arrays", "Time (5 mins)", "Graphs"],
      3: ["Multiplication Concepts", "Division Concepts", "Fractions as Numbers", "Area & Perimeter", "Liquid Volume", "Mass"],
      4: ["Factors & Multiples", "Fraction Equivalence", "Decimals", "Angles & Lines", "Unit Conversion", "Multi-step Problems"],
      5: ["Place Value Decimals", "Multiplying Decimals", "Adding Fractions", "Volume Concepts", "Coordinate Plane", "Data Interpretation"],
      6: ["Ratios & Rates", "Negative Numbers", "Algebraic Expressions", "Statistical Variability", "Area of Polygons", "Equations"]
    },
    HASS: { // Social Studies
      1: ["My Community", "US Symbols (Flag/Eagle)", "Good Citizenship", "Maps & Globes", "Past & Present"],
      2: ["Government Basics", "Historical Figures", "Geography of North America", "Economics (Needs/Wants)", "Culture"],
      3: ["Local Government", "Native American History", "Resources & Trade", "Communities Over Time", "Map Skills"],
      4: ["State History", "Regions of the US", "The American Revolution", "Industrial Growth", "Immigration"],
      5: ["US Constitution", "Civil Rights", "Early Exploration", "Westward Expansion", "The Civil War"],
      6: ["Ancient Civilizations", "World Geography", "Global Economics", "Types of Government", "World Cultures"]
    },
    SCI: {
      1: ["Plant Parts", "Sun & Moon", "Animal Needs", "Sound & Light", "Weather Patterns"],
      2: ["Pollination", "Landforms", "Matter Properties", "Habitats", "Engineering Design"],
      3: ["Forces & Motion", "Life Cycles", "Weather & Climate", "Inherited Traits", "Fossils"],
      4: ["Energy Transfer", "Waves", "Earth's Systems", "Internal Structures", "Information Processing"],
      5: ["Matter Particles", "Ecosystems", "Earth's Spheres", "Space Systems", "Chemical Reactions"],
      6: ["Cells", "Body Systems", "Genetics", "Thermal Energy", "Weather Prediction"]
    }
  },

  // === UK / BRITISH STYLE (Metric, History, Geography) ===
  UK: {
    MATH: {
      1: ["Number Bonds", "Addition to 20", "2D & 3D Shapes", "Length & Height", "Weight & Volume", "Money (Pence)"],
      2: ["Place Value", "Addition/Subtraction", "Multiplication (2,5,10)", "Fractions (1/2, 1/4)", "Position & Direction", "Time"],
      3: ["3-Digit Numbers", "3,4,8 Times Tables", "Length (m/cm/mm)", "Perimeter", "Fractions", "Angles"],
      4: ["Roman Numerals", "Negative Numbers", "Decimals", "Area", "Symmetry", "Coordinates"],
      5: ["Numbers to 1M", "Prime Numbers", "Percentages", "Volume", "Converting Units", "Geometry"],
      6: ["Algebra", "Ratio", "Pie Charts", "Long Division", "Area of Triangles", "Position"]
    },
    HASS: { // Humanities (History/Geo)
      1: ["My Local Area", "Kings & Queens", "Toys from the Past", "Weather Patterns", "United Kingdom Map"],
      2: ["Great Fire of London", "Explorers", "Seaside Holidays", "Continents & Oceans", "Florence Nightingale"],
      3: ["Stone Age to Iron Age", "Climate Zones", "Local Geography", "Ancient Egypt", "Volcanoes & Earthquakes"],
      4: ["Roman Empire", "Anglo-Saxons", "Rivers & Water Cycle", "Settlements", "The Vikings"],
      5: ["Ancient Greece", "Mayan Civilization", "Mountains", "Trade & Economics", "Land Use"],
      6: ["World War II", "The Victorians", "Global Trade", "South America", "Biomes"]
    },
    SCI: {
      1: ["Plants", "Animals Including Humans", "Everyday Materials", "Seasonal Changes", "Senses"],
      2: ["Living Things", "Plants (Growth)", "Animals (Survival)", "Uses of Materials", "Habitats"],
      3: ["Rocks & Soils", "Light", "Forces & Magnets", "Animals (Skeletons)", "Plants (Nutrition)"],
      4: ["Living Things (Classification)", "Animals (Digestion)", "States of Matter", "Sound", "Electricity"],
      5: ["Life Cycles", "Human Development", "Properties of Materials", "Earth & Space", "Forces (Gravity)"],
      6: ["Evolution", "Inheritance", "Light (Advanced)", "Electricity (Circuits)", "Circulatory System"]
    }
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

function getTopics(countryCode, subjectId, year) {
  const type = COUNTRIES[countryCode]?.type || "UK"; // Default UK/INT
  const curriculum = CURRICULA[type];
  
  // Specific subject mapping
  if (subjectId === "MATH") return curriculum.MATH[year] || ["General Maths"];
  if (subjectId === "HASS") return curriculum.HASS[year] || ["General Humanities"];
  if (subjectId === "SCI") return curriculum.SCI[year] || ["General Science"];
  
  // Fallback for universal subjects (English, Arts, etc are fairly similar globally at this level)
  const GENERIC = {
    ENG: ["Phonics", "Reading", "Spelling", "Grammar", "Writing", "Speaking"],
    ART: ["Drawing", "Painting", "Music", "Drama", "Dance", "Media"],
    TECH: ["Digital Systems", "Data", "Coding", "Design", "Tools", "Safety"],
    HPE: ["Personal Health", "Safety", "Active Living", "Movement", "Teamwork", "Nutrition"],
    LANG: ["Greetings", "Family", "Numbers", "Food", "School", "Culture"]
  };

  return GENERIC[subjectId] || ["General Topic"];
}

function escapeCsv(field) {
  if (field == null) return '';
  const s = String(field);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// --- 3. Content Generator ---

function generateContent(countryCode, subjectName, topic, year, level) {
  const config = COUNTRIES[countryCode] || COUNTRIES.AU;
  const gradeLabel = `${config.term} ${year}`;
  
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
    **Subject:** ${subjectName}
    **Focus:** ${focus}
    
    In this lesson, we explore **${topic}**. This is a key part of the ${config.name} curriculum for ${gradeLabel}.
    
    **Key Points:**
    1. Understand the main idea of ${topic}.
    2. Practice using ${topic} in ${complexity}.
    3. Check your work carefully.
  `.trim();

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
      options: [correct, ...distractors], 
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
  
  // Batch logic
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
            // NEW: Get topics specific to this country, subject, and year
            const topics = getTopics(country, subjId, year);
            
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