import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import UprightWithSlots from "./UprightWithSlots";
import ShelfWithSlots from "./ShelfWithSlots";

const ShelfVisualizer = ({
  width = 240,
  height = 20,
  slotWidth = 1.8,
  slotDepth = 10,
  slotCount = 3,
  uprightCount = 5,
  widthBetweenUprights = 50,
  shelfOverhang = 20,
  toggleShelves,
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  useEffect(() => {
    if (!sceneRef.current) {
      sceneRef.current = new THREE.Scene();
      sceneRef.current.background = new THREE.Color(0xdddddd);
    }

    const { clientWidth: screenWidth, clientHeight: screenHeight } = mountRef.current;
    if (!cameraRef.current) {
      cameraRef.current = new THREE.PerspectiveCamera(65, screenWidth / screenHeight, 0.1, 1000);
      cameraRef.current.position.set(250, 50, 200);
    }

    if (!rendererRef.current) {
      rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
      rendererRef.current.setSize(screenWidth * 0.9, screenHeight * 0.85);
      mountRef.current.appendChild(rendererRef.current.domElement);
    }

    if (!controlsRef.current) {
      controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
      controlsRef.current.minDistance = 50;
      controlsRef.current.maxDistance = 800;
      controlsRef.current.enablePan = true;
    }

    const ambientLight = new THREE.AmbientLight("white");
    sceneRef.current.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 20, 10);
    sceneRef.current.add(directionalLight);

    // Reset scene for uprights and shelves
    // This is necessary to prevent duplicating objects in the scene on each render
    while(sceneRef.current.children.length > 2){
      sceneRef.current.remove(sceneRef.current.children[2]);
    }

    // Uprights
    Array.from({ length: uprightCount }).forEach((_, i) => {
      const uprightWithSlots = new UprightWithSlots({
        height,
        width,
        depth: slotDepth,
        slotCount,
        slotHeight: slotWidth,
        slotDepth: slotDepth,
        thickness: slotWidth,
      });
      uprightWithSlots.position.z = i * (widthBetweenUprights + slotWidth)
      // uprightWithSlots.position.x -= width;
      sceneRef.current.add(uprightWithSlots);
    });

    // Shelves
    const widthBetweenSlots = (height - slotCount * slotWidth) / (slotCount + 1);
    Array.from({ length: slotCount }).forEach((_, j) => {
      let Us = ((j === slotCount - 1) || (j === 0)) ? uprightCount - 1 : getRandomInt(1, uprightCount - 1);
      // let Us = ((j === slotCount - 1) || (j === 0)) ? uprightCount - 1 : 1;
      const shelf = new ShelfWithSlots({
        unitSize: Us,
        overhang: shelfOverhang,
        height,
        width,
        depth: 10,
        widthBetweenUprights,
        slotHeight: slotWidth,
        slotDepth: slotDepth,
        thickness: slotWidth,
      });
      shelf.rotation.x = Math.PI/2
      // shelf.rotation.z = Math.PI;
      shelf.rotation.y = Math.PI;
      shelf.position.x += width + shelfOverhang;
      shelf.position.z += (-shelfOverhang);

      shelf.position.y += (widthBetweenSlots) * (j + 1) + j * slotWidth;

      // shelf.position.y = widthBetweenSlots * (j + 1) + j * slotWidth;

      // shelf.position.z = -shelfOverhang ;
      // shelf.position.x += -shelfOverhang-width;

      sceneRef.current.add(shelf);
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      sceneRef.current.children.forEach(child => {
        if (child instanceof ShelfWithSlots) {
          child.position.x = ((toggleShelves+1) * (width + shelfOverhang));
        }
      });
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    // Cleanup
    return () => {
      if (mountRef.current && rendererRef.current) {
        // mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [width, height, slotWidth, slotDepth, slotCount, uprightCount, widthBetweenUprights, shelfOverhang, toggleShelves]);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
};

export default ShelfVisualizer;

