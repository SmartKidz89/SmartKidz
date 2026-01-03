"use client";

import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [tab, setTab] = useState("admin");
  const [adminUsers, setAdminUsers] = useState([]);
  const [appUsers, setAppUsers] = useState([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadAdminUsers() {
    const res = await fetch("/api/admin/admin-users", { cache: "no-store" });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || "Failed to load admin users");
    setAdminUsers(j.users || []);
  }

  async function loadAppUsers() {
    const res = await fetch("/api/admin/app-users?perPage=25&page=1", { cache: "no-store" });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || "Failed to load app users");
    setAppUsers(j.users || []);
  }

  useEffect(() => {
    setMsg("");
    if (tab === "admin") loadAdminUsers().catch((e)=>setMsg(e.message));
    if (tab === "app") loadAppUsers().catch((e)=>setMsg(e.message));
  }, [tab]);

  async function saveAdminUser(user) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Save failed");
      setMsg("Saved.");
      await loadAdminUsers();
    } catch (e) {
      setMsg(e.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function addAdminUser() {
    const username = (prompt("New admin username?") || "").trim();
    if (!username) return;
    const password = prompt("Temporary password? (you can reset later)") || "";
    if (!password) return;
    const role = confirm("Make this user ROOT?") ? "root" : "admin";
    await saveAdminUser({ username, password, role, is_active: true });
  }

  async function deleteAdminUser(id) {
    if (!confirm("Delete this admin user?")) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/admin-users?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Delete failed");
      setMsg("Deleted.");
      await loadAdminUsers();
    } catch (e) {
      setMsg(e.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function setAppRole(user_id) {
    const role = (prompt("Set role for profiles.role (e.g., user/admin):") || "").trim();
    if (!role) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/app-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, role }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      setMsg("Updated profile role.");
    } catch (e) {
      setMsg(e.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6">
      <div>
        <div className="text-xl font-semibold">Users</div>
        <div className="text-sm text-slate-500 mt-1">
          Root-only. Manage Admin Console users and (optionally) application users.
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className={`h-10 rounded-xl px-4 border ${tab==="admin" ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 hover:bg-slate-50"}`} onClick={() => setTab("admin")}>
          Admin users
        </button>
        <button className={`h-10 rounded-xl px-4 border ${tab==="app" ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 hover:bg-slate-50"}`} onClick={() => setTab("app")}>
          App users
        </button>
        {tab==="admin" ? (
          <button className="ml-auto h-10 rounded-xl bg-slate-900 text-white px-4 hover:bg-slate-800" onClick={addAdminUser}>
            Add admin
          </button>
        ) : null}
      </div>

      {msg ? <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">{msg}</div> : null}

      {tab === "admin" ? (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2 pr-3">Username</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Active</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="py-2 pr-3">{u.username}</td>
                  <td className="py-2 pr-3">
                    <select
                      className="h-9 rounded-lg border border-slate-200 px-2 bg-white"
                      defaultValue={u.role}
                      onChange={(e) => saveAdminUser({ ...u, role: e.target.value })}
                    >
                      <option value="admin">admin</option>
                      <option value="root">root</option>
                    </select>
                  </td>
                  <td className="py-2 pr-3">
                    <input type="checkbox" defaultChecked={u.is_active !== false} onChange={(e)=>saveAdminUser({ ...u, is_active: e.target.checked })} />
                  </td>
                  <td className="py-2 pr-3 flex gap-2">
                    <button className="rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-50" onClick={() => {
                      const pwd = prompt("Set new password (leave blank to cancel):") || "";
                      if (!pwd) return;
                      saveAdminUser({ id: u.id, username: u.username, role: u.role, is_active: u.is_active, password: pwd });
                    }}>
                      Reset password
                    </button>
                    <button className="rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-50" onClick={() => deleteAdminUser(u.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {adminUsers.length === 0 ? <div className="mt-4 text-sm text-slate-500">No admin users.</div> : null}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2 pr-3">User ID</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Created</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appUsers.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="py-2 pr-3 font-mono text-xs">{u.id}</td>
                  <td className="py-2 pr-3">{u.email || "-"}</td>
                  <td className="py-2 pr-3 text-xs text-slate-500">{u.created_at}</td>
                  <td className="py-2 pr-3">
                    <button className="rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-50" onClick={() => setAppRole(u.id)}>
                      Set profile role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {appUsers.length === 0 ? <div className="mt-4 text-sm text-slate-500">No users returned.</div> : null}
        </div>
      )}
    </div>
  );
}
