"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/auth/useSession";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, MapPin, User, Users, Sparkles, Home, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import ConfettiBurst from "@/components/app/ConfettiBurst";

// --- Components ---

function StepIndicator({ current, total }) {
  return (
    <div className="flex gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full transition-all duration-500",
            i <= current ? "w-8 bg-brand-primary" : "w-2 bg-slate-200"
          )}
        />
      ))}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, required = false, autoFocus = false }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 font-semibold text-slate-900 outline-none focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:text-slate-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">{label}</label>
      <div className="relative">
        <select
          className="w-full h-12 appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 font-semibold text-slate-900 outline-none focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          ▼
        </div>
      </div>
    </div>
  );
}

// --- Steps Data ---

const REFERRAL_SOURCES = [
  { value: "", label: "Select an option..." },
  { value: "google", label: "Google Search" },
  { value: "social", label: "Social Media (FB/Insta/TikTok)" },
  { value: "friend", label: "Friend or Family" },
  { value: "school", label: "School / Teacher" },
  { value: "other", label: "Other" },
];

const YEAR_LEVELS = [
  { value: 1, label: "Year 1" },
  { value: 2, label: "Year 2" },
  { value: 3, label: "Year 3" },
  { value: 4, label: "Year 4" },
  { value: 5, label: "Year 5" },
  { value: 6, label: "Year 6" },
];

// --- Main Page ---

export default function OnboardingPage() {
  const { session, supabase } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    address_line1: "",
    city: "",
    state: "",
    postcode: "",
    country: "Australia",
    referral_source: "",
    children: [{ display_name: "", year_level: 3 }] // Default one child slot
  });

  useEffect(() => {
    if (session?.user?.user_metadata?.full_name) {
      setFormData(prev => ({ ...prev, full_name: session.user.user_metadata.full_name }));
    }
  }, [session]);

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateChild = (index, field, value) => {
    const next = [...formData.children];
    next[index] = { ...next[index], [field]: value };
    setFormData(prev => ({ ...prev, children: next }));
  };

  const addChild = () => {
    setFormData(prev => ({
      ...prev,
      children: [...prev.children, { display_name: "", year_level: 1 }]
    }));
  };

  const removeChild = (index) => {
    if (formData.children.length <= 1) return;
    const next = formData.children.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, children: next }));
  };

  const handleNext = () => {
    // Basic validation
    if (step === 0 && !formData.full_name.trim()) return alert("Please enter your name.");
    if (step === 1 && (!formData.address_line1.trim() || !formData.city.trim())) return alert("Please fill in your address.");
    if (step === 2 && !formData.referral_source) return alert("Please tell us how you found us.");
    
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) return;
    
    // Validate children
    const validKids = formData.children.filter(c => c.display_name.trim().length > 0);
    if (validKids.length === 0) return alert("Please add at least one child profile.");

    setBusy(true);
    try {
      const uid = session.user.id;

      // 1. Update Profile
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: uid,
          full_name: formData.full_name,
          address_line1: formData.address_line1,
          city: formData.city,
          state: formData.state,
          postcode: formData.postcode,
          country: formData.country,
          referral_source: formData.referral_source,
          updated_at: new Date().toISOString(),
        });
      
      if (profileError) throw profileError;

      // 2. Update/Insert Children
      // For simplicity in this flow, we'll wipe existing and re-insert to sync list state exactly
      // (In a prod edit flow, we'd be more careful, but this is onboarding)
      await supabase.from("children").delete().eq("parent_id", uid);
      
      const { error: kidsError } = await supabase.from("children").insert(
        validKids.map(k => ({
          parent_id: uid,
          display_name: k.display_name,
          year_level: Number(k.year_level),
          avatar_config: {},
          accessibility_settings: { readAloud: true },
          learning_style_defaults: { preferred: "visual" }
        }))
      );

      if (kidsError) throw kidsError;

      setComplete(true);
      setTimeout(() => router.push("/app"), 2000);

    } catch (err) {
      console.error(err);
      alert("Something went wrong saving your details. Please try again.");
      setBusy(false);
    }
  };

  if (complete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <ConfettiBurst show={true} />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mx-auto mb-6 text-5xl">
            🚀
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">All Set!</h1>
          <p className="text-slate-600 font-medium">Preparing your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6">
      
      {/* Progress Header */}
      <div className="w-full max-w-xl mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-wider">
           <Sparkles className="w-4 h-4 text-brand-primary" /> SmartKidz
        </div>
        <div className="text-xs font-bold text-slate-400">Step {step + 1} of 4</div>
      </div>

      <motion.div 
        layout
        className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="p-8 sm:p-10">
          <StepIndicator current={step} total={4} />

          <AnimatePresence mode="wait">
            
            {/* STEP 1: PARENT DETAILS */}
            {step === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                    <User className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900">Let's meet the parent</h2>
                  <p className="text-slate-600 mt-2">We'll use this for your account settings.</p>
                </div>

                <InputField 
                  label="Full Name" 
                  placeholder="e.g. Sarah Smith" 
                  value={formData.full_name} 
                  onChange={(v) => updateForm("full_name", v)}
                  autoFocus
                  required
                />
              </motion.div>
            )}

            {/* STEP 2: ADDRESS */}
            {step === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
                    <Home className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900">Where are you based?</h2>
                  <p className="text-slate-600 mt-2">This helps with billing and localized content.</p>
                </div>

                <InputField 
                  label="Address Line 1" 
                  placeholder="123 Example St" 
                  value={formData.address_line1} 
                  onChange={(v) => updateForm("address_line1", v)}
                  required
                  autoFocus
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <InputField 
                    label="City" 
                    placeholder="Sydney" 
                    value={formData.city} 
                    onChange={(v) => updateForm("city", v)}
                    required
                  />
                  <InputField 
                    label="Postcode" 
                    placeholder="2000" 
                    value={formData.postcode} 
                    onChange={(v) => updateForm("postcode", v)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <InputField 
                    label="State" 
                    placeholder="NSW" 
                    value={formData.state} 
                    onChange={(v) => updateForm("state", v)}
                  />
                  <InputField 
                    label="Country" 
                    value={formData.country} 
                    onChange={(v) => updateForm("country", v)}
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 3: MARKETING */}
            {step === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600">
                    <Globe className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900">One quick question...</h2>
                  <p className="text-slate-600 mt-2">How did you find your way to SmartKidz?</p>
                </div>

                <SelectField 
                   label="I heard about you from..."
                   options={REFERRAL_SOURCES}
                   value={formData.referral_source}
                   onChange={(v) => updateForm("referral_source", v)}
                />
              </motion.div>
            )}

            {/* STEP 4: CHILDREN */}
            {step === 3 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-500">
                    <Users className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900">Who is learning?</h2>
                  <p className="text-slate-600 mt-2">Add a profile for each child.</p>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {formData.children.map((kid, index) => (
                    <div key={index} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 relative group">
                      {formData.children.length > 1 && (
                         <button 
                           onClick={() => removeChild(index)}
                           className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors text-xs font-bold uppercase tracking-wider"
                         >
                           Remove
                         </button>
                      )}
                      <div className="grid gap-4">
                         <InputField 
                           label={`Child ${index + 1} Name`}
                           placeholder="e.g. Leo"
                           value={kid.display_name}
                           onChange={(v) => updateChild(index, "display_name", v)}
                         />
                         <SelectField 
                           label="Year Level"
                           value={kid.year_level}
                           onChange={(v) => updateChild(index, "year_level", v)}
                           options={YEAR_LEVELS}
                         />
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={addChild}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 font-bold hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-all"
                >
                  + Add another child
                </button>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Footer Actions */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
            {step > 0 ? (
              <button 
                onClick={() => setStep(s => s - 1)}
                className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                disabled={busy}
              >
                Back
              </button>
            ) : (
              <div /> 
            )}

            <button
              onClick={step === 3 ? handleSubmit : handleNext}
              disabled={busy}
              className={cn(
                "h-12 px-8 rounded-full bg-slate-900 text-white font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2",
                busy ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-800"
              )}
            >
              {busy ? (
                "Saving..." 
              ) : step === 3 ? (
                <>Finish <Check className="w-4 h-4" /></>
              ) : (
                <>Next <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}