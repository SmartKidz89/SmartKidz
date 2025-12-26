"use client";

import Link from "next/link";
import ChildAvatar from "@/components/avatar/ChildAvatar";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getSupabaseClient } from "../../../lib/supabaseClient";
import { Plus, UserRound, Trash2, Save, Palette } from "lucide-react";
import AvatarBadge, { AvatarPicker } from '@/components/app/AvatarBadge';
import { THEME_PRESETS } from "../../../lib/themePresets";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";;

export default function ChildrenManager() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  async function load() {
    setLoading(true);
    setMsg(null);
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData?.session?.user?.id;
    if (!uid) {
      setLoading(false);
      setChildren([]);
      return;
    }

    const { data, error } = await supabase
      .from("children")
      .select("id,display_name, avatar_config,year_level,created_at")
      .eq("parent_id", uid)
      .order("created_at", { ascending: true });

    if (error) setMsg(error.message);
    setChildren(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addChild() {
    setSaving(true);
    setMsg(null);
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData?.session?.user?.id;
    if (!uid) return;

    const payload = {
      parent_id: uid,
      display_name: "New Child",
      year_level: 1,
      avatar_config: {},
      accessibility_settings: { readAloud: true, captions: true },
      learning_style_defaults: { preferred: "story" }
    };

    const { error } = await supabase.from("children").insert(payload);
    if (error) setMsg(error.message);
    await load();
    setSaving(false);
  }

  async function saveChild(id, patch) {
    setSaving(true);
    setMsg(null);
    const { error } = await supabase.from("children").update(patch).eq("id", id);
    if (error) setMsg(error.message);
    await load();
    setSaving(false);
  }

  async function removeChild(id) {
    if (!confirm("Delete this child profile? This cannot be undone.")) return;
    setSaving(true);
    setMsg(null);
    const { error } = await supabase.from("children").delete().eq("id", id);
    if (error) setMsg(error.message);
    await load();
    setSaving(false);
  }

  return (
    <PageScaffold badge="Profiles" title="Manage Children" subtitle="Create profiles, pick avatars, and tune learning settings.">
    <main className="min-h-screen">
      <div className="container-pad py-12">
        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-semibold text-slate-600">Settings</div>
            <h1 className="text-4xl font-extrabold tracking-tight">Children</h1>
            <p className="mt-2 text-slate-700 max-w-2xl">
              Create separate learning profiles for each child. Each profile tracks year level and progress.
            </p>
          </div>
          <Button onClick={addChild} disabled={saving}>
            <Plus className="h-4 w-4" /> Add child
          </Button>
        </div>

        {msg && (
          <Card className="p-5 border-amber-200 bg-amber-50">
            <div className="font-bold">Notice</div>
            <div className="text-sm text-slate-700 mt-1">{msg}</div>
          </Card>
        )}

        {loading ? (
          <div className="text-slate-700">Loading…</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {children.map((c) => (
              <Card key={c.id} className="p-7">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-brand-primary text-white grid place-items-center shadow-soft">
                      <UserRound className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-lg font-extrabold">{c.display_name}</div>
                      <div className="text-sm text-slate-600">Year {c.year_level}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeChild(c.id)}
                    className="h-10 w-10 grid place-items-center rounded-2xl hover:bg-slate-100"
                    aria-label="Delete"
                    disabled={saving}
                  >
                    <Trash2 className="h-5 w-5 text-slate-600" />
                  </button>
                </div>

                <div className="mt-5 grid gap-3">
                  <label className="text-sm font-semibold text-slate-700">Display name</label>
                  <input
                    className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-secondary"
                    defaultValue={c.display_name}
                    onBlur={(e) => saveChild(c.id, { display_name: e.target.value })}
                  />

                  <label className="text-sm font-semibold text-slate-700 mt-2">Year level</label>
                  <select
                    className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-secondary"
                    defaultValue={c.year_level}
                    onChange={(e) => saveChild(c.id, { year_level: Number(e.target.value) })}
                  >
                    {[1,2,3,4,5,6].map((y) => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-6 flex gap-3 flex-wrap">
                  <Button href={`/app`} variant="secondary">Go to dashboard</Button>
                  <Button href={`/app`} variant="outline">View progress</Button>
                </div>
              </Card>
            ))}
            {!children.length && (
              <Card className="p-8">
                <div className="text-2xl font-extrabold">No child profiles yet</div>
                <p className="mt-2 text-slate-700">Add a child profile to start tracking learning progress.</p>
                <div className="mt-4">
                  <Button onClick={addChild} disabled={saving}>
                    <Plus className="h-4 w-4" /> Add child
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </main>
    </PageScaffold>
  );
}
