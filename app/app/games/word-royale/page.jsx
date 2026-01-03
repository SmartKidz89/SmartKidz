"use client";

import { useEffect, useRef, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Button } from "@/components/ui/Button";
import { HomeCloud } from "@/components/app/world/HomeCloud";
import { Trophy, RefreshCw, Keyboard } from "lucide-react";
import { useEconomy } from "@/lib/economy/client";
import { useActiveChild } from "@/hooks/useActiveChild";
import { playUISound } from "@/components/ui/sound";

const WORDS = [
  "cat", "dog", "run", "sun", "big", "red", // Lvl 1
  "jump", "play", "blue", "tree", "bird", "fish", // Lvl 2
  "happy", "funny", "green", "cloud", "water", "grape", // Lvl 3
  "planet", "rocket", "school", "friend", "summer", "winter" // Lvl 4
];

export default function WordRoyaleGame() {
  const [active, setActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState("");
  const [target, setTarget] = useState(null); // { word, y, speed }
  
  const { activeChild } = useActiveChild();
  const economy = useEconomy(activeChild?.id);
  
  const frameRef = useRef();
  const stateRef = useRef({ target: null, lastTime: 0 });

  function spawn() {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    stateRef.current.target = { 
      word: w, 
      y: -50, 
      speed: 1 + (score * 0.1) // get faster
    };
    setTarget(stateRef.current.target);
    setInput("");
  }

  function loop(time) {
    if (!stateRef.current.lastTime) stateRef.current.lastTime = time;
    const delta = time - stateRef.current.lastTime;
    
    // Logic
    if (stateRef.current.target) {
       stateRef.current.target.y += (stateRef.current.target.speed * (delta / 16));
       
       // Hit floor?
       if (stateRef.current.target.y > 400) {
          endGame();
          return;
       }
       setTarget({ ...stateRef.current.target });
    }

    stateRef.current.lastTime = time;
    frameRef.current = requestAnimationFrame(loop);
  }

  function startGame() {
    setActive(true);
    setGameOver(false);
    setScore(0);
    spawn();
    stateRef.current.lastTime = 0;
    frameRef.current = requestAnimationFrame(loop);
  }

  function endGame() {
    cancelAnimationFrame(frameRef.current);
    setActive(false);
    setGameOver(true);
    playUISound("error");
    if (score > 0) economy.award(score, score * 2);
  }

  useEffect(() => {
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  function handleInput(e) {
    const val = e.target.value.toLowerCase();
    setInput(val);

    if (stateRef.current.target && val.trim() === stateRef.current.target.word) {
       // Correct!
       playUISound("success");
       setScore(s => s + 1);
       spawn();
    }
  }

  return (
    <PageMotion className="min-h-screen bg-violet-600 p-6 flex flex-col items-center justify-center font-sans">
      <HomeCloud to="/app/rewards" label="Exit" />

      <div className="relative w-full max-w-lg bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl border-4 border-violet-400/50 overflow-hidden">
        
        {/* Game Area */}
        <div className="relative h-[400px] bg-slate-800 rounded-[2rem] overflow-hidden">
           {/* Score HUD */}
           <div className="absolute top-4 left-6 text-violet-300 font-black text-xl z-20">
              SCORE: {score}
           </div>

           {/* Falling Word */}
           {target && !gameOver && (
              <div 
                className="absolute left-1/2 -translate-x-1/2 px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-2xl shadow-lg border-b-4 border-slate-300 transition-none"
                style={{ top: target.y }}
              >
                 {target.word}
              </div>
           )}

           {/* Game Over Screen */}
           {gameOver && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur flex flex-col items-center justify-center z-30 animate-in fade-in">
                 <h2 className="text-4xl font-black text-white mb-2">GAME OVER</h2>
                 <p className="text-violet-300 font-bold mb-6">Final Score: {score}</p>
                 <Button onClick={startGame} className="h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-lg border-none shadow-xl">
                    <RefreshCw className="w-5 h-5 mr-2" /> Play Again
                 </Button>
              </div>
           )}

           {/* Start Screen */}
           {!active && !gameOver && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur flex flex-col items-center justify-center z-30">
                 <div className="w-20 h-20 bg-violet-500 rounded-3xl flex items-center justify-center text-4xl shadow-lg mb-6 rotate-3">
                    🔤
                 </div>
                 <h1 className="text-4xl font-black text-white mb-2">WORD ROYALE</h1>
                 <p className="text-slate-400 mb-8 font-medium">Type the words before they drop!</p>
                 <Button onClick={startGame} className="h-14 px-10 bg-white text-violet-900 hover:bg-violet-50 text-lg font-black border-none shadow-xl">
                    START
                 </Button>
              </div>
           )}
        </div>

        {/* Input Zone */}
        <div className="p-4 pt-6">
           <div className="relative">
              <Keyboard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                value={input}
                onChange={handleInput}
                disabled={!active}
                autoFocus
                placeholder={active ? "Type here..." : ""}
                className="w-full h-16 pl-12 pr-4 rounded-2xl bg-slate-950 border-2 border-slate-700 text-white font-mono text-2xl outline-none focus:border-violet-500 transition-colors uppercase placeholder:normal-case placeholder:text-slate-600"
              />
           </div>
        </div>

      </div>
    </PageMotion>
  );
}