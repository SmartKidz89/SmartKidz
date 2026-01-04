#!/usr/bin/env node
import { loadEnv } from "./load-env.mjs";
import { createClient } from "@supabase/supabase-js";
import { forgeTxt2Img } from "../lib/forgeImageProvider.js";
import { buildPrompt, MASTER_NEGATIVE_PROMPT } from "../lib/image/prompts.js";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and/or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function parseArgs(argv) {
  const args = { limit: 50, dryRun: false, width: 1024, height: 576 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--limit") args.limit = Number(argv[++i] || "50");
    else if (a === "--width") args.width = Number(argv[++i] || "1024");
    else if (a === "--height") args.height = Number(argv[++i] || "576");
    else if (a === "--help" || a === "-h") args.help = true;
  }
  return args;
}

function help() {
  console.log(`
Generate missing image assets locally using WebUI Forge/A1111 SDAPI and upload to Supabase Storage.
Now enforces "SmartKidz Paper Cutout" Master Style.

Usage:
  node scripts/generate-assets-local.mjs --limit 50
  node scripts/generate-assets-local.mjs --limit 25 --width 1024 --height 576
  node scripts/generate-assets-local.mjs --dry-run

Env (required):
  SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
  SUPABASE_SERVICE_ROLE_KEY
  SUPABASE_ASSETS_BUCKET (optional; default "assets")
  SD_API_URL (optional; default "http://127.0.0.1:7860")
`);
}

function synthSubject(asset) {
  // Return the raw subject. The buildPrompt function will wrap it.
  const meta = asset?.metadata || {};
  if (meta?.prompt) return String(meta.prompt);
  
  const uri = asset?.uri || "";
  const logical = uri.startsWith("asset://") ? uri.replace("asset://", "") : "";
  const theme = (logical || asset.asset_id || "")
    .replace(/^image\//, "")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .trim();
  const alt = asset?.alt_text ? String(asset.alt_text) : "";
  return alt || theme || "kid friendly educational illustration";
}

async function main() {
  loadEnv(process.cwd());
  const args = parseArgs(process.argv);
  if (args.help) return help();

  const supabase = getSupabaseAdmin();
  const bucket = process.env.SUPABASE_ASSETS_BUCKET || "assets";
  const sdApiUrl = process.env.SD_API_URL || "http://127.0.0.1:7860";

  console.log(`[local-generate] bucket=${bucket} sdApiUrl=${sdApiUrl} limit=${args.limit} dryRun=${args.dryRun}`);

  const { data: assets, error } = await supabase
    .from("assets")
    .select("asset_id, asset_type, uri, alt_text, metadata")
    .eq("asset_type", "image")
    .or("metadata->>public_url.is.null,metadata->>publicUrl.is.null")
    .limit(args.limit);

  if (error) throw error;
  if (!assets?.length) {
    console.log("[local-generate] No missing image assets found.");
    return;
  }

  let ok = 0;
  let fail = 0;

  for (const asset of assets) {
    const id = asset.asset_id;
    try {
      const subject = synthSubject(asset);
      const prompt = buildPrompt(subject);

      const uri = asset?.uri || "";
      const logical = uri.startsWith("asset://") ? uri.replace("asset://", "") : "";
      const basePath = logical || `image/${id}`;
      const storagePath = `${basePath}.png`;

      console.log(`\n[asset] ${id}`);
      console.log(`  subject: ${subject}`);
      // console.log(`  full prompt: ${prompt.slice(0, 100)}...`);

      if (args.dryRun) {
        ok++;
        continue;
      }

      const buffer = await forgeTxt2Img({
        prompt,
        negative_prompt: MASTER_NEGATIVE_PROMPT,
        width: args.width,
        height: args.height,
        sdApiUrl,
      });

      const { error: upErr } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
        contentType: "image/png",
        upsert: true,
      });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(storagePath);
      const publicUrl = pub?.publicUrl;
      if (!publicUrl) throw new Error("Could not compute public URL after upload.");

      const newMeta = {
        ...(asset.metadata || {}),
        public_url: publicUrl,
        storage_path: storagePath,
        provider: "forge",
        style: "paper_cutout_v1",
        ext: "png",
        status: "ready",
        generated_at: new Date().toISOString(),
      };

      const { error: updErr } = await supabase
        .from("assets")
        .update({ metadata: newMeta })
        .eq("asset_id", id);

      if (updErr) throw updErr;

      console.log(`  ✅ uploaded: ${publicUrl}`);
      ok++;
    } catch (e) {
      console.error(`  ❌ failed: ${e?.message || e}`);
      fail++;
    }
  }

  console.log(`\n[local-generate] done ok=${ok} fail=${fail}`);
  if (fail > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(`[local-generate] fatal: ${e?.message || e}`);
  process.exit(1);
});