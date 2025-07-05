// displayManager.js

import { gameState } from '../core/gameState.js';
import { capitalize, RESOURCE_WEIGHTS, formatNumber } from '../core/utils.js';
import { calculatePrestige } from '../prestige/calculatePrestige.js';
import { cycleThreshold } from '../core/engine.js';

export function updateDisplay() {
  const display = document.getElementById("resourceDisplay");
  // Calculate total weighted resources using shared weights
  const total = Object.entries(gameState.resources)
    .reduce((sum, [k, v]) => sum + (v * (RESOURCE_WEIGHTS[k] || 0)), 0);

  let earnedCycles = 0;
  let threshold = 1000;

  while (total >= threshold) {
    earnedCycles++;
    threshold += cycleThreshold(earnedCycles);
  }

  const prevThreshold = threshold - cycleThreshold(earnedCycles);
  const currentProgress = ((total - prevThreshold) / (threshold - prevThreshold)) * 100;

  const resLine = Object.entries(gameState.resources)
    .map(([k, v]) => `${capitalize(k)}s: ${formatNumber(v)}`)
    .join(" | ");

  const recompileBtn = document.getElementById("recompileBtn");
  if (recompileBtn) {
    const upcoming = calculatePrestige();
    const estimatedBoost = (upcoming * 0.1).toFixed(2);
    recompileBtn.title = `Recompile to gain +${formatResource(estimatedBoost)}x global boost\nCurrent Multiplier: x${gameState.systems.globalMultiplier.toFixed(2)}`;
  }

  if (display) {
    display.innerHTML = `
      Cycles: ${formatNumber(gameState.meta.prestigeCurrency)} (+${calculatePrestige()})<br>
      Progress to next Cycle: ${formatNumber(total - prevThreshold)} / ${formatNumber(threshold - prevThreshold)} (${currentProgress.toFixed(1)}%)<br>
      ${resLine}
    `;
  }
}

export function formatResource(value) {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  if (value < 1e3) return value.toFixed(2);
  const suffixes = [ '', 'K', 'M', 'B', 'T', 'P', 'E' ];
  let tier = Math.floor(Math.log10(value) / 3);
  if (tier === 0) return value.toFixed(2);
  const suffix = suffixes[tier] || 'e' + (tier * 3);
  const scaled = value / Math.pow(10, tier * 3);
  return scaled.toFixed(2) + suffix;
}