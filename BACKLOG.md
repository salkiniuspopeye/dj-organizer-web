# Backlog Priorisierung

## P0: Minimalziel & Blockierende Fehler (Sofortige Priorität)
Diese Aufgaben sind entscheidend für die grundlegende Funktionalität der Anwendung und die Behebung von Build-Fehlern, die den Fortschritt blockieren.

## P1: Weitere Kernpunkte (Nächste Priorität)
Diese Aufgaben erweitern die Kernfunktionalität und verbessern die Robustheit der Anwendung.

## P2: Feinschliff & Erweiterungen (Spätere Priorität)
Diese Aufgaben konzentrieren sich auf Detailverbesserungen, Dokumentation und zusätzliche Features.

# Backlog

## P0 Tasks

- [x] Bug: Fix TS2552 'OffscreenAudioContext' in audioWorker.ts — Korrigiert den Fehler 'OffscreenAudioContext' in audioWorker.ts.
- [x] Bug: Fix TS2349 'Remote<AudioProcessor>' not callable in useAudioPreview.ts — Behebt den Fehler, dass 'Remote<AudioProcessor>' in useAudioPreview.ts nicht aufrufbar ist.
- [x] Bug: Fix TS2552 'getAudioContext' in useAudioPreview.ts — Korrigiert den Fehler 'getAudioContext' in useAudioPreview.ts.
- [x] Bug: Fix TS2552 'MovePlanItem' in db.ts — Korrigiert den Fehler 'MovePlanItem' in db.ts.
- [x] Bug: Fix TS2349 'Remote<ThumbnailProcessor>' not callable in TrackCard.tsx — Behebt den Fehler, dass 'Remote<ThumbnailProcessor>' in TrackCard.tsx nicht aufrufbar ist.
- [x] UI: "Ordner wählen"-Button anzeigen — Zeigt einen Button zum Auswählen eines lokalen Ordners an.
- [x] Core: DirectoryHandle speichern & laden — Implementiert das Speichern und Laden des DirectoryHandle für persistente Ordnerauswahl.
- [x] Core: Rekursives Einlesen des Ordners — Implementiert das rekursives Durchsuchen des ausgewählten Ordners nach Dateien.
- [x] Core: Rechte für DirectoryHandle prüfen & anfordern — Stellt sicher, dass die App die notwendigen Rechte für den Zugriff auf den Ordner hat.
- [x] Core: Nur Audio-Dateien filtern — Implementiert die Logik, um nur Audio-Dateien aus dem Ordner zu identifizieren.
- [x] Core: .aiff-Unterstützung im Indexer — Erweitert den Indexer, um .aiff-Dateien korrekt zu verarbeiten.
- [x] Core: Audio-Dauer ermitteln (Web Audio API) — Nutzt die Web Audio API, um die Dauer von Audio-Dateien zu bestimmen.
- [x] Core: Fallback für unbekannte Audio-Dauer — Implementiert einen Fallback, wenn die Audio-Dauer nicht ermittelt werden kann (z.B. 10s oder 0.1*len).
- [x] DB: IndexedDB-Schema für Tracks erweitern — Fügt Felder wie 'duration' und 'sourcePath' zum Track-Schema hinzu.
- [x] DB: Tracks in IndexedDB speichern — Speichert die indexierten Audio-Dateien in der IndexedDB.
- [x] Core: useAudioPreview Hook erstellen — Implementiert einen React Hook für die Audio-Vorschau.
- [x] Core: Preview-Start bei 35% der Dauer — Stellt sicher, dass die Audio-Vorschau bei 35% der Track-Dauer beginnt.
- [x] Core: Preview-Loop (20-30s) — Implementiert eine Schleife für die Audio-Vorschau von 20-30 Sekunden.
- [x] Core: Preview Stop/Cleanup — Implementiert die Logik zum Stoppen und Aufräumen der Audio-Vorschau.
- [x] UI: Preview-Steuerung in TrackCard — Fügt UI-Elemente zur TrackCard hinzu, um die Vorschau zu starten/stoppen.
- [x] UI: Call-to-Action bei leerem Zustand — Zeigt eine Aufforderung an, wenn keine Tracks geladen sind.
- [x] UI: "Demo-Daten laden"-Button — Fügt einen Button zum Laden von 10 Fake-Tracks hinzu.
- [x] DB: Demo-Daten-Generator — Implementiert die Logik zum Generieren von 10 Fake-Tracks für die IndexedDB.
- [x] DB: Indizes für 'status', 'genre', 'mood' — Fügt die notwendigen Indizes zum Dexie-Schema hinzu.
- [x] DB: Basismigration für Dexie-Schema — Implementiert eine grundlegende Migration für Schema-Änderungen.
- [x] Bug: Fix TS2448/TS2454 handleIndexFolder declaration in App.tsx — Behebt Fehler bei der Deklaration von 'handleIndexFolder' in App.tsx.
- [x] Bug: Fix TS6133 'total' unused in App.tsx — Behebt den Fehler, dass 'total' in App.tsx deklariert, aber nicht verwendet wird.
- [x] Bug: Fix TS2304 'Track' not found in App.tsx — Korrigiert den Fehler, dass 'Track' in App.tsx nicht gefunden wird.
- [x] Bug: Fix TS6133 'tx' unused in db.ts — Behebt den Fehler, dass 'tx' in db.ts deklariert, aber nicht verwendet wird.
- [x] Bug: Fix TS2304 'FileSystemPermissionMode' not found in directoryHandler.ts — Korrigiert den Fehler, dass 'FileSystemPermissionMode' in directoryHandler.ts nicht gefunden wird.
- [x] Bug: Fix TS2554 'ThumbnailProcessorWorker' arguments in TrackCard.tsx — Behebt den Fehler, dass 'ThumbnailProcessorWorker' in TrackCard.tsx falsche Argumente erhält.
- [ ] Bug: Fix TS2552 'worker' not found in TrackCard.tsx — Korrigiert den Fehler, dass 'worker' in TrackCard.tsx nicht gefunden wird.

## P1 Tasks

- [x] Core: MoveEngine-Logik verfeinern — Verbessert die bestehende MoveEngine-Logik (z.B. Konfliktlösung).
- [ ] Test: Unit-Tests für MoveEngine erweitern — Fügt weitere Unit-Tests für die MoveEngine hinzu.
- [ ] Core: Dropbox-API-Authentifizierung — Implementiert die OAuth-Authentifizierung für Dropbox.
- [ ] Core: Dropbox-Dateiliste abrufen — Implementiert das Abrufen von Dateien aus Dropbox.
- [ ] Test: E2E-Tests für Kernfunktionen — Schreibt End-to-End-Tests für wichtige Benutzerflows.
- [ ] Test: Unit-Tests für Indexer — Fügt Unit-Tests für die Indexer-Logik hinzu.
- [ ] A11y: Tastaturnavigation verbessern — Stellt sicher, dass die App vollständig über die Tastatur bedienbar ist.
- [ ] A11y: ARIA-Labels für UI-Elemente — Fügt ARIA-Labels für eine bessere Screenreader-Unterstützung hinzu.

## P2 Tasks

- [ ] Docs: README.md aktualisieren — Aktualisiert die README-Datei mit Setup-Anweisungen und Projektübersicht.
- [ ] Docs: CONTRIBUTING.md erweitern — Fügt weitere Richtlinien für Beitragende hinzu.
- [ ] UI: Ladeindikatoren für lange Operationen — Zeigt Ladeindikatoren bei Operationen wie dem Indexieren großer Ordner.
- [ ] UI: Benachrichtigungssystem — Implementiert ein System für Benutzerbenachrichtigungen (z.B. "Ordner erfolgreich indexiert").