"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Settings, Sparkles, RefreshCw, Eraser } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdminAssistant() {
  const [open, setOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hi! I'm the Admin AI. How can I help you manage the platform today?" }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  
  // Configuration
  const [customInstructions, setCustomInstructions] = useState("");
  const [llmUrl, setLlmUrl] = useState(""); // Empty by default to use server env
  const [llmModel, setLlmModel] = useState("");

  // Load server config on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/admin/integrations/status");
        const data = await res.json();
        if (data?.llm) {
          // Only set if we got valid data back
          if (data.llm.baseUrl) setLlmUrl(data.llm.baseUrl);
          if (data.llm.model) setLlmModel(data.llm.model);
        }
      } catch (e) {
        console.error("Failed to load LLM config", e);
      }
    }
    loadConfig();
  }, []);

  const scrollRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  async function send() {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/admin/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          context: { pathname, timestamp: new Date().toISOString() },
          instructions: customInstructions,
          config: {
             // Only send overrides if they are set
             baseUrl: llmUrl || undefined,
             model: llmModel || undefined
          }
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Request failed");
      if (!data.message) throw new Error("Received empty response from AI");
      
      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error: " + e.message }]);
    } finally {
      setBusy(false);
    }
  }

  function clearChat() {
    setMessages([{ role: "assistant", content: "Chat cleared. What's next?" }]);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 hover:scale-105 transition-all flex items-center justify-center z-50 ring-4 ring-white/20"
        title="Open Admin Assistant"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Admin AI</span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setConfigOpen(!configOpen)} className={`p-1.5 rounded hover:bg-white/10 ${configOpen ? "bg-white/10 text-white" : "text-slate-400"}`} title="Settings">
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Config Panel */}
      {configOpen && (
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">LLM URL</label>
             <input 
               className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
               value={llmUrl}
               onChange={e => setLlmUrl(e.target.value)}
               placeholder="Leave empty to use server env"
             />
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Model Name</label>
             <input 
               className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
               value={llmModel}
               onChange={e => setLlmModel(e.target.value)}
               placeholder="llama3, mistral, etc."
             />
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Instructions</label>
             <textarea
               className="w-full text-xs p-2 rounded-lg border border-slate-200 h-16 outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
               placeholder="System instructions..."
               value={customInstructions}
               onChange={e => setCustomInstructions(e.target.value)}
             />
           </div>
           <div className="flex justify-between items-center pt-2">
              <button onClick={clearChat} className="text-xs text-rose-600 flex items-center gap-1 hover:underline">
                <Eraser className="w-3 h-3" /> Clear Chat
              </button>
              <button onClick={() => setConfigOpen(false)} className="text-xs font-bold text-indigo-600 hover:underline">Done</button>
           </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scroll-smooth" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div 
              className={`max-w-[85%] rounded-2xl p-3 text-sm whitespace-pre-wrap leading-relaxed shadow-sm
                ${m.role === "user" 
                  ? "bg-indigo-600 text-white rounded-br-none" 
                  : "bg-white border border-slate-100 text-slate-700 rounded-bl-none"
                }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none p-3 shadow-sm">
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            placeholder="Ask me anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !busy && send()}
            autoFocus
          />
          <button
            onClick={send}
            disabled={!input.trim() || busy}
            className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}