# Sprint Plan - Sprint 1 (P0 Tasks)

This plan outlines the P0 tasks for Sprint 1, ordered by logical dependency and priority.

## Core Functionality

1.  Ordner rekursiv wählen (File System Access API, Chromium)
2.  Nur .aiff/.aif/.mp3/.wav berücksichtigen
3.  Alphabetisch (case-insensitive) sortieren, flache Liste
4.  Erste Datei anzeigen (Titel, Dauer*, Cover* wenn vorhanden)
5.  Play/Pause ab 0:00, sauberes Cleanup
6.  Navigation: Mobile Scroll/Swipe; Desktop Buttons + Pfeiltasten
7.  „Kaputte Datei“ klar kennzeichnen (nicht abspielbar)

## Error Handling & Robustness

8.  Empty/Errors freundlich
9.  Hotfix: Directory-Picker-Guard (catch + UI-Hinweis)
10. P0: Fallback „Dateien wählen“ (input multiple webkitdirectory)
11. P0: Rekursiv-Scan mit Concurrency-Limit + Skip-Liste
12. P0: Fehlerklassen/„kaputte Datei“ UX

## Quality & Testing

13. P0: 2 Mini-Tests (Filter & Sort)
14. Bug: Fix Vitest module resolution for test files (BLOCKED)
