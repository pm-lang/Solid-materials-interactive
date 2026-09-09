# NCERT Grade 6 Science: Materials & Their Structure
### Interactive 3D Digital Learning Lab & AI Gesture-Controlled Science Platform

A modern, immersive, web-based interactive science application built for **NCERT Grade 6 Science: Materials and Their Structure**. Featuring real-time Three.js 3D simulations, interactive thermodynamic heating curves, simulated water cycles, chemical compound construction, and AI-powered webcam hand gesture temperature tracking.

---

## 🌟 Features

### 1. 🧊 Lab 01 — 3D Real-Time Particle Crucible (States of Matter)
- **3D Particle Dynamics Simulator**: Real-time simulation of Solid Crystal Lattice, Fluid Liquid, and High-Velocity Gaseous Vapors with Three.js.
- **Physical States**: Demonstrates vibrational motion in solids, fluid sliding under gravity in liquids, and rapid straight-line collisions in gases.
- **Substance Profiles**: Water ($H_2O$), Neon ($Ne$), and Argon ($Ar$) with accurate melting and boiling points.
- **AI Webcam Hand Tracking**:
  - Control thermal energy and temperature from $10\text{ K}$ to $500\text{ K}$ using your webcam.
  - **Raise hand**: Heat up towards steam/gas.
  - **Lower hand**: Cool down towards solid ice crystal.
  - **Clench fist**: Instant Freeze Blast ($20\text{ K}$).
  - Real-time hand skeleton tracking with glowing neon cyan/amber HUD and thermometer gauge.
  - Dual-engine fallback: MediaPipe Hands with integrated optical motion detection fallback.

### 2. 📈 Lab 02 — Thermodynamic Heating Curve & Latent Heat
- Interactive 2D graph visualizing sensible heating vs. latent heat plateaus.
- Highlights **Latent Heat of Fusion** ($0^\circ\text{C}$) and **Latent Heat of Vaporization** ($100^\circ\text{C}$) where temperature remains constant while phase change occurs.

### 3. 🌧️ Lab 03 — Atmospheric Water Cycle Simulator & 3D Gizmo
- Real-time interactive water cycle stages: Evaporation, Transpiration, Condensation, Precipitation, and Runoff.
- Dynamic environmental controls: Solar Radiation, Surface Temperature, and Wind Velocity sliders.
- Interactive rainstorm trigger and embedded Gizmo simulation preview.
- Full-screen cinematic video background (`Water cycle.mp4`) with glassmorphic UI overlay.

### 4. ⚛️ Lab 04 & 05 — Atomic Architecture & Chemical Separation
- **Subatomic Model**: Interactive visualization of Protons, Neutrons, and Electrons for Hydrogen, Helium, Carbon, and Oxygen.
- **Pure Elements vs. Compounds vs. Mixtures**: Factual molecule comparison ($O_2, H_2O, CO_2, NaCl$).
- **Physical Separation Simulator**: Interactive magnetic extraction of iron filings from sand mixture.

### 5. 🎯 Formative Knowledge Check & Master Quiz
- 5 comprehensive NCERT curriculum-aligned questions with instant evaluation, scoring, and factual rationale explanations.

---

## 🚀 Running Locally

You can run this project using any local HTTP server:

### Using Python:
```bash
python -m http.server 8080
```
Then open your browser at **`http://localhost:8080/`**.

### Using Node.js (npx serve):
```bash
npx serve .
```

---

## 🛠️ Tech Stack
- **Frontend**: Vanilla HTML5, Modern CSS, Tailwind CSS
- **3D Graphics**: Three.js, OrbitControls
- **AI Hand Tracking**: Google MediaPipe Hands, Camera Utils
- **Math & Chemistry**: MathJax (LaTeX notation)
- **Icons**: FontAwesome 6
