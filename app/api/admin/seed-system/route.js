import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BADGES = [
  { id: "first_lesson", name: "First Steps", description: "Complete your first lesson.", icon: "🚀", category: "milestone" },
  { id: "math_star", name: "Math Star", description: "Complete 5 Maths lessons.", icon: "➕", category: "subject" },
  { id: "reading_champ", name: "Bookworm", description: "Complete 5 Reading lessons.", icon: "📚", category: "subject" },
  { id: "science_wiz", name: "Lab Coat", description: "Complete 5 Science lessons.", icon: "🧪", category: "subject" },
  { id: "streak_3", name: "On Fire", description: "3 day learning streak.", icon: "🔥", category: "streak" },
  { id: "streak_7", name: "Unstoppable", description: "7 day learning streak.", icon: "🏆", category: "streak" },
  { id: "early_bird", name: "Early Bird", description: "Complete a lesson before 8am.", icon: "🌅", category: "habit" },
  { id: "night_owl", name: "Night Owl", description: "Complete a lesson after 7pm.", icon: "🦉", category: "habit" }
];

const CURRICULA = [
  { id: "AC9", name: "Australian Curriculum v9", country_code: "AU", locale_code: "en-AU" },
  { id: "CCSS", name: "Common Core", country_code: "US", locale_code: "en-US" },
  { id: "NC", name: "National Curriculum", country_code: "GB", locale_code: "en-GB" },
  { id: "INT", name: "International", country_code: "INT", locale_code: "en" }
];

// Minimal skill tree generation
function generateSkills() {
  const skills = [];
  const subjects = ["MATH", "ENG", "SCI", "HASS"];
  const years = [1, 2, 3, 4, 5, 6];
  
  // Topics map
  const topics = {
    MATH: ["Number", "Algebra", "Geometry", "Statistics"],
    ENG: ["Reading", "Writing", "Speaking", "Grammar"],
    SCI: ["Biology", "Chemistry", "Physics", "Earth"],
    HASS: ["History", "Geography", "Civics"]
  };

  subjects.forEach(sub => {
    years.forEach(year => {
      (topics[sub] || ["General"]).forEach((topic, i) => {
        skills.push({
          id: `${sub}_Y${year}_${topic.substring(0,3).toUpperCase()}_01`,
          subject_id: sub,
          year_level: year,
          name: `${topic} Foundations`,
          topic: topic,
          description: `Core ${topic} skills for Year ${year}`
        });
        skills.push({
          id: `${sub}_Y${year}_${topic.substring(0,3).toUpperCase()}_02`,
          subject_id: sub,
          year_level: year,
          name: `${topic} Application`,
          topic: topic,
          description: `Applying ${topic} in Year ${year} contexts`
        });
      });
    });
  });
  return skills;
}

export async function POST(req) {
  try {
    const { token } = await req.json().catch(() => ({}));
    
    if (!process.env.ADMIN_GENERATE_ASSETS_TOKEN || token !== process.env.ADMIN_GENERATE_ASSETS_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const skills = generateSkills();

    // 1. Seed Curricula
    const { error: cErr } = await supabase.from("curricula").upsert(CURRICULA, { onConflict: "id" });
    if (cErr) throw new Error(`Curricula error: ${cErr.message}`);

    // 2. Seed Badges
    const { error: bErr } = await supabase.from("badges").upsert(BADGES, { onConflict: "id" });
    if (bErr) throw new Error(`Badges error: ${bErr.message}`);

    // 3. Seed Skills
    // Chunking to be safe
    const chunkSize = 100;
    for (let i = 0; i < skills.length; i += chunkSize) {
      const chunk = skills.slice(i, i + chunkSize);
      const { error: sErr } = await supabase.from("skills").upsert(chunk, { onConflict: "id" });
      if (sErr) console.warn("Skill chunk error:", sErr.message);
    }

    return NextResponse.json({ 
      ok: true, 
      stats: {
        curricula: CURRICULA.length,
        badges: BADGES.length,
        skills: skills.length
      }
    });

  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}