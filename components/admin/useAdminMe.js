import { useEffect, useState } from "react";

export function useAdminMe() {
  const [state, setState] = useState({ loading: true, authenticated: false, user: null, role: null });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await fetch("/api/admin-auth/me", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        setState({
          loading: false,
          authenticated: !!data?.authenticated,
          user: data?.user || null,
          role: data?.role || null,
        });
      } catch {
        if (cancelled) return;
        setState({ loading: false, authenticated: false, user: null, role: null });
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  return state;
}
