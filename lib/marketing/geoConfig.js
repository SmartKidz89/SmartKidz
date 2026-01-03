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
    heroTag: "Australian Curriculum Aligned • Prep to Year 6",
    locations: ["Melbourne", "Sydney", "Brisbane", "Perth"]
  }
};

// Default everything to AU
export function getGeoConfig(countryCode) {
  return GEO_CONFIG.AU;
}

export function getGradeLabel(yearLevel, countryCode) {
  const config = GEO_CONFIG.AU;
  const term = config.gradeTerm; // Year
  
  const y = Number(yearLevel);
  if (isNaN(y)) return `${term} ?`;

  if (y === 0) return "Prep";

  return `${term} ${y}`;
}