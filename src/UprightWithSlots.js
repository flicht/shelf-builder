import * as THREE from 'three';

class UprightWithSlots extends THREE.Mesh {
  constructor({height, width, depth, slotCount, slotHeight, slotDepth, thickness}) {
    // Create the shape for the upright with slots
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(width, 0);

    // Calculate the spacing between slots and add them to the shape
    const totalSlotHeight = slotCount * slotHeight;
    const remainingHeight = height - totalSlotHeight;
    const spacing = remainingHeight / (slotCount + 1);
    let currentY = spacing;

    const addNotch = (y) => {
      const notchSize = 1.4;
      shape.lineTo(width - slotDepth , y - notchSize);
      shape.lineTo(width - slotDepth - notchSize , y - notchSize);
      shape.lineTo(width - slotDepth - notchSize , y + notchSize + slotHeight);
      shape.lineTo(width - slotDepth , y + notchSize + slotHeight);
    }

    const addRoundNotch = (y) => {
      const notchSize = 0.8;
      const controlPointOffset = notchSize; // Adjust this value as needed for the desired curvature
    
      // Move to the starting point just before the notch begins
      shape.lineTo(width - slotDepth, y - notchSize);
    
      // Top left curve
      shape.bezierCurveTo(
        width - slotDepth - controlPointOffset, y - notchSize, // control point 1 (top left)
        width - slotDepth - controlPointOffset, y, // control point 2 (bottom left)
        width - slotDepth - notchSize, y // end point of the curve
      );
    
      // Moving down to the start of the bottom curve using a straight line
      shape.lineTo(width - slotDepth - notchSize, y + slotHeight);
    
      // Bottom right curve
      shape.bezierCurveTo(
        width - slotDepth - controlPointOffset, y + slotHeight, // control point 1 (top right)
        width - slotDepth - controlPointOffset, y + slotHeight + notchSize, // control point 2 (bottom right)
        width - slotDepth, y + notchSize + slotHeight // end point of the curve
      );
    
      // The function implicitly connects back to the starting point
    }
    

    for (let i = 0; i < slotCount ; i++) {
      shape.lineTo(width, currentY);
      shape.lineTo(width-slotDepth, currentY);
      addRoundNotch(currentY);
      currentY += slotHeight
      shape.lineTo(width-slotDepth, currentY);
      shape.lineTo(width, currentY);
      currentY += spacing;
    }

    shape.lineTo(width, height);
    shape.lineTo(0, height);
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
    const material = new THREE.MeshPhongMaterial({ color: 'lightblue' });

    // Call the Mesh constructor
    super(geometry, material);

    // Additional initialization can go here

  }
}

export default UprightWithSlots;
