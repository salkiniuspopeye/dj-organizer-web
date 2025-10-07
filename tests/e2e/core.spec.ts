/// <reference lib="dom" />
import { test, expect } from '@playwright/test';

test.describe('Core Functionality E2E Tests', () => {
  test('should allow selecting a local folder and hide empty state', async ({ page }) => {
    await page.goto('/');

    // Expect empty state message to be visible initially
    await expect(page.getByText('empty_state_message')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ordner wählen' })).toBeVisible();

    // Mock window.showDirectoryPicker
    await page.exposeFunction('mockShowDirectoryPicker', async () => {
      // In a real scenario, this would return a FileSystemDirectoryHandle.
      // For E2E, we'll mock a successful selection.
      return {
        name: 'mock-folder',
        kind: 'directory',
        // Mock methods needed by directoryHandler.ts
        queryPermission: async () => 'granted',
        requestPermission: async () => 'granted',
        values: async function* () {
          // Yield some dummy files for walkDirectory
          yield { name: 'test.mp3', kind: 'file', getFile: async () => ({ name: 'test.mp3', size: 100, lastModified: Date.now() }) };
          yield { name: 'test.aiff', kind: 'file', getFile: async () => ({ name: 'test.aiff', size: 200, lastModified: Date.now() }) };
        },
      };
    });

    // Override the native showDirectoryPicker
    await page.evaluate(() => {
      (window as any).showDirectoryPicker = (window as any).mockShowDirectoryPicker;
    });

    // Click the "Ordner wählen" button
    await page.getByRole('button', { name: 'Ordner wählen' }).click();

    // Expect empty state message to be hidden after folder selection (and indexing)
    await expect(page.getByText('empty_state_message')).toBeHidden();
    // Optionally, check for some tracks to appear in the SwipeFeed
    await expect(page.getByText('Indexed 2 tracks.')).toBeVisible(); // Assuming console.log is visible
  });
});
