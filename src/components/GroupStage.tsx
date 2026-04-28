"use client";

import { useTournament } from "@/lib/TournamentContext";
import { computeGroupStandings } from "@/lib/standings";

const COLOR_MAP: Record<string, string> = {
  Red: "group-red",
  Blue: "group-blue",
  Green: "group-green",
};

export default function GroupStage() {
  const { data, setData } = useTournament();

  const updateScore = (groupId: string, matchNum: number, field: "home_score" | "away_score", value: string) => {
    const parsed = value === "" ? null : Math.max(0, parseInt(value) || 0);
    const next = { ...data };
    next.tournament_format = { ...next.tournament_format };
    next.tournament_format.groups = next.tournament_format.groups.map((g: any) => {
      if (g.group_id !== groupId) return g;
      return {
        ...g,
        matches: g.matches.map((m: any) =>
          m.match === matchNum ? { ...m, [field]: parsed } : m
        ),
      };
    });
    setData(next);
  };

  return (
    <section className="space-y-10">
      <div className="grid md:grid-cols-3 gap-6">
        {data.tournament_format.groups.map((group: any) => {
          const standings = computeGroupStandings(group);
          const colorClass = COLOR_MAP[group.group_color] || "group-red";

          return (
            <div key={group.group_id} className="bg-cream border-2 border-ink hard-shadow">
              <div className={`${colorClass} px-4 py-3 border-b-2 border-ink flex items-center justify-between`}>
                <span className="font-display text-xl tracking-wider">Group {group.group_id}</span>
                <span className="font-mono text-xs uppercase">{group.group_color}</span>
              </div>

              {/* Standings */}
              <div className="p-4">
                <div className="font-display text-xs tracking-widest mb-2 text-ink/60">STANDINGS</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="font-mono text-[0.65rem] uppercase tracking-wider text-ink/60 border-b border-ink/30">
                      <th className="text-left pb-1">Team</th>
                      <th className="pb-1 w-8">W</th>
                      <th className="pb-1 w-8">L</th>
                      <th className="pb-1 w-10">+/-</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s: any, i: number) => (
                      <tr key={s.team} className={`border-b border-ink/10 ${i === 0 && s.played > 0 ? "font-bold" : ""}`}>
                        <td className="py-1.5">
                          {i === 0 && s.played > 0 && <span className="text-mustard mr-1">★</span>}
                          {s.team}
                        </td>
                        <td className="text-center font-mono">{s.wins}</td>
                        <td className="text-center font-mono">{s.losses}</td>
                        <td className="text-center font-mono">{s.diff > 0 ? `+${s.diff}` : s.diff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Matches */}
              <div className="border-t-2 border-ink/20 p-4 space-y-3">
                <div className="font-display text-xs tracking-widest text-ink/60">MATCHES</div>
                {group.matches.map((m: any) => {
                  const winner =
                    m.home_score != null && m.away_score != null
                      ? m.home_score > m.away_score ? "home" : m.away_score > m.home_score ? "away" : null
                      : null;
                  return (
                    <div key={m.match} className="border-2 border-ink/20 p-2.5 bg-cream">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-mono text-[0.65rem] uppercase tracking-wider text-ink/60">
                          Match #{m.match} · Court {m.court}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`flex-1 text-sm ${winner === "home" ? "font-bold" : ""}`}>{m.home}</span>
                        <input
                          type="number"
                          min="0"
                          className="score-input"
                          value={m.home_score ?? ""}
                          onChange={(e) => updateScore(group.group_id, m.match, "home_score", e.target.value)}
                          placeholder="–"
                        />
                        <span className="font-display text-ink/40">vs</span>
                        <input
                          type="number"
                          min="0"
                          className="score-input"
                          value={m.away_score ?? ""}
                          onChange={(e) => updateScore(group.group_id, m.match, "away_score", e.target.value)}
                          placeholder="–"
                        />
                        <span className={`flex-1 text-sm text-right ${winner === "away" ? "font-bold" : ""}`}>{m.away}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
