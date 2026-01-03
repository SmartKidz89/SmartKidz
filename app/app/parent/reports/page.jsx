"use client";

import { useState } from "react";
import Link from "next/link";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Mail, CheckCircle, BarChart3, Calendar } from "lucide-react";

export default function ReportsPage() {
  const [enabled, setEnabled] = useState(true);

  return (
    <PageMotion className="max-w-4xl mx-auto pb-20 pt-8">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/app/parent" className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Email Reports</h1>
          <p className="text-slate-600 font-medium">Manage your weekly learning summaries.</p>
        </div>
      </div>

      <div className="grid gap-6">
        
        {/* Settings Card */}
        <Card className="p-6 flex items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
               <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg text-slate-900">Weekly Summary</div>
              <div className="text-slate-500 text-sm">Sent every Monday morning.</div>
            </div>
          </div>
          
          <button 
            onClick={() => setEnabled(!enabled)}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${enabled ? "bg-emerald-500" : "bg-slate-200"}`}
          >
            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </Card>

        {/* Report Preview */}
        <div className="grid md:grid-cols-2 gap-6">
           <Card className="p-6 bg-slate-50 border-slate-200">
              <div className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <BarChart3 className="w-5 h-5 text-slate-500" /> Report Preview
              </div>
              
              {/* Mock Email UI */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                 <div className="border-b border-slate-100 pb-4">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</div>
                    <div className="font-bold text-slate-900">SmartKidz Weekly Report: Olivia</div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="text-sm text-slate-600">Hi Parent,</div>
                    <div className="text-sm text-slate-600">Here's how Olivia did this week!</div>
                    
                    <div className="flex gap-2">
                       <div className="flex-1 bg-indigo-50 p-3 rounded-lg text-center">
                          <div className="text-lg font-black text-indigo-600">45m</div>
                          <div className="text-[10px] font-bold text-indigo-400 uppercase">Time</div>
                       </div>
                       <div className="flex-1 bg-emerald-50 p-3 rounded-lg text-center">
                          <div className="text-lg font-black text-emerald-600">12</div>
                          <div className="text-[10px] font-bold text-emerald-400 uppercase">Lessons</div>
                       </div>
                    </div>
                    
                    <div className="text-xs text-slate-400 text-center pt-2">View full details in dashboard</div>
                 </div>
              </div>
           </Card>

           <Card className="p-6">
              <div className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <Calendar className="w-5 h-5 text-slate-500" /> History
              </div>
              <div className="space-y-3">
                 {[1,2,3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                             <Mail className="w-4 h-4" />
                          </div>
                          <div>
                             <div className="text-sm font-bold text-slate-900">Weekly Summary</div>
                             <div className="text-xs text-slate-500">Oct {24 - (i * 7)}, 2023</div>
                          </div>
                       </div>
                       <div className="text-emerald-500">
                          <CheckCircle className="w-4 h-4" />
                       </div>
                    </div>
                 ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-xs">Load More</Button>
           </Card>
        </div>

      </div>
    </PageMotion>
  );
}