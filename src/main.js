// ============================================================
// ELEMENTIA — Main Game Controller
// State engine, scoring, UI binding, quest progression
// ============================================================
import { SceneManager } from './scene_manager.js';
import { AudioEngine } from './audio.js';
import { StatesOfMatterSimulation } from './sim_states_of_matter.js';
import { MolecularArchitectSimulation } from './sim_molecular_architect.js';
import { EnergySystemsSimulator } from './sim_energy_system.js';
import { DialogueModalEngine } from './dialogue_modal.js';
import { CHALLENGES } from './game_challenges.js';
import { RewardFX } from './reward_fx.js';
import {
  ZONES, ELEMENTS, COMPOUNDS, MATERIALS, STATES_OF_MATTER,
  PHASE_CHANGES, WATER_CYCLE, SEPARATION_METHODS, MUDDLER_PILE,
  SCORING, RANKS, MENTOR_DIALOGUES, getRank,
} from './game_data.js';

class Game {
  constructor() {
    this.ip = 0;
    this.currentZone = 0;
    this.temperature = 300;
    this.activeTool = null;
    this.completedQuests = new Set();
    this.activatedElements = new Set();
    this.waterCycleStage = 0;
    this.moleculeSlots = [];
    this.separatedItems = new Set();
    this.hintsUsed = new Set();

    this.theme = localStorage.getItem('elementia_theme') || 'bright';
    this.voiceEnabled = localStorage.getItem('elementia_voice') !== 'false';
    this.lastZephyrText = '';
    this.lastNovaText = '';

    this.challengeIndex = 0;
    this.energySim = null;
    this.statesSim = null;
    this.molecularSim = null;
    this.dialogueModal = null;
    this.rewardFX = null;
    this.metricGoalAchieved = false;

    this.audio = new AudioEngine();
    this.scene = null;
    window._game = this;

    this._waitForDOM();
  }

  _waitForDOM() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._init());
    } else {
      this._init();
    }
  }

  _init() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) { console.error('Canvas not found'); return; }

    // Show loading
    this._simulateLoading();

    // Init 3D scenes
    this.scene = new SceneManager(canvas);

    // Init reward celebration fx
    this.rewardFX = new RewardFX();

    // Apply saved or default theme
    this._applyTheme(this.theme);

    // Init scientific simulators
    this._initScientificSimulators();

    // Init bite-sized dialogue modal engine
    this.dialogueModal = new DialogueModalEngine();
    this.dialogueModal.speakerVoiceEnabled = this.voiceEnabled;

    // Bind PhET virtual labs portal
    this._bindPhetPortal();

    // Bind Magician vs Scientist challenge hub
    this._bindChallengeHub();

    // Bind all UI
    this._bindTopbar();
    this._bindSidebar();
    this._bindTracker();
    this._bindBottombar();
    this._bindWorkbenches();
    this._bindModals();
    this._bindKeyboard();

    // Set initial state
    this._switchZone(0);
    this._updateIP();
    this._updateRank();
    this._setTemperature(300);

    // Auto-launch Turn 1 bite-sized briefing modal after load
    setTimeout(() => {
      this._openTurnBriefing();
    }, 1100);

    // First-interaction audio init
    document.addEventListener('click', () => this.audio.init(), { once: true });
  }

  _openTurnBriefing() {
    const chal = CHALLENGES[this.challengeIndex % CHALLENGES.length];
    if (chal && chal.turn1_magicianSlides && this.dialogueModal) {
      this.dialogueModal.speakerVoiceEnabled = this.voiceEnabled;
      this.dialogueModal.startDialogue(chal.turn1_magicianSlides, () => {
        this._updateMissionBanner();
      });
    }
  }

  // ── Loading Screen ──
  _simulateLoading() {
    const bar = document.querySelector('.loading-bar-fill');
    const screen = document.getElementById('loading-screen');
    if (!bar || !screen) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5 + Math.random() * 12;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          screen.classList.add('fade-out');
          setTimeout(() => { screen.style.display = 'none'; }, 800);
        }, 400);
      }
      bar.style.width = progress + '%';
    }, 120);
  }

  // ── Topbar ──
  _bindTopbar() {
    const tabs = document.querySelectorAll('.zone-tab');
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        this.audio.playClick();
        this._switchZone(i);
      });
    });

    // Theme Toggle Button
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        this.audio.playClick();
        this.toggleTheme();
      });
      this._updateThemeButton();
    }

    // Voice Toggle Button
    const voiceBtn = document.getElementById('btn-voice-toggle');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        this.audio.playClick();
        this.toggleVoice();
      });
      this._updateVoiceButton();
    }
  }

  toggleTheme() {
    this.theme = (this.theme === 'bright') ? 'dark' : 'bright';
    localStorage.setItem('elementia_theme', this.theme);
    this._applyTheme(this.theme);
  }

  _applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    this._updateThemeButton();
    if (this.scene) {
      this.scene.setTheme(theme);
    }
  }

  _updateThemeButton() {
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    if (icon) icon.textContent = this.theme === 'bright' ? '☀️' : '🌙';
    if (text) text.textContent = this.theme === 'bright' ? 'Bright Mode' : 'Dark Mode';
  }

  toggleVoice() {
    this.voiceEnabled = !this.voiceEnabled;
    localStorage.setItem('elementia_voice', this.voiceEnabled ? 'true' : 'false');
    this._updateVoiceButton();
    if (this.dialogueModal) {
      this.dialogueModal.speakerVoiceEnabled = this.voiceEnabled;
    }
    if (!this.voiceEnabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  _updateVoiceButton() {
    const icon = document.getElementById('voice-icon');
    const text = document.getElementById('voice-text');
    if (icon) icon.textContent = this.voiceEnabled ? '🔊' : '🔇';
    if (text) text.textContent = this.voiceEnabled ? 'Voice On' : 'Voice Off';
  }

  _switchZone(index) {
    this.currentZone = index;
    const zoneIds = ['matter', 'matter', 'atomic', 'water-cycle', 'periodic', 'matter'];
    const zoneTitles = [
      { name: 'Energy Systems Lab', subtitle: 'PhET-Inspired Mechanical, Electrical & Thermal Transfers — Level 1' },
      { name: 'States of Matter Simulator', subtitle: 'Kinetic Particle Chamber — NCERT Level 2' },
      { name: '3D Molecular Architect', subtitle: 'Chemical Polarity & Geometry — NCERT Level 3' },
      { name: 'Skybound Falls', subtitle: '3D Water Cycle Simulation — NCERT Level 4' },
      { name: 'The Periodic Amphitheater', subtitle: 'Elemental Shards & Separation — NCERT Level 5' },
      { name: 'PhET Virtual Lab Portal', subtitle: 'Interactive Colorado Physics & Chemistry Sandbox' },
    ];

    const currentInfo = zoneTitles[index] || zoneTitles[0];

    // Update tabs
    document.querySelectorAll('.zone-tab').forEach((t, i) => {
      t.classList.toggle('active', i === index);
    });

    // Update title
    const titleEl = document.querySelector('.realm-title h1');
    const subtitleEl = document.querySelector('.realm-subtitle');
    if (titleEl) titleEl.textContent = currentInfo.name;
    if (subtitleEl) subtitleEl.textContent = currentInfo.subtitle;

    // Switch 3D background scene
    if (this.scene && zoneIds[index]) {
      this.scene.switchZone(zoneIds[index]);
    }

    // Toggle simulation views vs exploration view
    const energyView = document.getElementById('sim-energy-system-view');
    const statesView = document.getElementById('sim-states-view');
    const molecularView = document.getElementById('sim-molecular-view');
    const phetView = document.getElementById('phet-portal-view');
    const quickWb = document.getElementById('quick-workbench');

    if (energyView) energyView.style.display = (index === 0) ? 'flex' : 'none';
    if (statesView) statesView.style.display = (index === 1) ? 'flex' : 'none';
    if (molecularView) molecularView.style.display = (index === 2) ? 'flex' : 'none';
    if (quickWb) quickWb.style.display = (index === 3 || index === 4) ? 'flex' : 'none';
    if (phetView) phetView.style.display = (index === 5) ? 'flex' : 'none';

    // Update sidebar content
    this._updateSidebarForZone(index);

    // Update center workbenches
    this._updateWorkbenchesForZone(index);

    // Update tracker / quests
    this._updateTrackerForZone(index);

    // Update mission banner
    this._updateMissionBanner();

    // Update mentor dialogue for active challenge or zone
    const chal = CHALLENGES[this.challengeIndex % CHALLENGES.length];
    if (chal && index === 0 && chal.turn1_magicianSlides) {
      this._setMentorDialogue(chal.turn1_magicianSlides[0].text, chal.turn2_playerGoal ? chal.turn2_playerGoal.action : '');
    } else if (ZONES[index]) {
      this._setMentorDialogue(ZONES[index].mentorIntro.zephyr, ZONES[index].mentorIntro.nova);
    }

    // Update action buttons
    this._updateActionsForZone(index);
  }

  // ── Scientific Simulator Engines ──
  _initScientificSimulators() {
    // 0. Energy Systems Simulator (PhET-inspired)
    const energyContainer = document.getElementById('sim-energy-system-view');
    if (energyContainer && !this.energySim) {
      this.energySim = new EnergySystemsSimulator('sim-energy-system-view');
      this.energySim.onMetricChange = (data) => {
        this._checkEnergyMetricGoal(data);
      };
    }

    // 1. States of Matter Simulator
    const statesContainer = document.getElementById('states-sim-canvas');
    if (statesContainer) {
      this.statesSim = new StatesOfMatterSimulation(statesContainer, (telemetry) => {
        const stateEl = document.getElementById('sim-state-val');
        const keEl = document.getElementById('sim-ke-val');
        if (stateEl) stateEl.textContent = telemetry.state;
        if (keEl) keEl.textContent = telemetry.kineticEnergy;
      });

      const tempSlider = document.getElementById('sim-temp-slider');
      const tempNum = document.getElementById('sim-temp-num');
      const matSelect = document.getElementById('sim-material-select');
      const pressSelect = document.getElementById('sim-pressure-select');

      if (tempSlider && tempNum) {
        tempSlider.addEventListener('input', (e) => {
          const val = parseInt(e.target.value);
          tempNum.value = val;
          this.statesSim.setTemperature(val);
          this._setTemperature(val);
        });
        tempNum.addEventListener('input', (e) => {
          const val = parseInt(e.target.value) || 211;
          tempSlider.value = val;
          this.statesSim.setTemperature(val);
          this._setTemperature(val);
        });
      }

      if (matSelect) {
        matSelect.addEventListener('change', (e) => {
          this.audio.playClick();
          this.statesSim.setMaterial(e.target.value);
        });
      }

      if (pressSelect) {
        pressSelect.addEventListener('change', (e) => {
          this.audio.playClick();
          this.statesSim.setPressure(e.target.value);
        });
      }
    }

    // 2. 3D Molecular Architect
    const molContainer = document.getElementById('molecular-sim-canvas');
    if (molContainer) {
      this.molecularSim = new MolecularArchitectSimulation(molContainer, (info) => {
        const formEl = document.getElementById('mol-formula-val');
        const bondEl = document.getElementById('mol-bond-val');
        const atomEl = document.getElementById('mol-atoms-val');
        if (formEl) formEl.textContent = info.formula;
        if (bondEl) bondEl.textContent = info.bondType;
        if (atomEl) atomEl.textContent = info.totalAtoms;
      });

      const templateSelect = document.getElementById('mol-template-select');
      const styleSelect = document.getElementById('mol-style-select');
      const resetBtn = document.getElementById('mol-reset-btn');

      if (templateSelect) {
        templateSelect.addEventListener('change', (e) => {
          this.audio.playClick();
          this.molecularSim.setTemplate(e.target.value);
        });
      }
      if (styleSelect) {
        styleSelect.addEventListener('change', (e) => {
          this.audio.playClick();
          this.molecularSim.setModelStyle(e.target.value);
        });
      }
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.audio.playClick();
          this.molecularSim.reset();
        });
      }
    }
  }

  _checkEnergyMetricGoal(data) {
    const chal = CHALLENGES[this.challengeIndex % CHALLENGES.length];
    if (chal && chal.id === 'energy-system-trick' && !this.metricGoalAchieved) {
      if (data.isBoiling || data.temperatureC >= 100.0) {
        this.metricGoalAchieved = true;
        this.audio.playSuccess();

        // Launch Turn 3: Scientist's Deduction Slides
        if (this.dialogueModal && chal.turn3_scientistSlides) {
          setTimeout(() => {
            this.dialogueModal.speakerVoiceEnabled = this.voiceEnabled;
            this.dialogueModal.startDialogue(chal.turn3_scientistSlides, () => {
              this._openChallengeProofModal();
            });
          }, 300);
        }
      }
    }
  }

  // ── PhET Virtual Labs Portal ──
  _bindPhetPortal() {
    const phetUrls = {
      'polarity': 'https://phet.colorado.edu/sims/html/molecule-polarity/latest/molecule-polarity_all.html',
      'states': 'https://phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics_all.html',
      'shapes': 'https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_all.html',
      'static': 'https://phet.colorado.edu/sims/html/balloons-and-static-electricity/latest/balloons-and-static-electricity_all.html',
      'energy': 'https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes_all.html'
    };

    const iframe = document.getElementById('phet-embed-frame');
    document.querySelectorAll('.phet-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.audio.playClick();
        document.querySelectorAll('.phet-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const simKey = btn.dataset.phet;
        if (iframe && phetUrls[simKey]) {
          iframe.src = phetUrls[simKey];
        }
      });
    });
  }

  // ── Magician vs Scientist Challenge Hub ──
  _bindChallengeHub() {
    document.getElementById('btn-open-proof')?.addEventListener('click', () => {
      this.audio.playClick();
      this._openChallengeProofModal();
    });

    document.getElementById('btn-open-briefing')?.addEventListener('click', () => {
      this.audio.playClick();
      this._openTurnBriefing();
    });
  }

  _openChallengeProofModal() {
    const chal = CHALLENGES[this.challengeIndex % CHALLENGES.length];
    if (!chal) return;

    const modal = document.getElementById('proof-modal');
    if (!modal) return;
    modal.classList.add('visible');

    const title = document.getElementById('proof-title');
    const body = document.getElementById('proof-body');
    const options = document.getElementById('proof-options');

    if (title) title.innerHTML = `🔬 Scientist's Proof: ${chal.title}`;
    
    const mysteryText = chal.turn1_magicianSlides ? chal.turn1_magicianSlides[0].text : (chal.magicianTrick ? chal.magicianTrick.dialogue : '');

    if (body) {
      body.innerHTML = `
        <div style="background:var(--cyan-dim);border:1px solid var(--border-glass);padding:14px;border-radius:var(--radius-md);margin-bottom:14px;">
          <div style="font-weight:700;color:var(--magenta);font-size:0.85rem;margin-bottom:4px;">🧙‍♂️ Zephyr's Mystery:</div>
          <div style="font-style:italic;color:var(--text-primary);font-size:0.88rem;">"${mysteryText}"</div>
        </div>
        <div style="font-weight:700;color:var(--cyan);font-size:0.95rem;margin-bottom:8px;">${chal.quiz.question}</div>
      `;
    }

    if (options) {
      options.innerHTML = chal.quiz.options.map((opt, i) => `
        <button class="action-btn secondary opt-choice-btn" data-opt-idx="${i}" style="text-align:left;line-height:1.4;padding:12px 16px;">
          <span style="font-weight:700;color:var(--gold);margin-right:6px;">${['A', 'B', 'C'][i]}.</span> ${opt.text}
        </button>
      `).join('');

      options.querySelectorAll('.opt-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.optIdx);
          this._submitChallengeAnswer(chal, idx);
        });
      });
    }
  }

  _submitChallengeAnswer(chal, selectedIndex) {
    const modal = document.getElementById('proof-modal');
    const opt = chal.quiz.options[selectedIndex];

    if (opt.correct) {
      this.audio.playSuccess();
      if (modal) modal.classList.remove('visible');

      // Trigger spectacular victory reward animation!
      if (this.rewardFX) {
        this.rewardFX.triggerVictory('Scientific Proof Validated!', `+${chal.rewardIP} Insight Points Earned`);
      }

      this._awardIP(chal.rewardIP, 'proof');

      // Mentors speaking reaction
      this._setMentorDialogue(chal.zephyrReaction, opt.explanation);

      // Advance to next challenge
      this.challengeIndex++;
      this.metricGoalAchieved = false;
      this._updateMissionBanner();

      // Show Zephyr's concession slide in dialogue modal
      if (this.dialogueModal) {
        setTimeout(() => {
          this.dialogueModal.speakerVoiceEnabled = this.voiceEnabled;
          this.dialogueModal.startDialogue([
            {
              speaker: 'Zephyr the Magician',
              avatar: 'assets/zephyr_portrait.png',
              title: 'Illusion Broken by Science!',
              text: chal.zephyrReaction,
              buttonText: '🌟 Next Mystery'
            }
          ], () => {
            this._openTurnBriefing();
          });
        }, 1600);
      }
    } else {
      this.audio.playFizzle();
      alert(`Not quite scientific: ${opt.explanation}\n\nReview the simulation and try again!`);
    }
  }

  // ── Sidebar ──
  _bindSidebar() {
    // Thermal slider
    const slider = document.getElementById('thermal-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        this._setTemperature(parseInt(e.target.value));
      });
    }

    // Element cards
    document.querySelectorAll('.element-card').forEach(card => {
      card.addEventListener('click', () => {
        this.audio.playClick();
        const sym = card.dataset.symbol;
        if (sym) this._onElementSelect(sym, card);
      });
    });

    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.audio.playClick();
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTool = btn.dataset.tool;
      });
    });

    // Separation tools
    document.querySelectorAll('.sep-tool').forEach(tool => {
      tool.addEventListener('click', () => {
        this.audio.playClick();
        document.querySelectorAll('.sep-tool').forEach(t => t.classList.remove('active'));
        tool.classList.add('active');
        this._onSeparationTool(tool.dataset.method);
      });
    });
  }

  _setTemperature(kelvin) {
    this.temperature = kelvin;
    const valEl = document.getElementById('thermal-value');
    if (valEl) {
      valEl.textContent = kelvin + ' K';
      valEl.className = 'thermal-value ' + (kelvin < 273 ? 'cold' : kelvin < 373 ? 'warm' : 'hot');
    }

    // Update tracker stats
    this._updateStatValue('stat-temp', kelvin + ' K');

    // Determine state
    let state = 'solid';
    if (kelvin >= 373) state = 'gas';
    else if (kelvin >= 273) state = 'liquid';
    this._updateStatValue('stat-state', STATES_OF_MATTER[state].name);
    this._updateStatValue('stat-particles', STATES_OF_MATTER[state].particles.substring(0, 40) + '…');
    this._updateStatValue('stat-density', state === 'solid' ? 'High' : state === 'liquid' ? 'Medium' : 'Low');

    // Update 3D scene
    if (this.scene) this.scene.setTemperature(kelvin);
  }

  _updateSidebarForZone(index) {
    const sections = {
      elements: document.getElementById('sidebar-elements'),
      thermal: document.getElementById('sidebar-thermal'),
      tools: document.getElementById('sidebar-tools'),
      molecule: document.getElementById('sidebar-molecule'),
      cycle: document.getElementById('sidebar-cycle'),
      separation: document.getElementById('sidebar-separation'),
      periodic: document.getElementById('sidebar-periodic'),
    };

    // Hide all
    Object.values(sections).forEach(s => { if (s) s.style.display = 'none'; });

    // Show relevant
    switch (index) {
      case 0: // Matter
        if (sections.thermal) sections.thermal.style.display = '';
        if (sections.tools) sections.tools.style.display = '';
        break;
      case 1: // Atomic
        if (sections.elements) sections.elements.style.display = '';
        if (sections.molecule) sections.molecule.style.display = '';
        break;
      case 2: // Water Cycle
        if (sections.cycle) sections.cycle.style.display = '';
        if (sections.thermal) sections.thermal.style.display = '';
        break;
      case 3: // Periodic
        if (sections.periodic) sections.periodic.style.display = '';
        if (sections.separation) sections.separation.style.display = '';
        break;
    }
  }

  // ── Element Selection (Zone 2) ──
  _onElementSelect(symbol, card) {
    const compound = COMPOUNDS[0]; // Water H₂O target
    const needed = compound.formulaParts;

    // Check if element is part of target formula
    const part = needed.find(p => p.symbol === symbol);
    if (!part) {
      this.audio.playFizzle();
      this._setMentorDialogue(
        MENTOR_DIALOGUES.sort_wrong.zephyr,
        `${symbol} isn't part of ${compound.formula}. We need ${needed.map(n => n.symbol).join(' and ')}.`
      );
      return;
    }

    // Count current slots filled for this element
    const filled = this.moleculeSlots.filter(s => s === symbol).length;
    if (filled >= part.count) {
      this.audio.playFizzle();
      return; // Already enough of this element
    }

    this.moleculeSlots.push(symbol);
    card.classList.add('active');

    // Update molecule builder UI
    this._updateMoleculeUI();

    // Check if molecule complete
    const isComplete = needed.every(p =>
      this.moleculeSlots.filter(s => s === p.symbol).length >= p.count
    );

    if (isComplete) {
      this.audio.playBond();
      this._awardIP(SCORING.CORRECT_ACTION, 'bonus');
      this._setMentorDialogue(
        MENTOR_DIALOGUES.bond_success.zephyr,
        MENTOR_DIALOGUES.bond_success.nova
      );
      this._completeQuest('build-molecule');
      this._showProofChallenge('bond');
    }
  }

  _updateMoleculeUI() {
    const slots = document.querySelectorAll('.atom-slot');
    const bonds = document.querySelectorAll('.bond-line');
    // Slots order: H, O, H
    const slotMap = ['H', 'O', 'H'];
    let hCount = 0, oCount = 0;

    slotMap.forEach((expected, i) => {
      let filled = false;
      if (expected === 'H') {
        hCount++;
        filled = this.moleculeSlots.filter(s => s === 'H').length >= hCount;
      } else {
        oCount++;
        filled = this.moleculeSlots.filter(s => s === 'O').length >= oCount;
      }
      if (slots[i]) {
        slots[i].classList.toggle('filled', filled);
        if (expected === 'O') slots[i].classList.toggle('oxygen', filled);
        slots[i].textContent = filled ? expected : '?';
      }
    });

    bonds.forEach((b, i) => {
      const leftFilled = slots[i] && slots[i].classList.contains('filled');
      const rightFilled = slots[i + 1] && slots[i + 1].classList.contains('filled');
      b.classList.toggle('active', leftFilled && rightFilled);
    });

    const formulaEl = document.querySelector('.formula-display');
    if (formulaEl) {
      const h = this.moleculeSlots.filter(s => s === 'H').length;
      const o = this.moleculeSlots.filter(s => s === 'O').length;
      if (h === 2 && o === 1) {
        formulaEl.textContent = '✨ H₂O — Water! ✨';
        formulaEl.style.color = 'var(--gold)';
      } else {
        formulaEl.textContent = `Building: H×${h} O×${o}`;
        formulaEl.style.color = 'var(--text-secondary)';
      }
    }
  }

  // ── Water Cycle (Zone 3) ──
  _advanceWaterCycle() {
    if (this.waterCycleStage >= 4) return;

    const stage = WATER_CYCLE[this.waterCycleStage];
    this.audio.playSuccess();
    this._awardIP(SCORING.CORRECT_ACTION, 'bonus');

    // Update stage indicators
    const stageEls = document.querySelectorAll('.cycle-stage');
    if (stageEls[this.waterCycleStage]) {
      stageEls[this.waterCycleStage].classList.remove('active');
      stageEls[this.waterCycleStage].classList.add('complete');
    }

    this.waterCycleStage++;

    if (this.waterCycleStage < 4) {
      if (stageEls[this.waterCycleStage]) {
        stageEls[this.waterCycleStage].classList.add('active');
      }
      const next = WATER_CYCLE[this.waterCycleStage];
      this._setMentorDialogue(
        `Next up: ${next.stage}! ${next.icon} Let me show you something spectacular…`,
        `${next.desc}. The cause? ${next.cause}.`
      );

      // Play appropriate sound
      if (next.stage === 'Evaporation') this.audio.playEvaporation();
      else if (next.stage === 'Precipitation') this.audio.playRain();
      else if (next.stage === 'Collection') this.audio.playStream();

      if (this.scene) this.scene.setWaterCycleStage(next.stage);
    } else {
      this._awardIP(SCORING.GUARDIAN_CYCLE, 'wisdom');
      this._setMentorDialogue(
        MENTOR_DIALOGUES.cycle_complete.zephyr,
        MENTOR_DIALOGUES.cycle_complete.nova
      );
      this._completeQuest('water-cycle');
      this._showProofChallenge('cycle');
    }
  }

  // ── Separation (Zone 4) ──
  _onSeparationTool(methodName) {
    const method = SEPARATION_METHODS.find(m => m.name === methodName);
    if (!method) return;

    // Find a matching unseparated item
    const target = MUDDLER_PILE.find(p =>
      p.separatedBy === methodName && !this.separatedItems.has(p.substance)
    );

    if (target) {
      this.separatedItems.add(target.substance);
      this.audio['play' + (method.sound.charAt(0).toUpperCase() + method.sound.slice(1))]?.() || this.audio.playSuccess();
      this._awardIP(SCORING.CORRECT_ACTION + 5, 'bonus'); // +15 per correct separation

      this._setMentorDialogue(
        MENTOR_DIALOGUES.separation_correct.zephyr,
        `${method.desc}. ${target.substance} is a ${target.type} — ${target.type === 'compound' ? 'a pure substance with a fixed formula' : target.type === 'element' ? 'a pure substance made of one kind of atom' : 'a physical combination separable by physical means'}.`
      );

      // Activate corresponding crystal
      if (this.scene) {
        const related = ELEMENTS.find(e => e.name.toLowerCase().includes(target.substance.split(' ')[0]));
        if (related) this.scene.activateCrystal(related.symbol);
      }

      this._completeQuest('separate-' + target.substance.replace(/\s/g, '-'));

      // Check if all separated
      if (this.separatedItems.size >= MUDDLER_PILE.length) {
        this._awardIP(SCORING.HARMONY_SHARD, 'proof');
        this.audio.playLevelUp();
        this._setMentorDialogue(
          'THE MUDDLER IS REFORMED! Every substance sorted, every rule revealed! You\'re incredible! 🎆',
          'You\'ve demonstrated mastery of separation techniques. The Harmony Shard is yours — +100 IP!'
        );
        this._completeQuest('harmony-shard');
      }
    } else {
      this.audio.playFizzle();
      this._setMentorDialogue(
        'Hmm, that tool doesn\'t seem to grab anything new from the pile…',
        `A ${methodName.toLowerCase()} works on ${method.targets.join(', ')}. Try a different tool for the remaining substances.`
      );
    }
  }

  // ── Periodic Table Crystal activation (Zone 4) ──
  _onCrystalActivate(symbol) {
    if (this.activatedElements.has(symbol)) return;
    this.activatedElements.add(symbol);

    const el = ELEMENTS.find(e => e.symbol === symbol);
    if (!el) return;

    this.audio.playSuccess();
    this._awardIP(SCORING.CORRECT_ACTION, 'bonus');

    if (this.scene) this.scene.activateCrystal(symbol);

    // Update periodic mini grid
    const cell = document.querySelector(`.ptable-cell[data-symbol="${symbol}"]`);
    if (cell) cell.classList.add('activated');

    this._setMentorDialogue(
      `${el.name}! Symbol: ${el.symbol}. ${el.fact}! ✨`,
      `Atomic number ${el.number}, mass ${el.mass}. In the real world: ${el.realObject}.`
    );

    this._completeQuest('activate-' + symbol);
  }

  // ── Tracker ──
  _bindTracker() {
    // Particle viz canvas (mini)
    this._initParticleViz();
  }

  _initParticleViz() {
    const vizCanvas = document.getElementById('particle-viz-canvas');
    if (!vizCanvas) return;
    const ctx = vizCanvas.getContext('2d');
    vizCanvas.width = vizCanvas.offsetWidth * 2;
    vizCanvas.height = vizCanvas.offsetHeight * 2;

    this._particleVizCtx = ctx;
    this._particleVizDots = [];
    for (let i = 0; i < 60; i++) {
      this._particleVizDots.push({
        x: Math.random() * vizCanvas.width,
        y: Math.random() * vizCanvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        r: 3 + Math.random() * 3,
      });
    }
    this._animateParticleViz();
  }

  _animateParticleViz() {
    requestAnimationFrame(() => this._animateParticleViz());
    const ctx = this._particleVizCtx;
    if (!ctx) return;
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const speed = Math.max(0.2, (this.temperature - 200) / 200);
    let color = '#a8d8ea';
    if (this.temperature >= 373) color = '#b388ff';
    else if (this.temperature >= 273) color = '#4fc3f7';

    this._particleVizDots.forEach(dot => {
      dot.x += dot.vx * speed;
      dot.y += dot.vy * speed;
      if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
      if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;
      dot.x = Math.max(0, Math.min(canvas.width, dot.x));
      dot.y = Math.max(0, Math.min(canvas.height, dot.y));

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.r + 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  _updateTrackerForZone(index) {
    const questList = document.getElementById('quest-list');
    if (!questList) return;

    const quests = this._getQuestsForZone(index);
    questList.innerHTML = quests.map(q => `
      <div class="quest-item ${this.completedQuests.has(q.id) ? 'complete' : ''}" data-quest="${q.id}">
        <span class="quest-check">${this.completedQuests.has(q.id) ? '✓' : ''}</span>
        <span>${q.text}</span>
      </div>
    `).join('');
  }

  _getQuestsForZone(index) {
    switch (index) {
      case 0: return [
        { id: 'sort-materials', text: 'Sort materials by properties' },
        { id: 'observe-solid', text: 'Observe solid particle arrangement' },
        { id: 'observe-liquid', text: 'Observe liquid particle arrangement' },
        { id: 'observe-gas', text: 'Observe gas particle arrangement' },
        { id: 'trigger-melt', text: 'Trigger a melting transition' },
        { id: 'trigger-boil', text: 'Trigger a boiling transition' },
      ];
      case 1: return [
        { id: 'build-molecule', text: 'Build a water molecule (H₂O)' },
        { id: 'prove-compound', text: 'Explain compound vs element' },
        { id: 'learn-formula', text: 'Understand chemical formulae' },
      ];
      case 2: return [
        { id: 'water-cycle', text: 'Complete the full water cycle' },
        { id: 'prove-evaporation', text: 'Explain why evaporation happens' },
        { id: 'guardian-bonus', text: 'Earn Guardian of the Cycle bonus' },
      ];
      case 3: return [
        { id: 'activate-H', text: 'Activate Hydrogen crystal' },
        { id: 'activate-O', text: 'Activate Oxygen crystal' },
        { id: 'activate-C', text: 'Activate Carbon crystal' },
        { id: 'activate-Fe', text: 'Activate Iron crystal' },
        { id: 'separate-iron filings', text: 'Separate iron filings (magnet)' },
        { id: 'separate-sand', text: 'Separate sand (filter)' },
        { id: 'separate-salt', text: 'Separate salt (evaporation)' },
        { id: 'harmony-shard', text: '🏆 Earn the Harmony Shard (+100 IP)' },
      ];
      default: return [];
    }
  }

  _updateStatValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // ── Bottom Bar / Mentors ──
  _bindBottombar() {
    // Action buttons
    document.getElementById('btn-primary')?.addEventListener('click', () => this._onPrimaryAction());
    document.getElementById('btn-secondary')?.addEventListener('click', () => this._onSecondaryAction());
    document.getElementById('btn-wisdom')?.addEventListener('click', () => this._onWisdomChoice());

    // Speech replay buttons
    document.getElementById('speak-zephyr-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.audio.playClick();
      this._speak('zephyr', this.lastZephyrText || 'Behold! Welcome to Elementia!');
    });

    document.getElementById('speak-nova-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.audio.playClick();
      this._speak('nova', this.lastNovaText || 'Welcome Explorer. Let us uncover the science of matter!');
    });
  }

  _speak(speaker, text) {
    if (!this.voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // Stop current speech
      // Clean text: remove emojis and markdown formatting
      const clean = text
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .replace(/[*_#~]/g, '')
        .replace(/—/g, ', ')
        .trim();
      if (!clean) return;

      const utter = new SpeechSynthesisUtterance(clean);
      utter.lang = 'en-US';
      if (speaker === 'zephyr') {
        utter.pitch = 1.25;
        utter.rate = 1.05;
      } else {
        utter.pitch = 0.95;
        utter.rate = 0.95;
      }

      const frame = document.querySelector(`.${speaker}-frame`);
      if (frame) frame.classList.add('speaking');

      utter.onend = () => {
        if (frame) frame.classList.remove('speaking');
      };
      utter.onerror = () => {
        if (frame) frame.classList.remove('speaking');
      };

      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  _setMentorDialogue(zephyrText, novaText) {
    this.lastZephyrText = zephyrText;
    this.lastNovaText = novaText;

    const zEl = document.getElementById('zephyr-dialogue');
    const nEl = document.getElementById('nova-dialogue');
    const zFrame = document.querySelector('.zephyr-frame');
    const nFrame = document.querySelector('.nova-frame');

    if (zEl) {
      zEl.textContent = zephyrText;
      if (zFrame) {
        zFrame.classList.add('speaking');
        setTimeout(() => zFrame.classList.remove('speaking'), 2000);
      }
    }
    if (nEl) {
      nEl.textContent = novaText;
      if (nFrame) {
        nFrame.classList.add('speaking');
        setTimeout(() => nFrame.classList.remove('speaking'), 2500);
      }
    }

    // Narrate via Web Speech API
    if (zephyrText) {
      this._speak('zephyr', zephyrText);
    }
  }

  _updateActionsForZone(index) {
    const primary = document.getElementById('btn-primary');
    const secondary = document.getElementById('btn-secondary');
    const wisdom = document.getElementById('btn-wisdom');

    switch (index) {
      case 0:
        if (primary) primary.textContent = '🔍 Activate Veritas Lens';
        if (secondary) secondary.textContent = '📝 Scientist\'s Proof';
        if (wisdom) wisdom.textContent = '🧠 Nova\'s Evidence Method';
        break;
      case 1:
        if (primary) primary.textContent = '⚛️ Bond Atoms';
        if (secondary) secondary.textContent = '📝 Explain Compound';
        if (wisdom) wisdom.textContent = '🧪 Reset Crucible';
        break;
      case 2:
        if (primary) primary.textContent = '💧 Advance Cycle Stage';
        if (secondary) secondary.textContent = '📝 Name the Cause';
        if (wisdom) wisdom.textContent = '🌿 Divert Through Fields';
        break;
      case 3:
        if (primary) primary.textContent = '💎 Activate Crystal';
        if (secondary) secondary.textContent = '📝 Classify Substance';
        if (wisdom) wisdom.textContent = '🔬 Separate Next';
        break;
    }
  }

  _onPrimaryAction() {
    this.audio.playClick();
    switch (this.currentZone) {
      case 0:
        // Activate Veritas Lens — trigger freeze effect
        this.audio.playFreeze();
        if (this.temperature >= 373) {
          this._completeQuest('observe-gas');
          this._awardIP(SCORING.CORRECT_ACTION, 'bonus');
        } else if (this.temperature >= 273) {
          this._completeQuest('observe-liquid');
          this._awardIP(SCORING.CORRECT_ACTION, 'bonus');
        } else {
          this._completeQuest('observe-solid');
          this._awardIP(SCORING.CORRECT_ACTION, 'bonus');
        }
        const state = this.temperature < 273 ? 'solid' : this.temperature < 373 ? 'liquid' : 'gas';
        const sData = STATES_OF_MATTER[state];
        this._setMentorDialogue(
          `Look through the Lens! The particles are ${state === 'solid' ? 'locked tight and vibrating' : state === 'liquid' ? 'sliding past each other' : 'zooming freely everywhere'}! ✨`,
          `${sData.name}: ${sData.description}. ${sData.particles}.`
        );
        break;
      case 1:
        this._showProofChallenge('bond');
        break;
      case 2:
        this._advanceWaterCycle();
        break;
      case 3:
        // Activate next unactivated crystal
        const nextEl = ELEMENTS.find(e =>
          ['H', 'O', 'C', 'Fe', 'Na', 'Au', 'Cu', 'He'].includes(e.symbol) &&
          !this.activatedElements.has(e.symbol)
        );
        if (nextEl) this._onCrystalActivate(nextEl.symbol);
        break;
    }
  }

  _onSecondaryAction() {
    this.audio.playClick();
    this._showProofChallenge(this.currentZone === 0 ? 'state' : this.currentZone === 1 ? 'bond' : this.currentZone === 2 ? 'cycle' : 'separation');
  }

  _onWisdomChoice() {
    this.audio.playClick();
    switch (this.currentZone) {
      case 0:
        this._awardIP(SCORING.WISDOM_BONUS, 'wisdom');
        this._setMentorDialogue(
          MENTOR_DIALOGUES.wisdom_choice.zephyr,
          MENTOR_DIALOGUES.wisdom_choice.nova
        );
        break;
      case 1:
        // Reset molecule
        this.moleculeSlots = [];
        document.querySelectorAll('.element-card').forEach(c => c.classList.remove('active'));
        this._updateMoleculeUI();
        this._setMentorDialogue(
          'Crucible reset! Let\'s try building from scratch!',
          'Take your time. Remember: Water requires exactly 2 Hydrogen and 1 Oxygen.'
        );
        break;
      case 2:
        this._awardIP(SCORING.GUARDIAN_CYCLE, 'wisdom');
        this._completeQuest('guardian-bonus');
        this._setMentorDialogue(
          'You diverted Drip through the farmland! The fields are turning green! 🌾',
          'Real-world water conservation: diverting water for agriculture sustains communities. Guardian of the Cycle earned!'
        );
        break;
      case 3:
        // Auto-separate next item
        const nextSep = MUDDLER_PILE.find(p => !this.separatedItems.has(p.substance));
        if (nextSep) this._onSeparationTool(nextSep.separatedBy);
        break;
    }
  }

  // ── Scientist's Proof Challenges ──
  _showProofChallenge(type) {
    const modal = document.getElementById('proof-modal');
    if (!modal) return;
    modal.classList.add('visible');

    const title = document.getElementById('proof-title');
    const body = document.getElementById('proof-body');
    const options = document.getElementById('proof-options');

    let question = '', answers = [];

    switch (type) {
      case 'state':
        question = 'Why does this substance have this shape and volume behaviour?';
        const st = this.temperature < 273 ? 'solid' : this.temperature < 373 ? 'liquid' : 'gas';
        answers = [
          { text: STATES_OF_MATTER[st].particles, correct: true },
          { text: 'Because it is made of different elements', correct: false },
          { text: 'Because of its colour and texture', correct: false },
        ];
        break;
      case 'bond':
        question = 'Why are the properties of water (H₂O) different from hydrogen and oxygen gases?';
        answers = [
          { text: 'A compound\'s properties are completely different from the elements that formed it — new bonds create new behaviour', correct: true },
          { text: 'Water is just a mixture of hydrogen and oxygen', correct: false },
          { text: 'The elements don\'t actually change', correct: false },
        ];
        break;
      case 'cycle':
        question = 'What causes water to evaporate from the ocean surface?';
        answers = [
          { text: 'The Sun\'s heat energy increases the kinetic energy of water particles until they escape as vapour', correct: true },
          { text: 'Wind blows the water upward into the sky', correct: false },
          { text: 'The ocean pushes water out naturally', correct: false },
        ];
        break;
      case 'separation':
        question = 'Why can mixtures be separated by physical methods, but compounds cannot?';
        answers = [
          { text: 'In mixtures, substances retain their individual properties and aren\'t chemically bonded; compounds require chemical reactions to break apart', correct: true },
          { text: 'Mixtures are lighter than compounds', correct: false },
          { text: 'Compounds are always solid so they can\'t be filtered', correct: false },
        ];
        break;
    }

    if (title) title.textContent = '📝 Scientist\'s Proof Challenge';
    if (body) body.textContent = question;

    // Shuffle answers
    answers.sort(() => Math.random() - 0.5);

    if (options) {
      options.innerHTML = answers.map((a, i) => `
        <button class="action-btn ${a.correct ? 'primary' : 'secondary'}" data-correct="${a.correct}" onclick="window._game._onProofAnswer(${a.correct}, '${type}')">
          ${a.text}
        </button>
      `).join('');
    }
  }

  _onProofAnswer(correct, type) {
    const modal = document.getElementById('proof-modal');

    if (correct) {
      this.audio.playSuccess();
      this._awardIP(SCORING.SCIENTISTS_PROOF, 'proof');
      this._setMentorDialogue(
        MENTOR_DIALOGUES.scientists_proof.zephyr,
        MENTOR_DIALOGUES.scientists_proof.nova
      );
      this._completeQuest('prove-' + (type === 'bond' ? 'compound' : type === 'state' ? 'state' : type));
    } else {
      this.audio.playFizzle();
      this._setMentorDialogue(
        MENTOR_DIALOGUES.sort_wrong.zephyr,
        MENTOR_DIALOGUES.sort_wrong.nova
      );
    }

    if (modal) modal.classList.remove('visible');
  }

  // ── Modals ──
  _bindModals() {
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.modal-overlay')?.classList.remove('visible');
      });
    });

    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('visible');
      });
    });

    // Realm Report button
    document.getElementById('btn-realm-report')?.addEventListener('click', () => {
      this.audio.playClick();
      this._showRealmReport();
    });
  }

  _showRealmReport() {
    const modal = document.getElementById('report-modal');
    if (!modal) return;
    modal.classList.add('visible');
    this.audio.playLevelUp();

    const zone = ZONES[this.currentZone];
    document.getElementById('report-realm-name').textContent = zone.name;
    document.getElementById('report-ip-earned').textContent = this.ip;
    document.getElementById('report-quests-done').textContent = this.completedQuests.size;
    document.getElementById('report-rank').textContent = getRank(this.ip).title;

    // Learnings
    const list = document.getElementById('report-learnings');
    if (list) {
      const learnings = [
        'Matter is made of microscopic particles whose arrangement determines its state.',
        'Solids have fixed shape & volume; Liquids flow; Gases expand to fill any container.',
        'Adding heat increases kinetic energy, causing state changes (melting, boiling).',
        'The Water Cycle: Evaporation → Condensation → Precipitation → Collection.',
        'Elements are pure substances of one atom type; Compounds combine elements chemically.',
        'Mixtures can be separated physically; Compounds require chemical reactions.',
      ];
      list.innerHTML = learnings.map(l => `<li>${l}</li>`).join('');
    }
  }

  // ── Keyboard Shortcuts ──
  _bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case '1': this._switchZone(0); break;
        case '2': this._switchZone(1); break;
        case '3': this._switchZone(2); break;
        case '4': this._switchZone(3); break;
        case 'v': case 'V': this._onPrimaryAction(); break;
        case 'p': case 'P': this._onSecondaryAction(); break;
        case 'w': case 'W': this._onWisdomChoice(); break;
        case 'r': case 'R':
          document.getElementById('btn-realm-report')?.click();
          break;
        case 'Escape':
          document.querySelectorAll('.modal-overlay.visible').forEach(m => m.classList.remove('visible'));
          break;
      }
    });
  }

  // ── Scoring ──
  _awardIP(amount, type = 'bonus') {
    this.ip += amount;
    this._updateIP();
    this._updateRank();
    this._showIPPopup(amount, type);
  }

  _updateIP() {
    const el = document.getElementById('ip-value');
    if (el) el.textContent = this.ip.toLocaleString();
  }

  _updateRank() {
    const rank = getRank(this.ip);
    const titleEl = document.getElementById('rank-title');
    const iconEl = document.getElementById('rank-icon');
    if (titleEl) titleEl.textContent = rank.title;
    if (iconEl) iconEl.textContent = rank.icon;
  }

  _showIPPopup(amount, type) {
    const popup = document.createElement('div');
    popup.className = 'ip-popup ' + type;
    popup.textContent = '+' + amount + ' IP';
    popup.style.left = (window.innerWidth / 2 - 40) + 'px';
    popup.style.top = '40%';
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1300);
  }

  // ── Quest Completion ──
  _completeQuest(questId) {
    if (this.completedQuests.has(questId)) return;
    this.completedQuests.add(questId);
    this._updateTrackerForZone(this.currentZone);

    const questEl = document.querySelector(`.quest-item[data-quest="${questId}"]`);
    if (questEl) {
      questEl.classList.add('complete');
      const check = questEl.querySelector('.quest-check');
      if (check) check.textContent = '✓';
    }
    this._updateMissionBanner();
  }

  // ── Temperature-driven quest triggers ──
  _checkTemperatureQuests() {
    if (this.temperature < 273) {
      this._completeQuest('observe-solid');
    } else if (this.temperature >= 273 && this.temperature < 373) {
      this._completeQuest('observe-liquid');
    } else if (this.temperature >= 373) {
      this._completeQuest('observe-gas');
    }

    if (this.temperature >= 273 && this.temperature < 280) {
      if (!this.completedQuests.has('trigger-melt')) {
        this.audio.playHeat();
        this._completeQuest('trigger-melt');
        this._awardIP(SCORING.CORRECT_ACTION, 'bonus');
        this._setMentorDialogue(
          'The ice is MELTING! Watch the lattice break apart! 🌊',
          'At 273K (0°C), heat energy overcomes the intermolecular forces holding the solid lattice together.'
        );
      }
    }
    if (this.temperature >= 373 && this.temperature < 380) {
      if (!this.completedQuests.has('trigger-boil')) {
        this.audio.playEvaporation();
        this._completeQuest('trigger-boil');
        this._awardIP(SCORING.CORRECT_ACTION, 'bonus');
        this._setMentorDialogue(
          'It\'s BOILING! The particles are escaping into the air as steam! 💨',
          'At 373K (100°C), particles have enough kinetic energy to completely overcome liquid-phase attractions.'
        );
      }
    }
    this._updateMissionBanner();
  }

  // ── Quick Workbenches Binding ──
  _bindWorkbenches() {
    // Zone 0: Quick Spells
    document.getElementById('wb-freeze')?.addEventListener('click', () => {
      this.audio.playClick();
      const slider = document.getElementById('thermal-slider');
      if (slider) slider.value = 240;
      this._setTemperature(240);
      this.audio.playFreeze();
      this._completeQuest('observe-solid');
      this._awardIP(SCORING.CORRECT_ACTION, 'bonus');
      this._setMentorDialogue(
        'SHIVER! The cryo spell freezes the water into rigid, locked crystal ice! ❄️',
        'Temperature dropped to 240 K (below 273 K). Water particles locked into a rigid hexagonal lattice vibrating in place.'
      );
      this._updateMissionBanner();
    });

    document.getElementById('wb-melt')?.addEventListener('click', () => {
      this.audio.playClick();
      const slider = document.getElementById('thermal-slider');
      if (slider) slider.value = 300;
      this._setTemperature(300);
      this.audio.playWaterSplash();
      this._completeQuest('observe-liquid');
      this._awardIP(SCORING.CORRECT_ACTION, 'bonus');
      this._setMentorDialogue(
        'Splashing streams! The ice melts into fluid flowing liquid! 💧',
        'At 300 K (room temperature), thermal energy overcomes rigid bonds. Particles now slide freely past one another.'
      );
      this._updateMissionBanner();
    });

    document.getElementById('wb-boil')?.addEventListener('click', () => {
      this.audio.playClick();
      const slider = document.getElementById('thermal-slider');
      if (slider) slider.value = 420;
      this._setTemperature(420);
      this.audio.playSteam();
      this._completeQuest('observe-gas');
      this._awardIP(SCORING.CORRECT_ACTION, 'bonus');
      this._setMentorDialogue(
        'WHOOSH! Pure vapor rises into the sky! It vanishes into the clouds! 💨',
        'At 420 K (past 373 K), kinetic energy disperses particles far apart. Gas particles zoom rapidly in random directions.'
      );
      this._updateMissionBanner();
    });

    // Zone 1: Molecule Crucible
    document.getElementById('wb-add-h')?.addEventListener('click', () => {
      this.audio.playClick();
      const card = document.querySelector('.element-card[data-symbol="H"]');
      this._onElementSelect('H', card || document.createElement('div'));
      this._updateMissionBanner();
    });

    document.getElementById('wb-add-o')?.addEventListener('click', () => {
      this.audio.playClick();
      const card = document.querySelector('.element-card[data-symbol="O"]');
      this._onElementSelect('O', card || document.createElement('div'));
      this._updateMissionBanner();
    });

    document.getElementById('wb-fuse-molecule')?.addEventListener('click', () => {
      this.audio.playClick();
      const hCount = this.moleculeSlots.filter(s => s === 'H').length;
      const oCount = this.moleculeSlots.filter(s => s === 'O').length;
      if (hCount === 2 && oCount === 1) {
        this.audio.playBond();
        this._awardIP(SCORING.CORRECT_ACTION + 15, 'bonus');
        this._completeQuest('build-molecule');
        this._setMentorDialogue(
          'BOOM! Magical fusion achieved! Two Hydrogens and One Oxygen formed WATER! 💧✨',
          'Synthesis confirmed: 2H + O ➔ H₂O. Notice how water behaves completely differently from hydrogen or oxygen gas!'
        );
        this._showProofChallenge('bond');
      } else {
        this.audio.playFizzle();
        this._setMentorDialogue(
          'Almost! We need exactly 2 Hydrogen atoms and 1 Oxygen atom to forge Water!',
          `Currently in crucible: H×${hCount}, O×${oCount}. Target formula: H₂O.`
        );
      }
      this._updateMissionBanner();
    });

    document.getElementById('wb-reset-atoms')?.addEventListener('click', () => {
      this.audio.playClick();
      this.moleculeSlots = [];
      document.querySelectorAll('.element-card').forEach(c => c.classList.remove('active'));
      this._updateMoleculeUI();
      this._setMentorDialogue('Crucible cleared! Ready to assemble anew.', 'Add 2 Hydrogen and 1 Oxygen to synthesize H₂O.');
      this._updateMissionBanner();
    });

    // Zone 2: Step-by-Step Water Cycle
    document.getElementById('wb-cycle-evap')?.addEventListener('click', () => {
      this.audio.playClick();
      this.waterCycleStage = 0;
      this._applyWaterCycleStage(0);
    });

    document.getElementById('wb-cycle-cond')?.addEventListener('click', () => {
      this.audio.playClick();
      this.waterCycleStage = 1;
      this._applyWaterCycleStage(1);
    });

    document.getElementById('wb-cycle-prec')?.addEventListener('click', () => {
      this.audio.playClick();
      this.waterCycleStage = 2;
      this._applyWaterCycleStage(2);
    });

    document.getElementById('wb-cycle-coll')?.addEventListener('click', () => {
      this.audio.playClick();
      this.waterCycleStage = 3;
      this._applyWaterCycleStage(3);
    });

    document.getElementById('wb-cycle-farm')?.addEventListener('click', () => {
      this.audio.playClick();
      this._onWisdomChoice();
    });

    // Zone 3: Separation Tools
    document.getElementById('wb-sep-magnet')?.addEventListener('click', () => {
      this.audio.playClick();
      this._onSeparationTool('Magnet');
      this._updateSeparationProgress();
    });

    document.getElementById('wb-sep-sieve')?.addEventListener('click', () => {
      this.audio.playClick();
      this._onSeparationTool('Sieve');
      this._updateSeparationProgress();
    });

    document.getElementById('wb-sep-filter')?.addEventListener('click', () => {
      this.audio.playClick();
      this._onSeparationTool('Filter');
      this._updateSeparationProgress();
    });

    document.getElementById('wb-sep-evap')?.addEventListener('click', () => {
      this.audio.playClick();
      this._onSeparationTool('Evaporation');
      this._updateSeparationProgress();
    });
  }

  _updateWorkbenchesForZone(index) {
    const panels = {
      0: document.getElementById('wb-matter'),
      1: document.getElementById('wb-atomic'),
      2: document.getElementById('wb-cycle'),
      3: document.getElementById('wb-periodic'),
    };
    Object.entries(panels).forEach(([k, p]) => {
      if (p) p.style.display = (parseInt(k) === index) ? 'flex' : 'none';
    });
  }

  _applyWaterCycleStage(index) {
    const stageEls = document.querySelectorAll('.cycle-stage');
    stageEls.forEach((el, i) => {
      el.classList.toggle('active', i === index);
      el.classList.toggle('complete', i < index);
    });

    const stage = WATER_CYCLE[index];
    if (!stage) return;
    this.audio.playSuccess();
    this._awardIP(SCORING.CORRECT_ACTION, 'bonus');

    if (stage.stage === 'Evaporation') this.audio.playEvaporation();
    else if (stage.stage === 'Precipitation') this.audio.playRain();
    else if (stage.stage === 'Collection') this.audio.playStream();

    if (this.scene) this.scene.setWaterCycleStage(stage.stage);

    this._setMentorDialogue(
      `Water Cycle Phase ${index + 1}: ${stage.stage}! ${stage.icon} Look at the clouds and water responding! ✨`,
      `${stage.desc}. Energy driver: ${stage.cause}.`
    );

    if (index === 3) {
      this._completeQuest('water-cycle');
      this._showProofChallenge('cycle');
    }
    this._updateMissionBanner();
  }

  _updateSeparationProgress() {
    const count = this.separatedItems.size;
    const badge = document.getElementById('sep-progress');
    if (badge) {
      badge.textContent = `${count} / ${MUDDLER_PILE.length} Sorted`;
      if (count >= MUDDLER_PILE.length) {
        badge.textContent = '🎉 All Sorted!';
        badge.style.background = 'var(--emerald-dim)';
        badge.style.color = 'var(--emerald)';
        badge.style.borderColor = 'var(--emerald)';
      }
    }
    this._updateMissionBanner();
  }

  _updateMissionBanner() {
    const banner = document.getElementById('mission-text');
    if (!banner) return;

    const chal = CHALLENGES[this.challengeIndex % CHALLENGES.length];
    if (this.currentZone === 0) {
      if (chal && chal.turn2_playerGoal) {
        banner.innerHTML = `<strong>Turn 2 Goal:</strong> ${chal.turn2_playerGoal.action} ➔ <em>${chal.turn2_playerGoal.metricTarget}</em>`;
      } else {
        banner.textContent = 'Energy Systems Lab: Adjust source slider to drive generator and watch temperature metric climb!';
      }
    } else if (this.currentZone === 1) {
      banner.innerHTML = '<strong>States of Matter:</strong> Adjust temperature to observe solid lattice vibration, fluid flow, and gas collisions.';
    } else if (this.currentZone === 2) {
      banner.innerHTML = '<strong>3D Molecular Architect:</strong> Inspect bond angles (104.5° bent) and permanent dipole vectors.';
    } else if (this.currentZone === 3) {
      banner.textContent = '3D Water Cycle: Step through ☀️ Evaporation ➔ ☁️ Condensation ➔ 🌧️ Rain ➔ 🏞️ Collection!';
    } else if (this.currentZone === 4) {
      const sorted = this.separatedItems.size;
      banner.textContent = `Periodic Shards & Muddler's Pile (${sorted}/${MUDDLER_PILE.length} sorted): Use 🧲 Magnet, 🕳️ Sieve, ☕ Filter, and 🔥 Evaporator!`;
    } else if (this.currentZone === 5) {
      banner.textContent = 'PhET Virtual Labs Portal: Interactive Colorado Physics & Chemistry sandbox.';
    }
  }
}

// Expose for inline onclick handlers
const game = new Game();
window._game = game;

// Also hook temperature change to check quests
const origSetTemp = game._setTemperature.bind(game);
game._setTemperature = function(k) {
  origSetTemp(k);
  game._checkTemperatureQuests();
};
