// Compute group standings from played matches
export function computeGroupStandings(group: any) {
  const teams: Record<string, any> = {};
  group.teams.forEach((t: string) => {
    teams[t] = { team: t, wins: 0, losses: 0, pf: 0, pa: 0, diff: 0, played: 0 };
  });

  group.matches.forEach((m: any) => {
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
    .map((t: any) => ({ ...t, diff: t.pf - t.pa }))
    .sort((a: any, b: any) => b.wins - a.wins || b.diff - a.diff || b.pf - a.pf);
}

export function computeWildcard(groups: any[]) {
  const seconds: any[] = [];
  groups.forEach((g) => {
    const standings = computeGroupStandings(g);
    if (standings[1] && standings[1].played > 0) {
      seconds.push({ ...standings[1], group: g.group_id });
    }
  });
  seconds.sort((a, b) => b.wins - a.wins || b.diff - a.diff || b.pf - a.pf);
  return seconds[0] || null;
}

export function getGroupWinner(group: any) {
  const standings = computeGroupStandings(group);
  if (standings[0] && standings[0].played > 0) return standings[0].team;
  return null;
}

export function getMatchWinner(match: any) {
  if (match.home_score == null || match.away_score == null) return null;
  if (match.home_score > match.away_score) return match.home;
  if (match.away_score > match.home_score) return match.away;
  return null;
}

export function getMatchLoser(match: any) {
  if (match.home_score == null || match.away_score == null) return null;
  if (match.home_score > match.away_score) return match.away;
  if (match.away_score > match.home_score) return match.home;
  return null;
}

export const SKILL_SCORE: Record<string, number> = { Advanced: 3, Intermediate: 2, Beginner: 1 };

export function teamSkillScore(team: any) {
  return team.members.reduce((sum: number, m: any) => sum + (SKILL_SCORE[m.skill_level] || 0), 0);
}
