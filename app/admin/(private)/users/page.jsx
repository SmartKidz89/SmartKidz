"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AdminNotice from "@/components/admin/AdminNotice";
import AdminModal from "@/components/admin/AdminModal";
import { cx } from "@/components/admin/adminUi";
import { Button, Input, Select } from "@/components/admin/AdminControls";

function Pill({ tone = "neutral", children }) {
  const cls =
    tone === "success"
      ? "bg-emerald-100 text-emerald-800"
      : tone === "warning"
      ? "bg-amber-100 text-amber-800"
      : tone === "danger"
      ? "bg-rose-100 text-rose-800"
      : "bg-slate-100 text-slate-700";
  return <span className={cx("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", cls)}>{children}</span>;
}

function fmtDate(iso) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toISOString().replace("T", " ").replace("Z", " UTC");
  } catch {
    return String(iso);
  }
}

function normalizeAdminUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    username: u.username || "",
    role: u.role === "root" ? "root" : "admin",
    is_active: u.is_active !== false,
    created_at: u.created_at || null,
    updated_at: u.updated_at || null,
  };
}

export default function AdminUsersPage() {
  const [tab, setTab] = useState("admin");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null); // {tone,title,message}

  // Admin users
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminSelectedId, setAdminSelectedId] = useState(null);
  const [adminQuery, setAdminQuery] = useState("");
  const [adminRoleFilter, setAdminRoleFilter] = useState("all"); // all|admin|root
  const [adminActiveFilter, setAdminActiveFilter] = useState("all"); // all|active|inactive

  const [adminForm, setAdminForm] = useState({ username: "", role: "admin", is_active: true });
  const adminBaselineRef = useRef({ username: "", role: "admin", is_active: true });

  const [newOpen, setNewOpen] = useState(false);
  const [newForm, setNewForm] = useState({ username: "", password: "", role: "admin", is_active: true });

  const [resetOpen, setResetOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);

  // App users
  const [appUsers, setAppUsers] = useState([]);
  const [appSelectedId, setAppSelectedId] = useState(null);
  const [appQuery, setAppQuery] = useState("");
  const [appPage, setAppPage] = useState(1);
  const [appPerPage, setAppPerPage] = useState(25);
  const [appTotal, setAppTotal] = useState(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleUserId, setRoleUserId] = useState(null);
  const [roleValue, setRoleValue] = useState("user");
  const [roleHints, setRoleHints] = useState({});

  const adminSelected = useMemo(() => {
    return normalizeAdminUser(adminUsers.find((x) => x.id === adminSelectedId));
  }, [adminUsers, adminSelectedId]);

  const adminDirty = useMemo(() => {
    return JSON.stringify(adminForm) !== JSON.stringify(adminBaselineRef.current);
  }, [adminForm]);

  const filteredAdminUsers = useMemo(() => {
    const q = adminQuery.trim().toLowerCase();
    return adminUsers
      .map(normalizeAdminUser)
      .filter(Boolean)
      .filter((u) => {
        if (adminRoleFilter !== "all" && u.role !== adminRoleFilter) return false;
        if (adminActiveFilter === "active" && u.is_active !== true) return false;
        if (adminActiveFilter === "inactive" && u.is_active !== false) return false;
        if (!q) return true;
        return String(u.username || "").toLowerCase().includes(q);
      });
  }, [adminUsers, adminQuery, adminRoleFilter, adminActiveFilter]);

  const appSelected = useMemo(() => {
    return appUsers.find((x) => x.id === appSelectedId) || null;
  }, [appUsers, appSelectedId]);

  const filteredAppUsers = useMemo(() => {
    const q = appQuery.trim().toLowerCase();
    if (!q) return appUsers;
    return appUsers.filter((u) => {
      const id = String(u.id || "").toLowerCase();
      const email = String(u.email || "").toLowerCase();
      return id.includes(q) || email.includes(q);
    });
  }, [appUsers, appQuery]);

  async function loadAdminUsers({ keepSelection = true } = {}) {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/admin-users", { cache: "no-store" });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error || "Failed to load admin users.");
      const list = (j?.users || []).map(normalizeAdminUser).filter(Boolean);
      setAdminUsers(list);
      if (!keepSelection) return;
      if (adminSelectedId) {
        const exists = list.some((x) => x.id === adminSelectedId);
        if (!exists) setAdminSelectedId(null);
      }
      if (!adminSelectedId && list.length) setAdminSelectedId(list[0].id);
    } catch (e) {
      setNotice({ tone: "danger", title: "Load failed", message: e.message || String(e) });
    } finally {
      setLoading(false);
    }
  }

  async function loadAppUsers({ keepSelection = true } = {}) {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/app-users?perPage=${encodeURIComponent(appPerPage)}&page=${encodeURIComponent(appPage)}`, {
        cache: "no-store",
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error || "Failed to load app users.");
      const list = j?.users || [];
      setAppUsers(list);
      setAppTotal(j?.total ?? null);
      if (!keepSelection) return;
      if (appSelectedId) {
        const exists = list.some((x) => x.id === appSelectedId);
        if (!exists) setAppSelectedId(null);
      }
      if (!appSelectedId && list.length) setAppSelectedId(list[0].id);
    } catch (e) {
      setNotice({ tone: "danger", title: "Load failed", message: e.message || String(e) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Reset notice when tab changes
    setNotice(null);
    if (tab === "admin") loadAdminUsers();
    if (tab === "app") loadAppUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (tab !== "app") return;
    loadAppUsers({ keepSelection: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appPage, appPerPage]);

  useEffect(() => {
    if (!adminSelected) {
      setAdminForm({ username: "", role: "admin", is_active: true });
      adminBaselineRef.current = { username: "", role: "admin", is_active: true };
      return;
    }
    const next = { username: adminSelected.username, role: adminSelected.role, is_active: adminSelected.is_active };
    setAdminForm(next);
    adminBaselineRef.current = next;
  }, [adminSelectedId]);

  // Keep selection sane as filters change
  useEffect(() => {
    if (tab !== "admin") return;
    if (!adminSelectedId) {
      if (filteredAdminUsers.length) setAdminSelectedId(filteredAdminUsers[0].id);
      return;
    }
    const exists = filteredAdminUsers.some((x) => x.id === adminSelectedId);
    if (!exists) setAdminSelectedId(filteredAdminUsers[0]?.id || null);
  }, [adminQuery, adminRoleFilter, adminActiveFilter, tab, adminSelectedId, filteredAdminUsers]);

  useEffect(() => {
    if (tab !== "app") return;
    if (!appSelectedId) {
      if (filteredAppUsers.length) setAppSelectedId(filteredAppUsers[0].id);
      return;
    }
    const exists = filteredAppUsers.some((x) => x.id === appSelectedId);
    if (!exists) setAppSelectedId(filteredAppUsers[0]?.id || null);
  }, [appQuery, tab, appSelectedId, filteredAppUsers]);

  async function saveAdminUser(payload) {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error || "Save failed.");
      setNotice({ tone: "success", title: "Saved", message: "User updated." });
      await loadAdminUsers({ keepSelection: true });
      if (j?.user?.id) setAdminSelectedId(j.user.id);
    } catch (e) {
      setNotice({ tone: "danger", title: "Save failed", message: e.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function createAdminUser() {
    const username = String(newForm.username || "").trim();
    const password = String(newForm.password || "");
    if (!username || !password) {
      setNotice({ tone: "warning", title: "Missing fields", message: "Username and temporary password are required." });
      return;
    }
    await saveAdminUser({ username, password, role: newForm.role, is_active: newForm.is_active });
    setNewOpen(false);
    setNewForm({ username: "", password: "", role: "admin", is_active: true });
  }

  async function deleteAdminUser(id) {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/admin-users?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error || "Delete failed.");
      setNotice({ tone: "success", title: "Deleted", message: "Admin user removed." });
      setDeleteOpen(false);
      setAdminSelectedId(null);
      await loadAdminUsers({ keepSelection: false });
    } catch (e) {
      setNotice({ tone: "danger", title: "Delete failed", message: e.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function applyPasswordReset() {
    if (!adminSelected) return;
    const pwd = String(resetPassword || "");
    if (!pwd) {
      setNotice({ tone: "warning", title: "Password required", message: "Enter a new password (or cancel)." });
      return;
    }
    await saveAdminUser({ id: adminSelected.id, username: adminSelected.username, role: adminForm.role, is_active: adminForm.is_active, password: pwd });
    setResetPassword("");
    setResetOpen(false);
  }

  async function openRoleModal(userId) {
    setRoleUserId(userId);
    setRoleValue(roleHints[userId] || "user");
    setRoleOpen(true);
  }

  async function setAppRole() {
    const user_id = roleUserId;
    const role = String(roleValue || "").trim();
    if (!user_id || !role) {
      setNotice({ tone: "warning", title: "Missing fields", message: "user_id and role are required." });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/app-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, role }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error || "Failed to update profile role.");
      setRoleHints((prev) => ({ ...prev, [user_id]: role }));
      setNotice({ tone: "success", title: "Updated", message: "Profile role saved." });
      setRoleOpen(false);
    } catch (e) {
      setNotice({ tone: "danger", title: "Update failed", message: e.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(String(text || ""));
      setNotice({ tone: "success", title: "Copied", message: "Copied to clipboard." });
    } catch (e) {
      setNotice({ tone: "warning", title: "Copy failed", message: e?.message || "Clipboard not available." });
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold">Users</div>
          <div className="mt-1 text-sm text-slate-500">
            Root-only. Manage Admin Console users and (optionally) application users.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button tone="secondary" onClick={() => (tab === "admin" ? loadAdminUsers() : loadAppUsers())} disabled={busy || loading}>
            Reload
          </Button>
          {tab === "admin" ? (
            <Button
              onClick={() => {
                setNotice(null);
                setNewForm({ username: "", password: "", role: "admin", is_active: true });
                setNewOpen(true);
              }}
              disabled={busy}
            >
              Add admin
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          className={cx(
            "h-10 rounded-xl px-4 border text-sm font-medium",
            tab === "admin" ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 hover:bg-slate-50"
          )}
          onClick={() => setTab("admin")}
        >
          Admin users
        </button>
        <button
          className={cx(
            "h-10 rounded-xl px-4 border text-sm font-medium",
            tab === "app" ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 hover:bg-slate-50"
          )}
          onClick={() => setTab("app")}
        >
          App users
        </button>
      </div>

      {notice ? (
        <div className="mt-4">
          <AdminNotice tone={notice.tone} title={notice.title}>
            {notice.message}
          </AdminNotice>
        </div>
      ) : null}

      {tab === "admin" ? (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4">
              <div className="text-sm font-semibold">Admin Console users</div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input placeholder="Search username…" value={adminQuery} onChange={(e) => setAdminQuery(e.target.value)} />
                <Select value={adminRoleFilter} onChange={(e) => setAdminRoleFilter(e.target.value)}>
                  <option value="all">All roles</option>
                  <option value="admin">admin</option>
                  <option value="root">root</option>
                </Select>
                <Select value={adminActiveFilter} onChange={(e) => setAdminActiveFilter(e.target.value)}>
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <div>
                  Showing <span className="font-medium text-slate-700">{filteredAdminUsers.length}</span> of {adminUsers.length}
                </div>
                <button
                  className="hover:text-slate-700"
                  onClick={() => {
                    setAdminQuery("");
                    setAdminRoleFilter("all");
                    setAdminActiveFilter("all");
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-[62vh] overflow-auto">
              {loading ? (
                <div className="p-4 text-sm text-slate-500">Loading…</div>
              ) : filteredAdminUsers.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">No users match the current filters.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredAdminUsers.map((u) => (
                    <button
                      key={u.id}
                      className={cx(
                        "w-full text-left p-4 hover:bg-slate-50",
                        u.id === adminSelectedId ? "bg-slate-50" : "bg-white"
                      )}
                      onClick={() => setAdminSelectedId(u.id)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{u.username}</div>
                          <div className="mt-1 flex items-center gap-2">
                            <Pill tone={u.role === "root" ? "warning" : "neutral"}>{u.role}</Pill>
                            <Pill tone={u.is_active ? "success" : "danger"}>{u.is_active ? "active" : "inactive"}</Pill>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">{fmtDate(u.updated_at || u.created_at)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">User details</div>
                <div className="mt-1 text-xs text-slate-500">Edit role and activation. Reset password and delete are destructive actions.</div>
              </div>
              <div className="flex items-center gap-2">
                {adminDirty ? <Pill tone="warning">Unsaved changes</Pill> : <Pill tone="success">Saved</Pill>}
                <Button
                  onClick={() => {
                    if (!adminSelected) return;
                    saveAdminUser({ id: adminSelected.id, username: adminForm.username, role: adminForm.role, is_active: adminForm.is_active });
                  }}
                  disabled={!adminSelected || busy || !adminDirty}
                >
                  Save
                </Button>
              </div>
            </div>

            {!adminSelected ? (
              <div className="p-6 text-sm text-slate-500">Select an admin user to view details.</div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-600">Username</div>
                    <div className="mt-1 flex items-center gap-2">
                      <Input value={adminForm.username} disabled readOnly />
                      <Button tone="secondary" onClick={() => copy(adminForm.username)} disabled={busy}>
                        Copy
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">Usernames are immutable once created (by design).</div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-600">Role</div>
                    <div className="mt-1">
                      <Select value={adminForm.role} onChange={(e) => setAdminForm((p) => ({ ...p, role: e.target.value }))}>
                        <option value="admin">admin</option>
                        <option value="root">root</option>
                      </Select>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">Root can access destructive and operational actions.</div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-600">Status</div>
                    <div className="mt-2 flex items-center justify-between rounded-2xl border border-slate-200 p-3">
                      <div>
                        <div className="text-sm font-medium">Active</div>
                        <div className="text-xs text-slate-500">Inactive users cannot log into the admin console.</div>
                      </div>
                      <input
                        type="checkbox"
                        className="h-5 w-5"
                        checked={!!adminForm.is_active}
                        onChange={(e) => setAdminForm((p) => ({ ...p, is_active: e.target.checked }))}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-600">Metadata</div>
                    <div className="mt-2 rounded-2xl border border-slate-200 p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-slate-500">Created</div>
                        <div className="font-mono text-xs">{fmtDate(adminSelected.created_at)}</div>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div className="text-slate-500">Updated</div>
                        <div className="font-mono text-xs">{fmtDate(adminSelected.updated_at)}</div>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div className="text-slate-500">ID</div>
                        <button className="font-mono text-xs hover:underline" onClick={() => copy(adminSelected.id)}>
                          {adminSelected.id}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <Button tone="secondary" onClick={() => setResetOpen(true)} disabled={busy}>
                    Reset password
                  </Button>
                  <Button tone="danger" onClick={() => setDeleteOpen(true)} disabled={busy}>
                    Delete user
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4">
              <div className="text-sm font-semibold">Application users</div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input placeholder="Search id/email…" value={appQuery} onChange={(e) => setAppQuery(e.target.value)} />
                <Select value={String(appPerPage)} onChange={(e) => setAppPerPage(Number(e.target.value) || 25)}>
                  <option value="25">25 / page</option>
                  <option value="50">50 / page</option>
                  <option value="100">100 / page</option>
                </Select>
                <div className="flex items-center gap-2">
                  <Button tone="secondary" onClick={() => setAppPage((p) => Math.max(p - 1, 1))} disabled={busy || appPage <= 1}>
                    Prev
                  </Button>
                  <Button tone="secondary" onClick={() => setAppPage((p) => p + 1)} disabled={busy || (appTotal !== null && appPage * appPerPage >= appTotal)}>
                    Next
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <div>
                  Showing <span className="font-medium text-slate-700">{filteredAppUsers.length}</span> of {appUsers.length}
                  {appTotal !== null ? <span className="text-slate-400"> (total {appTotal})</span> : null}
                </div>
                <button
                  className="hover:text-slate-700"
                  onClick={() => {
                    setAppQuery("");
                    setAppPage(1);
                    setAppPerPage(25);
                  }}
                >
                  Clear
                </button>
              </div>
              <div className="mt-1 text-xs text-slate-400">Page {appPage}</div>
            </div>

            <div className="max-h-[62vh] overflow-auto">
              {loading ? (
                <div className="p-4 text-sm text-slate-500">Loading…</div>
              ) : filteredAppUsers.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">No users match the current filters.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredAppUsers.map((u) => (
                    <button
                      key={u.id}
                      className={cx(
                        "w-full text-left p-4 hover:bg-slate-50",
                        u.id === appSelectedId ? "bg-slate-50" : "bg-white"
                      )}
                      onClick={() => setAppSelectedId(u.id)}
                    >
                      <div className="text-sm font-medium truncate">{u.email || "(no email)"}</div>
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <div className="font-mono text-xs text-slate-500 truncate">{u.id}</div>
                        {roleHints[u.id] ? <Pill tone="neutral">role: {roleHints[u.id]}</Pill> : <Pill tone="neutral">role: unknown</Pill>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">User details</div>
                <div className="mt-1 text-xs text-slate-500">Set the application role stored in profiles.role (upsert).</div>
              </div>
              {appSelected ? (
                <Button tone="secondary" onClick={() => openRoleModal(appSelected.id)} disabled={busy}>
                  Set profile role
                </Button>
              ) : null}
            </div>

            {!appSelected ? (
              <div className="p-6 text-sm text-slate-500">Select an application user to view details.</div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-600">User ID</div>
                    <div className="mt-1 flex items-center gap-2">
                      <Input value={appSelected.id} readOnly disabled />
                      <Button tone="secondary" onClick={() => copy(appSelected.id)} disabled={busy}>
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-600">Email</div>
                    <div className="mt-1">
                      <Input value={appSelected.email || ""} readOnly disabled />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs font-semibold text-slate-600">Created</div>
                    <div className="mt-2 rounded-2xl border border-slate-200 p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-slate-500">created_at</div>
                        <div className="font-mono text-xs">{fmtDate(appSelected.created_at)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">profiles.role</div>
                      <div className="mt-1 text-xs text-slate-500">Last set from this UI: {roleHints[appSelected.id] || "(unknown)"}</div>
                    </div>
                    <Button tone="secondary" onClick={() => openRoleModal(appSelected.id)} disabled={busy}>
                      Set role
                    </Button>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    Recommended convention: <span className="font-mono">user</span>, <span className="font-mono">admin</span>. You can use any string that your app RBAC expects.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create admin */}
      <AdminModal
        open={newOpen}
        title="Create admin user"
        desc="Creates or upserts an admin console user. Username is immutable after creation."
        onClose={() => setNewOpen(false)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-600">Username</div>
            <div className="mt-1">
              <Input value={newForm.username} onChange={(e) => setNewForm((p) => ({ ...p, username: e.target.value }))} placeholder="e.g., zac" />
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600">Temporary password</div>
            <div className="mt-1">
              <Input
                type="password"
                value={newForm.password}
                onChange={(e) => setNewForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Set initial password"
              />
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600">Role</div>
            <div className="mt-1">
              <Select value={newForm.role} onChange={(e) => setNewForm((p) => ({ ...p, role: e.target.value }))}>
                <option value="admin">admin</option>
                <option value="root">root</option>
              </Select>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600">Status</div>
            <div className="mt-2 flex items-center justify-between rounded-2xl border border-slate-200 p-3">
              <div>
                <div className="text-sm font-medium">Active</div>
                <div className="text-xs text-slate-500">Allow login to the admin console.</div>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={!!newForm.is_active}
                onChange={(e) => setNewForm((p) => ({ ...p, is_active: e.target.checked }))}
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-2">
          <Button tone="secondary" onClick={() => setNewOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={createAdminUser} disabled={busy}>
            Create
          </Button>
        </div>
      </AdminModal>

      {/* Reset password */}
      <AdminModal
        open={resetOpen}
        title="Reset password"
        desc="Sets a new password for this admin user."
        onClose={() => {
          setResetOpen(false);
          setResetPassword("");
        }}
      >
        <div>
          <div className="text-xs font-semibold text-slate-600">New password</div>
          <div className="mt-1">
            <Input type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="Enter new password" />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-2">
          <Button tone="secondary" onClick={() => setResetOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={applyPasswordReset} disabled={busy || !adminSelected}>
            Save
          </Button>
        </div>
      </AdminModal>

      {/* Delete admin confirm */}
      <AdminModal
        open={deleteOpen}
        title="Delete admin user"
        desc="This permanently removes the admin user record. This cannot be undone."
        onClose={() => setDeleteOpen(false)}
      >
        <AdminNotice tone="danger" title="Destructive action">
          Deleting an admin user is permanent. If you only want to prevent access, set the user to inactive instead.
        </AdminNotice>
        <div className="mt-6 flex items-center justify-end gap-2">
          <Button tone="secondary" onClick={() => setDeleteOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button tone="danger" onClick={() => deleteAdminUser(adminSelected?.id)} disabled={busy || !adminSelected}>
            Delete
          </Button>
        </div>
      </AdminModal>

      {/* Set profile role */}
      <AdminModal
        open={roleOpen}
        title="Set profiles.role"
        desc="Upserts profiles.role for the selected application user."
        onClose={() => setRoleOpen(false)}
      >
        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-600">User ID</div>
            <div className="mt-1">
              <Input value={roleUserId || ""} readOnly disabled />
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600">Role</div>
            <div className="mt-1">
              <Input value={roleValue} onChange={(e) => setRoleValue(e.target.value)} placeholder="e.g., user / admin" />
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-2">
          <Button tone="secondary" onClick={() => setRoleOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={setAppRole} disabled={busy || !roleUserId}>
            Save
          </Button>
        </div>
      </AdminModal>
    </div>
  );
}
