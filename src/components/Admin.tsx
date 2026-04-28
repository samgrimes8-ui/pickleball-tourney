"use client";

import { useState } from "react";
import { useTournament } from "@/lib/TournamentContext";

export default function Admin() {
  const { data, setData, resetToInitial, exportJson, importJson } = useTournament();
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [showAddTeam, setShowAddTeam] = useState(false);

  const removeTeam = (teamId: number) => {
    const team = data.teams.find((t: any) => t.team_id === teamId);
    if (!team) return;
    if (!confirm(`Remove team "${team.team_name}"? They'll also be removed from their group and matches.`)) return;

    const next = { ...data };
    next.teams = next.teams.filter((t: any) => t.team_id !== teamId);
    next.tournament_format = { ...next.tournament_format };
    next.tournament_format.groups = next.tournament_format.groups.map((g: any) => ({
      ...g,
      teams: g.teams.filter((tn: string) => tn !== team.team_name),
      matches: g.matches.filter((m: any) => m.home !== team.team_name && m.away !== team.team_name),
    }));
    setData(next);
  };

  const addTeam = (teamName: string, group: string) => {
    if (!teamName.trim()) return;
    const newId = Math.max(0, ...data.teams.map((t: any) => t.team_id)) + 1;
    const newTeam = {
      team_id: newId,
      team_name: teamName.trim(),
      group,
      members: [],
    };
    const next = { ...data };
    next.teams = [...next.teams, newTeam];
    next.tournament_format = { ...next.tournament_format };
    next.tournament_format.groups = next.tournament_format.groups.map((g: any) =>
      g.group_id === group ? { ...g, teams: [...g.teams, teamName.trim()] } : g
    );
    setData(next);
    setShowAddTeam(false);
  };

  const updateTeam = (teamId: number, updates: Partial<any>) => {
    const next = { ...data };
    const oldTeam = next.teams.find((t: any) => t.team_id === teamId);
    if (!oldTeam) return;

    // If team name changed, update references in group + matches
    if (updates.team_name && updates.team_name !== oldTeam.team_name) {
      next.tournament_format = { ...next.tournament_format };
      next.tournament_format.groups = next.tournament_format.groups.map((g: any) => ({
        ...g,
        teams: g.teams.map((tn: string) => tn === oldTeam.team_name ? updates.team_name : tn),
        matches: g.matches.map((m: any) => ({
          ...m,
          home: m.home === oldTeam.team_name ? updates.team_name : m.home,
          away: m.away === oldTeam.team_name ? updates.team_name : m.away,
        })),
      }));
    }

    // If group changed, move team between groups
    if (updates.group && updates.group !== oldTeam.group) {
      next.tournament_format = { ...next.tournament_format };
      next.tournament_format.groups = next.tournament_format.groups.map((g: any) => {
        if (g.group_id === oldTeam.group) {
          return { ...g, teams: g.teams.filter((tn: string) => tn !== oldTeam.team_name) };
        }
        if (g.group_id === updates.group) {
          return { ...g, teams: [...g.teams, updates.team_name || oldTeam.team_name] };
        }
        return g;
      });
    }

    next.teams = next.teams.map((t: any) => t.team_id === teamId ? { ...t, ...updates } : t);
    setData(next);
  };

  const addMember = (teamId: number) => {
    const next = { ...data };
    next.teams = next.teams.map((t: any) =>
      t.team_id === teamId
        ? { ...t, members: [...t.members, { name: "New Player", skill_level: "Beginner", gender: "M" }] }
        : t
    );
    setData(next);
  };

  const updateMember = (teamId: number, idx: number, updates: any) => {
    const next = { ...data };
    next.teams = next.teams.map((t: any) =>
      t.team_id === teamId
        ? { ...t, members: t.members.map((m: any, i: number) => i === idx ? { ...m, ...updates } : m) }
        : t
    );
    setData(next);
  };

  const removeMember = (teamId: number, idx: number) => {
    const next = { ...data };
    next.teams = next.teams.map((t: any) =>
      t.team_id === teamId
        ? { ...t, members: t.members.filter((_: any, i: number) => i !== idx) }
        : t
    );
    setData(next);
  };

  const regenerateMatches = (groupId: string) => {
    if (!confirm(`Regenerate round-robin matches for Group ${groupId}? This will erase existing scores for this group.`)) return;
    const next = { ...data };
    next.tournament_format = { ...next.tournament_format };
    next.tournament_format.groups = next.tournament_format.groups.map((g: any) => {
      if (g.group_id !== groupId) return g;
      const teams = g.teams;
      const matches: any[] = [];
      let matchNum = (g.matches[0]?.match || 1);
      // Get the highest match num in other groups so we don't collide
      const allOtherMatches = next.tournament_format.groups
        .filter((og: any) => og.group_id !== groupId)
        .flatMap((og: any) => og.matches.map((m: any) => m.match));
      let startNum = matchNum;
      while (allOtherMatches.includes(startNum)) startNum++;

      let n = startNum;
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          matches.push({
            match: n++,
            home: teams[i],
            away: teams[j],
            court: g.matches[0]?.court || 1,
            slot: matches.length + 1,
            home_score: null,
            away_score: null,
          });
        }
      }
      return { ...g, matches };
    });
    setData(next);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => importJson(reader.result as string);
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <section className="space-y-8">
      {/* Top-level controls */}
      <div className="bg-ink text-cream p-5 border-2 border-ink">
        <h2 className="font-display text-xl tracking-wider mb-3">⚙ Tournament Controls</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportJson} className="btn-retro secondary">↓ Export JSON</button>
          <label className="btn-retro secondary cursor-pointer">
            ↑ Import JSON
            <input type="file" accept=".json,application/json" className="hidden" onChange={handleImport} />
          </label>
          <button onClick={resetToInitial} className="btn-retro" style={{ boxShadow: "4px 4px 0 #E8A53D" }}>
            ⟲ Reset
          </button>
        </div>
        <p className="mt-3 text-xs font-mono text-cream/60">
          All edits save automatically to your browser. Export to share with another device, import to load.
        </p>
      </div>

      {/* Event details */}
      <div className="bg-cream border-2 border-ink p-5 hard-shadow-sm">
        <h3 className="font-display text-lg mb-3">Event Details</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-wider text-ink/60">Event Name</span>
            <input
              className="border-2 border-ink px-3 py-2 bg-cream"
              value={data.event}
              onChange={(e) => setData({ ...data, event: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-wider text-ink/60">Date</span>
            <input
              className="border-2 border-ink px-3 py-2 bg-cream"
              value={data.date}
              onChange={(e) => setData({ ...data, date: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-wider text-ink/60">Courts</span>
            <input
              type="number"
              min="1"
              className="border-2 border-ink px-3 py-2 bg-cream"
              value={data.courts}
              onChange={(e) => setData({ ...data, courts: parseInt(e.target.value) || 1 })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-wider text-ink/60">Notes</span>
            <input
              className="border-2 border-ink px-3 py-2 bg-cream"
              value={data.notes || ""}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
            />
          </label>
        </div>
      </div>

      {/* Teams editor */}
      <div className="bg-cream border-2 border-ink p-5 hard-shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-display text-lg">Teams ({data.teams.length})</h3>
          <button onClick={() => setShowAddTeam(true)} className="btn-retro">+ Add Team</button>
        </div>

        {showAddTeam && <AddTeamForm onAdd={addTeam} onCancel={() => setShowAddTeam(false)} groups={data.tournament_format.groups} />}

        <div className="space-y-3 mt-3">
          {data.teams.map((team: any) => (
            <TeamEditor
              key={team.team_id}
              team={team}
              isExpanded={editingTeamId === team.team_id}
              onToggle={() => setEditingTeamId(editingTeamId === team.team_id ? null : team.team_id)}
              onUpdate={(updates) => updateTeam(team.team_id, updates)}
              onRemove={() => removeTeam(team.team_id)}
              onAddMember={() => addMember(team.team_id)}
              onUpdateMember={(idx, u) => updateMember(team.team_id, idx, u)}
              onRemoveMember={(idx) => removeMember(team.team_id, idx)}
              groups={data.tournament_format.groups}
            />
          ))}
        </div>
      </div>

      {/* Group match regen */}
      <div className="bg-cream border-2 border-ink p-5 hard-shadow-sm">
        <h3 className="font-display text-lg mb-3">Regenerate Group Matches</h3>
        <p className="text-sm text-ink/70 mb-3">
          After adding/removing teams in a group, regenerate the round-robin schedule.
        </p>
        <div className="flex flex-wrap gap-2">
          {data.tournament_format.groups.map((g: any) => (
            <button key={g.group_id} onClick={() => regenerateMatches(g.group_id)} className="btn-retro secondary">
              ⟳ Group {g.group_id}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function AddTeamForm({ onAdd, onCancel, groups }: any) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState(groups[0]?.group_id || "A");
  return (
    <div className="border-2 border-dashed border-ink p-4 bg-mustard/20">
      <div className="grid sm:grid-cols-3 gap-3">
        <input
          autoFocus
          className="border-2 border-ink px-3 py-2 bg-cream"
          placeholder="Team name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="border-2 border-ink px-3 py-2 bg-cream"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        >
          {groups.map((g: any) => (
            <option key={g.group_id} value={g.group_id}>Group {g.group_id}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button onClick={() => onAdd(name, group)} className="btn-retro flex-1">Save</button>
          <button onClick={onCancel} className="btn-retro secondary">×</button>
        </div>
      </div>
    </div>
  );
}

function TeamEditor({ team, isExpanded, onToggle, onUpdate, onRemove, onAddMember, onUpdateMember, onRemoveMember, groups }: any) {
  return (
    <div className="border-2 border-ink/30">
      <div className="flex items-center justify-between p-3 bg-cream">
        <button onClick={onToggle} className="flex items-center gap-3 text-left flex-1">
          <span className="font-display text-sm">{isExpanded ? "▼" : "▶"}</span>
          <span className="font-display text-base">{team.team_name}</span>
          <span className="font-mono text-xs text-ink/60">Grp {team.group} · {team.members.length} player{team.members.length !== 1 ? "s" : ""}</span>
        </button>
        <button
          onClick={onRemove}
          className="font-mono text-xs uppercase tracking-wider text-rust hover:text-ink px-2 py-1"
        >
          Remove
        </button>
      </div>

      {isExpanded && (
        <div className="p-3 border-t border-ink/20 bg-mustard/10 space-y-3">
          <div className="grid sm:grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[0.65rem] uppercase tracking-wider text-ink/60">Team Name</span>
              <input
                className="border border-ink px-2 py-1.5 bg-cream text-sm"
                value={team.team_name}
                onChange={(e) => onUpdate({ team_name: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[0.65rem] uppercase tracking-wider text-ink/60">Group</span>
              <select
                className="border border-ink px-2 py-1.5 bg-cream text-sm"
                value={team.group}
                onChange={(e) => onUpdate({ group: e.target.value })}
              >
                {groups.map((g: any) => (
                  <option key={g.group_id} value={g.group_id}>Group {g.group_id}</option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[0.65rem] uppercase tracking-wider text-ink/60">Players</span>
              <button onClick={onAddMember} className="font-mono text-[0.65rem] uppercase tracking-wider underline">
                + Add Player
              </button>
            </div>
            <div className="space-y-2">
              {team.members.map((m: any, i: number) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    className="col-span-4 border border-ink px-2 py-1 bg-cream text-sm"
                    value={m.name}
                    onChange={(e) => onUpdateMember(i, { name: e.target.value })}
                    placeholder="Name"
                  />
                  <select
                    className="col-span-3 border border-ink px-2 py-1 bg-cream text-sm"
                    value={m.skill_level}
                    onChange={(e) => onUpdateMember(i, { skill_level: e.target.value })}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                  <select
                    className="col-span-2 border border-ink px-2 py-1 bg-cream text-sm"
                    value={m.gender || "M"}
                    onChange={(e) => onUpdateMember(i, { gender: e.target.value })}
                  >
                    <option value="M">M</option>
                    <option value="F">F</option>
                    <option value="X">X</option>
                  </select>
                  <select
                    className="col-span-2 border border-ink px-2 py-1 bg-cream text-sm"
                    value={m.role || ""}
                    onChange={(e) => onUpdateMember(i, { role: e.target.value || undefined })}
                  >
                    <option value="">—</option>
                    <option value="Captain">Captain</option>
                  </select>
                  <button
                    onClick={() => onRemoveMember(i)}
                    className="col-span-1 text-rust font-mono text-sm"
                    title="Remove player"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
