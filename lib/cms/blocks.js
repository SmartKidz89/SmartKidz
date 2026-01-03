// Minimal block registry for the built-in Site Builder.
//
// This is intentionally small and easy to extend. Add new block types by:
// 1) Adding a new key in `BLOCK_TYPES`
// 2) Updating `defaultBlock()`
// 3) Handling it in `renderBlock()`

function randHex(bytes = 6) {
  // Browser-friendly random id.
  // Uses Web Crypto if available; falls back to Math.random.
  try {
    const arr = new Uint8Array(bytes);
    globalThis.crypto?.getRandomValues?.(arr);
    if (arr.some((b) => b !== 0)) {
      return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {
    // ignore
  }
  return Array.from({ length: bytes * 2 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

export const BLOCK_TYPES = {
  hero: "Hero",
  section: "Section",
  cards: "Cards",
  markdown: "Markdown",
  image: "Image",
  spacer: "Spacer",
  divider: "Divider",
};

export function newId(prefix = "blk") {
  return `${prefix}_${randHex(6)}`;
}

export function defaultBlock(type) {
  switch (type) {
    case "hero":
      return {
        id: newId("hero"),
        type,
        headline: "A headline that explains the value",
        subheadline: "A supporting line that clarifies who this is for and what they get.",
        ctaText: "Get started",
        ctaHref: "/marketing/pricing",
      };
    case "section":
      return {
        id: newId("sec"),
        type,
        title: "Section title",
        body: "A short paragraph that explains the section.",
      };
    case "cards":
      return {
        id: newId("cards"),
        type,
        title: "Highlights",
        cards: [
          { id: newId("card"), title: "Card title", body: "Card description." },
          { id: newId("card"), title: "Card title", body: "Card description." },
          { id: newId("card"), title: "Card title", body: "Card description." },
        ],
      };
    case "markdown":
      return {
        id: newId("md"),
        type,
        markdown: "## Heading\n\nWrite content using Markdown.",
      };
    case "image":
      return {
        id: newId("img"),
        type,
        url: "",
        alt: "",
        caption: "",
        maxWidth: "xl",
        rounded: true,
      };
    case "divider":
      return {
        id: newId("div"),
        type,
        style: "line", // line | space
      };
    case "spacer":
      return {
        id: newId("sp"),
        type,
        size: "md", // sm | md | lg
      };
    default:
      return { id: newId("blk"), type: "section", title: "Section", body: "" };
  }
}

export function normalizePageContent(content) {
  if (!content || typeof content !== "object") {
    return { version: 1, blocks: [] };
  }
  const blocks = Array.isArray(content.blocks) ? content.blocks : [];
  return {
    version: 1,
    ...content,
    blocks,
  };
}
