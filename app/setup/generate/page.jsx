"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Download, FileSpreadsheet } from "lucide-react";

export default function GeneratePage() {
  const downloadPart1 = () => {
    window.location.href = "/api/setup/generate-csv?batch=1";
  };

  const downloadPart2 = () => {
    window.location.href = "/api/setup/generate-csv?batch=2";
  };

  return (
    <PageMotion className="max-w-3xl mx-auto pb-20 pt-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Lesson Generator (Full)</h1>
          <p className="text-slate-600 font-medium">Download comprehensive global curriculum CSVs.</p>
        </div>
      </div>

      <Card className="p-10 text-center space-y-8">
        <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-indigo-900">Split Downloads</h2>
          <p className="text-indigo-700 mt-2 max-w-sm mx-auto">
            We've split the 86,000+ lessons into two files for reliable downloading and importing.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Button onClick={downloadPart1} size="lg" className="h-20 text-lg shadow-xl bg-emerald-500 hover:bg-emerald-600 text-white border-none flex flex-col gap-1">
             <div className="flex items-center"><Download className="w-5 h-5 mr-2" /> Download Part 1</div>
             <span className="text-xs font-normal opacity-80">AU, NZ, US, GB, CA, IN</span>
          </Button>

          <Button onClick={downloadPart2} size="lg" className="h-20 text-lg shadow-xl bg-sky-500 hover:bg-sky-600 text-white border-none flex flex-col gap-1">
             <div className="flex items-center"><Download className="w-5 h-5 mr-2" /> Download Part 2</div>
             <span className="text-xs font-normal opacity-80">SG, ZA, IE, AE, PH, INT</span>
          </Button>
        </div>

        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          ~43,000 rows per file • Import both to Supabase
        </div>
      </Card>
    </PageMotion>
  );
}