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
- [ ] Bug: Fix TS2552 'MovePlanItem' in db.ts — Korrigiert den Fehler 'MovePlanItem' in db.ts.
- [ ] Bug: Fix TS2349 'Remote<ThumbnailProcessor>' not callable in TrackCard.tsx — Behebt den Fehler, dass 'Remote<ThumbnailProcessor>' in TrackCard.tsx nicht aufrufbar ist.
- [ ] UI: "Ordner wählen"-Button anzeigen — Zeigt einen Button zum Auswählen eines lokalen Ordners an.
- [ ] Core: DirectoryHandle speichern & laden — Implementiert das Speichern und Laden des DirectoryHandle für persistente Ordnerauswahl.
- [ ] Core: Rekursives Einlesen des Ordners — Implementiert das rekursive Durchsuchen des ausgewählten Ordners nach Dateien.
- [ ] Core: Rechte für DirectoryHandle prüfen & anfordern — Stellt sicher, dass die App die notwendigen Rechte für den Zugriff auf den Ordner hat.
- [ ] Core: Nur Audio-Dateien filtern — Implementiert die Logik, um nur Audio-Dateien aus dem Ordner zu identifizieren.
- [ ] Core: .aiff-Unterstützung im Indexer — Erweitert den Indexer, um .aiff-Dateien korrekt zu verarbeiten.
- [ ] Core: Audio-Dauer ermitteln (Web Audio API) — Nutzt die Web Audio API, um die Dauer von Audio-Dateien zu bestimmen.
- [ ] Core: Fallback für unbekannte Audio-Dauer — Implementiert einen Fallback, wenn die Audio-Dauer nicht ermittelt werden kann (z.B. 10s oder 0.1*len).
- [ ] DB: IndexedDB-Schema für Tracks erweitern — Fügt Felder wie 'duration' und 'sourcePath' zum Track-Schema hinzu.
- [ ] DB: Tracks in IndexedDB speichern — Speichert die indexierten Audio-Dateien in der IndexedDB.
- [ ] Core: useAudioPreview Hook erstellen — Implementiert einen React Hook für die Audio-Vorschau.
- [ ] Core: Preview-Start bei 35% der Dauer — Stellt sicher, dass die Audio-Vorschau bei 35% der Track-Dauer beginnt.
- [ ] Core: Preview-Loop (20-30s) — Implementiert eine Schleife für die Audio-Vorschau von 20-30 Sekunden.
- [ ] Core: Preview Stop/Cleanup — Implementiert die Logik zum Stoppen und Aufräumen der Audio-Vorschau.
- [ ] UI: Preview-Steuerung in TrackCard — Fügt UI-Elemente zur TrackCard hinzu, um die Vorschau zu starten/stoppen.
- [ ] UI: Call-to-Action bei leerem Zustand — Zeigt eine Aufforderung an, wenn keine Tracks geladen sind.
- [ ] UI: "Demo-Daten laden"-Button — Fügt einen Button zum Laden von 10 Fake-Tracks hinzu.
- [ ] DB: Demo-Daten-Generator — Implementiert die Logik zum Generieren von 10 Fake-Tracks für die IndexedDB.
- [ ] DB: Indizes für 'status', 'genre', 'mood' — Fügt die notwendigen Indizes zum Dexie-Schema hinzu.
- [ ] DB: Basismigration für Dexie-Schema — Implementiert eine grundlegende Migration für Schema-Änderungen.

## P1 Tasks

- [ ] Core: MoveEngine-Logik verfeinern — Verbessert die bestehende MoveEngine-Logik (z.B. Konfliktlösung).
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
