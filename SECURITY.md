# Security Policy

This document outlines the security measures and policies for the DJ Organizer Web App.

## Local File System Access

-   The application uses the **File System Access API** to access files on the user's local machine.
-   We **never** access files outside of the root directory explicitly chosen by the user.
-   Permissions are requested via the user gesture-driven API and can be revoked by the user at any time.

## Dropbox Integration

-   We use the official **Dropbox JavaScript SDK** for all interactions with the Dropbox API.
-   Authentication is handled via **OAuth 2.0**. We request the minimum necessary scopes to perform the required actions (listing and moving files).
-   Access tokens are stored securely in the browser and are never exposed to third parties. The user can revoke the application's access at any time from their Dropbox account settings.

## Network

-   There are **no unsolicited network calls**. All network activity is initiated by the user (e.g., authenticating with Dropbox, fetching file lists).
-   The application itself is a pure client-side application and does not have its own backend server.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it to us immediately. We will take all reports seriously and work to address the issue promptly.
