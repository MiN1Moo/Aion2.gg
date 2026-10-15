import { notFound } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icon";
import type { Metadata } from "next";
import { getChar, getProfile, regionName } from "@/lib/data";
import { FactionTag, ago, fmt } from "@/components/ui";
import ProfileTabs from "@/components/ProfileTabs";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const c = getChar(+(await params).id);
  return { title: c ? `${c.name} · ${c.cls}` : "Character not found" };
}

export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const p = getProfile(+(await params).id);
  if (!p) notFound();
  const c = p.c;
  const fresh = c.hoursAgo < 24;
  return (
    <div className="space-y-4">
      <header className="panel flex flex-wrap items-center gap-4 p-4">
        <Icon kind={c.cls} size={64} />
        <div className="min-w-40 flex-1">
          <h1 className="text-xl font-bold text-white">{c.name} <Link href={`/compare?a=${c.id}`} className="ml-2 text-xs font-normal text-accent hover:underline">Compare</Link></h1>
          <p className="text-sm text-slate-400">{c.cls} · <FactionTag f={c.faction} /> · {c.server}, {regionName(c.region)}</p>
          <p className="mt-1 text-xs text-slate-500">Updated {ago(c.hoursAgo)} ·{" "}
            <span className={fresh ? "text-emerald-400" : "text-amber-400"}>{fresh ? "Fresh data" : "Possibly stale"}</span> · mock profile</p>
        </div>
        {[["Level", String(c.level)], ["Item Level", String(c.ilvl)], ["Combat Power", fmt(c.cp)]].map(([k, v]) => (
          <div key={k} className="text-center"><div className="text-xs text-slate-400">{k}</div>
            <div className={`text-lg font-bold ${k === "Combat Power" ? "text-gold" : "text-white"}`}>{v}</div></div>
        ))}
      </header>
      <ProfileTabs p={p} />
    </div>
  );
}
