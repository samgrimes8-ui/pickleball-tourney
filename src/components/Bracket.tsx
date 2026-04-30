"use client";

import { useTournament } from "@/lib/TournamentContext";
import {
  computeRoundRobinStandings,
  getMatchWinner,
  resolveSeed,
} from "@/lib/standings";

export default function Bracket() {
  const { data, setData } = useTournament();
  const rr = data.tournament_format.round_robin;
  const finals: any[] = data.tournament_format.finals || [];
  const teamNames: string[] = data.teams.map((t: any) => t.team_name);
  const standings = computeRoundRobinStandings(teamNames, rr.matches);

  const updateScore = (
    matchKey: string,
    field: "home_score" | "away_score",
    value: string
  ) => {
    const parsed = value === "" ? null : Math.max(0, parseInt(value) || 0);
    const next = { ...data };
    next.tournament_format = { ...next.tournament_format };
    next.tournament_format.finals = finals.map((m: any) =>
      m.match === matchKey ? { ...m, [field]: parsed } : m
    );
    setData(next);
  };

  const championshipMatch = finals.find((m) => m.match === "F1");
  const thirdPlaceMatch = finals.find((m) => m.match === "F2");

  const champion = championshipMatch ? getMatchWinner(championshipMatch) : null;
  const championResolved = champion ? resolveSeed(champion, standings).name : null;

  const FinalCard = ({
    match,
    label,
    accent,
  }: {
    match: any;
    label: string;
    accent?: boolean;
  }) => {
    const home = resolveSeed(match.home, standings);
    const away = resolveSeed(match.away, standings);
    const winner =
      match.home_score != null && match.away_score != null
        ? match.home_score > match.away_score
          ? "home"
          : match.away_score > match.home_score
          ? "away"
          : null
        : null;

    return (
      <div className={`bg-cream border-2 border-ink ${accent ? "hard-shadow-rust" : "hard-shadow-sm"}`}>
        <div className="bg-ink text-cream px-3 py-1.5 flex items-center justify-between">
          <span className="font-display text-xs tracking-wider">{label}</span>
          <span className="font-mono text-[0.65rem]">Court {match.court} · Slot {match.slot}</span>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className={`flex-1 text-sm truncate ${winner === "home" ? "font-bold" : !home.resolved ? "italic text-ink/50" : ""}`}>
              {home.name}
            </span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              className="score-input !w-12 !text-lg"
              value={match.home_score ?? ""}
              onChange={(e) => updateScore(match.match, "home_score", e.target.value)}
              placeholder="–"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex-1 text-sm truncate ${winner === "away" ? "font-bold" : !away.resolved ? "italic text-ink/50" : ""}`}>
              {away.name}
            </span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              className="score-input !w-12 !text-lg"
              value={match.away_score ?? ""}
              onChange={(e) => updateScore(match.match, "away_score", e.target.value)}
              placeholder="–"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <section>
      <div className="mb-6 flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="font-display text-3xl tracking-tight">Finals</h2>
        <p className="font-mono text-xs uppercase tracking-widest text-ink/60">
          {data.tournament_format.advancement}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {championshipMatch && (
          <div>
            <div className="font-display text-sm tracking-widest text-ink/60 mb-3 text-center">
              🏆 CHAMPIONSHIP
            </div>
            <FinalCard match={championshipMatch} label="Championship" accent />
            {championResolved && (
              <div className="mt-6 text-center">
                <div className="sticker !text-sm !px-4 !py-1">CHAMPION</div>
                <div className="font-display text-2xl mt-2">{championResolved}</div>
              </div>
            )}
          </div>
        )}

        {thirdPlaceMatch && (
          <div>
            <div className="font-display text-sm tracking-widest text-ink/60 mb-3 text-center">
              3RD PLACE
            </div>
            <FinalCard match={thirdPlaceMatch} label="3rd Place" />
          </div>
        )}
      </div>

      <div className="mt-10 p-4 border-2 border-dashed border-ink/30 bg-cream/50">
        <div className="font-mono text-[0.65rem] uppercase tracking-widest text-ink/60 mb-2">
          Seeds (live from round robin)
        </div>
        <ol className="grid sm:grid-cols-2 md:grid-cols-4 gap-2 list-none">
          {standings.slice(0, 4).map((s, i) => (
            <li key={s.team} className="flex items-baseline gap-2">
              <span className="font-display text-lg">#{i + 1}</span>
              <span className={`text-sm ${s.played > 0 ? "" : "italic text-ink/50"}`}>
                {s.played > 0 ? s.team : "TBD"}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
