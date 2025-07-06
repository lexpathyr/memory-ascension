
/**
 * @fileoverview Provides reusable program effect templates for Memory Ascension programs.
 * @module data/programs/programTemplates
 */

import { gameState } from '../../core/gameState.js';
import { requestTierUpdate } from '../../ui/uiRenderer.js';

/**
 * Collection of program effect templates for use in program definitions.
 * @namespace programTemplates
 */
export const programTemplates = {

  /**
   * Permanently boosts the global multiplier.
   * @param {number} amount - Amount to add to the multiplier.
   * @returns {Function} Effect function.
   */
  globalMultiplierBoost(amount) {
    return () => {
      gameState.systems.globalMultiplier += amount;
    };
  },


  /**
   * Reduces global conversion interval.
   * @param {number} factor - Multiplier to apply to conversion speed.
   * @returns {Function} Effect function.
   */
  globalSpeedBoost(factor) {
    return () => {
      gameState.systems.globalConversionSpeed *= factor;
    };
  },


  /**
   * Unlocks a specific system feature (e.g., compiler, debugger).
   * @param {string} flag - Feature flag to unlock.
   * @returns {Function} Effect function.
   */
  unlockSystem(flag) {
    return () => {
      gameState.systems.unlocks[flag] = true;
    };
  },


  /**
   * Adds passive yield of a tiered resource.
   * @param {string} resource - Resource key to yield.
   * @param {number} amount - Amount to yield per tick.
   * @returns {Function} Effect function.
   */
  addPassiveYield(resource, amount) {
    return () => {
      if (!gameState.meta.passiveYield[resource]) {
        gameState.meta.passiveYield[resource] = 0;
      }
      gameState.meta.passiveYield[resource] += amount;
    };
  },

  /**
   * Applies a temporary boost to a resource for a set duration.
   * @param {string} resource - Resource key to boost.
   * @param {number} multiplier - Multiplier to apply.
   * @param {number} [duration=60] - Duration in seconds.
   * @returns {Function} Effect function.
   */
  temporaryBoost(resource, multiplier, duration = 60) {
    return () => {
      const original = gameState.generation[resource];
      gameState.generation[resource] *= multiplier;
      setTimeout(() => {
        gameState.generation[resource] = original;
        requestTierUpdate();
      }, duration * 1000);
    };
  }
};