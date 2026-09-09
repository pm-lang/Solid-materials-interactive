// sim_energy_system.js - Interactive Energy & Matter Transformation System
// Directly inspired by PhET Energy Forms and Changes: Systems (clean, tactile, metric-driven).

export class EnergySystemsSimulator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeSource = 'biker'; // 'biker', 'faucet', 'sun', 'teapot'
    this.activeConverter = 'generator'; // 'generator', 'solar'
    this.activeOutput = 'beaker'; // 'beaker', 'incandescent', 'fluorescent', 'fan'
    
    this.sourceIntensity = 0.0; // 0.0 to 1.0 (controlled by slider)
    this.showEnergySymbols = true;
    
    // Physics & Metric state
    this.temperatureC = 20.0; // Starts at 20°C room temp
    this.maxTemperatureC = 100.0;
    this.coolingRate = 0.03; // Naturally cools down slowly if no power
    this.powerWatts = 0;
    this.generatorAngle = 0;
    this.fanAngle = 0;
    this.cyclistLegPhase = 0;
    this.faucetWaterDroplets = [];
    this.steamParticles = [];
    this.energyParticles = [];
    
    this.animFrameId = null;
    this.onMetricChange = null; // Callback for turn-based tracking

    this.init();
  }

  init() {
    if (!this.container) return;
    this.renderUI();
    this.bindEvents();
    this.startLoop();
  }

  renderUI() {
    this.container.innerHTML = `
      <div class="phet-workbench-container">
        <!-- Top Toolbar & Metric Bar -->
        <div class="phet-topbar">
          <div class="phet-metric-badge">
            <span class="metric-icon">🌡️</span>
            <span class="metric-label">Water Temp:</span>
            <span class="metric-val" id="val-water-temp">20.0 °C</span>
            <span class="metric-state-pill" id="pill-water-state">Cool Fluid</span>
          </div>

          <div class="phet-metric-badge">
            <span class="metric-icon">⚡</span>
            <span class="metric-label">Power Output:</span>
            <span class="metric-val" id="val-power-watts">0 W</span>
          </div>

          <label class="phet-checkbox-label">
            <input type="checkbox" id="chk-energy-symbols" ${this.showEnergySymbols ? 'checked' : ''}>
            <span class="phet-chk-box"></span>
            <span class="chk-text">Energy Symbols <b class="tag-e">E</b></span>
          </label>
        </div>

        <!-- Main Canvas Area -->
        <div class="phet-canvas-wrapper">
          <canvas id="phet-canvas" width="960" height="460"></canvas>
          
          <!-- Tactical Slider positioned under source -->
          <div class="phet-source-slider-box" id="source-slider-box">
            <div class="slider-label" id="slider-param-label">🚴 Pedaling Speed</div>
            <input type="range" id="slider-source-intensity" min="0" max="100" value="0" class="phet-slider">
            <div class="slider-ticks">
              <span>0%</span>
              <span>50%</span>
              <span>100% Max</span>
            </div>
          </div>
        </div>

        <!-- Bottom Selector Docks (Source -> Converter -> Output) -->
        <div class="phet-selectors-dock">
          <!-- Sources -->
          <div class="phet-selector-group">
            <span class="group-title">1. Energy Source</span>
            <div class="dock-buttons">
              <button class="phet-btn active" data-source="biker" title="Bicycle Rider (Chemical Energy)">
                <span class="btn-icon">🚴</span>
                <span class="btn-name">Biker</span>
              </button>
              <button class="phet-btn" data-source="faucet" title="Water Faucet (Hydraulic Energy)">
                <span class="btn-icon">🚰</span>
                <span class="btn-name">Faucet</span>
              </button>
              <button class="phet-btn" data-source="sun" title="Sunlight (Radiant Solar Energy)">
                <span class="btn-icon">☀️</span>
                <span class="btn-name">Sun</span>
              </button>
              <button class="phet-btn" data-source="teapot" title="Heated Teapot (Thermal Steam)">
                <span class="btn-icon">🫖</span>
                <span class="btn-name">Teapot</span>
              </button>
            </div>
          </div>

          <!-- Converters -->
          <div class="phet-selector-group">
            <span class="group-title">2. Converter</span>
            <div class="dock-buttons">
              <button class="phet-btn active" data-converter="generator" title="Wheel & Dynamo Generator">
                <span class="btn-icon">⚙️</span>
                <span class="btn-name">Generator</span>
              </button>
              <button class="phet-btn" data-converter="solar" title="Photovoltaic Solar Panel">
                <span class="btn-icon">🟦</span>
                <span class="btn-name">Solar Panel</span>
              </button>
            </div>
          </div>

          <!-- Outputs -->
          <div class="phet-selector-group">
            <span class="group-title">3. Target & Metric</span>
            <div class="dock-buttons">
              <button class="phet-btn active" data-output="beaker" title="Water Beaker with Precision Thermometer">
                <span class="btn-icon">🧪</span>
                <span class="btn-name">Beaker & Temp</span>
              </button>
              <button class="phet-btn" data-output="incandescent" title="Incandescent Filament Bulb">
                <span class="btn-icon">💡</span>
                <span class="btn-name">Incandescent</span>
              </button>
              <button class="phet-btn" data-output="fluorescent" title="CFL Spiral Bulb">
                <span class="btn-icon">🌀</span>
                <span class="btn-name">Fluorescent</span>
              </button>
              <button class="phet-btn" data-output="fan" title="Cooling Electric Fan">
                <span class="btn-icon">💨</span>
                <span class="btn-name">Electric Fan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.canvas = document.getElementById('phet-canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  bindEvents() {
    const slider = document.getElementById('slider-source-intensity');
    if (slider) {
      slider.addEventListener('input', (e) => {
        this.sourceIntensity = parseFloat(e.target.value) / 100;
      });
    }

    const chkSymbols = document.getElementById('chk-energy-symbols');
    if (chkSymbols) {
      chkSymbols.addEventListener('change', (e) => {
        this.showEnergySymbols = e.target.checked;
      });
    }

    // Source buttons
    const sourceBtns = this.container.querySelectorAll('[data-source]');
    sourceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sourceBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setSource(btn.dataset.source);
      });
    });

    // Converter buttons
    const convBtns = this.container.querySelectorAll('[data-converter]');
    convBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        convBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setConverter(btn.dataset.converter);
      });
    });

    // Output buttons
    const outBtns = this.container.querySelectorAll('[data-output]');
    outBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        outBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setOutput(btn.dataset.output);
      });
    });
  }

  setSource(source) {
    this.activeSource = source;
    const label = document.getElementById('slider-param-label');
    if (label) {
      if (source === 'biker') label.innerHTML = '🚴 Pedaling Speed';
      if (source === 'faucet') label.innerHTML = '🚰 Water Valve Flow';
      if (source === 'sun') label.innerHTML = '☀️ Solar Intensity';
      if (source === 'teapot') label.innerHTML = '🫖 Burner Flame Heat';
    }
  }

  setConverter(conv) {
    this.activeConverter = conv;
  }

  setOutput(out) {
    this.activeOutput = out;
  }

  startLoop() {
    const loop = () => {
      this.update();
      this.draw();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  update() {
    // Determine conversion efficiency & compatibility
    let isCompatible = true;
    if (this.activeSource === 'sun' && this.activeConverter !== 'solar') {
      isCompatible = false; // Sunlight needs solar panel
    }
    if (this.activeSource !== 'sun' && this.activeConverter === 'solar') {
      isCompatible = false; // Mechanical sources need generator
    }

    // Calculate electrical power generated
    if (isCompatible && this.sourceIntensity > 0.05) {
      this.powerWatts = Math.round(this.sourceIntensity * 650); // up to 650 W
    } else {
      this.powerWatts = 0;
    }

    // Rotate generator & fan
    if (this.powerWatts > 0) {
      const speed = (this.powerWatts / 650) * 0.18;
      this.generatorAngle += speed;
      this.fanAngle += speed * 1.5;
      this.cyclistLegPhase += speed * 0.8;
    }

    // Beaker water heating / cooling thermodynamics
    if (this.activeOutput === 'beaker') {
      if (this.powerWatts > 0) {
        // Temperature rises proportional to wattage
        const heatingRate = (this.powerWatts / 650) * 0.14;
        this.temperatureC = Math.min(this.maxTemperatureC, this.temperatureC + heatingRate);
      } else {
        // Naturally cools down towards 20°C room temp
        if (this.temperatureC > 20.0) {
          this.temperatureC = Math.max(20.0, this.temperatureC - this.coolingRate);
        }
      }

      // Generate boiling bubbles & steam if temperature >= 90°C
      if (this.temperatureC >= 90.0 && Math.random() < 0.4) {
        this.steamParticles.push({
          x: 770 + (Math.random() * 80 - 40),
          y: 200,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -1.5 - Math.random() * 2,
          radius: 3 + Math.random() * 4,
          alpha: 0.8
        });
      }
    }

    // Update steam particles
    for (let i = this.steamParticles.length - 1; i >= 0; i--) {
      const p = this.steamParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.015;
      p.radius += 0.15;
      if (p.alpha <= 0) {
        this.steamParticles.splice(i, 1);
      }
    }

    // Update Energy symbols [E]
    if (this.showEnergySymbols && Math.random() < 0.15 && this.powerWatts > 0) {
      this.spawnEnergyChunk();
    }
    this.updateEnergyChunks();

    // Update DOM telemetry
    this.updateTelemetry();

    // Notify turn tracker
    if (this.onMetricChange) {
      this.onMetricChange({
        temperatureC: this.temperatureC,
        powerWatts: this.powerWatts,
        isBoiling: this.temperatureC >= 100.0
      });
    }
  }

  spawnEnergyChunk() {
    // Path from source (x: 180) -> converter (x: 480) -> output (x: 770)
    let type = 'mechanical';
    if (this.activeSource === 'biker') type = 'chemical';
    if (this.activeSource === 'sun') type = 'light';
    if (this.activeSource === 'teapot') type = 'thermal';

    this.energyParticles.push({
      x: 180 + Math.random() * 20,
      y: 260 + Math.random() * 30,
      targetX: 470,
      targetY: 230,
      phase: 1, // 1: source->conv, 2: conv->output
      type: type,
      progress: 0
    });
  }

  updateEnergyChunks() {
    for (let i = this.energyParticles.length - 1; i >= 0; i--) {
      const ep = this.energyParticles[i];
      ep.progress += 0.018;

      if (ep.phase === 1) {
        ep.x = 190 + (470 - 190) * ep.progress;
        ep.y = 270 + (230 - 270) * ep.progress;
        if (ep.progress >= 1.0) {
          ep.phase = 2;
          ep.progress = 0;
          ep.type = 'electrical'; // Converter converts into electrical!
        }
      } else if (ep.phase === 2) {
        ep.x = 470 + (770 - 470) * ep.progress;
        ep.y = 230 + (280 - 230) * ep.progress;
        if (ep.progress >= 0.8) {
          if (this.activeOutput === 'beaker') ep.type = 'thermal';
          if (this.activeOutput === 'incandescent' || this.activeOutput === 'fluorescent') ep.type = 'light';
          if (this.activeOutput === 'fan') ep.type = 'mechanical';
        }
        if (ep.progress >= 1.0) {
          this.energyParticles.splice(i, 1);
        }
      }
    }
  }

  updateTelemetry() {
    const tempEl = document.getElementById('val-water-temp');
    const pillEl = document.getElementById('pill-water-state');
    const wattsEl = document.getElementById('val-power-watts');

    if (tempEl) tempEl.textContent = `${this.temperatureC.toFixed(1)} °C`;
    if (wattsEl) wattsEl.textContent = `${this.powerWatts} W`;

    if (pillEl) {
      if (this.temperatureC >= 100.0) {
        pillEl.textContent = '🔥 Boiling Steam (100°C)';
        pillEl.className = 'metric-state-pill boiling';
      } else if (this.temperatureC >= 60.0) {
        pillEl.textContent = '♨️ Hot Liquid';
        pillEl.className = 'metric-state-pill warm';
      } else if (this.temperatureC >= 35.0) {
        pillEl.textContent = '💧 Tepid Water';
        pillEl.className = 'metric-state-pill mild';
      } else {
        pillEl.textContent = '🧊 Cool Fluid (20°C)';
        pillEl.className = 'metric-state-pill cool';
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Soft warm studio background matching PhET aesthetic
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#fbf8ee');
    bgGrad.addColorStop(1, '#f3ede0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Ground plane line
    ctx.strokeStyle = '#d4cbb8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 390);
    ctx.lineTo(920, 390);
    ctx.stroke();

    // 1. Draw Source
    this.drawSource(ctx);

    // 2. Draw Converter
    this.drawConverter(ctx);

    // 3. Draw Belt or Pipe connecting Source & Converter
    this.drawCoupling(ctx);

    // 4. Draw Electric Cable connecting Converter & Output
    this.drawElectricCable(ctx);

    // 5. Draw Output & Metrics
    this.drawOutput(ctx);

    // 6. Draw Energy Symbols [E]
    if (this.showEnergySymbols) {
      this.drawEnergyParticles(ctx);
    }
  }

  drawSource(ctx) {
    if (this.activeSource === 'biker') {
      this.drawBiker(ctx, 180, 270);
    } else if (this.activeSource === 'faucet') {
      this.drawFaucet(ctx, 210, 160);
    } else if (this.activeSource === 'sun') {
      this.drawSun(ctx, 190, 180);
    } else if (this.activeSource === 'teapot') {
      this.drawTeapot(ctx, 190, 290);
    }
  }

  drawBiker(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Bike Frame
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Wheels
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(-70, 60, 35, 0, Math.PI * 2); // Rear wheel
    ctx.arc(70, 60, 35, 0, Math.PI * 2);  // Front wheel
    ctx.stroke();

    // Wheel hubs & spokes
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#94a3b8';
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
      const rot = a + this.generatorAngle;
      ctx.beginPath();
      ctx.moveTo(-70, 60);
      ctx.lineTo(-70 + Math.cos(rot) * 32, 60 + Math.sin(rot) * 32);
      ctx.moveTo(70, 60);
      ctx.lineTo(70 + Math.cos(rot) * 32, 60 + Math.sin(rot) * 32);
      ctx.stroke();
    }

    // Triangular Frame
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(-70, 60); // Rear hub
    ctx.lineTo(-10, 60); // Bottom bracket / pedals
    ctx.lineTo(35, 10);  // Head tube
    ctx.lineTo(-25, 10); // Seat tube top
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-10, 60);
    ctx.lineTo(-25, 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(35, 10);
    ctx.lineTo(70, 60); // Fork
    ctx.stroke();

    // Handlebar & Seat
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(35, 10);
    ctx.lineTo(25, -15);
    ctx.lineTo(35, -20);
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-40, 6, 30, 8);

    // Cyclist Body & Animated Legs
    const pedalAngle = this.cyclistLegPhase;
    const pedalR = 16;
    const pedalX = -10 + Math.cos(pedalAngle) * pedalR;
    const pedalY = 60 + Math.sin(pedalAngle) * pedalR;

    // Torso
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(0, -20, 16, 28, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(8, -35);
    ctx.lineTo(28, -15);
    ctx.stroke();

    // Legs
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-15, -5);
    ctx.lineTo(pedalX - 5, pedalY - 20); // Knee
    ctx.lineTo(pedalX, pedalY);          // Foot on pedal
    ctx.stroke();

    // Head & Helmet
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(8, -55, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444'; // Red helmet
    ctx.beginPath();
    ctx.arc(8, -59, 16, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();

    ctx.restore();
  }

  drawFaucet(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Pipe & Faucet Spout
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-120, -20, 100, 30);
    ctx.fillRect(-40, -20, 40, 70);

    // Valve wheel
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-50, -45, 60, 15);
    ctx.fillRect(-25, -30, 10, 15);

    // Water Stream if turned on
    if (this.sourceIntensity > 0.05) {
      const streamWidth = 8 + this.sourceIntensity * 22;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.fillRect(-30, 50, streamWidth, 140);

      // Water droplets & splash
      ctx.fillStyle = '#38bdf8';
      for (let i = 0; i < 4; i++) {
        const dropY = 50 + Math.random() * 130;
        ctx.beginPath();
        ctx.arc(-20 + Math.random() * streamWidth, dropY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  drawSun(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Radiant Sun
    const sunGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 50);
    sunGrad.addColorStop(0, '#fef08a');
    sunGrad.addColorStop(0.7, '#f59e0b');
    sunGrad.addColorStop(1, '#ea580c');

    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.fill();

    // Rays
    if (this.sourceIntensity > 0.05) {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.lineWidth = 3;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 45, Math.sin(a) * 45);
        ctx.lineTo(Math.cos(a) * (60 + this.sourceIntensity * 25), Math.sin(a) * (60 + this.sourceIntensity * 25));
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  drawTeapot(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Flame Burner
    if (this.sourceIntensity > 0.05) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-10, 60, 15 * this.sourceIntensity, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(-10, 55, 10 * this.sourceIntensity, 0, Math.PI * 2);
      ctx.fill();
    }

    // Teapot body
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-10, 20, 42, 0, Math.PI * 2);
    ctx.fill();

    // Lid & Handle
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(-30, -28, 40, 10);
    ctx.beginPath();
    ctx.arc(-55, 20, 22, Math.PI * 0.5, Math.PI * 1.5);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Spout
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(25, 10);
    ctx.lineTo(55, -5);
    ctx.lineTo(60, 5);
    ctx.lineTo(25, 30);
    ctx.closePath();
    ctx.fill();

    // Steam out of spout
    if (this.sourceIntensity > 0.05) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(65 + i * 15, 0 - i * 8, 8 + i * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  drawConverter(ctx) {
    if (this.activeConverter === 'generator') {
      // Generator Box & Turbine Wheel
      ctx.save();
      ctx.translate(470, 260);

      // Generator Base Housing
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.roundRect(-50, -40, 100, 130, 12);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Generator', 0, 75);

      // Spinning Wheel
      ctx.save();
      ctx.rotate(this.generatorAngle);

      // Wooden Outer Rim
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(0, -35, 55, 0, Math.PI * 2);
      ctx.fill();

      // Rim cutout
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(0, -35, 45, 0, Math.PI * 2);
      ctx.fill();

      // Spokes
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 6;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.moveTo(0, -35);
        ctx.lineTo(Math.cos(a) * 45, -35 + Math.sin(a) * 45);
        ctx.stroke();
      }

      // Center Hub
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(0, -35, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      ctx.restore();

    } else if (this.activeConverter === 'solar') {
      // Solar Photovoltaic Panel
      ctx.save();
      ctx.translate(470, 260);

      // Stand
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, 10);
      ctx.lineTo(0, 90);
      ctx.stroke();

      // Panel angled towards left (sun)
      ctx.save();
      ctx.rotate(-0.25);

      // Panel Frame
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-70, -50, 140, 75);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.strokeRect(-70, -50, 140, 75);

      // Silicon Cells Grid
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(-66, -46, 132, 67);

      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 1;
      for (let x = -66 + 33; x < 66; x += 33) {
        ctx.beginPath();
        ctx.moveTo(x, -46);
        ctx.lineTo(x, 21);
        ctx.stroke();
      }
      for (let y = -46 + 22; y < 21; y += 22) {
        ctx.beginPath();
        ctx.moveTo(-66, y);
        ctx.lineTo(66, y);
        ctx.stroke();
      }

      ctx.restore();
      ctx.restore();
    }
  }

  drawCoupling(ctx) {
    if (this.activeSource === 'biker' && this.activeConverter === 'generator') {
      // Drive Belt between bicycle rear hub and generator wheel
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(250, 330); // Bike rear wheel rim
      ctx.lineTo(470, 170); // Generator wheel top
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(250, 330);
      ctx.lineTo(470, 280); // Generator wheel bottom
      ctx.stroke();
    }
  }

  drawElectricCable(ctx) {
    // Insulated black pipe/cable connecting Converter (470, 310) to Output (710, 340)
    ctx.save();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(520, 310);
    ctx.bezierCurveTo(580, 340, 640, 370, 710, 350);
    ctx.stroke();

    // Coupler metal fitting
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(590, 320, 20, 25);
    ctx.restore();
  }

  drawOutput(ctx) {
    if (this.activeOutput === 'beaker') {
      this.drawBeakerWithThermometer(ctx, 770, 240);
    } else if (this.activeOutput === 'incandescent') {
      this.drawIncandescentBulb(ctx, 770, 230);
    } else if (this.activeOutput === 'fluorescent') {
      this.drawFluorescentBulb(ctx, 770, 230);
    } else if (this.activeOutput === 'fan') {
      this.drawElectricFan(ctx, 770, 230);
    }
  }

  drawBeakerWithThermometer(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Beaker Glass Body
    const beakerW = 100;
    const beakerH = 140;

    // Water level inside beaker
    ctx.fillStyle = 'rgba(186, 230, 253, 0.7)';
    ctx.fillRect(-beakerW / 2 + 5, -beakerH / 2 + 30, beakerW - 10, beakerH - 35);

    // Label: "Water"
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Water', 0, 0);

    // Glass walls & Graduated markings
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-beakerW / 2, -beakerH / 2);
    ctx.lineTo(-beakerW / 2, beakerH / 2);
    ctx.lineTo(beakerW / 2, beakerH / 2);
    ctx.lineTo(beakerW / 2, -beakerH / 2);
    ctx.stroke();

    // Measurement ticks
    for (let ty = -beakerH / 2 + 20; ty < beakerH / 2 - 10; ty += 18) {
      ctx.beginPath();
      ctx.moveTo(-beakerW / 2, ty);
      ctx.lineTo(-beakerW / 2 + 10, ty);
      ctx.stroke();
    }

    // Submerged Heating Coil at bottom
    const isHeating = this.powerWatts > 0;
    ctx.strokeStyle = isHeating ? '#f97316' : '#64748b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-35, 52);
    ctx.bezierCurveTo(-15, 42, 15, 42, 35, 52);
    ctx.stroke();

    // Base coupler
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-25, 68, 50, 22);

    // ----------------------------------------
    // Precision Thermometer (right of beaker)
    // ----------------------------------------
    const thermoX = beakerW / 2 + 25;
    const thermoH = 150;

    // Thermometer stem & markings
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.fillRect(thermoX - 6, -thermoH / 2, 12, thermoH);
    ctx.strokeRect(thermoX - 6, -thermoH / 2, 12, thermoH);

    // Mercury Bulb at bottom
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(thermoX, thermoH / 2 + 4, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Red Mercury fluid level based on temperature (20°C -> 100°C)
    const tempPercent = (this.temperatureC - 20) / (100 - 20);
    const fluidHeight = tempPercent * (thermoH - 20);

    ctx.fillRect(thermoX - 4, (thermoH / 2) - fluidHeight, 8, fluidHeight);

    // Scale graduation lines
    for (let ty = -thermoH / 2 + 10; ty <= thermoH / 2 - 10; ty += 14) {
      ctx.beginPath();
      ctx.moveTo(thermoX - 6, ty);
      ctx.lineTo(thermoX - 12, ty);
      ctx.stroke();
    }

    // Indicator Arrow Marker at current temperature
    const markerY = (thermoH / 2) - fluidHeight;
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(thermoX - 18, markerY);
    ctx.lineTo(thermoX - 8, markerY - 7);
    ctx.lineTo(thermoX - 8, markerY + 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Boiling steam particles above beaker
    for (const p of this.steamParticles) {
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x - (x), p.y - (y), p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawIncandescentBulb(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    const isGlowing = this.powerWatts > 0;
    const brightness = isGlowing ? this.powerWatts / 650 : 0;

    // Glowing aura
    if (isGlowing) {
      const glowGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 90);
      glowGrad.addColorStop(0, `rgba(254, 240, 138, ${0.4 + brightness * 0.5})`);
      glowGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 90, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glass bulb
    ctx.fillStyle = isGlowing ? '#fef08a' : 'rgba(241, 245, 249, 0.7)';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -10, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Filament
    ctx.strokeStyle = isGlowing ? '#ea580c' : '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-12, 10);
    ctx.lineTo(-6, -18);
    ctx.lineTo(6, -18);
    ctx.lineTo(12, 10);
    ctx.stroke();

    // Base screw
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-18, 30, 36, 30);

    ctx.restore();
  }

  drawFluorescentBulb(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    const isGlowing = this.powerWatts > 0;

    // Spiral Glass tube
    ctx.fillStyle = isGlowing ? '#ffffff' : '#e2e8f0';
    ctx.strokeStyle = isGlowing ? '#38bdf8' : '#64748b';
    ctx.lineWidth = 4;

    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, -30 + i * 20, 24, 0, Math.PI);
      ctx.stroke();
    }

    // Base
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-16, 35, 32, 25);
    ctx.restore();
  }

  drawElectricFan(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Stand
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(0, 90);
    ctx.stroke();

    // Guard cage
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -10, 50, 0, Math.PI * 2);
    ctx.stroke();

    // Spinning Blades
    ctx.save();
    ctx.translate(0, -10);
    ctx.rotate(this.fanAngle);

    ctx.fillStyle = '#0284c7';
    for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / 3) {
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * 25, Math.sin(a) * 25, 24, 10, a, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Airflow lines if spinning
    if (this.powerWatts > 0) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const lineY = -30 + i * 20;
        ctx.beginPath();
        ctx.moveTo(60, lineY);
        ctx.lineTo(110 + (Math.random() * 20), lineY);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  drawEnergyParticles(ctx) {
    // Render floating energy symbol boxes: [ E ]
    for (const ep of this.energyParticles) {
      ctx.save();
      ctx.translate(ep.x, ep.y);

      let color = '#3b82f6'; // Electrical
      if (ep.type === 'mechanical') color = '#f59e0b';
      if (ep.type === 'thermal') color = '#ef4444';
      if (ep.type === 'light') color = '#eab308';
      if (ep.type === 'chemical') color = '#10b981';

      ctx.fillStyle = color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-9, -9, 18, 18, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('E', 0, 0);

      ctx.restore();
    }
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}
