import type { Metadata } from "next";
import { search, sortChars } from "@/lib/data";
import { CharRow, Filters, Pager, flat } from "@/components/ui";

export const metadata: Metadata = { title: "Characters" };
const SIZE = 20;

export default async function Characters({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = flat(await searchParams);
  const list = sortChars(search(sp), "cp", "desc");
  const pages = Math.max(1, Math.ceil(list.length / SIZE));
  const page = Math.min(pages, Math.max(1, +(sp.page || 1) || 1));
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">Characters</h1>
      <Filters sp={sp} action="/characters" />
      <p className="text-sm text-slate-400">{list.length} result{list.length === 1 ? "" : "s"}, sorted by Combat Power</p>
      {list.length === 0 ? (
        <div className="panel p-8 text-center text-slate-400">No characters match these filters. Try fewer filters or a shorter name.</div>
      ) : (
        <div className="space-y-2">{list.slice((page - 1) * SIZE, page * SIZE).map((c) => <CharRow key={c.id} c={c} />)}</div>
      )}
      <Pager sp={sp} page={page} pages={pages} path="/characters" />
    </div>
  );
}
