"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import GroupStage from "@/components/GroupStage";
import Bracket from "@/components/Bracket";
import Teams from "@/components/Teams";
import Admin from "@/components/Admin";
import SyncIndicator from "@/components/SyncIndicator";

const TABS = [
  { id: "groups", label: "Group Stage" },
  { id: "bracket", label: "Bracket" },
  { id: "teams", label: "Rosters" },
  { id: "admin", label: "⚙ Admin" },
];

export default function Home() {
  const [tab, setTab] = useState("groups");

  return (
    <main>
      <Hero />

      {/* Tabs */}
      <nav className="sticky top-0 z-30 bg-cream border-b-2 border-ink">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-2 overflow-x-auto">
          <div className="flex gap-2 flex-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`tab-btn ${tab === t.id ? "active" : ""}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <SyncIndicator />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {tab === "groups" && <GroupStage />}
        {tab === "bracket" && <Bracket />}
        {tab === "teams" && <Teams />}
        {tab === "admin" && <Admin />}
      </div>

      <footer className="border-t-4 border-ink mt-16 py-6 text-center font-mono text-xs uppercase tracking-widest text-ink/60">
        ★ Pickleball Team Building · Built for the courts ★
      </footer>
    </main>
  );
}
