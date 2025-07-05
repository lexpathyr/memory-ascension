// parts.js

export const computerParts = [
  {
    id: "cpu",
    name: "Quantum CPU",
    description: "Enhances processing power for parallel programs.",
    icon: "🧠",
    effects: {
      processingPower: +4
    }
  },
  {
    id: "gpu",
    name: "Neural GPU",
    description: "Accelerates rendering and unlocks visual processing effects.",
    icon: "🎮",
    effects: {
      speed: +0.2
    }
  },
  {
    id: "ram",
    name: "Expanded RAM",
    description: "Increases available memory for program execution.",
    icon: "🗄️",
    effects: {
      memory: +8
    }
  },
  {
    id: "ssd",
    name: "Optical SSD",
    description: "Speeds up data I/O and auto-save frequency.",
    icon: "💾",
    effects: {
      speed: +0.1
    }
  },
  {
    id: "psu",
    name: "Modular PSU",
    description: "Supplies energy to support advanced components.",
    icon: "🔌",
    effects: {
      processingPower: +2,
      memory: +2
    }
  },
  {
    id: "cooler",
    name: "Liquid Cooling",
    description: "Reduces program heat buildup and cooldown delay.",
    icon: "❄️",
    effects: {
      speed: +0.15
    }
  },
  {
    id: "network",
    name: "Network Adapter",
    description: "Boosts background sync and data transfer tasks.",
    icon: "🌐",
    effects: {
      memory: +4,
      speed: +0.1
    }
  },
  {
    id: "mobo",
    name: "Advanced Motherboard",
    description: "Improves synergy between installed components.",
    icon: "📐",
    effects: {
      processingPower: +2,
      speed: +0.2,
      memory: +4
    }
  }
];