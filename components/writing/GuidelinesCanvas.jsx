"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { Eraser, RotateCcw } from "lucide-react";

/**
 * Interactive Handwriting Canvas
 * Supports mouse/touch drawing, guideline rendering, and trace templates.
 */
export default function GuidelinesCanvas({
  preset = "threeLine",
  lineSpacing = 34,
  traceText = "",
  traceOpacity = 0.35,
  dashedTrace = true,
  onChange,
  onMeta,
  className = "",
}) {
  const svgRef = useRef(null);
  const [strokes, setStrokes] = useState([]); // Array of { points: [{x,y,t}] }
  const [currentStroke, setCurrentStroke] = useState(null);
  const [rect, setRect] = useState({ width: 0, height: 0 });

  // Update parent with metadata (dimensions)
  useEffect(() => {
    if (svgRef.current) {
      const r = svgRef.current.getBoundingClientRect();
      setRect({ width: r.width, height: r.height });
      onMeta?.({ width: r.width, height: r.height, preset, lineSpacing });
    }
  }, [preset, lineSpacing]); // Re-measure if layout shifts

  // Initial measure
  useEffect(() => {
    const measure = () => {
      if (svgRef.current) {
        const r = svgRef.current.getBoundingClientRect();
        setRect({ width: r.width, height: r.height });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // -- Drawing Handlers --

  function getPoint(e) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0, t: 0 };
    
    const r = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - r.left,
      y: clientY - r.top,
      t: Date.now()
    };
  }

  function handleStart(e) {
    if (e.cancelable) e.preventDefault(); // Prevent scrolling on touch
    const pt = getPoint(e);
    setCurrentStroke({ points: [pt] });
  }

  function handleMove(e) {
    if (!currentStroke) return;
    if (e.cancelable) e.preventDefault();
    
    const pt = getPoint(e);
    setCurrentStroke(prev => ({
      points: [...prev.points, pt]
    }));
  }

  function handleEnd(e) {
    if (!currentStroke) return;
    const newStrokes = [...strokes, currentStroke];
    setStrokes(newStrokes);
    setCurrentStroke(null);
    onChange?.(newStrokes);
  }

  function clear() {
    setStrokes([]);
    onChange?.([]);
  }

  function undo() {
    const next = strokes.slice(0, -1);
    setStrokes(next);
    onChange?.(next);
  }

  // -- Render Helpers --

  // Generate path string from stroke points
  const toPath = (points) => {
    if (points.length < 2) return "";
    return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
  };

  // Guidelines logic
  const guidelines = useMemo(() => {
    if (!rect.height) return [];
    
    // Base params
    const topPad = 60;
    const rowHeight = lineSpacing === "wide" ? 140 : lineSpacing === "tight" ? 80 : 110;
    const rows = Math.floor((rect.height - topPad) / rowHeight);
    
    const lines = [];

    for (let i = 0; i < rows; i++) {
      const yTop = topPad + (i * rowHeight);
      const yBase = yTop + (rowHeight * 0.75); // Baseline
      const yMid = yTop + (rowHeight * 0.375); // Midline (approx)
      const yDesc = yTop + rowHeight; // Descender line
      
      if (preset === "threeLine") {
        lines.push({ y: yTop, type: "solid", color: "#cbd5e1" }); // Top
        lines.push({ y: yMid, type: "dashed", color: "#94a3b8" }); // Mid
        lines.push({ y: yBase, type: "solid", color: "#475569", width: 2 }); // Base
        lines.push({ y: yDesc, type: "solid", color: "#cbd5e1" }); // Bottom/Descender
      } else if (preset === "twoLine") {
        lines.push({ y: yMid, type: "solid", color: "#cbd5e1" });
        lines.push({ y: yBase, type: "solid", color: "#475569", width: 2 });
      } else if (preset === "lined") {
        lines.push({ y: yBase, type: "solid", color: "#94a3b8" });
      }
    }
    return lines;
  }, [rect.height, preset, lineSpacing]);

  // Trace Text Position logic
  // We place text on the first baseline
  const textY = useMemo(() => {
     if (!guidelines.length) return 100;
     // Find first baseline (color #475569)
     const base = guidelines.find(l => l.width === 2);
     return base ? base.y : 100;
  }, [guidelines]);

  // Determine font size based on row height
  const fontSize = useMemo(() => {
      const rowHeight = lineSpacing === "wide" ? 140 : lineSpacing === "tight" ? 80 : 110;
      // Heuristic: font size roughly 75% of row height fits between top/bottom
      return Math.round(rowHeight * 0.75);
  }, [lineSpacing]);

  return (
    <Card className={cn("p-0 overflow-hidden bg-white relative select-none touch-none", className)}>
      
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
         <button onClick={undo} disabled={strokes.length === 0} className="p-2 bg-white rounded-full shadow-md border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-50">
            <RotateCcw className="w-5 h-5" />
         </button>
         <button onClick={clear} disabled={strokes.length === 0} className="p-2 bg-white rounded-full shadow-md border border-slate-200 text-rose-500 hover:bg-rose-50 disabled:opacity-50">
            <Eraser className="w-5 h-5" />
         </button>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-[450px] cursor-crosshair"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {/* 1. Background Grid/Lines */}
        {guidelines.map((g, i) => (
          <line
            key={i}
            x1="0"
            y1={g.y}
            x2="100%"
            y2={g.y}
            stroke={g.color}
            strokeWidth={g.width || 1}
            strokeDasharray={g.type === "dashed" ? "8 8" : "none"}
          />
        ))}

        {/* 2. Trace Template Layer */}
        {traceText && (
          <text
            x="60"
            y={textY}
            fontFamily="sans-serif"
            fontSize={fontSize}
            fontWeight="bold"
            fill={dashedTrace ? "none" : "#e2e8f0"}
            stroke={dashedTrace ? "#94a3b8" : "none"}
            strokeWidth="2"
            strokeDasharray={dashedTrace ? "4 4" : "none"}
            opacity={traceOpacity}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {traceText}
          </text>
        )}

        {/* 3. User Ink Layer */}
        {strokes.map((s, i) => (
          <path
            key={i}
            d={toPath(s.points)}
            fill="none"
            stroke="#1e293b" // slate-800
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* 4. Current (Active) Stroke */}
        {currentStroke && (
           <path
             d={toPath(currentStroke.points)}
             fill="none"
             stroke="#3b82f6" // Blue while drawing
             strokeWidth="6"
             strokeLinecap="round"
             strokeLinejoin="round"
           />
        )}
      </svg>
    </Card>
  );
}