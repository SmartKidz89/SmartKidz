"use client";

import { useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader2, Download, Wand2, ChevronLeft, ChevronRight, PenTool, Sparkles, Book, RefreshCw } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";

const STORY_TEMPLATES = [
  {
    title: "The Cloud Bakery",
    prompt: "Write a story about a shy dragon named Puff who opens a bakery in the clouds. He bakes bread made of lightning and cakes made of rainbows. One day, the sun gets hungry...",
    icon: "🐉"
  },
  {
    title: "Purple Planet Mystery",
    prompt: "Write a mystery story about two kid astronauts, Leo and Mia, who land on a purple planet. They find giant footprints but no people. Who lives there? And where did they go?",
    icon: "🚀"
  },
  {
    title: "The Golden Yarn",
    prompt: "A detective cat named Whiskers is looking for the missing Golden Yarn. He asks a wise owl, a busy mouse, and a grumpy dog for clues. It turns out the yarn was...",
    icon: "🧶"
  },
  {
    title: "Toy Tree",
    prompt: "Imagine a tree that grows toys instead of fruit. Write a story about a girl who finds the tree but realizes that the toys only ripen when she shares them with friends.",
    icon: "🌳"
  },
  {
    title: "Robot Artist",
    prompt: "A robot named Artie wants to learn how to paint, but he only has grey paint. He goes on a journey to find colours in nature—red from a rose, blue from the sea...",
    icon: "🎨"
  }
];

export default function StorybookGenerator() {
  const [prompt, setPrompt] = useState("");
  const [pageCount, setPageCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState(null);
  const [currentPage, setCurrentPage] = useState(-1); // -1 = Cover

  // Image cache to prevent re-fetching when flipping pages
  const [imageUrls, setImageUrls] = useState({});

  async function handleGenerate(e) {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setStory(null);
    setImageUrls({});
    setCurrentPage(-1);

    try {
      const res = await fetch("/api/story-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, pages: pageCount })
      });

      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      setStory(data);
    } catch (e) {
      console.error(e);
      alert("Could not generate story. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function getImageUrl(index, prompt) {
    if (index === -1) return null; // Cover doesn't auto-gen yet
    if (imageUrls[index]) return imageUrls[index];

    // Using Pollinations for fast, free generation demo
    const seed = Math.floor(Math.random() * 1000);
    const safePrompt = encodeURIComponent(`children's book illustration, ${prompt} --no text`);
    const url = `https://image.pollinations.ai/prompt/${safePrompt}?width=1024&height=600&nologo=true&seed=${seed}`;
    
    // Optimistic set
    setImageUrls(prev => ({ ...prev, [index]: url }));
    return url;
  }

  async function downloadPDF() {
    if (!story) return;
    const doc = new jsPDF("l", "mm", "a4"); // Landscape
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Title Page
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.text(story.title, width / 2, height / 2 - 10, { align: "center" });
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Created with SmartKidz", width / 2, height / 2 + 10, { align: "center" });

    // Story Pages
    for (let i = 0; i < story.pages.length; i++) {
      doc.addPage();
      const page = story.pages[i];
      
      // Try to add image if we loaded it in browser
      // (Note: Adding remote images to PDF client-side is tricky due to CORS; skipping actual image data for this MVP PDF export, showing text clearly)
      
      doc.setFillColor(20, 20, 30);
      doc.rect(0, 0, width, height, "F"); // Dark background simulating the slide
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      const splitText = doc.splitTextToSize(page.text, width - 40);
      doc.text(splitText, width / 2, height - 40, { align: "center" });
    }

    doc.save(`${story.title.replace(/\s+/g, "_")}.pdf`);
  }

  return (
    <PageMotion className="max-w-6xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/app/tools" className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Magic Storybook</h1>
          <p className="text-slate-600 font-medium">Turn ideas into illustrated stories.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
        
        {/* Controls */}
        <div className="space-y-6">
          <Card className="p-6 bg-white/80 backdrop-blur-xl border-slate-200 shadow-xl">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  Your Story Idea
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A cat who becomes a chef..."
                  className="w-full h-32 rounded-2xl border-2 border-slate-200 p-4 text-base font-medium focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Book Length
                  </label>
                  <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md">
                    {pageCount} Pages
                  </span>
                </div>
                <input 
                  type="range" 
                  min="3" 
                  max="8" 
                  step="1" 
                  value={pageCount} 
                  onChange={(e) => setPageCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading || !prompt.trim()} 
                className="w-full h-14 text-lg shadow-xl"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Illustrating...</>
                ) : (
                  <><Wand2 className="w-5 h-5 mr-2" /> Write & Draw</>
                )}
              </Button>
            </form>
          </Card>

          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Inspiration Templates
            </div>
            {STORY_TEMPLATES.map((t) => (
              <button
                key={t.title}
                onClick={() => setPrompt(t.prompt)}
                className="w-full text-left p-3 rounded-2xl bg-white border border-slate-100 hover:border-brand-primary/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl group-hover:scale-110 transition-transform">{t.icon}</div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{t.title}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{t.prompt}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview / Output */}
        <div className="min-h-[600px] flex flex-col">
          {!story && !loading && (
            <div className="flex-1 rounded-[3rem] border-4 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center p-12">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-sm mb-6">
                <PenTool className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-400">Waiting for inspiration...</h3>
              <p className="text-slate-500 font-medium mt-2 max-w-xs">
                Pick a template or write your own idea to start.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex-1 rounded-[3rem] bg-white border border-slate-100 shadow-2xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-indigo-50 mb-6 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              </div>
              <div className="text-xl font-bold text-slate-800">Creating your story...</div>
              <div className="text-slate-500 mt-2">Writing text and painting pictures.</div>
            </div>
          )}

          {story && (
            <div className="flex-1 flex flex-col h-[600px] relative perspective-1000">
              
              {/* Book Container */}
              <div className="relative flex-1 bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border-8 border-white ring-1 ring-slate-200">
                
                {/* PAGE CONTENT */}
                <div className="absolute inset-0">
                  {currentPage === -1 ? (
                     // COVER PAGE
                     <div className="h-full w-full bg-gradient-to-br from-indigo-600 to-purple-800 flex flex-col items-center justify-center text-center p-10 text-white">
                        <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-6xl shadow-2xl mb-8 border border-white/20">
                           <Book />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4 drop-shadow-lg">
                           {story.title}
                        </h1>
                        <div className="w-24 h-2 bg-white/30 rounded-full mb-8" />
                        <p className="text-sm font-bold uppercase tracking-widest text-indigo-200">
                           An AI Storybook
                        </p>
                     </div>
                  ) : (
                     // STORY PAGE
                     <div className="h-full w-full relative">
                        {/* Illustration Layer */}
                        <div className="absolute inset-0 bg-slate-800">
                           {/* Using img tag with Pollinations for dynamic generation */}
                           <img 
                              src={getImageUrl(currentPage, story.pages[currentPage].imagePrompt)} 
                              alt="Story illustration"
                              className="w-full h-full object-cover animate-in fade-in duration-700"
                           />
                           {/* Gradient Scrim for text readability */}
                           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                        </div>

                        {/* Text Layer */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-center">
                           <p className="text-xl md:text-3xl font-bold text-white leading-relaxed drop-shadow-md font-serif">
                             {story.pages[currentPage].text}
                           </p>
                        </div>
                        
                        {/* Refresh Image Button (Subtle) */}
                        <button 
                           onClick={() => setImageUrls(prev => ({ ...prev, [currentPage]: null }))}
                           className="absolute top-4 right-4 p-2 bg-black/30 text-white rounded-full hover:bg-black/50 backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                           title="Redraw image"
                        >
                           <RefreshCw className="w-4 h-4" />
                        </button>
                     </div>
                  )}
                </div>

                {/* NAVIGATION CONTROLS */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between pointer-events-none">
                   <button
                     onClick={() => setCurrentPage(c => Math.max(-1, c - 1))}
                     disabled={currentPage === -1}
                     className="pointer-events-auto h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white disabled:opacity-0 transition-all border border-white/10"
                   >
                     <ChevronLeft className="w-6 h-6" />
                   </button>
                   
                   <div className="px-4 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/80 text-xs font-bold uppercase tracking-wider">
                      {currentPage === -1 ? "Cover" : `${currentPage + 1} / ${story.pages.length}`}
                   </div>

                   <button
                     onClick={() => setCurrentPage(c => Math.min(story.pages.length - 1, c + 1))}
                     disabled={currentPage === story.pages.length - 1}
                     className="pointer-events-auto h-12 w-12 rounded-full bg-white text-indigo-900 hover:scale-105 shadow-xl flex items-center justify-center disabled:opacity-0 transition-all font-bold"
                   >
                     <ChevronRight className="w-6 h-6" />
                   </button>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-8 flex justify-center gap-4">
                <Button onClick={downloadPDF} className="shadow-xl px-8" size="lg">
                  <Download className="w-5 h-5 mr-2" /> Download PDF (Text Only)
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageMotion>
  );
}