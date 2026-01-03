import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const CMS_ASSETS_BUCKET = "cms-assets";

export async function ensureAssetsBucket() {
  const admin = getSupabaseAdmin();
  try {
    const { data: buckets } = await admin.storage.listBuckets();
    const exists = (buckets || []).some((b) => b.name === CMS_ASSETS_BUCKET);
    if (!exists) {
      await admin.storage.createBucket(CMS_ASSETS_BUCKET, { public: true });
    }
  } catch {
    // ignore; bucket may already exist or permissions differ
  }
}

export function publicUrlFor(bucket, path) {
  const admin = getSupabaseAdmin();
  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl;
}
