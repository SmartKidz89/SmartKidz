import Ajv from "ajv";
import addFormats from "ajv-formats";

let _ajv = null;
let _validate = null;

/**
 * Minimal, permissive schema for lesson wrapper JSON.
 * Your prompt library often outputs extra fields (lesson_theme, ui_style_pack, interaction_plan, asset_plan, continuation, etc).
 * We validate only what the app needs to render and what we need to generate content items.
 */
function buildSchema() {
  return {
    title: "SmartKidz Lesson Wrapper (permissive)",
    type: "object",
    required: ["objective", "explanation"],
    additionalProperties: true,
    properties: {
      title: { type: "string" },
      duration_minutes: { type: "integer", minimum: 5 },
      objective: { type: "string", minLength: 1 },
      overview: { type: "string" },
      explanation: { type: "string", minLength: 1 },
      worked_example: { type: "string" },
      real_world_application: { type: "string" },
      memory_strategies: { type: "array", items: { type: "string" } },
      activities: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: true,
          properties: {
            phase: { type: "string" },
            type: { type: "string" },
            title: { type: "string" },
            prompt: { type: "string" },
            question: { type: "string" },
            options: { type: "array", items: { type: "string" } },
            correct_answer: { type: ["string", "number", "boolean"] },
            explanation: { type: "string" },
            media_urls: { type: "array", items: { type: "string" } },
            media_ref_id: { type: "string" },
          },
        },
      },
      scenarios: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: true,
          properties: {
            context: { type: "string" },
            questions: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: true,
                properties: {
                  prompt: { type: "string" },
                  answer: { type: "string" },
                },
              },
            },
          },
        },
      },
      quiz: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: true,
          properties: {
            question: { type: "string" },
            options: { type: "array", items: { type: "string" } },
            answer: { type: ["string", "number", "boolean"] },
            explanation: { type: "string" },
          },
        },
      },
      asset_plan: { type: "object", additionalProperties: true },
      interaction_plan: { type: "object", additionalProperties: true },
      continuation: { type: "object", additionalProperties: true },
    },
  };
}

function getValidator() {
  if (_validate) return _validate;
  _ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true });
  addFormats(_ajv);
  _validate = _ajv.compile(buildSchema());
  return _validate;
}

export function validateLessonWrapper(wrapper) {
  const v = getValidator();
  const ok = v(wrapper);
  return { ok: !!ok, errors: ok ? [] : (v.errors || []) };
}

export function formatAjvErrors(errors, max = 8) {
  const e = Array.isArray(errors) ? errors.slice(0, max) : [];
  return e
    .map((er) => {
      const path = er.instancePath || er.schemaPath || "";
      const msg = er.message || "invalid";
      return `${path}: ${msg}`;
    })
    .join("\n");
}

/**
 * Tries to parse model output as JSON with a few robustness heuristics.
 */
export function safeJsonParse(text) {
  if (text === null || text === undefined) return null;
  if (typeof text !== "string") return text;
  const t = text.trim();

  // 1) direct parse
  try {
    return JSON.parse(t);
  } catch {}

  // 2) extract first {...} or [...] block
  const firstObj = t.indexOf("{");
  const lastObj = t.lastIndexOf("}");
  if (firstObj >= 0 && lastObj > firstObj) {
    const sub = t.slice(firstObj, lastObj + 1);
    try {
      return JSON.parse(sub);
    } catch {}
  }

  const firstArr = t.indexOf("[");
  const lastArr = t.lastIndexOf("]");
  if (firstArr >= 0 && lastArr > firstArr) {
    const sub = t.slice(firstArr, lastArr + 1);
    try {
      return JSON.parse(sub);
    } catch {}
  }

  // 3) common trailing comma cleanup
  const cleaned = t
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]");

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Model did not return valid JSON");
  }
}
