import { NextResponse } from "next/server";
import { getOpenAICompatConfig, openaiChatCompletions } from "@/lib/ai/openaiCompat";

export const runtime = "nodejs";

// Enhanced Fallback Data with Rich Content
const FALLBACK_DATA = {
  AF: {
    name: { common: "Afghanistan", official: "Islamic Republic of Afghanistan" },
    region: "Asia",
    capital: ["Kabul"],
    population: 40000000,
    // Explicitly using the requested Tricolor flag
    flags: { 
      png: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Flag_of_Afghanistan_%282013%E2%80%932021%29.svg/320px-Flag_of_Afghanistan_%282013%E2%80%932021%29.svg.png", 
      svg: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Flag_of_Afghanistan_%282013%E2%80%932021%29.svg" 
    },
    flag: "🇦🇫",
    maps: { googleMaps: "https://goo.gl/maps/k7F7B" },
    rich: {
      funFact: "Afghanistan is famous for its beautiful blue stone called Lapis Lazuli, used in art for thousands of years.",
      food: "Kabuli Pulao (rice with carrots and raisins).",
      landmark: "The Blue Mosque in Mazar-i-Sharif.",
      hello: "Salam",
      language: "Pashto & Dari",
      animal: "Snow Leopard",
      sport: "Cricket and Buzkashi",
      currency: "Afghani (؋)",
      climate: "Hot summers and very cold winters with snow in the mountains.",
      history: "Located on the ancient Silk Road, connecting people from all over the world.",
      festival: "Nowruz (New Year) celebrated in spring.",
      nature: "High mountains like the Hindu Kush and deep valleys."
    }
  },
  // ... other country fallbacks can remain or be fetched dynamically
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const codeRaw = searchParams.get("code");
  const code = codeRaw ? codeRaw.toUpperCase() : null;

  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  let country = null;

  // 1. Try Fetching from REST Countries
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const res = await fetch(`https://restcountries.com/v3.1/alpha/${code}`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        country = data[0];
      }
    }
  } catch (e) {
    console.warn(`REST Countries fetch failed for ${code}, attempting local fallback.`);
  }

  // 2. Use Fallback Data if Fetch Failed OR Merge Rich Data if Available
  // Special override for Afghanistan to ensure correct flag
  if (code === "AF") {
     if (country) {
       country.flags = FALLBACK_DATA.AF.flags; // Force override flag even if fetch succeeded
       country.rich = FALLBACK_DATA.AF.rich;
     } else {
       country = FALLBACK_DATA.AF;
     }
  } else if (FALLBACK_DATA[code]) {
    if (!country) {
      country = FALLBACK_DATA[code];
    } else {
      country.rich = FALLBACK_DATA[code].rich;
    }
  }

  // Last resort generic fallback to prevent UI crash
  if (!country) {
    country = {
      name: { common: code, official: code },
      region: "World",
      capital: ["Unknown"],
      population: 0,
      flags: { png: null },
      flag: "🏳️",
      languages: { en: "English" }
    };
  }

  const name = country.name?.common || code;
  
  // 3. Prepare Rich Data
  let richData = country.rich || {
    funFact: `${name} is an interesting place in ${country.region || "the world"}.`,
    food: "Yummy local dishes.",
    landmark: "Beautiful historic places.",
    hello: "Hello",
    language: country.languages ? Object.values(country.languages)[0] : "Local language",
    animal: "Local wildlife",
    sport: "Football",
    currency: "Money",
    climate: "Varies by season.",
    history: "This country has a long and interesting past.",
    festival: "Local celebrations.",
    nature: "Beautiful landscapes."
  };

  // Only use AI if we don't have curated rich data
  if (!country.rich && (process.env.OPENAI_API_KEY || process.env.OPENAI_BASE_URL)) {
    try {
      const prompt = `Create a travel guide for a child visiting ${name}.
      Return valid JSON with fields: 
      - "funFact": interesting fact for a kid
      - "food": famous dish
      - "landmark": famous building/place
      - "hello": how to say hello in local language
      - "language": language name
      - "animal": national or common animal
      - "sport": most popular sport
      - "currency": currency name
      - "climate": simple description of weather
      - "history": one sentence history fact for kids
      - "festival": a famous celebration
      - "nature": what the land looks like
      
      Keep it G-rated, fun, and educational.`;

      const cfg = getOpenAICompatConfig();
      const json = await openaiChatCompletions({
        model: cfg.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 450
      });

      if (json) {
        const content = json.choices?.[0]?.message?.content;
        if (content) {
          try {
            const parsed = JSON.parse(content.replace(/```json/g, "").replace(/```/g, "").trim());
            richData = { ...richData, ...parsed };
          } catch {}
        }
      }
    } catch (e) {
      console.warn("AI enrichment skipped/failed");
    }
  }

  // Format final response
  return NextResponse.json({
    name: name,
    officialName: country.name?.official || name,
    region: country.region || "Earth",
    subregion: country.subregion || "",
    capital: country.capital ? country.capital[0] : "Unknown",
    population: country.population || 0,
    flag: country.flags?.svg || country.flags?.png,
    emoji: country.flag || "🏳️",
    googleMaps: country.maps?.googleMaps,
    ...richData
  });
}