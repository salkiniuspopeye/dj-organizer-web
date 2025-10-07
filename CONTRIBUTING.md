# Contributing to DJ Organizer Web App

We welcome and appreciate contributions from the community! By contributing, you help make this project better for everyone. Please take a moment to review this document to understand how to contribute effectively.

## Project Vision

The DJ Organizer Web App aims to provide a robust, browser-based solution for DJs to manage their music libraries. Our goal is to offer powerful tagging, organization, and file management features, leveraging modern web technologies like the File System Access API and cloud integrations. We prioritize user experience, performance, and data integrity.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue on our [GitHub repository](https://github.com/Theimbold/dj-organizer-web/issues). When reporting a bug, please include:

- A clear and concise description of the bug.
- Steps to reproduce the behavior.
- Expected behavior.
- Screenshots or videos if applicable.
- Your operating system and browser version.

### Suggesting Enhancements

We love new ideas! If you have a suggestion for an enhancement or a new feature, please open an issue on GitHub. Describe your idea clearly and explain why you think it would be a valuable addition to the project.

### Submitting Pull Requests

1.  **Fork the repository** and clone it to your local machine.
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `git checkout -b bugfix/your-bug-fix-name`.
3.  **Set up your development environment** (see below).
4.  **Make your changes**. Ensure your code adheres to our [Code Style](#code-style) and includes relevant tests.
5.  **Run tests** to ensure everything is working as expected.
6.  **Commit your changes** using our [Commit Message Guidelines](#commit-message-guidelines).
7.  **Push your branch** to your forked repository.
8.  **Open a Pull Request** to the `dev` branch of the main repository. Provide a clear description of your changes.

## Development Setup

1.  **Clone the repository**:
    ```sh
    git clone https://github.com/Theimbold/dj-organizer-web.git
    cd dj-organizer-web
    ```
2.  **Install dependencies**:
    ```sh
    npm install
    ```
3.  **Dropbox API Key (Optional)**:
    To enable Dropbox integration in your local development environment:
    - Go to the [Dropbox Developers App Console](https://www.dropbox.com/developers/apps).
    - Create a new app (choose "Scoped access" and "App folder" or "Full Dropbox" depending on your testing needs).
    - Add `http://localhost:5173/` (or your Vite dev server URL) as a Redirect URI.
    - Copy your App key (Client ID).
    - Replace the placeholder `YOUR_DROPBOX_APP_CLIENT_ID` in `src/core/dropbox/dropbox.ts` with your actual Client ID.

4.  **Run the development server**:
    ```sh
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) to view the application in your browser.

## Running Tests

We have both unit and end-to-end (E2E) tests.

- **Unit Tests (Vitest & React Testing Library)**:
  ```sh
  npm test
  # Or with UI
  npm run test:ui
  ```
- **End-to-End Tests (Playwright)**:
  ```sh
  npm run test:e2e
  # Or with UI
  npm run test:e2e:ui
  ```

## Code Style

We use ESLint and Prettier to enforce a consistent code style. Please make sure to run the linter and formatter before submitting a pull request.

- **Lint your code**:
  ```sh
  npm run lint
  ```
- **Format your code**:
  ```sh
  npm run format
  ```

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [your contact person or email].

## Mini-Task Workflow

For each mini-task, follow these steps:

1.  **Branching**: Create a new branch from `dev` using the format `feature/<slug-for-task>`.
2.  **Implement Changes**: Make the necessary code changes to complete the task.
3.  **Verify**: Run `npm run build` and `npm run test` to ensure everything is working correctly and no regressions have been introduced.
4.  **Commit & Push**:
    ```bash
    git add -A
    git commit -m "<kurzer Commit-Nachricht, die den Task beschreibt>"
    git push -u origin HEAD
    ```
5.  **Summarize**: Provide a brief summary of your work, including:
    *   The completed task from `BACKLOG.md`.
    *   The branch name.
    *   A list of files changed.
    *   The build and test status (e.g., "Build successful, all tests passed").
    *   A short excerpt of the `git diff` for the changes.
6.  **Pause**: Wait for a "Weiter"-signal from the reviewer before proceeding with the next task.

