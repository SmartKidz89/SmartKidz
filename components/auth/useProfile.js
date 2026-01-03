"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { useSession } from "./useSession";

export function useProfile() {
  const { session } = useSession();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!session) {
        if (!mounted) return;
        setProfile(null);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        setProfile({ id: session.user.id, role: "parent" });
        setLoading(false);
        return;
      }

      // If no profile row exists yet, default to parent view
      setProfile(data ?? { id: session.user.id, role: "parent" });
      setLoading(false);
    }
    run();
    return () => { mounted = false; };
  }, [session, supabase]);

  return { profile, loading };
}
