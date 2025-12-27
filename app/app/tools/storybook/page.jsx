"use client";

import { useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader2, Download, Wand2, ChevronLeft, ChevronRight, PenTool, Sparkles, Book } from "lucide-react";
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

  async function handleGenerate(e) {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setStory(null);
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

  async function downloadPDF() {
    if (!story) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Title Page
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(story.title, pageWidth / 2, pageHeight / 3, { align: "center", maxWidth: pageWidth - (margin * 2) });
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Created with SmartKidz", pageWidth / 2, pageHeight - 30, { align: "center" });

    // Story Pages
    story.pages.forEach((page, i) => {
      doc.addPage();
      doc.setFontSize(10);
      doc.text(`Page ${i + 1}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      const splitText = doc.splitTextToSize(page.text, pageWidth - (margin * 2));
      doc.text(splitText, margin, pageHeight / 2);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`[Illustration idea: ${page.imagePrompt}]`, pageWidth / 2, pageHeight - 30, { align: "center" });
      doc.setTextColor(0);
    });

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
          <p className="text-slate-600 font-medium">Turn ideas into a real book.</p>
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
                  max="10" 
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
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Writing...</>
                ) : (
                  <><Wand2 className="w-5 h-5 mr-2" /> Write Story</>
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
              <div className="text-xl font-bold text-slate-800">Writing your book...</div>
              <div className="text-slate-500 mt-2">Imagining characters and scenes.</div>
            </div>
          )}

          {story && (
            <div className="flex-1 flex flex-col">
              {/* Book View */}
              <div className="flex-1 bg-white rounded-r-[2rem] rounded-l-lg border-r-[16px] border-b-[16px] border-slate-200 shadow-2xl relative overflow-hidden flex flex-col min-h-[500px]">
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-300/50 to-transparent z-10 pointer-events-none" />
                
                <div className="flex-1 p-8 sm:p-16 flex flex-col justify-center text-center relative z-0">
                  {currentPage === -1 ? (
                     // Cover
                     <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                       <div className="w-24 h-24 bg-slate-900 rounded-full mx-auto flex items-center justify-center text-5xl shadow-lg text-white">
                         <Book />
                       </div>
                       <div>
                         <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
                           {story.title}
                         </h2>
                         <div className="w-20 h-1.5 bg-brand-primary mx-auto rounded-full" />
                       </div>
                       <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                         A SmartKidz Original
                       </p>
                     </div>
                  ) : (
                     // Page
                     <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-300 key={currentPage}">
                        <div className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-6 gap-2">
                           <span className="text-2xl">🖼️</span>
                           <span className="text-xs font-bold uppercase tracking-wide">Illustration Prompt</span>
                           <span className="text-center text-sm italic opacity-70 px-4">{story.pages[currentPage].imagePrompt}</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-medium text-slate-800 leading-relaxed font-serif">
                          {story.pages[currentPage].text}
                        </p>
                     </div>
                  )}
                </div>

                <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between z-20">
                  <div className="text-xs font-bold text-slate-400 uppercase">
                    {currentPage === -1 ? "Cover" : `Page ${currentPage + 1} of ${story.pages.length}`}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(c => Math.max(-1, c - 1))}
                      disabled={currentPage === -1}
                      className="p-3 rounded-full hover:bg-slate-200 disabled:opacity-30 transition-colors bg-white shadow-sm border border-slate-200"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(c => Math.min(story.pages.length - 1, c + 1))}
                      disabled={currentPage === story.pages.length - 1}
                      className="p-3 rounded-full hover:bg-slate-200 disabled:opacity-30 transition-colors bg-white shadow-sm border border-slate-200"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex justify-center gap-4">
                <Button onClick={downloadPDF} className="shadow-xl px-8" size="lg">
                  <Download className="w-5 h-5 mr-2" /> Download Book (PDF)
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageMotion>
  );
}