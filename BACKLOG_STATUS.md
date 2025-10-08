| Prio | Task | Status (Ja/Nein) | Evidenz (Datei/Commit/Zeile) |
|---|---|---|---|
| P0 | Ordner rekursiv wählen (File System Access API, Chromium) | Ja | `src/core/fs/fileSystem.ts` (`walkDirectory` function) |
| P0 | Nur .aiff/.aif/.mp3/.wav | Ja | `src/core/fs/fileSystem.ts` (`AUDIO_EXTENSIONS` array) |
| P0 | Alphabetisch (case-insensitive), flache Liste | Ja | `core/db/db.ts` (schema), `App.tsx` (population), `features/swipe/SwipeFeed.tsx` (query) |
| P0 | Erste Datei anzeigen (Titel, Dauer*, Cover* wenn vorhanden) | Ja | `src/features/swipe/TrackCard.tsx` (Renders title, duration, artwork) |
| P0 | Play/Pause ab 0:00, Cleanup | Ja | `src/core/audio/useAudioPreview.ts` (startOffset = 0) |
| P0 | Navigation: Mobile Scroll/Swipe; Desktop Buttons + Pfeiltasten | Ja | `src/features/swipe/SwipeFeed.tsx` (Keyboard/button handlers) |
| P0 | „Kaputte Datei“ kennzeichnen | Ja | `src/core/audio/useAudioPreview.ts` & `src/features/swipe/TrackCard.tsx` (Error state on decode failure) |
| Hotfix | Directory-Picker-Guard (catch + UI-Hinweis) | Ja | `src/App.tsx`, `src/core/i18n/i18n.ts` |
| P0 | Fallback „Dateien wählen“ (input multiple webkitdirectory) | Ja | `src/App.tsx`, `src/core/fs/fileSystem.ts` |
| P0 | Rekursiv-Scan mit Concurrency-Limit + Skip-Liste | Nein | |
| P0 | Fehlerklassen/„kaputte Datei“ UX | Nein | |
| P0 | 2 Mini-Tests (Filter & Sort) | Nein | |