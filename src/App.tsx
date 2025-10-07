import React from "react";
import { SwipeFeed } from "./features/swipe/SwipeFeed";

export default function App() {
  return (
    <div className="p-4 rounded-xl bg-indigo-600 text-white">
      Tailwind v4 läuft 🎉
      <SwipeFeed />
    </div>
  );
}
