import type { SourceAdapter } from "./adapter.js";

// ALL DATA HERE IS FAKE. Names/stats are placeholders for UI development only.
export const REGIONS = [
  { code: "NA_EAST", name: "NA East", kind: "GLOBAL", maxLevel: 45 },
  { code: "NA_WEST", name: "NA West", kind: "GLOBAL", maxLevel: 45 },
  { code: "EU", name: "Europe", kind: "GLOBAL", maxLevel: 45 },
  { code: "ASIA", name: "Asia", kind: "GLOBAL", maxLevel: 45 },
  { code: "LATAM", name: "Latin America", kind: "GLOBAL", maxLevel: 45 },
  { code: "KR", name: "Korea", kind: "KR", maxLevel: 50 },
  { code: "TW", name: "Taiwan", kind: "TW", maxLevel: 50 },
] as const;
const CLASSES = ["Gladiator", "Templar", "Assassin", "Ranger", "Sorcerer", "Spiritmaster", "Cleric", "Chanter"];
const SLOTS = ["mainHand", "offHand", "helmet", "chest", "legs", "gloves", "boots", "necklace", "ring1", "ring2"];
const SERVER_NAMES = ["MockServer-A", "MockServer-B", "MockServer-C"];

function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (const c of seed) { h = Math.imul(h ^ c.charCodeAt(0), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export function createMockAdapter(perServer = 40): SourceAdapter {
  const maxLevel = (r: string) => REGIONS.find((x) => x.code === r)!.maxLevel;
  const summary = (region: string, server: string, i: number) => {
    const r = rng(`${region}/${server}/${i}`);
    return {
      sourceCharacterId: `mock-${region}-${server}-${i}`,
      name: `Mock${CLASSES[i % 8].slice(0, 3)}${i}`,
      class: CLASSES[i % 8],
      level: Math.max(30, maxLevel(region) - Math.floor(r() * 6)),
    };
  };
  return {
    meta: { key: "mock", name: "Mock data (fake)", isMock: true, permitted: true, rateLimitPerMin: 6000 },
    async listRegions() { return REGIONS.map((r) => ({ ...r })); },
    async listServers() {
      return SERVER_NAMES.map((n, i) => ({
        sourceServerId: String(i + 1), name: n,
        faction: i % 2 ? ("ASMODIAN" as const) : ("ELYOS" as const),
      }));
    },
    async searchCharacters(region, server, { query, cursor }) {
      const start = Number(cursor ?? 0), size = 25;
      let all = Array.from({ length: perServer }, (_, i) => summary(region, server, i));
      if (query) all = all.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
      const results = all.slice(start, start + size);
      return { results, nextCursor: start + size < all.length ? String(start + size) : null };
    },
    async fetchProfile(region, server, id) {
      const i = Number(id.split("-").pop());
      const s = summary(region, server, i), r = rng(id);
      return {
        ...s,
        faction: Number(server) % 2 === 0 ? "ASMODIAN" : "ELYOS",
        combatPower: Math.floor(40_000 + r() * 210_000),
        itemLevel: Math.floor(300 + r() * 200),
        portraitUrl: null,
        equipment: SLOTS.map((slot) => ({
          slot, sourceItemId: `mock-item-${slot}-${Math.floor(r() * 5)}`, name: `[MOCK] ${slot} piece`,
          rarity: ["Common", "Rare", "Legendary"][Math.floor(r() * 3)],
          itemLevel: Math.floor(300 + r() * 200), iconUrl: null,
          enhancement: Math.floor(r() * 11), details: { mock: true },
        })),
        skills: Array.from({ length: 8 }, (_, k) => ({
          sourceSkillId: `mock-skill-${s.class}-${k}`, name: `[MOCK] ${s.class} skill ${k + 1}`,
          type: k < 5 ? "active" : "passive", level: 1 + Math.floor(r() * 10), equipped: k < 6,
        })),
        stats: ["Might", "Agility", "Accuracy", "Crit"].map((key) => ({ group: "mock", key, value: Math.floor(r() * 1000) })),
        extras: { mock: true },
      };
    },
  };
}
