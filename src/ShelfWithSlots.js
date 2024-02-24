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
    
    // Function to add a slot
    const addSlot = (y) => {
      shape.lineTo(shelfWidth, y);
      shape.lineTo(shelfWidth - shelfSlotDepth, y);
      y += slotHeight; // Move up to create the slot's height
      shape.lineTo(shelfWidth - shelfSlotDepth, y);
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
