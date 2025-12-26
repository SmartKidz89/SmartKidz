"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const NavMotionContext = createContext({ direction: 1 });

export function NavMotionProvider({ children }) {
  const pathname = usePathname();
  const prev = useRef(pathname);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    // Heuristic: if navigating to a shallower path, treat as back (-1)
    const a = (prev.current || "").split("/").filter(Boolean);
    const b = (pathname || "").split("/").filter(Boolean);
    const isBack = b.length < a.length;
    setDirection(isBack ? -1 : 1);
    prev.current = pathname;
  }, [pathname]);

  const value = useMemo(() => ({ direction }), [direction]);

  return <NavMotionContext.Provider value={value}>{children}</NavMotionContext.Provider>;
}

export function useNavMotion() {
  return useContext(NavMotionContext);
}
