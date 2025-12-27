import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60; 

const YEARS = [1, 2, 3, 4, 5, 6];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LESSONS_PER_LEVEL = 50; 

// --- 1. Country Configuration ---

const COUNTRIES = {
  AU: { name: "Australia", term: "Year", math: "Maths", hass: "HASS" },
  NZ: { name: "New Zealand", term: "Year", math: "Maths", hass: "Social Sciences" },
  US: { name: "United States", term: "Grade", math: "Math", hass: "Social Studies" },
  GB: { name: "United Kingdom", term: "Year", math: "Maths", hass: "Humanities" },
  CA: { name: "Canada", term: "Grade", math: "Math", hass: "Social Studies" },
  IN: { name: "India", term: "Class", math: "Maths", hass: "Social Science" },
  SG: { name: "Singapore", term: "Primary", math: "Maths", hass: "Social Studies" },
  ZA: { name: "South Africa", term: "Grade", math: "Maths", hass: "Social Sciences" },
  IE: { name: "Ireland", term: "Class", math: "Maths", hass: "SESE" },
  AE: { name: "UAE", term: "Grade", math: "Math", hass: "Social Studies" },
  PH: { name: "Philippines", term: "Grade", math: "Math", hass: "Araling Panlipunan" },
  INT: { name: "International", term: "Grade", math: "Mathematics", hass: "Humanities" },
};

const ALL_COUNTRY_CODES = Object.keys(COUNTRIES);

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

// --- 2. Country-Specific Topic Matrices (All 12) ---

const CURRICULA = {
  // === AUSTRALIA (AU) ===
  AU: {
    MATH: {
      1: ["Counting to 100", "Australian Money", "2D Shapes", "Days of Week", "Length (cm)", "Patterns"],
      2: ["Place Value (100s)", "Addition & Subtraction", "Counting Change", "3D Objects", "Fractions (Halves)", "Time (Half-hour)"],
      3: ["Times Tables (2,3,5,10)", "4-Digit Numbers", "Measuring Liquids (mL/L)", "Angles", "Data Charts", "Chance"],
      4: ["Times Tables (Full)", "Division", "Fractions & Decimals", "Area & Perimeter (m²)", "Symmetry", "Word Problems"],
      5: ["Decimals & Percentages", "Long Multiplication", "Factors", "24-Hour Time", "Angles & Degrees", "Budgets & GST"],
      6: ["Integers", "Cartesian Planes", "Order of Operations", "Volume & Capacity", "Probability", "Data Interpretation"]
    },
    HASS: {
      1: ["My Family History", "Local Places", "Weather & Seasons", "Daily Life Then & Now", "Caring for Places"],
      2: ["History of My Community", "Continents & Oceans", "Connecting to Country", "Technology Over Time", "Celebrations"],
      3: ["First Nations Communities", "Australia's Neighbours", "Climate Zones", "Community Rules", "Democracy Basics"],
      4: ["First Fleet & Exploration", "Sustainable Living", "Laws & Local Government", "Geography of South America", "Trade Basics"],
      5: ["Australian Colonies", "Gold Rush", "Disaster Management", "Elections", "Consumer Rights"],
      6: ["Federation 1901", "Migration Stories", "Asian Geography", "Global Citizenship", "Economics & Business"]
    },
    SCI: { // AC9 Aligned
      1: ["Living Things", "Daily Weather", "Materials & Uses", "How Things Move", "Senses"],
      2: ["Life Cycles", "Water Use", "Mixing Materials", "Push & Pull", "Sound"],
      3: ["Heat Energy", "Solids Liquids Gases", "Living vs Non-Living", "Day & Night", "Rocks"],
      4: ["Forces & Friction", "Plant Life Cycles", "Material Properties", "Erosion", "Magnets"],
      5: ["Light & Shadows", "Animal Adaptations", "Matter (States)", "Solar System", "Electricity"],
      6: ["Energy Sources", "Extreme Weather", "Chemical Changes", "Micro-organisms", "Circuits"]
    }
  },

  // === NEW ZEALAND (NZ) ===
  NZ: {
    MATH: { // Metric + NZ Context
      1: ["Counting to 100", "NZ Coins", "Shapes", "Patterns", "Length (m)", "Ordering Numbers"],
      2: ["Place Value", "Simple Addition", "Giving Change", "Geometry", "Fractions", "Time"],
      3: ["Multiplication (2,5,10)", "Measurement (cm, m)", "Data", "3D Shapes", "Position", "Chance"],
      4: ["Times Tables", "Division", "Fractions", "Area", "Symmetry", "Decimals"],
      5: ["Percentages", "Long Division", "Angles", "24-Hour Time", "Volume", "Budgets"],
      6: ["Algebra Basics", "Integers", "Order of Operations", "Probability", "Graphs", "Measurement"]
    },
    HASS: { // Social Sciences (Aotearoa Focus)
      1: ["My Family (Whānau)", "My School", "My Marae", "Past and Present", "Legends of Maui"],
      2: ["Community Helpers", "Waitangi Day", "Local Places", "Technology Then & Now", "Maori Culture"],
      3: ["Early Voyagers", "Migration to NZ", "Pasifika Neighbours", "Leadership", "Resources"],
      4: ["Te Tiriti o Waitangi", "First Encounters", "Sustainability", "Local Government", "Trade"],
      5: ["New Zealand History", "Gold Rush (Otago)", "Natural Hazards", "Elections", "Human Rights"],
      6: ["Global Citizenship", "Treaty Principles", "Asian Geography", "Economic Decisions", "Technological Change"]
    },
    SCI: { // Similar to AU but localized examples
      1: ["Living World (Native Birds)", "Weather", "Materials", "Physical World", "Planet Earth"],
      2: ["Life Cycles (Kiwi)", "Water Cycle", "Mixing", "Forces", "Sound & Light"],
      3: ["Heat", "States of Matter", "Native Plants", "Day & Night", "Rocks & Soil"],
      4: ["Forces", "Ecosystems", "Material Properties", "Volcanoes", "Magnets"],
      5: ["Light", "Adaptations", "Matter", "Solar System", "Electricity"],
      6: ["Renewable Energy", "Climate Change", "Chemical Reactions", "Micro-organisms", "Circuits"]
    }
  },

  // === UNITED STATES (US) ===
  US: {
    MATH: { // Imperial Units
      1: ["Base Ten", "Addition to 20", "Shapes", "Time", "Length (Inches)", "Data"],
      2: ["Place Value to 1000", "Money (Dollars/Cents)", "Measurement (Feet)", "Arrays", "Time (5 mins)", "Graphs"],
      3: ["Multiplication", "Division", "Fractions", "Area & Perimeter", "Volume (Cups/Gallons)", "Mass"],
      4: ["Factors", "Fraction Equivalence", "Decimals", "Angles", "Unit Conversion", "Multi-step Problems"],
      5: ["Decimals", "Multiplying Decimals", "Adding Fractions", "Volume", "Coordinate Plane", "Data"],
      6: ["Ratios", "Negative Numbers", "Expressions", "Statistics", "Area of Polygons", "Equations"]
    },
    HASS: { // Social Studies
      1: ["My Community", "US Symbols", "Citizenship", "Maps", "Past & Present"],
      2: ["Government Basics", "Historical Figures", "North America Geography", "Economics", "Culture"],
      3: ["Local Government", "Native Americans", "Trade", "Communities", "Map Skills"],
      4: ["State History", "US Regions", "American Revolution", "Industrial Growth", "Immigration"],
      5: ["Constitution", "Civil Rights", "Exploration", "Westward Expansion", "Civil War"],
      6: ["Ancient Civilizations", "World Geography", "Global Economics", "Government Types", "World Cultures"]
    },
    SCI: { // NGSS Aligned Topics
      1: ["Plant Parts", "Sun & Moon", "Animal Needs", "Sound & Light", "Weather"],
      2: ["Pollination", "Landforms", "Properties of Matter", "Habitats", "Engineering"],
      3: ["Forces", "Life Cycles", "Climate", "Traits", "Fossils"],
      4: ["Energy", "Waves", "Earth Systems", "Internal Structures", "Information"],
      5: ["Particles", "Ecosystems", "Earth's Spheres", "Space", "Chemicals"],
      6: ["Cells", "Body Systems", "Genetics", "Thermal Energy", "Weather Prediction"]
    }
  },

  // === CANADA (CA) ===
  CA: {
    MATH: { // Metric Units
      1: ["Counting", "Addition to 20", "Patterns", "Measurement (cm)", "3D Objects", "Sorting"],
      2: ["Place Value", "Subtraction", "Money (CAD)", "Measurement (m)", "2D Geometry", "Data"],
      3: ["Multiplication", "Division", "Fractions", "Length (km)", "Perimeter", "Bar Graphs"],
      4: ["Decimals", "Area", "Time", "Multiplication (2-digit)", "Symmetry", "Equations"],
      5: ["Large Numbers", "Decimal Ops", "Volume", "Transformations", "Probability", "Coding Math"],
      6: ["Ratios", "Percentages", "Angles", "Integers", "Data Analysis", "Patterns"]
    },
    HASS: { // Social Studies
      1: ["My Community", "Rules & Responsibilities", "Local Environment", "Family Traditions", "Canada Map"],
      2: ["Global Communities", "Changing Roles", "Past & Present", "Celebrations", "Mapping"],
      3: ["Communities in Canada", "Living & Working in Ontario", "Early Settlers", "Indigenous Peoples", "Land use"],
      4: ["Provinces & Territories", "Physical Regions", "Ancient Civilizations", "Medieval Times", "Government"],
      5: ["First Nations & Europeans", "Role of Government", "Canadian Identity", "Environmental Issues", "Trade"],
      6: ["Canada's Interactions", "Global Issues", "Indigenous Rights", "Democracy", "Heritage"]
    },
    SCI: {
      1: ["Daily Energy", "Materials", "Structures", "Living Things", "Seasons"],
      2: ["Movement", "Properties of Liquids", "Air & Water", "Animals", "Simple Machines"],
      3: ["Forces", "Soil", "Plants", "Structures (Strength)", "Magnetism"],
      4: ["Light & Sound", "Habitats", "Rocks & Minerals", "Pulleys & Gears", "Energy"],
      5: ["Human Body", "Matter", "Conservation", "Forces (Structures)", "Weather"],
      6: ["Space", "Flight", "Electricity", "Biodiversity", "Classification"]
    }
  },

  // === UNITED KINGDOM (GB) ===
  GB: {
    MATH: { // Metric, Pence/Pounds
      1: ["Number Bonds", "Addition", "Shapes", "Length", "Weight", "Money (Pence)"],
      2: ["Place Value", "Subtraction", "Multiplication", "Fractions", "Position", "Time"],
      3: ["3-Digit Numbers", "Times Tables", "Length (mm/cm/m)", "Perimeter", "Fractions", "Angles"],
      4: ["Roman Numerals", "Negative Numbers", "Decimals", "Area", "Symmetry", "Coordinates"],
      5: ["Numbers to 1M", "Primes", "Percentages", "Volume", "Converting Units", "Geometry"],
      6: ["Algebra", "Ratio", "Pie Charts", "Long Division", "Area of Triangles", "Position"]
    },
    HASS: { // History & Geography
      1: ["My Local Area", "Kings & Queens", "Toys from the Past", "UK Weather", "UK Map"],
      2: ["Great Fire of London", "Explorers", "Seaside Holidays", "Continents", "Florence Nightingale"],
      3: ["Stone Age to Iron Age", "Climate Zones", "Local Geography", "Ancient Egypt", "Volcanoes"],
      4: ["Roman Empire", "Anglo-Saxons", "Rivers", "Settlements", "Vikings"],
      5: ["Ancient Greece", "Mayans", "Mountains", "Trade", "Land Use"],
      6: ["World War II", "Victorians", "Global Trade", "South America", "Biomes"]
    },
    SCI: {
      1: ["Plants", "Animals", "Everyday Materials", "Seasons", "Senses"],
      2: ["Living Things", "Growth", "Survival", "Uses of Materials", "Habitats"],
      3: ["Rocks", "Light", "Forces", "Skeletons", "Nutrition"],
      4: ["Classification", "Digestion", "States of Matter", "Sound", "Electricity"],
      5: ["Life Cycles", "Human Development", "Properties of Materials", "Earth & Space", "Gravity"],
      6: ["Evolution", "Inheritance", "Light (Advanced)", "Electricity (Circuits)", "Circulatory System"]
    }
  },

  // === INDIA (IN) ===
  IN: {
    MATH: { // Metric, Rupees, Lakh/Crore in later years
      1: ["Numbers 1-100", "Addition", "Subtraction", "Shapes", "Money (Rupees)", "Time"],
      2: ["Numbers to 1000", "Operations", "Measurement", "Geometry", "Data", "Patterns"],
      3: ["4-Digit Numbers", "Multiplication", "Division", "Length & Weight", "Smart Charts", "Rupees & Paise"],
      4: ["Large Numbers", "Factors", "Fractions", "Perimeter & Area", "Time", "Volume"],
      5: ["Large Numbers (Lakhs)", "Decimals", "Area", "Angles", "Data", "Operations"],
      6: ["Integers", "Algebra", "Ratio", "Geometry", "Mensuration", "Data Handling"]
    },
    HASS: { // Social Science / EVS
      1: ["My Family", "My School", "Neighbourhood", "Festivals", "Transport"],
      2: ["My Country", "Seasons", "Safety", "Food & Water", "Helpers"],
      3: ["Our Earth", "India Physical", "States of India", "Transport & Communication", "Early Humans"],
      4: ["Northern Mountains", "Coastal Plains", "Climate of India", "Resources", "Civics Basics"],
      5: ["Globe & Maps", "Freedom Struggle", "United Nations", "Natural Disasters", "Constitution"],
      6: ["Ancient History", "Early Civilizations", "Diversity", "Government", "Local Admin"]
    },
    SCI: { // General Science
      1: ["Plants Around Us", "Animals", "Air & Water", "Food", "My Body"],
      2: ["Types of Plants", "Wild Animals", "Bones & Muscles", "Safety", "Rocks"],
      3: ["Living Things", "Birds", "Insects", "Parts of Plants", "Soil"],
      4: ["Adaptations", "Reproduction", "Force & Work", "Matter", "Solar System"],
      5: ["Germination", "Skeletal System", "Nervous System", "Safety & First Aid", "Simple Machines"],
      6: ["Food Sources", "Fibre to Fabric", "Sorting Materials", "Changes Around Us", "Motion"]
    }
  },

  // === SINGAPORE (SG) ===
  SG: {
    MATH: { // MOE Syllabus (High standards)
      1: ["Numbers to 100", "Number Bonds", "Addition/Subtraction", "Shapes", "Length", "Money"],
      2: ["Numbers to 1000", "Multiplication/Division", "Fractions", "Mass", "Volume", "Time"],
      3: ["Numbers to 10k", "Bar Graphs", "Angles", "Area & Perimeter", "Fractions", "Money"],
      4: ["Whole Numbers", "Decimals", "Factors", "Symmetry", "Tables & Graphs", "Time"],
      5: ["Ratio", "Percentage", "Average", "Triangles", "Volume", "Decimals"],
      6: ["Algebra", "Fractions", "Circles", "Speed", "Pie Charts", "Geometry"]
    },
    HASS: { // Social Studies
      1: ["Knowing Myself", "My School", "My Home", "My Friends", "Multicultural Singapore"],
      2: ["My Neighbourhood", "Public Spaces", "Transport", "Community Helpers", "Festivals"],
      3: ["Singapore Environment", "Resources", "Conservation", "Map Skills", "Early History"],
      4: ["Early Settlers", "Life in the Past", "Total Defence", "Racial Harmony", "Geography"],
      5: ["Ancient Civilizations", "Colonial Singapore", "Road to Independence", "Government", "The Region"],
      6: ["SE Asia", "Global Connections", "Challenges", "Future of Singapore", "Geography"]
    },
    SCI: {
      1: ["Living Things", "My Body", "Plants", "Materials", "Cycles"], // Start P3 content simplified
      2: ["Animals", "Life Cycles", "Magnets", "Light", "Heat"],
      3: ["Diversity", "Systems", "Cycles (Plants)", "Interaction", "Energy"],
      4: ["Cycles (Matter)", "Energy (Light/Heat)", "Systems (Human)", "Magnets", "Materials"],
      5: ["Cycles (Water)", "Systems (Plant/Resp)", "Cells", "Electricity", "Forces"],
      6: ["Energy (Forms)", "Interactions (Env)", "Food Chains", "Adaptations", "Man & Env"]
    }
  },

  // === PHILIPPINES (PH) ===
  PH: {
    MATH: { // Metric, Peso
      1: ["Numbers to 100", "Addition/Subtraction", "Shapes", "Measurement", "Money (Peso)", "Time"],
      2: ["Numbers to 1000", "Multiplication", "Division", "Fractions", "Geometry", "Data"],
      3: ["Numbers to 10k", "Money", "Fractions", "Geometry", "Measurement", "Statistics"],
      4: ["Factors", "Decimals", "Angles", "Area", "Perimeter", "Graphs"],
      5: ["Ratio", "Percentage", "Polygons", "Circles", "Volume", "Temperature"],
      6: ["Integers", "Algebra", "Ratio & Prop", "Solid Figures", "Pie Graphs", "Probability"]
    },
    HASS: { // Araling Panlipunan
      1: ["Myself & Family", "My School", "My Community", "Filipino Values", "National Symbols"],
      2: ["Community History", "Resources", "Leaders", "Rights & Duties", "Culture"],
      3: ["Provinces & Regions", "Geography of Region", "Local Culture", "Regional History", "Government"],
      4: ["Philippines Geography", "Natural Resources", "National Government", "Citizenship", "Culture"],
      5: ["Early Filipinos", "Spanish Colonization", "Heroes", "Formation of Nation", "Religion"],
      6: ["American Period", "Independence", "Republics", "Martial Law", "Contemporary Issues"]
    },
    SCI: {
      1: ["My Body", "Animals", "Plants", "Matter", "Earth & Sky"],
      2: ["Sense Organs", "Animal Habitats", "Plant Needs", "Force & Motion", "Weather"],
      3: ["Matter", "Living Things", "Heredity", "Ecosystems", "Earth"],
      4: ["Properties of Matter", "Body Systems", "Life Cycles", "Heat & Light", "Soil & Water"],
      5: ["Changes in Matter", "Reproduction", "Estuaries", "Motion", "Weather Patterns"],
      6: ["Mixtures", "Organ Systems", "Vertebrates", "Gravity", "Solar System"]
    }
  },

  // === SOUTH AFRICA (ZA) ===
  ZA: {
    MATH: { // CAPS
      1: ["Numbers 1-50", "Addition", "Patterns", "Space & Shape", "Measurement", "Data"],
      2: ["Numbers 1-200", "Multiplication", "Fractions", "Money (Rand)", "Time", "Length"],
      3: ["Numbers 1-1000", "Division", "Fractions", "3D Objects", "Mass", "Perimeter"],
      4: ["Whole Numbers", "Number Sentences", "Fractions", "Time", "Properties of 2D", "Data"],
      5: ["Numbers to 6-digits", "Common Fractions", "Length", "Area", "Volume", "Transformations"],
      6: ["Integers", "Decimals", "Percentages", "Properties of 3D", "Probability", "Mass"]
    },
    HASS: { // Social Sciences
      1: ["Me & My Family", "School", "Home", "Weather", "Symbols"],
      2: ["Past & Present", "Leaders", "Transport", "Needs & Wants", "Communication"],
      3: ["Local History", "Map Skills", "Public Holidays", "Trade", "Pollution"],
      4: ["Local Area", "Map Skills", "Resource Use", "Nelson Mandela", "Transport History"],
      5: ["Physical Geography", "Ancient Africa", "Climate", "Early Farmers", "Heritage"],
      6: ["Latitude/Longitude", "Map Scales", "Trade", "Democracy", "Medicine History"]
    },
    SCI: { // Natural Sciences
      1: ["Life & Living", "Matter", "Energy", "Earth", "Seasons"],
      2: ["Animals", "Plants", "Materials", "Sound", "Water"],
      3: ["Life Processes", "Healthy Eating", "Structures", "Light", "Space"],
      4: ["Living/Non-living", "Plant Structure", "Matter States", "Energy", "Moon"],
      5: ["Plants & Animals", "Skeletons", "Metals", "Stored Energy", "Surface of Earth"],
      6: ["Photosynthesis", "Nutrients", "Mixtures", "Electric Circuits", "Solar System"]
    }
  },

  // === IRELAND (IE) ===
  IE: {
    MATH: { // Euro
      1: ["Number 0-99", "Algebra", "Shape & Space", "Measures", "Data", "Money"],
      2: ["Place Value", "Operations", "Fractions", "Symmetry", "Time", "Length"],
      3: ["Number", "Fractions", "Decimals", "Area", "Weight", "Chance"],
      4: ["Number Theory", "Decimals", "Lines & Angles", "Capacity", "Time", "Graphs"],
      5: ["Number", "Percentages", "Circle", "Averages", "Directed Numbers", "Equations"],
      6: ["Scale", "Rules & Properties", "3D Shapes", "Volume", "Trend Graphs", "Probability"]
    },
    HASS: { // SESE (History/Geo)
      1: ["Myself", "My Family", "School Community", "The Local Area", "Weather"],
      2: ["Homes", "Games Past/Present", "People at Work", "Maps", "Seasons"],
      3: ["Local History", "Myths & Legends", "People & Places", "Maps", "Rocks & Soils"],
      4: ["Early People", "Life in Ireland", "Counties", "Natural Environment", "Transport"],
      5: ["The Famine", "The Celts", "Europe", "Weather & Climate", "Trade"],
      6: ["1916 Rising", "Modern Ireland", "World Geography", "Environmental Care", "Justice"]
    },
    SCI: {
      1: ["Living Things", "Energy", "Forces", "Materials", "Environment"],
      2: ["Plants & Animals", "Light", "Magnetism", "Properties", "Caring for Earth"],
      3: ["Human Life", "Heat", "Electricity", "Change", "Habitats"],
      4: ["Plant Life", "Sound", "Forces", "Materials", "Conservation"],
      5: ["Human Body", "Light", "Magnetism", "Properties", "Science in Society"],
      6: ["Processes of Life", "Heat", "Electricity", "Materials", "Environmental Awareness"]
    }
  },

  // === UAE (AE) ===
  AE: {
    MATH: { // MoE
      1: ["Numbers to 100", "Addition/Subtraction", "Geometry", "Measurement", "Data", "Patterns"],
      2: ["Place Value", "Operations", "Money (AED)", "Time", "Fractions", "Shapes"],
      3: ["Multiplication", "Division", "Measurement", "Geometry", "Fractions", "Graphing"],
      4: ["Factors", "Decimals", "Angles", "Area", "Perimeter", "Data"],
      5: ["Decimals", "Fractions", "Geometry", "Coordinate Plane", "Volume", "Ratio"],
      6: ["Integers", "Ratio", "Expressions", "Statistics", "Area", "Equations"]
    },
    HASS: { // Social Studies / Moral Ed
      1: ["My Family", "My School", "UAE Heritage", "Good Values", "Community"],
      2: ["UAE Geography", "Culture", "Ancestors", "Responsibility", "Environment"],
      3: ["Emirates", "Local Government", "Trade", "Resources", "Citizenship"],
      4: ["UAE History", "Archaeology", "Sheikh Zayed", "Economy", "Map Skills"],
      5: ["Ancient Civilizations", "UAE Constitution", "Islamic History", "Global Links", "Rights"],
      6: ["Modern UAE", "GCC", "World Geography", "Sustainability", "Innovation"]
    },
    SCI: {
      1: ["Plants", "Animals", "Senses", "Materials", "Weather"],
      2: ["Habitats", "Life Cycles", "Matter", "Sound", "Forces"],
      3: ["Living Things", "Forces", "Matter", "Earth", "Space"],
      4: ["Energy", "Electricity", "Light", "Ecosystems", "Earth's Surface"],
      5: ["Human Body", "Mixtures", "Forces", "Solar System", "Environment"],
      6: ["Cells", "Reproduction", "Electricity", "Light", "Chemistry"]
    }
  },

  // === INTERNATIONAL (INT) ===
  INT: {
    MATH: {
      1: ["Numbers", "Arithmetic", "Shapes", "Patterns", "Measurement", "Data"],
      2: ["Place Value", "Operations", "Fractions", "Geometry", "Time", "Money"],
      3: ["Multiplication", "Division", "Decimals", "Area", "Volume", "Graphs"],
      4: ["Factors", "Fractions", "Angles", "Symmetry", "Units", "Problem Solving"],
      5: ["Percentages", "Ratios", "Geometry", "Coordinates", "Statistics", "Algebra Prep"],
      6: ["Algebra", "Integers", "Probability", "Circles", "Advanced Area", "Data Analysis"]
    },
    HASS: {
      1: ["Community", "Family", "Maps", "Weather", "Traditions"],
      2: ["Global Communities", "History", "Geography", "Culture", "Resources"],
      3: ["Civilizations", "Migration", "Environment", "Government", "Trade"],
      4: ["Exploration", "Conflict", "Physical Geography", "Rights", "Technology"],
      5: ["Ancient History", "World Cultures", "Sustainability", "Economics", "Systems"],
      6: ["Modern History", "Global Issues", "Human Rights", "Innovation", "Politics"]
    },
    SCI: {
      1: ["Biology Basics", "Materials", "Physics Basics", "Earth", "Inquiry"],
      2: ["Ecosystems", "Chemistry Basics", "Forces", "Space", "Cycles"],
      3: ["Life Systems", "Matter", "Energy", "Structures", "Scientific Method"],
      4: ["Habitats", "Light & Sound", "Machines", "Rocks", "Weather"],
      5: ["Human Body", "Forces", "Conservation", "Properties", "Climate"],
      6: ["Electricity", "Space", "Diversity", "Flight", "Chemistry"]
    }
  }
};

function getTopics(countryCode, subjectId, year) {
  const code = COUNTRIES[countryCode] ? countryCode : "INT";
  const curriculum = CURRICULA[code];
  
  if (subjectId === "MATH") return curriculum.MATH[year] || ["Maths"];
  if (subjectId === "HASS") return curriculum.HASS[year] || ["Social Studies"];
  if (subjectId === "SCI") return curriculum.SCI[year] || ["Science"];
  
  // Fallback for universal subjects
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
  const config = COUNTRIES[countryCode] || COUNTRIES.INT;
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