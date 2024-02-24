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

    for (let i = 0; i < slotCount ; i++) {
      shape.lineTo(width, currentY);
      shape.lineTo(width-slotDepth, currentY);
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
