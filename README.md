# DJ Organizer Web App

This is a browser-based DJ library organizer designed to help DJs tag, organize, and manage their music collections. It supports local file system access (via the File System Access API), allowing users to categorize tracks by genre and mood, preview audio, and move files into a structured target folder system.

## Goal

To build a browser-based DJ library organizer to tag tracks (exactly one main genre + one of five moods) and move them into a target folder structure: `Finished Tracks/<GENRE>/<MOOD>/…`. Sources include local SSD via the File System Access API. T

## Key Features

- **Local File Management**: Utilizes the File System Access API for persistent access to chosen local music folders, enabling direct file operations.
- **Intuitive Tagging**: Assign a single genre (from a configurable list) and one of five moods (with customizable names, colors, and icons) to each track.

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite
- **Styling**: Tailwind CSS, Headless UI
- **Local Storage**: IndexedDB via Dexie.js
- **Audio Processing**: Web Audio API (for preview), `ffmpeg.wasm` (planned for duration probe fallback)
- **Linting/Formatting**: ESLint, Prettier
