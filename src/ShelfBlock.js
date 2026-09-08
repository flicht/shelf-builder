import React, { useState } from "react";
import ShelfVisualizer from "./ShelfVisualizer";
import { Button, Fieldset, NumberField, Stat, downloadText } from "./ui";

const BRACKETS_URL =
  "https://www.commercialwashroomsltd.co.uk/cubicles/toilet-cubicle-fittings/toilet-cubicle-brackets/u-bracket-aluminium-single-c-1.html";

function ShelfBlock() {
  const [height, setHeight] = useState(200);
  const [width, setWidth] = useState(30);
  const [slotWidth, setSlotWidth] = useState(1.8);
  const [slotDepth, setSlotDepth] = useState(10);
  const [slotCount, setSlotCount] = useState(7);
  const [uprightCount, setUprightCount] = useState(3);
  const [widthBetweenUprights, setWidthBetweenUprights] = useState(50);
  const [shelfOverhang, setShelfOverhang] = useState(10);
  const [toggleShelves, setToggleShelves] = useState(false);

  const totalWidth = widthBetweenUprights * (uprightCount - 1) + shelfOverhang;

  // Cut file for the uprights: each one is a rectangle with slots along the
  // top edge, stacked vertically on one drawing.
  const generateSVG = () => {
    const margin = 10;
    const pitch = 1.3 * height;
    const svgWidth = width + 2 * margin;
    const svgHeight = uprightCount * pitch + margin;
    const totalSpacing = width - slotWidth * slotCount;
    const slotSpacing = totalSpacing / (slotCount + 1);

    let svgContent = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    for (let j = 0; j < uprightCount; j++) {
      let currentX = margin;
      const y = j * pitch + margin;
      let pathData = `M${currentX} ${y} `;
      for (let i = 0; i < slotCount; i++) {
        currentX += slotSpacing;
        pathData += `L${currentX} ${y} L${currentX} ${y + slotDepth} `;
        currentX += slotWidth;
        pathData += `L${currentX} ${y + slotDepth} L${currentX} ${y} `;
      }
      pathData += `L${margin + width} ${y} L${margin + width} ${y + height} L${margin} ${y + height} Z`;
      svgContent += `<path d="${pathData}" fill="none" stroke="black" stroke-width="0.2"/>`;
    }
    svgContent += `</svg>`;
    return svgContent;
  };

  return (
    <div className="builder">
      <aside className="sidebar">
        <Fieldset legend="Uprights">
          <NumberField label="Height" unit="cm" value={height} onChange={setHeight} min={1} />
          <NumberField label="Width" unit="cm" value={width} onChange={setWidth} min={1} />
          <NumberField label="Slot width" help="Matches material thickness" unit="cm" value={slotWidth} onChange={setSlotWidth} min={0.1} step={0.1} />
          <NumberField label="Slot depth" unit="cm" value={slotDepth} onChange={setSlotDepth} min={0.1} />
          <NumberField label="Slots" help="Shelf positions per upright" value={slotCount} onChange={setSlotCount} min={1} step={1} />
          <NumberField label="Uprights" value={uprightCount} onChange={setUprightCount} min={1} step={1} />
        </Fieldset>

        <Fieldset legend="Shelves">
          <NumberField label="Bay width" help="Between uprights" unit="cm" value={widthBetweenUprights} onChange={setWidthBetweenUprights} min={1} />
          <NumberField label="Overhang" unit="cm" value={shelfOverhang} onChange={setShelfOverhang} min={0} />
          <div className="btn-row">
            <Button block aria-pressed={toggleShelves} onClick={() => setToggleShelves((v) => !v)}>
              {toggleShelves ? "Stop animation" : "Animate shelves"}
            </Button>
            <Button block variant="primary" onClick={() => downloadText(generateSVG(), "uprights-with-slots.svg")}>
              Download uprights SVG
            </Button>
          </div>
        </Fieldset>

        <Fieldset legend="Summary">
          <Stat label="Total width" value={`${totalWidth.toFixed(1)} cm`} />
          <Stat label="Shelves" value={slotCount} />
        </Fieldset>

        <div className="sidebar-footer">
          Drag to orbit, scroll to zoom, right-drag to pan.
          <br />
          <a href={BRACKETS_URL} target="_blank" rel="noreferrer">
            Wall brackets we use
          </a>
        </div>
      </aside>

      <div className="stage">
        <div className="viewport">
          <ShelfVisualizer
            width={width}
            height={height}
            slotWidth={slotWidth}
            slotDepth={slotDepth}
            slotCount={slotCount}
            uprightCount={uprightCount}
            widthBetweenUprights={widthBetweenUprights}
            shelfOverhang={shelfOverhang}
            toggleShelves={toggleShelves}
          />
        </div>
      </div>
    </div>
  );
}

export default ShelfBlock;
