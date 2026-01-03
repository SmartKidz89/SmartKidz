"use client";

const KEY = "skz_pet_v1";

const PET_TYPES = [
  // Fantasy / Special
  { id: "dragon", name: "Drake", emoji: "🐲", color: "bg-emerald-100 text-emerald-600", food: "🌶️", desc: "Loves spicy peppers." },
  { id: "unicorn", name: "Sparkle", emoji: "🦄", color: "bg-fuchsia-100 text-fuchsia-600", food: "🧁", desc: "Magical and sweet." },
  { id: "robot", name: "Beep", emoji: "🤖", color: "bg-slate-100 text-slate-600", food: "🔋", desc: "Needs batteries." },
  { id: "alien", name: "Zorp", emoji: "👽", color: "bg-lime-100 text-lime-600", food: "☄️", desc: "From outer space." },
  { id: "dino", name: "Rex", emoji: "🦖", color: "bg-green-100 text-green-600", food: "🥩", desc: "Big appetite!" },
  
  // Domestic / Farm
  { id: "cat", name: "Luna", emoji: "🐱", color: "bg-indigo-100 text-indigo-600", food: "🐟", desc: "A cozy companion." },
  { id: "dog", name: "Buddy", emoji: "🐶", color: "bg-amber-100 text-amber-600", food: "🦴", desc: "Loyal and playful." },
  { id: "bunny", name: "Hop", emoji: "🐰", color: "bg-pink-50 text-pink-500", food: "🥕", desc: "Fast and fluffy." },
  { id: "hamster", name: "Nibble", emoji: "🐹", color: "bg-orange-50 text-orange-500", food: "🌻", desc: "Runs on wheels." },
  { id: "pig", name: "Oink", emoji: "🐷", color: "bg-pink-100 text-pink-600", food: "🍎", desc: "Smart and fun." },
  
  // Wild
  { id: "lion", name: "Simba", emoji: "🦁", color: "bg-orange-100 text-orange-600", food: "🍖", desc: "King of the jungle." },
  { id: "tiger", name: "Stripes", emoji: "🐯", color: "bg-orange-200 text-orange-800", food: "🥩", desc: "Fierce friend." },
  { id: "bear", name: "Barnaby", emoji: "🐻", color: "bg-stone-100 text-stone-700", food: "🍯", desc: "Loves honey." },
  { id: "koala", name: "Gum", emoji: "🐨", color: "bg-slate-100 text-slate-600", food: "🍃", desc: "Sleepy climber." },
  { id: "panda", name: "Bamboo", emoji: "🐼", color: "bg-white border border-slate-200 text-slate-800", food: "🎋", desc: "Loves naps." },
  
  // Birds & Others
  { id: "fox", name: "Rusty", emoji: "🦊", color: "bg-orange-50 text-orange-700", food: "🍇", desc: "Clever and quick." },
  { id: "monkey", name: "Banjo", emoji: "🐵", color: "bg-yellow-100 text-yellow-700", food: "🍌", desc: "Cheeky climber." },
  { id: "penguin", name: "Pingu", emoji: "🐧", color: "bg-sky-50 text-sky-700", food: "🐟", desc: "Loves the cold." },
  { id: "owl", name: "Hoot", emoji: "🦉", color: "bg-amber-50 text-amber-800", food: "🐭", desc: "Wise night owl." },
  { id: "frog", name: "Croak", emoji: "🐸", color: "bg-green-200 text-green-700", food: "🪰", desc: "Hops everywhere." },
];

function defaultPet() {
  return {
    id: null, 
    name: "",
    xp: 0,
    level: 1,
    hunger: 100, 
    happiness: 100, 
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
    
    const now = Date.now();
    const elapsedHours = (now - (pet.lastInteraction || now)) / (1000 * 60 * 60);
    
    if (elapsedHours > 0.5) {
      const decay = Math.floor(elapsedHours * 5);
      pet.hunger = Math.max(0, pet.hunger - decay);
      pet.happiness = Math.max(0, pet.happiness - decay);
      pet.lastInteraction = now; 
      savePet(pet); 
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
  
  const nextLevelXp = next.level * 50;
  if (next.xp >= nextLevelXp) {
    next.level += 1;
    next.xp = next.xp - nextLevelXp;
  }
  
  savePet(next);
  return next;
}