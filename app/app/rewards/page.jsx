"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useEconomy } from "@/lib/economy/client";
import { 
  Crown, Gamepad2, Palette, Globe2, BrainCircuit, 
  Rocket, Pickaxe, Ghost, Music, Zap, Box, ShoppingBag, Joystick
} from "lucide-react";
import SeasonPassPanel from "@/components/app/SeasonPassPanel";
import ChildAvatar from "@/components/avatar/ChildAvatar";
import { cn } from "@/lib/utils";

// --- Game Data (10 Total) ---
const GAMES = [
  { id: "maths-miner", title: "Maths Miner", genre: "Arcade", icon: Pickaxe, color: "from-emerald-400 to-teal-600", href: "/app/games/maths-miner" },
  { id: "retro-runner", title: "Retro Runner", genre: "Action", icon: Joystick, color: "from-orange-400 to-red-500", href: "/app/games/retro-runner" },
  { id: "word-royale", title: "Word Royale", genre: "Battle", icon: Ghost, color: "from-violet-500 to-purple-700", href: "/app/games/word-royale" },
  { id: "logic-loops", title: "Logic Loops", genre: "Puzzle", icon: BrainCircuit, color: "from-blue-400 to-indigo-600", href: "/app/games/logic-loops" },
  { id: "cosmic-tycoon", title: "Cosmic Tycoon", genre: "Strategy", icon: Rocket, color: "from-indigo-500 to-blue-800", href: "/app/games/cosmic-tycoon" },
  { id: "globe-trotter", title: "Globe Trotter", genre: "Adventure", icon: Globe2, color: "from-sky-400 to-cyan-600", href: "/app/games/globe-trotter" },
  { id: "super-streak", title: "Super Streak", genre: "Challenge", icon: Zap, color: "from-yellow-400 to-orange-500", href: "/app/today" },
  { id: "block-builder", title: "Block Builder", genre: "Sandbox", icon: Box, color: "from-slate-400 to-slate-600", href: "/app/games/block-builder" },
];

function GameTile({ game, index }) {
  const Icon = game.icon;
  return (
    <Link href={game.href} className="group relative block">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center"
      >
        <div className={cn(
          "w-20 h-20 sm:w-24 sm:h-24 rounded-[1.75rem] flex items-center justify-center text-white shadow-xl relative overflow-hidden transition-all",
          "bg-gradient-to-br border-b-4 border-black/10", 
          game.color
        )}>
           <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
           <Icon className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md relative z-10 group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
        </div>
        <div className="mt-3 text-center">
           <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
             {game.title}
           </h3>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
             {game.genre}
           </span>
        </div>
      </motion.div>
    </Link>
  );
}

export default function StudentHubPage() {
  const { activeChild } = useActiveChild();
  const economy = useEconomy(activeChild?.id);

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-10">
      
      {/* 1. Player Profile */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.4),transparent_50%)]" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <ChildAvatar config={activeChild?.avatar_config} size={88} className="relative border-4 border-white/10 rounded-full shadow-2xl" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-black tracking-tight mb-1">{activeChild?.display_name || "Player"}&apos;s Hub</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
               <div className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur-md border border-white/5 flex items-center gap-2">
                  <span className="text-xl">🪙</span>
                  <div className="text-lg font-black text-amber-400 leading-none">{economy?.coins || 0}</div>
               </div>
               <div className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur-md border border-white/5 flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <div className="text-lg font-black text-emerald-400 leading-none">{economy?.xp || 0}</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. The Arcade */}
      <section>
        <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider text-xs mb-6 px-2">
           <Gamepad2 className="w-4 h-4" /> The Arcade
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-y-8 gap-x-4">
           {GAMES.map((game, i) => <GameTile key={game.id} game={game} index={i} />)}
        </div>
      </section>

      {/* 3. Season & Shop */}
      <div className="grid md:grid-cols-2 gap-6">
         <section className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl">
                  <Crown className="w-5 h-5 fill-current" />
               </div>
               <h3 className="text-lg font-black text-slate-900">Season Pass</h3>
            </div>
            <SeasonPassPanel />
         </section>

         <Link href="/app/avatar" className="group block">
            <div className="h-full bg-gradient-to-br from-rose-50 to-white rounded-[2.5rem] p-6 border border-rose-100 shadow-lg relative overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02]">
               <div className="absolute right-4 top-4 text-rose-200 group-hover:text-rose-300 transition-colors">
                  <ShoppingBag className="w-24 h-24 opacity-20 rotate-12" />
               </div>
               <div className="relative z-10">
                  <div className="text-xs font-black text-rose-500 uppercase tracking-wider mb-1">The Shop</div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">New Gear</h3>
                  <button className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold text-sm shadow-md group-hover:bg-rose-600 transition-colors">
                     Open Shop
                  </button>
               </div>
            </div>
         </Link>
      </div>
    </div>
  );
}