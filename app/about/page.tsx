import type { Metadata } from "next";
export const metadata: Metadata = { title: "About" };
export default function About() {
  return (
    <div className="panel max-w-2xl space-y-3 p-5 text-sm text-slate-300">
      <h1 className="text-xl font-bold text-white">About</h1>
      <p>An unofficial fan project for browsing Aion 2 characters, gear and rankings. It is not affiliated with or endorsed by NCSOFT.</p>
      <p><b className="text-white">Current status:</b> this is a demo. All characters, items, skills and rankings are generated mock data. No live game integration exists yet, and anything unavailable is labeled as unavailable instead of invented.</p>
      <p>Rankings in a live version would be computed from characters we have collected, so they would show their snapshot time and coverage.</p>
    </div>
  );
}
