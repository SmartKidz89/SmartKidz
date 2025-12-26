export const SHOP_ITEMS = [
  {
    id: "hat-cap-coral",
    name: "Coral Cap",
    category: "hat",
    cost: 60,
    rarity: "common",
    preview: "🧢",
    configPatch: { hat: "cap" },
  },
  {
    id: "hat-crown-gold",
    name: "Golden Crown",
    category: "hat",
    cost: 220,
    rarity: "epic",
    preview: "👑",
    configPatch: { hat: "crown" },
  },
  {
    id: "hat-party",
    name: "Party Hat",
    category: "hat",
    cost: 120,
    rarity: "rare",
    preview: "🥳",
    configPatch: { hat: "party" },
  },
];

export function itemById(id) {
  return SHOP_ITEMS.find((x) => x.id === id) || null;
}
