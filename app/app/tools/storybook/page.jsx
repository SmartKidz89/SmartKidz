"use client";

import { useState, useRef } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader2, BookOpen, Download, Wand2, ChevronLeft, ChevronRight, PenTool } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";

const THEMES = [
  "A space adventure",
  "A dragon who can't breathe fire",
  "The secret life of my pet hamster",
  "A superhero with a silly power",
  "The day it rained candy"
];

export default function StorybookGenerator() {
  const [prompt, setPrompt] = useState("");
  const [pageCount, setPageCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  async function handleGenerate(e) {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setStory(null);
    setCurrentPage(0);

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
      
      // Page Number
      doc.setFontSize(10);
      doc.text(`Page ${i + 1}`, pageWidth / 2, pageHeight - 10, { align: "center" });

      // Story Text
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      
      // Basic text wrapping
      const splitText = doc.splitTextToSize(page.text, pageWidth - (margin * 2));
      
      // Center text vertically-ish
      doc.text(splitText, margin, pageHeight / 2);
      
      // Optional: Add prompt note for illustration
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
          <p className="text-slate-600 font-medium">Turn your ideas into a real book.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[400px_1fr] gap-8 items-start">
        
        {/* Controls */}
        <div className="space-y-6">
          <Card className="p-6 bg-white/80 backdrop-blur-xl border-slate-200 shadow-xl">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  Story Idea
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A cat who becomes a chef..."
                  className="w-full h-32 rounded-2xl border-2 border-slate-200 p-4 text-lg font-medium focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  Length: {pageCount} Pages
                </label>
                <input 
                  type="range" 
                  min="5" 
                  max="20" 
                  step="5" 
                  value={pageCount} 
                  onChange={(e) => setPageCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
                <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                  <span>Short (5)</span>
                  <span>Long (20)</span>
                </div>
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

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Inspiration</div>
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => setPrompt(t)}
                className="w-full text-left p-3 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all"
              >
                {t}
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
            </div>
          )}

          {loading && (
            <div className="flex-1 rounded-[3rem] bg-white border border-slate-100 shadow-2xl p-12 flex flex-col items-center justify-center text-center animate-pulse">
              <div className="w-20 h-20 rounded-full bg-indigo-100 mb-6" />
              <div className="w-64 h-8 bg-slate-200 rounded-full mb-4" />
              <div className="w-48 h-4 bg-slate-100 rounded-full" />
            </div>
          )}

          {story && (
            <div className="flex-1 flex flex-col">
              {/* Book View */}
              <div className="flex-1 bg-white rounded-r-[3rem] rounded-l-md border-r-[12px] border-b-[12px] border-slate-200 shadow-2xl relative overflow-hidden flex flex-col">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-300 to-transparent opacity-20" />
                
                <div className="flex-1 p-8 sm:p-16 flex flex-col justify-center text-center">
                  {currentPage === -1 ? (
                     // Cover
                     <div className="space-y-6">
                       <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                         {story.title}
                       </h2>
                       <div className="w-32 h-1 bg-slate-900 mx-auto" />
                       <p className="text-lg text-slate-500 font-bold uppercase tracking-widest">
                         A Story by You
                       </p>
                     </div>
                  ) : (
                     // Page
                     <div className="max-w-2xl mx-auto space-y-8">
                        <div className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm font-medium p-4">
                           {story.pages[currentPage].imagePrompt}
                        </div>
                        <p className="text-xl sm:text-2xl font-medium text-slate-800 leading-relaxed">
                          {story.pages[currentPage].text}
                        </p>
                     </div>
                  )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-400 uppercase">
                    {currentPage === -1 ? "Cover" : `Page ${currentPage + 1} of ${story.pages.length}`}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(c => Math.max(-1, c - 1))}
                      disabled={currentPage === -1}
                      className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(c => Math.min(story.pages.length - 1, c + 1))}
                      disabled={currentPage === story.pages.length - 1}
                      className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex justify-center gap-4">
                <Button onClick={downloadPDF} className="shadow-xl" size="lg">
                  <Download className="w-5 h-5 mr-2" /> Download PDF
                </Button>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-500">
                  <span className="opacity-50">EPUB</span>
                  <span className="opacity-50">MOBI</span>
                  <span className="text-brand-primary">Coming Soon</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageMotion>
  );
}