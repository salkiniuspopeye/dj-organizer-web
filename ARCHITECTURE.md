# Architecture

This document provides a high-level overview of the architecture of the DJ Organizer Web App.

## Data Flow

The application works with two main data sources: the local file system (via the File System Access API) and Dropbox. All data is processed locally in the browser.

1.  **Indexing**: Files are indexed from the selected source. Metadata is extracted and stored in IndexedDB. For local files, this involves traversing a user-granted `FileSystemDirectoryHandle`. For Dropbox, it involves listing files via the Dropbox API.
2.  **Tagging**: The user tags tracks with a genre and a mood through an interactive swipe interface.
3.  **Move Plan Generation (Dry Run)**: The application computes target paths for tagged files, detects potential conflicts (e.g., same target path, duplicate content based on size/mtime), and presents a detailed plan to the user.
4.  **Move Execution**: Upon user approval, the application executes the move plan. For local files, this involves copying the file to the new location and then deleting the original. For Dropbox, it uses the Dropbox API's move functionality.
5.  **Export**: Users can export M3U8 playlists based on genre/mood and a comprehensive move log in CSV or JSON format.

## State Management

We use **Redux Toolkit** for global state management. This includes:

- UI state (e.g., selected filters, current view).
- The list of tracks currently in the view.
- The status of the move engine.

**RTK Query** is used to wrap the Dropbox API, providing caching and automatic refetching (planned).

## Database

**IndexedDB** is used as the primary local storage, managed via **Dexie.js**. It stores:

- `tracks`: All metadata about the audio files (id, name, size, mtime, duration, artist, title, bpm, key, artwork, source, path/dropboxPathLower, genre, mood, status, targetPath).
- `librarySources`: Information about the configured local or Dropbox sources, including persistent `FileSystemDirectoryHandle` references for local access and refresh tokens for Dropbox.
- `genres`: The user-configurable list of genres.

## File System Access (Local)

- **Persistent Permissions**: The application requests and stores `FileSystemDirectoryHandle` objects in IndexedDB, allowing persistent read/write access to user-selected directories across sessions.
- **Directory Traversal**: An asynchronous generator (`walkDirectory`) is used to efficiently traverse directories and their subdirectories, yielding file handles.
- **File Operations**: Helper functions (`getFileHandleFromPath`, `moveFile`) facilitate retrieving file handles from paths and performing copy-then-delete operations for local file moves.

## Dropbox Integration

- **OAuth2 Flow**: Handles the complete OAuth2 authentication flow to obtain and refresh access tokens.
- **Token Persistence**: Dropbox refresh tokens are securely stored in IndexedDB via `librarySources` for long-term access.
- **API Operations**: Utilizes the official Dropbox JS SDK for listing files (`filesListFolder`) and moving files (`filesMoveV2`).

## Audio Preview

- **Web Audio API**: The `useAudioPreview` React hook leverages the Web Audio API for efficient in-browser audio playback.
- **Start Offset**: Previews start at 35% of the track's duration, with a fallback for very short files.
- **Looping**: Audio segments are looped for a configurable duration (e.g., 20-30 seconds).
- **Concurrency**: Designed to handle limited concurrent decodes to prevent UI freezes.

## Workers

Web Workers will be used for performance-critical tasks to avoid blocking the main thread:

- **Audio Probing**: A worker will be used to probe audio files for duration and other metadata, potentially using `ffmpeg.wasm` as a fallback (planned).
- **Thumbnail Generation**: A worker will generate and cache waveforms or artwork thumbnails (planned).

## Internationalization (i18n)

- **i18next**: Integrated using `i18next` and `react-i18next` for multi-language support.
- **Language Detection**: Uses `i18next-browser-languagedetector` to automatically detect the user's preferred language.
- **Translations**: Currently supports English (en) and German (de) translations for key UI elements.
