"use client";
import { useState } from "react";

// Original vector icons (not game art). Real icons: pass `src`, or set NEXT_PUBLIC_ICON_BASE (e.g. "/icons")
// and add files named <kind>.webp (mainHand.webp, helmet.webp, Active.webp, Gladiator.webp ...). Falls back to these vectors.
const BASE = process.env.NEXT_PUBLIC_ICON_BASE;
const COL: Record<string, string> = {
  Common: "#8b9bb4", Rare: "#3b82f6", Heroic: "#a855f7", Legendary: "#d4a74a",
  Active: "#f59e0b", Passive: "#2dd4bf", Stigma: "#c084fc",
};
const G: Record<string, string> = {
  mainHand: "M12 2l2.4 3.2V15h-4.8V5.2zM6.5 15h11v2.2h-11zM10.9 17.2h2.2V20h-2.2zM10.5 21.4a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0z",
  offHand: "M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5zM12 5l5 2v4c0 3.5-2.2 6.3-5 7.8-2.8-1.5-5-4.3-5-7.8V7zM12 8l2 3-2 4-2-4z",
  helmet: "M4 20v-7a8 8 0 0116 0v7h-5v-5H9v5zM8 11h8v2H8z",
  shoulder: "M3 15c0-5.5 4-10 9-10s9 4.5 9 10v2H3zM6 19h12v2H6z",
  chest: "M8 3L3 7l2.5 4L8 10v11h8V10l2.5 1L21 7l-5-4-2 2h-4z",
  legs: "M6 3h12l-1 18h-4.5L12 12l-.5 9H7z",
  gloves: "M7 21v-7l-3-4 2-1.5 2 2V4.5a1.2 1.2 0 012.4 0V10V3.5a1.2 1.2 0 012.4 0V10V4.5a1.2 1.2 0 012.4 0V11V6.5a1.2 1.2 0 012.4 0V16l-2 5z",
  boots: "M8 3h6v9l6 3.5V21H5v-5l3-1.5z",
  cape: "M5 3h14l3 18-10-3.5L2 21z",
  necklace: "M4 3a8 9 0 0016 0h-2a6 7 0 01-12 0zM12 14l3 3-3 5-3-5z",
  earring: "M12 2a2.5 2.5 0 110 5 2.5 2.5 0 010-5zM12 9l3.5 5L12 22l-3.5-8z",
  ring: "M12 9a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM12 11.4a4.1 4.1 0 100 8.2 4.1 4.1 0 000-8.2zM12 2l3.5 4L12 10 8.5 6z",
  bracelet: "M12 5c5 0 9 2.5 9 6v2c0 3.5-4 6-9 6s-9-2.5-9-6v-2c0-3.5 4-6 9-6zM12 8c-3.5 0-6 1.2-6 3v2c0 1.8 2.5 3 6 3s6-1.2 6-3v-2c0-1.8-2.5-3-6-3z",
  belt: "M2 9h6.5V7.5h7V9H22v6h-6.5v1.5h-7V15H2zM10.5 10.5h3v3h-3z",
  amulet: "M10 2h4v3h-4zM12 6a8 8 0 100 16 8 8 0 000-16zM12 9.5l3 4.5-3 4-3-4z",
  rune: "M12 2l7 5v10l-7 5-7-5V7zM11 7h2v10h-2zM8.5 10.5L12 7.5l3.5 3-1.2 1.2L12 10l-2.3 1.7z",
  Active: "M13 2L4 14h7l-1 8 10-13h-7z",
  Passive: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 6a6 6 0 110 12 6 6 0 010-12zM12 9.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z",
  Stigma: "M12 2l8 8-8 12L4 10zM12 6l4.5 4.5L12 17 7.5 10.5z",
};

export default function Icon({ kind, rarity, size = 40, src }: { kind: string; rarity?: string; size?: number; src?: string | null }) {
  const [bad, setBad] = useState(false);
  const key = kind.replace(/\d+$/, "");
  const c = COL[rarity ?? key] ?? "#4c8dff";
  const url = src ?? (BASE ? `${BASE}/${key}.webp` : undefined);
  if (url && !bad)
    return <img src={url} width={size} height={size} alt={kind} onError={() => setBad(true)} className="shrink-0 rounded" style={{ border: `2px solid ${c}` }} />;
  const h = c.slice(1), g = G[key];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={kind} className="shrink-0">
      <defs>
        <linearGradient id={`b${h}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity=".38" /><stop offset="1" stopColor="#0b1220" /></linearGradient>
        <linearGradient id={`g${h}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".95" /><stop offset="1" stopColor={c} /></linearGradient>
      </defs>
      <rect x=".75" y=".75" width="22.5" height="22.5" rx="3.5" fill={`url(#b${h})`} stroke={c} strokeWidth="1.5" />
      <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="2.2" fill="none" stroke={c} strokeOpacity=".3" strokeWidth=".5" />
      {g ? <path d={g} fillRule="evenodd" fill={`url(#g${h})`} stroke={c} strokeWidth=".7" strokeLinejoin="round" transform="translate(4.2 4.2) scale(.65)" />
        : <text x="12" y="15.5" textAnchor="middle" fontSize="9" fontWeight="600" fill={c}>{kind.slice(0, 2)}</text>}
    </svg>
  );
}
