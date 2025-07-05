export const tierSchemas = [
  {
    key: "bit",
    name: "Bit",
    threshold: 0,
    upgrades: [
      "bitDoubler", // +1 bit per click
      "bitAutoClicker", // Generate 0.5 bits/sec
      "bitAmplifier", // x2 manual gain
      "pulseShaper" // Bit gen +25%
    ]
  },
  {
    key: "nibble",
    name: "Nibble",
    threshold: 100,
    upgrades: [
      "nibbleCombiner", // Auto-convert bits → nibbles
      "nibbleEfficiency", // +25% nibble yield
      "nibbleConvertMax", // Unlock Convert Max: Bits → Nibbles
      "nibbleAutoMax" // Auto-Convert Max: Bits → Nibbles
    ]
  },
  {
    key: "byte",
    name: "Byte",
    threshold: 100,
    upgrades: [
      "byteAssembler", // Auto-convert nibbles → bytes
      "byteEfficiency", // +25% byte yield
      "byteConvertMax", // Unlock Convert Max: Nibbles → Bytes
      "byteAutoMax", // Auto-Convert Max: Nibbles → Bytes
      "byteCache" // +20% global multiplier
    ]
  },
  {
    key: "kilobyte",
    name: "Kilobyte",
    threshold: 1000,
    upgrades: [
      "kiloAssembler",
      "kiloEfficiency",
      "kiloConvertMax",
      "kiloAutoMax",
      "threadOptimizer",
      "quantumBuffer"
    ],
    unlockCycles: 50 // Softlock: require 50 cycles to reveal
  },
  {
    key: "megabyte",
    name: "Megabyte",
    threshold: 1000,
    upgrades: [
      "megaAssembler",
      "megaEfficiency",
      "megabyteConvertMax",
      "megabyteAutoMax",
      "compileDaemon",
      "coreParallel"
    ]
  },
  {
    key: "gigabyte",
    name: "Gigabyte",
    threshold: 1000,
    upgrades: [
      "gigaSynthesizer",
      "gigaEfficiency",
      "gigabyteConvertMax",
      "gigabyteAutoMax",
      "gigaframeCompressor"
    ]
  },
  {
    key: "terabyte",
    name: "Terabyte",
    threshold: 1000,
    upgrades: [
      "teraCompiler",
      "terabyteConvertMax",
      "terabyteAutoMax",
      "terafluxBooster",
      "coreReactor"
    ]
  },
  {
    key: "petabyte",
    name: "Petabyte",
    threshold: 1000,
    upgrades: [
      "petawriter",
      "petabyteConvertMax",
      "petabyteAutoMax",
      "dataCondenser",
      "hyperscalarEngine"
    ]
  }
];