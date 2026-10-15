// ALL DATA IS GENERATED MOCK DATA. Replace with DB/API calls when a legitimate source is connected.
export const SITE = "Aion 2 Armory"; // rename here
export type SP = Record<string, string | undefined>;
export const REGIONS = [
  { code: "NA_EAST", name: "NA East", max: 45 }, { code: "NA_WEST", name: "NA West", max: 45 },
  { code: "EU", name: "Europe", max: 45 }, { code: "ASIA", name: "Asia", max: 45 },
  { code: "LATAM", name: "Latin America", max: 45 }, { code: "KR", name: "Korea", max: 50 },
  { code: "TW", name: "Taiwan", max: 50 },
];
export const CLASSES = ["Gladiator", "Templar", "Assassin", "Ranger", "Sorcerer", "Spiritmaster", "Cleric", "Chanter"];
export const SERVERS = ["MockServer-A", "MockServer-B", "MockServer-C"];
export const regionName = (c: string) => REGIONS.find((r) => r.code === c)?.name ?? c;

export type Char = { id: number; name: string; region: string; server: string; faction: string; cls: string; level: number; cp: number; ilvl: number; hoursAgo: number };
export type Item = { group: string; slot: string; label: string; name: string; rarity: string; enh: number; ilvl: number; base: [string, number]; bonus: [string, number][]; special: string | null; iconUrl?: string | null };
export type Skill = { name: string; type: string; level: number; state: string; cooldown: number | null; desc: string; iconUrl?: string | null };
export type Profile = {
  c: Char; items: Item[]; skills: Skill[]; stats: { group: string; rows: [string, string][] }[];
  ranks: { scope: string; total: number; ranks: { label: string; rank: number }[] }[]; asOf: string;
};

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const A = ["Kael", "Vor", "Syl", "Thar", "Nyx", "Ori", "Zan", "Lum", "Dra", "Eli"];
const B = ["ion", "wyn", "dor", "mir", "ax", "eth", "ara", "os", "iel", "us"];
let cache: Char[] | null = null;
export function allChars(): Char[] {
  if (cache) return cache;
  const r = rng(42);
  cache = Array.from({ length: 700 }, (_, i) => {
    const reg = REGIONS[i % 7];
    const level = reg.max - Math.floor(r() * r() * 10);
    const ilvl = Math.floor(280 + (level / reg.max) * 80 + r() * 140);
    const cp = Math.floor(30000 + (ilvl - 280) * 500 + r() * 90000);
    return {
      id: i + 1, name: A[Math.floor(r() * 10)] + B[Math.floor(r() * 10)] + (i + 1), region: reg.code,
      server: SERVERS[Math.floor(r() * 3)], faction: r() < 0.5 ? "Elyos" : "Asmodian",
      cls: CLASSES[Math.floor(r() * 8)], level, cp, ilvl, hoursAgo: Math.floor(r() * r() * 200),
    };
  });
  return cache;
}
export const getChar = (id: number) => allChars().find((c) => c.id === id);

export function search(p: SP) {
  const q = p.q?.toLowerCase(), ml = +(p.minLevel || 0), mc = +(p.minCp || 0), mi = +(p.minIlvl || 0);
  return allChars().filter((c) =>
    (!q || c.name.toLowerCase().includes(q)) && (!p.region || c.region === p.region) &&
    (!p.server || c.server === p.server) && (!p.cls || c.cls === p.cls) &&
    (!p.faction || c.faction === p.faction) && c.level >= ml && c.cp >= mc && c.ilvl >= mi);
}
export type Key = "level" | "cp" | "ilvl" | "name";
export function sortChars(l: Char[], key: Key, dir: "asc" | "desc") {
  const m = dir === "asc" ? 1 : -1;
  return [...l].sort((a, b) => (key === "name" ? a.name.localeCompare(b.name) : a[key] - b[key]) * m || a.id - b.id);
}

const SLOTS = [["Weapons", "mainHand", "Main Hand"], ["Weapons", "offHand", "Off-hand"],
  ["Armor", "helmet", "Helm"], ["Armor", "shoulder", "Shoulder"], ["Armor", "chest", "Torso"], ["Armor", "legs", "Pants"], ["Armor", "gloves", "Gloves"], ["Armor", "boots", "Boots"],
  ["Accessories", "cape", "Cape"], ["Accessories", "necklace", "Necklace"], ["Accessories", "earring1", "Earring 1"], ["Accessories", "earring2", "Earring 2"],
  ["Accessories", "ring1", "Ring 1"], ["Accessories", "ring2", "Ring 2"], ["Accessories", "bracelet1", "Bracelet 1"], ["Accessories", "bracelet2", "Bracelet 2"],
  ["Accessories", "belt", "Belt"], ["Accessories", "amulet", "Amulet"], ["Accessories", "rune1", "Rune 1"], ["Accessories", "rune2", "Rune 2"]];
const RAR = ["Common", "Rare", "Heroic", "Legendary"];
const BONUS = ["Accuracy", "Crit Rate", "Evasion", "Max HP", "Crit Damage"];

export function getProfile(id: number): Profile | null {
  const c = getChar(id);
  if (!c) return null;
  const r = rng(id * 7919 + 1);
  const items: Item[] = SLOTS.map(([group, slot, label]) => {
    const cat = CATALOG.filter((x) => x.slot === slot)[Math.floor(r() * 10)];
    return {
    group, slot, label, name: cat.name, rarity: cat.rarity,
    enh: Math.floor(r() * 11), ilvl: Math.floor(c.ilvl - 40 + r() * 60),
    base: cat.base,
    bonus: [0, 1].map((k) => [BONUS[(Math.floor(r() * 5) + k) % 5], Math.floor(5 + r() * 60)] as [string, number]),
    special: r() < 0.4 ? "Mock special effect: small chance to trigger a bonus." : null,
  };
  });
  const skills: Skill[] = Array.from({ length: 10 }, (_, k) => {
    const state = k < 6 ? "Equipped" : k < 9 ? "Acquired" : "Locked";
    return { name: `[Mock] ${c.cls} Skill ${k + 1}`, type: k < 5 ? "Active" : k < 8 ? "Passive" : "Stigma", level: state === "Locked" ? 0 : 1 + Math.floor(r() * 10),
      state, cooldown: k < 5 ? Math.floor(3 + r() * 40) : null, desc: "Mock description. Real skill text appears once a game data source is connected." };
  });
  const v = (lo: number, hi: number) => String(Math.floor(lo + r() * (hi - lo)));
  const stats = [
    { group: "Primary", rows: [["Might", v(100, 900)], ["Agility", v(100, 900)], ["Vitality", v(100, 900)], ["Insight", v(100, 900)]] },
    { group: "Offensive", rows: [["Attack", v(2000, 9000)], ["Accuracy", v(500, 3000)], ["Crit Rate", v(5, 40) + "%"], ["Crit Damage", v(120, 220) + "%"]] },
    { group: "Defensive", rows: [["Defense", v(1500, 7000)], ["Evasion", v(300, 2500)], ["Max HP", v(8000, 40000)], ["Resistance", v(100, 1500)]] },
  ] as Profile["stats"];
  const all = allChars();
  const scopes: [string, (x: Char) => boolean][] = [
    ["Global (all regions)", () => true], [`Region: ${regionName(c.region)}`, (x) => x.region === c.region],
    [`Server: ${c.server} (${regionName(c.region)})`, (x) => x.region === c.region && x.server === c.server], [`Class: ${c.cls} (all regions)`, (x) => x.cls === c.cls]];
  const metrics: [Key, string][] = [["level", "Level"], ["cp", "Combat Power"], ["ilvl", "Item Level"]];
  const ranks = scopes.map(([scope, f]) => {
    const pool = all.filter(f);
    return { scope, total: pool.length, ranks: metrics.map(([k, label]) => ({ label, rank: 1 + pool.filter((x) => (x[k as "level"]) > c[k as "level"]).length })) };
  });
  return { c, items, skills, stats, ranks, asOf: new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC" };
}

// ---- Item catalog (mock) ----
export const RARITIES = RAR;
export const SLOT_OPTS = SLOTS.map(([, slot, label]) => [slot, label] as [string, string]);
export const CATALOG = SLOTS.flatMap(([group, slot, label], si) =>
  A.map((a, i) => ({
    group, slot, label, name: `[Mock] ${label} of ${a}`, rarity: RAR[(si + i) % 4], ilvl: 300 + i * 20 + si,
    base: [group === "Weapons" ? "Physical Attack" : "Physical Defense", 100 + i * 40] as [string, number],
  })));
export function findChar(q: string) {
  const s = q.trim().toLowerCase();
  return /^\d+$/.test(s) ? getChar(+s) : allChars().find((c) => c.name.toLowerCase() === s);
}
