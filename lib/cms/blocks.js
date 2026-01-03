// Minimal block registry for the built-in Site Builder.
// Now upgraded with SEO fields, Styling tokens, and Rich Components.

function randHex(bytes = 6) {
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
  section: "Text Section",
  split: "Split (2-Col)",
  cards: "Card Grid",
  faq: "FAQ Accordion",
  pricing: "Pricing Table",
  markdown: "Rich Text",
  image: "Image / Media",
  video: "Video Embed",
  divider: "Divider",
  spacer: "Spacer",
};

export const STYLE_DEFAULTS = {
  bg: "white", // white, light, dark, brand
  padding: "md", // none, sm, md, lg, xl
  align: "left", // left, center
};

export function newId(prefix = "blk") {
  return `${prefix}_${randHex(6)}`;
}

export function defaultBlock(type) {
  const base = { id: newId(type), type, style: { ...STYLE_DEFAULTS } };

  switch (type) {
    case "hero":
      return {
        ...base,
        headline: "Value Proposition",
        subheadline: "Explain the benefit clearly and concisely.",
        ctaText: "Get Started",
        ctaHref: "/signup",
        image: null,
      };
    case "section":
      return {
        ...base,
        title: "Section Title",
        body: "Write your main content here.",
      };
    case "split":
      return {
        ...base,
        title: "Feature Highlight",
        body: "Describe the feature on one side, image on the other.",
        imagePosition: "right", // left | right
        imageUrl: "",
      };
    case "cards":
      return {
        ...base,
        title: "Features",
        columns: 3,
        cards: [
          { id: newId("c"), title: "Feature 1", body: "Description" },
          { id: newId("c"), title: "Feature 2", body: "Description" },
          { id: newId("c"), title: "Feature 3", body: "Description" },
        ],
      };
    case "faq":
      return {
        ...base,
        title: "Common Questions",
        items: [
          { id: newId("q"), question: "Is this free?", answer: "Yes, for 7 days." },
          { id: newId("q"), question: "Can I cancel?", answer: "Anytime." },
        ],
      };
    case "pricing":
      return {
        ...base,
        title: "Simple Pricing",
        plans: [
          { id: newId("p"), name: "Basic", price: "$10", features: "Feature A\nFeature B" },
          { id: newId("p"), name: "Pro", price: "$20", features: "Everything in Basic\nFeature C" },
        ],
      };
    case "markdown":
      return {
        ...base,
        markdown: "## Rich Text\n\nWrite content using **Markdown**.",
      };
    case "image":
      return {
        ...base,
        url: "",
        alt: "",
        caption: "",
        maxWidth: "xl",
        rounded: true,
      };
    case "video":
      return {
        ...base,
        url: "", // YouTube/Vimeo URL
        caption: "",
      };
    case "divider":
      return {
        ...base,
        style: { ...base.style, padding: "none" }, // Override default
        lineStyle: "solid", // solid | dashed
      };
    case "spacer":
      return {
        ...base,
        size: "md",
      };
    default:
      return base;
  }
}

export function normalizePageContent(content) {
  if (!content || typeof content !== "object") {
    return { version: 1, seo: {}, blocks: [] };
  }
  return {
    version: 1,
    seo: {
      metaTitle: content.seo?.metaTitle || "",
      metaDescription: content.seo?.metaDescription || "",
      ogImage: content.seo?.ogImage || "",
      noIndex: !!content.seo?.noIndex,
    },
    blocks: Array.isArray(content.blocks) ? content.blocks : [],
  };
}