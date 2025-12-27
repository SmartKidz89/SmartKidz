export const GEO_CONFIG = {
  AU: {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    curriculum: "Australian Curriculum",
    curriculumShort: "AC9 Aligned",
    mathTerm: "Maths",
    hassTerm: "HASS",
    gradeTerm: "Year",
    currency: "$",
    priceMonthly: "11.99",
    priceAnnual: "99.99",
    heroTag: "Australian Curriculum Aligned • Prep to Year 6"
  },
  US: {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    curriculum: "Common Core",
    curriculumShort: "Common Core",
    mathTerm: "Math",
    hassTerm: "Social Studies",
    gradeTerm: "Grade",
    currency: "$",
    priceMonthly: "9.99",
    priceAnnual: "79.99",
    heroTag: "Common Core Aligned • K to Grade 5"
  },
  GB: {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    curriculum: "National Curriculum",
    curriculumShort: "National Curriculum",
    mathTerm: "Maths",
    hassTerm: "Humanities",
    gradeTerm: "Year",
    currency: "£",
    priceMonthly: "8.99",
    priceAnnual: "69.99",
    heroTag: "National Curriculum • Reception to Year 6"
  },
  NZ: {
    code: "NZ",
    name: "New Zealand",
    flag: "🇳🇿",
    curriculum: "NZ Curriculum",
    curriculumShort: "NZC Aligned",
    mathTerm: "Maths",
    hassTerm: "Social Sciences",
    gradeTerm: "Year",
    currency: "$",
    priceMonthly: "12.99",
    priceAnnual: "109.99",
    heroTag: "NZ Curriculum Aligned • Years 1-8"
  },
  CA: {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    curriculum: "Provincial Standards",
    curriculumShort: "Canada Aligned",
    mathTerm: "Math",
    hassTerm: "Social Studies",
    gradeTerm: "Grade",
    currency: "$",
    priceMonthly: "11.99",
    priceAnnual: "99.99",
    heroTag: "Curriculum Aligned • K to Grade 6"
  },
  IN: {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    curriculum: "CBSE/ICSE Aligned",
    curriculumShort: "CBSE Aligned",
    mathTerm: "Maths",
    hassTerm: "Social Science",
    gradeTerm: "Class",
    currency: "₹",
    priceMonthly: "499",
    priceAnnual: "3999",
    heroTag: "CBSE/ICSE Aligned • Class 1 to 6"
  },
  SG: {
    code: "SG",
    name: "Singapore",
    flag: "🇸🇬",
    curriculum: "MOE Syllabus",
    curriculumShort: "MOE Aligned",
    mathTerm: "Maths",
    hassTerm: "Social Studies",
    gradeTerm: "Primary",
    currency: "$",
    priceMonthly: "12.99",
    priceAnnual: "109.99",
    heroTag: "MOE Syllabus • Primary 1 to 6"
  },
  ZA: {
    code: "ZA",
    name: "South Africa",
    flag: "🇿🇦",
    curriculum: "CAPS",
    curriculumShort: "CAPS Aligned",
    mathTerm: "Maths",
    hassTerm: "Social Sciences",
    gradeTerm: "Grade",
    currency: "R",
    priceMonthly: "149",
    priceAnnual: "1199",
    heroTag: "CAPS Aligned • Grade R to 6"
  },
  IE: {
    code: "IE",
    name: "Ireland",
    flag: "🇮🇪",
    curriculum: "Primary Curriculum",
    curriculumShort: "NCCA Aligned",
    mathTerm: "Maths",
    hassTerm: "SESE", // Social, Environmental and Scientific Education
    gradeTerm: "Class",
    currency: "€",
    priceMonthly: "9.99",
    priceAnnual: "89.99",
    heroTag: "Primary Curriculum • Junior Infants to 6th Class"
  },
  AE: {
    code: "AE",
    name: "UAE",
    flag: "🇦🇪",
    curriculum: "Ministry of Education",
    curriculumShort: "MoE Aligned",
    mathTerm: "Math",
    hassTerm: "Social Studies",
    gradeTerm: "Grade",
    currency: "AED",
    priceMonthly: "39",
    priceAnnual: "299",
    heroTag: "MoE Curriculum • Grade 1 to 6"
  },
  PH: {
    code: "PH",
    name: "Philippines",
    flag: "🇵🇭",
    curriculum: "K-12 Curriculum",
    curriculumShort: "DepEd Aligned",
    mathTerm: "Math",
    hassTerm: "Araling Panlipunan",
    gradeTerm: "Grade",
    currency: "₱",
    priceMonthly: "299",
    priceAnnual: "2499",
    heroTag: "K-12 Aligned • Grade 1 to 6"
  },
  // Default fallback (International)
  INT: {
    code: "INT",
    name: "International",
    flag: "🌍",
    curriculum: "Global Standards",
    curriculumShort: "Standard Aligned",
    mathTerm: "Maths",
    hassTerm: "Humanities",
    gradeTerm: "Grade",
    currency: "$",
    priceMonthly: "9.99",
    priceAnnual: "79.99",
    heroTag: "Global Standards • Ages 5-12"
  }
};

export function getGeoConfig(countryCode) {
  return GEO_CONFIG[countryCode] || GEO_CONFIG.INT;
}

export function getGradeLabel(yearLevel, countryCode) {
  const config = getGeoConfig(countryCode);
  const term = config.gradeTerm; // Year, Grade, Class, Primary
  
  const y = Number(yearLevel);
  if (isNaN(y)) return `${term} ?`;

  // Special cases for "Prep/Kindy" (Year 0)
  if (y === 0) {
    if (config.code === "US") return "Kindergarten";
    if (config.code === "GB") return "Reception";
    if (config.code === "IE") return "Senior Infants";
    if (config.code === "ZA") return "Grade R";
    return "Prep"; // AU/NZ default
  }

  return `${term} ${y}`;
}