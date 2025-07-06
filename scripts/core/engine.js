
/**
 * @fileoverview Main game engine logic for Memory Ascension. Handles ticks, resource generation, conversions, and manual actions.
 * @module core/engine
 */

import { gameState } from './gameState.js';
import { conversionRate, capitalize } from './utils.js';
import { updateDisplay } from '../managers/displayManager.js';
import { tickPrograms } from '../data/programs/programExecutor.js';
import {
  buildTierLayout,
  updateTiersIfDirty,
  requestTierUpdate
} from '../ui/uiRenderer.js';


/**
 * Recalculates the global multiplier from scratch each tick, including static and dynamic bonuses.
 * Applies prestige, upgrades, memory, and passive hooks.
 */
function recalculateGlobalMultiplier() {
  let base = 1 + (gameState.meta.prestigeCurrency || 0) * 0.1;
  if (gameState.upgrades.owned.has('byteCache')) base += 0.2;
  if (gameState.meta.memory) base += gameState.meta.memory * 0.05;
  gameState.systems.globalMultiplier = base;
  (gameState.systems.passiveHooks ?? []).forEach(fn => fn());
}


/**
 * Main game tick function. Updates all game systems and UI.
 */
export function gameTick() {
  recalculateGlobalMultiplier();
  processAutoGeneration();
  processAutoConversions();
  processAutoTrades();
  tickPrograms();
  updateDisplay();
  updateTiersIfDirty();
}


/**
 * Returns the prestige cycle threshold for a given cycle count.
 * @param {number} cycleCount
 * @returns {number}
 */
export function cycleThreshold(cycleCount) {
  return 1000 * Math.pow(1.5, cycleCount);
}


/**
 * Processes automatic bit generation, applying multipliers and speed bonuses.
 */
function processAutoGeneration() {
  let multiplier = gameState.systems.globalMultiplier;
  if (gameState.generation.nibbleBoostEnabled) {
    multiplier += gameState.resources.nibble * 0.001;
  }
  let speedFactor = 1 + ((gameState.meta.speed || 0) * 0.1);
  gameState.resources.bit += gameState.generation.bitGenAmount * multiplier * speedFactor;
}

/**
 * Processes all enabled auto-conversions for resources, including max conversions if unlocked.
 */
function processAutoConversions() {
  for (const key in gameState.systems.autoConvertToggles) {
    if (key.endsWith('_max')) continue;
    const toggleState = gameState.systems.autoConvertToggles[key];
    console.debug(`[AutoConvert] ${key}: ${toggleState}`);
    if (!toggleState) continue;
    const [from, , to] = key.split("_");
    const runMax = gameState.systems.autoConvertToggles[key + "_max"];
    const bonus = gameState.upgrades.conversionBonuses[to] || 1;
    const ratio = conversionRate(from, to);
    const available = Math.floor(gameState.resources[from] / ratio);
    if (available <= 0) continue;
    const conversions = runMax && gameState.systems.autoConvertMaxUnlocked[key]
      ? available
      : 1;
    console.debug(`[AutoConvert] Running: ${from} → ${to} | conversions: ${conversions}`);

    convertResources(from, to, conversions, ratio, bonus, gameState.systems.globalMultiplier);
  }
}


/**
 * Processes all enabled auto-trades, converting resources in batches.
 */
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


/**
 * Converts resources from one type to another, applying bonuses, multipliers, and diminishing returns.
 * @param {string} from - Source resource key.
 * @param {string} to - Target resource key.
 * @param {number} amount - Amount to convert.
 * @param {number} rate - Conversion rate.
 * @param {number} [bonus=1] - Yield bonus multiplier.
 * @param {number} [multiplier=1] - Global multiplier.
 */
function convertResources(from, to, amount, rate, bonus = 1, multiplier = 1) {
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
  gameState.resources[from] -= cost;
  gameState.resources[to] = (gameState.resources[to] || 0) + effectiveGain;
  gameState.generation.conversionCounts[to] = (gameState.generation.conversionCounts[to] || 0) + 1;
}


/**
 * Handles manual single conversion from one resource to another.
 * @param {string} from - Source resource key.
 * @param {string} to - Target resource key.
 */
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


/**
 * Handles manual max conversion from one resource to another.
 * @param {string} from - Source resource key.
 * @param {string} to - Target resource key.
 */
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


/**
 * Handles manual bit generation (click), applying multipliers and click bonuses.
 */
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