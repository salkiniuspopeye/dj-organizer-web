# Security Policy

This document outlines the security measures and policies for the DJ Organizer Web App.

## Core Principles

- **User Control**: Users always maintain control over their data and permissions.
- **Minimal Permissions**: We request only the absolute minimum permissions required for the application's functionality.
- **No Server-Side Processing**: All sensitive operations (file system access, Dropbox API calls) are performed client-side, directly from the user's browser.
- **No Data Upload**: Full audio files are never uploaded to third-party servers or our own infrastructure.

## Local File System Access

- The application uses the **File System Access API** (Chromium-based browsers) to interact with files on the user's local machine.
- **Explicit User Consent**: Access to directories is granted explicitly by the user through browser prompts. We **never** access files outside of the root directory chosen by the user.
- **Persistent Permissions**: `FileSystemDirectoryHandle` objects are stored securely in **IndexedDB** to allow persistent access across sessions, but these permissions can be revoked by the user at any time via browser settings.
- **No File System Modifications Without Consent**: File move operations are initiated only after the user has reviewed and approved a detailed move plan.

## Dropbox Integration

- We use the official **Dropbox JavaScript SDK** for all interactions with the Dropbox API.
- **OAuth 2.0**: Authentication is handled via the standard OAuth 2.0 flow. We request the minimum necessary scopes (`files.metadata.read`, `files.content.write`) to perform the required actions (listing and moving files).
- **Token Storage**: Dropbox refresh tokens are stored securely in **IndexedDB** (encrypted by the browser's storage mechanisms) and are never transmitted to our servers or third parties. Access tokens are ephemeral and refreshed using the stored refresh token.
- **User Revocation**: Users can revoke the application's access at any time from their Dropbox account settings.

## Network & Privacy

- There are **no unsolicited network calls**. All network activity is initiated by the user (e.g., authenticating with Dropbox, fetching file lists, loading audio previews).
- The application itself is a pure client-side application and does not have its own backend server. No user data (track metadata, tags, etc.) is ever sent to external servers.

## Progressive Web App (PWA) Security

- The PWA operates offline-first, enhancing privacy by reducing reliance on network connectivity for core functionalities.
- Service Workers are used for caching and offline capabilities, ensuring that the application remains functional even without an internet connection.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it to us immediately. We will take all reports seriously and work to address the issue promptly. Please contact us at [security@example.com](mailto:security@example.com) (placeholder email, replace with actual contact).
