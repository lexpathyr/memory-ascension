// engine.js

import { gameState } from './gameState.js';
import { conversionRate, capitalize } from './utils.js';
import { updateDisplay } from '../managers/displayManager.js';
import { tickPrograms } from '../data/programs/programExecutor.js';
import {
  buildTierLayout,
  updateTiersIfDirty,
  requestTierUpdate
} from '../ui/uiRenderer.js';

// Recalculate the global multiplier from scratch each tick
function recalculateGlobalMultiplier() {
  // Always include the persistent global boost from cycles (prestigeCurrency)
  let base = 1 + (gameState.meta.prestigeCurrency || 0) * 0.1;
  // Add up all static bonuses from upgrades
  if (gameState.upgrades.owned.has('byteCache')) base += 0.2;
  // Add more static bonuses as needed...
  // Passive hooks (like scalingBoost) will add their effects below
  gameState.systems.globalMultiplier = base;
  // Now run all passive hooks to add dynamic bonuses
  (gameState.systems.passiveHooks ?? []).forEach(fn => fn());
}

export function gameTick() {
  recalculateGlobalMultiplier();
  processAutoGeneration();
  processAutoConversions();
  processAutoTrades();
  tickPrograms();
  updateDisplay();
  updateTiersIfDirty();
}

export function cycleThreshold(cycleCount) {
  return 1000 * Math.pow(1.5, cycleCount);
}

function processAutoGeneration() {
  let multiplier = gameState.systems.globalMultiplier;
  if (gameState.generation.nibbleBoostEnabled) {
    multiplier += gameState.resources.nibble * 0.001;
  }
  gameState.resources.bit += gameState.generation.bitGenAmount * multiplier;
}

function processAutoConversions() {
  for (const key in gameState.systems.autoConvertToggles) {
    // Only process base toggles, skip any _max keys
    if (key.endsWith('_max')) continue;
    const toggleState = gameState.systems.autoConvertToggles[key];
    // Debug: log the state of each toggle
    console.debug(`[AutoConvert] ${key}: ${toggleState}`);
    if (!toggleState) continue;

    const [from, , to] = key.split("_");
    const runMax = gameState.systems.autoConvertToggles[key + "_max"];
    const bonus = gameState.upgrades.conversionBonuses[to] || 1;
    const ratio = conversionRate(from, to);
    const available = Math.floor(gameState.resources[from] / ratio);
    if (available <= 0) continue;

    // Only run max if both base and max toggles are true and max is unlocked
    const conversions = runMax && gameState.systems.autoConvertMaxUnlocked[key]
      ? available
      : 1;

    // Debug: log which conversion is actually running
    console.debug(`[AutoConvert] Running: ${from} → ${to} | conversions: ${conversions}`);
    convertResources(from, to, conversions, ratio, bonus, gameState.systems.globalMultiplier);
  }
}

function processAutoTrades() {
  for (const key in gameState.systems.autoTradeBatches) {
    const [from, to] = key.split("_to_");
    const batchSize = gameState.systems.autoTradeBatches[key] || 1;
    const batchesAvailable = Math.floor(gameState.resources[from] / batchSize);
    if (batchesAvailable <= 0) continue;

    gameState.resources[from] -= batchesAvailable * batchSize;
    gameState.resources[to] = (gameState.resources[to] || 0) + batchesAvailable;
  }
}

function convertResources(from, to, amount, rate, bonus = 1, multiplier = 1) {
  // Validate source and target keys
  if (!(from in gameState.resources)) {
    console.warn(`Conversion skipped: source '${from}' is missing in resources.`);
    return;
  }
  if (!(to in gameState.resources)) {
    console.warn(`Conversion skipped: target '${to}' is missing in resources.`);
    return;
  }
  const cost = rate * amount;
  const sourceAvailable = gameState.resources[from];
  // Ensure sufficient resources
  if (typeof sourceAvailable !== "number" || sourceAvailable < cost) {
    console.warn(`Insufficient '${from}' resources. Required: ${cost}, Available: ${sourceAvailable}`);
    return;
  }
  // Diminishing returns: apply a soft cap to output gain
  // Formula: effectiveGain = gain ^ (1 - DR), where DR increases with amount
  // Example: DR = Math.min(0.5, Math.log10(amount)/20)
  let rawGain = amount * bonus * multiplier;
  let diminishing = Math.min(0.5, Math.log10(Math.max(1, amount)) / 20);
  let effectiveGain = rawGain ** (1 - diminishing);
  // Proceed with conversion
  gameState.resources[from] -= cost;
  gameState.resources[to] = (gameState.resources[to] || 0) + effectiveGain;
  // Safe increment for conversionCounts
  gameState.generation.conversionCounts[to] = (gameState.generation.conversionCounts[to] || 0) + 1;
}

export function manualConvert(from, to) {
  const rate = conversionRate(from, to);
  if (!rate || isNaN(rate) || rate <= 0) {
    alert(`Invalid conversion rate from ${from} to ${to}.`);
    return;
  }
  const bonus = gameState.upgrades.conversionBonuses[to] || 1;
  const multiplier = gameState.systems.globalMultiplier;
  if (gameState.resources[from] < rate) {
    alert(`Not enough ${capitalize(from)}s to convert.`);
    return;
  }
  convertResources(from, to, 1, rate, bonus, multiplier);
  requestTierUpdate();
  updateDisplay();
}

export function manualConvertMax(from, to) {
  const rate = conversionRate(from, to);
  if (!rate || isNaN(rate) || rate <= 0) {
    alert(`Invalid conversion rate from ${from} to ${to}.`);
    return;
  }
  const bonus = gameState.upgrades.conversionBonuses[to] || 1;
  const multiplier = gameState.systems.globalMultiplier;
  const maxConversions = Math.floor(gameState.resources[from] / rate);
  if (maxConversions <= 0) {
    alert(`Not enough ${capitalize(from)}s to convert.`);
    return;
  }
  console.log(`[manualConvertMax] from: ${from}, to: ${to}`);
  convertResources(from, to, maxConversions, rate, bonus, multiplier);
  requestTierUpdate();
  updateDisplay();
}

export function generateBit() {
  gameState.generation.clickCounter++;

  const multiplier = gameState.systems.globalMultiplier +
    (gameState.generation.nibbleBoostEnabled
      ? gameState.resources.nibble * 0.001
      : 0);

  if (gameState.generation.clickBonusActive && gameState.generation.clickCounter >= 5) {
    gameState.resources.bit += 5 * multiplier;
    gameState.generation.clickCounter = 0;
  }

  gameState.resources.bit += gameState.generation.manualGain * multiplier;
  requestTierUpdate();
}