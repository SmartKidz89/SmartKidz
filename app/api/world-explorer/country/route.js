import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Fallback data for common countries to ensure API never fully breaks
const FALLBACK_DATA = {
  AU: { name: { common: "Australia", official: "Commonwealth of Australia" }, region: "Oceania", capital: ["Canberra"], population: 25600000, flags: { png: "https://flagcdn.com/w320/au.png" }, flag: "🇦🇺", maps: { googleMaps: "https://goo.gl/maps/DCJTSZRJm5v5x58v8" } },
  US: { name: { common: "United States", official: "United States of America" }, region: "Americas", capital: ["Washington, D.C."], population: 331000000, flags: { png: "https://flagcdn.com/w320/us.png" }, flag: "🇺🇸", maps: { googleMaps: "https://goo.gl/maps/e8M24sQkYv82" } },
  GB: { name: { common: "United Kingdom", official: "United Kingdom of Great Britain and Northern Ireland" }, region: "Europe", capital: ["London"], population: 67000000, flags: { png: "https://flagcdn.com/w320/gb.png" }, flag: "🇬🇧", maps: { googleMaps: "https://goo.gl/maps/FoDscKqGteklf4ud6" } },
  FR: { name: { common: "France", official: "French Republic" }, region: "Europe", capital: ["Paris"], population: 67000000, flags: { png: "https://flagcdn.com/w320/fr.png" }, flag: "🇫🇷", maps: { googleMaps: "https://goo.gl/maps/g7QxxSFswy7kY8M96" } },
  JP: { name: { common: "Japan", official: "Japan" }, region: "Asia", capital: ["Tokyo"], population: 126000000, flags: { png: "https://flagcdn.com/w320/jp.png" }, flag: "🇯🇵", maps: { googleMaps: "https://goo.gl/maps/NGp9i7xtFxs" } },
  CN: { name: { common: "China", official: "People's Republic of China" }, region: "Asia", capital: ["Beijing"], population: 1400000000, flags: { png: "https://flagcdn.com/w320/cn.png" }, flag: "🇨🇳", maps: { googleMaps: "https://goo.gl/maps/p9qC6vgiFrQ2" } },
  BR: { name: { common: "Brazil", official: "Federative Republic of Brazil" }, region: "Americas", capital: ["Brasília"], population: 212000000, flags: { png: "https://flagcdn.com/w320/br.png" }, flag: "🇧🇷", maps: { googleMaps: "https://goo.gl/maps/waCKkRdU7uq" } },
  IN: { name: { common: "India", official: "Republic of India" }, region: "Asia", capital: ["New Delhi"], population: 1380000000, flags: { png: "https://flagcdn.com/w320/in.png" }, flag: "🇮🇳", maps: { googleMaps: "https://goo.gl/maps/WSk3fLwG4vt" } },
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
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const res = await fetch(`https://restcountries.com/v3.1/alpha/${code}`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        country = data[0];
      }
    }
  } catch (e) {
    console.warn(`REST Countries fetch failed for ${code}, falling back to local data.`);
  }

  // 2. Use Fallback Data if Fetch Failed
  if (!country) {
    if (FALLBACK_DATA[code]) {
      country = FALLBACK_DATA[code];
    } else {
      // Generic fallback to prevent white screen of death in UI
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
  }

  const name = country.name?.common || code;
  
  // 3. AI Enrichment (Safe, with simple fallbacks)
  let richData = {
    funFact: `${name} is an interesting place in ${country.region || "the world"}.`,
    food: "Yummy local food.",
    landmark: "Beautiful places to see.",
    hello: "Hello",
    language: country.languages ? Object.values(country.languages)[0] : "Local language",
    animal: "Local animals"
  };

  if (process.env.OPENAI_API_KEY) {
    try {
      const prompt = `Create a JSON travel guide for a child visiting ${name}.
      Fields: "funFact", "food", "landmark", "hello" (local greeting), "language", "animal".
      Keep it G-rated and fun. JSON only.`;

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
          max_tokens: 250
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
      console.warn("AI enrichment skipped");
    }
  }

  return NextResponse.json({
    name: name,
    officialName: country.name?.official || name,
    region: country.region || "Earth",
    subregion: country.subregion || "",
    capital: country.capital ? country.capital[0] : null,
    population: country.population || 0,
    flag: country.flags?.svg || country.flags?.png,
    emoji: country.flag || "🏳️",
    googleMaps: country.maps?.googleMaps,
    ...richData
  });
}