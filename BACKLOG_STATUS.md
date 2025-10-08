| Prio | Task | Status (Ja/Nein/Teilweise) | Evidenz (Datei/Commit/Zeile) | Risiken/ToDo |
|---|---|---|---|---|
| P0 | Ordner rekursiv wählen (File System Access API, Chromium) | Ja | `src/core/fs/fileSystem.ts` (`walkDirectory`), `src/App.tsx` (`showDirectoryPicker`) | |
| P0 | Nur .aiff/.aif/.mp3/.wav berücksichtigen | Ja | `src/core/fs/fileSystem.ts` (`AUDIO_EXTENSIONS`, `walkDirectory`) | |
| P0 | Alphabetisch (case-insensitive) sortieren, flache Liste | Ja | `src/core/db/db.ts` (`lowerCaseName` schema), `src/App.tsx` (populates `lowerCaseName`), `src/features/swipe/SwipeFeed.tsx` (`orderBy`) | |
| P0 | Erste Datei anzeigen (Titel, Dauer*, Cover* wenn vorhanden) | Ja | `src/features/swipe/SwipeFeed.tsx`, `src/features/swipe/TrackCard.tsx` | |
| P0 | Play/Pause ab 0:00, sauberes Cleanup | Ja | `src/core/audio/useAudioPreview.ts` (`play` starts at 0, `cleanupSource`) | |
| P0 | Navigation: Mobile Scroll/Swipe; Desktop Buttons + Pfeiltasten | Ja | `src/features/swipe/SwipeFeed.tsx` (CSS, keyboard listeners, buttons) | |
| P0 | „Kaputte Datei“ klar kennzeichnen (nicht abspielbar) | Ja | `src/core/audio/useAudioPreview.ts` (sets `error`), `src/features/swipe/TrackCard.tsx` (displays error) | | 
| P0 | Empty/Errors freundlich | Teilweise | `src/App.tsx` (`empty_state_message`), `src/core/i18n/i18n.ts` | Generische `alert()`-Meldungen bei anderen Fehlern; weitere Verfeinerung nötig. |
| Hotfix | Directory-Picker-Guard (catch + UI-Hinweis) | Ja | `src/App.tsx` (try/catch, `showDirectoryError` state, conditional UI), `src/core/i18n/i18n.ts` | |
| P0 | Fallback „Dateien wählen“ (input multiple webkitdirectory) | Ja | `src/App.tsx` (`fileInputRef`, `handleIndexFiles`, hidden input, button `onClick`) | |
| P0 | Rekursiv-Scan mit Concurrency-Limit + Skip-Liste | Ja | `src/core/fs/fileSystem.ts` (new `walkDirectory` with `CONCURRENCY_LIMIT`, `SKIP_PATTERNS`, `shouldSkip`, `progressCallback`, `abortSignal`), `src/App.tsx` (scan progress states, abort button) | |
| P0 | Fehlerklassen/„kaputte Datei“ UX | Nein | | Erfordert Definition von Fehlertypen und Aktualisierung der UI-Komponenten zur Anzeige. |
| P0 | 2 Mini-Tests (Filter & Sort) | Nein | | Erfordert das Schreiben neuer Testdateien oder das Hinzufügen zu bestehenden. |
| Bug | Fix Vitest module resolution for test files (BLOCKED) | Nein | `BACKLOG.md` | Blockiert zuverlässiges Testen. |
