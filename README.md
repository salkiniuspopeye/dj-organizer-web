# DJ Organizer Web App

This is a browser-based DJ library organizer designed to help DJs tag, organize, and manage their music collections. It supports both local file system access (via the File System Access API) and cloud integration (via Dropbox), allowing users to categorize tracks by genre and mood, preview audio, and move files into a structured target folder system.

## Goal

To build a browser-based DJ library organizer to tag tracks (exactly one main genre + one of five moods) and **move (not copy)** them into a target folder structure: `Finished Tracks/<GENRE>/<MOOD>/…`. Sources include local SSD via the **File System Access API** (Chromium) and **Dropbox** via OAuth + JS SDK. The application provides a TikTok-like vertical swipe feed with **audio preview starting at 35%** of track duration.

## Key Features

- **PWA Support**: Installable as a Progressive Web App for an app-like experience, with offline capabilities.
- **Local File Management**: Utilizes the File System Access API for persistent access to chosen local music folders, enabling direct file operations.
- **Dropbox Integration**: Seamlessly connect with Dropbox accounts for listing, tagging, and moving tracks in the cloud.
- **Audio Preview**: Instantly preview tracks with a Web Audio API-powered player, starting at 35% of the track duration and looping a segment.
- **Intuitive Tagging**: Assign a single genre (from a configurable list) and one of five moods (with customizable names, colors, and icons) to each track.
- **Smart Move Engine**: Plan and execute file moves to a structured target directory. Features include dry-run, conflict detection (path and content duplicates), and robust error handling.
- **Export Capabilities**: Generate M3U8 playlists (per genre/mood or combined) and export move logs in CSV/JSON formats.
- **Scalable UI**: Efficiently handles large music libraries (10k-50k files) with virtualized lists to maintain UI responsiveness.
- **Internationalization (i18n)**: Supports multiple languages (currently English and German).

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite
- **Styling**: Tailwind CSS, Headless UI
- **State Management**: Redux Toolkit (or Zustand) + RTK Query for Dropbox API wrapper (planned)
- **Local Storage**: IndexedDB via Dexie.js
- **Virtualization**: `@tanstack/react-virtual`
- **Audio Processing**: Web Audio API (for preview), `ffmpeg.wasm` (planned for duration probe fallback)
- **Cloud Integration**: Official Dropbox JS SDK
- **Testing**: Vitest (Unit), React Testing Library (Unit), Playwright (E2E)
- **Linting/Formatting**: ESLint, Prettier
- **PWA**: `vite-plugin-pwa`
- **Internationalization**: `i18next`, `react-i18next`, `i18next-browser-languagedetector`

## Setup

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js (LTS version recommended) and npm installed on your machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Theimbold/dj-organizer-web.git
    cd dj-organizer-web
    ```
2.  **Install NPM packages:**
    ```bash
    npm install
    ```
3.  **Dropbox API Key (Optional):**
    To enable Dropbox integration in your local development environment:
    - Go to the [Dropbox Developers App Console](https://www.dropbox.com/developers/apps).
    - Create a new app (choose "Scoped access" and "App folder" or "Full Dropbox" depending on your testing needs).
    - Add `http://localhost:5173/` (or your Vite dev server URL) as a Redirect URI.
    - Copy your App key (Client ID).
    - Replace the placeholder `YOUR_DROPBOX_APP_CLIENT_ID` in `src/core/dropbox/dropbox.ts` with your actual Client ID.

### Running the Application

```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the application in your browser.

## Available Scripts

In the project directory, you can run:

### `npm run build`

Builds the app for production to the `dist` folder.

### `npm run lint`

Lints the project files.

### `npm run format`

Formats the project files with Prettier.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run test:ui`

Launches the test runner with a UI.

### `npm run test:e2e`

Launches the Playwright E2E tests.

### `npm run test:e2e:ui`

Launches the Playwright E2E tests with a UI.
