"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Download, Loader2, CheckCircle2, FileSpreadsheet } from "lucide-react";

// --- Configuration ---

const YEARS = [1, 2, 3, 4, 5, 6];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LESSONS_PER_LEVEL = 100; // 100 per level = 300 per year per subject

const SUBJECTS = {
  MATH: {
    name: 'Mathematics',
    topics: [
      'Number and Place Value', 'Patterns and Algebra', 'Fractions and Decimals',
      'Money and Finance', 'Shape and Geometry', 'Location and Transformation',
      'Units of Measurement', 'Time', 'Chance', 'Data Representation'
    ]
  },
  ENG: {
    name: 'English',
    topics: [
      'Phonics and Word Knowledge', 'Spelling Rules', 'Grammar and Punctuation',
      'Reading Fluency', 'Comprehension Strategies', 'Types of Texts',
      'Narrative Writing', 'Persuasive Writing', 'Poetry', 'Visual Literacy'
    ]
  },
  SCI: {
    name: 'Science',
    topics: [
      'Biological Sciences (Living Things)', 'Chemical Sciences (Materials)',
      'Earth and Space Sciences', 'Physical Sciences (Energy & Force)',
      'Scientific Inquiry', 'Fair Testing', 'Data Analysis'
    ]
  },
  HASS: {
    name: 'HASS',
    topics: [
      'History: First Nations', 'History: World Exploration', 'Geography: Places',
      'Geography: Maps', 'Civics and Citizenship', 'Economics and Business',
      'Community and Culture', 'Sustainability'
    ]
  },
  HPE: {
    name: 'Health & PE',
    topics: [
      'Personal Health', 'Safety and Risk', 'Active Living', 'Movement Skills',
      'Teamwork and Fair Play', 'Nutrition', 'Mental Wellbeing', 'Relationships'
    ]
  },
  ART: {
    name: 'The Arts',
    topics: [
      'Visual Arts: Techniques', 'Visual Arts: Colour Theory', 'Music: Rhythm and Beat',
      'Music: Pitch and Melody', 'Drama: Role and Character', 'Dance: Movement',
      'Media Arts: Storytelling'
    ]
  },
  TECH: {
    name: 'Technologies',
    topics: [
      'Digital Systems', 'Data Representation', 'Algorithms (Coding)',
      'Design Thinking', 'Materials and Tools', 'Food and Fibre Production'
    ]
  },
  LANG: {
    name: 'Languages',
    topics: [
      'Greetings and Introductions', 'Family and Friends', 'Numbers and Counting',
      'Food and Drink', 'School and Hobbies', 'Time and Weather',
      'Cultural Traditions', 'Travel'
    ]
  }
};

// --- Generators ---

function escapeCsv(field) {
  if (field == null) return '';
  const s = String(field);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function generateQuiz(subject, topic, level, count = 15) {
  return Array.from({ length: count }).map((_, i) => ({
    question: `${level} Question ${i + 1} about ${topic}: What is the correct approach?`,
    options: [
      `The correct answer for ${topic} (${level})`,
      `A common misconception about ${topic}`,
      `An unrelated fact`,
      `A plausible but wrong answer`
    ],
    answer: `The correct answer for ${topic} (${level})`,
    explanation: `For ${level} level understanding of ${topic}, this is the correct choice because it follows the core rule.`
  }));
}

function generateLessonContent(subject, topic, year, level) {
  const isAdv = level === 'Advanced';
  const isBeg = level === 'Beginner';
  
  const complexity = isBeg ? "fundamental" : isAdv ? "complex" : "core";
  const action = isBeg ? "identify" : isAdv ? "analyse" : "apply";

  return {
    duration_minutes: 15,
    objective: `Students will learn to ${action} ${complexity} concepts related to ${topic}.`,
    
    explanation: `**Welcome to ${topic}!**\n\nIn this ${level} lesson, we are exploring the ${complexity} rules of ${topic}.\n\n1. **Concept**: Ideally, we focus on how ${topic} works in the real world.\n2. **Process**: To solve problems in this area, first check your inputs, then apply the rule.\n3. **Key Terminology**: Remember the word "Variable" implies change, while "Constant" implies staying the same.\n\n*Tip*: ${isAdv ? "Look out for exceptions to the rule." : "Take your time and double-check."}`,

    real_world_application: `You can see ${topic} in action when you are ${isBeg ? 'shopping or playing' : 'planning a project or building something'}.`,
    
    memory_strategies: [
      `Keyword Association: Link ${topic} with the word "${isBeg ? 'Start' : 'Build'}".`,
      `Visualization: Picture a ${isBeg ? 'simple box' : 'complex machine'} when thinking about this.`
    ],

    worked_example: `**Problem**: How do we apply ${topic}?\n**Step 1**: Identify the key parts.\n**Step 2**: Apply the ${level} rule.\n**Solution**: The result shows how ${topic} functions correctly.`,

    scenarios: [
      {
        context: `Imagine you are explaining ${topic} to a friend.`,
        questions: [
          { prompt: "What is the most important rule?", answer: "The core rule defined above." },
          { prompt: "What happens if you reverse it?", answer: "It usually breaks the pattern." }
        ]
      }
    ],

    quiz: generateQuiz(subject, topic, level, 15) // 15 Questions
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

    // Use setTimeout to allow UI to update
    setTimeout(async () => {
      const rows = [];
      rows.push(['id', 'year_level', 'subject_id', 'title', 'topic', 'curriculum_tags', 'content_json'].join(','));

      const subjects = Object.keys(SUBJECTS);
      const totalSteps = subjects.length * YEARS.length * LEVELS.length;
      let currentStep = 0;

      for (const subjId of subjects) {
        const subjectData = SUBJECTS[subjId];
        
        for (const year of YEARS) {
          for (const level of LEVELS) {
            
            // Generate batch of 100 lessons
            for (let i = 1; i <= LESSONS_PER_LEVEL; i++) {
              const paddedI = i.toString().padStart(3, '0');
              const levelCode = level.substring(0, 3).toUpperCase();
              
              // ID Format: MATH_Y1_BEG_001
              const id = `${subjId}_Y${year}_${levelCode}_${paddedI}`;
              
              // Topic Rotation
              const topic = subjectData.topics[(i - 1) % subjectData.topics.length];
              
              const title = `${topic}: ${level} Mission ${i}`;
              const tag = `AC9${subjId.charAt(0)}${year}${levelCode}${i}`; 
              const content = generateLessonContent(subjectData.name, topic, year, level);

              rows.push([
                id,
                year,
                subjId,
                escapeCsv(title),
                escapeCsv(topic),
                `"{${tag}}"`, 
                escapeCsv(JSON.stringify(content))
              ].join(','));
            }

            currentStep++;
            // Update progress every few steps to avoid too many re-renders
            if (currentStep % 5 === 0) setProgress(Math.round((currentStep / totalSteps) * 100));
            
            // Yield to main thread briefly
            await new Promise(r => setTimeout(r, 0));
          }
        }
      }

      const csvContent = rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      setBlobUrl(url);
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Lesson Generator</h1>
          <p className="text-slate-600 font-medium">Create 14,000+ detailed lessons for database import.</p>
        </div>
      </div>

      <Card className="p-8 space-y-8">
        
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-sm text-slate-600 space-y-2">
          <p><strong className="text-slate-900">What this does:</strong> Generates a CSV file containing ~14,400 lessons covering all subjects, years 1-6, and difficulty levels.</p>
          <p><strong className="text-slate-900">Format:</strong> Includes title, topic, curriculum tags, and rich JSON content (15-min duration structure).</p>
          <p><strong className="text-slate-900">Next Step:</strong> Upload the downloaded CSV to your Supabase <code>lessons</code> table.</p>
        </div>

        {loading && (
          <div className="space-y-3">
             <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
               <span>Generating Content...</span>
               <span>{progress}%</span>
             </div>
             <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-indigo-600 transition-all duration-300 ease-out" 
                 style={{ width: `${progress}%` }} 
               />
             </div>
             <p className="text-center text-xs text-slate-400">This may take a minute. Please don't close the tab.</p>
          </div>
        )}

        {!loading && !complete && (
          <Button onClick={handleGenerate} size="lg" className="w-full h-16 text-lg shadow-xl">
             <Sparkles className="w-5 h-5 mr-2" /> Generate Lessons CSV
          </Button>
        )}

        {complete && blobUrl && (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="inline-flex items-center gap-2 text-emerald-600 font-black text-xl">
                <CheckCircle2 className="w-8 h-8" /> Generation Complete!
             </div>
             
             <a 
               href={blobUrl} 
               download="smartkidz_comprehensive_lessons.csv"
               className="inline-flex items-center justify-center w-full h-16 rounded-[1.2rem] bg-emerald-500 text-white text-lg font-bold shadow-lg hover:bg-emerald-600 hover:scale-[1.02] transition-all"
             >
                <Download className="w-6 h-6 mr-2" /> Download CSV (Approx 30MB)
             </a>

             <div className="text-xs text-slate-400">
               Filename: smartkidz_comprehensive_lessons.csv
             </div>
          </div>
        )}

      </Card>
    </PageMotion>
  );
}