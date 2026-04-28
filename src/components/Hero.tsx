"use client";

import { useTournament } from "@/lib/TournamentContext";

export default function Hero() {
  const { data } = useTournament();
  const dateObj = new Date(data.date);
  const dateStr = isNaN(dateObj.getTime())
    ? data.date
    : dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <header className="relative border-b-4 border-ink overflow-hidden">
      {/* Diagonal stripe accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full stripes opacity-20" />

      <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-8">
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="sticker">Est. 2026</span>
              <span className="font-mono text-xs uppercase tracking-widest">Courts: {data.courts} · {data.teams.length} Teams</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl leading-none tracking-tight">
              {data.event}
            </h1>
            <p className="mt-3 font-mono text-sm uppercase tracking-widest text-ink/70">
              {dateStr}
            </p>
            {data.notes && (
              <p className="mt-2 text-sm italic text-ink/60">// {data.notes}</p>
            )}
          </div>

          {/* Pickleball logo block */}
          <div className="hidden md:flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-mustard border-4 border-ink hard-shadow flex items-center justify-center relative">
              <div className="absolute inset-3 rounded-full halftone opacity-60" />
              <span className="relative font-display text-2xl">PB</span>
            </div>
            <span className="mt-2 font-display text-xs">TOURNAMENT</span>
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="bg-ink text-cream py-2 overflow-hidden border-y-2 border-ink">
        <div className="marquee-track flex whitespace-nowrap font-display text-sm tracking-widest">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-8 pr-8">
              <span>★ DINK RESPONSIBLY</span>
              <span>★ NO LOBBING THE BOSS</span>
              <span>★ KITCHEN VIOLATIONS WILL BE PROSECUTED</span>
              <span>★ WIN BY TWO OR DON&apos;T BOTHER</span>
              <span>★ {data.tournament_format.scoring?.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
