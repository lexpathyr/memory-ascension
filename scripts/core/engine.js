// engine.js

import { gameState } from './gameState.js';
import { conversionRate, capitalize } from './utils.js';
import { updateDisplay } from '../managers/displayManager.js';
import {
  buildTierLayout,
  updateTiersIfDirty,
  requestTierUpdate
} from '../ui/uiRenderer.js';

export function gameTick() {
  (gameState.systems.passiveHooks ?? []).forEach(fn => fn());
  processAutoGeneration();
  processAutoConversions();
  processAutoTrades();
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
    if (!gameState.systems.autoConvertToggles[key]) continue;

    const [from, , to] = key.split("_");
    const runMax = gameState.systems.autoConvertToggles[key + "_max"];
    const bonus = gameState.upgrades.conversionBonuses[to] || 1;
    const ratio = conversionRate(from, to);
    const available = Math.floor(gameState.resources[from] / ratio);
    if (available <= 0) continue;

    const conversions = runMax && gameState.systems.autoConvertMaxUnlocked[key]
      ? available
      : 1;

    convertResources(from, to, conversions, ratio, bonus);
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

  // Proceed with conversion
  gameState.resources[from] -= cost;

  const rawGain = amount;
  const finalGain = rawGain * bonus * multiplier;

  // Safely apply target gain
  gameState.resources[to] = (gameState.resources[to] || 0) + finalGain;

  gameState.generation.conversionCounts[to] += 1;
}

export function manualConvert(from, to) {
  const rate = conversionRate(from, to);
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