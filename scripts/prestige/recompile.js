
/**
 * @fileoverview Handles the prestige (recompile) action for Memory Ascension, resetting progress and awarding cycles.
 * @module prestige/recompile
 */

import { gameState } from '../core/gameState.js';
import { calculatePrestige } from './calculatePrestige.js';
import { updateDisplay } from '../managers/displayManager.js';
import { buildTierLayout, requestTierUpdate } from '../ui/uiRenderer.js';

/**
 * Performs the prestige (recompile) action, resetting resources and upgrades, awarding cycles, and updating the UI.
 */
export function recompile() {
  const gained = calculatePrestige();
  if (gained === 0) {
    alert("Not enough data to compile a new Cycle.");
    return;
  }

  // Award prestige and update meta
  gameState.meta.prestigeCurrency += gained;
  gameState.meta.totalCycles = (gameState.meta.totalCycles || 0) + gained;
  gameState.systems.globalMultiplier += gained * 0.1;

  // Reset all resources
  for (const key in gameState.resources) {
    gameState.resources[key] = 0;
  }

  // Reset generation state
  Object.assign(gameState.generation, {
    manualGain: 1,
    bitGenAmount: 0,
    clickCounter: 0,
    clickBonusActive: false,
    nibbleBoostEnabled: false,
    nibbleShift: false
  });

  // Reset systems and automation
  Object.assign(gameState.systems, {
    autoConvertToggles: {},
    convertMaxUnlocked: {},
    autoConvertMaxUnlocked: {},
    autoTradeBatches: {},
    globalMultiplier: gameState.systems.globalMultiplier,
    globalConversionSpeed: 1000,
    revealedTiers: { bit: true },
    passiveHooks: [],
    _passiveHookKeys: new Set()
  });

  // Clear all upgrades
  gameState.upgrades.owned.clear();

  // Clear and rebuild UI
  const container = document.getElementById("tiers");
  if (container) container.innerHTML = "";

  buildTierLayout();
  requestTierUpdate();
  updateDisplay();

  // Show computing tab if enough cycles and not already unlocked
  if (!gameState.meta.computingTabUnlocked && gameState.meta.totalCycles >= 50) {
    gameState.meta.computingTabUnlocked = true;
    const terminalTab = document.getElementById("tabTerminal");
    if (terminalTab) terminalTab.style.display = "inline-block";
    setTimeout(() => {
      alert('Computing tab unlocked! You can now access advanced programs.');
    }, 200);
  }

  alert(`Recompiled and gained ${gained} Cycles! Global boost increased.`);
}