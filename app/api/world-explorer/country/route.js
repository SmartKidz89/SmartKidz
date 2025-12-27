import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  // 1. Fetch standard data (Flag, Capital, Population, etc.)
  let country = null;
  try {
    const res = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
    if (res.ok) {
      const data = await res.json();
      country = data[0];
    }
  } catch (e) {
    console.error("REST Countries fetch failed", e);
  }

  if (!country) {
    return NextResponse.json({ error: "Country not found" }, { status: 404 });
  }

  const name = country.name.common;
  
  // 2. AI Enrichment (Food, Landmarks, Kid Facts)
  // Default fallback data if AI is not configured
  let richData = {
    funFact: `${name} is located in ${country.region}.`,
    food: "Traditional local dishes.",
    landmark: "Historic sites and nature.",
    hello: "Hello",
    language: Object.values(country.languages || {})[0] || "Local language",
    animal: "Local wildlife"
  };

  if (process.env.OPENAI_API_KEY) {
    try {
      const prompt = `Create a fun JSON travel guide for a 7-year-old visiting ${name}.
      Fields required:
      - "funFact": A surprising, simple fact about ${name}.
      - "food": One famous food dish with a short description.
      - "landmark": One famous landmark with a short description.
      - "hello": How to say "Hello" in the main language (phonetic if needed).
      - "language": Name of the main language.
      - "animal": A famous animal from this country.
      
      Respond with valid JSON only.`;

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
          const parsed = JSON.parse(content);
          richData = { ...richData, ...parsed };
        }
      }
    } catch (e) {
      console.error("AI enrichment failed", e);
    }
  }

  return NextResponse.json({
    name: country.name.common,
    officialName: country.name.official,
    region: country.region,
    subregion: country.subregion,
    capital: country.capital ? country.capital[0] : null,
    population: country.population,
    flag: country.flags?.svg || country.flags?.png,
    emoji: country.flag,
    googleMaps: country.maps?.googleMaps,
    ...richData
  });
}