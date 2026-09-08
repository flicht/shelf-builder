import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import generateSVGWithDynamicPlacementAndRetry from "./generateSVGWithDynamicPlacement";
import {
  addStudioLights,
  createRenderer,
  disposeChildren,
  fitCameraToObject,
  observeResize,
  plywoodMaterial,
  SCENE_BACKGROUND,
} from "./sceneUtils";

export const SHEET_WIDTH = 244;
export const SHEET_HEIGHT = 122;
const SHEET_SPACING = 2;

/**
 * Renders a box shelf (top, bottom, sides, back, dividers, shelves and
 * fronts) and reports the flat parts packed onto cut sheets via `onSheets`.
 * All dimensions are in metres.
 */
const BoxShelfVisualiser = ({
  height = 2,
  width = 1,
  depth = 1,
  materialThickness = 0.1,
  numUps = 1,
  upToggle = false,
  onSheets,
  onOverflow,
}) => {
  const mountRef = useRef(null);
  const threeRef = useRef(null);
  const onSheetsRef = useRef(onSheets);
  const onOverflowRef = useRef(onOverflow);
  onSheetsRef.current = onSheets;
  onOverflowRef.current = onOverflow;

  // Scene setup: runs once per mount, torn down on unmount.
  useEffect(() => {
    const container = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(SCENE_BACKGROUND);
    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
    const renderer = createRenderer();
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    addStudioLights(scene);
    const shelfGroup = new THREE.Group();
    shelfGroup.name = "shelfGroup";
    scene.add(shelfGroup);

    const state = { scene, camera, renderer, controls, shelfGroup, lastRadius: 0, frame: 0 };
    threeRef.current = state;

    const animate = () => {
      state.frame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    const stopObserving = observeResize(container, renderer, camera);

    return () => {
      cancelAnimationFrame(state.frame);
      stopObserving();
      controls.dispose();
      disposeChildren(shelfGroup);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      threeRef.current = null;
    };
  }, []);

  // Rebuild the shelf whenever a dimension changes.
  useEffect(() => {
    const state = threeRef.current;
    if (!state) return;
    const { shelfGroup, camera, controls } = state;
    disposeChildren(shelfGroup);

    const panelMaterial = plywoodMaterial({ repeat: 1 });
    const sideMaterial = plywoodMaterial({ tint: 0xf1e6d2, repeat: 1 });
    const backMaterial = plywoodMaterial({ tint: 0xc9b997, repeat: 1.5 });
    const shelfMaterial = plywoodMaterial({ tint: 0xf5ecdc, repeat: 1 });
    const frontMaterial = plywoodMaterial({ tint: 0xe6c9a8, opacity: 0.45 });

    // Top and bottom
    const topGeometry = new THREE.BoxGeometry(width, materialThickness, depth);
    const topPanel = new THREE.Mesh(topGeometry, panelMaterial);
    topPanel.position.set(0, height / 2 - materialThickness / 2, 0);
    const bottomPanel = new THREE.Mesh(topGeometry.clone(), panelMaterial);
    bottomPanel.position.set(0, -(height / 2 - materialThickness / 2), 0);

    // Sides
    const sideGeometry = new THREE.BoxGeometry(materialThickness, height - 2 * materialThickness, depth);
    const leftSidePanel = new THREE.Mesh(sideGeometry, sideMaterial);
    leftSidePanel.position.set(-(width / 2 - materialThickness / 2), 0, 0);
    const rightSidePanel = new THREE.Mesh(sideGeometry.clone(), sideMaterial);
    rightSidePanel.position.set(width / 2 - materialThickness / 2, 0, 0);

    // Back
    const backGeometry = new THREE.BoxGeometry(width - 2 * materialThickness, height - 2 * materialThickness, materialThickness);
    const backPanel = new THREE.Mesh(backGeometry, backMaterial);
    backPanel.position.set(0, 0, -(depth / 2 - materialThickness / 2));

    // Vertical dividers
    const totalDividersWidth = numUps * materialThickness;
    const totalSpaceWidth = width - 2 * materialThickness;
    const spacing = (totalSpaceWidth - totalDividersWidth) / (numUps + 1);
    const startPlace = -width / 2 + materialThickness * 0.5;
    const overflow = totalDividersWidth > totalSpaceWidth;
    const dividerMaterial = overflow
      ? new THREE.MeshStandardMaterial({ color: 0xd9412f, roughness: 0.6 })
      : sideMaterial;
    const slide = upToggle ? depth : 0;
    for (let i = 0; i < numUps; i++) {
      const position = numUps === 1 ? 0 : startPlace + (spacing + materialThickness) * (i + 1);
      const upGeometry = new THREE.BoxGeometry(materialThickness, height - 2 * materialThickness, depth - materialThickness);
      const up = new THREE.Mesh(upGeometry, dividerMaterial);
      up.position.set(position, 0, materialThickness / 2 + slide);
      shelfGroup.add(up);
    }

    // Internal shelves, one per bay at a staggered height
    let allShelves = [{ l: 1.2 }, { l: 2.5 }, { l: 2 }, { l: 4 }];
    allShelves = allShelves.slice(0, numUps + 1);
    const upDepth = depth - 2 * materialThickness;
    const upHeight = (height - 2 * materialThickness) / (numUps + 1);
    for (let i = 0; i < allShelves.length; i++) {
      const shelfWidth = spacing;
      const shelfGeometry = new THREE.BoxGeometry(shelfWidth, materialThickness, upDepth);
      const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
      const shelfStart = startPlace + shelfWidth + materialThickness / 2;
      const position = shelfStart + i * (materialThickness + shelfWidth);
      const shelfHeight = -height / 5 + materialThickness + (allShelves[i].l * upHeight) / 2;
      shelf.position.set(position - spacing / 2, shelfHeight, slide);
      shelfGroup.add(shelf);
    }

    // Front panels (doors)
    for (let i = 0; i < numUps + 1; i++) {
      const frontWidth = (totalSpaceWidth - totalDividersWidth) / (numUps + 1);
      const frontTolerance = 0.002;
      const frontGeometry = new THREE.BoxGeometry(
        frontWidth - frontTolerance,
        height - 2 * materialThickness - frontTolerance,
        materialThickness
      );
      const frontPanel = new THREE.Mesh(frontGeometry, frontMaterial);
      const frontStart = startPlace + frontWidth / 2 + materialThickness / 2;
      const z = (depth / 2 - materialThickness / 2) * (2 * Number(upToggle) + 1) + Number(upToggle) * materialThickness;
      frontPanel.position.set(frontStart + i * (materialThickness + frontWidth), 0, z);
      shelfGroup.add(frontPanel);
    }

    // Screw markers on the top panel
    addScrewHoles(topPanel, width, materialThickness, depth, materialThickness);

    shelfGroup.add(topPanel, leftSidePanel, bottomPanel, rightSidePanel, backPanel);

    // Refit the camera only when the overall size changes noticeably, so
    // small tweaks don't yank the view around.
    const box = new THREE.Box3().setFromObject(shelfGroup);
    const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
    if (Math.abs(radius - state.lastRadius) / (state.lastRadius || 1) > 0.15) {
      state.lastRadius = fitCameraToObject(camera, controls, shelfGroup, { direction: [0.9, 0.5, 1.6] });
    }

    // Flatten every panel to a width x height rectangle (in cm) and pack.
    const parts = [];
    shelfGroup.traverse((object) => {
      if (!object.isMesh || object.geometry.type !== "BoxGeometry") return; // screw markers are cylinders
      const { height: h, width: w, depth: d } = object.geometry.parameters;
      if (h === materialThickness) parts.push({ height: d * 100, width: w * 100 });
      else if (w === materialThickness) parts.push({ height: h * 100, width: d * 100 });
      else if (d === materialThickness) parts.push({ height: h * 100, width: w * 100 });
    });
    const cuttable = parts.filter((p) => p.width > 0 && p.height > 0);
    const sheets = generateSVGWithDynamicPlacementAndRetry(cuttable, SHEET_WIDTH, SHEET_HEIGHT, SHEET_SPACING);
    if (onSheetsRef.current) onSheetsRef.current(sheets);
    if (onOverflowRef.current) onOverflowRef.current(overflow);
  }, [height, width, depth, materialThickness, numUps, upToggle]);

  return <div ref={mountRef} className="viewport-canvas" />;
};

function addScrewHoles(panel, panelWidth, panelHeight, panelDepth, screwHeight) {
  const screwRadius = 0.006;
  const screwMaterial = new THREE.MeshStandardMaterial({ color: 0x3a342c, roughness: 0.4, metalness: 0.6 });
  const screwGeometry = new THREE.CylinderGeometry(screwRadius, screwRadius, screwHeight * 1.05, 24);
  const inset = 0.03;
  const positions = [
    new THREE.Vector3(-panelWidth / 2 + inset, 0, -panelDepth / 2 + inset),
    new THREE.Vector3(panelWidth / 2 - inset, 0, panelDepth / 2 - inset),
    new THREE.Vector3(-panelWidth / 2 + inset, 0, panelDepth / 2 - inset),
    new THREE.Vector3(panelWidth / 2 - inset, 0, -panelDepth / 2 + inset),
  ];
  positions.forEach((position) => {
    const screw = new THREE.Mesh(screwGeometry, screwMaterial);
    screw.position.copy(position);
    panel.add(screw);
  });
}

export default BoxShelfVisualiser;
