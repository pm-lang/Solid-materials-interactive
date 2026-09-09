// ============================================================
// ELEMENTIA — 3D Molecular Architect & Polarity Engine
// Accurate chemical models: Ball & Stick, Space Filling, Wireframe, Dipole vectors
// ============================================================
import * as THREE from 'three';

export class MolecularArchitectSimulation {
  constructor(containerElement, onInfoUpdate) {
    this.container = containerElement;
    this.onInfoUpdate = onInfoUpdate;
    this.template = 'H2O';
    this.modelStyle = 'Ball & Stick'; // 'Ball & Stick', 'Space Filling', 'Wireframe'
    this.clock = new THREE.Clock();

    // Molecular configurations (coordinates in Angstroms / scaled units)
    this.templates = {
      'H2O': {
        formula: 'H₂O',
        name: 'Water',
        bondType: 'Polar Covalent',
        totalAtoms: 3,
        dipoleMoment: '1.85 D (Net Polar)',
        bondAngle: '104.5°',
        explanation: 'Oxygen is strongly electronegative (3.44), pulling shared electrons away from Hydrogen (2.20), creating a bent polar dipole.',
        atoms: [
          { symbol: 'O', color: 0xff4d6d, radius: 0.72, pos: [0, -0.3, 0], charge: 'δ⁻' },
          { symbol: 'H', color: 0xffffff, radius: 0.42, pos: [-1.15, 0.55, 0], charge: 'δ⁺' },
          { symbol: 'H', color: 0xffffff, radius: 0.42, pos: [1.15, 0.55, 0], charge: 'δ⁺' }
        ],
        bonds: [
          { from: 0, to: 1 },
          { from: 0, to: 2 }
        ],
        dipoleVector: [0, -1.2, 0]
      },
      'CO2': {
        formula: 'CO₂',
        name: 'Carbon Dioxide',
        bondType: 'Nonpolar Covalent (Linear)',
        totalAtoms: 3,
        dipoleMoment: '0.00 D (Symmetric Cancel)',
        bondAngle: '180.0°',
        explanation: 'Although each C=O bond is polar, the linear geometry causes the two opposing dipole vectors to cancel out completely.',
        atoms: [
          { symbol: 'C', color: 0x4a5568, radius: 0.65, pos: [0, 0, 0], charge: 'δ⁺' },
          { symbol: 'O', color: 0xff4d6d, radius: 0.68, pos: [-1.8, 0, 0], charge: 'δ⁻' },
          { symbol: 'O', color: 0xff4d6d, radius: 0.68, pos: [1.8, 0, 0], charge: 'δ⁻' }
        ],
        bonds: [
          { from: 0, to: 1, double: true },
          { from: 0, to: 2, double: true }
        ],
        dipoleVector: null
      },
      'CH4': {
        formula: 'CH₄',
        name: 'Methane',
        bondType: 'Nonpolar Covalent',
        totalAtoms: 5,
        dipoleMoment: '0.00 D (Tetrahedral Cancel)',
        bondAngle: '109.5°',
        explanation: 'Perfect tetrahedral symmetry ensures all small C-H bond dipoles balance to zero net polarity.',
        atoms: [
          { symbol: 'C', color: 0x4a5568, radius: 0.68, pos: [0, 0, 0], charge: '0' },
          { symbol: 'H', color: 0xffffff, radius: 0.38, pos: [0, 1.2, 0], charge: 'δ⁺' },
          { symbol: 'H', color: 0xffffff, radius: 0.38, pos: [1.13, -0.4, 0], charge: 'δ⁺' },
          { symbol: 'H', color: 0xffffff, radius: 0.38, pos: [-0.56, -0.4, 0.98], charge: 'δ⁺' },
          { symbol: 'H', color: 0xffffff, radius: 0.38, pos: [-0.56, -0.4, -0.98], charge: 'δ⁺' }
        ],
        bonds: [
          { from: 0, to: 1 },
          { from: 0, to: 2 },
          { from: 0, to: 3 },
          { from: 0, to: 4 }
        ],
        dipoleVector: null
      },
      'NH3': {
        formula: 'NH₃',
        name: 'Ammonia',
        bondType: 'Polar Covalent',
        totalAtoms: 4,
        dipoleMoment: '1.47 D (Pyramidal Polar)',
        bondAngle: '107.0°',
        explanation: 'The lone electron pair on Nitrogen pushes the three N-H bonds down into a trigonal pyramid with a strong net upward dipole.',
        atoms: [
          { symbol: 'N', color: 0x3a86ff, radius: 0.68, pos: [0, 0.35, 0], charge: 'δ⁻' },
          { symbol: 'H', color: 0xffffff, radius: 0.38, pos: [0, -0.45, 1.15], charge: 'δ⁺' },
          { symbol: 'H', color: 0xffffff, radius: 0.38, pos: [-1.0, -0.45, -0.58], charge: 'δ⁺' },
          { symbol: 'H', color: 0xffffff, radius: 0.38, pos: [1.0, -0.45, -0.58], charge: 'δ⁺' }
        ],
        bonds: [
          { from: 0, to: 1 },
          { from: 0, to: 2 },
          { from: 0, to: 3 }
        ],
        dipoleVector: [0, 1.4, 0]
      },
      'NaCl': {
        formula: 'NaCl',
        name: 'Sodium Chloride (Salt)',
        bondType: 'Ionic Bond',
        totalAtoms: 2,
        dipoleMoment: '9.0 D (Extreme Ionic)',
        bondAngle: '180°',
        explanation: 'Complete electron transfer from Sodium (metal) to Chlorine (nonmetal), creating electrostatic attraction between Na⁺ and Cl⁻ ions.',
        atoms: [
          { symbol: 'Na', color: 0xffbe0b, radius: 0.75, pos: [-1.2, 0, 0], charge: '+' },
          { symbol: 'Cl', color: 0x06d6a0, radius: 0.95, pos: [1.2, 0, 0], charge: '−' }
        ],
        bonds: [
          { from: 0, to: 1 }
        ],
        dipoleVector: [1.6, 0, 0]
      }
    };

    this._initScene();
    this._buildMolecule();
    this._animate();
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, this.container.clientWidth / this.container.clientHeight, 0.1, 100);
    this.camera.position.set(0, 0, 8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Studio lights
    const amb = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(amb);

    const light1 = new THREE.DirectionalLight(0xffffff, 1.4);
    light1.position.set(5, 8, 5);
    this.scene.add(light1);

    const light2 = new THREE.DirectionalLight(0x60a5fa, 0.6);
    light2.position.set(-5, -4, -3);
    this.scene.add(light2);

    this.molGroup = new THREE.Group();
    this.scene.add(this.molGroup);

    this.resizeObserver = new ResizeObserver(() => this._onResize());
    this.resizeObserver.observe(this.container);
  }

  _buildMolecule() {
    // Clear previous
    while (this.molGroup.children.length > 0) {
      const obj = this.molGroup.children[0];
      this.molGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }

    const data = this.templates[this.template];
    const isSpaceFilling = this.modelStyle === 'Space Filling';
    const isWireframe = this.modelStyle === 'Wireframe';

    // Atoms
    data.atoms.forEach(atom => {
      const radius = isSpaceFilling ? atom.radius * 1.7 : atom.radius;
      const geo = new THREE.SphereGeometry(radius, 32, 32);
      const mat = new THREE.MeshPhysicalMaterial({
        color: atom.color,
        roughness: 0.25,
        metalness: 0.15,
        clearcoat: 0.6,
        wireframe: isWireframe
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(atom.pos[0], atom.pos[1], atom.pos[2]);
      this.molGroup.add(mesh);
    });

    // Bonds (only in Ball & Stick and Wireframe)
    if (!isSpaceFilling) {
      data.bonds.forEach(bond => {
        const p1 = new THREE.Vector3(...data.atoms[bond.from].pos);
        const p2 = new THREE.Vector3(...data.atoms[bond.to].pos);
        const dir = new THREE.Vector3().subVectors(p2, p1);
        const len = dir.length();

        const bondGeo = new THREE.CylinderGeometry(0.1, 0.1, len, 16);
        const bondMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.4,
          metalness: 0.3,
          wireframe: isWireframe
        });
        const bondMesh = new THREE.Mesh(bondGeo, bondMat);

        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        bondMesh.position.copy(mid);
        bondMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        this.molGroup.add(bondMesh);
      });
    }

    // Dipole vector arrow
    if (data.dipoleVector && !isWireframe) {
      const origin = new THREE.Vector3(0, 0, 0);
      const dir = new THREE.Vector3(...data.dipoleVector).normalize();
      const length = 2.0;
      const arrowHelper = new THREE.ArrowHelper(dir, origin, length, 0x00f2fe, 0.4, 0.25);
      this.molGroup.add(arrowHelper);
    }

    this._updateInfo();
  }

  setTemplate(templateKey) {
    if (this.templates[templateKey]) {
      this.template = templateKey;
      this._buildMolecule();
    }
  }

  setModelStyle(style) {
    this.modelStyle = style;
    this._buildMolecule();
  }

  reset() {
    this.molGroup.rotation.set(0, 0, 0);
    this._buildMolecule();
  }

  _updateInfo() {
    if (this.onInfoUpdate) {
      const data = this.templates[this.template];
      this.onInfoUpdate({
        formula: data.formula,
        name: data.name,
        bondType: data.bondType,
        totalAtoms: data.totalAtoms,
        dipoleMoment: data.dipoleMoment,
        bondAngle: data.bondAngle,
        explanation: data.explanation
      });
    }
  }

  _onResize() {
    if (!this.container || !this.renderer) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  _animate() {
    this.animId = requestAnimationFrame(() => this._animate());
    const elapsed = this.clock.getElapsedTime();

    // Gentle auto-rotation
    this.molGroup.rotation.y = elapsed * 0.4;
    this.molGroup.rotation.x = Math.sin(elapsed * 0.3) * 0.15;

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
