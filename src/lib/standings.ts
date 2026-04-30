export const SKILL_SCORE: Record<string, number> = { Advanced: 3, Intermediate: 2, Beginner: 1 };

export type Standing = {
  team: string;
  played: number;
  wins: number;
  losses: number;
  pf: number;
  pa: number;
  diff: number;
};

export function teamSkillScore(team: any) {
  return team.members.reduce((sum: number, m: any) => sum + (SKILL_SCORE[m.skill_level] || 0), 0);
}

// Compute round-robin standings across all teams from a flat match list
export function computeRoundRobinStandings(teamNames: string[], matches: any[]): Standing[] {
  const teams: Record<string, Standing> = {};
  teamNames.forEach((t) => {
    teams[t] = { team: t, played: 0, wins: 0, losses: 0, pf: 0, pa: 0, diff: 0 };
  });

  matches.forEach((m) => {
    if (m.home_score == null || m.away_score == null) return;
    if (!teams[m.home] || !teams[m.away]) return;
    teams[m.home].played++;
    teams[m.away].played++;
    teams[m.home].pf += m.home_score;
    teams[m.home].pa += m.away_score;
    teams[m.away].pf += m.away_score;
    teams[m.away].pa += m.home_score;
    if (m.home_score > m.away_score) {
      teams[m.home].wins++;
      teams[m.away].losses++;
    } else if (m.away_score > m.home_score) {
      teams[m.away].wins++;
      teams[m.home].losses++;
    }
  });

  return Object.values(teams)
    .map((t) => ({ ...t, diff: t.pf - t.pa }))
    .sort((a, b) => b.wins - a.wins || b.diff - a.diff || b.pf - a.pf || a.team.localeCompare(b.team));
}

export function getMatchWinner(match: any): string | null {
  if (match.home_score == null || match.away_score == null) return null;
  if (match.home_score > match.away_score) return match.home;
  if (match.away_score > match.home_score) return match.away;
  return null;
}

export function getMatchLoser(match: any): string | null {
  if (match.home_score == null || match.away_score == null) return null;
  if (match.home_score > match.away_score) return match.away;
  if (match.away_score > match.home_score) return match.home;
  return null;
}

// Resolve seed placeholders like "#1 Seed" against round-robin standings.
// Only resolves when the round robin has had enough decided matches for that seed
// to be meaningful (i.e. the team at that seed has played at least one game).
export function resolveSeed(label: string, standings: Standing[]): { name: string; resolved: boolean } {
  const m = label.match(/^#(\d+)\s*Seed$/i);
  if (!m) return { name: label, resolved: false };
  const idx = parseInt(m[1], 10) - 1;
  const s = standings[idx];
  if (!s || s.played === 0) return { name: label, resolved: false };
  return { name: s.team, resolved: true };
}
