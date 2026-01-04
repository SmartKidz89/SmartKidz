import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// System assets that must always exist
// Prompts updated to be pure subjects, relying on the Master Style for the look.
const REQUIRED_ASSETS = [
  // Games
  { id: "game-maths-miner-cover", type: "image", prompt: "A mining scene with gems and numbers" },
  { id: "game-word-royale-cover", type: "image", prompt: "A castle made of alphabet blocks, blue sky" },
  { id: "game-cosmic-tycoon-cover", type: "image", prompt: "A space station with rockets and planets" },
  { id: "game-pixel-painter-cover", type: "image", prompt: "A canvas with paint buckets and brushes" },
  { id: "game-spelling-bee-cover", type: "image", prompt: "A happy bee holding a trophy, honeycomb background" },
  { id: "game-globe-trotter-cover", type: "image", prompt: "A spinning earth globe with famous landmarks" },
  { id: "game-logic-lab-cover", type: "image", prompt: "A robot in a high-tech science lab, glowing buttons" },
  { id: "game-rhythm-reader-cover", type: "image", prompt: "Musical notes and open books dancing together" },
  { id: "game-super-streak-cover", type: "image", prompt: "A lightning bolt superhero character flying fast" },
  { id: "game-block-builder-cover", type: "image", prompt: "A city being built with colorful blocks" },
  { id: "game-retro-runner-cover", type: "image", prompt: "A runner character jumping over obstacles" },

  // Creative Tools
  { id: "tool-origami-cover", type: "image", prompt: "Paper cranes and folded animals on a table" },
  { id: "tool-color-lab-cover", type: "image", prompt: "Glass beakers mixing vibrant paints, rainbow splashes" },
  { id: "tool-pattern-maker-cover", type: "image", prompt: "A kaleidoscope pattern of geometric shapes" },
  { id: "tool-comic-creator-cover", type: "image", prompt: "Empty comic book panels with speech bubbles" },
  { id: "tool-sound-lab-cover", type: "image", prompt: "Sound waves and synthesizer knobs" },
  { id: "tool-flag-designer-cover", type: "image", prompt: "Fabric, stars, and stripes for designing flags" },
  { id: "tool-emoji-kitchen-cover", type: "image", prompt: "A mixing bowl with emoji faces and accessories" },
  { id: "tool-drum-kit-cover", type: "image", prompt: "A drum set with glowing pads" },
  { id: "tool-sky-writer-cover", type: "image", prompt: "A plane writing letters in the sky" },
  { id: "tool-card-creator-cover", type: "image", prompt: "Greeting cards, markers, and glitter on a table" },
  { id: "tool-teachme-cover", type: "image", prompt: "An owl professor pointing to a whiteboard" },
  { id: "tool-grammar-cover", type: "image", prompt: "Building blocks with letters forming a sentence" },
  { id: "tool-dictionary-cover", type: "image", prompt: "An open book with words floating out as sparkles" },
  { id: "tool-timeline-cover", type: "image", prompt: "A winding road through history with clocks" },
  { id: "tool-debate-cover", type: "image", prompt: "Two microphones on a stage with speech bubbles" },
  { id: "tool-zen-cover", type: "image", prompt: "A peaceful garden with stones and bamboo" },

  // Worlds
  { id: "world-math-cover", type: "image", prompt: "A mountain range made of geometric shapes and numbers" },
  { id: "world-reading-cover", type: "image", prompt: "A cozy library inside a giant tree, glowing books" },
  { id: "world-science-cover", type: "image", prompt: "A lush forest with bubbling potions and floating atoms" },
  { id: "world-hass-cover", type: "image", prompt: "An ancient map and a compass on a wooden table" },
  { id: "world-arts-cover", type: "image", prompt: "An explosion of colorful paint, musical instruments and masks" },
  { id: "world-tech-cover", type: "image", prompt: "A futuristic city with flying cars and networks" },
  { id: "world-hpe-cover", type: "image", prompt: "A sunny park with sports equipment and fruit" },
  { id: "world-lang-cover", type: "image", prompt: "Speech bubbles with flags from different countries" }
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
            // Store the "subject" as the prompt. The generator will wrap it with the Master Style.
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
                  
                  // Construct a subject-focused prompt.
                  // The generator will apply the "paper cutout" style.
                  const prompt = `A fun education scene about ${topic}. Subject: ${subject}.`;
                  
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