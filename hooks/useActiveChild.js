"use client";

import { useContext } from "react";
import { ActiveChildContext } from "@/components/app/ActiveChildProvider";

export function useActiveChild() {
  const ctx = useContext(ActiveChildContext);
  if (!ctx) {
    throw new Error("useActiveChild must be used within <ActiveChildProvider />");
  }
  return ctx;
}
