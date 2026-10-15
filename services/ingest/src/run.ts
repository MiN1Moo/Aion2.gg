import { createHash } from "node:crypto";
import { PrismaClient, Prisma } from "@prisma/client";
import type { SourceAdapter } from "./adapter.js";
import { RateLimiter, withRetry } from "./http.js";
import { createMockAdapter } from "./mock.js";
import { createHttpAdapter } from "./http-source.js";
import { Profile } from "./types.js";

const prisma = new PrismaClient();

export function contentHash(p: Profile): string {
  return createHash("sha256").update(JSON.stringify(p)).digest("hex");
}

function getAdapter(key: string, count: number): SourceAdapter {
  if (key === "mock") return createMockAdapter(count);
  if (key === "http") return createHttpAdapter();
  throw new Error(`Unknown source "${key}". No live adapter is connected yet.`);
}

async function persist(runId: number, sourceId: number, serverId: number, p: Profile, raw: unknown) {
  const now = new Date();
  const character = await prisma.character.upsert({
    where: { serverId_sourceCharacterId: { serverId, sourceCharacterId: p.sourceCharacterId } },
    create: {
      serverId, sourceCharacterId: p.sourceCharacterId, name: p.name, class: p.class, faction: p.faction,
      level: p.level, combatPower: p.combatPower, itemLevel: p.itemLevel, portraitUrl: p.portraitUrl,
      lastSeenAt: now, lastSuccessAt: now,
    },
    update: {
      name: p.name, class: p.class, faction: p.faction, level: p.level, combatPower: p.combatPower,
      itemLevel: p.itemLevel, portraitUrl: p.portraitUrl, lastSeenAt: now, lastSuccessAt: now,
    },
  });

  const hash = contentHash(p);
  const dup = await prisma.characterSnapshot.findUnique({
    where: { characterId_contentHash: { characterId: character.id, contentHash: hash } },
  });
  if (dup) return "unchanged" as const;

  const itemIds = new Map<string, number>();
  for (const e of p.equipment) {
    const it = await prisma.item.upsert({
      where: { sourceId_sourceItemId: { sourceId, sourceItemId: e.sourceItemId } },
      create: { sourceId, sourceItemId: e.sourceItemId, name: e.name, slot: e.slot, rarity: e.rarity, itemLevel: e.itemLevel, iconUrl: e.iconUrl },
      update: { name: e.name, rarity: e.rarity, itemLevel: e.itemLevel, iconUrl: e.iconUrl },
    });
    itemIds.set(e.slot, it.id);
  }
  const skillIds = new Map<string, number>();
  for (const s of p.skills) {
    const sk = await prisma.skill.upsert({
      where: { sourceId_sourceSkillId: { sourceId, sourceSkillId: s.sourceSkillId } },
      create: { sourceId, sourceSkillId: s.sourceSkillId, name: s.name, type: s.type },
      update: { name: s.name, type: s.type },
    });
    skillIds.set(s.sourceSkillId, sk.id);
  }

  await prisma.characterSnapshot.create({
    data: {
      characterId: character.id, runId, contentHash: hash, level: p.level,
      combatPower: p.combatPower, itemLevel: p.itemLevel,
      extras: p.extras as Prisma.InputJsonValue, rawPayload: raw as Prisma.InputJsonValue,
      equipment: { create: p.equipment.map((e) => ({ itemId: itemIds.get(e.slot)!, slot: e.slot, enhancement: e.enhancement, details: e.details as Prisma.InputJsonValue })) },
      skills: { create: p.skills.map((s) => ({ skillId: skillIds.get(s.sourceSkillId)!, level: s.level, equipped: s.equipped })) },
      stats: { create: p.stats.map((s) => ({ group: s.group, key: s.key, value: s.value })) },
    },
  });
  return "created" as const;
}

export async function runIngestion(adapter: SourceAdapter) {
  if (!adapter.meta.permitted) throw new Error(`Source "${adapter.meta.key}" is not marked permitted. Refusing to run.`);
  const source = await prisma.dataSource.upsert({
    where: { key: adapter.meta.key },
    create: { key: adapter.meta.key, name: adapter.meta.name, isMock: adapter.meta.isMock, termsUrl: adapter.meta.termsUrl, permitted: adapter.meta.permitted, rateLimitPerMin: adapter.meta.rateLimitPerMin },
    update: {},
  });
  const run = await prisma.ingestionRun.create({ data: { sourceId: source.id } });
  const limiter = new RateLimiter(adapter.meta.rateLimitPerMin);
  const stats = { fetched: 0, created: 0, unchanged: 0, failed: 0 };
  const fail = async (scope: string, e: unknown, context?: object) => {
    stats.failed++;
    await prisma.ingestionError.create({ data: { runId: run.id, scope, message: String(e), context: context as Prisma.InputJsonValue } });
  };

  for (const r of await adapter.listRegions()) {
    const region = await prisma.region.upsert({ where: { code: r.code }, create: r, update: { name: r.name, maxLevel: r.maxLevel } });
    let servers;
    try { servers = await withRetry(() => adapter.listServers(r.code)); }
    catch (e) { await fail("server-list", e, { region: r.code }); continue; }

    for (const s of servers) {
      const server = await prisma.server.upsert({
        where: { regionId_sourceServerId: { regionId: region.id, sourceServerId: s.sourceServerId } },
        create: { regionId: region.id, sourceServerId: s.sourceServerId, name: s.name, faction: s.faction },
        update: { name: s.name, faction: s.faction },
      });
      let cursor: string | null = null;
      do {
        await limiter.wait();
        let page;
        try { page = await withRetry(() => adapter.searchCharacters(r.code, s.sourceServerId, { cursor: cursor ?? undefined })); }
        catch (e) { await fail("search", e, { region: r.code, server: s.sourceServerId }); break; }
        for (const c of page.results) {
          try {
            await limiter.wait();
            const raw = await withRetry(() => adapter.fetchProfile(r.code, s.sourceServerId, c.sourceCharacterId));
            const profile = Profile.parse(raw); // validate external data
            stats.fetched++;
            stats[await persist(run.id, source.id, server.id, profile, raw)]++;
          } catch (e) { await fail("profile", e, { id: c.sourceCharacterId }); }
        }
        cursor = page.nextCursor;
      } while (cursor);
    }
  }
  await prisma.ingestionRun.update({
    where: { id: run.id },
    data: { ...stats, finishedAt: new Date(), status: stats.failed === 0 ? "SUCCEEDED" : stats.fetched > 0 ? "PARTIAL" : "FAILED" },
  });
  return stats;
}

if (process.argv[1]?.endsWith("run.ts")) {
  const arg = (n: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
  runIngestion(getAdapter(arg("source") ?? process.env.INGEST_SOURCE ?? "mock", Number(arg("count") ?? 40)))
    .then((s) => { console.log("Ingestion finished", s); return prisma.$disconnect(); })
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
}
