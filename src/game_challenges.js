// ============================================================
// ELEMENTIA — Turn-Based Magician vs Scientist Challenge Matrix
// Bite-Sized Dialogue Slides (< 25 words per screen)
// Clear Metric-Driven Goals (Sliders influence live metrics)
// ============================================================

export const CHALLENGES = [
  {
    id: 'energy-system-trick',
    title: 'Energy Transformation: The Flameless Boil',
    targetSim: 'energy-system',
    metricGoal: {
      type: 'temperature',
      targetVal: 100.0,
      description: 'Pedal the bicycle generator to deliver 400W+ power and boil the water beaker to 100.0°C!'
    },
    // Turn 1: Magician's Illusion (Bite-sized screens, < 25 words each)
    turn1_magicianSlides: [
      {
        speaker: 'Zephyr the Magician',
        avatar: 'assets/zephyr_portrait.png',
        title: 'Illusion: The Flameless Boil',
        text: 'Behold my sorcery! I shall make this beaker of cold water boil without ever striking a match or lighting fire! 🧙‍♂️✨'
      },
      {
        speaker: 'Zephyr the Magician',
        avatar: 'assets/zephyr_portrait.png',
        title: 'The Challenge',
        text: 'I command you to turn the bicycle wheel. Watch the thermometer rise by pure kinetic enchantment! Can you boil it? 🚲🔥',
        buttonText: '🚀 Take Your Turn (Player)'
      }
    ],
    // Turn 2: Player Mission Card (Clean, concise)
    turn2_playerGoal: {
      action: 'Set Source to Biker 🚴, drag Pedaling Speed slider up to generate power.',
      metricTarget: 'Reach 100.0 °C on the Beaker Thermometer.'
    },
    // Turn 3: Scientist's Deduction Slides
    turn3_scientistSlides: [
      {
        speaker: 'Prof. Nova the Scientist',
        avatar: 'assets/nova_portrait.png',
        title: 'Scientist\'s Observation',
        text: 'Sensational! The thermometer climbed steadily to 100.0°C, and steam bubbles formed without fire! 🌡️'
      },
      {
        speaker: 'Prof. Nova the Scientist',
        avatar: 'assets/nova_portrait.png',
        title: 'Cause and Effect',
        text: 'Notice how each change influenced the next metric: Pedaling ➔ Belt ➔ Generator Dynamo ➔ Heating Coil! ⚡',
        buttonText: '🧪 Analyze Scientific Proof'
      }
    ],
    // Deduction Quiz (Immediate causality & NCERT/IB physics)
    quiz: {
      question: 'Scientist\'s Proof: What was the exact sequence of energy transformations that heated the water?',
      options: [
        {
          text: 'Chemical (Muscles) ➔ Mechanical (Pedals/Belt) ➔ Electrical (Generator) ➔ Thermal (Submerged Coil).',
          correct: true,
          explanation: 'Spot on! Chemical potential energy in food powers leg muscles, spinning the generator into electric current, which the submerged resistor turns into heat!'
        },
        {
          text: 'Magic sparks jumped directly from the bicycle tires into the water.',
          correct: false,
          explanation: 'Energy follows the First Law of Thermodynamics: energy cannot be created, only transformed through a physical chain.'
        },
        {
          text: 'The bicycle sucked cold air out of the room, leaving behind heat.',
          correct: false,
          explanation: 'No refrigeration effect occurred; work done on the pedals generated electric current.'
        }
      ]
    },
    zephyrReaction: 'By the stars! Chemical to mechanical to electrical to thermal?! That chain of cause-and-effect is more brilliant than my illusion! 🌟🤯',
    rewardIP: 70
  },
  {
    id: 'states-trick',
    title: 'Kinetic Mystery: The Vanishing Ice Castle',
    targetSim: 'states',
    metricGoal: {
      type: 'states-temp',
      targetVal: 320,
      description: 'Raise the temperature slider to 320K to break the crystalline lattice into fluid water!'
    },
    turn1_magicianSlides: [
      {
        speaker: 'Zephyr the Magician',
        avatar: 'assets/zephyr_portrait.png',
        title: 'Illusion: Cryo-Stasis',
        text: 'Hocus Pocus! I command these molecules into an impenetrable ice fortress held by my magical will alone! ❄️🧙‍♂️'
      },
      {
        speaker: 'Zephyr the Magician',
        avatar: 'assets/zephyr_portrait.png',
        title: 'The Challenge',
        text: 'Try to melt my frozen lattice! See if adjusting the thermal energy can break my spell. 🧪'
      }
    ],
    turn2_playerGoal: {
      action: 'Drag Temperature slider above 273K (e.g. 320K Liquid state).',
      metricTarget: 'Watch Kinetic Energy (eV) climb and observe the lattice break into fluid flow.'
    },
    turn3_scientistSlides: [
      {
        speaker: 'Prof. Nova the Scientist',
        avatar: 'assets/nova_portrait.png',
        title: 'Thermal Breakdown',
        text: 'Look at the particles! As temperature rose above 273 K, molecular kinetic energy overwhelmed rigid crystal bonds! 🔬'
      }
    ],
    quiz: {
      question: 'Scientist\'s Proof: What truly happens at the microscopic level when solid ice melts into liquid water?',
      options: [
        {
          text: 'Particles absorb thermal kinetic energy (Ek = 3/2 kB T), vibrating vigorously until intermolecular lattice bonds break into fluid flow.',
          correct: true,
          explanation: 'Correct! Melting occurs when thermal kinetic vibrations overcome the hydrogen bond lattice locking the water molecules in place.'
        },
        {
          text: 'The ice atoms shrink into microscopic pebbles.',
          correct: false,
          explanation: 'Atoms do not shrink during phase changes; only the spacing and kinetic arrangement between them change.'
        },
        {
          text: 'Zephyr\'s spell ran out of magical battery power.',
          correct: false,
          explanation: 'Conservation of mass and energy governs all phase changes.'
        }
      ]
    },
    zephyrReaction: 'So they were just vibrating faster until they broke free?! Kinetic theory has completely shattered my freeze enchantment! 🧊💥',
    rewardIP: 60
  },
  {
    id: 'polarity-trick',
    title: 'Molecular Secret: The Bent Polarity Wand',
    targetSim: 'molecular',
    metricGoal: {
      type: 'molecule-h2o',
      targetVal: 1,
      description: 'Assemble H₂O in the 3D Molecular Architect and inspect its permanent dipole moment!'
    },
    turn1_magicianSlides: [
      {
        speaker: 'Zephyr the Magician',
        avatar: 'assets/zephyr_portrait.png',
        title: 'Illusion: The Sticky Liquid',
        text: 'Why does water form beautiful round drops and stick to everything? I cast a cosmic glue charm upon it! 🪄💧'
      },
      {
        speaker: 'Zephyr the Magician',
        avatar: 'assets/zephyr_portrait.png',
        title: 'The Challenge',
        text: 'Step inside the 3D Molecular Architect and see if geometry explains why water drops stay united!'
      }
    ],
    turn2_playerGoal: {
      action: 'Select H₂O Template, set display to Ball & Stick, and examine the 104.5° bond angle.',
      metricTarget: 'Locate the Dipole Moment vector (δ⁺ on Hydrogen, δ⁻ on Oxygen).'
    },
    turn3_scientistSlides: [
      {
        speaker: 'Prof. Nova the Scientist',
        avatar: 'assets/nova_portrait.png',
        title: 'Asymmetric Dipole',
        text: 'Because oxygen pulls electrons strongly, the bent 104.5° shape creates permanent positive and negative poles! ⚡'
      }
    ],
    quiz: {
      question: 'Scientist\'s Proof: Why do water molecules stick together so strongly compared to other small molecules like CO₂?',
      options: [
        {
          text: 'The asymmetric bent shape (104.5°) prevents dipoles from cancelling out, forming powerful intermolecular Hydrogen Bonds.',
          correct: true,
          explanation: 'Exactly! Oxygen is strongly electronegative (δ⁻) while Hydrogen is (δ⁺). The bent geometry creates strong dipole attractions.'
        },
        {
          text: 'Because water has a linear 180° shape like a straight rod.',
          correct: false,
          explanation: 'If water were linear like CO₂, the dipoles would cancel out and water would be a gas at room temperature!'
        },
        {
          text: 'Because water is magnetized by the Earth\'s core.',
          correct: false,
          explanation: 'Water is diamagnetic and not ferromagnetic; its attraction is electrostatic dipole-dipole.'
        }
      ]
    },
    zephyrReaction: 'A permanent electric dipole at 104.5 degrees?! That molecular polarity is ten times more magical than any spell in my grimoire! 🪄✨',
    rewardIP: 75
  }
];
