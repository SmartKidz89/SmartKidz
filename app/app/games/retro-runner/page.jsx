"use client";

import { useEffect, useRef, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Button } from "@/components/ui/Button";
import { HomeCloud } from "@/components/app/world/HomeCloud";
import { Play, RotateCcw, Trophy } from "lucide-react";
import { useEconomy } from "@/lib/economy/client";
import { useActiveChild } from "@/hooks/useActiveChild";
import { playUISound } from "@/components/ui/sound";

export default function RetroRunnerGame() {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  const { activeChild } = useActiveChild();
  const economy = useEconomy(activeChild?.id);

  // Game Constants
  const GRAVITY = 0.6;
  const JUMP_FORCE = -10;
  const SPEED = 5;

  // Refs for loop state (avoid stale closures)
  const stateRef = useRef({
    player: { x: 50, y: 0, w: 30, h: 30, dy: 0, grounded: false },
    obstacles: [],
    frame: 0,
    score: 0,
    active: false
  });

  const requestRef = useRef();

  const resetGame = () => {
    stateRef.current = {
      player: { x: 50, y: 150, w: 30, h: 30, dy: 0, grounded: true },
      obstacles: [],
      frame: 0,
      score: 0,
      active: true
    };
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    loop();
  };

  const jump = () => {
    if (!stateRef.current.active) return;
    if (stateRef.current.player.grounded) {
      stateRef.current.player.dy = JUMP_FORCE;
      stateRef.current.player.grounded = false;
      playUISound("tap");
    }
  };

  const update = (ctx, width, height) => {
    const s = stateRef.current;
    if (!s.active) return;

    // -- Physics --
    s.player.dy += GRAVITY;
    s.player.y += s.player.dy;

    // Ground collision
    const groundY = height - 40; // floor height
    if (s.player.y + s.player.h >= groundY) {
      s.player.y = groundY - s.player.h;
      s.player.dy = 0;
      s.player.grounded = true;
    }

    // -- Obstacles --
    s.frame++;
    // Spawn obstacle every ~90 frames (randomized)
    if (s.frame % (80 + Math.floor(Math.random() * 40)) === 0) {
      s.obstacles.push({
        x: width,
        y: groundY - 30, // obstacle on ground
        w: 20,
        h: 30,
        color: Math.random() > 0.5 ? "#f43f5e" : "#8b5cf6"
      });
    }

    // Move & Cull Obstacles
    for (let i = s.obstacles.length - 1; i >= 0; i--) {
      let obs = s.obstacles[i];
      obs.x -= SPEED;

      // Collision Check (AABB)
      if (
        s.player.x < obs.x + obs.w &&
        s.player.x + s.player.w > obs.x &&
        s.player.y < obs.y + obs.h &&
        s.player.y + s.player.h > obs.y
      ) {
        endGame();
      }

      // Remove off-screen
      if (obs.x + obs.w < 0) {
        s.obstacles.splice(i, 1);
        s.score++;
        setScore(s.score);
      }
    }

    // -- Draw --
    ctx.clearRect(0, 0, width, height);

    // Ground
    ctx.fillStyle = "#10b981";
    ctx.fillRect(0, groundY, width, 40);

    // Player
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(s.player.x, s.player.y, s.player.w, s.player.h);
    // Eye
    ctx.fillStyle = "black";
    ctx.fillRect(s.player.x + 20, s.player.y + 6, 4, 4);

    // Obstacles
    s.obstacles.forEach(o => {
      ctx.fillStyle = o.color;
      ctx.fillRect(o.x, o.y, o.w, o.h);
    });
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    update(ctx, canvas.width, canvas.height);

    if (stateRef.current.active) {
      requestRef.current = requestAnimationFrame(loop);
    }
  };

  const endGame = () => {
    stateRef.current.active = false;
    cancelAnimationFrame(requestRef.current);
    setGameOver(true);
    setIsPlaying(false);
    playUISound("error");
    
    // Reward for effort
    const finalScore = stateRef.current.score;
    if (finalScore > 5) {
       economy.award(Math.floor(finalScore / 2), finalScore);
    }
  };

  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <PageMotion className="min-h-screen bg-indigo-600 p-6 flex flex-col items-center justify-center">
      <HomeCloud to="/app/rewards" label="Back to Arcade" />

      <div className="relative w-full max-w-2xl bg-slate-900 rounded-[2rem] p-4 shadow-2xl border-4 border-slate-800">
        <div className="absolute top-6 right-8 text-white font-mono text-2xl font-bold z-10">
           SCORE: {String(score).padStart(4, "0")}
        </div>

        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="w-full h-auto bg-slate-800 rounded-xl cursor-pointer"
          onMouseDown={jump}
          onTouchStart={(e) => { e.preventDefault(); jump(); }}
        />

        {/* UI Overlay */}
        {(!isPlaying) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-[2rem] z-20">
             {gameOver ? (
               <div className="text-center animate-in zoom-in">
                  <div className="text-6xl mb-4">💥</div>
                  <h2 className="text-3xl font-black text-white mb-2">GAME OVER</h2>
                  <p className="text-slate-300 font-bold mb-6">Score: {score}</p>
                  <Button onClick={resetGame} className="h-14 px-8 text-lg bg-emerald-500 hover:bg-emerald-600 border-none">
                     <RotateCcw className="w-5 h-5 mr-2" /> Try Again
                  </Button>
               </div>
             ) : (
               <div className="text-center">
                  <h1 className="text-4xl font-black text-white mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    RETRO RUNNER
                  </h1>
                  <Button onClick={resetGame} className="h-16 px-10 text-xl font-bold bg-white text-slate-900 hover:bg-indigo-50 border-none shadow-xl">
                     <Play className="w-6 h-6 mr-3 fill-current" /> PLAY NOW
                  </Button>
                  <p className="text-white/50 text-sm mt-4 font-mono">TAP / CLICK TO JUMP</p>
               </div>
             )}
          </div>
        )}
      </div>

      <div className="mt-8 text-white/50 font-bold text-sm tracking-widest uppercase">
         Use Spacebar or Tap to Jump
      </div>
    </PageMotion>
  );
}