// ============================================================
// ELEMENTIA — Three.js 3D Scene Manager
// 4 Zones: Matter Manipulation, Atomic Assembly,
//          Water Cycle, Periodic Amphitheater
// ============================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';


import { ELEMENTS, STATES_OF_MATTER } from './game_data.js';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.scenes = {};
    this.activeZone = null;
    this.particles = [];
    this.crystals = [];
    this.waterDroplets = [];
    this.atomMeshes = [];
    this.clock = new THREE.Clock();
    this.temperature = 300; // Kelvin
    this.mixers = [];
    this._starfields = [];

    this._initRenderer();
    this._initScenes();
    this._animate();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    window.addEventListener('resize', () => {
      const w = window.innerWidth, h = window.innerHeight;
      this.renderer.setSize(w, h);
      Object.values(this.scenes).forEach(s => {
        s.camera.aspect = w / h;
        s.camera.updateProjectionMatrix();
        if (s.composer) s.composer.setSize(w, h);
      });
    });
  }

  _createComposer(scene, camera) {
    const composer = new EffectComposer(this.renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.6, 0.4, 0.85
    );
    composer.addPass(bloom);
    return composer;
  }

  // ─────────────────────────────────────────────
  // ZONE 1: MATTER MANIPULATION
  // ─────────────────────────────────────────────
  _buildMatterScene() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060810, 0.015);
    scene.background = new THREE.Color(0x060810);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(0, 12, 28);

    const controls = new OrbitControls(camera, this.canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI * 0.55;
    controls.minDistance = 8;
    controls.maxDistance = 60;
    controls.target.set(0, 2, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x334466, 0.5);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x99bbff, 0.8);
    moonLight.position.set(10, 30, 15);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.set(2048, 2048);
    moonLight.shadow.camera.near = 0.5;
    moonLight.shadow.camera.far = 80;
    moonLight.shadow.camera.left = -30;
    moonLight.shadow.camera.right = 30;
    moonLight.shadow.camera.top = 30;
    moonLight.shadow.camera.bottom = -30;
    scene.add(moonLight);

    const cyanPoint = new THREE.PointLight(0x00f2fe, 1.5, 40);
    cyanPoint.position.set(-8, 8, 5);
    scene.add(cyanPoint);

    const goldPoint = new THREE.PointLight(0xffd700, 1.0, 30);
    goldPoint.position.set(8, 6, -5);
    scene.add(goldPoint);

    // Ground — rocky terrain
    const groundGeo = new THREE.PlaneGeometry(80, 80, 64, 64);
    const posAttr = groundGeo.getAttribute('position');
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i), y = posAttr.getY(i);
      posAttr.setZ(i, Math.sin(x * 0.3) * Math.cos(y * 0.2) * 1.5 + Math.random() * 0.3);
    }
    groundGeo.computeVertexNormals();
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x2a3040,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Frozen river (glass-like plane)
    const riverGeo = new THREE.PlaneGeometry(6, 40, 32, 32);
    const riverPosAttr = riverGeo.getAttribute('position');
    for (let i = 0; i < riverPosAttr.count; i++) {
      riverPosAttr.setZ(i, Math.sin(riverPosAttr.getY(i) * 0.5) * 0.15);
    }
    riverGeo.computeVertexNormals();
    this._riverMat = new THREE.MeshPhysicalMaterial({
      color: 0xa8d8ea,
      roughness: 0.1,
      metalness: 0.0,
      transmission: 0.7,
      thickness: 0.5,
      transparent: true,
      opacity: 0.85,
    });
    const river = new THREE.Mesh(riverGeo, this._riverMat);
    river.rotation.x = -Math.PI / 2;
    river.position.set(0, 0.1, 0);
    river.receiveShadow = true;
    scene.add(river);
    this._river = river;

    // Ice boulders
    this._iceBoulders = [];
    for (let i = 0; i < 8; i++) {
      const size = 0.6 + Math.random() * 1.2;
      const geo = new THREE.IcosahedronGeometry(size, 1);
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0xd0eeff,
        roughness: 0.15,
        metalness: 0.05,
        transmission: 0.5,
        thickness: 0.8,
        transparent: true,
        opacity: 0.7,
        emissive: 0x224488,
        emissiveIntensity: 0.15,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const angle = (i / 8) * Math.PI * 2;
      mesh.position.set(
        Math.cos(angle) * (5 + Math.random() * 8),
        size * 0.5,
        Math.sin(angle) * (3 + Math.random() * 12) - 5
      );
      mesh.castShadow = true;
      scene.add(mesh);
      this._iceBoulders.push(mesh);
    }

    // Rock pillars
    for (let i = 0; i < 5; i++) {
      const geo = new THREE.CylinderGeometry(0.8 + Math.random() * 0.6, 1.2 + Math.random() * 0.8, 3 + Math.random() * 5, 6);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x3a4050 + Math.floor(Math.random() * 0x101010),
        roughness: 0.85,
        metalness: 0.15,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(-15 + Math.random() * 30, (3 + Math.random() * 5) * 0.5, -8 + Math.random() * 16);
      mesh.castShadow = true;
      scene.add(mesh);
    }

    // Particle system for state visualization
    this._matterParticles = this._createParticleSystem(scene, 500, 0x00f2fe);

    // Starfield backdrop
    this._addStarfield(scene);

    const composer = this._createComposer(scene, camera);
    this.scenes.matter = { scene, camera, controls, composer };
  }

  // ─────────────────────────────────────────────
  // ZONE 2: ATOMIC ASSEMBLY / CRUCIBLE
  // ─────────────────────────────────────────────
  _buildAtomicScene() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080412, 0.02);
    scene.background = new THREE.Color(0x080412);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300);
    camera.position.set(0, 6, 18);

    const controls = new OrbitControls(camera, this.canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 2, 0);
    controls.minDistance = 6;
    controls.maxDistance = 40;

    // Lighting — lab ambience
    scene.add(new THREE.AmbientLight(0x221133, 0.6));

    const spotLight = new THREE.SpotLight(0x00f2fe, 2, 40, Math.PI * 0.3, 0.5);
    spotLight.position.set(0, 15, 0);
    spotLight.castShadow = true;
    scene.add(spotLight);

    const magentaLight = new THREE.PointLight(0xff007f, 0.8, 25);
    magentaLight.position.set(-6, 4, 6);
    scene.add(magentaLight);

    const goldLight = new THREE.PointLight(0xffd700, 0.6, 20);
    goldLight.position.set(6, 3, -4);
    scene.add(goldLight);

    // Crucible platform
    const platformGeo = new THREE.CylinderGeometry(5, 6, 1, 32);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x1a1028,
      roughness: 0.6,
      metalness: 0.4,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.5;
    platform.receiveShadow = true;
    scene.add(platform);

    // Glowing ring
    const ringGeo = new THREE.TorusGeometry(5.5, 0.08, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.6 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    scene.add(ring);
    this._crucibleRing = ring;

    // Central atom slots — build the water molecule visually
    this._buildAtomModel(scene);

    // Floating element spheres orbiting
    this._orbitingElements = [];
    const elColors = [0x00f2fe, 0xff5252, 0x90a4ae, 0xffd700, 0x69f0ae, 0xff7043];
    for (let i = 0; i < 12; i++) {
      const geo = new THREE.SphereGeometry(0.25 + Math.random() * 0.2, 16, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: elColors[i % elColors.length],
        emissive: elColors[i % elColors.length],
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.6,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData.orbitRadius = 7 + Math.random() * 4;
      mesh.userData.orbitSpeed = 0.2 + Math.random() * 0.3;
      mesh.userData.orbitOffset = (i / 12) * Math.PI * 2;
      mesh.userData.yOscil = 2 + Math.random() * 3;
      scene.add(mesh);
      this._orbitingElements.push(mesh);
    }

    // Particle dust
    this._atomicParticles = this._createParticleSystem(scene, 300, 0xb388ff);

    this._addStarfield(scene);

    const composer = this._createComposer(scene, camera);
    this.scenes.atomic = { scene, camera, controls, composer };
  }

  _buildAtomModel(scene) {
    this.atomMeshes = [];
    // Oxygen center
    const oGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const oMat = new THREE.MeshPhysicalMaterial({
      color: 0xff5252,
      roughness: 0.2,
      metalness: 0.3,
      emissive: 0xff2222,
      emissiveIntensity: 0.3,
      clearcoat: 0.5,
    });
    const oxygen = new THREE.Mesh(oGeo, oMat);
    oxygen.position.set(0, 3, 0);
    oxygen.castShadow = true;
    scene.add(oxygen);
    this.atomMeshes.push(oxygen);

    // Hydrogen atoms
    const hGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const hMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f2fe,
      roughness: 0.2,
      metalness: 0.3,
      emissive: 0x0088aa,
      emissiveIntensity: 0.3,
      clearcoat: 0.5,
    });
    const h1 = new THREE.Mesh(hGeo, hMat);
    h1.position.set(-1.8, 3.8, 0);
    h1.castShadow = true;
    scene.add(h1);
    this.atomMeshes.push(h1);

    const h2 = new THREE.Mesh(hGeo.clone(), hMat.clone());
    h2.position.set(1.8, 3.8, 0);
    h2.castShadow = true;
    scene.add(h2);
    this.atomMeshes.push(h2);

    // Bond lines
    for (const target of [h1, h2]) {
      const dir = new THREE.Vector3().subVectors(target.position, oxygen.position);
      const len = dir.length();
      const bondGeo = new THREE.CylinderGeometry(0.06, 0.06, len, 8);
      const bondMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.5 });
      const bond = new THREE.Mesh(bondGeo, bondMat);
      const mid = new THREE.Vector3().addVectors(oxygen.position, target.position).multiplyScalar(0.5);
      bond.position.copy(mid);
      bond.lookAt(target.position);
      bond.rotateX(Math.PI / 2);
      scene.add(bond);
    }

    // Electron orbit rings
    for (let i = 0; i < 3; i++) {
      const orbitGeo = new THREE.TorusGeometry(2.0 + i * 0.6, 0.02, 8, 64);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: 0x00f2fe, transparent: true, opacity: 0.15 + i * 0.05,
      });
      const orbit = new THREE.Mesh(orbitGeo, orbitMat);
      orbit.position.copy(oxygen.position);
      orbit.rotation.x = Math.PI * 0.5 + i * 0.3;
      orbit.rotation.z = i * 0.5;
      scene.add(orbit);
    }

    // Labels
    this._createTextSprite(scene, 'O', oxygen.position.clone().add(new THREE.Vector3(0, 1.6, 0)), 0xff5252);
    this._createTextSprite(scene, 'H', h1.position.clone().add(new THREE.Vector3(0, 1.0, 0)), 0x00f2fe);
    this._createTextSprite(scene, 'H', h2.position.clone().add(new THREE.Vector3(0, 1.0, 0)), 0x00f2fe);
  }

  // ─────────────────────────────────────────────
  // ZONE 3: WATER CYCLE
  // ─────────────────────────────────────────────
  _buildWaterCycleScene() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1620, 0.008);
    scene.background = new THREE.Color(0x0a1620);

    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 600);
    camera.position.set(0, 25, 50);

    const controls = new OrbitControls(camera, this.canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 5, 0);
    controls.minDistance = 15;
    controls.maxDistance = 100;

    // Lighting — warm sun + cool sky
    scene.add(new THREE.AmbientLight(0x334455, 0.6));

    const sunLight = new THREE.DirectionalLight(0xffd740, 1.2);
    sunLight.position.set(30, 40, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    scene.add(sunLight);
    this._sunLight = sunLight;

    const skyLight = new THREE.HemisphereLight(0x87ceeb, 0x2a3040, 0.4);
    scene.add(skyLight);

    // Sun sphere
    const sunGeo = new THREE.SphereGeometry(3, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd740 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(30, 40, -30);
    scene.add(sun);
    this._sunMesh = sun;

    // Sun glow
    const sunGlowGeo = new THREE.SphereGeometry(5, 32, 32);
    const sunGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffd740, transparent: true, opacity: 0.15,
    });
    const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
    sunGlow.position.copy(sun.position);
    scene.add(sunGlow);

    // Ocean
    const oceanGeo = new THREE.PlaneGeometry(120, 60, 64, 32);
    const oceanPosAttr = oceanGeo.getAttribute('position');
    for (let i = 0; i < oceanPosAttr.count; i++) {
      oceanPosAttr.setZ(i, Math.sin(oceanPosAttr.getX(i) * 0.1) * 0.3);
    }
    oceanGeo.computeVertexNormals();
    const oceanMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a6890,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.3,
      thickness: 2,
      transparent: true,
      opacity: 0.9,
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(0, 0, 15);
    ocean.receiveShadow = true;
    scene.add(ocean);
    this._ocean = ocean;

    // Mountains
    this._buildMountains(scene);

    // Clouds
    this._clouds = [];
    for (let i = 0; i < 6; i++) {
      const cloudGroup = new THREE.Group();
      for (let j = 0; j < 5; j++) {
        const cGeo = new THREE.SphereGeometry(1.5 + Math.random() * 2, 16, 16);
        const cMat = new THREE.MeshStandardMaterial({
          color: 0xddeeff,
          roughness: 0.9,
          metalness: 0,
          transparent: true,
          opacity: 0.75,
        });
        const cMesh = new THREE.Mesh(cGeo, cMat);
        cMesh.position.set(
          (j - 2) * 2 + Math.random(),
          Math.random() * 1,
          Math.random() * 1.5
        );
        cMesh.scale.y = 0.6;
        cloudGroup.add(cMesh);
      }
      cloudGroup.position.set(-25 + i * 10, 20 + Math.random() * 5, -15 + Math.random() * 10);
      cloudGroup.userData.speed = 0.3 + Math.random() * 0.4;
      scene.add(cloudGroup);
      this._clouds.push(cloudGroup);
    }

    // Water droplets (rain particles)
    this._rainParticles = this._createRainSystem(scene, 800);

    // Evaporation vapour particles
    this._vapourParticles = this._createParticleSystem(scene, 200, 0xffd740, true);

    // River — flowing from mountains to ocean
    const riverGeo2 = new THREE.PlaneGeometry(4, 35, 16, 64);
    const rp = riverGeo2.getAttribute('position');
    for (let i = 0; i < rp.count; i++) {
      const y = rp.getY(i);
      rp.setX(i, rp.getX(i) + Math.sin(y * 0.3) * 1.5);
      rp.setZ(i, y * 0.15);
    }
    riverGeo2.computeVertexNormals();
    const riverMat2 = new THREE.MeshPhysicalMaterial({
      color: 0x26a69a,
      roughness: 0.15,
      transmission: 0.4,
      transparent: true,
      opacity: 0.8,
    });
    const river2 = new THREE.Mesh(riverGeo2, riverMat2);
    river2.rotation.x = -Math.PI / 2;
    river2.position.set(5, 0.3, -3);
    scene.add(river2);

    // Greenery patches
    this._greenPatches = [];
    for (let i = 0; i < 12; i++) {
      const gGeo = new THREE.ConeGeometry(0.8 + Math.random() * 0.8, 2 + Math.random() * 3, 6);
      const gMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.3 + Math.random() * 0.1, 0.6, 0.25 + Math.random() * 0.15),
        roughness: 0.8,
      });
      const tree = new THREE.Mesh(gGeo, gMat);
      tree.position.set(
        -15 + Math.random() * 30,
        (2 + Math.random() * 3) * 0.5 + 0.5,
        -10 + Math.random() * 15
      );
      tree.castShadow = true;
      scene.add(tree);
      this._greenPatches.push(tree);
    }

    this._addStarfield(scene);

    const composer = this._createComposer(scene, camera);
    this.scenes['water-cycle'] = { scene, camera, controls, composer };
  }

  _buildMountains(scene) {
    for (let i = 0; i < 4; i++) {
      const h = 8 + Math.random() * 12;
      const r = 4 + Math.random() * 5;
      const geo = new THREE.ConeGeometry(r, h, 7 + Math.floor(Math.random() * 4));
      const mat = new THREE.MeshStandardMaterial({
        color: 0x3a4a5a + Math.floor(Math.random() * 0x101010),
        roughness: 0.85,
        metalness: 0.1,
      });
      const mountain = new THREE.Mesh(geo, mat);
      mountain.position.set(-20 + i * 12, h * 0.5, -20 + Math.random() * 5);
      mountain.castShadow = true;
      scene.add(mountain);

      // Snow cap
      const snowGeo = new THREE.ConeGeometry(r * 0.35, h * 0.2, 7);
      const snowMat = new THREE.MeshStandardMaterial({
        color: 0xeef4ff,
        roughness: 0.4,
        emissive: 0x445566,
        emissiveIntensity: 0.1,
      });
      const snow = new THREE.Mesh(snowGeo, snowMat);
      snow.position.set(mountain.position.x, h - h * 0.1, mountain.position.z);
      scene.add(snow);
    }
  }

  // ─────────────────────────────────────────────
  // ZONE 4: PERIODIC AMPHITHEATER
  // ─────────────────────────────────────────────
  _buildPeriodicScene() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0814, 0.006);
    scene.background = new THREE.Color(0x0a0814);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(0, 20, 40);

    const controls = new OrbitControls(camera, this.canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 5, 0);
    controls.minDistance = 10;
    controls.maxDistance = 80;

    // Grand lighting
    scene.add(new THREE.AmbientLight(0x1a1030, 0.5));

    const topLight = new THREE.PointLight(0xffffff, 1.0, 80);
    topLight.position.set(0, 35, 0);
    topLight.castShadow = true;
    scene.add(topLight);

    // Amphitheater floor
    const floorGeo = new THREE.CylinderGeometry(30, 32, 1, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x141020,
      roughness: 0.6,
      metalness: 0.3,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    scene.add(floor);

    // Concentric tier rings (amphitheater seating)
    for (let tier = 0; tier < 4; tier++) {
      const innerR = 22 + tier * 3;
      const outerR = innerR + 2.5;
      const tierGeo = new THREE.RingGeometry(innerR, outerR, 64);
      const tierMat = new THREE.MeshStandardMaterial({
        color: 0x1a1430 + tier * 0x060608,
        roughness: 0.7,
        metalness: 0.2,
        side: THREE.DoubleSide,
      });
      const tierMesh = new THREE.Mesh(tierGeo, tierMat);
      tierMesh.rotation.x = -Math.PI / 2;
      tierMesh.position.y = 0.5 + tier * 1.5;
      scene.add(tierMesh);
    }

    // Elemental Crystals — the stars of this scene
    this.crystals = [];
    const crystalElements = ELEMENTS.filter(e => ['H', 'O', 'C', 'Fe', 'Na', 'Au', 'Cu', 'He'].includes(e.symbol));
    const crystalCount = crystalElements.length;

    crystalElements.forEach((el, i) => {
      const angle = (i / crystalCount) * Math.PI * 2 - Math.PI / 2;
      const radius = 15;
      const height = 6 + Math.random() * 4; // 6-10m tall crystals

      // Crystal body — elongated octahedron
      const crystalGeo = new THREE.OctahedronGeometry(1.5, 0);
      crystalGeo.scale(1, height / 3, 1);
      const color = new THREE.Color(el.color);
      const crystalMat = new THREE.MeshPhysicalMaterial({
        color: color,
        roughness: 0.1,
        metalness: 0.4,
        transmission: 0.3,
        thickness: 2,
        transparent: true,
        opacity: 0.85,
        emissive: color,
        emissiveIntensity: 0.4,
        clearcoat: 1.0,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(
        Math.cos(angle) * radius,
        height / 2 + 0.5,
        Math.sin(angle) * radius
      );
      crystal.castShadow = true;
      crystal.userData.element = el;
      crystal.userData.activated = false;
      crystal.userData.baseEmissive = 0.4;
      scene.add(crystal);

      // Crystal point light
      const cLight = new THREE.PointLight(color, 1.0, 12);
      cLight.position.copy(crystal.position).y += height * 0.3;
      scene.add(cLight);
      crystal.userData.light = cLight;

      // Base pedestal
      const pedGeo = new THREE.CylinderGeometry(1.8, 2.2, 0.8, 8);
      const pedMat = new THREE.MeshStandardMaterial({
        color: 0x2a2040,
        roughness: 0.5,
        metalness: 0.5,
      });
      const ped = new THREE.Mesh(pedGeo, pedMat);
      ped.position.set(crystal.position.x, 0.4, crystal.position.z);
      scene.add(ped);

      // Symbol label
      this._createTextSprite(scene, el.symbol, crystal.position.clone().add(new THREE.Vector3(0, height * 0.4, 0)), parseInt(el.color.replace('#', '0x')));

      this.crystals.push(crystal);
    });

    // Central pedestal — where the Muddler stands
    const centerPedGeo = new THREE.CylinderGeometry(3, 3.5, 2, 16);
    const centerPedMat = new THREE.MeshStandardMaterial({
      color: 0x2a1a40,
      roughness: 0.4,
      metalness: 0.5,
      emissive: 0x220044,
      emissiveIntensity: 0.2,
    });
    const centerPed = new THREE.Mesh(centerPedGeo, centerPedMat);
    centerPed.position.y = 1;
    centerPed.receiveShadow = true;
    scene.add(centerPed);

    // Muddler's swirling pile (particles)
    this._muddlerParticles = this._createParticleSystem(scene, 400, 0xff9100);

    // Connecting arcs between crystals
    for (let i = 0; i < crystalCount; i++) {
      const a = this.crystals[i].position;
      const b = this.crystals[(i + 1) % crystalCount].position;
      const curve = new THREE.QuadraticBezierCurve3(
        a.clone(),
        new THREE.Vector3((a.x + b.x) / 2, 10 + Math.random() * 3, (a.z + b.z) / 2),
        b.clone()
      );
      const arcGeo = new THREE.TubeGeometry(curve, 20, 0.04, 8, false);
      const arcMat = new THREE.MeshBasicMaterial({
        color: 0x00f2fe,
        transparent: true,
        opacity: 0.15,
      });
      scene.add(new THREE.Mesh(arcGeo, arcMat));
    }

    this._addStarfield(scene);

    const composer = this._createComposer(scene, camera);
    this.scenes.periodic = { scene, camera, controls, composer };
  }

  // ─────────────────────────────────────────────
  // SHARED HELPERS
  // ─────────────────────────────────────────────
  _createParticleSystem(scene, count, color, rising = false) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      velocities[i * 3]     = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = rising ? Math.random() * 0.03 + 0.01 : (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.userData = { velocities };

    const mat = new THREE.PointsMaterial({
      color: color,
      size: 0.12,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    this.particles.push(points);
    return points;
  }

  _createRainSystem(scene, count) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = 15 + Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      velocities[i * 3]     = 0;
      velocities[i * 3 + 1] = -0.05 - Math.random() * 0.08;
      velocities[i * 3 + 2] = 0;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.userData = { velocities };

    const mat = new THREE.PointsMaterial({
      color: 0x90caf9,
      size: 0.08,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const points = new THREE.Points(geo, mat);
    points.visible = false; // Hidden until precipitation stage
    scene.add(points);
    return points;
  }

  _addStarfield(scene) {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 100 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      starPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi);
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.3,
      transparent: true,
      opacity: 0.7,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);
    this._starfields.push(starPoints);
  }

  _createTextSprite(scene, text, position, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 48px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#' + new THREE.Color(color).getHexString();
    ctx.fillText(text, 64, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.copy(position);
    sprite.scale.set(2, 1, 1);
    scene.add(sprite);
    return sprite;
  }

  // ─────────────────────────────────────────────
  // BUILD ALL SCENES
  // ─────────────────────────────────────────────
  _initScenes() {
    this._buildMatterScene();
    this._buildAtomicScene();
    this._buildWaterCycleScene();
    this._buildPeriodicScene();
    this.activeZone = 'matter';
  }

  // ─────────────────────────────────────────────
  // SWITCH ZONE
  // ─────────────────────────────────────────────
  switchZone(zoneId) {
    if (!this.scenes[zoneId]) return;
    this.activeZone = zoneId;
    // Disable all controls except active
    Object.values(this.scenes).forEach(s => { s.controls.enabled = false; });
    this.scenes[zoneId].controls.enabled = true;
  }

  // ─────────────────────────────────────────────
  // THEME SWITCH (Bright vs Dark Mode)
  // ─────────────────────────────────────────────
  setTheme(theme) {
    this.currentTheme = theme;
    const isBright = (theme === 'bright');

    // 1. Matter scene
    if (this.scenes.matter) {
      const s = this.scenes.matter.scene;
      s.background.set(isBright ? 0xcbe5ff : 0x060810);
      if (s.fog) s.fog.color.set(isBright ? 0xcbe5ff : 0x060810);
    }

    // 2. Atomic scene
    if (this.scenes.atomic) {
      const s = this.scenes.atomic.scene;
      s.background.set(isBright ? 0xedf2fb : 0x080412);
      if (s.fog) s.fog.color.set(isBright ? 0xedf2fb : 0x080412);
    }

    // 3. Water Cycle scene
    const wcKey = this.scenes['water-cycle'] ? 'water-cycle' : 'waterCycle';
    if (this.scenes[wcKey]) {
      const s = this.scenes[wcKey].scene;
      s.background.set(isBright ? 0x9be0ff : 0x081020);
      if (s.fog) s.fog.color.set(isBright ? 0x9be0ff : 0x081020);
    }

    // 4. Periodic scene
    if (this.scenes.periodic) {
      const s = this.scenes.periodic.scene;
      s.background.set(isBright ? 0xe2e8f5 : 0x0a0814);
      if (s.fog) s.fog.color.set(isBright ? 0xe2e8f5 : 0x0a0814);
    }

    // Toggle starfields
    if (this._starfields) {
      this._starfields.forEach(sf => {
        sf.visible = !isBright;
      });
    }
  }

  // ─────────────────────────────────────────────
  // TEMPERATURE CONTROL (Zone 1)
  // ─────────────────────────────────────────────
  setTemperature(kelvin) {
    this.temperature = kelvin;
    if (!this._matterParticles) return;

    const geo = this._matterParticles.geometry;
    const vel = geo.userData.velocities;
    const speed = (kelvin - 200) / 400; // 0 to 1 range
    for (let i = 0; i < vel.length; i++) {
      vel[i] = (Math.random() - 0.5) * 0.06 * speed;
    }

    // Change particle color based on state
    if (kelvin < 273) {
      this._matterParticles.material.color.set(0xa8d8ea); // ice blue
      this._matterParticles.material.size = 0.08;
    } else if (kelvin < 373) {
      this._matterParticles.material.color.set(0x4fc3f7); // water blue
      this._matterParticles.material.size = 0.10;
    } else {
      this._matterParticles.material.color.set(0xb388ff); // vapor purple
      this._matterParticles.material.size = 0.15;
    }

    // Morph river appearance
    if (this._riverMat) {
      if (kelvin < 273) {
        this._riverMat.color.set(0xa8d8ea);
        this._riverMat.roughness = 0.1;
        this._riverMat.transmission = 0.7;
      } else if (kelvin < 373) {
        this._riverMat.color.set(0x1a6890);
        this._riverMat.roughness = 0.25;
        this._riverMat.transmission = 0.4;
      } else {
        this._riverMat.color.set(0x6a5acd);
        this._riverMat.roughness = 0.5;
        this._riverMat.transmission = 0.1;
      }
    }

    // Scale ice boulders
    if (this._iceBoulders) {
      const iceScale = Math.max(0.05, 1 - (kelvin - 200) / 200);
      this._iceBoulders.forEach(b => {
        b.scale.setScalar(iceScale);
        b.material.opacity = Math.max(0.05, iceScale * 0.7);
      });
    }
  }

  // Water cycle stage toggling
  setWaterCycleStage(stage) {
    if (!this._rainParticles) return;
    this._rainParticles.visible = (stage === 'Precipitation' || stage === 'Collection');

    // Vapour particles visible during evaporation
    if (this._vapourParticles) {
      this._vapourParticles.visible = (stage === 'Evaporation' || stage === 'Condensation');
    }
  }

  // Crystal activation (Zone 4)
  activateCrystal(symbol) {
    const crystal = this.crystals.find(c => c.userData.element.symbol === symbol);
    if (!crystal) return;
    crystal.userData.activated = true;
    crystal.userData.baseEmissive = 1.0;
    crystal.material.emissiveIntensity = 1.0;
    if (crystal.userData.light) crystal.userData.light.intensity = 3.0;
  }

  // ─────────────────────────────────────────────
  // ANIMATION LOOP
  // ─────────────────────────────────────────────
  _animate() {
    requestAnimationFrame(() => this._animate());
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    const active = this.scenes[this.activeZone];
    if (!active) return;

    active.controls.update();

    // Animate particles
    this.particles.forEach(p => {
      if (!p.visible) return;
      const pos = p.geometry.getAttribute('position');
      const vel = p.geometry.userData.velocities;
      for (let i = 0; i < pos.count; i++) {
        pos.array[i * 3]     += vel[i * 3];
        pos.array[i * 3 + 1] += vel[i * 3 + 1];
        pos.array[i * 3 + 2] += vel[i * 3 + 2];
        // Wrap around
        if (Math.abs(pos.array[i * 3]) > 15) pos.array[i * 3] *= -0.9;
        if (pos.array[i * 3 + 1] > 18) pos.array[i * 3 + 1] = 0;
        if (pos.array[i * 3 + 1] < 0) pos.array[i * 3 + 1] = 18;
        if (Math.abs(pos.array[i * 3 + 2]) > 15) pos.array[i * 3 + 2] *= -0.9;
      }
      pos.needsUpdate = true;
    });

    // Rain particles
    if (this._rainParticles && this._rainParticles.visible) {
      const rp = this._rainParticles.geometry.getAttribute('position');
      const rv = this._rainParticles.geometry.userData.velocities;
      for (let i = 0; i < rp.count; i++) {
        rp.array[i * 3 + 1] += rv[i * 3 + 1];
        if (rp.array[i * 3 + 1] < 0) {
          rp.array[i * 3 + 1] = 15 + Math.random() * 20;
          rp.array[i * 3]     = (Math.random() - 0.5) * 60;
          rp.array[i * 3 + 2] = (Math.random() - 0.5) * 40;
        }
      }
      rp.needsUpdate = true;
    }

    // Orbiting elements (Zone 2)
    if (this._orbitingElements && this.activeZone === 'atomic') {
      this._orbitingElements.forEach(el => {
        const t = elapsed * el.userData.orbitSpeed + el.userData.orbitOffset;
        el.position.x = Math.cos(t) * el.userData.orbitRadius;
        el.position.z = Math.sin(t) * el.userData.orbitRadius;
        el.position.y = 3 + Math.sin(t * 0.7) * el.userData.yOscil * 0.3;
      });
    }

    // Atom breathing (Zone 2)
    if (this.atomMeshes.length && this.activeZone === 'atomic') {
      this.atomMeshes.forEach((m, i) => {
        const s = 1 + Math.sin(elapsed * 1.5 + i) * 0.05;
        m.scale.setScalar(s);
      });
    }

    // Crucible ring rotation
    if (this._crucibleRing && this.activeZone === 'atomic') {
      this._crucibleRing.rotation.z = elapsed * 0.1;
    }

    // Crystal pulsing (Zone 4)
    if (this.crystals.length && this.activeZone === 'periodic') {
      this.crystals.forEach((c, i) => {
        const pulse = Math.sin(elapsed * 1.2 + i * 0.7) * 0.15;
        c.material.emissiveIntensity = c.userData.baseEmissive + pulse;
        c.rotation.y = elapsed * 0.15 + i;
      });
    }

    // Clouds drift (Zone 3)
    if (this._clouds && this.activeZone === 'water-cycle') {
      this._clouds.forEach(cg => {
        cg.position.x += cg.userData.speed * delta;
        if (cg.position.x > 40) cg.position.x = -40;
      });
    }

    // Ocean waves (Zone 3)
    if (this._ocean && this.activeZone === 'water-cycle') {
      const op = this._ocean.geometry.getAttribute('position');
      for (let i = 0; i < op.count; i++) {
        const x = op.getX(i);
        const y = op.getY(i);
        op.setZ(i, Math.sin(x * 0.1 + elapsed) * 0.4 + Math.cos(y * 0.15 + elapsed * 0.7) * 0.2);
      }
      op.needsUpdate = true;
      this._ocean.geometry.computeVertexNormals();
    }

    // Render
    if (active.composer) {
      active.composer.render();
    } else {
      this.renderer.render(active.scene, active.camera);
    }
  }

  // Progress callback for loading
  getLoadingProgress() {
    return Object.keys(this.scenes).length / 4;
  }
}
