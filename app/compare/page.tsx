import Link from "next/link";
import type { Metadata } from "next";
import { findChar, getProfile, regionName } from "@/lib/data";
import { flat, fmt } from "@/components/ui";

export const metadata: Metadata = { title: "Compare" };
const win = (x: number, y: number) => (x > y ? "font-semibold text-gold" : "");

export default async function Compare({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = flat(await searchParams);
  const ca = sp.a ? findChar(sp.a) : undefined, cb = sp.b ? findChar(sp.b) : undefined;
  const pa = ca && getProfile(ca.id), pb = cb && getProfile(cb.id);
  const row = (label: string, x: number, y: number, show: (n: number) => string = String) => (
    <tr key={label} className="border-b border-line/50"><td className="px-3 py-1.5 text-slate-400">{label}</td>
      <td className={`px-3 ${win(x, y)}`}>{show(x)}</td><td className={`px-3 ${win(y, x)}`}>{show(y)}</td></tr>
  );
  const head = (t: string) => <tr key={t}><th colSpan={3} className="bg-bg px-3 py-1 text-left text-xs uppercase tracking-wide text-slate-400">{t}</th></tr>;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">Compare characters</h1>
      <form action="/compare" className="panel flex flex-wrap items-end gap-3 p-3">
        {(["a", "b"] as const).map((k) => (
          <label key={k} className="flex flex-col gap-1 text-xs text-slate-400">Character {k.toUpperCase()} (exact name or ID)
            <input name={k} defaultValue={sp[k] ?? ""} className="inp w-48" /></label>
        ))}
        <button className="btn">Compare</button>
        <Link href="/characters" className="py-1.5 text-sm text-slate-400 hover:text-white">Find characters</Link>
      </form>
      {((sp.a && !ca) || (sp.b && !cb)) && <p className="text-sm text-amber-400">One of the names was not found. Use the exact character name or the ID from its profile URL.</p>}
      {pa && pb ? (
        <div className="panel overflow-x-auto"><table className="w-full min-w-[520px] text-sm">
          <thead className="border-b border-line"><tr><th />
            {[pa, pb].map((p) => <th key={p.c.id} className="px-3 py-2 text-left"><Link href={`/characters/${p.c.id}`} className="text-white hover:text-accent">{p.c.name}</Link>
              <div className="text-xs font-normal text-slate-400">{p.c.cls} · {p.c.server}, {regionName(p.c.region)}</div></th>)}</tr></thead>
          <tbody>
            {head("Overview")}
            {row("Level", pa.c.level, pb.c.level)}{row("Item Level", pa.c.ilvl, pb.c.ilvl)}{row("Combat Power", pa.c.cp, pb.c.cp, fmt)}
            {pa.stats.flatMap((g, gi) => [head(g.group), ...g.rows.map(([k, v], ri) => row(k, parseFloat(v), parseFloat(pb.stats[gi].rows[ri][1]), (n) => (v.endsWith("%") ? n + "%" : fmt(n))))])}
            {head("Enhancement by slot")}
            {pa.items.map((i, idx) => row(i.label, i.enh, pb.items[idx].enh, (n) => "+" + n))}
          </tbody></table>
          <p className="p-3 text-xs text-slate-500">Higher value in gold. Mock data; stat names are placeholders.</p></div>
      ) : <p className="text-sm text-slate-400">Enter two characters to compare their overview, stats and gear enhancement.</p>}
    </div>
  );
}
