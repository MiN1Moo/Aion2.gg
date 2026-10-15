"use client";
import { useEffect, useState, type ReactNode } from "react";
import type { Item, Profile, Skill } from "@/lib/data";
import Icon from "./Icon";

const TABS = ["Equipment", "Skills", "Daevanion", "Stats", "Ranks", "Cosmetics"] as const;
const RC: Record<string, string> = { Common: "border-slate-600", Rare: "border-blue-500", Heroic: "border-purple-500", Legendary: "border-gold" };
const MOCK = "Mock values for UI development. Not real game data.";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="panel w-full max-w-md space-y-3 p-4 text-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3"><h3 className="text-base font-semibold text-white">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-white">✕</button></div>
        {children}
        <p className="text-xs text-slate-500">{MOCK}</p>
      </div>
    </div>
  );
}
const Unavail = ({ what }: { what: string }) => (
  <div className="panel p-8 text-center text-slate-400">{what}: unavailable. No verified data source is connected, so nothing is shown here.</div>
);

export default function ProfileTabs({ p }: { p: Profile }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Equipment");
  const [item, setItem] = useState<Item | null>(null);
  const [skill, setSkill] = useState<Skill | null>(null);
  useEffect(() => {
    const f = (e: KeyboardEvent) => { if (e.key === "Escape") { setItem(null); setSkill(null); } };
    addEventListener("keydown", f);
    return () => removeEventListener("keydown", f);
  }, []);
  const groups = ["Weapons", "Armor", "Accessories"];
  return (
    <div className="space-y-4">
      <div role="tablist" className="flex flex-wrap gap-1 border-b border-line">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors ${tab === t ? "border-accent text-white" : "border-transparent text-slate-400 hover:text-white"}`}>{t}</button>
        ))}
      </div>

      {tab === "Equipment" && groups.map((g) => (
        <section key={g}>
          <h2 className="mb-2 text-xs uppercase tracking-wide text-slate-400">{g}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {p.items.filter((i) => i.group === g).map((i) => (
              <button key={i.slot} onClick={() => setItem(i)} title={`${i.name} (${i.rarity}, +${i.enh})`}
                className="panel flex items-center gap-3 p-2 text-left transition-colors hover:border-accent">
                <Icon kind={i.slot} rarity={i.rarity} src={i.iconUrl} />
                <span className="min-w-0 flex-1"><span className="block truncate text-white">{i.name}</span>
                  <span className="text-xs text-slate-400">{i.label} · {i.rarity} · iLvl {i.ilvl}</span></span>
                <b className={i.enh >= 8 ? "text-gold" : "text-slate-300"}>+{i.enh}</b>
              </button>
            ))}
          </div>
        </section>
      ))}

      {tab === "Skills" && ["Equipped", "Acquired", "Locked"].map((s) => (
        <section key={s}>
          <h2 className="mb-2 text-xs uppercase tracking-wide text-slate-400">{s}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {p.skills.filter((k) => k.state === s).map((k) => (
              <button key={k.name} onClick={() => setSkill(k)} className="panel flex items-center gap-3 p-2 text-left hover:border-accent">
                <Icon kind={k.type} src={k.iconUrl} />
                <span className="flex-1"><span className="block text-white">{k.name}</span><span className="text-xs text-slate-400">{k.type}</span></span>
                <span className="text-sm text-slate-300">{k.level ? `Lv ${k.level}` : "—"}</span>
              </button>
            ))}
          </div>
        </section>
      ))}

      {tab === "Stats" && (
        <div className="grid gap-3 md:grid-cols-3">
          {p.stats.map((g) => (
            <section key={g.group} className="panel p-3"><h2 className="mb-2 text-xs uppercase tracking-wide text-slate-400">{g.group}</h2>
              <dl className="space-y-1 text-sm">{g.rows.map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-slate-400">{k}</dt><dd>{v}</dd></div>)}</dl></section>
          ))}
          <p className="text-xs text-slate-500 md:col-span-3">Stat names are placeholders, not the real Aion 2 stat schema. Two-character comparison is not built yet.</p>
        </div>
      )}

      {tab === "Ranks" && (
        <div className="panel overflow-x-auto"><table className="w-full min-w-[480px] text-sm">
          <thead className="border-b border-line text-xs text-slate-400"><tr><th className="px-3 py-2 text-left">Scope</th>
            {p.ranks[0].ranks.map((r) => <th key={r.label} className="px-3 text-left font-medium">{r.label}</th>)}</tr></thead>
          <tbody>{p.ranks.map((s) => (
            <tr key={s.scope} className="border-b border-line/50"><td className="px-3 py-2">{s.scope}</td>
              {s.ranks.map((r) => <td key={r.label} className="px-3">#{r.rank} <span className="text-xs text-slate-500">of {s.total}</span></td>)}</tr>))}</tbody>
        </table>
        <p className="p-3 text-xs text-slate-500">Each rank counts only characters in the mock dataset within that scope. Computed {p.asOf}. Ties share a rank.</p></div>
      )}

      {tab === "Daevanion" && <Unavail what="Daevanion boards" />}
      {tab === "Cosmetics" && <Unavail what="Cosmetics" />}

      {item && (
        <Modal title={item.name} onClose={() => setItem(null)}>
          <p className={item.rarity === "Legendary" ? "text-gold" : "text-slate-300"}>{item.rarity} · {item.label} · iLvl {item.ilvl} · Enhancement +{item.enh}</p>
          <div><h4 className="text-xs uppercase text-slate-400">Base attributes</h4><p>{item.base[0]}: {item.base[1]}</p></div>
          <div><h4 className="text-xs uppercase text-slate-400">Bonus attributes</h4>{item.bonus.map(([k, v]) => <p key={k}>{k}: +{v}</p>)}</div>
          <div><h4 className="text-xs uppercase text-slate-400">Enhancement bonus</h4><p>+{item.enh}: +{item.enh * 2}% to base attribute</p></div>
          <div><h4 className="text-xs uppercase text-slate-400">Special effect</h4><p>{item.special ?? "None"}</p></div>
          <div><h4 className="text-xs uppercase text-slate-400">Set bonus / sockets</h4><p className="text-slate-400">Unavailable</p></div>
        </Modal>
      )}
      {skill && (
        <Modal title={skill.name} onClose={() => setSkill(null)}>
          <p className="text-slate-300">{skill.type} · {skill.state}{skill.level ? ` · Level ${skill.level}` : ""}</p>
          <p>{skill.desc}</p>
          <p className="text-slate-400">Cooldown: {skill.cooldown ? `${skill.cooldown}s` : "n/a"}</p>
        </Modal>
      )}
    </div>
  );
}
