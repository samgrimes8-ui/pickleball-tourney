"use client";

import { useTournament } from "@/lib/TournamentContext";
import { computeRoundRobinStandings } from "@/lib/standings";

export default function RoundRobin() {
  const { data, setData } = useTournament();
  const rr = data.tournament_format.round_robin;
  const teamNames: string[] = data.teams.map((t: any) => t.team_name);
  const standings = computeRoundRobinStandings(teamNames, rr.matches);
  const restSchedule = data.rest_schedule || {};

  const updateScore = (matchNum: number, field: "home_score" | "away_score", value: string) => {
    const parsed = value === "" ? null : Math.max(0, parseInt(value) || 0);
    const next = { ...data };
    next.tournament_format = { ...next.tournament_format };
    next.tournament_format.round_robin = {
      ...next.tournament_format.round_robin,
      matches: rr.matches.map((m: any) =>
        m.match === matchNum ? { ...m, [field]: parsed } : m
      ),
    };
    setData(next);
  };

  // Group matches by slot
  const slots: Record<number, any[]> = {};
  rr.matches.forEach((m: any) => {
    if (!slots[m.slot]) slots[m.slot] = [];
    slots[m.slot].push(m);
  });
  const slotNumbers = Object.keys(slots).map(Number).sort((a, b) => a - b);

  return (
    <section className="space-y-10">
      {/* Standings */}
      <div className="bg-cream border-2 border-ink hard-shadow">
        <div className="bg-ink text-cream px-4 py-3 flex items-center justify-between">
          <span className="font-display text-xl tracking-wider">Round Robin Standings</span>
          <span className="font-mono text-xs uppercase">Top 2 → Final · 3 vs 4 → 3rd Place</span>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="font-mono text-[0.65rem] uppercase tracking-wider text-ink/60 border-b-2 border-ink">
                <th className="text-left pb-2 w-8">#</th>
                <th className="text-left pb-2">Team</th>
                <th className="pb-2 w-12">P</th>
                <th className="pb-2 w-12">W</th>
                <th className="pb-2 w-12">L</th>
                <th className="pb-2 w-14">PF</th>
                <th className="pb-2 w-14">PA</th>
                <th className="pb-2 w-14">+/-</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => {
                const seedClass =
                  i === 0 ? "bg-mustard/40" :
                  i === 1 ? "bg-mustard/20" :
                  i === 2 ? "bg-cream" :
                  "bg-cream";
                const showStar = s.played > 0 && (i === 0 || i === 1);
                return (
                  <tr key={s.team} className={`border-b border-ink/10 ${seedClass} ${i < 2 && s.played > 0 ? "font-bold" : ""}`}>
                    <td className="py-2 font-mono text-xs">{i + 1}</td>
                    <td className="py-2">
                      {showStar && <span className="text-mustard mr-1">★</span>}
                      {s.team}
                    </td>
                    <td className="text-center font-mono">{s.played}</td>
                    <td className="text-center font-mono">{s.wins}</td>
                    <td className="text-center font-mono">{s.losses}</td>
                    <td className="text-center font-mono">{s.pf}</td>
                    <td className="text-center font-mono">{s.pa}</td>
                    <td className="text-center font-mono">{s.diff > 0 ? `+${s.diff}` : s.diff}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule by slot */}
      <div>
        <h2 className="font-display text-2xl tracking-tight mb-4">Schedule</h2>
        <div className="space-y-5">
          {slotNumbers.map((slot) => {
            const slotMatches = slots[slot].sort((a, b) => a.court - b.court);
            const restingTeam = restSchedule[`slot_${slot}`];
            return (
              <div key={slot} className="bg-cream border-2 border-ink hard-shadow-sm">
                <div className="bg-ink text-cream px-4 py-2 flex items-center justify-between">
                  <span className="font-display text-sm tracking-widest">SLOT {slot}</span>
                  {restingTeam && (
                    <span className="font-mono text-[0.65rem] uppercase tracking-wider">
                      Resting: <span className="text-mustard">{restingTeam}</span>
                    </span>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-ink/20">
                  {slotMatches.map((m: any) => {
                    const winner =
                      m.home_score != null && m.away_score != null
                        ? m.home_score > m.away_score ? "home" : m.away_score > m.home_score ? "away" : null
                        : null;
                    return (
                      <div key={m.match} className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-mono text-[0.65rem] uppercase tracking-wider text-ink/60">
                            Match #{m.match} · Court {m.court}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`flex-1 text-sm truncate ${winner === "home" ? "font-bold" : ""}`}>{m.home}</span>
                          <input
                            type="number"
                            min="0"
                            inputMode="numeric"
                            className="score-input"
                            value={m.home_score ?? ""}
                            onChange={(e) => updateScore(m.match, "home_score", e.target.value)}
                            placeholder="–"
                          />
                          <span className="font-display text-ink/40">vs</span>
                          <input
                            type="number"
                            min="0"
                            inputMode="numeric"
                            className="score-input"
                            value={m.away_score ?? ""}
                            onChange={(e) => updateScore(m.match, "away_score", e.target.value)}
                            placeholder="–"
                          />
                          <span className={`flex-1 text-sm text-right truncate ${winner === "away" ? "font-bold" : ""}`}>{m.away}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
