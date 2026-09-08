import React, { useCallback, useState } from "react";
import BoxShelfVisualiser, { SHEET_HEIGHT, SHEET_WIDTH } from "./BoxShelfVisualiser";
import { Button, Fieldset, NumberField, Stat, downloadText } from "./ui";

function BoxShelfBlock() {
  const [height, setHeight] = useState(50);
  const [width, setWidth] = useState(133);
  const [depth, setDepth] = useState(50);
  const [materialThickness, setMaterialThickness] = useState(1.8);
  const [numUps, setNumUps] = useState(2);
  const [upToggle, setUpToggle] = useState(false);
  const [sheets, setSheets] = useState([]);
  const [overflow, setOverflow] = useState(false);

  const handleSheets = useCallback((next) => setSheets(next), []);
  const handleOverflow = useCallback((next) => setOverflow(next), []);

  const partCount = sheets.reduce((n, s) => n + s.parts.length, 0);
  const bays = Math.max(numUps + 1, 1);
  const bayWidth = (width - 2 * materialThickness - numUps * materialThickness) / bays;

  return (
    <div className="builder">
      <aside className="sidebar">
        <Fieldset legend="Dimensions">
          <NumberField label="Height" unit="cm" value={height} onChange={setHeight} min={1} />
          <NumberField label="Width" unit="cm" value={width} onChange={setWidth} min={1} />
          <NumberField label="Depth" unit="cm" value={depth} onChange={setDepth} min={1} />
        </Fieldset>

        <Fieldset legend="Construction">
          <NumberField label="Material thickness" unit="cm" value={materialThickness} onChange={setMaterialThickness} min={0.1} step={0.1} />
          <NumberField label="Dividers" help="Vertical partitions" value={numUps} onChange={setNumUps} min={0} step={1} />
          <Button block aria-pressed={upToggle} onClick={() => setUpToggle((v) => !v)}>
            {upToggle ? "Assemble" : "Explode view"}
          </Button>
        </Fieldset>

        <Fieldset legend="Summary">
          <Stat label="Bay width" value={`${Math.max(bayWidth, 0).toFixed(1)} cm`} />
          <Stat label="Parts" value={partCount} />
          <Stat label="Sheets" value={`${sheets.length} × ${SHEET_WIDTH}×${SHEET_HEIGHT} cm`} />
        </Fieldset>

        <div className="sidebar-footer">Drag to orbit, scroll to zoom, right-drag to pan.</div>
      </aside>

      <div className="stage">
        <div className="viewport">
          <BoxShelfVisualiser
            height={height / 100}
            width={width / 100}
            depth={depth / 100}
            materialThickness={materialThickness / 100}
            numUps={numUps}
            upToggle={upToggle}
            onSheets={handleSheets}
            onOverflow={handleOverflow}
          />
          {overflow && <div className="viewport-warning">Too many dividers for this width</div>}
        </div>

        <section className="sheets" aria-label="Cut sheets">
          <div className="sheets-header">
            <h2>Cut sheets</h2>
            <span>
              {SHEET_WIDTH} × {SHEET_HEIGHT} cm plywood, laid out row by row
            </span>
          </div>
          {sheets.length === 0 ? (
            <p className="sheets-empty">Nothing fits on a sheet yet. Check the part sizes.</p>
          ) : (
            <div className="sheets-grid">
              {sheets.map((sheet, index) => (
                <article className="sheet-card" key={index}>
                  <div className="sheet-preview" dangerouslySetInnerHTML={{ __html: sheet.svg }} />
                  <div className="sheet-meta">
                    <div>
                      <strong>Sheet {index + 1}</strong>
                      <br />
                      <span>
                        {sheet.parts.length} {sheet.parts.length === 1 ? "part" : "parts"}
                      </span>
                    </div>
                    <Button onClick={() => downloadText(sheet.svg, `box-shelf-sheet-${index + 1}.svg`)}>Download SVG</Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default BoxShelfBlock;
