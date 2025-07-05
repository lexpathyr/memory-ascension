// programTemplates.js

import { gameState } from '../../core/gameState.js';
import { requestTierUpdate } from '../../ui/uiRenderer.js';

export const programTemplates = {
  /**
   * Permanently boosts the global multiplier.
   */
  globalMultiplierBoost(amount) {
    return () => {
      gameState.systems.globalMultiplier += amount;
    };
  },

  /**
   * Reduces global conversion interval.
   */
  globalSpeedBoost(factor) {
    return () => {
      gameState.systems.globalConversionSpeed *= factor;
    };
  },

  /**
   * Unlocks a specific system feature (e.g., compiler, debugger).
   */
  unlockSystem(flag) {
    return () => {
      gameState.systems.unlocks[flag] = true;
    };
  },

  /**
   * Adds passive yield of a tiered resource.
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
   * Temporary effects could be queued here (e.g. +50% yield for 60s)
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