import { Dropbox, type files } from 'dropbox';
import { db } from '../db/db';

const DROPBOX_CLIENT_ID = 'YOUR_DROPBOX_APP_CLIENT_ID'; // TODO: Replace with your Dropbox App Client ID
const REDIRECT_URI = window.location.origin + '/';

const DROPBOX_SOURCE_ID = 2; // Assuming a single dropbox source

/**
 * Initiates the Dropbox OAuth2 authentication flow.
 */
export function authenticateWithDropbox() {
  const dbx = new Dropbox({ clientId: DROPBOX_CLIENT_ID });
  const authUrl = (dbx as any).auth.getAuthenticationUrl(
    REDIRECT_URI,
    undefined,
    'code',
    'offline',
    undefined,
    undefined,
    true
  );
  window.location.href = authUrl as string;
}

/**
 * Handles the redirect from Dropbox, extracts the code, and gets an access token.
 */
export async function handleDropboxRedirect() {
  const code = new URLSearchParams(window.location.search).get('code');
  if (code) {
    const dbx = new Dropbox({ clientId: DROPBOX_CLIENT_ID });
    const response = await (dbx as any).auth.getAccessTokenFromCode(
      REDIRECT_URI,
      code
    );
    const accessToken = (response.result as any).access_token;
    const refreshToken = (response.result as any).refresh_token;

    await db.librarySources.put({
      id: DROPBOX_SOURCE_ID,
      type: 'dropbox',
      name: 'Dropbox',
      accessToken: refreshToken, // Store refresh token for long-term access
    });

    // Remove code from URL
    window.history.replaceState({}, document.title, window.location.pathname);

    return accessToken;
  }
  return null;
}

/**
 * Gets a Dropbox client instance, refreshing the token if necessary.
 * @returns A Dropbox client instance or null if not authenticated.
 */
export async function getDropboxClient(): Promise<Dropbox | null> {
  const source = await db.librarySources.get(DROPBOX_SOURCE_ID);
  if (!source || !source.accessToken) {
    return null;
  }

  const dbx = new Dropbox({
    clientId: DROPBOX_CLIENT_ID,
    refreshToken: source.accessToken,
  });

  try {
    await dbx.checkUser({ query: 'test' }); // This will refresh the token if it's expired
    return dbx;
  } catch (error) {
    console.error('Dropbox token refresh failed', error);
    // Clear the invalid token
    await db.librarySources.delete(DROPBOX_SOURCE_ID);
    return null;
  }
}

/**
 * Lists all files recursively in a given Dropbox path.
 * @param dbx The Dropbox client instance.
 * @param path The path to list files from.
 * @returns An array of file metadata.
 */
export async function listFiles(
  dbx: Dropbox,
  path: string
): Promise<files.ListFolderResult['entries']> {
  try {
    const response = await dbx.filesListFolder({
      path,
      recursive: true,
      include_media_info: true,
    });
    let entries = response.result.entries;

    let hasMore = response.result.has_more;
    let cursor = response.result.cursor;

    while (hasMore) {
      const moreResponse = await dbx.filesListFolderContinue({ cursor });
      entries = entries.concat(moreResponse.result.entries);
      hasMore = moreResponse.result.has_more;
      cursor = moreResponse.result.cursor;
    }

    return entries.filter((entry) => entry['.tag'] === 'file');
  } catch (error) {
    console.error(`Error listing files in Dropbox path "${path}":`, error);
    return [];
  }
}

/**
 * Moves a file in Dropbox.
 * @param dbx The Dropbox client instance.
 * @param fromPath The source path of the file.
 * @param toPath The destination path of the file.
 */
export async function moveFile(
  dbx: Dropbox,
  fromPath: string,
  toPath: string
): Promise<files.FileMetadata> {
  const response = await dbx.filesMoveV2({
    from_path: fromPath,
    to_path: toPath,
  });
  return response.result.metadata as files.FileMetadata;
}
