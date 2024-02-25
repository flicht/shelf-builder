import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import Upright from "./Upright";
import Shelf from "./Shelf";
import ThreeDView from "./ThreeDView";
import SimpleThreeScene from "./SimpleThreeScene";
import ShelfVisualizer from "./ShelfVisualizer";

function App() {
  const [height, setHeight] = useState(200);
  const [width, setWidth] = useState(30);
  const [slotWidth, setSlotWidth] = useState(1.8);
  const [slotDepth, setSlotDepth] = useState(10);
  const [slotCount, setSlotCount] = useState(7);
  const [uprightCount, setUprightCount] = useState(3);
  const [scale, setScale] = useState(1.4); // Scale for canvas drawing
  const [shelves, setShelves] = useState([]); // Scale for canvas drawing
  const [widthBetweenUprights, setWidthBetweenUprights] = useState(50);
  const [shelfUnitSize, setShelfUnitSize] = useState(1);
  const [shelfOverhang, setShelfOverhang] = useState(10);
  const [toggleShelves, setToggleShelves] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    // divides all values by ten for canvas drawing

    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (scale !== 1) {
      ctx.scale(scale, scale);
      ctx.lineWidth = 1 / scale ** 2;
      setScale(1);
    }

    // Starting point for drawing

    // Calculate spacing for slots
    const totalSpacing = width - slotWidth * slotCount;
    const slotSpacing = totalSpacing / (slotCount + 1);

    drawUprights(ctx, slotSpacing);
    // shelf.drawShelf();
  }, [
    height,
    width,
    slotWidth,
    slotDepth,
    slotCount,
    uprightCount,
    shelfUnitSize,
    shelfOverhang,
    widthBetweenUprights,
  ]);
  // Dependency array to re-draw when these values change

  const addShelf = (e) => {
    e.preventDefault();
  };

  const doToggleShelves = (e) => {
    e.preventDefault();
    setToggleShelves(1 - toggleShelves);
  }

  // SVG Generation logic (based on updated instructions)
  const generateSVG = () => {
    // Initial SVG setup with appropriate width, height, and viewbox for scaling
    let svgContent = `<svg width="${canvasRef.current.width}" height="${canvasRef.current.height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasRef.current.width} ${canvasRef.current.height}">`;

    const totalSpacing = width - slotWidth * slotCount;
    const slotSpacing = totalSpacing / (slotCount + 1);

    for (let j = 0; j < uprightCount; j++) {
      let currentX = 10;
      let y = j * 1.3 * height + 10; // Adjusted to match the canvas drawing's positioning

      // Constructing the path for each upright
      let pathData = `M${currentX} ${y} `; // Start at the top left of the first upright

      // Top edge with slots
      for (let i = 0; i < slotCount; i++) {
        currentX += slotSpacing;
        pathData += `L${currentX} ${y} `; // Move to slot start
        pathData += `L${currentX} ${y + slotDepth} `; // Down into slot
        currentX += slotWidth;
        pathData += `L${currentX} ${y + slotDepth} `; // Across slot
        pathData += `L${currentX} ${y} `; // Up out of slot
      }

      // Completing the rectangle's path
      pathData += `L${10 + width} ${y} `; // Move to the top right corner
      pathData += `L${10 + width} ${y + height} `; // Down to bottom right
      pathData += `L10 ${y + height} `; // Move to bottom left
      pathData += `L10 ${y} `; // Close path back to start

      // Adding the path to the SVG content
      svgContent += `<path d="${pathData}" fill="none" stroke="black" stroke-width="${
        1 / scale ** 2
      }"/>`;
    }

    svgContent += `</svg>`;
    return svgContent;
  };

  const downloadSVG = () => {
    const svgContent = generateSVG();
    const blob = new Blob([svgContent], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rectangle-with-slots.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  
  const dCanvas = <div className="canvas-section">
    <canvas
      ref={canvasRef}
      width="1220"
      height="900"
      style={{ border: "1px solid black" }}
    ></canvas>
  </div>;
  return (
    <div className="App">
      <div className="container">
        <div className="form-section">
          <h2>Uprights</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <label>
              Height (cm):
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </label>
            <label>
              Width (cm):
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </label>
            <label>
              Slot Width (cm):
              <input
                type="number"
                value={slotWidth}
                onChange={(e) => setSlotWidth(Number(e.target.value))}
              />
            </label>
            <label>
              Slot Depth (cm):
              <input
                type="number"
                value={slotDepth}
                onChange={(e) => setSlotDepth(Number(e.target.value))}
              />
            </label>
            <label>
              Number of Slots:
              <input
                type="number"
                value={slotCount}
                onChange={(e) => setSlotCount(Number(e.target.value))}
              />
            </label>
            <label>
              Number of Uprights:
              <input
                type="number"
                value={uprightCount}
                onChange={(e) => setUprightCount(Number(e.target.value))}
              />
            </label>
          </form>

          <h2>Shelves</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <label>
              Width between uprights (cm):
              <input
                type="number"
                value={widthBetweenUprights}
                onChange={(e) =>
                  setWidthBetweenUprights(Number(e.target.value))
                }
              />
            </label>
            Shelf unit size (betweeen 1 and upright Count - 1):
            <label>
              <input
                type="number"
                value={shelfUnitSize}
                onChange={(e) => setShelfUnitSize(Number(e.target.value))}
              />
            </label>
            Shelf Overhang (cm):
            <label>
              <input
                type="number"
                value={shelfOverhang}
                onChange={(e) => setShelfOverhang(Number(e.target.value))}
              />
            </label>
            <label>
              <input
                type="submit"
                value={"Add shelf"}
                onSubmit={(e) => addShelf(e)}
              />
            </label>
        <button onClick={downloadSVG}>Download SVG</button>
        <button onClick={doToggleShelves}>Toggle Shelves</button>
        <a href="https://www.commercialwashroomsltd.co.uk/cubicles/toilet-cubicle-fittings/toilet-cubicle-brackets/u-bracket-aluminium-single-c-1.html">BRACKETS</a>
        <div>
          total width = {(widthBetweenUprights*(uprightCount-1)) + 1*shelfOverhang}
        </div>
          </form>
        </div>
        {/* {dCanvas} */}
        {/* <img src={`data:image/svg+xml;utf8,${encodeURIComponent(generateSVG())}`} /> */}
      {/* <ThreeDView width={240} height={20} slotWidth={1.8} slotDepth={10} slotCount={3} uprightCount={1} widthBetweenUprights={50} shelfUnitSize={1} shelfOverhang={20} /> */}
      {/* <SimpleThreeScene /> */}
      <ShelfVisualizer className="three-d-view"
        width={width}
        height={height}
        slotWidth={slotWidth}
        slotDepth={slotDepth}
        slotCount={slotCount}
        uprightCount={uprightCount}
        widthBetweenUprights={widthBetweenUprights}
        shelfUnitSize={shelfUnitSize}
        shelfOverhang={shelfOverhang}
        toggleShelves={toggleShelves}
        />

        </div>
      </div>
  );

  function drawUprights(ctx, slotSpacing) {
    const uprights = [];
    for (let j = 0; j < uprightCount; j++) {
      let y = j * 1.2 * height + 10; // Calculate y based on the upright's position

      uprights.push(
        new Upright(
          ctx,
          10,
          y,
          width,
          height,
          slotCount,
          slotSpacing,
          slotWidth,
          slotDepth
        )
      );
    }
    uprights.forEach((upright) => upright.draw());
    for (let i = 1; i < uprightCount; i++) {
      let shelf = new Shelf(
        uprights[0],
        i,
        shelfOverhang,
        shelfOverhang,
        widthBetweenUprights
      );
      shelf.draw(
        ctx,
        uprights[0].width + 50,
        (i - 1) * (height + shelfOverhang + 10) + 20
      );
    }
  }
}

export default App;

// SVG Export Functionality (not detailed here, but you would typically convert the SVG to a Blob and then download it)
