"use client";
import { motion } from "framer-motion";
import { transitions } from "@/lib/motion";

const COLOR = {
  indigo: "from-indigo-500/20 to-indigo-600/10",
  sky: "from-sky-500/20 to-sky-600/10",
  emerald: "from-emerald-500/20 to-emerald-600/10",
  rose: "from-rose-500/20 to-rose-600/10",
  amber: "from-amber-500/20 to-amber-600/10",
};

const FACE = {
  smile: "😊",
  grin: "😁",
  cool: "😎",
  curious: "🤓",
  star: "🤩",
};

const HAT = {
  none: "",
  cap: "🧢",
  crown: "👑",
  headphones: "🎧",
  bow: "🎀",
};

export default function ChildAvatar({ config = {}, size = 56, className = "" }) {
  const color = COLOR[config.color || "indigo"] || COLOR.indigo;
  const face = FACE[config.face || "smile"] || FACE.smile;
  const hat = HAT[config.hat || "none"] ?? "";

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, transition: transitions.micro }}
    >
      <div
        className={`skz-glass skz-press overflow-hidden flex items-center justify-center bg-gradient-to-br ${color}`}
        style={{ width: size, height: size, borderRadius: "999px" }}
      >
        <div className="text-[22px]" style={{ lineHeight: 1 }}>
          {face}
        </div>
      </div>
      {hat ? (
        <div className="absolute -top-2 right-0 text-[18px] drop-shadow-sm">
          {hat}
        </div>
      ) : null}
    </motion.div>
  );
}
