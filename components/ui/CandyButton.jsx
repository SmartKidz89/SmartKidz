
"use client";

import { motion } from "framer-motion";
import { useSound } from "@/hooks/useSound";
import { cn } from "@/lib/utils"; // Assuming a utils file exists, or I'll create class merger

export function CandyButton({
    children,
    variant = "primary",
    size = "md",
    className,
    onClick,
    ...props
}) {
    const { play } = useSound();

    const variants = {
        primary: "bg-amber-400 border-amber-600 shadow-[0_4px_0_0_rgb(217,119,6)] text-amber-950",
        secondary: "bg-sky-400 border-sky-600 shadow-[0_4px_0_0_rgb(3,105,161)] text-sky-950",
        success: "bg-emerald-400 border-emerald-600 shadow-[0_4px_0_0_rgb(5,150,105)] text-emerald-950",
        danger: "bg-rose-400 border-rose-600 shadow-[0_4px_0_0_rgb(225,29,72)] text-rose-950",
        neutral: "bg-slate-100 border-slate-300 shadow-[0_4px_0_0_rgb(203,213,225)] text-slate-700",
    };

    const sizes = {
        sm: "px-4 py-2 text-sm rounded-xl border-x-2 border-t-2 border-b-4",
        md: "px-6 py-3 text-base rounded-2xl border-x-2 border-t-2 border-b-4",
        lg: "px-8 py-4 text-lg rounded-3xl border-x-4 border-t-4 border-b-8 shadow-[0_6px_0_0_rgba(0,0,0,0.2)]", // Override shadow for large?
    };

    const activeVariant = variants[variant] || variants.primary;
    const activeSize = sizes[size] || sizes.md;

    return (
        <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ y: 2, boxShadow: "0 0px 0 0 transparent" }} // Push down effect
            className={cn(
                "font-black uppercase tracking-wide transition-all select-none active:border-b-0 active:translate-y-1",
                activeVariant,
                activeSize,
                className
            )}
            onClick={(e) => {
                play("click");
                onClick && onClick(e);
            }}
            {...props}
        >
            {children}
        </motion.button>
    );
}
