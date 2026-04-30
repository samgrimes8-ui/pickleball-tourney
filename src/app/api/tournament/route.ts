import { NextResponse } from "next/server";
import { getStore } from "@netlify/blobs";
import { initialData } from "@/data/initialData";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const STORE_NAME = "tournament";
const KEY = "current";

// Process-local fallback used when Netlify Blobs isn't configured (e.g. local
// `next dev`/`next start` outside of `netlify dev`). Lets the app function
// during development without crashing the API.
const memory: { current: any | null } = {
  current: (globalThis as any).__pb_memory_current ?? null,
};
(globalThis as any).__pb_memory_current = memory.current;

function memoryGet() {
  return (globalThis as any).__pb_memory_current ?? null;
}
function memorySet(value: any) {
  (globalThis as any).__pb_memory_current = value;
}

function isBlobsUnconfigured(err: unknown) {
  const msg = (err as any)?.message || String(err);
  return /not been configured to use Netlify Blobs/i.test(msg);
}

function isCurrentSchema(d: any) {
  return !!(d && d.tournament_format && d.tournament_format.round_robin);
}

async function readState(): Promise<{ data: any; persistent: boolean }> {
  try {
    const store = getStore({ name: STORE_NAME, consistency: "strong" });
    const existing = await store.get(KEY, { type: "json" });
    if (existing && isCurrentSchema(existing)) {
      return { data: existing, persistent: true };
    }
    // Either missing or stale schema — re-seed.
    await store.setJSON(KEY, initialData);
    return { data: initialData, persistent: true };
  } catch (err) {
    if (!isBlobsUnconfigured(err)) throw err;
    const cached = memoryGet();
    if (cached && isCurrentSchema(cached)) return { data: cached, persistent: false };
    memorySet(initialData);
    return { data: initialData, persistent: false };
  }
}

async function writeState(value: any): Promise<{ persistent: boolean }> {
  try {
    const store = getStore({ name: STORE_NAME, consistency: "strong" });
    await store.setJSON(KEY, value);
    return { persistent: true };
  } catch (err) {
    if (!isBlobsUnconfigured(err)) throw err;
    memorySet(value);
    return { persistent: false };
  }
}

export async function GET() {
  try {
    const { data, persistent } = await readState();
    return NextResponse.json({ data, persistent });
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
    const { persistent } = await writeState(body);
    return NextResponse.json({ ok: true, persistent });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to save tournament", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const { persistent } = await writeState(initialData);
    return NextResponse.json({ data: initialData, persistent });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to reset", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}
