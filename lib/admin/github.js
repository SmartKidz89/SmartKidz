import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function apiBase() {
  return "https://api.github.com";
}

async function ghFetch(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${apiBase()}${path}`, {
    method,
    headers: {
      "Accept": "application/vnd.github+json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || `GitHub API error (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function toBase64(str) {
  return Buffer.from(str, "utf8").toString("base64");
}

export async function putFile({ token, owner, repo, branch, path, content, message, encoding = "utf-8" }) {
  // Get current file SHA if exists (to allow update)
  let sha = null;
  try {
    const existing = await ghFetch(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
      token,
      method: "GET",
      body: null,
    });
    sha = existing?.sha || null;
  } catch (e) {
    // 404 means new file, which is fine
    if (e?.status !== 404) throw e;
  }

  // If encoding is 'base64', assume content is already base64 string
  const contentEncoded = encoding === "base64" ? content : toBase64(content);

  return ghFetch(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
    token,
    method: "PUT",
    body: {
      message,
      content: contentEncoded,
      branch,
      ...(sha ? { sha } : {}),
    },
  });
}

export async function exportCmsSnapshot() {
  const admin = getSupabaseAdmin();
  const [pages, nav, theme, redirects] = await Promise.all([
    admin.from("cms_pages").select("*").order("updated_at", { ascending: false }).limit(2000),
    admin.from("cms_navigation_items").select("*").order("sort", { ascending: true }).limit(2000),
    admin.from("cms_theme").select("*").eq("scope", "global").maybeSingle(),
    admin.from("cms_redirects").select("*").order("updated_at", { ascending: false }).limit(2000),
  ]);

  if (pages.error) throw new Error(pages.error.message);
  if (nav.error) throw new Error(nav.error.message);
  if (theme.error) throw new Error(theme.error.message);
  if (redirects.error) throw new Error(redirects.error.message);

  return {
    generated_at: new Date().toISOString(),
    pages: pages.data || [],
    navigation: nav.data || [],
    theme: theme.data || { scope: "global", tokens: {} },
    redirects: redirects.data || [],
  };
}

export async function syncCmsToGitHub({ actor }) {
  const token = mustEnv("GITHUB_SYNC_TOKEN");
  const fullRepo = mustEnv("GITHUB_SYNC_REPO"); // owner/repo
  const branch = process.env.GITHUB_SYNC_BRANCH || "main";
  const prefix = (process.env.GITHUB_SYNC_PATH_PREFIX || "cms-export").replace(/^\/+|\/+$/g, "");

  const [owner, repo] = fullRepo.split("/");
  if (!owner || !repo) throw new Error("GITHUB_SYNC_REPO must be in the form owner/repo");

  const snapshot = await exportCmsSnapshot();
  const content = JSON.stringify(snapshot, null, 2);

  const path = `${prefix}/snapshot.json`;
  const message = `CMS sync (${actor || "admin"}) ${new Date().toISOString()}`;

  await putFile({ token, owner, repo, branch, path, content, message });

  // record last sync
  const sb = getSupabaseAdmin();
  await sb.from("cms_settings").upsert({
    key: "github_sync",
    value: { branch, path, repo: fullRepo, actor, at: snapshot.generated_at },
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" });

  return { ok: true, branch, path, repo: fullRepo, at: snapshot.generated_at };
}