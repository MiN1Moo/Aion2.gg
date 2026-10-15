import { z } from "zod";

export const RegionDef = z.object({
  code: z.string(), name: z.string(),
  kind: z.enum(["GLOBAL", "KR", "TW"]), maxLevel: z.number().int(),
});
export type RegionDef = z.infer<typeof RegionDef>;

export const ServerDef = z.object({
  sourceServerId: z.string(), name: z.string(),
  faction: z.enum(["ELYOS", "ASMODIAN"]).nullable(),
});
export type ServerDef = z.infer<typeof ServerDef>;

export const CharacterSummary = z.object({
  sourceCharacterId: z.string(), name: z.string(),
  class: z.string(), level: z.number().int(),
});
export type CharacterSummary = z.infer<typeof CharacterSummary>;

export const Profile = z.object({
  sourceCharacterId: z.string(),
  name: z.string().min(1),
  class: z.string(),
  level: z.number().int().min(1),
  faction: z.enum(["ELYOS", "ASMODIAN"]).nullable(),
  combatPower: z.number().int().nonnegative().nullable(),
  itemLevel: z.number().int().nonnegative().nullable(),
  portraitUrl: z.string().url().nullable(),
  equipment: z.array(z.object({
    slot: z.string(), sourceItemId: z.string(), name: z.string(),
    rarity: z.string().nullable(), itemLevel: z.number().int().nullable(),
    iconUrl: z.string().min(1).nullable(), enhancement: z.number().int().default(0),
    details: z.record(z.unknown()).default({}),
  })).default([]),
  skills: z.array(z.object({
    sourceSkillId: z.string(), name: z.string(), type: z.string().nullable(),
    level: z.number().int(), equipped: z.boolean().default(false),
  })).default([]),
  stats: z.array(z.object({ group: z.string(), key: z.string(), value: z.number() })).default([]),
  extras: z.record(z.unknown()).default({}),
});
export type Profile = z.infer<typeof Profile>;
