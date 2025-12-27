"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Download, FileSpreadsheet } from "lucide-react";

export default function GeneratePage() {
  const downloadDirect = () => {
    // Triggers the server-side stream
    window.location.href = "/api/setup/generate-csv";
  };

  return (
    <PageMotion className="max-w-3xl mx-auto pb-20 pt-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Lesson Generator (Full)</h1>
          <p className="text-slate-600 font-medium">Download the comprehensive lesson CSV.</p>
        </div>
      </div>

      <Card className="p-10 text-center space-y-8">
        <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-indigo-900">Ready to Download</h2>
          <p className="text-indigo-700 mt-2 max-w-sm mx-auto">
            This will download <strong>smartkidz_lessons_full.csv</strong> (~14,400 lessons).
            <br/><br/>
            <span className="text-xs uppercase font-bold tracking-wider opacity-70">
              File size: approx 15-20MB
            </span>
          </p>
        </div>

        <Button onClick={downloadDirect} size="lg" className="w-full h-16 text-lg shadow-xl bg-emerald-500 hover:bg-emerald-600 text-white border-none">
           <Download className="w-6 h-6 mr-3" /> Download Full CSV
        </Button>

        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          Server-side streaming • 14,400 rows
        </div>
      </Card>
    </PageMotion>
  );
}