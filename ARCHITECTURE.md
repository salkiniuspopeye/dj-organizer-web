# Architecture

This document provides a high-level overview of the architecture of the DJ Organizer Web App.

## Data Flow

The application works with two main data sources: the local file system (via the File System Access API) and Dropbox. All data is processed locally in the browser.

1.  **Indexing**: Files are indexed from the selected source. Metadata is extracted and stored in IndexedDB.
2.  **Tagging**: The user tags tracks with a genre and a mood.
3.  **Dry Run**: The application calculates the target paths for the tagged files and shows a plan to the user.
4.  **Move**: The user approves the plan, and the application moves the files to the target directory structure.

## State Management

We use **Redux Toolkit** for global state management. This includes:

-   UI state (e.g., selected filters, current view).
-   The list of tracks currently in the view.
-   The status of the move engine.

**RTK Query** is used to wrap the Dropbox API, providing caching and automatic refetching.

## Database

**IndexedDB** is used as the primary local storage, managed via **Dexie.js**. It stores:

-   `tracks`: All metadata about the audio files.
-   `librarySources`: Information about the configured local or Dropbox sources.
-   `genres`: The user-configurable list of genres.

## Workers

Web Workers will be used for performance-critical tasks to avoid blocking the main thread:

-   **Audio Probing**: A worker will be used to probe audio files for duration and other metadata, potentially using `ffmpeg.wasm` as a fallback.
-   **Thumbnail Generation**: A worker will generate and cache waveforms or artwork thumbnails.
