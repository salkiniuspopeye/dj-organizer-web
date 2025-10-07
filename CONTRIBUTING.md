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

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This helps us maintain a clear commit history and automate changelog generation. Please use the following format:

```
<type>(<scope>): <subject>

[body]

[footer]
```

**Type**: Must be one of the following:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies (example scopes: vite, npm)
- `ci`: Changes to our CI configuration files and scripts (example scopes: GitHub Actions)
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

**Scope (optional)**: The scope should indicate the part of the codebase affected (e.g., `swipe`, `audio`, `db`, `fs`, `dropbox`, `i18n`, `docs`, `tests`).

**Subject**: A very brief description of the change.

**Example**:

```
feat(swipe): implement TrackCard and SwipeFeed components
```
