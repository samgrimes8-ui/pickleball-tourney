"use client";

import { useState } from "react";
import { useTournament } from "@/lib/TournamentContext";

export default function Admin() {
  const { data, setData, resetToInitial, exportJson, importJson } = useTournament();
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);

  const renameTeam = (oldName: string, newName: string) => {
    if (oldName === newName || !newName.trim()) return;
    const next = { ...data };
    next.tournament_format = { ...next.tournament_format };

    if (next.tournament_format.round_robin) {
      next.tournament_format.round_robin = {
        ...next.tournament_format.round_robin,
        matches: next.tournament_format.round_robin.matches.map((m: any) => ({
          ...m,
          home: m.home === oldName ? newName : m.home,
          away: m.away === oldName ? newName : m.away,
          bye: m.bye === oldName ? newName : m.bye,
        })),
      };
    }

    if (next.rest_schedule) {
      const rs: Record<string, string> = {};
      Object.entries(next.rest_schedule).forEach(([k, v]) => {
        rs[k] = v === oldName ? newName : (v as string);
      });
      next.rest_schedule = rs;
    }

    return next;
  };

  const updateTeam = (teamId: number, updates: Partial<any>) => {
    let next = { ...data };
    const oldTeam = next.teams.find((t: any) => t.team_id === teamId);
    if (!oldTeam) return;

    if (updates.team_name && updates.team_name !== oldTeam.team_name) {
      next = renameTeam(oldTeam.team_name, updates.team_name) || next;
    }

    next.teams = next.teams.map((t: any) =>
      t.team_id === teamId ? { ...t, ...updates } : t
    );
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
        ? { ...t, members: t.members.map((m: any, i: number) => (i === idx ? { ...m, ...updates } : m)) }
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
          Edits sync to all devices automatically. Export to back up, import to restore.
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
          <label className="flex flex-col gap-1 sm:col-span-2">
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
        <h3 className="font-display text-lg mb-4">Teams ({data.teams.length})</h3>
        <p className="text-xs text-ink/60 mb-3 font-mono uppercase tracking-wider">
          Renaming a team updates the round-robin schedule and rest schedule automatically.
        </p>

        <div className="space-y-3 mt-3">
          {data.teams.map((team: any) => (
            <TeamEditor
              key={team.team_id}
              team={team}
              isExpanded={editingTeamId === team.team_id}
              onToggle={() => setEditingTeamId(editingTeamId === team.team_id ? null : team.team_id)}
              onUpdate={(updates) => updateTeam(team.team_id, updates)}
              onAddMember={() => addMember(team.team_id)}
              onUpdateMember={(idx, u) => updateMember(team.team_id, idx, u)}
              onRemoveMember={(idx) => removeMember(team.team_id, idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamEditor({
  team,
  isExpanded,
  onToggle,
  onUpdate,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
}: any) {
  return (
    <div className="border-2 border-ink/30">
      <div className="flex items-center justify-between p-3 bg-cream">
        <button onClick={onToggle} className="flex items-center gap-3 text-left flex-1">
          <span className="font-display text-sm">{isExpanded ? "▼" : "▶"}</span>
          <span className="font-display text-base">{team.team_name}</span>
          <span className="font-mono text-xs text-ink/60">
            #{team.team_id} · {team.members.length} player{team.members.length !== 1 ? "s" : ""}
          </span>
        </button>
      </div>

      {isExpanded && (
        <div className="p-3 border-t border-ink/20 bg-mustard/10 space-y-3">
          <div className="grid sm:grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[0.65rem] uppercase tracking-wider text-ink/60">Team Name</span>
              <input
                className="border border-ink px-2 py-1.5 bg-cream text-sm"
                defaultValue={team.team_name}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && v !== team.team_name) onUpdate({ team_name: v });
                }}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[0.65rem] uppercase tracking-wider text-ink/60">Notes</span>
              <input
                className="border border-ink px-2 py-1.5 bg-cream text-sm"
                value={team.notes || ""}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                placeholder="Optional"
              />
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
