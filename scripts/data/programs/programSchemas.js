// programSchemas.js
export const programSchemas = [
  {
    key: "basicOS",
    name: "Bootloader Tasks",
    unlockThreshold: 100, // cycles required before visible
    programs: ["optimizeMemory", "autoYieldDaemon"]
  },
  {
    key: "developmentKit",
    name: "Dev Kit Utilities",
    unlockThreshold: 150,
    programs: ["unlockCompiler", "passiveCompressor", "optimizeRuntime"]
  }
];