import { gameState } from '../core/gameState.js';
import { cycleThreshold } from '../core/engine.js';
import { RESOURCE_WEIGHTS } from '../core/utils.js';


// Calculates the number of prestige cycles the player can earn based on total weighted resources.
export function calculatePrestige() {
  // Use shared weights for consistency
  let total = 0;
  for (let tier in RESOURCE_WEIGHTS) {
    total += (gameState.resources[tier] || 0) * RESOURCE_WEIGHTS[tier];
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

  // Total prestige cycles = cycles from resources + byte bonus
  return earnedCycles + byteBonus;
}