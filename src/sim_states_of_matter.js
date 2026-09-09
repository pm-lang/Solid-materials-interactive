// ============================================================
// ELEMENTIA — States of Matter Particle Simulation Engine
// Real physical particle simulation: thermal vibration, liquid flow, gas collisions
// ============================================================
import * as THREE from 'three';

export class StatesOfMatterSimulation {
  constructor(containerElement, onTelemetryUpdate) {
    this.container = containerElement;
    this.onTelemetryUpdate = onTelemetryUpdate;
    this.temperature = 211; // Kelvin
    this.material = 'Water';
    this.pressure = 'Normal'; // Normal, High, Low
    this.boxSize = 8;
    this.particles = [];
    this.particleCount = 125; // 5x5x5 lattice in solid state
    this.latticePositions = [];
    this.velocities = [];
    this.clock = new THREE.Clock();

    // Material thermal properties (Melting and Boiling points in K)
    this.materialProps = {
      'Water':  { melt: 273, boil: 373, color: 0x64d2ff, radius: 0.28, mass: 18 },
      'Neon':   { melt: 24,  boil: 27,  color: 0xff6b6b, radius: 0.24, mass: 20 },
      'Argon':  { melt: 84,  boil: 87,  color: 0x9b5de5, radius: 0.32, mass: 40 },
      'Oxygen': { melt: 54,  boil: 90,  color: 0x00f5d4, radius: 0.26, mass: 32 }
    };

    this._initScene();
    this._initParticles();
    this._animate();
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 100);
    this.camera.position.set(0, 4, 18);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Subtle lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 15, 10);
    this.scene.add(dirLight);

    // Transparent containment box
    const boxGeo = new THREE.BoxGeometry(this.boxSize, this.boxSize, this.boxSize);
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x4a5568, transparent: true, opacity: 0.7 });
    this.boxWireframe = new THREE.LineSegments(boxEdges, lineMat);
    this.scene.add(this.boxWireframe);

    // Subtle translucent glass walls
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a202c,
      transparent: true,
      opacity: 0.12,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.7,
      side: THREE.BackSide
    });
    this.boxMesh = new THREE.Mesh(boxGeo, glassMat);
    this.scene.add(this.boxMesh);

    // Resize observer
    this.resizeObserver = new ResizeObserver(() => this._onResize());
    this.resizeObserver.observe(this.container);
  }

  _initParticles() {
    // Clean up existing
    if (this.particleInstancedMesh) {
      this.scene.remove(this.particleInstancedMesh);
      this.particleInstancedMesh.geometry.dispose();
      this.particleInstancedMesh.material.dispose();
    }

    const prop = this.materialProps[this.material];
    const geo = new THREE.SphereGeometry(prop.radius, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: prop.color,
      roughness: 0.3,
      metalness: 0.2,
      emissive: prop.color,
      emissiveIntensity: 0.25
    });

    this.particleInstancedMesh = new THREE.InstancedMesh(geo, mat, this.particleCount);
    this.particleInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.particleInstancedMesh);

    this.particles = [];
    this.latticePositions = [];
    this.velocities = [];

    // Form 5x5x5 cube lattice
    const spacing = prop.radius * 2.3;
    const offset = (5 - 1) * spacing / 2;
    const dummy = new THREE.Object3D();

    let idx = 0;
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        for (let z = 0; z < 5; z++) {
          const px = x * spacing - offset;
          const py = y * spacing - offset;
          const pz = z * spacing - offset;

          this.latticePositions.push(new THREE.Vector3(px, py, pz));
          this.particles.push(new THREE.Vector3(px, py, pz));
          this.velocities.push(new THREE.Vector3(0, 0, 0));

          dummy.position.set(px, py, pz);
          dummy.updateMatrix();
          this.particleInstancedMesh.setMatrixAt(idx++, dummy.matrix);
        }
      }
    }
    this.particleInstancedMesh.instanceMatrix.needsUpdate = true;
    this._updateTelemetry();
  }

  setTemperature(kelvin) {
    this.temperature = Math.max(10, Math.min(800, kelvin));
    this._updateTelemetry();
  }

  setMaterial(materialName) {
    if (this.materialProps[materialName]) {
      this.material = materialName;
      this._initParticles();
    }
  }

  setPressure(pressureMode) {
    this.pressure = pressureMode;
    const scale = pressureMode === 'High' ? 0.75 : pressureMode === 'Low' ? 1.25 : 1.0;
    this.boxWireframe.scale.set(scale, scale, scale);
    this.boxMesh.scale.set(scale, scale, scale);
    this.currentBoxHalf = (this.boxSize * scale) / 2;
    this._updateTelemetry();
  }

  _getState() {
    const prop = this.materialProps[this.material];
    if (this.temperature < prop.melt) return 'Solid';
    if (this.temperature < prop.boil) return 'Liquid';
    return 'Gas';
  }

  _getKineticEnergy() {
    // E_k = 3/2 * k_B * T (in electron-volts eV for educational readout)
    // 1 K ~ 8.617e-5 eV
    const kB_eV = 8.61733e-5;
    const energy = 1.5 * kB_eV * this.temperature;
    return energy.toFixed(3);
  }

  _updateTelemetry() {
    if (this.onTelemetryUpdate) {
      const state = this._getState();
      const ke = this._getKineticEnergy();
      this.onTelemetryUpdate({
        state: state,
        kineticEnergy: `${ke} eV`,
        temperature: this.temperature,
        material: this.material,
        pressure: this.pressure
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
    const delta = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.getElapsedTime();

    const state = this._getState();
    const prop = this.materialProps[this.material];
    const boxHalf = (this.boxSize * (this.pressure === 'High' ? 0.75 : this.pressure === 'Low' ? 1.25 : 1.0)) / 2 - prop.radius;
    const dummy = new THREE.Object3D();

    // Thermal kinetic factor
    const thermalSpeed = Math.sqrt(this.temperature / prop.mass) * 1.8;

    for (let i = 0; i < this.particleCount; i++) {
      const pos = this.particles[i];
      const vel = this.velocities[i];

      if (state === 'Solid') {
        // Crystalline oscillation around lattice point
        const origin = this.latticePositions[i];
        const jitterAmp = 0.04 + (this.temperature / prop.melt) * 0.12;
        pos.x = origin.x + Math.sin(elapsed * 25 + i * 1.5) * jitterAmp;
        pos.y = origin.y + Math.cos(elapsed * 28 + i * 2.1) * jitterAmp;
        pos.z = origin.z + Math.sin(elapsed * 22 + i * 0.9) * jitterAmp;
      } else if (state === 'Liquid') {
        // Close packed fluid settling towards bottom with surface fluid motion
        vel.x += (Math.random() - 0.5) * thermalSpeed * 0.8;
        vel.z += (Math.random() - 0.5) * thermalSpeed * 0.8;
        vel.y += -9.8 * delta * 0.3 + (Math.random() - 0.5) * thermalSpeed * 0.5; // gravity + jitter

        // Dampen
        vel.multiplyScalar(0.92);
        pos.addScaledVector(vel, delta);

        // Floor and walls collision
        const liquidFloor = -boxHalf + prop.radius * 0.8;
        if (pos.y < liquidFloor) {
          pos.y = liquidFloor;
          vel.y = -vel.y * 0.2;
        }
        if (pos.y > boxHalf * 0.2) {
          vel.y -= 2.0 * delta;
        }
        if (Math.abs(pos.x) > boxHalf) {
          pos.x = Math.sign(pos.x) * boxHalf;
          vel.x = -vel.x * 0.5;
        }
        if (Math.abs(pos.z) > boxHalf) {
          pos.z = Math.sign(pos.z) * boxHalf;
          vel.z = -vel.z * 0.5;
        }
      } else {
        // Gas: high-speed ballistic motion with specular wall bounces
        if (vel.lengthSq() < 0.1) {
          vel.set(
            (Math.random() - 0.5) * thermalSpeed * 2.5,
            (Math.random() - 0.5) * thermalSpeed * 2.5,
            (Math.random() - 0.5) * thermalSpeed * 2.5
          );
        }

        pos.addScaledVector(vel, delta);

        // Elastic wall collisions
        if (Math.abs(pos.x) > boxHalf) {
          pos.x = Math.sign(pos.x) * boxHalf;
          vel.x = -vel.x;
        }
        if (Math.abs(pos.y) > boxHalf) {
          pos.y = Math.sign(pos.y) * boxHalf;
          vel.y = -vel.y;
        }
        if (Math.abs(pos.z) > boxHalf) {
          pos.z = Math.sign(pos.z) * boxHalf;
          vel.z = -vel.z;
        }
      }

      dummy.position.copy(pos);
      dummy.updateMatrix();
      this.particleInstancedMesh.setMatrixAt(i, dummy.matrix);
    }

    this.particleInstancedMesh.instanceMatrix.needsUpdate = true;

    // Slow rotation of chamber
    this.boxWireframe.rotation.y = elapsed * 0.08;
    this.boxMesh.rotation.y = elapsed * 0.08;
    this.particleInstancedMesh.rotation.y = elapsed * 0.08;

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
