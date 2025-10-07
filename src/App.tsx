import React from "react";

// Temporärer Platzhalter, bis SwipeFeed existiert:
function SwipeFeed() {
  return (
    <div className="mt-4 rounded-xl border border-white/10 p-4">
      <p className="text-sm opacity-80">SwipeFeed placeholder</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="p-4 rounded-xl bg-indigo-600 text-white">
      Tailwind v4 läuft 🎉
      <SwipeFeed />
    </div>
  );
}
