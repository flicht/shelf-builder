import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import UprightWithSlots from "./UprightWithSlots";
import ShelfWithSlots from "./ShelfWithSlots";
import {
  addStudioLights,
  createRenderer,
  disposeChildren,
  fitCameraToObject,
  observeResize,
  plywoodMaterial,
  SCENE_BACKGROUND,
} from "./sceneUtils";

/**
 * Renders slotted uprights with interlocking shelves. Dimensions are in cm.
 */
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
  const threeRef = useRef(null);
  const toggleRef = useRef(toggleShelves);
  toggleRef.current = toggleShelves;

  // Scene setup: runs once per mount, torn down on unmount.
  useEffect(() => {
    const container = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(SCENE_BACKGROUND);
    const camera = new THREE.PerspectiveCamera(40, 1, 1, 5000);
    const renderer = createRenderer();
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    addStudioLights(scene);
    const model = new THREE.Group();
    scene.add(model);
    const grid = new THREE.GridHelper(1, 24, 0xd3c9b8, 0xe3dccf);
    scene.add(grid);

    const state = { scene, camera, renderer, controls, model, grid, lastRadius: 0, frame: 0, restX: 0, width: 0 };
    threeRef.current = state;

    const animate = () => {
      state.frame = requestAnimationFrame(animate);
      // Slide the shelves in and out of their slots when toggled.
      const time = Date.now() * 0.001;
      const offset = toggleRef.current ? state.width * (Math.sin(time) + 1) : 0;
      model.children.forEach((child) => {
        if (child instanceof ShelfWithSlots) child.position.x = state.restX + offset;
      });
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    const stopObserving = observeResize(container, renderer, camera);

    return () => {
      cancelAnimationFrame(state.frame);
      stopObserving();
      controls.dispose();
      disposeChildren(model);
      grid.geometry.dispose();
      grid.material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      threeRef.current = null;
    };
  }, []);

  // Rebuild the model whenever a dimension changes.
  useEffect(() => {
    const state = threeRef.current;
    if (!state) return;
    const { model, camera, controls, grid } = state;
    disposeChildren(model);

    const uprightMaterial = plywoodMaterial({ repeat: 0.01 });
    const shelfMaterial = plywoodMaterial({ tint: 0xf3e7d3, repeat: 0.01 });

    Array.from({ length: uprightCount }).forEach((_, i) => {
      const upright = new UprightWithSlots({
        height,
        width,
        depth: slotDepth,
        slotCount,
        slotHeight: slotWidth,
        slotDepth,
        thickness: slotWidth,
      });
      upright.material = uprightMaterial;
      upright.position.z = i * (widthBetweenUprights + slotWidth);
      model.add(upright);
    });

    const widthBetweenSlots = (height - slotCount * slotWidth) / (slotCount + 1);
    // Spread shelf spans deterministically so the model doesn't jump on every re-render.
    const spanFor = (j) => {
      if (uprightCount <= 1) return 1;
      if (j === 0 || j === slotCount - 1) return uprightCount - 1;
      return 1 + ((j * 7) % (uprightCount - 1));
    };
    state.restX = width + shelfOverhang;
    state.width = width;
    Array.from({ length: slotCount }).forEach((_, j) => {
      const shelf = new ShelfWithSlots({
        unitSize: spanFor(j),
        overhang: shelfOverhang,
        height,
        width,
        depth: 10,
        widthBetweenUprights,
        slotHeight: slotWidth,
        slotDepth,
        thickness: slotWidth,
      });
      shelf.material = shelfMaterial;
      shelf.rotation.x = Math.PI / 2;
      shelf.rotation.y = Math.PI;
      shelf.position.x = state.restX;
      shelf.position.z = -shelfOverhang;
      shelf.position.y = widthBetweenSlots * (j + 1) + j * slotWidth;
      model.add(shelf);
    });

    // Floor grid under the model
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    const gridSize = Math.max(size.x, size.z) * 2.5;
    grid.scale.setScalar(gridSize);
    grid.position.set(centre.x, box.min.y - 0.5, centre.z);

    const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
    if (Math.abs(radius - state.lastRadius) / (state.lastRadius || 1) > 0.15) {
      state.lastRadius = fitCameraToObject(camera, controls, model, { direction: [1.4, 0.7, 1.2] });
    }
  }, [width, height, slotWidth, slotDepth, slotCount, uprightCount, widthBetweenUprights, shelfOverhang]);

  return <div ref={mountRef} className="viewport-canvas" />;
};

export default ShelfVisualizer;
