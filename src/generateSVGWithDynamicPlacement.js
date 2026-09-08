/**
 * Packs rectangular parts onto sheets of a fixed size, row by row, and
 * returns one SVG per sheet along with the parts placed on it.
 */
function generateSVGWithDynamicPlacementAndRetry(objects, sheetWidth, sheetHeight, spacing) {
    let remainingObjects = [...objects];
    const sheets = [];
    let sheetId = 0;

    while (remainingObjects.length > 0) {
        const { placed, unplaced } = placeObjectsOnSheet(remainingObjects, sheetWidth, sheetHeight, spacing);
        if (placed.length === 0) {
            console.error("An object is too big to fit on any sheet:", unplaced);
            break; // Prevents infinite loop if an object is too large to fit
        }
        sheets.push({
            svg: generateSVG(placed, sheetWidth, sheetHeight, sheetId++),
            parts: placed,
        });
        remainingObjects = unplaced;
    }

    return sheets;
}

function placeObjectsOnSheet(objects, sheetWidth, sheetHeight, spacing) {
    let currentX = 0, currentY = 0, rowHeight = 0;
    const placed = [], unplaced = [];

    objects.forEach(obj => {
        if (obj.width > sheetWidth || obj.height > sheetHeight) {
            unplaced.push(obj);
            return;
        }

        if (currentX + obj.width + spacing > sheetWidth) {
            currentY += rowHeight + spacing;
            currentX = 0;
            rowHeight = 0;
        }

        if (currentY + obj.height + spacing > sheetHeight) {
            unplaced.push(obj);
            return;
        }

        placed.push({ ...obj, x: currentX, y: currentY });
        currentX += obj.width + spacing;
        rowHeight = Math.max(rowHeight, obj.height);
    });

    return { placed, unplaced };
}

const round = (n) => Math.round(n * 100) / 100;

function generateSVG(objects, sheetWidth, sheetHeight, sheetId) {
    const parts = objects
        .map(obj => `  <rect class="part" x="${round(obj.x)}" y="${round(obj.y)}" width="${round(obj.width)}" height="${round(obj.height)}" fill="none" stroke="black" stroke-width="0.2" />`)
        .join('\n');
    return [
        `<svg id="sheet-${sheetId}" width="${sheetWidth}" height="${sheetHeight}" viewBox="0 0 ${sheetWidth} ${sheetHeight}" xmlns="http://www.w3.org/2000/svg">`,
        `  <rect class="sheet" x="0" y="0" width="${sheetWidth}" height="${sheetHeight}" fill="none" stroke="none" />`,
        parts,
        `</svg>`,
    ].join('\n');
}

export default generateSVGWithDynamicPlacementAndRetry;
