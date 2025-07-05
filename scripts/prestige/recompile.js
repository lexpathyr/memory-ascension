import { gameState } from '../core/gameState.js';
import { calculatePrestige } from './calculatePrestige.js';
import { updateDisplay } from '../managers/displayManager.js';
import { buildTierLayout, requestTierUpdate } from '../ui/uiRenderer.js';

export function recompile() {
  const gained = calculatePrestige();
  if (gained === 0) {
    alert("Not enough data to compile a new Cycle.");
    return;
  }

  gameState.meta.prestigeCurrency += gained;
  gameState.meta.totalCycles = (gameState.meta.totalCycles || 0) + gained;
  gameState.systems.globalMultiplier += gained * 0.1;

  for (const key in gameState.resources) {
    gameState.resources[key] = 0;
  }

  Object.assign(gameState.generation, {
    manualGain: 1,
    bitGenAmount: 0,
    clickCounter: 0,
    clickBonusActive: false,
    nibbleBoostEnabled: false,
    nibbleShift: false
  });

  Object.assign(gameState.systems, {
    autoConvertToggles: {},
    convertMaxUnlocked: {},
    autoConvertMaxUnlocked: {},
    autoTradeBatches: {},
    globalMultiplier: gameState.systems.globalMultiplier,
    globalConversionSpeed: 1000,
    revealedTiers: { bit: true }
  });

  gameState.upgrades.owned.clear();

  const container = document.getElementById("tiers");
  if (container) container.innerHTML = "";

  buildTierLayout();
  requestTierUpdate();
  updateDisplay();

  const terminalTab = document.getElementById("tabTerminal");
  if (terminalTab && gameState.meta.totalCycles >= 50) {
    terminalTab.style.display = "inline-block";
  }

  alert(`Recompiled and gained ${gained} Cycles! Global boost increased.`);
}