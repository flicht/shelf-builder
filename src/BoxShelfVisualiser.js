import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import  generateSVGWithDynamicPlacement  from './generateSVGWithDynamicPlacement';
import generateSVGWithDynamicPlacementAndRetry from './generateSVGWithDynamicPlacement';

function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

const BoxShelfVisualiser = ({ height = 2, width = 1, depth = 1, materialThickness = 0.1, numUps = 1, upToggle=0}) => {
    const mountRef = useRef(null);
    const [initialized, setInitialized] = useState(false);
    const [svgContents, setSvgContents] = useState([]);

    const scene = useRef(new THREE.Scene()).current;
    const camera = useRef(new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 1000)).current;
    const renderer = useRef(new THREE.WebGLRenderer()).current;
    const controls = useRef(null);
    const shelfGroup = useRef(new THREE.Group()).current;


    useEffect(() => {
        if (!initialized) {
            renderer.setSize(window.innerWidth*0.7, window.innerHeight*0.7);
            renderer.setClearColor(0xffffff); // Set background color to white
            mountRef.current.appendChild(renderer.domElement);
    
            // Initial camera position
            camera.position.z = 5;
    
            // Lighting setup
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Bright white light
            directionalLight.position.set(1, 2, 3);
            scene.add(directionalLight);
            scene.add(ambientLight);
    
            // OrbitControls setup for mouse interaction
            controls.current = new OrbitControls(camera, renderer.domElement);
            controls.current.addEventListener('change', render); // Necessary if there's no animation loop
            controls.current.minDistance = 1;
            controls.current.maxDistance = 10;
            controls.current.target.set(0, 0, 0);
    
            setInitialized(true);
        }
    
        // Update or re-create objects in the scene based on new props
        updateShelf(width, height, depth, materialThickness, numUps, upToggle);
        
        // Cleanup on component unmount
        return () => {
            // shelfGroup.children.forEach(child => {
            //     if (child.geometry) child.geometry.dispose();
            //     if (child.material) {
            //         if (Array.isArray(child.material)) {
            //             child.material.forEach(material => material.dispose());
            //         } else {
            //             child.material.dispose();
            //         }
            //     }
            //     // Dispose of textures if any
                // if (child.material && child.material.map) child.material.map.dispose();
            // });
            shelfGroup.clear();
            // if (controls.current) controls.current.dispose();
            // renderer.dispose();
            // if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
            //     mountRef.current.removeChild(renderer.domElement);
            // }
            // // Dispose of the renderer and its resources
            // if (renderer.domElement && renderer.domElement.parentNode) {
            //     renderer.domElement.parentNode.removeChild(renderer.domElement);
            // }
        };
    }, [height, width, depth, materialThickness, numUps, upToggle]); 

    function addScrewHoles(panel, panelWidth, panelHeight, panelDepth) {
        const screwRadius = 0.01; // Adjust size as needed
        const screwHeight = materialThickness; // Assuming screw depth equals material thickness
        const screwMaterial = new THREE.MeshPhongMaterial({ color: 'black' }); // Screw color
        const screwGeometry = new THREE.CylinderGeometry(screwRadius, screwRadius, screwHeight, 32);
    
        // Positions for screws, e.g., at each corner of the front face of the panel
        const positions = [
            new THREE.Vector3(-panelWidth / 2 + screwRadius , panelHeight / 2 -screwRadius, -panelDepth/2 + screwRadius),
            new THREE.Vector3(panelWidth / 2 - screwRadius, panelHeight / 2 - screwRadius, panelDepth / 2 - screwRadius),
            new THREE.Vector3(-panelWidth / 2 + screwRadius , -panelHeight / 2 + screwRadius, panelDepth / 2 - screwRadius),
            new THREE.Vector3(panelWidth / 2 - screwRadius, -panelHeight / 2 + screwRadius, -panelDepth / 2 + screwRadius),
        ];
    
        // Add screws at specified positions
        positions.forEach(position => {
            const screw = new THREE.Mesh(screwGeometry, screwMaterial);
            screw.position.copy(position);
            screw.rotateX(Math.PI); // Align screw vertically
            panel.add(screw); // Add screw to the panel
        });
    }
    
    
    const updateShelf = (width, height, depth, materialThickness, numUps, upToggle) => {
        // Remove existing shelf if it exists
        shelfGroup.clear();
        
        // Create a new shelf with updated dimensions
        // Material for all shelf parts
        const material = new THREE.MeshPhongMaterial({ color: 'lightblue' });
        const material2 = new THREE.MeshPhongMaterial({ color: 'lightyellow' });
        
        // Top Panel
        const topGeometry = new THREE.BoxGeometry(width, materialThickness, depth);
        const topPanel = new THREE.Mesh(topGeometry, material);
        topPanel.position.set(0, height / 2 - materialThickness / 2, 0);
        
        // Bottom Panel
        const bottomGeometry = new THREE.BoxGeometry(width, materialThickness, depth);
        const bottomPanel = new THREE.Mesh(bottomGeometry, material);
        bottomPanel.position.set(0, -(height / 2 - materialThickness / 2), 0);
        
        // Left Side Panel
        const sideGeometry = new THREE.BoxGeometry(materialThickness, height - 2 * materialThickness, depth);
        const leftSidePanel = new THREE.Mesh(sideGeometry, material2);
        leftSidePanel.position.set(-(width / 2 - materialThickness / 2), 0, 0);
        
        // Right Side Panel
        const rightSidePanel = new THREE.Mesh(sideGeometry, material2);
        rightSidePanel.position.set(width / 2 - materialThickness / 2, 0, 0);
        
        
        // Back Panel
        const backGeometry = new THREE.BoxGeometry(width - 2 * materialThickness, height - 2 * materialThickness, materialThickness);
        const backMaterial = new THREE.MeshPhongMaterial({ color: 'grey' }); // Material for the back panel
        const backPanel = new THREE.Mesh(backGeometry, backMaterial);
        backPanel.position.set(0, 0, -(depth / 2 - materialThickness / 2));

    
        
        // Add up dividers
        const totalDividersWidth = numUps * materialThickness
        const totalSpaceWidth = width - (2 * materialThickness)
        const spacing = (totalSpaceWidth -totalDividersWidth) / (numUps + 1)
        const startPlace = -width/2 + materialThickness*.5
        let colour
        if (totalDividersWidth > totalSpaceWidth) {colour  = 'red'} else {colour = 'lightgreen'}
        const verticalDividerMaterial = new THREE.MeshPhongMaterial({ color: colour });
        for (let i = 0; i < numUps; i++) {
            let position;
            if (numUps == 1) { position = 0 }
            else { position = (startPlace) + (spacing+materialThickness)*(i+1)}
            const upGeometry = new THREE.BoxGeometry(materialThickness, height - 2 * materialThickness, depth-materialThickness);
            const up = new THREE.Mesh(upGeometry, verticalDividerMaterial);
            up.position.set(position, 0, materialThickness/2 + (Number(upToggle)*depth));
            
            shelfGroup.add(up);
        }
        
        
        
        // const numUps = 1;
        let allShelves = [{'h': 1, 'm': 0, 'l': 1.2}, {'h': 1, 'm': 0, 'l': 2.5}, {'h': 1, 'm': 0, 'l': 2}, {'h': 1, 'm': 0, 'l': 4}]
        allShelves = allShelves.slice(0, numUps+1)
        const upDepth = depth - 2 * materialThickness;
        const upHeight = (height - 2 * materialThickness) / (numUps + 1);
        const shelfMaterialMaterial = new THREE.MeshPhongMaterial({ color: 'lightsalmon' });
        for (let i = 0; i < allShelves.length; i++) {
            const shelfWidth = spacing;
            const upGeometry = new THREE.BoxGeometry(shelfWidth, materialThickness, upDepth);
            const up = new THREE.Mesh(upGeometry, shelfMaterialMaterial);
            const shelfStart = startPlace + shelfWidth + materialThickness/2;
            let position = shelfStart + (i*(materialThickness+shelfWidth));
            const shelfHeight = -height/5 + materialThickness + allShelves[i]['l'] * upHeight/2
            up.position.set(position-spacing/2, shelfHeight , 0 + upToggle*depth);
            shelfGroup.add(up);
        }

        

        // Front Panels
        for (let i = 0; i < numUps+1; i++) {
            const frontWidth = (totalSpaceWidth - totalDividersWidth) / (numUps + 1)
            const frontTolerance = 0.002;
            const frontGeometry = new THREE.BoxGeometry(frontWidth - frontTolerance, (height-2*materialThickness) - frontTolerance, materialThickness);
            frontGeometry.name = "frontGeometry" + i;   
            const frontMaterial = new THREE.MeshPhongMaterial({ color: 'pink', opacity: 0.7, transparent: true });
            const frontPanel = new THREE.Mesh(frontGeometry, frontMaterial);
            let frontStart = startPlace + frontWidth/2 + materialThickness/2
            frontPanel.position.set(frontStart + (i*(materialThickness+frontWidth)), 0, (depth / 2 - materialThickness / 2) * ((2)*upToggle+1) + upToggle*materialThickness);
            frontPanel.name = "frontPanel" + i;
            shelfGroup.add(frontPanel);
        }

        

        addScrewHoles(topPanel, width, materialThickness, depth);
        // addScrewHoles(bottomPanel, width, materialThickness, depth);
        // addScrewHoles(rightSidePanel, materialThickness, height - 2 * materialThickness, depth);
        // addScrewHoles(leftSidePanel, materialThickness, height - 2 * materialThickness, depth);
        // addScrewHoles(backPanel, width - 2 * materialThickness, height - 2 * materialThickness, materialThickness);
        
        shelfGroup.add(topPanel);
        shelfGroup.add(leftSidePanel);
        shelfGroup.add(bottomPanel);
        shelfGroup.add(rightSidePanel);
        shelfGroup.add(backPanel);

        console.log(shelfGroup)

        // Function to extract geometries and apply transformations
        const extractGeometries = (scene) => {
            const geometries = [];
        
            scene.traverse((object) => {
            if (object.isMesh) {
                // Clone the geometry because we might modify it to apply transformations
                const geometry = object.geometry.clone();
                
                // Apply the object's current transformations to the geometry
                // geometry.applyMatrix4(object.matrixWorld);
        
                // Push the transformed geometry to your array
                geometries.push(geometry.parameters);

            }
            });
        
            return geometries;
        };
        
    // Use this function to extract geometries from your scene
    const geometries = extractGeometries(scene);
    const heightsWidths = []
    geometries.forEach((geometry) => {
        const { height, width, depth } = geometry;
        if (height == materialThickness) {
            heightsWidths.push({'height': depth*100, 'width': width*100})
        } else if (width == materialThickness) {
            heightsWidths.push({'height': height*100, 'width': depth*100})
        } else if (depth == materialThickness) {
            heightsWidths.push({'height': height*100, 'width': width*100})
        }
    })

    console.log(heightsWidths)
    
    // Example usage
    const objects = heightsWidths;
    const sheetWidth = 244;
    const sheetHeight = 122;
    const spacingSVG = 2; // Define the spacing between objects
    const svgOutput = generateSVGWithDynamicPlacementAndRetry(objects, sheetWidth, sheetHeight, spacingSVG);
    
    console.log(svgOutput);
    setSvgContents(svgOutput);

    
    
    
    
    
    if (!scene.getObjectByName("shelfGroup")) {
        shelfGroup.name = "shelfGroup"; // Naming the group for easy identification
        scene.add(shelfGroup);
    }
    
    // Ensure controls are updated to handle the new object size
    controls.current.update();
    render();
};
const downloadSVG = (svg, filename) => {
    // Convert the SVG string to a Blob
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger a download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename; // Set the file name for the download
    document.body.appendChild(a); // Append the anchor to the body
    a.click(); // Simulate a click on the anchor

    // Clean up by revoking the Object URL and removing the temporary anchor
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

const render = () => {
    renderer.render(scene, camera);
};


    // Ensure the scene is re-rendered if the window is resized
    useEffect(() => {
        const handleResize = () => {
            camera.aspect = (window.innerWidth / window.innerHeight)/2;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            render();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [renderer, camera]);

    return <>
        <div ref={mountRef} style={{ width: '50%', height: '50%' }}></div>
        {svgContents.map((svg, index) => (
            <div key={`svg-container-${index}`} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                <div dangerouslySetInnerHTML={{ __html: svg }} />
                <button onClick={() => downloadSVG(svg, `design-${index + 1}.svg`)}>Download SVG {index + 1}</button>
            </div>
        ))}
        </>
};

export default BoxShelfVisualiser;
