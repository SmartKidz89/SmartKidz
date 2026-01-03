"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { 
  ArrowRight, CheckCircle2, XCircle, Sparkles, 
  Lightbulb, Trophy, RotateCcw, Home, Volume2, 
  Eye, BookOpen, PenTool, BrainCircuit
} from "lucide-react";
import Image from "next/image";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

import { Button } from "@/components/ui/Button";
import { playUISound, haptic } from "@/components/ui/sound";
import { cn } from "@/lib/utils";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { addSeasonXp } from "@/components/app/SeasonPassPanel";
import { useEconomy } from "@/lib/economy/client";
import { lessonTelemetry } from "@/lib/lesson/telemetry";
import { useActiveChild } from "@/hooks/useActiveChild"; 
import ConfettiBurst from "@/components/app/ConfettiBurst";
import Mascot from "@/components/ui/Mascot";

// --- Helpers ---

// Used for speech synthesis so we don't read punctuation like **bold** out loud.
const stripMarkdown = (md) => {
  if (!md) return "";
  const s = String(md);
  return s
    // links: [text](url) -> text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    // bold/italic/code markers
    .replace(/[*_`~#]/g, "")
    // collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
};

const MarkdownText = ({ value, className }) => {
  if (!value) return null;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize]}
      className={className}
      components={{
        p: ({ children }) => <p className={className}>{children}</p>,
      }}
    >
      {String(value)}
    </ReactMarkdown>
  );
};

const PHASE_LABELS = {
  hook: "The Hook",
  instruction: "Let's Learn",
  guided_practice: "Practice Together",
  independent_practice: "Your Turn",
  challenge: "Challenge Mode"
};

const PHASE_COLORS = {
  hook: "bg-rose-100 text-rose-700",
  instruction: "bg-blue-100 text-blue-700",
  guided_practice: "bg-amber-100 text-amber-700",
  independent_practice: "bg-emerald-100 text-emerald-700",
  challenge: "bg-purple-100 text-purple-700"
};

function ProgressBar({ current, total }) {
  const safeTotal = Math.max(1, total);
  const progress = Math.min(100, Math.round(((current + 1) / safeTotal) * 100));
  return (
    <div className="w-full max-w-md mx-auto h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300/50">
      <motion.div 
        className="h-full bg-gradient-to-r from-brand-primary to-indigo-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 15 }}
      />
    </div>
  );
}

function ChoiceButton({ option, selected, correct, revealed, onClick }) {
  let stateClass = "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50";
  let icon = null;

  if (revealed) {
    if (option === correct) {
      stateClass = "bg-emerald-100 border-emerald-500 text-emerald-800 shadow-[0_0_0_2px_#10b981]";
      icon = <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
    } else if (selected === option) {
      stateClass = "bg-rose-100 border-rose-500 text-rose-800 opacity-80";
      icon = <XCircle className="w-6 h-6 text-rose-600" />;
    } else {
      stateClass = "bg-slate-50 border-slate-200 opacity-50";
    }
  } else if (selected === option) {
    stateClass = "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-[0_0_0_2px_#6366f1]";
  }

  return (
    <button
      onClick={onClick}
      disabled={revealed}
      className={cn(
        "relative w-full p-5 rounded-2xl border-2 text-left font-bold text-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-between shadow-sm",
        stateClass
      )}
    >
      <span>{option}</span>
      {icon}
    </button>
  );
}

export default function LessonClient({ lessonId }) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { activeChild } = useActiveChild();
  const activeChildId = activeChild?.id;
  const economy = useEconomy(activeChildId);

  // Data State
  const [lesson, setLesson] = useState(null);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Play State
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [isRevealed, setIsRevealed] = useState(false); 
  const [isCorrect, setIsCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Smart Hint State
  const [mistakeCount, setMistakeCount] = useState(0);
  const [activeHint, setActiveHint] = useState(null);

  // Telemetry
  const sessionRef = useRef(null);

  const personalize = (text) => {
    if (!text) return "";
    const name = activeChild?.display_name?.split(" ")[0] || "Friend";
    return text.replace(/\{\{childName\}\}/g, name);
  };

  const speak = (text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
    setIsSpeaking(true);
  };

  useEffect(() => {
    async function load() {
      if (!lessonId) return;
      try {
        const id = decodeURIComponent(lessonId);
        const { data, error } = await supabase.from("lesson_editions")
          .select("*,lesson_templates(subject_id,year_level,topic)")
          .eq("edition_id", id)
          .maybeSingle();
        
        if (error) throw new Error(error.message);
        if (!data) throw new Error("Lesson not found");
        
        const mergedLesson = {
          ...data,
          id: data.edition_id,
          subject_id: data.lesson_templates?.subject_id,
          year_level: data.lesson_templates?.year_level,
          topic: data.lesson_templates?.topic,
          // Backward-compat: older UI expects content_json; wrapper_json is the canonical "lesson wrapper"
          content_json: data.wrapper_json ?? {}
        };

        // Fetch normalized lesson content items (preferred). Falls back to wrapper_json adapter if none exist.
        let contentItems = [];
        try {
          const { data: items, error: itemsError } = await supabase
            .from("lesson_content_items")
            .select("content_id,type,title,phase,content_json,activity_order")
            .eq("edition_id", id)
            .order("activity_order", { ascending: true });

          if (itemsError) {
            console.warn("Failed to load lesson_content_items:", itemsError.message);
          } else if (Array.isArray(items)) {
            contentItems = items;
          }
        } catch (e) {
          console.warn("Failed to load lesson_content_items:", e);
        }

        
        // Fetch active content variants (all variants are active in this dataset)
        let variantByContentId = {};
        try {
          const contentIds = Array.isArray(contentItems) ? contentItems.map(i => i?.content_id).filter(Boolean) : [];
          if (contentIds.length > 0) {
            const { data: variants, error: varError } = await supabase
              .from("content_variants")
              .select("content_id,variant_json,active")
              .in("content_id", contentIds)
              .eq("active", true);

            if (varError) {
              console.warn("Failed to load content_variants:", varError.message);
            } else if (Array.isArray(variants)) {
              for (const v of variants) {
                if (v?.content_id) variantByContentId[v.content_id] = v.variant_json || {};
              }
            }
          }
        } catch (e) {
          console.warn("Failed to load content_variants:", e);
        }


        // Fetch asset URIs for content items (images, videos, etc.)
        let assetByContentId = {};
        try {
          const contentIdsForAssets = Array.isArray(contentItems) ? contentItems.map(i => i?.content_id).filter(Boolean) : [];
          if (contentIdsForAssets.length > 0) {
            const { data: links, error: linksError } = await supabase
              .from("content_item_assets")
              .select("content_id,asset_id,usage")
              .in("content_id", contentIdsForAssets);

            if (linksError) {
              console.warn("Failed to load content_item_assets:", linksError.message);
            } else if (Array.isArray(links) && links.length > 0) {
              const assetIds = [...new Set(links.map(l => l?.asset_id).filter(Boolean))];
              const { data: assets, error: assetsError } = await supabase
                .from("assets")
                .select("asset_id,asset_type,uri,alt_text,metadata")
                .in("asset_id", assetIds);

              if (assetsError) {
                console.warn("Failed to load assets:", assetsError.message);
              } else {
                const bucket = process.env.NEXT_PUBLIC_SUPABASE_ASSETS_BUCKET || "assets";
                const byId = {};
                (assets || []).forEach(a => {
                  if (a?.asset_id) byId[a.asset_id] = a;
                });

                const resolveUri = (uri, asset) => {
                  // Prefer resolved storage URL saved in metadata (Option B pipeline)
                  const meta = asset?.metadata || null;
                  const metaUrl = meta && (meta.public_url || meta.publicUrl);
                  if (metaUrl && /^https?:\/\//i.test(metaUrl)) return metaUrl;

                  if (!uri) return null;
                  if (/^https?:\/\//i.test(uri)) return uri;

                  // Handle logical asset URIs like: asset://image/bg_rainforest
                  if (uri.startsWith("asset://")) {
                    const logical = uri.replace("asset://", ""); // e.g. image/bg_rainforest
                    const ext = (meta && (meta.ext || meta.extension)) || (asset?.asset_type === "sprite_atlas" ? "png" : "webp");
                    const path = `${logical}.${ext}`;
                    try {
                      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
                      return data?.publicUrl || null;
                    } catch {
                      return null;
                    }
                  }

                  // Allow "bucket/path" and "path" forms.
                  let path = uri;
                  if (path.startsWith(bucket + "/")) path = path.slice(bucket.length + 1);
                  try {
                    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
                    return data?.publicUrl || null;
                  } catch {
                    return null;
                  }
                };

                for (const link of links) {
                  const a = byId[link.asset_id];
                  const url = resolveUri(a?.uri, a);
                  if (!url || !link?.content_id) continue;
                  if (!assetByContentId[link.content_id]) assetByContentId[link.content_id] = [];
                  assetByContentId[link.content_id].push({
                    url,
                    asset_type: a?.asset_type,
                    alt_text: a?.alt_text || "",
                    usage: link?.usage || "",
                    metadata: a?.metadata || null,
                  });
                }
              }
            }
          }
        } catch (e) {
          console.warn("Failed to load assets for content items:", e);
        }

setLesson({ ...mergedLesson, content_items: contentItems, variant_by_content_id: variantByContentId, asset_by_content_id: assetByContentId });
// Safe JSON parsing
        let content = {};
        try {
          content = typeof mergedLesson.content_json === "string" 
            ? JSON.parse(mergedLesson.content_json) 
            : (mergedLesson.content_json || {});
        } catch (e) {
          console.warn("Failed to parse lesson content JSON", e);
          content = {};
        }
        
        let flow = [];
        
        // 1. Intro Screen
        flow.push({
          type: "intro",
          title: data.title || "Lesson",
          text: content.overview || content.objective || "Let's master this topic together!",
          icon: "🚀",
          phase: "hook"
        });

        // 2. ADAPTER: Convert Legacy/CSV Content to Activity Stream
        let activities = [];

        // Prefer normalized content items from Supabase
        if (Array.isArray(contentItems) && contentItems.length > 0) {
          activities = contentItems.map(it => {
            // Base JSON (may arrive as string depending on import tooling)
            let base = it?.content_json || {};
            try {
              base = typeof base === "string" ? JSON.parse(base) : (base || {});
            } catch {
              base = base || {};
            }

            const variant = (variantByContentId && it?.content_id) ? (variantByContentId[it.content_id] || {}) : {};

            const merged = { ...base, ...variant };

            // Normalize key fields used by the UI
            let prompt =
              merged.prompt_variant ??
              merged.prompt_markdown ??
              merged.prompt ??
              merged.question ??
              merged.stem ??
              "";

            const contentMarkdown =
              merged.content_markdown ??
              merged.content ??
              merged.body_markdown ??
              "";

            // Attach media URLs (prefer explicit fields, then linked assets)
            const linkedAssets = (assetByContentId && it?.content_id) ? (assetByContentId[it.content_id] || []) : [];
            let media_urls = [];
            const addUrl = (u) => {
              if (!u) return;
              if (!media_urls.includes(u)) media_urls.push(u);
            };
            const mergedMedia = merged.media_urls ?? merged.mediaUrls ?? merged.media ?? null;
            if (Array.isArray(mergedMedia)) mergedMedia.forEach(addUrl);
            else if (typeof mergedMedia === "string") addUrl(mergedMedia);
            addUrl(merged.image_url);
            addUrl(merged.image);
            addUrl(merged.media_url);

            // Add any linked image-like assets
            linkedAssets.forEach(a => {
              const t = (a?.asset_type || "").toLowerCase();
              const usage = (a?.usage || "").toLowerCase();
              if (t.includes("image") || t.includes("illustration") || t.includes("animation") || usage.includes("image") || usage.includes("illustration")) {
                addUrl(a.url);
              }
            });

            const image_alt = linkedAssets.find(a => a?.alt_text)?.alt_text || merged.alt_text || merged.alt || "";


            // Learn slides often store their body in content_markdown
            if ((it?.type === "learn" || merged.type === "learn") && !prompt && contentMarkdown) {
              prompt = contentMarkdown;
            }

            return {
              type: it?.type || merged.type,
              title: it?.title ?? merged.title ?? null,
              phase: it?.phase || merged.phase || undefined,
              activity_order: it?.activity_order,
              content_id: it?.content_id,
              media_urls,
              image_alt,
              prompt,
              content_markdown: contentMarkdown,
              ...merged
            };
          });
        } else {

        // A) If we have "explanation", make it a Learn activity
        if (content.explanation) {
          activities.push({
            type: "learn",
            title: "Let's Learn",
            prompt: content.explanation,
            phase: "instruction"
          });
        }

        // B) If we have "real_world_application", make it a Hook activity
        if (content.real_world_application) {
          activities.unshift({
            type: "visual_observe",
            title: "Real World",
            prompt: content.real_world_application,
            phase: "hook"
          });
        }

        // C) If we have "worked_example", make it a Learn activity
        if (content.worked_example) {
          activities.push({
            type: "learn",
            title: "Example",
            prompt: content.worked_example,
            phase: "guided_practice"
          });
        }

        // D) Scenarios -> Questions
        if (Array.isArray(content.scenarios)) {
          content.scenarios.forEach(s => {
             if (!s) return;
             activities.push({
               type: "learn",
               title: "Scenario",
               prompt: s.context || "Read this scenario.",
               phase: "guided_practice"
             });
             if (Array.isArray(s.questions)) {
               s.questions.forEach(q => {
                 if (!q) return;
                 activities.push({
                   type: "fill_blank",
                   prompt: q.prompt,
                   correct_answer: q.answer,
                   phase: "guided_practice"
                 });
               });
             }
          });
        }

        // E) Quiz -> Multiple Choice
        if (Array.isArray(content.quiz)) {
          content.quiz.forEach(q => {
            if (!q) return;
            activities.push({
              type: "multiple_choice",
              question: q.question || q.q,
              options: q.options,
              correct_answer: q.answer,
              explanation: q.explanation,
              phase: "independent_practice"
            });
          });
        }

        // F) Merge with specific "activities" array if it exists (AI content)
        if (Array.isArray(content.activities) && content.activities.length > 0) {
           activities = content.activities;
        }

        }

        // 3. Process Final Activity List into Screens
        activities.forEach(act => {
             if (!act) return;
             
             const imageUrl = act.media_urls?.[0] || null;
             const phase = act.phase || "instruction";
             
             if (act.type === "visual_observe") {
               flow.push({
                 type: "observe",
                 title: act.title || "Look Closely",
                 text: act.prompt || "What do you see?",
                 image: imageUrl,
                 phase,
                 buttonText: "I see it!"
               });
             }
             else if (act.type === "reflection") {
               flow.push({
                 type: "input",
                 question: act.prompt || "What do you think?",
                 hint: "Type your thoughts...",
                 phase,
                 isReflection: true,
                 image: imageUrl
               });
             }
             else if (act.type === "multiple_choice" || act.type === "quiz_question") {
               flow.push({
                 type: "quiz",
                 question: act.prompt || act.question || "Question",
                 options: act.input?.options || act.options || ["Yes", "No"],
                 answer: act.answer_key?.correct_answer || act.correct_answer || act.answer,
                 hint_ladder: act.hint_ladder || [], 
                 image: imageUrl,
                 phase,
                 explanation: act.explanation
               });
             } 
             else if (act.type === "fill_blank") {
                flow.push({
                 type: "input",
                 question: act.prompt || "Fill in the blank.",
                 answer: act.input?.correct_answer || act.correct_answer,
                 hint_ladder: act.hint_ladder || [],
                 image: imageUrl,
                 phase
                });
             }
             else {
               // Learn / Text / Fallback
               flow.push({
                 type: "learn",
                 title: act.title || "Key Concept",
                 text: act.prompt || act.explanation || "Read this carefully.",
                 image: imageUrl,
                 phase,
                 icon: "💡"
               });
             }
        });

        // 4. Outro
        flow.push({ type: "outro", title: "Lesson Complete!", text: "You did it! That's another step towards mastery.", phase: "challenge" });

        setScreens(flow);
        
        try {
          sessionRef.current = lessonTelemetry.startSession({ lessonId, childId: activeChildId });
        } catch (err) {
          // ignore telemetry errors
        }

      } catch (e) {
        console.error("Lesson load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lessonId, activeChildId]); // Removed `supabase` from deps to prevent re-loop

  // Clean up speech
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const currentScreen = screens[stepIndex];
  const isLastStep = stepIndex >= screens.length - 1;

  // -- Actions --

  const handleNext = async () => {
    try { playUISound("tap"); } catch {}
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    
    if (isLastStep) {
      await handleFinish();
    } else {
      setStepIndex(i => Math.min(screens.length - 1, i + 1));
      setSelectedOption(null);
      setInputValue("");
      setIsRevealed(false);
      setIsCorrect(false);
      setMistakeCount(0);
      setActiveHint(null);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCheck = () => {
    if (!currentScreen) return;
    
    let correct = false;

    if (currentScreen.type === "quiz") {
      correct = selectedOption === currentScreen.answer;
    } else if (currentScreen.type === "input") {
      if (currentScreen.isReflection) {
        correct = inputValue.trim().length > 2; // Any non-empty reflection is "correct"
      } else {
        // Loose string match
        const normInput = inputValue.trim().toLowerCase();
        const normAns = (currentScreen.answer || "").trim().toLowerCase();
        correct = normInput === normAns || normInput.includes(normAns);
      }
    } else {
      handleNext();
      return;
    }

    if (correct) {
      setIsRevealed(true);
      setIsCorrect(true);
      try { playUISound("success"); haptic("medium"); } catch {}
      if (Math.random() > 0.7) setShowConfetti(true);
    } else {
      try { playUISound("error"); haptic("light"); } catch {}
      setMistakeCount(prev => prev + 1);
      
      if (currentScreen.hint_ladder && currentScreen.hint_ladder.length > 0) {
        const nextHintIndex = Math.min(mistakeCount, currentScreen.hint_ladder.length - 1);
        setActiveHint(currentScreen.hint_ladder[nextHintIndex]);
      }
    }
  };

  const handleFinish = async () => {
    try { playUISound("levelup"); } catch {}
    setShowConfetti(true);
    
    if (activeChildId) {
       try {
         await supabase.from("attempts").insert({
           child_id: activeChildId,
           lesson_id: decodeURIComponent(lessonId),
           activity_id: "lesson_completed",
           correct: true,
           created_at: new Date().toISOString()
         });
         // Optimistic updates
         try { await economy.award(25, 100); } catch {}
         try { addSeasonXp(100); } catch {}
       } catch (e) {
         console.error("Finish save error:", e);
       }
    }
    
    setTimeout(() => router.push("/app"), 3000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
       <div className="animate-bounce text-4xl">🤔</div>
    </div>
  );

  if (!currentScreen) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
       <h2 className="text-xl font-bold text-slate-900">Lesson Unavailable</h2>
       <p className="text-slate-600 mt-2 mb-6">We couldn't load the content for this lesson.</p>
       <Button onClick={() => router.push("/app/worlds")}>Back to Worlds</Button>
    </div>
  );

  // Personalization
  const displayTitle = personalize(currentScreen.title);
  const displayText = personalize(currentScreen.text);
  const displayQuestion = personalize(currentScreen.question);

  const PhaseIcon = currentScreen.phase === "hook" ? Eye : currentScreen.phase === "instruction" ? BookOpen : currentScreen.phase === "challenge" ? Trophy : BrainCircuit;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <ConfettiBurst show={showConfetti} onDone={() => setShowConfetti(false)} />

      {/* Top Bar */}
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
           <Home className="w-6 h-6" />
        </button>
        <div className="flex-1 px-4 max-w-xl mx-auto">
           <ProgressBar current={stepIndex} total={screens.length} />
        </div>
        <div className="w-10 flex justify-end">
           {/* Phase Pill (Desktop) */}
           <div className={cn("hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider", PHASE_COLORS[currentScreen.phase] || "bg-slate-100 text-slate-600")}>
              <PhaseIcon className="w-3 h-3" />
              {PHASE_LABELS[currentScreen.phase] || "Lesson"}
           </div>
        </div>
      </div>

      {/* Mobile Phase Indicator */}
      <div className="sm:hidden bg-slate-50 border-b border-slate-100 py-2 flex justify-center">
         <div className={cn("inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", PHASE_COLORS[currentScreen.phase] || "bg-slate-100 text-slate-600")}>
            <PhaseIcon className="w-3 h-3" />
            {PHASE_LABELS[currentScreen.phase] || "Lesson"}
         </div>
      </div>

      {/* Main Stage */}
      <div className="flex-1 flex flex-col items-center justify-start sm:justify-center p-4 sm:p-6 w-full max-w-3xl mx-auto">
         <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full"
            >
               
               {/* TYPE: INTRO / OUTRO */}
               {(currentScreen.type === "intro" || currentScreen.type === "outro") && (
                 <div className="text-center space-y-8 py-8">
                    <div className="w-32 h-32 mx-auto bg-white rounded-[2rem] shadow-xl flex items-center justify-center text-7xl border-4 border-white ring-1 ring-slate-100 animate-in zoom-in duration-500">
                       {currentScreen.icon || (currentScreen.type === "outro" ? "🏆" : "📘")}
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                      {displayTitle}
                    </h1>
                    <div className="text-xl text-slate-600 font-medium leading-relaxed max-w-xl mx-auto">
                       {displayText}
                    </div>
                 </div>
               )}

               {/* TYPE: OBSERVE / LEARN */}
               {(currentScreen.type === "observe" || currentScreen.type === "learn") && (
                 <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                    {/* Hero Image */}
                    {currentScreen.image && (
                      <div className="relative w-full aspect-video bg-slate-100">
                         <Image src={currentScreen.image} alt="Lesson visual" fill className="object-cover" />
                      </div>
                    )}
                    
                    <div className="p-8 sm:p-10 text-center">
                       <div className="inline-flex mb-4 items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                          {currentScreen.type === "observe" ? <Eye className="w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
                          {currentScreen.title}
                       </div>
                       
                       <div className="relative">
                          <MarkdownText
                            value={displayText}
                            className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed whitespace-pre-wrap"
                          />
                          <button 
                             onClick={() => speak(stripMarkdown(displayText))}
                             className="absolute -right-4 -top-2 p-2 text-slate-300 hover:text-indigo-500 transition-colors"
                          >
                             <Volume2 className={cn("w-6 h-6", isSpeaking && "animate-pulse text-indigo-500")} />
                          </button>
                       </div>
                    </div>
                 </div>
               )}

               {/* TYPE: QUIZ / INPUT */}
               {(currentScreen.type === "quiz" || currentScreen.type === "input") && (
                 <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                       <div className="hidden sm:block shrink-0 mt-2">
                          <Mascot mood={mistakeCount > 0 ? "sad" : "happy"} />
                       </div>
                       
                       <div className="w-full bg-white p-6 sm:p-8 rounded-[2rem] shadow-lg border border-slate-100 relative">
                          {/* Image Context */}
                          {currentScreen.image && (
                            <div className="mb-6 relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                               <Image 
                                 src={currentScreen.image} 
                                 alt="Question visual" 
                                 fill 
                                 className="object-cover" 
                               />
                            </div>
                          )}

                          <MarkdownText
                            value={displayQuestion}
                            className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug pr-8"
                          />

                          <button 
                            onClick={() => speak(stripMarkdown(displayQuestion))}
                            className="absolute top-6 right-6 text-slate-300 hover:text-indigo-500 transition-colors"
                          >
                             <Volume2 className={cn("w-6 h-6", isSpeaking && "animate-pulse text-indigo-500")} />
                          </button>
                       </div>
                    </div>

                    {/* Teacher Hint */}
                    <AnimatePresence>
                      {(activeHint && !isCorrect) && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: "auto" }}
                          className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex gap-3 items-start overflow-hidden"
                        >
                           <Lightbulb className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                           <div>
                             <div className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-1">Hint</div>
                             <div className="text-indigo-900 font-medium text-sm leading-relaxed">{personalize(activeHint)}</div>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Options / Input */}
                    {currentScreen.type === "quiz" ? (
                      <div className="grid gap-3 pt-2">
                         {currentScreen.options.map((opt, i) => (
                           <ChoiceButton 
                             key={i} 
                             option={opt} 
                             selected={selectedOption} 
                             correct={currentScreen.answer}
                             revealed={isRevealed}
                             onClick={() => !isRevealed && setSelectedOption(opt)}
                           />
                         ))}
                      </div>
                    ) : (
                      <div className="pt-2">
                         {currentScreen.isReflection ? (
                            <textarea
                              className="w-full h-40 p-5 rounded-2xl border-2 border-slate-200 text-lg font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none resize-none"
                              placeholder="Type here..."
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              disabled={isRevealed}
                            />
                         ) : (
                            <input
                              className="w-full h-16 px-6 rounded-2xl border-2 border-slate-200 text-xl font-bold text-center focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                              placeholder="Type your answer..."
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              disabled={isRevealed}
                              onKeyDown={(e) => e.key === "Enter" && !isRevealed && handleCheck()}
                            />
                         )}
                      </div>
                    )}
                 </div>
               )}

               {/* Feedback Area */}
               <AnimatePresence>
                 {isRevealed && isCorrect && (
                   <motion.div 
                     initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     className="mt-6 p-5 rounded-[2rem] flex items-center gap-4 bg-emerald-50 text-emerald-900 border border-emerald-100 shadow-sm"
                   >
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                         <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-black text-lg">That's right!</div>
                        {currentScreen.explanation && (
                           <div className="text-sm font-medium opacity-90 mt-1">{currentScreen.explanation}</div>
                        )}
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>

            </motion.div>
         </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="p-4 sm:p-6 bg-white border-t border-slate-100 fixed bottom-0 left-0 right-0 z-30 safe-area-bottom">
         <div className="max-w-2xl mx-auto">
            {!isRevealed && (currentScreen.type === "quiz" || currentScreen.type === "input") ? (
               <Button 
                 onClick={handleCheck} 
                 disabled={!selectedOption && !inputValue.trim()} 
                 className="w-full h-14 text-lg shadow-xl"
               >
                 Check Answer
               </Button>
            ) : (
               <Button 
                 onClick={handleNext} 
                 className={cn("w-full h-14 text-lg shadow-xl", isLastStep ? "bg-emerald-500 hover:bg-emerald-600" : "bg-slate-900")}
               >
                 {isLastStep ? (currentScreen.buttonText || "Finish Lesson") : (currentScreen.buttonText || "Continue")} 
                 {!isLastStep && <ArrowRight className="w-5 h-5 ml-2" />}
               </Button>
            )}
         </div>
      </div>

      {/* Spacer for fixed footer */}
      <div className="h-28" />

    </div>
  );
}