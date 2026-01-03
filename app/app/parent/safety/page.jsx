"use client";

import { useEffect, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { supabase } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Shield, Volume2, Clock, Eye, Lock, 
  CheckCircle2, AlertCircle, Save, Server, FileCheck 
} from "lucide-react";
import AvatarBadge from "@/components/app/AvatarBadge";
import { cn } from "@/lib/utils";

function Switch({ checked, onCheckedChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2",
        checked ? "bg-indigo-600" : "bg-slate-200"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

export default function SafetyPage() {
  const { kids, activeChildId, setActiveChild, refreshKids } = useActiveChild();
  
  // Local state for the form
  const [settings, setSettings] = useState({
    accessibility: { readAloud: true, highContrast: false, largeText: false },
    safety: { screenTimeLimit: 0, strictMode: false, soundEffects: true }
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load settings when active child changes
  useEffect(() => {
    const kid = kids.find(k => k.id === activeChildId);
    if (kid) {
      setSettings({
        accessibility: { 
          readAloud: true, 
          highContrast: false, 
          largeText: false,
          ...kid.accessibility_settings 
        },
        safety: { 
          screenTimeLimit: 30, 
          strictMode: false, 
          soundEffects: true,
          ...kid.safety_config 
        }
      });
    }
  }, [activeChildId, kids]);

  const handleSave = async () => {
    if (!activeChildId) return;
    setSaving(true);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from("children")
        .update({
          accessibility_settings: settings.accessibility,
          safety_config: settings.safety
        })
        .eq("id", activeChildId);

      if (error) throw error;
      
      await refreshKids(); // Refresh context
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const updateAccess = (key, val) => {
    setSettings(prev => ({
      ...prev,
      accessibility: { ...prev.accessibility, [key]: val }
    }));
  };

  const updateSafety = (key, val) => {
    setSettings(prev => ({
      ...prev,
      safety: { ...prev.safety, [key]: val }
    }));
  };

  return (
    <PageMotion className="max-w-5xl mx-auto pb-32 pt-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10 px-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-500" />
            Safety & Controls
          </h1>
          <p className="text-slate-600 font-medium mt-2">
            Customize the learning environment and review our safety standards.
          </p>
        </div>

        {/* Child Selector */}
        <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {kids.map(k => (
            <button
              key={k.id}
              onClick={() => setActiveChild(k.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all",
                activeChildId === k.id 
                  ? "bg-slate-900 text-white shadow-md" 
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <AvatarBadge config={k.avatar_config} size={24} />
              <span className="hidden sm:inline">{k.display_name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 px-4">
        
        {/* Safety & Limits Section */}
        <Card className="p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Limits & Controls</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Screen Time & Sound</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" /> Daily Screen Time
                </div>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                  {settings.safety.screenTimeLimit === 0 ? "Unlimited" : `${settings.safety.screenTimeLimit} mins`}
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="120" 
                step="15" 
                value={settings.safety.screenTimeLimit}
                onChange={(e) => updateSafety("screenTimeLimit", Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2 font-semibold">
                <span>None</span>
                <span>60m</span>
                <span>120m</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Strict Mode</div>
                <div className="text-sm text-slate-500">Lock "Fun" tools until learning goals met.</div>
              </div>
              <Switch 
                checked={settings.safety.strictMode} 
                onCheckedChange={(v) => updateSafety("strictMode", v)} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Sound Effects</div>
                <div className="text-sm text-slate-500">Play sounds for correct answers/rewards.</div>
              </div>
              <Switch 
                checked={settings.safety.soundEffects} 
                onCheckedChange={(v) => updateSafety("soundEffects", v)} 
              />
            </div>
          </div>
        </Card>

        {/* Accessibility Section */}
        <Card className="p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Accessibility</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Visual & Audio Support</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-slate-400" /> Text-to-Speech
                </div>
                <div className="text-sm text-slate-500">Read questions aloud automatically.</div>
              </div>
              <Switch 
                checked={settings.accessibility.readAloud} 
                onCheckedChange={(v) => updateAccess("readAloud", v)} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">High Contrast Mode</div>
                <div className="text-sm text-slate-500">Increase visual distinction.</div>
              </div>
              <Switch 
                checked={settings.accessibility.highContrast} 
                onCheckedChange={(v) => updateAccess("highContrast", v)} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Large Text</div>
                <div className="text-sm text-slate-500">Boost font size for readability.</div>
              </div>
              <Switch 
                checked={settings.accessibility.largeText} 
                onCheckedChange={(v) => updateAccess("largeText", v)} 
              />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Platform Security & Privacy Information */}
      <div className="mt-8 px-4">
        <Card className="p-8 bg-slate-900 text-white border-slate-800">
          <div className="flex items-start gap-4">
             <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Shield className="w-6 h-6 text-emerald-400" />
             </div>
             <div>
                <h3 className="text-xl font-black text-white">Platform Security & Safety</h3>
                <p className="text-slate-400 mt-1 max-w-2xl">
                  SmartKidz is built from the ground up to be a safe, closed ecosystem for children.
                </p>
             </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
             <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-2 font-bold text-indigo-300">
                   <Server className="w-4 h-4" /> Secure Infrastructure
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                   All data is encrypted in transit and at rest using industry-standard AES-256 encryption via Supabase. We do not sell data to third parties.
                </p>
             </div>

             <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-2 font-bold text-emerald-300">
                   <FileCheck className="w-4 h-4" /> Content Filtering
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                   All AI interactions (Curiosity Engine, Storybook) pass through strict pre-prompt engineering and moderation layers to ensure G-rated, age-appropriate responses.
                </p>
             </div>

             <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-2 font-bold text-amber-300">
                   <Lock className="w-4 h-4" /> Walled Garden
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                   No external links, no social media sharing, no direct messaging between users. Your child cannot communicate with strangers on this platform.
                </p>
             </div>
          </div>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
           <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <AlertCircle className="w-4 h-4" />
              Changes apply immediately to this device.
           </div>
           
           <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto shadow-xl px-8" size="lg">
              {saving ? (
                "Saving..."
              ) : success ? (
                <><CheckCircle2 className="w-5 h-5 mr-2" /> Saved</>
              ) : (
                <><Save className="w-5 h-5 mr-2" /> Save Changes</>
              )}
           </Button>
        </div>
      </div>

    </PageMotion>
  );
}