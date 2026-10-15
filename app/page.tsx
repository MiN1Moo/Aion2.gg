import Link from "next/link";
import { CLASSES, allChars, sortChars, type Key } from "@/lib/data";
import { CharRow, fmt, regionOpts } from "@/components/ui";

function Board({ title, k }: { title: string; k: Key }) {
  const top = sortChars(allChars(), k, "desc").slice(0, 5);
  return (
    <section className="panel p-3">
      <div className="mb-2 flex justify-between text-sm"><h2 className="font-semibold text-white">{title}</h2>
        <Link className="text-accent hover:underline" href={`/leaderboards?sort=${k}`}>View all</Link></div>
      <ol className="space-y-1 text-sm">
        {top.map((c, i) => (
          <li key={c.id} className="flex justify-between gap-2">
            <Link href={`/characters/${c.id}`} className="truncate hover:text-accent">{i + 1}. {c.name} <span className="text-xs text-slate-500">{c.cls}</span></Link>
            <b className={k === "cp" ? "text-gold" : ""}>{fmt(c[k as "cp"])}</b>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function Home() {
  const recent = [...allChars()].sort((a, b) => a.hoursAgo - b.hoursAgo || a.id - b.id).slice(0, 6);
  return (
    <div className="space-y-8">
      <section className="py-6 text-center">
        <h1 className="mb-1 text-2xl font-bold text-white">Find any Aion 2 character</h1>
        <p className="mb-4 text-sm text-slate-400">Gear, skills, stats and rankings across all regions.</p>
        <form action="/characters" className="mx-auto flex max-w-2xl gap-2">
          <input name="q" placeholder="Character name…" aria-label="Character name" className="inp flex-1 py-2.5 text-base" />
          <select name="region" aria-label="Region" className="inp"><option value="">All regions</option>
            {regionOpts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
          <button className="btn px-5">Search</button>
        </form>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
          {CLASSES.map((c) => <Link key={c} href={`/characters?cls=${c}`} className="rounded-full border border-line px-3 py-1 text-slate-300 hover:border-accent">{c}</Link>)}
          <Link href="/characters?faction=Elyos" className="rounded-full border border-sky-900 px-3 py-1 text-sky-400">Elyos</Link>
          <Link href="/characters?faction=Asmodian" className="rounded-full border border-rose-900 px-3 py-1 text-rose-400">Asmodian</Link>
        </div>
      </section>
      <div className="grid gap-3 md:grid-cols-3">
        <Board title="Combat Power" k="cp" /><Board title="Item Level" k="ilvl" /><Board title="Character Level" k="level" />
      </div>
      <section>
        <h2 className="mb-2 text-sm font-semibold text-white">Recently updated</h2>
        <div className="space-y-2">{recent.map((c) => <CharRow key={c.id} c={c} />)}</div>
      </section>
    </div>
  );
}
