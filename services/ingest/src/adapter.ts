import type { CharacterSummary, RegionDef, ServerDef } from "./types.js";

export interface SourceMeta {
  key: string;
  name: string;
  isMock: boolean;
  termsUrl?: string;
  /** Set true ONLY once usage rights for this source are confirmed. The runner refuses otherwise. */
  permitted: boolean;
  rateLimitPerMin: number;
}

/** Implement this to plug in any data source. The website never talks to adapters directly. */
export interface SourceAdapter {
  meta: SourceMeta;
  listRegions(): Promise<RegionDef[]>;
  listServers(regionCode: string): Promise<ServerDef[]>;
  searchCharacters(
    regionCode: string, serverId: string, opts: { query?: string; cursor?: string },
  ): Promise<{ results: CharacterSummary[]; nextCursor: string | null }>;
  /** Return raw data; the runner validates it with the Profile zod schema. */
  fetchProfile(regionCode: string, serverId: string, sourceCharacterId: string): Promise<unknown>;
}
