import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/data";

export const metadata: Metadata = {
  title: { default: SITE, template: `%s · ${SITE}` },
  description: "Fan-made Aion 2 character database and leaderboards. Unofficial; the demo uses generated mock data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="border-b border-gold/30 bg-gold/10 px-3 py-1 text-center text-xs text-gold">
          Demo mode: every character, item and skill here is generated mock data. No live game integration.
        </div>
        <header className="border-b border-line bg-panel">
          <nav className="mx-auto flex max-w-5xl items-center gap-5 px-4 py-3 text-sm" aria-label="Main">
            <Link href="/" className="font-semibold text-white">{SITE}</Link>
            <Link href="/characters" className="text-slate-300 hover:text-white">Characters</Link>
            <Link href="/leaderboards" className="text-slate-300 hover:text-white">Leaderboards</Link>
            <Link href="/classes" className="text-slate-300 hover:text-white">Classes</Link>
            <Link href="/items" className="text-slate-300 hover:text-white">Items</Link>
            <Link href="/compare" className="text-slate-300 hover:text-white">Compare</Link>
            <Link href="/about" className="text-slate-300 hover:text-white">About</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-8 text-xs text-slate-500">
          Unofficial fan project. Not affiliated with or endorsed by NCSOFT. Aion is a trademark of NCSOFT Corporation.
        </footer>
      </body>
    </html>
  );
}
