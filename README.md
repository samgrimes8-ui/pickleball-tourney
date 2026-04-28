# 🏓 Pickleball Team Building Tournament

Retro-sporty tournament site with shared state across devices via Netlify Blobs.

## Run locally

```bash
npm install
npm run dev
```

For Netlify Blobs to work locally, use Netlify CLI:
```bash
npm install -g netlify-cli
netlify dev
```

## Deploy

Connected to Netlify via GitHub — pushes to `main` auto-deploy.

## How it works

- Shared state lives in a Netlify Blob (single JSON document)
- All clients fetch `/api/tournament` on load, poll every 15s
- Edits debounce 600ms then PUT to update the blob
- Click the LIVE indicator at the top right to manually refresh
- No auth — URL holders can view and edit

## Structure

```
src/
├── app/
│   ├── api/tournament/route.ts   Blobs API (GET/PUT/DELETE)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/                   Hero, GroupStage, Bracket, Teams, Admin, SyncIndicator
├── data/initialData.ts           Seeded tournament JSON
└── lib/
    ├── TournamentContext.tsx     Shared state + API sync
    └── standings.ts              Standings + bracket logic
```
