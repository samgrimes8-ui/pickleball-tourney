"use client";

import { useTournament } from "@/lib/TournamentContext";

export default function SyncIndicator() {
  const { status, lastSyncedAt, refresh } = useTournament();

  const label = (() => {
    switch (status) {
      case "loading": return "LOADING…";
      case "saving": return "SAVING…";
      case "saved": return "SAVED ✓";
      case "error": return "OFFLINE";
      case "idle":
      default:
        if (!lastSyncedAt) return "READY";
        const secs = Math.floor((Date.now() - lastSyncedAt) / 1000);
        if (secs < 5) return "LIVE ●";
        if (secs < 60) return `${secs}s ago`;
        return `${Math.floor(secs / 60)}m ago`;
    }
  })();

  const dotColor = (() => {
    switch (status) {
      case "saving": return "bg-mustard";
      case "saved": return "bg-forest";
      case "error": return "bg-rust";
      case "loading": return "bg-ink/40";
      default: return "bg-forest";
    }
  })();

  return (
    <button
      onClick={() => refresh()}
      className="flex items-center gap-2 px-2.5 py-1 border-2 border-ink bg-cream font-mono text-[0.65rem] uppercase tracking-wider hover:bg-mustard transition-colors"
      title="Click to refresh"
    >
      <span className={`w-2 h-2 rounded-full ${dotColor} ${status === "saving" || status === "loading" ? "animate-pulse" : ""}`} />
      <span>{label}</span>
    </button>
  );
}
