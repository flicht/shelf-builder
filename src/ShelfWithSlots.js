import * as THREE from 'three';

class ShelfWithSlots extends THREE.Mesh {
  constructor({unitSize, overhang, height, width, depth, widthBetweenUprights, slotHeight, slotDepth, thickness}) {
    // Create the shape for the upright with slots
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    
    // Calculate the spacing between slots and add them to the shape
    const shelfSlotDepth  = width - slotDepth
    const totalSlotHeight = (unitSize + 1) * slotHeight;
    const shelfHeight = widthBetweenUprights * (unitSize) + 2 * overhang +  totalSlotHeight;
    const remainingHeight = shelfHeight - totalSlotHeight;
    const shelfWidth = width + overhang
    let currentY = overhang
    
    shape.lineTo(shelfWidth, 0);
    // shape.bezierCurveTo(shelfWidth, 0);
    
    const notchSize = 0.8;
    const addNotch = (y) => {
      shape.lineTo(shelfWidth - shelfSlotDepth , y - notchSize);
      shape.lineTo(shelfWidth - shelfSlotDepth - notchSize , y - notchSize);
      shape.lineTo(shelfWidth - shelfSlotDepth - notchSize , y + notchSize + slotHeight);
      shape.lineTo(shelfWidth - shelfSlotDepth , y + notchSize + slotHeight);
    }

    const addRoundNotch = (y) => {
      const controlPointOffset = notchSize; // Adjust this value as needed for the desired curvature
    
      // Move to the starting point just before the notch begins
      const startingPointX = shelfWidth - shelfSlotDepth + notchSize
      shape.lineTo(startingPointX, y - notchSize);
    
      // Top left curve
      shape.bezierCurveTo(
       startingPointX - controlPointOffset, y - notchSize, // control point 1 (top left)
        startingPointX - controlPointOffset, y, // control point 2 (bottom left)
        shelfWidth - shelfSlotDepth, y  // end point of the curve
      );
    
      // Moving down to the start of the bottom curve using a straight line
      shape.lineTo(shelfWidth - shelfSlotDepth, y + slotHeight);
    
      // Bottom right curve
      shape.bezierCurveTo(
        startingPointX - controlPointOffset, y + slotHeight, // control point 1 (top right)
        startingPointX - controlPointOffset, y + slotHeight + notchSize, // control point 2 (bottom right)
        startingPointX, y + slotHeight + notchSize // end point of the curve
      );
    
      // The function implicitly connects back to the starting point
    }

    // Function to add a slot
    const addSlot = (y) => {
      shape.lineTo(shelfWidth, y);
      shape.lineTo(shelfWidth - shelfSlotDepth + notchSize, y);
      addRoundNotch(y);
      y += slotHeight; // Move up to create the slot's height
      shape.lineTo(shelfWidth - shelfSlotDepth + notchSize, y);
      shape.lineTo(shelfWidth, y);
      return y; // Return the updated y-coordinate
    };
    


    // Initial slot before the loop
    currentY = addSlot(currentY);
    
    // Loop to add slots based on unitSize
    for (let i = 0; i < unitSize; i++) {
      currentY += widthBetweenUprights; // Move to the next unit position
      // currentY += slotHeight/2;
    currentY = addSlot(currentY); // Add slot
}

// Close the shape
shape.lineTo(shelfWidth, shelfHeight);
shape.lineTo(0, shelfHeight);
shape.lineTo(0, 0);

    // Define the extrusion settings
    const extrudeSettings = {
      steps: 2,
      depth: thickness,
      bevelEnabled: false,
    };

    // Extrude the shape to create the geometry
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Create the material
    const material = new THREE.MeshPhongMaterial({ color: 'salmon' });
    // Call the Mesh constructor
    super(geometry, material);

    // Additional initialization can go here

  }
}

export default ShelfWithSlots;
