"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Download, FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react";

// --- CLIENT-SIDE GENERATION CONFIG ---

const YEARS = [1, 2, 3, 4, 5, 6];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LESSONS_PER_LEVEL = 50; 

const COUNTRIES = {
  AU: { name: "Australia", term: "Year", math: "Maths", hass: "HASS" },
  NZ: { name: "New Zealand", term: "Year", math: "Maths", hass: "Social Sciences" },
  US: { name: "United States", term: "Grade", math: "Math", hass: "Social Studies" },
  GB: { name: "United Kingdom", term: "Year", math: "Maths", hass: "Humanities" },
  CA: { name: "Canada", term: "Grade", math: "Math", hass: "Social Studies" },
  IN: { name: "India", term: "Class", math: "Maths", hass: "Social Science" },
  SG: { name: "Singapore", term: "Primary", math: "Maths", hass: "Social Studies" },
  ZA: { name: "South Africa", term: "Grade", math: "Maths", hass: "Social Sciences" },
  IE: { name: "Ireland", term: "Class", math: "Maths", hass: "SESE" },
  AE: { name: "UAE", term: "Grade", math: "Math", hass: "Social Studies" },
  PH: { name: "Philippines", term: "Grade", math: "Math", hass: "Araling Panlipunan" },
  INT: { name: "International", term: "Grade", math: "Mathematics", hass: "Humanities" },
};

const ALL_COUNTRY_CODES = Object.keys(COUNTRIES);

const SUBJECT_NAMES = {
  MATH: 'Mathematics',
  ENG: 'English',
  SCI: 'Science',
  HASS: 'HASS',
  HPE: 'Health & PE',
  ART: 'The Arts',
  TECH: 'Technologies',
  LANG: 'Languages'
};

// Simplified generic topic list for client-side speed
// (In a real app, you'd import the full matrix from a shared lib)
function getTopic(subjectId, i) {
    const topics = {
        MATH: ["Numbers", "Algebra", "Geometry", "Data", "Measurement"],
        ENG: ["Phonics", "Reading", "Writing", "Grammar", "Speaking"],
        SCI: ["Biology", "Chemistry", "Physics", "Earth", "Space"],
        HASS: ["History", "Geography", "Civics", "Economics", "Culture"],
        HPE: ["Health", "Safety", "Movement", "Sports", "Wellbeing"],
        ART: ["Visual Arts", "Music", "Drama", "Dance", "Media"],
        TECH: ["Digital Systems", "Coding", "Data", "Design", "Robotics"],
        LANG: ["Greetings", "Family", "Food", "Travel", "School"]
    };
    const list = topics[subjectId] || ["General"];
    return list[i % list.length];
}

function escapeCsv(field) {
  if (field == null) return '';
  const s = String(field);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function generateContent(countryCode, subjectName, topic, year, level) {
  const config = COUNTRIES[countryCode] || COUNTRIES.INT;
  const gradeLabel = `${config.term} ${year}`;
  
  // Richer JSON structure
  return JSON.stringify({
    duration_minutes: 15,
    objective: `${level}: ${topic} for ${gradeLabel}.`,
    explanation: `This lesson covers key ideas in **${topic}** for ${config.name} students.`,
    real_world_application: `We see ${topic} in the world around us.`,
    memory_strategies: [`Link ${topic} to something you know`, `Practice makes perfect`],
    worked_example: `Here is how we solve a ${level} problem in ${topic}...`,
    scenarios: [{ context: `A real-life situation involving ${topic}.`, questions: [{ prompt: "What would you do?", answer: "Apply the concept." }] }],
    // Rich Activities Array (New Schema)
    activities: [
       {
         id: "act_1",
         type: "visual_observe",
         title: "Observation",
         prompt: `Look closely at the concept of ${topic}. What do you notice?`,
         expected_seconds: 60,
         input: { kind: "free_text" }
       },
       {
         id: "act_2",
         type: "count_and_type",
         title: "Practice",
         prompt: `Solve a ${level} problem about ${topic}.`,
         expected_seconds: 120,
         input: { kind: "numeric_entry" }
       },
       {
         id: "act_3",
         type: "reflection",
         title: "Reflection",
         prompt: "How would you explain this rule to a friend?",
         expected_seconds: 90,
         input: { kind: "free_text" }
       }
    ]
  });
}

export default function GeneratePage() {
  const [processing, setProcessing] = useState(null); // 1, 2, 3, 4
  const [progress, setProgress] = useState(0);

  const generateBatch = async (batchNum) => {
    setProcessing(batchNum);
    setProgress(0);

    // Give UI a moment to update
    await new Promise(r => setTimeout(r, 50));

    let targetCountries = ALL_COUNTRY_CODES;
    let filename = "smartkidz_lessons_full.csv";

    if (batchNum === 1) {
      targetCountries = ALL_COUNTRY_CODES.slice(0, 3); // AU, NZ, US
      filename = "smartkidz_lessons_part1_AU_NZ_US.csv";
    } else if (batchNum === 2) {
      targetCountries = ALL_COUNTRY_CODES.slice(3, 6);
      filename = "smartkidz_lessons_part2_GB_CA_IN.csv";
    } else if (batchNum === 3) {
      targetCountries = ALL_COUNTRY_CODES.slice(6, 9);
      filename = "smartkidz_lessons_part3_SG_ZA_IE.csv";
    } else if (batchNum === 4) {
      targetCountries = ALL_COUNTRY_CODES.slice(9, 12);
      filename = "smartkidz_lessons_part4_AE_PH_INT.csv";
    }

    const rows = [];
    rows.push('id,country,year_level,subject_id,title,topic,curriculum_tags,content_json,created_at,updated_at');
    
    const now = new Date().toISOString();
    const subjectIds = Object.keys(SUBJECT_NAMES);
    const totalSteps = targetCountries.length * subjectIds.length * YEARS.length;
    let stepsDone = 0;

    // Chunking to prevent UI freeze
    const CHUNK_SIZE = 5; 

    for (const country of targetCountries) {
        const config = COUNTRIES[country];
        for (const subjId of subjectIds) {
            let localizedSubject = SUBJECT_NAMES[subjId];
            if (subjId === "MATH") localizedSubject = config.math; 
            if (subjId === "HASS") localizedSubject = config.hass;

            for (const year of YEARS) {
                // Yield to main thread to update progress bar
                if (stepsDone % CHUNK_SIZE === 0) {
                    setProgress(Math.round((stepsDone / totalSteps) * 100));
                    await new Promise(r => setTimeout(r, 0));
                }

                for (const level of LEVELS) {
                    for (let i = 1; i <= LESSONS_PER_LEVEL; i++) {
                        const paddedI = i.toString().padStart(3, '0');
                        const levelCode = level.substring(0, 3).toUpperCase();
                        const id = `${country}_${subjId}_Y${year}_${levelCode}_${paddedI}`;
                        
                        const topic = getTopic(subjId, i - 1);
                        const title = `${topic}: ${level} Mission ${i}`;
                        const tagPrefix = country === 'US' ? 'CCSS' : country === 'GB' ? 'NC' : country === 'AU' ? 'AC9' : country;
                        const tag = `${tagPrefix}_${subjId}_${config.term.charAt(0)}${year}_${levelCode}${i}`; 
                        
                        const content = generateContent(country, localizedSubject, topic, year, level);

                        const row = [
                            escapeCsv(id),
                            escapeCsv(country),
                            escapeCsv(year),
                            escapeCsv(subjId),
                            escapeCsv(title),
                            escapeCsv(topic),
                            escapeCsv(`{${tag}}`), 
                            escapeCsv(content),
                            escapeCsv(now),
                            escapeCsv(now)
                        ].join(',');
                        
                        rows.push(row);
                    }
                }
                stepsDone++;
            }
        }
    }

    // Trigger Download
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setProcessing(null);
    setProgress(0);
  };

  return (
    <PageMotion className="max-w-4xl mx-auto pb-20 pt-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Massive Lesson Generator</h1>
          <p className="text-slate-600 font-medium">Generate comprehensive curriculum CSVs directly in your browser.</p>
        </div>
      </div>

      <Card className="p-10 text-center space-y-8">
        <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-indigo-900">Client-Side Generator</h2>
          <p className="text-indigo-700 mt-2 max-w-lg mx-auto">
            Generating <strong>~43,000 lessons</strong> per batch. <br/>
            This runs entirely on your device. Please wait a moment after clicking.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
             { b: 1, label: "Part 1", sub: "AU, NZ, US", color: "bg-emerald-500 hover:bg-emerald-600" },
             { b: 2, label: "Part 2", sub: "GB, CA, IN", color: "bg-sky-500 hover:bg-sky-600" },
             { b: 3, label: "Part 3", sub: "SG, ZA, IE", color: "bg-violet-500 hover:bg-violet-600" },
             { b: 4, label: "Part 4", sub: "AE, PH, INT", color: "bg-rose-500 hover:bg-rose-600" },
          ].map(item => (
              <Button 
                key={item.b}
                onClick={() => generateBatch(item.b)} 
                disabled={processing !== null}
                size="lg" 
                className={`h-24 text-lg shadow-xl text-white border-none flex flex-col gap-1 items-center justify-center ${item.color} ${processing === item.b ? "opacity-100 ring-4 ring-offset-2 ring-indigo-500" : "opacity-100"}`}
              >
                 {processing === item.b ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin mb-1" />
                      <div className="text-sm font-bold">Generating... {progress}%</div>
                    </>
                 ) : (
                    <>
                      <div className="flex items-center font-black"><Download className="w-5 h-5 mr-2" /> {item.label}</div>
                      <span className="text-xs font-medium opacity-90 bg-black/10 px-2 py-1 rounded-full">{item.sub}</span>
                    </>
                 )}
              </Button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest border-t border-slate-100 pt-6">
          Files are generated instantly. No server limits.
        </div>
      </Card>
    </PageMotion>
  );
}