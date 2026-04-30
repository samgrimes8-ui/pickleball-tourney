"use client";

import { useTournament } from "@/lib/TournamentContext";
import { teamSkillScore } from "@/lib/standings";

const SKILL_BADGE: Record<string, string> = {
  Advanced: "bg-rust text-cream",
  Intermediate: "bg-mustard text-ink",
  Beginner: "bg-forest text-cream",
};

export default function Teams() {
  const { data } = useTournament();
  const teams = [...data.teams].sort((a: any, b: any) => a.team_id - b.team_id);

  return (
    <section>
      <h2 className="font-display text-3xl tracking-tight mb-6">Rosters</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teams.map((team: any) => {
          const score = teamSkillScore(team);
          return (
            <div key={team.team_id} className="bg-cream border-2 border-ink hard-shadow-sm">
              <div className="bg-ink text-cream px-3 py-2 flex items-center justify-between border-b-2 border-ink">
                <span className="font-display text-lg tracking-wide truncate">{team.team_name}</span>
                <span className="font-mono text-xs">#{team.team_id}</span>
              </div>
              <div className="p-3 space-y-2">
                {team.members.map((m: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{m.name}</span>
                      {m.role === "Captain" && (
                        <span className="font-mono text-[0.6rem] uppercase bg-ink text-cream px-1.5 py-0.5">
                          C
                        </span>
                      )}
                    </div>
                    <span className={`font-mono text-[0.65rem] uppercase tracking-wider px-2 py-0.5 ${SKILL_BADGE[m.skill_level] || "bg-ink/20"}`}>
                      {m.skill_level}
                    </span>
                  </div>
                ))}
                {team.notes && (
                  <p className="pt-2 mt-2 border-t border-ink/20 text-xs italic text-ink/70">
                    {team.notes}
                  </p>
                )}
                <div className="pt-2 mt-2 border-t border-ink/20 flex justify-between font-mono text-[0.65rem] uppercase tracking-wider text-ink/60">
                  <span>Skill Total</span>
                  <span>{score} pts</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {data.not_playing && data.not_playing.length > 0 && (
        <div className="mt-10 p-5 border-2 border-dashed border-ink/40 bg-cream/50">
          <h3 className="font-display text-sm tracking-widest text-ink/60 mb-3">NOT PLAYING</h3>
          <div className="flex flex-wrap gap-2">
            {data.not_playing.map((p: any, i: number) => (
              <span key={i} className="text-xs font-mono px-2 py-1 border border-ink/30 bg-cream">
                {p.name}{p.reason ? ` · ${p.reason}` : ""}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
