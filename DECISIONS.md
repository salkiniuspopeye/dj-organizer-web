# Design Decisions

## 1. Vitest Module Resolution for Unit Tests

*   **Decision:** Included `tests/unit` directory in `tsconfig.app.json` to resolve module resolution issues for unit tests.
*   **Reasoning:** This allows Vitest to correctly process TypeScript files within the unit test directory, enabling proper module imports and type checking during test runs.
*   **Impact:** Resolves the "BLOCKED" status for Vitest module resolution, allowing unit tests to be executed (though other test-related issues remain).

## 2. Fallback File Picker (`webkitdirectory`)

*   **Decision:** Proceeded with `<input type="file" multiple webkitdirectory>` for the fallback file picker as per task description.
*   **Reasoning:** Provides a user experience similar to the File System Access API for folder selection, which was explicitly requested.
*   **Impact:** Relies on a non-standard HTML attribute (`webkitdirectory`) which might have limited browser support (primarily Chromium-based browsers). This is noted as a risk.

## 3. Unit Testing Strategy for `walkDirectory` and Dexie Queries

*   **Decision:** For `walkDirectory`, mocked `FileSystemDirectoryHandle` API to test filtering and skipping logic. For Dexie queries, directly called the query function (that `useLiveQuery` would execute) with a mocked `db` object to assert on method calls and returned data.
*   **Reasoning:** This approach allows for focused unit testing of the core logic without involving complex React component rendering or full browser environment mocks, keeping tests lightweight and fast.
*   **Impact:** Enables verification of critical file system and data access logic.