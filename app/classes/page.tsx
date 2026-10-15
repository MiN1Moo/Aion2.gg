import Link from "next/link";
import type { Metadata } from "next";
import { CLASSES, allChars, sortChars } from "@/lib/data";
import Icon from "@/components/Icon";
import { fmt } from "@/components/ui";

export const metadata: Metadata = { title: "Classes" };

export default function Classes() {
  const all = allChars();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">Classes</h1>
      <p className="text-sm text-slate-400">Figures come from the mock dataset. Class descriptions and roles are unavailable until a verified data source is connected.</p>
      <div className="grid gap-3 md:grid-cols-2">
        {CLASSES.map((cls) => {
          const list = all.filter((c) => c.cls === cls);
          const avg = (k: "cp" | "ilvl") => Math.round(list.reduce((s, c) => s + c[k], 0) / list.length);
          const top = sortChars(list, "cp", "desc").slice(0, 3);
          return (
            <section key={cls} className="panel p-3">
              <div className="mb-2 flex items-center gap-3"><Icon kind={cls} size={40} />
                <div className="flex-1"><h2 className="font-semibold text-white">{cls}</h2>
                  <p className="text-xs text-slate-400">{list.length} characters · avg CP {fmt(avg("cp"))} · avg iLvl {avg("ilvl")}</p></div>
                <Link href={`/leaderboards?cls=${cls}`} className="text-sm text-accent hover:underline">Leaderboard</Link></div>
              <ol className="space-y-0.5 text-sm">{top.map((c, i) => (
                <li key={c.id} className="flex justify-between"><Link href={`/characters/${c.id}`} className="hover:text-accent">{i + 1}. {c.name}</Link>
                  <b className="text-gold">{fmt(c.cp)}</b></li>))}</ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
