"use client";

import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from "react";
import { initialData } from "@/data/initialData";

type SyncStatus = "loading" | "idle" | "saving" | "saved" | "error";

type Ctx = {
  data: any;
  setData: (d: any) => void;
  resetToInitial: () => Promise<void>;
  exportJson: () => void;
  importJson: (json: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  status: SyncStatus;
  lastSyncedAt: number | null;
};

const TournamentContext = createContext<Ctx | null>(null);

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<any>(initialData);
  const [status, setStatus] = useState<SyncStatus>("loading");
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoad = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/tournament", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setDataState(json.data);
      setLastSyncedAt(Date.now());
      setStatus("idle");
    } catch (e) {
      console.error("Fetch failed:", e);
      setStatus("error");
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData().finally(() => {
      isInitialLoad.current = false;
    });
  }, [fetchData]);

  // Auto-poll every 15s so other devices pick up changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (status === "idle" || status === "saved") {
        fetchData();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchData, status]);

  const persistData = useCallback(async (next: any) => {
    setStatus("saving");
    try {
      const res = await fetch("/api/tournament", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setLastSyncedAt(Date.now());
      setStatus("saved");
      setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 1500);
    } catch (e) {
      console.error("Save failed:", e);
      setStatus("error");
    }
  }, []);

  const setData = useCallback((next: any) => {
    setDataState(next);
    if (isInitialLoad.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      persistData(next);
    }, 600);
  }, [persistData]);

  const resetToInitial = async () => {
    if (!confirm("Reset all tournament data to original? This will erase scores and edits for everyone.")) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/tournament", { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setDataState(json.data);
      setLastSyncedAt(Date.now());
      setStatus("saved");
      setTimeout(() => setStatus((s) => (s === "saved" ? "idle" : s)), 1500);
    } catch (e) {
      console.error("Reset failed:", e);
      setStatus("error");
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tournament-${data.date?.replace(/\//g, "-") || "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (json: string) => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed.teams || !parsed.tournament_format) {
        alert("Invalid tournament file — missing required fields.");
        return false;
      }
      setDataState(parsed);
      await persistData(parsed);
      return true;
    } catch {
      alert("Couldn't parse that JSON file.");
      return false;
    }
  };

  return (
    <TournamentContext.Provider
      value={{
        data,
        setData,
        resetToInitial,
        exportJson,
        importJson,
        refresh: fetchData,
        status,
        lastSyncedAt,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const ctx = useContext(TournamentContext);
  if (!ctx) throw new Error("useTournament must be used inside TournamentProvider");
  return ctx;
}
