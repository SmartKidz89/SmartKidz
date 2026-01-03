"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAdminMe } from "@/components/admin/useAdminMe";
import { BLOCK_TYPES, defaultBlock, normalizePageContent } from "@/lib/cms/blocks";
import RenderBlocks from "@/components/cms/RenderBlocks";
import { useUndoRedoState } from "@/components/cms/builder/useUndoRedo";
import LinkPickerModal from "@/components/cms/builder/LinkPickerModal";
import AssetPickerModal from "@/components/cms/builder/AssetPickerModal";

import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  GripVertical,
  Plus,
  Redo2,
  Save,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";

function slugify(input) {
  return (input || "")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\-\/]+/g, "")
    .toLowerCase();
}

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function SiteBuilderEditor() {
  const { role, loading, authenticated } = useAdminMe();
  const canUse = !loading && authenticated && (role === "admin" || role === "root");

  const [pages, setPages] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedMeta, setSelectedMeta] = useState(null);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const [device, setDevice] = useState("desktop"); // desktop | tablet | mobile
  const [previewMode, setPreviewMode] = useState(false);

  const [linkPicker, setLinkPicker] = useState({ open: false, value: "", onPick: null });
  const [assetPicker, setAssetPicker] = useState({ open: false, onPick: null });

  const [content, setContent, history] = useUndoRedoState({ version: 1, blocks: [] }, { limit: 80 });
  const [selectedBlockId, setSelectedBlockId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const blocks = Array.isArray(content?.blocks) ? content.blocks : [];
  const selectedBlock = useMemo(() => blocks.find((b) => b?.id === selectedBlockId) || null, [blocks, selectedBlockId]);

  async function loadPages() {
    setMsg(null);
    const res = await fetch("/api/admin/cms-pages", { cache: "no-store" });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || "Failed to load pages");
    setPages(j.pages || []);
  }

  async function loadAssets() {
    try {
      const res = await fetch("/api/admin/assets", { cache: "no-store" });
      const j = await res.json();
      if (res.ok) setAssets(j.assets || []);
    } catch {
      // ignore
    }
  }

  async function loadPage(id) {
    setMsg(null);
    const res = await fetch(`/api/admin/cms-pages?id=${encodeURIComponent(id)}`, { cache: "no-store" });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || "Failed to load page");
    const page = j.pages?.[0];
    if (!page) throw new Error("Page not found");

    const normalized = normalizePageContent(page.content_json);
    setSelectedMeta(page);
    setSelectedId(page.id);
    setSelectedBlockId(normalized.blocks?.[0]?.id || null);
    history.reset(normalized);
  }

  useEffect(() => {
    if (!canUse) return;
    loadPages().catch((e) => setMsg(e.message));
    loadAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUse]);

  function updateMeta(k, v) {
    setSelectedMeta((p) => ({ ...p, [k]: v }));
  }

  function addBlock(type) {
    const blk = defaultBlock(type);
    setContent((c) => ({ ...c, blocks: [...(c.blocks || []), blk] }));
    setSelectedBlockId(blk.id);
  }

  function updateBlock(blockId, patch) {
    setContent((c) => ({
      ...c,
      blocks: (c.blocks || []).map((b) => (b.id === blockId ? { ...b, ...patch } : b)),
    }));
  }

  function duplicateBlock(blockId) {
    setContent((c) => {
      const list = [...(c.blocks || [])];
      const idx = list.findIndex((b) => b.id === blockId);
      if (idx < 0) return c;
      const original = list[idx];
      const copy = { ...original, id: `${original.type}_${Date.now()}` };
      list.splice(idx + 1, 0, copy);
      return { ...c, blocks: list };
    });
  }

  function removeBlock(blockId) {
    setContent((c) => ({ ...c, blocks: (c.blocks || []).filter((b) => b.id !== blockId) }));
    if (selectedBlockId === blockId) {
      const next = blocks.find((b) => b.id !== blockId);
      setSelectedBlockId(next?.id || null);
    }
  }

  function moveBlock(blockId, dir) {
    setContent((c) => {
      const list = [...(c.blocks || [])];
      const idx = list.findIndex((b) => b.id === blockId);
      if (idx < 0) return c;
      const j = idx + dir;
      if (j < 0 || j >= list.length) return c;
      const tmp = list[idx];
      list[idx] = list[j];
      list[j] = tmp;
      return { ...c, blocks: list };
    });
  }

  async function createNew() {
    const title = prompt("Page title?") || "";
    if (!title.trim()) return;
    const slug = slugify(prompt("Slug (e.g. marketing/new-page or app/help)?") || title);
    if (!slug) return;

    const scope = slug.startsWith("app/") ? "app" : "marketing";
    const cleanSlug = scope === "app" ? slug.replace(/^app\//, "") : slug.replace(/^marketing\//, "");

    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/cms-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope,
          slug: cleanSlug,
          title: title.trim(),
          published: false,
          content_json: { version: 1, blocks: [defaultBlock("hero")] },
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Create failed");
      await loadPages();
      await loadPage(j.page.id);
      setMsg("Page created.");
    } catch (e) {
      setMsg(e?.message || "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!selectedMeta) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/cms-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedMeta.id,
          scope: selectedMeta.scope,
          slug: selectedMeta.slug,
          title: selectedMeta.title,
          published: !!selectedMeta.published,
          content_json: content,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Save failed");
      await loadPages();
      setSelectedMeta((p) => ({ ...p, updated_at: j.page.updated_at }));
      setMsg("Saved.");
    } catch (e) {
      setMsg(e?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function deletePage() {
    if (!selectedMeta) return;
    if (!confirm(`Delete ${selectedMeta.scope}/${selectedMeta.slug}? This cannot be undone.`)) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/cms-pages?id=${encodeURIComponent(selectedMeta.id)}`, {
        method: "DELETE",
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Delete failed");
      setSelectedMeta(null);
      setSelectedId(null);
      history.reset({ version: 1, blocks: [] });
      setSelectedBlockId(null);
      await loadPages();
      setMsg("Deleted.");
    } catch (e) {
      setMsg(e?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function aiDraft() {
    const promptText = prompt("Describe the page you want (tone, audience, sections, CTA).") || "";
    if (!promptText.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/cms-pages/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Draft failed");
      const normalized = normalizePageContent(j.content_json);
      history.reset(normalized);
      setSelectedBlockId(normalized.blocks?.[0]?.id || null);
      setMsg("Draft created. Review and save when ready.");
    } catch (e) {
      setMsg(e?.message || "Draft failed");
    } finally {
      setBusy(false);
    }
  }

  const pageUrl = selectedMeta
    ? selectedMeta.scope === "marketing"
      ? `/marketing/p/${selectedMeta.slug}`
      : `/app/p/${selectedMeta.slug}`
    : null;

  const deviceFrameClass =
    device === "mobile" ? "max-w-[420px]" : device === "tablet" ? "max-w-[860px]" : "max-w-[1200px]";

  if (loading) return null;

  if (!canUse) {
    return (
      <Card className="p-6">
        <div className="text-xl font-extrabold">Admin only</div>
        <p className="mt-2 text-slate-700">You need to be signed in to the Admin Console to use the Site Builder.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Builder</div>
          <div className="text-2xl font-semibold">Pages</div>
          <div className="mt-1 text-sm text-slate-600">
            Edit pages visually, then publish. Live URLs render at <code className="px-1 rounded bg-slate-50 border">/marketing/p/&lt;slug&gt;</code> and <code className="px-1 rounded bg-slate-50 border">/app/p/&lt;slug&gt;</code>.
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" onClick={createNew} disabled={busy}>
            <Plus className="w-4 h-4" /> New
          </Button>
          <Button variant="secondary" onClick={aiDraft} disabled={busy || !selectedMeta}>
            <Sparkles className="w-4 h-4" /> AI draft
          </Button>
          <Button onClick={save} disabled={busy || !selectedMeta}>
            <Save className="w-4 h-4" /> Save
          </Button>
        </div>
      </div>

      {msg ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
          {msg}
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr_360px] gap-4">
        {/* Left: pages + block library */}
        <div className="grid gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Pages</div>
              <button
                className="text-xs text-slate-500 hover:text-slate-800"
                onClick={() => loadPages().catch((e) => setMsg(e.message))}
                disabled={busy}
              >
                Refresh
              </button>
            </div>
            <div className="mt-3 grid gap-2 max-h-[44vh] overflow-auto pr-1">
              {pages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => loadPage(p.id).catch((e) => setMsg(e.message))}
                  className={cx(
                    "text-left rounded-2xl border px-3 py-2 transition",
                    selectedId === p.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-sm truncate">
                      {p.scope}/{p.slug}
                    </div>
                    <div
                      className={cx(
                        "text-[10px] font-semibold px-2 py-1 rounded-full",
                        p.published ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {p.published ? "LIVE" : "DRAFT"}
                    </div>
                  </div>
                  <div className={cx("mt-1 text-xs truncate", selectedId === p.id ? "text-white/80" : "text-slate-600")}>
                    {p.title}
                  </div>
                </button>
              ))}
              {!pages.length ? <div className="text-sm text-slate-600">No pages yet. Create one.</div> : null}
            </div>
          </Card>

          <Card className="p-4">
            <div className="font-semibold">Add blocks</div>
            <div className="mt-3 grid gap-2">
              <select
                className="h-11 rounded-2xl border border-slate-200 px-3 text-sm"
                disabled={!selectedMeta}
                onChange={(e) => {
                  const t = e.target.value;
                  if (t) addBlock(t);
                  e.target.value = "";
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  Select a block…
                </option>
                {Object.keys(BLOCK_TYPES).map((t) => (
                  <option key={t} value={t}>
                    {BLOCK_TYPES[t]}
                  </option>
                ))}
              </select>
              <div className="text-xs text-slate-500">Tip: click any section on the canvas to edit it.</div>
            </div>
          </Card>
        </div>

        {/* Center: canvas */}
        <Card className="p-0 overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="font-semibold">Canvas</div>
              {pageUrl ? (
                <a
                  href={pageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-500 hover:text-slate-900 underline"
                >
                  Open live
                </a>
              ) : null}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                className={cx(
                  "h-9 rounded-xl border px-3 text-sm",
                  device === "mobile" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 hover:bg-slate-50"
                )}
                onClick={() => setDevice("mobile")}
                disabled={!selectedMeta}
              >
                Mobile
              </button>
              <button
                className={cx(
                  "h-9 rounded-xl border px-3 text-sm",
                  device === "tablet" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 hover:bg-slate-50"
                )}
                onClick={() => setDevice("tablet")}
                disabled={!selectedMeta}
              >
                Tablet
              </button>
              <button
                className={cx(
                  "h-9 rounded-xl border px-3 text-sm",
                  device === "desktop" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 hover:bg-slate-50"
                )}
                onClick={() => setDevice("desktop")}
                disabled={!selectedMeta}
              >
                Desktop
              </button>

              <span className="w-px h-7 bg-slate-200 mx-1" />

              <button
                className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                onClick={history.undo}
                disabled={!history.canUndo || !selectedMeta}
                title="Undo"
              >
                <Undo2 className="w-4 h-4 mx-auto" />
              </button>
              <button
                className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                onClick={history.redo}
                disabled={!history.canRedo || !selectedMeta}
                title="Redo"
              >
                <Redo2 className="w-4 h-4 mx-auto" />
              </button>

              <span className="w-px h-7 bg-slate-200 mx-1" />

              <button
                className={cx(
                  "h-9 rounded-xl border px-3 text-sm flex items-center gap-2",
                  previewMode ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 hover:bg-slate-50"
                )}
                onClick={() => setPreviewMode((v) => !v)}
                disabled={!selectedMeta}
                title="Toggle preview"
              >
                <Eye className="w-4 h-4" /> {previewMode ? "Preview" : "Edit"}
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-4">
            {!selectedMeta ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="font-semibold">Select a page to start</div>
                <div className="mt-1 text-sm text-slate-600">Choose a page on the left, or create a new one.</div>
              </div>
            ) : (
              <div className={cx("mx-auto rounded-[28px] border border-slate-200 bg-white shadow-sm", deviceFrameClass)}>
                <RenderBlocks
                  content={content}
                  selectable={!previewMode}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={(id) => setSelectedBlockId(id)}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Right: inspector */}
        <div className="grid gap-4">
          <Card className="p-4">
            <div className="font-semibold">Page settings</div>
            {!selectedMeta ? (
              <div className="mt-2 text-sm text-slate-600">Select a page to edit settings.</div>
            ) : (
              <div className="mt-3 grid gap-3">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-slate-500">Scope</span>
                  <select
                    className="h-11 rounded-xl border border-slate-200 px-3 bg-white"
                    value={selectedMeta.scope}
                    onChange={(e) => updateMeta("scope", e.target.value)}
                  >
                    <option value="marketing">marketing (public)</option>
                    <option value="app">app (logged-in)</option>
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-slate-500">Slug</span>
                  <input
                    className="h-11 rounded-xl border border-slate-200 px-3"
                    value={selectedMeta.slug}
                    onChange={(e) => updateMeta("slug", slugify(e.target.value))}
                  />
                  <span className="text-xs text-slate-500">URL: {pageUrl}</span>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-semibold text-slate-500">Title</span>
                  <input
                    className="h-11 rounded-xl border border-slate-200 px-3"
                    value={selectedMeta.title || ""}
                    onChange={(e) => updateMeta("title", e.target.value)}
                  />
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedMeta.published)}
                    onChange={(e) => updateMeta("published", e.target.checked)}
                  />
                  Published
                </label>

                <div className="pt-2 flex gap-2">
                  <Button variant="danger" onClick={deletePage} disabled={busy}>
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold">Blocks</div>
                <div className="text-xs text-slate-500">Drag to reorder. Select to edit.</div>
              </div>
            </div>

            {!selectedMeta ? (
              <div className="mt-2 text-sm text-slate-600">Select a page first.</div>
            ) : (
              <div className="mt-3">
                <BlocksSortableList
                  sensors={sensors}
                  blocks={blocks}
                  selectedBlockId={selectedBlockId}
                  onSelect={(id) => setSelectedBlockId(id)}
                  onReorder={(activeId, overId) => {
                    const oldIndex = blocks.findIndex((b) => b.id === activeId);
                    const newIndex = blocks.findIndex((b) => b.id === overId);
                    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;
                    setContent((c) => ({ ...c, blocks: arrayMove(c.blocks || [], oldIndex, newIndex) }));
                  }}
                />
              </div>
            )}
          </Card>

          <Card className="p-4">
            <div className="font-semibold">Inspector</div>
            {!selectedBlock ? (
              <div className="mt-2 text-sm text-slate-600">Select a block on the canvas or in the list.</div>
            ) : (
              <div className="mt-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold">
                    {BLOCK_TYPES[selectedBlock.type] || selectedBlock.type}
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-slate-50"
                      title="Move up"
                      onClick={() => moveBlock(selectedBlock.id, -1)}
                    >
                      <ChevronUp className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-slate-50"
                      title="Move down"
                      onClick={() => moveBlock(selectedBlock.id, 1)}
                    >
                      <ChevronDown className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-slate-50"
                      title="Duplicate"
                      onClick={() => duplicateBlock(selectedBlock.id)}
                    >
                      <Copy className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      className="h-9 w-9 rounded-xl border border-slate-200 hover:border-rose-300 hover:text-rose-700"
                      title="Delete"
                      onClick={() => removeBlock(selectedBlock.id)}
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <BlockFields
                    block={selectedBlock}
                    pages={pages}
                    assets={assets}
                    onChange={(patch) => updateBlock(selectedBlock.id, patch)}
                    onPickLink={(current, onPick) => setLinkPicker({ open: true, value: current || "", onPick })}
                    onPickAsset={(onPick) => setAssetPicker({ open: true, onPick })}
                  />
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <LinkPickerModal
        open={linkPicker.open}
        pages={pages}
        value={linkPicker.value}
        onPick={(href) => linkPicker.onPick?.(href)}
        onClose={() => setLinkPicker({ open: false, value: "", onPick: null })}
      />

      <AssetPickerModal
        open={assetPicker.open}
        assets={assets}
        onPick={(asset) => assetPicker.onPick?.(asset)}
        onClose={() => setAssetPicker({ open: false, onPick: null })}
      />
    </div>
  );
}

function BlocksSortableList({ sensors, blocks, selectedBlockId, onSelect, onReorder }) {
  const ids = blocks.map((b) => b.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return;
        onReorder?.(active.id, over.id);
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="grid gap-2 max-h-[36vh] overflow-auto pr-1">
          {blocks.map((b, idx) => (
            <SortableRow
              key={b.id}
              id={b.id}
              idx={idx}
              type={b.type}
              selected={b.id === selectedBlockId}
              onClick={() => onSelect?.(b.id)}
            />
          ))}
          {!blocks.length ? <div className="text-sm text-slate-500">No blocks yet.</div> : null}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, idx, type, selected, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cx(
        "rounded-xl border px-3 py-2 flex items-center justify-between gap-2",
        selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:bg-slate-50"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="min-w-0">
        <div className="text-xs font-semibold opacity-80">{idx + 1}</div>
        <div className="text-sm font-semibold truncate">{BLOCK_TYPES[type] || type}</div>
      </div>
      <div
        className={cx(
          "h-9 w-9 rounded-xl border flex items-center justify-center",
          selected ? "border-white/20" : "border-slate-200"
        )}
        {...attributes}
        {...listeners}
        title="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className={cx("w-4 h-4", selected ? "text-white/80" : "text-slate-600")} />
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function BlockFields({ block, onChange, pages, assets, onPickLink, onPickAsset }) {
  if (!block) return null;

  switch (block.type) {
    case "hero":
      return (
        <div className="grid gap-3">
          <Field label="Headline">
            <input
              className="h-11 w-full rounded-xl border border-slate-200 px-3"
              value={block.headline || ""}
              onChange={(e) => onChange({ headline: e.target.value })}
            />
          </Field>
          <Field label="Subheadline">
            <textarea
              className="min-h-[90px] w-full rounded-xl border border-slate-200 px-3 py-2"
              value={block.subheadline || ""}
              onChange={(e) => onChange({ subheadline: e.target.value })}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="CTA text">
              <input
                className="h-11 w-full rounded-xl border border-slate-200 px-3"
                value={block.ctaText || ""}
                onChange={(e) => onChange({ ctaText: e.target.value })}
              />
            </Field>
            <Field label="CTA link">
              <div className="flex gap-2">
                <input
                  className="h-11 w-full rounded-xl border border-slate-200 px-3"
                  value={block.ctaHref || ""}
                  onChange={(e) => onChange({ ctaHref: e.target.value })}
                  placeholder="/marketing/p/... or /app/..."
                />
                <button
                  className="h-11 rounded-xl border border-slate-200 px-3 text-sm hover:bg-slate-50"
                  type="button"
                  onClick={() => onPickLink?.(block.ctaHref, (href) => onChange({ ctaHref: href }))}
                >
                  Pick
                </button>
              </div>
            </Field>
          </div>
        </div>
      );

    case "section":
      return (
        <div className="grid gap-3">
          <Field label="Title">
            <input
              className="h-11 w-full rounded-xl border border-slate-200 px-3"
              value={block.title || ""}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </Field>
          <Field label="Body">
            <textarea
              className="min-h-[110px] w-full rounded-xl border border-slate-200 px-3 py-2"
              value={block.body || ""}
              onChange={(e) => onChange({ body: e.target.value })}
            />
          </Field>
        </div>
      );

    case "cards":
      return (
        <div className="grid gap-3">
          <Field label="Title">
            <input
              className="h-11 w-full rounded-xl border border-slate-200 px-3"
              value={block.title || ""}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </Field>

          <div className="grid gap-2">
            {(block.cards || []).map((c, idx) => (
              <div key={c.id || idx} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-700">Card {idx + 1}</div>
                  <button
                    className="text-xs font-semibold text-rose-700 hover:underline"
                    type="button"
                    onClick={() => {
                      const next = (block.cards || []).filter((x) => x !== c);
                      onChange({ cards: next });
                    }}
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-2 grid gap-2">
                  <input
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    placeholder="Card title"
                    value={c.title || ""}
                    onChange={(e) => {
                      const next = (block.cards || []).map((x) => (x === c ? { ...x, title: e.target.value } : x));
                      onChange({ cards: next });
                    }}
                  />
                  <textarea
                    className="min-h-[70px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Card body"
                    value={c.body || ""}
                    onChange={(e) => {
                      const next = (block.cards || []).map((x) => (x === c ? { ...x, body: e.target.value } : x));
                      onChange({ cards: next });
                    }}
                  />
                </div>
              </div>
            ))}

            <button
              className="h-11 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-sm"
              type="button"
              onClick={() => {
                const next = [...(block.cards || []), { id: `card_${Date.now()}`, title: "New card", body: "" }];
                onChange({ cards: next });
              }}
            >
              <span className="inline-flex items-center gap-2 justify-center">
                <Plus className="w-4 h-4" /> Add card
              </span>
            </button>
          </div>
        </div>
      );

    case "markdown":
      return (
        <div className="grid gap-3">
          <Field label="Markdown">
            <textarea
              className="min-h-[200px] w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"
              value={block.markdown || ""}
              onChange={(e) => onChange({ markdown: e.target.value })}
            />
          </Field>
        </div>
      );

    case "image":
      return (
        <div className="grid gap-3">
          <Field label="Image">
            <div className="flex gap-2">
              <input
                className="h-11 w-full rounded-xl border border-slate-200 px-3"
                placeholder="https://…"
                value={block.url || ""}
                onChange={(e) => onChange({ url: e.target.value })}
              />
              <button
                type="button"
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm hover:bg-slate-50"
                onClick={() => onPickAsset?.((asset) => onChange({ url: asset.public_url, alt: asset.alt_text || "" }))}
              >
                Pick
              </button>
            </div>
            {block.url ? (
              <div className="mt-2 rounded-xl border border-slate-200 p-2 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.url} alt={block.alt || ""} className="max-h-40 w-auto rounded-lg border border-slate-200" />
              </div>
            ) : null}
            {!assets?.length ? (
              <div className="mt-1 text-xs text-slate-500">No assets found. Upload in Admin → Media.</div>
            ) : null}
          </Field>

          <Field label="Alt text">
            <input
              className="h-11 w-full rounded-xl border border-slate-200 px-3"
              value={block.alt || ""}
              onChange={(e) => onChange({ alt: e.target.value })}
            />
          </Field>

          <Field label="Caption">
            <input
              className="h-11 w-full rounded-xl border border-slate-200 px-3"
              value={block.caption || ""}
              onChange={(e) => onChange({ caption: e.target.value })}
            />
          </Field>

          <Field label="Max width">
            <select
              className="h-11 w-full rounded-xl border border-slate-200 px-3 bg-white"
              value={block.maxWidth || "xl"}
              onChange={(e) => onChange({ maxWidth: e.target.value })}
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">XL</option>
            </select>
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={block.rounded !== false}
              onChange={(e) => onChange({ rounded: e.target.checked })}
            />
            Rounded corners
          </label>
        </div>
      );

    case "divider":
      return (
        <div className="grid gap-3">
          <Field label="Style">
            <select
              className="h-11 w-full rounded-xl border border-slate-200 px-3 bg-white"
              value={block.style || "line"}
              onChange={(e) => onChange({ style: e.target.value })}
            >
              <option value="line">Line</option>
              <option value="space">Space</option>
            </select>
          </Field>
        </div>
      );

    case "spacer":
      return (
        <div className="grid gap-3">
          <Field label="Size">
            <select
              className="h-11 w-full rounded-xl border border-slate-200 px-3 bg-white"
              value={block.size || "md"}
              onChange={(e) => onChange({ size: e.target.value })}
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </Field>
        </div>
      );

    default:
      return (
        <div className="mt-2 text-sm text-slate-600">
          Unknown block type: <code className="px-1 rounded bg-slate-50 border">{block.type}</code>
        </div>
      );
  }
}
