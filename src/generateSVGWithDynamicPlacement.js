function generateSVGWithDynamicPlacementAndRetry(objects, sheetWidth, sheetHeight, spacing) {
    let remainingObjects = [...objects]; // Clone the objects array for manipulation
    let sheets = []; // Holds arrays of SVG strings, each representing a sheet
    let sheetId = 0; // Track sheet numbers for debugging or identification

    while (remainingObjects.length > 0) {
        let {placed, unplaced} = placeObjectsOnSheet(remainingObjects, sheetWidth, sheetHeight, spacing);
        if (placed.length === 0) {
            console.error("An object is too big to fit on any sheet:", unplaced);
            break; // Prevents infinite loop if an object is too large to fit
        }
        sheets.push(generateSVG(placed, sheetWidth, sheetHeight, sheetId++));
        remainingObjects = unplaced; // Try to place the unplaced objects on a new sheet
    }

    return sheets;
}

function placeObjectsOnSheet(objects, sheetWidth, sheetHeight, spacing) {
    let currentX = 0, currentY = 0, rowHeight = 0;
    let placed = [], unplaced = [];

    objects.forEach(obj => {
        if (obj.width > sheetWidth || obj.height > sheetHeight) {
            unplaced.push(obj); // Skip objects that can't fit on the sheet at all
            return;
        }

        if (currentX + obj.width + spacing > sheetWidth) {
            // Move to the next row
            currentY += rowHeight + spacing;
            currentX = 0;
            rowHeight = 0;
        }

        if (currentY + obj.height + spacing > sheetHeight) {
            unplaced.push(obj); // Can't fit on this sheet, try the next one
            return;
        }

        // Place the object
        placed.push({ ...obj, x: currentX, y: currentY });
        currentX += obj.width + spacing;
        rowHeight = Math.max(rowHeight, obj.height);
    });

    return { placed, unplaced };
}

function generateSVG(objects, sheetWidth, sheetHeight, sheetId) {
    let svgContent = objects.map(obj => `<rect x="${obj.x}" y="${obj.y}" width="${obj.width}" height="${obj.height}" style="stroke:black; fill:none;" />`).join('\n');
    return `<svg id="sheet-${sheetId}" width="${sheetWidth}" height="${sheetHeight}" xmlns="http://www.w3.org/2000/svg">\n${svgContent}\n</svg>`;
}

export default generateSVGWithDynamicPlacementAndRetry;