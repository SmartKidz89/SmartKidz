"use client";

import { useState, useRef, useEffect } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { playUISound, haptic } from "@/components/ui/sound";
import { Eraser, Download, Trash2, Grid3X3, Palette, ChevronLeft, Undo } from "lucide-react";
import Link from "next/link";
import ConfettiBurst from "@/components/app/ConfettiBurst";

const PALETTES = {
  classic: ["#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF"],
  earth: ["#4a3728", "#8b5a2b", "#2e4a28", "#5c8a45", "#89cff0", "#f4a460", "#d2b48c", "#ffffff"],
  candy: ["#ff6b6b", "#feca57", "#ff9ff3", "#54a0ff", "#5f27cd", "#48dbfb", "#1dd1a1", "#ffffff"],
  retro: ["#2c3e50", "#e74c3c", "#f1c40f", "#e67e22", "#3498db", "#9b59b6", "#2ecc71", "#ecf0f1"],
};

const GRID_SIZES = [12, 16, 24];

export default function PixelArtPage() {
  const [size, setSize] = useState(16);
  const [grid, setGrid] = useState(Array(16 * 16).fill(""));
  const [color, setColor] = useState("#000000");
  const [history, setHistory] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const canvasRef = useRef(null);

  // Reset grid when size changes
  useEffect(() => {
    setGrid(Array(size * size).fill(""));
    setHistory([]);
  }, [size]);

  const handlePointerDown = (i) => {
    setIsDrawing(true);
    paint(i);
  };

  const handlePointerEnter = (i) => {
    if (isDrawing) paint(i);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const paint = (i) => {
    if (grid[i] === color) return;
    
    // Save to history before first stroke of a batch? 
    // Simplified: save history on every change for this MVP (optimize later if needed)
    if (history.length === 0 || history[history.length - 1] !== JSON.stringify(grid)) {
      setHistory(prev => [...prev.slice(-10), [...grid]]); // keep last 10
    }

    const next = [...grid];
    next[i] = color;
    setGrid(next);
    
    // Light haptic/sound (throttled naturally by interaction speed)
    try { playUISound("tap"); } catch {}
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setGrid(prev);
    setHistory(h => h.slice(0, -1));
  };

  const clear = () => {
    if (confirm("Clear your artwork?")) {
      setHistory(prev => [...prev, [...grid]]);
      setGrid(Array(size * size).fill(""));
      playUISound("click");
    }
  };

  const download = async () => {
    // Generate image from canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const pixelSize = 20; // export resolution scale
    canvas.width = size * pixelSize;
    canvas.height = size * pixelSize;

    // Fill background white (optional, or transparent)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    grid.forEach((c, i) => {
      if (c) {
        const x = (i % size) * pixelSize;
        const y = Math.floor(i / size) * pixelSize;
        ctx.fillStyle = c;
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }
    });

    const link = document.createElement("a");
    link.download = `pixel-art-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    setShowConfetti(true);
    playUISound("success");
    haptic("medium");
  };

  return (
    <PageMotion className="max-w-4xl mx-auto pb-20 select-none">
      <ConfettiBurst show={showConfetti} onDone={() => setShowConfetti(false)} />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-4">
        <div className="flex items-center gap-4">
          <Link href="/app/tools" className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pixel Studio</h1>
            <p className="text-slate-600 font-medium">Draw block by block.</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="secondary" onClick={undo} disabled={history.length === 0} title="Undo">
            <Undo className="w-5 h-5" />
          </Button>
          <Button onClick={download} className="shadow-lg">
            <Download className="w-5 h-5 mr-2" /> Save
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start px-4">
        
        {/* Canvas Area */}
        <div className="flex flex-col items-center justify-center bg-slate-100 rounded-[2.5rem] p-4 sm:p-8 shadow-inner min-h-[500px]">
          <div 
            className="bg-white shadow-2xl cursor-pointer touch-none"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${size}, 1fr)`,
              width: "min(100%, 500px)",
              aspectRatio: "1/1",
              border: "1px solid #e2e8f0"
            }}
            onPointerLeave={handlePointerUp}
            onPointerUp={handlePointerUp}
          >
            {grid.map((cellColor, i) => (
              <div
                key={i}
                onPointerDown={(e) => { e.preventDefault(); handlePointerDown(i); }}
                onPointerEnter={() => handlePointerEnter(i)}
                style={{ backgroundColor: cellColor || "white" }}
                className="border-[0.5px] border-slate-100/50 hover:brightness-95"
              />
            ))}
          </div>
          
          <div className="mt-6 flex items-center gap-4 text-sm font-bold text-slate-500">
             <Grid3X3 className="w-4 h-4" />
             <div className="flex gap-2 bg-white rounded-full p-1 border border-slate-200 shadow-sm">
                {GRID_SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-3 py-1 rounded-full transition-colors ${size === s ? "bg-slate-900 text-white" : "hover:bg-slate-100"}`}
                  >
                    {s}x{s}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Tools Sidebar */}
        <div className="space-y-6">
          
          {/* Colors */}
          <Card className="p-5">
             <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase text-slate-400 tracking-wider">
               <Palette className="w-4 h-4" /> Colors
             </div>
             
             <div className="grid grid-cols-4 gap-3">
               {[...PALETTES.classic, ...PALETTES.candy].slice(0, 12).map((c) => (
                 <button
                   key={c}
                   onClick={() => setColor(c)}
                   className={`w-full aspect-square rounded-xl shadow-sm transition-transform active:scale-95 border-2 ${
                     color === c ? "border-slate-900 scale-110 z-10" : "border-transparent hover:scale-105"
                   }`}
                   style={{ backgroundColor: c }}
                 />
               ))}
               <button
                  onClick={() => setColor("")}
                  className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center bg-white text-slate-400 ${
                     color === "" ? "border-slate-900 text-slate-900" : "border-slate-200"
                  }`}
                  title="Eraser"
               >
                  <Eraser className="w-5 h-5" />
               </button>
             </div>
             
             {/* Custom Picker */}
             <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex gap-2">
                   <input 
                      type="color" 
                      value={color === "" ? "#ffffff" : color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-10 w-full cursor-pointer rounded-lg border-0 bg-transparent p-0"
                   />
                </div>
             </div>
          </Card>

          {/* Actions */}
          <Card className="p-5">
             <Button variant="danger" onClick={clear} className="w-full">
                <Trash2 className="w-4 h-4 mr-2" /> Clear All
             </Button>
          </Card>
          
        </div>
      </div>
    </PageMotion>
  );
}