"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { 
  FileSpreadsheet, Globe, Image as ImageIcon, Loader2, Mail, 
  Download, Eye, Search, BookOpen, CheckCircle2, ArrowLeft, 
  Sparkles, Database, Server, Wrench, AlertTriangle, Play, Trash2, FileText, Link as LinkIcon
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ... [Keep existing constants exactly as they were] ...
const COUNTRIES = [
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "IN", name: "India" },
  { code: "SG", name: "Singapore" },
  { code: "ZA", name: "South Africa" },
  { code: "IE", name: "Ireland" },
  { code: "AE", name: "UAE" },
  { code: "PH", name: "Philippines" },
  { code: "INT", name: "International" },
];

const SUBJECTS = [
  { id: "MATH", label: "Maths" },
  { id: "ENG", label: "English" },
  { id: "SCI", label: "Science" },
  { id: "HASS", label: "HASS" },
];

const BASE_STYLES = `
  body { margin: 0; padding: 0; font-family: 'Nunito', Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #1E293B; }
  .wrapper { width: 100%; table-layout: fixed; background-color: #F8FAFC; padding-bottom: 40px; }
  .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #E2E8F0; }
  .header { padding: 32px 0; text-align: center; background: radial-gradient(circle at center, #F1F5F9 0%, #FFFFFF 100%); border-bottom: 1px solid #F1F5F9; }
  .logo { font-size: 24px; font-weight: 900; color: #0F172A; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
  .logo span { color: #4F46E5; }
  .hero-img { width: 100%; max-height: 240px; object-fit: cover; background-color: #EEF2FF; display: block; }
  .content { padding: 40px 32px; }
  h1 { margin: 0 0 16px; font-size: 24px; font-weight: 800; color: #0F172A; line-height: 1.25; }
  p { margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569; }
  .btn-container { text-align: center; margin: 32px 0; }
  .btn { display: inline-block; background-color: #4F46E5; color: #ffffff; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 99px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); }
  .footer { text-align: center; padding: 24px; font-size: 12px; color: #94A3B8; }
  .footer a { color: #64748B; text-decoration: underline; }
`;

const TEMPLATES = {
  welcome: {
    name: "Welcome Aboard",
    subject: "Welcome to SmartKidz! 🚀",
    hero: "https://app.smartkidz.app/illustrations/scenes/home-hero.webp",
    body: `
      <h1>Let the adventure begin!</h1>
      <p>Hi there,</p>
      <p>Thanks for joining SmartKidz. You've just unlocked a world of calm, confidence-building learning for your family.</p>
      <p>To get started, we recommend setting up a profile for each child. It takes less than a minute and lets them earn their own rewards.</p>
    `,
    cta: "Setup Profiles",
    link: "https://app.smartkidz.app/app/onboarding"
  },
  receipt: {
    name: "Subscription Confirmed",
    subject: "You're all set! ✅",
    hero: "https://app.smartkidz.app/illustrations/app/rewards-header.webp",
    body: `
      <h1>Subscription Confirmed</h1>
      <p>Thank you! Your payment was successful and your account has been upgraded to <strong>Premium</strong>.</p>
      <p>You now have unlimited access to:</p>
      <ul>
        <li>All Year Levels (1–6)</li>
        <li>Writing & Reading Studios</li>
        <li>Parent Insights Dashboard</li>
      </ul>
    `,
    cta: "Go to Dashboard",
    link: "https://app.smartkidz.app/app"
  },
  report: {
    name: "Weekly Report",
    subject: "Weekly Report for [Child Name] 📊",
    hero: "https://app.smartkidz.app/illustrations/app/parent-analytics.webp",
    body: `
      <h1>Weekly Highlights</h1>
      <p>Here is a quick look at learning progress this week.</p>
      <div style="background:#F8FAFC; border-radius:16px; padding:24px; margin-bottom:24px; border:1px solid #E2E8F0;">
        <h3 style="margin-top:0;color:#0F172A;">Mathematics</h3>
        <p style="margin-bottom:0; font-size:14px;"><strong>3 Lessons</strong> completed with <strong>92%</strong> accuracy. Great work on <em>Fractions</em>!</p>
      </div>
      <p>Consistency is key. A short session today keeps the streak alive!</p>
    `,
    cta: "View Full Report",
    link: "https://app.smartkidz.app/app/parent/reports"
  },
  reset: {
    name: "Password Reset",
    subject: "Reset your password 🔒",
    hero: "", 
    body: `
      <h1>Reset Password</h1>
      <p>We received a request to reset the password for your SmartKidz account.</p>
      <p>If this was you, click the button below to choose a new password. If not, you can safely ignore this email.</p>
    `,
    cta: "Reset Password",
    link: "https://app.smartkidz.app/reset-password"
  },
  miss_you: {
    name: "We Miss You",
    subject: "Your pet misses you! 🐾",
    hero: "https://app.smartkidz.app/illustrations/app/lesson-intro.webp",
    body: `
      <h1>Ready to learn?</h1>
      <p>It's been a few days since we saw you! Your learning streak is waiting to be continued.</p>
      <p>We've added some new daily quests just for you. Come back and earn some coins!</p>
    `,
    cta: "Resume Journey",
    link: "https://app.smartkidz.app/app"
  }
};

function generateHtml(key) {
  const t = TEMPLATES[key];
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.subject}</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="main">
      <div class="header">
        <a href="https://app.smartkidz.app" class="logo">
          ✨ Smart<span>Kidz</span>
        </a>
      </div>
      ${t.hero ? '<img src="' + t.hero + '" alt="" class="hero-img" />' : ''}
      <div class="content">
        ${t.body}
        <div class="btn-container">
          <a href="${t.link}" class="btn">${t.cta}</a>
        </div>
        <p style="font-size:14px; color:#64748B;">Happy Learning,<br>The SmartKidz Team</p>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} SmartKidz. All rights reserved.</p>
      <p><a href="#">Unsubscribe</a> • <a href="#">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function ImportGuide() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl shadow-sm">
           <FileText className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">CSV Import Order</h2>
          <p className="text-sm text-slate-600">Strict sequence required for relational integrity.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="relative pl-8 border-l-2 border-indigo-200">
           <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-sm" />
           <h3 className="font-bold text-slate-900">1. Templates</h3>
           <p className="text-sm text-slate-600"><code>lesson_templates_out.csv</code></p>
           <p className="text-xs text-slate-400 mt-1">Defines the core lesson ID and Subject.</p>
        </div>
        <div className="relative pl-8 border-l-2 border-indigo-200">
           <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-sm" />
           <h3 className="font-bold text-slate-900">2. Editions</h3>
           <p className="text-sm text-slate-600"><code>lesson_editions_out.csv</code></p>
           <p className="text-xs text-slate-400 mt-1">Links templates to specific Country/Curriculum.</p>
        </div>
        <div className="relative pl-8 border-l-2 border-indigo-200">
           <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-sm" />
           <h3 className="font-bold text-slate-900">3. Content Items</h3>
           <p className="text-sm text-slate-600"><code>lesson_content_items_out.csv</code></p>
           <p className="text-xs text-slate-400 mt-1">The actual slides and activities.</p>
        </div>
        <div className="relative pl-8 border-l-2 border-slate-200">
           <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 border-4 border-white" />
           <h3 className="font-bold text-slate-900">4. Metadata Layers (Any Order)</h3>
           <ul className="text-sm text-slate-600 list-disc pl-4 mt-1 space-y-1">
             <li><code>content_item_pedagogy_out.csv</code></li>
             <li><code>content_item_gamification_out.csv</code></li>
             <li><code>content_item_accessibility_out.csv</code></li>
           </ul>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
         <Button onClick={() => window.open('/docs/IMPORT_ORDER.md', '_blank')} variant="outline">
            <Download className="w-4 h-4 mr-2" /> Download Full Guide
         </Button>
      </div>
    </div>
  );
}

export default function AdminGeneratePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("asset");
  const [assetToken, setAssetToken] = useState("skz-admin-8821");
  const [assetLimit, setAssetLimit] = useState(25);
  // Default to localhost forge
  const [forgeUrl, setForgeUrl] = useState("http://127.0.0.1:7860"); 
  const [assetStatus, setAssetStatus] = useState("idle");
  const [assetLogs, setAssetLogs] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("welcome");
  
  // Lesson Gen
  const [form, setForm] = useState({ topic: "Volcanoes", year: "3", subject: "SCI", locale: "Australia" });
  const [lessonStatus, setLessonStatus] = useState("idle");
  const [lessonResult, setLessonResult] = useState(null);

  // System Seeder
  const [systemStatus, setSystemStatus] = useState("idle");
  const [systemLogs, setSystemLogs] = useState([]);
  const [fullSetupStatus, setFullSetupStatus] = useState("idle");

  const downloadCountry = (code) => {
    window.location.href = `/api/setup/generate-csv?country=${code}`;
  };

  async function handleResetAssets(mode) {
    if (!confirm(`Are you sure you want to delete ALL generated ${mode} assets? This forces a re-scan.`)) return;
    setAssetStatus("scanning");
    setAssetLogs(prev => [...prev, `Resetting ${mode} assets...`]);
    try {
      const res = await fetch("/api/admin/reset-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: assetToken, mode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setAssetStatus("idle");
      setAssetLogs(prev => [...prev, data.message]);
    } catch (e) {
      setAssetStatus("error");
      setAssetLogs(prev => [...prev, `Error: ${e.message}`]);
    }
  }

  async function handleScanAssets(mode) {
    const label = mode === "lessons" ? "Lesson" : "System";
    setAssetStatus("scanning");
    setAssetLogs(prev => [...prev, `Scanning ${label} assets...`]);
    try {
      const res = await fetch("/api/admin/scan-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: assetToken, mode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setAssetStatus("idle");
      setAssetLogs(prev => [
        ...prev, 
        `[${label}] Scan Complete.`,
        `Scanned: ${data.scanned ?? 0}`,
        `Queued for Generation: ${data.queued ?? 0}`,
        data.message
      ]);
    } catch (e) {
      setAssetStatus("error");
      setAssetLogs(prev => [...prev, `Error: ${e.message}`]);
    }
  }

  async function handleGenerateAssets() {
    setAssetStatus("generating");
    setAssetLogs(prev => [...prev, "Connecting to Forge...", "Processing queue..."]);
    try {
      const res = await fetch("/api/admin/generate-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token: assetToken, 
          limit: Number(assetLimit), 
          sdUrl: forgeUrl // Pass the dynamic URL from UI
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setAssetStatus("success");
      setAssetLogs(prev => [
        ...prev, 
        `Processed: ${data.processed}`,
        `Provider: ${data.provider}`,
        ...(data.results || []).map(r => r.ok ? `✅ Generated: ${r.asset_id}` : `❌ Failed: ${r.asset_id} - ${r.error}`)
      ]);
    } catch (e) {
      setAssetStatus("error");
      setAssetLogs(prev => [...prev, `Error: ${e.message}`]);
    }
  }

  // ... [Other handlers preserved] ...
  async function handleGenerateLesson() {
    setLessonStatus("generating");
    try {
      const res = await fetch("/api/admin/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, year: Number(form.year), duration: 15 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setLessonResult(data);
      setLessonStatus("success");
    } catch (e) {
      setLessonStatus("error");
      alert(e.message);
    }
  }

  async function handleSeedSystem() {
    setSystemStatus("generating");
    setSystemLogs(prev => [...prev, "Starting system seed...", "Upserting curricula...", "Upserting badges...", "Generating skill tree..."]);
    try {
      const res = await fetch("/api/admin/seed-system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: assetToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Seed failed");
      setSystemStatus("success");
      setSystemLogs(prev => [
        ...prev,
        "✅ System Seed Complete!",
        `Curricula: ${data.stats.curricula}`,
        `Badges: ${data.stats.badges}`,
        `Skills: ${data.stats.skills}`
      ]);
    } catch (e) {
      setSystemStatus("error");
      setSystemLogs(prev => [...prev, `❌ Error: ${e.message}`]);
      throw e;
    }
  }

  async function handleFullSetup() {
    setFullSetupStatus("running");
    setSystemLogs(["🚀 Starting Full Setup Sequence...", "-----------------------------------"]);
    setAssetLogs([]);
    
    try {
      await handleSeedSystem();
      setSystemLogs(prev => [...prev, "Seeding lessons..."]);
      const res = await fetch("/api/admin/seed-lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: assetToken })
      });
      if (!res.ok) throw new Error("Lesson seed failed");
      
      setSystemLogs(prev => [...prev, "Running system asset scanner..."]);
      await handleScanAssets("system");
      setSystemLogs(prev => [...prev, "-----------------------------------", "✅ FULL SETUP COMPLETE. App is ready."]);
      setFullSetupStatus("idle");
    } catch (e) {
      setFullSetupStatus("error");
      setSystemLogs(prev => [...prev, "❌ SETUP ABORTED due to error."]);
    }
  }

  return (
    <PageMotion className="max-w-5xl mx-auto pb-20 pt-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/app/admin" className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Curriculum Factory</h1>
          <p className="text-slate-600 font-medium">Generate data for the platform.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        <button onClick={() => setActiveTab("asset")} className={`py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "asset" ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}>
            <div className="flex items-center justify-center gap-2"><ImageIcon className="w-4 h-4" /> Assets</div>
        </button>
        <button onClick={() => setActiveTab("repair")} className={`py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "repair" ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}>
            <div className="flex items-center justify-center gap-2"><Wrench className="w-4 h-4" /> Repair</div>
        </button>
        <button onClick={() => setActiveTab("system")} className={`py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "system" ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}>
            <div className="flex items-center justify-center gap-2"><Database className="w-4 h-4" /> System</div>
        </button>
        <button onClick={() => setActiveTab("lesson")} className={`py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "lesson" ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}>
            <div className="flex items-center justify-center gap-2"><BookOpen className="w-4 h-4" /> Lesson</div>
        </button>
        <button onClick={() => setActiveTab("csv")} className={`py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "csv" ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}>
            <div className="flex items-center justify-center gap-2"><FileSpreadsheet className="w-4 h-4" /> CSVs</div>
        </button>
        <button onClick={() => setActiveTab("email")} className={`py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "email" ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}>
            <div className="flex items-center justify-center gap-2"><Mail className="w-4 h-4" /> Email</div>
        </button>
      </div>
      
      <Card className="p-0 space-y-8 bg-white border-slate-200 overflow-hidden shadow-xl">

        {/* ASSET GENERATOR (Forge Only) */}
        {activeTab === "asset" && (
          <div className="p-8">
             <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8">
               <div className="flex items-start gap-4">
                 <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600 border border-indigo-100"><ImageIcon className="w-6 h-6" /></div>
                 <div>
                   <h3 className="font-bold text-lg text-slate-900">Asset Forge</h3>
                   <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                     Generates images using <strong>UI Forge (Stable Diffusion)</strong>.
                   </p>
                 </div>
               </div>
             </div>
             
             <div className="grid gap-6 max-w-xl mx-auto">
               <div className="grid md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Admin Token</span>
                    <input type="password" className="w-full mt-1 h-12 rounded-xl border border-slate-200 px-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={assetToken} onChange={e => setAssetToken(e.target.value)} />
                  </label>
                  
                  <label className="block">
                    <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Batch Limit</span>
                    <div className="flex items-center gap-4 mt-1">
                      <input type="range" min="1" max="50" step="1" className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" value={assetLimit} onChange={e => setAssetLimit(e.target.value)} />
                      <span className="font-bold text-slate-900 w-8 text-center">{assetLimit}</span>
                    </div>
                  </label>
               </div>

               <label className="block">
                 <span className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                   <LinkIcon className="w-3 h-3" /> Forge API URL
                 </span>
                 <input 
                   className="w-full mt-1 h-12 rounded-xl border border-slate-200 px-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400" 
                   value={forgeUrl} 
                   onChange={e => setForgeUrl(e.target.value)}
                   placeholder="http://127.0.0.1:7860"
                 />
                 <p className="text-xs text-slate-500 mt-1 ml-1">Run <code>python launch.py --api --listen</code> locally.</p>
               </label>
               
               <div className="grid gap-4 mt-4">
                 <div className="grid grid-cols-2 gap-4">
                   <Button onClick={() => handleScanAssets("system")} disabled={assetStatus === "generating" || assetStatus === "scanning" || !assetToken} variant="secondary" className="h-14 border-2">
                      <Search className="w-4 h-4 mr-2" /> Scan System
                   </Button>
                   <Button onClick={() => handleScanAssets("lessons")} disabled={assetStatus === "generating" || assetStatus === "scanning" || !assetToken} variant="secondary" className="h-14 border-2">
                      <Search className="w-4 h-4 mr-2" /> Scan Lessons
                   </Button>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <Button onClick={() => handleResetAssets("system")} disabled={assetStatus === "generating" || assetStatus === "scanning" || !assetToken} variant="ghost" className="h-10 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-100">
                      <Trash2 className="w-3 h-3 mr-2" /> Reset System
                   </Button>
                   <Button onClick={() => handleResetAssets("lessons")} disabled={assetStatus === "generating" || assetStatus === "scanning" || !assetToken} variant="ghost" className="h-10 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-100">
                      <Trash2 className="w-3 h-3 mr-2" /> Reset Lessons
                   </Button>
                 </div>
                 
                 <Button onClick={handleGenerateAssets} disabled={assetStatus === "generating" || assetStatus === "scanning" || !assetToken} className="h-16 text-xl shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                   {assetStatus === "generating" ? <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Generating Assets...</> : <><ImageIcon className="w-6 h-6 mr-3" /> Connect & Generate</>}
                 </Button>
               </div>
             </div>
             
             <div className="bg-slate-900 rounded-2xl p-5 font-mono text-xs text-emerald-400 min-h-[200px] max-h-[400px] overflow-y-auto shadow-inner mt-8">
                {assetLogs.length === 0 ? <span className="text-slate-600 opacity-50">// System ready. Scan to queue assets, then generate.</span> : assetLogs.map((l, i) => <div key={i} className="mb-1 border-b border-slate-800/50 pb-1 last:border-0 last:pb-0">&gt; {l}</div>)}
             </div>
          </div>
        )}

        {/* ... (Repair, System, Lesson, CSV, Email Tabs - kept same) ... */}
        {/* REPAIR TAB */}
        {activeTab === "repair" && (
          <div className="p-8">
             <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 text-amber-900 mb-8">
               <div className="flex items-start gap-4">
                 <div className="p-3 bg-white rounded-xl shadow-sm text-amber-600 border border-amber-100"><AlertTriangle className="w-6 h-6" /></div>
                 <div>
                   <h3 className="font-bold text-lg">Diagnostics & Repair</h3>
                   <p className="text-sm opacity-80 mt-1">If your app feels "empty", run <strong>Full Setup</strong> to hydrate the database.</p>
                 </div>
               </div>
             </div>

             <div className="grid gap-6 max-w-xl mx-auto">
               <label className="block">
                 <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Admin Token</span>
                 <input type="password" className="w-full mt-1 h-12 rounded-xl border border-slate-200 px-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20" value={assetToken} onChange={e => setAssetToken(e.target.value)} />
               </label>
               
               <div className="space-y-4">
                 <Button onClick={handleFullSetup} disabled={fullSetupStatus === "running" || !assetToken} className="w-full h-20 text-xl shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white border-none flex items-center justify-center">
                    {fullSetupStatus === "running" ? <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Running Setup...</> : <><Play className="w-6 h-6 mr-3 fill-current" /> Run Full Setup</>}
                 </Button>
               </div>
             </div>
             
             <div className="bg-slate-900 rounded-2xl p-5 font-mono text-xs text-emerald-400 min-h-[200px] max-h-[400px] overflow-y-auto shadow-inner mt-8">
                {systemLogs.length === 0 ? <span className="text-slate-600 opacity-50">// Logs will appear here...</span> : [...systemLogs].map((l, i) => <div key={i} className="mb-1 border-b border-slate-800/50 pb-1 last:border-0 last:pb-0">&gt; {l}</div>)}
             </div>
          </div>
        )}

        {/* SYSTEM SEEDER */}
        {activeTab === "system" && (
          <div className="p-8">
            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 text-emerald-900 mb-8">
              <div className="flex items-start gap-4">
                 <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-600 border border-emerald-100"><Server className="w-6 h-6" /></div>
                 <div>
                   <h3 className="font-bold text-lg">System Data Seeder</h3>
                   <p className="text-sm opacity-80 mt-1">Run this to ensure `skills`, `badges` and `curricula` are populated.</p>
                 </div>
               </div>
            </div>
            <div className="max-w-xl mx-auto space-y-6">
               <Button onClick={handleSeedSystem} disabled={systemStatus === "generating" || !assetToken} className="w-full h-14 text-lg shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white">
                   {systemStatus === "generating" ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Seeding...</> : <><Database className="w-5 h-5 mr-2" /> Seed System Data</>}
               </Button>
            </div>
            <div className="bg-slate-900 rounded-2xl p-5 font-mono text-xs text-emerald-400 min-h-[200px] max-h-[400px] overflow-y-auto shadow-inner mt-8">
                {systemLogs.map((l, i) => <div key={i} className="mb-1 border-b border-slate-800/50 pb-1 last:border-0 last:pb-0">&gt; {l}</div>)}
             </div>
          </div>
        )}

        {/* LESSON GENERATOR */}
        {activeTab === "lesson" && (
            <div className="p-8 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                   <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Topic</span>
                   <input 
                     className="w-full mt-1 h-12 rounded-xl border border-slate-200 px-4 font-bold text-slate-900"
                     value={form.topic}
                     onChange={e => setForm({...form, topic: e.target.value})}
                   />
                </label>
                <label className="block">
                   <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Year Level</span>
                   <select 
                     className="w-full mt-1 h-12 rounded-xl border border-slate-200 px-4 font-bold text-slate-900 bg-white"
                     value={form.year}
                     onChange={e => setForm({...form, year: e.target.value})}
                   >
                     {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                   </select>
                </label>
                <label className="block">
                   <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Subject</span>
                   <select 
                     className="w-full mt-1 h-12 rounded-xl border border-slate-200 px-4 font-bold text-slate-900 bg-white"
                     value={form.subject}
                     onChange={e => setForm({...form, subject: e.target.value})}
                   >
                     {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                   </select>
                </label>
                <label className="block">
                   <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Locale</span>
                   <select 
                     className="w-full mt-1 h-12 rounded-xl border border-slate-200 px-4 font-bold text-slate-900 bg-white"
                     value={form.locale}
                     onChange={e => setForm({...form, locale: e.target.value})}
                   >
                     <option value="Australia">Australia</option>
                     <option value="United States">USA</option>
                     <option value="United Kingdom">UK</option>
                   </select>
                </label>
              </div>

              {lessonStatus === "success" ? (
                 <div className="flex gap-3">
                   <Button onClick={() => setLessonStatus("idle")} variant="secondary" className="flex-1">Create Another</Button>
                   <Button onClick={() => router.push(`/app/lesson/${lessonResult.lessonId}`)} className="flex-1">
                     <CheckCircle2 className="w-5 h-5 mr-2" /> View Lesson
                   </Button>
                 </div>
              ) : (
                 <Button onClick={handleGenerateLesson} disabled={lessonStatus === "generating"} className="w-full h-14 text-lg shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white">
                   {lessonStatus === "generating" ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5 mr-2" /> Generate Lesson</>}
                 </Button>
              )}
            </div>
        )}

        {/* CSV DOWNLOADS */}
        {activeTab === "csv" && (
          <div className="p-8">
            <ImportGuide />
            <div className="h-8" /> 
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 text-amber-900 mb-8">
               <h3 className="font-bold text-lg mb-2">Generate & Download CSVs</h3>
               <ul className="list-disc pl-5 space-y-1 text-sm">
                 <li>These buttons trigger the new <strong>Rich Curriculum</strong> engine.</li>
                 <li>Includes High School years (7-12) for applicable countries.</li>
               </ul>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {COUNTRIES.map((c) => (
                 <Button key={c.code} onClick={() => downloadCountry(c.code)} variant="secondary" className="h-20 text-left justify-start px-6 hover:bg-slate-50 border-2">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                         <Globe className="w-5 h-5" />
                      </div>
                      <div>
                         <div className="font-black text-slate-900">{c.name}</div>
                         <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Download</div>
                      </div>
                   </div>
                 </Button>
               ))}
            </div>
          </div>
        )}
        
        {/* EMAIL TAB */}
        {activeTab === "email" && (
            <div className="grid md:grid-cols-[250px_1fr]">
              <div className="bg-slate-50 border-r border-slate-200 p-4 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Templates</div>
                {Object.keys(TEMPLATES).map(key => (
                  <button key={key} onClick={() => setSelectedEmail(key)} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${selectedEmail === key ? "bg-indigo-600 text-white shadow-md" : "hover:bg-white hover:shadow-sm text-slate-600"}`}>{TEMPLATES[key].name}</button>
                ))}
              </div>
              <div className="p-6 bg-slate-100">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-500 flex items-center gap-2"><Eye className="w-4 h-4" /> Live Preview</div>
                  <Button onClick={downloadEmail} size="sm" className="shadow-lg"><Download className="w-4 h-4 mr-2" /> Download HTML</Button>
                </div>
                <div className="rounded-2xl shadow-xl overflow-hidden border border-slate-200 bg-white">
                  <div className="bg-slate-800 text-white text-xs px-4 py-2 flex justify-between items-center">
                    <span>Subject: {TEMPLATES[selectedEmail].subject}</span>
                    <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /></div>
                  </div>
                  <iframe srcDoc={generateHtml(selectedEmail)} className="w-full h-[500px] bg-slate-50" title="Email Preview" />
                </div>
              </div>
            </div>
          )}

      </Card>
    </PageMotion>
  );
}