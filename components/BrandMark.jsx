import { Sparkles } from "lucide-react";

export default function BrandMark({ compact = false, className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Logo Icon */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 shadow-lg shadow-indigo-500/20 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-20 group-hover:opacity-30 transition-opacity" />
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-pink-400 blur opacity-20 group-hover:opacity-40 transition-opacity" />
        
        {/* Abstract S/K Shape or Icon */}
        <Sparkles className="w-5 h-5 text-white relative z-10 fill-white" />
      </div>

      {!compact && (
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tight leading-none text-slate-900">
            Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Kidz</span>
          </span>
        </div>
      )}
    </div>
  );
}