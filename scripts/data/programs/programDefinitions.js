import { gameState } from '../../core/gameState.js';
import { programTemplates } from './programTemplates.js';

// Utility to create a standard program definition
export function createProgram(key, name, cost, dataRequired, duration, effectFn) {
  return { key, name, cost, dataRequired, duration, effect: effectFn };
}


export const programDefinitions = {
  optimizeMemory: createProgram(
    "optimizeMemory",
    "Optimize Memory Layout",
    10, // Cycles
    { byte: 500, nibble: 2000 },
    30, // seconds
    programTemplates.globalSpeedBoost(0.9)
  ),

  unlockCompiler: createProgram(
    "unlockCompiler",
    "Enable Compiler Tier",
    20,
    { kilobyte: 1500, byte: 800 },
    60,
    programTemplates.unlockSystem("compilerUnlocked")
  ),

  autoYieldDaemon: createProgram(
    "autoYieldDaemon",
    "Background Yield Script",
    15,
    { nibble: 2500 },
    45,
    programTemplates.addPassiveYield("nibble", 2)
  ),

  passiveCompressor: createProgram(
    "passiveCompressor",
    "Enable Background Compression",
    20,
    { nibble: 3000, byte: 1000 },
    60,
    programTemplates.addPassiveYield("byte", 1)
  ),

  optimizeRuntime: createProgram(
    "optimizeRuntime",
    "Reduce Execution Lag",
    25,
    { byte: 2000, kilobyte: 800 },
    75,
    programTemplates.globalSpeedBoost(0.8)
  ),

  memoryDefragmenter: createProgram(
    "memoryDefragmenter",
    "Memory Defragmenter",
    20,
    { byte: 2000, kilobyte: 500 },
    60,
    programTemplates.temporaryBoost("bit", 1.5, 60),
    false // time-based
  ),

  backgroundEncryptor: {
    ...createProgram(
      "backgroundEncryptor",
      "Background Encryptor",
      15,
      { nibble: 3000, byte: 1000 },
      null,
      programTemplates.addPassiveYield("byte", 3)
    ),
    permanent: true
  }
};