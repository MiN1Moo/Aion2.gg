import type { CharacterSummary, ServerDef } from "./types.js";

/**
 * NOT CONFIGURED. The real response formats of the permitted source have not been verified.
 * Paste a sample JSON response for each endpoint and these functions can be filled in.
 * Each mapper must return data matching the zod schemas in types.ts (the runner validates it).
 */
const todo = (what: string): never => {
  throw new Error(`mapping.${what} is not implemented: add the source's real response format here.`);
};
export const mapServers = (_raw: unknown): ServerDef[] => todo("mapServers");
export const mapSearch = (_raw: unknown): { results: CharacterSummary[]; nextCursor: string | null } => todo("mapSearch");
export const mapProfile = (_raw: unknown): unknown => todo("mapProfile"); // must satisfy Profile in types.ts
