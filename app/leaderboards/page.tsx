import Link from "next/link";
import type { Metadata } from "next";
import { search, sortChars, regionName, type Key } from "@/lib/data";
import { FactionTag, Filters, Pager, ago, flat, fmt, qs } from "@/components/ui";

export const metadata: Metadata = { title: "Leaderboards" };
const SIZE = 25;
const COLS: [Key, string][] = [["name", "Name"], ["level", "Level"], ["cp", "Combat Power"], ["ilvl", "Item Level"]];

export default async function Leaderboards({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = flat(await searchParams);
  const sort = (COLS.some(([k]) => k === sp.sort) ? sp.sort : "cp") as Key;
  const dir = sp.dir === "asc" ? "asc" : "desc";
  const list = sortChars(search(sp), sort, dir);
  const pages = Math.max(1, Math.ceil(list.length / SIZE));
  const page = Math.min(pages, Math.max(1, +(sp.page || 1) || 1));
  const head = (k: Key, label: string) => (
    <th className="px-2 py-2 text-left font-medium">
      <Link href={`/leaderboards?${qs(sp, { sort: k, dir: sort === k && dir === "desc" ? "asc" : "desc", page: undefined })}`} className={sort === k ? "text-accent" : "hover:text-white"}>
        {label}{sort === k ? (dir === "desc" ? " ▼" : " ▲") : ""}
      </Link>
    </th>
  );
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">Leaderboards</h1>
      <div className="flex gap-2 text-sm">
        {COLS.slice(1).map(([k, label]) => (
          <Link key={k} href={`/leaderboards?${qs(sp, { sort: k, dir: "desc", page: undefined })}`}
            className={`rounded border px-3 py-1 ${sort === k && dir === "desc" ? "border-accent text-accent" : "border-line text-slate-300"}`}>{label}</Link>
        ))}
      </div>
      <Filters sp={sp} action="/leaderboards" compact hidden={{ sort: sp.sort, dir: sp.dir }} />
      <p className="text-xs text-slate-500">Level, Combat Power and Item Level rank differently; switch the sort to compare. Rankings are computed from the mock dataset (no real ranking data); in production they would show their snapshot time and coverage.</p>
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-line text-xs text-slate-400"><tr>
            <th className="px-2 py-2 text-left">#</th>{head("name", "Name")}<th className="px-2 text-left font-medium">Class</th>
            <th className="px-2 text-left font-medium">Server</th>{head("level", "Level")}{head("cp", "Combat Power")}{head("ilvl", "iLvl")}
            <th className="px-2 text-left font-medium">Updated</th></tr></thead>
          <tbody>
            {list.slice((page - 1) * SIZE, page * SIZE).map((c, i) => (
              <tr key={c.id} className="border-b border-line/50 hover:bg-bg">
                <td className="px-2 py-1.5 text-slate-500">{(page - 1) * SIZE + i + 1}</td>
                <td className="px-2"><Link href={`/characters/${c.id}`} className="text-white hover:text-accent">{c.name}</Link></td>
                <td className="px-2">{c.cls} <span className="text-xs"><FactionTag f={c.faction} /></span></td>
                <td className="px-2 text-slate-400">{c.server} · {regionName(c.region)}</td>
                <td className="px-2">{c.level}</td><td className="px-2 text-gold">{fmt(c.cp)}</td><td className="px-2">{c.ilvl}</td>
                <td className="px-2 text-xs text-slate-500">{ago(c.hoursAgo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-8 text-center text-slate-400">No characters match these filters.</p>}
      </div>
      <Pager sp={sp} page={page} pages={pages} path="/leaderboards" />
    </div>
  );
}
