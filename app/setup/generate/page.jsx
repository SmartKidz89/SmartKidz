"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Download, FileSpreadsheet } from "lucide-react";

export default function GeneratePage() {
  const downloadBatch = (batch) => {
    window.location.href = `/api/setup/generate-csv?batch=${batch}`;
  };

  return (
    <PageMotion className="max-w-4xl mx-auto pb-20 pt-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Massive Lesson Generator</h1>
          <p className="text-slate-600 font-medium">Download comprehensive curriculum CSVs (100 lessons/level).</p>
        </div>
      </div>

      <Card className="p-10 text-center space-y-8">
        <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-indigo-900">High-Volume Download</h2>
          <p className="text-indigo-700 mt-2 max-w-lg mx-auto">
            Generating <strong>172,000+ lessons</strong> requires splitting the download. 
            Download all 4 files and import them one by one into Supabase.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Button onClick={() => downloadBatch(1)} size="lg" className="h-24 text-lg shadow-xl bg-emerald-500 hover:bg-emerald-600 text-white border-none flex flex-col gap-1 items-center justify-center">
             <div className="flex items-center font-black"><Download className="w-5 h-5 mr-2" /> Part 1</div>
             <span className="text-xs font-medium opacity-90 bg-black/10 px-2 py-1 rounded-full">AU, NZ, US</span>
          </Button>

          <Button onClick={() => downloadBatch(2)} size="lg" className="h-24 text-lg shadow-xl bg-sky-500 hover:bg-sky-600 text-white border-none flex flex-col gap-1 items-center justify-center">
             <div className="flex items-center font-black"><Download className="w-5 h-5 mr-2" /> Part 2</div>
             <span className="text-xs font-medium opacity-90 bg-black/10 px-2 py-1 rounded-full">GB, CA, IN</span>
          </Button>

          <Button onClick={() => downloadBatch(3)} size="lg" className="h-24 text-lg shadow-xl bg-violet-500 hover:bg-violet-600 text-white border-none flex flex-col gap-1 items-center justify-center">
             <div className="flex items-center font-black"><Download className="w-5 h-5 mr-2" /> Part 3</div>
             <span className="text-xs font-medium opacity-90 bg-black/10 px-2 py-1 rounded-full">SG, ZA, IE</span>
          </Button>

          <Button onClick={() => downloadBatch(4)} size="lg" className="h-24 text-lg shadow-xl bg-rose-500 hover:bg-rose-600 text-white border-none flex flex-col gap-1 items-center justify-center">
             <div className="flex items-center font-black"><Download className="w-5 h-5 mr-2" /> Part 4</div>
             <span className="text-xs font-medium opacity-90 bg-black/10 px-2 py-1 rounded-full">AE, PH, INT</span>
          </Button>
        </div>

        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest border-t border-slate-100 pt-6">
          ~43,000 rows per file • 10 quiz questions per lesson
        </div>
      </Card>
    </PageMotion>
  );
}