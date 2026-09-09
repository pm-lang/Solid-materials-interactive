// ============================================================
// ELEMENTIA — Curriculum & Game Data
// NCERT Grade 6 Science: Materials and Their Structure
// ============================================================

export const RANKS = [
  { ip: 0,    title: 'Apprentice Explorer', icon: '🌱' },
  { ip: 500,  title: 'Adept of Matter',     icon: '⚗️' },
  { ip: 1200, title: 'Realm Restorer',       icon: '🔮' },
  { ip: 2000, title: 'Sage of the Isles',    icon: '🌟' },
  { ip: 3000, title: 'Grandmaster of Elementia', icon: '👑' },
];

export const SCORING = {
  CORRECT_ACTION:   10,
  DISCOVERY_BONUS:  5,
  SCIENTISTS_PROOF: 20,
  WISDOM_BONUS:     15,
  HARMONY_SHARD:    100,
  GUARDIAN_CYCLE:   15,
};

export const ELEMENTS = [
  { symbol: 'H',  name: 'Hydrogen',  number: 1,  mass: 1.008,   family: 'non-metal', color: '#00f2fe', fact: 'Lightest element; fuels the Sun', realObject: 'Hydrogen fuel cell' },
  { symbol: 'He', name: 'Helium',    number: 2,  mass: 4.003,   family: 'noble-gas', color: '#b388ff', fact: 'Makes balloons float; second most abundant in universe', realObject: 'Helium balloon' },
  { symbol: 'C',  name: 'Carbon',    number: 6,  mass: 12.011,  family: 'non-metal', color: '#90a4ae', fact: 'Found in every living thing; forms diamonds', realObject: 'Pencil graphite / Diamond' },
  { symbol: 'N',  name: 'Nitrogen',  number: 7,  mass: 14.007,  family: 'non-metal', color: '#80deea', fact: '78% of air you breathe is nitrogen', realObject: 'Liquid nitrogen ice cream' },
  { symbol: 'O',  name: 'Oxygen',    number: 8,  mass: 15.999,  family: 'non-metal', color: '#ff5252', fact: 'The gas we breathe; essential for fire', realObject: 'Breathing air / Rust' },
  { symbol: 'Na', name: 'Sodium',    number: 11, mass: 22.990,  family: 'metal',     color: '#ffd740', fact: 'Soft metal that reacts violently with water', realObject: 'Table salt (NaCl)' },
  { symbol: 'Al', name: 'Aluminium', number: 13, mass: 26.982,  family: 'metal',     color: '#e0e0e0', fact: 'Lightweight metal; most abundant metal in Earth\'s crust', realObject: 'Aluminium can / foil' },
  { symbol: 'Si', name: 'Silicon',   number: 14, mass: 28.086,  family: 'metalloid', color: '#a1887f', fact: 'Main component of sand and computer chips', realObject: 'Computer chip' },
  { symbol: 'Cl', name: 'Chlorine',  number: 17, mass: 35.453,  family: 'non-metal', color: '#69f0ae', fact: 'Used to purify drinking water', realObject: 'Swimming pool cleaner' },
  { symbol: 'Fe', name: 'Iron',      number: 26, mass: 55.845,  family: 'metal',     color: '#ff9100', fact: 'Used to make steel; magnetic', realObject: 'Steel bridge / nails' },
  { symbol: 'Cu', name: 'Copper',    number: 29, mass: 63.546,  family: 'metal',     color: '#ff7043', fact: 'Excellent conductor; used in wiring', realObject: 'Copper wire / coins' },
  { symbol: 'Au', name: 'Gold',      number: 79, mass: 196.967, family: 'metal',     color: '#ffd700', fact: 'Doesn\'t tarnish; used in jewelry and electronics', realObject: 'Gold ring / circuit board' },
];

export const COMPOUNDS = [
  {
    name: 'Water',
    formula: 'H₂O',
    formulaParts: [{ symbol: 'H', count: 2 }, { symbol: 'O', count: 1 }],
    bondType: 'Covalent',
    stateAt25C: 'Liquid',
    properties: 'Wet, drinkable, essential for life',
    elementProperties: 'Hydrogen and Oxygen are both gases at room temperature',
    realFact: 'The water you just "brewed" is the same water in your own drinking cup.',
    color: '#4fc3f7',
  },
  {
    name: 'Carbon Dioxide',
    formula: 'CO₂',
    formulaParts: [{ symbol: 'C', count: 1 }, { symbol: 'O', count: 2 }],
    bondType: 'Covalent',
    stateAt25C: 'Gas',
    properties: 'Colorless gas, makes drinks fizzy, plants absorb it',
    elementProperties: 'Carbon is a solid, Oxygen is a gas',
    realFact: 'Every fizzy drink you\'ve ever had gets its bubbles from CO₂.',
    color: '#b0bec5',
  },
  {
    name: 'Table Salt',
    formula: 'NaCl',
    formulaParts: [{ symbol: 'Na', count: 1 }, { symbol: 'Cl', count: 1 }],
    bondType: 'Ionic',
    stateAt25C: 'Solid',
    properties: 'White crystals, salty taste, dissolves in water',
    elementProperties: 'Sodium is a reactive metal, Chlorine is a toxic gas',
    realFact: 'The salt on your food is a perfectly safe combination of a dangerous metal and a poisonous gas!',
    color: '#e0e0e0',
  },
  {
    name: 'Methane',
    formula: 'CH₄',
    formulaParts: [{ symbol: 'C', count: 1 }, { symbol: 'H', count: 4 }],
    bondType: 'Covalent',
    stateAt25C: 'Gas',
    properties: 'Odorless, burns easily, greenhouse gas',
    elementProperties: 'Carbon is a solid, Hydrogen is a gas',
    realFact: 'Natural gas used in cooking stoves is mostly methane.',
    color: '#a5d6a7',
  },
];

export const MATERIALS = [
  { name: 'Wood',    properties: { hard: true, flexible: false, transparent: false, floats: true },  particle: 'solid', icon: '🪵' },
  { name: 'Glass',   properties: { hard: true, flexible: false, transparent: true,  floats: false }, particle: 'solid', icon: '🪟' },
  { name: 'Rubber',  properties: { hard: false, flexible: true, transparent: false, floats: true },  particle: 'solid', icon: '🔴' },
  { name: 'Stone',   properties: { hard: true, flexible: false, transparent: false, floats: false }, particle: 'solid', icon: '🪨' },
  { name: 'Cloth',   properties: { hard: false, flexible: true, transparent: false, floats: true },  particle: 'solid', icon: '🧶' },
  { name: 'Metal',   properties: { hard: true, flexible: false, transparent: false, floats: false }, particle: 'solid', icon: '⚙️' },
  { name: 'Sponge',  properties: { hard: false, flexible: true, transparent: false, floats: true },  particle: 'solid', icon: '🧽' },
  { name: 'Plastic', properties: { hard: false, flexible: true, transparent: true,  floats: true },  particle: 'solid', icon: '🥤' },
];

export const STATES_OF_MATTER = {
  solid: {
    name: 'Solid',
    description: 'Fixed shape and fixed volume',
    particles: 'Tightly packed in a regular lattice, vibrating in fixed positions',
    forces: 'Strong force of attraction between particles',
    example: 'Ice, Rock, Metal bar',
    color: '#a8d8ea',
    tempRange: [0, 273],
  },
  liquid: {
    name: 'Liquid',
    description: 'No fixed shape, but fixed volume — takes container shape',
    particles: 'Close together but not in fixed positions, sliding past each other',
    forces: 'Moderate force of attraction',
    example: 'Water, Mercury, Oil',
    color: '#4fc3f7',
    tempRange: [273, 373],
  },
  gas: {
    name: 'Gas',
    description: 'No fixed shape, no fixed volume — fills any container',
    particles: 'Far apart with high kinetic energy, moving freely in all directions',
    forces: 'Negligible forces of attraction',
    example: 'Steam, Air, Helium',
    color: '#b388ff',
    tempRange: [373, 600],
  },
};

export const PHASE_CHANGES = [
  { from: 'solid', to: 'liquid', name: 'Melting',       trigger: '+Heat', temp: 273, desc: 'Heat energy overcomes lattice forces; particles break free to slide' },
  { from: 'liquid', to: 'gas',   name: 'Boiling',       trigger: '+Heat', temp: 373, desc: 'Particles gain enough energy to escape the liquid surface entirely' },
  { from: 'gas', to: 'liquid',   name: 'Condensation',  trigger: '-Heat', temp: 373, desc: 'Cooling causes gas particles to slow and cluster back into liquid' },
  { from: 'liquid', to: 'solid', name: 'Freezing',      trigger: '-Heat', temp: 273, desc: 'Particles lose energy and lock into a fixed lattice arrangement' },
  { from: 'solid', to: 'gas',    name: 'Sublimation',   trigger: '+Heat', temp: null, desc: 'Solid transforms directly to gas, skipping the liquid phase' },
];

export const WATER_CYCLE = [
  { stage: 'Evaporation',    icon: '☀️', cause: 'Sun\'s heat', desc: 'Solar energy heats water surfaces; particles gain enough kinetic energy to escape as vapour', color: '#ffd740' },
  { stage: 'Condensation',   icon: '☁️', cause: 'Cooling air',  desc: 'Rising water vapour cools at altitude; particles slow down and cluster into tiny cloud droplets', color: '#90caf9' },
  { stage: 'Precipitation',  icon: '🌧️', cause: 'Gravity',     desc: 'Cloud droplets merge until heavy enough to fall as rain, snow, or hail', color: '#42a5f5' },
  { stage: 'Collection',     icon: '🏞️', cause: 'Gravity & terrain', desc: 'Water flows through streams and rivers back to oceans, lakes, and underground reserves', color: '#26a69a' },
];

export const SEPARATION_METHODS = [
  { name: 'Magnet',      icon: '🧲', targets: ['iron filings'],  desc: 'Magnetic separation pulls out ferromagnetic materials', sound: 'magnet' },
  { name: 'Sieve',       icon: '🕳️', targets: ['large stones'],  desc: 'Sieving separates by particle size — large pieces stay, small ones pass through', sound: 'click' },
  { name: 'Filter',      icon: '☕', targets: ['sand'],           desc: 'Filtration catches insoluble solid particles while liquid passes through', sound: 'stream' },
  { name: 'Evaporation', icon: '🔥', targets: ['salt'],           desc: 'Gentle heat evaporates the water, leaving dissolved solids behind', sound: 'heat' },
];

export const MUDDLER_PILE = [
  { substance: 'iron filings', type: 'element',  icon: '⚫', separatedBy: 'Magnet', color: '#78909c' },
  { substance: 'sand',         type: 'mixture',  icon: '🟤', separatedBy: 'Filter', color: '#d7ccc8' },
  { substance: 'salt',         type: 'compound', icon: '⬜', separatedBy: 'Evaporation', color: '#fafafa' },
  { substance: 'water',        type: 'compound', icon: '🔵', separatedBy: 'Evaporation', color: '#64b5f6' },
  { substance: 'oil',          type: 'mixture',  icon: '🟡', separatedBy: 'Filter', color: '#fff176' },
];

export const ZONES = [
  {
    id: 'matter',
    name: 'The Core Puzzle',
    subtitle: 'Matter Manipulation',
    level: 'Level 1-2',
    ncert: 'Materials & States of Matter',
    description: 'Sort materials by properties and understand solids, liquids, and gases through the Veritas Lens.',
    mentorIntro: {
      zephyr: 'Behold! I shall make this ice vanish before your very eyes! ✨ Watch the shimmer…',
      nova: 'Fascinating. But *why* does ice melt? Let\'s use the Veritas Lens to see what the particles are actually doing.',
    },
  },
  {
    id: 'atomic',
    name: 'The Crucible',
    subtitle: 'Atomic Assembly',
    level: 'Level 6-7',
    ncert: 'Atoms, Elements & Compounds',
    description: 'Build molecules from atoms. Every element has a symbol, every compound has a formula — and every formula is a real recipe.',
    mentorIntro: {
      zephyr: 'Two invisible gases walk into a Crucible… and out comes *water*! If that\'s not magic, what is? 💧',
      nova: 'It\'s chemistry. Two hydrogen atoms bond covalently with one oxygen atom. The result has completely different properties.',
    },
  },
  {
    id: 'water-cycle',
    name: 'Skybound Falls',
    subtitle: 'The Water Cycle',
    level: 'Level 5',
    ncert: 'The Planetary Water Cycle',
    description: 'Ride with Drip the water droplet through Evaporation, Condensation, Precipitation and Collection.',
    mentorIntro: {
      zephyr: 'We\'re going to *ride* a raindrop from ocean to cloud to mountaintop! Hold on tight! 🌊',
      nova: 'Solar radiation drives evaporation. Altitude causes condensation. Gravity completes the cycle. Beautiful engineering by nature.',
    },
  },
  {
    id: 'periodic',
    name: 'The Vault of Elements',
    subtitle: 'Periodic Amphitheater',
    level: 'Level 6-8',
    ncert: 'Periodic Table & Separation',
    description: 'Activate towering elemental crystals in the Great Periodic Compass, then separate the Muddler\'s chaotic pile to restore order.',
    mentorIntro: {
      zephyr: 'Look at these ENORMOUS glowing crystals! Each one is a different element made solid and spectacular! ✨',
      nova: 'The architecture follows the Periodic Table\'s logic. Metals on one side, non-metals on the other. Even the building teaches.',
    },
  },
];

// Mentor dialogue pool for context-sensitive responses
export const MENTOR_DIALOGUES = {
  sort_correct: {
    zephyr: 'Ha! I knew you had the eye for it! That material practically GLOWED in the right crate!',
    nova: 'Correct classification. Engineers use exactly these property tests when choosing materials for real products.',
  },
  sort_wrong: {
    zephyr: 'Oops! That one fizzled — but no worries, even the best tricksters misjudge a prop sometimes!',
    nova: 'Not quite. Let me give you a clue: try testing whether light passes through it, or whether it sinks in water.',
  },
  state_correct: {
    zephyr: 'The gate opened! I *told* you understanding particles was basically spellcasting! ✨',
    nova: 'Well done. You correctly identified the particle arrangement — that\'s the real "key" to every state of matter.',
  },
  bond_success: {
    zephyr: 'DID YOU SEE THAT?! Two gases just became a drop of WATER! That\'s the best trick I\'ve ever witnessed!',
    nova: 'A covalent bond forms when atoms share electrons. The compound\'s properties are completely different from either element alone.',
  },
  cycle_complete: {
    zephyr: 'What a ride! From ocean spray to mountaintop rain — Drip made it the whole way around!',
    nova: 'The water cycle is a planetary heat engine. Solar energy powers evaporation, gravity powers the return. Endlessly renewable.',
  },
  separation_correct: {
    zephyr: 'You pulled the iron right out with a magnet! Even the Muddler looks impressed!',
    nova: 'Magnetic separation works because iron is ferromagnetic. It\'s used in recycling centres to sort metals from waste.',
  },
  wisdom_choice: {
    zephyr: 'My way would have worked too... eventually! But I admit, Nova\'s method got there faster.',
    nova: 'You chose evidence over assumption. That habit — observe first, then act — is the foundation of all science.',
  },
  scientists_proof: {
    zephyr: 'Explaining *why* is harder than just doing it — and you nailed both! Impressive, Apprentice.',
    nova: 'Excellent. Understanding the mechanism behind the result is what separates knowledge from luck.',
  },
};

export function getRank(ip) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (ip >= r.ip) rank = r;
  }
  return rank;
}
