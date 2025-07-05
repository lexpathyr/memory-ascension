// displayManager.js

import { gameState } from '../core/gameState.js';
import { capitalize } from '../core/utils.js';
import { calculatePrestige } from '../prestige/calculatePrestige.js';
import { cycleThreshold } from '../core/engine.js';

export function updateDisplay() {
  const display = document.getElementById("resourceDisplay");
  const total =
    gameState.resources.bit +
    gameState.resources.nibble * 4 +
    gameState.resources.byte * 16 +
    gameState.resources.kilobyte * 64 +
    gameState.resources.megabyte * 256 +
    gameState.resources.gigabyte * 1024 +
    gameState.resources.terabyte * 4096 +
    gameState.resources.petabyte * 16384;

  let earnedCycles = 0;
  let threshold = 1000;

  while (total >= threshold) {
    earnedCycles++;
    threshold += cycleThreshold(earnedCycles);
  }

  const prevThreshold = threshold - cycleThreshold(earnedCycles);
  const currentProgress = ((total - prevThreshold) / (threshold - prevThreshold)) * 100;

  const resLine = Object.entries(gameState.resources)
    .map(([k, v]) => `${capitalize(k)}s: ${formatResource(v)}`)
    .join(" | ");

  const recompileBtn = document.getElementById("recompileBtn");
  if (recompileBtn) {
    const upcoming = calculatePrestige();
    const estimatedBoost = (upcoming * 0.1).toFixed(2);
    recompileBtn.title = `Recompile to gain +${formatResource(estimatedBoost)}x global boost\nCurrent Multiplier: x${gameState.systems.globalMultiplier.toFixed(2)}`;
  }

  display.innerHTML = `
    Cycles: ${gameState.meta.prestigeCurrency} (+${calculatePrestige()})<br>
    Progress to next Cycle: ${formatResource(total - prevThreshold)} / ${formatResource(threshold - prevThreshold)} (${currentProgress.toFixed(1)}%)<br>
    ${resLine}
  `;
}

function formatResource(value) {
  return value >= 1e9 ? value.toExponential(2) : Math.floor(value);
}