"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Download, Loader2, CheckCircle2, FileSpreadsheet } from "lucide-react";

// --- Configuration ---

const YEARS = [1, 2, 3, 4, 5, 6];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LESSONS_PER_LEVEL = 50; 

const SUBJECTS = {
  MATH: { name: 'Mathematics', topics: ['Number', 'Algebra', 'Geometry', 'Statistics', 'Measurement'] },
  ENG: { name: 'English', topics: ['Phonics', 'Spelling', 'Grammar', 'Reading', 'Writing'] },
  SCI: { name: 'Science', topics: ['Biology', 'Chemistry', 'Earth', 'Physics', 'Inquiry'] },
  HASS: { name: 'HASS', topics: ['History', 'Geography', 'Civics', 'Community'] },
  HPE: { name: 'Health', topics: ['Health', 'Safety', 'Active Living', 'Movement'] },
  ART: { name: 'Arts', topics: ['Visual Arts', 'Music', 'Drama', 'Dance'] },
  TECH: { name: 'Tech', topics: ['Digital Systems', 'Data', 'Coding', 'Design'] },
  LANG: { name: 'Languages', topics: ['Greetings', 'Culture', 'Vocabulary', 'Phrases'] }
};

function escapeCsv(field) {
  if (field == null) return '';
  const s = String(field);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function generateContent(subject, topic, year, level) {
  return {
    duration_minutes: 15,
    objective: `Learn ${topic} concepts at ${level} level.`,
    explanation: `This lesson covers key ideas in ${topic}.`,
    real_world_application: `You use this when exploring ${topic} in real life.`,
    memory_strategies: [`Remember the keyword: ${topic}`],
    worked_example: `Example: Applying ${topic} rules step-by-step.`,
    scenarios: [{ context: `Scenario about ${topic}`, questions: [{ prompt: "What do you do?", answer: "Apply the rule." }] }],
    quiz: Array.from({ length: 5 }).map((_, i) => ({
      question: `Question ${i+1} about ${topic}?`,
      options: ["Correct Answer", "Wrong A", "Wrong B"],
      answer: "Correct Answer",
      explanation: "This is correct because..."
    }))
  };
}

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setProgress(0);
    setComplete(false);
    setBlobUrl(null);

    setTimeout(async () => {
      const rows = [];
      rows.push(['id', 'year_level', 'subject_id', 'title', 'topic', 'curriculum_tags', 'content_json', 'created_at', 'updated_at'].join(','));

      const subjects = Object.keys(SUBJECTS);
      const totalSteps = subjects.length * YEARS.length * LEVELS.length;
      let currentStep = 0;
      const now = new Date().toISOString();

      for (const subjId of subjects) {
        const subjectData = SUBJECTS[subjId];
        for (const year of YEARS) {
          for (const level of LEVELS) {
            for (let i = 1; i <= LESSONS_PER_LEVEL; i++) {
              const paddedI = i.toString().padStart(3, '0');
              const levelCode = level.substring(0, 3).toUpperCase();
              const id = `${subjId}_Y${year}_${levelCode}_${paddedI}`;
              const topic = subjectData.topics[(i - 1) % subjectData.topics.length];
              const title = `${topic}: ${level} Mission ${i}`;
              const tag = `AC9${subjId.charAt(0)}${year}${levelCode}${i}`; 
              const content = generateContent(subjectData.name, topic, year, level);

              rows.push([
                id, year, subjId,
                escapeCsv(title), escapeCsv(topic),
                `"{${tag}}"`, 
                escapeCsv(JSON.stringify(content)),
                now, now
              ].join(','));
            }
            currentStep++;
            if (currentStep % 10 === 0) {
                setProgress(Math.round((currentStep / totalSteps) * 100));
                await new Promise(r => setTimeout(r, 0)); // Yield UI
            }
          }
        }
      }

      const csvContent = rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      setBlobUrl(URL.createObjectURL(blob));
      setComplete(true);
      setLoading(false);
    }, 100);
  };

  return (
    <PageMotion className="max-w-3xl mx-auto pb-20 pt-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Public Lesson Generator</h1>
          <p className="text-slate-600 font-medium">Setup tool: Generate bulk data for import.</p>
        </div>
      </div>
      <Card className="p-8 space-y-8">
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-sm text-slate-600">
          <p><strong>Step 1:</strong> Click Generate to build the CSV file (browser-side).</p>
          <p><strong>Step 2:</strong> Click Download when ready.</p>
          <p><strong>Step 3:</strong> Upload to Supabase 'lessons' table (Table Editor -&gt; Insert -&gt; Import CSV).</p>
        </div>

        {loading && (
          <div className="space-y-3">
             <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
               <span>Building...</span><span>{progress}%</span>
             </div>
             <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }} />
             </div>
          </div>
        )}

        {!loading && !complete && (
          <Button onClick={handleGenerate} size="lg" className="w-full h-16 text-lg shadow-xl">
             <Sparkles className="w-5 h-5 mr-2" /> Generate Lessons CSV
          </Button>
        )}

        {complete && blobUrl && (
          <a href={blobUrl} download="smartkidz_lessons.csv" className="flex items-center justify-center w-full h-16 rounded-2xl bg-emerald-500 text-white text-lg font-bold shadow-lg hover:bg-emerald-600 transition-all">
             <Download className="w-6 h-6 mr-2" /> Download CSV
          </a>
        )}
      </Card>
    </PageMotion>
  );
}