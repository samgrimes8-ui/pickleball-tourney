import { NextResponse } from "next/server";
import { getStore } from "@netlify/blobs";
import { initialData } from "@/data/initialData";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const STORE_NAME = "tournament";
const KEY = "current";

function getTournamentStore() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

export async function GET() {
  try {
    const store = getTournamentStore();
    const existing = await store.get(KEY, { type: "json" });
    if (existing) {
      return NextResponse.json({ data: existing });
    }
    // First run: seed with initial data
    await store.setJSON(KEY, initialData);
    return NextResponse.json({ data: initialData });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to load tournament", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.teams || !body.tournament_format) {
      return NextResponse.json({ error: "Invalid tournament data" }, { status: 400 });
    }
    const store = getTournamentStore();
    await store.setJSON(KEY, body);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to save tournament", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const store = getTournamentStore();
    await store.setJSON(KEY, initialData);
    return NextResponse.json({ data: initialData });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to reset", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}
