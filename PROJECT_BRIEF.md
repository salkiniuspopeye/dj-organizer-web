\# Project Brief — DJ Organizer Web App (React + TypeScript + PWA)



\## Goal

Build a browser-based DJ library organizer to tag tracks (exactly one main genre + one of five moods) and \*\*move (not copy)\*\* them into a target folder structure:

`Finished Tracks/<GENRE>/<MOOD>/…`.  

Sources: local SSD via \*\*File System Access API\*\* (Chromium) and \*\*Dropbox\*\* via OAuth + JS SDK.  

Provide a TikTok-like vertical swipe feed with \*\*audio preview starting at 35%\*\* of track duration.



\## Non-goals

\- No server/backend required; all processing local or via Dropbox API.

\- No audio transcoding (only probing/decoding for preview).

\- No upload of full audio files to third-party servers.



\## Key Requirements (condensed)

\- \*\*PWA\*\* with offline shell; runs in Chromium browsers (Chrome/Edge) as first-class, others get graceful fallbacks.

\- \*\*Local files\*\*: Use \*\*File System Access API\*\* with persistent permissions for chosen root folder (DirectoryHandle).

\- \*\*Dropbox\*\*: OAuth2 + JS SDK for list/move operations (same-account moves must avoid re-upload).

\- \*\*Preview\*\*: Web Audio API, preview \*\*start = duration \* 0.35\*\*, loop 20–30 s; fallback start min(10s, 0.1\*duration) and skip very short files.

\- \*\*Tagging\*\*: Exactly 1 `Genre` (configurable list) + 1 `Mood` (5 fixed slots with color+icon; names configurable).

\- \*\*Move Engine\*\*:

&nbsp; - Dry-run with full plan (source → target), conflict detection (rename with suffix ` (2)`), duplicate detection (hash/size/mtime).

&nbsp; - Apply: create folders, move files; cross-directory rename where possible; otherwise read/write+delete with verification.

&nbsp; - Progress UI, cancel support, resumable batches, CSV/JSON log export.

\- \*\*Structure\*\*: `Finished Tracks/<GENRE>/<MOOD>/…` (configurable root folder name).

\- \*\*Export\*\*: M3U8 per Genre/Mood (UTF-8, relative paths) + optional combined M3U8; CSV/JSON move log.

\- \*\*Data\*\*: No audio persisted, only small artwork/waveform thumbnails. Metadata/state in \*\*IndexedDB\*\*.

\- \*\*Scale\*\*: 10k–50k files; virtualized list; limited concurrent decodes; workers for probes/thumbnails.

\- \*\*A11y\*\*: WCAG AA contrast, ARIA labels, keyboard support; large hit targets.

\- \*\*Security/Privacy\*\*: Minimum OAuth scopes; tokens stored securely; clear permission prompts; no silent network I/O.



\## Tech Stack

\- \*\*React 18 + TypeScript\*\*, Vite, PWA (Workbox or Vite plugin).

\- UI: Tailwind + Headless UI (or Material optional).

\- State: Redux Toolkit (or Zustand) + RTK Query for Dropbox API wrapper.

\- Storage: IndexedDB via Dexie.

\- Virtualization: `react-window` (or `@tanstack/react-virtual`).

\- Audio: Web Audio API; \*\*ffmpeg.wasm only for duration probe\*\* fallback (no transcoding).

\- Dropbox: Official JS SDK.

\- Tests: Vitest + Testing Library; E2E: Playwright.

\- Lint/Format: ESLint, Prettier.



\## Entities (IndexedDB via Dexie)

\- `Track`:

&nbsp; - `id` (stable: hash(path or dropbox id + size + mtime))

&nbsp; - `name`, `size`, `duration`, `bitrate?`, `samplerate?`, `artist?`, `title?`, `bpm?`, `key?`, `artwork?`

&nbsp; - `source` (`local|dropbox`)

&nbsp; - `path` (local relative path) or `dropboxPathLower`

&nbsp; - `genre` (enum), `mood` (enum of 5)

&nbsp; - `status` (`unassigned|assigned|moved|error`)

&nbsp; - `targetPath?`

\- `LibrarySource`: type, root handle/token ref, settings

\- `Enums`: `Genre\[]` (editable), `Mood{BANGER,ENERGY,GROOVE,WARMUP,AFTERHOUR}` with color+icon



\## UI

\- \*\*SwipeFeed\*\* (vertical, paginated/virtualized). Card shows artwork, meta, Play/Pause, `genre` chip (single-select), `mood` (one of five) with color+icon.

\- \*\*TopBar\*\*: Source selector (Local/Dropbox), Filter (Genre/Mood/Status), Search, “Apply changes” with pending count.

\- \*\*Details Drawer\*\*: BPM/Key/Length/Format/Bitrate, full path, actions (Reset, Mark error).

\- \*\*Dry-Run View\*\*: Table (source → target), conflict markers, duplicate notices, export plan.



\## Acceptance Criteria

\- Can pick a local root folder; index 10k+ files without UI freeze (virtualized).

\- Preview starts at 35% with a loop and responsive controls.

\- Dry-run shows accurate plan; apply moves files into `Finished Tracks/<GENRE>/<MOOD>/…`.

\- Dropbox: authenticate, list, tag, and move files within Dropbox without download/upload loops.

\- Exports M3U8 and CSV/JSON logs; re-import into Rekordbox via folders works.

\- All operations leave no orphaned/half-moved files on cancel (resume safe).

\- Works offline for local mode (after initial load); clear fallbacks for non-Chromium.



\## Implementation Plan (Agent Tasks)

1\. \*\*Scaffold\*\*

&nbsp;  - Vite React + TS + PWA; Tailwind; ESLint/Prettier/Vitest; Playwright.

&nbsp;  - Create folders: `src/app`, `src/features/swipe`, `src/features/tagging`, `src/core/audio`, `src/core/fs`, `src/core/db`, `src/core/dropbox`, `src/shared/ui`, `public/`.

2\. \*\*IndexedDB (Dexie)\*\*

&nbsp;  - DB schema + migrations; repository functions; sample seed for tests.

3\. \*\*File System Access (local)\*\*

&nbsp;  - Permission + persistent `DirectoryHandle` storage; walk directory (async generator); safe write/move helpers.

4\. \*\*Dropbox Integration\*\*

&nbsp;  - OAuth flow; token persistence; list/move endpoints; rate-limit/backoff; error mapping.

5\. \*\*Audio Preview\*\*

&nbsp;  - Hook `useAudioPreview({ src, startOffset=0.35 })` with decode, buffer, loop; prefetch neighbors; concurrency caps.

6\. \*\*Swipe Feed\*\*

&nbsp;  - Virtualized list; `TrackCard` with play, genre select (single), mood select (5 buttons with color+icon), status badge.

7\. \*\*Move Engine\*\*

&nbsp;  - Planner (dry-run): compute target paths, detect conflicts/duplicates; present diff table, export JSON/CSV.

&nbsp;  - Executor: create folders, move files; verify; progress \& cancel; resume plan from log.

8\. \*\*Exports\*\*

&nbsp;  - M3U8 per Genre/Mood with relative paths; combined list; download as files.

9\. \*\*A11y \& Polish\*\*

&nbsp;  - ARIA, keyboard, focus rings, high contrast theme; i18n scaffolding (EN/DE).

10\. \*\*Tests\*\*

&nbsp;  - Unit: 35% start logic, path builder, conflict rules, dupe detection.

&nbsp;  - E2E: pick test dir (mocked), tag, dry-run, apply; dropbox mock via service worker/fixture.

11\. \*\*Docs\*\*

&nbsp;  - `README.md`, `ARCHITECTURE.md` (data flow, state, workers), `CONTRIBUTING.md`, `SECURITY.md`.



\## Configurables (env/JSON)

\- Genres list; Mood names (5 fixed slots); Target root folder name; File naming schema; Preview loop length.



\## Security Notes

\- Respect user permissions; never access files outside chosen root.

\- Dropbox scopes minimal; tokens revocable; clear logout; no unsolicited network calls.



\## Agent Tooling (MCP \& Commands)

Request these tools:

\- \*\*filesystem\*\* MCP server (read/write project files)

\- \*\*git\*\* tool (init repo, commits)

\- \*\*shell\*\* tool (run `npm create vite@latest`, `npm i`, `npm run build/test`)

\- \*\*http\*\* (to fetch docs/sdks as needed)



Run sequence (suggested):

\- Initialize repo, scaffold Vite React TS + PWA, configure Tailwind, Dexie, react-window, Dropbox SDK.

\- Implement steps 2–11 above with small, reviewable commits.

\- Provide `npm run` scripts: `dev`, `build`, `preview`, `lint`, `format`, `test`, `e2e`.

\- Generate docs and an example dataset loader for tests.



