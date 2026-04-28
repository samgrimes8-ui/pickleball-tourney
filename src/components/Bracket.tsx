"use client";

import { useTournament } from "@/lib/TournamentContext";
import { computeWildcard, getGroupWinner, getMatchWinner, getMatchLoser } from "@/lib/standings";

export default function Bracket() {
  const { data, setData } = useTournament();
  const groups = data.tournament_format.groups;
  const knockout = data.tournament_format.knockout;

  // Auto-resolve placeholder labels
  const resolveTeam = (label: string): string => {
    const groupMatch = label.match(/^Group ([A-Z]) Winner$/);
    if (groupMatch) {
      const g = groups.find((gr: any) => gr.group_id === groupMatch[1]);
      return g ? getGroupWinner(g) || label : label;
    }
    if (label === "Wildcard (best 2nd place)" || label.toLowerCase().includes("wildcard")) {
      const wc = computeWildcard(groups);
      return wc ? `${wc.team} (WC)` : label;
    }
    if (label === "SF1 Winner") return getMatchWinner(knockout.semi_finals[0]) || label;
    if (label === "SF2 Winner") return getMatchWinner(knockout.semi_finals[1]) || label;
    if (label === "SF1 Loser") return getMatchLoser(knockout.semi_finals[0]) || label;
    if (label === "SF2 Loser") return getMatchLoser(knockout.semi_finals[1]) || label;
    return label;
  };

  const updateScore = (
    section: "semi_finals" | "finals",
    matchKey: string,
    field: "home_score" | "away_score",
    value: string
  ) => {
    const parsed = value === "" ? null : Math.max(0, parseInt(value) || 0);
    const next = { ...data };
    next.tournament_format = { ...next.tournament_format };
    next.tournament_format.knockout = { ...next.tournament_format.knockout };
    next.tournament_format.knockout[section] = next.tournament_format.knockout[section].map((m: any) =>
      m.match === matchKey ? { ...m, [field]: parsed } : m
    );
    setData(next);
  };

  const MatchCard = ({ match, section, label }: { match: any; section: "semi_finals" | "finals"; label?: string }) => {
    const homeName = resolveTeam(match.home);
    const awayName = resolveTeam(match.away);
    const isResolved = !match.home.includes("Winner") && !match.home.includes("Loser") && !match.home.includes("Wildcard")
      || (homeName !== match.home && awayName !== match.away);
    const winner =
      match.home_score != null && match.away_score != null
        ? match.home_score > match.away_score ? "home" : match.away_score > match.home_score ? "away" : null
        : null;

    return (
      <div className="bg-cream border-2 border-ink hard-shadow-sm">
        <div className="bg-ink text-cream px-3 py-1.5 flex items-center justify-between">
          <span className="font-display text-xs tracking-wider">{label || match.match}</span>
          <span className="font-mono text-[0.65rem]">Court {match.court}</span>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className={`flex-1 text-sm truncate ${winner === "home" ? "font-bold" : homeName === match.home ? "italic text-ink/50" : ""}`}>
              {homeName}
            </span>
            <input
              type="number"
              min="0"
              className="score-input !w-12 !text-lg"
              value={match.home_score ?? ""}
              onChange={(e) => updateScore(section, match.match, "home_score", e.target.value)}
              placeholder="–"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex-1 text-sm truncate ${winner === "away" ? "font-bold" : awayName === match.away ? "italic text-ink/50" : ""}`}>
              {awayName}
            </span>
            <input
              type="number"
              min="0"
              className="score-input !w-12 !text-lg"
              value={match.away_score ?? ""}
              onChange={(e) => updateScore(section, match.match, "away_score", e.target.value)}
              placeholder="–"
            />
          </div>
        </div>
      </div>
    );
  };

  const champion = getMatchWinner(knockout.finals[0]);
  const champResolved = champion ? resolveTeam(champion) : null;

  return (
    <section>
      <div className="mb-6 flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="font-display text-3xl tracking-tight">Knockout Bracket</h2>
        <p className="font-mono text-xs uppercase tracking-widest text-ink/60">
          {data.tournament_format.advancement}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-center">
        {/* Semi-finals */}
        <div className="space-y-6">
          <div className="font-display text-sm tracking-widest text-ink/60">SEMI-FINALS</div>
          {knockout.semi_finals.map((m: any) => (
            <MatchCard key={m.match} match={m} section="semi_finals" />
          ))}
        </div>

        {/* Final */}
        <div>
          <div className="font-display text-sm tracking-widest text-ink/60 mb-3 text-center">FINAL</div>
          <div className="hard-shadow-rust">
            <MatchCard match={knockout.finals[0]} section="finals" label="🏆 CHAMPIONSHIP" />
          </div>

          {champResolved && (
            <div className="mt-6 text-center">
              <div className="sticker !text-sm !px-4 !py-1">CHAMPION</div>
              <div className="font-display text-2xl mt-2">{champResolved}</div>
            </div>
          )}
        </div>

        {/* 3rd place */}
        <div>
          <div className="font-display text-sm tracking-widest text-ink/60 mb-3">3RD PLACE</div>
          <MatchCard match={knockout.finals[1]} section="finals" label="3rd Place" />
        </div>
      </div>
    </section>
  );
}
