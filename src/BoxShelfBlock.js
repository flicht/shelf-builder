import React, { useState } from 'react';
import BoxShelfVisualiser from './BoxShelfVisualiser';

function BoxShelfBlock() {
    const [height, setHeight] = useState(50);
    const [width, setWidth] = useState(133);
    const [depth, setDepth] = useState(50);
    const [materialThickness, setMaterialThickness] = useState(1.8);
    const [numUps, setNumUps] = useState(2);
    const [upToggle, setUpToggle] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        // Here you might want to validate inputs or convert them to the correct types if necessary
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>
                    Height:
                    <input type="number" value={height} onChange={e => setHeight(parseFloat(e.target.value))} />
                </label>
                <label>
                    Width:
                    <input type="number" value={width} onChange={e => setWidth(parseFloat(e.target.value))} />
                </label>
                <label>
                    Depth:
                    <input type="number" value={depth} onChange={e => setDepth(parseFloat(e.target.value))} />
                </label>
                <label>
                    Material Thickness:
                    <input type="number" value={materialThickness} onChange={e => setMaterialThickness(parseFloat(e.target.value))} />
                </label>
                <label>
                    Num Dividers:
                    <input type="number" value={numUps} onChange={e => setNumUps(parseFloat(e.target.value))} />
                </label>
                <button type="submit" onClick={() => setUpToggle(upToggle => !upToggle)}>Toggle Dividers</button>
            </form>
            <BoxShelfVisualiser height={height/100} width={width/100} depth={depth/100} materialThickness={materialThickness/100} numUps={numUps} upToggle={upToggle} />
        </div>
    );
}

export default BoxShelfBlock;