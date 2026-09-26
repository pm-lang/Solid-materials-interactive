// ============================================================
// MATTER MASTERS — AUTHENTIC BOARD GAME & DUAL-PANEL DUEL
// Visible Pawns, Stepping Stone Path & Split-Screen Head-to-Head
// ============================================================

// ------------------------------------------------------------
// 1. Procedural Web Audio Engine
// ------------------------------------------------------------
class QuestAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.enabled = true;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.35;
    this.masterGain.connect(this.ctx.destination);
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  _now() { return this.ctx ? this.ctx.currentTime : 0; }

  _osc(type, freq, dur, gainVal = 0.25) {
    if (!this.enabled) return;
    this.init();
    this.resume();
    const t = this._now();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(gainVal, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  playDiceRoll() {
    if (!this.enabled) return;
    this.init();
    this.resume();
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this._osc('triangle', 180 + Math.random() * 220, 0.07, 0.15);
      }, i * 60);
    }
  }

  playPawnHop() {
    if (!this.enabled) return;
    this.init();
    this.resume();
    this._osc('sine', 650, 0.09, 0.25);
  }

  playLand() {
    if (!this.enabled) return;
    this.init();
    this.resume();
    [523, 659, 784].forEach((f, i) => {
      setTimeout(() => this._osc('sine', f, 0.22, 0.2), i * 75);
    });
  }

  playCorrect() {
    if (!this.enabled) return;
    this.init();
    this.resume();
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => this._osc('triangle', f, 0.35, 0.25), i * 85);
    });
  }

  playError() {
    this._osc('sawtooth', 140, 0.28, 0.25);
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    this.resume();
    [523, 659, 784, 1046, 1318].forEach((f, i) => {
      setTimeout(() => this._osc('triangle', f, 0.6, 0.3), i * 100);
    });
  }
}

const audio = new QuestAudioEngine();

// ------------------------------------------------------------
// 2. Confetti Cannon
// ------------------------------------------------------------
class QuestConfetti {
  constructor() {
    this.canvas = document.getElementById('confetti-canvas') || document.createElement('canvas');
    this.canvas.id = 'confetti-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.inset = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '99999';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animating = false;
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(count = 140) {
    const colors = ['#00d2ff', '#ff3366', '#ffd700', '#00f59b', '#bd00ff', '#ffffff'];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 3;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 15;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 5 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
        alpha: 1,
        decay: 0.008 + Math.random() * 0.012
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.loop();
    }
  }

  loop() {
    if (this.particles.length === 0) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.animating = false;
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25;
      p.vx *= 0.99;
      p.rotation += p.rotSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y > this.canvas.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.loop());
  }
}

const confetti = new QuestConfetti();

// ------------------------------------------------------------
// 3. Board Stepping Stone Path Definition (26 Sequential Tiles)
// ------------------------------------------------------------
// A complete spiral board path from START (bottom-left) to the SCIENCE CRYSTAL (center)
// ------------------------------------------------------------
// 3. Board Stepping Stone Path Definition (26 Sequential Tiles in 3D Space)
// ------------------------------------------------------------
const boardSteps = [
  { step: 0, type: 'start', title: 'START LAUNCH PAD', pos3D: { x: -16.0, y: 2.7, z: 12.0 }, icon: 'fa-flag-checkered', badge: 'Cadet Launch' },
  { step: 1, type: 'normal', title: 'Limestone Path 1', pos3D: { x: -15.0, y: 2.7, z: 9.5 }, label: '1' },
  { step: 2, type: 'star', title: 'Star Bonus (+20 XP)', pos3D: { x: -14.2, y: 2.7, z: 7.0 }, label: '★' },
  { step: 3, type: 'hub', stationId: 1, title: '1. Materials & Structure', pos3D: { x: -13.0, y: 2.8, z: 4.5 }, icon: 'fa-cube', color: '#8b5cf6', badge: 'Particle Pioneer' },
  { step: 4, type: 'normal', title: 'Cobblestone Way 4', pos3D: { x: -14.0, y: 2.8, z: 1.5 }, label: '4' },
  { step: 5, type: 'power', title: 'Power-Up Space', pos3D: { x: -14.8, y: 2.9, z: -1.5 }, label: '⚡' },
  { step: 6, type: 'hub', stationId: 2, title: '2. Solids, Liquids & Gases', pos3D: { x: -15.5, y: 2.9, z: -4.5 }, icon: 'fa-snowflake', color: '#00d2ff', badge: 'State Master' },
  { step: 7, type: 'normal', title: 'River Trail 7', pos3D: { x: -14.0, y: 3.0, z: -7.5 }, label: '7' },
  { step: 8, type: 'trivia', title: 'Quick Trivia', pos3D: { x: -12.5, y: 3.1, z: -10.5 }, label: '?' },
  { step: 9, type: 'hub', stationId: 3, title: '3. Changes of State', pos3D: { x: -10.0, y: 3.2, z: -13.0 }, icon: 'fa-fire-burner', color: '#f97316', badge: 'Thermal Sage' },
  { step: 10, type: 'normal', title: 'Volcanic Path 10', pos3D: { x: -7.0, y: 3.3, z: -14.5 }, label: '10' },
  { step: 11, type: 'star', title: 'Star Bonus (+20 XP)', pos3D: { x: -4.0, y: 3.4, z: -15.5 }, label: '★' },
  { step: 12, type: 'hub', stationId: 4, title: '4. Explaining State Changes', pos3D: { x: -1.0, y: 3.4, z: -15.8 }, icon: 'fa-brain', color: '#10b981', badge: 'Kinetic Guru' },
  { step: 13, type: 'normal', title: 'Alpine Bridge 13', pos3D: { x: 3.0, y: 3.4, z: -15.2 }, label: '13' },
  { step: 14, type: 'power', title: 'Power-Up Space', pos3D: { x: 7.0, y: 3.3, z: -14.0 }, label: '⚡' },
  { step: 15, type: 'hub', stationId: 5, title: '5. The Water Cycle', pos3D: { x: 11.5, y: 3.3, z: -11.5 }, icon: 'fa-cloud-showers-heavy', color: '#06b6d4', badge: 'Water Warrior' },
  { step: 16, type: 'normal', title: 'Waterfall Brink 16', pos3D: { x: 14.5, y: 3.1, z: -8.0 }, label: '16' },
  { step: 17, type: 'star', title: 'Star Bonus (+20 XP)', pos3D: { x: 16.0, y: 3.0, z: -4.0 }, label: '★' },
  { step: 18, type: 'hub', stationId: 6, title: '6. Atoms & Periodic Table', pos3D: { x: 16.5, y: 2.9, z: 0.0 }, icon: 'fa-atom', color: '#6366f1', badge: 'Atom Builder' },
  { step: 19, type: 'normal', title: 'Elemental Terrace 19', pos3D: { x: 15.5, y: 2.8, z: 4.0 }, label: '19' },
  { step: 20, type: 'hub', stationId: 7, title: '7. Compounds & Formulae', pos3D: { x: 13.5, y: 2.8, z: 8.0 }, icon: 'fa-flask-vial', color: '#ec4899', badge: 'Formula Finder' },
  { step: 21, type: 'trivia', title: 'Quick Trivia', pos3D: { x: 10.5, y: 2.7, z: 11.0 }, label: '?' },
  { step: 22, type: 'normal', title: 'Meadow Curve 22', pos3D: { x: 7.0, y: 2.6, z: 12.5 }, label: '22' },
  { step: 23, type: 'hub', stationId: 8, title: '8. Compounds & Mixtures', pos3D: { x: 3.0, y: 2.6, z: 12.8 }, icon: 'fa-filter', color: '#eab308', badge: 'Mixture Master' },
  { step: 24, type: 'star', title: 'Academy Promenade 24', pos3D: { x: 0.0, y: 2.8, z: 9.0 }, label: '★' },
  { step: 25, type: 'crystal', stationId: 9, title: 'SCIENCE CRYSTAL CITADEL', pos3D: { x: 0.0, y: 5.8, z: -17.5 }, icon: 'fa-gem', color: '#39ff14', badge: 'Science Champion' }
];

const gameState = {
  activePlayer: 1, // 1 = Blue Team, 2 = Red Team
  isRolling: false,
  isDuelActive: false,
  timerSeconds: 30,
  timerInterval: null,
  players: {
    1: { name: 'Blue Team (Sol)', xp: 150, pos: 0, color: '#00d2ff', badges: [], doublePoints: false },
    2: { name: 'Red Team (Aqua)', xp: 150, pos: 0, color: '#ff3366', badges: [], doublePoints: false }
  },
  currentStationId: 0
};

// ------------------------------------------------------------
// 4. 3D Floating Island Tabletop Diorama (Matter Masters 3D Board)
// ------------------------------------------------------------
let islandScene = null;
let islandCamera = null;
let islandRenderer = null;
let islandControls = null;
let p1Pawn3D = null;
let p2Pawn3D = null;
let p1AuraMesh = null;
let p2AuraMesh = null;
let crystalMesh = null;
let crystalHaloMesh = null;
let academyDomeCore = null;
let academyRings = [];
let stationInteractiveMeshes = [];
let stoneInteractiveMeshes = [];
let waterfallParticles = null;
let animatedSceneProps = [];
let cameraTransition = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function init3DFloatingIsland() {
  const canvas = document.getElementById('board-3d-canvas');
  if (!canvas) return;

  const width = canvas.parentElement ? canvas.parentElement.clientWidth : 1000;
  const height = canvas.parentElement ? canvas.parentElement.clientHeight : 600;

  // 1. Scene & Atmosphere — Bright Clear Daylight Sky
  islandScene = new THREE.Scene();
  islandScene.background = new THREE.Color(0xbfe6ff);
  islandScene.fog = new THREE.FogExp2(0xbfe6ff, 0.007);

  // 2. Camera (Isometric Perspective)
  islandCamera = new THREE.PerspectiveCamera(44, width / height, 0.5, 300);
  islandCamera.position.set(0, 32, 38);

  // 3. Renderer
  islandRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  islandRenderer.setSize(width, height);
  islandRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  islandRenderer.shadowMap.enabled = true;
  islandRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  islandRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  islandRenderer.toneMappingExposure = 1.0;

  // 4. OrbitControls
  if (typeof THREE.OrbitControls !== 'undefined') {
    islandControls = new THREE.OrbitControls(islandCamera, canvas);
    islandControls.enableDamping = true;
    islandControls.dampingFactor = 0.08;
    islandControls.maxPolarAngle = Math.PI / 2.05; // Do not look straight below island
    islandControls.minDistance = 14;
    islandControls.maxDistance = 70;
    islandControls.target.set(0, 3.2, 0);
  }

  // 5. Bright Cheerful Daylight Lighting (Balanced to prevent overexposure)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  islandScene.add(ambientLight);

  // Main Golden Sunlight
  const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.05);
  sunLight.position.set(24, 48, 22);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 120;
  sunLight.shadow.camera.left = -28;
  sunLight.shadow.camera.right = 28;
  sunLight.shadow.camera.top = 28;
  sunLight.shadow.camera.bottom = -28;
  sunLight.shadow.bias = -0.0005;
  islandScene.add(sunLight);

  // Cyan Sky Fill Light
  const skyFill = new THREE.DirectionalLight(0x38bdf8, 0.45);
  skyFill.position.set(-25, 25, -20);
  islandScene.add(skyFill);

  // Neon Green Crystal Refraction Light
  const crystalRim = new THREE.DirectionalLight(0x39ff14, 0.45);
  crystalRim.position.set(0, 15, -35);
  islandScene.add(crystalRim);

  // Point lights for vivid scientific brilliance
  const academyLight = new THREE.PointLight(0x00f5ff, 1.8, 22);
  academyLight.position.set(0, 6, 0);
  islandScene.add(academyLight);

  const crystalPointLight = new THREE.PointLight(0x39ff14, 2.2, 26);
  crystalPointLight.position.set(0, 8.5, -17.5);
  islandScene.add(crystalPointLight);

  // 6. Build the Floating Island World
  buildIslandTerrain();
  buildScienceAcademy();
  buildScienceCrystalCitadel();
  buildStationPlatformsAndProps();
  buildSteppingStoneTrack();
  build3DPlayerPawns();
  setupWaterfallSystem();
  buildScenicVegetation();

  // 7. Event Listeners for Raycasting & Resize
  canvas.addEventListener('mousemove', onIslandMouseMove);
  canvas.addEventListener('click', onIslandCanvasClick);
  window.addEventListener('resize', onIslandWindowResize);

  // 8. Start Animation Loop
  requestAnimationFrame(animateIslandScene);
}

// ------------------------------------------------------------
// Island Terrain: Stratified Rocky Cliffs & Lush Grass Plateau
// ------------------------------------------------------------
function buildIslandTerrain() {
  const islandGroup = new THREE.Group();

  // Warm wooden study tabletop base disc (matching reference image)
  const deskMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5, metalness: 0.1 });
  const deskGeom = new THREE.CylinderGeometry(38, 40, 2.5, 48);
  const desk = new THREE.Mesh(deskGeom, deskMat);
  desk.position.y = -19.5;
  desk.receiveShadow = true;
  islandGroup.add(desk);

  // Top Grass Plateau (rich vivid green grass surface)
  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x16a34a,
    roughness: 0.8,
    metalness: 0.05,
    flatShading: true
  });
  const grassGeom = new THREE.CylinderGeometry(23.5, 24.2, 1.6, 44);
  const grassPlateau = new THREE.Mesh(grassGeom, grassMat);
  grassPlateau.position.y = 1.9;
  grassPlateau.receiveShadow = true;
  islandGroup.add(grassPlateau);

  // Inner elevated sunny green lawn terrace
  const innerLawnMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.75, flatShading: true });
  const innerLawnGeom = new THREE.CylinderGeometry(15.5, 16.5, 0.6, 36);
  const innerLawn = new THREE.Mesh(innerLawnGeom, innerLawnMat);
  innerLawn.position.y = 2.7;
  innerLawn.receiveShadow = true;
  islandGroup.add(innerLawn);

  // Deep Emerald Border Fringe
  const fringeMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.85, flatShading: true });
  const fringeGeom = new THREE.TorusGeometry(23.8, 0.45, 8, 44);
  fringeGeom.rotateX(Math.PI / 2);
  const fringe = new THREE.Mesh(fringeGeom, fringeMat);
  fringe.position.y = 2.4;
  islandGroup.add(fringe);

  // Stratified Warm Earthy Rock Strata (4 layered tiers)
  const rockLayer1Mat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.9, flatShading: true });
  const rockGeom1 = new THREE.CylinderGeometry(24.0, 20.0, 3.5, 32);
  const rockLayer1 = new THREE.Mesh(rockGeom1, rockLayer1Mat);
  rockLayer1.position.y = -0.5;
  rockLayer1.castShadow = true;
  rockLayer1.receiveShadow = true;
  islandGroup.add(rockLayer1);

  const rockLayer2Mat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9, flatShading: true });
  const rockGeom2 = new THREE.CylinderGeometry(19.8, 14.2, 4.0, 26);
  const rockLayer2 = new THREE.Mesh(rockGeom2, rockLayer2Mat);
  rockLayer2.position.y = -4.0;
  rockLayer2.castShadow = true;
  islandGroup.add(rockLayer2);

  const rockLayer3Mat = new THREE.MeshStandardMaterial({ color: 0x5b21b6, roughness: 0.9, flatShading: true });
  const rockGeom3 = new THREE.CylinderGeometry(13.8, 7.5, 4.5, 20);
  const rockLayer3 = new THREE.Mesh(rockGeom3, rockLayer3Mat);
  rockLayer3.position.y = -8.0;
  rockLayer3.castShadow = true;
  islandGroup.add(rockLayer3);

  // Hanging Stalactite Tip
  const stalactiteMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.95, flatShading: true });
  const stalactiteGeom = new THREE.ConeGeometry(7.2, 7.0, 14);
  stalactiteGeom.rotateX(Math.PI);
  const stalactite = new THREE.Mesh(stalactiteGeom, stalactiteMat);
  stalactite.position.y = -13.5;
  stalactite.castShadow = true;
  islandGroup.add(stalactite);

  // Orbiting Satellite Floating Rock Chunks
  const satelliteMat = new THREE.MeshStandardMaterial({ color: 0x4a3420, roughness: 0.9, flatShading: true });
  const satellitePositions = [
    { x: -26, y: -4, z: 10, s: 1.8 },
    { x: 26, y: -6, z: -12, s: 2.2 },
    { x: 22, y: -8, z: 18, s: 1.5 },
    { x: -20, y: -9, z: -20, s: 2.0 },
    { x: 5, y: -16, z: 2, s: 1.2 }
  ];
  satellitePositions.forEach((pos) => {
    const satGeom = new THREE.DodecahedronGeometry(pos.s, 0);
    const satMesh = new THREE.Mesh(satGeom, satelliteMat);
    satMesh.position.set(pos.x, pos.y, pos.z);
    satMesh.rotation.set(Math.random(), Math.random(), Math.random());
    islandGroup.add(satMesh);
    animatedSceneProps.push({
      mesh: satMesh,
      update: (t) => {
        satMesh.position.y = pos.y + Math.sin(t * 1.2 + pos.x) * 0.4;
        satMesh.rotation.y += 0.004;
      }
    });
  });

  islandScene.add(islandGroup);
}

// ------------------------------------------------------------
// Central Building: The Science Academy
// ------------------------------------------------------------
function buildScienceAcademy() {
  const academyGroup = new THREE.Group();
  academyGroup.position.set(0, 2.6, 0);

  // Classical Sandstone Stepped Dais
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xe2d4be, roughness: 0.75, metalness: 0.1 });
  const baseGeom = new THREE.CylinderGeometry(5.2, 5.6, 0.7, 36);
  const baseDais = new THREE.Mesh(baseGeom, baseMat);
  baseDais.position.y = 0.35;
  baseDais.receiveShadow = true;
  academyGroup.add(baseDais);

  // Gold Trim Ring
  const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3, metalness: 0.8 });
  const goldRingGeom = new THREE.TorusGeometry(5.25, 0.14, 8, 36);
  goldRingGeom.rotateX(Math.PI / 2);
  const goldRing = new THREE.Mesh(goldRingGeom, goldTrimMat);
  goldRing.position.y = 0.7;
  academyGroup.add(goldRing);

  // Ring of 8 Classical Doric/Ionic Columns
  const columnMat = new THREE.MeshStandardMaterial({ color: 0x39ff14, roughness: 0.6, metalness: 0.15 });
  const colGeom = new THREE.CylinderGeometry(0.24, 0.28, 3.2, 12);
  const columnRadius = 4.2;
  const numColumns = 8;
  for (let i = 0; i < numColumns; i++) {
    const angle = (i / numColumns) * Math.PI * 2;
    const colMesh = new THREE.Mesh(colGeom, columnMat);
    colMesh.position.set(Math.cos(angle) * columnRadius, 2.1, Math.sin(angle) * columnRadius);
    colMesh.castShadow = true;
    academyGroup.add(colMesh);
  }

  // Circular Architrave Ring
  const architraveMat = new THREE.MeshStandardMaterial({ color: 0x39ff14, roughness: 0.7, metalness: 0.2 });
  const architraveGeom = new THREE.CylinderGeometry(4.6, 4.4, 0.45, 36);
  const architrave = new THREE.Mesh(architraveGeom, architraveMat);
  architrave.position.y = 3.8;
  academyGroup.add(architrave);

  // Glowing Cyan Translucent Glass Dome
  const domeMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.52,
    roughness: 0.12,
    metalness: 0.2,
    transmission: 0.6,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });
  const domeGeom = new THREE.SphereGeometry(4.2, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const domeMesh = new THREE.Mesh(domeGeom, domeMat);
  domeMesh.position.y = 4.0;
  academyGroup.add(domeMesh);

  // Dome Finial Sphere
  const finialGeom = new THREE.SphereGeometry(0.4, 16, 16);
  const finialMesh = new THREE.Mesh(finialGeom, goldTrimMat);
  finialMesh.position.y = 8.2;
  academyGroup.add(finialMesh);

  // Inside the Dome: Glowing Atomic Nucleus Core
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const coreGeom = new THREE.SphereGeometry(0.85, 20, 20);
  academyDomeCore = new THREE.Mesh(coreGeom, coreMat);
  academyDomeCore.position.y = 5.2;
  academyGroup.add(academyDomeCore);

  // 3 Inclined Dynamic Electron Orbital Rings
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
  const electronMat = new THREE.MeshBasicMaterial({ color: 0x39ff14 });
  const orbitalAngles = [
    { x: 0.8, y: 0.2, z: 0.3, speed: 0.024 },
    { x: -0.6, y: 0.7, z: -0.4, speed: -0.019 },
    { x: 0.1, y: -0.9, z: 0.8, speed: 0.028 }
  ];

  orbitalAngles.forEach((orb) => {
    const ringGeom = new THREE.TorusGeometry(2.0, 0.06, 8, 36);
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.position.y = 5.2;
    ringMesh.rotation.set(orb.x, orb.y, orb.z);

    const electronGeom = new THREE.SphereGeometry(0.18, 12, 12);
    const electronMesh = new THREE.Mesh(electronGeom, electronMat);
    electronMesh.position.set(2.0, 0, 0);
    ringMesh.add(electronMesh);

    academyGroup.add(ringMesh);
    academyRings.push({ mesh: ringMesh, speed: orb.speed });
  });

  // Entrance Bridge Ramp & "SCIENCE ACADEMY" Archway
  const rampMat = new THREE.MeshStandardMaterial({ color: 0xd4c5b0, roughness: 0.8 });
  const rampGeom = new THREE.BoxGeometry(2.8, 0.4, 4.2);
  const ramp = new THREE.Mesh(rampGeom, rampMat);
  ramp.position.set(0, 0.2, 5.8);
  ramp.receiveShadow = true;
  academyGroup.add(ramp);

  islandScene.add(academyGroup);
}

// ------------------------------------------------------------
// Top Elevated Citadel: The Science Crystal (Final Boss)
// ------------------------------------------------------------
function buildScienceCrystalCitadel() {
  const citadelGroup = new THREE.Group();
  citadelGroup.position.set(0, 5.5, -17.5);

  // Elevated Stepped Obsidian & Gold Dais
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.6, metalness: 0.4 });
  const tier1Geom = new THREE.CylinderGeometry(5.0, 5.6, 0.8, 8);
  const tier1 = new THREE.Mesh(tier1Geom, stoneMat);
  tier1.receiveShadow = true;
  citadelGroup.add(tier1);

  const tier2Mat = new THREE.MeshStandardMaterial({ color: 0x312e81, roughness: 0.5, metalness: 0.5 });
  const tier2Geom = new THREE.CylinderGeometry(3.8, 4.4, 0.7, 8);
  const tier2 = new THREE.Mesh(tier2Geom, tier2Mat);
  tier2.position.y = 0.75;
  citadelGroup.add(tier2);

  // Neon Energy Rings on Floor
  const energyRingMat1 = new THREE.MeshBasicMaterial({ color: 0x39ff14 });
  const eRing1Geom = new THREE.TorusGeometry(3.6, 0.12, 8, 36);
  eRing1Geom.rotateX(Math.PI / 2);
  const eRing1 = new THREE.Mesh(eRing1Geom, energyRingMat1);
  eRing1.position.y = 1.15;
  citadelGroup.add(eRing1);

  const energyRingMat2 = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  const eRing2Geom = new THREE.TorusGeometry(2.6, 0.1, 8, 36);
  eRing2Geom.rotateX(Math.PI / 2);
  const eRing2 = new THREE.Mesh(eRing2Geom, energyRingMat2);
  eRing2.position.y = 1.16;
  citadelGroup.add(eRing2);

  // Giant Levitating Faceted Science Crystal (Vibrant Neon Green)
  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0x39ff14,
    emissive: 0x00ff44,
    emissiveIntensity: 0.8,
    roughness: 0.12,
    metalness: 0.1,
    transmission: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    reflectivity: 0.95
  });
  const crystalGeom = new THREE.OctahedronGeometry(2.5, 0);
  crystalGeom.scale(1.3, 2.5, 1.3);
  crystalMesh = new THREE.Mesh(crystalGeom, crystalMat);
  crystalMesh.position.y = 4.2;
  crystalMesh.castShadow = true;
  citadelGroup.add(crystalMesh);

  // Orbiting Magical Halo Ring (Neon Green)
  const haloMat = new THREE.MeshBasicMaterial({ color: 0x39ff14, wireframe: true });
  const haloGeom = new THREE.TorusGeometry(3.2, 0.08, 6, 24);
  haloGeom.rotateX(Math.PI / 3);
  crystalHaloMesh = new THREE.Mesh(haloGeom, haloMat);
  crystalHaloMesh.position.y = 4.2;
  citadelGroup.add(crystalHaloMesh);

  // Clickable hitbox for the Citadel
  const citadelHitboxGeom = new THREE.CylinderGeometry(4.8, 4.8, 6, 12);
  const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
  const citadelHitbox = new THREE.Mesh(citadelHitboxGeom, hitboxMat);
  citadelHitbox.position.y = 3.0;
  citadelHitbox.userData = { isStation: true, stationId: 9, title: 'SCIENCE CRYSTAL CITADEL' };
  citadelGroup.add(citadelHitbox);
  stationInteractiveMeshes.push(citadelHitbox);

  islandScene.add(citadelGroup);
}

// ------------------------------------------------------------
// 8 Themed Station Dais Platforms & Scientific Props
// ------------------------------------------------------------
function buildStationPlatformsAndProps() {
  const stationDefs = [
    {
      id: 1,
      title: 'Materials & Structure',
      color: 0x8b5cf6,
      pos: { x: -13.0, y: 2.8, z: 4.5 },
      builder: (group) => {
        // Crystalline Atomic Lattice (8 spheres, 12 rods)
        const nodeMat = new THREE.MeshStandardMaterial({ color: 0xd8b4fe, metalness: 0.8, roughness: 0.2 });
        const rodMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, metalness: 0.7, roughness: 0.3 });
        const size = 0.9;
        const coords = [-size, size];
        coords.forEach(x => {
          coords.forEach(y => {
            coords.forEach(z => {
              const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), nodeMat);
              sphere.position.set(x, y + 1.8, z);
              group.add(sphere);
            });
          });
        });
        // Connecting cylinders for cube edges
        const makeRod = (p1, p2) => {
          const v1 = new THREE.Vector3(...p1);
          const v2 = new THREE.Vector3(...p2);
          const dist = v1.distanceTo(v2);
          const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, dist, 6), rodMat);
          rod.position.copy(v1.clone().add(v2).multiplyScalar(0.5));
          rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v2.clone().sub(v1).normalize());
          group.add(rod);
        };
        coords.forEach(x => {
          coords.forEach(y => {
            makeRod([x, y + 1.8, -size], [x, y + 1.8, size]);
            makeRod([x, -size + 1.8, y], [x, size + 1.8, y]);
            makeRod([-size, x + 1.8, y], [size, x + 1.8, y]);
          });
        });
      }
    },
    {
      id: 2,
      title: 'Solids, Liquids & Gases',
      color: 0x06b6d4,
      pos: { x: -15.5, y: 2.9, z: -4.5 },
      builder: (group) => {
        // 1. Ice Cube (Solid)
        const iceMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.75, roughness: 0.1 });
        const ice = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), iceMat);
        ice.position.set(-0.8, 1.4, -0.4);
        ice.rotation.set(0.2, 0.4, 0.1);
        group.add(ice);

        // 2. Liquid Droplet (Liquid)
        const dropMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.3 });
        const drop = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), dropMat);
        drop.position.set(0.8, 1.3, -0.2);
        drop.scale.set(0.9, 1.3, 0.9);
        group.add(drop);

        // 3. Steam Cloud (Gas)
        const cloudMat = new THREE.MeshStandardMaterial({ color: 0x39ff14, roughness: 0.9, transparent: true, opacity: 0.85 });
        const cloudGroup = new THREE.Group();
        cloudGroup.position.set(0, 2.4, 0.5);
        for (let i = 0; i < 4; i++) {
          const puff = new THREE.Mesh(new THREE.SphereGeometry(0.35 + Math.random() * 0.15, 12, 12), cloudMat);
          puff.position.set((i - 1.5) * 0.35, Math.random() * 0.2, (Math.random() - 0.5) * 0.3);
          cloudGroup.add(puff);
        }
        group.add(cloudGroup);
      }
    },
    {
      id: 3,
      title: 'Changes of State',
      color: 0xf97316,
      pos: { x: -10.0, y: 3.2, z: -13.0 },
      builder: (group) => {
        // Hotplate Burner Base
        const plateMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.8 });
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.5, 0.35, 24), plateMat);
        plate.position.y = 1.1;
        group.add(plate);

        // Glowing Heating Coils
        const coilMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
        const coil = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.1, 8, 24), coilMat);
        coil.rotation.x = Math.PI / 2;
        coil.position.y = 1.3;
        group.add(coil);

        // Melting Ice Cube
        const meltIceMat = new THREE.MeshStandardMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.7 });
        const meltIce = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.65), meltIceMat);
        meltIce.position.set(0, 1.6, 0);
        meltIce.rotation.y = 0.5;
        group.add(meltIce);
      }
    },
    {
      id: 4,
      title: 'Explaining State Changes',
      color: 0x10b981,
      pos: { x: -1.0, y: 3.4, z: -15.8 },
      builder: (group) => {
        // Dual Kinetic Particle Demonstration Chambers
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x6ee7b7, transparent: true, opacity: 0.4, roughness: 0.1 });
        const cyl1 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.4, 16), glassMat);
        cyl1.position.set(-0.9, 1.6, 0);
        group.add(cyl1);

        const cyl2 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.4, 16), glassMat);
        cyl2.position.set(0.9, 1.6, 0);
        group.add(cyl2);

        // Cold Packed Blue Particles
        const coldMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
        for (let i = 0; i < 6; i++) {
          const p = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), coldMat);
          p.position.set(-0.9 + (i % 2 - 0.5) * 0.35, 1.1 + Math.floor(i / 2) * 0.25, 0);
          group.add(p);
        }

        // Fast Hot Orange Particles
        const hotMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
        for (let i = 0; i < 5; i++) {
          const p = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), hotMat);
          p.position.set(0.9 + (Math.random() - 0.5) * 0.8, 1.1 + Math.random() * 0.9, (Math.random() - 0.5) * 0.8);
          group.add(p);
        }
      }
    },
    {
      id: 5,
      title: 'The Water Cycle',
      color: 0x0284c7,
      pos: { x: 11.5, y: 3.3, z: -11.5 },
      builder: (group) => {
        // Mountain & River Stream Model
        const mtnMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.9, flatShading: true });
        const mtn = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.8, 7), mtnMat);
        mtn.position.set(-0.4, 1.7, -0.3);
        group.add(mtn);

        // Snow Cap
        const snowMat = new THREE.MeshStandardMaterial({ color: 0x39ff14, roughness: 0.8 });
        const snow = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.6, 7), snowMat);
        snow.position.set(-0.4, 2.4, -0.3);
        group.add(snow);

        // River Basin
        const riverMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1 });
        const pond = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.1, 16), riverMat);
        pond.position.set(0.7, 1.0, 0.5);
        group.add(pond);

        // Raincloud
        const cloudMat = new THREE.MeshStandardMaterial({ color: 0x39ff14, roughness: 0.9 });
        const cloud = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 1), cloudMat);
        cloud.position.set(0.6, 2.7, 0.2);
        group.add(cloud);
      }
    },
    {
      id: 6,
      title: 'Atoms & Periodic Table',
      color: 0x6366f1,
      pos: { x: 16.5, y: 2.9, z: 0.0 },
      builder: (group) => {
        // Rutherford-Bohr Atom Model
        const nucGroup = new THREE.Group();
        nucGroup.position.y = 1.9;
        const pMat = new THREE.MeshStandardMaterial({ color: 0xef4444 }); // proton
        const nMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 }); // neutron
        for (let i = 0; i < 4; i++) {
          const sp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), i % 2 === 0 ? pMat : nMat);
          sp.position.set((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3);
          nucGroup.add(sp);
        }
        group.add(nucGroup);

        // Spinning Electron Rings
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x818cf8 });
        const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.035, 6, 24), ringMat);
        r1.rotation.x = Math.PI / 3;
        r1.position.y = 1.9;
        group.add(r1);

        const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.035, 6, 24), ringMat);
        r2.rotation.y = Math.PI / 3;
        r2.position.y = 1.9;
        group.add(r2);

        animatedSceneProps.push({
          mesh: r1,
          update: () => { r1.rotation.z += 0.02; r2.rotation.x += 0.025; }
        });

        // Elemental Blocks (H, He, C)
        const blockColors = [0x38bdf8, 0xfacc15, 0x4ade80];
        blockColors.forEach((col, idx) => {
          const bMesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), new THREE.MeshStandardMaterial({ color: col, metalness: 0.5 }));
          bMesh.position.set(-1.0 + idx * 1.0, 1.1, 0.9);
          group.add(bMesh);
        });
      }
    },
    {
      id: 7,
      title: 'Compounds & Formulae',
      color: 0xec4899,
      pos: { x: 13.5, y: 2.8, z: 8.0 },
      builder: (group) => {
        // 3D Ball-and-Stick Water Molecule (H2O)
        const oMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 }); // Oxygen
        const hMat = new THREE.MeshStandardMaterial({ color: 0x39ff14, roughness: 0.2 }); // Hydrogen
        const bondMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6 });

        const oxygen = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), oMat);
        oxygen.position.set(0, 1.9, 0);
        group.add(oxygen);

        const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), hMat);
        h1.position.set(-0.6, 2.3, 0);
        group.add(h1);

        const h2 = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), hMat);
        h2.position.set(0.6, 2.3, 0);
        group.add(h2);

        // Erlenmeyer Chemistry Flask
        const flaskMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, transparent: true, opacity: 0.55, roughness: 0.1 });
        const flaskBody = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.9, 16), flaskMat);
        flaskBody.position.set(-0.9, 1.4, -0.4);
        group.add(flaskBody);
        const flaskNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.5, 12), flaskMat);
        flaskNeck.position.set(-0.9, 1.9, -0.4);
        group.add(flaskNeck);
      }
    },
    {
      id: 8,
      title: 'Compounds & Mixtures',
      color: 0xeab308,
      pos: { x: 3.0, y: 2.6, z: 12.8 },
      builder: (group) => {
        // Laboratory Beaker with Separated Layers
        const beakerMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, transparent: true, opacity: 0.45, roughness: 0.1 });
        const beaker = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 1.2, 16), beakerMat);
        beaker.position.set(-0.7, 1.5, 0);
        group.add(beaker);

        // Layer 1: Water (Blue)
        const wLayer = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.4, 16), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
        wLayer.position.set(-0.7, 1.2, 0);
        group.add(wLayer);

        // Layer 2: Oil (Gold)
        const oLayer = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.4, 16), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
        oLayer.position.set(-0.7, 1.6, 0);
        group.add(oLayer);

        // Mixture Bowl with Colorful Particles
        const bowlMat = new THREE.MeshStandardMaterial({ color: 0x39ff14, roughness: 0.4 });
        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.4, 0.5, 16), bowlMat);
        bowl.position.set(0.8, 1.2, 0);
        group.add(bowl);
      }
    }
  ];

  stationDefs.forEach((st) => {
    const stationGroup = new THREE.Group();
    stationGroup.position.set(st.pos.x, st.pos.y, st.pos.z);

    // Circular Themed Dais Platform
    const daisMat = new THREE.MeshStandardMaterial({
      color: st.color,
      roughness: 0.45,
      metalness: 0.35,
      emissive: st.color,
      emissiveIntensity: 0.15
    });
    const daisGeom = new THREE.CylinderGeometry(2.4, 2.7, 0.6, 28);
    const dais = new THREE.Mesh(daisGeom, daisMat);
    dais.position.y = 0.3;
    dais.receiveShadow = true;
    stationGroup.add(dais);

    // Metallic Rim Accent Ring
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x39ff14, roughness: 0.2, metalness: 0.8 });
    const rimGeom = new THREE.TorusGeometry(2.45, 0.1, 8, 28);
    rimGeom.rotateX(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeom, rimMat);
    rim.position.y = 0.6;
    stationGroup.add(rim);

    // Station Number Pillar Badge
    const badgeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const badgeMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.15, 16), badgeMat);
    badgeMesh.position.set(0, 0.68, 1.8);
    stationGroup.add(badgeMesh);

    // Call custom scientific 3D diorama prop builder
    st.builder(stationGroup);

    // Invisible Click/Hover Raycast Target
    const hitGeom = new THREE.CylinderGeometry(2.6, 2.6, 3.5, 16);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitbox = new THREE.Mesh(hitGeom, hitMat);
    hitbox.position.y = 1.7;
    hitbox.userData = { isStation: true, stationId: st.id, title: st.title, daisMat: daisMat, baseColor: st.color };
    stationGroup.add(hitbox);
    stationInteractiveMeshes.push(hitbox);

    islandScene.add(stationGroup);
  });
}

// ------------------------------------------------------------
// 26 3D Stepping Stones Connecting the Path
// ------------------------------------------------------------
function buildSteppingStoneTrack() {
  const normalStoneMat = new THREE.MeshStandardMaterial({ color: 0x39ff14, roughness: 0.7, metalness: 0.1 });
  const starStoneMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4, metalness: 0.5, emissive: 0xeab308, emissiveIntensity: 0.3 });
  const powerStoneMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.4, metalness: 0.5, emissive: 0x3b82f6, emissiveIntensity: 0.3 });
  const triviaStoneMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.4, metalness: 0.5, emissive: 0xec4899, emissiveIntensity: 0.3 });
  const startStoneMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5, metalness: 0.4, emissive: 0x16a34a, emissiveIntensity: 0.4 });

  boardSteps.forEach((s) => {
    // We already modeled hubs and crystal citadel separately
    if (s.type === 'hub' || s.type === 'crystal') return;

    let mat = normalStoneMat;
    let radius = 0.95;
    let height = 0.3;

    if (s.type === 'start') {
      mat = startStoneMat;
      radius = 2.4;
      height = 0.5;
    } else if (s.type === 'star') {
      mat = starStoneMat;
      radius = 1.1;
    } else if (s.type === 'power') {
      mat = powerStoneMat;
      radius = 1.1;
    } else if (s.type === 'trivia') {
      mat = triviaStoneMat;
      radius = 1.1;
    }

    const stoneGeom = new THREE.CylinderGeometry(radius, radius * 1.08, height, 8);
    const stoneMesh = new THREE.Mesh(stoneGeom, mat);
    stoneMesh.position.set(s.pos3D.x, s.pos3D.y + height * 0.5, s.pos3D.z);
    stoneMesh.receiveShadow = true;
    stoneMesh.userData = { isStone: true, stepIdx: s.step, title: s.title };
    islandScene.add(stoneMesh);
    stoneInteractiveMeshes.push(stoneMesh);

    // Floating Props on Special Tiles
    if (s.type === 'star') {
      // 3D Golden Star
      const starGeom = new THREE.OctahedronGeometry(0.4, 0);
      starGeom.scale(1, 1.4, 0.4);
      const starMesh = new THREE.Mesh(starGeom, new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      starMesh.position.set(s.pos3D.x, s.pos3D.y + 1.2, s.pos3D.z);
      islandScene.add(starMesh);
      animatedSceneProps.push({
        mesh: starMesh,
        update: (t) => { starMesh.rotation.y += 0.04; starMesh.position.y = s.pos3D.y + 1.2 + Math.sin(t * 3 + s.step) * 0.12; }
      });
    } else if (s.type === 'power') {
      // 3D Lightning Bolt Diamond
      const boltGeom = new THREE.OctahedronGeometry(0.35, 0);
      boltGeom.scale(0.6, 1.6, 0.6);
      const boltMesh = new THREE.Mesh(boltGeom, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      boltMesh.position.set(s.pos3D.x, s.pos3D.y + 1.2, s.pos3D.z);
      islandScene.add(boltMesh);
      animatedSceneProps.push({
        mesh: boltMesh,
        update: (t) => { boltMesh.rotation.y -= 0.04; boltMesh.position.y = s.pos3D.y + 1.2 + Math.sin(t * 3 + s.step) * 0.12; }
      });
    } else if (s.type === 'start') {
      // START concentric ring
      const startRingGeom = new THREE.TorusGeometry(2.2, 0.1, 8, 32);
      startRingGeom.rotateX(Math.PI / 2);
      const startRing = new THREE.Mesh(startRingGeom, new THREE.MeshBasicMaterial({ color: 0x86efac }));
      startRing.position.set(s.pos3D.x, s.pos3D.y + height + 0.02, s.pos3D.z);
      islandScene.add(startRing);
    }
  });
}

// ------------------------------------------------------------
// 3D Player Pawns: Authentic Stylized Tabletop Meeples
// ------------------------------------------------------------
function build3DPlayerPawns() {
  // Player 1: Blue Team Meeple
  p1Pawn3D = createPawnMesh(0x00d2ff, 0x0044ff);
  islandScene.add(p1Pawn3D);

  // Player 2: Red Team Meeple
  p2Pawn3D = createPawnMesh(0xff3366, 0x99002b);
  islandScene.add(p2Pawn3D);

  updatePlayerPawns3D();
}

function createPawnMesh(primaryColor, accentColor) {
  const pawnGroup = new THREE.Group();

  // Base circular foot
  const footMat = new THREE.MeshStandardMaterial({ color: primaryColor, metalness: 0.75, roughness: 0.25 });
  const footGeom = new THREE.CylinderGeometry(0.65, 0.8, 0.35, 18);
  const foot = new THREE.Mesh(footGeom, footMat);
  foot.position.y = 0.18;
  foot.castShadow = true;
  pawnGroup.add(foot);

  // Tapered body
  const bodyGeom = new THREE.CylinderGeometry(0.3, 0.6, 1.2, 18);
  const body = new THREE.Mesh(bodyGeom, footMat);
  body.position.y = 0.95;
  body.castShadow = true;
  pawnGroup.add(body);

  // Waist accent ring
  const waistMat = new THREE.MeshStandardMaterial({ color: 0x39ff14, metalness: 0.8, roughness: 0.2 });
  const waistGeom = new THREE.TorusGeometry(0.38, 0.07, 8, 18);
  waistGeom.rotateX(Math.PI / 2);
  const waist = new THREE.Mesh(waistGeom, waistMat);
  waist.position.y = 1.35;
  pawnGroup.add(waist);

  // Spherical Head with glowing crown
  const headGeom = new THREE.SphereGeometry(0.48, 18, 18);
  const head = new THREE.Mesh(headGeom, footMat);
  head.position.y = 1.95;
  head.castShadow = true;
  pawnGroup.add(head);

  // Glowing crest visor
  const visorMat = new THREE.MeshBasicMaterial({ color: 0x39ff14 });
  const visorGeom = new THREE.SphereGeometry(0.18, 10, 10);
  const visor = new THREE.Mesh(visorGeom, visorMat);
  visor.position.set(0, 2.05, 0.36);
  pawnGroup.add(visor);

  // Ground Glowing Aura Ring
  const auraMat = new THREE.MeshBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.7 });
  const auraGeom = new THREE.RingGeometry(0.85, 1.05, 24);
  auraGeom.rotateX(-Math.PI / 2);
  const aura = new THREE.Mesh(auraGeom, auraMat);
  aura.position.y = 0.02;
  pawnGroup.add(aura);

  return pawnGroup;
}

function updatePlayerPawns3D() {
  const p1 = gameState.players[1];
  const p2 = gameState.players[2];
  const s1 = boardSteps[p1.pos] || boardSteps[0];
  const s2 = boardSteps[p2.pos] || boardSteps[0];

  if (p1Pawn3D && s1) {
    const offsetX = (p1.pos === p2.pos) ? -0.55 : 0;
    p1Pawn3D.position.set(s1.pos3D.x + offsetX, s1.pos3D.y + 0.3, s1.pos3D.z);
  }

  if (p2Pawn3D && s2) {
    const offsetX = (p1.pos === p2.pos) ? 0.55 : 0;
    p2Pawn3D.position.set(s2.pos3D.x + offsetX, s2.pos3D.y + 0.3, s2.pos3D.z);
  }
}

// ------------------------------------------------------------
// 3D Parabolic Hopping Physics Animation
// ------------------------------------------------------------
function hopPawn3D(playerNum, fromStepIdx, toStepIdx, onComplete) {
  const pawn = playerNum === 1 ? p1Pawn3D : p2Pawn3D;
  if (!pawn) {
    if (onComplete) onComplete();
    return;
  }

  const fromStep = boardSteps[fromStepIdx] || boardSteps[0];
  const toStep = boardSteps[toStepIdx] || boardSteps[0];

  const p1Pos = playerNum === 1 ? toStepIdx : gameState.players[1].pos;
  const p2Pos = playerNum === 2 ? toStepIdx : gameState.players[2].pos;
  const targetOffsetX = (p1Pos === p2Pos) ? (playerNum === 1 ? -0.55 : 0.55) : 0;

  const startX = pawn.position.x;
  const startY = pawn.position.y;
  const startZ = pawn.position.z;

  const targetX = toStep.pos3D.x + targetOffsetX;
  const targetY = toStep.pos3D.y + 0.3;
  const targetZ = toStep.pos3D.z;

  const arcHeight = 1.8;
  const duration = 320;
  const startTime = performance.now();

  function animateHop(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1.0);

    // Linear translation on X and Z
    pawn.position.x = startX + (targetX - startX) * progress;
    pawn.position.z = startZ + (targetZ - startZ) * progress;

    // Parabolic vertical hop
    const currentBaseY = startY + (targetY - startY) * progress;
    pawn.position.y = currentBaseY + Math.sin(progress * Math.PI) * arcHeight;

    // Slight forward pitch rotation in direction of motion
    const dx = targetX - startX;
    const dz = targetZ - startZ;
    if (progress < 0.5) {
      pawn.rotation.x = dz * 0.15;
      pawn.rotation.z = -dx * 0.15;
    } else {
      pawn.rotation.x = dz * (1 - progress) * 0.3;
      pawn.rotation.z = -dx * (1 - progress) * 0.3;
    }

    if (progress < 1.0) {
      requestAnimationFrame(animateHop);
    } else {
      pawn.position.set(targetX, targetY, targetZ);
      pawn.rotation.set(0, 0, 0);

      // Squash and rebound bounce
      pawn.scale.set(1.15, 0.85, 1.15);
      setTimeout(() => pawn.scale.set(1, 1, 1), 120);

      if (onComplete) onComplete();
    }
  }

  requestAnimationFrame(animateHop);
}

// ------------------------------------------------------------
// Animated Waterfalls & Splash Particles
// ------------------------------------------------------------
function setupWaterfallSystem() {
  const waterGroup = new THREE.Group();

  // Water Material (Translucent glowing cyan)
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.88,
    roughness: 0.1,
    metalness: 0.3,
    emissive: 0x0284c7,
    emissiveIntensity: 0.25
  });

  // Waterfall 1: Right cliff cascade
  const wfGeom1 = new THREE.PlaneGeometry(3.5, 14, 1, 12);
  const wfMesh1 = new THREE.Mesh(wfGeom1, waterMat);
  wfMesh1.position.set(22.5, -4.5, -4.0);
  wfMesh1.rotation.y = -Math.PI / 2.2;
  waterGroup.add(wfMesh1);

  // Waterfall 2: Front-left tributary
  const wfGeom2 = new THREE.PlaneGeometry(2.5, 12, 1, 10);
  const wfMesh2 = new THREE.Mesh(wfGeom2, waterMat);
  wfMesh2.position.set(-18.5, -3.8, 15.5);
  wfMesh2.rotation.y = Math.PI / 3;
  waterGroup.add(wfMesh2);

  // Mist Particles at Bottom
  const particleCount = 75;
  const particleGeom = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = 22.0 + (Math.random() - 0.5) * 4;
    particlePositions[i + 1] = -12.0 + Math.random() * 4;
    particlePositions[i + 2] = -4.0 + (Math.random() - 0.5) * 4;
  }
  particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0xbae6fd, size: 0.45, transparent: true, opacity: 0.6 });
  waterfallParticles = new THREE.Points(particleGeom, particleMat);
  waterGroup.add(waterfallParticles);

  islandScene.add(waterGroup);
}

// ------------------------------------------------------------
// Scenic Vegetation (Pine Trees, Round Canopies, Rocks)
// ------------------------------------------------------------
function buildScenicVegetation() {
  const foliageGroup = new THREE.Group();
  const pineFoliageMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.9, flatShading: true });
  const pineWoodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const roundTreeMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.85, flatShading: true });

  const treeCoords = [
    { x: -20, z: 4, type: 'pine', s: 1.1 },
    { x: -21, z: 8, type: 'round', s: 1.3 },
    { x: -18, z: -10, type: 'pine', s: 1.4 },
    { x: -16, z: -15, type: 'round', s: 1.0 },
    { x: -8, z: -18, type: 'pine', s: 1.3 },
    { x: 8, z: -18, type: 'round', s: 1.2 },
    { x: 17, z: -15, type: 'pine', s: 1.5 },
    { x: 21, z: -9, type: 'round', s: 1.2 },
    { x: 20, z: 6, type: 'pine', s: 1.3 },
    { x: 18, z: 12, type: 'round', s: 1.1 },
    { x: -6, z: 17, type: 'pine', s: 1.0 },
    { x: 8, z: 17, type: 'pine', s: 1.2 },
    { x: -11, z: -1, type: 'round', s: 0.9 },
    { x: 9, z: 3, type: 'pine', s: 1.1 },
    { x: -8, z: 7, type: 'round', s: 0.95 }
  ];

  treeCoords.forEach((t) => {
    const tree = new THREE.Group();
    tree.position.set(t.x, 2.5, t.z);
    tree.scale.set(t.s, t.s, t.s);

    // Trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.9, 8), pineWoodMat);
    trunk.position.y = 0.45;
    tree.add(trunk);

    if (t.type === 'pine') {
      for (let i = 0; i < 3; i++) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.85 - i * 0.18, 1.0, 7), pineFoliageMat);
        cone.position.y = 1.0 + i * 0.55;
        cone.castShadow = true;
        tree.add(cone);
      }
    } else {
      const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 1), roundTreeMat);
      puff.position.y = 1.4;
      puff.castShadow = true;
      tree.add(puff);
    }

    foliageGroup.add(tree);
  });

  islandScene.add(foliageGroup);
}

// ------------------------------------------------------------
// Raycasting & Mouse Interaction
// ------------------------------------------------------------
function onIslandMouseMove(e) {
  const canvas = document.getElementById('board-3d-canvas');
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, islandCamera);
  const hits = raycaster.intersectObjects([...stationInteractiveMeshes, ...stoneInteractiveMeshes], true);

  const hoverBadge = document.getElementById('island-hover-badge');
  const hoverText = document.getElementById('island-hover-text');

  if (hits.length > 0) {
    const hitObj = hits[0].object;
    canvas.style.cursor = 'pointer';

    if (hitObj.userData.isStation) {
      if (hoverBadge && hoverText) {
        hoverText.textContent = `Station ${hitObj.userData.stationId}: ${hitObj.userData.title}`;
        hoverBadge.classList.remove('hidden');
      }
      showTileInfoByName(hitObj.userData.title);
    } else if (hitObj.userData.isStone) {
      if (hoverBadge && hoverText) {
        hoverText.textContent = hitObj.userData.title;
        hoverBadge.classList.remove('hidden');
      }
      showTileInfo(hitObj.userData.stepIdx);
    }
  } else {
    canvas.style.cursor = 'grab';
    if (hoverBadge) hoverBadge.classList.add('hidden');
  }
}

function onIslandCanvasClick(e) {
  const canvas = document.getElementById('board-3d-canvas');
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, islandCamera);
  const hits = raycaster.intersectObjects(stationInteractiveMeshes, true);

  if (hits.length > 0) {
    const hitObj = hits[0].object;
    if (hitObj.userData.isStation) {
      audio.playLand();
      openStationModal(hitObj.userData.stationId);
    }
  }
}

function onIslandWindowResize() {
  const canvas = document.getElementById('board-3d-canvas');
  if (!canvas || !islandCamera || !islandRenderer) return;

  const width = canvas.parentElement ? canvas.parentElement.clientWidth : 1000;
  const height = canvas.parentElement ? canvas.parentElement.clientHeight : 600;

  islandCamera.aspect = width / height;
  islandCamera.updateProjectionMatrix();
  islandRenderer.setSize(width, height);
}

// ------------------------------------------------------------
// Smooth Camera Glide Controls
// ------------------------------------------------------------
window.resetIslandCamera = function(view) {
  if (!islandCamera || !islandControls) return;

  let targetPos = new THREE.Vector3(0, 32, 38);
  let lookTarget = new THREE.Vector3(0, 3.2, 0);

  if (view === 'academy') {
    targetPos.set(0, 14, 18);
    lookTarget.set(0, 4.0, 0);
  } else if (view === 'crystal') {
    targetPos.set(0, 19, 2);
    lookTarget.set(0, 7.5, -17.5);
  }

  cameraTransition = {
    startPos: islandCamera.position.clone(),
    endPos: targetPos,
    startTarget: islandControls.target.clone(),
    endTarget: lookTarget,
    startTime: performance.now(),
    duration: 800
  };
};

// ------------------------------------------------------------
// 60FPS Main Animation Loop
// ------------------------------------------------------------
function animateIslandScene(now) {
  requestAnimationFrame(animateIslandScene);

  const t = now * 0.001;

  // OrbitControls update
  if (islandControls) islandControls.update();

  // Smooth camera glide
  if (cameraTransition) {
    const elapsed = now - cameraTransition.startTime;
    const progress = Math.min(elapsed / cameraTransition.duration, 1.0);
    const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

    islandCamera.position.lerpVectors(cameraTransition.startPos, cameraTransition.endPos, ease);
    islandControls.target.lerpVectors(cameraTransition.startTarget, cameraTransition.endTarget, ease);

    if (progress >= 1.0) cameraTransition = null;
  }

  // Animate Levitating Science Crystal
  if (crystalMesh) {
    crystalMesh.rotation.y += 0.015;
    crystalMesh.position.y = 4.2 + Math.sin(t * 2.2) * 0.35;
  }
  if (crystalHaloMesh) {
    crystalHaloMesh.rotation.z += 0.02;
    crystalHaloMesh.position.y = 4.2 + Math.sin(t * 2.2) * 0.35;
  }

  // Animate Atomic Orbital Rings inside Science Academy Dome
  academyRings.forEach((r) => {
    r.mesh.rotation.z += r.speed;
  });

  // Animate Dynamic Scene Props
  animatedSceneProps.forEach((p) => p.update(t));

  // Animate Waterfall Mist Particles
  if (waterfallParticles) {
    const pos = waterfallParticles.geometry.attributes.position.array;
    for (let i = 1; i < pos.length; i += 3) {
      pos[i] += 0.04;
      if (pos[i] > -8.0) pos[i] = -14.0;
    }
    waterfallParticles.geometry.attributes.position.needsUpdate = true;
  }

  if (islandRenderer && islandScene && islandCamera) {
    islandRenderer.render(islandScene, islandCamera);
  }
}

function showTileInfoByName(title) {
  const readout = document.getElementById('board-info-readout');
  if (readout) {
    readout.innerHTML = `
      <span class="text-cyan-400 font-bold">Inspection:</span>
      <span class="text-white ml-1 font-semibold">${title}</span>
    `;
  }
}

function showTileInfo(stepIdx) {
  const step = boardSteps[stepIdx];
  if (!step) return;
  const readout = document.getElementById('board-info-readout');
  if (readout) {
    readout.innerHTML = `
      <span class="text-cyan-400 font-bold">Tile ${step.step}:</span>
      <span class="text-white ml-1 font-semibold">${step.title}</span>
    `;
  }
}

function renderBoard() {
  init3DFloatingIsland();
  updateBadgesRack();
  updateHUD();
}

function updateHUD() {
  const p1 = gameState.players[1];
  const p2 = gameState.players[2];

  // Left Panel (Blue)
  const p1XP = document.getElementById('blue-panel-xp');
  const p1Pos = document.getElementById('blue-panel-pos');
  const p1Btn = document.getElementById('blue-roll-btn');
  const curTile1 = boardSteps[p1.pos];

  if (p1XP) p1XP.textContent = `${p1.xp} XP`;
  if (p1Pos && curTile1) p1Pos.textContent = `Tile ${curTile1.step}: ${curTile1.title}`;
  if (p1Btn) {
    p1Btn.disabled = gameState.activePlayer !== 1 || gameState.isRolling;
    p1Btn.className = gameState.activePlayer === 1 && !gameState.isRolling
      ? 'w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-sm shadow-lg shadow-cyan-500/30 hover:brightness-110 flex items-center justify-center space-x-2 cursor-pointer'
      : 'w-full py-3.5 rounded-xl bg-slate-800 text-slate-500 font-bold text-sm cursor-not-allowed flex items-center justify-center space-x-2';
  }

  // Right Panel (Red)
  const p2XP = document.getElementById('red-panel-xp');
  const p2Pos = document.getElementById('red-panel-pos');
  const p2Btn = document.getElementById('red-roll-btn');
  const curTile2 = boardSteps[p2.pos];

  if (p2XP) p2XP.textContent = `${p2.xp} XP`;
  if (p2Pos && curTile2) p2Pos.textContent = `Tile ${curTile2.step}: ${curTile2.title}`;
  if (p2Btn) {
    p2Btn.disabled = gameState.activePlayer !== 2 || gameState.isRolling;
    p2Btn.className = gameState.activePlayer === 2 && !gameState.isRolling
      ? 'w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-black text-sm shadow-lg shadow-rose-500/30 hover:brightness-110 flex items-center justify-center space-x-2 cursor-pointer'
      : 'w-full py-3.5 rounded-xl bg-slate-800 text-slate-500 font-bold text-sm cursor-not-allowed flex items-center justify-center space-x-2';
  }

  // Active Turn Banner
  const turnBanner = document.getElementById('active-turn-banner');
  if (turnBanner) {
    if (gameState.activePlayer === 1) {
      turnBanner.innerHTML = `<span class="px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-mono font-bold text-xs animate-pulse">🔵 BLUE TEAM'S TURN TO ROLL</span>`;
    } else {
      turnBanner.innerHTML = `<span class="px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400 font-mono font-bold text-xs animate-pulse">🔴 RED TEAM'S TURN TO ROLL</span>`;
    }
  }

  updateBadgesRack();
}

function updateBadgesRack() {
  const rack = document.getElementById('badges-container');
  if (!rack) return;

  const allBadges = [
    { name: 'Particle Pioneer', icon: 'fa-atom', color: '#a855f7' },
    { name: 'State Master', icon: 'fa-snowflake', color: '#00d2ff' },
    { name: 'Thermal Sage', icon: 'fa-fire-burner', color: '#f97316' },
    { name: 'Kinetic Guru', icon: 'fa-brain', color: '#10b981' },
    { name: 'Water Warrior', icon: 'fa-cloud-showers-heavy', color: '#06b6d4' },
    { name: 'Atom Builder', icon: 'fa-circle-nodes', color: '#6366f1' },
    { name: 'Formula Finder', icon: 'fa-flask', color: '#ec4899' },
    { name: 'Mixture Master', icon: 'fa-filter', color: '#eab308' },
    { name: 'Science Champion', icon: 'fa-trophy', color: '#ffd700' }
  ];

  const unlocked = [...gameState.players[1].badges, ...gameState.players[2].badges];

  rack.innerHTML = allBadges.map((b) => {
    const isUnlocked = unlocked.includes(b.name);
    return `
      <div class="badge-chip ${isUnlocked ? 'unlocked' : 'locked'} flex flex-col items-center p-2 rounded-xl bg-slate-900 border border-slate-700 min-w-[85px]">
        <div class="w-7 h-7 rounded-full flex items-center justify-center text-white mb-1" style="background-color: ${b.color};">
          <i class="fa-solid ${b.icon} text-xs"></i>
        </div>
        <span class="text-[9px] font-bold text-center text-slate-200 leading-tight">${b.name}</span>
      </div>
    `;
  }).join('');
}

// ------------------------------------------------------------
// 6. Dice Rolling & Visible Step-by-Step Pawn Hopping
// ------------------------------------------------------------
window.rollDiceForPlayer = function(playerNum) {
  if (gameState.isRolling || gameState.activePlayer !== playerNum) return;
  gameState.isRolling = true;
  updateHUD();

  audio.playDiceRoll();

  const diceEl = document.getElementById(playerNum === 1 ? 'blue-dice-cube' : 'red-dice-cube');
  if (diceEl) diceEl.classList.add('rolling');

  let rollCount = 0;
  const rollInterval = setInterval(() => {
    const randomNum = Math.floor(Math.random() * 6) + 1;
    if (diceEl) diceEl.textContent = randomNum;
    rollCount++;
    if (rollCount > 9) {
      clearInterval(rollInterval);
      if (diceEl) diceEl.classList.remove('rolling');
      const finalRoll = Math.floor(Math.random() * 6) + 1;
      if (diceEl) diceEl.textContent = finalRoll;

      animatePawnStepMovement(playerNum, finalRoll);
    }
  }, 60);
};

function animatePawnStepMovement(playerNum, steps) {
  const player = gameState.players[playerNum];
  let targetStep = player.pos + steps;
  if (targetStep >= boardSteps.length) targetStep = boardSteps.length - 1;

  let currentStep = player.pos;

  function takeNextHop() {
    if (currentStep < targetStep) {
      const from = currentStep;
      const to = currentStep + 1;
      currentStep = to;
      player.pos = to;

      audio.playPawnHop();
      updateHUD();
      showTileInfo(to);

      hopPawn3D(playerNum, from, to, () => {
        setTimeout(takeNextHop, 80);
      });
    } else {
      // Arrived at destination tile
      audio.playLand();
      gameState.isRolling = false;
      updateHUD();
      updatePlayerPawns3D();

      const landedTile = boardSteps[player.pos];

      // Handle tile events
      if (landedTile.type === 'hub' || landedTile.type === 'crystal') {
        setTimeout(() => openStationModal(landedTile.stationId), 500);
      } else if (landedTile.type === 'star') {
        player.xp += 20;
        audio.playCorrect();
        confetti.burst(60);
        alert(`⭐ Star Space! ${player.name} gained +20 Bonus XP!`);
        gameState.activePlayer = gameState.activePlayer === 1 ? 2 : 1;
        updateHUD();
      } else if (landedTile.type === 'power') {
        player.doublePoints = true;
        audio.playLand();
        alert(`⚡ Power Space! Double Points activated for ${player.name} on their next challenge!`);
        gameState.activePlayer = gameState.activePlayer === 1 ? 2 : 1;
        updateHUD();
      } else {
        // Normal space - turn passes to next team
        gameState.activePlayer = gameState.activePlayer === 1 ? 2 : 1;
        updateHUD();
      }
    }
  }

  takeNextHop();
}

// ------------------------------------------------------------
// 7. Split-Screen Head-to-Head Duel Modal (Image 2 style)
// ------------------------------------------------------------
const duelQuestions = {
  1: {
    station: 'Materials and Their Structure',
    q: 'Why does a solid material like diamond or iron maintain a definite, rigid shape that resists compression, whereas liquids and gases flow?',
    options: [
      'Particles in solids are loosely packed and free to drift anywhere',
      'Particles in solids are tightly packed in a regular lattice with strong bonds, vibrating only in fixed positions',
      'Solid materials contain zero microscopic particles',
      'Solid particles lose all their mass when cooled'
    ],
    correct: 1,
    explanation: 'In solid materials, microscopic particles are locked into a tightly packed crystalline lattice with strong attractive forces, vibrating about fixed positions so the material preserves a rigid shape and volume.'
  },
  2: {
    station: 'Solids, Liquids and Gases',
    q: 'Why do solids possess a definite, fixed shape whereas liquids take the shape of their container?',
    options: [
      'Liquid particles are locked in fixed positions',
      'Solid particles vibrate in fixed crystal points; liquid particles slide past one another',
      'Gases have higher density than liquids',
      'Liquids have zero intermolecular attractive forces'
    ],
    correct: 1,
    explanation: 'Particles in solids are bound tightly in fixed crystal positions, while liquids have enough energy to slide past one another.'
  },
  3: {
    station: 'Changes of State',
    q: 'During the melting of ice at 0°C, why does the thermometer not show any temperature increase until all ice has completely melted?',
    options: [
      'The thermometer is defective',
      'Energy is absorbed as Latent Heat of Fusion to overcome lattice bonds',
      'Ice blocks thermal heat conductivity',
      'Water molecules destroy thermal heat'
    ],
    correct: 1,
    explanation: 'Latent Heat of Fusion: Thermal energy breaks intermolecular crystal bonds rather than accelerating molecular speed.'
  },
  4: {
    station: 'Explaining Changes of State',
    q: 'Why does a liquid turn into a gas when heated?',
    options: [
      'Particles become larger in size',
      'Particles gain thermal energy, move faster, and are further apart',
      'Particles lose their mass',
      'Particles change colour'
    ],
    correct: 1,
    explanation: 'When thermal heat is added, liquid particles absorb kinetic energy, moving with high speed to overcome intermolecular attractions and spread far apart as a gas.'
  },
  5: {
    station: 'The Water Cycle',
    q: 'Which two processes transport liquid water upward into the atmosphere as water vapor?',
    options: [
      'Precipitation & Surface Runoff',
      'Evaporation (from water bodies) & Transpiration (from plant leaves)',
      'Condensation & Ground Infiltration',
      'Sublimation & Subterranean Water Aquifers'
    ],
    correct: 1,
    explanation: 'Evaporation from surface water bodies and Transpiration from plant leaves drive moisture upward into the atmosphere.'
  },
  6: {
    station: 'Atoms & Periodic Table',
    q: 'A neutral Carbon-12 atom has 6 Protons and 6 Neutrons. How many Electrons orbit its shells?',
    options: ['12 Electrons', '6 Electrons (2 in K-shell, 4 in L-shell)', '8 Electrons', '0 Electrons'],
    correct: 1,
    explanation: 'Neutral atoms have equal protons and electrons (Z=6). Electronic configuration is 2, 4.'
  },
  7: {
    station: 'Compounds & Formulae',
    q: 'What is the exact chemical stoichiometric ratio of atoms in a single molecule of Water ($H_2O$)?',
    options: [
      '1 Hydrogen atom and 2 Oxygen atoms',
      '2 Hydrogen atoms chemically bonded to 1 Oxygen atom',
      '2 Helium atoms and 1 Oxygen atom',
      'Equal loose mixture of atoms'
    ],
    correct: 1,
    explanation: 'Water is a pure chemical compound consisting of 2 Hydrogen atoms covalently bonded to 1 Oxygen atom.'
  },
  8: {
    station: 'Compounds & Mixtures',
    q: 'To separate a mixture of magnetic iron filings, insoluble sand, and soluble salt, what is the correct scientific sequence?',
    options: [
      'Evaporate first, then filter, then use magnet',
      'Use Magnet ➔ Add water & Filter sand ➔ Evaporate water for pure salt crystals',
      'Boil everything at 500°C directly',
      'Dissolve iron in acid'
    ],
    correct: 1,
    explanation: 'Extract ferromagnetic iron first, filter insoluble sand from the solution, then evaporate water to crystallize pure salt.'
  },
  9: {
    station: 'SCIENCE CRYSTAL CITADEL',
    q: 'Which statement accurately differentiates a Pure Compound from a Mixture?',
    options: [
      'Compounds are physically mixed; mixtures are chemically bonded',
      'Compounds have fixed chemical ratios; mixtures can be separated by physical methods',
      'Compounds only exist in gaseous form',
      'Mixtures possess brand new chemical formulas'
    ],
    correct: 1,
    explanation: 'Compounds consist of elements chemically combined in fixed proportions; mixtures contain physically mixed substances.'
  }
};

// ============================================================
// CRYSTAL SPOT: 3-CATEGORY DRAG & DROP STATES OF MATTER TRIAL
// (Solid, Liquid, Gas Particle & Everyday Object Classification)
// ============================================================
let crystalGameState = null;

function resetCrystalGameState() {
  crystalGameState = {
    activePlayer: gameState.activePlayer || 1,
    selectedItemId: null,
    lastErrorItemId: null,
    scores: { 1: 0, 2: 0 },
    feedback: {
      text: 'Drag or click an item below into its correct state. Wrong drops pass your turn!',
      type: 'info'
    },
    sorted: {
      solid: [],
      liquid: [],
      gas: []
    },
    pool: [
      {
        id: 'ice_cubes',
        name: 'Ice Cubes',
        icon: '🧊',
        img: 'assets/pic_ice_cubes.jpg',
        category: 'solid',
        tag: 'SOLID',
        desc: 'Rigid shape, tightly packed hexagonal lattice bonds',
        hint: 'Maintains fixed shape below 0°C'
      },
      {
        id: 'glass_water',
        name: 'Glass of Water',
        icon: '🥛',
        img: 'assets/pic_glass_water.jpg',
        category: 'liquid',
        tag: 'LIQUID',
        desc: 'Fills bottom of tumbler, takes container shape, flows freely',
        hint: 'Fixed volume with fluid sliding molecules'
      },
      {
        id: 'steam_vapor',
        name: 'Steam / Vapor Cloud',
        icon: '☁️',
        img: 'assets/pic_steam_vapor.jpg',
        category: 'gas',
        tag: 'GAS',
        desc: 'Water vapor expanding into the atmosphere above 100°C',
        hint: 'High-speed molecules spread out to fill any volume'
      },
      {
        id: 'diamond',
        name: 'Diamond Crystal',
        icon: '💎',
        img: 'assets/pic_diamond.jpg',
        category: 'solid',
        tag: 'SOLID',
        desc: 'Rigid tetrahedral carbon lattice that strongly resists compression',
        hint: 'Incompressible solid with fixed atomic positions'
      },
      {
        id: 'olive_oil',
        name: 'Olive Oil',
        icon: '🫒',
        img: 'assets/pic_olive_oil.jpg',
        category: 'liquid',
        tag: 'LIQUID',
        desc: 'Viscous fluid with level top surface sliding past each other',
        hint: 'Takes shape of container, flows smoothly'
      },
      {
        id: 'helium_balloon',
        name: 'Helium in Balloon',
        icon: '🎈',
        img: 'assets/pic_helium_balloon.jpg',
        category: 'gas',
        tag: 'GAS',
        desc: 'Atoms bouncing against balloon walls at high velocity',
        hint: 'Expands in all directions to fill the entire container'
      },
      {
        id: 'iron_nail',
        name: 'Iron Nail',
        icon: '🪙',
        img: 'assets/pic_iron_nail.jpg',
        category: 'solid',
        tag: 'SOLID',
        desc: 'Dense metallic lattice that maintains definite volume and shape',
        hint: 'Atoms locked in place vibrating at fixed points'
      },
      {
        id: 'honey',
        name: 'Pouring Honey',
        icon: '🍯',
        img: 'assets/pic_honey.jpg',
        category: 'liquid',
        tag: 'LIQUID',
        desc: 'Thick fluid substance that adapts to vessel shape when poured',
        hint: 'Liquid state: flows and adapts without fixed shape'
      },
      {
        id: 'crystalline_solid',
        name: 'Crystalline Solid',
        icon: '❄️',
        img: 'assets/pic_crystalline_solid.jpg',
        category: 'solid',
        tag: 'SOLID',
        desc: 'Atoms bound in a regular repeating grid, vibrating in place',
        hint: 'Microscopic atomic model of a solid crystalline lattice'
      },
      {
        id: 'water_droplet',
        name: 'Water Droplet',
        icon: '💧',
        img: 'assets/pic_water_droplet.jpg',
        category: 'liquid',
        tag: 'LIQUID',
        desc: 'Molecules closely packed together but constantly sliding past one another',
        hint: 'Fixed volume with fluid sliding molecules'
      },
      {
        id: 'carbon_dioxide',
        name: 'Carbon Dioxide',
        icon: '🌫️',
        img: 'assets/pic_carbon_dioxide.jpg',
        category: 'gas',
        tag: 'GAS',
        desc: 'Particles spaced far apart, traveling in straight paths at 500 m/s',
        hint: 'Gas state: easily compressed, fills container volume'
      },
      {
        id: 'milk',
        name: 'Milk',
        icon: '🥛',
        img: 'assets/pic_milk.jpg',
        category: 'liquid',
        tag: 'LIQUID',
        desc: 'Liquid emulsion taking the shape of its glass',
        hint: 'Fixed volume without fixed shape'
      },
      {
        id: 'steam_kettle',
        name: 'Steam from Kettle',
        icon: '🫖',
        img: 'assets/pic_steam_kettle.jpg',
        category: 'gas',
        tag: 'GAS',
        desc: 'Boiling vapor shooting from kettle spout at high kinetic energy',
        hint: 'Gas molecules expanding rapidly into surrounding air'
      },
      {
        id: 'sand',
        name: 'Sand',
        icon: '🏖️',
        img: 'assets/pic_sand.jpg',
        category: 'solid',
        tag: 'SOLID',
        desc: 'Granular solid: each individual sand grain maintains rigid fixed shape and volume',
        hint: 'Even though sand pours, each grain is an incompressible solid'
      }
    ]
  };
}

window.openCrystalSortingActivity = function() {
  if (!crystalGameState) {
    resetCrystalGameState();
  }
  renderCrystalSortingModal();
};

window.renderCrystalSortingModal = function() {
  const modal = document.getElementById('duel-modal');
  if (!modal) return;

  const s = crystalGameState;
  const p1 = gameState.players[1];
  const p2 = gameState.players[2];
  const activeP = gameState.players[s.activePlayer];
  const isP1Turn = s.activePlayer === 1;

  // Helper to render sorted items as small chips
  const renderSortedChips = (items) => {
    if (items.length === 0) return '';
    return items.map(item => `
      <div style="
        display:flex;align-items:center;gap:4px;padding:3px 8px;border-radius:6px;
        font-size:9px;font-weight:800;
        background:${item.placedBy === 1 ? 'rgba(2,132,199,0.3)' : 'rgba(225,29,72,0.3)'};
        color:${item.placedBy === 1 ? '#38bdf8' : '#fb7185'};
        border:1px solid ${item.placedBy === 1 ? '#0284c7' : '#e11d48'};
      ">
        <span>${item.icon}</span>
        <span style="white-space:nowrap;">${item.name}</span>
        <span style="opacity:0.75;font-size:8px;">+50XP</span>
      </div>
    `).join('');
  };

  modal.innerHTML = `
    <div class="crystal-trial-modal" style="
      max-width: 1040px; width: 96vw; max-height: 94vh; overflow-y: auto;
      border-radius: 24px; border: 2.5px solid rgba(139, 92, 246, 0.7);
      background: radial-gradient(circle at 85% 15%, rgba(56, 189, 248, 0.15), transparent 40%),
                  radial-gradient(circle at 15% 15%, rgba(168, 85, 247, 0.2), transparent 40%),
                  linear-gradient(180deg, #0d1b38 0%, #071022 100%);
      box-shadow: 0 0 60px rgba(139, 92, 246, 0.35), 0 25px 70px rgba(0, 0, 0, 0.85);
      position: relative; overflow: hidden;
      font-family: 'Inter', system-ui, sans-serif;
      color: #ffffff;
    ">
      <!-- Ambient Background Layer -->
      <div style="position:absolute;inset:0;opacity:0.2;background:url('assets/crystal_trial_bg.jpg') center/cover no-repeat;pointer-events:none;z-index:0;"></div>

      <!-- Content Layer -->
      <div style="position:relative;z-index:1;padding:14px 18px 18px;">

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- TOP HEADER: Title + Scores + Close                        -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
          
          <!-- Left: Cosmic Orb + Title -->
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="
              width: 50px; height: 50px; border-radius: 50%;
              background: url('assets/ref_planet_orb.png') center/cover no-repeat;
              box-shadow: 0 0 20px rgba(217, 70, 239, 0.7), 0 0 8px rgba(56, 189, 248, 0.8);
              border: 2px solid rgba(255, 255, 255, 0.4);
              flex-shrink: 0;
            "></div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">
                <span style="
                  font-size: 10px; font-weight: 900; padding: 2px 8px; border-radius: 6px;
                  background: linear-gradient(135deg, #f59e0b, #ef4444); color: white;
                  letter-spacing: 0.5px; text-transform: uppercase;
                ">👑 FINAL BOSS CHALLENGE</span>
                <span style="font-size: 11px; color: rgba(255,255,255,0.7); font-weight: 600;">Turn-by-Turn Classification</span>
              </div>
              <h2 style="
                font-size: clamp(16px, 2.2vw, 20px); font-weight: 900; line-height: 1.15;
                letter-spacing: 1px; text-transform: uppercase;
                font-family: 'Fira Code', 'Inter', monospace;
                color: #ffffff;
                text-shadow: 0 0 16px rgba(56, 189, 248, 0.4);
                margin: 0;
              ">
                <span style="color: #ffffff;">THE SCIENCE CRYSTAL:</span>
                <span style="background: linear-gradient(90deg, #38bdf8, #60a5fa, #cbd5e1); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"> STATES OF MATTER TRIAL</span>
              </h2>
            </div>
          </div>

          <!-- Right: Scores + Close -->
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="
              display:flex; align-items:center; gap:8px; padding: 6px 14px; border-radius: 20px;
              background: linear-gradient(135deg, rgba(2, 132, 199, 0.35), rgba(3, 105, 161, 0.2));
              border: 1.5px solid ${isP1Turn ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)'};
              box-shadow: ${isP1Turn ? '0 0 16px rgba(56, 189, 248, 0.5)' : 'none'};
            ">
              <div style="width:24px;height:24px;border-radius:50%;background:#0284c7;display:flex;align-items:center;justify-content:center;color:white;font-size:11px;">
                <i class="fa-solid fa-gem"></i>
              </div>
              <div style="text-align:left;">
                <div style="font-size:9px;color:rgba(255,255,255,0.6);font-weight:700;">Blue Team</div>
                <div style="font-size:13px;font-weight:900;color:#38bdf8;font-family:'Fira Code',monospace;">${s.scores[1]} XP</div>
              </div>
            </div>

            <div style="
              display:flex; align-items:center; gap:8px; padding: 6px 14px; border-radius: 20px;
              background: linear-gradient(135deg, rgba(225, 29, 72, 0.35), rgba(190, 18, 60, 0.2));
              border: 1.5px solid ${!isP1Turn ? '#fb7185' : 'rgba(251, 113, 133, 0.4)'};
              box-shadow: ${!isP1Turn ? '0 0 16px rgba(251, 113, 133, 0.5)' : 'none'};
            ">
              <div style="width:24px;height:24px;border-radius:50%;background:#e11d48;display:flex;align-items:center;justify-content:center;color:white;font-size:11px;">
                <i class="fa-solid fa-fire"></i>
              </div>
              <div style="text-align:left;">
                <div style="font-size:9px;color:rgba(255,255,255,0.6);font-weight:700;">Red Team</div>
                <div style="font-size:13px;font-weight:900;color:#fb7185;font-family:'Fira Code',monospace;">${s.scores[2]} XP</div>
              </div>
            </div>

            <button onclick="closeDuelModal()" style="
              width:34px;height:34px;border-radius:10px;border:1.5px solid rgba(255,255,255,0.2);
              background:rgba(255,255,255,0.08);color:white;cursor:pointer;
              display:flex;align-items:center;justify-content:center;font-size:14px;
              transition:all 0.2s;
            " onmouseover="this.style.background='rgba(239,68,68,0.4)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- TURN BANNER                                                -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div style="
          padding: 8px 16px; border-radius: 20px; margin-bottom: 8px;
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;
          background: ${isP1Turn ? 'linear-gradient(90deg, rgba(2, 132, 199, 0.25), rgba(14, 165, 233, 0.15))' : 'linear-gradient(90deg, rgba(225, 29, 72, 0.25), rgba(244, 63, 94, 0.15))'};
          border: 2px solid ${isP1Turn ? '#0284c7' : '#e11d48'};
          box-shadow: 0 0 16px ${isP1Turn ? 'rgba(2, 132, 199, 0.25)' : 'rgba(225, 29, 72, 0.25)'};
        ">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="
              width: 22px; height: 22px; border-radius: 50%;
              background: ${isP1Turn ? '#0284c7' : '#e11d48'};
              color: white; display: flex; align-items: center; justify-content: center;
              font-size: 12px; font-weight: 900;
            ">!</div>
            <div style="font-size: 11px;">
              <span style="font-weight: 900; text-transform: uppercase; color: ${isP1Turn ? '#38bdf8' : '#fb7185'}; letter-spacing: 0.5px;">
                ${activeP.name.toUpperCase()}'S TURN:
              </span>
              <span style="color: rgba(255,255,255,0.85); margin-left: 6px;">
                Drag or click an item below into its correct state. <strong style="color: #ffd700;">Wrong drops pass your turn!</strong>
              </span>
            </div>
          </div>
          <div style="font-size: 11px; color: rgba(255,255,255,0.6); font-family: 'Fira Code', monospace;">
            Remaining in Pool: <strong style="color: white; font-size: 12px;">${s.pool.length}</strong> items
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- FEEDBACK / ALERT BANNER                                    -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div style="
          padding: 7px 14px; border-radius: 12px; margin-bottom: 8px;
          display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600;
          ${s.feedback.type === 'error'
            ? 'background: rgba(254, 226, 226, 0.95); border: 1.5px solid #ef4444; color: #b91c1c;'
            : s.feedback.type === 'success'
            ? 'background: rgba(220, 252, 231, 0.95); border: 1.5px solid #22c55e; color: #15803d;'
            : 'background: rgba(224, 242, 254, 0.95); border: 1.5px solid #38bdf8; color: #0369a1;'}
        ">
          <span style="font-weight: 900; font-size: 12px;">
            ${s.feedback.type === 'error' ? '✕ |' : s.feedback.type === 'success' ? '✓ |' : 'ℹ |'}
          </span>
          <span>${s.feedback.text}</span>
        </div>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- PHASE TRANSFORMATION TEMPERATURE BAR                       -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div style="
          padding: 6px 14px; border-radius: 12px; margin-bottom: 10px;
          background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08);
        ">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-size:10px;font-weight:800;color:#38bdf8;font-family:'Fira Code',monospace;">❄️ 0°C (Freezing / Solid Point)</span>
            <span style="font-size:10px;font-weight:800;color:rgba(255,255,255,0.7);font-family:'Fira Code',monospace;">Phase Transformations</span>
            <span style="font-size:10px;font-weight:800;color:#fb7185;font-family:'Fira Code',monospace;">🔥 100°C (Boiling / Gas Point)</span>
          </div>
          <div style="
            height: 7px; border-radius: 7px;
            background: linear-gradient(90deg, #0284c7 0%, #06b6d4 25%, #10b981 50%, #f59e0b 75%, #ef4444 100%);
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
            position: relative;
          "></div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- THREE STATE CONTAINERS (SOLID / LIQUID / GAS)              -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;margin-bottom:12px;">
          
          <!-- SOLID ZONE -->
          <div id="zone-solid"
               ondragover="onCrystalZoneDragOver(event)"
               ondragleave="onCrystalZoneDragLeave(event)"
               ondrop="onCrystalZoneDrop(event, 'solid')"
               onclick="clickCategoryZone('solid')"
               class="drop-target-zone"
               style="
                 border-radius: 16px; border: 2px solid rgba(56, 189, 248, 0.5);
                 background: #061226; cursor: pointer; overflow: hidden;
                 transition: all 0.25s; box-shadow: 0 4px 20px rgba(0,0,0,0.4);
               ">
            <div style="position:relative; height: 185px; overflow:hidden;">
              <img src="assets/chamber_solid_exact.jpg" style="width:100%;height:100%;object-fit:cover;" alt="Solid Chamber">
            </div>
            <!-- Sorted Items List in Chamber -->
            <div style="padding: 6px 8px; min-height: 36px; background: rgba(3, 15, 35, 0.85); display: flex; flex-wrap: wrap; gap: 4px; border-top: 1px solid rgba(56, 189, 248, 0.2);">
              ${renderSortedChips(s.sorted.solid)}
              ${s.sorted.solid.length === 0 ? '<div style="width:100%;text-align:center;font-size:10px;color:rgba(255,255,255,0.4);padding:4px;">Drop SOLID items here</div>' : ''}
            </div>
          </div>

          <!-- LIQUID ZONE -->
          <div id="zone-liquid"
               ondragover="onCrystalZoneDragOver(event)"
               ondragleave="onCrystalZoneDragLeave(event)"
               ondrop="onCrystalZoneDrop(event, 'liquid')"
               onclick="clickCategoryZone('liquid')"
               class="drop-target-zone"
               style="
                 border-radius: 16px; border: 2px solid rgba(6, 182, 212, 0.5);
                 background: #061226; cursor: pointer; overflow: hidden;
                 transition: all 0.25s; box-shadow: 0 4px 20px rgba(0,0,0,0.4);
               ">
            <div style="position:relative; height: 185px; overflow:hidden;">
              <img src="assets/chamber_liquid_exact.jpg" style="width:100%;height:100%;object-fit:cover;" alt="Liquid Chamber">
            </div>
            <div style="padding: 6px 8px; min-height: 36px; background: rgba(3, 15, 35, 0.85); display: flex; flex-wrap: wrap; gap: 4px; border-top: 1px solid rgba(6, 182, 212, 0.2);">
              ${renderSortedChips(s.sorted.liquid)}
              ${s.sorted.liquid.length === 0 ? '<div style="width:100%;text-align:center;font-size:10px;color:rgba(255,255,255,0.4);padding:4px;">Drop LIQUID items here</div>' : ''}
            </div>
          </div>

          <!-- GAS ZONE -->
          <div id="zone-gas"
               ondragover="onCrystalZoneDragOver(event)"
               ondragleave="onCrystalZoneDragLeave(event)"
               ondrop="onCrystalZoneDrop(event, 'gas')"
               onclick="clickCategoryZone('gas')"
               class="drop-target-zone"
               style="
                 border-radius: 16px; border: 2px solid rgba(236, 72, 153, 0.5);
                 background: #061226; cursor: pointer; overflow: hidden;
                 transition: all 0.25s; box-shadow: 0 4px 20px rgba(0,0,0,0.4);
               ">
            <div style="position:relative; height: 185px; overflow:hidden;">
              <img src="assets/chamber_gas_exact.jpg" style="width:100%;height:100%;object-fit:cover;" alt="Gas Chamber">
            </div>
            <div style="padding: 6px 8px; min-height: 36px; background: rgba(3, 15, 35, 0.85); display: flex; flex-wrap: wrap; gap: 4px; border-top: 1px solid rgba(236, 72, 153, 0.2);">
              ${renderSortedChips(s.sorted.gas)}
              ${s.sorted.gas.length === 0 ? '<div style="width:100%;text-align:center;font-size:10px;color:rgba(255,255,255,0.4);padding:4px;">Drop GAS items here</div>' : ''}
            </div>
          </div>

        </div>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- BOTTOM ITEM POOL (14 CARDS: 7 COLUMNS X 2 ROWS)            -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div style="
          padding: 10px 14px; border-radius: 16px;
          background: linear-gradient(180deg, rgba(8, 22, 48, 0.95), rgba(4, 12, 28, 0.98));
          border: 1.5px solid rgba(56, 189, 248, 0.35);
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5);
        ">
          <!-- Tray Header -->
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:6px;">
              <i class="fa-solid fa-cube" style="color:#38bdf8;font-size:13px;"></i>
              <span style="font-size:11px;font-weight:900;color:white;letter-spacing:1px;text-transform:uppercase;">ITEMS TO CLASSIFY</span>
              <span style="font-size:10px;color:rgba(255,255,255,0.5);margin-left:4px;">Drag into a category above or Click to select</span>
            </div>
            <div style="display:flex;align-items:center;gap:4px;font-size:10px;color:rgba(255,255,255,0.5);">
              <i class="fa-solid fa-circle-info"></i>
              <span>${s.selectedItemId ? '⭐ Item Selected — Click a chamber above!' : 'Click or Drag any card'}</span>
            </div>
          </div>

          <!-- Cards Grid: exactly 7 columns -->
          ${s.pool.length === 0 ? `
            <div style="padding:16px;text-align:center;background:rgba(34,197,94,0.1);border:1.5px solid #22c55e;border-radius:12px;">
              <div style="font-size:28px;">🎉💎👑</div>
              <h3 style="font-size:16px;font-weight:900;color:#4ade80;margin:4px 0;">ALL 14 OBJECTS ACCURATELY CLASSIFIED!</h3>
              <p style="font-size:11px;color:rgba(255,255,255,0.7);margin-bottom:10px;">Master-level understanding of solids, liquids, and gases demonstrated!</p>
              <button onclick="finishCrystalTrial()" style="
                padding:8px 24px;border-radius:12px;border:none;cursor:pointer;
                background:linear-gradient(135deg,#f59e0b,#eab308);color:#0f172a;
                font-weight:900;font-size:13px;box-shadow:0 4px 15px rgba(245,158,11,0.5);
              ">
                Claim Science Crystal & Final Victory!
              </button>
            </div>
          ` : `
            <div style="display:grid;grid-template-columns:repeat(7, 1fr);gap:6px;">
              ${s.pool.map(item => {
                const isSelected = (s.selectedItemId === item.id);
                const isError = (s.lastErrorItemId === item.id);
                const badgeBg = item.category === 'solid' ? '#0070f3' : item.category === 'liquid' ? '#00b4d8' : '#e63973';
                return `
                  <div draggable="true"
                       ondragstart="onCrystalItemDragStart(event, '${item.id}')"
                       onclick="selectCrystalItem('${item.id}')"
                       class="draggable-item-card ${isError ? 'shake-error' : ''}"
                       style="
                         border-radius: 10px; cursor: grab; overflow: hidden;
                         background: ${isSelected ? 'linear-gradient(180deg, rgba(245,158,11,0.2), rgba(10,25,50,0.95))' : 'linear-gradient(180deg, rgba(14,35,70,0.9), rgba(8,20,45,0.95))'};
                         border: 1.5px solid ${isSelected ? '#f59e0b' : isError ? '#ef4444' : 'rgba(56, 189, 248, 0.35)'};
                         box-shadow: ${isSelected ? '0 0 14px rgba(245,158,11,0.6)' : '0 2px 6px rgba(0,0,0,0.3)'};
                         transition: all 0.2s;
                         display: flex; flex-direction: column; align-items: center;
                         text-align: center;
                       ">
                    <!-- Item Image -->
                    <div style="width:100%;height:56px;background:rgba(0,0,0,0.3);overflow:hidden;">
                      <img src="${item.img}" style="width:100%;height:100%;object-fit:cover;" alt="${item.name}">
                    </div>
                    <!-- Item Name -->
                    <div style="font-size:10px;font-weight:800;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;padding:4px 4px 2px;">
                      ${item.name}
                    </div>
                    <!-- Pill Badge -->
                    <div style="padding-bottom:5px;">
                      <span style="
                        display:inline-block;padding:1px 8px;border-radius:8px;
                        font-size:8px;font-weight:900;
                        background:${badgeBg};color:white;
                        letter-spacing:0.5px;
                      ">${item.tag}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

window.onCrystalItemDragStart = function(e, itemId) {
  e.dataTransfer.setData('text/plain', itemId);
  if (crystalGameState) {
    crystalGameState.selectedItemId = itemId;
    crystalGameState.lastErrorItemId = null;
  }
};

window.onCrystalZoneDragOver = function(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
};

window.onCrystalZoneDragLeave = function(e) {
  e.currentTarget.classList.remove('drag-over');
};

window.onCrystalZoneDrop = function(e, targetCategory) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const itemId = e.dataTransfer.getData('text/plain') || (crystalGameState ? crystalGameState.selectedItemId : null);
  if (itemId) {
    dropCrystalItem(itemId, targetCategory);
  }
};

window.selectCrystalItem = function(itemId) {
  if (!crystalGameState) return;
  crystalGameState.selectedItemId = (crystalGameState.selectedItemId === itemId) ? null : itemId;
  crystalGameState.lastErrorItemId = null;
  renderCrystalSortingModal();
};

window.clickCategoryZone = function(targetCategory) {
  if (!crystalGameState || !crystalGameState.selectedItemId) return;
  dropCrystalItem(crystalGameState.selectedItemId, targetCategory);
};

window.dropCrystalItem = function(itemId, targetCategory) {
  if (!crystalGameState) return;

  const itemIndex = crystalGameState.pool.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return;

  const item = crystalGameState.pool[itemIndex];
  const curP = crystalGameState.activePlayer;
  const opponentP = (curP === 1 ? 2 : 1);
  const curPlayerName = gameState.players[curP].name;
  const opponentName = gameState.players[opponentP].name;

  if (item.category === targetCategory) {
    // 1. Correct Match!
    audio.playCorrect();
    crystalGameState.scores[curP] += 50;
    gameState.players[curP].xp += 50;
    item.placedBy = curP;

    crystalGameState.sorted[targetCategory].push(item);
    crystalGameState.pool.splice(itemIndex, 1);
    crystalGameState.selectedItemId = null;
    crystalGameState.lastErrorItemId = null;

    crystalGameState.feedback = {
      text: `Correct! "${item.name}" is a ${targetCategory.toUpperCase()} (+50 XP)! Turn passed to ${opponentName}!`,
      type: 'success'
    };

    // Alternating turn
    crystalGameState.activePlayer = opponentP;
    updateHUD();

    if (crystalGameState.pool.length === 0) {
      setTimeout(() => finishCrystalTrial(), 600);
    }
  } else {
    // 2. Mismatch ("Wrong drops pass your turn")!
    audio.playError();
    crystalGameState.lastErrorItemId = item.id;
    crystalGameState.selectedItemId = null;

    // Pass turn to opponent immediately!
    crystalGameState.activePlayer = opponentP;

    crystalGameState.feedback = {
      text: `Incorrect! "${item.name}" is a ${item.category.toUpperCase()}, not a ${targetCategory.toUpperCase()}! ${item.hint}. Wrong pass: Turn passed to ${opponentName}!`,
      type: 'error'
    };
  }

  renderCrystalSortingModal();
};

window.finishCrystalTrial = function() {
  const p1Score = crystalGameState.scores[1];
  const p2Score = crystalGameState.scores[2];
  const winnerNum = p1Score >= p2Score ? 1 : 2;
  const winner = gameState.players[winnerNum];

  // Award Science Champion Badge & Grand Bonus
  winner.xp += 250;
  if (!winner.badges.includes('Science Champion')) {
    winner.badges.push('Science Champion');
  }
  updateBadgesRack();
  updateHUD();

  audio.playVictory();
  confetti.burst(300);

  const modal = document.getElementById('duel-modal');
  if (modal) {
    modal.innerHTML = `
      <div class="quest-glass p-8 sm:p-12 rounded-3xl max-w-2xl w-full text-center border-4 border-amber-400 shadow-2xl relative animate-bounce space-y-4 bg-white/95 text-slate-800">
        <div class="text-6xl mb-2">🏆💎👑</div>
        <h2 class="text-3xl sm:text-4xl font-black text-amber-700 glow-gold uppercase font-mono">
          THE SCIENCE CRYSTAL CLAIMED!
        </h2>
        <div class="text-xl font-bold text-slate-900">
          ${winner.name} IS THE GRAND SCIENCE CHAMPION!
        </div>
        <p class="text-sm text-slate-600">
          Successfully completed the States of Matter Particle & Object Classification Arena at the Science Crystal Citadel!
        </p>

        <!-- Final Trial Score Breakdown -->
        <div class="grid grid-cols-2 gap-3 max-w-md mx-auto my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono shadow-xs">
          <div class="p-3 rounded-xl bg-blue-50 border border-cyan-300 text-left">
            <div class="text-[10px] text-blue-700 font-bold">BLUE TEAM</div>
            <div class="text-lg font-black text-blue-900">${crystalGameState.scores[1]} Trial XP</div>
            <div class="text-xs text-slate-500">Total: ${gameState.players[1].xp} XP</div>
          </div>
          <div class="p-3 rounded-xl bg-rose-50 border border-rose-300 text-left">
            <div class="text-[10px] text-rose-700 font-bold">RED TEAM</div>
            <div class="text-lg font-black text-rose-900">${crystalGameState.scores[2]} Trial XP</div>
            <div class="text-xs text-slate-500">Total: ${gameState.players[2].xp} XP</div>
          </div>
        </div>

        <div class="flex items-center justify-center space-x-3 pt-2">
          <button onclick="location.reload()" class="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-base shadow-xl hover:brightness-110">
            <i class="fa-solid fa-rotate mr-2"></i> Play New Quest Match
          </button>
          <button onclick="closeDuelModal()" class="px-6 py-3.5 rounded-2xl bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-bold text-sm border border-slate-300 shadow-sm">
            Inspect 3D Island
          </button>
        </div>
      </div>
    `;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

window.openStationModal = function(stationId) {
  // If station is the Science Crystal Citadel (Station 9 / Final Boss), launch the Drag & Drop States Trial!
  if (stationId === 9) {
    openCrystalSortingActivity();
    return;
  }

  gameState.currentStationId = stationId;
  const qData = duelQuestions[stationId] || duelQuestions[1];
  const stationStep = boardSteps.find(s => s.stationId === stationId) || boardSteps[3];

  const modal = document.getElementById('duel-modal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="quest-glass rounded-3xl max-w-6xl w-full p-4 sm:p-6 border-2 shadow-2xl relative space-y-4 bg-white/95 text-slate-800" style="border-color: ${stationStep.color};">
      
      <!-- Top Bar -->
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div class="flex items-center space-x-3">
          <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md" style="background-color: ${stationStep.color};">
            <i class="fa-solid ${stationStep.icon}"></i>
          </div>
          <div>
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">MISSION ${stationId} HEAD-TO-HEAD DUEL</span>
            <h3 class="text-lg sm:text-xl font-black text-slate-900 font-mono">${stationStep.title}</h3>
          </div>
        </div>

        <!-- Timer -->
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-sm text-blue-700 shadow-xs">
            <i class="fa-regular fa-clock text-cyan-600"></i>
            <span id="duel-countdown-text">30s</span>
          </div>
          <button onclick="closeDuelModal()" class="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 border border-slate-200 flex items-center justify-center transition">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- SPLIT SCREEN HEAD-TO-HEAD DUEL -->
      <div class="duel-arena-split">
        
        <!-- BLUE TEAM PANEL (LEFT) -->
        <div class="quest-glass-blue rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-black text-blue-700 uppercase tracking-wide">BLUE TEAM CHALLENGE:</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-cyan-400 font-bold">WASD KEYS</span>
            </div>
            <p class="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">${qData.q}</p>
          </div>

          <div class="space-y-1.5 pt-2">
            ${qData.options.map((opt, i) => `
              <button onclick="submitDuelAnswer(1, ${i})" class="w-full text-left p-2.5 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-xs font-semibold text-slate-700 hover:border-cyan-500 shadow-xs transition-all flex items-start space-x-2">
                <span class="w-5 h-5 rounded-md bg-blue-100 border border-cyan-400 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">${String.fromCharCode(65 + i)}</span>
                <span>${opt}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- CENTER: 4-STATES OF MATTER KINETIC CRUCIBLE -->
        <div class="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col items-center justify-between p-3 space-y-2 shadow-inner">
          
          <!-- Top Temperature & State HUD -->
          <div class="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono shadow-xs">
            <span id="crucible-temp-readout" class="font-bold text-blue-700">150 K (-123°C)</span>
            <span id="crucible-state-badge" class="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-sky-100 text-cyan-800 border border-cyan-300">
              🧊 SOLID LATTICE
            </span>
            <span class="text-slate-500 text-[10px] font-medium">Matter Crucible</span>
          </div>

          <!-- 3D Three.js Matter Canvas -->
          <div class="relative w-full h-[280px] rounded-xl overflow-hidden border border-slate-200 bg-sky-50">
            <canvas id="duel-track-canvas" class="duel-track-canvas w-full h-full"></canvas>
            <!-- Blue Cryo Beam Overlay -->
            <div id="blue-cryo-beam" class="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-transparent transition-all duration-300 pointer-events-none blur-sm"></div>
            <!-- Red Plasma Beam Overlay -->
            <div id="red-plasma-beam" class="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-4 bg-gradient-to-l from-rose-500 via-amber-400 to-transparent transition-all duration-300 pointer-events-none blur-sm"></div>
          </div>

          <!-- Interactive 4-State Quick Shift Buttons -->
          <div class="w-full grid grid-cols-4 gap-1.5 pt-1">
            <button onclick="setCrucibleMatterState('solid')" id="btn-state-solid" class="p-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 border border-cyan-300 text-cyan-800 text-[11px] font-bold flex flex-col items-center transition-all shadow-xs">
              <span>🧊</span>
              <span class="text-[9px] font-mono">SOLID</span>
            </button>
            <button onclick="setCrucibleMatterState('liquid')" id="btn-state-liquid" class="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-800 text-[11px] font-bold flex flex-col items-center transition-all shadow-xs">
              <span>💧</span>
              <span class="text-[9px] font-mono">LIQUID</span>
            </button>
            <button onclick="setCrucibleMatterState('gas')" id="btn-state-gas" class="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 border border-purple-300 text-purple-800 text-[11px] font-bold flex flex-col items-center transition-all shadow-xs">
              <span>💨</span>
              <span class="text-[9px] font-mono">GAS</span>
            </button>
            <button onclick="setCrucibleMatterState('plasma')" id="btn-state-plasma" class="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-800 text-[11px] font-bold flex flex-col items-center transition-all shadow-xs">
              <span>⚡</span>
              <span class="text-[9px] font-mono">PLASMA</span>
            </button>
          </div>

          <!-- Bottom Beam Clash Control Legend -->
          <div class="w-full flex justify-between items-center px-3 py-1 bg-white rounded-xl border border-slate-200 text-[11px] font-mono shadow-xs">
            <span class="text-blue-700 font-bold">🔵 WASD: Cryo Beam</span>
            <span class="text-slate-500 font-medium">Phase Clash</span>
            <span class="text-rose-700 font-bold">🔴 ↑↓←→: Plasma Beam</span>
          </div>

        </div>

        <!-- RED TEAM PANEL (RIGHT) -->
        <div class="quest-glass-red rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-black text-rose-700 uppercase tracking-wide">RED TEAM CHALLENGE:</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-400 font-bold">ARROW KEYS</span>
            </div>
            <p class="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">${qData.q}</p>
          </div>

          <div class="space-y-1.5 pt-2">
            ${qData.options.map((opt, i) => `
              <button onclick="submitDuelAnswer(2, ${i})" class="w-full text-left p-2.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-xs font-semibold text-slate-700 hover:border-rose-500 shadow-xs transition-all flex items-start space-x-2">
                <span class="w-5 h-5 rounded-md bg-rose-100 border border-rose-400 text-rose-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">${String.fromCharCode(65 + i)}</span>
                <span>${opt}</span>
              </button>
            `).join('')}
          </div>
        </div>

      </div>

      <div id="duel-outcome-box"></div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');

  initMatterCrucible3D();
  startDuelTimer();
};

window.closeDuelModal = function() {
  clearInterval(gameState.timerInterval);
  const modal = document.getElementById('duel-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  gameState.activePlayer = gameState.activePlayer === 1 ? 2 : 1;
  updateHUD();
};

function startDuelTimer() {
  gameState.timerSeconds = 30;
  clearInterval(gameState.timerInterval);

  gameState.timerInterval = setInterval(() => {
    gameState.timerSeconds--;
    const tEl = document.getElementById('duel-countdown-text');
    if (tEl) tEl.textContent = `${gameState.timerSeconds}s`;

    if (gameState.timerSeconds <= 0) {
      clearInterval(gameState.timerInterval);
      audio.playError();
      const outcome = document.getElementById('duel-outcome-box');
      if (outcome) {
        outcome.innerHTML = `
          <div class="p-3 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-bold text-center">
            ⏰ Time Expired! Turn passes to the next team.
          </div>
        `;
      }
      setTimeout(() => closeDuelModal(), 2000);
    }
  }, 1000);
}

window.submitDuelAnswer = function(playerNum, selectedIdx) {
  const qData = duelQuestions[gameState.currentStationId] || duelQuestions[1];
  const stationStep = boardSteps.find(s => s.stationId === gameState.currentStationId) || boardSteps[3];
  const isCorrect = selectedIdx === qData.correct;
  const outcome = document.getElementById('duel-outcome-box');

  clearInterval(gameState.timerInterval);

  if (isCorrect) {
    audio.playCorrect();
    confetti.burst(100);

    const xpEarned = gameState.players[playerNum].doublePoints ? 100 : 50;
    gameState.players[playerNum].xp += xpEarned;
    gameState.players[playerNum].doublePoints = false;

    if (stationStep.badge && !gameState.players[playerNum].badges.includes(stationStep.badge)) {
      gameState.players[playerNum].badges.push(stationStep.badge);
    }

    if (outcome) {
      outcome.innerHTML = `
        <div class="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold text-center animate-bounce">
          🎉 ${playerNum === 1 ? 'BLUE TEAM' : 'RED TEAM'} SOLVED FIRST! +${xpEarned} XP & Badge Unlocked: ${stationStep.badge || 'Science Hero'}!
        </div>
      `;
    }

    if (gameState.players[playerNum].xp >= 2500 || gameState.currentStationId === 9) {
      setTimeout(() => triggerGrandVictory(playerNum), 1500);
      return;
    }

    setTimeout(() => closeDuelModal(), 2200);

  } else {
    audio.playError();
    gameState.players[playerNum].xp = Math.max(0, gameState.players[playerNum].xp - 10);
    if (outcome) {
      outcome.innerHTML = `
        <div class="p-3 rounded-xl bg-rose-500/20 border border-rose-500 text-rose-300 text-xs font-bold text-center">
          ❌ Incorrect Answer (-10 XP). ${qData.explanation}
        </div>
      `;
    }
    setTimeout(() => closeDuelModal(), 2500);
  }

  updateHUD();
};

// ------------------------------------------------------------
// 8. 3D Hover Pod Track Duel in Center
// ------------------------------------------------------------
// ------------------------------------------------------------
// 8. 3D Matter State Kinetic Crucible (Solid, Liquid, Gas, Plasma)
// ------------------------------------------------------------
let crucible3D = {
  currentPhase: 'solid',
  temperature: 150,
  scene: null,
  camera: null,
  renderer: null,
  solidMesh: null,
  liquidMesh: null,
  gasGroup: null,
  plasmaGroup: null,
  containerRings: null,
  gasParticles: []
};

window.setCrucibleMatterState = function(state) {
  crucible3D.currentPhase = state;
  const tempEl = document.getElementById('crucible-temp-readout');
  const badgeEl = document.getElementById('crucible-state-badge');

  ['solid', 'liquid', 'gas', 'plasma'].forEach((s) => {
    const btn = document.getElementById(`btn-state-${s}`);
    if (btn) {
      if (s === state) {
        btn.classList.add('ring-2', 'ring-white', 'scale-105');
      } else {
        btn.classList.remove('ring-2', 'ring-white', 'scale-105');
      }
    }
  });

  if (state === 'solid') {
    crucible3D.temperature = 150;
    if (tempEl) tempEl.textContent = '150 K (-123°C)';
    if (badgeEl) {
      badgeEl.textContent = '🧊 SOLID LATTICE';
      badgeEl.className = 'px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-400';
    }
    audio.playPawnHop();
  } else if (state === 'liquid') {
    crucible3D.temperature = 310;
    if (tempEl) tempEl.textContent = '310 K (37°C)';
    if (badgeEl) {
      badgeEl.textContent = '💧 LIQUID FLUID';
      badgeEl.className = 'px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400';
    }
    audio.playPawnHop();
  } else if (state === 'gas') {
    crucible3D.temperature = 460;
    if (tempEl) tempEl.textContent = '460 K (187°C)';
    if (badgeEl) {
      badgeEl.textContent = '💨 GAS VAPOR';
      badgeEl.className = 'px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-purple-500/20 text-purple-300 border border-purple-400';
    }
    audio.playLand();
  } else if (state === 'plasma') {
    crucible3D.temperature = 4200;
    if (tempEl) tempEl.textContent = '4,200 K (Ionized)';
    if (badgeEl) {
      badgeEl.textContent = '⚡ PLASMA CORE';
      badgeEl.className = 'px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400 animate-pulse';
    }
    audio.playLand();
  }

  // Update Three.js mesh visibilities
  if (crucible3D.solidMesh) crucible3D.solidMesh.visible = (state === 'solid');
  if (crucible3D.liquidMesh) crucible3D.liquidMesh.visible = (state === 'liquid');
  if (crucible3D.gasGroup) crucible3D.gasGroup.visible = (state === 'gas');
  if (crucible3D.plasmaGroup) crucible3D.plasmaGroup.visible = (state === 'plasma');
};

window.fireCryoBeam = function() {
  const beam = document.getElementById('blue-cryo-beam');
  if (beam) {
    beam.style.width = '55%';
    setTimeout(() => { beam.style.width = '0'; }, 350);
  }
  audio.playPawnHop();
  // Shift towards cold states (liquid or solid)
  if (crucible3D.currentPhase === 'plasma') setCrucibleMatterState('gas');
  else if (crucible3D.currentPhase === 'gas') setCrucibleMatterState('liquid');
  else setCrucibleMatterState('solid');
};

window.firePlasmaBeam = function() {
  const beam = document.getElementById('red-plasma-beam');
  if (beam) {
    beam.style.width = '55%';
    setTimeout(() => { beam.style.width = '0'; }, 350);
  }
  audio.playLand();
  // Shift towards hot states (gas or plasma)
  if (crucible3D.currentPhase === 'solid') setCrucibleMatterState('liquid');
  else if (crucible3D.currentPhase === 'liquid') setCrucibleMatterState('gas');
  else setCrucibleMatterState('plasma');
};

function initMatterCrucible3D() {
  const canvas = document.getElementById('duel-track-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  crucible3D.scene = scene;

  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(0, 4, 26);
  camera.lookAt(0, 0, 0);
  crucible3D.camera = camera;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  crucible3D.renderer = renderer;

  // 1. Magnetic Containment Field (Cylindrical Glass & Coils)
  const containerGroup = new THREE.Group();
  scene.add(containerGroup);

  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true, transparent: true, opacity: 0.35 });
  for (let y = -7; y <= 7; y += 3.5) {
    const coil = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.15, 12, 40), ringMat);
    coil.rotation.x = Math.PI / 2;
    coil.position.y = y;
    containerGroup.add(coil);
  }
  crucible3D.containerRings = containerGroup;

  // 2. State 1: SOLID (Crystalline Polyhedral Diamond Lattice)
  const solidGeom = new THREE.IcosahedronGeometry(4.8, 1);
  const solidMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true });
  const solidMesh = new THREE.Mesh(solidGeom, solidMat);
  // Inner nucleus core
  const solidCore = new THREE.Mesh(new THREE.IcosahedronGeometry(3.2, 0), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
  solidMesh.add(solidCore);
  scene.add(solidMesh);
  crucible3D.solidMesh = solidMesh;

  // 3. State 2: LIQUID (Fluid Morphing Water Droplet Sphere)
  const liquidGeom = new THREE.SphereGeometry(4.8, 32, 32);
  const liquidMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, wireframe: true, transparent: true, opacity: 0.85 });
  const liquidMesh = new THREE.Mesh(liquidGeom, liquidMat);
  const innerDrop = new THREE.Mesh(new THREE.SphereGeometry(3.6, 24, 24), new THREE.MeshBasicMaterial({ color: 0x00d2ff }));
  liquidMesh.add(innerDrop);
  liquidMesh.visible = false;
  scene.add(liquidMesh);
  crucible3D.liquidMesh = liquidMesh;

  // 4. State 3: GAS (High-Velocity Energetic Bouncing Particle Cloud)
  const gasGroup = new THREE.Group();
  const particleCount = 80;
  const gasParticles = [];
  const pGeom = new THREE.SphereGeometry(0.35, 8, 8);
  const pMat = new THREE.MeshBasicMaterial({ color: 0xd946ef });

  for (let i = 0; i < particleCount; i++) {
    const pMesh = new THREE.Mesh(pGeom, pMat);
    pMesh.position.set(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12
    );
    pMesh.userData = {
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      vz: (Math.random() - 0.5) * 0.45
    };
    gasGroup.add(pMesh);
    gasParticles.push(pMesh);
  }
  gasGroup.visible = false;
  scene.add(gasGroup);
  crucible3D.gasGroup = gasGroup;
  crucible3D.gasParticles = gasParticles;

  // 5. State 4: PLASMA (Superheated Solar Orb with Lightning Arcs)
  const plasmaGroup = new THREE.Group();
  const plasmaCore = new THREE.Mesh(
    new THREE.SphereGeometry(4.2, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffb703 })
  );
  plasmaGroup.add(plasmaCore);

  // Rotating electromagnetic coronal rings
  const plasmaRing1 = new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.2, 16, 40), new THREE.MeshBasicMaterial({ color: 0xff0055, wireframe: true }));
  const plasmaRing2 = new THREE.Mesh(new THREE.TorusGeometry(7.2, 0.18, 16, 40), new THREE.MeshBasicMaterial({ color: 0xffd700, wireframe: true }));
  plasmaRing1.rotation.x = Math.PI / 3;
  plasmaRing2.rotation.y = Math.PI / 4;
  plasmaGroup.add(plasmaRing1);
  plasmaGroup.add(plasmaRing2);

  plasmaGroup.visible = false;
  scene.add(plasmaGroup);
  crucible3D.plasmaGroup = plasmaGroup;

  // Render Loop
  let clock = 0;
  function animate() {
    requestAnimationFrame(animate);
    clock += 0.04;

    // Solid: High-frequency microscopic crystal vibration
    if (solidMesh.visible) {
      solidMesh.rotation.y += 0.005;
      solidMesh.rotation.x = Math.sin(clock * 8) * 0.04;
      solidMesh.rotation.z = Math.cos(clock * 8) * 0.04;
    }

    // Liquid: Undulating fluid wave wobble
    if (liquidMesh.visible) {
      liquidMesh.rotation.y += 0.01;
      const wave = 1 + Math.sin(clock * 2) * 0.08;
      liquidMesh.scale.set(wave, 1 / wave, wave);
    }

    // Gas: Elastic wall collisions
    if (gasGroup.visible) {
      gasParticles.forEach((p) => {
        p.position.x += p.userData.vx;
        p.position.y += p.userData.vy;
        p.position.z += p.userData.vz;
        if (Math.abs(p.position.x) > 6.5) p.userData.vx *= -1;
        if (Math.abs(p.position.y) > 6.5) p.userData.vy *= -1;
        if (Math.abs(p.position.z) > 6.5) p.userData.vz *= -1;
      });
    }

    // Plasma: Rotating coronal flare rings and solar pulsing
    if (plasmaGroup.visible) {
      plasmaRing1.rotation.z += 0.05;
      plasmaRing2.rotation.x -= 0.04;
      const pScale = 1 + Math.sin(clock * 6) * 0.12;
      plasmaCore.scale.set(pScale, pScale, pScale);
    }

    containerGroup.rotation.y += 0.002;
    renderer.render(scene, camera);
  }
  animate();

  setCrucibleMatterState('solid');
}

// ------------------------------------------------------------
// 9. Power-Ups & Victory
// ------------------------------------------------------------
window.activatePowerUp = function(playerNum, type) {
  if (gameState.activePlayer !== playerNum) {
    alert('You can only activate power-ups on your turn!');
    return;
  }
  if (type === 'double') {
    gameState.players[playerNum].doublePoints = true;
    audio.playLand();
    alert(`⚡ Double Points Activated for ${playerNum === 1 ? 'Blue' : 'Red'} Team on their next duel!`);
  }
};

function triggerGrandVictory(winnerNum) {
  audio.playVictory();
  confetti.burst(300);

  const winner = gameState.players[winnerNum];
  const modal = document.getElementById('duel-modal');
  if (modal) {
    modal.innerHTML = `
      <div class="quest-glass p-8 sm:p-12 rounded-3xl max-w-2xl w-full text-center border-4 border-amber-400 shadow-2xl relative animate-bounce bg-white/95 text-slate-800 space-y-3">
        <div class="text-6xl mb-2">🏆👑💎</div>
        <h2 class="text-3xl sm:text-4xl font-black text-amber-700 glow-gold uppercase font-mono">THE SCIENCE CRYSTAL CLAIMED!</h2>
        <div class="text-xl font-bold text-slate-900 mt-2">
          ${winner.name} IS THE GRAND SCIENCE CHAMPION!
        </div>
        <p class="text-sm text-slate-600 my-3">Completed the ultimate quest across all 8 stations of matter with master-level inquiry!</p>
        <div class="text-3xl font-black font-mono text-blue-700 mb-6">${winner.xp} TOTAL XP EARNED</div>
        <button onclick="location.reload()" class="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-base shadow-xl hover:brightness-110">
          <i class="fa-solid fa-rotate mr-2"></i> Play New Quest Match
        </button>
      </div>
    `;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

// ------------------------------------------------------------
// 10. Key Bindings & Init
// ------------------------------------------------------------
window.addEventListener('keydown', (e) => {
  const modal = document.getElementById('duel-modal');
  const isModalOpen = modal && !modal.classList.contains('hidden');

  // Duel Mode Controls: WASD for Blue Team Cryo Beam & Arrows for Red Team Plasma Beam
  if (isModalOpen) {
    if (e.key === 'w' || e.key === 'W' || e.key === 'a' || e.key === 'A' || e.key === 's' || e.key === 'S' || e.key === 'd' || e.key === 'D') {
      fireCryoBeam();
      return;
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      firePlasmaBeam();
      return;
    }
  }

  // Board Game Mode Controls: A/Space for Blue Roll, L/Enter for Red Roll
  if (e.key === 'a' || e.key === 'A' || e.key === ' ') {
    if (gameState.activePlayer === 1) rollDiceForPlayer(1);
  }
  if (e.key === 'l' || e.key === 'L' || e.key === 'Enter') {
    if (gameState.activePlayer === 2) rollDiceForPlayer(2);
  }

  // Full Screen shortcut: 'f' or 'F' (when not typing in form inputs)
  if ((e.key === 'f' || e.key === 'F') && !isModalOpen && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    toggleFullScreen();
  }
});

// ------------------------------------------------------------
// 11. Full Screen Mode Toggle & Handlers (Matter Masters)
// ------------------------------------------------------------
window.toggleFullScreen = function() {
  const isFullScreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);

  if (!isFullScreen) {
    const docEl = document.documentElement;
    const reqFs = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
    if (reqFs) {
      const res = reqFs.call(docEl);
      if (res && res.catch) {
        res.catch(err => console.warn('Fullscreen request error:', err));
      }
    }
  } else {
    const exitFs = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
    if (exitFs) {
      const res = exitFs.call(document);
      if (res && res.catch) {
        res.catch(err => console.warn('Exit fullscreen error:', err));
      }
    }
  }
};

function updateFullScreenUI() {
  const isFullScreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);

  // Update Header Button UI
  const headerIcon = document.getElementById('header-fullscreen-icon');
  const headerText = document.getElementById('header-fullscreen-text');
  const headerBtn = document.getElementById('header-fullscreen-btn');
  if (headerIcon && headerText) {
    if (isFullScreen) {
      headerIcon.className = 'fa-solid fa-compress text-cyan-600';
      headerText.textContent = 'Exit Full Screen';
      if (headerBtn) headerBtn.title = 'Exit Full Screen (Key F or Esc)';
    } else {
      headerIcon.className = 'fa-solid fa-expand text-cyan-600';
      headerText.textContent = 'Full Screen';
      if (headerBtn) headerBtn.title = 'Toggle Full Screen (Key F)';
    }
  }

  // Update 3D Board Toolbar Button UI
  const boardIcon = document.getElementById('board-fullscreen-icon');
  const boardText = document.getElementById('board-fullscreen-text');
  const boardBtn = document.getElementById('board-fullscreen-btn');
  if (boardIcon && boardText) {
    if (isFullScreen) {
      boardIcon.className = 'fa-solid fa-compress text-[10px]';
      boardText.textContent = 'Exit Full';
      if (boardBtn) boardBtn.title = 'Exit Full Screen (Key F or Esc)';
    } else {
      boardIcon.className = 'fa-solid fa-expand text-[10px]';
      boardText.textContent = 'Full Screen';
      if (boardBtn) boardBtn.title = 'Toggle Full Screen (Key F)';
    }
  }

  // Toggle class on body for responsive layout enhancements
  if (isFullScreen) {
    document.body.classList.add('fullscreen-mode');
  } else {
    document.body.classList.remove('fullscreen-mode');
  }

  // Smoothly recalibrate 3D Three.js WebGL canvas size and aspect ratio
  if (typeof onIslandWindowResize === 'function') {
    onIslandWindowResize();
    setTimeout(onIslandWindowResize, 80);
    setTimeout(onIslandWindowResize, 240);
  }
}

document.addEventListener('fullscreenchange', updateFullScreenUI);
document.addEventListener('webkitfullscreenchange', updateFullScreenUI);
document.addEventListener('mozfullscreenchange', updateFullScreenUI);
document.addEventListener('MSFullscreenChange', updateFullScreenUI);

document.addEventListener('DOMContentLoaded', () => {
  renderBoard();
});
