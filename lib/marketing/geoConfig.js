export const GEO_CONFIG = {
  AU: {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    curriculum: "Australian Curriculum",
    curriculumShort: "AC9 Aligned",
    mathTerm: "Maths",
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
    gradeTerm: "Class",
    currency: "₹",
    priceMonthly: "499",
    priceAnnual: "3999",
    heroTag: "CBSE/ICSE Aligned • Class 1 to 6"
  },
  // Default fallback (International)
  INT: {
    code: "INT",
    name: "International",
    flag: "🌍",
    curriculum: "Global Standards",
    curriculumShort: "Standard Aligned",
    mathTerm: "Maths",
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