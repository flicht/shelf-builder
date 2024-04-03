import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import Upright from "./Upright";
import Shelf from "./Shelf";
import ThreeDView from "./ThreeDView";
import SimpleThreeScene from "./SimpleThreeScene";
import ShelfVisualizer from "./ShelfVisualizer";
import BoxShelfVisualiser from "./BoxShelfVisualiser";
import ShelfBlock from "./ShelfBlock";
import BoxShelfBlock from "./BoxShelfBlock";
import { Box } from "@react-three/drei";

function App() {

  const [shelfType, setShelfType] = useState(true);
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Shelf Visualizer</h1>
      </header>
      <button onClick={() => setShelfType(!shelfType)}>Switch shelf Builder</button>
      <div style={{ width: '50vw', height: '50vh' }}>
        {shelfType && <BoxShelfBlock />}
        {!shelfType && <ShelfBlock /> }
        </div>
    </div>
  );  

}
export default App;

// SVG Export Functionality (not detailed here, but you would typically convert the SVG to a Blob and then download it)
