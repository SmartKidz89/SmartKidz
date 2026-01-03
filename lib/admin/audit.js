import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function logAudit({ actor, action, entity, entityId = null, meta = {} }) {
  try {
    const admin = getSupabaseAdmin();
    await admin.from("cms_audit_log").insert({
      actor: actor || null,
      action,
      entity,
      entity_id: entityId,
      meta,
      created_at: new Date().toISOString(),
    });
  } catch {
    // best effort
  }
}
