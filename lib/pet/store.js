"use client";

const KEY = "skz_pet_v1";

const PET_TYPES = [
  { id: "dragon", name: "Drake", emoji: "🐲", color: "bg-emerald-100 text-emerald-600", food: "🌶️", desc: "Loves spicy peppers." },
  { id: "cat", name: "Luna", emoji: "🐱", color: "bg-indigo-100 text-indigo-600", food: "🐟", desc: "A cozy companion." },
  { id: "dino", name: "Rex", emoji: "🦖", color: "bg-green-100 text-green-600", food: "🥩", desc: "Big appetite!" },
  { id: "unicorn", name: "Sparkle", emoji: "🦄", color: "bg-fuchsia-100 text-fuchsia-600", food: "🧁", desc: "Magical and sweet." },
  { id: "robot", name: "Beep", emoji: "🤖", color: "bg-slate-100 text-slate-600", food: "🔋", desc: "Needs batteries." },
];

function defaultPet() {
  return {
    id: null, // 'dragon', etc.
    name: "",
    xp: 0,
    level: 1,
    hunger: 100, // 0-100 (100 is full)
    happiness: 100, // 0-100
    lastInteraction: Date.now(),
    adoptedAt: null,
  };
}

export function getPetTypes() {
  return PET_TYPES;
}

export function loadPet() {
  if (typeof window === "undefined") return defaultPet();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultPet();
    const pet = JSON.parse(raw);
    
    // Calculate decay since last visit
    // Lose 5 hunger/happiness per hour approx (very gentle)
    const now = Date.now();
    const elapsedHours = (now - (pet.lastInteraction || now)) / (1000 * 60 * 60);
    
    if (elapsedHours > 0.5) {
      const decay = Math.floor(elapsedHours * 5);
      pet.hunger = Math.max(0, pet.hunger - decay);
      pet.happiness = Math.max(0, pet.happiness - decay);
      pet.lastInteraction = now; 
      savePet(pet); // update timestamp
    }
    
    return pet;
  } catch {
    return defaultPet();
  }
}

export function savePet(pet) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify({ ...pet, lastInteraction: Date.now() }));
}

export function adoptPet(typeId, customName) {
  const meta = PET_TYPES.find(t => t.id === typeId) || PET_TYPES[0];
  const pet = {
    ...defaultPet(),
    id: typeId,
    name: customName || meta.name,
    adoptedAt: Date.now(),
  };
  savePet(pet);
  return pet;
}

export function feedPet(currentPet, amount = 20) {
  const next = { ...currentPet, hunger: Math.min(100, currentPet.hunger + amount) };
  savePet(next);
  return next;
}

export function playWithPet(currentPet, amount = 15) {
  const next = { 
    ...currentPet, 
    happiness: Math.min(100, currentPet.happiness + amount),
    xp: currentPet.xp + 5 
  };
  
  // Level up logic
  const nextLevelXp = next.level * 50;
  if (next.xp >= nextLevelXp) {
    next.level += 1;
    next.xp = next.xp - nextLevelXp;
  }
  
  savePet(next);
  return next;
}