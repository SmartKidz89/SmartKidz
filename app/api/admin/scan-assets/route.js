import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// System assets that must always exist
const REQUIRED_ASSETS = [
  // Games
  { id: "game-maths-miner-cover", type: "image", prompt: "A cute 3D isometric mine with gems and numbers, kid friendly style" },
  { id: "game-word-royale-cover", type: "image", prompt: "A floating castle made of alphabet blocks, vibrant blue sky background" },
  { id: "game-cosmic-tycoon-cover", type: "image", prompt: "A futuristic space station with cute rockets and planets, cartoon style" },
  { id: "game-pixel-painter-cover", type: "image", prompt: "A colorful pixel art canvas with paint buckets and brushes" },
  { id: "game-spelling-bee-cover", type: "image", prompt: "A cute happy bee holding a trophy, honeycomb background" },
  { id: "game-globe-trotter-cover", type: "image", prompt: "A spinning 3D earth globe with famous landmarks popping out" },
  { id: "game-logic-lab-cover", type: "image", prompt: "A friendly robot in a high-tech science lab, glowing buttons" },
  { id: "game-rhythm-reader-cover", type: "image", prompt: "Musical notes and open books dancing together, vibrant colors" },
  { id: "game-super-streak-cover", type: "image", prompt: "A lightning bolt superhero character flying fast" },
  { id: "game-block-builder-cover", type: "image", prompt: "A colorful 3D block city being built by cute construction workers" },
  { id: "game-retro-runner-cover", type: "image", prompt: "An 8-bit style runner character jumping over obstacles, pixel art style" },

  // Creative Tools
  { id: "tool-origami-cover", type: "image", prompt: "Colorful paper cranes and folded animals on a clean table, crafting style" },
  { id: "tool-color-lab-cover", type: "image", prompt: "Glass beakers mixing vibrant paints, rainbow splashes, science art style" },
  { id: "tool-pattern-maker-cover", type: "image", prompt: "A kaleidoscope pattern of geometric shapes and snowflakes, mesmerizing colors" },
  { id: "tool-comic-creator-cover", type: "image", prompt: "Empty comic book panels with speech bubbles and stickers ready to place" },
  { id: "tool-sound-lab-cover", type: "image", prompt: "Colorful sound waves and synthesizer knobs, digital music interface style" },
  { id: "tool-flag-designer-cover", type: "image", prompt: "A workbench with fabric, stars, and stripes for designing flags, colorful" },
  { id: "tool-emoji-kitchen-cover", type: "image", prompt: "A mixing bowl with floating emoji faces and accessories, fun cartoon style" },
  { id: "tool-drum-kit-cover", type: "image", prompt: "A colorful drum set with glowing pads, music studio background" },
  { id: "tool-sky-writer-cover", type: "image", prompt: "A plane writing letters in white smoke against a bright blue sky" },
  { id: "tool-card-creator-cover", type: "image", prompt: "Greeting cards, markers, and glitter on a craft table, overhead view" },
  { id: "tool-teachme-cover", type: "image", prompt: "A friendly owl professor wearing glasses pointing to a whiteboard, 3d style" },
  { id: "tool-grammar-cover", type: "image", prompt: "Building blocks with letters forming a sentence, colorful toy style" },
  { id: "tool-dictionary-cover", type: "image", prompt: "A magical open book with words floating out as golden sparkles" },
  { id: "tool-timeline-cover", type: "image", prompt: "A winding road through history with clocks and milestones" },
  { id: "tool-debate-cover", type: "image", prompt: "Two microphones on a stage with speech bubbles, debate contest style" },
  { id: "tool-zen-cover", type: "image", prompt: "A peaceful garden with stones and bamboo, relaxing atmosphere" },

  // Worlds
  { id: "world-math-cover", type: "image", prompt: "A magical mountain range made of geometric shapes and numbers" },
  { id: "world-reading-cover", type: "image", prompt: "A cozy library inside a giant tree, glowing books" },
  { id: "world-science-cover", type: "image", prompt: "A lush forest with bubbling potions and floating atoms" },
  { id: "world-hass-cover", type: "image", prompt: "An ancient map and a compass on a wooden table" },
  { id: "world-arts-cover", type: "image", prompt: "An explosion of colorful paint, musical instruments and masks" },
  { id: "world-tech-cover", type: "image", prompt: "A futuristic city with flying cars and digital networks" },
  { id: "world-hpe-cover", type: "image", prompt: "A sunny park with sports equipment and healthy fruit" },
  { id: "world-lang-cover", type: "image", prompt: "Speech bubbles with flags from different countries, connected by lines" }
];

export async function POST(req) {
  let scannedCount = 0;
  let added = 0;
  let message = "";

  try {
    const { token, mode = "system" } = await req.json().catch(() => ({}));
    
    if (!process.env.ADMIN_GENERATE_ASSETS_TOKEN || token !== process.env.ADMIN_GENERATE_ASSETS_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // MODE: SYSTEM (Default)
    if (mode === "system") {
      for (const asset of REQUIRED_ASSETS) {
        const { data } = await supabase.from("assets").select("asset_id").eq("asset_id", asset.id).maybeSingle();
        if (!data) {
          await supabase.from("assets").insert({
            asset_id: asset.id,
            asset_type: asset.type,
            uri: `asset://${asset.type}/${asset.id}`,
            alt_text: asset.prompt,
            metadata: { status: "pending_generation", prompt: asset.prompt, source: "system" }
          });
          added++;
        }
        scannedCount++;
      }
      message = `System scan complete. Queued ${added} missing assets.`;
    }

    // MODE: LESSONS
    else if (mode === "lessons") {
      try {
        // Count total lessons
        const { count, error: countErr } = await supabase
          .from("lesson_editions")
          .select("*", { count: "exact", head: true });
        
        if (countErr) throw countErr;
        
        if (count > 0) {
          // Process a batch of 50 random lessons
          const batchSize = 50;
          const maxOffset = Math.max(0, count - batchSize);
          const offset = Math.floor(Math.random() * maxOffset);

          const { data: editions, error: fetchErr } = await supabase
            .from("lesson_editions")
            .select("edition_id, title, template_id")
            .range(offset, offset + batchSize - 1);

          if (fetchErr) throw fetchErr;

          if (editions && editions.length > 0) {
            // Get templates for prompts
            const templateIds = editions.map(e => e.template_id).filter(Boolean);
            const { data: templates } = await supabase
               .from("lesson_templates")
               .select("template_id, subject_id, topic")
               .in("template_id", templateIds);

            const tmplMap = new Map();
            (templates || []).forEach(t => tmplMap.set(t.template_id, t));

            for (const l of editions) {
               scannedCount++;
               const assetId = `lesson-cover-${l.edition_id}`;
               const { data: existing } = await supabase.from("assets").select("asset_id").eq("asset_id", assetId).maybeSingle();
               
               if (!existing) {
                  const tmpl = tmplMap.get(l.template_id) || {};
                  const subject = tmpl.subject_id || "General";
                  const topic = tmpl.topic || l.title || "Learning";
                  const prompt = `A fun, colorful 3D illustration for a children's lesson about ${topic}. Subject: ${subject}. Cute, bright, educational style. No text.`;
                  
                  await supabase.from("assets").insert({
                     asset_id: assetId,
                     asset_type: "image",
                     uri: `asset://image/lesson/${l.edition_id}/cover`,
                     alt_text: prompt,
                     metadata: { status: "pending_generation", prompt, source: "lesson_scan", lesson_id: l.edition_id }
                  });
                  added++;
               }
            }
          }
        } else {
          message = "No lessons found in database.";
        }
      } catch (innerErr) {
        throw new Error(`Lesson scan error: ${innerErr.message}`);
      }
      if (!message) message = `Lesson batch scan complete. Queued ${added} missing assets.`;
    }

    return NextResponse.json({ 
      ok: true, 
      mode,
      scanned: scannedCount,
      queued: added,
      message
    });

  } catch (e) {
    return NextResponse.json({ 
      error: e.message,
      scanned: scannedCount 
    }, { status: 500 });
  }
}