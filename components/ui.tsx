import Link from "next/link";
import Icon from "@/components/Icon";
import { CLASSES, REGIONS, SERVERS, regionName, type Char, type SP } from "@/lib/data";

export const fmt = (n: number) => n.toLocaleString("en-US");
export const ago = (h: number) => (h < 1 ? "<1h ago" : h < 48 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`);
export const flat = (o: Record<string, string | string[] | undefined>): SP =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
export function qs(p: SP, o: SP = {}) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...p, ...o })) if (v) u.set(k, v);
  return u.toString();
}
export const FactionTag = ({ f }: { f: string }) => (
  <span className={f === "Elyos" ? "text-sky-400" : "text-rose-400"}>{f}</span>
);

export function Sel({ name, label, value, opts }: { name: string; label: string; value?: string; opts: [string, string][] }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-400">{label}
      <select name={name} defaultValue={value ?? ""} className="inp">
        <option value="">All</option>
        {opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </label>
  );
}
export const regionOpts = REGIONS.map((r) => [r.code, r.name] as [string, string]);

export function Filters({ sp, action, compact, hidden }: { sp: SP; action: string; compact?: boolean; hidden?: SP }) {
  const num = (name: string, label: string) => (
    <label className="flex flex-col gap-1 text-xs text-slate-400">{label}
      <input name={name} type="number" min={0} defaultValue={sp[name] ?? ""} className="inp w-24" /></label>
  );
  return (
    <form action={action} className="panel flex flex-wrap items-end gap-3 p-3">
      {Object.entries(hidden ?? {}).map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}
      {!compact && (
        <label className="flex min-w-40 flex-1 flex-col gap-1 text-xs text-slate-400">Character name
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Search by name…" className="inp" /></label>
      )}
      <Sel name="region" label="Region" value={sp.region} opts={regionOpts} />
      <Sel name="server" label="Server" value={sp.server} opts={SERVERS.map((s) => [s, s])} />
      <Sel name="cls" label="Class" value={sp.cls} opts={CLASSES.map((s) => [s, s])} />
      <Sel name="faction" label="Faction" value={sp.faction} opts={[["Elyos", "Elyos"], ["Asmodian", "Asmodian"]]} />
      {!compact && <>{num("minLevel", "Min level")}{num("minCp", "Min CP")}{num("minIlvl", "Min iLvl")}</>}
      <button className="btn">Apply</button>
      <Link href={action} className="py-1.5 text-sm text-slate-400 hover:text-white">Reset</Link>
    </form>
  );
}

export function Pager({ sp, page, pages, path }: { sp: SP; page: number; pages: number; path: string }) {
  const href = (p: number) => `${path}?${qs(sp, { page: String(p) })}`;
  return (
    <nav className="flex items-center justify-center gap-4 py-4 text-sm" aria-label="Pagination">
      {page > 1 ? <Link className="btn" href={href(page - 1)}>Prev</Link> : <span className="w-14" />}
      <span className="text-slate-400">Page {page} of {pages}</span>
      {page < pages ? <Link className="btn" href={href(page + 1)}>Next</Link> : <span className="w-14" />}
    </nav>
  );
}

export function CharRow({ c }: { c: Char }) {
  return (
    <Link href={`/characters/${c.id}`} className="panel flex flex-wrap items-center gap-x-5 gap-y-1 px-3 py-2 transition-colors hover:border-accent">
      <Icon kind={c.cls} size={36} />
      <span className="min-w-36 flex-1">
        <span className="block font-medium text-white">{c.name}</span>
        <span className="text-xs text-slate-400">{c.cls} · <FactionTag f={c.faction} /> · {c.server}, {regionName(c.region)}</span>
      </span>
      <span className="text-sm">Lv <b>{c.level}</b></span>
      <span className="text-sm">CP <b className="text-gold">{fmt(c.cp)}</b></span>
      <span className="text-sm">iLvl <b>{c.ilvl}</b></span>
      <span className="text-xs text-slate-500">{ago(c.hoursAgo)}</span>
    </Link>
  );
}
