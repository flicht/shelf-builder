import React, { useState } from "react";
import "./App.css";
import ShelfBlock from "./ShelfBlock";
import BoxShelfBlock from "./BoxShelfBlock";

const BUILDERS = [
  { id: "box", label: "Box shelf", component: BoxShelfBlock },
  { id: "slotted", label: "Slotted shelf", component: ShelfBlock },
];

function App() {
  const [builderId, setBuilderId] = useState("box");
  const Builder = BUILDERS.find((b) => b.id === builderId).component;

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M2 3h12M2 8h12M2 13h12M3 3v10M13 3v10" />
            </svg>
          </div>
          <h1>
            Shelf Builder
            <span>Design plywood shelving and export cut files</span>
          </h1>
        </div>
        <div className="segmented" role="group" aria-label="Choose a builder">
          {BUILDERS.map((b) => (
            <button key={b.id} type="button" aria-pressed={builderId === b.id} onClick={() => setBuilderId(b.id)}>
              {b.label}
            </button>
          ))}
        </div>
      </header>
      <Builder key={builderId} />
    </div>
  );
}

export default App;
