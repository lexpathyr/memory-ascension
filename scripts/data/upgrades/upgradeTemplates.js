
/**
 * @fileoverview Provides reusable upgrade effect templates for Memory Ascension upgrades.
 * @module data/upgrades/upgradeTemplates
 */

import { gameState } from '../../core/gameState.js';


/**
 * Utility to prevent duplicate passive hooks from being added.
 * @param {string} key - Unique key for the passive effect.
 * @param {Function} fn - Passive effect function to add.
 */
function addPassiveHook(key, fn) {
  gameState.systems.passiveHooks = gameState.systems.passiveHooks || [];
  if (!gameState.systems._passiveHookKeys) gameState.systems._passiveHookKeys = new Set();
  if (!gameState.systems._passiveHookKeys.has(key)) {
    gameState.systems.passiveHooks.push(fn);
    gameState.systems._passiveHookKeys.add(key);
  }
}

/**
 * Collection of upgrade effect templates for use in upgrade definitions.
 * @namespace upgradeTemplates
 */
export const upgradeTemplates = {

  /**
   * Enables auto-conversion toggle for a tier combination.
   * @param {string} from - Source resource key.
   * @param {string} to - Target resource key.
   * @param {number} amount - Amount required for conversion.
   * @returns {Function} Effect function.
   */
  autoConvert: (from, to, amount) => () => {
    const key = `${from}_to_${to}`;
    gameState.systems.autoConvertToggles[key] = true;
  },


  /**
   * Sets a base conversion yield multiplier (e.g., 1.25x).
   * @param {string} target - Resource key to boost.
   * @param {number} bonus - Multiplier to apply.
   * @returns {Function} Effect function.
   */
  bonusYield: (target, bonus) => () => {
    if (target in gameState.upgrades.conversionBonuses) {
      gameState.upgrades.conversionBonuses[target] = bonus;
    }
  },


  /**
   * Adds a flat bonus to the global production multiplier.
   * @param {number} amount - Amount to add to the multiplier.
   * @returns {Function} Effect function.
   */
  globalMultiplierBoost: (amount) => () => {
    gameState.systems.globalMultiplier += amount;
  },


  /**
   * Activates a boolean feature flag inside the specified state section.
   * Defaults to the 'generation' section.
   * @param {string} flagName - Name of the flag to enable.
   * @param {string} [section="generation"] - Section of gameState to modify.
   * @returns {Function} Effect function.
   */
  toggleFeature: (flagName, section = "generation") => () => {
    if (gameState[section] && !gameState[section][flagName]) {
      gameState[section][flagName] = true;
    }
  },


  /**
   * Unlocks manual convert-max behavior for the specified conversion key.
   * @param {string} conversionKey - Conversion key to unlock.
   * @returns {Function} Effect function.
   */
  unlockConvertMax: (conversionKey) => () => {
    gameState.systems.convertMaxUnlocked[conversionKey] = true;
  },


  /**
   * Unlocks auto-convert-max behavior for the specified conversion key.
   * @param {string} conversionKey - Conversion key to unlock.
   * @returns {Function} Effect function.
   */
  unlockAutoMax: (conversionKey) => () => {
    gameState.systems.autoConvertMaxUnlocked[conversionKey] = true;
  },


  /**
   * Executes a fully custom upgrade effect.
   * @param {Function} fn - Custom effect function.
   * @returns {Function} The provided function.
   */
  custom: (fn) => fn,


  /**
   * Adds a passive tick-based effect to run every gameTick.
   * @param {Function} fn - Effect to run each tick.
   * @param {string} [key] - Unique key for deduplication.
   * @returns {Function} Effect function.
   */
  passiveEffect: (fn, key = undefined) => () => {
    if (key) {
      addPassiveHook(key, fn);
    } else {
      gameState.systems.passiveHooks ??= [];
      gameState.systems.passiveHooks.push(fn);
    }
  },



  /**
   * Adds a bonus resource every N conversions of a given resource.
   * @param {string} fromResource - Resource being converted from.
   * @param {string} bonusResource - Resource to award as a bonus.
   * @param {number} perAmount - Number of conversions per bonus.
   * @param {number} [reward=1] - Amount of bonus resource to award.
   * @returns {Function} Effect function.
   */
  conversionBonus: (fromResource, bonusResource, perAmount, reward = 1) => () => {
    addPassiveHook(
      `conversionBonus_${fromResource}_${bonusResource}`,
      () => {
        const count = gameState.generation.conversionCounts[fromResource] ?? 0;
        if (count > 0 && count % perAmount === 0) {
          gameState.resources[bonusResource] = (gameState.resources[bonusResource] || 0) + reward;
        }
        if (count >= 1000) {
          gameState.generation.conversionCounts[fromResource] = count % 1000;
        }
      }
    );
  },


  /**
   * Conditionally enables a flag if a condition returns true.
   * @param {string} flagName - Name of the flag to enable.
   * @param {Function} conditionFn - Function returning true if flag should be enabled.
   * @param {string} [section="generation"] - Section of gameState to modify.
   * @returns {Function} Effect function.
   */
  conditionalToggle: (flagName, conditionFn, section = "generation") => () => {
    if (conditionFn()) {
      gameState[section] ??= {};
      gameState[section][flagName] = true;
    }
  },


  /**
   * Applies a scaling bonus to global multiplier based on resource amount (log2 scaling).
   * @param {string} resourceKey - Resource to scale with.
   * @param {number} rate - Scaling rate.
   * @returns {Function} Effect function.
   */
  scalingBoost: (resourceKey, rate) => () => {
    addPassiveHook(
      `scalingBoost_${resourceKey}`,
      () => {
        const amount = gameState.resources[resourceKey] || 0;
        // Diminishing returns: log2 scaling
        gameState.systems.globalMultiplier += Math.log2(amount + 1) * rate;
      }
    );
  },


  /**
   * Executes an effect for a limited number of ticks.
   * @param {Function} fn - Effect to run each tick.
   * @param {number} ticks - Number of ticks to run the effect.
   * @returns {Function} Effect function.
   */
  effectWithDuration: (fn, ticks) => () => {
    let remaining = ticks;
    const wrapper = () => {
      if (remaining > 0) {
        fn();
        remaining--;
      }
    };
    gameState.systems.passiveHooks ??= [];
    gameState.systems.passiveHooks.push(wrapper);
  }
};