import type { SourceAdapter } from "./adapter.js";
import { REGIONS } from "./mock.js";
import { mapProfile, mapSearch, mapServers } from "./mapping.js";

/**
 * Generic, permission-gated HTTP JSON adapter. It will not construct unless:
 *  - SOURCE_BASE_URL and the three endpoint templates are set, and
 *  - SOURCE_PERMISSION_URL points at the terms/license/permission you rely on (recorded for provenance).
 * Templates use {region} {server} {id} {q} {cursor}.
 */
export function createHttpAdapter(): SourceAdapter {
  const e = process.env;
  const need = (k: string) => e[k] || (() => { throw new Error(`${k} is required for the http source`); })();
  const base = need("SOURCE_BASE_URL"), permission = need("SOURCE_PERMISSION_URL");
  const tpl = { servers: need("SOURCE_SERVERS_URL"), search: need("SOURCE_SEARCH_URL"), profile: need("SOURCE_PROFILE_URL") };
  const ua = e.SOURCE_USER_AGENT || "AionArmoryBot/0.1 (non-commercial fan project)";
  const ttlMs = Number(e.SOURCE_CACHE_MIN ?? 60) * 60_000;
  const cache = new Map<string, { at: number; data: unknown }>();

  async function getJson(template: string, vars: Record<string, string | undefined>) {
    let url = template.replace("{base}", base);
    for (const [k, v] of Object.entries(vars)) url = url.replaceAll(`{${k}}`, encodeURIComponent(v ?? ""));
    const hit = cache.get(url);
    if (hit && Date.now() - hit.at < ttlMs) return hit.data; // don't re-request the same data
    const res = await fetch(url, { headers: { "User-Agent": ua, Accept: "application/json" }, signal: AbortSignal.timeout(15_000) });
    if (res.status === 429) throw new Error(`rate limited by source (Retry-After: ${res.headers.get("retry-after") ?? "?"})`);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const data = await res.json();
    cache.set(url, { at: Date.now(), data });
    return data;
  }

  return {
    meta: {
      key: "http", name: "Configured HTTP source", isMock: false, termsUrl: permission, permitted: true,
      rateLimitPerMin: Number(e.SOURCE_RATE_PER_MIN ?? 20),
    },
    async listRegions() { return REGIONS.map((r) => ({ ...r })); },
    async listServers(region) { return mapServers(await getJson(tpl.servers, { region })); },
    async searchCharacters(region, server, { query, cursor }) {
      return mapSearch(await getJson(tpl.search, { region, server, q: query, cursor }));
    },
    async fetchProfile(region, server, id) { return mapProfile(await getJson(tpl.profile, { region, server, id })); },
  };
}
