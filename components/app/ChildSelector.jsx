"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabaseClient";
import AvatarBadge from "./AvatarBadge";

export default function ChildSelector({ value, onChange }) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id;
      if (!uid) return;

      const { data } = await supabase
        .from("children")
        .select("id,display_name,year_level,avatar_config")
        .eq("parent_id", uid)
        .order("created_at", { ascending: true });

      setChildren(data ?? []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  if (loading) return <div className="text-xs font-semibold text-slate-600">Loading…</div>;
  if (!children.length) return null;

  return (
    <div className="flex items-center gap-3">
      <label className="text-xs font-extrabold text-slate-600">Learner</label>
      <select
        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
        value={value ?? children[0].id}
        onChange={(e) => onChange(e.target.value)}
      >
        {children.map((c) => (
          <option key={c.id} value={c.id}>
            {c.display_name}
          </option>
        ))}
      </select>

      {(() => {
        const current = children.find((c) => c.id === (value ?? children[0].id));
        const avatarId = current?.avatar_config?.avatarId ?? "lion";
        return <AvatarBadge avatarId={avatarId} size={42} />;
      })()}
    </div>
  );
}
