"use client";

import { useEffect } from "react";
import { hasSeenMoment, useMoments } from "@/components/ui/MomentsProvider";
import { playUISound, haptic } from "@/components/ui/sound";

function weekKey(d = new Date()) {
  // ISO week-ish key: year + week number
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function useFirstTimeWelcome({ childId, childName }) {
  const { show, markSeen } = useMoments();
  useEffect(() => {
    if (!childId) return;
    const id = "welcome_v1";
    if (hasSeenMoment(childId, id)) return;

    const name = childName || "friend";
    show({
      id,
      title: `Welcome back, ${name}!`,
      body:
        "Today we’ll learn one small thing that makes school feel easier. Pick any lesson and go at your pace. Small wins add up.",
      cta: "Let’s go",
      onCta: () => {
        try { playUISound("complete"); haptic("light"); } catch {}
      },
    });
    markSeen(childId, id);
  }, [childId, childName, show, markSeen]);
}

export function useWeeklyReflection({ childId, childName, minutes = 45, lessons = 6 }) {
  const { show, markSeen } = useMoments();
  useEffect(() => {
    if (!childId) return;
    const wk = weekKey();
    const id = `weekly_reflection_${wk}`;
    if (hasSeenMoment(childId, id)) return;

    const name = childName || "your child";
    show({
      id,
      title: "Weekly reflection",
      body:
        `${name} has been building momentum this week. ` +
        `Time learning: ${minutes} minutes. Lessons completed: ${lessons}. ` +
        "A short lesson most days is the fastest way to build confidence and a streak.",
      cta: "View worlds",
    });
    markSeen(childId, id);
  }, [childId, childName, minutes, lessons, show, markSeen]);
}

// Rare encouragement: 1% chance per session, max once per day
export function useEncouragement({ childId, childName }) {
  const { show, markSeen } = useMoments();
  useEffect(() => {
    if (!childId) return;
    const today = new Date().toISOString().slice(0, 10);
    const id = `encourage_${today}`;
    if (hasSeenMoment(childId, id)) return;
    if (Math.random() > 0.01) return;

    const name = childName || "you";
    show({
      id,
      title: "You’re doing great",
      body:
        `${name}, learning is like building a muscle. Every time you try, your brain gets stronger — even if it feels hard at first.`,
      cta: "Keep going",
    });
    markSeen(childId, id);
  }, [childId, childName, show, markSeen]);
}
