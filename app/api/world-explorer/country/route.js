import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Enhanced Fallback Data with Rich Content
const FALLBACK_DATA = {
  AF: {
    name: { common: "Afghanistan", official: "Islamic Republic of Afghanistan" },
    region: "Asia",
    capital: ["Kabul"],
    population: 40000000,
    // Using the 2013-2021 Republic flag (Tricolor) which is widely recognized in educational contexts
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
  AU: { 
    name: { common: "Australia", official: "Commonwealth of Australia" }, 
    region: "Oceania", 
    capital: ["Canberra"], 
    population: 26000000, 
    flags: { png: "https://flagcdn.com/w320/au.png" }, 
    flag: "🇦🇺", 
    maps: { googleMaps: "https://goo.gl/maps/DCJTSZRJm5v5x58v8" },
    rich: {
      funFact: "Australia is the only continent covered by a single country and has more kangaroos than people!",
      food: "Vegemite on toast and meat pies.",
      landmark: "The Sydney Opera House",
      hello: "G'day",
      language: "English",
      animal: "Kangaroo & Koala",
      sport: "Cricket and AFL (Footy)",
      currency: "Australian Dollar ($)",
      climate: "Mostly sunny and warm, but it can get very hot in the middle!",
      history: "Australia is home to the oldest continuous living culture in the world, the Aboriginal and Torres Strait Islander peoples.",
      festival: "Australia Day in summer.",
      nature: "Giant red deserts in the middle and beautiful beaches on the coast."
    }
  },
  US: { 
    name: { common: "United States", official: "United States of America" }, 
    region: "Americas", 
    capital: ["Washington, D.C."], 
    population: 331000000, 
    flags: { png: "https://flagcdn.com/w320/us.png" }, 
    flag: "🇺🇸", 
    maps: { googleMaps: "https://goo.gl/maps/e8M24sQkYv82" },
    rich: {
      funFact: "The US flag has 50 stars, one for each state.",
      food: "Hamburgers and apple pie.",
      landmark: "Statue of Liberty",
      hello: "Hello",
      language: "English",
      animal: "Bald Eagle",
      sport: "American Football and Baseball",
      currency: "US Dollar ($)",
      climate: "Very mixed! Cold in the north, hot in the south.",
      history: "In 1776, the US declared independence to become its own country.",
      festival: "Fourth of July (Independence Day) with fireworks.",
      nature: "Huge canyons like the Grand Canyon and tall redwood forests."
    }
  },
  GB: { 
    name: { common: "United Kingdom", official: "United Kingdom of Great Britain and Northern Ireland" }, 
    region: "Europe", 
    capital: ["London"], 
    population: 67000000, 
    flags: { png: "https://flagcdn.com/w320/gb.png" }, 
    flag: "🇬🇧", 
    maps: { googleMaps: "https://goo.gl/maps/FoDscKqGteklf4ud6" },
    rich: {
      funFact: "You are never more than 115 km from the ocean in the UK.",
      food: "Fish and Chips.",
      landmark: "Big Ben",
      hello: "Hello",
      language: "English",
      animal: "Lion (symbol) & Bulldog",
      sport: "Football (Soccer)",
      currency: "Pound Sterling (£)",
      climate: "Often cloudy and rainy, but mild.",
      history: "Kings and Queens have ruled here for over 1,000 years!",
      festival: "Bonfire Night with fireworks in November.",
      nature: "Green rolling hills and rocky coastlines."
    }
  },
  JP: { 
    name: { common: "Japan", official: "Japan" }, 
    region: "Asia", 
    capital: ["Tokyo"], 
    population: 126000000, 
    flags: { png: "https://flagcdn.com/w320/jp.png" }, 
    flag: "🇯🇵", 
    maps: { googleMaps: "https://goo.gl/maps/NGp9i7xtFxs" },
    rich: {
      funFact: "Japan has trains that float above the tracks using magnets (Maglev).",
      food: "Sushi and Ramen.",
      landmark: "Mount Fuji",
      hello: "Konnichiwa",
      language: "Japanese",
      animal: "Snow Monkey",
      sport: "Sumo Wrestling and Baseball",
      currency: "Yen (¥)",
      climate: "Four seasons with beautiful cherry blossoms in spring.",
      history: "Samurai warriors used to protect the land long ago.",
      festival: "Cherry Blossom Festival (Hanami).",
      nature: "Many islands with volcanoes and hot springs."
    }
  },
  FR: { 
    name: { common: "France", official: "French Republic" }, 
    region: "Europe", 
    capital: ["Paris"], 
    population: 67000000, 
    flags: { png: "https://flagcdn.com/w320/fr.png" }, 
    flag: "🇫🇷", 
    maps: { googleMaps: "https://goo.gl/maps/g7QxxSFswy7kY8M96" },
    rich: {
      funFact: "France is the most visited country in the world.",
      food: "Croissants and Cheese.",
      landmark: "Eiffel Tower",
      hello: "Bonjour",
      language: "French",
      animal: "Rooster",
      sport: "Football (Soccer)",
      currency: "Euro (€)",
      climate: "Mild summers and cool winters.",
      history: "Famous for kings like Louis XIV who built huge palaces.",
      festival: "Bastille Day in July.",
      nature: "Snowy Alps mountains and sunny beaches in the south."
    }
  },
  BR: { 
    name: { common: "Brazil", official: "Federative Republic of Brazil" }, 
    region: "Americas", 
    capital: ["Brasília"], 
    population: 212000000, 
    flags: { png: "https://flagcdn.com/w320/br.png" }, 
    flag: "🇧🇷", 
    maps: { googleMaps: "https://goo.gl/maps/waCKkRdU7uq" },
    rich: {
      funFact: "Brazil is home to the Amazon Rainforest, the biggest in the world.",
      food: "Feijoada (bean stew).",
      landmark: "Christ the Redeemer",
      hello: "Olá",
      language: "Portuguese",
      animal: "Jaguar",
      sport: "Football (Soccer)",
      currency: "Real (R$)",
      climate: "Tropical and warm most of the year.",
      history: "Explorers arrived by ship 500 years ago.",
      festival: "Carnival - a huge party with parades and dancing!",
      nature: "Thick rainforests and the massive Amazon River."
    }
  },
  CN: { 
    name: { common: "China", official: "People's Republic of China" }, 
    region: "Asia", 
    capital: ["Beijing"], 
    population: 1400000000, 
    flags: { png: "https://flagcdn.com/w320/cn.png" }, 
    flag: "🇨🇳", 
    maps: { googleMaps: "https://goo.gl/maps/p9qC6vgiFrQ2" },
    rich: {
      funFact: "The Great Wall of China is over 21,000 km long!",
      food: "Dumplings and Peking Duck.",
      landmark: "The Great Wall",
      hello: "Ni Hao",
      language: "Mandarin Chinese",
      animal: "Giant Panda",
      sport: "Table Tennis",
      currency: "Yuan Renminbi (¥)",
      climate: "Very diverse - cold in the north, tropical in the south.",
      history: "Invented paper, fireworks, and the compass long ago.",
      festival: "Chinese New Year with dragon dances.",
      nature: "Misty mountains and bamboo forests."
    }
  },
  IN: { 
    name: { common: "India", official: "Republic of India" }, 
    region: "Asia", 
    capital: ["New Delhi"], 
    population: 1380000000, 
    flags: { png: "https://flagcdn.com/w320/in.png" }, 
    flag: "🇮🇳", 
    maps: { googleMaps: "https://goo.gl/maps/WSk3fLwG4vt" },
    rich: {
      funFact: "India invented the game of Chess (Chaturanga).",
      food: "Curry and Naan bread.",
      landmark: "Taj Mahal",
      hello: "Namaste",
      language: "Hindi & English",
      animal: "Bengal Tiger",
      sport: "Cricket",
      currency: "Indian Rupee (₹)",
      climate: "Hot and tropical, with a big rainy season called Monsoon.",
      history: "One of the oldest civilizations in the world began here.",
      festival: "Diwali - the festival of lights.",
      nature: "Jungles with tigers and elephants!"
    }
  },
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
  if (FALLBACK_DATA[code]) {
    if (!country) {
      country = FALLBACK_DATA[code];
    } else {
      // Merge rich data.
      // IMPORTANT: For Afghanistan (AF) and potentially others, we might want to override the flag 
      // if the API returns a version we don't want (e.g. strict educational/historical preference).
      if (code === "AF" && FALLBACK_DATA.AF.flags) {
        country.flags = FALLBACK_DATA.AF.flags;
      }
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
  // Priority: 1. Curated local rich data (highest quality) 2. AI generated 3. Generic procedural
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
  if (!country.rich && process.env.OPENAI_API_KEY) {
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

      const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
          max_tokens: 450
        })
      });

      if (aiRes.ok) {
        const json = await aiRes.json();
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