import Link from "next/link";
import type { Metadata } from "next";
import { CATALOG, RARITIES, SLOT_OPTS } from "@/lib/data";
import { Pager, Sel, flat } from "@/components/ui";
import Icon from "@/components/Icon";

export const metadata: Metadata = { title: "Items" };
const SIZE = 24;

export default async function Items({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = flat(await searchParams);
  const q = sp.q?.toLowerCase();
  const list = CATALOG.filter((i) => (!q || i.name.toLowerCase().includes(q)) && (!sp.slot || i.slot === sp.slot) && (!sp.rarity || i.rarity === sp.rarity));
  const pages = Math.max(1, Math.ceil(list.length / SIZE));
  const page = Math.min(pages, Math.max(1, +(sp.page || 1) || 1));
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">Items</h1>
      <form action="/items" className="panel flex flex-wrap items-end gap-3 p-3">
        <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-slate-400">Item name
          <input name="q" defaultValue={sp.q ?? ""} className="inp" /></label>
        <Sel name="slot" label="Slot" value={sp.slot} opts={SLOT_OPTS} />
        <Sel name="rarity" label="Rarity" value={sp.rarity} opts={RARITIES.map((r) => [r, r] as [string, string])} />
        <button className="btn">Apply</button><Link href="/items" className="py-1.5 text-sm text-slate-400 hover:text-white">Reset</Link>
      </form>
      <p className="text-sm text-slate-400">{list.length} mock items. Real item definitions need a verified data source.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {list.slice((page - 1) * SIZE, page * SIZE).map((i) => (
          <details key={i.name} className="panel p-2">
            <summary className="flex cursor-pointer items-center gap-3"><Icon kind={i.slot} rarity={i.rarity} />
              <span><span className="block text-white">{i.name}</span><span className="text-xs text-slate-400">{i.label} · {i.rarity} · iLvl {i.ilvl}</span></span></summary>
            <p className="mt-2 text-sm text-slate-300">{i.base[0]}: {i.base[1]}</p>
            <p className="text-xs text-slate-500">Mock values. Bonus attributes, set bonuses and sockets are unavailable.</p>
          </details>
        ))}
      </div>
      <Pager sp={sp} page={page} pages={pages} path="/items" />
    </div>
  );
}
