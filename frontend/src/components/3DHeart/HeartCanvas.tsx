import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VesselRiskEstimate } from '../../types';
import { 
  RotateCcw, 
  Sparkles, 
  Play, 
  Pause, 
  Compass, 
  ShieldAlert,
  Info,
  Layers,
  Sliders,
  Scan,
  Activity
} from 'lucide-react';

interface HeartCanvasProps {
  cadRisk?: VesselRiskEstimate;
  ladRisk?: VesselRiskEstimate;
  lcxRisk?: VesselRiskEstimate;
  rcaRisk?: VesselRiskEstimate;
  selectedArtery: 'LAD' | 'LCX' | 'RCA' | null;
  onSelectArtery: (artery: 'LAD' | 'LCX' | 'RCA') => void;
}

// Procedural realistic living myocardium texture (striated muscle + micro-capillaries)
function createLivingMyocardiumTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Anatomical muscular gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0.0, '#4a0815');  // Deep base
  grad.addColorStop(0.2, '#7a1028');  // Ventricular wall
  grad.addColorStop(0.5, '#991535');  // Perfused muscle tissue
  grad.addColorStop(0.8, '#881337');  // Myocardium body
  grad.addColorStop(1.0, '#450614');  // Apical shadow
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Muscle fiber striations
  ctx.strokeStyle = 'rgba(251, 113, 133, 0.22)';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 550; i++) {
    const y = Math.random() * 1024;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      340, y + (Math.random() - 0.5) * 40,
      680, y + (Math.random() - 0.5) * 40,
      1024, y + 30
    );
    ctx.stroke();
  }

  // Micro-capillary dendritic networks
  ctx.strokeStyle = 'rgba(254, 205, 211, 0.28)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 220; i++) {
    let x = Math.random() * 1024;
    let y = Math.random() * 1024;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < 4; s++) {
      x += (Math.random() - 0.5) * 38;
      y += (Math.random() - 0.4) * 38;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Epicardial adipose marbling
  ctx.fillStyle = 'rgba(254, 243, 199, 0.32)';
  for (let i = 0; i < 24; i++) {
    const cx = 512 + (Math.random() - 0.5) * 180;
    const cy = 180 + Math.random() * 560;
    const r = 20 + Math.random() * 32;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Procedural micro-bump map for wet glistening pericardial surface
function createOrganicBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = '#a2a2a2';
  for (let i = 0; i < 2200; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const s = Math.random() * 2.5 + 1;
    ctx.fillRect(x, y, s, s);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export const HeartCanvas: React.FC<HeartCanvasProps> = ({
  ladRisk,
  lcxRisk,
  rcaRisk,
  selectedArtery,
  onSelectArtery
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredArtery, setHoveredArtery] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [isBeating, setIsBeating] = useState(true);
  
  // 3 CT Scanner Modes:
  // 1. 'cinematic' = Photorealistic living organ with wet epicardial sheen and fat cushions
  // 2. 'ccta' = CCTA Contrast Angiogram (radiodense iodinated lumen glow & translucent tissue)
  // 3. 'slice' = Multi-Planar CT Slicer (cross-section clipping plane cutting through chambers)
  const [scanMode, setScanMode] = useState<'cinematic' | 'ccta' | 'slice'>('cinematic');
  const [sliceOffset, setSliceOffset] = useState<number>(0.2); // Slices between -2.5 and +2.5
  const [cameraPreset, setCameraPreset] = useState<'AP' | 'LAO' | 'RAO' | 'BASE'>('AP');

  const controlsRef = useRef<OrbitControls | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const heartGroupRef = useRef<THREE.Group | null>(null);
  const clipPlaneRef = useRef<THREE.Plane | null>(null);
  const materialsRef = useRef<THREE.Material[]>([]);
  const arteriesRef = useRef<{ [key: string]: THREE.Group }>({});
  const lesionMarkerRef = useRef<THREE.Group | null>(null);

  const selectedArteryRef = useRef(selectedArtery);
  const hoveredArteryRef = useRef(hoveredArtery);
  const isRotatingRef = useRef(isRotating);
  const isBeatingRef = useRef(isBeating);
  const onSelectArteryRef = useRef(onSelectArtery);

  useEffect(() => {
    selectedArteryRef.current = selectedArtery;
    hoveredArteryRef.current = hoveredArtery;
    isRotatingRef.current = isRotating;
    isBeatingRef.current = isBeating;
    onSelectArteryRef.current = onSelectArtery;
  }, [selectedArtery, hoveredArtery, isRotating, isBeating, onSelectArtery]);

  const getRiskColor = (risk?: VesselRiskEstimate): number => {
    if (!risk) return 0x14b8a6; // Teal default
    const pct = risk.percentage;
    if (pct >= 65) return 0xf43f5e; // High risk - Vivid Coral Red
    if (pct >= 35) return 0xfbbf24; // Moderate - Bright Amber
    return 0x10b981; // Low - Emerald Green
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Background based on scan mode
    const isCCTA = scanMode === 'ccta';
    scene.background = new THREE.Color(isCCTA ? 0x030712 : 0x090d16);

    // Fog for medical depth
    scene.fog = new THREE.FogExp2(isCCTA ? 0x030712 : 0x090d16, 0.022);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0.6, 1.4, 13.0);
    cameraRef.current = camera;

    // 3. Renderer with Local Clipping for Real-Time CT Slicing
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isCCTA ? 1.4 : 1.25;
    renderer.localClippingEnabled = true; // Enables interactive CT cross-sectional slicing
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 26;
    controls.minDistance = 6.0;
    controls.target.set(0, -0.2, 0);
    controlsRef.current = controls;

    // 5. CT Slicer Clipping Plane
    const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), sliceOffset);
    clipPlaneRef.current = clipPlane;

    // 6. Medical Scanner & Surgical Lighting
    const ambientLight = new THREE.AmbientLight(
      isCCTA ? 0x1f293d : 0x243354, 
      isCCTA ? 1.2 : 1.4
    );
    scene.add(ambientLight);

    // Key Light (Warm surgical spotlight)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, isCCTA ? 1.8 : 2.4);
    keyLight.position.set(10, 14, 12);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Cyan Rim Light (Bioluminescent edge definition)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, isCCTA ? 3.6 : 3.0);
    rimLight.position.set(-10, 6, -12);
    scene.add(rimLight);

    // Soft Front Specular Light
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
    frontLight.position.set(0, 0, 14);
    scene.add(frontLight);

    // 7. Master Anatomical Heart Group
    const heartGroup = new THREE.Group();
    heartGroupRef.current = heartGroup;
    scene.add(heartGroup);

    // Procedural Organic Textures
    const myoTexture = createLivingMyocardiumTexture();
    const bumpTexture = createOrganicBumpTexture();
    const trackedMaterials: THREE.Material[] = [];

    // Helper to register material with clipping
    const registerMat = <T extends THREE.Material>(mat: T): T => {
      if (scanMode === 'slice') {
        mat.clippingPlanes = [clipPlane];
        mat.clipShadows = true;
      } else {
        mat.clippingPlanes = [];
      }
      trackedMaterials.push(mat);
      return mat;
    };

    // 8. Anatomically Sculpted Real Human Heart Geometry
    // High-resolution sculpted myocardium with physiological chambers
    const heartGeo = new THREE.SphereGeometry(2.7, 64, 64);
    const pos = heartGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Anatomical tapering towards the cardiac apex (inferior, tilted 45° left & 25° anterior)
      if (y < 0) {
        const taper = 1.0 + (y / 2.7) * 0.76;
        x *= Math.max(taper, 0.22);
        z *= Math.max(taper, 0.22);
        x += (y / 2.7) * -0.45; // Apex lateral tilt
        z += (y / 2.7) * -0.35; // Apex anterior curve
      } else {
        const baseFactor = 1.0 - (y / 2.7) * 0.12;
        x *= baseFactor;
        z *= baseFactor;
      }

      // Anterior Interventricular Sulcus (Groove where LAD runs)
      if (z > 0.4 && x > -0.55 && x < 0.55) {
        const distFromCenter = Math.abs(x);
        const grooveDepth = 0.28 * Math.cos((distFromCenter / 0.55) * (Math.PI / 2));
        z -= grooveDepth;
      }

      // Right Ventricle anterior muscular curvature
      if (x > 0.4 && z > 0) {
        const rvBulge = Math.sin((x / 2.6) * Math.PI) * 0.28;
        z += rvBulge;
      }

      // Posterior diaphragmatic flattening
      if (z < 0) {
        z *= 0.82;
      }

      pos.setXYZ(i, x * 1.06, y * 1.18, z * 0.98);
    }
    heartGeo.computeVertexNormals();

    // Material based on Scan Mode:
    // In CCTA mode: Semi-translucent myocardium (~50 HU density)
    // In Cinematic mode: Rich glistening living muscular tissue with clearcoat
    const myoMat = registerMat(new THREE.MeshPhysicalMaterial({
      color: isCCTA ? 0x991b1b : 0x9f1239,
      map: myoTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.035,
      roughness: isCCTA ? 0.45 : 0.28,
      metalness: 0.08,
      clearcoat: isCCTA ? 0.3 : 0.92,
      clearcoatRoughness: 0.12,
      sheen: 0.85,
      sheenColor: new THREE.Color(0xff4477),
      transparent: isCCTA,
      opacity: isCCTA ? 0.55 : 1.0, // Shows internal chamber cavities and contrast vessels through tissue
      side: THREE.DoubleSide, // Allows seeing internal chamber walls when sliced
      ior: 1.45
    }));

    const myoMesh = new THREE.Mesh(heartGeo, myoMat);
    myoMesh.castShadow = true;
    myoMesh.receiveShadow = true;
    heartGroup.add(myoMesh);

    // 9. Internal Ventricular Cavities (Visible when Sliced in CT Mode)
    // Left Ventricle internal cavity
    const lvCavityGeo = new THREE.ConeGeometry(1.4, 3.2, 32);
    const cavityMat = registerMat(new THREE.MeshStandardMaterial({
      color: isCCTA ? 0xef4444 : 0x4a0410, // Bright contrast in CCTA mode, deep blood cavity in normal mode
      emissive: isCCTA ? 0xef4444 : 0x200205,
      emissiveIntensity: isCCTA ? 0.6 : 0.1,
      roughness: 0.4,
      side: THREE.DoubleSide
    }));
    const lvCavityMesh = new THREE.Mesh(lvCavityGeo, cavityMat);
    lvCavityMesh.position.set(-0.25, -0.6, 0.1);
    lvCavityMesh.rotation.z = 0.2;
    heartGroup.add(lvCavityMesh);

    // Right Ventricle internal crescent cavity
    const rvCavityGeo = new THREE.CylinderGeometry(0.8, 1.3, 2.6, 24, 1, false, 0, Math.PI);
    const rvCavityMesh = new THREE.Mesh(rvCavityGeo, cavityMat);
    rvCavityMesh.position.set(0.95, -0.4, 0.45);
    rvCavityMesh.rotation.y = -0.3;
    heartGroup.add(rvCavityMesh);

    // 10. Epicardial Adipose Tissue Beds (Warm Ivory Fat Cushions)
    const fatPoints = [
      new THREE.Vector3(-0.15, 1.8, 1.85),
      new THREE.Vector3(-0.05, 0.8, 2.05),
      new THREE.Vector3(0.12, -0.4, 1.85),
      new THREE.Vector3(0.32, -1.6, 1.25),
      new THREE.Vector3(0.48, -2.6, 0.55)
    ];
    const fatCurve = new THREE.CatmullRomCurve3(fatPoints);
    const fatGeo = new THREE.TubeGeometry(fatCurve, 32, 0.24, 14, false);
    const fatMat = registerMat(new THREE.MeshStandardMaterial({
      color: 0xfef08a, // Pale ivory epicardial adipose tissue
      roughness: 0.65,
      metalness: 0.05,
      transparent: true,
      opacity: isCCTA ? 0.35 : 0.72
    }));
    const fatMesh = new THREE.Mesh(fatGeo, fatMat);
    heartGroup.add(fatMesh);

    // 11. Atria & Great Vessels
    // Right Atrium with Auricular Appendage
    const raGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const atriaMat = registerMat(new THREE.MeshPhysicalMaterial({
      color: isCCTA ? 0x991b1b : 0x881337,
      roughness: 0.35,
      clearcoat: 0.75,
      transparent: isCCTA,
      opacity: isCCTA ? 0.6 : 1.0
    }));
    const raMesh = new THREE.Mesh(raGeo, atriaMat);
    raMesh.position.set(1.9, 1.6, -0.3);
    heartGroup.add(raMesh);

    // Left Atrium (Posterior chamber with 4 pulmonary vein stumps)
    const laGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const laMesh = new THREE.Mesh(laGeo, atriaMat);
    laMesh.position.set(-1.4, 1.7, -0.8);
    heartGroup.add(laMesh);

    // Left Auricle (Anterior Appendage)
    const auricleGeo = new THREE.ConeGeometry(0.65, 1.3, 16);
    const auricleMesh = new THREE.Mesh(auricleGeo, atriaMat);
    auricleMesh.position.set(-1.8, 1.6, 0.8);
    auricleMesh.rotation.set(0.6, -0.4, 1.1);
    heartGroup.add(auricleMesh);

    // Ascending Aorta, Bulbous Sinus of Valsalva & 180° Arch
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.1, 1.5, 0.1),
      new THREE.Vector3(0.0, 3.0, 0.1),
      new THREE.Vector3(-0.4, 4.3, -0.2),
      new THREE.Vector3(-1.3, 4.1, -0.8),
      new THREE.Vector3(-1.6, 2.9, -1.4),
      new THREE.Vector3(-1.6, 0.9, -1.5)
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 48, 0.75, 24, false);
    const aortaMat = registerMat(new THREE.MeshPhysicalMaterial({
      color: isCCTA ? 0xf43f5e : 0xbe123c, // High radiopacity contrast pink/red in CCTA
      emissive: isCCTA ? 0xbe123c : 0x000000,
      emissiveIntensity: isCCTA ? 0.4 : 0.0,
      roughness: 0.22,
      metalness: 0.15,
      clearcoat: 0.95
    }));
    const aortaMesh = new THREE.Mesh(aortaGeo, aortaMat);
    aortaMesh.castShadow = true;
    heartGroup.add(aortaMesh);

    // 3 Supra-Aortic Branches (Brachiocephalic, Left Common Carotid, Left Subclavian)
    const createArchBranch = (startX: number, startY: number, startZ: number, endX: number, endY: number, endZ: number, r: number) => {
      const branchCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(startX, startY, startZ),
        new THREE.Vector3(endX, endY, endZ)
      ]);
      const branchGeo = new THREE.TubeGeometry(branchCurve, 16, r, 14, false);
      const branchMesh = new THREE.Mesh(branchGeo, aortaMat);
      heartGroup.add(branchMesh);
    };
    createArchBranch(-0.1, 4.2, 0.0, 0.4, 5.4, -0.1, 0.22);    // Brachiocephalic trunk
    createArchBranch(-0.6, 4.4, -0.3, -0.5, 5.5, -0.4, 0.18);  // Left common carotid
    createArchBranch(-1.1, 4.2, -0.6, -1.2, 5.3, -0.8, 0.18);  // Left subclavian artery

    // Pulmonary Trunk & Bifurcation
    const pulmoCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.5, 1.4, 1.1),
      new THREE.Vector3(0.1, 2.5, 0.8),
      new THREE.Vector3(-0.5, 3.3, 0.3)
    ]);
    const pulmoGeo = new THREE.TubeGeometry(pulmoCurve, 32, 0.65, 20, false);
    const pulmoMat = registerMat(new THREE.MeshPhysicalMaterial({
      color: isCCTA ? 0x3b82f6 : 0x1d4ed8,
      emissive: isCCTA ? 0x1d4ed8 : 0x000000,
      emissiveIntensity: isCCTA ? 0.35 : 0.0,
      roughness: 0.25,
      metalness: 0.15,
      clearcoat: 0.92
    }));
    const pulmoMesh = new THREE.Mesh(pulmoGeo, pulmoMat);
    pulmoMesh.castShadow = true;
    heartGroup.add(pulmoMesh);

    createArchBranch(-0.5, 3.3, 0.3, -1.7, 3.1, -0.4, 0.30); // Left PA branch
    createArchBranch(-0.5, 3.3, 0.3, 1.3, 3.0, -0.5, 0.30);  // Right PA branch

    // Superior Vena Cava (SVC)
    const svcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.0, 1.7, -0.4),
      new THREE.Vector3(2.0, 4.2, -0.4)
    ]);
    const svcGeo = new THREE.TubeGeometry(svcCurve, 20, 0.50, 18, false);
    const svcMesh = new THREE.Mesh(svcGeo, pulmoMat);
    heartGroup.add(svcMesh);

    // 12. CCTA Contrast-Enhanced Coronary Artery Tree (Calibrated Vascular Caliber)
    const arteries: { [key: string]: THREE.Group } = {};

    const createArteryMesh = (
      points: THREE.Vector3[], 
      radius: number, 
      colorHex: number, 
      name: string
    ) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const geo = new THREE.TubeGeometry(curve, 36, radius, 16, false);
      const mat = registerMat(new THREE.MeshPhysicalMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: isCCTA ? 1.1 : 0.85, // Highly contrast-enhanced in CCTA scan mode
        roughness: 0.15,
        metalness: 0.3,
        clearcoat: 1.0,
        clearcoatRoughness: 0.06
      }));
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = name;
      mesh.castShadow = true;
      return mesh;
    };

    // A) LAD Tree (Left Anterior Descending + Diagonal D1 & D2)
    const ladGroup = new THREE.Group();
    ladGroup.name = 'LAD';
    const ladColor = getRiskColor(ladRisk);

    const ladMainPoints = [
      new THREE.Vector3(-0.25, 2.0, 1.65),  // From Left Main
      new THREE.Vector3(-0.10, 1.3, 2.15),  // Proximal LAD
      new THREE.Vector3(0.06, 0.3, 2.38),   // Mid LAD (Stenosis Site)
      new THREE.Vector3(0.24, -0.8, 2.05),  // Distal LAD
      new THREE.Vector3(0.40, -1.9, 1.48),  // Pre-apex
      new THREE.Vector3(0.52, -2.9, 0.75)   // Cardiac apex
    ];
    ladGroup.add(createArteryMesh(ladMainPoints, 0.17, ladColor, 'LAD'));

    // Diagonal Branch 1 (D1)
    const d1Points = [
      new THREE.Vector3(0.06, 0.3, 2.38),
      new THREE.Vector3(-0.7, -0.1, 2.2),
      new THREE.Vector3(-1.4, -0.6, 1.7)
    ];
    ladGroup.add(createArteryMesh(d1Points, 0.11, ladColor, 'LAD_D1'));

    // Diagonal Branch 2 (D2)
    const d2Points = [
      new THREE.Vector3(0.24, -0.8, 2.05),
      new THREE.Vector3(-0.25, -1.3, 1.8),
      new THREE.Vector3(-0.75, -1.8, 1.3)
    ];
    ladGroup.add(createArteryMesh(d2Points, 0.09, ladColor, 'LAD_D2'));

    heartGroup.add(ladGroup);
    arteries['LAD'] = ladGroup;

    // B) LCX Tree (Left Circumflex + Obtuse Marginal OM1)
    const lcxGroup = new THREE.Group();
    lcxGroup.name = 'LCX';
    const lcxColor = getRiskColor(lcxRisk);

    const lcxMainPoints = [
      new THREE.Vector3(-0.35, 1.9, 1.5),
      new THREE.Vector3(-1.4, 1.6, 1.25),
      new THREE.Vector3(-2.1, 1.0, 0.45),
      new THREE.Vector3(-2.3, 0.1, -0.5),
      new THREE.Vector3(-1.9, -0.9, -1.1)
    ];
    lcxGroup.add(createArteryMesh(lcxMainPoints, 0.16, lcxColor, 'LCX'));

    // Obtuse Marginal 1 (OM1)
    const om1Points = [
      new THREE.Vector3(-1.8, 1.3, 0.85),
      new THREE.Vector3(-2.2, 0.4, 0.65),
      new THREE.Vector3(-2.3, -0.7, 0.25)
    ];
    lcxGroup.add(createArteryMesh(om1Points, 0.11, lcxColor, 'LCX_OM1'));

    heartGroup.add(lcxGroup);
    arteries['LCX'] = lcxGroup;

    // C) RCA Tree (Right Coronary Artery + Acute Marginal)
    const rcaGroup = new THREE.Group();
    rcaGroup.name = 'RCA';
    const rcaColor = getRiskColor(rcaRisk);

    const rcaMainPoints = [
      new THREE.Vector3(0.75, 1.8, 1.35),
      new THREE.Vector3(1.65, 1.4, 1.35),
      new THREE.Vector3(2.25, 0.6, 0.85),
      new THREE.Vector3(2.35, -0.4, 0.15),
      new THREE.Vector3(1.95, -1.4, -0.55),
      new THREE.Vector3(1.15, -2.2, -0.75)
    ];
    rcaGroup.add(createArteryMesh(rcaMainPoints, 0.17, rcaColor, 'RCA'));

    // Acute Marginal Branch (AM)
    const amPoints = [
      new THREE.Vector3(2.25, 0.2, 0.5),
      new THREE.Vector3(1.85, -0.5, 0.95),
      new THREE.Vector3(1.25, -1.1, 1.2)
    ];
    rcaGroup.add(createArteryMesh(amPoints, 0.11, rcaColor, 'RCA_AM'));

    heartGroup.add(rcaGroup);
    arteries['RCA'] = rcaGroup;
    arteriesRef.current = arteries;

    // 13. Holographic Stenosis Target Reticle
    const markerGroup = new THREE.Group();
    lesionMarkerRef.current = markerGroup;
    const ringGeo = new THREE.TorusGeometry(0.38, 0.04, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    markerGroup.add(ringMesh);

    const innerDotGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const innerDotMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
    const innerDotMesh = new THREE.Mesh(innerDotGeo, innerDotMat);
    markerGroup.add(innerDotMesh);

    markerGroup.visible = false;
    heartGroup.add(markerGroup);

    // Save tracked materials
    materialsRef.current = trackedMaterials;

    // 14. Raycaster Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getInteractiveMeshes = () => {
      const meshes: THREE.Mesh[] = [];
      Object.values(arteriesRef.current).forEach(group => {
        group.traverse(child => {
          if (child instanceof THREE.Mesh && (child.name === 'LAD' || child.name === 'LCX' || child.name === 'RCA')) {
            meshes.push(child);
          }
        });
      });
      return meshes;
    };

    const onPointerMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(getInteractiveMeshes(), false);

      if (intersects.length > 0) {
        const hitName = intersects[0].object.name;
        container.style.cursor = 'pointer';
        setHoveredArtery(hitName);
      } else {
        container.style.cursor = 'grab';
        setHoveredArtery(null);
      }
    };

    const onClick = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(getInteractiveMeshes(), false);

      if (intersects.length > 0) {
        const hitName = intersects[0].object.name as 'LAD' | 'LCX' | 'RCA';
        onSelectArteryRef.current(hitName);
      }
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('click', onClick);

    // 15. Cardiac Cycle & Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth auto-rotation
      if (isRotatingRef.current) {
        heartGroup.rotation.y += 0.0032;
      }

      // Wiggers Physiological Dual-Pulse Heartbeat (Systole Squeeze + Diastole Recoil)
      if (isBeatingRef.current) {
        const cycle = (elapsedTime * 1.1) % 1.0;
        let scalePulse = 1.0;
        let twistPulse = 0.0;

        if (cycle < 0.16) {
          const t = cycle / 0.16;
          scalePulse = 1.0 - 0.04 * Math.sin(t * Math.PI);
          twistPulse = -0.015 * Math.sin(t * Math.PI);
        } else if (cycle < 0.38) {
          const t = (cycle - 0.16) / 0.22;
          scalePulse = 1.0 + 0.02 * Math.sin(t * Math.PI);
          twistPulse = 0.008 * Math.sin(t * Math.PI);
        }

        myoMesh.scale.set(scalePulse, scalePulse * 0.98, scalePulse);
        myoMesh.rotation.z = twistPulse;
      }

      // Vessel Luminous Pulsation
      Object.entries(arteriesRef.current).forEach(([name, group]) => {
        const isSelected = selectedArteryRef.current === name;
        const isHovered = hoveredArteryRef.current === name;

        group.traverse(child => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhysicalMaterial) {
            if (isSelected) {
              child.material.emissiveIntensity = 0.95 + 0.45 * Math.sin(elapsedTime * 7);
              group.scale.set(1.08, 1.08, 1.08);
            } else if (isHovered) {
              child.material.emissiveIntensity = 0.95;
              group.scale.set(1.04, 1.04, 1.04);
            } else {
              child.material.emissiveIntensity = isCCTA ? 0.9 : 0.55;
              group.scale.set(1.0, 1.0, 1.0);
            }
          }
        });
      });

      // Reticle animation on selected vessel
      if (selectedArteryRef.current && lesionMarkerRef.current) {
        lesionMarkerRef.current.visible = true;
        ringMesh.rotation.z = elapsedTime * 2.2;
        ringMesh.scale.setScalar(1.0 + 0.15 * Math.sin(elapsedTime * 5));

        if (selectedArteryRef.current === 'LAD') {
          lesionMarkerRef.current.position.set(0.06, 0.3, 2.5);
        } else if (selectedArteryRef.current === 'LCX') {
          lesionMarkerRef.current.position.set(-1.8, 1.3, 1.0);
        } else if (selectedArteryRef.current === 'RCA') {
          lesionMarkerRef.current.position.set(2.25, 0.6, 1.0);
        }
      } else if (lesionMarkerRef.current) {
        lesionMarkerRef.current.visible = false;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('click', onClick);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      myoTexture.dispose();
      bumpTexture.dispose();
    };
  }, [scanMode]);

  // Update Slice Plane when slider moves
  useEffect(() => {
    if (clipPlaneRef.current && scanMode === 'slice') {
      clipPlaneRef.current.constant = sliceOffset;
    }
  }, [sliceOffset, scanMode]);

  // Color updates when risk metrics update
  useEffect(() => {
    if (!arteriesRef.current) return;
    const colors: { [key: string]: number } = {
      LAD: getRiskColor(ladRisk),
      LCX: getRiskColor(lcxRisk),
      RCA: getRiskColor(rcaRisk)
    };

    Object.entries(arteriesRef.current).forEach(([name, group]) => {
      const color = new THREE.Color(colors[name]);
      group.traverse(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhysicalMaterial) {
          child.material.color = color;
          child.material.emissive = color;
        }
      });
    });
  }, [ladRisk, lcxRisk, rcaRisk]);

  // Camera presets
  const applyCameraPreset = (preset: 'AP' | 'LAO' | 'RAO' | 'BASE') => {
    setCameraPreset(preset);
    if (!cameraRef.current || !controlsRef.current) return;

    if (preset === 'AP') {
      cameraRef.current.position.set(0.6, 1.4, 13.0);
      controlsRef.current.target.set(0, -0.2, 0);
    } else if (preset === 'LAO') {
      cameraRef.current.position.set(-10.5, 2.2, 9.0);
      controlsRef.current.target.set(-0.5, 0.0, 0);
    } else if (preset === 'RAO') {
      cameraRef.current.position.set(10.5, 2.0, 9.0);
      controlsRef.current.target.set(0.5, 0.0, 0);
    } else if (preset === 'BASE') {
      cameraRef.current.position.set(0, 13.0, 5.5);
      controlsRef.current.target.set(0, 1.2, 0);
    }
    controlsRef.current.update();
  };

  const focusArtery = (artery: 'LAD' | 'LCX' | 'RCA') => {
    onSelectArtery(artery);
    if (!cameraRef.current || !controlsRef.current) return;

    if (artery === 'LAD') {
      cameraRef.current.position.set(0.2, 0.8, 11.0);
      controlsRef.current.target.set(0.06, 0.1, 1.8);
    } else if (artery === 'LCX') {
      cameraRef.current.position.set(-9.0, 2.8, 7.5);
      controlsRef.current.target.set(-1.4, 0.6, 0.0);
    } else if (artery === 'RCA') {
      cameraRef.current.position.set(9.0, 2.0, 7.5);
      controlsRef.current.target.set(1.4, 0.4, 0.2);
    }
    controlsRef.current.update();
  };

  return (
    <div className="relative w-full h-[580px] rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden flex flex-col font-sans select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Real CT Scanner Medical HUD Overlay (Top Left) */}
      <div className="absolute top-4 left-4 backdrop-blur-md bg-slate-900/85 px-3.5 py-2.5 rounded-2xl border border-slate-800 shadow-xl text-xs text-slate-200 pointer-events-auto">
        <div className="flex items-center space-x-2">
          <Scan className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-bold text-white tracking-wide">CCTA Anatomical 3D Scan</span>
          <span className="text-[10px] bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-800 font-mono">
            {scanMode === 'cinematic' ? 'Cinematic 3D Organ' : scanMode === 'ccta' ? 'Contrast Angiography' : 'CT Chamber Slicer'}
          </span>
        </div>
        
        {/* Scanner Telemetry Data */}
        <div className="mt-1.5 grid grid-cols-2 gap-x-4 text-[10px] text-slate-400 font-mono">
          <div>FOV: <span className="text-slate-300">180 mm</span></div>
          <div>Gating: <span className="text-emerald-400">75% R-R (End-Diastole)</span></div>
          <div>Density: <span className="text-amber-300">{scanMode === 'ccta' ? 'Contrast 450 HU' : 'Tissue 55 HU'}</span></div>
          <div>ECG: <span className="text-rose-400">{isBeating ? '66 bpm' : 'Frozen'}</span></div>
        </div>

        {hoveredArtery && (
          <div className="mt-1 pt-1 border-t border-slate-800 flex items-center space-x-1.5 text-rose-400 font-bold text-[11px] animate-pulse">
            <Activity className="w-3.5 h-3.5" />
            <span>Target: {hoveredArtery}</span>
          </div>
        )}
      </div>

      {/* Top Right: Scan Mode Selector & Artery Target Buttons */}
      <div className="absolute top-4 right-4 flex flex-col sm:flex-row items-end sm:items-center gap-2">
        {/* CT Imaging Mode Toggle Pills */}
        <div className="flex items-center p-1 rounded-2xl border border-slate-800 bg-slate-900/85 backdrop-blur-md shadow-xl text-xs">
          <button
            onClick={() => setScanMode('cinematic')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1 ${
              scanMode === 'cinematic'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Realistic</span>
          </button>

          <button
            onClick={() => setScanMode('ccta')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1 ${
              scanMode === 'ccta'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>CT Contrast</span>
          </button>

          <button
            onClick={() => setScanMode('slice')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1 ${
              scanMode === 'slice'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>CT Slicer</span>
          </button>
        </div>

        {/* Artery Direct Target Selectors */}
        <div className="flex items-center p-1 rounded-2xl border border-slate-800 bg-slate-900/85 backdrop-blur-md shadow-xl">
          <button
            onClick={() => focusArtery('LAD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedArtery === 'LAD'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 scale-105'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            LAD
          </button>
          <button
            onClick={() => focusArtery('LCX')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedArtery === 'LCX'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/40 scale-105'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            LCX
          </button>
          <button
            onClick={() => focusArtery('RCA')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedArtery === 'RCA'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 scale-105'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            RCA
          </button>
        </div>
      </div>

      {/* Interactive CT Chamber Slicer Slider (Appears when 'CT Slicer' mode is active) */}
      {scanMode === 'slice' && (
        <div className="absolute top-24 right-4 w-72 backdrop-blur-md bg-slate-900/90 p-3 rounded-2xl border border-cyan-500/40 shadow-2xl text-xs text-slate-200 animate-fade-in">
          <div className="flex items-center justify-between font-bold text-cyan-400 mb-1.5">
            <span className="flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Multi-Planar Slice Plane</span>
            </span>
            <span className="font-mono text-[11px] text-cyan-300">{(sliceOffset * 10).toFixed(0)} mm</span>
          </div>
          <input
            type="range"
            min="-2.2"
            max="2.2"
            step="0.05"
            value={sliceOffset}
            onChange={(e) => setSliceOffset(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
            <span>Apex (Ventricular Slices)</span>
            <span>Base (Valves & Outflow)</span>
          </div>
          <div className="text-[10px] text-slate-300 mt-2 bg-slate-800/60 p-1.5 rounded-lg border border-slate-700/60">
            Reveals internal Left & Right Ventricle chambers, myocardial wall thickness, and interventricular septum.
          </div>
        </div>
      )}

      {/* Floating Callout when Artery Selected */}
      {selectedArtery && (
        <div className="absolute top-24 left-4 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-rose-500/40 bg-slate-900/90 shadow-2xl text-xs text-white animate-fade-in flex items-center space-x-2.5">
          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
          <div>
            <div className="font-bold flex items-center space-x-1.5">
              <span>{selectedArtery} Stenosis Suspect Focus</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded font-mono font-bold">
                {selectedArtery === 'LAD' ? ladRisk?.percentage : selectedArtery === 'LCX' ? lcxRisk?.percentage : rcaRisk?.percentage}%
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              CCTA contrast lumen reticle marks hemodynamic narrowing segment
            </div>
          </div>
        </div>
      )}

      {/* Anatomical Orientation Crosshair Cube (Bottom Left) */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-2 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-800 bg-slate-900/85 shadow-xl text-xs text-slate-300">
        <button
          onClick={() => applyCameraPreset('AP')}
          title="Reset Camera to Standard AP View"
          className="p-1.5 hover:bg-slate-800 rounded-lg flex items-center space-x-1 text-slate-300 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        <div className="w-px h-4 bg-slate-800" />

        <button
          onClick={() => setIsRotating(!isRotating)}
          title="Toggle Auto-Rotation"
          className={`p-1.5 rounded-lg flex items-center space-x-1 transition-colors ${
            isRotating 
              ? 'bg-teal-600/20 text-teal-400 font-bold border border-teal-500/30' 
              : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isRotating ? 'Orbit ON' : 'Orbit OFF'}</span>
        </button>

        <div className="w-px h-4 bg-slate-800" />

        <button
          onClick={() => setIsBeating(!isBeating)}
          title="Toggle Heartbeat Animation"
          className={`p-1.5 rounded-lg flex items-center space-x-1 transition-colors ${
            isBeating 
              ? 'bg-rose-600/20 text-rose-400 font-bold border border-rose-500/30' 
              : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          {isBeating ? <Pause className="w-3.5 h-3.5 text-rose-400" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isBeating ? 'Pulse (66 bpm)' : 'Freeze'}</span>
        </button>
      </div>

      {/* Camera Angle Presets (Center Bottom) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-1 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-slate-800 bg-slate-900/85 shadow-xl text-xs font-semibold text-slate-300">
        <span className="text-[10px] text-slate-400 px-1.5 flex items-center space-x-1">
          <Compass className="w-3 h-3 text-cyan-400" />
          <span className="hidden sm:inline">Scan Views:</span>
        </span>
        {(['AP', 'LAO', 'RAO', 'BASE'] as const).map(preset => (
          <button
            key={preset}
            onClick={() => applyCameraPreset(preset)}
            className={`px-2.5 py-1 rounded-xl text-[11px] transition-all ${
              cameraPreset === preset
                ? 'bg-teal-600 text-white shadow-xs'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Probability Color Legend (Bottom Right) */}
      <div className="absolute bottom-4 right-4 backdrop-blur-md p-3 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl text-xs max-w-xs text-slate-300">
        <div className="font-semibold mb-1.5 flex items-center justify-between text-[11px]">
          <span className="flex items-center space-x-1">
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span>CCTA Risk Color Key</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">HU Calibrated</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span>&lt;35% Low</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
            <span>35-65% Mod</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
            <span>&ge;65% High</span>
          </div>
        </div>
      </div>
    </div>
  );
};
