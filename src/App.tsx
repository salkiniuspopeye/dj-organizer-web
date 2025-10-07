import React, { useEffect, useState } from "react";
import { Dropbox } from 'dropbox';
import { authenticateWithDropbox, handleDropboxRedirect, getDropboxClient, listFiles } from "./core/dropbox/dropbox";

// Temporärer Platzhalter, bis SwipeFeed existiert:
function SwipeFeed() {
  return (
    <div className="mt-4 rounded-xl border border-white/10 p-4">
      <p className="text-sm opacity-80">SwipeFeed placeholder</p>
    </div>
  );
}

export default function App() {
  const [dbx, setDbx] = useState<Dropbox | null>(null);
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    async function handleRedirect() {
      const accessToken = await handleDropboxRedirect();
      if (accessToken) {
        const client = await getDropboxClient();
        setDbx(client);
      }
    }
    handleRedirect();
  }, []);

  useEffect(() => {
    async function initDbx() {
      const client = await getDropboxClient();
      setDbx(client);
    }
    initDbx();
  }, []);

  const handleLogin = () => {
    authenticateWithDropbox();
  };

  const handleListFiles = async () => {
    if (dbx) {
      const fileList = await listFiles(dbx, ''); // List root folder
      setFiles(fileList);
      console.log(fileList);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-indigo-600 text-white">
      Tailwind v4 läuft 🎉
      <div className="mt-4">
        {!dbx ? (
          <button onClick={handleLogin} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Login with Dropbox
          </button>
        ) : (
          <div>
            <p>Logged in to Dropbox!</p>
            <button onClick={handleListFiles} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2">
              List Dropbox Files
            </button>
            <ul className="mt-4">
              {files.map(file => (
                <li key={file.id}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <SwipeFeed />
    </div>
  );
}
