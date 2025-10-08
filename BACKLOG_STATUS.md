| Prio | Task | Status (Ja/Nein) | Evidenz (Datei/Commit/Zeile) |
|---|---|---|---|
| P0 | Ordner rekursiv wählen (File System Access API, Chromium) | Ja | `src/core/fs/fileSystem.ts` (`walkDirectory` function) |
| P0 | Nur .aiff/.aif/.mp3/.wav | Ja | `src/core/fs/fileSystem.ts` (`AUDIO_EXTENSIONS` array) |
| P0 | Alphabetisch (case-insensitive), flache Liste | Ja | `core/db/db.ts` (schema), `App.tsx` (population), `features/swipe/SwipeFeed.tsx` (query) |
| P0 | Erste Datei anzeigen (Titel, Dauer*, Cover* wenn vorhanden) | Ja | `src/features/swipe/TrackCard.tsx` (Renders title, duration, artwork) |
| P0 | Play/Pause ab 0:00, Cleanup | Nein | `src/core/audio/useAudioPreview.ts` (Starts at 35% offset, not 0:00) |
| P0 | Navigation: Mobile Scroll/Swipe; Desktop Buttons + Pfeiltasten | Nein | `src/features/swipe/SwipeFeed.tsx` (CSS for swipe exists, but no desktop buttons/keys) |
| P0 | „Kaputte Datei“ kennzeichnen | Ja | `src/core/audio/useAudioPreview.ts` & `src/features/swipe/TrackCard.tsx` (Error state on decode failure) |