import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ThreeDView = ({ width, height, slotWidth, slotDepth, slotCount, uprightCount, widthBetweenUprights, shelfUnitSize, shelfOverhang }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    const widthL = mountRef.current.clientWidth;
    const heightL = mountRef.current.clientHeight;
    renderer.setSize(widthL, heightL);

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    scene.add(directionalLight);

    // Upright and Shelf Geometry
    const uprightGeometry = new THREE.BoxGeometry(0.1, height, slotDepth);
    const shelfGeometry = new THREE.BoxGeometry(width, 0.1, slotDepth);
    const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });

    // Create and position uprights
    for (let i = 0; i < uprightCount; i++) {
      const upright = new THREE.Mesh(uprightGeometry, material);
      upright.position.x = (i - (uprightCount - 1) / 2) * widthBetweenUprights;
      scene.add(upright);
    }

    // Create and position shelves
    for (let i = 0; i < shelfUnitSize; i++) {
      const shelf = new THREE.Mesh(shelfGeometry, material);
      shelf.position.y = (i - (shelfUnitSize - 1) / 2) * height / shelfUnitSize;
      scene.add(shelf);
    }

    // Animation loop
    const animate = function () {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [width, height, slotWidth, slotDepth, slotCount, uprightCount, widthBetweenUprights, shelfUnitSize, shelfOverhang]); // Dependencies for re-render

  return <div ref={mountRef} className='threeDContainer' />;
};

export default ThreeDView;
