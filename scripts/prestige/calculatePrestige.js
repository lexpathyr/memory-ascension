import { gameState } from '../core/gameState.js';
import { cycleThreshold } from '../core/engine.js';

export function calculatePrestige() {
  const weights = {
    bit: 1,
    nibble: 4,
    byte: 16,
    kilobyte: 64,
    megabyte: 256,
    gigabyte: 1024,
    terabyte: 4096,
    petabyte: 16384
  };

  // Total weighted data value (same as displayManager)
  let total = 0;
  for (let tier in weights) {
    total += (gameState.resources[tier] || 0) * weights[tier];
  }

  // Match dynamic threshold scaling
  let earnedCycles = 0;
  let threshold = 1000;

  while (total >= threshold) {
    earnedCycles++;
    threshold += cycleThreshold(earnedCycles);
  }

  // Byte-based bonus (optional, only if enabled)
  let byteBonus = 0;
  if (gameState.generation.byteBonusEnabled) {
    const raw = gameState.resources.byte || 0;
    byteBonus = Math.floor(Math.log2(raw + 1));
  }

  return earnedCycles + byteBonus;
}