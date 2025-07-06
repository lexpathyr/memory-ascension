
/**
 * @fileoverview Defines the schema for each program group in Memory Ascension, including unlock thresholds and program keys.
 * @module data/programs/programSchemas
 */
/**
 * Array of program schema objects, each representing a group of programs and their unlock requirements.
 * @type {Array<{
 *   key: string,
 *   name: string,
 *   unlockThreshold: number,
 *   programs: string[]
 * }>}
 */
export const programSchemas = [
  {
    key: "basicOS",
    name: "Bootloader Tasks",
    unlockThreshold: 100, // cycles required before visible
    programs: ["optimizeMemory", "autoYieldDaemon", "memoryDefragmenter"]
  },
  {
    key: "developmentKit",
    name: "Dev Kit Utilities",
    unlockThreshold: 150,
    programs: ["unlockCompiler", "passiveCompressor", "optimizeRuntime", "backgroundEncryptor"]
  }
];